import type {
  RemoteQueryFunction,
  SearchTypes,
} from "@medusajs/framework/types";

const RESOLVE_BATCH_SIZE = 200;

function payloadIds(data: unknown): string[] {
  return (Array.isArray(data) ? data : [data])
    .map((entry) => (entry as { id?: string } | undefined)?.id)
    .filter((id): id is string => Boolean(id));
}

async function relatedProductIds(
  query: RemoteQueryFunction,
  entity: string,
  fields: string[],
  ids: string[],
  pick: (row: Record<string, any>) => (string | null | undefined)[],
  withDeleted: boolean,
): Promise<string[]> {
  const { data } = await query.graph({
    entity,
    fields,
    filters: { id: ids },
    withDeleted,
  });

  return (data as Record<string, any>[])
    .flatMap(pick)
    .filter((id): id is string => Boolean(id));
}

async function productIdsInSalesChannels(
  query: RemoteQueryFunction,
  salesChannelIds: string[],
): Promise<string[]> {
  const ids: string[] = [];
  let skip = 0;

  while (true) {
    const { search_result: result } = await query.search({
      entity: "product",
      fields: ["id"],
      filters: { sales_channel_ids: salesChannelIds },
      pagination: { skip, take: RESOLVE_BATCH_SIZE },
    });

    ids.push(...result.hits.map((hit) => hit.id));

    if (result.hits.length < RESOLVE_BATCH_SIZE) {
      return ids;
    }

    skip += RESOLVE_BATCH_SIZE;
  }
}

export async function resolveProductIds(
  event: { name: string; data: unknown },
  { container: { query } }: SearchTypes.SearchIngestionContext,
): Promise<string[]> {
  const ids = payloadIds(event.data);

  if (!ids.length) {
    return [];
  }

  const [entity] = event.name.split(".");
  const deleted = event.name.endsWith(".deleted");

  switch (entity) {
    case "product":
      return ids;
    case "product-variant":
      return relatedProductIds(
        query,
        "product_variant",
        ["product_id"],
        ids,
        (row) => [row.product_id],
        deleted,
      );
    case "product-option":
      return relatedProductIds(
        query,
        "product_option",
        ["product_id"],
        ids,
        (row) => [row.product_id],
        deleted,
      );
    case "product-option-value":
      return relatedProductIds(
        query,
        "product_option_value",
        ["option.product_id"],
        ids,
        (row) => [row.option?.product_id],
        deleted,
      );
    case "product-tag":
      return relatedProductIds(
        query,
        "product_tag",
        ["products.id"],
        ids,
        (row) => (row.products ?? []).map((product: any) => product?.id),
        deleted,
      );
    case "product-category":
      return relatedProductIds(
        query,
        "product_category",
        ["products.id"],
        ids,
        (row) => (row.products ?? []).map((product: any) => product?.id),
        deleted,
      );
    case "sales-channel":
      return productIdsInSalesChannels(query, ids);
    default:
      return [];
  }
}
