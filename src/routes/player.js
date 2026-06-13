/**
 * 播放页路由
 * 处理影片播放
 */

const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// 播放页
router.get('/:type/:id', playerController.index);
router.get('/:type/:id/:episode', playerController.play);

module.exports = router;