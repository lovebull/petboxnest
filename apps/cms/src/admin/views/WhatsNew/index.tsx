import { DefaultTemplate } from "@payloadcms/next/templates"
import { Gutter } from "@payloadcms/ui"
import type { AdminViewServerProps } from "payload"

const updates = [
  {
    version: "v1.0.8",
    date: "2026-08-17 10:14:34 EDT",
    title: "Bilingual admin settings polish",
    items: [
      "Medusa Admin 开启 view_configurations feature flag，为 Settings 自定义页面配置提供支持。",
      "Cashback Settings 页面补充中文/英文双语标题、字段标签、表格列名、状态标签和空状态文案。",
      "Referral Settings 页面补充中文/英文双语配置表单、佣金表格、状态显示和操作按钮文案。",
      "Storefront Cache Settings 页面补充中英双语说明、按钮文案和导航 label。",
      "Storefront Cache 清理操作改为使用 Medusa Admin SDK 的 sdk.client.fetch 调用自定义 Admin API。",
    ],
    fixes: [
      "修复 Admin 自定义 Settings 页面可能缺少 view configurations 支持的问题。",
      "修复 Storefront Cache 页面使用普通 fetch 调 Admin API 可能丢失 Admin 鉴权上下文的问题。",
      "修复 Cashback 和 Referrals 保存时表单数值未统一转换为 number 的问题，提交前会规范化金额、比例和等待期字段。",
      "修复设置保存、核对和清缓存按钮在请求中仍可重复点击的问题，提交中会禁用按钮并显示 loading。",
      "修复 Admin 状态 badge 只显示英文状态值的问题，现在会同时显示中文状态和英文辅助说明。",
    ],
  },
  {
    version: "v1.0.7",
    date: "2026-08-17 08:59:40 EDT",
    title: "Referral program and commission attribution",
    items: [
      "新增 Medusa Referral 模块，包含推荐计划、参与者、归因、转化和佣金流水模型及数据库迁移。",
      "Admin Settings 新增 Referrals 页面，可配置推荐折扣、推荐人佣金、归因窗口、等待期、封顶金额和是否叠加 Cashback。",
      "新增推荐短链 /r/[code]，验证推荐码后写入 referral cookie，并跳转回对应国家站首页。",
      "Storefront 账户中心新增 Refer a friend 页面，支持激活个人推荐码、分享推荐链接、查看待结算与已支付佣金。",
      "结账购物车新增推荐码绑定 Store API，可将 referral attribution 写入 cart metadata 并自动应用朋友首单折扣。",
      "订单完成、订单更新/取消和定时任务新增推荐转化与佣金 reconcile 流程，佣金最终以 Store Credit 发放。",
      "新增推荐佣金计算单元测试与 Jest setup 文件，补齐后端单元测试基础配置。",
    ],
    fixes: [
      "修复推荐人使用自己推荐码的风险，绑定和结账校验都会阻止 self-referral。",
      "修复老客户可能领取首单推荐优惠的问题，complete cart hook 会校验客户是否已有订单。",
      "修复推荐订单与 Cashback 默认叠加导致激励成本过高的问题，除非 Referrals 设置中开启 stack with cashback。",
      "修复 referral cookie 无法自动绑定购物车的问题，创建/读取 cart 时会尝试把已保存推荐码绑定到当前 cart。",
      "修复未登录访问账户子页面可能直接落入受保护页面的问题，middleware 会重定向到账户登录入口。",
    ],
  },
  {
    version: "v1.0.6",
    date: "2026-08-16 20:32:57 EDT",
    title: "Cashback and store credit checkout integration",
    items: [
      "新增 Medusa Cashback 模块，包含返现规则、返现记录模型、数据库迁移和模块服务。",
      "新增 Cashback 规则工作流，可在 Admin Settings 中配置返现类型、金额、币种、最低订单金额、封顶金额和等待期。",
      "订单完成链路新增返现创建、定时结算、订单更新/取消后重新核算，以及手动 reconcile 能力。",
      "Admin Settings 新增 Cashback 页面，可查看和保存返现规则，并查看最近返现记录。",
      "Storefront 账户中心新增 Cashback 页面，展示可用 Store Credit 余额、待释放返现和返现活动记录。",
      "Checkout 新增 Store Credit 应用组件，支持顾客在结账时使用可用余额抵扣订单。",
      "购物车读取字段、支付步骤、订单审核步骤和 totals 展示均补充 Store Credit / credit line 支持。",
    ],
    fixes: [
      "修复 Store Credit 全额抵扣时仍要求选择外部支付方式的问题，零金额订单可进入 review。",
      "修复购物车 totals 未显示 Store Credit 抵扣的问题，结账汇总中会展示抵扣金额。",
      "修复账户导航缺少返现入口的问题，移动端和桌面端都新增 Cashback 链接。",
      "修复返现重复创建风险，返现记录按 order_id 保持唯一并在工作流中做幂等判断。",
      "修复退款、取消或订单金额变化后返现金额可能不一致的问题，reconcile 会重算释放、撤回或记录待撤回金额。",
    ],
  },
  {
    version: "v1.0.5",
    date: "2026-08-16 04:14:48 EDT",
    title: "Admin cache settings and storefront account navigation cleanup",
    items: [
      "Medusa Admin 新增 Settings > Storefront Cache 页面，用于集中清理 Storefront 缓存。",
      "移除产品列表页上的 Storefront cache widget，避免全局缓存操作占用商品列表界面。",
      "Storefront 主布局把 customer 传入 Nav，导航可根据登录状态展示 Account 或登录入口图标。",
      "桌面导航将原 Account 菜单位调整为 About，并把账户入口固定在右侧操作区。",
      "Account 页面里的 Customer Service 链接改为 FAQ，指向当前已有帮助内容。",
      "Payload CMS 与 Storefront 默认本地服务地址统一调整为 127.0.0.1。",
    ],
    fixes: [
      "修复全局缓存清理按钮出现在产品列表页的问题，让缓存操作回到 Settings 管理区。",
      "修复访客状态下导航账户入口不够明确的问题，保留登录图标和无障碍文本。",
      "修复 localhost 在服务端环境可能解析不一致的问题，Medusa SDK、Payload CORS 和 CSRF 默认地址改用 127.0.0.1。",
      "清理 Payload CORS/CSRF 配置中的冗余 localhost 项和多余空白。",
    ],
  },
  {
    version: "v1.0.4",
    date: "2026-08-13 21:44:14 EDT",
    title: "CMS articles, online homepage images, and storefront cache clearing",
    items: [
      "新增 Payload Articles 集合，支持草稿/发布状态、slug、摘要、封面图、在线封面图、富文本正文、关联产品和 SEO 字段。",
      "新增 Payload Online Images 集合，首页 Hero 轮播可直接读取 CMS 里的在线图片、标题、描述和 alt 文本。",
      "Storefront 新增文章列表页和文章详情页，首页 Notes From The Clubhouse 改为展示 Payload 已发布文章。",
      "新增 Storefront /api/revalidate 接口，并在 Medusa Admin 产品列表页加入 Storefront cache 清理入口。",
      "Payload Admin 新增 /admin/whats-new 更新内容页面，并在侧边导航展示入口。",
      "缓存读取统一增加 1 小时 revalidate 和明确 cache tags，便于 CMS 或商品更新后精准刷新。",
    ],
    fixes: [
      "修复 Payload 服务默认地址，统一使用 127.0.0.1:8020，减少 localhost 在服务端环境解析不一致的问题。",
      "修复 Storefront cache tag 返回逻辑，默认 tag 和映射 tag 会同时写入，避免部分缓存无法被清理。",
      "修复首页 Hero 旧的硬编码图片，改为无 CMS 图片时不渲染，避免展示过期静态内容。",
    ],
  },
  {
    version: "v1.0.3",
    date: "2026-08-12 08:57:44 EDT",
    title: "Payload product enhancement content",
    items: [
      "新增 apps/cms Payload CMS 应用，提供用户、媒体和产品增强内容集合。",
      "Storefront 商品详情页接入 Payload 产品增强内容，展示亮点、故事图文、规格、护理说明和视频链接。",
      "商品 SEO 支持优先读取 Payload meta title、description 和 og image。",
      "补充 Payload/Medusa 环境变量模板，并支持服务端 MEDUSA_BACKEND_URL。",
      "同步 pnpm-lock，补齐 CMS workspace 依赖。",
    ],
    fixes: [
      "CMS 本地 .env.local、.next、node_modules 保持在忽略列表，避免提交本地密钥和构建产物。",
      "修正 customer 读取时的 authorization 判断，避免空认证头触发无效请求。",
      "暂停导航 locale 列表请求，减少页面头部依赖的额外数据读取。",
    ],
  },
]

