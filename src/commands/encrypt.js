const crypto = await import("node:crypto");
import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { parseArguments } from "../utils/argsParser.js";
import { resolvePath } from "./../utils/pathResolver.js";

export async function handleEncryptCommand(args, userPath) {
  const { input, output, password } = parseArguments(args.join(" "), {
    input: { type: "string" },
    output: { type: "string" },
    password: { type: "string" },
  });
  const inputPath = resolvePath(input, userPath);
  const outputPath = resolvePath(output, userPath);

  await encrypt(inputPath, outputPath, password);
}

export async function encrypt(input, output, password) {
  const rs = fs.createReadStream(input);
  const ws = fs.createWriteStream(output);

  const iv = crypto.randomBytes(12);
  const salt = crypto.randomBytes(16);

  ws.write(salt);
  ws.write(iv);

  const key = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, key) => {
      if (err) {
        reject(err);
      } else {
        resolve(key);
      }
    });
  });

  const cipher = crypto.createCipheriv("AES-256-GCM", key, iv);
  await pipeline(rs, cipher, ws, { end: false });
  ws.write(cipher.getAuthTag());
  ws.end();
  console.log("Encryption completed");
}
