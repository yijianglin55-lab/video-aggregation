/**
 * 电影控制器
 * 处理电影列表和分类数据
 */

const MovieCrawler = require('../crawlers/movieCrawler');

// 内存缓存
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * 电影首页（全部电影）
 */
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'hot';

    const cacheKey = `movie-index-${page}-${sort}`;
    let movieData = null;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        movieData = cached.data;
      }
    }

    if (!movieData) {
      movieData = await MovieCrawler.getMovieList({ page, sort });

      // 本地排序
      if (movieData && movieData.list && movieData.list.length > 0) {
        if (sort === 'hot') {
          // 按热度排序
          movieData.list.sort((a, b) => b.hits - a.hits);
        } else if (sort === 'score') {
          // 按评分排序
          movieData.list.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        }
        // time排序保持默认顺序
      }

      cache.set(cacheKey, { data: movieData, timestamp: Date.now() });
    }

    res.render('movie/index', {
      title: '电影',
      movies: movieData?.list || [],
      pagination: movieData?.pagination || {},
      currentSort: sort,
      currentType: '',
      types: [
        { name: '全部', value: '' },
        { name: '动作', value: 'dongzuo' },
        { name: '喜剧', value: 'xiju' },
        { name: '爱情', value: 'aiqing' },
        { name: '科幻', value: 'kehuan' },
        { name: '恐怖', value: 'kongbupian' },
        { name: '剧情', value: 'juqing' },
        { name: '战争', value: 'zhanzheng' },
        { name: '纪录', value: 'jilupian' }
      ],
      sorts: [
        { name: '最热', value: 'hot' },
        { name: '最新', value: 'time' },
        { name: '评分', value: 'score' }
      ],
      meta: {
        description: '最新热门电影免费观看，覆盖动作、喜剧、爱情、科幻、恐怖等多种题材',
        keywords: '电影在线观看,电影免费,电影大全,电影高清,最新电影'
      }
    });
  } catch (error) {
    console.error('电影列表加载错误:', error);
    req.flash('error', '加载电影数据失败，请稍后重试');
    res.render('movie/index', {
      title: '电影',
      movies: [],
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
 * 电影分类
 */
exports.category = async (req, res) => {
  try {
    const type = req.params.type;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'time';

    const cacheKey = `movie-${type}-${page}-${sort}`;
    let movieData = null;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        movieData = cached.data;
      }
    }

    if (!movieData) {
      movieData = await MovieCrawler.getMovieList({ type, page, sort });
      cache.set(cacheKey, { data: movieData, timestamp: Date.now() });
    }

    const typeNames = {
      'dongzuo': '动作片',
      'xiju': '喜剧片',
      'aiqing': '爱情片',
      'kehuan': '科幻片',
      'kongbupian': '恐怖片',
      'juqing': '剧情片',
      'zhanzheng': '战争片',
      'jilupian': '纪录片'
    };

    res.render('movie/index', {
      title: typeNames[type] || '电影',
      movies: movieData?.list || [],
      pagination: movieData?.pagination || {},
      currentSort: sort,
      currentType: type,
      types: [
        { name: '全部', value: '' },
        { name: '动作', value: 'dongzuo' },
        { name: '喜剧', value: 'xiju' },
        { name: '爱情', value: 'aiqing' },
        { name: '科幻', value: 'kehuan' },
        { name: '恐怖', value: 'kongbupian' },
        { name: '剧情', value: 'juqing' },
        { name: '战争', value: 'zhanzheng' },
        { name: '纪录', value: 'jilupian' }
      ],
      sorts: [
        { name: '最热', value: 'hot' },
        { name: '最新', value: 'time' },
        { name: '评分', value: 'score' }
      ],
      meta: {
        description: `${typeNames[type] || '电影'}在线观看，高清免费`,
        keywords: `${typeNames[type] || '电影'},在线观看,免费,高清`
      }
    });
  } catch (error) {
    console.error('电影分类加载错误:', error);
    req.flash('error', '加载电影数据失败，请稍后重试');
    res.redirect('/movie');
  }
};