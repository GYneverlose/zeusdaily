# ZEUS Daily — 日报生成规则（CLAUDE.md）

本文件是 Zeus Daily 日报生成的唯一权威规则源。所有 Agent Teams teammates 在 spawn 时自动加载本文件。
最后更新：2026-03-18 · 基于 Vol.2026-03-17 标准锁定

---

## ⚡ 角色导读（Agent Teams 快速索引）

| 角色 | 必读章节 | 可跳过 |
|------|----------|--------|
| Teammate 1 · 资料猎手 | 一、二、四（4.1-4.2）、九、十二 | 五~八（设计/技术规范） |
| Teammate 2 · 数据官 | 一、二、三、四（4.1、4.6）、九、十二 | 五~八（设计/技术规范） |
| Teammate 3 · 审核官 | 一、四（全部）、十、十二 | 五~八（设计/技术规范） |
| Lead · 总编 | 全部章节，重点：五~八（组装 HTML）、十~十一（质量+进化） | 无 |
| 单 session 模式 | 全部章节 | 无 |

---

## 一、触发与流程

- 触发短语：嗨嗨 → 立即启动完整日报生成流程
- 每次生成前必须通过 web search 抓取当天最新新闻
- 生成前读取 review-log.md（如存在），从历史教训中学习
- 文件命名：zeus-daily-YYYY-MM-DD.html
- 发布目录：zeusdaily/
- 全局时间标准：所有时间戳一律使用 UTC，包括 Dashboard 数据、新闻来源时间、date bar 等，无例外
- 输出格式：单个自包含 HTML 文件，所有 CSS 和 JS 内联，不可拆分为多个文件。唯一允许的外部引用见第八章 8.4

---

## 二、板块结构（固定顺序，不可调换）

| # | 板块 | 英文标题 | 最低内容要求 |
|---|------|----------|-------------|
| 1 | 哲思 | REFLECTION | 1 段，结合当日事件的哲学思考 |
| 2 | 世界要闻 | WORLD NEWS | ≥3 条新闻 |
| 3 | 金融市场 | FINANCE & MARKETS | ≥3 条 + 贵金属卡片 |
| 4 | 币圈 | CRYPTO | ≥1 条 + 4 格加密数据 |
| 5 | 权力之声 | POWER WATCH | ≥2 条，含原话引用 |
| 6 | AI前沿 | AI FRONTIER | ≥2 条 |
| 7 | 马来西亚 | MALAYSIA | ≥2 条，含 .msia-tag 标签 |
| 8 | 上帝视角分析 | GOD'S EYE ANALYSIS | 信息链 + ≥2 个错误定价 + 核心连线 + canvas mind map |
| 9 | 趣闻 | LIGHT NEWS | ≥5 条 |
| 10 | 星座 | CELESTIAL | 全部 12 宫，不可缺少 |
| 11 | 结语 | CLOSING | 诗意收束 |

可根据当天热度动态新增板块（插入在固定板块之间），但固定板块不可删除或合并。

---

## 三、Dashboard 金融仪表盘（12 格）

固定 4 列 grid，共 12 格：

| 格 | 标签 | 数据源要求 |
|----|------|-----------|
| 1 | Gold | LiteFinance / Kitco，/oz |
| 2 | Silver | +变化率，/oz |
| 3 | Bitcoin | CoinGecko |
| 4 | Ethereum | CoinGecko，+变化率 |
| 5 | WTI Oil | CNBC，/bbl |
| 6 | Brent | Al Jazeera / CNBC，/bbl |
| 7 | USD/MYR | Xe.com |
| 8 | 恐贪指数 | Fear & Greed，中英双语标签 |
| 9 | S&P 500 | +变化率 |
| 10 | Platinum | /oz |
| 11 | Palladium | /oz |
| 12 | Dow | +变化率 |

**数据规则**

