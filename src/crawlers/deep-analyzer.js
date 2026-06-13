/**
 * 深度页面结构分析器
 * 用于完整抓取目标站点的DOM结构、CSS类名、布局方式
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://fdzys.net';

// 更真实的浏览器请求头
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

const client = axios.create({
  timeout: 15000,
  headers: headers,
  maxRedirects: 5
});

/**
 * 获取页面HTML
 */
async function fetchPage(url) {
  try {
    console.log(`正在抓取: ${url}`);
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error(`获取失败: ${url} - ${error.message}`);
    return null;
  }
}

/**
 * 深度分析首页结构
 */
async function deepAnalyzeHome() {
  console.log('\n========== 深度分析首页 ==========');
  const html = await fetchPage(BASE_URL);
  if (!html) return null;

  // 保存原始HTML用于分析
  const outputDir = path.join(__dirname, '../../docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outputDir, 'home-raw.html'), html, 'utf8');
  console.log('首页原始HTML已保存');

  const $ = cheerio.load(html);
  const structure = {
    // 页面基础信息
    title: $('title').text().trim(),
    metaDescription: $('meta[name="description"]').attr('content'),
    metaKeywords: $('meta[name="keywords"]').attr('content'),

    // 头部结构
    header: {},

    // 导航结构
    navigation: {
      mainNav: [],
      subNav: []
    },

    // 搜索框
    searchForm: {},

    // 首页轮播/推荐
    banner: {},

    // 内容区块
    contentSections: [],

    // 侧边栏
    sidebar: {},

    // 页脚
    footer: {},

    // 统计信息
    stats: {}
  };

  // ========== 分析导航 ==========
  console.log('分析导航结构...');

  // 查找主导航容器
  const navSelectors = [
    'nav', '.navbar', '.header-nav', '.main-nav',
    '.nav-container', '#nav', '#navigation'
  ];

  for (const selector of navSelectors) {
    const navEl = $(selector).first();
    if (navEl.length) {
      structure.header.navTag = selector;
      structure.header.navClass = navEl.attr('class');
      structure.header.navId = navEl.attr('id');
      break;
    }
  }

  // 查找所有导航链接
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();

    // 过滤出分类导航链接
    if (href && text && (
      href === '/' ||
      href.startsWith('/movie') ||
      href.startsWith('/tv') ||
      href.startsWith('/zongyi') ||
      href.startsWith('/dongman') ||
      href.startsWith('/search')
    )) {
      structure.navigation.mainNav.push({
        text: text,
        href: href,
        class: $(el).attr('class'),
        parentClass: $(el).parent().attr('class')
      });
    }
  });

  // 去重
  const navSeen = new Set();
  structure.navigation.mainNav = structure.navigation.mainNav.filter(item => {
    const key = `${item.text}-${item.href}`;
    if (navSeen.has(key)) return false;
    navSeen.add(key);
    return true;
  });

  // ========== 分析搜索框 ==========
  console.log('分析搜索表单...');

  $('form').each((i, el) => {
    const action = $(el).attr('action') || '';
    if (action.includes('search') || $(el).find('input[name="wd"]').length) {
      structure.searchForm = {
        action: action,
        method: $(el).attr('method') || 'GET',
        inputs: []
      };

      $(el).find('input, button').each((j, input) => {
        structure.searchForm.inputs.push({
          type: $(input).attr('type'),
          name: $(input).attr('name'),
          placeholder: $(input).attr('placeholder'),
          class: $(input).attr('class')
        });
      });
    }
  });

  // ========== 分析内容区块 ==========
  console.log('分析内容区块...');

  // 查找主要内容区域的容器
  const containerSelectors = [
    '.container', '.main-content', '.content',
    '#content', '.wrapper', '.section'
  ];

  // 分析带有标题的区块
  $('h2, h3, .title, .section-title, .block-title').each((i, el) => {
    const titleText = $(el).text().trim();
    if (!titleText || titleText.length > 50) return;

    const parent = $(el).closest('.container, .section, .block, .module, div[class]');
    if (!parent.length) return;

    const section = {
      title: titleText,
      containerClass: parent.attr('class'),
      containerId: parent.attr('id'),
      items: []
    };

    // 查找区块内的视频卡片
    parent.find('a[href*="/movie/"], a[href*="/tv/"], a[href*="/zongyi/"], a[href*="/dongman/"]').each((j, link) => {
      const href = $(link).attr('href');
      const text = $(link).text().trim();
      const img = $(link).find('img').attr('src') || $(link).parent().find('img').attr('src');

      if (text && href) {
        section.items.push({
          title: text,
          href: href,
          img: img,
          class: $(link).attr('class')
        });
      }
    });

    // 去重
    const itemSeen = new Set();
    section.items = section.items.filter(item => {
      if (itemSeen.has(item.href)) return false;
      itemSeen.add(item.href);
      return true;
    });

    if (section.items.length > 0) {
      structure.contentSections.push(section);
    }
  });

  // ========== 分析视频卡片结构 ==========
  console.log('分析视频卡片结构...');

  // 查找典型的视频卡片元素
  const cardSelectors = [
    '.video-card', '.movie-card', '.item', '.card',
    '.video-item', '.movie-item', '.list-item'
  ];

  for (const selector of cardSelectors) {
    const cards = $(selector);
    if (cards.length > 2) {
      structure.videoCardSample = {
        selector: selector,
        count: cards.length,
        firstCard: {
          outerHTML: cards.first().prop('outerHTML')?.substring(0, 500),
          class: cards.first().attr('class'),
          children: []
        }
      };

      // 分析第一个卡片的子元素
      cards.first().children().each((i, child) => {
        structure.videoCardSample.firstCard.children.push({
          tag: child.tagName,
          class: $(child).attr('class'),
          text: $(child).text().trim().substring(0, 100)
        });
      });

      break;
    }
  }

  // ========== 分析页脚 ==========
  console.log('分析页脚...');

  const footerEl = $('footer, .footer, #footer').first();
  if (footerEl.length) {
    structure.footer = {
      tag: footerEl.prop('tagName'),
      class: footerEl.attr('class'),
      id: footerEl.attr('id'),
      links: [],
      text: footerEl.text().trim().substring(0, 500)
    };

    footerEl.find('a').each((i, link) => {
      structure.footer.links.push({
        text: $(link).text().trim(),
        href: $(link).attr('href')
      });
    });
  }

  return structure;
}

