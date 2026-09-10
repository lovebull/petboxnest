# Petboxnest

面向美国市场的单品牌 D2C/B2C 实物商城。工程基于 Medusa v2 与 Next.js，采用 pnpm workspace 管理。

## 工程结构

```text
apps/
  backend/       Medusa API 与 Admin
  storefront/    Next.js Storefront
docs/commerce/   PRD、架构与 UI 评审材料
old-system/      旧 Flask 系统，仅保留归档
```

## 环境要求

- Node.js 20+（推荐 Node.js 24 LTS）
- pnpm 11+
- PostgreSQL 15+
- Redis 7+（生产环境必需）

## 本地初始化

1. 准备环境变量：

```bash
cp apps/backend/.env.template apps/backend/.env
cp apps/storefront/.env.template apps/storefront/.env.local
```

2. 在 `apps/backend/.env` 中设置 PostgreSQL 连接和安全密钥。

3. 安装依赖并初始化数据库：

```bash
pnpm install
pnpm --filter @dtc/backend exec medusa db:migrate
pnpm backend:seed
```

4. 创建后台管理员：

```bash
pnpm --filter @dtc/backend exec medusa user \
  --email admin@example.com \
  --password 'replace-this-password'
```

5. 启动后端与 Storefront：

```bash
pnpm dev
```

- Storefront：http://localhost:7000
- Medusa API：http://localhost:7020
- Medusa Admin：http://localhost:7020/app

## Storefront API Key

首次启动后台后，在 Admin 的 `Settings -> Publishable API Keys` 创建 Key，并写入：

```text
apps/storefront/.env.local
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

同时将 Key 关联到美国 Sales Channel。

## 常用命令

```bash
pnpm dev
pnpm build
pnpm lint
pnpm backend:dev
pnpm storefront:dev
pnpm backend:seed
```

## 安全说明

- 不提交 `.env`、`.env.local`、支付密钥或数据库凭证。
- 示例密钥仅供本地初始化，生产环境必须替换为独立随机值。
- Stripe、税务、物流和邮件 Provider 在对应评审决策确认后接入。
