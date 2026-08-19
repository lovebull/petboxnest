# 数据模型与第三方集成设计

> 文档状态：待评审
> 版本：0.1
> 架构基线：Medusa v2 模块化单体
> 销售范围：美国、USD、实物商品

## 1. 架构目标

- 优先复用 Medusa 的商品、价格、库存、购物车、订单、促销和客户模块。
- 自定义能力通过 Module、Workflow、Subscriber、Provider 和 Admin Extension 实现。
- 不直接修改 Medusa Core 源码。
- 支付、税务、物流、通知使用可替换适配层。
- 强一致事务保留在单个 Commerce Backend 内；外部副作用使用事件和可重试任务。
- 所有外部回调使用签名验证、幂等和审计。

## 2. 逻辑架构

```text
                           ┌──────────────────────┐
                           │ Next.js Storefront   │
                           │ SSR/RSC/API Boundary │
                           └──────────┬───────────┘
                                      │ HTTPS
                           ┌──────────▼───────────┐
                           │ Medusa Backend/Admin │
                           │ Routes + Workflows   │
                           └─────┬─────────┬──────┘
                                 │         │ Events/Jobs
                    ┌────────────▼──┐   ┌──▼──────────┐
                    │ PostgreSQL    │   │ Redis       │
                    │ Source of     │   │ Cache/Queue │
                    │ truth         │   │ Lock        │
                    └───────────────┘   └─────────────┘

External Providers:
Stripe / PayPal / Stripe Tax / Shippo / R2-S3 / Resend / Sentry / GA4
```

## 3. 数据域

### 3.1 Catalog

```text
Product
├── id
├── handle
├── title
├── subtitle
├── description
├── status
├── brand_id（首期可以固定品牌，仍保留关系）
├── category_id
├── collections[]
├── images[]
├── metadata
└── variants[]

ProductVariant
├── id
├── product_id
├── title
├── sku
├── barcode
├── options[]
├── weight
├── length / width / height
├── origin_country
├── material
├── harmonized_system_code（未来跨境备用）
├── tax_code
└── metadata

ProductOption
└── Size / Color / Material 等
```

约束：

- `handle` 全局唯一。
- `sku` 对所有在售和历史 Variant 唯一，删除优先采用软删除。
- 重量统一保存为一个内部单位，并明确 API 转换。
- Product status 至少包含 draft、published、rejected/archived 的可映射状态。
- SEO 数据若 Medusa 核心字段不足，使用独立扩展模型，不依赖自由格式 metadata 承担全部查询。

### 3.2 Pricing and Promotion

```text
Price
├── variant_id
├── currency_code = USD
├── amount（最小货币单位）
├── min_quantity
├── max_quantity
└── price_list_id

Promotion
├── code
├── type
├── value
├── starts_at / ends_at
├── usage_limit
├── per_customer_limit
├── minimum_subtotal
├── eligible_products/collections
└── status
```

金额规则：

- 所有金额使用整数美分或框架 Money 类型。
- 禁止使用二进制浮点保存货币。
- 订单保存成交时的价格快照，后续商品改价不影响历史订单。

### 3.3 Inventory

```text
StockLocation
├── id
├── name
├── address
└── fulfillment_provider

InventoryItem
├── id
├── sku
└── requires_shipping = true

InventoryLevel
├── inventory_item_id
├── location_id
├── stocked_quantity
├── reserved_quantity
└── incoming_quantity（可选）

Reservation
├── cart/order reference
├── quantity
├── expires_at
└── status
```

MVP 默认单仓，但数据结构不写死仓库 ID。

### 3.4 Customer and Identity

```text
Customer
├── id
├── email
├── first_name
├── last_name
├── phone
├── has_account
├── marketing_consent
├── consent_timestamp
└── metadata

Address
├── customer_id
├── first_name / last_name
├── company
├── address_1 / address_2
├── city
├── province_code
├── postal_code
├── country_code = US
└── phone
```

规则：

- Email 规范化后唯一性需符合身份系统实现。
- Checkout 快照地址与 Customer Address 分离，避免用户修改地址后改变历史订单。
- Marketing consent 与交易邮件权限分开。
- PII 的日志、导出、删除流程需有权限控制。

### 3.5 Cart and Checkout

```text
Cart
├── id
├── customer_id?
├── email?
├── region_id
├── currency_code = USD
├── items[]
├── shipping_address?
├── billing_address?
├── shipping_method?
├── promotions[]
├── tax_lines[]
├── payment_collection?
├── expires_at
└── metadata
```

Cart 必须由服务端计算：

- unit price
- line subtotal
- discount
- shipping
- tax
- total

### 3.6 Order

