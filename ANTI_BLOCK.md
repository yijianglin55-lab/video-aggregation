# 反封禁配置指南

## 🛡️ 已内置的反封禁措施

### 1. UA（User-Agent）轮换
- 内置 15+ 真实浏览器 UA
- 每次请求随机选择 UA
- 覆盖 Chrome、Firefox、Safari、Edge 等主流浏览器

### 2. 请求头伪装
- 完整的浏览器请求头
- 随机 Referer（来自搜索引擎）
- 包含 Sec-Ch-Ua、Sec-Fetch-* 等安全头

### 3. 请求间隔控制
- 随机间隔：800ms - 2000ms
- 避免固定频率请求
- 被限流时自动增加等待时间

### 4. 重试机制
- 最多重试 3 次
- 每次重试增加等待时间
- 403/429 错误时加倍等待

### 5. 并发控制
- 默认最多 3 个并发请求
- 请求队列管理
- 防止瞬间大量请求

---

## 🔧 代理IP配置

### 方式一：环境变量配置

在 `.env` 文件中添加：

```env
# 启用代理
PROXY_ENABLED=true

# 代理列表（多个用逗号分隔）
PROXY_LIST=127.0.0.1:7890,proxy1.com:8080,proxy2.com:8080

# 或者单独配置
PROXY_HOST=proxy.example.com
PROXY_PORT=8080
PROXY_USERNAME=username
PROXY_PASSWORD=password
```

### 方式二：代码配置

在 `src/config/proxy.js` 中添加静态代理：

```javascript
const STATIC_PROXIES = [
  { host: '127.0.0.1', port: 7890 },
  { host: 'proxy1.example.com', port: 8080, username: 'user', password: 'pass' },
];
```

### 方式三：API动态获取

支持从代理服务商API获取代理：
- 快代理
- 芝麻代理
- 讯代理

---

## 📋 推荐代理服务商

### 国内代理
| 服务商 | 价格 | 特点 |
|--------|------|------|
| [快代理](https://www.kuaidaili.com/) | ¥15/天起 | 稳定、速度快 |
| [芝麻代理](https://zhimaruanjian.com/) | ¥10/天起 | 价格便宜 |
| [讯代理](https://www.xdaili.cn/) | ¥12/天起 | 高匿代理 |

### 免费代理（不推荐用于生产）
- 免费代理不稳定
- 速度慢
- 可能已被封禁

---

## 🚀 Railway 部署时配置代理

### 1. 在 Railway Dashboard 添加环境变量

```
PROXY_ENABLED=true
PROXY_LIST=proxy1.com:8080:user:pass,proxy2.com:8080:user:pass
```

### 2. 使用 Railway 的私有网络

如果代理服务器在同一内网，可以使用内网地址，速度更快。

---

## ⚠️ 注意事项

1. **代理质量很重要**：使用高质量、稳定的代理
2. **定期更换代理**：避免单个代理被封
3. **监控请求频率**：不要过于频繁请求
4. **遵守robots.txt**：尊重目标站点规则

---

## 📊 反封禁效果

| 措施 | 效果 |
|------|------|
| UA轮换 | ⭐⭐⭐⭐ 防止UA检测 |
| 请求头伪装 | ⭐⭐⭐⭐ 模拟真实浏览器 |
| 请求间隔 | ⭐⭐⭐⭐⭐ 防止频率检测 |
| 代理IP | ⭐⭐⭐⭐⭐ 防止IP封禁 |
| 重试机制 | ⭐⭐⭐ 应对临时限流 |

---

## 🔍 测试反封禁效果

```bash
# 测试爬虫是否正常工作
node -e "
const HomeCrawler = require('./src/crawlers/homeCrawler');
HomeCrawler.getHomeData().then(data => {
  console.log('首页数据获取成功');
  console.log('热门电影:', data.hotMovies.length, '个');
}).catch(err => console.error('获取失败:', err));
```