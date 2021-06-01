/**
 * Cluster Worker
 */

import * as ivm from "isolated-vm";
import { ReadyPacket } from "../Network/Packets/Inbound/Ready";
import { IPCPacket } from "../Network/Packets/IPCPacket";
import { PlainTextPacket } from "../Network/Packets/Duplex/PlainText";
import { WorkerCredentialsPacket } from "../Network/Packets/Outbound/WorkerCredentials";

import { log } from "./Utils";

export class ClusterWorker {
  creds?: WorkerCredentialsPacket;

  vm?: ivm.Isolate;
  vmSyncContext?: ivm.Context;
  vmGlobalContext?: ivm.Reference<Record<string | number | symbol, any>>;

  extensions: any[] = [];

  constructor() {
    log(`Running with PID $pid`);
    // process.on("message", (msg) => log(msg));
    setTimeout(() => this.sendPlain("Hello!"), 1000);
    setTimeout(() => process.send?.("Starting timeout!"), 5000);
    setTimeout(process.exit, 5000 + Math.random() * 2000);
    this.sendMessage(new ReadyPacket());
  }

  sendPlain(message: string) {
    process.send?.(new PlainTextPacket(message).serialize());
  }

  sendMessage(message: IPCPacket) {
    process.send?.(message.serialize());
  }

  setup(creds: WorkerCredentialsPacket) {
    this.creds = creds;
  }
}
