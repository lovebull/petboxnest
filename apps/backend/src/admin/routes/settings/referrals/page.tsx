import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, ReactNode, useEffect, useState } from "react"

import { sdk } from "../../../lib/sdk"

type ReferralProgram = {
  name: string
  is_active: boolean
  commission_percentage: number
  referee_discount_percentage: number
  promotion_code: string
  currency_code: string
  minimum_order_amount: number
  maximum_commission_amount: number | null
  waiting_days: number
  attribution_days: number
  stack_with_cashback: boolean
}

type ReferralConversion = {
  id: string
  order_display_id: string
  currency_code: string
  commission_amount: number
  credited_amount: number
  reversal_due: number
  status: string
  available_at: string
}

const statusColors: Record<string, "green" | "orange" | "red" | "grey"> = {
  pending: "orange",
  paid: "green",
  partially_reversed: "orange",
  reversed: "red",
  cancelled: "grey",
}

const statusLabels: Record<string, { zh: string; en: string }> = {
  pending: { zh: "待结算", en: "Pending" },
  paid: { zh: "已支付", en: "Paid" },
  partially_reversed: { zh: "部分冲正", en: "Partially reversed" },
  reversed: { zh: "已冲正", en: "Reversed" },
  cancelled: { zh: "已取消", en: "Cancelled" },
}

