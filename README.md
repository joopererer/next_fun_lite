# Next Fun Lite

Next Fun Club（巴黎华人社群）的轻量级活动组织工具——收集提议、发起招募、在线报名，一站完成。

## 技术栈

- **Framework**: Next.js 15（App Router）
- **Auth**: Clerk
- **Storage**: Mock / Google Sheets / Supabase（可切换）
- **UI**: React + TailwindCSS v4
- **AI**: Claude API（链接/图片解析）
- **Deploy**: Vercel

## 快速开始

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 http://localhost:3000

默认管理员密码：`admin123`（`ADMIN_PASSWORD`）

本地开发默认 `STORAGE_BACKEND=mock`，无需 Supabase/Clerk 即可浏览（Clerk 登录功能需配置 Clerk keys）。

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 首页：招募中 + 提议池 |
| `/my` | 我的报名（登录后从 Supabase 查询） |
| `/propose` | 提交提议 |
| `/recruit/new` | 公开发起招募 |
| `/event/:id` | 活动报名 |
| `/sign-in` / `/sign-up` | Clerk 登录注册 |
| `/onboarding` | 注册后完善昵称/微信号 |
| `/admin` | 管理员看板（需 Clerk 登录 + 管理员密码） |

## Supabase 建表

在 Supabase SQL Editor 执行 [`supabase/schema.sql`](supabase/schema.sql)。

## 环境变量

见 [`.env.example`](.env.example)

| 变量 | 说明 |
|------|------|
| `STORAGE_BACKEND` | `mock` / `google_sheets` / `supabase` |
| `NEXT_PUBLIC_CLERK_*` | Clerk 公开配置 |
| `CLERK_SECRET_KEY` | Clerk 服务端密钥 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥（仅 API 使用） |
| `ADMIN_PASSWORD` | 管理员密码 |
| `CLAUDE_API_KEY` | Claude API 密钥 |

## Vercel 部署

1. Push 到 GitHub
2. Vercel → New Project → 选择仓库（Framework: Next.js）
3. 填入 `.env.example` 中所有环境变量
4. Deploy

Clerk Dashboard 生产环境需配置 Allowed origins 为 Vercel 域名。

## Google Sheets（可选）

仍可使用 Google Sheets 作为存储后端，详见历史配置。registrations/interests 表可选 `user_id` 列。

## 开发说明

- API Routes 位于 `src/app/api/`，复用 `server/handlers/` 业务逻辑
- 页面组件位于 `src/views/`，路由位于 `src/app/`
- Profile 数据始终存 Supabase `profiles` 表（onboarding 需要 Supabase 配置）
