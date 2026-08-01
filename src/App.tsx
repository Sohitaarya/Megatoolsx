import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ToolPageLayout } from '@/components/tool/ToolPageLayout'
import { Home } from '@/pages/Home'
import { ToolsIndex } from '@/pages/tools/ToolsIndex'
import { AiTools } from '@/pages/AiTools'
import { AiToolPageLayout } from '@/pages/ai/AiToolPageLayout'
import { AiToolOverview } from '@/pages/ai/AiToolOverview'
import { AiToolSection } from '@/pages/ai/AiToolSection'
import { Categories } from '@/pages/Categories'
import { CsvToolOverview } from '@/pages/tools/CsvToolOverview'
import { CsvToolDetail } from '@/pages/tools/CsvToolDetail'
import { CategoryPage } from '@/pages/CategoryPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { Privacy } from '@/pages/Privacy'
import { Terms } from '@/pages/Terms'
import { Blog } from '@/pages/Blog'
import { BlogPost } from '@/pages/BlogPost'
import { Compare } from '@/pages/Compare'
import { MyTools } from '@/pages/MyTools'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
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

        {/* AI Tools — full sub-pages (download, how-to-use, etc.) */}
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
    </Routes>
  )
}
