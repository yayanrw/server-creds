import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.MASTER_KEY!, "hex");

export function encrypt(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return {
    encrypted_value: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    auth_tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decrypt(
  encrypted_value: string,
  iv: string,
  auth_tag: string
) {
  const decipher = createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(auth_tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted_value, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
