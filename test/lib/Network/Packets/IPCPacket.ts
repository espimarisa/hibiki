/**
 * Represents a single packet
 */
export class IPCPacket {
  static readonly hash = "330ba420821a6cb39cbfc714a3c7441f2d5bdd509545965f00794826600821effec163d32df0deceb5baf246896cacd3";

  /**
   * A hash to verify packet integrity. this is kinda lame i'll have to find another way of doing this
   */
  $hash = IPCPacket.hash;

  /**
   * @deprecated
   * Unused atm, but an ID for the sender
   */
  $sender?: string;

  /**
   * Packet type, set by calling super(number)
   */
  $type: string;

  constructor($type?: number) {
    this.$type = ($type ?? -1).toString();
  }

  static cast<T extends IPCPacket>(uncastedPacket: any, targetType: new () => T): (T & IPCPacket) | undefined {
    if (uncastedPacket.$type === new targetType().$type) return Object.assign(new targetType(), uncastedPacket);
  }

  static deserialize<T extends IPCPacket>(json: any, targetType: new () => T): T {
    return Object.assign(new targetType(), JSON.parse(json));
  }

  serialize(): string {
    return JSON.stringify(this);
  }
}
