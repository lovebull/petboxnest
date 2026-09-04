import {
  InjectManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils"
import type { Context } from "@medusajs/framework/types"
import { ProductReview, ProductReviewAudit, ProductReviewReply, ProductReviewStats } from "./models"

class ProductReviewModuleService extends MedusaService({
  ProductReview,
  ProductReviewAudit,
  ProductReviewReply,
  ProductReviewStats,
}) {
  @InjectManager()
  async searchProductReviewIds(
    search: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<string[]> {
    const manager = sharedContext.manager as {
      getConnection: () => {
        execute: (sql: string, parameters: unknown[]) => Promise<Array<{ id: string }>>
      }
    }
    const rows = await manager.getConnection().execute(
      `select review.id
       from pbn_product_review review
       where review.deleted_at is null
         and (
           to_tsvector('english', coalesce(review.title, '') || ' ' || review.content || ' ' || review.reviewer_name)
             @@ websearch_to_tsquery('english', ?)
           or exists (
             select 1 from pbn_product_review_reply reply
             where reply.review_id = review.id
               and reply.deleted_at is null
               and to_tsvector('english', reply.content) @@ websearch_to_tsquery('english', ?)
           )
         )`,
      [search, search]
    )
    return rows.map((row) => row.id)
  }

  @InjectManager()
  async getProductReviewSummary(
    @MedusaContext() sharedContext: Context = {}
  ): Promise<{
    total: number
    pending: number
    approved: number
    flagged: number
    average_rating: number
  }> {
    const manager = sharedContext.manager as {
      getConnection: () => {
        execute: (sql: string) => Promise<Array<Record<string, string | number>>>
      }
    }
    const [row] = await manager.getConnection().execute(
      `select
         count(*)::integer as total,
         count(*) filter (where status = 'pending')::integer as pending,
         count(*) filter (where status = 'approved')::integer as approved,
         count(*) filter (where status = 'flagged')::integer as flagged,
         coalesce(round(avg(rating) filter (where status = 'approved'), 2), 0)::double precision as average_rating
       from pbn_product_review
       where deleted_at is null`
    )
    return {
      total: Number(row.total),
      pending: Number(row.pending),
      approved: Number(row.approved),
      flagged: Number(row.flagged),
      average_rating: Number(row.average_rating),
    }
  }
}

export default ProductReviewModuleService
