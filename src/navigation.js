import fs from "node:fs/promises";
import path from "node:path";

export const getUpPath = (currentPath) => {
  const pathParts = currentPath.split(`\\`).filter((el) => el.length > 0);
  pathParts.pop();

  if (pathParts.length === 0) {
    return currentPath;
  }

  return pathParts.length > 1 ? pathParts.join("\\") : pathParts[0] + "\\";
};

export const getCdPath = async (currentPath, newPath) => {
  try {
    const preparedPath = path.isAbsolute(newPath)
      ? newPath
      : path.resolve(currentPath, newPath);
    const resource = await fs.stat(preparedPath, { throwIfNoEntry: true });

    if (!resource.isDirectory()) {
      throw new Error("Path is not a directory");
    }
    return preparedPath;
  } catch (err) {
    throw err;
  }
};

export const getListOfFiles = async (currentPath) => {
  try {
    const files = await fs.readdir(currentPath);
    const folderFiles = await Promise.all(
      files.map(async (el) => {
        const fileDetails = await fs.stat(path.resolve(currentPath, el));
        const name = path.basename(el);
        const type = fileDetails.isDirectory()
          ? "folder"
          : fileDetails.isFile()
            ? "file"
            : null;
        return {
          name,
          type,
        };
      }),
    );

    return folderFiles
      .filter((el) => el.type !== null)
      .sort((a, b) => {
        if (a.type !== b.type) {
          return b.type.localeCompare(a.type);
        }
        return a.name.localeCompare(b.name);
      });
  } catch (err) {
    throw err;
  }
};

export const printFileList = (files) => {
  files.forEach((file) => {
    console.log(`${file.name} [${file.type}]`);
  });
};
