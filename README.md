# Smart Search

A Claude Code plugin that enforces a structured search workflow. Bundles brave-search and tavily-search MCPs with a mandatory strategy before any search execution.

一个 Claude Code 插件，强制执行结构化搜索流程。内置 brave-search 和 tavily-search MCP，每次搜索前必须经过策略审查。

---

## Why This Plugin / 为什么需要这个插件

Claude Code has a built-in `WebSearch` tool, but it only works with Anthropic's native API. When you use third-party model providers (e.g. proxies, alternative API endpoints), the built-in `WebSearch` silently fails — it returns "no web search tool available" instead of actual search results.

This plugin solves that by bundling `brave-search` and `tavily-search` MCP servers as replacements. These MCPs work regardless of which model provider you use, giving you reliable search capability on any setup.

Claude Code 内置了 `WebSearch` 工具，但仅在使用 Anthropic 原生 API 时可用。当你使用第三方模型提供商（如代理、其他 API 端点）时，内置的 `WebSearch` 会静默失败——返回"没有可用的搜索工具"而非实际搜索结果。

这个插件通过内置 `brave-search` 和 `tavily-search` MCP 服务器来解决这个问题。无论你使用哪个模型提供商，这些 MCP 都能正常工作，确保在任何环境下都有可靠的搜索能力。

---

## What It Does / 功能说明

When you (or a subagent) try to call a search tool, Smart Search intercepts the call and forces a strategy review first:

- **Assess task complexity** (Simple / Standard / Complex)
- **Answer four questions** (Recency, Authority, Specificity, Sequencing)
- **Select the right tool** (brave-search for URLs, tavily-search for content)
- **Follow the execution flow** (match depth to complexity)

当你或子代理调用搜索工具时，Smart Search 会先拦截并强制执行策略审查：

- **评估任务复杂度**（简单 / 标准 / 复杂）
- **回答四个问题**（时效性、权威性、精确性、顺序性）
- **选择正确的工具**（brave-search 找 URL，tavily-search 提取内容）
- **执行对应流程**（搜索深度匹配任务复杂度）

## Installation / 安装

```bash
/plugin install https://github.com/JiangHe12/smart-search
```

Or for local development / 本地开发：

```bash
claude --plugin-dir /path/to/smart-search
```

## Prerequisites / 前置条件

Set the following environment variables before use / 使用前设置以下环境变量：

```bash
export BRAVE_API_KEY="your-brave-api-key"
export TAVILY_API_KEY="your-tavily-api-key"
```

Get your API keys / 获取 API Key：

- Brave Search: https://brave.com/search/api/
- Tavily: https://tavily.com

## How It Works / 工作原理

### Hook Mechanism / Hook 机制

The plugin uses a `PreToolUse` hook that matches all brave-search and tavily-search tool calls. Before any search tool executes, a prompt is injected forcing the skill to activate.

插件使用 `PreToolUse` hook 匹配所有 brave-search 和 tavily-search 的工具调用。在搜索工具执行前，注入 prompt 强制触发搜索策略 skill。

### Search Strategy / 搜索策略

The skill follows a 6-step workflow / skill 遵循六步流程：

1. **Assess Complexity** — classify as Simple, Standard, or Complex
2. **Four Questions Checklist** — Recency, Authority, Specificity, Sequencing
3. **Tool Selection** — pick brave-search, tavily-search, or both
4. **Execution Flow** — follow the matching flow for your task level
5. **Failure Handling** — switch tools or refine queries on failure
6. **Deep Content Config** — use `search_depth: advanced` when needed

## File Structure / 文件结构

```
smart-search/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest / 插件清单
├── skills/
│   └── search/
│       └── SKILL.md             # Search strategy skill / 搜索策略 skill
├── hooks/
│   └── hooks.json               # PreToolUse hook config / Hook 配置
├── .mcp.json                    # MCP server configs / MCP 服务器配置
└── README.md
```

## What's Included / 包含内容

| Component / 组件 | Description / 说明 |
|---|---|
| `brave-search` MCP | Web search, find official docs and authoritative URLs / 网页搜索，查找官方文档和权威链接 |
| `tavily-search` MCP | Content extraction, structured data, deep analysis / 内容提取，结构化数据，深度分析 |
| `search-strategy` skill | Mandatory workflow before any search / 搜索前必须执行的策略流程 |
| `PreToolUse` hook | Intercepts search tools, forces skill activation / 拦截搜索工具，强制触发 skill |

## After Install / 安装后

The plugin works automatically. No additional configuration needed. When a search tool is called:

1. Hook intercepts the call
2. Skill activates with the strategy checklist
3. Search executes following the correct flow

插件自动生效，无需额外配置。搜索工具被调用时：

1. Hook 拦截调用
2. Skill 激活并执行策略检查
3. 按照正确流程执行搜索

## License

MIT
