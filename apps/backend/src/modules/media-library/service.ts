import { MedusaService } from "@medusajs/framework/utils"
import { MediaAsset } from "./models"

class MediaLibraryModuleService extends MedusaService({
  MediaAsset,
}) {}

export default MediaLibraryModuleService
