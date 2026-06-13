# Railway 部署指南

## 🚀 部署步骤

### 1. 准备工作

1. 注册 [Railway](https://railway.app) 账号
2. 安装 Railway CLI（可选）
   ```bash
   npm i -g @railway/cli
   ```

### 2. 创建项目

**方式一：通过 GitHub（推荐）**

1. 将代码推送到 GitHub 仓库
2. 登录 Railway Dashboard
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的仓库
5. Railway 会自动检测 Node.js 项目并开始部署

**方式二：通过 CLI**

```bash
# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

### 3. 添加 MySQL 数据库

1. 在 Railway Dashboard 中点击 "New" → "Database" → "MySQL"
2. 数据库会自动创建并连接到你的项目
3. 环境变量会自动设置（`MYSQL_URL` 或单独的 `MYSQL_HOST`, `MYSQL_USER` 等）

### 4. 配置环境变量

在 Railway Dashboard 的 "Variables" 页面添加以下环境变量：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# Session密钥（必须修改）
SESSION_SECRET=your-random-secret-key-here

# 网站配置
SITE_NAME=鲁王影视
SITE_DESCRIPTION=高清影视资源聚合平台
```

**注意**：如果使用 Railway 提供的 MySQL，数据库相关环境变量会自动设置。

### 5. 初始化数据库

部署完成后，需要初始化数据库表：

1. 在 Railway Dashboard 中打开项目的 "Settings"
2. 找到 "Deploy" 部分，添加一个 Deploy Command：
   ```
   npm run init-db && node src/app.js
   ```
3. 或者通过 Railway CLI 运行：
   ```bash
   railway run npm run init-db
   ```

### 6. 访问应用

部署完成后，Railway 会提供一个公网 URL，格式类似：
```
https://your-project-name.up.railway.app
```

---

## 📋 环境变量说明

| 变量名 | 说明 | 是否必须 |
|--------|------|----------|
| PORT | 服务端口 | 否（Railway自动设置） |
| NODE_ENV | 运行环境 | 是 |
| SESSION_SECRET | Session密钥 | 是 |
| MYSQL_URL | MySQL连接URL | 是（Railway自动设置） |
| MYSQL_HOST | MySQL主机 | 是（Railway自动设置） |
| MYSQL_USER | MySQL用户名 | 是（Railway自动设置） |
| MYSQL_PASSWORD | MySQL密码 | 是（Railway自动设置） |
| MYSQL_DATABASE | MySQL数据库名 | 是（Railway自动设置） |
| SITE_NAME | 网站名称 | 否 |
| SITE_DESCRIPTION | 网站描述 | 否 |

---

## ⚠️ 注意事项

1. **数据库初始化**：首次部署需要运行 `npm run init-db` 初始化数据库表
2. **Session密钥**：必须设置一个随机的 `SESSION_SECRET`
3. **域名绑定**：可以在 Railway Dashboard 中绑定自定义域名
4. **日志查看**：在 Railway Dashboard 的 "Deployments" 页面查看日志

---

## 🔧 常见问题

### Q: 部署后无法访问？
A: 检查 Railway 日志，确保所有环境变量已正确设置。

### Q: 数据库连接失败？
A: 确保 MySQL 服务已添加并正确连接。Railway 会自动设置数据库环境变量。

### Q: 如何查看日志？
A: 在 Railway Dashboard 的 "Deployments" 页面，点击最新的部署查看日志。

### Q: 如何更新部署？
A: 推送代码到 GitHub，Railway 会自动重新部署。

---

## 📞 技术支持

- [Railway 官方文档](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)