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
    <div className="w-full" data-testid="cashback-page">
      <div className="mb-8 flex flex-col gap-y-1">
        <Heading level="h1" className="text-2xl-semi">Cashback</Heading>
        <Text className="text-base-regular text-ui-fg-subtle">
          Available credit can be applied during checkout.
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-6 border-y border-gray-200 py-6 small:grid-cols-2">
        <Balance label="Available balance" amount={balance} currency={currency} />
        <Balance label="Pending cashback" amount={pending} currency={currency} />
      </div>

      <div className="mt-8">
        <Heading level="h2" className="mb-4 text-xl-semi">Activity</Heading>
        {entries.length ? (
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {entries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-[1fr_auto] gap-4 py-4">
                <div>
                  <Text className="text-base-semi">Order #{entry.order_display_id}</Text>
                  <Text className="text-small-regular text-ui-fg-subtle">
                    {labels[entry.status]} · {new Date(entry.created_at).toLocaleDateString("en-US")}
                  </Text>
                </div>
                <Text className="text-base-semi">
                  {convertToLocale({
                    amount: Number(entry.pending_amount || entry.credited_amount),
                    currency_code: entry.currency_code,
                  })}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text className="border-y border-gray-200 py-6 text-ui-fg-subtle">
            No cashback activity yet.
          </Text>
        )}
      </div>
    </div>
  )
}

const Balance = ({ label, amount, currency }: { label: string; amount: number; currency: string }) => (
  <div>
    <Text className="text-small-regular text-ui-fg-subtle">{label}</Text>
    <Text className="mt-1 text-2xl-semi">
      {convertToLocale({ amount, currency_code: currency })}
    </Text>
  </div>
)
