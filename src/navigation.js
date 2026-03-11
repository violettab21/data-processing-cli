export const getUpPath = (currentPath) => {
  const pathParts = currentPath.split(`\\`).filter((el) => el.length > 0);
  pathParts.pop();

  if (pathParts.length === 0) {
    return currentPath;
  }

  return pathParts.length > 1 ? pathParts.join("\\") : pathParts[0] + "\\";
};