- 每格独立 web search，不可复用其他格的搜索结果
- 时间戳精确到日，格式为 Mar DD（如 Mar 17），标注来源名称，一律 UTC
- 涨跌色：涨 .up = #1e7b3f，跌 .down = #8b1a1a
- 数据超过 24 小时未更新（以 UTC 计算）→ 显示 "数据暂缺"

---

## 四、内容规则

### 4.1 数据来源（硬性限制）

所有新闻和金融数据只可从以下类别的权威来源抓取，禁止使用论坛、自媒体、博客等非权威来源：

- **新闻类**：Reuters, AP, NPR, Al Jazeera, BBC, CNN, CNBC, Bloomberg, The Guardian, Financial Times, South China Morning Post, 端传媒, The Star (MY), Bernama (MY), Nikkei Asia
- **金融数据类**：CoinGecko, Kitco, LiteFinance, Yahoo Finance, Xe.com, CNBC Markets, TradingView, FearGreedMeter, Investing.com
- **研究/机构类**：IMF, World Bank, IEA, Pew Research, 各国央行官网

如来源不在上述范围内，必须由审核官额外验证其权威性后方可采用，并在 review-log.md 中注明。当新闻资源不足时，Lead（总编）有权临时增加白名单来源，但需在 review-log.md 的 `## 临时来源` 区块记录原因及新增来源，供下期参考。

### 4.2 新闻验证

- 每条新闻必须有 ≥2 个独立权威来源，或标注 "尚待核实"
- 时间戳必须为单一日期（不可用日期范围）
- 来源格式：`Mon DD, YYYY · 来源1 / 来源2`（如 `Mar 16, 2026 · NPR / Reuters`），使用 `.news-ts` 样式，日期以 UTC 为准

### 4.3 Tooltip 覆盖（关键规则）

- 每个人名、机构、术语、历史事件、金融概念、科学名词都必须有 `.term` tooltip
- 无上限——宁多勿少
- 中文版和英文版都必须包含 `.term` 标签（之前英文版遗漏，已修复）
- 格式：`<span class="term" data-zh="中文解释" data-en="English explanation">术语</span>`
- data 属性格式：标题：解释正文（中文用全角冒号 `：`，英文用半角 `:`）

### 4.4 God's Eye 上帝视角

- 必须识别市场共识的错误定价（mispricing）
- 要求跨领域链式推理（地缘 × 商品 × 货币 × 科技 × 本地）
- 提出不可从 Bloomberg/Reuters 直接获取的前瞻性预测
- 自评 ≥9/10，未达标必须重写
- 每期轮换分析框架，不可重复上期视角
- 包含 canvas mind map（详见技术规范）

### 4.5 权力之声

- 必须包含原话引用（`.voice-quote` + `.voice-attr`）
- 引用格式：斜体紫色左边框

### 4.6 星座

- 12 宫全部覆盖，每宫结合当日新闻事件撰写
- 3 列 grid，移动端 2 列

### 4.7 容错规则（出问题时的预案）

| 异常情况 | 处理方案 |
|----------|----------|
| Dashboard 某格搜不到数据 | 显示上一交易日数据 + 标注 "数据暂缺 · 截至 Mon DD" |
| 某板块凑不够最低新闻条数 | 允许降至最低 2 条，但 Lead 须在 review-log.md 记录原因 |
| 审核官打回大量内容 | 资料猎手/数据官须在同一 session 内补搜，不可跳过审核直接发布 |
| Web search 完全不可用 | 终止生成，不可凭记忆编写新闻，等待恢复后重试 |
| Google Fonts CDN 加载失败 | CSS 中已有 fallback font-family，页面可降级显示，不阻塞发布 |

---

## 五、设计规范（CSS 锁定）

### 5.1 CSS 变量（不可修改）

```css
:root {
  --cream: #faf8f4;
  --cream2: #f0ebe2;
  --ink: #1a1410;
  --ink2: #3a2e22;
  --gold: #b8964a;
  --gold2: #8a6d2f;
  --purple: #5c3d8f;
  --purple2: #3d2060;
  --purple3: #8b5cf6;
  --rule: rgba(184,150,74,.35);
}
```

