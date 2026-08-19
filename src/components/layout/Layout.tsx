import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { SearchModal } from './SearchModal'
import { DefaultHead } from '@/components/seo/SEOHead'
import { siteNavigationElementSchema } from '@/components/seo/schemas'
import { Skeleton } from '@/components/ui'
import { useToolsStore } from '@/store/toolsStore'
import { useReportWebVitals } from '@/seo/monitoring'

/** Primary navigation — mirrors Navbar; used for the SiteNavigationElement schema. */
const PRIMARY_NAV = [
  { name: 'Mega Tools', path: '/tools' },
  { name: 'AI Tools', path: '/ai-tools' },
  { name: 'Categories', path: '/categories' },
  { name: 'Collections', path: '/collections' },
  { name: 'Trending', path: '/trending' },
  { name: 'New Tools', path: '/new-tools' },
  { name: 'Popular', path: '/popular' },
  { name: 'Blog', path: '/blog' },
]

// Note: Organization + WebSite JSON-LD lives statically in index.html, so it is
// present for JS-less crawlers and persists across SPA navigation (no duplicates).

/** Minimal loading / error state while the tools.csv dataset loads. */
function ToolsGate({ children }: { children: React.ReactNode }) {
  const status = useToolsStore(s => s.status)
  const error = useToolsStore(s => s.error)
  const init = useToolsStore(s => s.init)

  if (status === 'error') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-3xl font-bold text-white mb-3">Couldn't load tools</div>
          <p className="text-gray-400 mb-6">{error}. Please check your connection and try again.</p>
          <button
            onClick={() => init()}
            className="inline-flex px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[50vh] flex justify-center px-6 py-10" role="status" aria-label="Loading tools">
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-3/4 mt-3" />
              <Skeleton className="h-3 w-full mt-2" />
              <Skeleton className="h-3 w-2/3 mt-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function Layout() {
  useReportWebVitals()
  return (
    <div className="min-h-screen bg-black text-white">
      <DefaultHead />
      <Helmet>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationElementSchema(PRIMARY_NAV)) }} />
      </Helmet>
      <Navbar />
      <SearchModal />
      <main className="pt-16">
        <ToolsGate>
          <Outlet />
        </ToolsGate>
      </main>
      <Footer />
    </div>
  )
}