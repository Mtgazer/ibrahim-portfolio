---
name: portfolio-implementation
description: Guidelines and execution rules for efficient, targeted implementation in the Ibrahim Khalil portfolio repository.
---

# Portfolio Implementation Workflow

Follow these rules when implementing features, fixes, or refinements in this repository.

## 1. Context & Scope

- **Assume Repository Context**: Treat the open workspace and existing project context (`PORTFOLIO-MASTER-CONTEXT.md`, Next.js 16 + React 19 + Tailwind v4 + Supabase) as known. Never prompt the user to re-explain repository details.
- **Act Immediately on Clear Requests**: When requirements are clear, begin implementation directly without verbose preliminary plans or repetitive restatements.
- **Targeted Inspection**: Inspect only the files directly involved in the task and their immediate dependencies. Do not scan unrelated directories or files.
- **Inspect Current Diff First**: Run `git status` / `git diff` before editing files that may be part of in-progress or previous turn changes to avoid accidental rollbacks.

## 2. Architecture & Preservation

- **Preserve Working Systems**: Never rebuild or re-architect working features to implement small enhancements.
- **Honor Design Tokens & Styles**: Maintain existing CSS design tokens (`--theme-*`, `--hero-*`), Tailwind conventions, font stacks (`Epilogue`, `Space Mono`), and Dark/Light mode tokens in `src/app/globals.css`.
- **Zero Extraneous Dependencies**: Use existing libraries (GSAP, Lucide icons, native Web APIs). Never add new packages unless explicitly requested or strictly essential.
- **Maintain Core Integrity**: Do not alter database schemas, Supabase queries, authentication rules, project data models, or the approved hero generative-art timelines unless specifically directed.

## 3. Implementation Discipline

- **Minimal Diffs**: Make surgical, localized modifications. Avoid mass formatting passes or refactoring of adjacent code.
- **Performance First**: Avoid React re-renders on high-frequency events (scroll, resize, mouse move). Use direct DOM element references inside `requestAnimationFrame` where appropriate.
- **Accessibility & Motion**: Respect `prefers-reduced-motion` and maintain semantic HTML structures and accessible button/link attributes.

## 4. Verification & Validation

- **Focused UI Verification**: When UI changes are made, inspect the rendered application at the most relevant desktop (e.g. 1440px or 1280px) and mobile (e.g. 390px) viewports. Do not run unnecessarily exhaustive multi-browser audits.
- **Single-Pass Build Checks**: Run relevant checks (`npx tsc --noEmit` and/or `npm run build`) once after completing implementation. Re-run only if subsequent code changes are made.
- **Transparent Reporting**: Clearly distinguish verified in-browser behavior from code-level validation. Surface genuine warnings or failures immediately.

## 5. Git Safety

- **No Unauthorized Git Operations**: Never run `git commit`, `git push`, `git reset`, `git checkout`, or any destructive Git commands unless the user explicitly provides authorization.
