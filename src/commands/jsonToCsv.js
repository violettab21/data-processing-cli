import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { parseArguments } from "../utils/argsParser.js";
import { resolvePath } from "./../utils/pathResolver.js";

export const handleJsonToCsvCommand = async (args, userPath) => {
  const { input, output } = parseArguments(args.join(" "), {
    input: { type: "string" },
    output: { type: "string" },
  });
  const inputPath = resolvePath(input, userPath);

  const outputPath = resolvePath(output, userPath);

  await jsonToCsv(inputPath, outputPath);
};

export const jsonToCsv = async (input, output) => {
  const rs = fs.createReadStream(input, "utf8");
  const ws = fs.createWriteStream(output);
  let data = "";
  const ts = new Transform({
    transform(chunk, encoding, callback) {
      data += chunk.toString();

      callback();
    },
    flush(callback) {
      this.push(data);
      callback();
    },
  });

  const transformToCSV = new Transform({
    transform(chunk, encoding, callback) {
      const arr = JSON.parse(chunk);

      if (arr.length > 0) {
        const headers = Object.keys(arr[0]).join(",") + "\n";

        this.push(headers);
        arr.forEach((obj) => {
          const line = Object.values(obj).join(",") + "\n";
          this.push(line);
        });
      }

      callback();
    },
  });
  await pipeline(rs, ts, transformToCSV, ws);
  console.log("Transformation completed");
  console.log(`Result file path ${output}`);
};
