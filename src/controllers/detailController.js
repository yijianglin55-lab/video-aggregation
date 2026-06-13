/**
 * 详情页控制器
 * 处理影片详情展示
 */

const DetailCrawler = require('../crawlers/detailCrawler');

/**
 * 影片详情页
 */
exports.index = async (req, res) => {
  try {
    const { type, id } = req.params;

    const detailData = await DetailCrawler.getDetail({ type, id });

    if (!detailData) {
      return res.status(404).render('error/404', {
        title: '影片未找到'
      });
    }

    res.render('detail/index', {
      title: detailData.title,
      video: detailData,
      meta: {
        description: `${detailData.title}在线观看 - ${detailData.description?.substring(0, 100) || ''}`,
        keywords: `${detailData.title},${detailData.actors || ''},${detailData.type || ''},在线观看`
      }
    });
  } catch (error) {
    console.error('详情页加载错误:', error);
    req.flash('error', '加载影片详情失败，请稍后重试');
    res.redirect('/');
  }
};