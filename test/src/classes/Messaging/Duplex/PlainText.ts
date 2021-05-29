import { DuplexIPCPacket } from "./DuplexIPCPacket";

export class PlainText extends DuplexIPCPacket {
  content?: string;

  constructor(content?: string) {
    super("0");
    this.content = content;
  }
}
