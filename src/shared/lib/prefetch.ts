/**
 * Route prefetch — warms code-split route chunks on hover so navigation feels
 * instant. Uses static dynamic imports (Vite code-splits them); calling these
 * only loads the chunk in the background, never blocking the current page.
 */

export function prefetchToolOverview(): void {
  void import('@/pages/tools/CsvToolOverview')
}
export function prefetchToolDetail(): void {
  void import('@/pages/tools/CsvToolDetail')
}
export function prefetchAiTool(): void {
  void import('@/pages/ai/AiToolOverview')
}

/** Pick the right chunk to warm for a route path. */
export function prefetchRoute(path: string): void {
  if (path.startsWith('/tools/')) prefetchToolOverview()
  else if (path.startsWith('/ai-tools/')) prefetchAiTool()
}