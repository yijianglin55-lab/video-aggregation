/**
 * 电视剧控制器
 * 处理电视剧列表和分类数据
 */

const TvCrawler = require('../crawlers/tvCrawler');

// 内存缓存
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * 电视剧首页
 */
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'hot';

    const cacheKey = `tv-index-${page}-${sort}`;
    let tvData = null;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        tvData = cached.data;
      }
    }

    if (!tvData) {
      tvData = await TvCrawler.getTvList({ page, sort });

      // 本地排序
      if (tvData && tvData.list && tvData.list.length > 0) {
        if (sort === 'hot') {
          tvData.list.sort((a, b) => b.hits - a.hits);
        } else if (sort === 'score') {
          tvData.list.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        }
      }

      cache.set(cacheKey, { data: tvData, timestamp: Date.now() });
    }

    res.render('tv/index', {
      title: '电视剧',
      tvShows: tvData?.list || [],
      pagination: tvData?.pagination || {},
      currentSort: sort,
      currentType: '',
      types: [
        { name: '全部', value: '' },
        { name: '国产剧', value: 'guochan' },
        { name: '欧美剧', value: 'oumei' },
        { name: '日本剧', value: 'riben' },
        { name: '韩国剧', value: 'hanguo' },
        { name: '港台剧', value: 'gangtai' }
      ],
      sorts: [
        { name: '最热', value: 'hot' },
        { name: '最新', value: 'time' },
        { name: '评分', value: 'score' }
      ],
      meta: {
        description: '最新热门电视剧免费观看，国产剧、欧美剧、日剧、韩剧一网打尽',
        keywords: '电视剧在线观看,电视剧免费,电视剧大全,国产剧,欧美剧,日剧,韩剧'
      }
    });
  } catch (error) {
    console.error('电视剧列表加载错误:', error);
    req.flash('error', '加载电视剧数据失败，请稍后重试');
    res.render('tv/index', {
      title: '电视剧',
      tvShows: [],
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
 * 电视剧分类
 */
exports.category = async (req, res) => {
  try {
    const type = req.params.type;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'hot';

    const cacheKey = `tv-${type}-${page}-${sort}`;
    let tvData = null;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        tvData = cached.data;
      }
    }

    if (!tvData) {
      tvData = await TvCrawler.getTvList({ type, page, sort });

      // 本地排序
      if (tvData && tvData.list && tvData.list.length > 0) {
        if (sort === 'hot') {
          tvData.list.sort((a, b) => b.hits - a.hits);
        } else if (sort === 'score') {
          tvData.list.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        }
      }

      cache.set(cacheKey, { data: tvData, timestamp: Date.now() });
    }

    const typeNames = {
      'guochan': '国产剧',
      'oumei': '欧美剧',
      'riben': '日本剧',
      'hanguo': '韩国剧',
      'gangtai': '港台剧'
    };

    res.render('tv/index', {
      title: typeNames[type] || '电视剧',
      tvShows: tvData?.list || [],
      pagination: tvData?.pagination || {},
      currentSort: sort,
      currentType: type,
      types: [
        { name: '全部', value: '' },
        { name: '国产剧', value: 'guochan' },
        { name: '欧美剧', value: 'oumei' },
        { name: '日本剧', value: 'riben' },
        { name: '韩国剧', value: 'hanguo' },
        { name: '港台剧', value: 'gangtai' }
      ],
      sorts: [
        { name: '最热', value: 'hot' },
        { name: '最新', value: 'time' },
        { name: '评分', value: 'score' }
      ],
      meta: {
        description: `${typeNames[type] || '电视剧'}在线观看，高清免费`,
        keywords: `${typeNames[type] || '电视剧'},在线观看,免费,高清`
      }
    });
  } catch (error) {
    console.error('电视剧分类加载错误:', error);
    req.flash('error', '加载电视剧数据失败，请稍后重试');
    res.redirect('/tv');
  }
};