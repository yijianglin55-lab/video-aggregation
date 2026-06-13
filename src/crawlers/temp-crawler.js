/**
 * 临时爬虫脚本 - 用于阶段1：分析目标站点页面结构
 * 此脚本仅用于获取目标站点的DOM结构，生成页面架构文档
 * 阶段3将开发正式的crawler模块
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// 目标站点基础URL
const BASE_URL = 'https://fdzys.net';

// 请求头配置，模拟真实浏览器
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Referer': BASE_URL
};

// 创建axios实例
const client = axios.create({
  timeout: 10000,
  headers: headers,
  // 不跟随重定向，以便分析重定向行为
  maxRedirects: 0,
  validateStatus: function (status) {
    return status >= 200 && status < 400; // 接受2xx和3xx状态码
  }
});

/**
 * 获取页面HTML
 * @param {string} url - 页面URL
 * @returns {Promise<string>} - HTML内容
 */
async function fetchPage(url) {
  try {
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error(`获取页面失败: ${url}`, error.message);
    return null;
  }
}

/**
 * 分析首页结构
 */
async function analyzeHomePage() {
  console.log('=== 分析首页结构 ===');
  const html = await fetchPage(BASE_URL);
  if (!html) return null;

  const $ = cheerio.load(html);
  const structure = {
    title: $('title').text(),
    meta: {
      description: $('meta[name="description"]').attr('content'),
      keywords: $('meta[name="keywords"]').attr('content')
    },
    navigation: [],
    sections: [],
    footer: {}
  };

  // 分析导航栏
  $('nav, .nav, .navbar, .navigation').each((i, el) => {
    const navItems = [];
    $(el).find('a').each((j, link) => {
      navItems.push({
        text: $(link).text().trim(),
        href: $(link).attr('href'),
        class: $(link).attr('class')
      });
    });
    structure.navigation.push({
      tag: el.tagName,
      class: $(el).attr('class'),
      items: navItems
    });
  });

  // 分析主要内容区块
  $('section, .section, .content, .main, .container').each((i, el) => {
    const section = {
      tag: el.tagName,
      class: $(el).attr('class'),
      id: $(el).attr('id'),
      title: $(el).find('h1, h2, h3, h4, h5, h6').first().text().trim(),
      links: []
    };

    $(el).find('a').each((j, link) => {
      section.links.push({
        text: $(link).text().trim(),
        href: $(link).attr('href')
      });
    });

    structure.sections.push(section);
  });

  // 分析页脚
  $('footer, .footer').each((i, el) => {
    structure.footer = {
      tag: el.tagName,
      class: $(el).attr('class'),
      content: $(el).text().trim().substring(0, 500) // 限制长度
    };
  });

  return structure;
}

/**
 * 分析分类页结构
 */
async function analyzeCategoryPage() {
  console.log('=== 分析分类页结构 ===');

  // 尝试常见的分类页URL模式
  const categoryUrls = [
    '/type/movie',      // 电影分类
    '/type/tv',         // 电视剧分类
    '/type/variety',    // 综艺分类
    '/type/cartoon',    // 动漫分类
    '/list',            // 列表页
    '/category'         // 分类页
  ];

  const results = [];

  for (const urlPath of categoryUrls) {
    const url = `${BASE_URL}${urlPath}`;
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);
    const structure = {
      url: url,
      title: $('title').text(),
      filters: [],
      pagination: {},
      videoList: []
    };

    // 分析筛选条件
    $('.filter, .筛选, .condition, .screen').each((i, el) => {
      const filter = {
        name: $(el).find('.label, .name, .title').first().text().trim(),
        options: []
      };

      $(el).find('a, option, .item').each((j, opt) => {
        filter.options.push({
          text: $(opt).text().trim(),
          value: $(opt).attr('value') || $(opt).attr('href'),
          selected: $(opt).hasClass('active') || $(opt).prop('selected')
        });
      });

      structure.filters.push(filter);
    });

    // 分析分页
    $('.pagination, .page, .pager').each((i, el) => {
      structure.pagination = {
        current: $(el).find('.active, .current').text().trim(),
        total: $(el).find('a, span').last().text().trim(),
        links: []
      };

      $(el).find('a').each((j, link) => {
        structure.pagination.links.push({
          text: $(link).text().trim(),
          href: $(link).attr('href')
        });
      });
    });

    // 分析视频列表
    $('.video-item, .movie-item, .list-item, .item').each((i, el) => {
      const video = {
        title: $(el).find('.title, .name, h3, h4').first().text().trim(),
        cover: $(el).find('img').first().attr('src'),
        link: $(el).find('a').first().attr('href'),
        info: $(el).find('.info, .meta, .desc').text().trim()
      };
      structure.videoList.push(video);
    });

    results.push(structure);
  }

  return results;
}