/**
 * 深度分析分类列表页
 */
async function deepAnalyzeCategory() {
  console.log('\n========== 深度分析分类列表页 ==========');

  // 尝试不同的URL模式
  const categoryUrls = [
    { url: '/movie', name: '电影' },
    { url: '/tv', name: '电视剧' },
    { url: '/zongyi', name: '综艺' },
    { url: '/dongman', name: '动漫' },
    { url: '/movie/dongzuo', name: '动作电影' },
    { url: '/tv/guochan', name: '国产剧' }
  ];

  const results = [];

  for (const cat of categoryUrls) {
    const url = `${BASE_URL}${cat.url}`;
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);
    const structure = {
      name: cat.name,
      url: cat.url,
      title: $('title').text().trim(),

      // 筛选条件
      filters: [],

      // 视频列表
      videoList: {
        containerClass: '',
        itemClass: '',
        items: []
      },

      // 分页
      pagination: {},

      // 页面布局
      layout: {
        hasSidebar: false,
        sidebarClass: '',
        contentClass: ''
      }
    };

    // 分析筛选条件
    console.log(`分析 ${cat.name} 筛选条件...`);

    // 常见的筛选容器选择器
    const filterSelectors = [
      '.filter', '.screen', '.condition', '.筛选',
      '.type-filter', '.category-filter', '.search-filter'
    ];

    for (const selector of filterSelectors) {
      const filterEl = $(selector);
      if (filterEl.length) {
        filterEl.each((i, el) => {
          const filter = {
            name: $(el).find('.label, .name, .title, h3, h4').first().text().trim(),
            options: []
          };

          $(el).find('a, option, .item, span').each((j, opt) => {
            const text = $(opt).text().trim();
            const href = $(opt).attr('href') || $(opt).attr('value');
            if (text && text.length < 20) {
              filter.options.push({
                text: text,
                href: href,
                isActive: $(opt).hasClass('active') || $(opt).hasClass('selected')
              });
            }
          });

          if (filter.options.length > 0) {
            structure.filters.push(filter);
          }
        });
        break;
      }
    }

    // 如果没找到筛选器，尝试查找包含分类链接的区域
    if (structure.filters.length === 0) {
      $('div, section').each((i, el) => {
        const links = $(el).find('a');
        if (links.length >= 3 && links.length <= 20) {
          let allLinksValid = true;
          links.each((j, link) => {
            const href = $(link).attr('href') || '';
            if (!href.startsWith(cat.url) && !href.startsWith('/')) {
              allLinksValid = false;
            }
          });

          if (allLinksValid) {
            const filter = {
              name: '分类',
              options: []
            };
            links.each((j, link) => {
              filter.options.push({
                text: $(link).text().trim(),
                href: $(link).attr('href'),
                isActive: $(link).hasClass('active')
              });
            });
            if (filter.options.length > 0) {
              structure.filters.push(filter);
            }
          }
        }
      });
    }

    // 分析视频列表
    console.log(`分析 ${cat.name} 视频列表...`);

    // 查找视频列表容器
    const listSelectors = [
      '.video-list', '.movie-list', '.list', '.grid',
      '.content-list', '.main-list', '#list'
    ];

    for (const selector of listSelectors) {
      const listEl = $(selector);
      if (listEl.length && listEl.find('a').length > 3) {
        structure.videoList.containerClass = listEl.attr('class');

        // 查找单个视频项的通用选择器
        const itemSelectors = ['.item', '.card', '.video-item', '.movie-item', 'li', 'article'];
        for (const itemSelector of itemSelectors) {
          const items = listEl.find(itemSelector);
          if (items.length > 0) {
            structure.videoList.itemClass = items.first().attr('class');

            items.each((i, item) => {
              const link = $(item).find('a').first();
              const img = $(item).find('img').first();
              const title = $(item).find('.title, .name, h3, h4, h5').first();

              structure.videoList.items.push({
                title: title.text().trim() || link.text().trim(),
                href: link.attr('href'),
                img: img.attr('src') || img.attr('data-src'),
                class: $(item).attr('class')
              });
            });
            break;
          }
        }
        break;
      }
    }

    // 分析分页
    console.log(`分析 ${cat.name} 分页...`);

    const paginationSelectors = [
      '.pagination', '.pager', '.page', '.page-nav',
      '#pagination', '.pagelink'
    ];

    for (const selector of paginationSelectors) {
      const pagEl = $(selector);
      if (pagEl.length) {
        structure.pagination = {
          selector: selector,
          class: pagEl.attr('class'),
          currentPage: pagEl.find('.active, .current, [aria-current]').text().trim(),
          links: []
        };

        pagEl.find('a, button, li').each((i, el) => {
          const text = $(el).text().trim();
          const href = $(el).attr('href');
          if (text && text.length < 10) {
            structure.pagination.links.push({
              text: text,
              href: href,
              isActive: $(el).hasClass('active') || $(el).hasClass('current')
            });
          }
        });
        break;
      }
    }

    // 保存单个分类页HTML
    const filename = `category-${cat.url.replace(/\//g, '-')}.html`;
    fs.writeFileSync(path.join(__dirname, '../../docs', filename), html, 'utf8');

    results.push(structure);

    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * 深度分析搜索结果页
 */
async function deepAnalyzeSearch() {
  console.log('\n========== 深度分析搜索结果页 ==========');

  // 使用实际存在的关键词进行搜索测试
  const searchKeywords = ['火遮眼', '电影', '电视剧'];
  const results = [];

  for (const keyword of searchKeywords) {
    const url = `${BASE_URL}/search?wd=${encodeURIComponent(keyword)}`;
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);
    const structure = {
      keyword: keyword,
      url: url,
      title: $('title').text().trim(),

      // 搜索表单
      searchForm: {},

      // 搜索结果
      results: {
        containerClass: '',
        itemClass: '',
        items: []
      },

      // 分页
      pagination: {},

      // 相关推荐
      recommendations: []
    };

    // 分析搜索表单
    $('form').each((i, el) => {
      const action = $(el).attr('action') || '';
      if (action.includes('search') || $(el).find('input[name="wd"]').length) {
        structure.searchForm = {
          action: action,
          method: $(el).attr('method'),
          inputName: 'wd',
          inputClass: $(el).find('input[name="wd"]').attr('class'),
          buttonClass: $(el).find('button[type="submit"]').attr('class')
        };
      }
    });

    // 分析搜索结果列表
    console.log(`分析搜索 "${keyword}" 的结果...`);

    const resultSelectors = [
      '.search-result', '.result-list', '.video-list',
      '.movie-list', '.list', '.content'
    ];

    for (const selector of resultSelectors) {
      const resultEl = $(selector);
      if (resultEl.length && resultEl.find('a').length > 0) {
        structure.results.containerClass = resultEl.attr('class');

        // 查找结果项
        const itemSelectors = ['.item', '.result-item', '.card', 'li', 'article'];
        for (const itemSelector of itemSelectors) {
          const items = resultEl.find(itemSelector);
          if (items.length > 0) {
            structure.results.itemClass = items.first().attr('class');

            items.each((i, item) => {
              const link = $(item).find('a').first();
              const img = $(item).find('img').first();
              const title = $(item).find('.title, .name, h3, h4, h5').first();
              const info = $(item).find('.info, .meta, .desc, .content').first();

              structure.results.items.push({
                title: title.text().trim() || link.text().trim(),
                href: link.attr('href'),
                img: img.attr('src') || img.attr('data-src'),
                info: info.text().trim().substring(0, 200)
              });
            });
            break;
          }
        }
        break;
      }
    }

    // 分析分页
    const paginationEl = $('.pagination, .pager, .page').first();
    if (paginationEl.length) {
      structure.pagination = {
        class: paginationEl.attr('class'),
        links: []
      };

      paginationEl.find('a').each((i, el) => {
        structure.pagination.links.push({
          text: $(el).text().trim(),
          href: $(el).attr('href')
        });
      });
    }

    // 保存搜索结果页HTML
    const filename = `search-${keyword}.html`;
    fs.writeFileSync(path.join(__dirname, '../../docs', filename), html, 'utf8');

    results.push(structure);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * 深度分析详情页
 */
async function deepAnalyzeDetail() {
  console.log('\n========== 深度分析详情页 ==========');

  // 从首页获取一些详情页链接
  const homeHtml = await fetchPage(BASE_URL);
  if (!homeHtml) return null;

  const $ = cheerio.load(homeHtml);
  const detailLinks = [];

  // 收集详情页链接
  $('a[href*="/movie/"], a[href*="/tv/"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href && !detailLinks.includes(href)) {
      detailLinks.push(href);
    }
  });

  console.log(`找到 ${detailLinks.length} 个详情页链接`);

  // 取前3个进行详细分析
  const linksToAnalyze = detailLinks.slice(0, 3);
  const results = [];

  for (const link of linksToAnalyze) {
    const url = link.startsWith('http') ? link : `${BASE_URL}${link}`;
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);
    const structure = {
      url: url,
      title: $('title').text().trim(),

      // 视频基本信息
      videoInfo: {
        title: '',
        cover: '',
        year: '',
        type: '',
        region: '',
        actors: '',
        director: '',
        description: ''
      },

      // 播放源列表
      playSources: [],

      // 剧集列表
      episodes: [],

      // 相关推荐
      related: [],

      // 页面布局
      layout: {
        mainClass: '',
        sidebarClass: ''
      }
    };

    // 分析视频信息
    console.log(`分析详情页: ${url}`);

    // 查找视频标题
    const titleSelectors = [
      'h1', '.video-title', '.movie-title', '.title',
      '.detail-title', '.info-title'
    ];
    for (const selector of titleSelectors) {
      const titleEl = $(selector).first();
      if (titleEl.length && titleEl.text().trim()) {
        structure.videoInfo.title = titleEl.text().trim();
        break;
      }
    }

    // 查找封面图
    const coverSelectors = [
      '.video-cover img', '.movie-cover img', '.cover img',
      '.poster img', '.detail-img img', '.thumb img'
    ];
    for (const selector of coverSelectors) {
      const imgEl = $(selector).first();
      if (imgEl.length) {
        structure.videoInfo.cover = imgEl.attr('src') || imgEl.attr('data-src');
        break;
      }
    }

    // 查找视频详情信息
    const infoSelectors = [
      '.video-info', '.movie-info', '.detail-info',
      '.info', '.meta', '.detail-meta'
    ];
    for (const selector of infoSelectors) {
      const infoEl = $(selector).first();
      if (infoEl.length) {
        // 提取各类信息
        const infoText = infoEl.text();

        // 年份
        const yearMatch = infoText.match(/(\d{4})/);
        if (yearMatch) structure.videoInfo.year = yearMatch[1];

        // 导演
        const directorMatch = infoText.match(/导演[：:]\s*([^\n]+)/);
        if (directorMatch) structure.videoInfo.director = directorMatch[1].trim();

        // 主演
        const actorMatch = infoText.match(/主演[：:]\s*([^\n]+)/);
        if (actorMatch) structure.videoInfo.actors = actorMatch[1].trim();

        // 类型
        const typeMatch = infoText.match(/类型[：:]\s*([^\n]+)/);
        if (typeMatch) structure.videoInfo.type = typeMatch[1].trim();

        // 地区
        const regionMatch = infoText.match(/地区[：:]\s*([^\n]+)/);
        if (regionMatch) structure.videoInfo.region = regionMatch[1].trim();

        break;
      }
    }

    // 查找简介
    const descSelectors = [
      '.video-desc', '.movie-desc', '.description',
      '.intro', '.summary', '.detail-desc'
    ];
    for (const selector of descSelectors) {
      const descEl = $(selector).first();
      if (descEl.length) {
        structure.videoInfo.description = descEl.text().trim().substring(0, 500);
        break;
      }
    }

    // 分析播放源
    console.log('分析播放源...');

    const sourceSelectors = [
      '.play-source', '.source-list', '.play-list',
      '.tabs', '.source-tabs', '.play-from'
    ];
    for (const selector of sourceSelectors) {
      const sourceEl = $(selector);
      if (sourceEl.length) {
        sourceEl.find('a, .tab, .source-item').each((i, el) => {
          structure.playSources.push({
            name: $(el).text().trim(),
            href: $(el).attr('href') || $(el).attr('data-href'),
            class: $(el).attr('class'),
            isActive: $(el).hasClass('active')
          });
        });
        break;
      }
    }

    // 分析剧集列表
    console.log('分析剧集列表...');

    const episodeSelectors = [
      '.episode-list', '.playlist', '.episode',
      '.play-list', '#playlist', '.series-list'
    ];
    for (const selector of episodeSelectors) {
      const episodeEl = $(selector);
      if (episodeEl.length) {
        episodeEl.find('a, .episode-item, li').each((i, el) => {
          const text = $(el).text().trim();
          const href = $(el).attr('href') || $(el).attr('data-href');
          if (text && text.length < 20) {
            structure.episodes.push({
              name: text,
              href: href,
              class: $(el).attr('class'),
              isActive: $(el).hasClass('active')
            });
          }
        });
        break;
      }
    }

    // 分析相关推荐
    console.log('分析相关推荐...');

    const relatedSelectors = [
      '.related', '.recommend', '.similar',
      '.guess-like', '.related-video'
    ];
    for (const selector of relatedSelectors) {
      const relatedEl = $(selector);
      if (relatedEl.length) {
        relatedEl.find('a[href*="/movie/"], a[href*="/tv/"]').each((i, el) => {
          const href = $(el).attr('href');
          const text = $(el).text().trim();
          const img = $(el).find('img').attr('src') || $(el).parent().find('img').attr('src');

          if (text && href) {
            structure.related.push({
              title: text,
              href: href,
              img: img
            });
          }
        });
        break;
      }
    }

    // 保存详情页HTML
    const filename = `detail-${link.replace(/\//g, '-')}.html`;
    fs.writeFileSync(path.join(__dirname, '../../docs', filename), html, 'utf8');

    results.push(structure);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * 深度分析播放页
 */
async function deepAnalyzePlayer() {
  console.log('\n========== 深度分析播放页 ==========');

  // 先获取详情页，找到播放链接
  const detailResults = await deepAnalyzeDetail();
  if (!detailResults || detailResults.length === 0) return null;

  const results = [];

  for (const detail of detailResults) {
    if (!detail.episodes || detail.episodes.length === 0) continue;

    // 取第一个播放链接
    const firstEpisode = detail.episodes[0];
    const playUrl = firstEpisode.href?.startsWith('http')
      ? firstEpisode.href
      : `${BASE_URL}${firstEpisode.href}`;

    if (!playUrl || playUrl === BASE_URL) continue;

    const html = await fetchPage(playUrl);
    if (!html) continue;

    const $ = cheerio.load(html);
    const structure = {
      url: playUrl,
      title: $('title').text().trim(),

      // 播放器信息
      player: {
        containerClass: '',
        containerId: '',
        iframeSrc: '',
        videoSrc: '',
        playerType: '' // iframe 或 video
      },

      // 剧集切换
      episodeSwitch: [],

      // 播放源切换
      sourceSwitch: [],

      // 视频信息
      videoInfo: {}
    };

    // 分析播放器
    console.log(`分析播放页: ${playUrl}`);

    // 查找iframe播放器
    const iframe = $('iframe').first();
    if (iframe.length) {
      structure.player.playerType = 'iframe';
      structure.player.iframeSrc = iframe.attr('src');
      structure.player.containerClass = iframe.attr('class') || iframe.parent().attr('class');
      structure.player.containerId = iframe.attr('id') || iframe.parent().attr('id');
    }

    // 查找video标签播放器
    const video = $('video').first();
    if (video.length) {
      structure.player.playerType = 'video';
      structure.player.videoSrc = video.attr('src') || video.find('source').attr('src');
      structure.player.containerClass = video.attr('class') || video.parent().attr('class');
      structure.player.containerId = video.attr('id') || video.parent().attr('id');
    }

    // 查找播放器容器
    const playerContainers = [
      '.player', '#player', '.video-player',
      '.play-container', '#video', '.dplayer'
    ];
    for (const selector of playerContainers) {
      const playerEl = $(selector).first();
      if (playerEl.length) {
        structure.player.containerClass = playerEl.attr('class');
        structure.player.containerId = playerEl.attr('id');
        break;
      }
    }

    // 分析剧集切换
    const episodeSelectors = [
      '.episode-list', '.playlist', '.episode',
      '.play-list', '#playlist'
    ];
    for (const selector of episodeSelectors) {
      const episodeEl = $(selector);
      if (episodeEl.length) {
        episodeEl.find('a, li').each((i, el) => {
          structure.episodeSwitch.push({
            name: $(el).text().trim(),
            href: $(el).attr('href') || $(el).attr('data-href'),
            isActive: $(el).hasClass('active')
          });
        });
        break;
      }
    }

    // 分析播放源切换
    const sourceSelectors = [
      '.source-list', '.play-source', '.source-tabs',
      '.play-from', '.tabs'
    ];
    for (const selector of sourceSelectors) {
      const sourceEl = $(selector);
      if (sourceEl.length) {
        sourceEl.find('a, .tab').each((i, el) => {
          structure.sourceSwitch.push({
            name: $(el).text().trim(),
            href: $(el).attr('href') || $(el).attr('data-href'),
            isActive: $(el).hasClass('active')
          });
        });
        break;
      }
    }

    // 保存播放页HTML
    const filename = `player-${playUrl.replace(/[\/\?]/g, '-')}.html`;
    fs.writeFileSync(path.join(__dirname, '../../docs', filename), html, 'utf8');

    results.push(structure);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * 生成完整的页面架构文档
 */
async function generateFullArchitecture() {
  console.log('\n========================================');
  console.log('开始深度分析目标站点完整页面架构');
  console.log('========================================\n');

  const outputDir = path.join(__dirname, '../../docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const architecture = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    siteName: '饭搭子影视',
    pages: {}
  };

  // 1. 深度分析首页
  architecture.pages.home = await deepAnalyzeHome();

  // 2. 深度分析分类页
  architecture.pages.category = await deepAnalyzeCategory();

  // 3. 深度分析搜索页
  architecture.pages.search = await deepAnalyzeSearch();

  // 4. 深度分析详情页
  architecture.pages.detail = await deepAnalyzeDetail();

  // 5. 深度分析播放页
  architecture.pages.player = await deepAnalyzePlayer();

  // 保存JSON格式
  const jsonFile = path.join(outputDir, 'full-architecture.json');
  fs.writeFileSync(jsonFile, JSON.stringify(architecture, null, 2), 'utf8');
  console.log(`\n完整架构JSON已保存: ${jsonFile}`);

  // 生成可读的Markdown文档
  const mdFile = path.join(outputDir, 'full-architecture.md');
  let md = `# 饭搭子影视 - 完整页面架构文档\n\n`;
  md += `**分析时间**: ${architecture.timestamp}\n`;
  md += `**目标站点**: ${architecture.baseUrl}\n\n`;
  md += `---\n\n`;

  // 首页结构
  if (architecture.pages.home) {
    const home = architecture.pages.home;
    md += `## 一、首页结构\n\n`;
    md += `### 1.1 页面基础信息\n`;
    md += `- **标题**: ${home.title}\n`;
    md += `- **描述**: ${home.metaDescription}\n`;
    md += `- **关键词**: ${home.metaKeywords}\n\n`;

    md += `### 1.2 导航结构\n`;
    md += `主导航链接（共${home.navigation.mainNav.length}个）:\n\n`;
    md += `| 文本 | 链接 | CSS类 |\n`;
    md += `|------|------|-------|\n`;
    home.navigation.mainNav.forEach(nav => {
      md += `| ${nav.text} | ${nav.href} | ${nav.class || '-'} |\n`;
    });
    md += `\n`;

    md += `### 1.3 搜索表单\n`;
    if (home.searchForm.action) {
      md += `- **提交地址**: ${home.searchForm.action}\n`;
      md += `- **提交方法**: ${home.searchForm.method}\n`;
      md += `- **输入字段**:\n`;
      home.searchForm.inputs.forEach(input => {
        md += `  - ${input.name || 'button'} (${input.type}): ${input.placeholder || ''}\n`;
      });
    }
    md += `\n`;

    md += `### 1.4 内容区块\n`;
    home.contentSections.forEach((section, i) => {
      md += `#### 区块${i + 1}: ${section.title}\n`;
      md += `- **容器类名**: ${section.containerClass}\n`;
      md += `- **视频数量**: ${section.items.length}\n`;
      if (section.items.length > 0) {
        md += `- **示例**:\n`;
        section.items.slice(0, 3).forEach(item => {
          md += `  - [${item.title}](${item.href})\n`;
        });
      }
      md += `\n`;
    });
  }

  // 分类页结构
  if (architecture.pages.category) {
    md += `## 二、分类列表页结构\n\n`;
    architecture.pages.category.forEach(cat => {
      md += `### 2.1 ${cat.name} (${cat.url})\n`;
      md += `- **页面标题**: ${cat.title}\n\n`;

      if (cat.filters.length > 0) {
        md += `**筛选条件**:\n`;
        cat.filters.forEach(filter => {
          md += `- ${filter.name}: `;
          md += filter.options.map(o => o.text).join(' | ');
          md += `\n`;
        });
        md += `\n`;
      }

      md += `**视频列表**:\n`;
      md += `- 容器类名: ${cat.videoList.containerClass}\n`;
      md += `- 列表项类名: ${cat.videoList.itemClass}\n`;
      md += `- 视频数量: ${cat.videoList.items.length}\n\n`;

      if (cat.pagination && cat.pagination.links) {
        md += `**分页**:\n`;
        md += `- 当前页: ${cat.pagination.currentPage}\n`;
        md += `- 分页链接数: ${cat.pagination.links.length}\n\n`;
      }
    });
  }

  // 搜索页结构
  if (architecture.pages.search) {
    md += `## 三、搜索结果页结构\n\n`;
    architecture.pages.search.forEach(search => {
      md += `### 3.1 搜索"${search.keyword}"\n`;
      md += `- **页面标题**: ${search.title}\n\n`;

      if (search.searchForm.action) {
        md += `**搜索表单**:\n`;
        md += `- 提交地址: ${search.searchForm.action}\n`;
        md += `- 提交方法: ${search.searchForm.method}\n`;
        md += `- 输入框类名: ${search.searchForm.inputClass}\n\n`;
      }

      md += `**搜索结果**:\n`;
      md += `- 容器类名: ${search.results.containerClass}\n`;
      md += `- 结果项类名: ${search.results.itemClass}\n`;
      md += `- 结果数量: ${search.results.items.length}\n\n`;

      if (search.results.items.length > 0) {
        md += `**结果示例**:\n`;
        search.results.items.slice(0, 3).forEach((item, i) => {
          md += `${i + 1}. ${item.title}\n`;
          md += `   - 链接: ${item.href}\n`;
        });
        md += `\n`;
      }
    });
  }

  // 详情页结构
  if (architecture.pages.detail) {
    md += `## 四、详情页结构\n\n`;
    architecture.pages.detail.forEach((detail, i) => {
      md += `### 4.${i + 1} ${detail.videoInfo.title || detail.url}\n`;
      md += `- **页面标题**: ${detail.title}\n\n`;

      md += `**视频信息**:\n`;
      md += `- 标题: ${detail.videoInfo.title}\n`;
      md += `- 封面: ${detail.videoInfo.cover}\n`;
      md += `- 年份: ${detail.videoInfo.year}\n`;
      md += `- 类型: ${detail.videoInfo.type}\n`;
      md += `- 地区: ${detail.videoInfo.region}\n`;
      md += `- 导演: ${detail.videoInfo.director}\n`;
      md += `- 主演: ${detail.videoInfo.actors}\n\n`;

      if (detail.playSources.length > 0) {
        md += `**播放源** (${detail.playSources.length}个):\n`;
        detail.playSources.forEach(source => {
          md += `- ${source.name} ${source.isActive ? '(当前)' : ''}\n`;
        });
        md += `\n`;
      }

      if (detail.episodes.length > 0) {
        md += `**剧集列表** (${detail.episodes.length}集):\n`;
        detail.episodes.slice(0, 5).forEach(ep => {
          md += `- ${ep.name}\n`;
        });
        if (detail.episodes.length > 5) {
          md += `- ... 共${detail.episodes.length}集\n`;
        }
        md += `\n`;
      }
    });
  }

  // 播放页结构
  if (architecture.pages.player) {
    md += `## 五、播放页结构\n\n`;
    architecture.pages.player.forEach((player, i) => {
      md += `### 5.${i + 1} ${player.title}\n`;
      md += `- **页面URL**: ${player.url}\n\n`;

      md += `**播放器信息**:\n`;
      md += `- 播放器类型: ${player.player.playerType}\n`;
      md += `- 容器类名: ${player.player.containerClass}\n`;
      md += `- 容器ID: ${player.player.containerId}\n`;
      if (player.player.iframeSrc) {
        md += `- iframe地址: ${player.player.iframeSrc}\n`;
      }
      if (player.player.videoSrc) {
        md += `- 视频地址: ${player.player.videoSrc}\n`;
      }
      md += `\n`;

      if (player.episodeSwitch.length > 0) {
        md += `**剧集切换** (${player.episodeSwitch.length}集)\n\n`;
      }

      if (player.sourceSwitch.length > 0) {
        md += `**播放源切换** (${player.sourceSwitch.length}个)\n\n`;
      }
    });
  }

  fs.writeFileSync(mdFile, md, 'utf8');
  console.log(`完整架构Markdown已保存: ${mdFile}`);

  // 生成开发指南
  const devGuideFile = path.join(outputDir, 'dev-guide.md');
  let devGuide = `# 开发指南 - 基于页面架构分析\n\n`;
  devGuide += `## 一、URL路由映射\n\n`;
  devGuide += `| 页面类型 | URL模式 | 示例 |\n`;
  devGuide += `|----------|----------|------|\n`;
  devGuide += `| 首页 | / | / |\n`;
  devGuide += `| 电影列表 | /movie | /movie |\n`;
  devGuide += `| 电影分类 | /movie/:type | /movie/dongzuo |\n`;
  devGuide += `| 电视剧列表 | /tv | /tv |\n`;
  devGuide += `| 电视剧分类 | /tv/:type | /tv/guochan |\n`;
  devGuide += `| 综艺列表 | /zongyi | /zongyi |\n`;
  devGuide += `| 动漫列表 | /dongman | /dongman |\n`;
  devGuide += `| 搜索 | /search?wd=关键词 | /search?wd=火遮眼 |\n`;
  devGuide += `| 详情页 | /:type/:id | /movie/huo-zhe-yan-2025 |\n`;
  devGuide += `| 播放页 | /play/:type/:id | /play/movie/huo-zhe-yan-2025 |\n\n`;

  devGuide += `## 二、爬虫接口设计\n\n`;
  devGuide += `### 2.1 首页数据\n`;
  devGuide += `GET ${BASE_URL}\n`;
  devGuide += `- 解析导航菜单\n`;
  devGuide += `解析各区块视频列表\n\n`;

  devGuide += `### 2.2 分类列表\n`;
  devGuide += `GET ${BASE_URL}/movie?type=dongzuo&page=1\n`;
  devGuide += `- 解析筛选条件\n`;
  devGuide += `- 解析视频列表\n`;
  devGuide += `- 解析分页信息\n\n`;

  devGuide += `### 2.3 搜索\n`;
  devGuide += `GET ${BASE_URL}/search?wd=关键词&page=1\n`;
  devGuide += `- 解析搜索结果列表\n\n`;

  devGuide += `### 2.4 详情页\n`;
  devGuide += `GET ${BASE_URL}/movie/huo-zhe-yan-2025\n`;
  devGuide += `- 解析视频信息\n`;
  devGuide += `- 解析播放源列表\n`;
  devGuide += `- 解析剧集列表\n\n`;

  devGuide += `### 2.5 播放页\n`;
  devGuide += `GET 播放页URL\n`;
  devGuide += `- 解析播放器地址（iframe src 或 video src）\n\n`;

  devGuide += `## 三、CSS类名对照\n\n`;
  devGuide += `| 元素 | 目标站类名 | 我们的类名 |\n`;
  devGuide += `|------|-----------|------------|\n`;

  if (architecture.pages.home?.videoCardSample) {
    devGuide += `| 视频卡片 | ${architecture.pages.home.videoCardSample.selector} | .video-card |\n`;
  }

  fs.writeFileSync(devGuideFile, devGuide, 'utf8');
  console.log(`开发指南已保存: ${devGuideFile}`);

  return architecture;
}

// 主函数
async function main() {
  try {
    await generateFullArchitecture();
    console.log('\n========================================');
    console.log('深度分析完成！');
    console.log('========================================');
    console.log('\n生成的文件:');
    console.log('1. docs/full-architecture.json - 完整架构JSON');
    console.log('2. docs/full-architecture.md - 可读架构文档');
    console.log('3. docs/dev-guide.md - 开发指南');
    console.log('4. docs/*.html - 各页面原始HTML');
  } catch (error) {
    console.error('分析过程中发生错误:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  deepAnalyzeHome,
  deepAnalyzeCategory,
  deepAnalyzeSearch,
  deepAnalyzeDetail,
  deepAnalyzePlayer,
  generateFullArchitecture
};