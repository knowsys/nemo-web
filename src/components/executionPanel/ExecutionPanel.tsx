import { useCallback, useState } from "react";
import {
  Card,
  Button,
  Tabs,
  Tab,
  Spinner,
  InputGroup,
  Form,
  Badge,
  Offcanvas,
} from "react-bootstrap";
import { useAppSelector } from "../../store";
import { selectProgramText } from "../../store/programInfo/selectors/selectProgramText";
import { Icon } from "../Icon";
import { TextTooltip } from "../TextTooltip";
import { createNemoWorker, NemoProgramInfo } from "../../nemoWorker/NemoWorker";
import { PredicateResults } from "./results/PredicateResults";
import { FactCounts } from "../../nemoWorker/NemoRunner";
import "./ExecutionPanel.css";
import { chooseFile } from "../../chooseFile";
import { downloadPredicate } from "./downloadPredicate";
import {
  NevBroadcastChannelHandler,
  useNevBroadcastChannelListener,
} from "../../NevBroadcastChannel";
import {
  TableEntriesForTreeNodesQuery,
  TableEntriesForTreeNodesResponseInner,
  TreeForTableQuery,
  TreeForTableResponse,
} from "../../nemoWorker/models";
import { useNemoWorkerRef } from "../../NemoWorkerContext/NemoWorkerContext";

function convertFileSize(size: number) {
  let index = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1000));
  if (index > 4) {
    index = 4;
  }
  return (
    (size / Math.pow(1000, index)).toFixed(1) +
    " " +
    ["B", "KB", "MB", "GB", "TB"][index]
  );
}

