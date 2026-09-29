import { Module } from "@medusajs/framework/utils"
import MediaLibraryModuleService from "./service"

export const MEDIA_LIBRARY_MODULE = "mediaLibrary"

export default Module(MEDIA_LIBRARY_MODULE, {
  service: MediaLibraryModuleService,
})
