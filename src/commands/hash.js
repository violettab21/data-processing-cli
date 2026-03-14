import fs from "node:fs";
const { createHash } = await import("node:crypto");
import { pipeline } from "node:stream/promises";
import path from "node:path";

export const hashFile = async (input, algorithm, save) => {
  const rs = fs.createReadStream(input);
  const hash = createHash(algorithm);

  await pipeline(rs, hash);

  const resultHash = hash.digest("hex");
  if (save) {
    await new Promise((resolve, reject) => {
      const ws = fs.createWriteStream(
        path.resolve(
          path.dirname(input),
          `${path.basename(input)}.${algorithm}`,
        ),
      );
      ws.write(resultHash);
      ws.close();
      ws.on("close", () => {
        resolve();
      });
      ws.on("error", reject);
    });
  }
  return resultHash;
};

export const printHash = (hash, algorithm) => {
  console.log(`Result:\n`);
  console.log(`${algorithm}: ${hash}`);
};
