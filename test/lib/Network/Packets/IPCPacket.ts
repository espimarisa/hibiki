export class IPCPacket {
  static readonly hash = "330ba420821a6cb39cbfc714a3c7441f2d5bdd509545965f00794826600821effec163d32df0deceb5baf246896cacd3";
  $hash = IPCPacket.hash;
  $type: string;

  constructor($type?: string) {
    this.$type = $type || "-1";
  }

  static cast<T extends IPCPacket>(uncastedPacket: any, newtype: new () => T): (T & IPCPacket) | undefined {
    if (uncastedPacket.$type === new newtype().$type) return Object.assign(new newtype(), uncastedPacket);
  }

  static deserialize<T extends IPCPacket>(json: any, type: new () => T): T {
    return Object.assign(new type(), JSON.parse(json));
  }

  serialize(): string {
    return JSON.stringify(this);
  }
}
