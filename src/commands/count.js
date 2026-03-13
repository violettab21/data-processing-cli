import fs from "node:fs";
import { createInterface } from "node:readline";

export const getCount = async (input) => {
  let lines = 0;
  let words = 0;
  let characters = 0;

  await new Promise((resolve, reject) => {
    const rs = fs.createReadStream(input);
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
  });

  return {
    lines,
    words,
    characters,
  };
};

export const printCount = (countData) => {
  const { lines, words, characters } = countData;
  console.log(`Word Count:\n`);
  console.log(`Lines: ${lines}`);
  console.log(`Words: ${words}`);
  console.log(`Characters: ${characters}`);
};
