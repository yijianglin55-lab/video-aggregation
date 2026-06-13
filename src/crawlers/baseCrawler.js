/**
 * 爬虫基础模块
 * 封装公共请求工具，统一超时、重试、异常处理
 * 包含反封禁措施：UA轮换、请求间隔、代理支持
 */

const axios = require('axios');
const cheerio = require('cheerio');

// ========== UA随机池（真实浏览器UA）==========
const USER_AGENTS = [
  // Chrome Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  // Chrome Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  // Firefox Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  // Firefox Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Safari Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  // Edge Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  // Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

// ========== Referer池 ==========
const REFERERS = [
  'https://www.google.com/',
  'https://www.baidu.com/',
  'https://www.bing.com/',
  'https://www.sogou.com/',
  'https://www.so.com/',
  'https://www.yahoo.com/',
  'https://duckduckgo.com/'
];

// ========== 爬虫配置 ==========
const config = {
  baseURL: 'https://fdzys.net',
  timeout: parseInt(process.env.CRAWLER_TIMEOUT) || 15000,
  retryCount: parseInt(process.env.CRAWLER_RETRY_COUNT) || 3,
  retryDelay: parseInt(process.env.CRAWLER_RETRY_DELAY) || 1000,
  concurrentLimit: parseInt(process.env.CRAWLER_CONCURRENT_LIMIT) || 3,
  // 请求间隔范围（毫秒）- 随机化
  minInterval: 800,
  maxInterval: 2000,
  // 是否启用代理
  proxyEnabled: process.env.PROXY_ENABLED === 'true'
};

// ========== 代理池（预留接口）==========
const proxyPool = [];
let currentProxyIndex = 0;

/**
 * 获取下一个代理
 */
function getNextProxy() {
  if (proxyPool.length === 0) return null;
  const proxy = proxyPool[currentProxyIndex % proxyPool.length];
  currentProxyIndex++;
  return proxy;
}

/**
 * 添加代理到池
 */
function addProxy(host, port, username, password) {
  proxyPool.push({ host, port, username, password });
}

// ========== 请求队列管理 ==========
let requestQueue = [];
let activeRequests = 0;
let lastRequestTime = 0;

/**
 * 获取随机数
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 获取随机UA
 */
function getRandomUA() {
  return USER_AGENTS[getRandomInt(0, USER_AGENTS.length - 1)];
}

/**
 * 获取随机Referer
 */
function getRandomReferer() {
  return REFERERS[getRandomInt(0, REFERERS.length - 1)];
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机请求头
 */
function generateHeaders() {
  const ua = getRandomUA();

  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Connection': 'keep-alive',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Referer': getRandomReferer()
  };
}

/**
 * 创建axios实例
 */
function createClient() {
  const headers = generateHeaders();
  const proxyConfig = {};

  // 代理配置
  if (config.proxyEnabled) {
    const proxy = getNextProxy();
    if (proxy) {
      proxyConfig.proxy = {
        host: proxy.host,
        port: parseInt(proxy.port),
        auth: proxy.username ? {
          username: proxy.username,
          password: proxy.password
        } : undefined
      };
    }
  }

  return axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: headers,
    // 不跟随重定向
    maxRedirects: 3,
    validateStatus: function (status) {
      return status >= 200 && status < 400;
    },
    ...proxyConfig
  });
}

/**
 * 发送请求（带重试和反封禁）
 * @param {string} url - 请求URL
 * @param {object} options - 请求选项
 * @returns {Promise<string>} - HTML内容
 */
async function fetchPage(url, options = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= config.retryCount; attempt++) {
    try {
      // 请求间隔控制（随机化）
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      const requiredInterval = getRandomInt(config.minInterval, config.maxInterval);

      if (timeSinceLastRequest < requiredInterval) {
        const waitTime = requiredInterval - timeSinceLastRequest;
        console.log(`[反封禁] 等待 ${waitTime}ms`);
        await delay(waitTime);
      }

      // 每次请求使用新的UA和Referer
      const client = createClient();

      console.log(`[爬虫] 请求: ${url} (尝试 ${attempt}/${config.retryCount})`);
      const response = await client.get(url, options);

      lastRequestTime = Date.now();

      return response.data;
    } catch (error) {
      lastError = error;
      console.error(`[爬虫] 请求失败: ${url} - ${error.message}`);

      // 如果是403或429，增加等待时间
      if (error.response && (error.response.status === 403 || error.response.status === 429)) {
        const waitTime = config.retryDelay * attempt * 2;
        console.log(`[反封禁] 被限流，等待 ${waitTime}ms`);
        await delay(waitTime);
      } else if (attempt < config.retryCount) {
        await delay(config.retryDelay * attempt);
      }
    }
  }

  throw lastError;
}

/**
 * 解析HTML
 * @param {string} html - HTML内容
 * @returns {CheerioAPI} - cheerio实例
 */
function parseHTML(html) {
  return cheerio.load(html);
}

/**
 * 带限流的请求
 * @param {string} url - 请求URL
 * @returns {Promise<string>} - HTML内容
 */
async function fetchWithRateLimit(url) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ url, resolve, reject });
    processQueue();
  });
}

/**
 * 处理请求队列
 */
async function processQueue() {
  if (activeRequests >= config.concurrentLimit || requestQueue.length === 0) {
    return;
  }

  const { url, resolve, reject } = requestQueue.shift();
  activeRequests++;

  try {
    const html = await fetchPage(url);
    resolve(html);
  } catch (error) {
    reject(error);
  } finally {
    activeRequests--;
    await delay(getRandomInt(config.minInterval, config.maxInterval));
    processQueue();
  }
}

/**
 * 设置代理池
 * @param {Array} proxies - 代理列表 [{host, port, username, password}]
 */
function setProxyPool(proxies) {
  proxyPool.length = 0;
  proxies.forEach(p => addProxy(p.host, p.port, p.username, p.password));
  config.proxyEnabled = proxies.length > 0;
}

/**
 * 清除代理池
 */
function clearProxyPool() {
  proxyPool.length = 0;
  config.proxyEnabled = false;
}

module.exports = {
  config,
  fetchPage,
  fetchWithRateLimit,
  parseHTML,
  getRandomUA,
  getRandomReferer,
  delay,
  setProxyPool,
  clearProxyPool,
  addProxy
};