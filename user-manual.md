# 官网 CMS 系统 — 用户手册

**版本：** v2.0.0  
**更新日期：** 2026-05-26  
**适用对象：** 系统管理员、内容编辑人员

---

## 1. 系统概述

本系统是一个**企业级多法人官网内容管理系统（CMS）**，采用前后端分离架构，支持多站点/多法人独立管理。

### 1.1 核心特性

- **多站点管理**：一套系统管理多个法人/机构的独立官网
- **RBAC 权限体系**：5 种角色 × 30 项权限，精细化访问控制
- **完整的文章工作流**：草稿 → 待审核 → 已发布 / 已驳回 → 下线 → 回收站
- **富文本编辑器**：集成 TinyMCE，支持图文混排
- **文件管理**：图片/视频/文档上传、预览、删除
- **响应式设计**：后台和前台均适配 PC 端和移动端
- **审计日志**：所有关键操作全程留痕

### 1.2 技术架构

| 层面 | 技术栈 |
|------|---------|
| 后端 | Node.js 22 + Express 4 + TypeScript |
| ORM | Prisma 5 |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） |
| 前端 | React 18 + Vite 5 + MUI 5 + Tailwind CSS 3 |
| 认证 | JWT（HS256，8 小时过期）|

### 1.3 系统组成

| 组件 | 说明 |
|------|------|
| 后端服务（`/server`） | 提供 RESTful API，端口 3001 |
| 前端后台（`/client`） | 管理后台 SPA，端口 5173 |
| 前台官网（同一前端） | 面向公众的官网展示，路由 `/` |
| 数据库（Prisma） | 17 张表，支持多租户隔离 |

---

## 2. 环境准备与启动

### 2.1 系统要求

- Node.js ≥ 22.0.0
- npm ≥ 10.0.0
- 磁盘空间 ≥ 500MB（含 node_modules）

### 2.2 安装依赖

```bash
# 安装后端依赖
cd official-website/server
npm install --cache /tmp/npm-cache

# 安装前端依赖
cd ../client
npm install --cache /tmp/npm-cache
```

> **注意**：如遇 npm 缓存权限错误，请使用 `--cache /tmp/npm-cache` 参数。

### 2.3 初始化数据库

```bash
cd official-website/server

# 生成 Prisma Client
npx prisma generate

# 推送 Schema（开发环境）
npx prisma db push

# 写入种子数据（3 个站点 + 5 个角色 + 超级管理员）
npx prisma db seed
```

种子数据包含：
- 3 个预置站点（春阳教育集团 / 德育中学 / 明德职业学校）
- 5 个系统角色（SUPER_ADMIN / SITE_ADMIN / EDITOR / VIEWER / VIEWER）
- 1 个超级管理员账号（`admin` / `admin123`）

### 2.4 启动系统

**方式一：分别启动（推荐开发时使用）**

```bash
# 终端 1：启动后端
cd official-website/server
npm run dev
# 输出：🚀 Server running on http://localhost:3001

# 终端 2：启动前端
cd official-website/client
npm run dev
# 输出：Local: http://localhost:5173/
```

**方式二：生产构建**

```bash
# 构建后端
cd official-website/server
npm run build
npm start

# 构建前端
cd ../client
npm run build
# 构建产物在 dist/ 目录，可部署到任意静态服务器
```

### 2.5 访问地址

| 功能 | 地址 |
|------|------|
| 前台官网 | http://localhost:5173/ |
| 后台管理 | http://localhost:5173/admin |
| 登录页 | http://localhost:5173/login |
| 后端 API | http://localhost:3001/api |
| 健康检查 | http://localhost:3001/api/health |

---

## 3. 账号与权限

### 3.1 默认账号

| 用户名 | 密码 | 角色 | 权限范围 |
|--------|------|------|---------|
| admin | admin123 | SUPER_ADMIN | 全部权限，可管理所有站点 |

> ⚠️ **首次登录后请立即修改密码！**

### 3.2 角色权限说明

