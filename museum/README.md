# 奶蛙博物馆

博客独立展厅：入口 `/museum/`。馆藏来自已验收完成的奶蛙名画，**不是**生图工作区直出。

完整站点规则与防回归清单见仓库根目录 [`AGENTS.md`](../AGENTS.md)。生图侧登记完成说明见 [`generated_image/AGENTS.md`](../generated_image/AGENTS.md)。

## 例行上架（持续加画时照做）

登记完成不会自动上线。在仓库根目录：

```text
py -3.12 museum/build_collection.py
```

然后只提交构建产物：

- `museum/assets/art/`
- `museum/assets/original/`
- `museum/data/collection.json`

数据源：`generated_image/04_名画创作清单/已完成档案.json`（仅 `status=已完成`）。

### 不要做

- 不要把 `generated_image/03_艺术方向库` 整树推上 Pages
- 不要为上架去改 `js/site.js` / `css/site.css`（共享，易弄坏模型分页）
- 不要用外链替代灯箱「原作参考」切图
- 不要删详情灯箱或关掉改编/原作切换

### 上架后点一下

1. `/museum/` 能看到新作品
2. 点开详情：大图 + 改编/原作可切换（原作是图）
3. 筛选、分页仍正常
4. 若动过首页或共享 CSS/JS：再测角色模型分页与竖图露脸（见根 `AGENTS.md`）

## 目录

| 路径 | 用途 |
|------|------|
| `build_collection.py` | 从已完成档案生成 `collection.json` 并压缩资源 |
| `data/collection.json` | 展厅运行时数据 |
| `assets/art/` | 奶蛙成图（压缩 JPEG） |
| `assets/original/` | 原作对照图（本地参考或脚本 fallback） |
| `index.html` / `css/` / `js/` | 展厅 UI（与首页共享壳隔离） |

年代筛选随 `build_collection.py` 的 `CATEGORY_META` / `FILTER_ORDER` 扩展；馆藏变多后分页会自动省略页码。
