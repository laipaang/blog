# AI 杂记

Laipaang 的静态技术博客。暖白与紫色视觉，CSS 轨道动画、滚动入场、深浅主题与移动端布局。无构建步骤和外部运行时依赖。

- 首页：https://laipaang.github.io/blog/
- 文章：https://laipaang.github.io/blog/2026-11-17-from-attention-to-action/

## 目录

- `index.html`：博客首页、精选文章与文章归档。
- `2026-11-17-from-attention-to-action/index.html`：完整文章与可视化。
- `2026-11-17-from-attention-to-action/article.md`：正文 Markdown 备份。
- `assets/home.css`、`assets/home.js`：首页样式与主题、入场交互。
- `assets/style.css`、`assets/app.js`：文章样式与时间轴、阅读进度交互。
- `assets/article-motion.css`：文章动画与返回首页导航样式。
- `.nojekyll`：纯静态发布标记。

## 本地预览

在仓库目录执行 `python3 -m http.server 8000`，访问 http://localhost:8000 。也可以直接打开首页 HTML。

## 发布

GitHub Pages 从 `main` 分支根目录发布，提交更新后自动部署。仓库由 `laipaang.blog` 重命名为 `blog`。资源使用相对路径，适配项目子路径。

## 新增文章

新建 `YYYY-MM-DD-english-title/index.html`，然后在首页添加卡片或归档条目，并更新篇数及 `sitemap.xml`。文章头部与页脚应链接到 `../`，共享资源位于 `../assets/`。

Markdown 正文与 HTML 独立维护，修改内容时需保持同步。图表中的示意性质与数据口径在原文中注明。暂未配置版权许可与自定义域名。

CSS 动画遵循系统的减少动态效果设置。禁用 JavaScript 时文章和首页仍可阅读。
