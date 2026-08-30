import type { FileTypes, LocalFileServiceOptions } from "@medusajs/framework/types"
import { LocalFileService } from "@medusajs/medusa/file-local"
import path from "path"

const getDatedFilename = (filename: string) => {
  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const parsed = path.parse(filename)

  return path.join(year, month, parsed.base)
}

class DatedLocalFileService extends LocalFileService {
  static identifier = "localfs"

  constructor(container: any, options: LocalFileServiceOptions) {
    super(container, options)
  }

  async upload(file: FileTypes.ProviderUploadFileDTO) {
    return super.upload({
      ...file,
      filename: getDatedFilename(file.filename),
    })
  }

  async getUploadStream(fileData: FileTypes.ProviderUploadStreamDTO) {
    return super.getUploadStream({
      ...fileData,
      filename: getDatedFilename(fileData.filename),
    })
  }

  async getPresignedUploadUrl(
    fileData: FileTypes.ProviderGetPresignedUploadUrlDTO
  ) {
    return super.getPresignedUploadUrl({
      ...fileData,
      filename: getDatedFilename(fileData.filename),
    })
  }
}

export default DatedLocalFileService