```text
Order
├── id
├── display_id
├── public_access_token
├── customer_id?
├── email
├── currency_code
├── items[]（成交快照）
├── addresses（成交快照）
├── subtotal / discount / shipping / tax / total
├── payment_status
├── fulfillment_status
├── channel
├── placed_at
└── metadata

OrderLine
├── variant_id
├── sku_snapshot
├── title_snapshot
├── options_snapshot
├── unit_price
├── quantity
├── tax_lines
└── discount_lines
```

`display_id` 可用于客服沟通，但公开订单访问必须再验证 Token、登录身份或邮箱。

### 3.7 Payment

```text
PaymentCollection
├── order/cart reference
├── authorized_amount
├── captured_amount
├── refunded_amount
└── status

Payment
├── provider
├── provider_payment_id
├── amount
├── status
├── idempotency_key
└── provider_data（只保存允许的非敏感字段）

Refund
├── payment_id
├── provider_refund_id
├── amount
├── reason
├── status
├── idempotency_key
└── created_by
```

### 3.8 Fulfillment and Return

```text
Fulfillment
├── order_id
├── location_id
├── items[]
├── carrier
├── service_level
├── tracking_number
├── tracking_url
├── label_url（受保护或短期签名）
└── status

ReturnRequest
├── order_id
├── customer_id?
├── items[]
├── reason
├── customer_note
├── status
├── eligibility_snapshot
├── return_label_id?
└── timestamps

ReturnItem
├── order_line_id
├── quantity
├── reason
├── received_quantity
├── condition
└── restock
```

### 3.9 Audit and Idempotency

建议自定义：

```text
AuditLog
├── actor_type / actor_id
├── action
├── entity_type / entity_id
├── before_summary
├── after_summary
├── request_id
├── ip_hash
└── created_at

WebhookEvent
├── provider
├── external_event_id
├── event_type
├── payload_hash
├── processing_status
├── attempts
├── last_error
└── timestamps
```

`provider + external_event_id` 建立唯一约束。

## 4. 主要关系

```text
Product 1 ── * ProductVariant 1 ── 1 InventoryItem
   │                  │
   *                  *
Collection           Price

Customer 1 ── * Address
Customer 1 ── * Order

Cart 1 ── * CartLine ── 1 ProductVariant
Order 1 ── * OrderLine ── 0..1 ProductVariant
Order 1 ── * Payment
Order 1 ── * Fulfillment
Order 1 ── * ReturnRequest ── * ReturnItem
Payment 1 ── * Refund
```

历史 OrderLine 不应因 ProductVariant 删除而丢失成交快照。

## 5. 集成设计

### 5.1 Stripe Payments

职责：

- Payment Element / Express Checkout
- PaymentIntent 创建与确认
- Apple Pay / Google Pay / Link
- Capture、Cancel、Refund
- Webhook

关键事件按实际 Stripe API 版本确认，逻辑上至少覆盖：

- payment succeeded
- payment failed
- payment canceled
- charge/refund updated
- dispute opened/updated（可先告警、后续做后台）

安全要求：

- Secret Key 仅在后端。
- Webhook 使用原始请求体进行验签。
- 创建 PaymentIntent、退款使用业务幂等键。
- Provider 成功后再提交内部最终状态；内部失败必须可重放恢复。
- 不依赖 Redirect Return Page 判定支付完成。

### 5.2 PayPal

建议在 Stripe 稳定后接入，职责：

- 创建 Order
- Buyer Approval
- Capture
- Refund
- Webhook

PayPal 与 Stripe 使用统一 Payment Provider 接口，Storefront 不应把订单状态逻辑写成 Provider 特例。

### 5.3 Stripe Tax

输入：

- Shipping address
- 商品 Tax Code
- 商品金额
- Discount
- Shipping amount

输出：

- 税额
- Jurisdiction 明细
- Calculation/Transaction reference

必须保存足以支持退款、对账和审计的 Provider Reference，避免只保存总税额。

### 5.4 Shippo / EasyPost

建议首期 Shippo，接口职责：

- 地址验证
- Rate Quote
- Label Purchase
- Label Refund/Void
- Tracking
- Return Label
- Webhook

内部统一模型：

```text
ShippingRate {
  provider
  provider_rate_id
  carrier
  service_code
  display_name
  amount
  currency
  estimated_days
  expires_at
}
```

报价在下单时需验证有效期，不能永久复用旧 Rate ID。

### 5.5 Object Storage

候选：Cloudflare R2 / AWS S3。

- 原图只通过后台上传。
- 公共商品图经 CDN 访问。
- Return Label 等敏感文件使用私有 Bucket 和短期签名 URL。
- 保存原图与派生图信息，前端输出响应式尺寸。

