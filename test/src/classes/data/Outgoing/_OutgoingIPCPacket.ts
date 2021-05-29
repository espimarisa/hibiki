import { log } from "../../CommonUtils";
import { IPCPacket } from "../IPCPacket";

export class OutgoingIPCPacket extends IPCPacket {
  execute() {
    log(`${this.constructor.name} has no execute statement!`);
  }
}
