-- =============================================
-- 影视聚合网站 - 数据库建表SQL
-- 注意：只存储用户相关数据，不存储影视资源数据
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS video_aggregation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE video_aggregation;

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  role TINYINT DEFAULT 0 COMMENT '角色：0-普通用户，1-管理员',
  status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 收藏表
-- 注意：只存储用户ID和影片标识，不存储影片详情
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  video_type VARCHAR(20) NOT NULL COMMENT '影片类型：movie/tv/dongman/zongyi',
  video_id VARCHAR(100) NOT NULL COMMENT '影片标识（URL中的ID）',
  video_name VARCHAR(200) DEFAULT '' COMMENT '影片名称（用于显示）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  UNIQUE KEY uk_user_video (user_id, video_type, video_id),
  INDEX idx_user_id (user_id),
  INDEX idx_video_type (video_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- =============================================
-- 3. 播放历史表
-- 注意：只存储用户ID和影片标识，不存储影片详情
-- =============================================
CREATE TABLE IF NOT EXISTS history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  video_type VARCHAR(20) NOT NULL COMMENT '影片类型：movie/tv/dongman/zongyi',
  video_id VARCHAR(100) NOT NULL COMMENT '影片标识（URL中的ID）',
  video_name VARCHAR(200) DEFAULT '' COMMENT '影片名称（用于显示）',
  episode VARCHAR(50) DEFAULT '' COMMENT '播放到的集数',
  progress INT DEFAULT 0 COMMENT '播放进度（秒）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次播放时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后播放时间',
  UNIQUE KEY uk_user_video (user_id, video_type, video_id),
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='播放历史表';

-- =============================================
-- 4. 站点配置表
-- =============================================
CREATE TABLE IF NOT EXISTS site_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(50) NOT NULL UNIQUE COMMENT '配置键',
  config_value TEXT COMMENT '配置值',
  description VARCHAR(200) DEFAULT '' COMMENT '配置说明',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站点配置表';

-- =============================================
-- 插入默认配置
-- =============================================
INSERT INTO site_config (config_key, config_value, description) VALUES
('site_name', '影视聚合', '网站名称'),
('site_logo', '/img/logo.png', '网站Logo'),
('announcement', '欢迎访问影视聚合网站！', '首页公告'),
('seo_title', '影视聚合 - 高清影视资源在线观看', 'SEO标题'),
('seo_description', '高清影视资源聚合平台，免费在线观看最新电影、电视剧、综艺、动漫', 'SEO描述'),
('seo_keywords', '电影,电视剧,综艺,动漫,高清,在线观看', 'SEO关键词');

-- =============================================
-- 插入默认管理员账号
-- 密码：admin123（bcrypt加密）
-- =============================================
INSERT INTO users (username, email, password, role, status) VALUES
('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYV0Nh8JGc5J7P3L7Jz7J7J7J7J7J', 1, 1);

-- 注意：上面的密码hash是示例，实际部署时需要使用正确的bcrypt加密值
-- 可以使用以下Node.js代码生成：
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('admin123', 10).then(hash => console.log(hash));