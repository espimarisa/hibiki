import { InboundIPCPacket } from "./InboundIPCPacket";

export class Ready extends InboundIPCPacket {
  constructor() {
    super("1000");
  }
}
