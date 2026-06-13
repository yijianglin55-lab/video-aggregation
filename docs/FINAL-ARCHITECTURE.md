# 饭搭子影视 - 完整页面架构文档（最终版）

**分析时间**: 2026-06-12
**目标站点**: https://fdzys.net

---

## 一、网站基本信息

- **网站名称**: 饭搭子影视
- **标题**: 最新热门电影电视剧动漫综艺体育免费观看_高清在线播放｜饭搭子影视
- **描述**: 饭搭子影视，免费在线观看最新热门电影、电视剧、动漫、综艺与体育赛事，全网影视大全，每日热门即时更新，娱乐追剧最佳搭子。
- **关键词**: 电影,电视剧,动漫,综艺,体育直播,免费观看,高清在线播放

---

## 二、导航结构

### 2.1 主导航（PC端）
| 导航项 | URL路径 | 图标 |
|--------|---------|------|
| 首页 | `/` | icon-home |
| 电影 | `/movie` | icon-movie |
| 电视剧 | `/tv` | icon-tv |
| 动漫 | `/dongman` | icon-dongman |
| 综艺 | `/zongyi` | icon-zongyi |
| 体育 | `/tiyu` | icon-tiyu |
| 短剧 | `/duanju` | icon-duanju |

### 2.2 电影子分类
| 分类名 | URL路径 |
|--------|---------|
| 全部电影 | `/movie` |
| 动作片 | `/movie/dongzuo` |
| 喜剧片 | `/movie/xiju` |
| 爱情片 | `/movie/aiqing` |
| 科幻片 | `/movie/kehuan` |
| 恐怖片 | `/movie/kongbupian` |
| 剧情片 | `/movie/juqing` |
| 战争片 | `/movie/zhanzheng` |
| 纪录片 | `/movie/jilupian` |

### 2.3 电视剧子分类
| 分类名 | URL路径 |
|--------|---------|
| 全部电视剧 | `/tv` |
| 国产剧 | `/tv/guochan` |
| 欧美剧 | `/tv/oumei` |
| 日本剧 | `/tv/riben` |
| 韩国剧 | `/tv/hanguo` |
| 港台剧 | `/tv/gangtai` |

### 2.4 综艺子分类
| 分类名 | URL路径 |
|--------|---------|
| 全部综艺 | `/zongyi` |
| 大陆综艺 | `/zongyi/dalu` |
| 港台综艺 | `/zongyi/gangtai` |
| 日韩综艺 | `/zongyi/rihan` |
| 欧美综艺 | `/zongyi/oumei` |

### 2.5 动漫子分类
| 分类名 | URL路径 |
|--------|---------|
| 全部动漫 | `/dongman` |
| 国产动漫 | `/dongman/guochan` |
| 日本动漫 | `/dongman/riben` |
| 欧美动漫 | `/dongman/oumei` |

---

## 三、搜索功能

### 3.1 搜索表单
- **提交地址**: `/search`
- **提交方法**: `GET`
- **参数名**: `wd`
- **示例**: `/search?wd=火遮眼`

### 3.2 搜索框HTML结构
```html
<form id="search" method="get" action="https://fdzys.net/search">
    <input type="text" name="wd" placeholder="搜索电影、电视剧、综艺、动漫" class="search-field" />
    <button type="submit"><span class="iconfont icon-search"></span></button>
</form>
```

---

## 四、视频卡片结构

### 4.1 首页视频区块
```html
<div class="myui-vodbox">
    <div class="top">
        <div class="left">
            <h2 class="title iconfont icon-hotfill">正在热播</h2>
        </div>
        <div class="right">
            <a href="/rank">
                <div class="more">更多<span class="iconfont icon-back more-icon"></span></div>
            </a>
        </div>
    </div>
    <div class="myui-vodbox-item">
        <div class="content">
            <div class="card-box">
                <!-- 视频卡片列表 -->
            </div>
        </div>
    </div>
</div>
```

