import { ModuleProvider, Modules } from "@medusajs/framework/utils"

import DatedLocalFileService from "./service"

export default ModuleProvider(Modules.FILE, {
  services: [DatedLocalFileService],
})
