export function downloadBlob(fileName: string, blob: Blob) {
  const anchorElement = document.createElement("a");
  anchorElement.href = window.URL.createObjectURL(blob);
  anchorElement.download = fileName;
  anchorElement.click();
}
