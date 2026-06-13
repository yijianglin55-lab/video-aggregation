/**
 * 详情页路由
 * 处理影片详情展示
 */

const express = require('express');
const router = express.Router();
const detailController = require('../controllers/detailController');

// 影片详情页
router.get('/:type/:id', detailController.index);

module.exports = router;