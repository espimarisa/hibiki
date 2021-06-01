import { IPCPacket } from "./Packets/IPCPacket";

export class PacketListener<T extends IPCPacket, T1> {
  packet?: T;
  run: (packet: T, worker?: T1) => void;

  constructor(packet: T, callback: (packet: T, worker?: T1) => void) {
    this.packet = packet;
    this.run = callback;
  }
}