| 角色 | 说明 | 典型用途 |
|------|------|---------|
| SUPER_ADMIN | 超级管理员，跨站点全部权限 | 平台运营方 |
| SITE_ADMIN | 站点管理员，管理单个站点 | 各校/机构管理员 |
| EDITOR | 内容编辑，可创建/编辑/提交文章 | 内容编辑人员 |
| VIEWER | 只读用户，可查看后台数据 | 审核人员、领导 |
| VIEWER | 已被禁用的账号 | — |

### 3.3 权限矩阵（摘要）

| 模块 | 权限标识 | SUPER_ADMIN | SITE_ADMIN | EDITOR | VIEWER |
|------|-----------|:-:|:-:|:-:|:-:|
| 站点管理 | site:read/create/update/delete | ✅ | ✅(仅本站点) | — | — |
| 用户管理 | user:read/create/update/delete | ✅ | ✅(仅本站点) | — | — |
| 栏目管理 | node:read/create/update/delete/sort | ✅ | ✅ | ✅(read) | ✅(read) |
| 文章管理 | article:read/create/update/delete/submit/review/publish | ✅ | ✅ | ✅ | ✅(read) |
| 文件管理 | media:read/upload/delete | ✅ | ✅ | ✅ | — |
| 轮播图 | banner:read/create/update/delete | ✅ | ✅ | ✅(read) | ✅(read) |
| 友情链接 | friendlink:read/create/update/delete | ✅ | ✅ | ✅(read) | ✅(read) |
| 领导管理 | leader:read/create/update/delete | ✅ | ✅ | ✅(read) | ✅(read) |
| 师资管理 | teacher:read/create/update/delete | ✅ | ✅ | ✅(read) | ✅(read) |
| 导航管理 | nav:read/create/update/delete/sort | ✅ | ✅ | — | ✅(read) |
| 快捷入口 | quicklink:read/create/update/delete/sort | ✅ | ✅ | — | ✅(read) |
| 通知公告 | notification:read/create/update/delete | ✅ | ✅ | ✅ | ✅(read) |
| 部门管理 | department:read/create/update/delete | ✅ | ✅ | — | ✅(read) |
| 回收站 | recycle:read/restore/delete | ✅ | ✅ | — | — |
| 审计日志 | audit:read | ✅ | ✅(仅本站点) | — | — |

---

## 4. 后台管理操作指南

### 4.1 登录

1. 访问 http://localhost:5173/login
2. 输入用户名和密码
3. 点击「登录」
4. 登录成功后将跳转至后台首页

> 🔒 连续 5 次密码错误将锁定账号 15 分钟。

### 4.2 顶部栏功能

- **站点切换器**（左上角下拉）：在您有权管理的站点间切换
- **当前用户**（右上角）：显示登录用户名，点击可退出登录

### 4.3 仪表盘（首页）

登录后默认进入仪表盘，展示当前站点的：
- 文章总数
- 本月新增文章
- 文件总数
- 最近操作记录

### 4.4 站点管理（SUPER_ADMIN 专属）

**切换站点：**
1. 点击左侧菜单「站点管理」
2. 在站点卡片上点击「切换」按钮
3. 切换后，所有管理页面自动加载该站点的数据

**新增站点：**
1. 点击「新增站点」按钮
2. 填写站点名称、英文名、联系电话、邮箱、地址等
3. 选择主色调和副色调
4. 填写网站简介
5. 点击「保存」

**编辑/删除站点：**
- 在站点卡片上点击「编辑」修改信息
- 点击「删除」移除站点（至少保留一个站点）

### 4.5 用户管理

**查看用户列表：**
- 点击左侧菜单「用户管理」
- 支持按角色筛选、按用户名搜索

**新增用户：**
1. 点击「新增用户」
2. 填写用户名、密码、确认密码
3. 选择角色（SITE_ADMIN / EDITOR / VIEWER / VIEWER）
4. 选择授权站点（该用户可管理的站点）
5. 点击「保存」

**禁用/启用用户：**
- 在用户行点击「禁用」或「启用」

**重置密码：**
- 编辑用户时可重新设置密码

