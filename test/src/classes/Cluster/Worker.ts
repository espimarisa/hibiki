/**
 * Cluster Worker
 */

import ivm from "isolated-vm";
import { Ready } from "../Messaging/Inbound/Ready";
import { IPCPacket } from "../Messaging/IPCPacket";
import { PlainText } from "../Messaging/Duplex/PlainText";
import { WorkerCredentials } from "../Messaging/Outbound/WorkerCredentials";

import { log } from "./Utils";

export class ClusterWorker {
  creds?: WorkerCredentials;

  vm?: ivm.Isolate;
  vmSyncContext?: ivm.Context;
  vmGlobalContext?: ivm.Reference<Record<string | number | symbol, any>>;

  extensions: any[] = [];

  constructor() {
    log(`Running with PID $pid`);
    process.on("message", (msg) => {
      log(msg);
    });
    setTimeout(() => this.sendPlain("Hello!"), 1000);
    setTimeout(() => process.send?.("Starting timeout!"), 5000);
    setTimeout(process.exit, 5000 + Math.random() * 2000);
    this.sendMessage(new Ready());
  }

  sendPlain(message: string) {
    process.send?.(new PlainText(message).serialize());
  }

  sendMessage(message: IPCPacket) {
    process.send?.(message.serialize());
  }

  setup(creds: WorkerCredentials) {
    this.creds = creds;
  }
}
