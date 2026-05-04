# Smart Search

A Claude Code plugin that enforces a structured search workflow. Bundles brave-search and tavily-search MCPs with a mandatory strategy before any search execution.

---

## Why This Plugin

Claude Code has a built-in `WebSearch` tool, but it only works with Anthropic's native API. When you use third-party model providers (e.g. proxies, alternative API endpoints), the built-in `WebSearch` silently fails — it returns "no web search tool available" instead of actual search results.

This plugin solves that by bundling `brave-search` and `tavily-search` MCP servers as replacements. These MCPs work regardless of which model provider you use, giving you reliable search capability on any setup.

---

## When Does It Activate

This plugin activates **only when a search tool is called** (brave-search or tavily-search). It does not affect normal conversations. If you ask a question that doesn't trigger a search, the plugin stays inactive.

---

## What It Does

When you (or a subagent) try to call a search tool, Smart Search intercepts the call and forces a strategy review first:

- **Assess task complexity** (Simple / Standard / Complex)
- **Answer four questions** (Recency, Authority, Specificity, Sequencing)
- **Select the right tool** (brave-search for URLs, tavily-search for content)
- **Follow the execution flow** (match depth to complexity)

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

See [API Key Setup](#api-key-setup) below.

### Step 4: Verify installation

After reloading, run these commands to confirm everything works:

```
/plugin list    → smart-search should be listed and enabled
/mcp            → brave-search and tavily-search should show "Connected"
/hooks          → PreToolUse hook should be registered
/skills         → smart-search:search should appear
```

### Step 5: Reload

```
/reload-plugins
```

---

## API Key Setup

### Option A: Current session only (temporary)

In Claude Code, run:

```
/env BRAVE_API_KEY=your-brave-api-key
/env TAVILY_API_KEY=your-tavily-api-key
```

These keys are lost when you close the session.

### Option B: Permanent (all sessions)

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or Windows System Environment Variables):

```bash
export BRAVE_API_KEY="your-brave-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

Then restart your terminal or run `source ~/.bashrc`.

### Option C: Claude Code settings (recommended)

Set via Claude Code CLI — persists across sessions without touching your shell profile:

```bash
claude settings add env BRAVE_API_KEY=your-brave-api-key
claude settings add env TAVILY_API_KEY=your-tavily-api-key
```

### Get your API keys

- Brave Search: https://brave.com/search/api/ (free tier: 2,000 queries/month)
- Tavily: https://tavily.com (free tier: 1,000 queries/month)

---

## How It Works

### Hook Mechanism

The plugin uses a `PreToolUse` hook that matches all brave-search and tavily-search tool calls. Before any search tool executes, a prompt is injected forcing the skill to activate.

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

**Fix:** Verify keys are set:
```bash
echo $BRAVE_API_KEY
echo $TAVILY_API_KEY
```
If empty, follow [API Key Setup](#api-key-setup).

### npx download fails

**Symptom:** MCP server shows "disconnected" or timeout errors.

**Fix:** Check network connectivity. If behind a proxy, configure npm:
```bash
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

### Hook not triggering

**Symptom:** Search executes without strategy review.

**Fix:** Run `/hooks` and confirm PreToolUse hook is listed. If not, run `/reload-plugins`.

### Skill not appearing

**Symptom:** `smart-search:search` missing from `/skills` list.

**Fix:** Run `/plugin list` to confirm plugin is enabled. If not, run `/plugin install smart-search`.

### MCP tool names changed

This plugin matches tools named `brave-search` and `tavily-search`. If your MCP servers use different names, update the `matcher` in `hooks/hooks.json` and the skill references in `SKILL.md` accordingly.

### Windows environment variables

If API keys are set in Windows System Environment Variables but Claude Code doesn't see them, try setting them via Claude Code settings instead:

```bash
claude settings add env BRAVE_API_KEY=your-key
claude settings add env TAVILY_API_KEY=your-key
```

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
| `search-strategy` skill | Mandatory workflow before any search |
| `PreToolUse` hook | Intercepts search tools, forces skill activation |

---

## File Structure

```
smart-search/
├── .claude-plugin/
│   ├── plugin.json              # Plugin manifest
│   └── marketplace.json         # Marketplace manifest
├── skills/
│   └── search/
│       └── SKILL.md             # Search strategy skill
├── hooks/
│   └── hooks.json               # PreToolUse hook config
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

## Roadmap

### Enforce search strategy at tool-call level

Currently the hook uses `prompt` type for soft guidance. A future improvement:

- Add a `command`-type `PreToolUse` hook
- Detect search tool invocation (brave-search / tavily-search)
- Validate whether search strategy has been applied
- Return `permissionDecision: "deny"` or `"ask"` if not

Challenge: requires tracking reasoning state or injecting markers. Needs careful design to avoid blocking legitimate queries.

---

## License

MIT
