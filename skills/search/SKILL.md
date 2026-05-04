---
name: search
description: Search tool selection strategy. Must be read before calling brave-search or tavily-search to ensure correct search approach, authoritative sources, and accurate results.
license: MIT
---

# Search Strategy

Before calling any search tool, complete this thinking process.

---

## Step 1: Assess Task Complexity

First, categorize the task to determine the required search depth.

| Level | Task Type | Examples | Required Tools |
|-------|-----------|----------|----------------|
| **Simple** | Single fact, real-time data, one clear source | Weather, exchange rate, release date | 1 tool, 1 call |
| **Standard** | Official docs, version verification, technical lookup | API usage, changelog, SDK guide | `brave-search` → `tavily-search` |
| **Complex** | Comparison, synthesis, multi-vendor analysis | "Compare X vs Y", "summarize latest AI models" | Both tools, multiple calls |

Core principle:

```text
Match search depth to task complexity.
Simple tasks do not require complex flows.
Complex tasks must not be shortcut.
```

---

## Step 2: Four Questions Checklist

Answer these before calling any tool:

| Question | If Yes | Action |
|----------|--------|--------|
| **Recency**: Does this need current info? (latest release, real-time data) | Do not rely on memory | Must search to confirm |
| **Authority**: Does it require official sources? (vendor docs, GitHub, announcements) | Find official URL first | `brave-search` → then `tavily-search` |
| **Specificity**: Are search terms specific enough? (year, version, "latest") | Refine keywords | Add "2026", version number, or domain to query |
| **Sequencing**: Should basic facts be confirmed before deeper analysis? | Yes for complex tasks | Search facts first, then analyze |

---

## Step 3: Tool Selection

| Task Need | Tool | Notes |
|-----------|------|-------|
| Find official docs, GitHub repos, authoritative URLs | `brave-search` | Required first step for Standard/Complex tasks |
| Extract page content, structured data, concrete values | `tavily-search` | Use `search_depth: advanced` for detailed content |
| Summarize, compare, or synthesize multiple sources | `tavily-search` | **Required — brave-search summaries are not sufficient** |
| Need both source URL and its content | `brave-search` first → `tavily-search` | Both required |
| Simple real-time data (weather, price, single fact) | `tavily-search` directly | Skip brave-search for Simple tasks |

If a required Brave or Tavily search tool is not callable, use ToolSearch to load the missing MCP tool schema first.

---

## Step 4: Execution Flows

### Simple Task Flow

```text
1. Identify single data need
2. tavily-search: targeted query → extract value
3. Respond
```

### Standard Task Flow

```text
1. brave-search: "[topic] official docs/release 2026" → get authoritative URL
2. tavily-search: extract content from that URL (search_depth: advanced)
3. Respond
```

### Complex Task Flow (Comparison / Synthesis)

```text
1. brave-search: find authoritative sources for each entity being compared
2. tavily-search: extract detailed content from each source
3. Aggregate and synthesize
4. Respond
```

> **For Complex tasks**: Both steps 1 and 2 are required. `brave-search` results alone are not sufficient for comparison or synthesis — the summaries are too shallow.

---

## Step 5: Failure Handling

Tools fail. Here is how to adapt:

| Situation | Action |
|-----------|--------|
| `brave-search` returns no relevant results | Switch directly to `tavily-search` with a refined query — do not repeat the same brave-search query |
| `brave-search` fails (error / timeout) | Skip to `tavily-search` immediately — do not retry brave-search more than once |
| `tavily-search` returns shallow content | Retry with `search_depth: advanced` and `include_raw_content: true` |
| Both tools return irrelevant results | Reformulate query (add year, domain, or more specific terms), then retry once per tool |
| After 2 failed attempts per tool | Inform the user of what was found and what remains uncertain — do not fabricate |

**Key rule**: If a tool fails or returns nothing useful, switch tools or refine the query. Do not retry the identical query on the same tool.

---

## Step 6: tavily-search Configuration for Deep Content

When detailed content is needed (Standard or Complex tasks):

```json
{
  "search_depth": "advanced",
  "include_raw_content": true
}
```

---

## Common Mistakes to Avoid

| Mistake | Consequence | Correct Approach |
|---------|-------------|------------------|
| Answer version/release facts from memory | May be outdated | Always search to confirm |
| Use vague keywords without year or version | Stale results | Add "2026", "latest", specific version |
| Stop after `brave-search` on a comparison task | Incomplete analysis | Always follow with `tavily-search` |
| Retry the same failed query on the same tool | Wasted calls | Switch tools or reformulate |
| Apply Complex flow to Simple tasks | Wasted tokens | Match depth to task complexity |
| Fabricate when search yields nothing | Inaccurate output | State uncertainty, report what was found |

---

## Step Completion Checklist

Before responding, verify:

- [ ] Did I correctly classify the task as Simple / Standard / Complex?
- [ ] For Standard/Complex: did I call `brave-search` to find authoritative sources?
- [ ] For Complex tasks: did I call `tavily-search` to extract detailed content?
- [ ] If a tool failed: did I switch tools or refine the query rather than retrying identically?
- [ ] Did I avoid answering version/recency facts from memory?

## Final Step: Enable Search for This Session

After completing the checklist, you must enable Smart Search for this session before retrying the search tool.

This is an internal Smart Search activation step. Reading this skill alone is not enough; the hook allows search tools only after this activation command has run.

Run this exact command:

```bash
node -e "const fs=require('fs'), path=require('path'); const home=process.env.USERPROFILE||process.env.HOME||'/tmp'; const dir=path.join(home,'.claude-smart-search'); fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(path.join(dir,'ready'), new Date().toISOString());"
```

---

## Core Principles

```text
Match depth to complexity. Official sources before synthesis.
On failure, switch or refine — never retry the same call.
Uncertainty acknowledged > answer fabricated.
```

---

## Examples

### Simple Task

User: "北京今天天气怎么样"

- Classification: Simple (single fact, real-time data)
- Flow: `tavily-search` directly → return result

### Standard Task

User: "Next.js 15 breaking changes 官方文档总结"

- Classification: Standard (official docs, technical lookup)
- Flow: `brave-search` "Next.js 15 breaking changes official docs 2026" → get URL → `tavily-search` extract content → summarize

### Complex Task

User: "对比 GPT-4.1、Claude 4、Gemini 2.5 的能力和限制"

- Classification: Complex (comparison, multi-source synthesis)
- Flow: `brave-search` find authoritative sources for each model → `tavily-search` extract detailed content from each → synthesize and compare
