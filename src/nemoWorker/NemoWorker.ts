import { NemoRunner } from "./NemoRunner";

let doNotTryWebWorkersAgain = false;

/**
 * Creates a {@link NemoWorker} using a web worker, if possible.
 *
 * If web workers are supported, implements a TypeScript-compatible remote procedure call, see {@link WebWorkerWrapper}.
 * If web workers are unsupported, a {@link NemoRunner} is returned directly.
 *
 * @param onStatusChange Function called when the status of the web worker changes from idle to working or the other way around. The web worker is seen as active whenever it has at least one pending promise. This function is never called if web workers are unavailable.
 */
export async function createNemoWorker(onStatusChange: StatusChangeHandler) {
  if (!doNotTryWebWorkersAgain) {
    // Try creating web worker
    try {
      const webWorkerWrapper = new WebWorkerWrapper(onStatusChange);
      await webWorkerWrapper.initialize();

      return new Proxy(webWorkerWrapper, proxyHandler) as unknown as NemoWorker;
    } catch (error) {
      // Fallback without web workers
      console.error(
        "[NemoWorker] Loading web worker failed, using Nemo without web workers. This may results in the UI becoming unresponsive.",
        error,
      );
      doNotTryWebWorkersAgain = true;
    }
  }

  return new NemoRunner();
}

const proxyHandler: ProxyHandler<WebWorkerWrapper> = {
  get(target, prop) {
    if (prop in target) {
      return (target as any)[prop];
    }

    if (typeof prop !== "string") {
      throw new Error();
    }

    if (prop === "then" || prop === "catch") {
      return undefined;
    }

    if (prop === "stop") {
      // Additionally, terminate web worker
      target.stop();
    }

    return (...args: any[]) => target.runFunction(prop, args);
  },
};

export type NemoWorker = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof NemoRunner]: NemoRunner[K] extends Function
    ? ReturnType<NemoRunner[K]> extends Promise<any>
      ? NemoRunner[K]
      : Promise<ReturnType<NemoRunner[K]>>
    : undefined;
};

export type NemoProgramInfo = Awaited<ReturnType<NemoWorker["parseProgram"]>>;

export type StatusChangeHandler = (active: boolean) => void;

/**
 * Wraps a {@link NemoRunner} by forwarding function calls to a web worker instead of executing them directly.
 */
class WebWorkerWrapper {
  private worker: Worker | undefined = undefined;

  // Task ID 0 is reserved for initialization
  private pendingPromises: {
    [taskID: number]: {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
    };
  } = {};
  private nextTaskID = 1;

  // Last status provided to the `onStatusChange` function
  private lastStatus = false;

  public constructor(private onStatusChange: StatusChangeHandler) {}

  public initialize() {
    if (this.worker !== undefined) {
      throw new Error();
    }

    const promise = this.createPromise(0);

    this.worker = new Worker(new URL("./webWorker.ts", import.meta.url), {
      type: "module",
    });

    const handleError = (event: any) => {
      if (this.pendingPromises[0] !== undefined) {
        const pendingPromise = this.pendingPromises[0];
        delete this.pendingPromises[0];
        this.checkIfStatusChanged();
        pendingPromise.reject(event);
      } else {
        console.error("[WebWorkerWrapper] Web worker error", this, event);
      }
    };

    this.worker.addEventListener("messageerror", handleError);
    this.worker.addEventListener("error", handleError);

    this.worker.addEventListener("message", (event) => {
      const { taskID, value, isError } = event.data;

      const pendingPromise = this.pendingPromises[taskID];
      delete this.pendingPromises[taskID];
      this.checkIfStatusChanged();
      if (isError) {
        pendingPromise.reject(value);
      } else {
        pendingPromise.resolve(value);
      }
    });

    // Web worker should instantly resolve the promise after initialization
    return promise;
  }

  private createPromise(taskID: number) {
    return new Promise((resolve, reject) => {
      this.pendingPromises[taskID] = { resolve, reject };
      this.checkIfStatusChanged();
    });
  }

  public runFunction(functionName: string, args: any[]) {
    if (this.worker === undefined) {
      throw new Error();
    }

    const taskID = this.nextTaskID++;
    console.debug("[WebWorkerWrapper] Running worker function", {
      taskID,
      functionName,
      args,
    });
    this.worker.postMessage({ taskID, functionName, args });

    return this.createPromise(taskID);
  }

  private checkIfStatusChanged() {
    const currentStatus = Object.keys(this.pendingPromises).length !== 0;
    if (currentStatus !== this.lastStatus) {
      this.lastStatus = currentStatus;
      this.onStatusChange(currentStatus);
    }
  }

  public stop() {
    if (this.worker === undefined) {
      throw new Error();
    }

    const oldWorker = this.worker;
    const oldPendingPromises = this.pendingPromises;

    this.worker = undefined;
    this.pendingPromises = {};
    this.checkIfStatusChanged();

    for (const { reject } of Object.values(oldPendingPromises)) {
      reject(new Error("Task failed because worker got stopped"));
    }

    console.info("[WebWorkerWrapper] Terminating web worker");
    oldWorker.terminate();
  }
}
