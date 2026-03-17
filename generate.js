const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

// ── Supabase 配置 ────────────────────────────────────────
// 填入你的 Supabase 项目信息（Settings → API）
var SUPA_URL = process.env.SUPABASE_URL || "https://YOUR_PROJECT.supabase.co";
var SUPA_KEY = process.env.SUPABASE_ANON_KEY || "YOUR_ANON_KEY";
// ─────────────────────────────────────────────────────────

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

// ── 打卡盖章：可爱紫色闪电 + Supabase 写入 + localStorage 降级 ──
var STAMP_HTML = [
  "<div style='display:flex;flex-direction:column;align-items:center;padding:24px 0 8px;border-top:1px solid rgba(184,150,74,0.3);margin-top:24px;'>",
  "  <div style='font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#8a6d2f;margin-bottom:10px;font-family:\"Space Mono\",monospace;'>已阅今日</div>",
  "  <button id='stampBtn' onclick='doStamp()' style='",
  "    width:68px;height:68px;border-radius:50%;",
  "    border:1.8px solid #8b5cf6;background:#faf8f4;",
  "    cursor:pointer;display:flex;flex-direction:column;",
  "    align-items:center;justify-content:center;gap:2px;",
  "    transition:transform 0.15s,box-shadow 0.15s;",
  "    position:relative;'>",
  "    <svg viewBox='0 0 48 64' width='22' height='29' xmlns='http://www.w3.org/2000/svg'>",
  "      <defs>",
  "        <radialGradient id='stampBoltGrad' cx='50%' cy='40%' r='55%'>",
  "          <stop offset='0%' stop-color='#c084fc'/>",
  "          <stop offset='100%' stop-color='#7c3aed'/>",
  "        </radialGradient>",
  "      </defs>",
  "      <path d='M30 2 L10 30 L20 30 L14 62 L38 26 L26 26 Z'",
  "        fill='rgba(139,92,246,0.15)' stroke='none'/>",
  "      <path d='M30 2 L10 30 L20 30 L14 62 L38 26 L26 26 Z'",
  "        fill='url(#stampBoltGrad)' stroke='#ddd6fe' stroke-width='1.2' stroke-linejoin='round'/>",
  "      <path d='M27 6 L13 28 L22 28 L18 52 L32 29 L24 29 Z'",
  "        fill='rgba(255,255,255,0.2)'/>",
  "      <circle cx='6' cy='18' r='1.8' fill='#e9d5ff' opacity='0.7'/>",
  "      <circle cx='42' cy='42' r='1.5' fill='#c084fc' opacity='0.6'/>",
  "      <circle cx='40' cy='12' r='1.2' fill='#f0abfc' opacity='0.55'/>",
  "    </svg>",
  "    <span id='stampText' style='font-family:\"Space Mono\",monospace;font-size:7px;letter-spacing:1.5px;text-transform:uppercase;color:#8a6d2f;'>盖章</span>",
  "    <canvas id='stampCanvas' width='200' height='200'",
  "      style='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:0;'></canvas>",
  "  </button>",
  "  <div id='stampTime' style='font-size:10px;color:#b8964a;font-family:\"Space Mono\",monospace;margin-top:8px;letter-spacing:0.8px;min-height:16px;text-align:center;'></div>",
  "</div>"
].join("\n");

// Supabase JS 注入：在 </head> 前插入（由 generate.js 注入真实 URL/KEY）
var SUPA_SCRIPT_TAG =
  "<script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'></script>";

