import { useEffect, useRef, useState, useMemo, useContext } from "react";
import "./PredicateResults.css";
import { RowStore } from "./RowStore";
import { Form, Pagination, Table } from "react-bootstrap";
import { Icon } from "../../Icon";
import { Link } from "../../link/Link";
import { NemoSessionIdContext } from "../../../nemoSessionIdContext";
import { useNemoWorkerRef } from "../../../NemoWorkerContext/NemoWorkerContext";
import { NemoRow } from "../../../nemoWorker/NemoRunner";

/**
 * Returns the address of an IRI value that a browser can open, if it is one
 *
 * The link shows the address without the angle brackets of term syntax.
 */
function webLink(value: any): string | undefined {
  if (
    typeof value === "object" &&
    value?.kind === "iri" &&
    /^https?:\/\//.test(value.value)
  ) {
    return value.value;
  }
  return undefined;
}

export interface PredicateResultsProps {
  predicate: string;
  numberOfRows: number;
}

export function PredicateResults({
  predicate,
  numberOfRows,
}: PredicateResultsProps) {
  const nemoSessionId = useContext(NemoSessionIdContext);
  const workerRef = useNemoWorkerRef();
  const rowStoreRef = useRef<RowStore | undefined>(undefined);
  const [rows, setRows] = useState<NemoRow[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);
  const numberOfPages =
    numberOfRows <= 0 ? 1 : Math.ceil(numberOfRows / rowsPerPage);

  useEffect(() => {
    if (!workerRef?.current) {
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
            {currentRows.map((row) => (
              <tr key={`row-${row.entryId}`}>
                {row.terms.map((term, index) => {
                  const link = webLink(row.values[index]);
                  return (
                    <td
                      key={`row-${row.entryId}-column-${index}`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {link !== undefined ? (
                        <Link href={link}>{link}</Link>
                      ) : (
                        term
                      )}
                    </td>
                  );
                })}
                <td key={`row-${row.entryId}-trace-button`} width={32}>
                  <a
                    title="Explain this inference"
                    onClick={() => {
                      window.open(
                        `./ev/index.html?predicate=${predicate}&query=[${row.entryId}]&nemoId=${nemoSessionId}`,
                      );
                    }}
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
