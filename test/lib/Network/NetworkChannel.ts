import { handleNetworkMessage } from "../libutils";
import { IPCPacket } from "./Packets/IPCPacket";

/**
 * A channel within the Network
 */
export abstract class NetworkChannel {
  readonly messageHandleCallbacks: ((packet: IPCPacket, worker?: any) => void)[] = [];

  handleMessage(message: any, worker?: number) {
    message = message instanceof IPCPacket ? message : (handleNetworkMessage(message) as IPCPacket);
    worker = message.workerId ?? worker;
    this.messageHandleCallbacks.map((callback) => {
      callback(message, worker);
    });
    return { message: IPCPacket, worker };
  }

  abstract sendPacket(packet: IPCPacket): void;
}
