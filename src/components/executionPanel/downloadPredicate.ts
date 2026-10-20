import { downloadBlob } from "../../downloadBlob";
import { NemoWorker } from "../../nemoWorker/NemoWorker";

export async function downloadPredicate(
  nemoWorker: NemoWorker,
  predicate: string,
) {
  const suggestedFileName = `results-${predicate.replace(
    /[^a-z0-9\-_]+/gi,
    "",
  )}.csv`;

  const bytes = await nemoWorker.exportPredicate(predicate);
  downloadBlob(suggestedFileName, new Blob([bytes], { type: "text/csv" }));
}
