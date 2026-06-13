/**
 * 电视剧路由
 * 处理电视剧列表和分类
 */

const express = require('express');
const router = express.Router();
const tvController = require('../controllers/tvController');

// 电视剧首页（全部电视剧）
router.get('/', tvController.index);

// 电视剧分类
router.get('/:type', tvController.category);

module.exports = router;