/**
 * 电影路由
 * 处理电影列表和分类
 */

const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// 电影首页（全部电影）
router.get('/', movieController.index);

// 电影分类
router.get('/:type', movieController.category);

module.exports = router;