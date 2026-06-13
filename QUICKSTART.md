# 影视聚合网站 - 快速启动指南

## 🚀 5分钟快速启动

### 步骤1：配置环境变量

```bash
# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接
# 修改以下配置：
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=video_aggregation
```

### 步骤2：初始化数据库

```bash
# 运行数据库初始化脚本
npm run init-db
```

这将自动：
- 创建数据库
- 创建所有数据表
- 插入默认配置
- 创建管理员账号（admin / admin123）

### 步骤3：启动项目

```bash
# 开发模式启动
npm run dev
```

### 步骤4：访问项目

- **前台首页**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin

**默认管理员账号**:
- 用户名: `admin`
- 密码: `admin123`

---

## 📦 生产环境部署

### 使用PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动项目
npm run pm2:start

# 查看状态
pm2 status

# 查看日志
npm run pm2:logs

# 重启项目
npm run pm2:restart

# 停止项目
npm run pm2:stop
```

### 设置开机自启

```bash
pm2 startup
pm2 save
```

---

## 🔧 常见问题

### Q: 数据库连接失败？

A: 检查 `.env` 文件中的数据库配置，确保MySQL服务已启动。

### Q: 爬虫获取数据失败？

A: 检查网络连接，确保可以访问 https://fdzys.net

### Q: 如何修改端口？

A: 在 `.env` 文件中修改 `PORT=3000` 为你想要的端口。

### Q: 如何添加新的爬虫源？

A: 在 `src/crawlers/` 目录创建新的爬虫文件，参考 `baseCrawler.js` 的实现。

---

## 📁 项目结构

```
├── src/
│   ├── app.js              # 主入口文件
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── crawlers/           # 爬虫模块
│   ├── middleware/          # 中间件
│   ├── models/             # 数据模型
│   ├── public/             # 静态资源
│   ├── routes/             # 路由
│   └── views/              # EJS模板
├── .env.example            # 环境变量示例
├── .env                    # 环境变量配置
├── database.sql            # 数据库SQL
├── init-db.js              # 数据库初始化脚本
├── ecosystem.config.js     # PM2配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

---

## 🎯 功能说明

### 用户功能
- 浏览首页、电影、电视剧、综艺、动漫
- 搜索影片
- 查看影片详情
- 在线播放
- 注册/登录
- 收藏影片
- 查看播放历史

### 管理功能
- 用户管理（启用/禁用/删除）
- 站点配置（名称、Logo、公告、SEO）
- 系统监控
- 错误日志

---

## ⚠️ 注意事项

1. 本项目不存储任何影视资源数据，所有数据实时从目标站点爬取
2. 仅供学习交流使用，请勿用于商业用途
3. 爬虫请合理使用，避免对目标站点造成过大压力

---

## 📞 技术支持

如有问题，请查看：
- [完整文档](README.md)
- [页面架构文档](docs/FINAL-ARCHITECTURE.md)