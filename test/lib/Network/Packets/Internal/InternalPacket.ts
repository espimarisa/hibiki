import { IPCPacket } from "../IPCPacket";

export class InternalPacket extends IPCPacket {
  execute() {
    return `${this.constructor.name} has no execute statement!`;
  }
}
