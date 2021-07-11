import { IPCPacket } from "../IPCPacket";

export class WorkerCredentialsPacket extends IPCPacket {
  guildId?: string;
  errorChannel?: string;

  constructor(guildId?: string, errorChannel?: string) {
    super(500);
    this.guildId = guildId;
    this.errorChannel = errorChannel;
  }
}
