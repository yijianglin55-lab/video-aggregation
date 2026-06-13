/**
 * 综艺爬虫
 * 获取综艺列表和分类数据
 */

const { fetchPage, parseHTML } = require('./baseCrawler');

class ZongyiCrawler {
  /**
   * 获取综艺列表
   * @param {object} params - 参数
   * @param {string} params.type - 分类类型
   * @param {number} params.page - 页码
   * @param {string} params.sort - 排序方式 (time/hot/score)
   */
  static async getZongyiList(params = {}) {
    try {
      const { type = '', page = 1, sort = 'hot' } = params;

      // 构建URL
      let url = '/zongyi/all';
      if (type) {
        url = `/zongyi/${type}`;
      }

      // 添加排序参数
      if (sort && sort !== 'time') {
        url += `/${sort}`;
      }

      // 添加分页参数
      if (page > 1) {
        url += `?page=${page}`;
      }

      console.log('请求综艺列表URL:', url);
      const html = await fetchPage(url);
      const $ = parseHTML(html);

      return {
        list: this.parseList($),
        pagination: this.parsePagination($)
      };
    } catch (error) {
      console.error('综艺列表获取失败:', error);
      return { list: [], pagination: {} };
    }
  }

  /**
   * 解析综艺列表
   */
  static parseList($) {
    const items = [];

    $('.myui-vodbox-content').each((i, el) => {
      const $el = $(el);
      const link = $el.find('a').first();
      let href = link.attr('href') || '';

      if (!href) return;

      const urlPath = this.extractPath(href);
      if (!urlPath.startsWith('/zongyi/')) return;

      const title = $el.find('.card-info .title').first().text().trim() ||
                    $el.find('img').first().attr('alt') || '';
      const img = $el.find('img').first().attr('data-src') ||
                  $el.find('img').first().attr('src') || '';
      const actors = $el.find('.card-info .role').first().text().trim()
                     .replace('主演：', '').trim();
      const score = $el.find('.score').first().text().trim();
      const hits = $el.find('.hits').first().text().trim().replace(/[^\d]/g, '');
      const tag = $el.find('.tag-box .tag').first().text().trim();

      const id = urlPath.replace('/zongyi/', '').replace(/\/$/, '');

      items.push({
        id,
        title,
        href: urlPath,
        img: this.normalizeImageUrl(img),
        actors,
        score: score || '0.0',
        hits: parseInt(hits) || 0,
        tag,
        type: 'zongyi'
      });
    });

    return items;
  }

  /**
   * 解析分页
   */
  static parsePagination($) {
    const pagination = { current: 1, total: 1, hasNext: false, hasPrev: false, pages: [] };
    const pageNav = $('.pagination, .page-nav, .pager').first();

    if (pageNav.length) {
      const currentPage = pageNav.find('.active, .current').first().text().trim();
      pagination.current = parseInt(currentPage) || 1;

      pageNav.find('a').each((i, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';

        if (text && /^\d+$/.test(text)) {
          pagination.pages.push({ page: parseInt(text), href });
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

  static extractPath(url) {
    if (!url) return '';
    if (url.startsWith('http')) {
      try { return new URL(url).pathname; } catch (e) { return url; }
    }
    return url;
  }

  static normalizeImageUrl(url) {
    if (!url) return '/img/default-cover.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return 'https://fdzys.net' + url;
    if (url.startsWith('//')) return 'https:' + url;
    return 'https://fdzys.net/' + url;
  }
}

module.exports = ZongyiCrawler;