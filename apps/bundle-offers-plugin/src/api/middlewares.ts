import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { UpsertBundleOfferSchema } from "./validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/bundle-offers",
      method: "POST",
      middlewares: [validateAndTransformBody(UpsertBundleOfferSchema)],
    },
    {
      matcher: "/admin/bundle-offers/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(UpsertBundleOfferSchema)],
    },
  ],
})
