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

var BOLT_CSS = [
  ".zeus-bolt { display:inline-block; vertical-align:middle; animation: boltFlash 2.5s ease-in-out infinite; filter: drop-shadow(0 0 6px #ffe066); }",
  "@keyframes boltFlash { 0%,100%{opacity:1;filter:drop-shadow(0 0 6px #ffe066);} 50%{opacity:0.6;filter:drop-shadow(0 0 14px #fff5c0);} }"
].join("\n");

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

var PROGRESS_CSS = [
  "#zeus-progress{position:fixed;top:0;left:0;width:0%;height:3px;background:linear-gradient(90deg,#b8964a,#ffe066,#b8964a);z-index:9999;transition:width 0.1s linear;box-shadow:0 0 8px rgba(184,150,74,0.8);}",
  "#zeus-anchors{position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:9998;display:flex;flex-direction:column;gap:8px;}",
  ".zeus-anchor-dot{width:8px;height:8px;border-radius:50%;background:rgba(184,150,74,0.3);border:1px solid rgba(184,150,74,0.5);cursor:pointer;transition:all 0.2s;position:relative;}",
  ".zeus-anchor-dot:hover,.zeus-anchor-dot.active{background:#b8964a;box-shadow:0 0 6px rgba(184,150,74,0.8);}",
  ".zeus-anchor-dot:hover .anchor-tip{display:block;}",
  ".anchor-tip{display:none;position:absolute;right:16px;top:50%;transform:translateY(-50%);background:#1a0d2e;color:#b8964a;font-family:'Space Mono',monospace;font-size:10px;padding:3px 8px;white-space:nowrap;border:1px solid rgba(184,150,74,0.3);pointer-events:none;}",
  "@media(max-width:600px){#zeus-anchors{display:none;}}"
].join("\n");

var PROGRESS_JS = [
  "var progressBar = document.getElementById('zeus-progress');",
  "var anchorDots = document.querySelectorAll('.zeus-anchor-dot');",
  "var sections = document.querySelectorAll('.zeus-section');",
  "function updateProgress() {",
  "  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;",
  "  var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;",
  "  var pct = scrollHeight > 0 ? (scrollTop / scrollHeight * 100) : 0;",
  "  if (progressBar) progressBar.style.width = pct + '%';",
  "  if (sections.length && anchorDots.length) {",
  "    var current = 0;",
  "    for (var i = 0; i < sections.length; i++) {",
  "      if (sections[i].getBoundingClientRect().top <= 120) current = i;",
  "    }",
  "    for (var j = 0; j < anchorDots.length; j++) {",
  "      anchorDots[j].classList.toggle('active', j === current);",
  "    }",
  "  }",
  "}",
  "window.addEventListener('scroll', updateProgress);",
  "updateProgress();"
].join("\n");

var SPARKLINE_JS = [
  "function drawSparkline(canvasId, data, color) {",
  "  var canvas = document.getElementById(canvasId);",
  "  if (!canvas || !canvas.getContext) return;",
  "  var ctx = canvas.getContext('2d');",
  "  var w = canvas.width;",
  "  var h = canvas.height;",
  "  var min = Math.min.apply(null, data);",
  "  var max = Math.max.apply(null, data);",
  "  var range = max - min || 1;",
  "  ctx.clearRect(0, 0, w, h);",
  "  ctx.beginPath();",
  "  for (var i = 0; i < data.length; i++) {",
  "    var x = (i / (data.length - 1)) * w;",
  "    var y = h - ((data[i] - min) / range) * (h - 4) - 2;",
  "    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);",
  "  }",
  "  ctx.strokeStyle = color || '#b8964a';",
  "  ctx.lineWidth = 1.5;",
  "  ctx.stroke();",
  "  var last = data[data.length - 1];",
  "  var x2 = w;",
  "  var y2 = h - ((last - min) / range) * (h - 4) - 2;",
  "  ctx.beginPath();",
  "  ctx.arc(x2, y2, 2.5, 0, Math.PI * 2);",
  "  ctx.fillStyle = color || '#b8964a';",
  "  ctx.fill();",
  "}"
].join("\n");

