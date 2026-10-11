import type { SearchTypes } from "@medusajs/framework/types";
import { QueryContext, search } from "@medusajs/framework/utils";

export const PRICE_CURRENCIES = ["eur", "usd"] as const;

export type PriceCurrency = (typeof PRICE_CURRENCIES)[number];

const PRICE_GRAPH_FIELDS = [
  "id",
  "variants.calculated_price.calculated_amount",
  "variants.calculated_price.original_amount",
];

const pricingContext = (currency: PriceCurrency) => ({
  variants: {
    calculated_price: QueryContext({ currency_code: currency }),
  },
});

type PricedVariant = {
  calculated_price?: {
    calculated_amount?: number | null;
    original_amount?: number | null;
  } | null;
  [key: string]: unknown;
} | null;

export type ProductPricingRows = Partial<
  Record<PriceCurrency, PricedVariant[] | null>
>;

type PriceFieldName =
  `${"min_price" | "max_price" | "original_price"}_${PriceCurrency}`;
type OnSaleFieldName = `on_sale_${PriceCurrency}`;

export type ProductPricing = { [K in PriceFieldName]?: number | null } & {
  [K in OnSaleFieldName]?: boolean | null;
};

type PriceFields = {
  [K in PriceFieldName]: ReturnType<typeof search.float>;
} & { [K in OnSaleFieldName]: ReturnType<typeof search.boolean> };

export const priceFields = Object.fromEntries(
  PRICE_CURRENCIES.flatMap((currency) => [
    [
      `min_price_${currency}`,
      search
        .float()
        .filterable()
        .sortable()
        .facetable({ types: ["stats"] })
        .retrievable(),
    ],
    [
      `max_price_${currency}`,
      search
        .float()
        .filterable()
        .sortable()
        .facetable({ types: ["stats"] })
        .retrievable(),
    ],
    [`original_price_${currency}`, search.float().retrievable()],
    [
      `on_sale_${currency}`,
      search.boolean().filterable().facetable().retrievable(),
    ],
  ]),
) as PriceFields;

function toPricing(
  currency: PriceCurrency,
  variants: PricedVariant[] | null | undefined,
): ProductPricing {
  let cheapest: { calculated: number; original: number } | undefined;
  let maxPrice: number | undefined;

  for (const variant of variants ?? []) {
    const price = variant?.calculated_price;
    const calculated = price?.calculated_amount;

    if (typeof calculated !== "number") {
      continue;
    }

    const original =
      typeof price?.original_amount === "number"
        ? price.original_amount
        : calculated;

    if (maxPrice === undefined || calculated > maxPrice) {
      maxPrice = calculated;
    }

    if (!cheapest || calculated < cheapest.calculated) {
      cheapest = { calculated, original };
    }
  }

  if (!cheapest) {
    return {};
  }

  return {
    [`min_price_${currency}`]: cheapest.calculated,
    [`max_price_${currency}`]: maxPrice ?? cheapest.calculated,
    [`original_price_${currency}`]: cheapest.original,
    [`on_sale_${currency}`]: cheapest.original > cheapest.calculated,
  } as ProductPricing;
}

export function toProductPricing(
  pricingRows: ProductPricingRows | undefined,
): ProductPricing {
  return Object.assign(
    {},
    ...PRICE_CURRENCIES.map((currency) =>
      toPricing(currency, pricingRows?.[currency]),
    ),
  );
}

export async function loadPricing(
  ids: string[],
  { container }: SearchTypes.SearchIngestionContext,
): Promise<Map<string, ProductPricingRows>> {
  const pricing = new Map<string, ProductPricingRows>();

  if (!ids.length) {
    return pricing;
  }

  await Promise.all(
    PRICE_CURRENCIES.map(async (currency) => {
      const { data } = await container.query.graph({
        entity: "product",
        fields: PRICE_GRAPH_FIELDS,
        filters: { id: ids },
        context: pricingContext(currency),
      });

      for (const product of data) {
        const rows = pricing.get(product.id) ?? {};
        rows[currency] = product.variants as PricedVariant[] | null;
        pricing.set(product.id, rows);
      }
    }),
  );

  return pricing;
}
