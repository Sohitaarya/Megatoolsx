import { useOutletContext, Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { CsvTool } from '@/data/csvData'
import { categorySlug, toolMetaDescription } from '@/data/csvData'
import { ToolSidebar } from '@/components/tool'
import { ChevronRight, CheckCircle2, AlertCircle, HelpCircle, Download, ExternalLink, Star, Users, BookOpen, Sparkles } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { breadcrumbSchema, webPageSchema, faqSchema, howToSchema } from '@/components/seo/schemas'
import { ToolInstructions, ToolFeatures, ToolFAQ } from '@/components/tool-page'

type SectionConfig = {
  title: string
  icon: React.ReactNode
  content: (tool: CsvTool) => React.ReactNode
  /** Thin/generic content that should not be indexed by search engines. */
  noIndex?: boolean
}

const sections: Record<string, SectionConfig> = {
  'how-to-use': {
    title: 'How to Use',
    icon: <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    content: (tool) => <ToolInstructions tool={tool} />,
  },
  features: {
    title: 'Features',
    icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    content: (tool) => <ToolFeatures tool={tool} />,
  },
  problems: {
    title: 'Common Problems',
    icon: <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />,
    content: (tool) => (
      <div>
        <p className="text-gray-300 mb-6">Common issues users face with {tool.name} and how to resolve them.</p>
        <div className="space-y-4">
          {[
            { problem: 'Connection issues', solution: 'Check your internet connection. Try refreshing the page or clearing your browser cache.' },
            { problem: 'Account access problems', solution: 'Use the "Forgot Password" option to reset your password. Check your email for verification links.' },
            { problem: 'Slow performance', solution: 'Clear browser cache, update to the latest version, or try a different browser.' },
            { problem: 'File upload failures', solution: 'Check file size limits. Supported formats vary. Try compressing your files.' },
            { problem: 'Sync not working', solution: 'Ensure you\'re logged into the same account on all devices. Check your internet connection.' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h4 className="text-white font-medium text-sm">{item.problem}</h4>
                  <p className="text-gray-400 text-sm mt-1">Solution: {item.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  solutions: {
    title: 'Solutions',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
    content: (tool) => {
      const problems = sections['problems']?.content(tool)
      return (
        <div>
          <p className="text-gray-300 mb-6">Proven solutions for common {tool.name} issues.</p>
          {problems}
        </div>
      )
    },
  },
  faq: {
    title: 'FAQ',
    icon: <HelpCircle className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    content: (tool) => <ToolFAQ tool={tool} />,
  },
  alternatives: {
    title: 'Alternatives',
    icon: <Star className="w-5 h-5 text-amber-400" aria-hidden="true" />,
    noIndex: true,
    content: (tool) => (
      <div>
        <p className="text-gray-300 mb-6">Explore alternatives to {tool.name}.</p>
        <div className="text-center py-8 text-gray-500">
          Browse more tools in the <Link to="/tools" className="text-indigo-400 hover:underline">Mega Tools</Link> section.
        </div>
      </div>
    ),
  },
  download: {
    title: 'Download',
    icon: <Download className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    content: (tool) => (
      <div className="text-center py-12">
        <Download className="w-16 h-16 text-indigo-500 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-2xl font-bold text-white mb-2">Download {tool.name}</h3>
        <p className="text-gray-400 mb-8">Get the latest version from the official source.</p>
        <a href={`https://${tool.slug}.com/download`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Download className="w-5 h-5" aria-hidden="true" /> Download Now
        </a>
      </div>
    ),
  },
  resources: {
    title: 'Resources',
    icon: <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    content: (tool) => (
      <div className="space-y-4">
        <p className="text-gray-300 mb-6">Helpful resources for {tool.name}.</p>
        {[
          { title: `Official ${tool.name} Website`, type: 'website', url: `https://${tool.slug}.com` },
          { title: `${tool.name} Documentation`, type: 'documentation', url: `https://${tool.slug}.com/docs` },
          { title: `${tool.name} Support`, type: 'support', url: `https://${tool.slug}.com/support` },
          { title: `${tool.name} Blog`, type: 'blog', url: `https://${tool.slug}.com/blog` },
        ].map((res, i) => (
          <a key={i} href={res.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group">
            <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-indigo-400" aria-hidden="true" />
            <div className="flex-1">
              <div className="text-white text-sm group-hover:text-indigo-400 transition-colors">{res.title}</div>
              <span className="text-xs text-gray-500">{res.type}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-indigo-400" aria-hidden="true" />
          </a>
        ))}
      </div>
    ),
  },
}

// Default fallback for sections without specific content — thin/generic, so noindexed.
const defaultSection: Record<string, SectionConfig> = {
  'installation': { title: 'Installation', icon: <Download className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Installation" />, noIndex: true },
  'setup': { title: 'Setup Guide', icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Setup" />, noIndex: true },
  'login': { title: 'Login Guide', icon: <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Login" />, noIndex: true },
  'signup': { title: 'Sign Up Guide', icon: <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Sign Up" />, noIndex: true },
  'pricing': { title: 'Pricing', icon: <Star className="w-5 h-5 text-amber-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Pricing" />, noIndex: true },
  'templates': { title: 'Templates', icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Templates" />, noIndex: true },
  'keyboard-shortcuts': { title: 'Keyboard Shortcuts', icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Keyboard Shortcuts" />, noIndex: true },
  'api': { title: 'API Reference', icon: <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="API" />, noIndex: true },
  'automation': { title: 'Automation', icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Automation" />, noIndex: true },
  'integrations': { title: 'Integrations', icon: <Star className="w-5 h-5 text-amber-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Integrations" />, noIndex: true },
  'extensions': { title: 'Extensions', icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Extensions" />, noIndex: true },
  'plugins': { title: 'Plugins', icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Plugins" />, noIndex: true },
  'error-codes': { title: 'Error Codes', icon: <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Error Codes" />, noIndex: true },
  'pros-cons': { title: 'Pros & Cons', icon: <Star className="w-5 h-5 text-amber-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Pros and Cons" />, noIndex: true },
  'history': { title: 'History', icon: <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="History" />, noIndex: true },
  'latest-update': { title: 'Latest Update', icon: <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Latest Update" />, noIndex: true },
  'news': { title: 'News', icon: <BookOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="News" />, noIndex: true },
  'reviews': { title: 'Reviews', icon: <Star className="w-5 h-5 text-amber-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Reviews" />, noIndex: true },
  'community': { title: 'Community', icon: <Users className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Community" />, noIndex: true },
  'official-links': { title: 'Official Links', icon: <ExternalLink className="w-5 h-5 text-indigo-400" aria-hidden="true" />, content: (tool) => <Placeholder tool={tool} section="Official Links" />, noIndex: true },
}

const allSections = { ...sections, ...defaultSection }

function Placeholder({ tool, section }: { tool: CsvTool; section: string }) {
  return (
    <div className="text-center py-12">
      <BookOpen className="w-12 h-12 text-indigo-500 mx-auto mb-4" aria-hidden="true" />
      <h3 className="text-xl font-bold text-white mb-2">{section} Guide</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Learn more about {section.toLowerCase()} for {tool.name}. Visit the official website for detailed information.
      </p>
      <a href={`https://${tool.slug}.com`} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
        <ExternalLink className="w-4 h-4" aria-hidden="true" /> Visit Official Website
      </a>
    </div>
  )
}

export function CsvToolDetail() {
  const { tool, sameCategory } = useOutletContext<{ tool: CsvTool; sameCategory: CsvTool[] }>()
  const { section } = useParams()
  const currentSection = section ? allSections[section] : undefined
  const sectionTitle = currentSection?.title || 'Overview'

  const content = currentSection?.content(tool)
  const description = toolMetaDescription(tool)
  const path = `/tools/${tool.slug}/${section ?? ''}`
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: tool.name, path: `/tools/${tool.slug}` },
    { name: sectionTitle, path },
  ]
  // Unknown/unsupported sections, plus known-thin ones, must not be indexed.
  const isPlaceholder = !currentSection || !!currentSection.noIndex

  const faqs = section === 'faq' ? [
    { q: `What is ${tool.name}?`, a: `${tool.name} is a ${tool.category.toLowerCase()} tool that ${tool.description.toLowerCase()}` },
    { q: `Is ${tool.name} free?`, a: 'Pricing varies. Check the official website for the most up-to-date pricing information.' },
    { q: 'How do I get started?', a: 'Visit the official website, create an account, and follow the onboarding guide.' },
    { q: 'What platforms are supported?', a: 'Most online tools work on all major browsers and operating systems.' },
    { q: 'Is my data secure?', a: 'Always review the privacy policy and security measures on the official website.' },
  ] : undefined

  // Real step-by-step content on the how-to-use page → HowTo schema.
  const howToSteps = section === 'how-to-use' ? {
    name: `How to use ${tool.name}`,
    description: `Step-by-step instructions for using ${tool.name}.`,
    steps: [
      { name: 'Access the Tool', text: `Visit the ${tool.name} website or open the app on your device.` },
      { name: 'Create an Account', text: 'Sign up with your email address or log in if you already have an account.' },
      { name: 'Explore the Dashboard', text: 'Familiarize yourself with the interface and available options.' },
      { name: 'Configure Settings', text: 'Adjust settings according to your preferences and requirements.' },
      { name: 'Start Using', text: `Begin using ${tool.name} for your ${tool.category.toLowerCase()} needs.` },
    ],
  } : undefined

  return (
    <div className="min-h-screen bg-black">
      <SEOHead
        title={`${sectionTitle} - ${tool.name}`}
        description={`${sectionTitle} guide for ${tool.name}. ${description}`}
        path={path}
        keywords={tool.seoKeywords}
        noIndex={isPlaceholder}
        jsonLd={[
          webPageSchema({ title: `${sectionTitle} — ${tool.name}`, description: `${sectionTitle} guide for ${tool.name}.`, path, breadcrumbs }),
          breadcrumbSchema(breadcrumbs),
          ...(faqs ? [faqSchema(faqs)] : []),
          ...(howToSteps ? [howToSchema(howToSteps)] : []),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-400">Home</Link>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <Link to="/tools" className="hover:text-indigo-400">Tools</Link>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <Link to={`/tools/${tool.slug}`} className="hover:text-indigo-400">{tool.name}</Link>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
          <span className="text-white">{sectionTitle}</span>
        </nav>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ToolSidebar slug={tool.slug} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <motion.div key={section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0" aria-hidden="true">
                  {tool.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{sectionTitle}</h1>
                  <p className="text-gray-500 text-sm mt-1">{tool.name} — Complete Guide & Tutorial</p>
                </div>
              </div>

              <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 lg:p-8">
                {content || (
                  <div className="text-center py-12">
                    <h3 className="text-xl text-white font-medium mb-2">Content Coming Soon</h3>
                    <p className="text-gray-500">This section is being updated.</p>
                  </div>
                )}
              </div>

              {/* Related Tools */}
              <div className="mt-8">
                <h2 className="text-lg font-bold text-white mb-4">More in {tool.category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sameCategory.slice(0, 6).map(rel => (
                    <Link key={rel.slug} to={`/tools/${rel.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs" aria-hidden="true">
                        {rel.name.charAt(0)}
                      </div>
                      <div className="text-white text-sm group-hover:text-indigo-400 transition-colors truncate">{rel.name}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
