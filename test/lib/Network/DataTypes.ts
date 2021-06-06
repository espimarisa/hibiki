import { DuplexIPCPacket } from "./Packets/Duplex/DuplexIPCPacket";
import { PlainTextPacket } from "./Packets/Duplex/PlainText";
import { InboundIPCPacket } from "./Packets/Inbound/InboundIPCPacket";
import { ReadyPacket } from "./Packets/Inbound/Ready";
import { InternalPacket } from "./Packets/Internal/InternalPacket";
import { WorkerExitPacket } from "./Packets/Internal/WorkerExit";
import { WorkerOnlinePacket } from "./Packets/Internal/WorkerOnline";
import { InvalidPacket } from "./Packets/InvalidPacket";
import { IPCPacket } from "./Packets/IPCPacket";
import { OutboundIPCPacket } from "./Packets/Outbound/OutboundIPCPacket";
import { WorkerCredentialsPacket } from "./Packets/Outbound/WorkerCredentials";

export const DataTypes = [
  IPCPacket,
  InvalidPacket,

  DuplexIPCPacket,
  PlainTextPacket,

  InboundIPCPacket,
  ReadyPacket,

  OutboundIPCPacket,
  WorkerCredentialsPacket,

  InternalPacket,
  WorkerOnlinePacket,
  WorkerExitPacket,
];

export const DataTypeByIndex = Object.assign({}, ...DataTypes.map((v) => ({ [new v().$type]: v })));
/* export const DataTypeNameByIndex = Object.assign({}, ...DataTypes.map((v) => ({ [new v().$type]: v.constructor.name })));
export const DataTypeIndexByTypeName = Object.assign({}, ...Object.entries(DataTypeNameByIndex).map(([a, b]) => ({ [b as string]: a })));
/* Might clean this up later */
