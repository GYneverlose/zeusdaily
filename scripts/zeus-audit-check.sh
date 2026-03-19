#!/bin/bash
# Zeus Daily 审核官拦截 — PreToolUse hook for Write tool
# 当写入 zeus-daily-*.html 时，检查审核报告是否存在

INPUT=$(cat)

# 提取 file_path
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')

# 只拦截 zeus-daily-YYYYMMDD.html 文件
if echo "$FILE_PATH" | grep -qE 'zeus-daily-[0-9]{8}\.html'; then
  # 提取日期
  DATE=$(echo "$FILE_PATH" | grep -oE '[0-9]{8}' | head -1)
  FORMATTED_DATE="${DATE:0:4}-${DATE:4:2}-${DATE:6:2}"

  AUDIT_INITIAL="zeusdaily/audit-initial-${FORMATTED_DATE}.md"
  AUDIT_FINAL="zeusdaily/audit-final-${FORMATTED_DATE}.md"

  # 检查初审报告
  if [ ! -f "$AUDIT_INITIAL" ]; then
    echo "⛔ 拦截：初审报告不存在 ($AUDIT_INITIAL)"
    echo ""
    echo "你必须先启动审核官 Agent（Teammate 3）完成初审。"
    echo "审核官审核通过后会生成 $AUDIT_INITIAL 文件。"
    echo ""
    echo "如果这是首次写入（组装阶段），请先完成 Phase 2 初审。"
    echo "如果这是更新已有文件，请确认初审已通过。"
    exit 1
  fi

  # 检查初审是否通过
  if ! grep -q "APPROVED" "$AUDIT_INITIAL" 2>/dev/null; then
    echo "⛔ 拦截：初审报告存在但未通过 ($AUDIT_INITIAL)"
    echo "审核官必须标注 ✅ APPROVED 才可继续。"
    exit 1
  fi

  echo "✅ 初审已通过 ($AUDIT_INITIAL)，允许写入。"
  echo "⚠️  提醒：组装完成后还需要启动审核官做终审（Phase 5）！"
fi

exit 0
