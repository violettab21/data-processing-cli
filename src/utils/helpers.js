export function getNewSum(key, map, increment) {
  return map.has(key) ? map.get(key) + increment : increment;
}

export function showCurrentPath(path) {
  console.log(`You are currently in ${path}`);
}
