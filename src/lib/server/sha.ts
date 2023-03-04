import { createHash } from "crypto";

export function sha256(data: string) {
    return createHash("sha256").update(data, 'utf8').digest("base64");
}

export function smallSha(data: string) {
    return sha256(data).substring(0, 8);
}