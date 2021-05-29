import { IPCPacket } from "./IPCPacket";
import { IncomingIPCPacket } from "./Incoming/_IncomingIPCPacket";
import { MixedIPCPacket } from "./Mixed/_MixedIPCPacket";
import { OutgoingIPCPacket } from "./Outgoing/_OutgoingIPCPacket";
import { Ready } from "./Incoming/Ready";
import { MehCredentials } from "./Outgoing/WorkerCredentials";
import { PlainText } from "./Mixed/PlainText";

export const DataTypes = [IPCPacket, IncomingIPCPacket, MixedIPCPacket, OutgoingIPCPacket, Ready, PlainText, MehCredentials];
export const DataTypeByIndex = Object.assign({}, ...DataTypes.map((v) => ({ [new v().$type]: v })));
export const DataTypeNameByIndex = Object.assign({}, ...DataTypes.map((v) => ({ [new v().$type]: v.constructor.name })));
export const DataTypeIndexByTypeName = Object.assign({}, ...Object.entries(DataTypeNameByIndex).map(([a, b]) => ({ [b as string]: a })));
/* Might clean this up later */
