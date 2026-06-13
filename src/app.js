/**
 * 影视聚合网站 - 主入口文件
 * 技术栈：Node.js + Express + EJS + MySQL + Axios + Cheerio + Bootstrap5
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

// 初始化代理池
const { initProxyPool } = require('./config/proxy');
initProxyPool();

// 导入路由
const homeRoutes = require('./routes/home');
const movieRoutes = require('./routes/movie');
const tvRoutes = require('./routes/tv');
const zongyiRoutes = require('./routes/zongyi');
const dongmanRoutes = require('./routes/dongman');
const searchRoutes = require('./routes/search');
const detailRoutes = require('./routes/detail');
const playerRoutes = require('./routes/player');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// ========== 中间件配置 ==========

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS配置
app.use(cors());

// 请求日志
app.use(morgan('dev'));

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie解析
app.use(cookieParser());

// 方法覆盖（支持PUT/DELETE）
app.use(methodOverride('_method'));

// Session配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'video-aggregation-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24小时
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Flash消息
app.use(flash());

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// ========== 模板引擎配置 ==========

// 设置EJS为模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 使用express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ========== 全局变量中间件 ==========

app.use((req, res, next) => {
  // 用户信息
  res.locals.user = req.session.user || null;

  // Flash消息
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');

  // 网站配置
  res.locals.siteConfig = {
    name: process.env.SITE_NAME || '影视聚合',
    description: process.env.SITE_DESCRIPTION || '高清影视资源聚合平台',
    keywords: process.env.SITE_KEYWORDS || '电影,电视剧,综艺,动漫,高清,在线观看'
  };

  // 当前路径
  res.locals.currentPath = req.path;

  next();
});

// ========== 路由配置 ==========

// 首页
app.use('/', homeRoutes);

// 电影
app.use('/movie', movieRoutes);

// 电视剧
app.use('/tv', tvRoutes);

// 综艺
app.use('/zongyi', zongyiRoutes);

// 动漫
app.use('/dongman', dongmanRoutes);

// 搜索
app.use('/search', searchRoutes);

// 详情页
app.use('/detail', detailRoutes);

// 播放页
app.use('/play', playerRoutes);

// 认证（登录/注册）
app.use('/auth', authRoutes);

// 用户中心
app.use('/user', userRoutes);

// 管理后台
app.use('/admin', adminRoutes);

// 兼容旧URL格式重定向
app.get('/type/:type', (req, res) => {
  res.redirect(301, `/movie/${req.params.type}`);
});

// ========== �误处理 ==========

// 404页面
app.use((req, res) => {
  res.status(404).render('error/404', {
    title: '页面未找到',
    layout: 'layouts/main'
  });
});

// 500页面
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).render('error/500', {
    title: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err : {},
    layout: 'layouts/main'
  });
});

// ========== 启动服务器 ==========

app.listen(PORT, () => {
  console.log(`
  ========================================
  🎬 影视聚合网站已启动
  ========================================
  📍 地址: http://localhost:${PORT}
  🌍 环境: ${process.env.NODE_ENV || 'development'}
  ========================================
  `);
});

module.exports = app;