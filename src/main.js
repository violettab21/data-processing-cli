import * as readline from "node:readline/promises";
import os from "node:os";

let userPath = os.homedir();

const main = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ">",
  });
  console.log("Welcome to Data Processing CLI!");
  console.log(`You are currently in ${userPath}`);

  rl.prompt();

  rl.on("line", (input) => {
    switch (input) {
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
