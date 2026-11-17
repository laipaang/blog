# 从注意力到行动 · AI 杂记

独立静态博客，无构建步骤、外部字体、CDN 或运行时依赖。正文在 HTML 内，即使 JavaScript 关闭也可阅读。时间轴筛选、主题切换、目录高亮和阅读进度由原生 JavaScript 增强。

## 本地阅读

直接用浏览器打开 `index.html`。也可以在本目录执行：

```bash
python3 -m http.server 8000
```

然后访问 http://localhost:8000 。这是下载到自己电脑后使用的地址。

## 文件

- `index.html`：完整页面和可视化内容
- `article.md`：可独立编辑、迁移的正文备份（不含网页交互图）
- `assets/style.css`：桌面、移动端、深色和打印样式
- `assets/app.js`：渐进增强交互
- `assets/icon.svg`：本地站点图标
- `.nojekyll`：GitHub Pages 纯静态发布标记

Markdown 与 HTML 是两份独立文件，修改后需自行保持同步。

## 未来发布到 GitHub Pages

1. 新建 GitHub 仓库，将本目录内容放到仓库根目录，确保根目录有 `index.html`。
2. 在仓库 Settings → Pages 中，选择 Deploy from a branch。
3. 选择 `main` 分支及 `/ (root)`，保存。
4. 等待发布完成，使用 GitHub 显示的 Pages 地址。

资源全部使用相对路径，兼容 `username.github.io/repository/` 子路径。若并入已有博客，可将本目录放入一个子目录并链接到它。

## 编辑说明

修改页面标题、署名与发布日期时，检查 `index.html` 的 title、description、hero 区域，并同步正文备份。插图全部采用本地 CSS / HTML 构建，不依赖第三方图片。图表已标注示意或数据口径；未经验证的 2026 具体产品传闻未收录。此版本是历史叙事与趋势分析，不是截至发布日的完整模型年鉴。

尚未配置文章版权许可。公开发布前可按个人选择增加 LICENSE、域名 CNAME、站点统计与社交分享图片。
