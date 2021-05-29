/**
 * Cluster common utilities
 */

import cluster from "cluster";
import { log as globalLog } from "../GlobalUtils";

export const log = (msg: string, ...f: string[]) => {
  if (msg.toString() === "[object Object]") msg = JSON.stringify(msg);
  globalLog(`#${cluster.isMaster ? 0 : cluster.worker.id} ${msg.toString().replace("$pid", process.pid.toString())}`, ...f);
};
