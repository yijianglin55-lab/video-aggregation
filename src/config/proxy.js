/**
 * 代理IP配置
 * 用于防止爬虫被封禁IP
 */

const { setProxyPool, clearProxyPool, addProxy } = require('../crawlers/baseCrawler');

// 代理提供商配置示例
const PROXY_PROVIDERS = {
  // 快代理
  kuaidaili: {
    api: 'https://dps.kuaidaili.com/api/getdps/?orderid=xxx&num=10&sep=1',
    format: 'ip:port'
  },
  // 芝麻代理
  zhimaruanjian: {
    api: 'http://webapi.zhimaruanjian.com/api/get?num=10&type=2&neek=xxx&app=xxx&sep=1',
    format: 'ip:port'
  },
  // 讯代理
  xundaili: {
    api: 'http://api.xdaili.cn/xdaili-api//privateProxy/getOrderIp?neek=xxx&app=xxx&num=10&type=2&sep=1',
    format: 'ip:port'
  }
};

/**
 * 静态代理列表（手动配置）
 * 格式: { host, port, username?, password? }
 */
const STATIC_PROXIES = [
  // 示例代理（请替换为真实代理）
  // { host: '127.0.0.1', port: 7890 },
  // { host: 'proxy1.example.com', port: 8080, username: 'user', password: 'pass' },
];

/**
 * 初始化代理池
 */
function initProxyPool() {
  // 从环境变量读取代理配置
  const proxyEnv = process.env.PROXY_LIST;

  if (proxyEnv) {
    // 格式: host1:port1,host2:port2 或 host1:port:user:pass,host2:port:user:pass
    const proxies = proxyEnv.split(',').map(p => {
      const parts = p.trim().split(':');
      if (parts.length >= 2) {
        return {
          host: parts[0],
          port: parseInt(parts[1]),
          username: parts[2] || undefined,
          password: parts[3] || undefined
        };
      }
      return null;
    }).filter(Boolean);

    if (proxies.length > 0) {
      setProxyPool(proxies);
      console.log(`[代理] 已加载 ${proxies.length} 个代理`);
      return;
    }
  }

  // 从单独的 PROXY_HOST / PROXY_PORT 环境变量读取
  const proxyHost = process.env.PROXY_HOST;
  const proxyPort = process.env.PROXY_PORT;
  if (proxyHost && proxyPort) {
    const proxy = {
      host: proxyHost,
      port: parseInt(proxyPort),
      username: process.env.PROXY_USERNAME || undefined,
      password: process.env.PROXY_PASSWORD || undefined
    };
    setProxyPool([proxy]);
    console.log(`[代理] 已加载代理: ${proxyHost}:${proxyPort}`);
    return;
  }

  // 使用静态代理列表
  if (STATIC_PROXIES.length > 0) {
    setProxyPool(STATIC_PROXIES);
    console.log(`[代理] 已加载 ${STATIC_PROXIES.length} 个静态代理`);
    return;
  }

  console.log('[代理] 未配置代理，使用直连模式');
}

/**
 * 从API获取代理列表（示例）
 * @param {string} provider - 代理提供商名称
 * @returns {Promise<Array>} - 代理列表
 */
async function fetchProxiesFromAPI(provider) {
  // 这里可以实现代理API的调用逻辑
  // 返回格式: [{ host, port, username?, password? }]
  console.log(`[代理] 从 ${provider} 获取代理...`);

  // 示例实现
  try {
    const config = PROXY_PROVIDERS[provider];
    if (!config) {
      console.error(`[代理] 未知的代理提供商: ${provider}`);
      return [];
    }

    // const response = await axios.get(config.api);
    // 解析响应并返回代理列表
    // return parseProxyList(response.data, config.format);

    return [];
  } catch (error) {
    console.error(`[代理] 获取代理失败:`, error.message);
    return [];
  }
}

/**
 * 自动刷新代理池
 */
async function refreshProxyPool() {
  console.log('[代理] 刷新代理池...');

  // 可以从多个来源获取代理
  const allProxies = [];

  // 从API获取
  // const apiProxies = await fetchProxiesFromAPI('kuaidaili');
  // allProxies.push(...apiProxies);

  // 添加静态代理
  allProxies.push(...STATIC_PROXIES);

  if (allProxies.length > 0) {
    setProxyPool(allProxies);
    console.log(`[代理] 代理池已更新，共 ${allProxies.length} 个代理`);
  }
}

module.exports = {
  initProxyPool,
  refreshProxyPool,
  fetchProxiesFromAPI,
  STATIC_PROXIES,
  PROXY_PROVIDERS
};