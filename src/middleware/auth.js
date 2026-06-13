/**
 * 认证中间件
 * 处理用户登录状态验证和权限检查
 */

/**
 * 验证用户是否已登录
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error', '请先登录');
  res.redirect('/auth/login');
};

/**
 * 验证用户是否为管理员
 */
exports.isAdmin = (req, res, next) => {
  if (req.session.admin && (req.session.admin.role === 'admin' || req.session.admin.role === 1)) {
    return next();
  }
  req.flash('error', '请先登录管理员账号');
  res.redirect('/admin/login');
};

/**
 * 验证用户是否为游客（未登录）
 */
exports.isGuest = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  res.redirect('/');
};

/**
 * 将用户信息传递给视图
 */
exports.setUserLocals = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.admin ? true : false;
  next();
};