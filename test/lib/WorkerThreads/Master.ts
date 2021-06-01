/**
 * WorkerThreads Master
 */

import { Worker } from "worker_threads";

import { PlainTextPacket } from "../Network/Packets/Duplex/PlainText";
import { log } from "./Utils";
import { InboundIPCPacket } from "../Network/Packets/Inbound/InboundIPCPacket";
import { handleNetworkMessage } from "../libutils";
import { join } from "path";

const THREADS = 1;

export class WorkerThreadsMaster {
  threads: Set<Worker> = new Set();

  constructor() {
    log(`${this.constructor.name} starting ($pid)`);

    // Fork workers.
    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker(join(__dirname, `./Worker.${process.env.NODE_ENV === "dev" ? "Import.c" : ""}js`));

      worker.on("online", () => {
        log(`${worker.threadId} just got online!`);
      });

      worker.on("message", (msg) => {
        msg = handleNetworkMessage(msg);
        // log(msg);
        if (msg instanceof InboundIPCPacket) {
          log(`(FROM ${worker.threadId}) ${msg.execute()}`);
        }
        if (msg instanceof PlainTextPacket) {
          log(`(FROM ${worker.threadId}) Plain text message: ${msg.content}`);
        }
      });

      worker.on("exit", (exitCode) => {
        log(`${worker.threadId} died (code: ${exitCode}, pid $pid).`);
      });

      this.threads.add(worker);
    }

    log(`Running`);
  }
}
