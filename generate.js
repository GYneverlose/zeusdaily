const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

// Today's date info
const now = new Date();
const dateStr = now.toISOString().split("T")[0];
const dateCompact = dateStr.replace(/-/g, "");
const fileName = "zeus-daily-" + dateCompact + ".html";
const filePath = path.join("zeusdaily", fileName);

// Check if today's edition already exists
if (fs.existsSync(filePath)) {
  console.log("Today's edition already exists: " + fileName);
  process.exit(0);
}

// Load editions.json
var editionsPath = path.join("zeusdaily", "editions.json");
var editionsData = JSON.parse(fs.readFileSync(editionsPath, "utf8"));
var volNumber = String(editionsData.editions.length + 1);
while (volNumber.length < 3) volNumber = "0" + volNumber;

console.log("Generating Zeus Daily Vol." + volNumber + " for " + dateStr + "...");

async function generate() {
  console.log("Searching for latest news...");

  var searchResponse = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: "Search for today's top global news, AI developments, crypto market, gold/silver prices, and Malaysia news for " + dateStr + ". Get at least 15-20 news items across these categories: world news, Trump/Musk updates, AI frontier, crypto, precious metals, Malaysia local news, and fun/quirky stories.",
      },
    ],
  });

  // Extract ALL content blocks including tool results
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

  // Truncate to avoid rate limit (30k input tokens per minute)
  if (searchContext.length > 8000) {
    searchContext = searchContext.slice(0, 8000);
  }

  console.log("Search context length: " + searchContext.length + " chars");

  console.log("Generating HTML edition...");

  var prompt = "You are Zeus Daily, the God's Eye View — a premium AI newspaper that sees what others cannot. Today is " + dateStr + ". Generate Vol." + volNumber + " as a complete self-contained HTML file.\n\nNews context from web search:\n" + searchContext + "\n\nYour task: Do NOT merely summarize the news. Cross-reference all stories, find hidden connections, identify what the mainstream media is missing, and deliver sharp 信息差 (information asymmetry) + 预测 (predictions) for every item. Your analysis must feel like it comes from an omniscient observer outside the system.\n\nSTRICT DESIGN (match exactly):\n- Background #faf8f4, text #2c2420, gold #b8964a, purple #5c3d8f\n- Fonts: Playfair Display + Crimson Pro + Space Mono via Google Fonts\n- Zeus Eye SVG: viewBox 120x52, almond/phoenix shape, nebula iris gradient #b088f9 to #6b4c9a to #2d1b4e, gold outline #b8964a\n- Eye blinks every 4-8 seconds via setAttribute on path d, pupil tracks mouse\n- Static 4x2 financial dashboard\n- Stamp button: time freezes on click, window.doStamp function\n\nSECTIONS IN ORDER:\n1. 哲思寄语 — original philosophical opening, not a generic quote\n2. 世界要闻 — 4-5 world news items\n3. 权力之声 — Trump and Musk, 2-3 items\n4. AI前沿 — 3-4 AI items, today only\n5. 币圈 — crypto with prices\n6. 贵金属财经 — gold/silver, Malaysia context\n7. 本地视角·马来西亚 — 2-3 Malaysia items\n8. 轻松趣闻 — 5+ fun/quirky stories\n9. 星座运势 — all 12 signs\n10. 沉静结语 — meditative closing\n11. 已阅打卡 — check-in stamp\n\nEVERY news item requires:\n- Creative thematic SVG illustration\n- 上帝视角 box with 信息差 and 预测 (must be sharp, specific, non-obvious)\n\nES5 ONLY — STRICT:\n- var only, no const or let\n- function declarations only, no arrow functions\n- ('0'+n).slice(-2) not padStart\n- Single script block before </body>\n- No SMIL, no beginElement\n- Blink via setAttribute on SVG path d attribute\n\nBRAND:\n- Header: ZEUS DAILY / THE GOD'S EYE VIEW\n- Footer: A Zeus 9 Publication · zeus9.ai\n- Date: " + dateStr + "\n\nOutput ONLY raw HTML. No markdown, no explanation, no fences.";

  var html = "";

  var stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });

  for await (var chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      html += chunk.delta.text;
    }
  }

  // Clean markdown fences if present
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
