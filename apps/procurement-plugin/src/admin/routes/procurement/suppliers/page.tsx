import { PencilSquare, Plus, Spinner } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ProcurementNav } from "../../../components/procurement-nav"
import { sdk } from "../../../lib/sdk"
import type { Supplier, SupplierListResponse } from "../../../types"

type SupplierDraft = {
  code: string
  name: string
  status: "active" | "inactive"
  contact_name: string
  email: string
  phone: string
  website_url: string
  supplier_1688_url: string
  supplier_taobao_url: string
  supplier_jd_url: string
  default_currency_code: string
  payment_terms: string
  notes: string
}

const emptyDraft = (): SupplierDraft => ({
  code: "",
  name: "",
  status: "active",
  contact_name: "",
  email: "",
  phone: "",
  website_url: "",
  supplier_1688_url: "",
  supplier_taobao_url: "",
  supplier_jd_url: "",
  default_currency_code: "usd",
  payment_terms: "",
  notes: "",
})

const toDraft = (supplier: Supplier): SupplierDraft => ({
  code: supplier.code,
  name: supplier.name,
  status: supplier.status,
  contact_name: supplier.contact_name || "",
  email: supplier.email || "",
  phone: supplier.phone || "",
  website_url: supplier.website_url || "",
  supplier_1688_url: supplier.supplier_1688_url || "",
  supplier_taobao_url: supplier.supplier_taobao_url || "",
  supplier_jd_url: supplier.supplier_jd_url || "",
  default_currency_code: supplier.default_currency_code,
  payment_terms: supplier.payment_terms || "",
  notes: supplier.notes || "",
})

