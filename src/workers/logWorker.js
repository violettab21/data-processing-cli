import { parentPort, workerData } from "node:worker_threads";
import { getNewSum } from "./../utils/helpers.js";

const generateLogReport = (data) => {
  const total = data.length;
  const levelMap = new Map();
  const statusCodeMap = new Map();
  const pathMap = new Map();
  let responseTimeSum = 0;

  data
    .map((line) => line.split(" "))
    .forEach(([, level, , statusCode, responseTime, , path]) => {
      responseTimeSum += +responseTime;

      levelMap.set(level, getNewSum(level, levelMap, 1));
      statusCodeMap.set(
        `${statusCode[0]}XX`,
        getNewSum(`${statusCode[0]}XX`, statusCodeMap, 1),
      );
      pathMap.set(path, getNewSum(path, pathMap, 1));
    });

  const levelMapObj = Object.fromEntries(levelMap.entries());
  const statusCodeObj = Object.fromEntries(statusCodeMap.entries());
  const pathMapObj = Object.fromEntries(pathMap.entries());

  return {
    total: total,
    levels: levelMapObj,
    status: statusCodeObj,
    path: pathMapObj,
    responseTimeSum: responseTimeSum,
  };
};

parentPort.postMessage(generateLogReport(workerData));
