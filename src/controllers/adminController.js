/**
 * 管理后台控制器
 * 处理管理员后台功能
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SiteConfig = require('../models/SiteConfig');

/**
 * 管理后台首页
 */
exports.dashboard = async (req, res) => {
  try {
    // 获取统计数据
    const userCount = await User.getCount();
    const onlineUsers = 1; // 简化实现，实际需要在线用户统计

    res.render('admin/dashboard', {
      title: '管理后台',
      stats: {
        userCount,
        onlineUsers,
        requestCount: 0, // 需要实现请求统计
        errorCount: 0 // 需要实现错误统计
      },
      layout: 'layouts/admin'
    });
  } catch (error) {
    console.error('管理后台加载错误:', error);
    req.flash('error', '加载管理后台失败');
    res.redirect('/');
  }
};

/**
 * 管理员登录页面
 */
exports.loginPage = (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin');
  }
  res.render('admin/login', {
    title: '管理员登录',
    layout: 'layouts/main'
  });
};

/**
 * 处理管理员登录
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      req.flash('error', '请填写用户名和密码');
      return res.redirect('/admin/login');
    }

    // 查找用户
    const user = await User.findByUsername(username);
    if (!user) {
      req.flash('error', '用户名或密码错误');
      return res.redirect('/admin/login');
    }

    // 检查是否为管理员
    if (user.role !== 'admin' && user.role !== 1) {
      req.flash('error', '您没有管理员权限');
      return res.redirect('/admin/login');
    }

    // 检查账号状态
    if (user.status === 'disabled' || user.status === 0) {
      req.flash('error', '账号已被禁用');
      return res.redirect('/admin/login');
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', '用户名或密码错误');
      return res.redirect('/admin/login');
    }

    // 设置session
    req.session.admin = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    req.flash('success', '登录成功');
    res.redirect('/admin');
  } catch (error) {
    console.error('管理员登录错误:', error);
    req.flash('error', '登录失败，请稍后重试');
    res.redirect('/admin/login');
  }
};

/**
 * 用户管理页面
 */
exports.users = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const keyword = req.query.keyword || '';
    const limit = 20;

    const users = await User.findAll(page, limit, keyword);
    const total = await User.getCount(keyword);

    res.render('admin/users', {
      title: '用户管理',
      users,
      keyword,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      layout: 'layouts/admin'
    });
  } catch (error) {
    console.error('用户管理加载错误:', error);
    req.flash('error', '加载用户列表失败');
    res.render('admin/users', {
      title: '用户管理',
      users: [],
      keyword: '',
      pagination: {},
      layout: 'layouts/admin'
    });
  }
};

/**
 * 切换用户状态
 */
exports.toggleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const newStatus = user.status === 1 ? 0 : 1;
    await User.update(userId, { status: newStatus });

    res.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('切换用户状态错误:', error);
    res.status(500).json({ success: false, message: '操作失败' });
  }
};

/**
 * 删除用户
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // 不能删除自己
    if (parseInt(userId) === req.session.admin.id) {
      return res.status(400).json({ success: false, message: '不能删除当前登录的管理员' });
    }

    await User.delete(userId);

    res.json({ success: true, message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
};

/**
 * 重置用户密码
 */
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const newPassword = '123456'; // 默认密码

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.update(userId, { password: hashedPassword });

    res.json({ success: true, message: `密码已重置为: ${newPassword}` });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ success: false, message: '重置密码失败' });
  }
};

/**
 * 站点配置页面
 */
exports.settingsPage = async (req, res) => {
  try {
    const settings = await SiteConfig.getAll();

    res.render('admin/settings', {
      title: '站点配置',
      settings,
      layout: 'layouts/admin'
    });
  } catch (error) {
    console.error('站点配置加载错误:', error);
    req.flash('error', '加载站点配置失败');
    res.render('admin/settings', {
      title: '站点配置',
      settings: {},
      layout: 'layouts/admin'
    });
  }
};

/**
 * 更新站点配置
 */
exports.updateSettings = async (req, res) => {
  try {
    const { siteName, siteLogo, announcement, seoTitle, seoDescription, seoKeywords } = req.body;

    await SiteConfig.update({
      siteName,
      siteLogo,
      announcement,
      seoTitle,
      seoDescription,
      seoKeywords
    });

    req.flash('success', '站点配置更新成功');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('更新站点配置错误:', error);
    req.flash('error', '更新站点配置失败');
    res.redirect('/admin/settings');
  }
};

/**
 * 系统监控页面
 */
exports.monitor = async (req, res) => {
  try {
    res.render('admin/monitor', {
      title: '系统监控',
      stats: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      layout: 'layouts/admin'
    });
  } catch (error) {
    console.error('系统监控加载错误:', error);
    req.flash('error', '加载系统监控失败');
    res.redirect('/admin');
  }
};

/**
 * 错误日志页面
 */
exports.logs = async (req, res) => {
  try {
    // 简化实现，实际需要读取日志文件
    const logs = [];

    res.render('admin/logs', {
      title: '错误日志',
      logs,
      layout: 'layouts/admin'
    });
  } catch (error) {
    console.error('错误日志加载错误:', error);
    req.flash('error', '加载错误日志失败');
    res.redirect('/admin');
  }
};