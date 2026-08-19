import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { useToolsStore } from '@/store/toolsStore'
import { ErrorBoundary } from '@/shared/ui/Boundaries'
import { PageTracker } from '@/analytics'
import { buildContainer } from '@/core/container'
import { loadBuiltinToolConfig } from '@/core/infrastructure/tools/toolRegistry'
import { bootstrapToolOS } from '@/os/bootstrap'
import { startAIOS } from '@/aios/boot'

// Code-split every route so first paint ships only the Home kernel.
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const ToolsIndex = lazy(() => import('@/pages/tools/ToolsIndex').then(m => ({ default: m.ToolsIndex })))
const Categories = lazy(() => import('@/pages/Categories').then(m => ({ default: m.Categories })))
const CategoryPage = lazy(() => import('@/pages/CategoryPage').then(m => ({ default: m.CategoryPage })))
const ToolPageLayout = lazy(() => import('@/components/tool/ToolPageLayout').then(m => ({ default: m.ToolPageLayout })))
const CsvToolOverview = lazy(() => import('@/pages/tools/CsvToolOverview').then(m => ({ default: m.CsvToolOverview })))
const CsvToolDetail = lazy(() => import('@/pages/tools/CsvToolDetail').then(m => ({ default: m.CsvToolDetail })))
const AiTools = lazy(() => import('@/pages/AiTools').then(m => ({ default: m.AiTools })))
const AiToolPageLayout = lazy(() => import('@/pages/ai/AiToolPageLayout').then(m => ({ default: m.AiToolPageLayout })))
const AiToolOverview = lazy(() => import('@/pages/ai/AiToolOverview').then(m => ({ default: m.AiToolOverview })))
const AiToolSection = lazy(() => import('@/pages/ai/AiToolSection').then(m => ({ default: m.AiToolSection })))
const About = lazy(() => import('@/pages/About').then(m => ({ default: m.About })))
const Contact = lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })))
const Privacy = lazy(() => import('@/pages/Privacy').then(m => ({ default: m.Privacy })))
const Terms = lazy(() => import('@/pages/Terms').then(m => ({ default: m.Terms })))
const Blog = lazy(() => import('@/pages/Blog').then(m => ({ default: m.Blog })))
const BlogPost = lazy(() => import('@/pages/BlogPost').then(m => ({ default: m.BlogPost })))
const Compare = lazy(() => import('@/pages/Compare').then(m => ({ default: m.Compare })))
const MyTools = lazy(() => import('@/pages/MyTools').then(m => ({ default: m.MyTools })))
const Collections = lazy(() => import('@/pages/Collections').then(m => ({ default: m.Collections })))
const CollectionPage = lazy(() => import('@/pages/CollectionPage').then(m => ({ default: m.CollectionPage })))
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const SeoMonitoring = lazy(() => import('@/pages/admin/SeoMonitoring').then(m => ({ default: m.SeoMonitoring })))

/** Minimal fallback while a route chunk downloads. */
function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-label="Loading page">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
    </div>
  )
}

export default function App() {
  // App bootstrap: build the core container, load the config-driven tool
  // registry, and kick off the tools.csv load as early as possible.
  useEffect(() => {
    buildContainer()
    loadBuiltinToolConfig()
    useToolsStore.getState().init()
    bootstrapToolOS()
    startAIOS()
  }, [])

  return (
    <ErrorBoundary resetKey={window.location.pathname}>
      <PageTracker />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        {/* Main Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* Mega Tools (from CSV) */}
          <Route path="/tools" element={<ToolsIndex />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />

          {/* CSV Tool Pages - all sub-pages */}
          <Route path="/tools/:toolName" element={<ToolPageLayout />}>
            <Route index element={<CsvToolOverview />} />
            {['overview', 'how-to-use', 'features', 'problems', 'solutions', 'faq',
              'alternatives', 'download', 'resources', 'installation', 'setup',
              'login', 'signup', 'pricing', 'templates', 'keyboard-shortcuts',
              'api', 'automation', 'integrations', 'extensions', 'plugins',
              'error-codes', 'pros-cons', 'history', 'latest-update', 'news',
              'reviews', 'community', 'official-links'].map(p => (
              <Route key={p} path={p} element={<CsvToolDetail />} />
            ))}
          </Route>

          {/* AI Tools — full sub-pages */}
          <Route path="/ai-tools" element={<AiTools />} />
          <Route path="/ai-tools/:aiToolSlug" element={<AiToolPageLayout />}>
            <Route index element={<AiToolOverview />} />
            {['how-to-use', 'download', 'installation', 'features', 'pricing',
              'pros-cons', 'alternatives', 'faq', 'security', 'tips', 'play'].map(s => (
              <Route key={s} path={s} element={<AiToolSection />} />
            ))}
          </Route>

          {/* Auxiliary pages */}
          <Route path="/categories" element={<Categories />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:collectionId" element={<CollectionPage />} />
          <Route path="/trending" element={<ToolsIndex />} />
          <Route path="/new-tools" element={<ToolsIndex />} />
          <Route path="/popular" element={<ToolsIndex />} />

          {/* Company pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* User features */}
          <Route path="/compare" element={<Compare />} />
          <Route path="/my-tools" element={<MyTools />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/seo" element={<SeoMonitoring />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}