/**
 * 分析搜索页结构
 */
async function analyzeSearchPage() {
  console.log('=== 分析搜索页结构 ===');

  const searchUrls = [
    '/search',
    '/search?q=test',
    '/search?keyword=test'
  ];

  const results = [];

  for (const urlPath of searchUrls) {
    const url = urlPath.includes('?') ? `${BASE_URL}${urlPath}` : `${BASE_URL}${urlPath}`;
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);
    const structure = {
      url: url,
      title: $('title').text(),
      searchForm: {},
      searchResults: []
    };

    // 分析搜索表单
    $('form[action*="search"], .search-form, .search-box').each((i, el) => {
      structure.searchForm = {
        action: $(el).attr('action'),
        method: $(el).attr('method'),
        inputs: []
      };

      $(el).find('input, select, textarea').each((j, input) => {
        structure.searchForm.inputs.push({
          type: $(input).attr('type'),
          name: $(input).attr('name'),
          placeholder: $(input).attr('placeholder'),
          value: $(input).attr('value')
        });
      });
    });

    // 分析搜索结果
    $('.search-result, .result-item, .video-item').each((i, el) => {
      const result = {
        title: $(el).find('.title, .name, h3, h4').first().text().trim(),
        cover: $(el).find('img').first().attr('src'),
        link: $(el).find('a').first().attr('href'),
        info: $(el).find('.info, .meta, .desc').text().trim()
      };
      structure.searchResults.push(result);
    });

    results.push(structure);
  }

  return results;
}

/**
 * 分析详情页结构
 */
async function analyzeDetailPage() {
  console.log('=== 分析详情页结构 ===');

  // 先从首页获取一些详情页链接
  const homeHtml = await fetchPage(BASE_URL);
  if (!homeHtml) return null;

  const $ = cheerio.load(homeHtml);
  const detailLinks = [];

  // 查找详情页链接（通常包含/detail/、/video/、/movie/等）
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && (
      href.includes('/detail/') ||
      href.includes('/video/') ||
      href.includes('/movie/') ||
      href.includes('/play/')
    )) {
      detailLinks.push(href);
    }
  });

  // 取前3个链接进行分析
  const results = [];
  const linksToAnalyze = detailLinks.slice(0, 3);

  for (const link of linksToAnalyze) {
    const url = link.startsWith('http') ? link : `${BASE_URL}${link}`;
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);
    const structure = {
      url: url,
      title: $('title').text(),
      videoInfo: {},
      playLinks: [],
      relatedVideos: []
    };

    // 分析视频信息
    $('.video-info, .detail-info, .movie-info').each((i, el) => {
      structure.videoInfo = {
        title: $(el).find('.title, .name, h1, h2').first().text().trim(),
        cover: $(el).find('img').first().attr('src'),
        meta: []
      };

      $(el).find('.meta-item, .info-item, .detail-item').each((j, item) => {
        structure.videoInfo.meta.push({
          label: $(item).find('.label, .name').first().text().trim(),
          value: $(item).find('.value, .info').first().text().trim()
        });
      });
    });

    // 分析播放链接
    $('.play-link, .play-list, .episode-list').each((i, el) => {
      $(el).find('a').each((j, link) => {
        structure.playLinks.push({
          text: $(link).text().trim(),
          href: $(link).attr('href'),
          active: $(el).hasClass('active')
        });
      });
    });

    // 分析相关视频
    $('.related-video, .recommend, .similar').each((i, el) => {
      $(el).find('.video-item, .item').each((j, item) => {
        structure.relatedVideos.push({
          title: $(item).find('.title, .name').first().text().trim(),
          cover: $(item).find('img').first().attr('src'),
          link: $(item).find('a').first().attr('href')
        });
      });
    });

    results.push(structure);
  }

  return results;
}

/**
 * 分析播放页结构
 */