const SupplierFields = ({ value, onChange }: { value: SupplierDraft; onChange: (value: SupplierDraft) => void }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <div className="flex flex-col gap-2"><Label>供应商名称 / Name *</Label><Input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>供应商编号 / Code</Label><Input placeholder="留空自动生成 / Auto generated" value={value.code} onChange={(event) => onChange({ ...value, code: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>状态 / Status</Label><Select value={value.status} onValueChange={(status) => onChange({ ...value, status: status as SupplierDraft["status"] })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="active">启用 / Active</Select.Item><Select.Item value="inactive">停用 / Inactive</Select.Item></Select.Content></Select></div>
    <div className="flex flex-col gap-2"><Label>默认币种 / Currency</Label><Input maxLength={3} value={value.default_currency_code} onChange={(event) => onChange({ ...value, default_currency_code: event.target.value.toLowerCase() })} /></div>
    <div className="flex flex-col gap-2"><Label>联系人 / Contact</Label><Input value={value.contact_name} onChange={(event) => onChange({ ...value, contact_name: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>电话 / Phone</Label><Input value={value.phone} onChange={(event) => onChange({ ...value, phone: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>邮箱 / Email</Label><Input type="email" value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>网站 / Website</Label><Input value={value.website_url} onChange={(event) => onChange({ ...value, website_url: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>1688 地址 / URL</Label><Input value={value.supplier_1688_url} onChange={(event) => onChange({ ...value, supplier_1688_url: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>淘宝地址 / Taobao URL</Label><Input value={value.supplier_taobao_url} onChange={(event) => onChange({ ...value, supplier_taobao_url: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>京东地址 / JD URL</Label><Input value={value.supplier_jd_url} onChange={(event) => onChange({ ...value, supplier_jd_url: event.target.value })} /></div>
    <div className="flex flex-col gap-2"><Label>付款条件 / Payment terms</Label><Input value={value.payment_terms} onChange={(event) => onChange({ ...value, payment_terms: event.target.value })} /></div>
    <div className="flex flex-col gap-2 sm:col-span-2"><Label>备注 / Notes</Label><Textarea value={value.notes} onChange={(event) => onChange({ ...value, notes: event.target.value })} /></div>
  </div>
)

const SuppliersPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null)
  const [draft, setDraft] = useState<SupplierDraft>(emptyDraft)
  const limit = 20

  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(search.trim()); setPage(1) }, 300)
    return () => window.clearTimeout(timer)
  }, [search])
  useEffect(() => setDraft(activeSupplier ? toDraft(activeSupplier) : emptyDraft()), [activeSupplier, createOpen])

  const list = useQuery({
    queryKey: ["procurement-suppliers", page, query, status],
    queryFn: () => sdk.client.fetch<SupplierListResponse>("/admin/procurement/suppliers", { query: { page, limit, q: query || undefined, status: status === "all" ? undefined : status } }),
  })
  const save = useMutation({
    mutationFn: ({ id, value }: { id?: string; value: SupplierDraft }) => sdk.client.fetch(id ? `/admin/procurement/suppliers/${id}` : "/admin/procurement/suppliers", { method: "POST", body: { ...value, code: value.code || undefined } }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["procurement-suppliers"] }),
        queryClient.invalidateQueries({ queryKey: ["procurement-suppliers-filter"] }),
        queryClient.invalidateQueries({ queryKey: ["procurement-suppliers-for-order"] }),
      ])
      toast.success("供应商已保存 / Supplier saved")
      setCreateOpen(false)
      setActiveSupplier(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const submit = (id?: string) => {
    if (!draft.name.trim()) return toast.error("请输入供应商名称 / Supplier name is required")
    save.mutate({ id, value: draft })
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"><div><Heading>供应商</Heading><Text size="small" className="text-ui-fg-subtle">Suppliers · 联系信息、采购地址与付款条件</Text></div><Button size="small" onClick={() => { setActiveSupplier(null); setDraft(emptyDraft()); setCreateOpen(true) }}><Plus /> 新建供应商</Button></div>
        <div className="border-t px-6 py-4"><ProcurementNav /></div>
      </Container>
      <Container className="divide-y p-0">
        <div className="grid gap-3 px-6 py-4 md:grid-cols-[1fr_220px]"><Input placeholder="搜索供应商 / Search suppliers" value={search} onChange={(event) => setSearch(event.target.value)} /><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="all">全部状态 / All</Select.Item><Select.Item value="active">启用 / Active</Select.Item><Select.Item value="inactive">停用 / Inactive</Select.Item></Select.Content></Select></div>
        {list.isLoading ? <div className="flex justify-center p-16"><Spinner /></div> : <Table><Table.Header><Table.Row><Table.HeaderCell>编号 / Code</Table.HeaderCell><Table.HeaderCell>名称 / Name</Table.HeaderCell><Table.HeaderCell>联系人 / Contact</Table.HeaderCell><Table.HeaderCell>币种 / Currency</Table.HeaderCell><Table.HeaderCell>状态 / Status</Table.HeaderCell><Table.HeaderCell /></Table.Row></Table.Header><Table.Body>{(list.data?.suppliers || []).map((supplier) => <Table.Row key={supplier.id}><Table.Cell>{supplier.code}</Table.Cell><Table.Cell>{supplier.name}</Table.Cell><Table.Cell><div><Text size="small">{supplier.contact_name || "—"}</Text><Text size="small" className="text-ui-fg-subtle">{supplier.email || supplier.phone || "—"}</Text></div></Table.Cell><Table.Cell>{supplier.default_currency_code.toUpperCase()}</Table.Cell><Table.Cell><Badge color={supplier.status === "active" ? "green" : "grey"}>{supplier.status === "active" ? "启用 / Active" : "停用 / Inactive"}</Badge></Table.Cell><Table.Cell><Button size="small" variant="transparent" onClick={() => setActiveSupplier(supplier)}><PencilSquare /> 编辑</Button></Table.Cell></Table.Row>)}</Table.Body></Table>}
        {!list.isLoading && !list.data?.suppliers.length && <div className="p-16 text-center"><Heading level="h2">还没有供应商</Heading><Text className="text-ui-fg-subtle">Create the first supplier.</Text></div>}
        <div className="flex items-center justify-between px-6 py-4"><Text size="small">共 {list.data?.count || 0} 条</Text><div className="flex gap-2"><Button size="small" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</Button><Text size="small">{page} / {list.data?.page_count || 1}</Text><Button size="small" variant="secondary" disabled={page >= (list.data?.page_count || 1)} onClick={() => setPage((value) => value + 1)}>下一页</Button></div></div>
      </Container>

      <FocusModal open={createOpen} onOpenChange={setCreateOpen}><FocusModal.Content><div className="flex h-full flex-col overflow-hidden"><FocusModal.Header><div className="flex w-full justify-end gap-2"><FocusModal.Close asChild><Button size="small" variant="secondary" disabled={save.isPending}>取消</Button></FocusModal.Close><Button size="small" isLoading={save.isPending} onClick={() => submit()}>创建 / Create</Button></div></FocusModal.Header><FocusModal.Body className="overflow-y-auto"><div className="mx-auto max-w-3xl p-6"><Heading>新建供应商</Heading><Text className="mb-6 text-ui-fg-subtle">Create supplier</Text><SupplierFields value={draft} onChange={setDraft} /></div></FocusModal.Body></div></FocusModal.Content></FocusModal>

      <Drawer open={Boolean(activeSupplier)} onOpenChange={(open) => { if (!open) setActiveSupplier(null) }}><Drawer.Content><Drawer.Header><Drawer.Title>编辑供应商 / Edit supplier</Drawer.Title></Drawer.Header><Drawer.Body className="overflow-y-auto p-6"><SupplierFields value={draft} onChange={setDraft} /></Drawer.Body><Drawer.Footer><Drawer.Close asChild><Button size="small" variant="secondary" disabled={save.isPending}>取消</Button></Drawer.Close><Button size="small" isLoading={save.isPending} onClick={() => activeSupplier && submit(activeSupplier.id)}>保存 / Save</Button></Drawer.Footer></Drawer.Content></Drawer>
    </div>
  )
}

export default SuppliersPage
