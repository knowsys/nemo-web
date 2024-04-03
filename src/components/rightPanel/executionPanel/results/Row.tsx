import "./Row.css";

export interface RowProps {
  style: any;
  index: number;
  data: {
    results: any[][];
    indexColumnWidth: number;
    onClick: (row: number[]) => void;
  };
}

export function Row({ style, index, data }: RowProps) {
  const row = data.results[index];
  return (
    <div
      style={{ ...style, cursor: "pointer" }}
      className="predicate-results-row"
      onClick={() => data.onClick(row)}
      title="Click to Trace!"
    >
      <span style={{ minWidth: data.indexColumnWidth }} className="text-muted">
        {index + 1}
      </span>
      {row.map((value, index) => (
        <span key={index}>{value.toString()}</span>
      ))}
    </div>
  );
}
