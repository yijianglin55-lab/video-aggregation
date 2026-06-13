/**
 * 收藏模型
 * 处理用户收藏相关的数据库操作
 * 注意：只存储用户ID和影片标识，不存储影片详情
 */

const db = require('../config/database');

class Favorite {
  /**
   * 添加收藏
   * @param {number} userId - 用户ID
   * @param {string} videoType - 影片类型 (movie/tv/dongman/zongyi)
   * @param {string} videoId - 影片标识（URL中的ID）
   * @param {string} videoName - 影片名称（用于显示）
   */
  static async add(userId, videoType, videoId, videoName) {
    try {
      const [existing] = await db.query(
        'SELECT id FROM favorites WHERE user_id = ? AND video_type = ? AND video_id = ?',
        [userId, videoType, videoId]
      );

      if (existing.length > 0) {
        return { success: false, message: '已收藏该影片' };
      }

      const [result] = await db.query(
        'INSERT INTO favorites (user_id, video_type, video_id, video_name, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, videoType, videoId, videoName]
      );

      return { success: true, id: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 取消收藏
   */
  static async remove(userId, videoType, videoId) {
    try {
      const [result] = await db.query(
        'DELETE FROM favorites WHERE user_id = ? AND video_type = ? AND video_id = ?',
        [userId, videoType, videoId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 检查是否已收藏
   */
  static async isFavorite(userId, videoType, videoId) {
    try {
      const [rows] = await db.query(
        'SELECT id FROM favorites WHERE user_id = ? AND video_type = ? AND video_id = ?',
        [userId, videoType, videoId]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取用户收藏列表
   */
  static async getByUserId(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const [rows] = await db.query(
        'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取用户收藏数量
   */
  static async getCountByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT COUNT(*) as total FROM favorites WHERE user_id = ?',
        [userId]
      );
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Favorite;