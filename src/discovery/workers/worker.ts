/**
 * Discovery — background indexing.
 * The catalog + entity graph are small (2,500 records), so they build in
 * microseconds on the main thread. For very large catalogs this interface lets a
 * Web Worker build the index off-thread without changing consumers.
 */

export interface DiscoveryIndexMessage {
  type: 'build'
  payload: Array<{ slug: string; name: string; category: string; categorySlug: string; description?: string; tags: string[]; keywords: string[] }>
}

export interface DiscoveryIndexReply {
  type: 'built'
  nodes: number
  edges: number
}

/** Create a worker that builds the discovery index off-thread (optional path). */
export function createDiscoveryWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  const code = `
    self.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'build') {
        let nodes = 0, edges = 0
        const seen = new Set()
        for (const r of msg.payload) {
          seen.add('tool:' + r.slug)
          for (const t of r.tags) { seen.add('tag:' + t); edges++ }
          for (const k of r.keywords) { seen.add('kw:' + k); edges++ }
        }
        nodes = seen.size
        self.postMessage({ type: 'built', nodes, edges })
      }
    }
  `
  const blob = new Blob([code], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}