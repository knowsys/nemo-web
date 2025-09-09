import {
  MutableRefObject,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import "./PredicateResults.css";
import { NemoWorker } from "../../../nemoWorker/NemoWorker";
import { RowStore } from "./RowStore";
import { Button, Form, Pagination, Table } from "react-bootstrap";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPageHandler = useCallback(
    (newPage: number) => {
      rowStoreRef.current?.loadRowsUntil(newPage * rowsPerPage + rowsPerPage);
      setPage(newPage);
    },
    [rowsPerPage],
  );

  return (
    rows.length > 0 && (
      <>
        <Table striped bordered>
          <tbody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowIdx) => (
                <tr key={`row-${page * rowsPerPage + rowIdx}`}>
                  {row.map((value, index) => (
                    <td
                      key={`row-${page * rowsPerPage + rowIdx}-column-${index}`}
                    >
                      {(value.toString().startsWith('http://') || value.toString().startsWith('https://')) 
                        ? <Link href={value.toString()}>{value.toString()}</Link>
                        : value.toString()}
                    </td>
                  ))}
                  <td
                    key={`row-${page * rowsPerPage + rowIdx}-trace-button`}
                    width={50}
                  >
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      title="Click to trace the introduction of this fact."
                      href={`./ev/?predicate=${predicate}&query=[${rowIdx}]`}
                      target="_blank"
                    >
                      <Icon name="bar-chart-steps" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        <div className="table-controls">
          <Pagination>
            <Pagination.Item
              active={page === 0}
              onClick={() => setPageHandler(0)}
            >
              {1}
            </Pagination.Item>
            {page > 3 ? (
              <Pagination.Ellipsis />
            ) : (
              page > 2 && (
                <Pagination.Item
                  active={page === 1}
                  onClick={() => setPageHandler(1)}
                >
                  {2}
                </Pagination.Item>
              )
            )}
            {page > 1 && (
              <Pagination.Item onClick={() => setPageHandler(page - 1)}>
                {page}
              </Pagination.Item>
            )}
            {numberOfPages > 2 && page > 0 && page < numberOfPages - 1 && (
              <Pagination.Item active onClick={() => setPageHandler(page)}>
                {page + 1}
              </Pagination.Item>
            )}
            {page < numberOfPages - 2 && (
              <Pagination.Item onClick={() => setPageHandler(page + 1)}>
                {page + 2}
              </Pagination.Item>
            )}
            {page < numberOfPages - 4 ? (
              <Pagination.Ellipsis />
            ) : (
              page < numberOfPages - 3 && (
                <Pagination.Item
                  active={page === numberOfPages - 2}
                  onClick={() => setPageHandler(numberOfPages - 2)}
                >
                  {numberOfPages - 1}
                </Pagination.Item>
              )
            )}
            {numberOfPages > 1 && (
              <Pagination.Item
                active={page === numberOfPages - 1}
                onClick={() => setPageHandler(numberOfPages - 1)}
              >
                {numberOfPages}
              </Pagination.Item>
            )}
          </Pagination>
          <div>
            <Form.Label htmlFor="rowsPerPageSelect">Rows per Page:</Form.Label>
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