export function ExecutionPanel() {
  const [inputs, setInputs] = useState<{ resource: string; file: File }[]>([]);
  const [showInputs, setShowInputs] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
  const [programInfo, setProgramInfo] = useState<NemoProgramInfo | undefined>(
    undefined,
  );
  const [parseError, setParseError] = useState<string | undefined>(undefined);
  const [reasoningDuration, setReasoningDuration] = useState<number>(0);
  const [factCounts, setFactCounts] = useState<FactCounts | undefined>(
    undefined,
  );
  const [isProgramRunning, setIsProgramRunning] = useState(false);
  const [isWorkerActive, setIsWorkerActive] = useState(false);

  const programText = useAppSelector(selectProgramText);

  const workerRef = useNemoWorkerRef();

  const stopProgram = () => {
    if (workerRef?.current) {
      // Terminate web worker
      workerRef.current.stop();
      workerRef.current = undefined;
    }
    setProgramInfo(undefined);
    setParseError(undefined);
    setReasoningDuration(0);
    setFactCounts(undefined);
    setIsProgramRunning(false);
  };

  const runProgram = async () => {
    stopProgram();

    setIsProgramRunning(true);

    try {
      const worker = await createNemoWorker(setIsWorkerActive);
      workerRef!.current = worker;
      console.debug("[ExecutionPanel] Created Nemo worker", worker);

      const programInfo = await worker.setupNemoEngine(
        programText,
        Object.fromEntries(
          inputs
            .map((input) => [input.resource, input.file])
            .filter((input) => input[1] !== undefined),
        ),
      );
      programInfo.outputPredicates = await worker.getOutputPredicates();
      setProgramInfo(programInfo);
      setActiveKey(
        programInfo.outputPredicates[0]
          ? `predicate-${programInfo.outputPredicates[0]}`
          : undefined,
      );

      const info = await worker.start();
      setReasoningDuration(info.reasoningDuration);

      setFactCounts(await worker.getCounts());
    } catch (error) {
      console.warn(
        "[ExecutionPanel] Error while parsing/running program",
        error,
      );
      setParseError((error as any).toString());
    }

    setIsProgramRunning(false);
  };

  // add treeForTable listener
  const treeForTableHandler: NevBroadcastChannelHandler<
    TreeForTableQuery,
    TreeForTableResponse
  > = useCallback(
    async (payload) => {
      if (!workerRef?.current) {
        throw "Cannot process message. Reasoning was not performed.";
      }
      return await workerRef.current.traceTreeForTable(payload);
    },
    [workerRef],
  );
  useNevBroadcastChannelListener<TreeForTableQuery, TreeForTableResponse>(
    "treeForTable",
    treeForTableHandler,
  );

  // add tableEntriesForTreeNodes listener
  const tableEntriesForTreeNodesHandler: NevBroadcastChannelHandler<
    TableEntriesForTreeNodesQuery,
    TableEntriesForTreeNodesResponseInner[]
  > = useCallback(
    async (payload) => {
      if (!workerRef?.current) {
        throw "Cannot process message. Reasoning was not performed.";
      }
      return await workerRef.current.traceTableEntriesForTreeNodes(payload);
    },
    [workerRef],
  );
  useNevBroadcastChannelListener<
    TableEntriesForTreeNodesQuery,
    TableEntriesForTreeNodesResponseInner[]
  >("tableEntriesForTreeNodes", tableEntriesForTreeNodesHandler);

  return (
    <>
      <Card>
        <Card.Header>
          {isProgramRunning ? (
            <Button
              className="me-1 my-1"
              variant="outline-danger"
              onClick={stopProgram}
              title="Stop program execution"
            >
              <Icon name="stop-fill" />
            </Button>
          ) : (
            <Button onClick={runProgram} title="Start program execution">
              <Icon name="play-fill" />
            </Button>
          )}{" "}
          <Button
            variant="outline-secondary"
            onClick={() => setShowInputs(true)}
          >
            <Icon name="file-earmark"></Icon> Add input files
          </Button>
          {isWorkerActive ? (
            <TextTooltip
              text="Web worker is currently active"
              tooltipID="execution-panel-worker-active-tooltip"
            >
              <span className="ms-2">
                <Spinner size="sm" variant="secondary" animation="grow" />
              </span>
            </TextTooltip>
          ) : undefined}
          {programInfo && (
            <span className="float-end">
              <Badge bg="secondary">
                {!factCounts
                  ? "-"
                  : Object.keys(factCounts.edbPredicates)
                      .map((pred) => factCounts.edbPredicates[pred])
                      .reduce((acc, val) => acc + val, 0)}{" "}
                facts loaded and{" "}
                {!factCounts ? "-" : factCounts.factsOfDerivedPredicates} facts
                inferred in{" "}
                {Math.ceil(
                  (programInfo.parsingDuration + reasoningDuration) / 100,
                ) / 10}{" "}
                seconds
              </Badge>
            </span>
          )}
        </Card.Header>
        <Card.Body className="execution-panel-card-body">
          <Offcanvas show={showInputs} onHide={() => setShowInputs(false)}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Local Input Files</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              {Object.keys(inputs).length === 0 ? undefined : (
                <>
                  {inputs.map((input, inputIndex) => (
                    <div key={inputIndex} className="mb-2">
                      <InputGroup>
                        <TextTooltip
                          text={`@import myPredName :- csv{resource="${input.resource}"} .`}
                          tooltipID={
                            "execution-panel-input-tooltip-" + inputIndex
                          }
                        >
                          <Form.Control
                            type="text"
                            size="sm"
                            value={input.resource}
                            onChange={(event) => {
                              const newInputs = [...inputs];
                              newInputs[inputIndex] = {
                                ...inputs[inputIndex],
                                resource: event.target.value,
                              };
                              setInputs(newInputs);
                            }}
                          />
                        </TextTooltip>
                        <Button size="sm" variant="outline-secondary" disabled>
                          {convertFileSize(input.file.size)}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => {
                            const newInputs = [...inputs];
                            newInputs.splice(inputIndex, 1);
                            setInputs(newInputs);
                          }}
                        >
                          <Icon name="x"></Icon>
                        </Button>
                      </InputGroup>
                    </div>
                  ))}
                </>
              )}

              <Button
                variant="outline-secondary"
                onClick={() => {
                  chooseFile((fileList) => {
                    if (fileList.length === 0) {
                      return;
                    }
                    setInputs(
                      inputs.concat(
                        Array.from(fileList).map((file) => ({
                          resource: file.name,
                          file: file,
                        })),
                      ),
                    );
                  }, true);
                }}
              >
                <Icon name="plus-square-dotted"></Icon> Add input file
              </Button>
            </Offcanvas.Body>
          </Offcanvas>

          {parseError === undefined ? (
            <></>
          ) : (
            <>
              <hr />
              <h4>Errors</h4>
              <br />
              <code className="execution-panel-code-display">{parseError}</code>
            </>
          )}

          {programInfo === undefined ? (
            <></>
          ) : (
            <>
              <Tabs
                activeKey={activeKey}
                onSelect={async (newActiveKey) => {
                  if (newActiveKey === null) {
                    return;
                  }
                  setActiveKey(newActiveKey);
                }}
              >
                {Array.from(programInfo.outputPredicates).map((predicate) => {
                  const tabTitle = (
                    <>
                      {predicate}
                      {factCounts &&
                        predicate in factCounts.outputPredicates && (
                          <>
                            {" "}
                            <Badge bg="secondary">
                              {factCounts.outputPredicates[predicate]}
                            </Badge>
                          </>
                        )}{" "}
                      <a
                        href="#"
                        title="Download Table as CSV"
                        className="fst-italic text-decoration-none"
                        onClick={async () => {
                          if (!workerRef?.current) {
                            return;
                          }
                          try {
                            await downloadPredicate(
                              workerRef.current,
                              predicate,
                            );
                          } catch (error: any) {
                            console.error(
                              "Error while downloading file",
                              error,
                            );
                          }
                        }}
                      >
                        <Icon name="file-earmark-arrow-down" />
                      </a>
                    </>
                  );

                  return (
                    <Tab
                      key={predicate}
                      eventKey={"predicate-" + predicate}
                      title={tabTitle}
                      disabled={factCounts === undefined}
                    >
                      {activeKey !== "predicate-" + predicate ? (
                        <></>
                      ) : (
                        <>
                          {factCounts !== undefined &&
                          predicate in factCounts.outputPredicates ? (
                            <PredicateResults
                              predicate={predicate}
                              numberOfRows={
                                factCounts.outputPredicates[predicate]
                              }
                            />
                          ) : undefined}
                        </>
                      )}
                    </Tab>
                  );
                })}
              </Tabs>
            </>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
