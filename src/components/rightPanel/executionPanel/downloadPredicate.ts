import { downloadBlob } from "../../../downloadBlob";
import { NemoWorker } from "../../../nemoWorker/NemoWorker";

export async function cleanUpStorage() {
  if (navigator.storage !== undefined) {
    const directoryHandle = await navigator.storage.getDirectory();

    for await (const [entryName, _] of directoryHandle.entries()) {
      if (entryName.startsWith("tmp-")) {
        try {
          await directoryHandle.removeEntry(entryName);
          // eslint-disable-next-line no-empty
        } catch (error) {}
      }
    }
  }
}

export async function downloadPredicate(
  nemoWorker: NemoWorker,
  predicate: string,
) {
  const fileExtension = ".csv";
  const suggestedFileName = `results-${predicate.replace(
    /[^a-z0-9\-_]+/gi,
    "",
  )}${fileExtension}`;

  if (
    typeof navigator.storage === "object" &&
    typeof navigator.storage.getDirectory === "function"
  ) {
    const directoryHandle = await navigator.storage.getDirectory();
    const temporaryFileName = `tmp-${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )}${fileExtension}`;

    const temporaryFileHandle = await directoryHandle.getFileHandle(
      temporaryFileName,
      {
        create: true,
      },
    );
    await nemoWorker.writeResultsToFileHandle(predicate, temporaryFileHandle);

    downloadBlob(suggestedFileName, await temporaryFileHandle.getFile());

    await cleanUpStorage();
  } else {
    throw new Error(
      "This browser does not support the `navigator.storage.getDirectory` API",
    );
  }
}
