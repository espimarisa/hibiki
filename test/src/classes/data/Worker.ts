/**
 * Worker
 */

import ivm from "isolated-vm";
import { Ready } from "./Incoming/Ready";
import { IPCPacket } from "./IPCPacket";
import { PlainText } from "./Mixed/PlainText";
import { MehCredentials } from "./Outgoing/WorkerCredentials";

import { log } from "../CommonUtils";

export class Worker {
  creds?: MehCredentials;

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

  setup(creds: MehCredentials) {
    this.creds = creds;
  }
}
