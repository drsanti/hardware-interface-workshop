import protobuf from "protobufjs";

import { featureLabels } from "../caps";

export type BoardInfoView = {
  uuid: string;
  mac: string;
  hwModel: string;
  fwVersion: string;
  caps: number;
  synced: boolean;
  unixNs: number;
  features: string[];
};

type BoardInfoFields = {
  uuid?: string;
  mac?: string;
  fw_version?: string;
  hw_model?: string;
  caps?: number;
  synced?: boolean;
  unix_ns?: number;
};

const BoardInfoType = new protobuf.Type("BoardInfo")
  .add(new protobuf.Field("uuid", 1, "string"))
  .add(new protobuf.Field("mac", 2, "string"))
  .add(new protobuf.Field("ip", 3, "string"))
  .add(new protobuf.Field("uptime_ns", 4, "uint64"))
  .add(new protobuf.Field("unix_ns", 5, "uint64"))
  .add(new protobuf.Field("synced", 6, "bool"))
  .add(new protobuf.Field("fw_version", 7, "string"))
  .add(new protobuf.Field("proto_version", 8, "uint32"))
  .add(new protobuf.Field("hw_model", 9, "string"))
  .add(new protobuf.Field("caps", 10, "uint32"));

/** Decode a board-identity payload into plain fields. */
export function decodeBoardInfo(payload: Uint8Array): BoardInfoView {
  const msg = BoardInfoType.toObject(BoardInfoType.decode(payload), {
    longs: Number,
    defaults: true,
  }) as BoardInfoFields;

  const caps = Number(msg.caps ?? 0);
  return {
    uuid: msg.uuid ?? "",
    mac: msg.mac ?? "",
    hwModel: msg.hw_model ?? "",
    fwVersion: msg.fw_version ?? "",
    caps,
    synced: Boolean(msg.synced),
    unixNs: Number(msg.unix_ns ?? 0),
    features: featureLabels(caps),
  };
}
