# Resend 发件地址配置

Backend 和 Payload CMS 使用同一套环境变量，API Key 保持原配置。

```dotenv
RESEND_FROM_EMAIL="PetBoxNest <notifications@petboxnest.com>"
RESEND_FROM_ORDERS="PetBoxNest Orders <orders@petboxnest.com>"
RESEND_FROM_SECURITY="PetBoxNest Security <security@petboxnest.com>"
RESEND_FROM_UPDATES="PetBoxNest Updates <updates@petboxnest.com>"
RESEND_REPLY_TO=support@petboxnest.com
```

| 分类 | 当前邮件模板 |
| --- | --- |
| Orders | order-placed、admin-order-placed、shipment-created、payment-refunded、after-sales-update |
| Security | password-reset、email-verification、after-sales-code |
| Updates | restock-available、abandoned-cart，以及 CMS Newsletter 订阅确认 |

Backend 从 `medusa-config.ts` 将这些变量传入 Resend provider。CMS Newsletter
通过 Resend HTTP API 发送，使用 `RESEND_FROM_UPDATES` 和 `RESEND_REPLY_TO`。
未配置分类发件人时回退到 `RESEND_FROM_EMAIL`；没有新增其他邮件触发场景。

生产配置：`apps/backend/.env.production`、`apps/cms/.env.production`。
当前 Backend 从 `.medusa/server` 启动，其 `.env.production` 也需要一致。
开发环境在实际使用的 `.env` / `.env.local` 中设置上述变量。

上线前在 Resend 中验证 `petboxnest.com` 的 DNS 发信记录。`support@petboxnest.com`
应在 Zoho 等收信服务中可正常接收客户回复。Resend 域名验证不创建收信邮箱。

生产服务需要重新构建 Backend 和 CMS，并重启对应服务以加载代码；旧失败通知不会自动补发。
此配置不会新建付款成功、安全提醒、欢迎邮件或产品更新等尚不存在的触发器。
