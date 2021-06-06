import { InternalPacket } from "./InternalPacket";

export class WorkerOnlinePacket extends InternalPacket {
  workerId?: number;

  constructor(workerId = -1) {
    super("5000");
    this.workerId = workerId;
  }
}
