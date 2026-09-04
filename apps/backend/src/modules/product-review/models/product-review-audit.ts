import { model } from "@medusajs/framework/utils"

const ProductReviewAudit = model.define(
  { tableName: "pbn_product_review_audit", name: "ProductReviewAudit" },
  {
    id: model.id({ prefix: "praudit" }).primaryKey(),
    review_id: model.text(),
    admin_user_id: model.text(),
    action: model.enum(["approve", "flag", "restore_pending", "reply_upserted", "reply_deleted"]),
    previous_status: model.enum(["pending", "approved", "flagged"]).nullable(),
    new_status: model.enum(["pending", "approved", "flagged"]).nullable(),
    reason: model.text().nullable(),
    batch_id: model.text().nullable(),
  }
)

export default ProductReviewAudit
