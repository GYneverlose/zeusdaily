# ZEUS Daily — 日报生成规则（CLAUDE.md）

本文件是 Zeus Daily 日报生成的唯一权威规则源。所有 Agent Teams teammates 在 spawn 时自动加载本文件。
最后更新：2026-03-18 · 基于 Vol.2026-03-17 标准锁定

---

## ⚡ 角色导读（Agent Teams 快速索引）

| 角色 | 必读章节 | 可跳过 |
|------|----------|--------|
| Teammate 1 · 资料猎手 | 一、二、四（4.1-4.2）、九、十二 | 五~八（设计/技术规范） |
| Teammate 2 · 数据官 | 一、二、三、四（4.1、4.6）、九、十二 | 五~八（设计/技术规范） |
| Teammate 3 · 审核官 | 一、二、三、四（全部）、九、十、十二（12.3 必读） | 五~八（设计/技术规范） |
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
| 9 | 外星人 | THE ALIEN POST | 2-3 条，详见 4.8 |
| 10 | 结语 | CLOSING | 诗意收束 |

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

### 4.6 外星人板块样式

- 使用 `.alien-card` 容器：深色渐变背景（区别于其他板块的浅色调）
- 吐槽部分使用 `.alien-roast`：斜体，紫色左边框（类似 .voice-quote 但用金色）
- 每条事件之间用虚线分隔

### 4.7 容错规则（出问题时的预案）

| 异常情况 | 处理方案 |
|----------|----------|
| Dashboard 某格搜不到数据 | 显示上一交易日数据 + 标注 "数据暂缺 · 截至 Mon DD" |
| 某板块凑不够最低新闻条数 | 允许降至最低 2 条，但 Lead 须在 review-log.md 记录原因 |
| 审核官打回大量内容 | 对应 Teammate 须在同一 session 内补搜修正后重新提交审核（详见 12.3） |
| Web search 完全不可用 | 终止生成，不可凭记忆编写新闻，等待恢复后重试 |
| Google Fonts CDN 加载失败 | CSS 中已有 fallback font-family，页面可降级显示，不阻塞发布 |

### 4.8 外星人（THE ALIEN POST）

本板块收录真实发生但令人难以置信的离奇事件，让读者"惊掉下巴"。

**内容范围**（包括但不限于）：
- 前沿科学实验的离奇发现（量子物理、太空探索、深海考察）
- 疑似外星生命/UFO 相关的官方报告或科学论文
- 罕见自然现象、未解之谜的最新进展
- 医学/生物学中违反直觉的实验结果
- 历史档案解密中的荒诞发现

**格式要求**：
- 每期 2-3 条，必须是真实事件（有权威来源）
- 每条必须包含**详细的过程和结果**，不可只写标题和一句话概括
- 背景注释（.term tooltip）覆盖涉及的科学名词、机构、人物
- 每条末尾附 **ZEUS 吐槽**：用犀利、幽默、带点黑色幽默的口吻点评该事件（中英双语），风格参考：一个见过太多宇宙荒诞的上帝在摇头叹气

**吐槽风格指南**：
- 可以调侃人类的认知局限
- 可以假装站在外星人视角评价
- 不可冒犯受害者或弱势群体
- 语气：震惊 → 分析 → 一句话神吐槽

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

### 5.7 组件样式（Tooltip / God's Eye / Mispricing Box）

以上组件的像素级样式已锁定在 Vol.001 模板（zeus-daily-20260317.html）中。Lead 组装时直接从模板复制对应 CSS class，不可自行修改样式值。

### 5.10 响应式

