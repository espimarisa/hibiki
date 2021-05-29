/**
 * Cluster Worker
 */

import { Ready } from "../Messaging/Inbound/Ready";
import { IPCPacket } from "../Messaging/IPCPacket";
import { PlainText } from "../Messaging/Duplex/PlainText";

import { log } from "./Utils";
import { isMainThread, parentPort } from "worker_threads";

export class WorkerThreadsWorker {
  constructor() {
    this.sendPlain("f");
    log(`Running with PID $pid`);
    process.on("message", (msg) => {
      log(msg);
    });
    setTimeout(() => this.sendPlain("Hello!"), 1000);
    setTimeout(() => parentPort?.postMessage("Starting timeout!"), 5000);
    setTimeout(process.exit, 5000 + Math.random() * 2000);
    this.sendMessage(new Ready());
  }

  sendPlain(message: string) {
    parentPort?.postMessage(new PlainText(message).serialize());
  }

  sendMessage(message: IPCPacket) {
    parentPort?.postMessage(message.serialize());
  }
}

if (!isMainThread) new WorkerThreadsWorker();