export function WhatsNewView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const user = initPageResult.req.user || undefined

  if (!user) {
    return (
      <Gutter>
        <p>You must be logged in to view this page.</p>
      </Gutter>
    )
  }

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <div style={{ maxWidth: "860px", paddingBlock: "var(--base)" }}>
          <p
            style={{
              color: "var(--theme-elevation-500)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: ".08em",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            更新内容
          </p>
          <h1 style={{ marginTop: "calc(var(--base) * .5)" }}>What&apos;s New</h1>
          <p
            style={{
              color: "var(--theme-elevation-650)",
              fontSize: "16px",
              lineHeight: 1.6,
              marginBottom: "calc(var(--base) * 1.5)",
              marginTop: "calc(var(--base) * .5)",
              maxWidth: "680px",
            }}
          >
            Larumsport CMS, storefront, and admin release notes.
          </p>

          <div style={{ display: "grid", gap: "var(--base)" }}>
            {updates.map((update) => (
              <article
                key={`${update.date}-${update.title}`}
                style={{
                  background: "var(--theme-elevation-50)",
                  border: "1px solid var(--theme-elevation-150)",
                  borderRadius: "var(--style-radius-m)",
                  padding: "var(--base)",
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    color: "var(--theme-elevation-500)",
                    display: "flex",
                    flexWrap: "wrap",
                    fontSize: "12px",
                    gap: "calc(var(--base) * .35)",
                    margin: 0,
                  }}
                >
                  <strong style={{ color: "var(--theme-text)" }}>
                    {update.version}
                  </strong>
                  <span>{update.date}</span>
                </div>
                <h2
                  style={{
                    fontSize: "20px",
                    lineHeight: 1.35,
                    marginBottom: "calc(var(--base) * .35)",
                    marginTop: "calc(var(--base) * .35)",
                  }}
                >
                  {update.title}
                </h2>
                <div style={{ display: "grid", gap: "calc(var(--base) * .75)" }}>
                  <div>
                    <h3
                      style={{
                        fontSize: "14px",
                        marginBottom: "calc(var(--base) * .3)",
                        marginTop: 0,
                      }}
                    >
                      更新内容
                    </h3>
                    <ul
                      style={{
                        color: "var(--theme-elevation-650)",
                        lineHeight: 1.6,
                        margin: 0,
                        paddingLeft: "calc(var(--base) * .9)",
                      }}
                    >
                      {update.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "14px",
                        marginBottom: "calc(var(--base) * .3)",
                        marginTop: 0,
                      }}
                    >
                      修复内容
                    </h3>
                    <ul
                      style={{
                        color: "var(--theme-elevation-650)",
                        lineHeight: 1.6,
                        margin: 0,
                        paddingLeft: "calc(var(--base) * .9)",
                      }}
                    >
                      {update.fixes.map((fix) => (
                        <li key={fix}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
