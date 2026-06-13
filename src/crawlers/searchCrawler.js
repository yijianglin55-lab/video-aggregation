/**
 * 搜索爬虫
 * 处理影片搜索功能
 */

const { fetchPage, parseHTML } = require('./baseCrawler');

class SearchCrawler {
  /**
   * 搜索影片
   * @param {object} params - 参数
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.page - 页码
   */
  static async search(params = {}) {
    try {
      const { keyword, page = 1 } = params;

      if (!keyword) {
        return { list: [], pagination: {} };
      }

      // 构建搜索URL - 使用目标站点的搜索格式
      let url = `/search?wd=${encodeURIComponent(keyword)}`;
      if (page > 1) {
        url += `&page=${page}`;
      }

      const html = await fetchPage(url);
      const $ = parseHTML(html);

      // 尝试解析搜索结果
      let results = this.parseSearchResults($);

      // 如果没有结果，尝试使用另一种URL格式
      if (results.length === 0) {
        const altUrl = `/yu-${encodeURIComponent(keyword)}-xianguan-de-yingpian-shippin-zhibo`;
        const altHtml = await fetchPage(altUrl);
        const $alt = parseHTML(altHtml);
        results = this.parseSearchResults($alt);
      }

      return {
        list: results,
        pagination: this.parsePagination($)
      };
    } catch (error) {
      console.error('搜索失败:', error);
      return { list: [], pagination: {} };
    }
  }

  /**
   * 解析搜索结果
   */
  static parseSearchResults($) {
    const results = [];

    // 搜索结果可能在不同的容器中
    const selectors = [
      '.myui-vodbox-content',
      '.search-result .item',
      '.video-list .item',
      '.movie-list .item'
    ];

    for (const selector of selectors) {
      $(selector).each((i, el) => {
        const $el = $(el);
        const link = $el.find('a').first();
        let href = link.attr('href') || '';

        if (!href) return;

        // 提取路径部分
        const urlPath = this.extractPath(href);

        const title = $el.find('.card-info .title, .title, .name, h3').first().text().trim() ||
                      $el.find('img').first().attr('alt') || '';
        const img = $el.find('img').first().attr('data-src') ||
                    $el.find('img').first().attr('src') || '';
        const info = $el.find('.card-info .role, .info, .meta, .desc').first().text().trim();
        const score = $el.find('.score').first().text().trim();
        const tag = $el.find('.tag-box .tag, .tag').first().text().trim();

        // 根据路径判断类型和ID
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
        } else {
          // 尝试从完整路径提取
          const match = urlPath.match(/^\/(movie|tv|dongman|zongyi)\/(.+)/);
          if (match) {
            type = match[1];
            id = match[2];
          }
        }

        results.push({
          id,
          title,
          href: urlPath,
          img: this.normalizeImageUrl(img),
          info,
          score: score || '0.0',
          tag,
          type
        });
      });

      if (results.length > 0) break;
    }

    return results;
  }

  /**
   * 提取URL路径部分
   */
  static extractPath(url) {
    if (!url) return '';
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname;
      } catch (e) {
        return url;
      }
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

  /**
   * 解析分页
   */
  static parsePagination($) {
    const pagination = {
      current: 1,
      total: 1,
      hasNext: false,
      hasPrev: false,
      pages: []
    };

    const pageNav = $('.pagination, .page-nav, .pager').first();

    if (pageNav.length) {
      const currentPage = pageNav.find('.active, .current').first().text().trim();
      pagination.current = parseInt(currentPage) || 1;

      pageNav.find('a').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';

        if (text && /^\d+$/.test(text)) {
          pagination.pages.push({
            page: parseInt(text),
            href
          });
        }
      });

      if (pagination.pages.length > 0) {
        pagination.total = Math.max(...pagination.pages.map(p => p.page));
      }

      pagination.hasNext = pagination.current < pagination.total;
      pagination.hasPrev = pagination.current > 1;
    }

    return pagination;
  }

}

module.exports = SearchCrawler;