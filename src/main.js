import * as readline from "node:readline/promises";
import os from "node:os";
import {
  getUpPath,
  getCdPath,
  getListOfFiles,
  printFileList,
} from "./navigation.js";

import { handleCsvToJSONCommand } from "./commands/csvToJson.js";
import { countCommand } from "./commands/count.js";
import { handleJsonToCsvCommand } from "./commands/jsonToCsv.js";
import { handleHashCommand } from "./commands/hash.js";
import { handleHashCompareCommand } from "./commands/hashCompare.js";
import { handleLogStatsCommand } from "./commands/logStats.js";
import { handleEncryptCommand } from "./commands/encrypt.js";
import { handleDecryptCommand } from "./commands/decrypt.js";
import { showCurrentPath } from "./utils/helpers.js";

let userPath = os.homedir();

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
    handleInput(input, rl);
  });

  rl.on("close", () => {
    console.log("Thank you for using Data Processing CLI!");
  });
};

await main();

async function handleInput(input, rl) {
  const [command, ...args] = input.split(" ");

  switch (command) {
    case "up": {
      const updatedPath = getUpPath(userPath);
      userPath = updatedPath;
      showCurrentPath(userPath);
      rl.prompt();
      break;
    }

    case "cd": {
      await commandHandler(async () => {
        const newPath = await getCdPath(userPath, args.join(" "));
        userPath = newPath;
      }, rl);
      break;
    }

    case "ls": {
      await commandHandler(async () => {
        const content = await getListOfFiles(userPath);
        printFileList(content);
      }, rl);
      break;
    }
    case "csv-to-json": {
      await commandHandler(async () => {
        await handleCsvToJSONCommand(args, userPath);
      }, rl);
      break;
    }
    case "json-to-csv": {
      await commandHandler(async () => {
        await handleJsonToCsvCommand(args, userPath);
      }, rl);
      break;
    }
    case "count": {
      await commandHandler(async () => {
        await countCommand(args, userPath);
      }, rl);
      break;
    }
    case "hash": {
      await commandHandler(async () => {
        await handleHashCommand(args, userPath);
      }, rl);
      break;
    }
    case "hash-compare": {
      await commandHandler(async () => {
        await handleHashCompareCommand(args, userPath);
      }, rl);
      break;
    }

    case "log-stats": {
      await commandHandler(async () => {
        await handleLogStatsCommand(args, userPath);
      }, rl);
      break;
    }

    case "encrypt": {
      await commandHandler(async () => {
        await handleEncryptCommand(args, userPath);
      }, rl);
      break;
    }
    case "decrypt": {
      await commandHandler(async () => {
        await handleDecryptCommand(args, userPath);
      }, rl);
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
}

async function commandHandler(callback, rl) {
  try {
    await callback();
  } catch (err) {
    if (err.message === "Invalid arguments") {
      console.log("Invalid arguments");
    } else {
      console.log("Operation Failed");
    }
  } finally {
    showCurrentPath(userPath);
    rl.prompt();
  }
}
