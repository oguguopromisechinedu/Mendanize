/**
 * Admin TOTP helpers — secrets encrypted at rest with AUTH_SECRET.
 */

import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import * as OTPAuth from "otpauth";

function deriveKey(): Buffer {
  const secret = process.env.AUTH_SECRET ?? "dev-only-auth-secret";
  return createHash("sha256").update(secret).digest();
}

export function encryptTotpSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${enc.toString("base64url")}`;
}

export function decryptTotpSecret(payload: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid TOTP secret payload");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    deriveKey(),
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function createTotpSecret(labelEmail: string): {
  secret: string;
  uri: string;
  qrUrl: string;
} {
  const totp = new OTPAuth.TOTP({
    issuer: "Mendanize Admin",
    label: labelEmail,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });
  const secret = totp.secret.base32;
  const uri = totp.toString();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(uri)}`;
  return { secret, uri, qrUrl };
}

export function verifyTotpToken(secretBase32: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: "Mendanize Admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
  const delta = totp.validate({ token: token.replace(/\s/g, ""), window: 1 });
  return delta !== null;
}
