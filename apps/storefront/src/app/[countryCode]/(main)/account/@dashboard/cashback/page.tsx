import { listCashbackEntries, listStoreCreditAccounts } from "@lib/data/store-credit"
import Cashback from "@modules/account/components/cashback"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cashback",
  description: "View your available credit and cashback activity.",
}

export default async function CashbackPage() {
  const [accounts, entries] = await Promise.all([
    listStoreCreditAccounts(),
    listCashbackEntries(),
  ])

  return <Cashback accounts={accounts} entries={entries} />
}
