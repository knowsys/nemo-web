import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const assetsFolder = join("dist", "assets");

const fileNames = (await readdir(assetsFolder)).filter(
  (n) => n.startsWith("webWorker") && n.endsWith(".js"),
);

for (const fileName of fileNames) {
  const path = join(assetsFolder, fileName);

  console.info(`Patching file "${path}"`);

  let text = await readFile(path, {
    encoding: "utf8",
  });

  text = text.replace(
    /new URL\("(nemo_wasm_bg-[a-zA-Z0-9]+\.wasm)",import\.meta\.url\)\.href/g,
    'new URL("$1",self.location).href',
  );

  await writeFile(path, text, {
    encoding: "utf8",
  });
}
