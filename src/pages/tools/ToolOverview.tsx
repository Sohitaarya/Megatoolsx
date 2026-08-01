import { useOutletContext, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tool } from '@/types/tool'
import { Button, Badge, StarRating, Card } from '@/components/ui'
import { ToolSidebar } from '@/components/tool'
import { useToolsStore } from '@/store/toolsStore'
import {
  ExternalLink, Download, Globe, BookOpen, MessageCircle,
  Star, Users, Clock, BarChart3, ChevronRight, ArrowLeft, Sparkles,
  Share2, Bookmark, Printer, Moon, FileDown, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

export function ToolOverview() {
  const { tool } = useOutletContext<{ tool: Tool }>()
  const { getRelatedTools } = useToolsStore()
  const relatedTools = getRelatedTools(tool as any, 6)

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>{tool.name} - Complete Guide & Tutorial | MegatoolsX</title>
        <meta name="description" content={tool.description} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/tools" className="hover:text-indigo-400 transition-colors">Tools</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{tool.name}</span>
        </nav>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ToolSidebar slug={tool.slug} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tool Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                  {tool.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{tool.name}</h1>
                    {tool.isFeatured && <Badge>Featured</Badge>}
                    {tool.isNew && <Badge>New</Badge>}
                  </div>
                  <p className="text-gray-400 text-lg mb-4">{tool.tagline}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <StarRating rating={tool.rating} size="md" />
                      <span className="ml-1 text-white">{tool.rating}</span>
                      <span className="text-gray-600">({tool.reviewCount} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{tool.totalUsers} users</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Updated {formatDate(tool.latestUpdate)}</span>
                    </span>
                    <span className="text-gray-600">{tool.category}</span>
                    <Badge>{tool.pricingType}</Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all" title="Share">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all" title="Bookmark">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all" title="Print">
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 mb-8">
                <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="md" icon={Globe}>Official Website</Button>
                </a>
                <a href={tool.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="md" icon={Download}>Download</Button>
                </a>
                <a href={tool.documentationUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="md" icon={BookOpen}>Documentation</Button>
                </a>
              </div>
            </motion.div>

            {/* Overview Content */}
            <div className="space-y-12">
              {/* What It Is */}
              <Section title="What is {tool.name}?">
                <p className="text-gray-300 leading-relaxed">{tool.longDescription}</p>
              </Section>

              {/* What It Does */}
              <Section title="What Does It Do?">
                <p className="text-gray-300 leading-relaxed">{tool.whatItDoes}</p>
              </Section>

              {/* Why People Use It */}
              <Section title="Why People Use It">
                <p className="text-gray-300 leading-relaxed">{tool.whyPeopleUseIt}</p>
              </Section>

              {/* Features */}
              <Section title="Key Features">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.features.map((feat, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">{feat.title}</h4>
                        <p className="text-gray-500 text-sm mt-0.5">{feat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Platform Support */}
              <Section title="Platform Support">
                <div className="flex flex-wrap gap-3">
                  {tool.platform.map(p => (
                    <span key={p} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm">
                      {p}
                    </span>
                  ))}
                </div>
              </Section>

              {/* Pricing */}
              <Section title="Pricing">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tool.pricing.map((plan, i) => (
                    <div key={i} className={cn(
                      'rounded-2xl border p-6',
                      plan.popular ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 to-transparent' : 'border-white/5 bg-white/[0.03]'
                    )}>
                      {plan.popular && <Badge className="mb-3">Most Popular</Badge>}
                      <h3 className="text-xl font-bold text-white mb-2">{plan.plan}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-500 text-sm ml-1">/{plan.period}</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                            <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Requirements */}
              <Section title="System Requirements">
                <ul className="space-y-2">
                  {tool.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Pros & Cons */}
              <Section title="Pros & Cons">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-emerald-400 font-medium mb-3">Pros</h4>
                    {tool.pros.map((pro, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {pro}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-red-400 font-medium mb-3">Cons</h4>
                    {tool.cons.map((con, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {con}
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              {/* History */}
              <Section title="History">
                <p className="text-gray-300 leading-relaxed">{tool.history}</p>
              </Section>

              {/* Latest Update */}
              <Section title="Latest Updates">
                {tool.updates.slice(0, 3).map((update, i) => (
                  <div key={i} className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{update.title}</h4>
                      <span className="text-xs text-gray-500">{update.version} — {formatDate(update.date)}</span>
                    </div>
                    <ul className="space-y-1">
                      {update.changes.map((change, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1 h-1 rounded-full bg-indigo-500" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Section>

              {/* Official Links */}
              <Section title="Official Links">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tool.officialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-indigo-500/20 transition-all text-sm"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </a>
                  ))}
                </div>
              </Section>

              {/* Community Discussions */}
              <Section title="Community Discussions">
                <div className="space-y-3">
                  {tool.communityDiscussions.map((disc, i) => (
                    <a
                      key={i}
                      href={disc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                        <div>
                          <span className="text-white text-sm group-hover:text-indigo-400 transition-colors">{disc.platform}</span>
                          <p className="text-gray-500 text-xs">{disc.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        {disc.participants.toLocaleString()}
                      </div>
                    </a>
                  ))}
                </div>
              </Section>

              {/* Related Tools */}
              <Section title="Related Tools">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedTools.map(related => (
                    <Link
                      key={related.slug}
                      to={`/tools/${related.slug}`}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {related.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-medium text-sm group-hover:text-indigo-400 transition-colors truncate">{related.name}</h4>
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{related.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Section>

              {/* Tags */}
              <Section title="Tags">
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, i) => (
                    <Link
                      key={i}
                      to={`/tools?search=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <span className="w-1 h-7 bg-indigo-500 rounded-full inline-block" />
        {title}
      </h2>
      {children}
    </section>
  )
}
