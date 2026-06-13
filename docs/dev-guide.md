# 开发指南 - 基于页面架构分析

## 一、URL路由映射

| 页面类型 | URL模式 | 示例 |
|----------|----------|------|
| 首页 | / | / |
| 电影列表 | /movie | /movie |
| 电影分类 | /movie/:type | /movie/dongzuo |
| 电视剧列表 | /tv | /tv |
| 电视剧分类 | /tv/:type | /tv/guochan |
| 综艺列表 | /zongyi | /zongyi |
| 动漫列表 | /dongman | /dongman |
| 搜索 | /search?wd=关键词 | /search?wd=火遮眼 |
| 详情页 | /:type/:id | /movie/huo-zhe-yan-2025 |
| 播放页 | /play/:type/:id | /play/movie/huo-zhe-yan-2025 |

## 二、爬虫接口设计

### 2.1 首页数据
GET https://fdzys.net
- 解析导航菜单
解析各区块视频列表

### 2.2 分类列表
GET https://fdzys.net/movie?type=dongzuo&page=1
- 解析筛选条件
- 解析视频列表
- 解析分页信息

### 2.3 搜索
GET https://fdzys.net/search?wd=关键词&page=1
- 解析搜索结果列表

### 2.4 详情页
GET https://fdzys.net/movie/huo-zhe-yan-2025
- 解析视频信息
- 解析播放源列表
- 解析剧集列表

### 2.5 播放页
GET 播放页URL
- 解析播放器地址（iframe src 或 video src）

## 三、CSS类名对照

| 元素 | 目标站类名 | 我们的类名 |
|------|-----------|------------|
| 视频卡片 | .item | .video-card |
