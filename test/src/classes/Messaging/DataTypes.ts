import { IPCPacket } from "./IPCPacket";
import { InboundIPCPacket } from "./Inbound/InboundIPCPacket";
import { DuplexIPCPacket } from "./Duplex/DuplexIPCPacket";
import { OutboundIPCPacket } from "./Outbound/OutboundIPCPacket";
import { Ready } from "./Inbound/Ready";
import { WorkerCredentials } from "./Outbound/WorkerCredentials";
import { PlainText } from "./Duplex/PlainText";
import { InvalidPacket } from "./InvalidPacket";

export const DataTypes = [
  IPCPacket,
  InvalidPacket,
  InboundIPCPacket,
  Ready,
  DuplexIPCPacket,
  PlainText,
  OutboundIPCPacket,
  WorkerCredentials,
];

export const DataTypeByIndex = Object.assign({}, ...DataTypes.map((v) => ({ [new v().$type]: v })));
export const DataTypeNameByIndex = Object.assign({}, ...DataTypes.map((v) => ({ [new v().$type]: v.constructor.name })));
export const DataTypeIndexByTypeName = Object.assign({}, ...Object.entries(DataTypeNameByIndex).map(([a, b]) => ({ [b as string]: a })));
/* Might clean this up later */
