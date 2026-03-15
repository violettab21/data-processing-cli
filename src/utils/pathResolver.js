import path from "node:path";

export const resolvePath = (newPath, userPath) => {
  try {
    const resultPath = path.isAbsolute(newPath)
      ? newPath
      : path.resolve(userPath, newPath);
    return resultPath;
  } catch (err) {
    throw err;
  }
};
