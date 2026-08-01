import { useOutletContext, Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tool } from '@/types/tool'
import { ToolSidebar } from '@/components/tool'
import { Section, StepList, FAQList, ErrorList, PricingCards, ScreenshotGrid, TipsList, AlternativesList } from '@/components/tool/ToolContent'
import { Badge } from '@/components/ui'
import { ChevronRight, ExternalLink, Users, Clock, Star, MessageCircle, Globe, Download, BookOpen, Sparkles } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Helmet } from 'react-helmet-async'

type SectionType = {
  title: string
  content: React.ReactNode
}

export function ToolDetail() {
  const { tool } = useOutletContext<{ tool: Tool }>()
  const { section } = useParams()

  const sections: Record<string, SectionType> = {
    overview: {
      title: 'Overview',
      content: (
        <div className="space-y-8">
          <p className="text-gray-300 leading-relaxed text-lg">{tool.longDescription}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl font-bold text-white">{tool.rating}</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl font-bold text-white">{tool.totalUsers}</div>
              <div className="text-sm text-gray-500">Users</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl font-bold text-white">{tool.pricingType}</div>
              <div className="text-sm text-gray-500">Pricing</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-2xl font-bold text-white">{tool.difficulty}</div>
              <div className="text-sm text-gray-500">Difficulty</div>
            </div>
          </div>
        </div>
      )
    },
    'how-to-use': {
      title: 'How to Use',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Follow this step-by-step guide to start using {tool.name} effectively.</p>
          <StepList steps={tool.stepByStepGuide} />
        </div>
      )
    },
    installation: {
      title: 'Installation',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Learn how to install {tool.name} on your device.</p>
          <StepList steps={[
            { step: 1, title: 'Visit Official Website', description: `Go to the official ${tool.name} website or app store.` },
            { step: 2, title: 'Download Installer', description: `Download the installer for your operating system.` },
            { step: 3, title: 'Run Installer', description: `Run the downloaded file and follow the installation wizard.` },
            { step: 4, title: 'Complete Setup', description: `Launch ${tool.name} and complete the initial setup.` },
          ]} />
          <div className="mt-6">
            <a href={tool.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
              <Download className="w-4 h-4" />
              Download {tool.name}
            </a>
          </div>
        </div>
      )
    },
    setup: {
      title: 'Setup',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Configure {tool.name} for the best experience.</p>
          <StepList steps={[
            { step: 1, title: 'Create Account', description: `Sign up for a ${tool.name} account if you haven't already.` },
            { step: 2, title: 'Configure Preferences', description: `Set your preferences including language, theme, and notifications.` },
            { step: 3, title: 'Connect Integrations', description: `Connect ${tool.name} with your other tools and services.` },
            { step: 4, title: 'Import Data', description: `Import your existing data into ${tool.name}.` },
            { step: 5, title: 'Team Setup', description: `Invite team members and set permissions if using the team plan.` },
          ]} />
        </div>
      )
    },
    login: {
      title: 'Login',
      content: (
        <div>
          <p className="text-gray-300 mb-6">How to log in to {tool.name}.</p>
          <StepList steps={[
            { step: 1, title: 'Open Login Page', description: `Go to the ${tool.name} login page.` },
            { step: 2, title: 'Enter Credentials', description: `Enter your email address and password.` },
            { step: 3, title: 'Two-Factor Authentication', description: `If enabled, enter your 2FA code from your authenticator app.` },
            { step: 4, title: 'Access Dashboard', description: `Once logged in, you'll be redirected to your dashboard.` },
          ]} />
        </div>
      )
    },
    signup: {
      title: 'Sign Up',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Create your {tool.name} account.</p>
          <StepList steps={[
            { step: 1, title: 'Visit Sign Up Page', description: `Go to the ${tool.name} registration page.` },
            { step: 2, title: 'Enter Details', description: `Provide your name, email, and create a strong password.` },
            { step: 3, title: 'Verify Email', description: `Check your email for a verification link and click it.` },
            { step: 4, title: 'Complete Profile', description: `Fill in your profile details and preferences.` },
            { step: 5, title: 'Choose Plan', description: `Select your plan - Free, Pro, or Enterprise.` },
          ]} />
        </div>
      )
    },
    features: {
      title: 'Features',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 mb-6">Discover all the powerful features {tool.name} offers.</p>
          {tool.features.map((feat, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">{feat.title}</h4>
                <p className="text-gray-400 text-sm mt-1">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    pricing: {
      title: 'Pricing',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Compare {tool.name} pricing plans.</p>
          <PricingCards plans={tool.pricing} />
        </div>
      )
    },
    faq: {
      title: 'Frequently Asked Questions',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Common questions about {tool.name}.</p>
          <FAQList faqs={tool.faqs} />
        </div>
      )
    },
    'error-codes': {
      title: 'Common Errors & Solutions',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Fix common {tool.name} errors with these solutions.</p>
          <ErrorList errors={tool.commonErrors} />
        </div>
      )
    },
    problems: {
      title: 'Common Problems',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Common issues users face with {tool.name} and how to resolve them.</p>
          <ErrorList errors={tool.commonErrors} />
        </div>
      )
    },
    solutions: {
      title: 'Solutions',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Proven solutions for common {tool.name} issues.</p>
          <ErrorList errors={tool.commonErrors.map(e => ({ ...e, title: `Solution for: ${e.title}` }))} />
        </div>
      )
    },
    templates: {
      title: 'Templates',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Ready-to-use templates for {tool.name}.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.templates.map((tmpl, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all">
                <h4 className="text-white font-medium">{tmpl.title}</h4>
                <p className="text-gray-400 text-sm mt-1">{tmpl.description}</p>
                <a href={tmpl.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 text-sm mt-3 hover:text-indigo-300">
                  View Template <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )
    },
    alternatives: {
      title: 'Alternatives',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Browse alternatives to {tool.name}.</p>
          <AlternativesList alternatives={tool.alternatives} />
        </div>
      )
    },
    'pros-cons': {
      title: 'Pros & Cons',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium text-emerald-400 mb-4">Pros 👍</h4>
            <ul className="space-y-3">
              {tool.pros.map((pro, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium text-red-400 mb-4">Cons 👎</h4>
            <ul className="space-y-3">
              {tool.cons.map((con, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    history: {
      title: 'History',
      content: (
        <div>
          <p className="text-gray-300 leading-relaxed">{tool.history}</p>
          <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="text-sm text-gray-500">Released: {formatDate(tool.releaseDate)}</div>
            <div className="text-sm text-gray-500">Developer: {tool.developer}</div>
          </div>
        </div>
      )
    },
    'latest-update': {
      title: 'Latest Update',
      content: (
        <div>
          <p className="text-gray-300 mb-6">What's new in {tool.name}.</p>
          {tool.updates.map((update, i) => (
            <div key={i} className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{update.title}</h4>
                <span className="text-xs text-gray-500">{update.version}</span>
              </div>
              <ul className="space-y-2">
                {update.changes.map((change, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    },
    reviews: {
      title: 'Reviews',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 mb-6">User reviews and ratings for {tool.name}.</p>
          {tool.reviews.map((review, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {review.user.charAt(0)}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{review.user}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex">{Array.from({ length: review.rating }, (_, j) => (
                      <svg key={j} className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}</span>
                    <span>{formatDate(review.date)}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{review.content}</p>
              <div className="mt-2 text-xs text-gray-500">{review.helpful} people found this helpful</div>
            </div>
          ))}
        </div>
      )
    },
    community: {
      title: 'Community',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 mb-6">Join the {tool.name} community.</p>
          {tool.communityDiscussions.map((disc, i) => (
            <a key={i} href={disc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-indigo-400" />
                <div>
                  <span className="text-white text-sm group-hover:text-indigo-400 transition-colors">{disc.platform}</span>
                  <p className="text-gray-500 text-xs">{disc.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5" />
                {disc.participants.toLocaleString()}
              </div>
            </a>
          ))}
        </div>
      )
    },
    resources: {
      title: 'Resources',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tool.resources.map((res, i) => (
            <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group">
              <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-indigo-400" />
              <div>
                <h4 className="text-white text-sm group-hover:text-indigo-400 transition-colors">{res.title}</h4>
                <span className="text-xs text-gray-500">{res.type}</span>
              </div>
            </a>
          ))}
        </div>
      )
    },
    'keyboard-shortcuts': {
      title: 'Keyboard Shortcuts',
      content: (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Shortcut</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Description</th>
                <th className="text-left text-gray-400 text-sm font-medium pb-3">Category</th>
              </tr>
            </thead>
            <tbody>
              {tool.keyboardShortcuts.map((sk, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-3"><kbd className="px-2 py-1 rounded bg-white/10 text-white text-sm font-mono">{sk.key}</kbd></td>
                  <td className="py-3 text-gray-400 text-sm">{sk.description}</td>
                  <td className="py-3 text-gray-500 text-sm">{sk.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
    api: {
      title: 'API Reference',
      content: (
        <div>
          <p className="text-gray-300 mb-6">API endpoints and documentation for {tool.name}.</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 text-sm font-medium pb-3">Method</th>
                  <th className="text-left text-gray-400 text-sm font-medium pb-3">Endpoint</th>
                  <th className="text-left text-gray-400 text-sm font-medium pb-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {tool.apiEndpoints.map((api, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-mono',
                        api.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' :
                        api.method === 'POST' ? 'bg-blue-500/10 text-blue-400' :
                        api.method === 'PUT' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      )}>{api.method}</span>
                    </td>
                    <td className="py-3 text-gray-300 text-sm font-mono">{api.endpoint}</td>
                    <td className="py-3 text-gray-400 text-sm">{api.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    integrations: {
      title: 'Integrations',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tool.integrations.map((int, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {int.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{int.name}</h4>
                <p className="text-gray-500 text-sm mt-0.5">{int.description}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    download: {
      title: 'Download',
      content: (
        <div className="text-center py-12">
          <Download className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Download {tool.name}</h3>
          <p className="text-gray-400 mb-8">Get the latest version of {tool.name} from the official source.</p>
          <a href={tool.downloadUrl} target="_blank" rel="noopener noreferrer">
            <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 text-lg">
              Download Now
            </button>
          </a>
          <div className="mt-4 text-sm text-gray-500">Version {tool.updates[0]?.version || 'Latest'} • {tool.platform.join(', ')}</div>
        </div>
      )
    },
    'official-links': {
      title: 'Official Links',
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tool.officialLinks.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group">
              <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-indigo-400" />
              <span className="text-gray-300 group-hover:text-indigo-400 transition-colors">{link.label}</span>
            </a>
          ))}
        </div>
      )
    },
    news: {
      title: 'News',
      content: (
        <div className="text-center py-12">
          <h3 className="text-xl text-white font-medium mb-2">Latest {tool.name} News</h3>
          <p className="text-gray-500">Stay updated with the latest news about {tool.name}.</p>
        </div>
      )
    },
    extensions: {
      title: 'Extensions',
      content: (
        <div className="text-center py-12">
          <h3 className="text-xl text-white font-medium mb-2">{tool.name} Extensions</h3>
          <p className="text-gray-500">Explore extensions and add-ons for {tool.name}.</p>
        </div>
      )
    },
    plugins: {
      title: 'Plugins',
      content: (
        <div className="text-center py-12">
          <h3 className="text-xl text-white font-medium mb-2">{tool.name} Plugins</h3>
          <p className="text-gray-500">Discover plugins to extend {tool.name}'s functionality.</p>
        </div>
      )
    },
    automation: {
      title: 'Automation',
      content: (
        <div>
          <p className="text-gray-300 mb-6">Automate your {tool.name} workflows.</p>
          <StepList steps={[
            { step: 1, title: 'Identify Repetitive Tasks', description: 'Look for tasks you perform regularly that could be automated.' },
            { step: 2, title: 'Use Built-in Automation', description: `Check if ${tool.name} has built-in automation features.` },
            { step: 3, title: 'Connect with Zapier/Make', description: `Use automation platforms to connect ${tool.name} with other apps.` },
            { step: 4, title: 'Write Custom Scripts', description: `Use the ${tool.name} API to create custom automation scripts.` },
            { step: 5, title: 'Monitor & Optimize', description: 'Monitor your automations and optimize them for better performance.' },
          ]} />
        </div>
      )
    },
  }

  const currentSection = section ? sections[section] : sections['overview']
  const sectionTitle = currentSection?.title || 'Overview'

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>{sectionTitle} - {tool.name} Guide | MegatoolsX</title>
        <meta name="description" content={`${sectionTitle} - Complete guide for ${tool.name}. ${tool.description}`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/tools" className="hover:text-indigo-400 transition-colors">Tools</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/tools/${tool.slug}`} className="hover:text-indigo-400 transition-colors">{tool.name}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{sectionTitle}</span>
        </nav>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ToolSidebar slug={tool.slug} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                  {tool.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{sectionTitle}</h1>
                  <p className="text-gray-500 text-sm mt-1">{tool.name} — Complete Guide & Tutorial</p>
                </div>
              </div>

              <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 lg:p-8">
                {currentSection?.content || (
                  <div className="text-center py-12">
                    <h3 className="text-xl text-white font-medium mb-2">Content Coming Soon</h3>
                    <p className="text-gray-500">This section is being updated.</p>
                  </div>
                )}
              </div>

              {/* Tips section at bottom of each page */}
              <div className="mt-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <h4 className="text-indigo-400 font-medium mb-2">💡 Pro Tips</h4>
                <ul className="space-y-1">
                  {tool.tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="text-gray-400 text-sm">• {tip}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
