# CMS 功能测试报告

**测试时间**: 2026-05-28  
**测试环境**: 本地 (127.0.0.1:3002 API / :5173 Frontend)  
**测试账号**: admin (SUPER_ADMIN)

---

## 测试结果总览

| 编号 | 功能 | 状态 | 备注 |
|------|------|------|------|
| 1 | 登录 + auth/me | ✅ 通过 | 用户信息、权限、关联站点均正确 |
| 2 | 站点列表 (分页格式) | ✅ 通过 | super_admin 返回全部 6 个站点 |
| 3 | 站点列表 (status 过滤) | ✅ 通过 | `?status=ACTIVE` 正确返回 3 个 |
| 4 | 站点详情 | ✅ 通过 | 按 ID 获取单站点正常 |
| 5 | 站点创建 | ✅ 通过 | 创建后列表数量 +1 |
| 6 | 站点删除 (软删除) | ✅ 通过 | 删除后 status 变为 INACTIVE |
| 7 | 用户列表 (分页) | ✅ 通过 | 分页格式 `{ list, total }` 正确 |
| 8 | 文章列表 (分页) | ✅ 通过 | 分页格式正确，6 篇文章 |
| 9 | 审计日志 (分页) | ✅ 通过 | 66 条日志记录正常 |

---

## 本次修复的问题

### 1. `Sites.tsx` 无限循环 Bug
- **现象**: 前端每秒发几十次 `GET /api/sites`，触发 429
- **原因**: `useCallback(fn, [siteStore])` 依赖整个 store 对象，每次 `setSites` 都导致重新创建函数，`useEffect` 无限触发
- **修复**: 去掉 `useCallback`，`useEffect` 依赖改为 `[]`

### 2. CORS 配置错误
- **现象**: 浏览器报 `Access-Control-Allow-Origin` 与 `credentials` 冲突
- **原因**: `origin: '*'` 与 `credentials: true` 不能同时使用
- **修复**: 改为动态 origin 白名单函数

### 3. `listSites` roleCode 大小写不匹配
- **现象**: super_admin 只返回 3 个站点（关联的），不是全部 6 个
- **原因**: 数据库 `roles.name` 存的是 `SUPER_ADMIN`（大写），代码里判断 `'super_admin'`（小写）
- **修复**: 判断时加 `.toLowerCase()`

### 4. 数据库 `status` 字段值错误
- **现象**: Prisma `findMany({ where: { status: 'ACTIVE' } })` 只返回 3 个，但有 6 个站点
- **原因**: 历史数据 `status` 存的是 `ACTIVF` / `INACTIVF`（typo），不是 `ACTIVE` / `INACTIVE`
- **修复**: 直接 UPDATE 数据库修正这 6 条记录

### 5. `listSites` super_admin 被 `status` 过滤
- **现象**: super_admin 也应该能看到 INACTIVE 的站点
- **原因**: 代码里 super_admin 分支也有 `where: { status: 'ACTIVE' }`
- **修复**: super_admin 分支去掉 status 过滤，返回所有站点

### 6. `/api/sites` 返回格式不统一
- **现象**: `/api/sites` 返回数组，其他列表接口返回 `{ list, total }`
- **修复**: 改 `listSites` service 支持分页，返回 `{ list, total }` 格式

### 7. Rate Limit 开发环境误封
- **现象**: 前端调试时很容易触发 429，需要等 15 分钟或重启后端
- **修复**: `NODE_ENV=development` 时 `skip` 掉 rate limit

---

## 仍需关注的问题

1. **nodes / banners / friend-links 接口返回数组，无分页包装**  
   目前设计是"小数据集不分页"，但如果数据量增长会有性能问题。建议后续统一加分页。

2. **站点配置 `/api/site-config` 返回 `null`**  
   需要确认 `X-Site-Id` header 是否正确传递，以及 `SiteConfig` 表里是否有数据。

3. **前端 `DataTable` 组件是否兼容直接返回数组的接口**  
   `nodes` / `banners` 等接口如果是直接返回数组，前端的表格组件可能需要适配。

---

## 测试结论

**核心功能（登录、站点 CRUD、用户管理、文章列表、审计日志）均已验证通过。**  
建议在浏览器端完整走一遍 UI 流程（登录 → 站点切换 → 各管理页面），确认前端交互没问题。
