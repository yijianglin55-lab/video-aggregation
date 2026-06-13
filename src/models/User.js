/**
 * 用户模型
 * 处理用户相关的数据库操作
 */

const db = require('../config/database');

class User {
  /**
   * 根据ID查找用户
   */
  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 根据用户名查找用户
   */
  static async findByUsername(username) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 根据邮箱查找用户
   */
  static async findByEmail(email) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 创建用户
   */
  static async create(userData) {
    try {
      const { username, email, password, role, status } = userData;
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [username, email, password, role || 0, status || 1]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新用户信息
   */
  static async update(id, userData) {
    try {
      const fields = [];
      const values = [];

      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(userData[key]);
        }
      });

      if (fields.length === 0) return false;

      values.push(id);
      const [result] = await db.query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除用户
   */
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取用户列表
   */
  static async findAll(page = 1, limit = 20, keyword = '') {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT id, username, email, role, status, created_at FROM users';
      let countQuery = 'SELECT COUNT(*) as total FROM users';
      const params = [];

      if (keyword) {
        query += ' WHERE username LIKE ? OR email LIKE ?';
        countQuery += ' WHERE username LIKE ? OR email LIKE ?';
        const likeKeyword = `%${keyword}%`;
        params.push(likeKeyword, likeKeyword);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取用户总数
   */
  static async getCount(keyword = '') {
    try {
      let query = 'SELECT COUNT(*) as total FROM users';
      const params = [];

      if (keyword) {
        query += ' WHERE username LIKE ? OR email LIKE ?';
        const likeKeyword = `%${keyword}%`;
        params.push(likeKeyword, likeKeyword);
      }

      const [rows] = await db.query(query, params);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;