# Smart Search

A Claude Code plugin that blocks the first search tool call in a session until `/smart-search:search` has been invoked. Bundles brave-search and tavily-search MCPs with a command hook and a mandatory search workflow.

---

## Why This Plugin

Claude Code has a built-in `WebSearch` tool, but it only works with Anthropic's native API. When you use third-party model providers (e.g. proxies, alternative API endpoints), the built-in `WebSearch` silently fails — it returns "no web search tool available" instead of actual search results.

This plugin solves that by bundling `brave-search` and `tavily-search` MCP servers as replacements. These MCPs work regardless of which model provider you use, giving you reliable search capability on any setup.

---

## When Does It Activate

This plugin activates **only when a search tool is called** (brave-search or tavily-search). It does not affect normal conversations. If you ask a question that doesn't trigger a search, the plugin stays inactive.

---

## What It Does

When you (or a subagent) try to call a search tool for the first time in a session, the command hook blocks the call and requires you to complete the search strategy first:

- **Assess task complexity** (Simple / Standard / Complex)
- **Answer four questions** (Recency, Authority, Specificity, Sequencing)
- **Select the right tool** (brave-search for URLs, tavily-search for content)
- **Follow the execution flow** (match depth to complexity)

Only after the strategy is completed will search tools be allowed to execute for that session.

---

## Installation

### Step 1: Add the marketplace

```
/plugin marketplace add JiangHe12/smart-search
```

### Step 2: Install the plugin

```
/plugin install smart-search
```

### Step 3: Set API keys

On first install, Claude Code will prompt you for your API keys. Configure them via:

```
/plugin manage smart-search
```

This plugin uses Claude Code `userConfig` for API keys. Existing shell environment variables such as `BRAVE_API_KEY` and `TAVILY_API_KEY` are not automatically imported — you must set the keys through `/plugin manage`.

### Step 4: Reload

```
/reload-plugins
```

### Step 5: Verify installation

```
/plugin list    → smart-search should be listed and enabled
/mcp            → brave-search and tavily-search should show "Connected"
/hooks          → PreToolUse command hook should be registered
/skills         → smart-search:search should appear
```

### Get your API keys

- Brave Search: https://brave.com/search/api/ (free tier: 2,000 queries/month)
- Tavily: https://tavily.com (free tier: 1,000 queries/month)

---

## How It Works

### Hook Mechanism

The plugin uses a `command`-type `PreToolUse` hook (Node.js script) that intercepts all brave-search and tavily-search tool calls. When a search tool is invoked:

1. A `SessionStart` hook clears the strategy marker on new sessions and `/clear`
2. The `PreToolUse` hook script checks if `/smart-search:search` has been invoked in this active context
3. If not, it returns `permissionDecision: "deny"` — the search tool is blocked
4. Claude is told to invoke `/smart-search:search`, complete the checklist, and run the marker command shown at the end of the skill
5. After completing the strategy, the skill marks it as applied
6. The next search tool call is explicitly allowed through with `permissionDecision: "allow"`

This is a hard constraint, not a soft prompt — search tools cannot execute in a new session until `/smart-search:search` has been invoked once. Resuming a session or compacting context preserves the marker to avoid repeated interruptions.

### Search Strategy

The skill follows a 6-step workflow:

1. **Assess Complexity** — classify as Simple, Standard, or Complex
2. **Four Questions Checklist** — Recency, Authority, Specificity, Sequencing
3. **Tool Selection** — pick brave-search, tavily-search, or both
4. **Execution Flow** — follow the matching flow for your task level
5. **Failure Handling** — switch tools or refine queries on failure
6. **Deep Content Config** — use `search_depth: advanced` when needed

---

## Troubleshooting

### API Key not set

**Symptom:** MCP server fails to start, or search returns errors.

**Fix:** Run `/config` to check if keys are set. If not, follow Step 3 in Installation.

### npx download fails

**Symptom:** MCP server shows "disconnected" or timeout errors.

**Fix:** Check network connectivity. If behind a proxy, configure npm:
```bash
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

### Hook not triggering

**Symptom:** Search executes without strategy review.

**Fix:** Run `/hooks` and confirm PreToolUse command hook is listed. If not, run `/reload-plugins`.

### Skill not appearing

**Symptom:** `smart-search:search` missing from `/skills` list.

**Fix:** Run `/plugin list` to confirm plugin is enabled. If not, run `/plugin install smart-search`.

### Search always blocked

**Symptom:** Every search call is denied, even after invoking the skill.

**Fix:** Make sure the marker command at the end of `/smart-search:search` was run. Reading the skill content alone is not enough; the marker file must exist. The marker is stored in your home directory. To reset:
```bash
rm -rf "$HOME/.claude-smart-search"
```

### MCP tool names

When installed as a plugin, MCP tool names are prefixed with the plugin ID:
- `mcp__plugin_smart-search_brave-search__*`
- `mcp__plugin_smart-search_tavily-search__*`

The hook matcher supports both prefixed plugin-install names and unprefixed local-dev names.

---

## MCP Version Policy

MCP servers are intentionally not pinned by default so users receive upstream fixes and improvements automatically. If an upstream release breaks compatibility, pin the package version in `.mcp.json`:

```json
"args": ["-y", "@brave/brave-search-mcp-server@x.y.z", "--transport", "stdio"]
```

---

## What's Included

| Component | Description |
|---|---|
| `brave-search` MCP | Web search, find official docs and authoritative URLs |
| `tavily-search` MCP | Content extraction, structured data, deep analysis |
| `search` skill | Mandatory strategy workflow before the first search in a session |
| `PreToolUse` command hook | Blocks search tools until strategy is completed |

---

## File Structure

```
smart-search/
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest with userConfig
│   └── marketplace.json         # Marketplace manifest
├── skills/
│   └── search/
│       └── SKILL.md             # Search strategy skill
├── hooks/
│   ├── hooks.json               # PreToolUse command hook config
│   ├── enforce-search-strategy.mjs  # Hook script (deny/allow logic)
│   ├── reset-strategy-marker.mjs    # SessionStart marker reset
│   └── mark-strategy-applied.mjs    # Marker script (called by skill)
├── .mcp.json                    # MCP server configs
└── README.md
```

---

## Local Development

```bash
git clone https://github.com/JiangHe12/smart-search
claude --plugin-dir ./smart-search
```

---

## License

MIT
