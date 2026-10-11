import type { SearchTypes } from "@medusajs/framework/types";
import {
  defineSearchIndex,
  graphConsume,
  graphSeed,
  search,
} from "@medusajs/framework/utils";

import {
  ProductOptionRow,
  toOptionValueIds,
  toOptionValues,
} from "./helpers/option-values";
import { loadPricing, priceFields, toProductPricing } from "./helpers/pricing";
import { resolveProductIds } from "./helpers/resolve-product-ids";

const PRODUCT_GRAPH_FIELDS = [
  "id",
  "title",
  "subtitle",
  "description",
  "handle",
  "thumbnail",
  "status",
  "created_at",
  "sales_channels.id",
  "collection.id",
  "categories.id",
  "categories.name",
  "tags.value",
  "variants.sku",
  "options.title",
  "options.values.id",
  "options.values.value",
];

type ProductRow = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  handle?: string | null;
  thumbnail?: string | null;
  status?: string | null;
  created_at?: string | Date | null;
  deleted_at?: string | Date | null;
  sales_channels?: ({ id?: string | null } | null)[] | null;
  collection?: { id?: string | null } | null;
  categories?: ({ id?: string | null; name?: string | null } | null)[] | null;
  tags?: ({ value?: string | null } | null)[] | null;
  variants?: ({ sku?: string | null } | null)[] | null;
  options?: ProductOptionRow[] | null;
};

const productFields = search.define({
  id: search.keyword().filterable().retrievable(),
  status: search.keyword().filterable().retrievable(false),
  sales_channel_ids: search.keyword().array().filterable().retrievable(false),
  collection_id: search.keyword().filterable().retrievable(false),
  category_ids: search.keyword().array().filterable().retrievable(false),
  title: search.text().searchable({ weight: 3 }).sortable().retrievable(),
  content: search.text().searchable({ weight: 2 }).retrievable(false),
  description: search.text().searchable({ weight: 1 }),
  handle: search.keyword().retrievable(),
  thumbnail: search.keyword().retrievable(),
  created_at: search.date().sortable().retrievable(),
  category: search.keyword().array().filterable().facetable().retrievable(),
  labels: search.keyword().array().filterable().facetable().retrievable(),
  option_values: search
    .keyword()
    .array()
    .searchable({ weight: 2 })
    .filterable()
    .facetable()
    .retrievable(),
  option_value_ids: search.keyword().array().filterable().retrievable(false),
  pet_types: search.keyword().array().filterable().facetable().retrievable(),
  ...priceFields,
});

type ProductDocument = SearchTypes.InferSearchDocumentType<
  typeof productFields
>;

function toDocument(
  product: ProductRow,
  pricing: Parameters<typeof toProductPricing>[0],
): ProductDocument {
  const category = (product.categories ?? [])
    .map((productCategory) => productCategory?.name?.trim())
    .filter((name): name is string => Boolean(name));
  const labels = (product.tags ?? [])
    .map((tag) => tag?.value?.trim())
    .filter((value): value is string => Boolean(value));
  const salesChannelIds = (product.sales_channels ?? [])
    .map((salesChannel) => salesChannel?.id?.trim())
    .filter((id): id is string => Boolean(id));
  const categoryIds = (product.categories ?? [])
    .map((productCategory) => productCategory?.id?.trim())
    .filter((id): id is string => Boolean(id));
  const variantSkus = (product.variants ?? [])
    .map((variant) => variant?.sku?.trim())
    .filter((sku): sku is string => Boolean(sku));
  const content = [
    product.subtitle,
    ...variantSkus,
    ...category,
    ...labels,
  ]
    .filter(Boolean)
    .join(" ");
  const petText = [product.title, product.description, content]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const petTypes = [
    /\b(cat|cats|kitty|kitten|feline|litter)\b/.test(petText)
      ? "cats"
      : null,
    /\b(dog|dogs|puppy|canine)\b/.test(petText) ? "dogs" : null,
  ].filter((value): value is string => Boolean(value));

  return {
    id: product.id,
    status: product.status ?? null,
    sales_channel_ids: salesChannelIds,
    collection_id: product.collection?.id ?? null,
    category_ids: categoryIds,
    title: product.title ?? null,
    content,
    description: product.description ?? null,
    handle: product.handle ?? null,
    thumbnail: product.thumbnail ?? null,
    created_at: product.created_at ?? null,
    category,
    labels,
    option_values: toOptionValues(product.options),
    option_value_ids: toOptionValueIds(product.options),
    pet_types: petTypes,
    ...toProductPricing(pricing),
  };
}

const source = {
  fields: PRODUCT_GRAPH_FIELDS,
  transform: async (
    rows: ProductRow[],
    context: SearchTypes.SearchIngestionContext,
  ) => {
    const pricing = await loadPricing(
      rows.map((row) => row.id),
      context,
    );

    return rows.map((row) => toDocument(row, pricing.get(row.id)));
  },
};

const PRODUCT_EVENTS = [
  "product.created",
  "product.updated",
  "product.deleted",
  "product-variant.created",
  "product-variant.updated",
  "product-variant.deleted",
  "product-option.created",
  "product-option.updated",
  "product-option.deleted",
  "product-option-value.updated",
  "product-option-value.deleted",
  "product-tag.updated",
  "product-tag.deleted",
  "product-category.updated",
  "product-category.deleted",
  "sales-channel.deleted",
];

export default defineSearchIndex({
  name: "product",
  entity: "product",
  primary_key: "id",
  fields: productFields,
  settings: {
    typo_tolerance: { enabled: true },
  },
  events: PRODUCT_EVENTS,
  consume: graphConsume<typeof productFields, ProductRow>({
    ...source,
    resolve_ids: resolveProductIds,
    is_delete: (event) => event.name === "product.deleted",
  }),
  seed: graphSeed<typeof productFields, ProductRow>(source),
});
