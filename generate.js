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
  console.log("Searching for latest news...");

  var searchResponse = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: "Search for today's major news for " + dateStr + ": world events, Trump/Musk updates, AI news, crypto prices, gold/silver prices, Malaysia news, fun stories. Give me 15 items total, brief summaries only.",
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

  // Wait 65 seconds to reset the per-minute token rate limit
  console.log("Waiting 65 seconds for rate limit reset...");
  await sleep(65000);

  console.log("Generating HTML edition...");

  var prompt = "You are Zeus Daily, the God's Eye View. Today is " + dateStr + ". Generate Vol." + volNumber + " as a complete self-contained HTML file.\n\nNews context:\n" + searchContext + "\n\nCross-reference stories, find hidden connections, deliver sharp 信息差 + 预测 for every item.\n\nDESIGN: bg #faf8f4, text #2c2420, gold #b8964a, purple #5c3d8f. Fonts: Playfair Display + Crimson Pro + Space Mono (Google Fonts). Zeus Eye SVG viewBox 120x52 almond shape, nebula iris #b088f9 to #6b4c9a to #2d1b4e, gold outline. Eye blinks via setAttribute on path d, pupil tracks mouse. Static 4x2 financial dashboard. Stamp freezes on click.\n\nSECTIONS: 1.哲思寄语 2.世界要闻(4-5 items) 3.权力之声(Trump/Musk) 4.AI前沿(3-4 items) 5.币圈 6.贵金属财经 7.本地视角·马来西亚 8.轻松趣闻(5+) 9.星座运势(all 12) 10.沉静结语 11.已阅打卡\n\nEach news item: SVG illustration + 上帝视角 box with 信息差 and 预测.\n\nES5 ONLY: var only, function keyword, no arrows, single script before </body>, no SMIL.\n\nHeader: ZEUS DAILY / THE GOD'S EYE VIEW. Footer: A Zeus 9 Publication · zeus9.ai. Date: " + dateStr + "\n\nOutput ONLY raw HTML, no markdown, no fences.";

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
