export function getNewSum(key, map, increment) {
  return map.has(key) ? map.get(key) + increment : increment;
}
