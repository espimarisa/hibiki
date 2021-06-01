/**
 * Cluster Worker
 */

import { isMainThread, parentPort } from "worker_threads";

import { log } from "./Utils";

import { ReadyPacket } from "../Network/Packets/Inbound/Ready";
import { IPCPacket } from "../Network/Packets/IPCPacket";
import { PlainTextPacket } from "../Network/Packets/Duplex/PlainText";
import { PacketListener } from "../Network/PacketListener";
import { WorkerExitPacket } from "../Network/Packets/Duplex/WorkerExit";

export class WorkerThreadsWorker {
  readonly packetListeners: PacketListener<any>[] = [];

  constructor() {
    // this.sendPlain("f");
    log(`Running with PID $pid`);

    this.createPacketListener(
      new PacketListener(new WorkerExitPacket(), () => {
        console.log("Recieved Exit Packet!");
      }),
    );

    // process.on("message", (msg) => log(msg));
    setTimeout(() => this.sendPlain("Hello!"), 1000);
    setTimeout(() => parentPort?.postMessage("Starting timeout!"), 5000);
    setTimeout(process.exit, 5000 + Math.random() * 2000);
    this.sendMessage(new ReadyPacket());
  }

  createPacketListener(listener: PacketListener<any>) {
    this.packetListeners.push(listener);
  }

  sendPlain(message: string) {
    parentPort?.postMessage(new PlainTextPacket(message).serialize());
  }

  sendMessage(message: IPCPacket) {
    parentPort?.postMessage(message.serialize());
  }

  exit() {
    this.createPacketListener(
      new PacketListener(new WorkerExitPacket(), () => {
        console.log("Recieved Exit Packet!");
      }),
    );
  }
}

if (!isMainThread) new WorkerThreadsWorker();
