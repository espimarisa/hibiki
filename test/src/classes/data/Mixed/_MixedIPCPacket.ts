import { log } from "../../CommonUtils";
import { IPCPacket } from "../IPCPacket";

export class MixedIPCPacket extends IPCPacket {
  execute() {
    log(`${this.constructor.name} has no execute statement!`);
  }
}
