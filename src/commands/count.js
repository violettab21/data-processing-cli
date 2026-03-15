import fs from "node:fs";
import { createInterface } from "node:readline";
import { parseArguments } from "../utils/argsParser.js";
import { resolvePath } from "./../utils/pathResolver.js";

export const countCommand = async (args, userPath) => {
  const { input } = parseArguments(args.join(" "), {
    input: { type: "string" },
  });
  const inputPath = resolvePath(input, userPath);

  const countData = await getCount(inputPath);
  printCount(countData);
};

export const getCount = async (input) => {
  let lines = 0;
  let words = 0;
  let characters = 0;

  await new Promise((resolve, reject) => {
    const rs = fs.createReadStream(input);
    rs.on("error", reject);
    const reg = /\S+/g;
    const rl = createInterface({
      input: rs,
      crlfDelay: Infinity,
    });
    rs.on("end", () => {
      rl.close();
    });
    rl.on("line", (line) => {
      lines++;

      const chunkWords = line.match(reg);
      if (chunkWords) {
        words += chunkWords.length;
      }
      characters += line.toString().length;
    });

    rl.on("close", () => {
      resolve();
    });
    rl.on("error", reject);
  });
  return {
    lines,
    words,
    characters,
  };
};

export const printCount = (countData) => {
  const { lines, words, characters } = countData;
  console.log(`Word Count:`);
  console.log(`Lines: ${lines}`);
  console.log(`Words: ${words}`);
  console.log(`Characters: ${characters}`);
};
