/**
 * 播放历史模型
 * 处理用户播放历史相关的数据库操作
 * 注意：只存储用户ID和影片标识，不存储影片详情
 */

const db = require('../config/database');

class History {
  /**
   * 添加播放记录
   * @param {number} userId - 用户ID
   * @param {string} videoType - 影片类型
   * @param {string} videoId - 影片标识
   * @param {string} videoName - 影片名称
   * @param {string} episode - 播放到的集数
   * @param {number} progress - 播放进度（秒）
   */
  static async add(userId, videoType, videoId, videoName, episode = '', progress = 0) {
    try {
      // 检查是否已有记录
      const [existing] = await db.query(
        'SELECT id FROM history WHERE user_id = ? AND video_type = ? AND video_id = ?',
        [userId, videoType, videoId]
      );

      if (existing.length > 0) {
        // 更新现有记录
        await db.query(
          'UPDATE history SET episode = ?, progress = ?, updated_at = NOW() WHERE id = ?',
          [episode, progress, existing[0].id]
        );
        return { success: true, id: existing[0].id };
      }

      // 创建新记录
      const [result] = await db.query(
        'INSERT INTO history (user_id, video_type, video_id, video_name, episode, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [userId, videoType, videoId, videoName, episode, progress]
      );

      return { success: true, id: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除播放记录
   */
  static async remove(userId, videoType, videoId) {
    try {
      const [result] = await db.query(
        'DELETE FROM history WHERE user_id = ? AND video_type = ? AND video_id = ?',
        [userId, videoType, videoId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 清空用户播放历史
   */
  static async clearByUserId(userId) {
    try {
      const [result] = await db.query(
        'DELETE FROM history WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取用户播放历史
   */
  static async getByUserId(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const [rows] = await db.query(
        'SELECT * FROM history WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取用户播放历史数量
   */
  static async getCountByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT COUNT(*) as total FROM history WHERE user_id = ?',
        [userId]
      );
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = History;