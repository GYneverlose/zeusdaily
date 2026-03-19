#!/bin/bash
# Zeus Daily 发布拦截 — PreToolUse hook for Bash (git push)
# 发布前检查两份审核报告都存在且通过

INPUT=$(cat)

# 提取 command
COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')

# 只拦截 git push
if echo "$COMMAND" | grep -q "git push"; then
  # 获取今天的日期
  TODAY=$(date -u +%Y-%m-%d)

  AUDIT_INITIAL="zeusdaily/audit-initial-${TODAY}.md"
  AUDIT_FINAL="zeusdaily/audit-final-${TODAY}.md"

  MISSING=""

  if [ ! -f "$AUDIT_INITIAL" ] || ! grep -q "APPROVED" "$AUDIT_INITIAL" 2>/dev/null; then
    MISSING="${MISSING}\n  ⛔ 初审报告缺失或未通过: $AUDIT_INITIAL"
  fi

  if [ ! -f "$AUDIT_FINAL" ] || ! grep -q "APPROVED" "$AUDIT_FINAL" 2>/dev/null; then
    MISSING="${MISSING}\n  ⛔ 终审报告缺失或未通过: $AUDIT_FINAL"
  fi

  if [ -n "$MISSING" ]; then
    echo "══════════════════════════════════════════════════"
    echo "⛔ ZEUS DAILY 发布拦截 — 审核官未完成"
    echo "══════════════════════════════════════════════════"
    echo ""
    echo "以下审核报告缺失或未通过："
    echo -e "$MISSING"
    echo ""
    echo "请完成以下步骤后再 push："
    echo "  1. 启动审核官 Agent 做初审 → 生成 $AUDIT_INITIAL"
    echo "  2. 启动审核官 Agent 做终审 → 生成 $AUDIT_FINAL"
    echo "  3. 两份报告都包含 ✅ APPROVED 后才可 push"
    echo ""
    echo "如果今天不是发布日报（而是其他 push），请在 commit"
    echo "message 中加入 [skip-audit] 标记以绕过此检查。"
    echo "══════════════════════════════════════════════════"

    # 检查最近的 commit message 是否有 skip-audit
    LAST_MSG=$(git log -1 --pretty=%B 2>/dev/null)
    if echo "$LAST_MSG" | grep -q "skip-audit"; then
      echo ""
      echo "✅ 检测到 [skip-audit] 标记，允许 push。"
      exit 0
    fi

    exit 1
  fi

  echo "✅ 初审和终审均已通过，允许发布。"
fi

exit 0
