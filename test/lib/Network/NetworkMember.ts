import type { NetworkChannel } from "./NetworkChannel";
import type { PacketListener } from "./PacketListener";

import { DataTypes } from "./DataTypes";
import { IPCPacket } from "./Packets/IPCPacket";

/**
 * A component that both emits and receives packets
 */
export abstract class NetworkMember {
  readonly channel: NetworkChannel;
  readonly packetListeners: PacketListener<any>[] = [];

  constructor(channel: NetworkChannel) {
    this.channel = channel;
    this.channel.messageHandleCallbacks.push((packet, worker) =>
      this.packetListeners
        .filter(
          (pl) =>
            pl.packet.$type === new IPCPacket().$type ||
            IPCPacket.cast(packet, DataTypes.filter((t) => new t().$type === pl.packet.$type)[0]),
        )
        .map((pl) => pl.run(packet, worker)),
    );
  }

  sendPacket(packet: IPCPacket) {
    this.channel.sendPacket(packet);
  }

  createPacketListeners(...listeners: PacketListener<any>[]) {
    this.packetListeners.push(...listeners);
  }
}
