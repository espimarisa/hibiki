import { MixedIPCPacket } from "./_MixedIPCPacket";

export class PlainText extends MixedIPCPacket {
  content?: string;

  constructor(content?: string) {
    super("0");
    this.content = content;
  }
}
