/**
 * Discovery — entity graph.
 * A typed knowledge graph connecting tools, categories, tags and keywords.
 * Used for "related category", "similar tools by tag", and entity-coverage
 * queries. Built once from the catalog; read-only afterward.
 */

import type { Catalog, ToolNode } from '../entities/catalog'

export interface GraphNode {
  id: string
  kind: 'tool' | 'category' | 'tag' | 'keyword'
  label: string
}

export interface GraphEdge {
  from: string
  to: string
  rel: 'IN_CATEGORY' | 'HAS_TAG' | 'HAS_KEYWORD'
}

export class EntityGraph {
  private nodes = new Map<string, GraphNode>()
  private edges: GraphEdge[] = []
  private adjacency = new Map<string, Array<{ to: string; rel: string }>>()

  /** Build the graph from a catalog (idempotent — clears + rebuilds). */
  build(catalog: Catalog): void {
    this.nodes.clear(); this.edges.length = 0; this.adjacency.clear()

    for (const cat of catalog.categories) this.nodes.set(`cat:${cat.slug}`, { id: `cat:${cat.slug}`, kind: 'category', label: cat.name })
    for (const tool of catalog.tools) {
      this.nodes.set(`tool:${tool.slug}`, { id: `tool:${tool.slug}`, kind: 'tool', label: tool.name })
      this.link(`tool:${tool.slug}`, `cat:${tool.categorySlug}`, 'IN_CATEGORY')
      for (const tag of tool.tags) {
        const tid = `tag:${tag}`
        if (!this.nodes.has(tid)) this.nodes.set(tid, { id: tid, kind: 'tag', label: tag })
        this.link(`tool:${tool.slug}`, tid, 'HAS_TAG')
      }
      for (const kw of tool.keywords) {
        const kid = `kw:${kw}`
        if (!this.nodes.has(kid)) this.nodes.set(kid, { id: kid, kind: 'keyword', label: kw })
        this.link(`tool:${tool.slug}`, kid, 'HAS_KEYWORD')
      }
    }
  }

  private link(from: string, to: string, rel: GraphEdge['rel']): void {
    this.edges.push({ from, to, rel })
    const list = this.adjacency.get(from) ?? []
    list.push({ to, rel })
    this.adjacency.set(from, list)
  }

  node(id: string): GraphNode | undefined { return this.nodes.get(id) }

  /** All relations from an entity id. */
  relationsOf(id: string): GraphEdge[] { return this.edges.filter(e => e.from === id) }

  /** Direct neighbors with their edge relation. */
  neighbors(id: string): Array<{ to: string; rel: string; node?: GraphNode }> {
    return (this.adjacency.get(id) ?? []).map(n => ({ ...n, node: this.nodes.get(n.to) }))
  }

  /** Tools that share a tag/keyword/category with the given tool id. */
  relatedBySharedEntity(toolId: string, kind: 'tag' | 'keyword' | 'category'): string[] {
    const shared = this.neighbors(toolId).filter(n => n.node?.kind === kind)
    const related = new Set<string>()
    for (const s of shared) {
      for (const n of this.neighbors(s.to)) {
        if (n.node?.kind === 'tool' && n.to !== toolId) related.add(n.to)
      }
    }
    return Array.from(related)
  }

  size(): { nodes: number; edges: number } { return { nodes: this.nodes.size, edges: this.edges.length } }
}

export const entityGraph = new EntityGraph()