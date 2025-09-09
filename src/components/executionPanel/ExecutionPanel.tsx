import { useRef, useState, useEffect } from "react";
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
import { useAppDispatch, useAppSelector } from "../../store/index";
import { selectProgramText } from "../../store/programInfo/selectors/selectProgramText";
import { Icon } from "../Icon";
import { TextTooltip } from "../TextTooltip";
import {
  createNemoWorker,
  NemoProgramInfo,
  NemoWorker,
} from "../../nemoWorker/NemoWorker";
import { PredicateResults } from "./results/PredicateResults";
import { FactCounts } from "../../nemoWorker/NemoRunner";
import "./ExecutionPanel.css";
import { chooseFile } from "../../chooseFile";
import { downloadPredicate } from "./downloadPredicate";
import { toastsSlice } from "../../store/toasts";

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
  const dispatch = useAppDispatch();

  const [inputs, setInputs] = useState<{ resource: string; file: File }[]>([]);
  const [showInputs, setShowInputs] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
  const workerRef = useRef<NemoWorker | undefined>(undefined);
  const [programInfo, setProgramInfo] = useState<NemoProgramInfo | undefined>(
    undefined,
  );
  const [parseError, setParseError] = useState<string | undefined>(undefined);
  const [initializationDuration, setInitializationDuration] =
    useState<number>(0);
  const [reasoningDuration, setReasoningDuration] = useState<number>(0);
  const [factCounts, setFactCounts] = useState<FactCounts | undefined>(
    undefined,
  );
  const [isProgramRunning, setIsProgramRunning] = useState(false);
  const [isWorkerActive, setIsWorkerActive] = useState(false);

  const programText = useAppSelector(selectProgramText);

  const stopProgram = () => {
    if (workerRef.current !== undefined) {
      // Terminate web worker
      workerRef.current.stop();
      workerRef.current = undefined;
    }
    setProgramInfo(undefined);
    setParseError(undefined);
    setInitializationDuration(0);
    setReasoningDuration(0);
    setFactCounts(undefined);
    setIsProgramRunning(false);
  };

  const runProgram = async () => {
    stopProgram();

    setIsProgramRunning(true);

    try {
      const worker = await createNemoWorker(setIsWorkerActive);
      workerRef.current = worker;
      console.debug("[ExecutionPanel] Created Nemo worker", worker);

      const programInfo = await worker.parseProgram(programText);
      await worker.markDefaultOutputs();
      programInfo.outputPredicates = (
        await worker.getOutputPredicates()
      ).sort();
      setProgramInfo(programInfo);
      setActiveKey(
        programInfo.outputPredicates[0]
          ? `predicate-${programInfo.outputPredicates[0]}`
          : undefined,
      );

      const info = await worker.start(
        Object.fromEntries(
          inputs
            .map((input) => [input.resource, input.file])
            .filter((input) => input[1] !== undefined),
        ),
      );
      setInitializationDuration(info.initializationDuration);
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

  useEffect(() => {
    const bc = new BroadcastChannel("NemoVisualization");

    const onMessage = async (event: MessageEvent) => {
      if (!!event.data.error || !!event.data.responseType) {
        return; // don't listen on own messages (which might be filtered by default by the channel, I did not check this...)
      }

      if (workerRef.current === undefined) {
        bc.postMessage({
          error: "Cannot process message. Reasoning was not performed.",
        });
        return;
      }

      if (!event.data.queryType || !event.data.payload) {
        bc.postMessage({
          error: "Expected an object with queryType and payload.",
        });
        return;
      }

      const { queryType, payload } = event.data; // data should consist of queryType and payload

      let response;
      switch (queryType) {
        case "treeForTable":
          response = await workerRef.current.traceTreeForTable(payload);
          bc.postMessage({ responseType: "treeForTable", payload: response });
          break;
        case "tableEntriesForTreeNodes":
          response =
            await workerRef.current.traceTableEntriesForTreeNodes(payload);
          bc.postMessage({
            responseType: "tableEntriesForTreeNodes",
            payload: response,
          });
          break;
        default:
          bc.postMessage({
            error:
              "Invalid Query Type, expected treeForTable or tableEntriesForTreeNodes.",
          });
          break;
      }
    };

    bc.addEventListener("message", onMessage);

    return () => {
      bc.removeEventListener("message", onMessage);
      bc.close();
    };
  }, []);

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
                  (programInfo.parsingDuration +
                    initializationDuration +
                    reasoningDuration) /
                    100,
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
                          if (workerRef.current === undefined) {
                            return;
                          }
                          try {
                            await downloadPredicate(
                              workerRef.current,
                              predicate,
                            );
                          } catch (error: any) {
                            dispatch(
                              toastsSlice.actions.addToast({
                                title: "Error while downloading file",
                                description: error.toString(),
                                variant: "danger",
                              }),
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
                              workerRef={workerRef}
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
