import crypto from "crypto";

export function generateCode (length = 6) {
    return crypto
        .randomBytes(length)
        .toString("base64")
        .replace(/[+/=]/g, "")
        .slice(0, length)
}