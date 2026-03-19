#!/bin/bash
# Zeus Daily 工作流提醒 — UserPromptSubmit hook
# 当用户输入"嗨嗨"时，强制输出完整工作流程和审核官要求

INPUT=$(cat)

if echo "$INPUT" | grep -q "嗨嗨"; then
  cat << 'REMINDER'
══════════════════════════════════════════════════
⚡ ZEUS DAILY 生成流程 — 强制工作流 ⚡
══════════════════════════════════════════════════

你必须严格按以下顺序执行，不可跳过任何步骤：

Phase 1 — 采集（并行）
  → Teammate 1（资料猎手）+ Teammate 2（数据官）

Phase 2 — 初审 ⛔ 必须启动审核官 Agent
  → Teammate 3（审核官）逐项审核两位 Teammate 的产出
  → 审核官必须输出 audit-initial-YYYY-MM-DD.md
  → 包含 "✅ APPROVED" 才可进入下一步

Phase 3 — 预测验证 + Credits 发放

Phase 4 — 组装（Lead 撰写哲思/上帝视角/结语 + 组装 HTML）

Phase 5 — 终审 ⛔ 必须再次启动审核官 Agent
  → Teammate 3 审核完整 HTML
  → 审核官必须输出 audit-final-YYYY-MM-DD.md
  → 包含 "✅ APPROVED" 才可发布

Phase 6 — 发布（HTML + Supabase editions + editions.json + git push）

Phase 7 — 外部对标（至少 3 组 web search）

Phase 8 — 复盘 + review-log.md 更新

⚠️  如果你试图跳过审核官，Write 和 git push 将被 HOOK 拦截！
══════════════════════════════════════════════════
REMINDER
fi

exit 0
