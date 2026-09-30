import { createHash } from "node:crypto";

export const MEDIA_SHA256_UNIQUE_INDEX = "IDX_pbn_media_asset_sha256_unique";

export function sha256FromBuffer(content: Buffer) {
  return createHash("sha256").update(content).digest("hex");
}

export function sha256FromBase64(content: string) {
  return sha256FromBuffer(Buffer.from(content, "base64"));
}

export function isMediaSha256UniqueViolation(error: unknown) {
  const visited = new Set<unknown>();
  let current: unknown = error;

  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);
    const candidate = current as {
      code?: string;
      constraint?: string;
      cause?: unknown;
      driverException?: unknown;
    };

    if (
      candidate.code === "23505" &&
      (!candidate.constraint ||
        candidate.constraint === MEDIA_SHA256_UNIQUE_INDEX)
    ) {
      return true;
    }

    current = candidate.cause || candidate.driverException;
  }

  return false;
}