// 盖章 JS：Supabase 写入 + localStorage 降级 + UTC 时间 + 点点特效
// SUPA_URL_PLACEHOLDER 和 SUPA_KEY_PLACEHOLDER 由 generate.js 替换为真实值
var STAMP_JS_TEMPLATE = [
  "/* ── 打卡系统 ─────────────────────────────── */",
  "var _SUPA_URL = 'SUPA_URL_PLACEHOLDER';",
  "var _SUPA_KEY = 'SUPA_KEY_PLACEHOLDER';",
  "var _EDITION  = 'DATESTR_PLACEHOLDER';",
  "var _LSKEY    = 'zd_stamp_DATECOMPACT_PLACEHOLDER';",
  "var _stamped  = false;",
  "var _supa     = null;",
  "try { _supa = supabase.createClient(_SUPA_URL, _SUPA_KEY); } catch(e) {}",
  "",
  "function _fmtUTC(d) {",
  "  var h = ('0' + d.getUTCHours()).slice(-2);",
  "  var m = ('0' + d.getUTCMinutes()).slice(-2);",
  "  return _EDITION + ' · ' + h + ':' + m + ' UTC';",
  "}",
  "",
  "function _applyStamp(ts) {",
  "  if (_stamped) return;",
  "  _stamped = true;",
  "  var btn = document.getElementById('stampBtn');",
  "  var txt = document.getElementById('stampText');",
  "  var tel = document.getElementById('stampTime');",
  "  if (btn) {",
  "    btn.style.borderColor = '#7c3aed';",
  "    btn.style.background  = 'rgba(92,61,143,0.06)';",
  "    btn.style.cursor      = 'default';",
  "    btn.onclick = null;",
  "  }",
  "  if (txt) txt.textContent = '已阅';",
  "  if (tel) tel.textContent = '已阅 · ' + ts;",
  "}",
  "",
  "/* 页面加载：先查 localStorage，再查 Supabase */",
  "(function _initStamp() {",
  "  try {",
  "    var cached = localStorage.getItem(_LSKEY);",
  "    if (cached) { _applyStamp(cached); return; }",
  "  } catch(e) {}",
  "  if (!_supa) return;",
  "  _supa.auth.getSession().then(function(r) {",
  "    var s = r.data && r.data.session;",
  "    if (!s) return;",
  "    _supa.from('checkins')",
  "      .select('checked_at')",
  "      .eq('user_id', s.user.id)",
  "      .eq('edition_date', _EDITION)",
  "      .maybeSingle()",
  "      .then(function(res) {",
  "        if (res.data && res.data.checked_at) {",
  "          var ts = _fmtUTC(new Date(res.data.checked_at));",
  "          try { localStorage.setItem(_LSKEY, ts); } catch(e) {}",
  "          _applyStamp(ts);",
  "        }",
  "      });",
  "  });",
  "})();",
  "",
  "/* 点击盖章 */",
  "function doStamp() {",
  "  if (_stamped) return;",
  "  var pv = document.getElementById('stampCanvas');",
  "  var now = new Date();",
  "  var ts  = _fmtUTC(now);",
  "  _applyStamp(ts);",
  "  try { localStorage.setItem(_LSKEY, ts); } catch(e) {}",
  "  if (_supa) {",
  "    _supa.auth.getSession().then(function(r) {",
  "      var s = r.data && r.data.session;",
  "      if (!s) return;",
  "      _supa.from('checkins').upsert({",
  "        user_id:      s.user.id,",
  "        edition_date: _EDITION,",
  "        checked_at:   now.toISOString()",
  "      }, { onConflict: 'user_id,edition_date' });",
  "    });",
  "  }",
  "  _launchParticles(pv);",
  "}",
  "",
  "/* 点点爆散特效 */",
  "function _launchParticles(cv) {",
  "  if (!cv) return;",
  "  cv.style.opacity = '1';",
  "  var ctx = cv.getContext('2d');",
  "  var W = cv.width, H = cv.height;",
  "  var cx = W/2, cy = H/2;",
  "  var colors = ['#c084fc','#a78bfa','#e9d5ff','#7c3aed','#f0abfc','#fbbf24','#ddd6fe','#ffffff'];",
  "  var parts = [];",
  "  for (var i = 0; i < 48; i++) {",
  "    var ang = (Math.PI * 2 / 48) * i + (Math.random() - 0.5) * 0.4;",
  "    var spd = 1.8 + Math.random() * 3.5;",
  "    parts.push({",
  "      x: cx, y: cy,",
  "      vx: Math.cos(ang) * spd,",
  "      vy: Math.sin(ang) * spd,",
  "      sz: 2 + Math.random() * 4.5,",
  "      col: colors[Math.floor(Math.random() * colors.length)],",
  "      alpha: 1,",
  "      star: Math.random() > 0.5,",
  "      rot: Math.random() * Math.PI * 2,",
  "      rs:  (Math.random() - 0.5) * 0.25",
  "    });",
  "  }",
  "  var frame = 0;",
  "  function tick() {",
  "    ctx.clearRect(0, 0, W, H);",
  "    frame++;",
  "    for (var j = 0; j < parts.length; j++) {",
  "      var p = parts[j];",
  "      p.x += p.vx; p.y += p.vy; p.vy += 0.09;",
  "      p.alpha -= 0.022; p.rot += p.rs;",
  "      if (p.alpha <= 0) continue;",
  "      ctx.save();",
  "      ctx.globalAlpha = Math.max(0, p.alpha);",
  "      ctx.fillStyle = p.col;",
  "      ctx.translate(p.x, p.y);",
  "      ctx.rotate(p.rot);",
  "      if (p.star) {",
  "        ctx.beginPath();",
  "        for (var k = 0; k < 8; k++) {",
  "          var r = (k % 2 === 0) ? p.sz/2 : p.sz/4;",
  "          var a = (Math.PI/4)*k - Math.PI/2;",
  "          if (k===0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);",
  "          else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);",
  "        }",
  "        ctx.closePath(); ctx.fill();",
  "      } else {",
  "        ctx.beginPath();",
  "        ctx.arc(0, 0, p.sz/2, 0, Math.PI*2);",
  "        ctx.fill();",
  "      }",
  "      ctx.restore();",
  "    }",
  "    if (frame < 65) { requestAnimationFrame(tick); }",
  "    else { ctx.clearRect(0,0,W,H); cv.style.opacity='0'; }",
  "  }",
  "  requestAnimationFrame(tick);",
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

async function generate() {
  console.log("Searching for latest news (Haiku)...");

  var searchMessages = [
    {
      role: "user",
      content: "Search for today's major news for " + dateStr + ": world events, Trump/Musk updates, AI news, crypto prices (BTC ETH) with 7-day price trend, gold/silver prices in USD and MYR with 7-day trend, Malaysia news, fun/quirky stories. Give me 15-20 items total, brief summaries only.",
    },
  ];

  // Multi-turn loop: keep going while the model wants to use tools
  var searchContext = "";
  var maxTurns = 10;
  for (var turn = 0; turn < maxTurns; turn++) {
    var searchResponse = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: searchMessages,
    });

    // Extract text from this response
    var textParts = searchResponse.content
      .filter(function(b) { return b.type === "text"; })
      .map(function(b) { return b.text; });
    if (textParts.length) {
      searchContext += textParts.join("\n") + "\n";
    }

    // If stop_reason is not "tool_use", we're done
    if (searchResponse.stop_reason !== "tool_use") break;

    // Build tool_result messages for each tool_use block
    searchMessages.push({ role: "assistant", content: searchResponse.content });
    var toolResults = searchResponse.content
      .filter(function(b) { return b.type === "tool_use"; })
      .map(function(b) {
        return { type: "tool_result", tool_use_id: b.id, content: "" };
      });
    searchMessages.push({ role: "user", content: toolResults });
  }

  searchContext = searchContext.trim();
  if (searchContext.length > 8000) {
    searchContext = searchContext.slice(0, 8000);
  }

  console.log("Search context length: " + searchContext.length + " chars");
  console.log("Generating HTML edition (Opus)...");

  // 替换占位符为真实值
  var STAMP_JS = STAMP_JS_TEMPLATE
    .replace(/SUPA_URL_PLACEHOLDER/g, SUPA_URL)
    .replace(/SUPA_KEY_PLACEHOLDER/g, SUPA_KEY)
    .replace(/DATESTR_PLACEHOLDER/g, dateStr)
    .replace(/DATECOMPACT_PLACEHOLDER/g, dateCompact);

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
    "--- SUPABASE SDK (paste this exact tag inside <head>, before </head>) ---",
    SUPA_SCRIPT_TAG,
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
    "--- STAMP JAVASCRIPT (paste verbatim in the single script block, DO NOT MODIFY ANY VALUE) ---",
    STAMP_JS,
    "",
    "--- STAMP HTML (paste this ENTIRE block in Zeus.打卡 section, DO NOT MODIFY) ---",
    STAMP_HTML,
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
    "Then in the script block, after drawSparkline function, call it with 7 estimated daily prices from news context.",
    "Use real trend direction from news context.",
    "",
    "=== PROGRESS BAR + ANCHOR NAV (mandatory) ===",
    "Add immediately after <body> tag: <div id='zeus-progress'></div>",
    "Each major section must have class='zeus-section' AND a unique id.",
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
    "Only add cross-refs where the connection is genuinely meaningful.",
    "",
    "=== SECTION FORMAT ===",
    "Every section title: [bolt SVG] Zeus.SectionName [bolt SVG]",
    "News items: SVG illustration (50x50) + bold headline + 2-3 sentence summary + cross-ref (if applicable) + 上帝视角 box",
    "",
    "=== GOD'S EYE ANALYSIS BOX — UPGRADED ===",
    "Style: purple left border 3px solid #5c3d8f, bg rgba(92,61,143,0.06), padding 12px 16px",
    "Label: '👁 上帝视角' in Space Mono gold",
    "Content MUST be bold and directional.",
    "Include: 【信息差】what most people missed + 【预测】a specific, time-bound, falsifiable prediction + 【马来西亚影响】local angle when relevant.",
    "",
    "=== MANDATORY SECTIONS IN ORDER ===",
    "1. id='sec-zhesi' — Zeus.哲思",
    "2. id='sec-world' — Zeus.世界要闻 — 4-5 items",
    "3. id='sec-power' — Zeus.权力之声 — Trump & Musk 2-3 items",
    "4. id='sec-ai'    — Zeus.AI前沿 — 3-4 items",
    "5. id='sec-crypto'— Zeus.币圈",
    "6. id='sec-metals'— Zeus.贵金属",
    "7. id='sec-my'    — Zeus.马来西亚 — 2-3 items",
    "8. id='sec-fun'   — Zeus.趣闻 — MINIMUM 5 items",
    "9. id='sec-horo'  — Zeus.星座 — ALL 12 signs in 3x4 grid",
    "10. Zeus.结语",
    "11. Zeus.打卡 — paste STAMP_HTML block here verbatim",
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

  editionsData.editions.push({
    vol: volNumber,
    date: dateCompact,
    filename: fileName,
    title: "Zeus Daily Vol." + volNumber,
  });

  fs.writeFileSync(editionsPath, JSON.stringify(editionsData, null, 2), "utf8");
  console.log("Updated editions.json");

  console.log("\n⚡ Zeus Daily Vol." + volNumber + " generated successfully!");
}

generate().catch(function(err) {
  console.error("Generation failed:", err);
  process.exit(1);
});
