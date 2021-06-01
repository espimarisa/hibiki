/**
 * WorkerThreads common utilities
 */

import { isMainThread, threadId } from "worker_threads";
import { log as globalLog } from "../libutils";

export function log(msg: string, ...f: string[]) {
  if (msg.toString() === "[object Object]") msg = JSON.stringify(msg);
  globalLog(`#${isMainThread ? 0 : threadId} ${msg.toString().replace("$pid", process.pid.toString())}`, ...f);
}
