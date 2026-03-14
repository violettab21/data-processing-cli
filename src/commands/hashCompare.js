import fs from "node:fs";
const { createHash } = await import("node:crypto");
import { pipeline } from "node:stream/promises";

export const hashCompare = async (input, savedHash, algorithm) => {
  const rs = fs.createReadStream(input);

  const existingHashData = await new Promise((resolve, reject) => {
    let existingHash = "";
    const existingHashStream = fs.createReadStream(savedHash);

    existingHashStream.on("data", (chunk) => {
      existingHash += chunk;
    });

    existingHashStream.on("end", () => {
      resolve(existingHash);
    });
    existingHashStream.on("error", reject);
  });

  const hash = createHash(algorithm);

  await pipeline(rs, hash);

  const resultHash = hash.digest("hex");

  if (
    resultHash.trim().toLowerCase() === existingHashData.trim().toLowerCase()
  ) {
    console.log("OK");
  } else {
    console.log("MISMATCH");
  }
};
