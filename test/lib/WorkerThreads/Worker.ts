/**
 * Cluster Worker
 */

import { isMainThread, parentPort } from "worker_threads";

import { log } from "./Utils";

import { ReadyPacket } from "../Network/Packets/Inbound/Ready";
import { IPCPacket } from "../Network/Packets/IPCPacket";
import { PlainTextPacket } from "../Network/Packets/Duplex/PlainText";
import { PacketListener } from "../Network/PacketListener";
import { handleNetworkMessage } from "../libutils";
import { DataTypes } from "@Network/DataTypes";

export const packetFilter = (msg: IPCPacket, pl: PacketListener<any, any>) =>
  pl.packet.$type === new IPCPacket().$type || IPCPacket.cast(msg, DataTypes.filter((t) => new t().$type === pl.packet.$type)[0]);

export class WorkerThreadsWorker {
  readonly packetListeners: PacketListener<any, never>[] = [];

  constructor() {
    // this.sendPlain("f");
    log("Running with PID $pid");

    this.createPacketListeners(
      new PacketListener(new IPCPacket(), (packet) => {
        log("Recieved A Packet! " + packet.constructor.name);
      }),
      new PacketListener(new PlainTextPacket(), (packet) => log(packet.constructor.name)),
    );

    parentPort?.on("message", (data) => {
      const msg = handleNetworkMessage(data) as IPCPacket;
      this.packetListeners.filter((pl) => packetFilter(msg, pl as PacketListener<any, any>)).forEach((pl) => pl.run(msg));
    });

    // process.on("message", (msg) => log(msg));
    setTimeout(() => this.sendPlain("Hello!"), 1000);
    setTimeout(() => parentPort?.postMessage("Starting timeout!"), 5000);
    setTimeout(process.exit, 5000 + Math.random() * 2000);
    this.sendMessage(new ReadyPacket());
  }

  createPacketListeners(...listeners: PacketListener<any, never>[]) {
    this.packetListeners.push(...listeners);
  }

  sendPlain(message: string) {
    parentPort?.postMessage(new PlainTextPacket(message).serialize());
  }

  sendMessage(message: IPCPacket) {
    parentPort?.postMessage(message.serialize());
  }
}

if (!isMainThread) new WorkerThreadsWorker();
