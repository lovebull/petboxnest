import { DefaultTemplate } from "@payloadcms/next/templates"
import { Gutter } from "@payloadcms/ui"
import type { AdminViewServerProps } from "payload"

const updates = [
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
