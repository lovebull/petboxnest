import { CashbackEntry, StoreCreditAccount } from "@lib/data/store-credit"
import { convertToLocale } from "@lib/util/money"
import { Heading, Text } from "@modules/common/components/ui"

const labels: Record<CashbackEntry["status"], string> = {
  pending: "Pending",
  available: "Available",
  partially_reversed: "Partially reversed",
  reversed: "Reversed",
  cancelled: "Cancelled",
}

export default function Cashback({
  accounts,
  entries,
}: {
  accounts: StoreCreditAccount[]
  entries: CashbackEntry[]
}) {
  const currency = accounts[0]?.currency_code || entries[0]?.currency_code || "usd"
  const balance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)
  const pending = entries
    .filter((entry) => entry.status === "pending")
    .reduce((sum, entry) => sum + Number(entry.pending_amount), 0)

  return (
    <div className="w-full space-y-8" data-testid="cashback-page">
      <div className="rounded-[22px] bg-cream p-5 xsmall:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Store credit
        </p>
        <Heading
          level="h1"
          className="mt-2 font-display text-3xl font-bold leading-tight text-ink"
        >
          Cashback
        </Heading>
        <Text className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Available credit can be applied during checkout.
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Balance label="Available balance" amount={balance} currency={currency} />
        <Balance label="Pending cashback" amount={pending} currency={currency} />
      </div>

      <div className="rounded-[22px] border border-[#E6E8EC] bg-white p-5">
        <Heading
          level="h2"
          className="mb-4 font-display text-2xl font-bold text-ink"
        >
          Activity
        </Heading>
        {entries.length ? (
          <div className="divide-y divide-[#E6E8EC]">
            {entries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[1fr_auto] gap-4 py-4">
                <div>
                  <Text className="font-bold text-ink">Order #{entry.order_display_id}</Text>
                  <Text className="text-sm text-muted">
                    {labels[entry.status]} · {new Date(entry.created_at).toLocaleDateString("en-US")}
                  </Text>
                </div>
                <Text className="font-bold text-ink">
                  {convertToLocale({
                    amount: Number(entry.pending_amount || entry.credited_amount),
                    currency_code: entry.currency_code,
                  })}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text className="rounded-[18px] border border-dashed border-brand/30 bg-cream p-6 text-center text-muted">
            No cashback activity yet.
          </Text>
        )}
      </div>
    </div>
  )
}

const Balance = ({ label, amount, currency }: { label: string; amount: number; currency: string }) => (
  <div className="rounded-[20px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.04)]">
    <Text className="text-sm font-bold text-muted">{label}</Text>
    <Text className="mt-2 font-display text-3xl font-bold text-ink">
      {convertToLocale({ amount, currency_code: currency })}
    </Text>
  </div>
)
