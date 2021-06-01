import { IPCPacket } from "../IPCPacket";

export class DuplexIPCPacket extends IPCPacket {
  execute() {
    return `${this.constructor.name} has no execute statement!`;
  }
}
