# Anthony Fu's Skills

A curated collection of [Agent Skills](https://agentskills.io/home) reflecting [Anthony Fu](https://github.com/antfu)'s preferences, experience, and best practices.

> This is a proof-of-concept project. Feedback and contributions are welcome.

## Installation

```bash
pnpx skills add antfu/skills --skill='*'
```

Or install globally:

```bash
pnpx skills add antfu/skills --skill='*' -g
```

Learn more about CLI usage at [skills](https://github.com/vercel-labs/skills).

## Skills

One-stop collection for Vite/Nuxt ecosystem.

### Hand-maintained Skills

| Skill | Description |
|-------|-------------|
| [antfu](skills/antfu) | Anthony Fu's preferences for app/library projects |

### Generated Skills (from Official Docs)

| Skill | Description | Source |
|-------|-------------|--------|
| [vue](skills/vue) | Vue.js core | [vuejs/docs](https://github.com/vuejs/docs) |
| [nuxt](skills/nuxt) | Nuxt framework | [nuxt/nuxt](https://github.com/nuxt/nuxt) |
| [pinia](skills/pinia) | Pinia state management | [vuejs/pinia](https://github.com/vuejs/pinia) |
| [vite](skills/vite) | Vite build tool | [vitejs/vite](https://github.com/vitejs/vite) |
| [vitepress](skills/vitepress) | VitePress static site generator | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| [vitest](skills/vitest) | Vitest testing framework | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) |
| [unocss](skills/unocss) | UnoCSS atomic CSS | [unocss/unocss](https://github.com/unocss/unocss) |
| [pnpm](skills/pnpm) | pnpm package manager | [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io) |

### Vendored Skills

| Skill | Description | Source |
|-------|-------------|--------|
| [slidev](skills/slidev) | Slidev presentations | [slidevjs/slidev](https://github.com/slidevjs/slidev) |
| [tsdown](skills/tsdown) | tsdown bundler | [rolldown/tsdown](https://github.com/rolldown/tsdown) |
| [turborepo](skills/turborepo) | Turborepo monorepo | [vercel/turborepo](https://github.com/vercel/turborepo) |
| [vueuse-functions](skills/vueuse-functions) | VueUse utilities | [vueuse/skills](https://github.com/vueuse/skills) |
| [vue-best-practices](skills/vue-best-practices) | Vue 3 best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-router-best-practices](skills/vue-router-best-practices) | Vue Router best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-testing-best-practices](skills/vue-testing-best-practices) | Vue testing best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [web-design-guidelines](skills/web-design-guidelines) | Web design guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |

## Generate Your Own Skills

1. Fork this repository
2. Install: `pnpm install`
3. Update `meta.ts` with your projects
4. Run `pnpm start cleanup` then `pnpm start init`
5. Run `pnpm start sync` for vendored skills

See [AGENTS.md](AGENTS.md) for details.

## License

[MIT](LICENSE.md) licensed.