const ReferralSettingsPage = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ReferralProgram | null>(null)
  const settingsQuery = useQuery({
    queryKey: ["referral-settings"],
    queryFn: () =>
      sdk.client.fetch<{ referral_program: ReferralProgram }>(
        "/admin/referrals/settings"
      ),
  })
  const conversionsQuery = useQuery({
    queryKey: ["referral-conversions"],
    queryFn: () =>
      sdk.client.fetch<{
        referral_conversions: ReferralConversion[]
        count: number
      }>("/admin/referrals/conversions", {
        query: { limit: 20, offset: 0 },
      }),
  })

  useEffect(() => {
    if (settingsQuery.data?.referral_program) {
      setForm(settingsQuery.data.referral_program)
    }
  }, [settingsQuery.data])

  const saveMutation = useMutation({
    mutationFn: (value: ReferralProgram) =>
      sdk.client.fetch("/admin/referrals/settings", {
        method: "POST",
        body: value,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["referral-settings"] })
      toast.success("推荐设置已保存 / Referral settings saved")
    },
    onError: (error: Error) =>
      toast.error(`保存失败 / Save failed: ${error.message}`),
  })
  const reconcileMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/referrals/conversions/${id}/reconcile`, {
        method: "POST",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["referral-conversions"] })
      toast.success("佣金已核对 / Commission reconciled")
    },
    onError: (error: Error) =>
      toast.error(`核对失败 / Reconcile failed: ${error.message}`),
  })

  const update = <K extends keyof ReferralProgram>(
    key: K,
    value: ReferralProgram[K]
  ) => setForm((current) => (current ? { ...current, [key]: value } : current))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (form) {
      const payload: ReferralProgram = {
        name: form.name,
        is_active: form.is_active,
        commission_percentage: Number(form.commission_percentage),
        referee_discount_percentage: Number(
          form.referee_discount_percentage
        ),
        promotion_code: form.promotion_code.toUpperCase(),
        currency_code: form.currency_code.toLowerCase(),
        minimum_order_amount: Number(form.minimum_order_amount),
        maximum_commission_amount:
          form.maximum_commission_amount === null
            ? null
            : Number(form.maximum_commission_amount),
        waiting_days: Number(form.waiting_days),
        attribution_days: Number(form.attribution_days),
        stack_with_cashback: form.stack_with_cashback,
      }
      saveMutation.mutate(payload)
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">客户推荐</Heading>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Customer referrals
            </Text>
            <Text size="small" leading="compact" className="mt-2">
              管理首单折扣、佣金台账及购物金结算。
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              First-order discount, commission ledger, and store-credit settlement.
            </Text>
          </div>
          {form && (
            <div className="flex items-center gap-x-2">
              <Label htmlFor="referral-active">
                <BilingualText zh="启用" en="Active" />
              </Label>
              <Switch
                id="referral-active"
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
            <Field label="计划名称" labelEn="Program name">
              <Input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                required
              />
            </Field>
            <Field label="促销代码" labelEn="Promotion code">
              <Input
                value={form.promotion_code}
                onChange={(event) => update("promotion_code", event.target.value)}
                required
              />
            </Field>
            <NumberField
              label="好友首单折扣（%）"
              labelEn="Friend first-order discount (%)"
              value={form.referee_discount_percentage}
              min={1}
              max={100}
              step={1}
              onChange={(value) => update("referee_discount_percentage", value)}
            />
            <NumberField
              label="推荐人佣金（%）"
              labelEn="Referrer commission (%)"
              value={form.commission_percentage}
              min={0}
              max={100}
              step={1}
              onChange={(value) => update("commission_percentage", value)}
            />
            <Field label="币种" labelEn="Currency">
              <Input
                value={form.currency_code.toUpperCase()}
                maxLength={3}
                onChange={(event) => update("currency_code", event.target.value)}
                required
              />
            </Field>
            <NumberField
              label="最低订单金额"
              labelEn="Minimum order amount"
              value={form.minimum_order_amount}
              min={0}
              onChange={(value) => update("minimum_order_amount", value)}
            />
            <Field
              label="最高佣金（可选）"
              labelEn="Maximum commission (optional)"
            >
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={form.maximum_commission_amount ?? ""}
                onChange={(event) =>
                  update(
                    "maximum_commission_amount",
                    event.target.value ? Number(event.target.value) : null
                  )
                }
              />
            </Field>
            <NumberField
              label="等待期（天）"
              labelEn="Waiting period (days)"
              value={form.waiting_days}
              min={0}
              max={365}
              step={1}
              onChange={(value) => update("waiting_days", value)}
            />
            <NumberField
              label="归因有效期（天）"
              labelEn="Attribution window (days)"
              value={form.attribution_days}
              min={1}
              max={365}
              step={1}
              onChange={(value) => update("attribution_days", value)}
            />
            <div className="flex items-center justify-between rounded-md border border-ui-border-base px-3 py-2">
              <div>
                <Label htmlFor="stack-cashback">
                  <BilingualText zh="与返现叠加" en="Stack with cashback" />
                </Label>
                <Text size="xsmall" leading="compact" className="mt-1">
                  默认关闭，用于控制总激励成本。
                </Text>
                <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                  Disabled by default to control total incentive cost.
                </Text>
              </div>
              <Switch
                id="stack-cashback"
                checked={form.stack_with_cashback}
                onCheckedChange={(checked) => update("stack_with_cashback", checked)}
              />
            </div>
            <div className="flex items-end justify-end md:col-span-2">
              <Button
                type="submit"
                size="small"
                isLoading={saveMutation.isPending}
                disabled={saveMutation.isPending}
                className="h-auto py-1"
              >
                <BilingualButtonText
                  zh="保存并同步促销"
                  en="Save and sync promotion"
                />
              </Button>
            </div>
          </form>
        ) : (
          <Text className="px-6 py-5 text-ui-fg-subtle">
            {settingsQuery.isError
              ? "无法加载推荐设置。 / Unable to load referral settings."
              : "加载中…… / Loading..."}
          </Text>
        )}
      </Container>

      <Container className="overflow-hidden p-0">
        <div className="px-6 py-4">
          <Heading level="h2">近期佣金</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Recent commissions
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
                <BilingualText zh="佣金" en="Commission" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualText zh="已支付" en="Paid" />
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
            {(conversionsQuery.data?.referral_conversions || []).map((conversion) => (
              <Table.Row key={conversion.id}>
                <Table.Cell>#{conversion.order_display_id}</Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col items-start gap-y-1">
                    <Badge color={statusColors[conversion.status] || "grey"}>
                      {statusLabels[conversion.status]?.zh || conversion.status}
                    </Badge>
                    <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                      {statusLabels[conversion.status]?.en || conversion.status}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {formatMoney(conversion.commission_amount, conversion.currency_code)}
                </Table.Cell>
                <Table.Cell>
                  {formatMoney(conversion.credited_amount, conversion.currency_code)}
                </Table.Cell>
                <Table.Cell>
                  {new Date(conversion.available_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell className="text-right">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => reconcileMutation.mutate(conversion.id)}
                    isLoading={
                      reconcileMutation.isPending &&
                      reconcileMutation.variables === conversion.id
                    }
                  >
                    <BilingualButtonText zh="核对" en="Reconcile" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {!conversionsQuery.isPending &&
          !conversionsQuery.data?.referral_conversions.length && (
            <Text className="px-6 py-5 text-ui-fg-subtle">
              暂无推荐佣金。 / No referral commissions yet.
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
  <div className={`flex flex-col gap-y-0.5 ${align === "right" ? "items-end" : "items-start"}`}>
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

const NumberField = ({
  label,
  labelEn,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: {
  label: string
  labelEn: string
  value: number
  min: number
  max?: number
  step?: number
  onChange: (value: number) => void
}) => (
  <Field label={label} labelEn={labelEn}>
    <Input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
      required
    />
  </Field>
)

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(amount || 0))

export const config = defineRouteConfig({ label: "客户推荐 / Customer referrals" })

export default ReferralSettingsPage
