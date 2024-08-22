// Be careful when importing assets to the public folder. Ensure you import the correct asset format for the designated folder to avoid mistakes.
// Avoid using the same name for files with different formats, as this can cause exporting errors.
// If this issue occurs, you'll need to check the index.ts file and change the export name.
// If you want to keep the same name, consider appending a number to the export name.
import fs from "node:fs";

// TODO: When we begin using different asset formats, we will need to adapt this script to read from different folders.
const folderPath = "./svgs";

const files = fs.readdirSync(folderPath);

const capitalizeFirstLetter = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const handleExportName = (fileName: string, folderPath: string) => {
  if (!fileName) return;
  const formattedFileName = fileName?.split(".");
  if (!formattedFileName[0]) return;

  const refineFileName = formattedFileName[0].split("-");
  const exportName = refineFileName
    .map((name) => capitalizeFirstLetter(name))
    .join("");
  const file = `export const ${exportName} = require('${folderPath}/${fileName}')`;
  return file;
};

const content = files
  .map((file) => handleExportName(file, folderPath))
  .join("\n");

try {
  fs.writeFileSync("./index.ts", content);
} catch (err) {
  console.error(err);
}