async function analyzePlayerPage() {
  console.log('=== 分析播放页结构 ===');

  // 先从详情页获取播放链接
  const detailResults = await analyzeDetailPage();
  if (!detailResults || detailResults.length === 0) return null;

  const results = [];

  for (const detail of detailResults) {
    if (!detail.playLinks || detail.playLinks.length === 0) continue;

    // 取第一个播放链接进行分析
    const playLink = detail.playLinks[0];
    const url = playLink.href.startsWith('http') ? playLink.href : `${BASE_URL}${playLink.href}`;

    const html = await fetchPage(url);
    if (!html) continue;

    const $ = cheerio.load(html);
    const structure = {
      url: url,
      title: $('title').text(),
      player: {},
      episodes: [],
      comments: []
    };

    // 分析播放器
    $('video, .player, .video-player, #player').each((i, el) => {
      structure.player = {
        tag: el.tagName,
        class: $(el).attr('class'),
        id: $(el).attr('id'),
        src: $(el).find('source').attr('src') || $(el).attr('src'),
        attributes: {}
      };

      // 获取所有属性
      const attribs = $(el).attr();
      for (const key in attribs) {
        if (key !== 'class' && key !== 'id') {
          structure.player.attributes[key] = attribs[key];
        }
      }
    });

    // 分析剧集列表
    $('.episode-list, .playlist, .series-list').each((i, el) => {
      $(el).find('a, .episode-item').each((j, item) => {
        structure.episodes.push({
          text: $(item).text().trim(),
          href: $(item).attr('href'),
          active: $(item).hasClass('active')
        });
      });
    });

    // 分析评论区
    $('.comment-list, .comments, #comments').each((i, el) => {
      $(el).find('.comment-item, .comment').each((j, comment) => {
        structure.comments.push({
          user: $(comment).find('.user, .author').first().text().trim(),
          content: $(comment).find('.content, .text').first().text().trim(),
          time: $(comment).find('.time, .date').first().text().trim()
        });
      });
    });

    results.push(structure);
  }

  return results;
}

/**
 * 生成页面架构文档
 */
