/**
 * 数据库配置文件
 * 支持本地和Railway部署
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
let pool;

function createPool() {
  // Railway MYSQL_URL
  if (process.env.MYSQL_URL) {
    console.log('[DB] 使用 MYSQL_URL 连接');
    return mysql.createPool(process.env.MYSQL_URL);
  }

  // Railway 环境变量格式
  if (process.env.MYSQLHOST) {
    console.log('[DB] 使用 Railway MySQL 环境变量连接');
    return mysql.createPool({
      host: process.env.MYSQLHOST,
      port: parseInt(process.env.MYSQLPORT) || 3306,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  // 本地配置
  console.log('[DB] 使用本地数据库配置');
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'video_aggregation',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });
}

pool = createPool();

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 导出连接池和测试函数
module.exports = pool;
module.exports.testConnection = testConnection;