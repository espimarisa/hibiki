import { InboundIPCPacket } from "./InboundIPCPacket";

export class ReadyPacket extends InboundIPCPacket {
  constructor() {
    super(1000);
  }
}
