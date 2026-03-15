import os from "node:os";
import { Worker } from "node:worker_threads";
import { createInterface } from "node:readline";
import path from "node:path";
import fs from "node:fs";
import { getNewSum } from "./../utils/helpers.js";
import { parseArguments } from "../utils/argsParser.js";
import { resolvePath } from "./../utils/pathResolver.js";

//Log can be re-generated via generate-log script

export const handleLogStatsCommand = async (args, userPath) => {
  const { input, output } = parseArguments(args.join(" "), {
    input: { type: "string" },
    output: { type: "string" },
  });
  const inputPath = resolvePath(input, userPath);
  const outputPath = resolvePath(output, userPath);

  await logStats(inputPath, outputPath);
};

export const logStats = async (input, saveDestination) => {
  const countCpu = os.cpus().length;
  const res = await readLogsFile(input);
  let workers = [];

  let linesCopy = [...res];
  for (let i = 0; i < countCpu; i++) {
    const chunkLength = Math.ceil(linesCopy.length / (countCpu - i));
    const chunk = linesCopy.slice(0, chunkLength);
    linesCopy = linesCopy.slice(chunkLength);

    workers.push(
      new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve("src/workers/logWorker.js"), {
          workerData: chunk,
        });
        worker.on("message", (value) => {
          worker.terminate();
          resolve(value);
        });

        worker.on("error", reject);
      }),
    );
  }
  const results = await Promise.all(workers);

  await writeFile(
    saveDestination,
    JSON.stringify(mergeAggregations(results), null, 2),
  );
  console.log(`Result file path ${saveDestination}`);
};

function mergeAggregations(aggregations) {
  let totalSum = 0;
  let responseTimeTotalSum = 0;
  const levelsMap = new Map();
  const codesMap = new Map();
  const pathsMap = new Map();

  aggregations.forEach(({ total, levels, status, path, responseTimeSum }) => {
    totalSum += total;
    responseTimeTotalSum += responseTimeSum;
    for (let [level, sum] of Object.entries(levels)) {
      levelsMap.set(level, getNewSum(level, levelsMap, sum));
    }

    for (let [statusCode, statusSum] of Object.entries(status)) {
      codesMap.set(statusCode, getNewSum(statusCode, codesMap, statusSum));
    }

    for (let [pathKey, pathSum] of Object.entries(path)) {
      pathsMap.set(pathKey, getNewSum(pathKey, pathsMap, pathSum));
    }
  });
  const pathTransformed = [];

  pathsMap.forEach((value, key) => {
    pathTransformed.push({
      path: key,
      count: value,
    });
  });

  return {
    total: totalSum,
    levels: Object.fromEntries(levelsMap.entries()),
    status: Object.fromEntries(codesMap.entries()),
    topPath: pathTransformed.sort((a, b) => b.count - a.count),
    avgResponseTimeMs: (responseTimeTotalSum / totalSum).toFixed(2),
  };
}

async function readLogsFile(input) {
  const res = await new Promise((resolve, reject) => {
    const lines = [];
    const rs = fs.createReadStream(input);
    const rl = createInterface({
      input: rs,
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      lines.push(line);
    });

    rs.on("end", () => {
      rl.close();
    });

    rs.on("error", reject);

    rl.on("close", () => {
      resolve(lines);
    });

    rl.on("error", reject);
  });

  return res;
}

function writeFile(destination, content) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(destination);
    ws.write(content);
    ws.close();
    ws.on("close", () => {
      resolve();
    });
    ws.on("error", reject);
  });
}
