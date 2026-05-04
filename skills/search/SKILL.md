---
name: search
description: Search tool selection strategy for brave-search and tavily-search. Use it to choose the right depth, source quality, language defaults, and verification path.
license: MIT
---

# Search Strategy

Before calling any search tool, decide the search depth first. Use the smallest search flow that can answer safely.

## 1. Classify the Task

| Level | Use For | Default Flow |
|---|---|---|
| Simple | One fact, real-time data, one obvious source, official URL lookup | One targeted search call |
| Standard | Official docs, versions, API usage, changelog, technical lookup | Brave first; Tavily only if page content is needed |
| Complex | Comparison, synthesis, conflicting claims, multi-source analysis | Brave for source discovery; Tavily for key sources that support conclusions |

Core rule:

```text
Match depth to risk. Do not spend extra calls when snippets are enough, but do not answer from shallow snippets when the conclusion depends on page content.
```

## 2. Pre-Search Checklist

Answer these quickly before searching:

| Question | Action |
|---|---|
| Does this require current information? | Search; do not rely on memory. |
| Does it require official or authoritative sources? | Use Brave to find the source first. |
| Are the terms specific enough? | Add year, version, vendor, product, or domain. |
| Does the answer depend on page body content? | Use Tavily for the relevant source. |
| Are sources likely to conflict? | Compare sources; use Tavily on the key claims. |

## 3. Tool Selection

| Need | Tool |
|---|---|
| Find official docs, GitHub repos, vendor announcements, authoritative URLs | `brave-search` |
| Get page body details, exact values, tables, code blocks, or original wording | `tavily-search` |
| Quick answer where the title/snippet already contains the needed fact | One search tool only |
| Comparison or synthesis | Brave for source discovery, then Tavily only for sources whose details affect the answer |

If the chosen Brave or Tavily tool is not callable, use ToolSearch to load the missing MCP tool schema first.

## 4. When Tavily Is Required

Call `tavily-search` when any of these are true:

- The answer needs page content, not just search snippets.
- Brave results conflict on facts such as version, date, price, capability, or limitation.
- The task compares multiple sources and the conclusion depends on details from those sources.
- Brave found a likely URL, but the snippet does not contain enough evidence.
- The user asks for quotes, exact wording, official source details, citations, or asks to verify carefully.

You may skip `tavily-search` when all relevant conditions are true:

- The task is a single low-risk fact, source lookup, or official entry-point lookup.
- Brave returns an official or clearly authoritative source.
- The title/snippet contains enough information to answer safely.
- The user appears to value speed over deep verification.

Short rule:

```text
Use Tavily when the answer depends on page content. Skip Tavily when Brave's URL, title, and snippet are enough to answer safely.
```

## 5. Language and Region Defaults

- If the user query is in Chinese and the target is China-local, Chinese-language, or not otherwise specified, use `country: "CN"` and `search_lang: "zh-hans"` when the tool supports these parameters.
- If the user asks for foreign official docs, global news, overseas companies, English source material, or another explicit region/language, follow the target source region/language instead of forcing `CN` / `zh-hans`.
- If mixed-language sources are useful, search in the language of the likely authoritative source first.

## 6. Result Quality and URL Presentation

- Prefer official sources, primary docs, GitHub repositories, standards bodies, original announcements, and reputable primary reporting.
- Down-rank results with spammy titles, unrelated query parameters, SEO pollution, mismatched snippets, or low-authority mirrors.
- When presenting URLs to the user, display clean URLs by removing tracking or low-value query parameters such as `utm_*`, `fbclid`, `gclid`, `oid`, `vt`, `spm`, `from`, and `source`.
- Do not modify URLs used internally for retrieval unless the cleaned URL is known to preserve the same page.

## 7. Failure Handling

| Situation | Action |
|---|---|
| Brave returns no relevant results | Switch to Tavily or refine the query; do not repeat the same Brave query. |
| Brave fails or times out | Use Tavily directly. Retry Brave at most once with a better query. |
| Tavily returns shallow content | Retry with `search_depth: advanced`; use `include_raw_content: true` only for exact text, code, or tables. |
| Both tools return irrelevant results | Reformulate once with year, domain, vendor, or more specific terms. |
| Evidence remains weak | State what was found and what remains uncertain. Do not fabricate. |

## 8. Tavily Payload Control

| Scenario | `search_depth` | `include_raw_content` |
|---|---|---|
| Version features, changelogs, release notes | `basic` | `false` |
| General API docs lookup | `basic` | `false` |
| Exact code blocks, tables, or source wording | `advanced` | `true` |
| Comparison or synthesis where snippets are insufficient | `advanced` | `false` |

Default to `search_depth: "basic"`. Escalate only when basic results are too shallow.

## 9. Before Responding

- Did the search depth match the task risk?
- If Tavily was skipped, was Brave's URL/title/snippet enough to answer safely?
- If sources conflict, did you resolve or disclose the conflict?
- Did you avoid answering current facts from memory?
- Did you present clean URLs and avoid relying on spammy results?
