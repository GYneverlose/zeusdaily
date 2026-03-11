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
  // Step 1: Search using Haiku (high rate limits, cheap)
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

  // Step 2: Generate HTML using Opus (best quality)
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
    "=== LOCKED DESIGN SPEC (20260311) ===",
    "",
    "COLORS: bg #faf8f4, text #2c2420, gold #b8964a, gold-dark #8a6d2f, purple #5c3d8f",
    "",
    "FONTS (Google Fonts): Playfair Display 400/700/900, Crimson Pro 400/600, Space Mono 400",
    "",
    "ZEUS EYE — LOCKED GEOMETRY (凤眼 phoenix eye):",
    "viewBox '0 0 120 52'. Outer almond gold path (stroke #b8964a stroke-width 1.5 fill none):",
    "M10,26 C25,8 45,4 60,4 C75,4 95,8 110,26 C95,44 75,48 60,48 C45,48 25,44 10,26 Z",
    "Iris radial gradient cx=60 cy=26 r=18: #b088f9 0%, #6b4c9a 45%, #2d1b4e 100%",
    "Iris circle cx=60 cy=26 r=18. Pupil cx=60 cy=26 r=7 fill #1a0d2e.",
    "Gold glow ring cx=60 cy=26 r=18 stroke #b8964a stroke-width 1 opacity 0.6.",
    "Highlight1 cx=54 cy=21 r=3 fill white opacity 0.7. Highlight2 cx=58 cy=19 r=1.5 fill white opacity 0.5.",
    "Eyelid path id=eyelidPath fill #faf8f4. Open: M10,26 C25,26 45,26 60,26 C75,26 95,26 110,26 L110,26 C95,26 75,26 60,26 C45,26 25,26 10,26 Z",
    "Closed: M10,26 C25,8 45,4 60,4 C75,4 95,8 110,26 C95,44 75,48 60,48 C45,48 25,44 10,26 Z",
    "Blink every 4-8s randomly via setAttribute on eyelidPath d. Pupil tracks mouse, clamp cx 54-66 cy 20-32.",
    "",
    "FINANCIAL DASHBOARD (static 4x2 grid, no ticker):",
    "Row1: BTC/USD | ETH/USD | Gold XAU/USD | Silver XAG/USD",
    "Row2: USD/MYR | Crude Oil | S&P 500 | Fear & Greed Index",
    "Style: Space Mono, dark bg #1a1208, gold borders, gold text for values.",
    "",
    "STAMP: Red circular seal SVG. 已阅(top arc) 打卡(bottom arc) date in center. Purple border #5c3d8f red ink #cc2200.",
    "window.doStamp(): on click stamp appears, time FREEZES at click time, button unclickable after.",
    "",
    "=== SECTIONS (MANDATORY ORDER) ===",
    "1. 哲思寄语 — original philosophical opening connected to today's themes",
    "2. 世界要闻 — 4-5 items. Each: SVG illustration + headline + summary + 上帝视角 box (信息差 + 预测)",
    "3. 权力之声 — Trump & Musk, 2-3 items. Same format.",
    "4. AI前沿 — 3-4 AI items today only. Same format.",
    "5. 币圈 — BTC+ETH prominent, 2-3 items. Same format.",
    "6. 贵金属财经 — Gold/Silver with MYR context. 1-2 items. Same format.",
    "7. 本地视角·马来西亚 — 2-3 Malaysia items. Same format.",
    "8. 轻松趣闻 — 5+ fun stories. Same format.",
    "9. 星座运势 — All 12 signs in grid, 2 sentences each.",
    "10. 沉静结语 — Meditative poetic closing.",
    "11. 已阅打卡 — Stamp section centered.",
    "",
    "=== ES5 RULES (ABSOLUTE) ===",
    "var ONLY. No const, no let. function keyword ONLY, zero arrow functions.",
    "('0'+n).slice(-2) for zero-padding. Single <script> before </body>.",
    "No SMIL. No animate tags. No beginElement. Blink via setAttribute only.",
    "",
    "=== BRAND ===",
    "Header: ZEUS DAILY (Playfair 900 gold) / THE GOD'S EYE VIEW (Space Mono)",
    "Footer: A Zeus 9 Publication · zeus9.ai · Vol." + volNumber,
    "Title tag: Zeus Daily Vol." + volNumber + " · " + dateStr,
    "",
    "Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown. No fences. No explanation."
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

  console.log("\n🔱 Zeus Daily Vol." + volNumber + " generated successfully!");
}

generate().catch(function(err) {
  console.error("Generation failed:", err);
  process.exit(1);
});
