/**
 * Cluster common utilities
 */

import { isMaster, worker } from "cluster";

import { log as _log } from "../libutils";

export const log = (msg: string, ...f: string[]) => {
  if (typeof msg === "object") msg = JSON.stringify(msg);
  _log(`#${isMaster ? 0 : worker.id} ${msg.toString().replace("$pid", process.pid.toString())}`, ...f);
};
