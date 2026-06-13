# 影视聚合网站

基于 Node.js + Express + EJS + MySQL + Axios + Cheerio + Bootstrap5 开发的影视聚合网站。

## 功能特性

- 🎬 影视资源实时爬取，不存储任何影视数据
- 🔍 搜索功能
- 📱 响应式设计，支持PC/平板/手机
- 👤 用户系统（注册/登录/收藏/历史）
- 🛡️ 管理后台（用户管理/站点配置/系统监控）
- 🎨 Bootstrap5 UI框架

## 技术栈

- **后端**: Node.js + Express
- **模板**: EJS
- **数据库**: MySQL
- **爬虫**: Axios + Cheerio
- **前端**: Bootstrap5 + Bootstrap Icons

## 目录结构

```
src/
├── controllers      # 控制器层
├── services         # 业务服务层
├── crawlers         # 独立爬虫采集模块
├── routes           # 路由分层
├── middleware       # 权限、登录校验中间件
├── models           # MySQL模型定义
├── views            # 全套EJS页面模板
├── public           # 静态css/js/img资源
├── config           # 环境配置
└── app.js           # 项目入口
```

## 快速开始

### 1. 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

1. 创建MySQL数据库：

```bash
mysql -u root -p < database.sql
```

2. 复制环境变量配置文件：

```bash
cp .env.example .env
```

3. 修改 `.env` 文件中的数据库配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=video_aggregation
```

### 4. 启动项目

**开发模式：**

```bash
npm run dev
```

**生产模式：**

```bash
npm start
```

### 5. 访问项目

- 前台首页: http://localhost:3000
- 管理后台: http://localhost:3000/admin

**默认管理员账号：**
- 用户名: admin
- 密码: admin123

## 生产环境部署

### 使用PM2部署

1. 安装PM2：

```bash
npm install -g pm2
```

2. 创建PM2配置文件 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'video-aggregation',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

3. 启动项目：

```bash
pm2 start ecosystem.config.js --env production
```

4. 常用PM2命令：

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启项目
pm2 restart video-aggregation

# 停止项目
pm2 stop video-aggregation

# 开机自启
pm2 startup
pm2 save
```

### 使用Nginx反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_USER | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | - |
| DB_NAME | 数据库名称 | video_aggregation |
| SESSION_SECRET | Session密钥 | - |
| SESSION_MAX_AGE | Session过期时间 | 86400000 |
| CRAWLER_TIMEOUT | 爬虫超时时间 | 15000 |
| CRAWLER_RETRY_COUNT | 爬虫重试次数 | 3 |
| PROXY_ENABLED | 是否启用代理 | false |
| PROXY_HOST | 代理主机 | - |
| PROXY_PORT | 代理端口 | - |

## 数据库表结构

本项目只存储用户相关数据，不存储任何影视资源数据。

- **users**: 用户表
- **favorites**: 收藏表
- **history**: 播放历史表
- **site_config**: 站点配置表

## 爬虫说明

爬虫模块从目标站点实时获取数据，遵循以下规则：

1. 不持久化任何影视资源数据
2. 仅开启短时内存缓存（可一键关闭）
3. 每次用户访问都实时远程请求
4. 播放器直接挂载远程原始播放源

## 常见问题

### 1. 数据库连接失败

检查 `.env` 文件中的数据库配置是否正确，确保MySQL服务已启动。

### 2. 爬虫获取数据失败

- 检查网络连接
- 检查目标站点是否可访问
- 尝试配置代理

### 3. 页面样式异常

清除浏览器缓存，或检查CDN资源是否可访问。

## 开发说明

### 添加新的爬虫

1. 在 `src/crawlers/` 目录创建新的爬虫文件
2. 继承 `baseCrawler` 的基础功能
3. 实现数据解析逻辑
4. 在控制器中调用爬虫

### 添加新的页面

1. 在 `src/views/` 目录创建EJS模板
2. 在 `src/routes/` 目录添加路由
3. 在 `src/controllers/` 目录添加控制器

## 许可证

MIT License

## 免责声明

本项目仅供学习交流使用，请勿用于商业用途。所有影视资源均来自互联网，版权归原作者所有。