var STAMP_SVG_HTML = [
  "<div id='stampSvg' style='display:none;margin:16px auto;text-align:center;'>",
  "  <svg viewBox='0 0 120 52' width='200' height='87' xmlns='http://www.w3.org/2000/svg' style='opacity:0.35;filter:drop-shadow(0 0 16px rgba(184,150,74,0.9));'>",
  "    <defs>",
  "      <radialGradient id='stampIrisGrad' cx='50%' cy='50%' r='50%'>",
  "        <stop offset='0%' stop-color='#b088f9'/>",
  "        <stop offset='45%' stop-color='#6b4c9a'/>",
  "        <stop offset='100%' stop-color='#2d1b4e'/>",
  "      </radialGradient>",
  "      <clipPath id='stampEyeClip'><path d='M10,26 Q60,-10 110,26 Q60,62 10,26 Z'/></clipPath>",
  "    </defs>",
  "    <path d='M10,26 Q60,-10 110,26 Q60,62 10,26 Z' fill='none' stroke='#b8964a' stroke-width='2'/>",
  "    <g clip-path='url(#stampEyeClip)'>",
  "      <ellipse cx='60' cy='26' rx='18' ry='18' fill='url(#stampIrisGrad)'/>",
  "      <ellipse cx='60' cy='26' rx='7' ry='7' fill='#1a0d2e'/>",
  "      <ellipse cx='66' cy='21' rx='2.5' ry='1.8' fill='rgba(255,255,255,0.25)'/>",
  "    </g>",
  "  </svg>",
  "</div>"
].join("\n");

var STAMP_JS_TEMPLATE = [
  "var ISSUE_KEY = 'zd_checkin_DATECOMPACT';",
  "function doStamp() {",
  "  var btn = document.getElementById('stampBtn');",
  "  var stampEl = document.getElementById('stampSvg');",
  "  var timeEl = document.getElementById('stampTime');",
  "  if (!btn || btn.disabled) return;",
  "  var n = new Date();",
  "  var yr = String(n.getFullYear());",
  "  var mo = ('0' + (n.getMonth() + 1)).slice(-2);",
  "  var dy = ('0' + n.getDate()).slice(-2);",
  "  var hr = ('0' + n.getHours()).slice(-2);",
  "  var mi = ('0' + n.getMinutes()).slice(-2);",
  "  var sc = ('0' + n.getSeconds()).slice(-2);",
  "  var timeStr = yr + '-' + mo + '-' + dy + ' ' + hr + ':' + mi + ':' + sc;",
  "  localStorage.setItem(ISSUE_KEY, timeStr);",
  "  applyStamp(timeStr);",
  "}",
  "function applyStamp(timeStr) {",
  "  var btn = document.getElementById('stampBtn');",
  "  var stampEl = document.getElementById('stampSvg');",
  "  var timeEl = document.getElementById('stampTime');",
  "  if (!btn) return;",
  "  btn.disabled = true;",
  "  btn.style.opacity = '0.5';",
  "  btn.style.cursor = 'not-allowed';",
  "  if (stampEl) { stampEl.style.display = 'block'; }",
  "  if (timeEl) {",
  "    timeEl.style.display = 'block';",
  "    timeEl.textContent = '已阅时间：' + timeStr;",
  "  }",
  "}",
  "(function() {",
  "  var saved = localStorage.getItem(ISSUE_KEY);",
  "  if (saved) { applyStamp(saved); }",
  "})();"
].join("\n");

var HOME_BUTTON_HTML = [
  "<a href='https://zeus9.ai' style='position:fixed;bottom:24px;right:24px;z-index:9999;",
  "background:#b8964a;color:#1a0d2e;text-decoration:none;padding:10px 18px;border-radius:24px;",
  "font-family:\"Space Mono\",monospace;font-size:13px;font-weight:700;",
  "box-shadow:0 2px 12px rgba(184,150,74,0.4);display:flex;align-items:center;gap:6px;",
  "border:1.5px solid #8a6d2f;' title='返回主站'>",
  "&#8962; 首页</a>"
].join("");

