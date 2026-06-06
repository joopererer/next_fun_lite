# Supabase 环境说明

## 测试 vs 正式：推荐两个 Supabase Project

Supabase **没有**单个项目内的 dev/prod 分支环境。隔离数据最稳妥的方式是：

| 环境 | 做法 | 用途 |
|------|------|------|
| **本地 / 测试** | 单独建一个 Supabase Project（如 `next-fun-dev`） | 随意 seed、删表、试功能 |
| **正式** | 另一个 Project（如 `next-fun-prod`） | 仅 Vercel Production 环境变量指向这里 |

Clerk 同样建议：`pk_test_` / `sk_test_` 用于开发，`pk_live_` 用于生产。

### 本地 `.env.local`（测试库）

```env
STORAGE_BACKEND=supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx-dev.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
# 可选：用于 npm run db:setup 自动跑 schema
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-xxx.pooler.supabase.com:6543/postgres
```

### Vercel 正式环境

在 Vercel → Project → Settings → Environment Variables 中，**Production** 单独配置 prod 项目的 Supabase URL / Service Role Key。Preview 分支可继续用 dev 库。

## 初始化数据库

1. 在 Supabase SQL Editor 粘贴并执行 `schema.sql`  
   **或** 在 `.env.local` 配置 `SUPABASE_DB_URL` 后运行：

   ```bash
   npm run db:setup
   ```

2. 导入测试数据（与 Mock 种子相同，少量活动/报名/感兴趣）：

   ```bash
   npm run db:seed
   ```

`db:setup` = schema（若有 DB URL）+ seed。

## 注意

- `profiles` 表由用户登录后通过 `/api/profile` 写入，seed 不包含用户 profile。
- `STORAGE_BACKEND=mock` 时活动数据在内存，**重启 dev 会丢失**；`supabase` 则持久化。
- Service Role Key **仅用于服务端**，不要暴露到前端或提交 git。
