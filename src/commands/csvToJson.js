import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { parseArguments } from "../utils/argsParser.js";
import { resolvePath } from "./../utils/pathResolver.js";

export const handleCsvToJSONCommand = async (args, userPath) => {
  const { input, output } = parseArguments(args.join(" "), {
    input: { type: "string" },
    output: { type: "string" },
  });
  const inputPath = resolvePath(input, userPath);

  const outputPath = resolvePath(output, userPath);

  await csvToJson(inputPath, outputPath);
};

export const csvToJson = async (input, output) => {
  const rs = fs.createReadStream(input);
  const ws = fs.createWriteStream(output);
  let linesStorage = [];
  let headers = [];
  let isFirstObject = true;
  const ts = new Transform({
    transform(chunk, encoding, callback) {
      const chunkLines = chunk.toString().split("\n");
      let chunkData;
      if (linesStorage.length === 0) {
        this.push("[");
        headers.push(...chunkLines[0].split(","));
        headers = headers.map((el) => el.trim());
        linesStorage = chunkLines.slice(1);
        chunkData = chunkLines.slice(1);
      } else {
        chunkData = chunkLines.slice(0);
      }

      chunkData.map((el) => el.trim());
      chunkData.forEach((el) => {
        if (!isFirstObject) {
          this.push(",");
        }

        this.push(
          JSON.stringify(
            el.split(",").reduce((acc, column, i) => {
              return {
                ...acc,
                [headers[i]]: column.trim(),
              };
            }, {}),
            null,
            2,
          ),
        );
        isFirstObject = false;
      });

      callback();
    },
    flush(callback) {
      this.push("]");
      callback();
    },
  });
  await pipeline(rs, ts, ws);
  console.log("Transformation completed");
};
