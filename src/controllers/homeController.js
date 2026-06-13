/**
 * 首页控制器
 * 处理首页数据获取和展示
 */

const HomeCrawler = require('../crawlers/homeCrawler');

// 内存缓存（可一键关闭）
let cache = {
  data: null,
  timestamp: 0,
  enabled: true // 缓存开关
};

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 首页
 */
exports.index = async (req, res) => {
  try {
    let homeData = null;

    // 检查缓存
    if (cache.enabled && cache.data && (Date.now() - cache.timestamp < CACHE_DURATION)) {
      homeData = cache.data;
      console.log('使用缓存数据');
    } else {
      // 从远程获取数据
      console.log('从远程获取首页数据...');
      homeData = await HomeCrawler.getHomeData();

      // 更新缓存
      if (cache.enabled && homeData) {
        cache.data = homeData;
        cache.timestamp = Date.now();
      }
    }

    res.render('home/index', {
      title: '首页',
      hotMovies: homeData?.hotMovies || [],
      latestMovies: homeData?.latestMovies || [],
      hotTvShows: homeData?.hotTvShows || [],
      latestTvShows: homeData?.latestTvShows || [],
      hotVariety: homeData?.hotVariety || [],
      hotAnime: homeData?.hotAnime || [],
      banner: homeData?.banner || [],
      meta: {
        description: res.locals.siteConfig.description,
        keywords: res.locals.siteConfig.keywords
      }
    });
  } catch (error) {
    console.error('首页加载错误:', error);
    req.flash('error', '加载首页数据失败，请稍后重试');
    res.render('home/index', {
      title: '首页',
      hotMovies: [],
      latestMovies: [],
      hotTvShows: [],
      latestTvShows: [],
      hotVariety: [],
      hotAnime: [],
      banner: [],
      meta: {
        description: res.locals.siteConfig.description,
        keywords: res.locals.siteConfig.keywords
      }
    });
  }
};

/**
 * 清除缓存（管理后台可用）
 */
exports.clearCache = (req, res) => {
  cache.data = null;
  cache.timestamp = 0;
  res.json({ success: true, message: '缓存已清除' });
};

/**
 * 切换缓存状态
 */
exports.toggleCache = (req, res) => {
  cache.enabled = !cache.enabled;
  if (!cache.enabled) {
    cache.data = null;
    cache.timestamp = 0;
  }
  res.json({ success: true, enabled: cache.enabled });
};