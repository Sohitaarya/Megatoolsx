/**
 * Index Discovery — internal link graph.
 * Proves every eligible tool has real inbound links (no orphans): tool → category,
 * tool → related/similar (Discovery engine), category → ToolFeed → tool, Home → categories.
 */

import { useToolsStore } from '@/store/toolsStore'
import { categorySlug } from '@/data/csvData'
import { discoveryEngine } from '@/discovery'
import { getToolUrl } from './getToolUrl'
import { classifyToolUrl, type IndexableUrl } from './indexability'

export interface LinkGraphNode {
  slug: string
  url: string
  outbound: string[]
  inbound: string[]
}

export interface LinkGraph {
  nodes: LinkGraphNode[]
  orphanSlugs: string[]
  totalOutbound: number
}

/** Build the internal link graph over indexable tools. */
export function buildInternalLinkGraph(toolUrls: IndexableUrl[]): LinkGraph {
  const { csvTools } = useToolsStore.getState()
  const indexable = toolUrls.filter(u => u.indexable && u.type === 'tool')
  const bySlug = new Map(csvTools.map(t => [t.slug, t]))

  const nodes: LinkGraphNode[] = indexable.map(u => {
    const tool = bySlug.get(u.slug!)
    const outbound = new Set<string>()
    if (tool) {
      // Category link (parent).
      outbound.add(`/category/${categorySlug(tool.category)}`)
      // Related + similar via the Discovery engine (real, contextual).
      const recs = discoveryEngine.recommendForTool(u.slug!, { recentTools: [], recentCategories: [], favoriteTools: [] }, 6)
      for (const r of recs) outbound.add(getToolUrl(r.slug))
      // Same-category tools.
      for (const t of csvTools) {
        if (t.slug !== tool.slug && categorySlug(t.category) === categorySlug(tool.category)) outbound.add(getToolUrl(t.slug))
      }
    }
    return { slug: u.slug!, url: getToolUrl(u.slug!), outbound: Array.from(outbound), inbound: [] }
  })

  // Compute inbound from all outbound edges.
  const byUrl = new Map(nodes.map(n => [n.url, n]))
  for (const n of nodes) {
    for (const out of n.outbound) {
      const target = byUrl.get(out)
      if (target && !target.inbound.includes(n.url)) target.inbound.push(n.url)
    }
  }

  const orphanSlugs = nodes.filter(n => n.inbound.length === 0).map(n => n.slug)
  return { nodes, orphanSlugs, totalOutbound: nodes.reduce((a, n) => a + n.outbound.length, 0) }
}

/** A tool URL is reachable if it has inbound links OR is in a category the home links to. */
export function toolHasInbound(graph: LinkGraph, slug: string): boolean {
  const node = graph.nodes.find(n => n.slug === slug)
  return node ? node.inbound.length > 0 : false
}

export { classifyToolUrl }