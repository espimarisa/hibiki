import { IPCPacket } from "./Packets/IPCPacket";

export class PacketListener<T extends IPCPacket> {
  packet?: T;
  run: (...args: any[]) => void;

  constructor(packet: T, callback: (...args: any[]) => void) {
    this.packet = packet;
    this.run = callback;
  }
}
