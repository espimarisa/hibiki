/**
 * Cluster Master
 */

import cluster from "cluster";
// import { DataTypeByIndex } from "../Messaging/DataTypes";
// import { IPCPacket } from "../Messaging/IPCPacket";
import { PlainText } from "../Messaging/Duplex/PlainText";
import { log } from "./Utils";
import { InboundIPCPacket } from "../Messaging/Inbound/InboundIPCPacket";
import { handleNetworkMessage } from "../GlobalUtils";
// import os from "os";

const THREADS = 1;

export class ClusterMaster {
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
      /* let parsed;
      try {
        parsed = JSON.parse(msg);
      } catch (e) {
        console.error(e);
        return log(`worker ${worker.id} just sent ${msg}`);
      }
      if (parsed.$hash !== IPCPacket.hash) return log(`worker ${worker.id} sent a wrong-hashed message: ${msg}`);
      if (!DataTypeByIndex[parsed.$type]) return log(`worker ${worker.id} sent a wrong-typed message: ${msg}`);
      parsed = IPCPacket.deserialize(JSON.stringify(parsed), DataTypeByIndex[parsed.$type]); */
      msg = handleNetworkMessage(msg);
      log(msg);
      if (msg instanceof InboundIPCPacket) {
        log(`(FROM ${worker.id}) ${msg.execute()}`);
      }
      if (msg instanceof PlainText) {
        log(`(FROM ${worker.id}) Plain text message: ${msg.content}`);
      }
    });

    // Fork workers.
    for (let i = 0; i < THREADS; i++) cluster.fork();

    log(`Running`);
  }
}
