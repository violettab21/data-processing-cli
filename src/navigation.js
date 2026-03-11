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
      throw new Error("Operation failed");
    }
    return preparedPath;
  } catch (err) {
    throw err;
  }
};
