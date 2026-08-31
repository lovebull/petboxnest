# Petboxnest Repository Guidelines

## 项目概况

Petboxnest 是面向美国市场的单品牌 D2C/B2C 实物商城。项目使用 pnpm workspace 管理，后端为 Medusa v2，前端为 Next.js Storefront。

- Storefront：`http://localhost:7000`
- Medusa API：`http://localhost:7020`
- Medusa Admin：`http://localhost:7020/app`
- Node.js：20 或更高版本
- 包管理器：pnpm 11

## 项目结构

- `apps/backend/`：Medusa API、Admin 扩展、工作流、模块和订阅器。
- `apps/backend/src/admin/`：Admin 页面、组件和 widgets。
- `apps/backend/src/api/`：自定义 Admin/Store API 路由。
- `apps/backend/src/modules/`：自定义 Medusa 模块，包括 Resend 邮件模块。
- `apps/backend/src/workflows/`：业务工作流及步骤。
- `apps/storefront/`：Next.js 15 Storefront。
- `apps/storefront/src/app/[countryCode]/`：按国家代码组织的 App Router 页面。
- `apps/storefront/src/modules/`：页面功能模块和组件。
- `apps/storefront/src/lib/data/`：Medusa 数据读取及 Server Actions。
- `.agents/skills/`：项目级 Medusa 和电商 Storefront Agent Skills。
- `docs/`：项目评审和 Medusa 相关文档。
- `old-system/`：旧系统归档，除非明确要求，否则不要修改。

## 常用命令

在仓库根目录运行：

```bash
pnpm install
pnpm --filter @dtc/backend dev
pnpm --filter @dtc/storefront dev
pnpm --filter @dtc/storefront exec tsc --noEmit --incremental false
pnpm --filter @dtc/backend lint
pnpm --filter @dtc/backend test:unit
pnpm --filter @dtc/backend exec medusa db:migrate
pnpm backend:seed
```

未经用户明确要求，禁止运行 `pnpm build`、`next build`、`medusa build` 或其他打包命令。前端改动优先使用 TypeScript 类型检查验证。

## 开发规范

- 使用 TypeScript，并遵循现有目录、组件和数据访问模式。
- React 组件使用 `PascalCase`，Hooks 使用 `useSomething`，工具函数使用清晰的 `camelCase` 名称。
- Storefront 优先使用 Server Components；只有需要状态、事件或浏览器 API 时才添加 `"use client"`。
- 避免在首次渲染中使用 `Date.now()`、`Math.random()`、客户端本地时间或不稳定文本，防止 hydration 错误。
- Storefront 内部链接使用现有 `LocalizedClientLink`，保留 `countryCode` 路径前缀。
- Medusa 后端功能按模块、工作流、API 路由和 Admin 扩展分层，不要在 API route 中堆积业务逻辑。
- 修改产品查询字段时，确认 Store API 返回需要的 metadata、variants 和 calculated price。
- 优先复用现有 UI、Tailwind tokens 和模块，不引入重复组件或无必要依赖。

## 测试与验证

- 仅前端改动：运行 `pnpm --filter @dtc/storefront exec tsc --noEmit --incremental false`。
- 后端改动：运行相关 lint、单元测试或针对性的集成测试。
- API 改动：验证 `/health`、相关 Store/Admin API，以及受影响页面。
- 页面改动：至少检查移动端和桌面端，并留意 hydration、控制台、图片配置和国家代码路由。
- 启动服务后确认 7000 与 7020 实际返回 HTTP 200。
- 不为通过检查而删除、覆盖或回退用户已有改动。

## 数据、缓存与基础设施

- PostgreSQL 和 Redis 连接通过环境变量配置；Redis 默认使用数据库 0。
- 产品详情中的 `metadata.amazon_url` 当前按 Storefront 的 `force-cache` 策略读取。
- 清理缓存时只处理明确的 Storefront 缓存目录，不要删除整个项目或不相关数据。
- 开发服务遇到 `ENOSPC` 时先检查 Linux inotify 限制，不要反复启动重复进程。

## Git 与文件安全

- 工作树可能包含用户未提交的修改；只编辑当前任务涉及的文件。
- 禁止使用 `git reset --hard`、`git checkout --` 或其他会丢失修改的命令。
- 使用 `rg` / `rg --files` 搜索，使用 patch 方式编辑文件。
- 不提交 `.env`、`.env.local`、数据库 URL、Redis 密码、API Key、令牌、日志、缓存或构建产物。
- 不在回复、终端输出或文档中暴露 Publishable Key 以外的敏感凭据。

## Agent Skills

处理 Medusa 后端、Admin 或 Storefront 任务时，优先加载 `.agents/skills/` 中匹配的技能并完整阅读其 `SKILL.md`。Cloud 技能可能包含部署、变量修改和删除操作；任何外部状态变更或破坏性命令都必须先获得用户明确授权。

## Medusa Documentation

The local Medusa documentation index is:

docs/medusa/llms.txt

Before implementing Medusa-specific functionality:

1. Read docs/medusa/llms.txt.
2. Find the relevant official documentation page.
3. Fetch the Markdown version of that page when needed.
4. Use official Medusa documentation as the source of truth.
5. Never guess Medusa APIs.

## Documentation Workflow

When implementing or modifying Medusa functionality:

1. Determine the Medusa version used by this project from package.json.
2. Read the official Medusa documentation before implementing framework-specific code.
3. Use docs/medusa/llms.txt as the documentation index.
4. Find the documentation page relevant to the task.
5. Prefer the Markdown version of documentation pages.

For example:

https://docs.medusajs.com/learn/customization/custom-features/module

can be accessed as:

https://docs.medusajs.com/learn/customization/custom-features/module.md


6. Do not guess Medusa APIs, services, workflows, modules, hooks, or configuration.
7. Do not use deprecated Medusa v1 patterns in this Medusa v2 project.
8. Verify imports and APIs against the current documentation.

## Medusa Architecture

Prefer Medusa Framework patterns:

- Modules
- Workflows
- Workflow Steps
- Module Links
- API Routes
- Subscribers
- Scheduled Jobs
- Admin Extensions

Avoid bypassing Medusa architecture with direct database operations unless explicitly required.

## Before Writing Code

Before implementing a Medusa-specific feature:

1. Search the official Medusa documentation.
2. Identify the recommended architecture.
3. Inspect the existing project implementation.
4. Explain the intended implementation briefly.
5. Then modify the code.

## Package Manager

Use pnpm unless the existing project specifies otherwise.

## Important

Never invent Medusa APIs.

If documentation and existing code disagree, report the difference before
changing architecture.
