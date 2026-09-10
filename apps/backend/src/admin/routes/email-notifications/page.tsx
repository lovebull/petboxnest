import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EnvelopeSolid, Spinner } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

type NotificationStatus = "pending" | "success" | "failure"

type EmailNotification = Awaited<
  ReturnType<typeof sdk.admin.notification.list>
>["notifications"][number] & {
  from?: string | null
  status?: NotificationStatus
  external_id?: string | null
  provider_id?: string | null
}

const statusMeta: Record<
  NotificationStatus,
  { zh: string; en: string; color: "orange" | "green" | "red" }
> = {
  pending: { zh: "等待发送", en: "Pending", color: "orange" },
  success: { zh: "发送成功", en: "Success", color: "green" },
  failure: { zh: "发送失败", en: "Failure", color: "red" },
}

const templateLabels: Record<string, { zh: string; en: string }> = {
  "order-placed": { zh: "订单确认", en: "Order confirmation" },
  "password-reset": { zh: "密码重置", en: "Password reset" },
  "email-verification": { zh: "注册验证", en: "Email verification" },
}

const EmailNotificationsPage = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  const notificationsQuery = useQuery({
    queryKey: ["email-notifications", page, limit, query],
    queryFn: async () => {
      const result = await sdk.admin.notification.list({
        channel: "email",
        fields: "+status,+external_id,+provider_id,+from",
        limit,
        offset: (page - 1) * limit,
        order: "-created_at",
        q: query || undefined,
      })

      return {
        ...result,
        notifications: result.notifications as EmailNotification[],
      }
    },
    placeholderData: (previousData) => previousData,
  })

  const notifications = notificationsQuery.data?.notifications ?? []
  const count = notificationsQuery.data?.count ?? 0
  const pageCount = Math.max(1, Math.ceil(count / limit))

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount])

  return (
    <Container className="p-0">
      <div className="flex flex-col gap-4 border-b px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <Heading level="h1">邮件通知</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Email Notifications
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            查询 Medusa 保存的全部邮件通知、发送状态和服务商回执。
          </Text>
        </div>
        <div className="rounded-md bg-ui-bg-subtle px-4 py-3">
          <Text size="xsmall" className="text-ui-fg-subtle">
            邮件通知总数 / Total email notifications
          </Text>
          <Text weight="plus">{notificationsQuery.isLoading ? "—" : count}</Text>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜索收件邮箱或关联资源 / Search recipient or resource"
          aria-label="搜索邮件通知"
          className="sm:max-w-lg"
        />
        {search && (
          <Button
            size="small"
            variant="secondary"
            onClick={() => setSearch("")}
          >
            清除搜索 / Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                <BilingualLabel zh="收件人" en="Recipient" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualLabel zh="邮件类型" en="Template" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualLabel zh="发送状态" en="Status" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualLabel zh="关联资源" en="Resource" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualLabel zh="服务商回执" en="Provider receipt" />
              </Table.HeaderCell>
              <Table.HeaderCell>
                <BilingualLabel zh="创建时间" en="Created" />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {notifications.map((notification) => (
              <Table.Row key={notification.id}>
                <Table.Cell>
                  <div className="flex min-w-56 flex-col gap-0.5">
                    <Text size="small" weight="plus">
                      {notification.to}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {notification.from || "发件地址未记录 / Sender not recorded"}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <TemplateLabel template={notification.template} />
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge status={notification.status} />
                </Table.Cell>
                <Table.Cell>
                  <div className="flex min-w-40 flex-col gap-0.5">
                    <Text size="small">
                      {notification.resource_type || "—"}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {notification.resource_id || notification.trigger_type || "—"}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex min-w-52 flex-col gap-0.5">
                    <Text size="small" className="font-mono">
                      {notification.external_id || "—"}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {notification.provider_id || "服务商未记录 / Provider not recorded"}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="min-w-36">
                    <Text size="small">
                      {formatDateTime(notification.created_at)}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {notification.id}
                    </Text>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {notificationsQuery.isLoading && (
          <div className="flex items-center justify-center gap-2 px-6 py-16">
            <Spinner />
            <Text size="small" className="text-ui-fg-subtle">
              正在加载邮件通知 / Loading email notifications
            </Text>
          </div>
        )}

        {notificationsQuery.isError && (
          <div className="px-6 py-16 text-center">
            <Text className="text-ui-fg-error">
              邮件通知加载失败，请刷新后重试 / Failed to load email notifications
            </Text>
          </div>
        )}

        {!notificationsQuery.isLoading &&
          !notificationsQuery.isError &&
          notifications.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Text className="text-ui-fg-subtle">
                没有符合条件的邮件通知 / No matching email notifications
              </Text>
            </div>
          )}
      </div>

      <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Text size="small" className="text-ui-fg-subtle">
          第 {page} 页，共 {pageCount} 页 · {count} 条记录
          <br />
          Page {page} of {pageCount} · {count} records
        </Text>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value))
              setPage(1)
            }}
          >
            <Select.Trigger className="w-28">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {[20, 50, 100].map((size) => (
                <Select.Item key={size} value={String(size)}>
                  {size} 条 / page
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button
            size="small"
            variant="secondary"
            disabled={page <= 1 || notificationsQuery.isFetching}
            onClick={() => setPage((current) => current - 1)}
          >
            上一页 / Previous
          </Button>
          <Button
            size="small"
            variant="secondary"
            disabled={page >= pageCount || notificationsQuery.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            下一页 / Next
          </Button>
        </div>
      </div>
    </Container>
  )
}

const BilingualLabel = ({ zh, en }: { zh: string; en: string }) => (
  <div className="flex flex-col">
    <Text size="small" leading="compact" weight="plus">
      {zh}
    </Text>
    <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
      {en}
    </Text>
  </div>
)

const TemplateLabel = ({ template }: { template: string }) => {
  const label = templateLabels[template]

  return (
    <div className="flex min-w-36 flex-col gap-0.5">
      <Text size="small" weight="plus">
        {label?.zh || template || "未指定"}
      </Text>
      <Text size="xsmall" className="text-ui-fg-subtle">
        {label?.en || template || "Not specified"}
      </Text>
    </div>
  )
}

const StatusBadge = ({ status }: { status?: NotificationStatus }) => {
  if (!status) {
    return <Badge color="grey">未知 / Unknown</Badge>
  }

  const meta = statusMeta[status]
  return <Badge color={meta.color}>{meta.zh} / {meta.en}</Badge>
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value))

export const config = defineRouteConfig({
  label: "邮件通知 / Email Notifications",
  icon: EnvelopeSolid,
})

export default EmailNotificationsPage
