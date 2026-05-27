# 官方网站 CMS 系统 v2.0.0

企业级内容管理系统，支持多法人实体配置。

## 技术栈

### 后端
- Node.js 22 + Express 4 + TypeScript
- Prisma 5（PostgreSQL / SQLite）
- JWT 认证 + bcrypt 加密
- Winston 日志 + Helmet 安全头

### 前端
- React 18 + TypeScript
- Vite 5 + MUI 5 + Tailwind CSS 3
- Zustand 状态管理 + Axios

## 功能模块

### 后台 CMS（需认证）
- 认证系统（JWT + 5次失败锁定）
- 角色权限（RBAC，5 角色 + 30 权限）
- 多法人实体管理
- 栏目树形管理
- 文章状态机（DRAFT → PENDING → PUBLISHED/REJECTED → OFFLINE）
- 富文本编辑器（TinyMCE）+ XSS 过滤
- 文件上传管理
- 轮播图 / 友情链接 / 领导 / 师资 / 导航 / 快捷入口 / 通知公告
- 回收站（软删除 + 恢复 + 永久删除）
- 审计日志

### 前台官网（无需认证）
- 首页（Banner 轮播 + 快捷入口 + 要闻 + 公告 + 领导 + 师资 + 友链）
- 新闻列表（分页 + 搜索 + 栏目筛选）
- 文章详情（富文本渲染 + 上下篇 + 相关推荐）
- 领导介绍 / 师资队伍（响应式网格）

## 快速开始

### 本地开发

**后端**：
```bash
cd server
cp .env.example .env
# 编辑 .env 填写 DATABASE_URL 和 JWT_SECRET
npm install --cache /tmp/npm-cache
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev
```

**前端**：
```bash
cd client
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env
npm install --cache /tmp/npm-cache
npm run dev
```

**访问**：
- 前台：http://localhost:5173/
- 后台：http://localhost:5173/login
- 默认账号：`admin` / `admin123`

## 部署到 Render

### 一键部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 登录 https://render.com/
3. 点击 "New +" → "Blueprint"
4. 连接 GitHub 仓库
5. Render 会自动读取 `render.yaml` 并创建：
   - Node.js Web Service（后端 API）
   - PostgreSQL 数据库
6. 部署完成后，复制后端 API 地址（类似 `https://cms-api.onrender.com`）

### 手动部署

**后端（Render）**：
1. "New +" → "Web Service"
2. 连接 GitHub 仓库，选择 `server` 目录
3. 配置：
   - **Build Command**: `npm install && npx prisma generate && npm run build && npx prisma db push`
   - **Start Command**: `npm start`
4. 添加环境变量：
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `[强随机字符串]`
   - `JWT_EXPIRES_IN`: `8h`
   - `DATABASE_URL`: 自动从关联的 PostgreSQL 数据库注入
5. 点击 "Create Web Service"

**前端（CloudStudio / Vercel / Netlify）**：
1. 修改 `client/.env`：
   ```
   VITE_API_BASE_URL=https://your-api.onrender.com/api
   ```
2. 构建：`npm run build`
3. 部署 `dist/` 目录到静态托管服务

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://...` |
| `JWT_SECRET` | JWT 签名密钥（生产环境必须修改！） | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `8h` |
| `PORT` | 服务端口（Render 自动设置） | `3001` |
| `NODE_ENV` | 环境模式 | `production` |

## 项目结构

```
official-website/
├── server/                # 后端（Express + Prisma）
│   ├── prisma/
│   │   ├── schema.prisma # 数据库模型
│   │   └── seed.ts        # 种子数据
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   └── index.ts      # 入口
│   └── .env.example     # 环境变量示例
├── client/               # 前端（React + Vite）
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 通用组件
│   │   ├── api/          # API 层
│   │   ├── stores/       # Zustand 状态管理
│   │   └── router/      # 路由配置
│   └── .env             # API 地址配置
├── docs/                 # 文档
│   ├── PRD.md            # 产品需求文档
│   ├── ARCHITECTURE.md  # 系统架构设计
│   ├── test-report.md    # QA 测试报告
│   └── delivery-summary.md # 交付总结
├── render.yaml           # Render 部署配置
└── user-manual.md       # 用户手册
```

## 测试

### 运行测试

```bash
cd server
npm test
```

### 手动测试

**健康检查**：
```bash
curl http://localhost:3001/api/health
```

**登录测试**：
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 许可证

MIT License

## 联系方式

通过 WorkBuddy 联系开发团队。
