/**
 * 认证路由
 * 处理登录、注册、退出
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 登录页面
router.get('/login', authController.loginPage);

// 处理登录
router.post('/login', authController.login);

// 注册页面
router.get('/register', authController.registerPage);

// 处理注册
router.post('/register', authController.register);

// 退出登录
router.get('/logout', authController.logout);

module.exports = router;