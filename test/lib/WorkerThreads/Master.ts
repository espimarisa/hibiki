/**
 * WorkerThreads Master
 */

import { Worker } from "worker_threads";

import { log } from "./Utils";
import { handleNetworkMessage } from "../libutils";
import { join } from "path";
import { PacketListener } from "@Network/PacketListener";
import { IPCPacket } from "@Network/Packets/IPCPacket";
import { packetFilter } from "./Worker";
import { ReadyPacket } from "@Network/Packets/Inbound/Ready";

const THREADS = 1;

export class WorkerThreadsMaster {
  readonly packetListeners: PacketListener<any, Worker>[] = [];
  readonly threads: Set<Worker> = new Set();

  constructor() {
    log(`${this.constructor.name} starting ($pid)`);

    // Fork workers.
    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker(join(__dirname, `./Worker.${process.env.NODE_ENV === "dev" ? "Import.c" : ""}js`));

      worker.on("online", () => {
        log(`${worker.threadId} just got online!`);
      });

      worker.on("message", (data) => {
        const msg = handleNetworkMessage(data) as IPCPacket;
        this.packetListeners.filter((pl) => packetFilter(msg, pl)).forEach((pl) => pl.run(msg, worker));
      });

      /* worker.on("message", (msg) => {
        msg = handleNetworkMessage(msg);
        // log(msg);
        if (msg instanceof InboundIPCPacket) {
          log(`(FROM ${worker.threadId}) Exec: ${msg.execute()}`);
        }
        if (msg instanceof PlainTextPacket) {
          log(`(FROM ${worker.threadId}) Plain text message: ${msg.content}`);
          worker.postMessage(new PlainTextPacket("test").serialize());
        }
      });*/

      worker.on("exit", (exitCode) => {
        log(`${[...this.threads].filter((v) => v === worker)[0]?.threadId} died (code: ${exitCode}, pid $pid).`);
      });

      this.threads.add(worker);
    }

    this.createPacketListeners(
      new PacketListener(new ReadyPacket(), (packet, worker) => {
        worker = worker as Worker;
        log(`${worker.threadId} has flagged itself as 'ready' (${packet.$type})`);
      }),
    );

    log(`Running`);
  }

  createPacketListeners(...listeners: PacketListener<any, Worker>[]) {
    this.packetListeners.push(...listeners);
  }
}
