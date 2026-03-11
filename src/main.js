import * as readline from "node:readline/promises";
import os from "node:os";
import { getUpPath, getCdPath } from "./navigation.js";

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
