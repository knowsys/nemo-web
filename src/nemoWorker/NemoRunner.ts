import {
  nemoVersion,
  NemoCursor,
  NemoEngine,
  NemoProgram,
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
import { moduleNameOf } from "../moduleNameOf";

setPanicHook();

/**
 * A row of a predicate's results
 *
 * `values` are the engine's tagged values, `terms` the same values in Nemo's term syntax.
 * `entryId` is the id with which the explanation viewer (nev) selects the row.
 */
export interface NemoRow {
  entryId: number;
  values: any[];
  terms: string[];
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
  private nextCursorID = 1;
  private cursors: { [id: number]: NemoCursor } = {};

  public async setupNemoEngine(
    programText: string,
    resourceBlobs: { [resource: string]: Blob },
  ) {
    console.info("[NemoRunner] Loading program");

    const timer = new Timer("parse");

    const program = NemoProgram.parse(programText);
    const engine = new NemoEngine();
    // nemo-web offers a trace for every predicate, and tracing needs imports kept whole
    engine.retainImports();
    for (const [resource, blob] of Object.entries(resourceBlobs)) {
      // An `.rls` file is a module, read by `@use`; any other file is read by imports
      const moduleName = moduleNameOf(resource);
      if (moduleName !== undefined) {
        engine.addModule(moduleName, await blob.text());
      } else {
        engine.addResource(resource, new Uint8Array(await blob.arrayBuffer()));
      }
    }
    // Remote imports are fetched with the worker's `fetch`
    await engine.loadAsync(program);
    this.engine = engine;

    return {
      outputPredicates: engine.outputPredicates() as string[],
      parsingDuration: timer.getDuration(),
    };
  }

  public async start() {
    console.info("[NemoRunner] Reasoning");

    const reasoningTimer = new Timer("reason");
    await this.engine!.reasonAsync();

    return {
      reasoningDuration: reasoningTimer.getDuration(),
    };
  }

  public async getCounts() {
    const engine = this.engine!;
    return {
      loadedFacts: engine.loadedFacts,
      derivedFacts: engine.derivedFacts,
      outputPredicates: Object.fromEntries(
        (engine.outputPredicates() as string[]).map((predicate) => [
          predicate,
          engine.count(predicate),
        ]),
      ) as { [predicate: string]: number },
    };
  }

  /**
   * Returns the warnings the engine reported so far, rendered as text
   */
  public async getWarnings(): Promise<string[]> {
    if (this.engine === undefined) {
      return [];
    }
    return (this.engine.reports() as { rendered: string }[]).map(
      (report) => report.rendered,
    );
  }

  public async initializeResultsIterable(predicate: string): Promise<number> {
    const id = this.nextCursorID;
    this.nextCursorID++;

    this.cursors[id] = this.engine!.cursor(predicate);

    return id;
  }

  public async loadNextRowsOfResultsIterable(
    id: number,
    maxCount: number,
  ): Promise<NemoRow[]> {
    if (!(id in this.cursors)) {
      throw new Error();
    }
    const cursor = this.cursors[id];
    // A chunk may hold fewer rows than asked for, even before the cursor is done
    const rows: NemoRow[] = [];
    while (rows.length < maxCount && !cursor.done) {
      const chunk = this.engine!.readChunk(
        cursor,
        maxCount - rows.length,
      ) as NemoRow[];
      if (chunk.length === 0) {
        break;
      }
      rows.push(...chunk);
    }
    return rows;
  }

  public async deleteResultsIterable(id: number) {
    if (!(id in this.cursors)) {
      throw new Error();
    }
    this.cursors[id].free();
    delete this.cursors[id];
  }

  /**
   * Returns a predicate's facts as CSV bytes
   */
  public async exportPredicate(
    predicate: string,
  ): Promise<Uint8Array<ArrayBuffer>> {
    // The bytes are copied out of the module's memory into a fresh buffer
    return this.engine!.exportPredicate(predicate) as Uint8Array<ArrayBuffer>;
  }

  public async getNemoVersion() {
    return nemoVersion();
  }

  public async getOutputPredicates() {
    return this.engine!.outputPredicates() as string[];
  }

  public async getLineNumberFromRuleId(
    ruleId: number,
  ): Promise<number | undefined> {
    return this.engine!.rule(ruleId)?.source?.line;
  }

  public async traceTreeForTable(
    tree_for_table_query: TreeForTableQuery,
  ): Promise<TreeForTableResponse> {
    return TreeForTableResponseFromJSON(
      this.engine!.treeForTable(TreeForTableQueryToJSON(tree_for_table_query)),
    );
  }

  public async traceTableEntriesForTreeNodes(
    table_entries_for_tree_nodes: TableEntriesForTreeNodesQuery,
  ): Promise<TableEntriesForTreeNodesResponseInner[]> {
    const response = this.engine!.tableEntriesForTreeNodes(
      TableEntriesForTreeNodesQueryToJSON(table_entries_for_tree_nodes),
    ) as any[];
    return response.map(TableEntriesForTreeNodesResponseInnerFromJSON);
  }

  /*
   * This additionally gets handled by `NemoWorker` to terminate the web worker
   */
  public async stop() {
    console.info("[NemoRunner] Stopping runner");
  }
}
