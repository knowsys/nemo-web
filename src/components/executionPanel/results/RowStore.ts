import { NemoWorker } from "../../../nemoWorker/NemoWorker";

export class RowStore {
  private iterableID: number | undefined;
  private rows: any[][] = [];
  private currentlyLoadingUpToIndex = 0;
  private shouldLoadUpToIndex = 0;
  private waitingPromises: {
    resolve: () => void;
    reject: (error: any) => void;
  }[] = [];

  public constructor(
    private predicate: string,
    private nemoWorker: NemoWorker,
    private onRowsChange: (rows: any[][]) => void,
  ) {}

  public async initialize() {
    this.iterableID = await this.nemoWorker.initializeResultsIterable(
      this.predicate,
    );
  }

  public async delete() {
    if (this.iterableID === undefined) {
      return;
    }
    const oldIterableID = this.iterableID;
    this.iterableID = undefined;
    await this.nemoWorker.deleteResultsIterable(oldIterableID);
  }

  private async continueLoading() {
    if (this.iterableID === undefined) {
      throw new Error("Row store is uninitialized, as iterableID is undefined");
    }

    this.currentlyLoadingUpToIndex = this.shouldLoadUpToIndex;
    // Start loading next rows
    const newRows = await this.nemoWorker.loadNextRowsOfResultsIterable(
      this.iterableID,
      this.shouldLoadUpToIndex - this.rows.length,
    );
    this.rows = this.rows.concat(newRows);
    this.onRowsChange(this.rows);

    if (this.shouldLoadUpToIndex !== this.currentlyLoadingUpToIndex) {
      this.continueLoading();
    } else {
      const oldWaitingPromises = this.waitingPromises;
      this.waitingPromises = [];

      for (const promise of oldWaitingPromises) {
        promise.resolve();
      }
    }
  }

  public async loadRowsUntil(index: number) {
    if (index < this.rows.length) {
      return;
    }
    const promise = new Promise<void>((resolve, reject) => {
      this.waitingPromises.push({ resolve, reject });
    });
    if (index > this.shouldLoadUpToIndex) {
      this.shouldLoadUpToIndex = index;
      // Check whether we are currently loading rows
      if (this.currentlyLoadingUpToIndex === this.rows.length) {
        this.continueLoading();
      }
    }
    return promise;
  }
}
