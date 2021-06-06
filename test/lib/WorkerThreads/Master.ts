/**
 * WorkerThreads Master
 */

import { join } from "path";
import { Worker } from "worker_threads";

import { WorkerThreadsChannel } from "./Channel";
import { log } from "./Utils";
import { handleNetworkMessage } from "../libutils";

import { PacketListener } from "@Network/PacketListener";
import { IPCPacket } from "@Network/Packets/IPCPacket";
import { ReadyPacket } from "@Network/Packets/Inbound/Ready";
import { NetworkMember } from "@Network/NetworkMember";
import { WorkerOnlinePacket } from "@Network/Packets/Internal/WorkerOnline";
import { WorkerExitPacket } from "@Network/Packets/Internal/WorkerExit";

const THREADS = 1;

export class WorkerThreadsMaster extends NetworkMember {
  readonly threads: Map<Worker, number> = new Map();

  constructor() {
    super(new WorkerThreadsChannel());
    log(`${this.constructor.name} starting ($pid)`);

    this.createPacketListeners(
      new PacketListener(new WorkerOnlinePacket(), (_data, worker) => log(`Worker ${worker} got online.`)),
      new PacketListener(new ReadyPacket(), (data, worker) => log(`Worker ${worker} has flagged itself as 'ready' (${data.$type})`)),
      new PacketListener(new WorkerExitPacket(), (data, worker) => log(`Worker ${worker} died. (${data.exitCode})`)),
      new PacketListener(new IPCPacket(), (data, worker) => log(`${data.$type} received from ${worker}.`)),
    );

    // Fork workers.
    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker(join(__dirname, `./Worker.${process.env.NODE_ENV === "dev" ? "Import.c" : ""}js`));
      this.threads.set(worker, worker.threadId);
      const threadId = [...this.threads].filter((v) => v[0] === worker)[0][1];
      worker.on("online", () => this.channel.handleMessage(new WorkerOnlinePacket(threadId)));
      worker.on("exit", (exitCode) => this.channel.handleMessage(new WorkerExitPacket(threadId, exitCode)));
      worker.on("message", (data) => {
        this.channel.handleMessage(handleNetworkMessage(data) as IPCPacket, threadId);
        /* const msg = handleNetworkMessage(data) as IPCPacket;
        this.packetListeners
          .filter(
            (pl) =>
              pl.packet.$type === new IPCPacket().$type ||
              IPCPacket.cast(msg, DataTypes.filter((t) => new t().$type === pl.packet.$type)[0]),
          )
          .forEach((pl) => pl.run(msg, worker.threadId));*/
      });
    }

    log(`Running`);
  }
}
