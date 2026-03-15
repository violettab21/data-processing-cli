import fs from "node:fs";
const { createHash } = await import("node:crypto");
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { parseArguments } from "../utils/argsParser.js";
import { resolvePath } from "./../utils/pathResolver.js";

export const handleHashCommand = async (args, userPath) => {
  const { input, algorithm, save } = parseArguments(args.join(" "), {
    input: { type: "string" },
    algorithm: { type: "string", default: "sha256" },
    save: { type: "boolean" },
  });
  const inputPath = resolvePath(input, userPath);
  if (algorithm !== "sha256" && algorithm !== "md5" && algorithm !== "sha512") {
    throw new Error("Unsupported algorithm");
  }

  const hashData = await hashFile(inputPath, algorithm, save);
  printHash(hashData, algorithm);
};

export const hashFile = async (input, algorithm, save) => {
  const rs = fs.createReadStream(input);
  const hash = createHash(algorithm);

  await pipeline(rs, hash);

  const resultHash = hash.digest("hex");
  if (save) {
    const savePath = path.resolve(
      path.dirname(input),
      `${path.basename(input)}.${algorithm}`,
    );
    await saveHash(savePath, resultHash, algorithm);
    console.log(`Hash is saved to ${savePath}`);
  }
  return resultHash;
};

export const saveHash = async (path, hash, algorithm) => {
  const dataToSave = `${algorithm}: ${hash}`;
  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(path);
    ws.write(dataToSave);
    ws.close();
    ws.on("close", () => {
      resolve();
    });
    ws.on("error", reject);
  });
};

export const printHash = (hash, algorithm) => {
  console.log(`Result:`);
  console.log(`${algorithm}: ${hash}`);
};
