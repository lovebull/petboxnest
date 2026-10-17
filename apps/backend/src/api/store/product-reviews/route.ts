import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review";
import type ProductReviewModuleService from "../../../modules/product-review/service";
import {
  listReviews,
  pagination,
  type ReviewListQuery,
} from "../../product-review-helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewModuleService>(
    PRODUCT_REVIEW_MODULE,
  );
  const query = req.validatedQuery as ReviewListQuery;
  const { reviews, count } = await listReviews(service, query, {
    status: "approved",
  });

  const productIds = [...new Set(reviews.map((review) => review.product_id))];
  const graph = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: products } = productIds.length
    ? await graph.graph({
        entity: "product",
        fields: ["id", "title", "handle", "thumbnail"],
        filters: { id: productIds },
      })
    : { data: [] };
  const productMap = new Map(products.map((product) => [product.id, product]));

  res.json({
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      reviewer_name: review.reviewer_name,
      created_at: review.created_at,
      product: productMap.get(review.product_id) || null,
    })),
    ...pagination(count, query.page, query.limit),
  });
}
