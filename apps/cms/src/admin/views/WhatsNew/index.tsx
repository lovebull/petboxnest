import { DefaultTemplate } from "@payloadcms/next/templates"
import { Gutter } from "@payloadcms/ui"
import type { AdminViewServerProps } from "payload"

const updates = [
  {
    version: "v1.3.0",
    date: "2026-09-06 10:50:11 EDT",
    title: "🔐 客户账户安全更新与邮件订阅体系",
    items: [
      "🔐 新增客户邮箱和密码更新 API 与 Medusa 工作流，更新前校验当前密码及客户身份，并同步 Auth Identity 和 Customer 数据。",
      "♻️ 邮箱更新支持重复邮箱冲突检测和失败回滚；邮箱或密码修改成功后自动使用新凭据刷新客户登录令牌。",
      "👤 姓名、邮箱、电话和密码编辑表单统一接入 Server Action，补充字段校验、提交状态、成功与错误反馈，并重新开放密码修改入口。",
      "📮 Payload CMS 新增 Newsletter Subscribers 集合，记录订阅状态、来源、授权时间、确认与退订时间、邮件发送结果及错误信息。",
      "✉️ 首页 Early Access 表单接入 Payload 与 Resend，支持隐私授权、确认邮件、24 小时确认链接、重复订阅识别和一键退订。",
      "🛡️ Newsletter 接口新增请求指纹限流、确认与退订令牌哈希存储、管理员访问控制和邮件投递失败记录。",
      "⚙️ CMS 增加 Storefront 回跳地址及 Resend 环境变量模板，本地开发可复用 Backend 中缺失的邮件配置，并同步生成 Payload 类型。",
      "📋 新增 Storefront 审计结论，记录账户、订阅、性能、图片、商品内容、SEO、可访问性和 E2E 覆盖等 16 项问题及实施顺序。",
    ],
    fixes: [
      "🐛 修复账户邮箱修改未调用后端却显示成功、密码修改仅输出日志而没有真正更新凭据的问题。",
      "🐛 修复客户资料使用强制缓存导致 JWT 过期后账户界面仍显示登录状态、后续更新持续返回 401 的问题。",
      "🐛 修复客户资料更新遇到 FetchError 时错误信息无法正确展示的问题，并在会话过期时清理失效令牌、提示重新登录。",
      "🐛 修复资料编辑按钮可能触发表单默认行为，以及隐藏编辑面板仍保留交互结构的问题，改为明确按钮类型和条件渲染。",
      "🐛 修复首页 Early Access 表单只跳回页面锚点、不保存邮箱、没有授权确认及成功或失败反馈的问题。",
      "🐛 修复 Newsletter 缺少重复提交控制、确认有效期、退订入口和投递失败追踪的问题，完善双重确认订阅闭环。",
    ],
  },
  {
    version: "v1.2.1",
    date: "2026-09-06 00:11:35 EDT",
    title: "🌐 礼品卡与商店信用双语管理界面",
    items: [
      "🌐 为 @medusajs/loyalty-plugin 2.19.0 增加中文在上、英文在下的双语标签组件，统一管理界面的信息层级。",
      "🎁 礼品卡导航、商品概览、列表表头、客户筛选、空状态和创建操作新增中英文双语显示。",
      "📝 礼品卡创建页的标题、说明、币种、面值、到期时间、备注、搜索提示及操作按钮完成双语化。",
      "💳 商店信用导航、账户列表、币种、客户、余额、入账、扣减、创建时间和空状态新增双语显示。",
      "👤 商店信用账户创建页新增双语标题、说明、币种与客户选择、加载状态、校验提示、成功通知和操作按钮。",
      "📦 使用 pnpm patchedDependencies 固化 Loyalty Plugin 补丁并记录补丁哈希，确保重新安装依赖后继续应用双语界面。",
      "🧪 新增礼品卡和商店信用账户 Playwright 回归测试，验证管理页中文位于英文上方，并生成页面截图用于视觉核对。",
    ],
    fixes: [
      "🐛 修复 Loyalty Plugin 礼品卡与商店信用管理页仅显示英文，中文管理员理解列表、筛选和创建流程不便的问题。",
      "🐛 修复礼品卡商品、礼品卡和商店信用账户空状态缺少中文说明与中文操作入口的问题。",
      "🐛 修复币种、客户、面值、到期时间和备注等创建表单字段及搜索提示未提供中文语义的问题。",
      "🐛 修复商店信用账户币种必填校验和创建成功通知仅返回英文反馈的问题。",
      "🐛 修复直接修改依赖产物可能在 pnpm 重新安装后丢失的问题，改由工作区补丁配置稳定重放修改。",
      "🐛 修复双语排版缺少自动化验证的问题，新增中文在上、英文在下的位置断言防止后续回退。",
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-09-04 09:38:57 EDT",
    title: "⭐ 商品评论与审核管理体系",
    items: [
      "⭐ 新增商品评论独立模块及数据库迁移，统一存储客户评分、评论状态、商家回复、评分统计与审核审计记录。",
      "✍️ 登录客户可在商品详情页提交 1 至 5 星评论，每位客户对同一商品限评一次，评论经审核通过后公开展示。",
      "🛍️ 商品详情页新增评论总览、星级分布、关键词搜索、评分筛选、排序、分页跳转、长评论展开与商家回复展示。",
      "🧭 Medusa Admin 新增产品评论管理页，提供总量、待审核、已批准、已标记和平均分统计，以及状态、星级、产品、日期和回复状态组合筛选。",
      "✅ Admin 支持单条及批量批准、标记和恢复待审核，已批准评论可新增、更新或删除公开商家回复，并保留完整操作审计记录。",
      "📊 审核流程自动重算商品平均评分与各星级数量，并触发 Storefront 评论缓存标签刷新，使状态变化及时反映到商品页。",
      "🔎 商品页为已有评论的商品输出 AggregateRating 结构化数据，帮助搜索引擎识别评分总数和平均评分。",
      "🧪 新增评论查询与评分统计单元测试、完整 HTTP 流程集成测试，以及 Storefront 和 Admin 桌面、平板、移动端 Playwright 测试。",
    ],
    fixes: [
      "🐛 修复商品详情页缺少真实客户评价、评分汇总和商家回复入口，购物者无法通过社区反馈辅助购买决策的问题。",
      "🐛 修复未审核或已标记评论可能进入公开查询的问题，公开接口固定仅返回 approved 状态并隐藏客户内部字段。",
      "🐛 修复重复评论、越权查看客户评论及无效星级或过长内容可能被接受的问题，补充登录身份、所有权、唯一索引和 Zod 参数校验。",
      "🐛 修复评论状态变更后平均分、星级分布和商品页缓存可能不同步的问题，审核工作流统一重算统计并按商品刷新缓存。",
      "🐛 修复商家可回复未批准评论的问题，仅允许对 approved 评论维护公开回复，并记录回复新增、更新和删除审计。",
      "🐛 修复 Storefront 全量缓存刷新接口无法按需选择标签或路径的问题，支持传入 tags 和 paths 精准刷新，同时保留默认全量行为。",
    ],
  },
  {
    version: "v1.1.1",
    date: "2026-09-03 21:24:32 EDT",
    title: "🛡️ Payload CMS 3.88 stability update",
    items: [
      "⬆️ Payload CMS 核心从 3.87.1 升级到 3.88.0，并同步更新 Next.js 集成、PostgreSQL 数据库适配器和管理界面依赖。",
      "📝 @payloadcms/richtext-lexical、translations 与 UI 统一升级到 3.88.0，保持编辑器、翻译和管理组件版本一致。",
      "☁️ @payloadcms/storage-s3 升级到 3.88.0，并同步刷新 pnpm 锁文件中的 Payload、Drizzle、GraphQL 和 Cloud Storage 依赖解析。",
    ],
    fixes: [
      "🐛 合入 Payload 3.88.0 对 multipart content-type 解析回溯问题的修复，降低异常上传请求触发高开销匹配的风险。",
      "🐛 合入 Payload Admin UI 剪贴板前缀匹配修复，避免复制和粘贴操作错误关联相邻行数据。",
      "🐛 修复 Payload 核心包与 db-postgres、next、richtext-lexical、storage-s3、translations、ui 可能出现版本不同步的问题。",
      "🐛 修复 pnpm 锁文件仍解析 Payload 3.87.1 依赖树的问题，确保全新安装稳定使用 3.88.0。",
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-09-02 20:23:28 EDT",
    title: "💳 Stripe payment return flow and Medusa 2.19",
    items: [
      "⬆️ Medusa 后端、Admin SDK、Dashboard、Storefront SDK、UI Preset、Icons、Types、Test Utils 和 ESLint Plugin 统一升级到 2.19.0 系列。",
      "🧱 Medusa UI 升级到 4.2.1，React Router DOM 升级到 7.18.2，Vite 升级到 7.3.6，并同步刷新 pnpm 锁文件。",
      "🟢 Node.js 运行要求更新为 ^20.19.0 或 >=22.12.0，与新版 Medusa 和 Vite 的运行环境保持一致。",
      "💳 Stripe 结账由单一 Card Element 升级为 Payment Element，可展示 Stripe 会话中启用的支付方式。",
      "🔁 Stripe 提交改用 confirmPayment，并配置站内 /api/payment-return 回跳地址及 if_required 重定向策略。",
      "🛡️ 新增支付回跳 API，按 cart_id、Payment Intent 和 client secret 校验 Medusa 支付会话后再完成订单。",
      "🌍 支付回跳保留 countryCode 路由前缀；支付失败返回结账支付步骤，订单完成失败返回购物车错误状态。",
      "🍪 登录令牌和购物车 Cookie 的 SameSite 策略由 strict 调整为 lax，支持第三方支付页面安全返回站内。",
      "🧪 后端集成测试启动时清理 MikroORM MetadataStorage，减少测试套件之间的元数据污染。",
    ],
    fixes: [
      "🐛 修复 Stripe Card Element 仅适用于银行卡输入、无法承载 Payment Element 多支付方式和重定向支付流程的问题。",
      "🐛 修复 SameSite=strict 可能导致用户从 Stripe 返回时认证令牌或购物车 Cookie 不随顶级导航发送的问题。",
      "🐛 修复支付回跳直接信任 URL 参数的风险，新增购物车支付会话、Payment Intent 和 client secret 三重匹配校验。",
      "🐛 修复 Stripe 返回错误或非成功状态后提交按钮可能持续处于 loading 的问题，补充 submitting 状态复位。",
      "🐛 修复支付表单完成状态与银行卡专用 cardComplete/cardBrand 耦合的问题，改为通用 paymentComplete 状态。",
      "🐛 修复 Payment Element 加载失败时缺少可恢复错误反馈的问题，显示 Stripe 返回信息或通用加载错误。",
      "🐛 修复集成测试重复注册 MikroORM 元数据可能造成实体定义冲突的问题，在测试初始化阶段显式清理。",
      "🐛 修复订单配送方式不存在时直接读取 total 可能抛出异常的问题，为 shipping_methods[0] 增加可选链保护。",
    ],
  },
  {
    version: "v1.0.16",
    date: "2026-09-02 07:05:12 EDT",
    title: "🖼️ PetBoxNest brand assets and product gallery",
    items: [
      "🏡 新增 500 x 111 透明背景 PetBoxNest 品牌 Logo，包含猫窝图形、PetBox 字标和 NEST 副标。",
      "🔖 更新 Storefront Favicon 为包含 7 种尺寸的品牌图标资源，改善浏览器标签和设备图标的一致性。",
      "🎨 页脚由文字拼接 Logo 切换为正式品牌图片，并补充首页链接的 aria-label、响应式尺寸和懒加载配置。",
      "🖼️ 商品图片区域从纵向图片网格升级为单图轮播，支持触摸滑动、滚动吸附及平滑切换。",
      "⬅️ 轮播新增上一张、下一张按钮，提供 48px 点击区域、可见焦点状态和辅助技术可读标签。",
      "🔢 新增当前图片序号与总数提示，并通过 aria-live 在图片切换时播报最新位置。",
      "🧭 新增横向缩略图导航，展示当前选中状态，支持点击或键盘选择任意商品图片。",
      "📱 商品轮播保持首图优先加载、后续图片懒加载和响应式图片尺寸，兼顾移动端浏览与加载性能。",
      "🛒 桌面端及移动端商品购买区移除 Amazon 外链按钮，统一使用 PetBoxNest 站内加入购物车流程。",
    ],
    fixes: [
      "🐛 修复多图商品以完整纵向网格展示导致详情首屏过长、购买信息被推离视线的问题。",
      "🐛 修复商品图缺少明确上一张/下一张控制，键盘用户难以浏览全部图片的问题。",
      "🐛 修复移动端商品图片缺少稳定横向滑动和 snap 定位，切换后难以判断当前图片的问题。",
      "🐛 修复轮播缩略图没有选中语义的问题，新增 aria-pressed 和独立的图片选择标签。",
      "🐛 修复商品无图片时画廊区域为空的问题，新增 Product image coming soon 兜底状态。",
      "🐛 修复页脚使用文字模拟 Logo、无法完整呈现品牌猫窝图形和标准字标的问题。",
      "🐛 修复站内 Add to cart 与 Amazon 外链同时出现造成购买路径分散和移动端操作区冗长的问题。",
    ],
  },
  {
    version: "v1.0.15",
    date: "2026-09-02 03:29:36 EDT",
    title: "🛍️ PetBoxNest product detail experience refresh",
    items: [
      "🎨 商品详情页重构为响应式图片画廊与吸顶购买信息卡片，统一 PetBoxNest 品牌色、排版、间距和卡片层级。",
      "🖼️ 商品画廊新增主图优先加载、其余图片懒加载、响应式 sizes、商品名语义化 alt 文本和图片数量提示。",
      "🏷️ 商品信息区升级为明确的 H1 标题、系列返回入口、subtitle 与描述层级，并新增配送、退货和安全结账信任入口。",
      "🎛️ 商品选项改为更大的按钮式选择器，增加选中状态、ARIA group 标签和 aria-pressed 状态，提升键盘及触摸操作体验。",
      "💰 商品价格强化当前价、原价和 Save 折扣信息展示，并在购买区同步显示所选变体的 Available / Out of stock 状态。",
      "📱 移动端购买栏更新商品名、价格、选项和加入购物车布局，加入安全区域适配及带标题的底部选项面板。",
      "📖 Payload 商品增强内容重新设计富文本、卖点、故事图文、图片模块、规格、养护说明与视频入口。",
      "📋 商品详情折叠区扩大完整标题行的点击范围，并统一材质、产地、类型、重量和尺寸的信息样式。",
      "✨ 关联商品区域升级为 PetBoxNest 风格标题、说明和响应式商品网格。",
      "🧰 更新 Medusa Agent Skills 文档示例及 skills-lock 校验信息。",
    ],
    fixes: [
      "🐛 修复 React Router UIMatch SEO 示例读取 `match.data` 的错误，改为正确的 `match.loaderData`。",
      "🐛 修复商品画廊前三张图片全部高优先级加载造成不必要资源竞争的问题，仅保留首图 priority。",
      "🐛 修复商品图片使用通用 Product image 文案、无法描述具体商品的问题，改为包含商品标题和视图序号的 alt。",
      "🐛 修复多变体商品尚未选定时按钮可能显示 Out of stock 而非 Select options 的误导状态。",
      "🐛 修复移动端吸底购买栏未考虑 iOS safe-area，底部操作可能贴近或被 Home Indicator 遮挡的问题。",
      "🐛 修复商品选项底部面板关闭按钮缺少 type、可访问名称和对话框标题的问题。",
      "🐛 修复商品详情 Accordion 只有小图标区域可点击，标题行键盘焦点和点击范围不足的问题。",
      "🐛 修复 Amazon 购买按钮使用硬编码橙色、与当前 PetBoxNest 按钮体系不一致的问题。",
    ],
  },
  {
    version: "v1.0.14",
    date: "2026-09-02 02:14:17 EDT",
    title: "🛡️ PetBoxNest checkout experience refresh",
    items: [
      "✨ 新增 Address、Delivery、Payment、Review 四步结账进度组件，并根据 URL 中的当前步骤展示已完成、进行中和待处理状态。",
      "🎨 结账页升级为 PetBoxNest 品牌化布局，统一安全结账页头、品牌主视觉、步骤卡片、按钮、表单控件和状态色。",
      "📦 配送方式与门店自提选项改为更清晰的响应式选择卡片，保留 Medusa 动态配送数据、费用、库存状态和选择逻辑。",
      "💳 支付区域重做支付方式选择、Stripe 卡片输入、礼品卡及 Store Credit 全额支付状态，并统一加载、禁用和完成状态。",
      "🧾 订单摘要新增可展开明细、商品数量、购物车样式金额汇总、优惠码入口和安全结账提示，桌面端保持吸顶展示。",
      "📱 地址、账单、配送、支付和订单复核区域采用单列优先的响应式布局，提升窄屏设备上的表单填写和信息阅读体验。",
      "🛒 结账摘要中的商品预览同步更新缩略图、商品名称、数量、单价和滚动区域样式。",
    ],
    fixes: [
      "🐛 修复结账流程缺少全局步骤指示，用户难以判断当前阶段和剩余步骤的问题。",
      "🐛 修复配送提示语 `How would you like you order delivered` 的语法错误，更新为清晰的订单配送询问。",
      "🐛 修复地址和账单表单在窄屏仍强制双列，导致输入框过窄的问题，改为移动端单列、较宽屏双列。",
      "🐛 修复配送及支付选项的选中、不可用和库存不足状态区分不够明显的问题，补充边框、背景、焦点和透明度反馈。",
      "🐛 修复已完成地址、配送和支付信息使用固定三分之一宽度，在长地址、邮箱或支付名称下容易拥挤溢出的问题。",
      "🐛 修复结账商品预览列表高度过大及横向内容可能溢出的问题，收紧滚动区域并隐藏横向溢出。",
      "🐛 修复结账操作按钮尺寸和移动端可点击区域不一致的问题，统一为完整宽度或自适应的高可见主操作按钮。",
    ],
  },
  {
    version: "v1.0.13",
    date: "2026-09-02 01:22:14 EDT",
    title: "🎨 PetBoxNest storefront experience redesign",
    items: [
      "✨ 新增 PetBoxNest Storefront UI 设计技能文档，沉淀品牌视觉方向、首页结构、色彩、排版、组件和响应式设计规范。",
      "🎨 Storefront 新增 PetBoxNest 视觉 tokens：brand、ink、muted、cream、mist、mint、yellow、coral、sky，并加入 pbn-container、pbn-focus、pbn-primary-button 和 pbn-secondary-button 通用样式。",
      "🏠 首页重构为宠物家居品牌体验，新增 Hero、TrustStrip、ShopByPet、BrandValues、HowItWorks 和 SocialProof 模块，并接入新的猫狗场景图片资源。",
      "🛒 购物车页面、空购物车、订单摘要、折扣码表单和 mini cart 全面更新为 PetBoxNest 卡片化体验，增加信任提示、数量/价格信息层级和移动端友好布局。",
      "👤 账户中心重做导航、Overview、登录、注册、资料、地址、订单、返现和推荐好友模块，统一使用更清晰的账户卡片、状态摘要和移动端横向导航。",
      "📰 文章列表、文章详情、富文本和文章卡片升级为 The Nest journal 风格，支持更好的日期语义、阅读入口、相关文章导航和图片兜底展示。",
      "📄 About、Contact、FAQ、Privacy、Shipping、Terms、Refund 等静态页面从旧文本版布局升级为带目录、图标、CTA 和品牌语气的 PetBoxNest 页面体系。",
      "🖼️ 产品卡片和缩略图增加新视觉样式、subtitle 展示和可传入 alt 文本，提升商品浏览的一致性和图片可访问性。",
    ],
    fixes: [
      "🐛 修复首页仍保留旧运动/羽毛球内容结构的问题，改为匹配 PetBoxNest 猫狗家居用品定位的模块顺序和文案。",
      "🐛 修复 Hero 依赖 CMS 在线图片为空时可能不展示首屏品牌信号的问题，改为固定品牌主视觉并删除旧 HeroSlider。",
      "🐛 修复导航、页脚、购物车和账户页面视觉风格不统一、触摸目标和 focus 状态不够一致的问题。",
      "🐛 修复 mini cart 鼠标移出立即关闭导致难以操作的问题，增加短延迟关闭和关闭按钮，并补充 aria-label / aria-live。",
      "🐛 修复购物车明细在移动端以表格呈现导致信息拥挤的问题，改为响应式商品卡片并保留 variant、quantity、unit price 和 item total。",
      "🐛 修复促销码组件只有 checkout 默认样式，无法贴合 cart summary 的问题，新增 cart variant 并保持原默认样式兼容。",
      "🐛 修复文章卡片缺少语义化 time、图片 alt 兜底和无图状态不完整的问题。",
      "🐛 修复 CMS 本地 media 上传目录可能被误提交的问题，补充 apps/cms/media/* 忽略规则。",
    ],
  },
  {
    version: "v1.0.12",
    date: "2026-08-31 11:34:13 EDT",
    title: "🏷️ Petboxnest brand migration and local port alignment",
    items: [
      "✨ 项目品牌从 Larumsport 更新为 Petboxnest，README、Agent 指南、Storefront 导航、页脚、首页模块和静态内容页同步展示新品牌名称。",
      "🌐 Storefront、CMS 和 Backend 的本地开发端口统一调整为 7000 / 7010 / 7020，并同步 Payload、Medusa、公开 URL 工具和环境模板中的默认地址。",
      "⚙️ Medusa Redis 前缀、缓存模块前缀、session cookie 名称和 Payload cookiePrefix 切换为 Petboxnest 命名空间，避免与旧品牌运行数据混用。",
      "✉️ 订单确认邮件的预览文本、品牌抬头和通知主题更新为 Petboxnest，客户收到的邮件内容与新站点品牌保持一致。",
      "🍪 Storefront 推荐码 cookie 与 Cookie Consent storage/cookie key 更新为 Petboxnest 前缀，前台持久化数据命名保持一致。",
      "📦 数据库备份文件从仓库根目录整理到 data/ 目录，减少根目录杂乱并集中存放历史 PostgreSQL 备份。",
    ],
    fixes: [
      "🐛 修复页面标题、SEO description、法律政策、FAQ、Contact、Warranty 等前台文案仍显示 Larumsport 的问题。",
      "🐛 修复页脚版权、客服邮箱和导航品牌名未同步新品牌，导致用户在不同页面看到品牌不一致的问题。",
      "🐛 修复 Medusa Redis/session 与 Payload cookie 仍使用旧命名空间，可能与旧站点 cookie 或缓存数据冲突的问题。",
      "🐛 修复 Payload/Storefront 默认读取 8020 端口、项目指南记录 8010/9010 端口，和当前 Petboxnest 本地服务端口不一致的问题。",
      "🐛 修复推荐短链写入旧 `_larumsport_referral` cookie 后，新品牌站点数据命名不一致的问题。",
      "🐛 修复根目录直接放置数据库压缩备份导致项目文件结构不清晰的问题，备份文件现集中归档到 data/。",
    ],
  },
  {
    version: "v1.0.11",
    date: "2026-08-30 02:15:11 EDT",
    title: "S3 media storage and domain deployment templates",
    items: [
      "Medusa 文件存储 provider 从本地 dated local file 切换为 S3-compatible 存储，并支持 SeaweedFS endpoint、bucket、prefix 和 forcePathStyle 配置。",
      "Backend 环境模板新增 S3_FILE_URL、S3_ACCESS_KEY_ID、S3_SECRET_ACCESS_KEY、S3_REGION、S3_BUCKET、S3_ENDPOINT 和 S3_PREFIX 配置项。",
      "Payload CMS 新增 @payloadcms/storage-s3 依赖和 s3Storage 插件，Media 集合上传改为通过 S3-compatible 存储生成公开文件 URL。",
      "CMS build 脚本改为先执行 payload generate:importmap，再执行 next build，确保 S3 上传处理器和 Admin 组件 import map 同步。",
      "新增 Backend、CMS、Storefront 域名部署环境模板，覆盖 larumsport.com、api、cms、media 和内部服务地址配置。",
      "Storefront Product Enhancements 增强媒体 URL 归一化，兼容 Payload/S3 返回包含内嵌绝对地址的媒体 URL。",
    ],
    fixes: [
      "修复本地媒体归档 hook 与远程 S3 存储同时存在时可能造成文件路径不一致的问题。",
      "修复 Payload S3/SeaweedFS 公共媒体 URL 需要手动拼接、容易出现重复路径的问题。",
      "修复商品增强内容读取 Payload 媒体时可能拿到嵌套绝对 URL，导致前台图片地址错误的问题。",
      "修复 CMS 构建时 importMap 可能未包含 S3ClientUploadHandler 的问题。",
      "修复生产环境变量文件可能被 Git 识别为未跟踪文件的问题，新增 **/.env.production 忽略规则。",
    ],
  },
  {
    version: "v1.0.10",
    date: "2026-08-26 10:09:03 EDT",
    title: "Public URL configuration and cookie consent",
    items: [
      "Backend、CMS 和 Storefront 环境变量模板新增 PUBLIC_PROTOCOL / PUBLIC_HOST，用于统一生成本地或线上公开访问地址。",
      "Medusa 配置新增公开 URL 展开逻辑，STORE_CORS、ADMIN_CORS、AUTH_CORS 和本地文件 backend_url 可复用 PUBLIC_* 占位符。",
      "Payload CMS 配置新增公开 URL 展开逻辑，统一 PAYLOAD_PUBLIC_SERVER_URL、CORS、CSRF 和 Next allowedDevOrigins 的主机来源。",
      "Storefront 新增 public-url 工具，统一生成 Medusa、Payload 和 Base URL，并支持 NEXT_PUBLIC_PUBLIC_* 占位符展开。",
      "Payload articles、online images、product enhancements 和商品 SEO 图片 URL 读取统一改用 getPayloadServerUrl。",
      "Storefront 主布局新增 CookieConsentBanner，支持接受全部、拒绝非必要 Cookie，以及按 Analytics / Marketing 管理偏好。",
    ],
    fixes: [
      "修复 localhost、127.0.0.1 和服务器 IP 分散硬编码导致不同运行环境 CORS/CSRF 不一致的问题。",
      "修复 Storefront 服务端读取 Payload 内容时部分文件只读取 PAYLOAD_SERVER_URL、忽略 NEXT_PUBLIC_PAYLOAD_SERVER_URL 的问题。",
      "修复商品详情页生成 Payload Open Graph 图片绝对地址时重复写死 Payload 默认地址的问题。",
      "修复 Medusa 本地文件上传访问地址在不同主机部署时需要手动改多处配置的问题。",
      "修复首次访问 Storefront 缺少 Cookie 偏好提示和持久化 consent 记录的问题。",
    ],
  },
  {
    version: "v1.0.9",
    date: "2026-08-25 15:06:18 EDT",
    title: "CMS media archive and product storytelling upgrade",
    items: [
      "Medusa 后端新增 dated local file provider，本地上传文件会按年份和月份归档到 static 目录。",
      "Payload Media 集合改为使用本地 media 目录，并在创建后把原图和缩略图移动到按月归档路径。",
      "Payload Product Enhancements 增加中英双语字段标签、富文本内容、图片上传、故事区块图片位置和图片组配置。",
      "Payload Admin 新增 MedusaProductPicker，可从已发布 Medusa 商品中选择产品并自动同步 product id 与 handle。",
      "CMS 新增 /api/medusa/products 接口，用 publishable key 读取 Medusa 已发布商品供 Admin 选择器使用。",
      "Storefront 商品详情增强区支持 Payload 富文本、上传图片、图片组、左右图文排版、视频链接、规格和护理说明。",
      "首页新增羽毛球制作说明区块，并替换 Contact Hero 背景图与羽毛球品牌文案。",
    ],
    fixes: [
      "修复 CMS 媒体上传后文件集中堆在根目录的问题，改为按 yyyy/mm 路径保存并同步 url 与尺寸图路径。",
      "修复 Product Enhancements 只能手动填写 Medusa 产品关联、容易填错 id 或 handle 的问题。",
      "修复 Storefront 读取 Payload 富文本上传图片时缺少媒体 URL 归一化的问题。",
      "修复商品增强内容中空亮点、空故事区块、空图片组或空规格可能造成前台冗余布局的问题。",
      "修复本地上传文件可能被 Git 跟踪的问题，补充忽略 backend static 和 CMS media 目录。",
    ],
  },
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
