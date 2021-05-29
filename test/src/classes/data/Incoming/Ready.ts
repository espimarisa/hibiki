import { Worker } from "cluster";
import { log } from "../../CommonUtils";
import { IncomingIPCPacket } from "./_IncomingIPCPacket";

export class Ready extends IncomingIPCPacket {
  constructor() {
    super("1000");
  }

  execute(worker: Worker) {
    log(`Worker ${worker.id} sent a ready!`);
  }
}
