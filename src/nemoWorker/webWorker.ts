import { NemoRunner } from "./NemoRunner";

console.info("[webWorker.ts] Starting WebWorker");

const nemoRunner = new NemoRunner();

onmessage = async (event) => {
  const { taskID, functionName, args } = event.data as {
    taskID: number;
    functionName: string;
    args: any[];
  };

  console.debug("[webWorker.ts] Running function inside worker", {
    taskID,
    functionName,
    args,
  });

  let value;
  let isError = false;

  try {
    value = await (nemoRunner as any)[functionName](...args);
  } catch (error: any) {
    isError = true;
    console.error("[webWorker.ts] Error in web worker:", error);

    value = error.toString();
  }

  console.info("[webWorker.ts] Returning from worker", {
    taskID,
    functionName,
    isError,
    value,
  });

  postMessage({
    taskID,
    isError,
    value,
  });
};

// Signal that the web worker initialization is finished
postMessage({
  taskID: 0,
  isError: false,
  value: undefined,
});
