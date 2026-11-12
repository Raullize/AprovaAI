---
name: agents-root-entrypoint
description: Entry point for LLM assistants into the project. Points to the source of truth, non-negotiable rules and the installed configuration. This file does NOT duplicate content.
document_type: agents_manifest
applies_when:
  - an agent opens the repository for the first time
  - an agent needs to know where the official rules live
max_lines: 150
---

# AGENTS.md — Entry Point for LLM Assistants

> **The source of truth LIVES in `.agents/*`.**
> Here there are ONLY pointers in the right order and the executive summary of
> what MUST NOT be broken. Any conflict between this file and `.agents/` is
> resolved by `.agents/`.

## Installed configuration

<!-- ai-guardrails:config:begin -->
| Option | Value |
|---|---|
| Prompts | none |
| Optional prompts | none |
| Stack packs | `docker-expert`, `humanize-frontend`, `modernize-legacy`, `refactor-react`, `seo-optimizer`, `ui-to-code`, `unslop` |
| Git | versioned |
<!-- ai-guardrails:config:end -->

---

## 1. Mandatory reading — before any action

| File | What you learn there |
|---|---|
| [`.agents/rules/README.md`](.agents/rules/README.md) | Index of non-negotiable rules (blocking invariants) |
| [`.agents/skills/README.md`](.agents/skills/README.md) | Index of skills / roles and their triggers |


---

## 2. Non-negotiable rules — DO NOT BREAK THEM

1.  **Test-first.** When behavior is testable, a failing test precedes the
    implementation. Refactor only after the functional tests are green.
2.  **Evidence over claims.** No story goes to `Done` without validation
    evidence. Tests must prove the business rule, not just the pipeline.
3.  **No silent refactors.** Only modify what was requested. No unrequested
    reformatting or "improvements".
4.  **No hallucination.** Never invent libraries, APIs, endpoints or
    versions. Verify when unsure.
5.  **Secrets never.** No keys, tokens, credentials or sensitive data in
    commits, logs or debug output.
6.  **Semantic commits + selective staging.** One concern per commit. See
    `.agents/rules/commit-conventions/RULE.md`.
7.  **Push, tag and release ONLY with explicit human authorization.** None of
    them automatic.
8.  **Artifact structure is 1 folder = 1 artifact:**
    ```
    Skills  →  .agents/skills/<name>/SKILL.md
    Rules   →  .agents/rules/<name>/RULE.md
    Prompts →  .agents/prompts/<name>/PROMPT.md
    ```

---


*Conflict between instructions? Always apply in this order:*
blocking `RULE`s → this `AGENTS.md`.

<!-- generated-by: ai-guardrails -->
