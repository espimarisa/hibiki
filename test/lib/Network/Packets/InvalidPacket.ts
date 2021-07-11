import { IPCPacket } from "./IPCPacket";

export class InvalidPacket extends IPCPacket {
  data?: string;

  constructor($hash?: string, $type?: string, data?: string) {
    super(-5);
    this.$hash = $hash || "UNKNOWN";
    this.$type = $type || "UNKNOWN";
    this.data = data;
  }
}
