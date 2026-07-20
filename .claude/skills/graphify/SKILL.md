---
name: graphify
description: Turn a codebase (or a subdirectory of it) into a visual module dependency graph. Use when the user wants to see how files/modules import each other, understand the architecture of a project at a glance, find circular dependencies, or asks to "graph the codebase" / "visualize dependencies" / "show me the module structure".
---

# Graphify

Build a **module dependency graph** — nodes are files/modules, edges are import
relationships — and render it so the user can actually look at it. This is a
static-analysis task, not a natural-language research task: parse imports
directly with Grep/Glob/Read rather than delegating to a subagent, since you
need exact edges, not a prose summary.

## 1. Scope the graph

- Default scope: `src/` if it exists, else the project root minus build
  output. Confirm with the user if the project has multiple plausible roots
  (e.g. a monorepo with several `packages/*`).
- Always exclude: `node_modules`, `dist`, `build`, `.next`, `venv`,
  `__pycache__`, lockfiles, and any directory in `.gitignore`.
- If the user names a specific subdirectory ("graph the visualizations
  folder"), scope to just that — don't default back to the whole repo.

## 2. Collect the files and their imports

1. `Glob` for source files in scope (match the project's actual language —
   `**/*.{js,jsx,ts,tsx}` for JS/TS, `**/*.py` for Python, etc. — check
   `package.json`/file extensions present rather than assuming).
2. For each file, extract its import statements. Use `Grep` with a pattern
   per language rather than reading every file in full when the project is
   large:
   - JS/TS: `import .* from ['"]`, `require\(['"]`, dynamic `import\(['"]`
   - Python: `^import `, `^from .+ import`
3. Resolve each import specifier to a file in scope:
   - Relative imports (`./`, `../`) resolve directly to a path.
   - Bare specifiers (`react`, `lodash`) are **external** — track them
     separately, don't turn every file into a `react` node by default (that
     produces a hairball). Only include externals if the user asks for them.
   - Path aliases (`@/`, `~/`) — check `tsconfig.json`/`jsconfig.json`/
     `vite.config.js` for the alias mapping before giving up on resolving one.

## 3. Build the graph structurally, not narratively

Keep an explicit `{ nodes: [...], edges: [{from, to}, ...] }` structure as you
go (in your own working notes, not a file) so the render step is a
mechanical transform, not a re-derivation.

- **Detect cycles** (a file importing something that eventually imports back
  to it) — these are almost always worth calling out explicitly, they're
  usually the most actionable finding in a dependency graph.
- **Group by directory** as subgraphs/clusters when rendering — a flat graph
  of 80 nodes is unreadable; folders give it structure for free.
- If the scoped graph exceeds roughly 60 nodes, say so and offer to narrow
  the scope (a specific subdirectory, or depth-limited to direct
  dependencies of one entry file) rather than rendering a hairball.

## 4. Render it

Default to a **Mermaid `graph TD` diagram published as an HTML Artifact**
(Artifacts render Mermaid natively, no external libs needed). Load the
`artifact-design` skill before writing it, per standard Artifact practice.

- One `subgraph` per top-level directory in scope.
- Highlight cycle edges distinctly (e.g. a different arrow style/color) if
  any were found.
- Keep node labels short (filename, not full path) — put the full path in
  the artifact as a caption or legend, not on every node.
- If the user explicitly asks for a file instead of an artifact (e.g. "give
  me a DOT file", "output graphviz"), write that instead — don't force the
  Artifact path.

## 5. Report

After rendering, give a short summary: node/edge count, any cycles found
(named explicitly, e.g. "A → B → C → A"), and which externals were most
depended-upon if externals were included. Don't re-paste the whole graph as
text — the artifact/file *is* the deliverable.
