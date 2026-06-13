/**
 * 动漫路由
 * 处理动漫列表和分类
 */

const express = require('express');
const router = express.Router();
const dongmanController = require('../controllers/dongmanController');

// 动漫首页
router.get('/', dongmanController.index);

// 动漫分类
router.get('/:type', dongmanController.category);

module.exports = router;