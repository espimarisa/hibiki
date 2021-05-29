import { IPCPacket } from "./Messaging/IPCPacket";
import { PlainText } from "./Messaging/Duplex/PlainText";
import { InvalidPacket } from "./Messaging/InvalidPacket";
import { DataTypeByIndex, DataTypes } from "./Messaging/DataTypes";

export const format = (s: string, ...arr: string[]) =>
  s.replace(/{(\d+)}/g, (match, number) => (typeof arr[number] !== "undefined" ? arr[number] : match));

export const log = (msg: string, ...f: string[]) => {
  if (f?.length) msg = format(msg, ...f);
  const date = new Date();
  const obj = date.toString().split(" ");
  let caller: string[] | string = (
    (new Error().stack?.split("\n")[3].match(/\(([^()]+)\)/g) || ["unknown caller"])[0]
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      ?.replace(")", "") || "unknown caller"
  ).split(":");
  const maxNameSize = 12;
  const maxLineSize = 3;
  const maxCharSize = 3;
  const maxTotalSize = maxNameSize + 1 + maxLineSize + 1 + maxCharSize;
  if (caller.length > 1) {
    const fullName = caller[0].split(".");
    let name = fullName[0];
    let ext = fullName[1] || "";
    if (ext.length) ext = `.${ext}`;

    if (name.length > maxNameSize - ext.length) name = `${name.substring(0, maxNameSize - ext.length - 3)}...`;
    name += ext;
    name = (name.length !== maxNameSize ? name + " ".repeat(maxNameSize) : name).substring(0, maxNameSize);

    const line = `${"0".repeat(maxLineSize)}${caller[1].length > maxLineSize ? "^".repeat(maxLineSize) : caller[1]}`.slice(-maxLineSize);
    const char = `${"0".repeat(maxCharSize)}${caller[2].length > maxCharSize ? "^".repeat(maxCharSize) : caller[2]}`.slice(-maxCharSize);
    caller = `${name}:${line}:${char}`;
  } else caller = (caller + " ".repeat(maxTotalSize)).substring(0, maxTotalSize);
  return console.log(`[${obj[4]}.${`00${date.getMilliseconds()}`.slice(-3)}${obj[5].slice(-5)}]`, caller, msg);
};

export const handleNetworkMessage = (message: string) => {
  let parsed;
  try {
    parsed = JSON.parse(message);
  } catch (e) {
    return new PlainText(message);
  }
  const stringified = JSON.stringify(parsed);
  const invalid = new InvalidPacket(parsed.$hash, parsed.$type, stringified);
  if (parsed.$hash !== IPCPacket.hash || !DataTypeByIndex[parsed.$type]) return invalid;
  parsed = IPCPacket.deserialize(JSON.stringify(parsed), DataTypeByIndex[parsed.$type]);
  let casted;
  for (const type of DataTypes) {
    casted = type.cast(parsed, type);
    if (casted) return (casted as unknown) as typeof type;
  }
  return invalid;
  /* if (parsed instanceof InboundIPCPacket) {
    log(`(FROM ${worker.threadId}) ${parsed.execute()}`);
  }
  if (parsed instanceof PlainText) {
    log(`(FROM ${worker.threadId}) Plain text message: ${parsed.content}`);
  } */
};
