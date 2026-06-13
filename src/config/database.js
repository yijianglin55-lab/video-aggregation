/**
 * 数据库配置文件
 * 支持本地和Railway部署
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
let pool;

if (process.env.MYSQL_URL) {
  // Railway 提供的 MYSQL_URL
  pool = mysql.createPool(process.env.MYSQL_URL);
} else {
  // 本地配置
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT) || 3306,
    user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'video_aggregation',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });
}

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