import fs from "node:fs";
const { createHash } = await import("node:crypto");
import { pipeline } from "node:stream/promises";
import { parseArguments } from "../utils/argsParser.js";
import { resolvePath } from "./../utils/pathResolver.js";

// It's assumed that file to compare with will store hash in format from hash task
// sha256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
// For cross check use files created from task "hash"

export const handleHashCompareCommand = async (args, userPath) => {
  const { input, algorithm, hash } = parseArguments(args.join(" "), {
    input: { type: "string" },
    algorithm: { type: "string", default: "sha256" },
    hash: { type: "string" },
  });
  if (algorithm !== "sha256" && algorithm !== "md5" && algorithm !== "sha512") {
    throw new Error("Unsupported algorithm");
  }
  const inputPath = resolvePath(input, userPath);
  const hashPath = resolvePath(hash, userPath);

  await hashCompare(inputPath, hashPath, algorithm);
};

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
  const existingHashValue = existingHashData.split(":")[1];
  if (
    resultHash.trim().toLowerCase() === existingHashValue.trim().toLowerCase()
  ) {
    console.log("OK");
  } else {
    console.log("MISMATCH");
  }
};
