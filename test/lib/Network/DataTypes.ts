import { IPCPacket } from "./Packets/IPCPacket";
import { InboundIPCPacket } from "./Packets/Inbound/InboundIPCPacket";
import { DuplexIPCPacket } from "./Packets/Duplex/DuplexIPCPacket";
import { OutboundIPCPacket } from "./Packets/Outbound/OutboundIPCPacket";
import { ReadyPacket } from "./Packets/Inbound/Ready";
import { WorkerCredentialsPacket } from "./Packets/Outbound/WorkerCredentials";
import { PlainTextPacket } from "./Packets/Duplex/PlainText";
import { InvalidPacket } from "./Packets/InvalidPacket";
import { WorkerExitPacket } from "./Packets/Duplex/WorkerExit";

export const DataTypes = [
  IPCPacket,
  InvalidPacket,
  WorkerExitPacket,
  ReadyPacket,
  DuplexIPCPacket,
  InboundIPCPacket,
  PlainTextPacket,
  OutboundIPCPacket,
  WorkerCredentialsPacket,
];

export const DataTypeByIndex = Object.assign({}, ...DataTypes.map((v) => ({ [new v().$type]: v })));
export const DataTypeNameByIndex = Object.assign({}, ...DataTypes.map((v) => ({ [new v().$type]: v.constructor.name })));
export const DataTypeIndexByTypeName = Object.assign({}, ...Object.entries(DataTypeNameByIndex).map(([a, b]) => ({ [b as string]: a })));
/* Might clean this up later */
