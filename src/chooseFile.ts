export function chooseFile(
  callback: (fileList: FileList) => void,
  multiple: boolean = false,
) {
  const inputElement = document.createElement("input");
  inputElement.type = "file";
  inputElement.multiple = multiple;
  inputElement.click();

  inputElement.addEventListener("change", () => {
    if (inputElement.files === null) {
      return;
    }
    callback(inputElement.files);
  });
}
