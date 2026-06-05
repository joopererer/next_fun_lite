# Next Fun Lite

Next Fun Club（巴黎华人社群）的轻量级活动组织工具——收集提议、发起招募、在线报名，一站完成。

## 技术栈

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Express（本地开发）/ Cloudflare Workers（生产）
- **Storage**: Mock / Google Sheets（可切换）
- **AI**: Claude API（链接/图片解析）

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器（前端 :5173 + API :8787）
npm run dev
```

默认管理员密码：`admin123`（在 `.env` 中设置 `ADMIN_PASSWORD`）

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 首页：招募中 + 提议池（支持类型筛选） |
| `/propose` | 提交提议 |
| `/recruit/new` | 公开发起招募（支持 `?from=:id` 从提议转化） |
| `/event/:id` | 活动报名 |
| `/admin` | 管理员看板 |
| `/admin/activity/:id` | 活动详情 + 报名名单 |

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/proposals` | 公开提交提议 |
| POST | `/api/recruitments` | 公开发起招募（无需管理员密码） |
| POST | `/api/activities` | 管理员创建活动 |

## 环境变量

见 [`.env.example`](.env.example)

| 变量 | 说明 |
|------|------|
| `STORAGE_BACKEND` | `mock` / `google_sheets` / `supabase` / `tencent_docs` |
| `ADMIN_PASSWORD` | 管理员密码 |
| `CLAUDE_API_KEY` | Claude API 密钥 |
| `PARSE_MODE` | `mock` 跳过 AI 解析 |
| `SITE_URL` | 部署后的站点 URL |

## Google Sheets 配置

1. 在 [GCP 控制台](https://console.cloud.google.com/) 创建项目并启用 **Google Sheets API**
2. 创建 **Service Account**，下载 JSON 密钥
3. 创建 Google 表格，添加三个 Sheet：
   - `activities` — 列：`id | title | description | date | location | max_participants | fee | notes | organizer_name | organizer_wechat | source_url | category | status | interested_count | created_at | fee_level | ticket_prices | ticket_url | ticket_deadline | ticket_method | refund_policy | difficulty | distance_and_duration | itinerary | equipment | transportation | meal_arrangement | restaurant_address | per_person_cost | reservation_method | requires_deposit | recap | recap_images`
   - `registrations` — 列：`id | activity_id | name | wechat | participant_count | note | registered_at`
   - `interests` — 列：`id | activity_id | name | wechat | created_at`
4. 将 Service Account 邮箱添加为表格**编辑者**
5. 设置环境变量：
   ```
   STORAGE_BACKEND=google_sheets
   GOOGLE_SHEETS_ID=你的表格ID
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   ```

## Cloudflare 部署

### 前端（Pages）

```bash
npm run build
npx wrangler pages deploy dist --project-name next-fun-lite
```

### API（Worker）

```bash
# 设置 secrets
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put CLAUDE_API_KEY
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON

# 部署 Worker
npm run deploy
```

在 Cloudflare Pages 设置中，将 `/api/*` 路由绑定到 Worker。

生产环境建议：
- `STORAGE_BACKEND=google_sheets`
- `SITE_URL=https://your-domain.pages.dev`

## 开发优先级完成情况

- [x] MockAdapter + 初始数据
- [x] 首页 / 报名页 / 提议页
- [x] 管理员看板（拖拽 + 列表 + 表单）
- [x] Google Sheets 适配器
- [x] Claude 解析接口
- [x] Cloudflare 部署配置
