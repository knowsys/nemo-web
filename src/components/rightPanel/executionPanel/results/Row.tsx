import { Button } from "react-bootstrap";
import { Icon } from "../../../Icon";
import "./Row.css";

export interface RowProps {
  style: any;
  index: number;
  data: {
    results: any[][];
    indexColumnWidth: number;
    onClick: (rowIndex: number, row: any[]) => void;
    predicate: string;
  };
}

export function Row({ style, index, data }: RowProps) {
  const row = data.results[index];
  const predicate = data.predicate;
  return (
    <div
      style={{ ...style, cursor: "pointer" }}
      className="predicate-results-row"
    >
      <span style={{ minWidth: data.indexColumnWidth }} className="text-muted">
        {index + 1}
      </span>
      {row.map((value, index) => (
        <span key={index}>{value.toString()}</span>
      ))}
      <span style={{ maxWidth: "max-content" }}>
        <Button
          variant="outline-secondary"
          size="sm"
          title="Click to trace the introduction of this fact."
          onClick={() => data.onClick(index, row)}
        >
          <Icon name="bar-chart-steps" />
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          title="Click for new tracing."
          href={`./ev/?predicate=${predicate}&query=[${index}]&code=[same_as_nemo]`}
          target="_blank"
        >
          <Icon name="bar-chart-steps" />
        </Button>
      </span>
    </div>
  );
}