async function generate() {
  console.log("Searching for latest news (Haiku)...");

  var searchResponse = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: "Search for today's major news for " + dateStr + ": world events, Trump/Musk updates, AI news, crypto prices (BTC ETH) with 7-day price trend, gold/silver prices in USD and MYR with 7-day trend, Malaysia news, fun/quirky stories. Give me 15-20 items total, brief summaries only.",
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

  var STAMP_JS = STAMP_JS_TEMPLATE.replace(/DATECOMPACT/g, dateCompact);

  var prompt = [
    "You are Zeus Daily — THE GOD'S EYE VIEW. Today is " + dateStr + ". Generate Vol." + volNumber + " as a single complete self-contained HTML file.",
    "",
    "=== NEWS CONTEXT ===",
    searchContext,
    "",
    "=== MISSION ===",
    "Do NOT merely summarize. Cross-reference ALL stories, find hidden connections, expose what mainstream media misses. Every 信息差 and 预测 must be BOLD, SPECIFIC, and NON-OBVIOUS. Zeus Daily has a distinct voice — authoritative, provocative, willing to make directional calls others won't.",
    "",
    "=== CRITICAL: USE THESE EXACT CODE BLOCKS VERBATIM — DO NOT MODIFY ===",
    "",
    "--- BOLT CSS (paste inside <style>) ---",
    BOLT_CSS,
    "",
    "--- PROGRESS BAR + ANCHOR NAV CSS (paste inside <style>) ---",
    PROGRESS_CSS,
    "",
    "--- BOLT SVG USAGE ---",
    "For EVERY bolt symbol on the page, use this SVG but replace UNIQUE with a sequential number (bolt1, bolt2, bolt3 etc):",
    BOLT_SVG_TEMPLATE,
    "Example: first bolt uses id 'boltGrad_bolt1', second uses 'boltGrad_bolt2', etc.",
    "",
    "--- EYE SVG (paste in header, exactly as-is) ---",
    EYE_SVG,
    "",
    "--- EYE + BLINK JAVASCRIPT (paste verbatim in the single script block) ---",
    EYE_JS,
    "",
    "--- PROGRESS BAR JAVASCRIPT (paste verbatim in the single script block) ---",
    PROGRESS_JS,
    "",
    "--- SPARKLINE JAVASCRIPT (paste verbatim in the single script block) ---",
    SPARKLINE_JS,
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
    "=== NEW: ONE-SENTENCE SUMMARY (mandatory, place immediately after header/eye, before financial dashboard) ===",
    "A single bold banner: '今天你只需要知道这一件事：[one sharp sentence that captures the single most important story of the day]'",
    "Style: centered, Playfair Display italic, gold left+right border lines, subtle purple bg, padding 20px. This is the hook.",
    "",
    "=== FINANCIAL DASHBOARD (static 4x2 grid) ===",
    "Row1: BTC/USD | ETH/USD | Gold XAU/USD | Silver XAG/USD",
    "Row2: USD/MYR | Crude Oil | S&P 500 | Fear & Greed Index",
    "Style: Space Mono, dark bg #1a1208, gold borders #b8964a, gold text for values.",
    "Fill with actual values from news context. Mobile: 2x4 grid.",
    "SPARKLINES: For BTC and Gold cells, add a canvas sparkline below the price.",
    "BTC canvas: <canvas id='spark-btc' width='100' height='28' style='display:block;margin:4px auto 0;'></canvas>",
    "Gold canvas: <canvas id='spark-gold' width='100' height='28' style='display:block;margin:4px auto 0;'></canvas>",
    "Then in the script block, after drawSparkline function, call it with 7 estimated daily prices from news context:",
    "Example: drawSparkline('spark-btc', [82000,83500,84200,83800,85000,84600,85400], '#f7931a');",
    "Example: drawSparkline('spark-gold', [2900,2910,2920,2905,2930,2945,2960], '#b8964a');",
    "Use real trend direction from news context. If price went up this week, show upward trend.",
    "",
    "=== PROGRESS BAR + ANCHOR NAV (mandatory) ===",
    "Add immediately after <body> tag: <div id='zeus-progress'></div>",
    "Each major section must have class='zeus-section' AND a unique id (e.g. id='sec-world', id='sec-power', etc.)",
    "Add anchor nav panel after progress bar div:",
    "<div id='zeus-anchors'>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-zhesi\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>哲思</span></div>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-world\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>世界</span></div>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-power\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>权力</span></div>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-ai\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>AI</span></div>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-crypto\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>币圈</span></div>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-metals\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>贵金属</span></div>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-my\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>马来西亚</span></div>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-fun\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>趣闻</span></div>",
    "  <div class='zeus-anchor-dot' onclick='document.getElementById(\"sec-horo\").scrollIntoView({behavior:\"smooth\"})'><span class='anchor-tip'>星座</span></div>",
    "</div>",
    "",
    "=== CROSS-REFERENCE LINKS (mandatory) ===",
    "After each news item summary, if that story connects to another section, add a cross-reference tag:",
    "<div style='margin-top:6px;font-family:Space Mono,monospace;font-size:10px;color:#5c3d8f;'>↔ 与本期 <a href='#sec-TARGET' style='color:#b8964a;text-decoration:none;border-bottom:1px dotted #b8964a;'>[版块名]</a> 相关</div>",
    "Examples: Fed decision → link to 贵金属 and 币圈. Oil price → link to 马来西亚. AI news → link to 权力之声.",
    "Use judgment — only add cross-refs where the connection is genuinely meaningful, not forced.",
    "",
    "=== SECTION FORMAT ===",
    "Every section title: [bolt SVG] Zeus.SectionName [bolt SVG]",
    "News items: SVG illustration (50x50) + bold headline + 2-3 sentence summary + cross-ref (if applicable) + 上帝视角 box",
    "",
    "=== GOD'S EYE ANALYSIS BOX — UPGRADED ===",
    "Style: purple left border 3px solid #5c3d8f, bg rgba(92,61,143,0.06), padding 12px 16px",
    "Label: '👁 上帝视角' in Space Mono gold",
    "Content MUST be bold and directional — not 'this may affect markets' but 'gold will hit $3,200 within 60 days because X, Y, Z'.",
    "Include: 【信息差】what most people missed + 【预测】a specific, time-bound, falsifiable prediction + 【马来西亚影响】local angle when relevant.",
    "Voice: confident, almost arrogant, like a hedge fund manager who has already made the trade.",
    "",
    "=== MANDATORY SECTIONS IN ORDER ===",
    "1. id='sec-zhesi' — Zeus.哲思 — philosophical opening connecting to today's biggest story",
    "2. id='sec-world' — Zeus.世界要闻 — 4-5 world news items with cross-refs",
    "3. id='sec-power' — Zeus.权力之声 — Trump & Musk 2-3 items with cross-refs",
    "4. id='sec-ai' — Zeus.AI前沿 — 3-4 AI/tech items with cross-refs",
    "5. id='sec-crypto' — Zeus.币圈 — BTC+ETH prices + 2-3 stories with cross-refs",
    "6. id='sec-metals' — Zeus.贵金属 — Gold+Silver with MYR context + cross-refs",
    "7. id='sec-my' — Zeus.马来西亚 — 2-3 Malaysia items",
    "8. id='sec-fun' — Zeus.趣闻 — MINIMUM 5 fun/quirky stories",
    "9. id='sec-horo' — Zeus.星座 — ALL 12 signs in 3x4 grid",
    "10. Zeus.结语 — meditative poetic closing",
    "11. Zeus.打卡 — check-in section with STAMP_SVG_HTML + stampBtn + stampTime",
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
