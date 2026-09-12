import { createHash, randomBytes, randomInt } from "node:crypto";

export const hashSecret = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export const generateCode = () => String(randomInt(100000, 1000000));
export const generateAccessToken = () => randomBytes(32).toString("hex");

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const requestNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `PBN-AS-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
};

export const invoiceNumber = (displayId: string | number, version: number) =>
  `PBN-${new Date().getUTCFullYear()}-${displayId}-V${version}`;
