/**
 * 详情页爬虫
 * 获取影片详细信息
 */

const { fetchPage, parseHTML } = require('./baseCrawler');

class DetailCrawler {
  /**
   * 获取影片详情
   * @param {object} params - 参数
   * @param {string} params.type - 影片类型
   * @param {string} params.id - 影片ID
   */
  static async getDetail(params = {}) {
    try {
      const { type, id } = params;

      // 构建详情页URL
      const url = `/${type}/${id}`;

      const html = await fetchPage(url);
      const $ = parseHTML(html);

      return this.parseDetail($, type, id);
    } catch (error) {
      console.error('详情页获取失败:', error);
      return null;
    }
  }

  /**
   * 解析详情页
   */
  static parseDetail($, type, id) {
    const detail = {
      id,
      type,
      title: '',
      cover: '',
      year: '',
      area: '',
      genre: '',
      actors: '',
      director: '',
      description: '',
      score: '',
      updateTime: '',
      episodes: [],
      playSources: []
    };

    // 标题 - 优先使用h1，然后是特定的类名
    detail.title = $('h1').first().text().trim() ||
                   $('.vod-title').first().text().trim() ||
                   $('.detail-title').first().text().trim() ||
                   $('title').text().split('_')[0].trim();

    // 封面 - 优先使用og:image标签
    let coverImg = '';

    // 首先尝试og:image标签（最可靠）
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      coverImg = ogImage;
    }

    // 如果没有og:image，尝试其他选择器
    if (!coverImg) {
      const coverSelectors = [
        '.mizhiady-player-detail img',
        '.mizhiady-defer-card-img',
        '.vod-img img',
        '.detail-img img',
        '.poster img',
        '.cover img'
      ];

      for (const selector of coverSelectors) {
        const imgEl = $(selector).first();
        if (imgEl.length) {
          coverImg = imgEl.attr('data-src') || imgEl.attr('src') || '';
          if (coverImg && !coverImg.startsWith('data:')) {
            break;
          }
          coverImg = '';
        }
      }
    }

    detail.cover = this.normalizeImageUrl(coverImg);

    // 详细信息
    const infoText = $('.vod-info, .detail-info, .info-content, .vod-detail-info').first().text();

    // 年份
    const yearMatch = infoText.match(/年份[：:]\s*(\d{4})/);
    detail.year = yearMatch ? yearMatch[1] : '';

    // 地区
    const areaMatch = infoText.match(/地区[：:]\s*([^\s]+)/);
    detail.area = areaMatch ? areaMatch[1] : '';

    // 类型
    const genreMatch = infoText.match(/类型[：:]\s*([^\n]+)/);
    detail.genre = genreMatch ? genreMatch[1].trim() : '';

    // 导演
    const directorMatch = infoText.match(/导演[：:]\s*([^\n]+)/);
    detail.director = directorMatch ? directorMatch[1].trim() : '';

    // 主演
    const actorsMatch = infoText.match(/主演[：:]\s*([^\n]+)/);
    detail.actors = actorsMatch ? actorsMatch[1].trim() : '';

    // 简介
    detail.description = $('.vod-content, .detail-desc, .intro, .summary').first().text().trim()
                        .replace(/^简介[：:]/, '').trim();

    // 评分
    detail.score = $('.score, .rating').first().text().trim();

    // 更新时间
    detail.updateTime = $('.info-time, .update-time').first().text().trim()
                       .replace('更新时间：', '').trim();

    // 播放源
    detail.playSources = this.parsePlaySources($);

    // 获取所有播放源的剧集列表
    detail.sourceEpisodes = {};
    $('[id^="playlist"]').each((i, el) => {
      const playlistId = $(el).attr('id');
      const episodes = [];

      $(el).find('a').each((j, item) => {
        const name = $(item).text().trim();
        let href = $(item).attr('href') || '';

        // 过滤无效链接
        if (!name || name === '刷新' || name.includes('云') || name.includes('qiyi') || name.length > 20) return;

        // 提取路径
        href = this.extractPath(href);

        episodes.push({
          name,
          href
        });
      });

      if (episodes.length > 0) {
        detail.sourceEpisodes[playlistId] = episodes;
      }
    });

    // 当前播放源的剧集列表
    const currentSource = detail.playSources.find(s => s.isActive) || detail.playSources[0];
    if (currentSource) {
      const playlistId = currentSource.href.replace('#', '');
      detail.episodes = detail.sourceEpisodes[playlistId] || [];
    } else {
      detail.episodes = [];
    }

    return detail;
  }

  /**
   * 解析播放源
   */
  static parsePlaySources($) {
    const sources = [];

    // 查找播放源标签页
    $('.player_name, .source-list, .play-source, .tabs, .play-from').each((i, el) => {
      const $el = $(el);
      const name = $el.find('a').first().text().trim() || $el.text().trim();
      const href = $el.find('a').first().attr('href') || $el.attr('data-href') || '';
      const isActive = $el.hasClass('active');

      if (name && name.length < 20) {
        sources.push({
          name,
          href,
          isActive
        });
      }
    });

    return sources;
  }

  /**
   * 解析剧集列表
   */
  static parseEpisodes($) {
    const episodes = [];
    const seen = new Set();

    // 查找剧集列表 - 在play-box或vod-lists容器中
    $('.play-box.vod-lists, .player-side-box.vod-lists, .episodes_wrap').each((i, el) => {
      $(el).find('a').each((j, item) => {
        const name = $(item).text().trim();
        let href = $(item).attr('href') || $(item).attr('data-href') || '';
        const isActive = $(item).hasClass('active');

        // 过滤无效链接
        if (!name || name === '刷新' || name.includes('javascript') || name.length > 30) return;

        // 提取路径
        href = this.extractPath(href);

        // 跳过播放源链接（#playlist开头的）
        if (href.startsWith('#playlist')) return;

        // 去重
        const key = `${name}-${href}`;
        if (seen.has(key)) return;
        seen.add(key);

        episodes.push({
          name,
          href,
          isActive
        });
      });
    });

    return episodes;
  }

  /**
   * 提取URL路径
   */
  static extractPath(url) {
    if (!url) return '';
    if (url.startsWith('http')) {
      try { return new URL(url).pathname; } catch (e) { return url; }
    }
    return url;
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

module.exports = DetailCrawler;