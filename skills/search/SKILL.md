---
name: search
description: Search tool selection strategy for brave-search and tavily-search. Use it to choose the right depth, source quality, language defaults, and verification path.
license: MIT
---

<!-- SMART_SEARCH_STRATEGY_LOADED_V1 -->

# Search Strategy

Before calling any search tool, decide the search depth first. Use the smallest search flow that can answer safely.

## 1. Search Flow

| Level | Use For | Default Flow |
|---|---|---|
| Simple | One fact, real-time value, one obvious source, official URL lookup | Tavily directly for real-time values; Brave directly for source lookup |
| Standard | Official docs, versions, API usage, changelog, technical lookup | Brave first; Tavily only if page content is needed |
| Complex | Comparison, synthesis, conflicting claims, multi-source analysis | Brave for source discovery; Tavily for key sources that support conclusions |

## 2. Tool Selection

| Need | Tool |
|---|---|
| Find official docs, GitHub repos, vendor announcements, authoritative URLs | `brave-search` |
| Get page body details, exact values, tables, code blocks, or original wording | `tavily-search` |
| Quick answer where the title/snippet already contains the needed fact | One search tool only |
| Comparison or synthesis | Brave for source discovery, then Tavily only for sources whose details affect the answer |

If the chosen Brave or Tavily tool is not callable, use ToolSearch to load the missing MCP tool schema first.

## 3. When Tavily Is Required

Call `tavily-search` when any of these are true:

- The answer needs page content, not just search snippets.
- Brave results conflict on facts such as version, date, price, capability, or limitation.
- The task compares multiple sources and the conclusion depends on details from those sources.
- Brave found a likely URL, but the snippet does not contain enough evidence.
- The user asks for quotes, exact wording, official source details, citations, or asks to verify carefully.
- The query asks for real-time or frequently changing values such as weather, stock prices, crypto prices, live scores, flight or train status, inventory, or current pricing.

You may skip `tavily-search` when all relevant conditions are true:

- The task is a single low-risk fact, source lookup, or official entry-point lookup.
- Brave returns an official or clearly authoritative source.
- The title/snippet contains enough information to answer safely.
- The user appears to value speed over deep verification.

Short rule:

```text
Use Tavily when the answer depends on page content. Skip Tavily when Brave's URL, title, and snippet are enough to answer safely.
```

## 4. Freshness, Versions, and Disambiguation

- For "latest", "current", "newest", releases, pricing, model capability, API behavior, laws, schedules, or product specs, search and verify with a date, version number, or official announcement.
- If the query asks for "latest", "current", "newest", or equivalent terms, include the current year in the search query and check whether a newer official version exists after reading the initial results.
- If results mention multiple versions of the same product, model, API, SDK, or document, use this priority chain:

| Priority | Evidence | Action |
|---|---|---|
| 1 | Official release dates | Prefer the newest official version. |
| 2 | Official docs or release-note support, no clear dates | Prefer the version with stronger official support. |
| 3 | Still ambiguous | State competing versions, dates found, and uncertainty. |

- If names are similar or reused, disambiguate by vendor, product line, release date, region, and source domain before answering.
- Prefer official release notes, changelogs, documentation, GitHub releases, standards pages, or primary announcements for versioned facts.

## 5. Language and Region Defaults

- If the user query is in Chinese and the target is China-local, Chinese-language, or not otherwise specified, use `country: "CN"` and `search_lang: "zh-hans"` when the tool supports these parameters.
- If the user asks for foreign official docs, global news, overseas companies, English source material, or another explicit region/language, follow the target source region/language instead of forcing `CN` / `zh-hans`.
- If mixed-language sources are useful, search in the language of the likely authoritative source first.

## 6. Result Quality and URL Presentation

- Prefer official sources, primary docs, GitHub repositories, standards bodies, original announcements, and reputable primary reporting.
- Prefer source pages with explicit publication dates, version numbers, or changelog entries when freshness matters.
- Down-rank results with spammy titles, unrelated query parameters, SEO pollution, mismatched snippets, or low-authority mirrors.
- When presenting URLs to the user, display clean URLs by removing tracking or low-value query parameters such as `utm_*`, `fbclid`, `gclid`, `oid`, `vt`, `spm`, `from`, and `source`.
- Do not modify URLs used internally for retrieval unless the cleaned URL is known to preserve the same page.

## 7. Failure Handling

| Situation | Action |
|---|---|
| Real-time value query (weather, prices, scores, status) | Use Tavily directly; do not start with Brave. |
| Brave results for real-time values lack actual values | Switch to Tavily directly; do not retry Brave. |
| Brave returns no relevant results | Switch to Tavily or refine the query; do not repeat the same Brave query. |
| Brave fails or times out | Use Tavily directly. Retry Brave at most once with a better query. |
| Tavily returns shallow content | Retry with `search_depth: advanced`; use `include_raw_content: true` only for exact text, code, or tables. |
| Both tools return irrelevant results | Reformulate once with year, domain, vendor, or more specific terms. |
| Evidence remains weak | State what was found and what remains uncertain. Do not fabricate. |

## 8. Tavily Payload Control

| Scenario | `search_depth` | `include_raw_content` |
|---|---|---|
| Real-time values, simple (weather, scores) | `basic` | `false` |
| Real-time values, dynamic or transactional (prices, flight/train status, inventory) | `advanced` | `false` |
| Version features, changelogs, release notes | `basic` | `false` |
| General API docs lookup | `basic` | `false` |
| Exact code blocks, tables, or source wording | `advanced` | `true` |
| Comparison or synthesis where snippets are insufficient | `advanced` | `false` |

Default to `search_depth: "basic"`. Escalate only when basic results are too shallow.

## 9. Before Responding

- Did the search depth match the task risk?
- For real-time value queries, did you include a date, timestamp, or freshness indicator?
- For latest/current queries, did the search query include the current year?
- For latest/current/versioned claims, did you verify the date or version?
- If multiple versions appeared, did you choose the newest official version or disclose ambiguity?
- If Tavily was skipped, was Brave's URL/title/snippet enough to answer safely?
- If sources conflict, did you resolve or disclose the conflict?
- Did you avoid answering current facts from memory?
- Did you present clean URLs and avoid relying on spammy results?
