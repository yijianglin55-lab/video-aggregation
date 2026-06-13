const { fetchPage, parseHTML } = require('./src/crawlers/baseCrawler');

async function test() {
  // 获取首页电影
  const html = await fetchPage('/movie/all');
  const $ = parseHTML(html);

  // 找到第一个电影
  const firstMovie = $('.myui-vodbox-content').first();
  const href = firstMovie.find('a').first().attr('href');
  const title = firstMovie.find('.card-info .title').first().text().trim();

  console.log('测试电影:', title, '-', href);

  // 获取详情页
  const detailHtml = await fetchPage(href);
  const $detail = parseHTML(detailHtml);

  // 查找播放源
  console.log('播放源:');
  $detail('.player_name, .swiper-slide.player_name').each((i, el) => {
    const name = $detail(el).text().trim();
    const sid = $detail(el).attr('data-sid');
    console.log('  -', name, 'sid:', sid);
  });
}

test().catch(err => console.error(err));