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

// ============================================================
// HARDCODED UI TEMPLATES — injected verbatim into every issue
// ============================================================

var BOLT_CSS = [
  ".zeus-bolt { display:inline-block; vertical-align:middle; animation: boltFlash 2.5s ease-in-out infinite; filter: drop-shadow(0 0 6px #ffe066); }",
  "@keyframes boltFlash { 0%,100%{opacity:1;filter:drop-shadow(0 0 6px #ffe066);} 50%{opacity:0.6;filter:drop-shadow(0 0 14px #fff5c0);} }"
].join("\n");

// Each bolt gets a unique gradient ID via a counter to avoid SVG gradient conflicts
var BOLT_SVG_TEMPLATE = [
  "<svg width='20' height='30' viewBox='0 0 24 36' class='zeus-bolt' aria-hidden='true'>",
  "  <defs><linearGradient id='boltGrad_UNIQUE' x1='0%' y1='0%' x2='100%' y2='100%'>",
  "  <stop offset='0%' style='stop-color:#ffe066'/><stop offset='50%' style='stop-color:#b8964a'/>",
  "  <stop offset='100%' style='stop-color:#fff5c0'/></linearGradient></defs>",
  "  <polygon points='14,0 4,20 11,20 10,36 20,14 13,14' fill='url(#boltGrad_UNIQUE)' stroke='#8a6d2f' stroke-width='0.5'/>",
  "</svg>"
].join("\n");

var EYE_SVG = [
  "<svg id='zeusEyeSvg' width='180' height='78' viewBox='0 0 120 52' xmlns='http://www.w3.org/2000/svg' style='display:block;margin:0 auto;cursor:none;'>",
  "  <defs>",
  "    <radialGradient id='irisGrad' cx='60' cy='26' r='18' gradientUnits='userSpaceOnUse'>",
  "      <stop offset='0%' stop-color='#b088f9'/>",
  "      <stop offset='45%' stop-color='#6b4c9a'/>",
  "      <stop offset='100%' stop-color='#2d1b4e'/>",
  "    </radialGradient>",
  "  </defs>",
  "  <path d='M10,26 C25,8 45,4 60,4 C75,4 95,8 110,26 C95,44 75,48 60,48 C45,48 25,44 10,26 Z' stroke='#b8964a' stroke-width='1.5' fill='none'/>",
  "  <circle cx='60' cy='26' r='18' fill='url(#irisGrad)'/>",
  "  <circle id='pupilEl' cx='60' cy='26' r='7' fill='#1a0d2e'/>",
  "  <circle cx='60' cy='26' r='18' stroke='#b8964a' stroke-width='1' fill='none' opacity='0.6'/>",
  "  <circle cx='54' cy='21' r='3' fill='white' opacity='0.7'/>",
  "  <circle cx='58' cy='19' r='1.5' fill='white' opacity='0.5'/>",
  "  <path id='eyelidPath' d='M10,26 C25,26 45,26 60,26 C75,26 95,26 110,26 L110,26 C95,26 75,26 60,26 C45,26 25,26 10,26 Z' fill='#faf8f4'/>",
  "</svg>"
].join("\n");

var EYE_JS = [
  "var eyeOpen = 'M10,26 C25,26 45,26 60,26 C75,26 95,26 110,26 L110,26 C95,26 75,26 60,26 C45,26 25,26 10,26 Z';",
  "var eyeClosed = 'M10,26 C25,8 45,4 60,4 C75,4 95,8 110,26 C95,44 75,48 60,48 C45,48 25,44 10,26 Z';",
  "var eyelid = document.getElementById('eyelidPath');",
  "var pupil = document.getElementById('pupilEl');",
  "function doBlink() {",
  "  if (!eyelid) return;",
  "  eyelid.setAttribute('d', eyeClosed);",
  "  setTimeout(function() { eyelid.setAttribute('d', eyeOpen); }, 200);",
  "  setTimeout(doBlink, 4000 + Math.random() * 4000);",
  "}",
  "if (eyelid) { setTimeout(doBlink, 2000); }",
  "document.addEventListener('mousemove', function(e) {",
  "  var eyeSvg = document.getElementById('zeusEyeSvg');",
  "  if (!eyeSvg || !pupil) return;",
  "  var rect = eyeSvg.getBoundingClientRect();",
  "  var cx = rect.left + rect.width / 2;",
  "  var cy = rect.top + rect.height / 2;",
  "  var dx = (e.clientX - cx) / window.innerWidth * 12;",
  "  var dy = (e.clientY - cy) / window.innerHeight * 6;",
  "  var nx = Math.min(66, Math.max(54, 60 + dx));",
  "  var ny = Math.min(32, Math.max(20, 26 + dy));",
  "  pupil.setAttribute('cx', String(nx));",
  "  pupil.setAttribute('cy', String(ny));",
  "});"
].join("\n");

