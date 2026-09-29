import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3"
import { MedusaError } from "@medusajs/framework/utils"

const MAX_DELETE_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 200

let client: S3Client | undefined

function getS3Config() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const bucket = process.env.S3_BUCKET
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!accessKeyId || !bucket || !secretAccessKey) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "S3 storage is not fully configured"
    )
  }

  client ??= new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "us-east-1",
    forcePathStyle: true,
  })

  return { bucket, client }
}

async function objectExists(fileKey: string) {
  const storage = getS3Config()
  const result = await storage.client.send(
    new ListObjectsV2Command({
      Bucket: storage.bucket,
      Prefix: fileKey,
      MaxKeys: 1,
    })
  )

  return Boolean(result.Contents?.some((object) => object.Key === fileKey))
}

function wait(delay: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delay))
}

export async function deleteS3ObjectAndVerify(fileKey: string) {
  const storage = getS3Config()
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_DELETE_ATTEMPTS; attempt += 1) {
    try {
      if (!(await objectExists(fileKey))) {
        return
      }

      await storage.client.send(
        new DeleteObjectCommand({
          Bucket: storage.bucket,
          Key: fileKey,
        })
      )

      if (await objectExists(fileKey)) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `S3 object still exists after deletion: ${fileKey}`
        )
      }

      return
    } catch (error) {
      lastError = error

      if (attempt < MAX_DELETE_ATTEMPTS) {
        await wait(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      }
    }
  }

  throw new MedusaError(
    MedusaError.Types.UNEXPECTED_STATE,
    `Unable to permanently delete the S3 object after ${MAX_DELETE_ATTEMPTS} attempts: ${fileKey}. ${lastError instanceof Error ? lastError.message : "Unknown storage error"}`
  )
}
