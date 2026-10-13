# 博客站点 Agent 规则

适用范围：`D:\myblog` 个人博客（GitHub Pages：`teast1234.github.io`）。与 `generated_image/` 里的生图流水线分工不同：本文件管**站点发布与博物馆展厅**。

更新日期：2026-10-13。

## 站点边界

- 首页与英文页：`index.html`、`en/index.html`，共用 `css/site.css`、`js/site.js`、像素海滩等。
- **奶蛙博物馆**是独立展厅：目录 `museum/`，入口 `/museum/`，不把大图和馆藏逻辑塞进首页。
- 未完成的名画创作、工作区草稿、同步脚本（`_repo_sync*.py` 等）默认不进 Pages；博物馆只上架已验收完成作品。

## 奶蛙博物馆（`museum/`）

- 唯一上架源：`generated_image/04_名画创作清单/已完成档案.json`（`status=已完成`）。
- 构建脚本：`py -3.12 museum/build_collection.py`
  - 压缩奶蛙成图 → `museum/assets/art/`
  - 压缩原作参考 → `museum/assets/original/`（本地 `01_参考资料`；三幅经典公版原作可从 Wikimedia 拉取）
  - 写出 `museum/data/collection.json`
- **登记完成 ≠ 自动上线**。新增已完成作品后，必须重跑构建脚本，再提交 `museum/assets`、`museum/data` 与页面改动。
- 不要把 `generated_image/03_艺术方向库` 整目录推上 Pages；只提交构建产物。
- 史前等无可靠本地原图的作品：灯箱不提供原作图切换，仅展示资料外链。
- 页面能力（本期）：序言、年代筛选、分页网格、深色灯箱、奶蛙改编/原作参考切换、夜间模式。不包含鉴定所、BGM、意见箱、完整双语站。

## 发布约定

- 静态站，推 `main` 即 GitHub Pages。
- 改 CSS/JS 时同步 bump HTML 上的 `?v=` 缓存参数。
- 提交信息用中文简述「为什么」；除非用户要求，不把 `.env`、密钥、同步凭证提交进库。
- 用户未明确要求时不要 `git push --force`，不要改 git config。

## 相关文档

- 生图与验收：`generated_image/AGENTS.md`、`generated_image/奶蛙艺术生图Agent手册.md`
- 角色设定：`docs/奶蛙AI视频生成手册.md`