### 4.6 栏目管理

栏目采用树形结构，支持多级嵌套。

**查看栏目树：**
- 点击左侧菜单「栏目管理」
- 以树形方式展示所有栏目

**新增栏目：**
1. 选择父栏目（根栏目或某子栏目）
2. 点击「新增子栏目」
3. 填写栏目名称、排序权重
4. 选择是否在导航栏显示
5. 点击「保存」

**编辑/删除栏目：**
- 点击栏目行的「编辑」修改
- 点击「删除」移除（有子栏目或有文章时不允许删除）

**排序调整：**
- 使用拖拽或排序按钮调整栏目顺序

### 4.7 文章管理

文章有完整的状态工作流：

```
草稿(DRAFT) → 提交审核(PENDING) → 审核通过(PUBLISHED)
                                    ↓ 审核驳回(REJECTED)
                                    → 重新编辑 → 再次提交
发布后 → 下线(OFFLINE) → 回收站(TRASHED)
```

**新建文章：**
1. 点击左侧菜单「文章管理」
2. 点击「新建文章」
3. 填写标题、选择所属栏目
4. 使用富文本编辑器编写正文
5. 上传封面图（可选）
6. 填写摘要（可选，不填则自动截取正文前 200 字）
7. 设置状态：
   - **草稿**：仅自己可见，可后续编辑
   - **提交审核**：送审，等待管理员审核
8. 点击「保存」

**编辑文章：**
- 点击文章行的「编辑」按钮
- 修改后保存

**提交审核：**
- 草稿状态的文章可点击「提交审核」
- 提交后状态变为「待审核」，EDITOR 无法再修改

**审核文章（SITE_ADMIN 操作）：**
- 待审核文章点击「审核」
- 选择「通过」（变为已发布）或「驳回」（变为已驳回）
- 驳回时可填写驳回原因

**发布/下线（SITE_ADMIN 操作）：**
- 已审核通过的文章可点击「发布」正式上线
- 已发布的文章可点击「下线」撤下

**删除文章：**
- 点击「删除」→ 移入回收站（软删除，可恢复）

### 4.8 文件管理

**上传文件：**
1. 点击左侧菜单「文件管理」
2. 点击「上传文件」
3. 选择本地文件（支持图片/视频/音频/文档）
4. 上传完成后自动生成预览

**插入图片到文章：**
- 在文章编辑器中点「插入图片」
- 选择已上传的图片或重新上传

**删除文件：**
- 点击文件卡片的「删除」

### 4.9 轮播图管理

**新增轮播图：**
1. 点击左侧菜单「轮播图管理」
2. 点击「新增」
3. 填写标题、副标题
4. 上传图片（推荐尺寸 1400×500 像素）
5. 设置跳转链接（可选）
7. 设置排序权重
8. 点击「保存」

**编辑/删除：**
- 在列表中直接修改，或点击「删除」

### 4.10 领导管理

**新增领导：**
1. 点击左侧菜单「领导管理」
2. 点击「新增」
3. 填写姓名、职务
4. 上传照片
5. 填写简介
6. 设置排序权重
7. 点击「保存」

### 4.11 师资管理

**新增教师：**
1. 点击左侧菜单「师资管理」
2. 点击「新增」
3. 填写姓名、学科、职称、从教年限
4. 上传照片
5. 填写个人简介
6. 设置排序权重
7. 点击「保存」

### 4.12 导航菜单管理

管理前台顶部的导航菜单。

**新增菜单项：**
1. 点击左侧菜单「导航管理」
2. 点击「新增」
3. 填写菜单名称、跳转链接
4. 选择父级菜单（支持二级菜单）
5. 设置排序权重
6. 点击「保存」

### 4.13 快捷入口管理

管理前台首页的快捷入口卡片。

**新增快捷入口：**
1. 点击左侧菜单「快捷入口」
2. 点击「新增」
3. 填写名称、图标（使用 Material Icon 名称）
4. 设置跳转链接
5. 选择颜色
6. 点击「保存」

> 💡 图标名称参考：https://mui.com/material-icons/