async function generateArchitectureDoc() {
  console.log('开始分析目标站点页面结构...');

  const architecture = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    pages: {}
  };

  // 分析各个页面
  architecture.pages.home = await analyzeHomePage();
  architecture.pages.category = await analyzeCategoryPage();
  architecture.pages.search = await analyzeSearchPage();
  architecture.pages.detail = await analyzeDetailPage();
  architecture.pages.player = await analyzePlayerPage();

  // 保存到文件
  const outputDir = path.join(__dirname, '../../docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'page-architecture.json');
  fs.writeFileSync(outputFile, JSON.stringify(architecture, null, 2), 'utf8');

  console.log(`页面架构文档已生成: ${outputFile}`);

  // 生成可读的文档
  const readableFile = path.join(outputDir, 'page-architecture.md');
  let markdown = `# 目标站点页面架构文档\n\n`;
  markdown += `**分析时间**: ${architecture.timestamp}\n`;
  markdown += `**目标站点**: ${architecture.baseUrl}\n\n`;

  // 首页结构
  if (architecture.pages.home) {
    markdown += `## 首页结构\n\n`;
    markdown += `**标题**: ${architecture.pages.home.title}\n\n`;

    if (architecture.pages.home.navigation.length > 0) {
      markdown += `### 导航栏\n\n`;
      architecture.pages.home.navigation.forEach((nav, i) => {
        markdown += `#### 导航栏 ${i + 1}\n`;
        markdown += `- **标签**: ${nav.tag}\n`;
        markdown += `- **样式类**: ${nav.class}\n`;
        markdown += `- **导航项**:\n`;
        nav.items.forEach(item => {
          markdown += `  - [${item.text}](${item.href})\n`;
        });
        markdown += `\n`;
      });
    }

    if (architecture.pages.home.sections.length > 0) {
      markdown += `### 内容区块\n\n`;
      architecture.pages.home.sections.forEach((section, i) => {
        markdown += `#### 区块 ${i + 1}: ${section.title || '无标题'}\n`;
        markdown += `- **标签**: ${section.tag}\n`;
        markdown += `- **样式类**: ${section.class}\n`;
        markdown += `- **ID**: ${section.id}\n`;
        if (section.links.length > 0) {
          markdown += `- **链接数量**: ${section.links.length}\n`;
        }
        markdown += `\n`;
      });
    }
  }

  // 分类页结构
  if (architecture.pages.category && architecture.pages.category.length > 0) {
    markdown += `## 分类页结构\n\n`;
    architecture.pages.category.forEach((cat, i) => {
      markdown += `### 分类页 ${i + 1}: ${cat.url}\n\n`;
      markdown += `**标题**: ${cat.title}\n\n`;

      if (cat.filters.length > 0) {
        markdown += `#### 筛选条件\n\n`;
        cat.filters.forEach(filter => {
          markdown += `**${filter.name}**:\n`;
          filter.options.forEach(opt => {
            markdown += `- ${opt.text} (${opt.value})${opt.selected ? ' ✓' : ''}\n`;
          });
          markdown += `\n`;
        });
      }

      if (cat.pagination && cat.pagination.current) {
        markdown += `#### 分页信息\n\n`;
        markdown += `- **当前页**: ${cat.pagination.current}\n`;
        markdown += `- **总页数**: ${cat.pagination.total}\n\n`;
      }

      if (cat.videoList.length > 0) {
        markdown += `#### 视频列表示例\n\n`;
        cat.videoList.slice(0, 3).forEach((video, j) => {
          markdown += `${j + 1}. **${video.title}**\n`;
          markdown += `   - 链接: ${video.link}\n`;
          markdown += `   - 封面: ${video.cover}\n\n`;
        });
      }
    });
  }

  // 搜索页结构
  if (architecture.pages.search && architecture.pages.search.length > 0) {
    markdown += `## 搜索页结构\n\n`;
    architecture.pages.search.forEach((search, i) => {
      markdown += `### 搜索页 ${i + 1}: ${search.url}\n\n`;
      markdown += `**标题**: ${search.title}\n\n`;

      if (search.searchForm && search.searchForm.action) {
        markdown += `#### 搜索表单\n\n`;
        markdown += `- **提交地址**: ${search.searchForm.action}\n`;
        markdown += `- **提交方法**: ${search.searchForm.method}\n`;
        markdown += `- **表单字段**:\n`;
        search.searchForm.inputs.forEach(input => {
          markdown += `  - ${input.name} (${input.type}): ${input.placeholder || ''}\n`;
        });
        markdown += `\n`;
      }
    });
  }

  // 详情页结构
  if (architecture.pages.detail && architecture.pages.detail.length > 0) {
    markdown += `## 详情页结构\n\n`;
    architecture.pages.detail.forEach((detail, i) => {
      markdown += `### 详情页 ${i + 1}: ${detail.url}\n\n`;
      markdown += `**标题**: ${detail.title}\n\n`;

      if (detail.videoInfo && detail.videoInfo.title) {
        markdown += `#### 视频信息\n\n`;
        markdown += `- **视频标题**: ${detail.videoInfo.title}\n`;
        markdown += `- **封面图片**: ${detail.videoInfo.cover}\n`;

        if (detail.videoInfo.meta && detail.videoInfo.meta.length > 0) {
          markdown += `- **详细信息**:\n`;
          detail.videoInfo.meta.forEach(meta => {
            markdown += `  - ${meta.label}: ${meta.value}\n`;
          });
        }
        markdown += `\n`;
      }

      if (detail.playLinks && detail.playLinks.length > 0) {
        markdown += `#### 播放链接\n\n`;
        detail.playLinks.forEach((link, j) => {
          markdown += `${j + 1}. [${link.text}](${link.href})${link.active ? ' ✓' : ''}\n`;
        });
        markdown += `\n`;
      }
    });
  }

  // 播放页结构
  if (architecture.pages.player && architecture.pages.player.length > 0) {
    markdown += `## 播放页结构\n\n`;
    architecture.pages.player.forEach((player, i) => {
      markdown += `### 播放页 ${i + 1}: ${player.url}\n\n`;
      markdown += `**标题**: ${player.title}\n\n`;

      if (player.player && player.player.tag) {
        markdown += `#### 播放器\n\n`;
        markdown += `- **标签**: ${player.player.tag}\n`;
        markdown += `- **样式类**: ${player.player.class}\n`;
        markdown += `- **ID**: ${player.player.id}\n`;
        markdown += `- **视频源**: ${player.player.src}\n`;
        markdown += `\n`;
      }

      if (player.episodes && player.episodes.length > 0) {
        markdown += `#### 剧集列表\n\n`;
        player.episodes.forEach((episode, j) => {
          markdown += `${j + 1}. [${episode.text}](${episode.href})${episode.active ? ' ✓' : ''}\n`;
        });
        markdown += `\n`;
      }
    });
  }

  fs.writeFileSync(readableFile, markdown, 'utf8');
  console.log(`可读文档已生成: ${readableFile}`);

  return architecture;
}

// 主函数
async function main() {
  try {
    await generateArchitectureDoc();
    console.log('页面结构分析完成！');
  } catch (error) {
    console.error('分析过程中发生错误:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  fetchPage,
  analyzeHomePage,
  analyzeCategoryPage,
  analyzeSearchPage,
  analyzeDetailPage,
  analyzePlayerPage,
  generateArchitectureDoc
};