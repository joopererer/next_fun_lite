# 开发指南

本文档面向维护者与贡献者，说明项目结构、本地开发与部署注意事项。用户向说明见 Header 右侧 **(i) 关于** 弹窗（[`shared/aboutContent.ts`](../shared/aboutContent.ts)）。

## 项目结构

```
next_fun_lite/
├── src/
│   ├── app/              # Next.js App Router（薄路由层）
│   ├── views/            # 页面级 Client/Server 组件
│   ├── components/       # 可复用 UI
│   └── lib/              # 前端 API 封装、工具
├── server/
│   ├── handlers/         # 业务逻辑（API 与 Worker 共用）
│   ├── storage/          # StorageAdapter 实现（mock / supabase / …）
│   └── notifications/    # 邮件与站内通知触发
├── shared/               # 前后端共享类型与纯函数
├── lib/                  # 服务端工具（Supabase 单例、邮件等）
├── emails/               # React Email 模板
└── supabase/
    ├── schema.sql        # 全量建表（新环境）
    └── migrations/       # 增量迁移 v5–v10
```

**数据流**：`src/app/api/*` → `server/handlers/*` → `StorageAdapter` → Supabase / Mock / …

## 本地开发

```bash
npm install
cp .env.example .env.local
npm run dev
```

| 场景 | 建议配置 |
|------|----------|
| 仅浏览 UI | `STORAGE_BACKEND=mock`，可不配 Clerk |
| 登录 / 报名 / 我的 | 配置 Clerk + Supabase，`STORAGE_BACKEND=supabase` |
| 管理后台 | 同上 + `ADMIN_PASSWORD`；每次进入 `/admin` 需输入密码 |
| 链接/图片解析 | 配置 `CLAUDE_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` 与 `PARSE_MODE` |
| 活动取消/变更邮件 | `RESEND_API_KEY`、`RESEND_FROM_EMAIL` |

其他脚本：

- `npm run build` — 生产构建
- `npm run db:setup` — 需 `SUPABASE_DB_URL`，执行 schema + migrations
- `npm run db:seed` — 向 Supabase 写入示例数据

## 数据库

**新项目**：在 SQL Editor 执行 [`supabase/schema.sql`](../supabase/schema.sql)（已对齐 v10，不含 `info_interests`）。

**已有项目增量升级**：按顺序执行 `supabase/migrations/` 下脚本：

可选：`npm run db:setup` 仅执行 `schema.sql`（需 `SUPABASE_DB_URL`），不会自动跑 migrations 目录。

| 文件 | 说明 |
|------|------|
| v5_registrations_interests.sql | 报名/感兴趣 user_id |
| v6_date_end_registration_deadline.sql | 活动结束时间、报名截止 |
| v7_contact_meeting_info.sql | 联系方式、集合地点、资讯字段 |
| v8_info_start_time.sql | 资讯开始时间 |
| v9_notifications.sql | profiles 通知偏好、notifications 表 |
| v10_drop_info_interests.sql | 删除 info_interests（资讯提醒已废弃） |

## 权限与登录

| 操作 | 是否需登录 |
|------|------------|
| 浏览首页、活动详情 | 否 |
| 游客报名（填昵称+联系方式） | 否 |
| 提议点「感兴趣」 | 否（按设备 ID） |
| 发布资讯 `/info/new` | 否（填昵称） |
| 提交提议、发起招募 | 是 |
| 我的报名、资料、站内通知 | 是 |
| 管理后台 | Clerk 登录 + 管理员密码 |

管理员密码仅存于浏览器内存，离开 `/admin` 布局后清除；API 通过 `X-Admin-Password` 头校验。

## 通知系统

### 站内（Header 🔔）

- 组件：`NotificationBell` + `NotificationDrawer`
- API：`GET /api/notifications`、`GET /api/notifications/unread-count`、`PATCH /api/notifications/[id]`、`POST /api/notifications/read-all`
- 首页另有 `HomeNotificationBanner`（未读 ≤3 条），点击可打开抽屉

### 触发场景（`server/notifications/triggers.ts`）

| 事件 | 站内 | 邮件 |
|------|------|------|
| 活动取消 | ✓ | ✓（偏好 + Resend） |
| 活动关键字段变更 | ✓ | ✓ |
| 提议 → 招募 | ✓ | — |
| 新招募发布 | ✓（ opt-in） | — |
| 活动开始前提醒 | — | 已移除，改用户「加入日历」 |

### 日历提醒

- `AddToCalendarButton`：ICS 下载 / Google / Outlook Web
- 微信内置浏览器仅推荐 ICS

## 管理后台

路径 `/admin`，Tab：

- **看板 / 列表** — 活动状态管理
- **新建 / 编辑** — `RecruitForm`（admin 模式）
- **导入** — `.xlsx`，解析见 [`shared/excelImport.ts`](../shared/excelImport.ts)
- **导出** — 勾选活动，格式对齐 Next Fun 项目管理表，见 [`shared/excelExport.ts`](../shared/excelExport.ts)

导入去重：`标题 + 日期（YYYY-MM-DD）` 相同则跳过，不覆盖。

## Excel 格式

表头行需含 **「活动名称」**。主要列：状态、ID、Date、类型、活动名称、地点、集合时间/地点、链接、介绍、发起人、报名成员、参加人数、复盘等。详见 `excelImport.ts` / `excelExport.ts`。

## 代码约定

- 类型定义：[`shared/types.ts`](../shared/types.ts)
- 新增 API：在 `server/handlers/` 实现，于 `src/app/api/` 挂路由
- 存储变更：同步更新 `StorageAdapter` 接口及 mock / supabase 实现
- 活动状态机：[`shared/activityStatus.ts`](../shared/activityStatus.ts)
- 资讯可见性：[`shared/infoVisibility.ts`](../shared/infoVisibility.ts)

## 部署（Vercel）

1. 连接 GitHub 仓库，Framework 选 Next.js
2. 填入 `.env.example` 中生产环境变量
3. Clerk Dashboard 添加 Vercel 域名到 Allowed origins
4. Supabase 执行 schema 或补齐 migrations
5. 不再需要 `CRON_SECRET`（定时提醒已移除）

## 常见问题

**本地 webpack / chunk 报错**  
删除 `.next` 后重启 `npm run dev`；重模块（`xlsx`、`qrcode`）已做动态 import。

**管理端 Excel 导入 Unauthorized**  
确认已在 `/admin` 输入管理员密码（非仅 Clerk 登录）。

**铃铛无未读角标**  
需登录且有 `is_read = false` 的通知；角标在抽屉打开时隐藏。
