# 合并设计：以 Astra 为主干，移植我们的 SEO 内核

> 前提：`hypotheses.md`（假设）+ `reference/full_gefei.md`（词表与竞品）+ 对两个版本的实测审计
> 结论先行：**Astra 的 SEO 基础实际上比我们强，只有一处例外——但那一处恰恰是整个打法的命门。**

---

## 一、实测审计：谁的 SEO 更强

对两站同样的 6 个路由做了静态 HTML 提取（模拟爬虫在执行 JS 前看到的内容）：

| 指标 | 我们 | Astra | 谁赢 |
|---|---:|---:|---|
| 工具页静态字数 | **80~91** | **1,285~1,510** | **Astra（16倍）** |
| 首页静态渲染 63 张公园卡 | ❌ JS 注入 | ✅ 静态 HTML | **Astra** |
| JSON-LD 结构化数据（工具页） | ❌ 无 | ✅ 全有 | **Astra** |
| 单公园页内链数 | 5 | **31** | **Astra** |
| 图片 alt 文本 | 无图 | **249/249** | **Astra** |
| H2 结构 | 0（工具页） | 2~5 | **Astra** |
| **H1 含目标关键词** | ✅ **精确匹配** | ❌ **完全不含** | **我们** |
| 63 个公园 NPS 完整数据 | ✅ 含天气/交通 | ⚠️ Yellowstone 薄且重复 | **我们** |

### 必须正视的两件事

**① 我们最大的隐患：工具页是空的。**
我们把所有内容（63 张卡、成就、地区统计、地图）都用 `sections.js` 客户端注入，静态 HTML 只有 **80 个词**。Google 虽然能执行 JS，但渲染是二等公民（延迟、预算限制）。而 `full_gefei.md` 里哥飞的原话是：

> "游戏站文字内容较少，SEO 怎么做比较好" → **"写多一些啊，这难道还不能自己控制吗。"**

我们恰好踩了这个坑。**这不是"我们 SEO 强"，这是我们 SEO 有硬伤。**

**② Astra 最大的隐患：H1 一个关键词都没有。**

| 路由 | 我们的 H1 | Astra 的 H1 |
|---|---|---|
| `/tracker/` | National Park **Tracker** | The places stay with you. |
| `/counter/` | National Park **Counter** | How much out there have you seen? |
| `/map/` | National Park **Map Checklist** | Put your next memory on the map. |
| `/parks/` | All 63 US National Parks | Every park has a story. |

领跑者 nationalparkchecklist.com 的打法是**「一个页面死磕一个词」**，17 个词排第 1。H1 是最强的页面相关性信号之一。Astra 的 H1 情绪很好，但**放弃了整条打法的地基**。

**结论：合并方向是"Astra 的躯干 + 我们的关键词纪律"，不是二选一。**

---

## 二、要满足的假设（来自 hypotheses.md，合并后不能丢）

| # | 假设 | 合并后由什么承载 | 状态 |
|---|---|---|---|
| 1 | 游戏化/情感化带来差异化 | Astra 的照片叙事 + 收藏册定位 + 我们的成就/streak | **Astra 更强，但要保住成就系统** |
| 2 | 联盟/电商变现优于纯广告 | 带图的情绪化页面转化率更高 → Astra 的版式是对的 | 需预留联盟位 |
| 3 | 63 公园 + 页面池吃长尾 | 63 个详情页（两边都有） | ✅ 已满足 |
| 4 | 域名用词根加速冷启动 | 尚未定域名 | ⏳ 未验证 |
| 5 | 目标人群=收集型成人+带娃家长 | Astra 的 `/family/` 页正好对应 junior ranger 那条线（5,400/月，CPC 最高） | **Astra 更强** |

**新增一条必须验证的假设（本次审计逼出来的）：**

> **假设 6：静态渲染的长文本工具页，比 JS 注入的空壳页排名更快。**
> 这是我们和 Astra 最大的技术差异，也是最容易用数据证伪的一条。

---

## 三、必须满足的页面矩阵（SEO 内核，一页一词）

词量数据来自 `full_gefei.md`。**这张表是合并的验收标准**——每一行都要在 Astra 里存在，且 H1/title 含目标词。

### A. 变体矩阵（核心工具页）

| 路由 | 目标主词 | 美国月搜索量 | H1 必须含 | Astra 现状 |
|---|---|---:|---|---|
| `/` | national park checklist | 1,600 | "National Parks Checklist" | ❌ 需改 H1 |
| `/tracker/` | national park tracker | 880 | "National Park Tracker" | ❌ 需改 H1 |
| `/map/` | national park map checklist | 1,000 | "National Park Map Checklist" | ❌ 需改 H1 |
| `/counter/` | national park counter | 110 | "National Park Counter" | ❌ 需改 H1 + **内容仅 205 词，需补** |
| `/passport/` | national park passport stamps | 1,600 ↑41% | "National Park Passport Stamps" | ❌ 需改 H1 |
| `/parks/` | all national parks list | — | "All 63 US National Parks" | ❌ 需改 H1 |

### B. 页面池（长尾地基）

| 路由 | 目标词模式 | 数量 | 状态 |
|---|---|---:|---|
| `/parks/<slug>/` | "{park} national park" | 63 | ✅ 两边都有，用我们的完整 NPS 数据 |

### C. Astra 独有、应保留的新增页

