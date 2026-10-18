import "./Examples.css";
import { useEffect, useMemo, useState } from "react";
import { Badge, Col, ListGroup, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../store";
import { selectDarkMode } from "../../store/preferences/selectors/selectDarkMode";
import { ReadOnlyEditor } from "../editor/ReadOnlyEditor";
import {
  Example,
  exampleGroups,
  urlOfExampleFile,
} from "./files/listOfExamples";
import { DefaultSuspense } from "../DefaultSuspense";
import { InputFile } from "../../InputFilesContext/InputFilesContext";
import { moduleNameOf } from "../../moduleNameOf";

/**
 * An example as the editor takes it: the text of its program and its input files
 */
export interface LoadedExample {
  programText: string;
  inputs: InputFile[];
}

export interface ExamplesProps {
  onExampleChange: (example: LoadedExample | undefined) => void;
}

/**
 * A file of an example, under the name with which its program reads it
 */
interface ExampleFile {
  resource: string;
  text: string;
  blob: Blob;
}

/**
 * The directory in which the language server sees the files of the example shown,
 * apart from the program in the editor and its input files
 */
const EXAMPLE_DIRECTORY = "file:///.examples/";

/**
 * The name under which the language server sees the program of the example shown
 */
const PROGRAM_RESOURCE = "program.rls";

/**
 * Returns the directory part of a path, with its trailing slash
 */
function directoryOf(path: string) {
  return path.slice(0, path.lastIndexOf("/") + 1);
}

/**
 * Fetches the files of an example: its program first, then its input files
 */
async function loadExample(example: Example): Promise<ExampleFile[]> {
  const directory = directoryOf(example.program);
  return await Promise.all(
    [example.program, ...(example.inputs ?? [])].map(async (path, index) => {
      if (!path.startsWith(directory)) {
        throw new Error(`The input file ${path} is outside of ${directory}`);
      }
      const response = await fetch(urlOfExampleFile(path));
      const blob = await response.blob();
      return {
        resource: index === 0 ? PROGRAM_RESOURCE : path.slice(directory.length),
        text: await blob.text(),
        blob,
      };
    }),
  );
}

export function Examples({ onExampleChange }: ExamplesProps) {
  const { t } = useTranslation("examples");

  const [currentExample, setCurrentExample] = useState(
    exampleGroups[0].examples[0],
  );
  const [files, setFiles] = useState<ExampleFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const darkPreferred = useAppSelector(selectDarkMode);

  useEffect(() => {
    let isCleanedUp = false;

    loadExample(currentExample).then((files) => {
      if (isCleanedUp) {
        return;
      }

      setFiles(files);
      const [program, ...inputs] = files;
      onExampleChange({
        programText: program.text,
        inputs: inputs.map(({ resource, text, blob }) => ({
          resource,
          file: new File([blob], resource.split("/").pop()!),
          moduleText: moduleNameOf(resource) !== undefined ? text : undefined,
        })),
      });
    });

    // The files of the previous example stay in view until the next one is loaded
    return () => {
      isCleanedUp = true;
      setCurrentFileIndex(0);
      onExampleChange(undefined);
    };
  }, [currentExample, onExampleChange]);

  const currentFile = files[currentFileIndex];

  // The other modules of the example, so that the language server resolves `@use` to them
  const companions = useMemo(
    () =>
      files
        .filter(
          (file) =>
            file !== currentFile && moduleNameOf(file.resource) !== undefined,
        )
        .map((file) => ({
          uri: EXAMPLE_DIRECTORY + file.resource,
          text: file.text,
          language: "nemo",
        })),
    [files, currentFile],
  );

  return (
    <Row>
      <Col md={4} className="examples-list">
        <p className="text-muted">{t("introduction")}</p>
        {exampleGroups.map((group) => (
          <section key={group.name} className="mb-3">
            <h6 className="examples-group-name">
              {group.name}
              {group.isNew && (
                <Badge bg="info" className="ms-2">
                  new
                </Badge>
              )}
            </h6>
            <ListGroup>
              {group.examples.map((example) => (
                <ListGroup.Item
                  key={example.program}
                  action
                  active={example === currentExample}
                  onClick={() => {
                    setCurrentExample(example);
                  }}
                >
                  {example.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </section>
        ))}
      </Col>
      <Col md={8}>
        {files.length > 1 && (
          <>
            <p className="text-muted">
              Copying this example to the editor also adds its files to the
              input files.
            </p>
            {/* Plain markup: the dialog opens from the navigation bar, whose context would make
                a `Nav` a vertical navbar list */}
            <ul className="nav nav-tabs">
              {files.map((file, index) => (
                <li key={file.resource} className="nav-item">
                  <button
                    type="button"
                    className={
                      index === currentFileIndex
                        ? "nav-link active"
                        : "nav-link"
                    }
                    onClick={() => setCurrentFileIndex(index)}
                  >
                    {index === 0 ? "Program" : file.resource}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="examples-editor-container">
          <DefaultSuspense>
            {currentFile === undefined ? (
              <></>
            ) : (
              <ReadOnlyEditor
                darkMode={darkPreferred}
                uri={EXAMPLE_DIRECTORY + currentFile.resource}
                language={
                  moduleNameOf(currentFile.resource) !== undefined
                    ? "nemo"
                    : "plaintext"
                }
                programText={currentFile.text}
                companions={companions}
              />
            )}
          </DefaultSuspense>
        </div>
      </Col>
    </Row>
  );
}
