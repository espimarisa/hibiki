import { IPCPacket } from "../IPCPacket";

export class InboundIPCPacket extends IPCPacket {
  execute() {
    return `${this.constructor.name} has no execute statement!`;
  }
}
