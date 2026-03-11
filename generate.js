const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

// Today's date info
const now = new Date();
const dateStr = now.toISOString().split("T")[0]; // 2026-03-12
const dateCompact = dateStr.replace(/-/g, ""); // 20260312
const fileName = "zeus-daily-" + dateCompact + ".html";
const filePath = path.join("zeusdaily", fileName);

// Check if today's edition already exists
if (fs.existsSync(filePath)) {
  console.log("Today's edition already exists: " + fileName);
  process.exit(0);
}

// Load editions.json (with fallback if not exists)
const editionsPath = path.join("zeusdaily", "editions.json");
var editionsData = { editions: [] };
if (fs.existsSync(editionsPath)) {
  editionsData = JSON.parse(fs.readFileSync(editionsPath, "utf8"));
}
const volNumber = String(editionsData.editions.length + 1).padStart(3, "0");

console.log("Generating Zeus Daily Vol." + volNumber + " for " + dateStr + "...");

async function generate() {
  // ─── Step 1: Search for today's news ───────────────────────────────────────
  console.log("Searching for latest news...");

  const searchResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    tool_choice: { type: "auto" },
    system: "You are a news researcher. Use web_search multiple times to gather comprehensive, up-to-date news. Search for each category separately to get the most results.",
    messages: [
      {
        role: "user",
        content:
          "Today is " + dateStr + ". Please search for the following news categories one by one:\n" +
          "1. Top global world news today\n" +
          "2. Trump and Elon Musk latest news today\n" +
          "3. AI and technology news today (new models, launches, breakthroughs)\n" +
          "4. Bitcoin Ethereum crypto prices and news today\n" +
          "5. Gold silver precious metals prices today\n" +
          "6. Malaysia news today\n" +
          "7. Funny quirky viral stories today\n\n" +
          "Search each category and compile a detailed summary with at least 3-4 stories per category.",
      },
    ],
  });

  // Extract ALL content - both text synthesis AND raw tool results
  var searchContext = "";

  searchResponse.content.forEach(function(block) {
    if (block.type === "text") {
      searchContext += block.text + "\n\n";
    } else if (block.type === "tool_result") {
      // Raw search results from web_search tool
      if (block.content) {
        block.content.forEach(function(item) {
          if (item.type === "text") {
            searchContext += item.text + "\n\n";
          }
        });
      }
    }
  });

  // Also extract from nested tool_use → tool_result pairs
  // The web search tool returns results embedded differently, capture everything
  var rawText = JSON.stringify(searchResponse.content);
  // Pull out any text snippets from the raw response as fallback
  if (searchContext.trim().length < 500) {
    console.log("Warning: search context seems short, using raw response...");
    searchContext = rawText;
  }

  console.log("Search context length: " + searchContext.length + " chars");

  // ─── Step 2: Generate full HTML newspaper ───────────────────────────────────
  console.log("Generating HTML edition...");

  const prompt =
    "You are Zeus Daily, a premium AI-powered daily newspaper with 'The God's Eye View'.\n\n" +
    "Today is " + dateStr + ". Generate Vol." + volNumber + " of Zeus Daily as a COMPLETE, self-contained HTML file.\n\n" +
    "NEWS CONTEXT (use all of this, prioritise the most impactful stories):\n" +
    searchContext + "\n\n" +
    "═══════════════════════════════════════\n" +
    "STRICT DESIGN REQUIREMENTS:\n" +
    "═══════════════════════════════════════\n" +
    "- Background: #faf8f4 (cream white), Text: #2c2420 (dark), Gold: #b8964a, Purple: #5c3d8f\n" +
    "- Fonts: Playfair Display + Crimson Pro + Space Mono (Google Fonts)\n" +
    "- Zeus Eye logo: SVG viewBox='0 0 120 52', almond/杏眼 shape\n" +
    "  Upper lid: M6,26 Q60,-8 114,26  Lower lid: M6,26 Q60,60 114,26\n" +
    "  Gold stroke 1.5px + eyeGlow filter. Iris r=18 nebula gradient (#b088f9→#6b4c9a→#2d1b4e)\n" +
    "  Pupil r=6 black + pupilGlow gold r=8. Two highlights: white r=1.5 + gold r=0.8\n" +
    "- Eye blinks every 4-8 seconds (setAttribute on path d, 200ms closed)\n" +
    "- Pupil tracks mouse (4px movement)\n" +
    "- Static 4×2 financial dashboard (8 cells, no scrolling ticker)\n" +
    "- Section header eyes: viewBox='0 0 36 16', mini eyes viewBox='0 0 24 11'\n" +
    "- Already-read stamp: window.doStamp, time freezes on click (no setInterval)\n\n" +
    "═══════════════════════════════════════\n" +
    "SECTIONS IN ORDER:\n" +
    "═══════════════════════════════════════\n" +
    "1. 哲思寄语 — Opening philosophical reflection (original, deep, poetic)\n" +
    "2. 世界要闻 — World news, 4-5 items with SVG illustrations\n" +
    "3. 权力之声 — Trump & Musk latest (2-3 items)\n" +
    "4. AI前沿 — AI news 3-4 items (must be today's fresh news)\n" +
    "5. 币圈 — Crypto with price data + chart visual\n" +
    "6. 贵金属财经 — Gold/Silver with Malaysian Ringgit context\n" +
    "7. 本地视角·马来西亚 — Malaysia news 2-3 items\n" +
    "8. 轻松趣闻 — 5+ fun/quirky stories (MUST have at least 5)\n" +
    "9. 星座运势 — All 12 horoscopes (brief, witty)\n" +
    "10. 沉静结语 — Closing reflection (poetic, memorable)\n" +
    "11. 已阅打卡 — Check-in stamp button with eye\n\n" +
    "EVERY news item must have:\n" +
    "- A creative SVG illustration (thematic, beautiful)\n" +
    "- 上帝视角 box containing:\n" +
    "  · 信息差: insight the masses miss\n" +
    "  · 预测: bold, specific prediction\n\n" +
    "═══════════════════════════════════════\n" +
    "TECHNICAL REQUIREMENTS (CRITICAL - ES5 ONLY):\n" +
    "═══════════════════════════════════════\n" +
    "- ALL JS must use var (NO const, NO let)\n" +
    "- ALL functions must use function keyword (NO arrow functions =>)\n" +
    "- Use ('0'+n).slice(-2) instead of padStart()\n" +
    "- Single <script> block placed just before </body>\n" +
    "- NO SMIL animate elements (no <animate>, no beginElement)\n" +
    "- Blink eye: use setAttribute to swap path d attribute\n" +
    "- Stamp: window.doStamp global function, capture time once, never update again\n" +
    "- blinkAll() function syncs all eyes simultaneously\n\n" +
    "═══════════════════════════════════════\n" +
    "BRAND:\n" +
    "═══════════════════════════════════════\n" +
    "- Header: ZEUS DAILY / THE GOD'S EYE VIEW\n" +
    "- Footer: A Zeus 9 Publication · zeus9.ai\n" +
    "- Edition date: " + dateStr + " · Vol." + volNumber + "\n\n" +
    "Output ONLY the complete HTML document. No explanation. No markdown code fences. Start with <!DOCTYPE html>.";

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 32000,   // ← FIXED: was 16000, need 32000 for full HTML
    messages: [{ role: "user", content: prompt }],
  });

  var html = response.content
    .filter(function(b) { return b.type === "text"; })
    .map(function(b) { return b.text; })
    .join("");

  // Clean up any accidental markdown fences
  html = html.replace(/^```html\n?/i, "").replace(/\n?```$/i, "").trim();

  // Sanity check - make sure we got a real HTML file
  if (html.length < 5000) {
    throw new Error("Generated HTML is too short (" + html.length + " chars) - likely truncated or failed");
  }
  console.log("HTML length: " + html.length + " chars");

  // ─── Step 3: Save files ──────────────────────────────────────────────────────
  // Ensure output directory exists
  if (!fs.existsSync("zeusdaily")) {
    fs.mkdirSync("zeusdaily", { recursive: true });
  }

  fs.writeFileSync(filePath, html, "utf8");
  console.log("✅ Saved: " + fileName);

  // Update index.html (latest edition redirect/display)
  fs.writeFileSync(path.join("zeusdaily", "index.html"), html, "utf8");
  console.log("✅ Updated index.html");

  // Update editions.json
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
  console.log("✅ Updated editions.json");

  console.log("\n🔱 Zeus Daily Vol." + volNumber + " generated successfully!");
}

generate().catch(function(err) {
  console.error("Generation failed:", err);
  process.exit(1);
});
