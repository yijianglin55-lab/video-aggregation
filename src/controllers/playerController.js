/**
 * 播放页控制器
 * 处理影片播放
 */

const PlayerCrawler = require('../crawlers/playerCrawler');

/**
 * 播放页
 */
exports.index = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { sid } = req.query;

    const playerData = await PlayerCrawler.getPlayerData({ type, id, sid });

    if (!playerData) {
      return res.status(404).render('error/404', {
        title: '播放源未找到'
      });
    }

    // 默认选中第一集
    const currentEpisode = playerData.episodes && playerData.episodes.length > 0
      ? playerData.episodes[0].name
      : '';

    res.render('player/index', {
      title: `${playerData.title} - 在线播放`,
      video: playerData,
      currentEpisode: currentEpisode,
      meta: {
        description: `${playerData.title}在线播放 - 高清流畅`,
        keywords: `${playerData.title},在线播放,高清,免费`
      },
      layout: 'layouts/player'
    });
  } catch (error) {
    console.error('播放页加载错误:', error);
    req.flash('error', '加载播放源失败，请稍后重试');
    res.redirect(`/detail/${req.params.type}/${req.params.id}`);
  }
};

/**
 * 播放指定集数
 */
exports.play = async (req, res) => {
  try {
    const { type, id, episode } = req.params;
    const { sid } = req.query;

    const playerData = await PlayerCrawler.getPlayerData({ type, id, episode, sid });

    if (!playerData) {
      return res.status(404).render('error/404', {
        title: '播放源未找到'
      });
    }

    res.render('player/index', {
      title: `${playerData.title} ${episode || ''} - 在线播放`,
      video: playerData,
      currentEpisode: episode,
      meta: {
        description: `${playerData.title} ${episode || ''}在线播放`,
        keywords: `${playerData.title},${episode || ''},在线播放`
      },
      layout: 'layouts/player'
    });
  } catch (error) {
    console.error('播放页加载错误:', error);
    req.flash('error', '加载播放源失败，请稍后重试');
    res.redirect(`/detail/${req.params.type}/${req.params.id}`);
  }
};