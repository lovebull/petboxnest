export const formatAmount = (amount: number | string, currencyCode = "usd") => {
  const value = Number(amount || 0)
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      maximumFractionDigits: 4,
    }).format(value)
  } catch {
    return `${currencyCode.toUpperCase()} ${value.toFixed(2)}`
  }
}

export const formatDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("zh-CN") : "—"
