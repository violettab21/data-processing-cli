import * as readline from "node:readline/promises";
import os from "node:os";
import {
  getUpPath,
  getCdPath,
  getListOfFiles,
  printFileList,
} from "./navigation.js";

import { csvToJson } from "./commands/csvToJson.js";
import { getCount, printCount } from "./commands/count.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import path from "node:path";
import { resolvePath } from "./utils/pathResolver.js";

let userPath = os.homedir();

const showCurrentPath = (path) => {
  console.log(`You are currently in ${path}`);
};

const parseArguments = (args, params) => {
  const values = {};

  for (let [key, value] of Object.entries(params)) {
    console.log(key);
    console.log(value);
    if (value.type === "string") {
      console.log("heres");
      let regexp = new RegExp(`--${key}\\b(.*?)(?=--\\w+|$)`);
      let value = args.match(regexp);
      console.log(value);
      if (value && value[1] && value[1].trim()) {
        values[key] = value[1].trim();
      } else {
        throw new Error("Invalid arguments");
      }
    } else if (value.type === "boolean") {
      let regexp = new RegExp(`--${key}\\b(.*?)`);

      let value = args.match(regexp);
      console.log(value);
      if (value) {
        values[key] = true;
      } else {
        values[key] = false;
      }
    } else {
      throw new Error("Invalid arguments");
    }
  }
  return values;
};

const main = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ">",
  });
  console.log("Welcome to Data Processing CLI!");
  showCurrentPath(userPath);

  rl.prompt();

  rl.on("line", async (input) => {
    const [command, ...args] = input.split(" ");
    console.log(args);
    switch (command) {
      case "up": {
        const updatedPath = getUpPath(userPath);
        userPath = updatedPath;
        showCurrentPath(userPath);
        rl.prompt();
        break;
      }

      case "cd": {
        try {
          const newPath = await getCdPath(userPath, args.join(" "));
          userPath = newPath;
        } catch (err) {
          console.log("Operation failed");
        } finally {
          showCurrentPath(userPath);
          rl.prompt();
        }

        break;
      }

      case "ls": {
        try {
          const content = await getListOfFiles(userPath);
          printFileList(content);
        } catch (err) {
          console.log(err);
          console.log("Operation failed");
        } finally {
          showCurrentPath(userPath);
          rl.prompt();
        }
        break;
      }
      case "csv-to-json": {
        try {
          const { input, output } = parseArguments(args.join(" "), {
            input: { type: "string" },
            output: { type: "string" },
          });
          const inputPath = resolvePath(input, userPath);

          const outputPath = resolvePath(output, userPath);

          await csvToJson(inputPath, outputPath);
        } catch (err) {
          console.log(err);
          console.log("Operation failed");
        } finally {
          showCurrentPath(userPath);
          rl.prompt();
        }
        break;
      }
      case "json-to-csv": {
        try {
          const { input, output } = parseArguments(args.join(" "), {
            input: { type: "string" },
            output: { type: "string" },
          });
          const inputPath = resolvePath(input, userPath);

          const outputPath = resolvePath(output, userPath);

          await jsonToCsv(inputPath, outputPath);
        } catch (err) {
          console.log(err);
          console.log("Operation failed");
        } finally {
          showCurrentPath(userPath);
          rl.prompt();
        }
        break;
      }
      case "count": {
        try {
          const { input } = parseArguments(args.join(" "), {
            input: { type: "string" },
          });
          const inputPath = resolvePath(input, userPath);

          const countData = await getCount(inputPath);
          printCount(countData);
        } catch (err) {
          console.log(err);
          console.log("Operation failed");
        } finally {
          showCurrentPath(userPath);
          rl.prompt();
        }
        break;
      }
      case ".exit": {
        rl.close();
        break;
      }
      default: {
        console.log("Invalid input");
        rl.prompt();
      }
    }
  });

  rl.on("close", () => {
    console.log("Thank you for using Data Processing CLI!");
  });
};

await main();