```css
@media(max-width:520px) {
  .dashboard { grid-template-columns: repeat(2,1fr); }
  .crypto-grid { grid-template-columns: repeat(2,1fr); }
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
- 外星人板块（含吐槽）、结语、哲思均需双语
- Dashboard 中恐贪指数标签需双语

---

## 十、质量控制

### 10.1 三轮验证（每期必做）

1. **时效性验证**：每条新闻时间戳必须在 24 小时以内（UTC），超过则不可采用
2. **数据准确性验证**：Dashboard 12 格 + 加密数据 + 贵金属数据与官方源比对
3. **完整性验证**：来源标注、tooltip 覆盖、外星人板块 2-3 条（含吐槽）、英文版 tooltip

### 10.2 自评标准

- 总分 ≥ 9.5/10 方可发布
- 未达标 → 自动修正 → 重新评估
- 扣分项需在 review-log.md 中记录

---

## 十一、Self-Evolution 自我进化系统

### 11.1 外部对标（每期必做，强制 web search）

日报发布后、写复盘前，Lead 必须执行 **至少 3 组实际 web search**（不可凭记忆编写），对标当天的 Morning Brew、Bloomberg Daybreak、端传媒等顶级日报/newsletter。

记录至 review-log.md `## 外部对标`，必须包含：实际搜索到的报道标题或 URL、Zeus Daily 遗漏的重大新闻、可借鉴的排版/分析方式。不可写空泛内容。

### 11.2 每期复盘（在外部对标之后执行）

完成外部对标后，追加记录至 review-log.md：

- 本期评分及扣分原因
- 薄弱板块 vs 优秀板块
- 读者可能觉得缺失的信息（结合外部对标发现）
- 上帝视角预测命中率回顾

### 11.3 Review-Log 管理

review-log.md 结构分层：`## 核心教训`（上限 20 条）、`## 最近 5 期复盘`、`## 外部对标`（最近 3 期）、`## 团队复盘`（最近 3 期）、`## 临时来源`（最近 3 期）。超出上限的自动删除最旧条目。每 10 期 Lead 执行一次大清理，确保文件不超过 200 行。

### 11.4 持续进化

- 连续 3 天高热度话题 → 建议新增板块
- 金融维度逐步扩展：基础价格 → 技术指标 → 链上数据 → 宏观关联
- 上帝视角逐期升级：事件总结 → 因果推演 → 多情景预测 → 量化概率
- 每期至少有一个可感知的进步（更深洞察/更准预测/更好排版/更丰富数据）
- 每 10 期大版本迭代，回顾进化轨迹

---

## 十二、Agent Teams 分工指南

当使用 Agent Teams 生成日报时，**必须启用全部角色**，分工如下：

### 12.1 Teammate 1 — 资料猎手

- 负责：世界要闻、权力之声、AI前沿、马来西亚
- 输出：news-raw.json（结构化新闻数据，含来源和时间戳）
- 规则：每条 ≥2 来源，不合格标 "尚待核实"

### 12.2 Teammate 2 — 数据官

- 负责：Dashboard 12 格数据（每格独立搜索）、币圈 4 格、贵金属卡片、外星人 2-3 条（详见 4.8）
- 输出：data-raw.json（金融数据 + 外星人）
- 规则：所有时间戳一律 UTC，精确到分钟，>24h 标 "数据暂缺"

### 12.3 Teammate 3 — 审核官（强制启用，最终把关者）

**审核官是日报发布前的唯一终审关卡。审核官点头才能发布，没有例外。**

**启动前置条件：**
- 审核官在开始工作前，必须完整读取本文件（CLAUDE.md）的全部规则，特别是：第二章（板块结构）、第三章（Dashboard 规格）、第四章（内容规则，全部小节）、第九章（双语规则）、第十章（质量控制）
- 审核官必须读取 review-log.md，了解上期扣分原因，重点检查上期薄弱环节是否在本期得到改善

**审核方式：** 按第二章（板块条数）、第三章（Dashboard 规格）、第四章（来源/时效/tooltip/容错）、第九章（双语）、第十章（质量控制）的规则逐项验证。额外关注：
- 外星人板块事件必须有权威来源
- review-log.md 中上期扣分项是否在本期改善

