/**
 * 搜索控制器
 * 处理影片搜索功能
 */

const SearchCrawler = require('../crawlers/searchCrawler');

/**
 * 搜索结果页
 */
exports.index = async (req, res) => {
  try {
    const keyword = req.query.wd || '';
    const page = parseInt(req.query.page) || 1;

    if (!keyword.trim()) {
      return res.render('search/index', {
        title: '搜索',
        keyword: '',
        results: [],
        pagination: {},
        meta: {
          description: '搜索电影、电视剧、综艺、动漫',
          keywords: '搜索,电影,电视剧,综艺,动漫'
        }
      });
    }

    const searchData = await SearchCrawler.search({ keyword, page });

    res.render('search/index', {
      title: `搜索：${keyword}`,
      keyword: keyword,
      results: searchData?.list || [],
      pagination: searchData?.pagination || {},
      meta: {
        description: `${keyword}搜索结果 - 在线观看`,
        keywords: `${keyword},在线观看,免费,高清`
      }
    });
  } catch (error) {
    console.error('搜索错误:', error);
    req.flash('error', '搜索失败，请稍后重试');
    res.render('search/index', {
      title: '搜索',
      keyword: req.query.wd || '',
      results: [],
      pagination: {},
      meta: {}
    });
  }
};