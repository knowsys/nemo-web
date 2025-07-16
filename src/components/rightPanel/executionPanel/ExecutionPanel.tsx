import { useRef, useState, useEffect } from "react";
import {
  Card,
  Button,
  Tabs,
  Tab,
  Spinner,
  InputGroup,
  Form,
  Modal,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../store/index";
import { selectProgramText } from "../../../store/programInfo/selectors/selectProgramText";
import { Icon } from "../../Icon";
import { TextTooltip } from "../../TextTooltip";
import {
  createNemoWorker,
  NemoProgramInfo,
  NemoWorker,
} from "../../../nemoWorker/NemoWorker";
import { PredicateResults } from "./results/PredicateResults";
import { FactCounts } from "../../../nemoWorker/NemoRunner";
import "./ExecutionPanel.css";
import { chooseFile } from "../../../chooseFile";
import { downloadPredicate } from "./downloadPredicate";
import { toastsSlice } from "../../../store/toasts";
import { Evonne } from "./evonne/Evonne";

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

enum TracingFormat {
  NONE,
  ASCII,
  EVONNE,
}

export function ExecutionPanel() {
  const { t } = useTranslation("executionPanel");

  const dispatch = useAppDispatch();

  const [inputs, setInputs] = useState<{ resource: string; file: File }[]>([]);
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

  const [tracingInputData, setTracingInputData] = useState<{
    predicate: string;
    rowIndex: number;
    row: any[];
  }>();
  const [tracingFactText, setTracingFactText] = useState("");
  const [tracingResult, setTracingResult] = useState<string | undefined>(
    undefined,
  );
  const [tracingFormat, setTracingFormat] = useState(TracingFormat.NONE);

  const [isTracingModalShown, setIsTracingModalShown] = useState(false);

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

  const isTracingCurrentlyAllowed = (
    tracingFactText: string,
    tracingInputData:
      | { predicate: string; rowIndex: number; row: any[] }
      | undefined,
  ) => {
    return (
      programInfo !== undefined &&
      !isWorkerActive &&
      (tracingFactText.length > 0 || !!tracingInputData)
    );
  };

  const traceFactEvonne = async (
    tracingFactText: string,
    tracingInputData:
      | { predicate: string; rowIndex: number; row: any[] }
      | undefined,
  ) => {
    if (
      !isTracingCurrentlyAllowed(tracingFactText, tracingInputData) ||
      workerRef.current === undefined
    ) {
      return;
    }

    try {
      const tracingResult = tracingFactText
        ? await workerRef.current.parseAndTraceFactGraphMlTree(tracingFactText)
        : await workerRef.current.traceFactAtIndexGraphMlTree(
            tracingInputData!.predicate,
            tracingInputData!.rowIndex,
          );

      setTracingFormat(TracingFormat.EVONNE);
      setTracingResult(tracingResult);
    } catch (error) {
      setTracingFormat(TracingFormat.NONE);
      setTracingResult((error as any).toString());
    }
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
          response =
            await workerRef.current.experimentalNewTracingTreeForTable(payload);
          bc.postMessage({ responseType: "treeForTable", payload: response });
          break;
        case "tableEntriesForTreeNodes":
          response =
            await workerRef.current.experimentalNewTracingTableEntriesForTreeNodes(
              payload,
            );
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
          {t("cardTitle")}
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
          <span className="float-end">
            <TextTooltip
              tooltipID="main-execution-panel-help-tooltip"
              text={t("panelExplanation")}
            >
              <span>
                <Icon name="question-circle-fill" />
              </span>
            </TextTooltip>
          </span>
        </Card.Header>
        <Card.Body>
          {isProgramRunning ? (
            <>
              <Button className="me-1 my-1" onClick={runProgram}>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                <span className="visually-hidden">Loading...</span>
                Re-run program
              </Button>
              <Button
                className="me-1 my-1"
                variant="outline-danger"
                onClick={stopProgram}
              >
                Stop
              </Button>
            </>
          ) : (
            <>
              <Dropdown as={ButtonGroup} className="me-1 my-1">
                <Button onClick={runProgram}>Run program</Button>

                <Dropdown.Toggle
                  split
                  variant="primary"
                  id="execution-panel-run-button"
                />

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setIsTracingModalShown(true)}>
                    Open tracing panel
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
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
            <Icon name="plus-square-dotted"></Icon> Add local file as input
          </Button>

          {Object.keys(inputs).length === 0 ? undefined : (
            <div>
              Input files (local):
              {inputs.map((input, inputIndex) => (
                <div key={inputIndex} className="mb-2">
                  <InputGroup>
                    <TextTooltip
                      text={`@import myPredName :- csv{resource="${input.resource}"} .`}
                      tooltipID={"execution-panel-input-tooltip-" + inputIndex}
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
                        chooseFile((fileList) => {
                          if (fileList.length === 0) {
                            return;
                          }
                          const file = fileList[0];
                          const newInputs = [...inputs];
                          newInputs[inputIndex] = {
                            ...inputs[inputIndex],
                            file,
                          };
                          setInputs(newInputs);
                        }, false);
                      }}
                    >
                      <Icon name="file-earmark-spreadsheet"></Icon>
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
            </div>
          )}

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
              <br />
              <h5>Results:</h5>
              <div>
                Derived{" "}
                {factCounts === undefined
                  ? "-"
                  : factCounts?.factsOfDerivedPredicates}{" "}
                facts in{" "}
                {Math.ceil(
                  (programInfo.parsingDuration +
                    initializationDuration +
                    reasoningDuration) /
                    100,
                ) / 10}{" "}
                seconds{" "}
                <span
                  className="text-muted"
                  title="parsing/initialization/reasoning and loading durations"
                >
                  ({Math.ceil(programInfo.parsingDuration)}+
                  {Math.ceil(initializationDuration)}+
                  {Math.ceil(reasoningDuration)} ms)
                </span>
              </div>

              <Tabs
                activeKey={activeKey}
                onSelect={async (newActiveKey) => {
                  if (newActiveKey === null) {
                    return;
                  }
                  setActiveKey(newActiveKey);
                }}
                className="mb-3"
              >
                {Array.from(programInfo.outputPredicates).map((predicate) => {
                  const tabTitle =
                    predicate +
                    (factCounts !== undefined &&
                    predicate in factCounts.outputPredicates
                      ? ` (${factCounts.outputPredicates[predicate]})`
                      : "");

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
                          <div className="mb-2">
                            <code>{predicate}</code>
                            <span className="text-muted">
                              {factCounts !== undefined &&
                              predicate in factCounts.outputPredicates
                                ? ` (${factCounts.outputPredicates[predicate]} rows)`
                                : ""}{" "}
                            </span>
                            <a
                              href="#"
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
                              Save all rows as CSV
                            </a>
                          </div>
                          {factCounts !== undefined &&
                          predicate in factCounts.outputPredicates ? (
                            <PredicateResults
                              workerRef={workerRef}
                              predicate={predicate}
                              numberOfRows={
                                factCounts.outputPredicates[predicate]
                              }
                              onClickRow={(predicate, rowIndex, row) => {
                                setIsTracingModalShown(true);
                                setTracingInputData({
                                  predicate,
                                  rowIndex,
                                  row,
                                });
                                setTracingFactText("");
                                traceFactEvonne("", {
                                  predicate,
                                  rowIndex,
                                  row,
                                });
                              }}
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

      <Modal
        show={isTracingModalShown}
        onHide={() => setIsTracingModalShown(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Fact tracing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tracing allows you to see the concrete rule invocations that lead to a
          fact being inferred.
          <hr />
          <h4>Input</h4>
          <Form.Group>
            <Form.Label>
              Fact that should be traced. The placeholder shows the fact you
              have chosen from the table, which will be traced by default. You
              can use the input to override this with a fact of your choice. Be
              aware that tracing nulls (blank nodes), e.g. _:0, only works by
              clicking the trace button on the respective row. Manually entering
              a null value here will not yield any result.
            </Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                value={tracingFactText}
                onChange={(event) => setTracingFactText(event.target.value)}
                placeholder={
                  tracingInputData
                    ? `${
                        tracingInputData.predicate
                      }(${tracingInputData.row.join(",")})`
                    : "No fact chosen from table. Input your own, e.g.: a(1)"
                }
              />
              <Button
                variant="primary"
                disabled={
                  !isTracingCurrentlyAllowed(tracingFactText, tracingInputData)
                }
                onClick={() =>
                  traceFactEvonne(tracingFactText, tracingInputData)
                }
              >
                Trace
              </Button>
            </InputGroup>
          </Form.Group>
          <h4>Tracing results</h4>
          {tracingResult === undefined ||
          tracingFormat === TracingFormat.NONE ? (
            <>No results</>
          ) : tracingFormat === TracingFormat.EVONNE ? (
            <Evonne data={tracingResult} />
          ) : (
            /* tracingFormat === TracingFormat.ASCII */
            <code className="execution-panel-code-display">
              {tracingResult}
            </code>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsTracingModalShown(false)}
          >
            {t("common:closeModal")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
