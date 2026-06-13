/**
 * 综艺路由
 * 处理综艺列表和分类
 */

const express = require('express');
const router = express.Router();
const zongyiController = require('../controllers/zongyiController');

// 综艺首页
router.get('/', zongyiController.index);

// 综艺分类
router.get('/:type', zongyiController.category);

module.exports = router;