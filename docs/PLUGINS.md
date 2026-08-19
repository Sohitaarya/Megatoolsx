# MegaToolsX — Plugin & Tool Development

## Adding a tool (config-only, no code)

**1. Add a CSV row** (for SEO, sitemap, catalog):
```
Category,My Tool,Present,My Tool helps users by providing functionality for my tool.,"my, tool, ai tool",My Tool — Use this tool online free.,my-tool
```

**2. (Optional) Add an explicit behaviour config** in `src/modules/tools/toolConfig.ts`:
```ts
'my-tool': {
  slug: 'my-tool',
  capability: { kind: 'utility', verb: 'calculate' },
  placeholder: 'e.g. 100 200',
},
```

**3. Rebuild.** The tool automatically gets: page, unique SEO
(title/description/keywords/canonical/OG/Twitter/JSON-LD/breadcrumb/FAQ), a sitemap
entry, RSS entry, and a working interactive engine (real algorithm or AI). Nothing
else to do.

## Tool manifest (Tool OS)

Full tools can also be installed from a `ToolManifest`:
```ts
import { toolEngine } from '@/os'
toolEngine.install({
  schema: '1', id: 'org.megatoolsx.my-tool', slug: 'my-tool', name: 'My Tool',
  description: '…', version: '1.0.0', author: 'You', license: 'MIT', category: 'Tools',
  routes: { main: '/tools/my-tool' },
})
```
`toolEngine.install` emits `tool:installed`, runs `before/after:install` hooks, and
registers the behaviour config — the dynamic router, SEO derivation and the engine
all pick it up automatically.

## Auto Tool Builder

```ts
import { templateForName, slugifyToolName } from '@/os'
const tpl = templateForName('Tax Calculator')
const manifest = tpl.manifest('Tax Calculator', slugifyToolName('Tax Calculator'), 'Finance')
toolEngine.install(manifest)
```

## Plugins (Plugin SDK)

```ts
import { pluginSystem } from '@/core/infrastructure/plugins/pluginSystem'

pluginSystem.register({
  id: 'acme.seo-pack', name: 'SEO Pack', version: '1.0.0',
  exports: { /* plugin surface */ },
  async install(ctx) { ctx.register('seo-pack', { ... }) },
})
await pluginSystem.enableAll()
```

Lifecycle: `register → enable → (install) → use → disable → (uninstall)`.

## Hooks & events

```ts
import { hooks, eventBus } from '@/os'
hooks.add('before:ai', ctx => ({ ...ctx, guard: true }))
eventBus.on('ai:request', ({ toolSlug, mode }) => track(toolSlug, mode))
```

## API platform

`src/modules/tools/api.ts` exposes `toolApi` (REST-ready over the unified client).
Add a Pages Function per resource (`functions/api/tools/*`) to go live; the UI needs
no changes because it goes through the same client.