### 4.2 单个视频卡片
```html
<div class="myui-vodbox-content">
    <a href="/tv/nan-bu-dang-an">
        <div class="content-card">
            <div class="card-img">
                <img class="mizhiady-defer-card-img"
                     src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                     data-src="https://pic3.yzzyimg.online/upload/vod/2026-06-11/xxx.jpg"
                     data-error-src="/template/mizhiady/statics/images/loading.png"
                     alt="南部档案" />
                <div class="bottom">
                    <div class="info">
                        <div class="hits">
                            <svg>...</svg>1680
                        </div>
                        <div class="score">7.0</div>
                    </div>
                </div>
                <div class="tag-box">
                    <div class="tag text-overflow">更新至06集</div>
                </div>
                <div class="hover-mask"></div>
                <div class="vod-detail video-info">
                    <div class="info-title-box">
                        <div class="title">南部档案</div>
                        <div class="score">7.0</div>
                    </div>
                    <div class="info-time">更新时间：昨天09:40</div>
                    <div class="info-roles">主演：张新成,丁禹兮,姜珮瑶...</div>
                    <div class="info-intro">简介：民国初年南洋地区...</div>
                    <div class="info-bottom">
                        <div class="hits">2786</div>
                        <div class="right">2026</div>
                    </div>
                </div>
            </div>
            <div class="card-info">
                <div>
                    <div class="title">南部档案</div>
                </div>
                <div class="role">主演：张新成,丁禹兮,姜珮瑶...</div>
            </div>
        </div>
    </a>
</div>
```

### 4.3 关键CSS类名
| 元素 | CSS类名 | 说明 |
|------|---------|------|
| 视频区块容器 | `.myui-vodbox` | 包含标题和视频列表 |
| 视频区块标题 | `.myui-vodbox .top .title` | 如"正在热播" |
| 视频列表容器 | `.myui-vodbox-item .content .card-box` | 包含所有视频卡片 |
| 单个视频卡片 | `.myui-vodbox-content` | 每个视频项 |
| 卡片链接 | `.myui-vodbox-content a` | 指向详情页 |
| 卡片图片容器 | `.content-card .card-img` | 包含封面图 |
| 封面图片 | `.card-img img` | 使用`data-src`懒加载 |
| 视频标题 | `.card-info .title` | 视频名称 |
| 主演信息 | `.card-info .role` | 主演列表 |
| 评分 | `.score` | 评分数字 |
| 热度 | `.hits` | 播放次数 |
| 更新状态 | `.tag-box .tag` | 如"更新至06集" |
| 悬停详情 | `.vod-detail.video-info` | 鼠标悬停显示的详情 |

---

## 五、分类页结构

### 5.1 页面布局
- **页面类型**: `data-page="type"`
- **内容类型**: `data-type="1"` (电影)、`data-type="2"` (电视剧)等

### 5.2 筛选条件（推测）
由于分类页使用JavaScript动态加载，筛选条件可能通过以下方式实现：
- URL参数：`?type=dongzuo&page=1`
- 或通过AJAX请求

### 5.3 分页结构
- 当前页：`.pagination .active`
- 分页链接：`.pagination a`

---

## 六、详情页结构

### 6.1 URL模式
- 电影详情：`/movie/{拼音}`
- 电视剧详情：`/tv/{拼音}`
- 示例：`/tv/nan-bu-dang-an`、`/movie/huo-zhe-yan-2025`

### 6.2 页面结构（推测）
```html
<div class="vod-detail">
    <div class="vod-info">
        <h1 class="title">南部档案</h1>
        <div class="info">
            <span>年份：2026</span>
            <span>类型：国产剧</span>
            <span>地区：中国大陆</span>
        </div>
        <div class="actors">主演：张新成,丁禹兮...</div>
        <div class="desc">简介：...</div>
    </div>
    <div class="vod-play">
        <div class="player-box">
            <!-- 播放器 -->
        </div>
        <div class="episode-list">
            <!-- 剧集列表 -->
        </div>
    </div>
</div>
```

---

## 七、播放页结构

### 7.1 URL模式
- 播放页：`/play/{type}/{id}`
- 示例：`/play/tv/nan-bu-dang-an`

### 7.2 播放器
- 可能使用iframe嵌入第三方播放器
- 或使用video标签直接播放

---

## 八、页脚结构

