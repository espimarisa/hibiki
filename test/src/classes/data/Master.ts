/**
 * Master
 */

import cluster from "cluster";
import { DataTypeByIndex } from "./DataTypes";
import { IPCPacket } from "./IPCPacket";
import { PlainText } from "./Mixed/PlainText";
import { log } from "../CommonUtils";
import { IncomingIPCPacket } from "./Incoming/_IncomingIPCPacket";
// import os from "os";

const THREADS = 1;

export class Master {
  constructor() {
    log(`${this.constructor.name} starting ($pid)`);

    cluster.on("online", (worker) => {
      log(`${worker.id} just got online!`);
    });

    cluster.on("fork", (worker) => {
      log(`${worker.id} just got forked!`);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cluster.on("exit", (worker, _code, _signal) => {
      log(`worker ${worker.id} died (${worker.process.pid}). Respawning.`);
      // cluster.fork();
    });

    cluster.on("message", (worker, msg) => {
      let parsed;
      try {
        parsed = JSON.parse(msg);
      } catch (e) {
        console.log(e);
        return log(`worker ${worker.id} just sent ${msg}`);
      }
      if (parsed.$hash !== IPCPacket.hash) return log(`worker ${worker.id} sent a wrong-hashed message: ${msg}`);
      if (!DataTypeByIndex[parsed.$type]) return log(`worker ${worker.id} sent a wrong-typed message: ${msg}`);
      parsed = IPCPacket.deserialize(JSON.stringify(parsed), DataTypeByIndex[parsed.$type]);
      if (parsed instanceof IncomingIPCPacket) {
        parsed.execute(worker);
      }
      if (parsed instanceof PlainText) {
        log(`worker ${worker.id} sent a plain text message: ${parsed.content}`);
      }
    });

    // Fork workers.
    for (let i = 0; i < THREADS; i++) cluster.fork();

    log(`Running`);
  }
}
