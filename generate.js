const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

// Today's date info
const now = new Date();
const dateStr = now.toISOString().split("T")[0]; // 2026-03-12
const dateCompact = dateStr.replace(/-/g, ""); // 20260312
const fileName = `zeus-daily-${dateCompact}.html`;
const filePath = path.join("zeusdaily", fileName);

// Check if today's edition already exists
if (fs.existsSync(filePath)) {
  console.log(`Today's edition already exists: ${fileName}`);
  process.exit(0);
}

// Load editions.json
const editionsPath = path.join("zeusdaily", "editions.json");
const editionsData = JSON.parse(fs.readFileSync(editionsPath, "utf8"));
const volNumber = String(editionsData.editions.length + 1).padStart(3, "0");

console.log(`Generating Zeus Daily Vol.${volNumber} for ${dateStr}...`);

async function generate() {
  // Step 1: Search for today's news using web search tool
  console.log("Searching for latest news...");

  const searchResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: `Search for today's top global news, AI developments, crypto market, gold/silver prices, and Malaysia news for ${dateStr}. Get at least 15-20 news items across these categories: world news, Trump/Musk updates, AI frontier, crypto, precious metals, Malaysia local news, and fun/quirky stories.`,
      },
    ],
  });

  // Extract search results
  const searchContext = searchResponse.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  // Step 2: Generate the full HTML newspaper
  console.log("Generating HTML edition...");

  const prompt = `You are Zeus Daily, a premium AI-powered daily newspaper with "The God's Eye View". 

Today is ${dateStr}. Generate Vol.${volNumber} of Zeus Daily as a complete, self-contained HTML file.

Use this news context gathered from web search:
${searchContext}

STRICT DESIGN REQUIREMENTS (must match exactly):
- White/cream background (#faf8f4), dark text (#2c2420), gold accents (#b8964a), purple for god's eye (#5c3d8f)
- Playfair Display + Crimson Pro + Space Mono fonts (Google Fonts)
- Zeus eye logo: SVG viewBox 120x52, almond shape, nebula iris (purple→dark), gold outline
- Eye blinks every 4-8 seconds, pupil tracks mouse
- Static 4×2 financial dashboard (no scrolling ticker)
- "已阅打卡" stamp button - time freezes on click

SECTIONS IN ORDER:
1. 哲思寄语 (Opening philosophical quote)
2. 世界要闻 (World news, 4-5 items with SVG illustrations)
3. 权力之声 (Trump & Musk latest, 2-3 items)
4. AI前沿 (AI news, 3-4 items - must be fresh today)
5. 币圈 (Crypto with price data)
6. 贵金属财经 (Gold/Silver with Malaysian context)
7. 本地视角·马来西亚 (Malaysia news, 2-3 items)
8. 轻松趣闻 (5+ fun/quirky stories)
9. 星座运势 (Horoscope, all 12 signs)
10. 沉静结语 (Closing reflection)
11. 已阅打卡 (Check-in stamp button)

EVERY news item must have:
- SVG illustration (creative, thematic)
- 上帝视角 box with "信息差" (information gap) + "预测" (prediction)

TECHNICAL REQUIREMENTS (ES5 only, no arrow functions, no const/let):
- var declarations only
- function keyword (no arrow functions)
- ('0'+n).slice(-2) instead of padStart
- Single <script> block before </body>
- No SMIL animate
- Blink: setAttribute on path d
- Already-read stamp: window.doStamp, time freezes on click

BRAND:
- Header: ZEUS DAILY / THE GOD'S EYE VIEW
- Footer: A Zeus 9 Publication · zeus9.ai
- File date: ${dateStr}

Output ONLY the complete HTML, no explanation, no markdown fences.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });

  let html = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Clean up any markdown fences if present
  html = html.replace(/^```html\n?/i, "").replace(/\n?```$/i, "").trim();

  // Save the edition file
  fs.writeFileSync(filePath, html, "utf8");
  console.log(`✅ Saved: ${fileName}`);

  // Also update index.html (latest edition)
  fs.writeFileSync(path.join("zeusdaily", "index.html"), html, "utf8");
  console.log("✅ Updated index.html");

  // Update editions.json
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const d = new Date(dateStr + "T00:00:00");
  const summary = `Vol.${volNumber} · ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

  editionsData.editions.push({
    date: dateStr,
    vol: volNumber,
    title: "Zeus Daily",
    file: fileName,
    summary: summary,
  });

  fs.writeFileSync(editionsPath, JSON.stringify(editionsData, null, 2), "utf8");
  console.log("✅ Updated editions.json");

  console.log(`\n🔱 Zeus Daily Vol.${volNumber} generated successfully!`);
}

generate().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
