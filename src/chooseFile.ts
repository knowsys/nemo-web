export function chooseFile(callback: (fileList: FileList) => void) {
  const inputElement = document.createElement("input");
  inputElement.type = "file";
  inputElement.click();

  inputElement.addEventListener("change", () => {
    if (inputElement.files === null) {
      return;
    }
    callback(inputElement.files);
  });
}