### 5.6 Email

候选：Resend / Postmark。

交易邮件：

- Verify email
- Reset password
- Order confirmation
- Shipment confirmation
- Return received
- Refund confirmation

要求：

- 通过队列异步发送。
- 模板有版本记录。
- Provider Message ID 回写日志。
- 发送失败不回滚已成功支付的订单。
- SPF、DKIM、DMARC 在上线前配置。

### 5.7 Analytics

Storefront：

- GA4
- Meta Pixel
- Cookie Consent

服务端可选：

- purchase / refund 的服务端事件
- 与浏览器事件使用 Event ID 去重

禁止把 Email、Phone、完整地址直接发送到未授权分析平台。

### 5.8 Monitoring

- Sentry：前后端错误、Release、Trace
- Structured Log：request_id、order_id、provider reference
- Health Check：DB、Redis、关键 Worker
- Alert：支付/退款 Webhook 连续失败、队列积压、订单状态不一致

## 6. Workflow 设计

### 6.1 Place Order

```text
Validate Cart
 -> Reprice
 -> Validate/Reserve Inventory
 -> Validate Shipping Rate
 -> Calculate Tax
 -> Create/Confirm Payment
 -> Receive Verified Payment Result
 -> Create Order
 -> Commit Inventory Allocation
 -> Emit order.placed
 -> Queue Confirmation Email
```

每一步要定义补偿：

- 库存预留后支付失败：释放 Reservation。
- 支付成功但内部订单提交失败：进入恢复任务，不可再次扣款。
- 邮件失败：重试，不影响 Order。

### 6.2 Refund

```text
Validate Refundable Amount
 -> Lock Order/Payment
 -> Create Pending Refund
 -> Call Provider with Idempotency Key
 -> Confirm Provider Result
 -> Update Payment and Order
 -> Restock if Approved
 -> Record Audit
 -> Queue Refund Email
```

### 6.3 Fulfillment

```text
Validate Fulfillable Quantity
 -> Get/Confirm Rate
 -> Purchase Label
 -> Create Fulfillment
 -> Allocate Order Lines
 -> Emit shipment.created
 -> Queue Shipping Email
```

## 7. API 边界

### Store API

- 商品、Collection、搜索
- Cart
- Checkout
- Customer account
- Order self-service
- Return request

### Admin API

- Catalog
- Inventory
- Order and fulfillment
- Refund and return
- Promotions
- Configuration
- Audit

要求：

- Store API 不返回成本价、内部备注、Provider Secret Data。
- Admin API 使用独立认证和 RBAC。
- API 错误返回稳定的业务错误码和安全的用户消息。
- 写操作接受 request/idempotency 标识。

## 8. 数据保留与隐私

- 订单和财务记录按经营与税务要求保留，期限由业务/法律顾问确认。
- 删除账户不等于删除依法必须保留的订单数据；可做去标识化。
- Marketing Consent 保留来源、时间和版本。
- 后台导出客户数据必须授权并审计。
- 测试环境不得复制未脱敏的生产 PII。

## 9. 环境与部署

```text
Local
Staging
Production
```

每个环境独立：

- PostgreSQL
- Redis
- Provider keys
- Webhook endpoints
- Object storage namespace/bucket
- Email sender policy

生产建议组件：

- Next.js Storefront
- Medusa API/Admin
- Worker
- PostgreSQL
- Redis
- Object Storage/CDN
- Reverse Proxy/WAF

## 10. 测试重点

- 金额舍入与税费
- 同一 SKU 并发下单
- 重复支付 Webhook
- 支付成功但用户未返回
- 支付成功后内部短暂故障
- 重复退款请求
- 部分发货、部分退货、部分退款
- 物流报价过期
- 邮件 Provider 故障
- Worker 重启后的任务恢复
- 用户越权访问订单

## 11. 待评审决策

- [ ] Stripe 为主支付 Provider。
- [ ] PayPal 是否与 MVP 同期上线。
- [ ] Stripe Tax 是否作为 MVP 税务 Provider。
- [ ] Shippo 或 EasyPost；默认建议 Shippo。
- [ ] R2 或 S3；默认建议 R2，若基础设施集中在 AWS 则选 S3。
- [ ] Resend 或 Postmark；默认建议 Postmark 偏交易邮件，Resend 偏开发体验。
- [ ] 库存预留时长，建议 15 分钟并允许按支付方式调整。
- [ ] 订单是否自动 Capture；默认建议实物现货自动 Capture。
- [ ] 是否支持部分发货；默认建议数据模型支持、后台启用。

## 12. 评审结论

- [ ] 通过
- [ ] 有条件通过
- [ ] 需修改后重审

评审意见：

> 待填写
