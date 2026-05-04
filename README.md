# Smart Search

A Claude Code plugin that enforces a structured search workflow. Bundles brave-search and tavily-search MCPs with a mandatory strategy before any search execution.

---

## Why This Plugin

Claude Code has a built-in `WebSearch` tool, but it only works with Anthropic's native API. When you use third-party model providers (e.g. proxies, alternative API endpoints), the built-in `WebSearch` silently fails — it returns "no web search tool available" instead of actual search results.

This plugin solves that by bundling `brave-search` and `tavily-search` MCP servers as replacements. These MCPs work regardless of which model provider you use, giving you reliable search capability on any setup.

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

The plugin needs API keys for brave-search and tavily-search. Choose one of the methods below.

### Step 4: Reload

```
/reload-plugins
```

---

## API Key Setup

### Option A: Current session only (temporary)

In Claude Code, use the `/config` command or run:

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

## License

MIT
