import { createHash } from "node:crypto";

export function checksum(value: string) {
  return createHash("sha1").update(value).digest("hex");
}
