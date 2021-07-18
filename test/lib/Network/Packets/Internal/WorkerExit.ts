import { InternalPacket } from "./InternalPacket";

export class WorkerExitPacket extends InternalPacket {
  workerId?: number;
  exitCode?: number;

  constructor(workerId = -1, exitCode?: number) {
    super(5001);
    this.workerId = workerId;
    this.exitCode = exitCode;
  }
}
