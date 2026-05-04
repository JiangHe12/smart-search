#!/bin/bash

MARKER="/tmp/.smart-search-strategy-applied"

# Allow if skill has been invoked in this session
if [ -f "$MARKER" ]; then
  exit 0
fi

# Deny search tool calls until skill is invoked
TOOL="${CLAUDE_TOOL_NAME:-unknown}"

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "You must invoke the /smart-search:search skill before using any search tool ($TOOL). Follow the skill's workflow, then retry."
  }
}
EOF

exit 2
