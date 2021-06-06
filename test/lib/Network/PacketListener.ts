import type { IPCPacket } from "./Packets/IPCPacket";

export class PacketListener<T extends IPCPacket> {
  packet?: T;
  run: (packet: T, worker?: number) => void;

  constructor(packet: T, callback: (packet: T, worker?: number) => void) {
    this.packet = packet;
    this.run = callback;
  }
}
