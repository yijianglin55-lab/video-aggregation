/**
 * 管理后台路由
 * 处理管理员后台功能
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

// 管理后台首页
router.get('/', isAdmin, adminController.dashboard);

// 管理员登录页面
router.get('/login', adminController.loginPage);

// 处理管理员登录
router.post('/login', adminController.login);

// 用户管理
router.get('/users', isAdmin, adminController.users);
router.post('/users/:id/toggle', isAdmin, adminController.toggleUser);
router.delete('/users/:id', isAdmin, adminController.deleteUser);
router.post('/users/:id/reset-password', isAdmin, adminController.resetPassword);

// 站点配置
router.get('/settings', isAdmin, adminController.settingsPage);
router.post('/settings', isAdmin, adminController.updateSettings);

// 系统监控
router.get('/monitor', isAdmin, adminController.monitor);

// 错误日志
router.get('/logs', isAdmin, adminController.logs);

module.exports = router;