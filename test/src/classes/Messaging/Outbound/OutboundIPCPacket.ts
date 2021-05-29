import { IPCPacket } from "../IPCPacket";

export class OutboundIPCPacket extends IPCPacket {
  execute() {
    return `${this.constructor.name} has no execute statement!`;
  }
}