var STAMP_JS = [
  "function doStamp() {",
  "  var btn = document.getElementById('stampBtn');",
  "  var stampEl = document.getElementById('stampSvg');",
  "  var timeEl = document.getElementById('stampTime');",
  "  if (!btn || btn.disabled) return;",
  "  btn.disabled = true;",
  "  btn.style.opacity = '0.5';",
  "  btn.style.cursor = 'not-allowed';",
  "  var n = new Date();",
  "  var yr = String(n.getFullYear());",
  "  var mo = ('0' + (n.getMonth() + 1)).slice(-2);",
  "  var dy = ('0' + n.getDate()).slice(-2);",
  "  var hr = ('0' + n.getHours()).slice(-2);",
  "  var mi = ('0' + n.getMinutes()).slice(-2);",
  "  var sc = ('0' + n.getSeconds()).slice(-2);",
  "  var timeStr = yr + '-' + mo + '-' + dy + ' ' + hr + ':' + mi + ':' + sc;",
  "  if (stampEl) {",
  "    stampEl.style.display = 'block';",
  "    stampEl.style.transform = 'rotate(-15deg)';",
  "    stampEl.style.transition = 'transform 0.4s ease';",
  "    setTimeout(function() { stampEl.style.transform = 'rotate(0deg)'; }, 50);",
  "  }",
  "  if (timeEl) {",
  "    timeEl.style.display = 'block';",
  "    timeEl.textContent = '已阅时间：' + timeStr;",
  "  }",
  "}"
].join("\n");

var HOME_BUTTON_HTML = [
  "<a href='https://zeus9.ai' style='position:fixed;bottom:24px;right:24px;z-index:9999;",
  "background:#b8964a;color:#1a0d2e;text-decoration:none;padding:10px 18px;border-radius:24px;",
  "font-family:\"Space Mono\",monospace;font-size:13px;font-weight:700;",
  "box-shadow:0 2px 12px rgba(184,150,74,0.4);display:flex;align-items:center;gap:6px;",
  "border:1.5px solid #8a6d2f;' title='返回主站'>",
  "&#8962; 首页</a>"
].join("");

var STAMP_SVG_HTML = [
  "<div id='stampSvg' style='display:none;margin:16px auto;width:160px;'>",
  "  <svg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'>",
  "    <circle cx='80' cy='80' r='72' stroke='#5c3d8f' stroke-width='4' fill='none'/>",
  "    <circle cx='80' cy='80' r='64' stroke='#cc2200' stroke-width='2' fill='rgba(204,34,0,0.04)'/>",
  "    <path id='topArc' d='M 26,80 A 54,54 0 0,1 134,80' fill='none'/>",
  "    <text font-family='Playfair Display,serif' font-size='15' font-weight='700' fill='#cc2200' letter-spacing='4'>",
  "      <textPath href='#topArc' startOffset='15%'>已　阅</textPath>",
  "    </text>",
  "    <path id='botArc' d='M 26,80 A 54,54 0 0,0 134,80' fill='none'/>",
  "    <text font-family='Playfair Display,serif' font-size='15' font-weight='700' fill='#cc2200' letter-spacing='4'>",
  "      <textPath href='#botArc' startOffset='15%'>打　卡</textPath>",
  "    </text>",
  "    <text x='80' y='72' text-anchor='middle' font-family='Space Mono,monospace' font-size='11' fill='#cc2200'>" + dateStr.slice(0,7) + "</text>",
  "    <text x='80' y='90' text-anchor='middle' font-family='Space Mono,monospace' font-size='11' fill='#cc2200'>" + dateStr.slice(8,10) + "</text>",
  "    <text x='80' y='108' text-anchor='middle' font-family='Playfair Display,serif' font-size='13' font-weight='700' fill='#5c3d8f'>ZEUS DAILY</text>",
  "  </svg>",
  "</div>"
].join("\n");

