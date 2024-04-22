import fs from "node:fs";

export async function isFileExists(filePath: string) {
  let isExists: boolean;

  try {
    await fs.promises.access(filePath);
    isExists = true;
  } catch (err) {
    isExists = false;
  }

  return isExists;
}
