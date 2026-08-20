import { Outlet, useParams, Navigate } from 'react-router-dom'
import { useToolsStore } from '@/store/toolsStore'
import { useState, useEffect } from 'react'
import type { CsvTool } from '@/data/csvData'
import { SEOHead } from '@/components/seo/SEOHead'
import { redirectFor } from '@/seo/indexing/slugRedirects'

export function ToolPageLayout() {
  const { toolName } = useParams()
  const { getToolBySlug, csvTools } = useToolsStore()
  const [tool, setTool] = useState<CsvTool | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (toolName) {
      setLoading(true)
      const found = getToolBySlug(toolName)
      setTool(found || null)
      setLoading(false)
    }
  }, [toolName, getToolBySlug])

  const redirect = toolName ? redirectFor(toolName) : undefined
  if (redirect) return <Navigate to={`/tools/${redirect}`} replace />

  const sameCategory = tool
    ? csvTools.filter(t => t.category === tool.category && t.slug !== tool.slug)
    : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (!tool) {
    return (
      <>
        <SEOHead
          title="Tool Not Found"
          description="The requested tool does not exist on MegatoolsX. Browse 2,500+ tool guides instead."
          noIndex
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Tool Not Found</h2>
            <p className="text-gray-400">The tool you're looking for doesn't exist in our database.</p>
            <a href="/tools" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Browse All Tools</a>
          </div>
        </div>
      </>
    )
  }

  return <Outlet context={{ tool, sameCategory }} />
}