```html
<footer class="site-footer">
    <div class="container">
        <div class="footer-links">
            <!-- 底部链接 -->
        </div>
        <div class="footer-info">
            <!-- 版权信息 -->
        </div>
    </div>
</footer>
```

---

## 九、CSS变量和主题

### 9.1 主题色
```css
:root {
    --theme-color: #2862e5;
    --theme-high: 133%;
    --theme-highwide: 56%;
    --theme-radius: 6px;
}
```

### 9.2 暗色/亮色主题
- 支持`data-theme="dark"`和`data-theme="light"`
- 通过localStorage保存用户偏好

---

## 十、开发指南

### 10.1 URL路由映射
| 页面类型 | URL模式 | 示例 |
|----------|----------|------|
| 首页 | `/` | `/` |
| 电影列表 | `/movie` | `/movie` |
| 电影分类 | `/movie/:type` | `/movie/dongzuo` |
| 电视剧列表 | `/tv` | `/tv` |
| 电视剧分类 | `/tv/:type` | `/tv/guochan` |
| 综艺列表 | `/zongyi` | `/zongyi` |
| 动漫列表 | `/dongman` | `/dongman` |
| 搜索 | `/search?wd=关键词` | `/search?wd=火遮眼` |
| 详情页 | `/:type/:id` | `/movie/huo-zhe-yan-2025` |
| 播放页 | `/play/:type/:id` | `/play/movie/huo-zhe-yan-2025` |

### 10.2 爬虫接口设计

#### 首页数据
```
GET https://fdzys.net
- 解析导航菜单
- 解析各区块视频列表（正在热播、最新更新等）
```

#### 分类列表
```
GET https://fdzys.net/movie?type=dongzuo&page=1
- 解析筛选条件
- 解析视频列表
- 解析分页信息
```

#### 搜索
```
GET https://fdzys.net/search?wd=关键词&page=1
- 解析搜索结果列表
```

#### 详情页
```
GET https://fdzys.net/movie/huo-zhe-yan-2025
- 解析视频信息
- 解析播放源列表
- 解析剧集列表
```

### 10.3 数据提取要点

1. **封面图片**：使用`data-src`属性（懒加载），非`src`
2. **视频链接**：`<a href="/movie/xxx">`或`<a href="/tv/xxx">`
3. **标题**：`.card-info .title`或`img`的`alt`属性
4. **评分**：`.score`元素
5. **热度**：`.hits`元素
6. **主演**：`.card-info .role`或`.info-roles`
7. **简介**：`.info-intro`或`.vod-detail .desc`

---

## 十一、技术栈参考

- **前端框架**: 自定义模板引擎
- **CSS框架**: 自定义CSS + CSS变量
- **图标**: iconfont
- **懒加载**: 自定义懒加载（data-src）
- **主题切换**: CSS变量 + localStorage

---

## 十二、注意事项

1. **CSS类名混淆**: 目标站使用了CSS类名混淆（如`.c6a2124e`），但HTML中的原始类名仍然可用
2. **懒加载**: 图片使用`data-src`而非`src`，需要特殊处理
3. **动态内容**: 部分内容可能通过JavaScript动态加载
4. **反爬虫**: 可能需要模拟浏览器请求头

---

## 十三、完整CSS类名对照表

| 元素 | 目标站类名 | 建议类名 |
|------|-----------|----------|
| 视频卡片 | `.myui-vodbox-content` | `.video-card` |
| 卡片图片 | `.card-img` | `.card-img` |
| 卡片标题 | `.card-info .title` | `.card-title` |
| 卡片主演 | `.card-info .role` | `.card-actors` |
| 评分 | `.score` | `.score` |
| 热度 | `.hits` | `.views` |
| 更新状态 | `.tag-box .tag` | `.update-tag` |
| 悬停详情 | `.vod-detail` | `.video-detail` |
| 筛选条件 | `.filter-box` | `.filter-box` |
| 分页 | `.pagination` | `.pagination` |
| 搜索框 | `.search-field` | `.search-input` |
| 导航项 | `.nav` | `.nav-item` |
| 导航激活 | `.nav.active` | `.nav-item.active` |

