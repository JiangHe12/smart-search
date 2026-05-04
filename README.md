# Smart Search

A Claude Code plugin that bundles Brave Search and Tavily MCP servers, then enforces one strategy review before the first search tool call in a session.

---

## Why This Plugin

Claude Code's built-in `WebSearch` only works with Anthropic's native API. With third-party model providers, it can fail with "no web search tool available" instead of returning results.

Smart Search bundles `brave-search` and `tavily-search` MCP servers so search remains available across model providers.

---

## When It Activates

The plugin activates only when a Brave or Tavily search tool is called. Normal conversations and local code work are unaffected.

On the first search tool call in a session:

1. The `PreToolUse` hook blocks the search call.
2. The hook asks the agent to invoke `/smart-search:search`.
3. After the skill is loaded, the hook detects the skill marker in the session transcript.
4. The hook automatically records a session marker and allows later search calls in the same session.

There is no manual activation command to run.

---

## Search Strategy

The bundled skill keeps search depth proportional to the task:

| Level | Use For | Default Flow |
|---|---|---|
| Simple | One fact, real-time value, official URL lookup | Tavily directly for real-time values; Brave directly for source lookup |
| Standard | Official docs, versions, API usage, changelog | Brave first; Tavily only if page content is needed |
| Complex | Comparison, synthesis, conflicting claims | Brave for source discovery; Tavily for key source details |

Tavily is a conditional depth upgrade, not a mandatory second step. Use it when the answer depends on page content, exact wording, conflicting claims, tables, code blocks, or source details that Brave snippets do not contain.

For real-time values such as weather, prices, live scores, status, inventory, or current pricing, the strategy uses Tavily directly because search snippets are often stale or incomplete.

For latest/current or versioned facts, the strategy requires year-aware queries plus date or version evidence. When results mention multiple versions of the same product, model, API, SDK, or document, official release dates decide priority first; if dates are missing, documentation depth is used as a fallback and remaining ambiguity is disclosed.

For Chinese queries, the skill defaults to `country: "CN"` and `search_lang: "zh-hans"` when the target is China-local, Chinese-language, or not otherwise specified. For foreign official docs, global news, overseas companies, or explicit language/region targets, follow the target source instead.

When presenting URLs, the skill asks the agent to display clean URLs by removing tracking or low-value query parameters such as `utm_*`, `fbclid`, `gclid`, `oid`, `vt`, `spm`, `from`, and `source`.

---

## Installation

### Step 1: Add the marketplace

```text
/plugin marketplace add JiangHe12/smart-search
```

### Step 2: Install the plugin

```text
/plugin install smart-search
```

### Step 3: Set API keys

On first install, Claude Code will prompt you for API keys. You can also configure them with:

```text
/plugin manage smart-search
```

This plugin uses Claude Code `userConfig` for API keys. Existing shell environment variables such as `BRAVE_API_KEY` and `TAVILY_API_KEY` are not automatically imported.

### Step 4: Reload

```text
/reload-plugins
```

### Step 5: Verify installation

```text
/plugin list    -> smart-search should be listed and enabled
/mcp            -> brave-search and tavily-search should show "Connected"
/hooks          -> PreToolUse and SessionStart hooks should be registered
/skills         -> smart-search:search should appear
```

### Get API keys

- Brave Search: https://brave.com/search/api/
- Tavily: https://tavily.com

---

## How It Works

### Hook Mechanism

The plugin uses command hooks:

1. `SessionStart` clears the session marker on startup and `/clear`.
2. `PreToolUse` intercepts Brave and Tavily search tool calls.
3. If the marker exists, the search call is allowed silently.
4. If the marker is missing, the hook checks whether `/smart-search:search` has been loaded into the session transcript.
5. If the skill marker is found, the hook writes the session marker and allows the search call.
6. If the skill marker is missing, the search call is denied with instructions to invoke `/smart-search:search`.

This enforces one strategy review per session without requiring a separate activation command.

### Tool Roles

| Component | Role |
|---|---|
| `brave-search` MCP | Web search, official URL discovery, authoritative source discovery |
| `tavily-search` MCP | Page content extraction, exact details, deeper multi-source analysis |
| `search` skill | Search depth, source quality, version/date disambiguation, Tavily escalation, language defaults, URL presentation |
| `PreToolUse` hook | One-time strategy gate and session marker handling |

---

## Troubleshooting

### API key not set

**Symptom:** MCP server fails to start or search returns authentication errors.

**Fix:** Run `/plugin manage smart-search` and configure both keys.

### npx download fails

**Symptom:** MCP server shows disconnected or times out.

**Fix:** Check network connectivity. If behind a proxy, configure npm:

```bash
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
```

### Hook not triggering

**Symptom:** Search executes without the first-search strategy gate.

**Fix:** Run `/hooks` and confirm the `PreToolUse` command hook is listed. If not, run `/reload-plugins`.

### Skill not appearing

**Symptom:** `smart-search:search` is missing from `/skills`.

**Fix:** Run `/plugin list` to confirm the plugin is enabled. If needed, reinstall or reload plugins.

### Search is repeatedly blocked

**Symptom:** Every search call is denied even after invoking `/smart-search:search`.

**Fix:** The hook may be unable to detect the skill marker in the session transcript or write the session marker in your home directory. Check the hook output for the marker path and permission error. The marker is stored at:

```text
~/.claude-smart-search/ready
```

To reset manually, delete that file or run `/clear`.

### MCP tool names

When installed as a plugin, MCP tool names are prefixed with the plugin ID:

- `mcp__plugin_smart-search_brave-search__*`
- `mcp__plugin_smart-search_tavily-search__*`

The hook matcher supports both prefixed plugin-install names and unprefixed local-development names.

---

## MCP Version Policy

MCP servers are intentionally not pinned by default so users receive upstream fixes automatically. If an upstream release breaks compatibility, pin the package version in `.mcp.json`:

```json
"args": ["-y", "@brave/brave-search-mcp-server@x.y.z", "--transport", "stdio"]
```

---

## File Structure

```text
smart-search/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── skills/
│   └── search/
│       └── SKILL.md
├── hooks/
│   ├── hooks.json
│   ├── enforce-search-strategy.mjs
│   ├── reset-strategy-marker.mjs
│   └── mark-strategy-applied.mjs
├── .mcp.json
└── README.md
```

`mark-strategy-applied.mjs` is kept as a legacy compatibility fallback. The normal flow now writes the marker from `enforce-search-strategy.mjs`.

---

## Local Development

```bash
git clone https://github.com/JiangHe12/smart-search
claude --plugin-dir ./smart-search
```

---

## License

MIT
