import * as readline from "node:readline/promises";
import os from "node:os";
import { getUpPath } from "./navigation.js";

let userPath = os.homedir();

const showCurrentPath = (path) => {
  console.log(`You are currently in ${path}`);
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

  rl.on("line", (input) => {
    switch (input) {
      case "up": {
        const updatedPath = getUpPath(userPath);
        userPath = updatedPath;
        showCurrentPath(userPath);
        rl.prompt();
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
