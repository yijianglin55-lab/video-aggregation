/**
 * 搜索路由
 * 处理影片搜索功能
 */

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// 搜索结果页
router.get('/', searchController.index);

module.exports = router;