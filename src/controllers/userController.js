/**
 * 用户中心控制器
 * 处理用户个人中心功能
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const History = require('../models/History');

/**
 * 用户中心首页
 */
exports.index = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // 获取收藏数量
    const favoriteCount = await Favorite.getCountByUserId(userId);

    // 获取历史记录数量
    const historyCount = await History.getCountByUserId(userId);

    res.render('user/index', {
      title: '用户中心',
      favoriteCount,
      historyCount
    });
  } catch (error) {
    console.error('用户中心加载错误:', error);
    req.flash('error', '加载用户中心失败');
    res.redirect('/');
  }
};

/**
 * 个人资料页面
 */
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);

    res.render('user/profile', {
      title: '个人资料',
      user
    });
  } catch (error) {
    console.error('个人资料加载错误:', error);
    req.flash('error', '加载个人资料失败');
    res.redirect('/user');
  }
};

/**
 * 更新个人资料
 */
exports.updateProfile = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.session.user.id;

    const user = await User.findById(userId);

    // 更新邮箱
    if (email && email !== user.email) {
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        req.flash('error', '邮箱已被使用');
        return res.redirect('/user/profile');
      }
      await User.update(userId, { email });
      req.session.user.email = email;
    }

    // 更新密码
    if (newPassword) {
      if (!currentPassword) {
        req.flash('error', '请输入当前密码');
        return res.redirect('/user/profile');
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        req.flash('error', '当前密码错误');
        return res.redirect('/user/profile');
      }

      if (newPassword !== confirmNewPassword) {
        req.flash('error', '两次输入的新密码不一致');
        return res.redirect('/user/profile');
      }

      if (newPassword.length < 6) {
        req.flash('error', '新密码长度不能少于6位');
        return res.redirect('/user/profile');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await User.update(userId, { password: hashedPassword });
    }

    req.flash('success', '个人资料更新成功');
    res.redirect('/user/profile');
  } catch (error) {
    console.error('更新个人资料错误:', error);
    req.flash('error', '更新个人资料失败');
    res.redirect('/user/profile');
  }
};

/**
 * 我的收藏
 */
exports.favorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const userId = req.session.user.id;

    const favorites = await Favorite.getByUserId(userId, page, limit);
    const total = await Favorite.getCountByUserId(userId);

    res.render('user/favorites', {
      title: '我的收藏',
      favorites,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('收藏列表加载错误:', error);
    req.flash('error', '加载收藏列表失败');
    res.render('user/favorites', {
      title: '我的收藏',
      favorites: [],
      pagination: {}
    });
  }
};

/**
 * 播放历史
 */
exports.history = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const userId = req.session.user.id;

    const history = await History.getByUserId(userId, page, limit);
    const total = await History.getCountByUserId(userId);

    res.render('user/history', {
      title: '播放历史',
      history,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('播放历史加载错误:', error);
    req.flash('error', '加载播放历史失败');
    res.render('user/history', {
      title: '播放历史',
      history: [],
      pagination: {}
    });
  }
};