import {
  isMediaSha256UniqueViolation,
  MEDIA_SHA256_UNIQUE_INDEX,
  sha256FromBase64,
} from "../media-content-hash";

describe("media content hashing", () => {
  it("computes a stable SHA-256 digest from base64 content", () => {
    expect(sha256FromBase64(Buffer.from("petboxnest").toString("base64"))).toBe(
      "478042543ac300b5e70364fcf54336f6fd0d735897590e04c8127cce18ac736c",
    );
  });

  it("recognizes a nested PostgreSQL hash uniqueness violation", () => {
    expect(
      isMediaSha256UniqueViolation({
        driverException: {
          code: "23505",
          constraint: MEDIA_SHA256_UNIQUE_INDEX,
        },
      }),
    ).toBe(true);
  });

  it("does not treat unrelated uniqueness violations as hash conflicts", () => {
    expect(
      isMediaSha256UniqueViolation({
        code: "23505",
        constraint: "IDX_pbn_media_asset_file_key_unique",
      }),
    ).toBe(false);
  });
});
