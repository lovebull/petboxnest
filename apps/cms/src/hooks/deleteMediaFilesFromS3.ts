import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3"
import type { CollectionAfterDeleteHook } from "payload"

const MAX_DELETE_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 200

type MediaSize = {
  filename?: string | null
}

type MediaDocument = {
  filename?: string | null
  id: number | string
  prefix?: string | null
  sizes?: Record<string, MediaSize | null | undefined> | null
}

type StoredFile = {
  filename: string
  label: string
}

let storageClient: S3Client | undefined

function getStorageConfig() {
  const accessKeyId = process.env.PAYLOAD_S3_ACCESS_KEY_ID
  const bucket = process.env.PAYLOAD_S3_BUCKET
  const secretAccessKey = process.env.PAYLOAD_S3_SECRET_ACCESS_KEY

  if (!accessKeyId || !bucket || !secretAccessKey) {
    return null
  }

  storageClient ??= new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint: process.env.PAYLOAD_S3_ENDPOINT,
    forcePathStyle: true,
    region: process.env.PAYLOAD_S3_REGION || "us-east-1",
  })

  return {
    bucket,
    client: storageClient,
  }
}

function getObjectKey(filename: string, prefix?: string | null) {
  const normalizedFilename = filename.replace(/^\/+/, "")
  const normalizedPrefix = prefix?.replace(/^\/+|\/+$/g, "")

  return normalizedPrefix
    ? `${normalizedPrefix}/${normalizedFilename}`
    : normalizedFilename
}

function getFilesInSafeDeleteOrder(doc: MediaDocument): StoredFile[] {
  const sizes = doc.sizes || {}
  const preferredSizes = ["thumbnail", "productStory"]
  const remainingSizes = Object.keys(sizes).filter(
    (sizeName) => !preferredSizes.includes(sizeName)
  )
  const orderedSizeNames = [...preferredSizes, ...remainingSizes]
  const files: StoredFile[] = []

  for (const sizeName of orderedSizeNames) {
    const filename = sizes[sizeName]?.filename

    if (filename) {
      files.push({ filename, label: sizeName })
    }
  }

  if (doc.filename) {
    files.push({ filename: doc.filename, label: "original" })
  }

  return files.filter(
    (file, index, allFiles) =>
      allFiles.findIndex((candidate) => candidate.filename === file.filename) ===
      index
  )
}

async function objectExists({
  bucket,
  client,
  key,
}: {
  bucket: string
  client: S3Client
  key: string
}) {
  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1,
      Prefix: key,
    })
  )

  return Boolean(result.Contents?.some((object) => object.Key === key))
}

function wait(delay: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delay))
}

async function deleteAndVerify({
  bucket,
  client,
  key,
  label,
  logger,
}: {
  bucket: string
  client: S3Client
  key: string
  label: string
  logger: {
    info: (data: { msg: string }) => void
    warn: (data: { err: unknown; msg: string }) => void
  }
}) {
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_DELETE_ATTEMPTS; attempt += 1) {
    try {
      const existsBeforeDelete = await objectExists({ bucket, client, key })

      if (!existsBeforeDelete) {
        logger.info({
          msg: `Media S3 object already absent (${label}): ${key}`,
        })
        return
      }

      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      )

      const existsAfterDelete = await objectExists({ bucket, client, key })

      if (existsAfterDelete) {
        throw new Error(`S3 object still exists after deletion: ${key}`)
      }

      logger.info({
        msg: `Media S3 object deleted and verified (${label}): ${key}`,
      })
      return
    } catch (error) {
      lastError = error

      if (attempt < MAX_DELETE_ATTEMPTS) {
        logger.warn({
          err: error,
          msg: `Media S3 deletion attempt ${attempt}/${MAX_DELETE_ATTEMPTS} failed (${label}): ${key}`,
        })
        await wait(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      }
    }
  }

  throw new Error(
    `Unable to delete and verify S3 media object (${label}): ${key}`,
    { cause: lastError }
  )
}

export const deleteMediaFilesFromS3: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  const storage = getStorageConfig()

  if (!storage) {
    return doc
  }

  const media = doc as MediaDocument
  const files = getFilesInSafeDeleteOrder(media)

  for (const file of files) {
    await deleteAndVerify({
      ...storage,
      key: getObjectKey(file.filename, media.prefix),
      label: file.label,
      logger: req.payload.logger,
    })
  }

  return doc
}
