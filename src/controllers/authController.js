/**
 * 认证控制器
 * 处理登录、注册、退出
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * 登录页面
 */
exports.loginPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/login', {
    title: '登录'
  });
};

/**
 * 处理登录
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      req.flash('error', '请填写用户名和密码');
      return res.redirect('/auth/login');
    }

    // 查找用户
    const user = await User.findByUsername(username);
    if (!user) {
      req.flash('error', '用户名或密码错误');
      return res.redirect('/auth/login');
    }

    // 检查账号状态
    if (user.status === 'disabled' || user.status === 0) {
      req.flash('error', '账号已被禁用，请联系管理员');
      return res.redirect('/auth/login');
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', '用户名或密码错误');
      return res.redirect('/auth/login');
    }

    // 设置session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    req.flash('success', '登录成功');
    res.redirect('/');
  } catch (error) {
    console.error('登录错误:', error);
    req.flash('error', '登录失败，请稍后重试');
    res.redirect('/auth/login');
  }
};

/**
 * 注册页面
 */
exports.registerPage = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/register', {
    title: '注册'
  });
};

/**
 * 处理注册
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 验证输入
    if (!username || !email || !password || !confirmPassword) {
      req.flash('error', '请填写所有必填字段');
      return res.redirect('/auth/register');
    }

    if (password !== confirmPassword) {
      req.flash('error', '两次输入的密码不一致');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error', '密码长度不能少于6位');
      return res.redirect('/auth/register');
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      req.flash('error', '用户名已被注册');
      return res.redirect('/auth/register');
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      req.flash('error', '邮箱已被注册');
      return res.redirect('/auth/register');
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: 0, // 普通用户
      status: 1,
      created_at: new Date()
    });

    req.flash('success', '注册成功，请登录');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('注册错误:', error);
    req.flash('error', '注册失败，请稍后重试');
    res.redirect('/auth/register');
  }
};

/**
 * 退出登录
 */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('退出登录错误:', err);
    }
    res.redirect('/');
  });
};