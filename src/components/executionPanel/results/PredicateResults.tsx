import { MutableRefObject, useEffect, useRef, useState, useMemo } from "react";
import "./PredicateResults.css";
import { NemoWorker } from "../../../nemoWorker/NemoWorker";
import { RowStore } from "./RowStore";
import { Form, Pagination, Table } from "react-bootstrap";
import { Icon } from "../../Icon";
import { Link } from "../../link/Link";

export interface PredicateResultsProps {
  workerRef: MutableRefObject<NemoWorker | undefined>;
  predicate: string;
  numberOfRows: number;
}

export function PredicateResults({
  workerRef,
  predicate,
  numberOfRows,
}: PredicateResultsProps) {
  const rowStoreRef = useRef<RowStore | undefined>(undefined);
  const [rows, setRows] = useState<any[][]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);
  const numberOfPages =
    numberOfRows <= 0 ? 1 : Math.ceil(numberOfRows / rowsPerPage);

  useEffect(() => {
    if (workerRef.current === undefined) {
      return;
    }

    const newRowStore = new RowStore(
      predicate,
      workerRef.current,
      (newRows) => {
        setRows(newRows);
      },
    );
    newRowStore.initialize().then(() => {
      if (rowStoreRef.current === newRowStore) {
        newRowStore.loadRowsUntil(1000);
      }
    });
    rowStoreRef.current = newRowStore;

    return () => {
      try {
        newRowStore.delete();
      } catch (error) {
        console.warn(
          "[PredicateResults] Error while cleaning up row store",
          error,
        );
      }
    };
  }, [predicate, workerRef]);

  useEffect(() => {
    // when initial loading is done
    if (rows.length > 0 && rows.length < numberOfRows) {
      // load all rows
      rowStoreRef.current?.loadRowsUntil(numberOfRows);
    }
  }, [rows, numberOfRows]);

  const currentRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, rowsPerPage, page],
  );

  return (
    rows.length > 0 && (
      <>
        <Table striped bordered>
          <tbody>
            {currentRows.map((row, rowIdx) => (
              <tr key={`row-${page * rowsPerPage + rowIdx}`}>
                {row.map((value, index) => (
                  <td
                    key={`row-${page * rowsPerPage + rowIdx}-column-${index}`}
                  >
                    {value.toString().startsWith("http://") ||
                    value.toString().startsWith("https://") ? (
                      <Link href={value.toString()}>{value.toString()}</Link>
                    ) : (
                      value.toString()
                    )}
                  </td>
                ))}
                <td
                  key={`row-${page * rowsPerPage + rowIdx}-trace-button`}
                  width={32}
                >
                  <a
                    title="Explain this inference"
                    href={`./ev/?predicate=${predicate}&query=[${page * rowsPerPage + rowIdx}]`}
                    target="_blank"
                    style={{ color: "inherit" }}
                  >
                    <Icon name="search" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="table-controls">
          <Pagination>
            <Pagination.Item active={page === 0} onClick={() => setPage(0)}>
              {1}
            </Pagination.Item>
            {page > 3 ? (
              <Pagination.Ellipsis />
            ) : (
              page > 2 && (
                <Pagination.Item active={page === 1} onClick={() => setPage(1)}>
                  {2}
                </Pagination.Item>
              )
            )}
            {page > 1 && (
              <Pagination.Item onClick={() => setPage(page - 1)}>
                {page}
              </Pagination.Item>
            )}
            {numberOfPages > 2 && page > 0 && page < numberOfPages - 1 && (
              <Pagination.Item active onClick={() => setPage(page)}>
                {page + 1}
              </Pagination.Item>
            )}
            {page < numberOfPages - 2 && (
              <Pagination.Item onClick={() => setPage(page + 1)}>
                {page + 2}
              </Pagination.Item>
            )}
            {page < numberOfPages - 4 ? (
              <Pagination.Ellipsis />
            ) : (
              page < numberOfPages - 3 && (
                <Pagination.Item
                  active={page === numberOfPages - 2}
                  onClick={() => setPage(numberOfPages - 2)}
                >
                  {numberOfPages - 1}
                </Pagination.Item>
              )
            )}
            {numberOfPages > 1 && (
              <Pagination.Item
                active={page === numberOfPages - 1}
                onClick={() => setPage(numberOfPages - 1)}
              >
                {numberOfPages}
              </Pagination.Item>
            )}
          </Pagination>
          <div>
            <Form.Label htmlFor="rowsPerPageSelect">Rows per page:</Form.Label>
            <Form.Select
              id="rowsPerPageSelect"
              value={rowsPerPage}
              onChange={(ev) => {
                const newRowsPerPage = parseInt(ev.target.value, 10);
                setPage(Math.floor((page * rowsPerPage) / newRowsPerPage));
                setRowsPerPage(newRowsPerPage);
              }}
            >
              <option value={50}>{50}</option>
              <option value={100}>{100}</option>
              <option value={200}>{200}</option>
              <option value={500}>{500}</option>
            </Form.Select>
          </div>
        </div>
      </>
    )
  );
}
