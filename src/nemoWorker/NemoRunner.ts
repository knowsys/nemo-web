import {
  getNemoVersion,
  NemoEngine,
  NemoProgram,
  NemoResults,
  setAllocErrorHook,
  setPanicHook,
} from "./nemoWASM";
import { Timer } from "../Timer";

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
 * Everything that interacts with a {@link NemoProgram} or {@link NemoEngine} should be added here as new asynchronous functions.
 *
 * All code in this class should be executable inside or outside of web worker environments.
 * This allows to use the Nemo API with or without a web worker, depending on the web browser support.
 * Detecting this is handled by NemoWorker.
 *
 * Because interaction with a web worker is always asynchronous, all functions in the NemoRunner class must only return promises (e.g. by being async functions).
 * Otherwise the interface would break between the web worker and non web worker environments.
 */
export class NemoRunner {
  private program = new NemoProgram("");
  private engine = new NemoEngine(this.program, {});
  private nextResultIterableID = 1;
  private resultsIterables: { [id: number]: NemoResultsIterable } = {};

  public async parseProgram(programText: string) {
    console.info("[NemoRunner] Parsing program");

    const timer = new Timer("parse");
    this.program = new NemoProgram(programText);
    return {
      edbPredicates: this.program.getEDBPredicates(),
      outputPredicates: this.program.getOutputPredicates(),
      parsingDuration: timer.getDuration(),
    };
  }

  public async start(initialResourceBlobs: { [resource: string]: Blob }) {
    console.info("[NemoRunner] Preparing resource blobs");

    const resourceBlobs = { ...initialResourceBlobs };

    for (const resource of this.program.getResourcesUsedInImports()) {
      if (resource in resourceBlobs) {
        continue;
      }

      let url: URL;
      try {
        url = new URL(resource);
      } catch (error) {
        throw new Error(`Could not parse resource \`${resource}\` as URL`);
      }
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error(`Invalid protocol in resource \`${resource}\``);
      }

      try {
        const response = await fetch(resource, { mode: "cors" });

        if (!response.ok) {
          throw new Error(
            `Request for resource \`${resource}\` failed with status code \`${response.status}\``,
          );
        }

        resourceBlobs[resource] = await response.blob();
      } catch (error) {
        console.warn("[NemoRunner] Error while fetching resource", {
          resource,
          error,
        });
        throw new Error(
          `Request for resource \`${resource}\` failed due to a network error (e.g. a DNS/TLS error or missing CORS headers).`,
        );
      }
    }

    console.info("[NemoRunner] Reasoning", resourceBlobs);

    const initializationTimer = new Timer("initializationTimer");
    this.engine = new NemoEngine(this.program, resourceBlobs);
    const initializationDuration = initializationTimer.getDuration();

    const reasoningTimer = new Timer("reason");
    this.engine.reason();

    return {
      initializationDuration,
      reasoningDuration: reasoningTimer.getDuration(),
    };
  }

  public async getCounts() {
    const outputPredicateCounts = Object.fromEntries(
      await Promise.all(
        this.program
          .getOutputPredicates()
          .map(async (predicate) => [
            predicate,
            await this.engine.countFactsOfPredicate(predicate),
          ]),
      ),
    );
    return {
      factsOfDerivedPredicates: this.engine.countFactsOfDerivedPredicates(),
      outputPredicates: outputPredicateCounts,
    };
  }

  public async initializeResultsIterable(predicate: string): Promise<number> {
    const id = this.nextResultIterableID;
    this.nextResultIterableID++;

    this.resultsIterables[id] = new NemoResultsIterable(
      this.engine.getResult(predicate),
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
    this.engine.savePredicate(predicate, syncAccessHandle);
  }

  public async parseAndTraceFact(fact: string) {
    return this.engine.parseAndTraceFact(fact);
  }

  public async getNemoVersion() {
    return getNemoVersion();
  }

  public async markDefaultExports() {
    return this.program.markDefaultExports();
  }

  /*
   * This additionally gets handled by `NemoWorker` to terminate the web worker
   */
  public async stop() {
    console.info("[NemoRunner] Stopping runner");
  }
}
