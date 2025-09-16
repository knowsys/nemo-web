import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { Row } from "./Row";
import "./PredicateResults.css";
import { NemoWorker } from "../../../../nemoWorker/NemoWorker";
import { RowStore } from "./RowStore";

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
  const [initialized, setInitialized] = useState(false);
  const [rows, setRows] = useState<any[][]>([]);

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
        setInitialized(true);
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

  const indexColumnWidth = useMemo(() => {
    const element = document.createElement("div");
    element.textContent = "" + (rows?.length || "");
    element.className = "predicate-results-width-calculation";
    document.body.appendChild(element);
    const clientWidth = element.clientWidth;
    document.body.removeChild(element);

    return clientWidth + 1;
  }, [rows.length]);

  return (
    <>
      {!initialized ? (
        <>Loading results</>
      ) : (
        <InfiniteLoader
          isItemLoaded={(index) => index < rows.length}
          itemCount={numberOfRows}
          loadMoreItems={async (_, stopIndex) => {
            rowStoreRef.current?.loadRowsUntil(stopIndex + 1);
          }}
          threshold={200}
          minimumBatchSize={10000}
        >
          {({ onItemsRendered, ref }) => (
            <FixedSizeList
              height={400}
              itemCount={rows.length}
              itemSize={40}
              width="100%"
              itemData={{
                results: rows,
                indexColumnWidth,
                predicate,
              }}
              onItemsRendered={onItemsRendered}
              ref={ref}
            >
              {Row}
            </FixedSizeList>
          )}
        </InfiniteLoader>
      )}
    </>
  );
}
