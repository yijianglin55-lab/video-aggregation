/**
 * 动漫控制器
 * 处理动漫列表和分类数据
 */

const DongmanCrawler = require('../crawlers/dongmanCrawler');

// 内存缓存
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * 动漫首页
 */
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'hot';

    const cacheKey = `dongman-index-${page}-${sort}`;
    let data = null;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        data = cached.data;
      }
    }

    if (!data) {
      data = await DongmanCrawler.getDongmanList({ page, sort });

      // 本地排序
      if (data && data.list && data.list.length > 0) {
        if (sort === 'hot') {
          data.list.sort((a, b) => b.hits - a.hits);
        } else if (sort === 'score') {
          data.list.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        }
      }

      cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    res.render('dongman/index', {
      title: '动漫',
      items: data?.list || [],
      pagination: data?.pagination || {},
      currentSort: sort,
      currentType: '',
      types: [
        { name: '全部', value: '' },
        { name: '国产动漫', value: 'guochan' },
        { name: '日本动漫', value: 'riben' },
        { name: '欧美动漫', value: 'oumei' }
      ],
      sorts: [
        { name: '最热', value: 'hot' },
        { name: '最新', value: 'time' },
        { name: '评分', value: 'score' }
      ],
      meta: {
        description: '最新热门动漫免费观看，国产、日本、欧美动漫一网打尽',
        keywords: '动漫在线观看,动漫免费,动漫大全,国产动漫,日本动漫,欧美动漫'
      }
    });
  } catch (error) {
    console.error('动漫列表加载错误:', error);
    req.flash('error', '加载动漫数据失败');
    res.render('dongman/index', {
      title: '动漫',
      items: [],
      pagination: {},
      currentSort: 'hot',
      currentType: '',
      types: [],
      sorts: [],
      meta: {}
    });
  }
};

/**
 * 动漫分类
 */
exports.category = async (req, res) => {
  try {
    const type = req.params.type;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'hot';

    const cacheKey = `dongman-${type}-${page}-${sort}`;
    let data = null;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        data = cached.data;
      }
    }

    if (!data) {
      data = await DongmanCrawler.getDongmanList({ type, page, sort });

      // 本地排序
      if (data && data.list && data.list.length > 0) {
        if (sort === 'hot') {
          data.list.sort((a, b) => b.hits - a.hits);
        } else if (sort === 'score') {
          data.list.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        }
      }

      cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    const typeNames = {
      'guochan': '国产动漫',
      'riben': '日本动漫',
      'oumei': '欧美动漫'
    };

    res.render('dongman/index', {
      title: typeNames[type] || '动漫',
      items: data?.list || [],
      pagination: data?.pagination || {},
      currentSort: sort,
      currentType: type,
      types: [
        { name: '全部', value: '' },
        { name: '国产动漫', value: 'guochan' },
        { name: '日本动漫', value: 'riben' },
        { name: '欧美动漫', value: 'oumei' }
      ],
      sorts: [
        { name: '最热', value: 'hot' },
        { name: '最新', value: 'time' },
        { name: '评分', value: 'score' }
      ],
      meta: {
        description: `${typeNames[type] || '动漫'}在线观看，高清免费`,
        keywords: `${typeNames[type] || '动漫'},在线观看,免费,高清`
      }
    });
  } catch (error) {
    console.error('动漫分类加载错误:', error);
    req.flash('error', '加载动漫数据失败');
    res.redirect('/dongman');
  }
};