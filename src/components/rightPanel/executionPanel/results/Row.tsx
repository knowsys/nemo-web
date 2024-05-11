import { Button } from "react-bootstrap";
import "./Row.css";

export interface RowProps {
  style: any;
  index: number;
  data: {
    results: any[][];
    indexColumnWidth: number;
    onClick: (rowIndex: number, row: any[]) => void;
  };
}

export function Row({ style, index, data }: RowProps) {
  const row = data.results[index];
  return (
    <div
      style={{ ...style, cursor: "pointer" }}
      className="predicate-results-row"
      title="Click to Trace!"
    >
      <span style={{ minWidth: data.indexColumnWidth }} className="text-muted">
        {index + 1}
      </span>
      {row.map((value, index) => (
        <span key={index}>{value.toString()}</span>
      ))}
      <span>
        <Button
          className="me-1 my-1"
          size="sm"
          onClick={() => data.onClick(index, row)}
        >
          Trace
        </Button>
      </span>
    </div>
  );
}
