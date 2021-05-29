import { Worker } from "cluster";
import { log } from "../../CommonUtils";
import { IPCPacket } from "../IPCPacket";

export class IncomingIPCPacket extends IPCPacket {
  execute(worker: Worker) {
    log(`${this.constructor.name} has no execute statement! ${worker.id}`);
  }
}
