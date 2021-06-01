import { DuplexIPCPacket } from "./DuplexIPCPacket";

export class PlainTextPacket extends DuplexIPCPacket {
  content?: string;

  constructor(content?: string) {
    super("0");
    this.content = content;
  }
}