### 4.14 通知公告管理

**新增通知：**
1. 点击左侧菜单「通知公告」
2. 点击「新增」
3. 填写标题、正文
4. 设置是否置顶
5. 点击「发布」

### 4.15 友情链接管理

**新增友链：**
1. 点击左侧菜单「友情链接」
2. 点击「新增」
3. 填写站点名称和链接 URL
4. 点击「保存」

### 4.16 回收站

**查看已删除内容：**
- 点击左侧菜单「回收站」
- 可按类型筛选（文章/栏目/轮播图等）

**恢复：**
- 选择已删除项，点击「恢复」

**彻底删除：**
- 点击「彻底删除」（不可恢复！）

### 4.17 审计日志

**查看操作记录：**
1. 点击左侧菜单「审计日志」
2. 可按操作人、操作类型、时间范围筛选
3. 记录包括：操作时间、操作人、操作类型、操作对象、IP 地址

---

## 5. 前台官网使用说明

### 5.1 访问前台

在浏览器访问 http://localhost:5173/ 即可查看当前激活站点的官网首页。

### 5.2 首页结构

| 区域 | 说明 |
|------|------|
| 顶部工具栏 | 电话、邮箱、后台管理入口 |
| Logo 区域 | 机构名称（中英文）、搜索框 |
| 主导航栏 | 一级菜单 + 二级下拉菜单 |
| 轮播 Banner | 全宽大图轮播，自动切换 |
| 快捷入口 | 4 个图标按钮 |
| 学校要闻 | 最新发布文章列表 |
| 通知公告 | 最新通知列表 |
| 数字展示区 | 办学成果数据统计 |
| 领导班子 | 领导卡片展示 |
| 师资队伍 | 教师卡片展示 |
| 友情链接 | 合作机构链接 |
| 底部版权 | 联系方式、备案信息 |

### 5.3 文章列表与详情

- 点击导航菜单进入对应栏目文章列表
- 支持关键词搜索和分页
- 点击文章标题进入详情页
- 详情页包含：上下篇导航、相关文章推荐

### 5.4 多站点访问

系统通过「当前激活站点」决定前台展示哪个站点的内容。

**切换前台展示的站点（管理员操作）：**
1. 登录后台
2. 使用左上角站点切换器切换站点
3. 刷新前台页面（F5）

> 💡 生产环境中，通常通过**不同域名或子域名**来区分不同站点。

---

## 6. 多法人/多站点使用流程

### 6.1 创建新站点

1. 以 SUPER_ADMIN 身份登录后台
2. 进入「站点管理」→「新增站点」
3. 填写机构名称、主色调等基本信息
4. 保存后，使用站点切换器切换到新站点
5. 依次配置：
   - 导航菜单
   - 轮播图
   - 快捷入口
   - 栏目结构
   - 文章内容
   - 领导信息
   - 师资信息
   - 友情链接
6. 打开前台首页查看效果

### 6.2 为站点分配管理员

1. 进入「用户管理」→「新增用户」
2. 角色选择 `SITE_ADMIN`
3. 「授权站点」勾选对应的站点
4. 保存后，该用户即可独立管理对应站点的内容

### 6.3 数据隔离说明

- 每个站点的文章、栏目、文件、轮播图等数据**完全独立**
- SITE_ADMIN 只能看到和管理自己授权站点的数据
- SUPER_ADMIN 可以看到所有站点的数据

---

## 7. 生产环境部署

### 7.1 后端部署

```bash
cd official-website/server

# 安装生产依赖
npm ci --production --cache /tmp/npm-cache

# 构建
npm run build

# 设置环境变量
export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
export JWT_SECRET="your-secret-key"
export NODE_ENV="production"

# 运行数据库迁移
npx prisma migrate deploy

# 启动
npm start
```

### 7.2 前端部署

```bash
cd official-website/client

# 设置 API 地址环境变量
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production

# 构建
npm run build

# dist/ 目录下的文件部署到任意静态服务器（Nginx/Apache/CDN）
```

### 7.3 Nginx 反向代理配置（参考）

