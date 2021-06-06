/**
 * Cluster Worker
 */

import { isMainThread, parentPort } from "worker_threads";

import { log } from "./Utils";
import { ReadyPacket } from "@Network/Packets/Inbound/Ready";
import { IPCPacket } from "@Network/Packets/IPCPacket";
import { PlainTextPacket } from "@Network/Packets/Duplex/PlainText";
import { PacketListener } from "@Network/PacketListener";
import { NetworkMember } from "@Network/NetworkMember";
import { WorkerThreadsChannel } from "./Channel";

export class WorkerThreadsWorker extends NetworkMember {
  constructor() {
    super(new WorkerThreadsChannel(parentPort));
    log("Starting.");

    this.createPacketListeners(
      new PacketListener(new IPCPacket(), (packet) => {
        log("Recieved A Packet! " + packet.constructor.name);
      }),
      new PacketListener(new PlainTextPacket(), (packet) => log(packet.constructor.name)),
    );

    /* parentPort?.on("message", (data) => {
      const msg = handleNetworkMessage(data) as IPCPacket;
      this.packetListeners.filter((pl) => packetFilter(msg, pl)).forEach((pl) => pl.run(msg));
    });*/

    // process.on("message", (msg) => log(msg));
    /* setTimeout(() => this.sendPlain("Hello!"), 1000);
    setTimeout(() => parentPort?.postMessage("Starting timeout!"), 5000);
    setTimeout(process.exit, 5000 + Math.random() * 2000);*/
    log("Ready.");
    this.sendMessage(new ReadyPacket());
    setTimeout(async () => {
      this.sendPlain("Exiting now");
      process.exit(0);
    }, 5000);
  }

  sendPlain(message: string) {
    parentPort?.postMessage(new PlainTextPacket(message).serialize());
  }

  sendMessage(message: IPCPacket) {
    parentPort?.postMessage(message.serialize());
  }
}

if (!isMainThread) new WorkerThreadsWorker();
