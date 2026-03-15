export const parseArguments = (args, params) => {
  const values = {};

  for (let [key, value] of Object.entries(params)) {
    if (value.type === "string") {
      let regexp = new RegExp(`--${key}\\b(.*?)(?=--\\w+|$)`);
      let found = args.match(regexp);

      if (found && found[1] && found[1].trim()) {
        let foundValue = found[1].trim();
        if (foundValue.startsWith(`"`) && foundValue.endsWith(`"`)) {
          foundValue = foundValue.slice(1, foundValue.length - 1);
        }
        values[key] = foundValue;
      } else {
        if (value.default) {
          values[key] = value.default;
        } else {
          throw new Error("Invalid input");
        }
      }
    } else if (value.type === "boolean") {
      let regexp = new RegExp(`--${key}\\b(.*?)`);

      let found = args.match(regexp);

      if (found) {
        values[key] = true;
      } else {
        values[key] = false;
      }
    } else {
      throw new Error("Invalid input");
    }
  }
  return values;
};
