/**
 * 首页路由
 * 处理网站首页的展示
 */

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// 首页
router.get('/', homeController.index);

module.exports = router;