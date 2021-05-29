/**
 * Common utilities
 */

import cluster from "cluster";

export const format = (s: string, ...arr: string[]) =>
  s.replace(/{(\d+)}/g, (match, number) => (typeof arr[number] !== "undefined" ? arr[number] : match));

export const log = (msg: string, ...f: string[]) => {
  if (f?.length) msg = format(msg, ...f);
  const date = new Date();
  const obj = date.toString().split(" ");
  return console.log(
    `[${obj[4]}.${`00${date.getMilliseconds()}`.slice(-3)}${obj[5].slice(-5)}]`,
    `#${cluster.isMaster ? 0 : cluster.worker.id}`,
    msg.toString().replace("$pid", process.pid.toString()),
  );
};
