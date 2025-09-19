import {
  getNemoVersion,
  NemoEngine,
  NemoResults,
  setAllocErrorHook,
  setPanicHook,
} from "./nemoWASM";
import { Timer } from "../Timer";
import {
  TableEntriesForTreeNodesQuery,
  TableEntriesForTreeNodesQueryToJSON,
  TableEntriesForTreeNodesResponseInner,
  TableEntriesForTreeNodesResponseInnerFromJSON,
  TreeForTableQuery,
  TreeForTableQueryToJSON,
  TreeForTableResponse,
  TreeForTableResponseFromJSON,
} from "./models";

setPanicHook();
setAllocErrorHook();

class NemoResultsIterable {
  public constructor(private iterator: NemoResults) {}

  public [Symbol.iterator]() {
    return this.iterator;
  }
}

function* take<T>(iterable: Iterable<T>, count: number) {
  if (count === 0) {
    return;
  }
  for (const value of iterable) {
    yield value;
    count--;
    if (count === 0) {
      break;
    }
  }
}

export type FactCounts = Awaited<ReturnType<NemoRunner["getCounts"]>>;

/**
 * Allows for interaction with the Nemo WASM API
 *
 * Everything that interacts with a {@link NemoEngine} should be added here as new asynchronous functions.
 *
 * All code in this class should be executable inside or outside of web worker environments.
 * This allows to use the Nemo API with or without a web worker, depending on the web browser support.
 * Detecting this is handled by NemoWorker.
 *
 * Because interaction with a web worker is always asynchronous, all functions in the NemoRunner class must only return promises (e.g. by being async functions).
 * Otherwise the interface would break between the web worker and non web worker environments.
 */
export class NemoRunner {
  private engine?: NemoEngine;
  private nextResultIterableID = 1;
  private resultsIterables: { [id: number]: NemoResultsIterable } = {};

  public async setupNemoEngine(
    programText: string,
    resourceBlobs: { [resource: string]: Blob },
  ) {
    console.info("[NemoRunner] Parsing program");

    const timer = new Timer("parse");

    this.engine = await NemoEngine.new(programText, resourceBlobs);

    return {
      edbPredicates: this.engine.getEDBPredicates(),
      outputPredicates: this.engine.getOutputPredicates(),
      parsingDuration: timer.getDuration(),
    };
  }

  public async start() {
    console.info("[NemoRunner] Reasoning");

    const reasoningTimer = new Timer("reason");
    await this.engine!.reason();

    return {
      reasoningDuration: reasoningTimer.getDuration(),
    };
  }

  public async getCounts() {
    const outputPredicateCounts = Object.fromEntries(
      await Promise.all(
        this.engine!.getOutputPredicates().map((predicate) => [
          predicate,
          this.engine!.countFactsInMemoryForPredicate(predicate),
        ]),
      ),
    );
    const edbPredicateCounts = Object.fromEntries(
      await Promise.all(
        [...this.engine!.getEDBPredicates()].map((predicate) => [
          predicate,
          this.engine!.countFactsInMemoryForPredicate(predicate),
        ]),
      ),
    );
    return {
      factsOfDerivedPredicates:
        this.engine!.countFactsInMemoryForDerivedPredicates(),
      outputPredicates: outputPredicateCounts,
      edbPredicates: edbPredicateCounts,
    };
  }

  public async initializeResultsIterable(predicate: string): Promise<number> {
    const id = this.nextResultIterableID;
    this.nextResultIterableID++;

    this.resultsIterables[id] = new NemoResultsIterable(
      await this.engine!.getResult(predicate),
    );

    return id;
  }

  public async loadNextRowsOfResultsIterable(id: number, maxCount: number) {
    if (!(id in this.resultsIterables)) {
      throw new Error();
    }
    // Fetch next rows from web worker
    return Array.from(take(this.resultsIterables[id], maxCount)) as any[][];
  }

  public async deleteResultsIterable(id: number) {
    if (!(id in this.resultsIterables)) {
      throw new Error();
    }
    delete this.resultsIterables[id];
  }

  public async writeResultsToFileHandle(
    predicate: string,
    fileHandle: FileSystemFileHandle,
  ) {
    const syncAccessHandle = await (fileHandle as any).createSyncAccessHandle();
    await this.engine!.savePredicate(predicate, syncAccessHandle);
  }

  public async getNemoVersion() {
    return getNemoVersion();
  }

  public async getOutputPredicates() {
    return this.engine!.getOutputPredicates();
  }

  public async traceTreeForTable(
    tree_for_table_query: TreeForTableQuery,
  ): Promise<TreeForTableResponse> {
    return TreeForTableResponseFromJSON(
      await this.engine!.traceTreeForTable(
        TreeForTableQueryToJSON(tree_for_table_query),
      ),
    );
  }

  public async traceTableEntriesForTreeNodes(
    table_entries_for_tree_nodes: TableEntriesForTreeNodesQuery,
  ): Promise<TableEntriesForTreeNodesResponseInner[]> {
    const response = await this.engine!.traceTableEntriesForTreeNodes(
      TableEntriesForTreeNodesQueryToJSON(table_entries_for_tree_nodes),
    );
    return response.map(TableEntriesForTreeNodesResponseInnerFromJSON);
  }

  /*
   * This additionally gets handled by `NemoWorker` to terminate the web worker
   */
  public async stop() {
    console.info("[NemoRunner] Stopping runner");
  }
}
