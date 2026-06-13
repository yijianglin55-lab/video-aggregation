/**
 * 播放页爬虫
 * 获取播放地址和播放器信息
 */

const { fetchPage, parseHTML } = require('./baseCrawler');

class PlayerCrawler {
  /**
   * 获取播放数据
   * @param {object} params - 参数
   * @param {string} params.type - 影片类型
   * @param {string} params.id - 影片ID
   * @param {string} params.episode - 集数
   * @param {string} params.sid - 播放源ID
   */
  static async getPlayerData(params = {}) {
    try {
      const { type, id, episode, sid } = params;

      // 先获取详情页
      const detailUrl = `/${type}/${id}`;
      const detailHtml = await fetchPage(detailUrl);
      const $detail = parseHTML(detailHtml);

      // 获取基本信息
      const title = $detail('h1').first().text().trim() ||
                    $detail('title').text().split('_')[0].trim();
      const coverImg = $detail('.mizhiady-defer-card-img').first().attr('data-src') ||
                    $detail('.vod-img img').first().attr('data-src') || '';
      const cover = this.normalizeImageUrl(coverImg);

      // 获取播放源列表
      const sources = [];
      const sourceMap = {};
      let activeSourceIndex = 0;

      $detail('.player_name, .swiper-slide.player_name').each((i, el) => {
        const name = $detail(el).text().trim();
        const href = $detail(el).find('a').attr('href') || '';
        const dataSid = $detail(el).attr('data-sid') || '';
        const isActive = $detail(el).hasClass('active');

        if (name && name.length < 20) {
          const playlistId = href.replace('#', '');
          sources.push({
            name,
            href,
            sid: dataSid,
            playlistId,
            isActive
          });

          if (isActive) {
            activeSourceIndex = sources.length - 1;
          }
        }
      });

      // 获取所有播放源的剧集列表
      const sourceEpisodes = {};
      $detail('[id^="playlist"]').each((i, el) => {
        const playlistId = $detail(el).attr('id');
        const episodes = [];

        $detail(el).find('a').each((j, item) => {
          const name = $detail(item).text().trim();
          let href = $detail(item).attr('href') || '';

          // 过滤无效链接
          if (!name || name === '刷新' || name.includes('云') || name.includes('qiyi') || name.length > 20) return;

          // 提取路径
          if (href.startsWith('http')) {
            try { href = new URL(href).pathname; } catch (e) {}
          }

          episodes.push({
            name,
            href
          });
        });

        if (episodes.length > 0) {
          sourceEpisodes[playlistId] = episodes;
        }
      });

      // 确定当前播放源
      let currentSource = sources[activeSourceIndex] || sources[0];
      if (sid) {
        const found = sources.find(s => s.sid === sid);
        if (found) {
          currentSource = found;
          // 更新isActive状态
          sources.forEach(s => s.isActive = (s.sid === sid));
        }
      }

      // 获取当前播放源的剧集列表
      const episodes = currentSource ? (sourceEpisodes[currentSource.playlistId] || []) : [];

      // 确定当前播放链接
      let playUrl = '';
      if (episode && episodes.length > 0) {
        const ep = episodes.find(e => e.name.includes(episode));
        if (ep) playUrl = ep.href;
      }
      if (!playUrl && episodes.length > 0) {
        playUrl = episodes[0].href;
      }

      // 获取播放器地址
      let playerUrl = '';
      let playerType = 'iframe';

      if (playUrl) {
        try {
          // 构建完整的播放URL，包含sid参数
          let fullPlayUrl = playUrl.startsWith('http') ? playUrl : `https://fdzys.net${playUrl}`;
          if (sid && !fullPlayUrl.includes('sid=')) {
            fullPlayUrl += (fullPlayUrl.includes('?') ? '&' : '?') + `sid=${sid}`;
          }

          console.log('获取播放URL:', fullPlayUrl);
          const playHtml = await fetchPage(fullPlayUrl);

          // 查找player_aaaa配置
          const playerScriptIndex = playHtml.indexOf('player_aaaa=');
          if (playerScriptIndex > -1) {
            const configStart = playerScriptIndex + 12;
            const configEnd = playHtml.indexOf('};', configStart);
            if (configEnd > -1) {
              const configStr = playHtml.substring(configStart, configEnd + 1);
              const urlMatch = configStr.match(/"url"\s*:\s*"(https?:\\\/\\\/[^"]+)"/);
              if (urlMatch) {
                playerUrl = urlMatch[1].replace(/\\\//g, '/');
                playerType = 'iframe';
              }
            }
          }

          // 如果没找到配置，尝试查找iframe
          if (!playerUrl) {
            const $play = parseHTML(playHtml);
            const iframe = $play('iframe').first();
            if (iframe.length) {
              playerUrl = iframe.attr('src') || '';
            }
          }
        } catch (error) {
          console.error('获取播放器地址失败:', error);
        }
      }

      return {
        title,
        cover: this.normalizeImageUrl(cover),
        playerUrl,
        playerType,
        sources,
        sourceEpisodes,
        episodes,
        currentSource,
        type,
        id
      };
    } catch (error) {
      console.error('播放数据获取失败:', error);
      return null;
    }
  }

  /**
   * 标准化图片URL
   */
  static normalizeImageUrl(url) {
    if (!url) return '/img/default-cover.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return 'https://fdzys.net' + url;
    if (url.startsWith('//')) return 'https:' + url;
    return 'https://fdzys.net/' + url;
  }
}

module.exports = PlayerCrawler;