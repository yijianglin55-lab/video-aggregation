/**
 * 首页爬虫
 * 获取首页各区块视频数据
 */

const { fetchPage, parseHTML } = require('./baseCrawler');

class HomeCrawler {
  /**
   * 获取首页数据
   */
  static async getHomeData() {
    try {
      const html = await fetchPage('/');
      const $ = parseHTML(html);

      const data = {
        banner: this.parseBanner($),
        hotMovies: this.parseVideoList($, '正在热播'),
        latestMovies: this.parseVideoList($, '最新电影'),
        hotTvShows: this.parseVideoList($, '热播电视剧'),
        latestTvShows: this.parseVideoList($, '最新电视剧'),
        hotVariety: this.parseVideoList($, '热播综艺'),
        hotAnime: this.parseVideoList($, '热播动漫')
      };

      return data;
    } catch (error) {
      console.error('首页数据获取失败:', error);
      return null;
    }
  }

  /**
   * 解析轮播图
   */
  static parseBanner($) {
    const banner = [];

    $('.swiper-slide').each((i, el) => {
      const link = $(el).find('a').first();
      const title = $(el).find('.title').first().text().trim() ||
                    $(el).find('h3').first().text().trim();
      const img = link.attr('data-slide-bg') || '';
      const href = link.attr('href') || '';

      if (title && href) {
        banner.push({
          title,
          href: this.extractPath(href),
          img: this.normalizeImageUrl(img)
        });
      }
    });

    return banner.slice(0, 10); // 限制数量
  }

  /**
   * 解析视频列表
   */
  static parseVideoList($, sectionTitle) {
    const videos = [];

    // 查找包含指定标题的区块
    $(`.myui-vodbox`).each((i, el) => {
      const title = $(el).find('.title').first().text().trim();

      if (title.includes(sectionTitle) || sectionTitle === '') {
        $(el).find('.myui-vodbox-content').each((j, item) => {
          const video = this.parseVideoItem($, item);
          if (video) {
            videos.push(video);
          }
        });
      }
    });

    // 如果没找到指定标题，尝试按位置获取
    if (videos.length === 0) {
      const sections = $('.myui-vodbox');
      const index = this.getSectionIndex(sectionTitle);

      if (sections.eq(index).length) {
        sections.eq(index).find('.myui-vodbox-content').each((j, item) => {
          const video = this.parseVideoItem($, item);
          if (video) {
            videos.push(video);
          }
        });
      }
    }

    return videos;
  }

  /**
   * 解析单个视频项
   */
  static parseVideoItem($, el) {
    const $el = $(el);
    const link = $el.find('a').first();
    let href = link.attr('href') || '';

    if (!href) return null;

    // 提取路径部分（去掉域名）
    const urlPath = this.extractPath(href);

    const title = $el.find('.card-info .title').first().text().trim() ||
                  $el.find('img').first().attr('alt') || '';
    const img = $el.find('img').first().attr('data-src') ||
                $el.find('img').first().attr('src') || '';
    const actors = $el.find('.card-info .role').first().text().trim()
                   .replace('主演：', '').trim();
    const score = $el.find('.score').first().text().trim();
    const hits = $el.find('.hits').first().text().trim()
                 .replace(/[^\d]/g, '');
    const tag = $el.find('.tag-box .tag').first().text().trim();

    // 根据路径解析类型和ID
    let type = 'movie';
    let id = '';

    if (urlPath.startsWith('/tv/')) {
      type = 'tv';
      id = urlPath.replace('/tv/', '');
    } else if (urlPath.startsWith('/dongman/')) {
      type = 'dongman';
      id = urlPath.replace('/dongman/', '');
    } else if (urlPath.startsWith('/zongyi/')) {
      type = 'zongyi';
      id = urlPath.replace('/zongyi/', '');
    } else if (urlPath.startsWith('/movie/')) {
      type = 'movie';
      id = urlPath.replace('/movie/', '');
    }

    return {
      id,
      title,
      href: urlPath, // 返回相对路径
      img: this.normalizeImageUrl(img),
      actors,
      score: score || '0.0',
      hits: parseInt(hits) || 0,
      tag,
      type
    };
  }

  /**
   * 提取URL路径部分
   */
  static extractPath(url) {
    if (!url) return '';
    // 如果是完整URL，提取路径部分
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname;
      } catch (e) {
        return url;
      }
    }
    // 如果已经是相对路径，直接返回
    return url;
  }

  /**
   * 标准化图片URL
   */
  static normalizeImageUrl(url) {
    if (!url) return '/img/default-cover.jpg';
    // 如果是完整URL，直接返回
    if (url.startsWith('http')) return url;
    // 如果是相对路径，补全为目标站点的URL
    if (url.startsWith('/')) return 'https://fdzys.net' + url;
    if (url.startsWith('//')) return 'https:' + url;
    return 'https://fdzys.net/' + url;
  }

  /**
   * 获取区块索引
   */
  static getSectionIndex(sectionTitle) {
    const mapping = {
      '正在热播': 0,
      '最新电影': 1,
      '热播电视剧': 2,
      '最新电视剧': 3,
      '热播综艺': 4,
      '热播动漫': 5
    };
    return mapping[sectionTitle] || 0;
  }

}

module.exports = HomeCrawler;