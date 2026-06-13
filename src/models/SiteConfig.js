/**
 * 站点配置模型
 * 处理站点配置相关的数据库操作
 */

const db = require('../config/database');

class SiteConfig {
  /**
   * 获取所有配置
   */
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM site_config');
      const config = {};
      rows.forEach(row => {
        config[row.config_key] = row.config_value;
      });
      return config;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取单个配置
   */
  static async get(key) {
    try {
      const [rows] = await db.query(
        'SELECT config_value FROM site_config WHERE config_key = ?',
        [key]
      );
      return rows[0]?.config_value || '';
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新配置
   */
  static async update(configData) {
    try {
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        for (const [key, value] of Object.entries(configData)) {
          await connection.query(
            'INSERT INTO site_config (config_key, config_value, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE config_value = ?, updated_at = NOW()',
            [key, value, value]
          );
        }

        await connection.commit();
        return true;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SiteConfig;