**审核结果只有两种：**
- **✅ APPROVED**：全部通过，Lead 可发布
- **❌ REJECTED**：列出不合格项 + 原因 + 修正要求，发回 Lead 重新分配修正。不可跳过审核直接发布

**审核官权力：** 高于 Lead 自评。有权打回任何 Teammate 的产出、否决非白名单来源、要求重写上帝视角。

**输出：**
- verified.json（审核通过的数据 + 审核备注）
- 审核报告：列出通过项、不合格项（如有）、本期质量评分

### 12.4 Lead — 总编

- 读取 verified.json（**必须等待审核官通过后才可组装最终 HTML**）
- 撰写：哲思、结语、God's Eye 上帝视角分析
- 执行三轮自审（时效性 → 数据准确性 → 完整性）
- 自评 ≥9.5/10 后，**提交审核官做最终审核**
- 审核官通过后，输出最终文件
- 生成后追加 review-log.md
- 发布后复盘会议：向所有 teammates 发送消息，指出本期各环节的错误与不足（如来源不够权威、数据时效过期、tooltip 遗漏等），要求 teammates 确认收到并回复改进方案。复盘要点记录至 review-log.md 的 `## 团队复盘` 区块，确保下期不再重复相同错误

### 12.5 工作流程（强制顺序）

```
Teammate 1（资料猎手）──┐
                        ├──→ Teammate 3（审核官）──→ Lead（总编组装）──→ Teammate 3（终审）──→ 发布
Teammate 2（数据官）──┘        ↑ 打回则返回对应 Teammate 修正后重新提交 ↑
```

1. **Phase 1 — 采集**：Teammate 1 和 Teammate 2 并行执行 web search，输出 JSON
2. **Phase 2 — 初审**：Teammate 3 读取 CLAUDE.md + review-log.md，逐项审核两位 Teammate 的产出。通过 → verified.json；不通过 → 打回修正
3. **Phase 3 — 预测验证 + Credits 发放（自动）**：Lead 在组装前执行以下步骤：
   - Web search 验证上期预测条件是否达成
   - 更新 Supabase `predictions` 表：status（pending → hit/miss/partial）+ resolved_note
   - **发放 Zeus Credits**：查询 `prediction_votes` 表获取所有投票，按规则发放：
     - hit → 投 agree 的用户 +3 credits
     - miss → 投 disagree 的用户 +3 credits
     - partial → 所有投票用户 +1 credit
   - 更新对应用户的 `profiles.zeus_credits` 字段（当前值 + 奖励）
   - API 操作使用 service_role key：`eyJhbG...GQMJ4NBQ...`
4. **Phase 4 — 组装**：Lead 读取 verified.json，组装 HTML，撰写哲思/上帝视角/结语。God's Eye 中引用本期新预测 + 上期预测验证结果
5. **Phase 5 — 终审**：Lead 将完整 HTML 提交审核官做最终检查。通过 → 发布；不通过 → Lead 修正后重新提交
6. **Phase 6 — 发布**：发布文件 + 更新 Supabase editions 表 + 插入本期新预测至 predictions 表 + git push
7. **Phase 7 — 外部对标（强制 web search）**：Lead 执行至少 3 组 web search，对标 Morning Brew / Bloomberg Daybreak / 端传媒等，记录至 review-log.md `## 外部对标`（详见 11.1，不可跳过）
8. **Phase 8 — 复盘与团队会议**：Lead 撰写复盘 + 向所有 teammates 发送复盘消息 + 记录至 review-log.md

### 12.6 关键约束

- Teammates 不可同时写同一个文件
- 所有中间产物用 JSON 格式传递
- CLAUDE.md 是所有 teammates 的唯一规则源
- Mind map 的 6 个节点标签由 Lead 根据当期主题确定

---

## 十三、设计参考

当前锁定标准：zeusdaily.blog/zeus-daily-20260317

本 CLAUDE.md 中的所有规范均从该期源码逐行提取，以文字规则为准。URL 仅作补充视觉参考，不可作为唯一设计依据。
