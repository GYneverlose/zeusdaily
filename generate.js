const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

const now = new Date();
const dateStr = now.toISOString().split("T")[0];
const dateCompact = dateStr.replace(/-/g, "");
const fileName = "zeus-daily-" + dateCompact + ".html";
const filePath = path.join("zeusdaily", fileName);

if (fs.existsSync(filePath)) {
  console.log("Today's edition already exists: " + fileName);
  process.exit(0);
}

var editionsPath = path.join("zeusdaily", "editions.json");
var editionsData = JSON.parse(fs.readFileSync(editionsPath, "utf8"));
var volNumber = String(editionsData.editions.length + 1);
while (volNumber.length < 3) volNumber = "0" + volNumber;

console.log("Generating Zeus Daily Vol." + volNumber + " for " + dateStr + "...");

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

async function generate() {
  console.log("Searching for latest news (Haiku)...");

  var searchResponse = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: "Search for today's major news for " + dateStr + ": world events, Trump/Musk updates, AI news, crypto prices (BTC ETH), gold/silver prices in USD and MYR, Malaysia news, fun/quirky stories. Give me 15-20 items total, brief summaries only.",
      },
    ],
  });

  var searchContext = searchResponse.content
    .map(function(b) {
      if (b.type === "text") return b.text;
      if (b.type === "tool_result") {
        return (b.content || []).map(function(c) { return c.text || ""; }).join("\n");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  if (searchContext.length > 6000) {
    searchContext = searchContext.slice(0, 6000);
  }

  console.log("Search context length: " + searchContext.length + " chars");
  console.log("Generating HTML edition (Opus)...");

  var prompt = [
    "You are Zeus Daily — THE GOD'S EYE VIEW. Today is " + dateStr + ". Generate Vol." + volNumber + " as a single complete self-contained HTML file.",
    "",
    "=== NEWS CONTEXT ===",
    searchContext,
    "",
    "=== MISSION ===",
    "Do NOT merely summarize. Cross-reference ALL stories, find hidden connections, expose what mainstream media misses. Every 信息差 and 预测 must be sharp, specific, non-obvious — as if from an omniscient observer outside the system.",
    "",
    "=== LOCKED DESIGN SPEC (20260311) ===",
    "",
    "COLORS: bg #faf8f4, text #2c2420, gold #b8964a, gold-dark #8a6d2f, purple #5c3d8f",
    "FONTS (Google Fonts): Playfair Display 400/700/900, Crimson Pro 400/600, Space Mono 400",
    "",
    "--- ZEUS LIGHTNING BOLT (replaces all trident symbols) ---",
    "Use an animated SVG lightning bolt as the Zeus brand symbol throughout the page.",
    "Lightning bolt SVG (inline, reuse this exact shape wherever Zeus symbol needed):",
    "<svg width='24' height='36' viewBox='0 0 24 36' class='zeus-bolt'>",
    "  <defs><linearGradient id='boltGrad' x1='0%' y1='0%' x2='100%' y2='100%'>",
    "  <stop offset='0%' style='stop-color:#ffe066'/><stop offset='50%' style='stop-color:#b8964a'/>",
    "  <stop offset='100%' style='stop-color:#fff5c0'/></linearGradient></defs>",
    "  <polygon points='14,0 4,20 11,20 10,36 20,14 13,14' fill='url(#boltGrad)' stroke='#8a6d2f' stroke-width='0.5'/>",
    "</svg>",
    "CSS for bolt animation:",
    ".zeus-bolt { display:inline-block; animation: boltFlash 2.5s ease-in-out infinite; filter: drop-shadow(0 0 6px #ffe066); }",
    "@keyframes boltFlash { 0%,100%{opacity:1;filter:drop-shadow(0 0 6px #ffe066);} 50%{opacity:0.6;filter:drop-shadow(0 0 14px #fff5c0);} }",
    "Place animated bolt: in header (left and right of ZEUS DAILY title), before each section title.",
    "",
    "--- ZEUS EYE (凤眼 phoenix eye) LOCKED GEOMETRY ---",
    "SVG viewBox '0 0 120 52'. Outer almond gold path (stroke #b8964a stroke-width 1.5 fill none):",
    "M10,26 C25,8 45,4 60,4 C75,4 95,8 110,26 C95,44 75,48 60,48 C45,48 25,44 10,26 Z",
    "Iris radial gradient cx=60 cy=26 r=18: #b088f9 0%, #6b4c9a 45%, #2d1b4e 100%",
    "Iris circle cx=60 cy=26 r=18. Pupil id='pupilEl' cx=60 cy=26 r=7 fill #1a0d2e.",
    "Gold glow ring cx=60 cy=26 r=18 stroke #b8964a stroke-width 1 opacity 0.6.",
    "Highlight1 cx=54 cy=21 r=3 fill white opacity 0.7. Highlight2 cx=58 cy=19 r=1.5 fill white opacity 0.5.",
    "Eyelid path id='eyelidPath' fill #faf8f4.",
    "Open d: 'M10,26 C25,26 45,26 60,26 C75,26 95,26 110,26 L110,26 C95,26 75,26 60,26 C45,26 25,26 10,26 Z'",
    "Closed d: 'M10,26 C25,8 45,4 60,4 C75,4 95,8 110,26 C95,44 75,48 60,48 C45,48 25,44 10,26 Z'",
    "",
    "EYE JAVASCRIPT (ES5, must work):",
    "var eyeOpen = 'M10,26 C25,26 45,26 60,26 C75,26 95,26 110,26 L110,26 C95,26 75,26 60,26 C45,26 25,26 10,26 Z';",
    "var eyeClosed = 'M10,26 C25,8 45,4 60,4 C75,4 95,8 110,26 C95,44 75,48 60,48 C45,48 25,44 10,26 Z';",
    "var eyelid = document.getElementById('eyelidPath');",
    "var pupil = document.getElementById('pupilEl');",
    "function doBlink() {",
    "  eyelid.setAttribute('d', eyeClosed);",
    "  setTimeout(function() { eyelid.setAttribute('d', eyeOpen); }, 200);",
    "  setTimeout(doBlink, 4000 + Math.random() * 4000);",
    "}",
    "setTimeout(doBlink, 2000);",
    "document.addEventListener('mousemove', function(e) {",
    "  var rect = document.getElementById('zeusEyeSvg').getBoundingClientRect();",
    "  var cx = rect.left + rect.width / 2;",
    "  var cy = rect.top + rect.height / 2;",
    "  var dx = (e.clientX - cx) / window.innerWidth * 12;",
    "  var dy = (e.clientY - cy) / window.innerHeight * 6;",
    "  var nx = Math.min(66, Math.max(54, 60 + dx));",
    "  var ny = Math.min(32, Math.max(20, 26 + dy));",
    "  pupil.setAttribute('cx', nx);",
    "  pupil.setAttribute('cy', ny);",
    "});",
    "",
    "FINANCIAL DASHBOARD (static 4x2 grid, no ticker, no scrolling):",
    "Row1: BTC/USD | ETH/USD | Gold XAU/USD | Silver XAG/USD",
    "Row2: USD/MYR | Crude Oil | S&P 500 | Fear & Greed Index",
    "Style: Space Mono, dark bg #1a1208, gold borders #b8964a, gold text for values.",
    "",
    "--- SECTION NAMING (mandatory format) ---",
    "Every section title must follow this format: [animated bolt SVG] Zeus.[SectionName] [animated bolt SVG]",
    "Examples:",
    "⚡ Zeus.哲思 ⚡",
    "⚡ Zeus.世界要闻 ⚡",
    "⚡ Zeus.权力之声 ⚡",
    "⚡ Zeus.AI前沿 ⚡",
    "⚡ Zeus.币圈 ⚡",
    "⚡ Zeus.贵金属 ⚡",
    "⚡ Zeus.马来西亚 ⚡",
    "⚡ Zeus.趣闻 ⚡",
    "⚡ Zeus.星座 ⚡",
    "⚡ Zeus.结语 ⚡",
    "⚡ Zeus.打卡 ⚡",
    "(Use the actual animated bolt SVG, not emoji)",
    "",
    "--- CHECK-IN STAMP (已阅打卡) — MUST BE FULLY FUNCTIONAL ---",
    "Red circular stamp SVG. 已阅 top arc, 打卡 bottom arc, date in center.",
    "Purple border #5c3d8f, red ink #cc2200.",
    "IMPORTANT: window.doStamp() must work exactly like this:",
    "  1. On click: show stamp with CSS rotation animation (rotate from -15deg to 0deg)",
    "  2. Time display shows EXACT click time, format YYYY-MM-DD HH:MM:SS using ('0'+n).slice(-2)",
    "  3. After stamp: button becomes disabled, opacity 0.5, cursor not-allowed",
    "  4. Stamp stays visible permanently after click",
    "Full doStamp function must be implemented, not just a stub.",
    "",
    "--- HOME BUTTON ---",
    "Fixed position button bottom-right corner of every page.",
    "Style: gold bg #b8964a, dark text, rounded, shows house icon + '首页'",
    "Links to: https://zeus9.ai",
    "CSS: position:fixed; bottom:24px; right:24px; z-index:999;",
    "",
    "=== SECTIONS (MANDATORY ORDER AND CONTENT) ===",
    "",
    "1. Zeus.哲思 — Original philosophical opening. Must connect to TODAY's news themes. 2-3 sentences of genuine insight. NOT generic.",
    "",
    "2. Zeus.世界要闻 — EXACTLY 4-5 world news items. Each item MUST have ALL of:",
    "   a) Creative thematic SVG illustration (50x50, relevant to story)",
    "   b) Bold headline in Playfair Display",
    "   c) 2-3 sentence summary in Crimson Pro",
    "   d) 上帝视角 box: purple left border #5c3d8f, light bg. Contains:",
    "      信息差: [non-obvious cross-referenced insight]",
    "      预测: [specific, time-bound prediction]",
    "",
    "3. Zeus.权力之声 — Trump & Musk ONLY, 2-3 items. Same format as above.",
    "",
    "4. Zeus.AI前沿 — 3-4 AI/tech items from TODAY. Same format.",
    "",
    "5. Zeus.币圈 — BTC + ETH prices prominent. 2-3 story items. Same format.",
    "",
    "6. Zeus.贵金属 — Gold & Silver with MYR context. 1-2 items. Same format.",
    "",
    "7. Zeus.马来西亚 — 2-3 Malaysia items. Same format.",
    "",
    "8. Zeus.趣闻 — MINIMUM 5 fun/quirky stories. Lighter tone but still include 上帝视角.",
    "",
    "9. Zeus.星座 — ALL 12 zodiac signs, NO EXCEPTIONS. Must include every sign:",
    "   白羊座 金牛座 双子座 巨蟹座 狮子座 处女座 天秤座 天蝎座 射手座 摩羯座 水瓶座 双鱼座",
    "   Layout: 3x4 or 4x3 grid. Each sign: symbol + name + 2 sentences (outlook + advice).",
    "   Style: each cell has subtle gold border, sign symbol large and gold-colored.",
    "",
    "10. Zeus.结语 — Meditative poetic closing. Connect today's events to larger human/civilizational story.",
    "",
    "11. Zeus.打卡 — Fully functional check-in stamp section. Centered layout.",
    "    Show instruction: '读完今日神眼日报，请留下你的足迹'",
    "    Large stamp button with doStamp() onclick.",
    "    Time display div below stamp (hidden until clicked).",
    "",
    "=== ES5 JAVASCRIPT — ABSOLUTE RULES ===",
    "var ONLY. Zero const, zero let anywhere in the file.",
    "function keyword ONLY. Zero arrow functions => anywhere.",
    "('0'+n).slice(-2) for zero-padding. Never padStart().",
    "Single <script> block immediately before </body>.",
    "Zero SMIL tags. Zero animate/animateTransform tags. Zero beginElement().",
    "Eye blink ONLY via setAttribute on SVG path d attribute.",
    "All bolt animations via CSS @keyframes only.",
    "",
    "=== RESPONSIVE / MOBILE ===",
    "Must work on mobile. Dashboard grid: 2x4 on mobile. News items stack vertically.",
    "Financial dashboard cells min-width 0, use percentage widths on mobile.",
    "Home button always visible on mobile.",
    "",
    "=== BRAND ===",
    "Page <title>: Zeus Daily Vol." + volNumber + " · " + dateStr + " · The God's Eye View</title>",
    "Header: animated bolt + ZEUS DAILY (Playfair 900 gold) + animated bolt",
    "Subheader: THE GOD'S EYE VIEW (Space Mono, letter-spaced)",
    "Date line: " + dateStr + " · Vol." + volNumber,
    "Footer: A Zeus 9 Publication · zeus9.ai · Vol." + volNumber,
    "",
    "Output ONLY raw HTML starting with <!DOCTYPE html>. Zero markdown. Zero fences. Zero explanation."
  ].join("\n");

  var html = "";

  var stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });

  for await (var chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      html += chunk.delta.text;
    }
  }

  html = html.replace(/^```html\n?/i, "").replace(/\n?```$/i, "").trim();

  if (!html || html.length < 1000) {
    throw new Error("Generated HTML too short. Length: " + html.length);
  }

  console.log("HTML generated: " + html.length + " chars");

  fs.writeFileSync(filePath, html, "utf8");
  console.log("Saved: " + fileName);

  fs.writeFileSync(path.join("zeusdaily", "index.html"), html, "utf8");
  console.log("Updated index.html");

  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var d = new Date(dateStr + "T00:00:00");
  var summary = "Vol." + volNumber + " · " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();

  editionsData.editions.push({
    date: dateStr,
    vol: volNumber,
    title: "Zeus Daily",
    file: fileName,
    summary: summary,
  });

  fs.writeFileSync(editionsPath, JSON.stringify(editionsData, null, 2), "utf8");
  console.log("Updated editions.json");

  console.log("\n⚡ Zeus Daily Vol." + volNumber + " generated successfully!");
}

generate().catch(function(err) {
  console.error("Generation failed:", err);
  process.exit(1);
});
