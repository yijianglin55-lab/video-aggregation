/**
 * 数据库初始化脚本
 * 支持本地和Railway部署
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  console.log('========================================');
  console.log('数据库初始化');
  console.log('========================================\n');

  // 解析数据库连接信息
  let dbConfig;

  if (process.env.MYSQL_URL) {
    // Railway 提供的 MYSQL_URL
    dbConfig = process.env.MYSQL_URL;
    console.log('使用 Railway MySQL URL 连接');
  } else {
    // 本地配置
    dbConfig = {
      host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT) || 3306,
      user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'video_aggregation'
    };
    console.log('使用本地数据库配置');
  }

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 如果使用MYSQL_URL，需要先创建数据库
    if (process.env.MYSQL_URL) {
      const dbName = process.env.MYSQL_DATABASE || 'video_aggregation';
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await connection.query(`USE ${dbName}`);
      console.log(`✅ 数据库 ${dbName} 已就绪\n`);
    }

    // 创建用户表
    console.log('[1/4] 创建数据表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) DEFAULT '/images/default-avatar.png',
        role ENUM('user', 'admin') DEFAULT 'user',
        status ENUM('active', 'disabled') DEFAULT 'active',
        nickname VARCHAR(50) DEFAULT NULL,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ users 表创建成功');

    // 创建收藏表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        video_type VARCHAR(20) NOT NULL,
        video_id VARCHAR(100) NOT NULL,
        video_name VARCHAR(200) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_video (user_id, video_type, video_id),
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ favorites 表创建成功');

    // 创建播放历史表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        video_type VARCHAR(20) NOT NULL,
        video_id VARCHAR(100) NOT NULL,
        video_name VARCHAR(200) DEFAULT '',
        episode VARCHAR(50) DEFAULT '',
        progress INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_video (user_id, video_type, video_id),
        INDEX idx_user_id (user_id),
        INDEX idx_updated_at (updated_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ history 表创建成功');

    // 创建站点配置表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_config (
        id INT PRIMARY KEY AUTO_INCREMENT,
        config_key VARCHAR(50) NOT NULL UNIQUE,
        config_value TEXT,
        description VARCHAR(200) DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_config_key (config_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ site_config 表创建成功\n');

    // 插入默认配置
    console.log('[2/4] 插入默认配置...');
    const defaultConfigs = [
      ['site_name', '鲁王影视', '网站名称'],
      ['site_logo', '/images/logo.png', '网站Logo'],
      ['announcement', '欢迎访问鲁王影视！', '首页公告'],
      ['seo_title', '鲁王影视 - 高清影视资源在线观看', 'SEO标题'],
      ['seo_description', '高清影视资源聚合平台，免费在线观看最新电影、电视剧、综艺、动漫', 'SEO描述'],
      ['seo_keywords', '电影,电视剧,综艺,动漫,高清,在线观看', 'SEO关键词']
    ];

    for (const [key, value, desc] of defaultConfigs) {
      await connection.query(
        'INSERT INTO site_config (config_key, config_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = ?',
        [key, value, desc, value]
      );
    }
    console.log('  ✅ 默认配置插入成功\n');

    // 创建管理员账号
    console.log('[3/4] 创建管理员账号...');
    const adminPassword = await bcrypt.hash('admin123', 10);

    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );

    if (existingAdmin.length === 0) {
      await connection.query(
        'INSERT INTO users (username, email, password, role, status, nickname) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin@example.com', adminPassword, 'admin', 'active', '管理员']
      );
      console.log('  ✅ 管理员账号创建成功');
      console.log('     用户名: admin');
      console.log('     密码: admin123\n');
    } else {
      // 更新管理员密码
      await connection.query(
        'UPDATE users SET password = ? WHERE username = ?',
        [adminPassword, 'admin']
      );
      console.log('  ✅ 管理员密码已更新\n');
    }

    // 完成
    console.log('[4/4] 初始化完成！\n');
    console.log('========================================');
    console.log('数据库初始化成功！');
    console.log('========================================');
    console.log('\n管理员账号:');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('\n请登录后立即修改密码！');

  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行初始化
initDatabase();