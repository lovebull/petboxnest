export type ProductOptionRow = {
  title?: string | null;
  values?: ({ id?: string | null; value?: string | null } | null)[] | null;
} | null;

export function toOptionValues(
  options: ProductOptionRow[] | null | undefined,
): string[] {
  const flattened = (options ?? []).flatMap((option) => {
    const title = option?.title?.trim();

    if (!title) {
      return [];
    }

    return (option?.values ?? [])
      .map((optionValue) => optionValue?.value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => `${title}:${value}`);
  });

  return Array.from(new Set(flattened));
}

export function toOptionValueIds(
  options: ProductOptionRow[] | null | undefined,
): string[] {
  return Array.from(
    new Set(
      (options ?? [])
        .flatMap((option) => option?.values ?? [])
        .map((optionValue) => optionValue?.id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  );
}
