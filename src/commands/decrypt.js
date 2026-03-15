const crypto = await import("node:crypto");
import fs from "node:fs";
import fsPromise from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { parseArguments } from "../utils/argsParser.js";
import { resolvePath } from "./../utils/pathResolver.js";

export async function handleDecryptCommand(args, userPath) {
  const { input, output, password } = parseArguments(args.join(" "), {
    input: { type: "string" },
    output: { type: "string" },
    password: { type: "string" },
  });
  const inputPath = resolvePath(input, userPath);
  const outputPath = resolvePath(output, userPath);

  await decrypt(inputPath, outputPath, password);
}

export async function decrypt(input, output, password) {
  const fileStats = await fsPromise.stat(input);
  const fileSize = fileStats.size;

  let iv = Buffer.alloc(12);
  let salt = Buffer.alloc(16);
  let fileContent = [];
  let processedLength = 0;
  let auth = [];
  let isFirstChunk = true;

  await new Promise((resolve, reject) => {
    const rs = fs.createReadStream(input);
    rs.on("data", (chunk) => {
      if (isFirstChunk) {
        salt = chunk.slice(0, 16);
        iv = chunk.slice(16, 28);
        processedLength += 28;
      }
      let chunkLength = isFirstChunk ? chunk.length - 28 : chunk.length;
      let startPosition = isFirstChunk ? 28 : 0;
      let authStart = isFirstChunk
        ? fileSize - 16
        : fileSize - 16 - processedLength;
      if (processedLength + chunkLength <= fileSize - 16) {
        fileContent.push(chunk.slice(startPosition));
      } else {
        if (
          auth.length === 0 &&
          processedLength + chunkLength > fileSize - 16
        ) {
          fileContent.push(chunk.slice(startPosition, authStart));
          auth.push(chunk.slice(authStart));
        } else if (auth.length > 0 && processedLength >= fileSize - 16) {
          auth.push(chunk.slice(0));
        }
      }

      processedLength += chunkLength;

      isFirstChunk = false;
    });
    rs.on("end", () => {
      resolve();
    });
  });

  const ws = fs.createWriteStream(output);
  const readFileContent = Readable.from(Buffer.concat(fileContent));

  const key = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(key);
      }
    });
  });
  const decipher = crypto.createDecipheriv("AES-256-GCM", key, iv);
  decipher.setAuthTag(Buffer.concat(auth));

  await pipeline(readFileContent, decipher, ws);
  console.log("Decryption completed");
}
