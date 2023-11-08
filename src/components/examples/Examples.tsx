import "./Examples.css";
import { useEffect, useState } from "react";
import { Col, ListGroup, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ReadOnlyEditor } from "../leftPanel/editor/ReadOnlyEditor";
import { listOfExamples } from "./files/listOfExamples";
import { DefaultSuspense } from "../DefaultSuspense";

export interface ExamplesProps {
  onProgramTextChange: (programText: string) => void;
}

export function Examples({ onProgramTextChange }: ExamplesProps) {
  const { t } = useTranslation("examples");

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [currentProgramText, setCurrentProgramText] = useState("");

  useEffect(() => {
    let isCleanedUp = false;

    async function loadProgramText() {
      const response = await fetch(listOfExamples[currentExampleIndex].url);

      if (isCleanedUp) {
        return;
      }

      const programText = await response.text();

      if (isCleanedUp) {
        return;
      }

      setCurrentProgramText(programText);
      onProgramTextChange(programText);
    }

    loadProgramText();

    return () => {
      isCleanedUp = true;
      setCurrentProgramText("");
      onProgramTextChange("");
    };
  }, [currentExampleIndex, onProgramTextChange]);

  return (
    <Row>
      <Col md={4}>
        <p className="text-muted">{t("introduction")}</p>
        <ListGroup>
          {listOfExamples.map((example, i) => (
            <ListGroup.Item
              key={i}
              action
              active={i === currentExampleIndex}
              onClick={() => {
                setCurrentExampleIndex(i);
              }}
            >
              {example.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <br />
      </Col>
      <Col md={8}>
        <div className="examples-editor-container">
          <DefaultSuspense>
            <ReadOnlyEditor programText={currentProgramText} />
          </DefaultSuspense>
        </div>
      </Col>
    </Row>
  );
}
