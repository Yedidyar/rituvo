---
name: shadcn-ui
description: Adds and configures shadcn/ui components for apps/web using Base UI (base-nova style). Use when adding shadcn components, running shadcn CLI, working with components.json, or editing UI components in apps/web.
---

# shadcn/ui (apps/web)

This project uses shadcn/ui with Base UI (`base-nova` style). Do not run `shadcn init` — it is interactive. Setup is already complete in `components.json`.

Add components non-interactively with `-y`:

```bash
cd apps/web
pnpm dlx shadcn@latest add button -y
```

## Project config

Config file: `apps/web/components.json`

| Setting    | Value            |
| ---------- | ---------------- |
| Style      | `base-nova`      |
| RSC        | `false`          |
| Icons      | `lucide`         |
| Base color | `zinc`           |
| CSS        | `src/styles.css` |

Import aliases (from `components.json`):

- `#/components` — components
- `#/components/ui` — UI primitives
- `#/lib/utils` — `cn()` helper
- `#/hooks` — hooks

## Rules

- Run all shadcn CLI commands from `apps/web`
- Always pass `-y` to avoid interactive prompts
- Never run `shadcn init` — setup is complete
- Install components with `pnpm dlx shadcn@latest add <name> -y`
