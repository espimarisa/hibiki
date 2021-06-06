import type { MessagePort } from "worker_threads";

import type { IPCPacket } from "@Network/Packets/IPCPacket";

import { NetworkChannel } from "@Network/NetworkChannel";

export class WorkerThreadsChannel extends NetworkChannel {
  readonly channel?: MessagePort;

  constructor(channel?: MessagePort) {
    super();
    channel?.on("message", (e) => this.handleMessage(e.data, e.data.$sender));
    this.channel = channel;
    this.reload();
  }

  reload() {
    while (this.messageHandleCallbacks.length) this.messageHandleCallbacks.pop();
  }

  sendPacket(message: IPCPacket) {
    this.channel?.postMessage(message.serialize());
  }
}
