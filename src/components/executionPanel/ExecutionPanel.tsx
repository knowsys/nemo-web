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
import {
  inputFileOf,
  useInputFiles,
} from "../../InputFilesContext/InputFilesContext";
import { moduleNameOf } from "../../moduleNameOf";

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

/**
 * Returns the directive that reads an input file, as a hint on how to use it
 */
function usageOf(resource: string) {
  const moduleName = moduleNameOf(resource);
  if (moduleName !== undefined) {
    return `@use ${moduleName} .`;
  }
  const extension = resource.split(".").pop()?.toLowerCase();
  const format =
    extension === "tsv" || extension === "json" || extension === "parquet"
      ? extension
      : ["nt", "nq", "ttl", "trig", "rdf", "owl"].includes(extension ?? "")
        ? "rdf"
        : "csv";
  return `@import myPredicate from ${format} { resource = "${resource}" } .`;
}

export function ExecutionPanel() {
  const { inputs, setInputs } = useInputFiles();
  const [showInputs, setShowInputs] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
  const [programInfo, setProgramInfo] = useState<NemoProgramInfo | undefined>(
    undefined,
  );
  const [parseError, setParseError] = useState<string | undefined>(undefined);
  const [warnings, setWarnings] = useState<string[]>([]);
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
    setWarnings([]);
    setReasoningDuration(0);
    setFactCounts(undefined);
    setIsProgramRunning(false);
  };

  const runProgram = async () => {
    stopProgram();

    setIsProgramRunning(true);

    let worker: NemoWorker | undefined = undefined;
    try {
      worker = await createNemoWorker(setIsWorkerActive);
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

    try {
      // Warnings arise while loading and reasoning, also on runs that fail
      if (worker !== undefined && workerRef?.current === worker) {
        setWarnings(await worker.getWarnings());
      }
    } catch (error) {
      console.warn("[ExecutionPanel] Error while fetching warnings", error);
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
            <Icon name="file-earmark"></Icon> Input files{" "}
            {inputs.length > 0 && <Badge bg="secondary">{inputs.length}</Badge>}
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
                {!factCounts ? "-" : factCounts.loadedFacts} facts loaded and{" "}
                {!factCounts ? "-" : factCounts.derivedFacts} facts inferred in{" "}
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
              <p className="text-muted">
                Imports read these files by their resource names. A file ending
                in <code>.rls</code> is a module: <code>@use name</code> reads{" "}
                <code>name.rls</code>, and <code>@use dir::name</code> reads{" "}
                <code>dir/name.rls</code>.
              </p>
              {inputs.length === 0 ? undefined : (
                <>
                  {inputs.map((input, inputIndex) => (
                    <div key={inputIndex} className="mb-2">
                      <InputGroup>
                        <TextTooltip
                          text={usageOf(input.resource)}
                          tooltipID={
                            "execution-panel-input-tooltip-" + inputIndex
                          }
                        >
                          <Form.Control
                            type="text"
                            size="sm"
                            value={input.resource}
                            onChange={(event) => {
                              const resource = event.target.value;
                              setInputs((current) =>
                                current.map((entry) =>
                                  entry === input
                                    ? { ...entry, resource }
                                    : entry,
                                ),
                              );
                              // A file renamed into a module is read for the editor
                              if (
                                moduleNameOf(resource) !== undefined &&
                                input.moduleText === undefined
                              ) {
                                input.file
                                  .text()
                                  .then((moduleText) =>
                                    setInputs((current) =>
                                      current.map((entry) =>
                                        entry.file === input.file
                                          ? { ...entry, moduleText }
                                          : entry,
                                      ),
                                    ),
                                  );
                              }
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
                            setInputs((current) =>
                              current.filter((entry) => entry !== input),
                            );
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
                  chooseFile(async (fileList) => {
                    if (fileList.length === 0) {
                      return;
                    }
                    const added = await Promise.all(
                      Array.from(fileList).map((file) =>
                        inputFileOf(file.name, file),
                      ),
                    );
                    setInputs((current) => current.concat(added));
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

          {warnings.length === 0 ? (
            <></>
          ) : (
            <>
              <hr />
              <h4>Warnings</h4>
              <br />
              <code className="execution-panel-code-display">
                {warnings.join("\n")}
              </code>
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
