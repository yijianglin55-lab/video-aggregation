/**
 * 用户中心路由
 * 处理用户个人中心功能
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

// 用户中心首页
router.get('/', isAuthenticated, userController.index);

// 个人资料
router.get('/profile', isAuthenticated, userController.profile);
router.post('/profile', isAuthenticated, userController.updateProfile);

// 我的收藏
router.get('/favorites', isAuthenticated, userController.favorites);

// 播放历史
router.get('/history', isAuthenticated, userController.history);

module.exports = router;