| 路由 | 机会词 | 月搜索量 | 判断 |
|---|---|---:|---|
| `/family/` | junior ranger 相关 | 5,400（CPC 最高 $0.85~$3.77） | **保留并强化**——变现价值最高的人群 |
| `/credits/` | — | — | 保留（图片版权合规，非 SEO） |

### D. 尚未覆盖的机会（下一轮）

| 目标词 | 月搜索量 | 备注 |
|---|---:|---|
| national park poster | 8,100（出价 $0.54~$2.32） | `full_gefei.md` 明确标记为"漏掉的机会点" |
| national park scratch off map | 880（竞争度 100/100） | 电商词，联盟带货入口 |
| national park bucket list | 390 | 可做 `/bucket-list/` |
| how many national parks have i been to | 140 | 可并入 `/counter/` 的 H2 |

---

## 四、合并方案：需要重新设计的部分

### 改动 1（最关键）：H1 双层结构

Astra 的情绪化文案是资产，不能扔；关键词也不能丢。**用"关键词 H1 + 情绪副标题"的双层结构**，两者兼得：

```
现在（Astra）：
  <h1>The places stay with you.</h1>

改为：
  <p class="eyebrow">The places stay with you.</p>      ← 情绪，视觉上是大字
  <h1>National Park Tracker</h1>                         ← 关键词，SEO 主信号
  <p class="sub">Log the date you visited each of the 63 parks…</p>
```

**视觉上可以让 eyebrow 更大更醒目**，H1 做次级字号——SEO 看的是标签语义，不是字号。这样情绪和关键词零冲突。

### 改动 2：补齐 `/counter/` 的内容
Astra 的 counter 页只有 205 词，是全站最薄的一页。需要补到 800+ 词，并把 `how many national parks have i been to`（140/月）做成一个 H2 板块。

### 改动 3：移植我们的完整 NPS 数据
Astra 的 `data/nps-units.json` 是从我们旧版继承的，缺 6 个公园的数据，Yellowstone 页面回退成一句话且**重复出现两次**。用我们现在的完整版（含 `weatherInfo` / `directionsInfo`）替换，给 63 页都加上"何时去""怎么到"两个真实内容板块。

### 改动 4：移植成就/streak 系统
Astra 有 milestone，但没有我们的连续打卡（streak）。假设 1 的验证需要它——这是成本最低、留存验证价值最高的游戏化机制。

### 改动 5：移植 GitHub → Cloudflare 自动部署
Astra 的 README 明确写了"no automatic GitHub deployment is claimed"，目前靠手动 wrangler。把我们的 Actions workflow 搬过去。

### 改动 6：sitemap 补齐
Astra 71 条 URL，合并后应为 6（变体）+ 63（公园）+ 2（family/credits）= **71 条**，确认 `/family/` `/credits/` 都在内。

---

## 五、不要做的事

- **不要把 Astra 的照片换成我们的 emoji**——照片是假设 1 和假设 2 的核心载体
- **不要为了 SEO 牺牲 Astra 的视觉**——双层 H1 已经解决了冲突
- **不要保留我们的 `sections.js` 客户端注入架构**——这是我们的硬伤，Astra 的静态渲染是对的
- **不要急着上 433 个 NPS 单元**——先把 63 个做到位；薄内容规模化只会稀释整站质量

---

## 六、验收标准 — 全部通过 ✅（2026-09-19 实测）

| # | 标准 | 结果 |
|---|---|---|
| 1 | 变体页 + 63 公园页 **H1 含目标关键词** | ✅ 7 个工具页 + 63 公园页全通过 |
| 2 | 工具页静态 HTML **≥ 800 词**（不依赖 JS） | ✅ 821~1,508 词 |
| 3 | 63 公园页有 NPS 官方内容，**无重复段落** | ✅ 63 页，0 重复 |
| 4 | 全站内链爬取 **0 个 404** | ✅ 71 条链接，0 断链 |
| 5 | 手机 + 桌面，**0 console 报错** | ✅ 两端均 0 |
| 6 | sitemap 覆盖全部可索引页 | ✅ 71 条 URL |
| 7 | push 到 main **自动部署** | ✅ GitHub Actions 已配 |

### 实际改动记录

- **H1 双层结构**：`<h1>` 放精确关键词，情绪文案移到 `.lead`（视觉权重不变，一个字没删）。中途踩了 CSS 特异性坑——`.hero-content>p:not(.hero-kicker)`(0,2,1) 压过了我的 `.hero .hero-lead`(0,2,0)，导致 76px 变 17px 且叠加负字距，文字挤成一团；提权到 `.hero-content>p.hero-lead` 修复。
- **NPS 数据**：补齐 `weatherInfo`/`directionsInfo`，63 页新增"When to go""Getting there"。公园页中位数 281 → 483 词。Yellowstone 的重复段落已消除。
- **内容补强**：`/counter/` 205 → 821 词，`/family/` 328 → 860 词。写作中自查发现"Alaska 有 9 个公园"是错的（实为 8），已改正。
- **streak**：向后兼容迁移，旧备份（无 streak 字段）仍可正常加载，已实测。
- **自动部署**：GitHub Actions + 新建的 Pages-only 窄权限 token。

---

## 七、开放问题（需要你定）

1. **域名**——假设 4 一直没验证。合并后是个好时机定一个含词根的域名（`park` + `checklist`/`tracker`/`passport`）。
2. **仓库**——Astra 现在是独立 git 仓库。合并后是并入主仓库，还是以 Astra 仓库为准、废弃旧的？
3. **NPS API key 轮换**——旧 key 曾短暂出现在公开仓库，建议作废重申。
