import { DuplexIPCPacket } from "./DuplexIPCPacket";

export class WorkerExitPacket extends DuplexIPCPacket {
  code?: number;

  constructor(code?: number) {
    super("1001");
    this.code = code;
  }
}