// ============================================================

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
    "Do NOT merely summarize. Cross-reference ALL stories, find hidden connections, expose what mainstream media misses. Every 信息差 and 预测 must be sharp, specific, non-obvious.",
    "",
    "=== CRITICAL: USE THESE EXACT CODE BLOCKS VERBATIM — DO NOT MODIFY ===",
    "",
    "--- BOLT CSS (paste inside <style>) ---",
    BOLT_CSS,
    "",
    "--- BOLT SVG USAGE ---",
    "For EVERY bolt symbol on the page, use this SVG but replace UNIQUE with a sequential number (bolt1, bolt2, bolt3 etc):",
    BOLT_SVG_TEMPLATE,
    "Example: first bolt uses id 'boltGrad_bolt1', second uses 'boltGrad_bolt2', etc.",
    "This prevents gradient ID conflicts. EVERY bolt must have a unique gradient ID.",
    "",
    "--- EYE SVG (paste in header, exactly as-is) ---",
    EYE_SVG,
    "",
    "--- EYE + BLINK JAVASCRIPT (paste verbatim in the single script block) ---",
    EYE_JS,
    "",
    "--- STAMP JAVASCRIPT (paste verbatim in the single script block) ---",
    STAMP_JS,
    "",
    "--- STAMP SVG HTML (paste in Zeus.打卡 section) ---",
    STAMP_SVG_HTML,
    "",
    "--- HOME BUTTON HTML (paste just before </body>) ---",
    HOME_BUTTON_HTML,
    "",
    "=== COLORS ===",
    "bg #faf8f4, text #2c2420, gold #b8964a, gold-dark #8a6d2f, purple #5c3d8f",
    "",
    "=== FONTS (Google Fonts) ===",
    "Playfair Display 400/700/900, Crimson Pro 400/600, Space Mono 400",
    "",
    "=== FINANCIAL DASHBOARD (static 4x2 grid) ===",
    "Row1: BTC/USD | ETH/USD | Gold XAU/USD | Silver XAG/USD",
    "Row2: USD/MYR | Crude Oil | S&P 500 | Fear & Greed Index",
    "Style: Space Mono, dark bg #1a1208, gold borders #b8964a, gold text for values.",
    "Fill with actual values from news context. Mobile: 2x4 grid.",
    "",
    "=== SECTION FORMAT ===",
    "Every section title: [bolt SVG] Zeus.SectionName [bolt SVG]",
    "News items must have: SVG illustration (50x50) + bold headline + 2-3 sentence summary + 上帝视角 box (purple left border, 信息差 + 预测)",
    "",
    "=== MANDATORY SECTIONS IN ORDER ===",
    "1. Zeus.哲思 — philosophical opening connecting to today's news (2-3 sentences, original insight)",
    "2. Zeus.世界要闻 — 4-5 world news items",
    "3. Zeus.权力之声 — Trump & Musk 2-3 items",
    "4. Zeus.AI前沿 — 3-4 AI/tech items",
    "5. Zeus.币圈 — BTC+ETH prices + 2-3 stories",
    "6. Zeus.贵金属 — Gold+Silver with MYR context",
    "7. Zeus.马来西亚 — 2-3 Malaysia items",
    "8. Zeus.趣闻 — MINIMUM 5 fun/quirky stories",
    "9. Zeus.星座 — ALL 12 signs in 3x4 grid (白羊 金牛 双子 巨蟹 狮子 处女 天秤 天蝎 射手 摩羯 水瓶 双鱼). Each: symbol + name + 2 sentences.",
    "10. Zeus.结语 — meditative poetic closing",
    "11. Zeus.打卡 — check-in section with:",
    "    - Instruction text: '读完今日神眼日报，请留下你的足迹'",
    "    - The STAMP SVG HTML block (verbatim from above)",
    "    - Button: <button id='stampBtn' onclick='doStamp()' style='...gold styled button...'>盖章打卡</button>",
    "    - Time display: <div id='stampTime' style='display:none;text-align:center;color:#5c3d8f;font-family:Space Mono,monospace;margin-top:12px;'></div>",
    "",
    "=== ES5 RULES — ABSOLUTE ===",
    "var ONLY. Zero const/let. Zero arrow functions =>. Zero padStart(). Zero SMIL/animate tags.",
    "('0'+n).slice(-2) for zero-padding.",
    "Single <script> block immediately before </body>. All JS in that one block.",
    "",
    "=== BRAND ===",
    "<title>Zeus Daily Vol." + volNumber + " · " + dateStr + " · The God's Eye View</title>",
    "Header: bolt + ZEUS DAILY (Playfair 900 gold) + bolt, subheader: THE GOD'S EYE VIEW (Space Mono)",
    "Date line: " + dateStr + " · Vol." + volNumber,
    "Footer: A Zeus 9 Publication · zeus9.ai · Vol." + volNumber,
    "",
    "Output ONLY raw HTML starting with <!DOCTYPE html>. Zero markdown. Zero code fences. Zero explanation."
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