### 5.2 字体族（4 套）

| 用途 | 字体 |
|------|------|
| 标题、品牌、新闻标题 | 'Playfair Display', serif — weight 700/900 |
| 正文 | 'EB Garamond', 'Noto Serif SC', serif |
| 时间戳、标签、代码 | 'Space Mono', monospace |
| 中文衬线 | 'Noto Serif SC' |

### 5.3 布局

- max-width: 820px，居中
- body padding: 0 18px 60px
- font-size: 15.5px，line-height: 1.75
- 背景色：var(--cream) = #faf8f4

### 5.4 Masthead

- 品牌：ZEUS DAILY — Playfair Display 900, 38px, letter-spacing 8px
- 副标题：THE GOD'S EYE VIEW — 11px, letter-spacing 5px, gold2
- 底部 1.5px gold 分割线

### 5.5 Date Bar

- 只显示：日期 + 星期 + 特殊日/事件标注
- 不显示 Vol 编号
- 11px, letter-spacing 3px, 居中

### 5.6 Section Header

- `.section-title`：Playfair Display 13px, letter-spacing 4px, 大写, gold2
- 右侧 `.section-rule`：1px gold 水平线 flex 填充
- 不加 "Zeus." 前缀

### 5.7 Tooltip 系统

- 背景：linear-gradient(135deg, #1e1030, #140c24)
- 顶部边框：2px solid #b8964a
- 圆角：8px
- 内边距：12px 14px
- 最小宽度：200px / 最大宽度：280px
- 标题：10px 大写 gold bold
- 分割线：1px rgba(184,150,74,.4)
- 正文：12px, line-height 1.75, color #e0cfc0
- 箭头：7px 三角形，color #1e1030
- 智能边界检测：防止溢出屏幕

### 5.8 God's Eye Section

- 背景：linear-gradient(160deg, #f5f0e8, #ede5d4)
- 边框：1px solid rgba(184,150,74,.35)
- 顶部：3px solid var(--gold)
- 圆角：4px
- 内边距：22px 20px

### 5.9 Mispricing Box

- 背景：#fff
- 边框：1px solid rgba(184,150,74,.25)
- 左边框：3px solid var(--gold)
- 圆角：3px
- 内边距：14px 16px
- box-shadow: 0 1px 6px rgba(184,150,74,.08)
- 标签：8px 大写，gold 背景 + gold 边框

### 5.10 响应式

```css
@media(max-width:520px) {
  .dashboard { grid-template-columns: repeat(2,1fr); }
  .crypto-grid { grid-template-columns: repeat(2,1fr); }
  .horo-grid { grid-template-columns: repeat(2,1fr); }
  .masthead-brand { font-size: 26px; letter-spacing: 4px; }
}
```

---

## 六、Eye SVG 规范（永久锁定）

viewBox="0 0 120 52", 显示尺寸 width="200" height="87"

- 开眼路径：`M 5,26 C 25,8 95,8 115,26 C 95,44 25,44 5,26 Z`
- 闭眼路径：`M 5,26 C 25,26 95,26 115,26 C 95,26 25,26 5,26 Z`

- 外框：fill #0e0818, stroke #b8964a, stroke-width 1.4, filter goldGlow
- 虹膜：cx=60 cy=26 r=14, fill nebulaGrad (#b088f9 → #6b4c9a → #2d1b4e), filter irisGlow
- 瞳孔：cx=60 cy=26 r=6.5, fill pupilGrad (#1a0a2e → #0a0515)
- 高光1：cx=64 cy=22 r=2.2, white 0.45 opacity
- 高光2：cx=56 cy=28 r=1, purple 0.4 opacity
- 睫毛点：(30,14) (60,8) (90,14), r=0.7, gold 0.5 opacity

- 瞳孔追踪：maxMove=4, iris offset, pupil offset ×1.2
- 眨眼：随机 2000-5000ms 间隔, 180ms 闭合, 通过 setAttribute 修改 path d

---

## 七、Canvas Mind Map 规范

### 7.1 固定约束

- 画布：1280×760 (CSS max-width 640px)
- 纯 ES5 实现，禁止外部库

### 7.2 创意自由

除画布尺寸外，所有视觉元素由 Lead（或负责组装的 agent）自由发挥，包括但不限于：

- 背景风格、配色、渐变方向
- 节点数量、形状、布局方式、动画效果
- 中心图案（不限于眼睛，可根据当期主题创作）
- 连接线样式、光效、粒子效果
- 星空密度、闪烁方式
- 任何能表达当期核心信息链的创意呈现

### 7.3 唯一要求

- 内容必须与当期 God's Eye 分析的核心主题相关
- 每期视觉呈现必须与上期有明显差异
- Lead 在 review-log.md 简要记录本期 mind map 的创意方向，供下期参考避免重复

---

## 八、JavaScript 技术规范

### 8.1 硬性限制

- 纯 ES5：只用 var, function, slice(-2) 等
- 禁止：let, const, 箭头函数, 模板字符串, 解构, class, Promise.allSettled, async/await
- 单一 `<script>` block：放在 `</body>` 之前
- 禁止 SMIL 动画：所有动画用 JS 实现
- 禁止外部 JS 库

### 8.2 全局函数要求

以下函数必须挂载在 window 或全局作用域，因为 HTML 中的 onclick 需要调用：

- `setLang(lang)` — 语言切换
- `doStamp()` — 打卡（window.doStamp 全局引用）

### 8.3 语言切换

- 使用 CSS class：`.zh-only` / `.en-only`
- `body.lang-en` 时 `.en-only` 显示、`.zh-only` 隐藏
- 按钮：中/EN，localStorage 持久化

### 8.4 必需外部资源（HTML `<head>` 中必须引入，缺一不可）

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Noto+Serif+SC:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

Lead 组装 HTML 时必须核对以上引用是否存在，漏掉将导致字体渲染降级。

---

## 九、中英双语规则

- 所有板块标题必须有 zh-only 和 en-only 版本
- 所有新闻标题（`.news-hed`）必须有中英双版
- 所有新闻正文（`.news-body`）必须有中英双版
- 英文版必须包含与中文版对应的 `.term` tooltip 标签
- 星座、结语、哲思均需双语
- Dashboard 中恐贪指数标签需双语

---

## 十、质量控制

### 10.1 三轮验证（每期必做）

1. **时效性验证**：每条新闻时间戳必须在 24 小时以内（UTC），超过则不可采用
2. **数据准确性验证**：Dashboard 12 格 + 加密数据 + 贵金属数据与官方源比对
3. **完整性验证**：来源标注、tooltip 覆盖、12 宫星座、≥5 条趣闻、英文版 tooltip

### 10.2 自评标准

- 总分 ≥ 9.5/10 方可发布
- 未达标 → 自动修正 → 重新评估
- 扣分项需在 review-log.md 中记录

---

## 十一、Self-Evolution 自我进化系统

### 11.1 外部对标（每期必做）

生成日报后、写复盘前，先进行一轮 web search：

- 搜索当天全球顶级日报/newsletter 的报道角度（如 Morning Brew、The Daily Upshot、Bloomberg Daybreak、端传媒等）
- 对比：Zeus Daily 是否遗漏了重大新闻？角度是否独特？
- 学习：其他日报的排版创新、数据呈现方式、分析框架有无可借鉴之处
- 将发现记录至 review-log.md 的 `## 外部对标` 区块

### 11.2 每期复盘

完成外部对标后，追加记录至 review-log.md：

- 本期评分及扣分原因
- 薄弱板块 vs 优秀板块
- 读者可能觉得缺失的信息
- 上帝视角预测命中率回顾

### 11.3 Review-Log 保鲜机制

review-log.md 必须保持精简可读，避免因累积过多过期内容拖慢 teammates 阅读效率：

**结构分层：**

- `## 核心教训`：从历史复盘中提炼的永久有效规律（如"周一金融数据来源最少，需提前准备"），长期保留，上限 20 条。满 20 条时淘汰最不相关的一条
- `## 最近 5 期复盘`：仅保留最近 5 期的详细复盘记录，更早的自动删除
- `## 外部对标`：仅保留最近 3 期的对标发现
- `## 团队复盘`：仅保留最近 3 期的团队会议记录
- `## 临时来源`：仅保留最近 3 期的临时白名单记录

**每 10 期大清理：**

Lead 在第 10、20、30… 期时执行一次大清理：回顾全部 核心教训，合并重复项，删除已过时的条目，确保整个文件不超过 200 行

### 11.4 持续优化

- 每次生成前读取 review-log.md
- 自动识别新兴热点：连续 3 天高热度 → 建议新增板块
- 金融维度扩展：基础价格 → 技术指标 → 链上数据 → 宏观关联
- 上帝视角深度升级：事件总结 → 因果推演 → 多情景预测 → 量化概率

### 11.5 风格进化

- 记录每期表达方式与结构创新
- 保留效果好的，淘汰平庸的
- 每 10 期大版本迭代
- 原则：每一期至少有一个可感知的进步

---

## 十二、Agent Teams 分工指南

当使用 Agent Teams 生成日报时，建议分工如下：

**Teammate 1 — 资料猎手**

- 负责：世界要闻、权力之声、AI前沿、马来西亚
- 输出：news-raw.json（结构化新闻数据，含来源和时间戳）
- 规则：每条 ≥2 来源，不合格标 "尚待核实"

**Teammate 2 — 数据官**

- 负责：Dashboard 12 格数据（每格独立搜索）、币圈 4 格、贵金属卡片、趣闻 5 条、星座 12 宫
- 输出：data-raw.json（金融数据 + 趣闻 + 星座）
- 规则：所有时间戳一律 UTC，精确到分钟，>24h 标 "数据暂缺"

**Teammate 3 — 审核官**

- 负责：交叉验证 Teammate 1 和 2 的产出
- 验证项：来源真实性、时效性、数据准确性、是否有 ≥2 独立来源
- 输出：verified.json（审核通过的数据 + 审核备注）
- 不合格项打回标注原因

**Lead — 总编**

- 读取 verified.json，按本文件规范组装完整 HTML
- 撰写：哲思、结语、God's Eye 上帝视角分析
- 执行三轮自审
- 自评 ≥9.5/10 后输出最终文件
- 生成后追加 review-log.md
- 发布后复盘会议：向所有 teammates 发送消息，指出本期各环节的错误与不足（如来源不够权威、数据时效过期、tooltip 遗漏等），要求 teammates 确认收到并回复改进方案。复盘要点记录至 review-log.md 的 `## 团队复盘` 区块，确保下期不再重复相同错误

**关键约束**

- Teammates 不可同时写同一个文件
- 所有中间产物用 JSON 格式传递
- CLAUDE.md 是所有 teammates 的唯一规则源
- Mind map 的 6 个节点标签由 Lead 根据当期主题确定

---

## 十三、已知 Bug 与修复记录

| Bug | 状态 | 修复方案 |
|-----|------|----------|
| 英文版缺少 .term tooltip | ⚠️ 待修复 | 英文版 .news-body.en-only 必须包含对应 .term 标签 |
| generate.js 曾覆盖 index.html | ✅ 已修复 | generate 排除 index.html |
| Dashboard unescaped quotes 导致 JS 错误 | ✅ 已修复 | 所有字符串用单引号或转义 |

---

## 十四、设计参考

当前锁定标准：zeusdaily.blog/zeus-daily-20260317

本 CLAUDE.md 中的所有规范均从该期源码逐行提取，以文字规则为准。URL 仅作补充视觉参考，不可作为唯一设计依据。
