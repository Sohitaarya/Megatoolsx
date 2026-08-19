/**
 * AIOS — Knowledge graph.
 * Entities + typed relationships (semantic links). Supports entity recognition
 * lookups and neighborhood queries for related-content features.
 */

export interface KnowledgeEntity {
  id: string
  type: string
  label: string
  props: Record<string, string>
}

export interface KnowledgeRelation {
  from: string
  to: string
  rel: string
}

export class KnowledgeGraph {
  private entities = new Map<string, KnowledgeEntity>()
  private relations: KnowledgeRelation[] = []
  private adjacency = new Map<string, Array<{ to: string; rel: string }>>()

  addEntity(e: KnowledgeEntity): void { this.entities.set(e.id, e) }

  /** Add a relation from→to and the reverse link automatically. */
  relate(from: string, to: string, rel: string, reverseRel?: string): void {
    this.relations.push({ from, to, rel })
    this.link(from, to, rel)
    this.link(to, from, reverseRel ?? `is_${rel}`)
  }

  private link(from: string, to: string, rel: string): void {
    const list = this.adjacency.get(from) ?? []
    list.push({ to, rel })
    this.adjacency.set(from, list)
  }

  getEntity(id: string): KnowledgeEntity | undefined { return this.entities.get(id) }

  /** Direct neighbors of an entity (for related content). */
  neighbors(id: string): Array<{ to: string; rel: string; entity?: KnowledgeEntity }> {
    return (this.adjacency.get(id) ?? []).map(n => ({ ...n, entity: this.entities.get(n.to) }))
  }

  /** Search entities by label substring + type filter. */
  search(query: string, type?: string): KnowledgeEntity[] {
    const q = query.toLowerCase()
    return Array.from(this.entities.values())
      .filter(e => (!type || e.type === type) && e.label.toLowerCase().includes(q))
      .slice(0, 20)
  }

  /** Populate with the tool catalog: category → contains → tool. */
  indexCatalog(categories: Array<{ name: string; slug: string }>, tools: Array<{ slug: string; name: string; category: string }>): void {
    for (const cat of categories) {
      this.addEntity({ id: `cat:${cat.slug}`, type: 'Category', label: cat.name, props: {} })
    }
    for (const t of tools) {
      this.addEntity({ id: `tool:${t.slug}`, type: 'Tool', label: t.name, props: { category: t.category } })
      const catSlug = t.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      this.relate(`cat:${catSlug}`, `tool:${t.slug}`, 'contains')
    }
  }

  size(): { entities: number; relations: number } { return { entities: this.entities.size, relations: this.relations.length } }
}

export const knowledgeGraph = new KnowledgeGraph()