```nginx
server {
    listen 80;
    server_name www.yourdomain.com;

    # 前端静态文件
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传文件代理
    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

---

## 8. 常见问题

### Q1：登录后马上跳回登录页？

**A：** 可能是 JWT Token 过期或浏览器禁用了 Cookie/LocalStorage。请检查：
1. 浏览器是否禁用了 LocalStorage
2. 系统时间是否正确（影响 Token 过期校验）

### Q2：前台页面空白？

**A：** 请检查：
1. 数据库中是否有激活状态的站点（`isActive: true`）
2. 站点是否有栏目和文章数据
3. 浏览器控制台是否有 JavaScript 错误

### Q3：图片上传失败？

**A：** 请检查：
1. 后端 `uploads/` 目录是否存在且有写入权限
2. 文件大小是否超过限制（默认 10MB）
3. 文件类型是否在允许范围内

### Q4：如何修改 JWT 密钥？

**A：** 修改 `server/.env` 中的 `JWT_SECRET` 变量，然后重启后端服务。

### Q5：忘记管理员密码怎么办？

**A：** 有两种方式重置：
1. **通过数据库**：直接修改 `users` 表中对应用户的密码（需先知道 bcrypt 哈希）
2. **通过 Prisma Studio**：运行 `npx prisma studio`，在浏览器中直接编辑用户表

### Q6：如何备份数据？

**A：** 
- **SQLite**：直接复制 `prisma/dev.db` 文件
- **PostgreSQL**：使用 `pg_dump` 工具导出 SQL 备份

### Q7：前端端口被占用？

**A：** 修改 `client/vite.config.ts` 中的 `server.port` 配置，或启动时指定端口：
```bash
npm run dev -- --port 5174
```

### Q8：后端端口被占用？

**A：** 修改 `server/.env` 中的 `PORT` 变量，或启动时指定：
```bash
PORT=3002 npm run dev
```

---

## 9. 技术参考

### 9.1 目录结构

```
official-website/
├── server/                # 后端（Node.js + Express + Prisma）
│   ├── src/
│   │   ├── controllers/  # 控制器层
│   │   ├── services/     # 业务逻辑层
│   │   ├── routes/       # 路由定义
│   │   ├── middle-ware/ # 中间件（认证/RBAC/审计等）
│   │   ├── utils/        # 工具函数
│   │   ├── config.ts     # 配置（端口/JWT密钥等）
│   │   └── index.ts     # 入口文件
│   ├── prisma/
│   │   ├── schema.prisma# 数据模型定义
│   │   └── seed.ts      # 种子数据
│   └── uploads/         # 上传文件存储目录
│
├── client/               # 前端（React + Vite + MUI）
│   ├── src/
│   │   ├── api/         # API 调用层
│   │   ├── components/  # 组件（AdminLayout/PortalLayout/Common）
│   │   ├── pages/       # 页面（登录/后台/前台）
│   │   ├── stores/      # Zustand 状态管理
│   │   ├── hooks/       # 自定义 Hooks
│   │   ├── router/      # React Router 路由
│   │   └── utils/       # 工具函数
│   └── dist/           # 构建产物
│
├── docs/                  # 项目文档
│   ├── PRD.md           # 产品需求文档
│   ├── ARCHITECTURE.md  # 系统架构设计
│   └── test-report.md   # 测试报告
│
└── user-manual.md        # 本文件
```

### 9.2 环境变量说明

**后端（`server/.env`）：**

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3001 | 后端服务端口 |
| `NODE_ENV` | development | 运行环境 |
| `DATABASE_URL` | file:./dev.db | 数据库连接串 |
| `JWT_SECRET` | changeme | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | 8h | JWT 过期时间 |
| `UPLOAD_DIR` | ./uploads | 上传文件存储目录 |

**前端（`client/.env`）：**

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | http://localhost:3001/api | 后端 API 地址 |
| `VITE_DEFAULT_SITE_ID` | （空） | 默认站点 ID |

---

*文档版本：v2.0.0 — 2026-05-26*
