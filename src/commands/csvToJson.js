import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

export const csvToJson = async (input, output) => {
  const rs = fs.createReadStream(input);
  const ws = fs.createWriteStream(output);
  let linesStorage = [];
  let headers = [];
  let isFirstObject = true;
  const ts = new Transform({
    transform(chunk, encoding, callback) {
      console.log(chunk);
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
      console.log(chunkData);
      console.log(headers);
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
};
