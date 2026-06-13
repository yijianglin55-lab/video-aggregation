/**
 * 综艺控制器
 * 处理综艺列表和分类数据
 */

const ZongyiCrawler = require('../crawlers/zongyiCrawler');

// 内存缓存
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * 综艺首页
 */
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'hot';

    const cacheKey = `zongyi-index-${page}-${sort}`;
    let data = null;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        data = cached.data;
      }
    }

    if (!data) {
      data = await ZongyiCrawler.getZongyiList({ page, sort });

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

    res.render('zongyi/index', {
      title: '综艺',
      items: data?.list || [],
      pagination: data?.pagination || {},
      currentSort: sort,
      currentType: '',
      types: [
        { name: '全部', value: '' },
        { name: '大陆综艺', value: 'dalu' },
        { name: '港台综艺', value: 'gangtai' },
        { name: '日韩综艺', value: 'rihan' },
        { name: '欧美综艺', value: 'oumei' }
      ],
      sorts: [
        { name: '最热', value: 'hot' },
        { name: '最新', value: 'time' },
        { name: '评分', value: 'score' }
      ],
      meta: {
        description: '最新热门综艺免费观看，大陆、港台、日韩、欧美综艺一网打尽',
        keywords: '综艺在线观看,综艺免费,综艺大全,大陆综艺,港台综艺,日韩综艺'
      }
    });
  } catch (error) {
    console.error('综艺列表加载错误:', error);
    req.flash('error', '加载综艺数据失败');
    res.render('zongyi/index', {
      title: '综艺',
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
 * 综艺分类
 */
exports.category = async (req, res) => {
  try {
    const type = req.params.type;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'hot';

    const cacheKey = `zongyi-${type}-${page}-${sort}`;
    let data = null;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        data = cached.data;
      }
    }

    if (!data) {
      data = await ZongyiCrawler.getZongyiList({ type, page, sort });

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
      'dalu': '大陆综艺',
      'gangtai': '港台综艺',
      'rihan': '日韩综艺',
      'oumei': '欧美综艺'
    };

    res.render('zongyi/index', {
      title: typeNames[type] || '综艺',
      items: data?.list || [],
      pagination: data?.pagination || {},
      currentSort: sort,
      currentType: type,
      types: [
        { name: '全部', value: '' },
        { name: '大陆综艺', value: 'dalu' },
        { name: '港台综艺', value: 'gangtai' },
        { name: '日韩综艺', value: 'rihan' },
        { name: '欧美综艺', value: 'oumei' }
      ],
      sorts: [
        { name: '最热', value: 'hot' },
        { name: '最新', value: 'time' },
        { name: '评分', value: 'score' }
      ],
      meta: {
        description: `${typeNames[type] || '综艺'}在线观看，高清免费`,
        keywords: `${typeNames[type] || '综艺'},在线观看,免费,高清`
      }
    });
  } catch (error) {
    console.error('综艺分类加载错误:', error);
    req.flash('error', '加载综艺数据失败');
    res.redirect('/zongyi');
  }
};