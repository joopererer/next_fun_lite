# 快乐制造局

Next Fun Club（巴黎华人社群）的轻量级活动组织工具——收集提议、发起招募、在线报名，一站完成。

## 功能概览

- **提议池** — 社区成员提交活动想法，他人可点「感兴趣」
- **招募与报名** — 发起人创建活动，支持登录或游客报名
- **近期资讯** — 匿名发布票务/活动信息，可一键转招募
- **日历提醒** — 报名后自行「加入日历」（ICS / Google / Outlook）
- **站内通知** — Header 铃铛：活动变更、提议转招募等（登录后）
- **邮件通知** — 活动取消/重要变更（Resend，可在设置中关闭）
- **管理后台** — 看板、Excel 导入/导出、活动编辑

Header **(i)** 按钮可查看使用说明与权限说明。

## 技术栈

- **Framework**: Next.js 15（App Router）
- **Auth**: Clerk
- **Storage**: Mock / Google Sheets / Supabase（可切换）
- **UI**: React + TailwindCSS v4
- **AI**: Claude / OpenAI / Gemini（链接与图片解析）
- **Email**: Resend + React Email
- **Deploy**: Vercel

## 快速开始

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问 http://localhost:3000

默认管理员密码：`admin123`（环境变量 `ADMIN_PASSWORD`）

本地开发默认 `STORAGE_BACKEND=mock`，无需 Supabase/Clerk 即可浏览；登录、我的报名、通知等需配置 Clerk 与 Supabase。

详细开发说明见 **[docs/develop.md](docs/develop.md)**。

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 首页：招募中、提议池、近期资讯 |
| `/event/:id` | 活动详情与报名 |
| `/propose` | 提交提议（需登录） |
| `/recruit/new` | 发起招募（需登录） |
| `/info/new` | 发布资讯（无需登录） |
| `/my` | 我的报名（需登录） |
| `/settings/notifications` | 通知偏好（需登录） |
| `/cancel/:token` | 游客取消报名链接 |
| `/sign-in` / `/sign-up` | Clerk 登录注册 |
| `/onboarding` | 注册后完善资料 |
| `/admin` | 管理看板（Clerk + 管理员密码） |

## Supabase 建表

**新项目**：在 SQL Editor 执行 [`supabase/schema.sql`](supabase/schema.sql)。

**已有项目**：按顺序执行 [`supabase/migrations/`](supabase/migrations/) 下 v5–v10 脚本（见 [develop.md](docs/develop.md#数据库)）。

`npm run db:setup` 仅执行 `schema.sql`（需 `SUPABASE_DB_URL`），不含 migrations 目录。

## 环境变量

见 [`.env.example`](.env.example)。常用项：

| 变量 | 说明 |
|------|------|
| `STORAGE_BACKEND` | `mock` / `google_sheets` / `supabase` |
| `NEXT_PUBLIC_CLERK_*` / `CLERK_SECRET_KEY` | Clerk 认证 |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase |
| `ADMIN_PASSWORD` | 管理后台密码 |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | 活动取消/变更邮件 |
| `PARSE_MODE` + AI Key | 链接/图片解析（`mock` / `claude` / `openai` / `gemini`） |

## Vercel 部署

1. Push 到 GitHub
2. Vercel → New Project → 选择仓库（Framework: Next.js）
3. 填入 `.env.example` 中所需环境变量
4. Deploy

Clerk Dashboard 生产环境需配置 Allowed origins 为 Vercel 域名。

## 项目结构（简要）

- `src/app/api/` — API Routes，复用 `server/handlers/`
- `src/views/` — 页面组件；`src/app/` — 路由
- `shared/` — 共享类型与 Excel 导入/导出逻辑
- Profile 与通知数据存 Supabase（需 Supabase 配置）

## Google Sheets（可选）

仍可使用 Google Sheets 作为存储后端。registrations / interests 表可选 `user_id` 列。
