import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, ReactNode, useEffect, useState } from "react"

import { sdk } from "../../../lib/sdk"

type CashbackRule = {
  name: string
  is_active: boolean
  reward_type: "percentage" | "fixed"
  reward_value: number
  currency_code: string
  minimum_order_amount: number
  maximum_cashback_amount: number | null
  waiting_days: number
  starts_at: string | null
  ends_at: string | null
}

type CashbackEntry = {
  id: string
  order_display_id: number | null
  currency_code: string
  pending_amount: number
  credited_amount: number
  status: string
  available_at: string
}

const statusColors: Record<string, "green" | "orange" | "red" | "grey"> = {
  pending: "orange",
  available: "green",
  partially_reversed: "orange",
  reversed: "red",
  cancelled: "grey",
}

const statusLabels: Record<string, { zh: string; en: string }> = {
  pending: { zh: "待结算", en: "Pending" },
  available: { zh: "已到账", en: "Available" },
  partially_reversed: { zh: "部分冲正", en: "Partially reversed" },
  reversed: { zh: "已冲正", en: "Reversed" },
  cancelled: { zh: "已取消", en: "Cancelled" },
}

const CashbackSettingsPage = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CashbackRule | null>(null)

  const settingsQuery = useQuery({
    queryKey: ["cashback-settings"],
    queryFn: () =>
      sdk.client.fetch<{ cashback_rule: CashbackRule }>(
        "/admin/cashback/settings"
      ),
  })
  const entriesQuery = useQuery({
    queryKey: ["cashback-entries"],
    queryFn: () =>
      sdk.client.fetch<{ cashback_entries: CashbackEntry[] }>(
        "/admin/cashback/entries",
        { query: { limit: 20, offset: 0 } }
      ),
  })

  useEffect(() => {
    if (settingsQuery.data?.cashback_rule) {
      setForm(settingsQuery.data.cashback_rule)
    }
  }, [settingsQuery.data])

  const saveMutation = useMutation({
    mutationFn: (value: CashbackRule) =>
      sdk.client.fetch("/admin/cashback/settings", {
        method: "POST",
        body: value,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cashback-settings"] })
      toast.success("返现设置已保存 / Cashback settings saved")
    },
    onError: (error: Error) =>
      toast.error(`保存失败 / Save failed: ${error.message}`),
  })

  const reconcileMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/cashback/entries/${id}/reconcile`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cashback-entries"] })
      toast.success("返现记录已核对 / Cashback entry reconciled")
    },
    onError: (error: Error) =>
      toast.error(`核对失败 / Reconcile failed: ${error.message}`),
  })

  const update = <K extends keyof CashbackRule>(
    key: K,
    value: CashbackRule[K]
  ) => setForm((current) => (current ? { ...current, [key]: value } : current))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (form) {
      const payload: CashbackRule = {
        name: form.name,
        is_active: form.is_active,
        reward_type: form.reward_type,
        reward_value: Number(form.reward_value),
        currency_code: form.currency_code.toLowerCase(),
        minimum_order_amount: Number(form.minimum_order_amount),
        maximum_cashback_amount:
          form.maximum_cashback_amount === null
            ? null
            : Number(form.maximum_cashback_amount),
        waiting_days: Number(form.waiting_days),
        starts_at: form.starts_at,
        ends_at: form.ends_at,
      }
      saveMutation.mutate(payload)
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">返现</Heading>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Cashback
            </Text>
            <Text size="small" leading="compact" className="mt-2">
              使用客户购物金奖励已完成的订单。
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Reward completed orders with customer store credit.
            </Text>
          </div>
          {form && (
            <div className="flex items-center gap-x-2">
              <Label htmlFor="cashback-active">
                <BilingualText zh="启用" en="Active" />
              </Label>
              <Switch
                id="cashback-active"
                checked={form.is_active}
                onCheckedChange={(checked) => update("is_active", checked)}
              />
            </div>
          )}
        </div>

        {form ? (
          <form
            onSubmit={submit}
            className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2"
          >
            <Field label="规则名称" labelEn="Rule name">
              <Input value={form.name} onChange={(event) => update("name", event.target.value)} required />
            </Field>
            <Field label="奖励类型" labelEn="Reward type">
              <Select
                value={form.reward_type}
                onValueChange={(value) => update("reward_type", value as CashbackRule["reward_type"])}
              >
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="percentage">
                    <BilingualText zh="百分比" en="Percentage" />
                  </Select.Item>
                  <Select.Item value="fixed">
                    <BilingualText zh="固定金额" en="Fixed amount" />
                  </Select.Item>
                </Select.Content>
              </Select>
            </Field>
            <Field
              label={form.reward_type === "percentage" ? "返现比例" : "返现金额"}
              labelEn={form.reward_type === "percentage" ? "Percentage" : "Amount"}
            >
              <Input
                type="number"
                min="0.01"
                max={form.reward_type === "percentage" ? "100" : undefined}
                step="0.01"
                value={form.reward_value}
                onChange={(event) => update("reward_value", Number(event.target.value))}
                required
              />
            </Field>
            <Field label="币种" labelEn="Currency">
              <Input
                value={form.currency_code.toUpperCase()}
                maxLength={3}
                onChange={(event) => update("currency_code", event.target.value)}
                required
              />
            </Field>
            <Field label="最低订单金额" labelEn="Minimum order amount">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.minimum_order_amount}
                onChange={(event) => update("minimum_order_amount", Number(event.target.value))}
              />
            </Field>
            <Field
              label="最高返现金额（可选）"
              labelEn="Maximum cashback (optional)"
            >
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.maximum_cashback_amount ?? ""}
                onChange={(event) =>
                  update("maximum_cashback_amount", event.target.value ? Number(event.target.value) : null)
                }
              />
            </Field>
            <Field label="等待期（天）" labelEn="Waiting period (days)">
              <Input
                type="number"
                min="0"
                max="365"
                value={form.waiting_days}
                onChange={(event) => update("waiting_days", Number(event.target.value))}
              />
            </Field>
            <div className="flex items-end justify-end">
              <Button
                type="submit"
                size="small"
                isLoading={saveMutation.isPending}
                disabled={saveMutation.isPending}
                className="h-auto py-1"
              >
                <BilingualButtonText zh="保存" en="Save" />
              </Button>
            </div>
          </form>
        ) : (
          <Text className="px-6 py-5 text-ui-fg-subtle">
            {settingsQuery.isError
              ? "无法加载返现设置。 / Unable to load cashback settings."
              : "加载中…… / Loading..."}
          </Text>
        )}
      </Container>

      <Container className="overflow-hidden p-0">
        <div className="px-6 py-4">
          <Heading level="h2">近期返现</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Recent cashback
          </Text>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                <BilingualText zh="订单" en="Order" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualText zh="状态" en="Status" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualText zh="待结算" en="Pending" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualText zh="已入账" en="Credited" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualText zh="可用日期" en="Available" />
              </Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                <BilingualText zh="操作" en="Action" align="right" />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(entriesQuery.data?.cashback_entries || []).map((entry) => (
              <Table.Row key={entry.id}>
                <Table.Cell>#{entry.order_display_id || entry.id.slice(-8)}</Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col items-start gap-y-1">
                    <Badge color={statusColors[entry.status] || "grey"}>
                      {statusLabels[entry.status]?.zh || entry.status}
                    </Badge>
                    <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                      {statusLabels[entry.status]?.en || entry.status}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>{formatMoney(entry.pending_amount, entry.currency_code)}</Table.Cell>
                <Table.Cell>{formatMoney(entry.credited_amount, entry.currency_code)}</Table.Cell>
                <Table.Cell>{new Date(entry.available_at).toLocaleDateString()}</Table.Cell>
                <Table.Cell className="text-right">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => reconcileMutation.mutate(entry.id)}
                    isLoading={reconcileMutation.isPending && reconcileMutation.variables === entry.id}
                  >
                    <BilingualButtonText zh="核对" en="Reconcile" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {!entriesQuery.isPending && !entriesQuery.data?.cashback_entries.length && (
          <Text className="px-6 py-5 text-ui-fg-subtle">
            暂无返现记录。 / No cashback entries yet.
          </Text>
        )}
      </Container>
    </div>
  )
}

const BilingualText = ({
  zh,
  en,
  align = "left",
}: {
  zh: string
  en: string
  align?: "left" | "right"
}) => (
  <div
    className={`flex flex-col gap-y-0.5 ${
      align === "right" ? "items-end" : "items-start"
    }`}
  >
    <Text size="small" leading="compact" weight="plus">
      {zh}
    </Text>
    <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
      {en}
    </Text>
  </div>
)

const BilingualButtonText = ({ zh, en }: { zh: string; en: string }) => (
  <div className="flex flex-col items-center">
    <Text size="xsmall" leading="compact" weight="plus">
      {zh}
    </Text>
    <Text size="xsmall" leading="compact">
      {en}
    </Text>
  </div>
)

const Field = ({
  label,
  labelEn,
  children,
}: {
  label: string
  labelEn: string
  children: ReactNode
}) => (
  <div className="flex flex-col gap-y-2">
    <Label>
      <BilingualText zh={label} en={labelEn} />
    </Label>
    {children}
  </div>
)

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(amount || 0))

export const config = defineRouteConfig({ label: "返现 / Cashback" })

export default CashbackSettingsPage
