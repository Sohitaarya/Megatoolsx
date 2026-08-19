import { lazy, Suspense } from 'react'
import type { CsvTool } from '@/data/csvData'
import { mapEveryTool } from '@/data/designCreativeCapabilities'
import { Alert, Skeleton } from '@/components/ui'
import { DesignCreativeTool } from '@/tools/engines/design/DesignCreativeTool'

/**
 * Design/Creative — tool router.
 * slug → deterministic capability → family → lazy family engine.
 * Family engines are code-split (loaded only when a tool needs them).
 */

// Lazy, code-split family engines. Each import() is its own Vite chunk.
const ColorEngine = lazy(() => import('@/tools/engines/design/color').then(m => ({ default: m.ColorPaletteTool })))
const GradientEngine = lazy(() => import('@/tools/engines/design/gradient').then(m => ({ default: m.GradientTool })))
const ImageEngine = lazy(() => import('@/tools/engines/design/image').then(m => ({ default: m.ImageCompressorTool })))
const QrEngine = lazy(() => import('@/tools/engines/design/qr').then(m => ({ default: m.QRTool })))
const SvgEngine = lazy(() => import('@/tools/engines/design/svg').then(m => ({ default: m.SvgOptimizerTool })))
const MemeEngine = lazy(() => import('@/tools/engines/design/meme').then(m => ({ default: m.MemeTool })))
const DrawingEngine = lazy(() => import('@/tools/engines/design/drawing').then(m => ({ default: m.DrawingTool })))

const FAMILY_ENGINES: Record<string, React.LazyExoticComponent<(p: { tool: CsvTool }) => React.ReactElement | null>> = {
  color: ColorEngine,
  gradient: GradientEngine,
  'image-edit': ImageEngine,
  image: ImageEngine,
  qr: QrEngine,
  svg: SvgEngine,
  meme: MemeEngine,
  drawing: DrawingEngine,
}

/** Canvas-designer / thumbnail / logo / generative-art → the existing per-family workbench. */
const CANVAS_FAMILIES = new Set(['canvas-designer', 'thumbnail', 'logo', 'generative-art'])

export function DesignCreativeToolRouter({ tool }: { tool: CsvTool }) {
  const mapped = mapEveryTool(tool.slug, tool.name)

  // API-dependent (e.g. real 3D) — honest, never marked working.
  if (mapped.implementationType === 'api') {
    return (
      <Alert variant="info" title="Requires configuration">
        {tool.name} needs an external service + API key to run for real. It is not marked as working until configured.
      </Alert>
    )
  }

  const Engine = FAMILY_ENGINES[mapped.family]
  if (Engine) {
    return (
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
        <Engine tool={tool} />
      </Suspense>
    )
  }

  // Poster / thumbnail / logo / generative-art → the real canvas workbench.
  if (CANVAS_FAMILIES.has(mapped.family)) {
    return <DesignCreativeTool tool={tool} />
  }

  return (
    <Alert variant="warning" title="Not implemented">
      {tool.name} has no real design function defined yet. It is NOT marked as a working tool.
    </Alert>
  )
}