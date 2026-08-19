import { useOutletContext, Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Download, Settings, BookOpen, Grid3X3, DollarSign, ThumbsUp, Shuffle,
  HelpCircle, Shield, Lightbulb, Play, Check, X, ExternalLink, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { getCsvCategoryColor } from '@/lib/utils'
import type { CsvTool } from '@/data/csvData'
import type { AiToolDetail } from '@/data/aiToolData'
import { SEOHead } from '@/components/seo/SEOHead'
import { breadcrumbSchema, webPageSchema, faqSchema } from '@/components/seo/schemas'

export function AiToolSection() {
  const { tool, detail } = useOutletContext<{ tool: CsvTool; detail: AiToolDetail }>()
  const { section } = useParams()
  const catColor = getCsvCategoryColor(tool.category)

  const s = section || 'how-to-use'

  const titles: Record<string, string> = {
    'how-to-use': 'How to Use',
    'download': 'Download',
    'installation': 'Installation Guide',
    'features': 'Features',
    'pricing': 'Pricing',
    'pros-cons': 'Pros & Cons',
    'alternatives': 'Alternatives',
    'faq': 'Frequently Asked Questions',
    'security': 'Security & Privacy',
    'tips': 'Tips & Tricks',
    'play': 'Use Online',
  }

  const icons: Record<string, any> = {
    'how-to-use': BookOpen, 'download': Download, 'installation': Settings,
    'features': Grid3X3, 'pricing': DollarSign, 'pros-cons': ThumbsUp,
    'alternatives': Shuffle, 'faq': HelpCircle, 'security': Shield,
    'tips': Lightbulb, 'play': Play,
  }
  const Icon = icons[s] || BookOpen
  const title = titles[s] || 'Guide'
  const path = `/ai-tools/${tool.slug}/${s}`
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: tool.name, path: `/ai-tools/${tool.slug}` },
    { name: title, path },
  ]

  return (
    <div>
      <SEOHead
        title={`${title} — ${tool.name}`}
        description={`${title} guide for ${tool.name}. ${tool.description}`}
        path={path}
        jsonLd={[
          webPageSchema({ title: `${title} — ${tool.name}`, description: `${title} guide for ${tool.name}.`, path, breadcrumbs }),
          breadcrumbSchema(breadcrumbs),
          ...(s === 'faq' ? [faqSchema(detail.faqs)] : []),
        ]}
      />

      <motion.div key={s} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${catColor}, #d946ef)` }}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-gray-500 text-sm mt-1">{tool.name} — Complete Guide</p>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 lg:p-8">
          {/* Breadcrumb inside */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/ai-tools" className="hover:text-purple-400 transition-colors">AI Tools</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/ai-tools/${tool.slug}`} className="hover:text-purple-400 transition-colors">{tool.name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{title}</span>
          </nav>

          {s === 'how-to-use' && (
            <div className="space-y-6">
              <p className="text-gray-300">Follow this step-by-step guide to start using {tool.name} today.</p>
              {detail.howToUse.map(st => (
                <StepRow key={st.step} step={st.step} title={st.title} desc={st.desc} color={catColor} />
              ))}
              <div className="pt-2">
                <a href={detail.website} target="_blank" rel="noopener noreferrer">
                  <Button icon={ExternalLink}>Open {tool.name}</Button>
                </a>
              </div>
            </div>
          )}

          {s === 'download' && (
            <div className="space-y-6">
              <p className="text-gray-300">Get {tool.name} on your favorite platform. All links open the official source.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {detail.downloads.map((d, i) => (
                  <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${catColor}, #d946ef)` }}>
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold group-hover:text-purple-400 transition-colors">{d.platform}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{d.description}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-purple-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-sm text-gray-300">
                💡 <strong>Tip:</strong> The web version needs no installation — just open {tool.name} in any browser and sign in.
              </div>
            </div>
          )}

          {s === 'installation' && (
            <div className="space-y-6">
              <p className="text-gray-300">Set up {tool.name} on your device in minutes.</p>
              {detail.installSteps.map(st => (
                <StepRow key={st.step} step={st.step} title={st.title} desc={st.desc} color={catColor} />
              ))}
            </div>
          )}

          {s === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {detail.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
          )}

          {s === 'pricing' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {detail.pricing.map((plan, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${plan.popular ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5 bg-white/[0.03]'}`}>
                  {plan.popular && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">MOST POPULAR</span>
                  )}
                  <div className="text-white font-semibold mt-2">{plan.plan}</div>
                  <div className="text-3xl font-bold text-white mt-1">{plan.price}<span className="text-sm text-gray-500">/mo</span></div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="text-sm text-gray-400 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="md:col-span-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-gray-400">
                Pricing shown is indicative and may change. Always check {tool.name}'s official pricing page for current rates.
              </div>
            </div>
          )}

          {s === 'pros-cons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Pros</h3>
                <div className="space-y-2">
                  {detail.pros.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{p}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><X className="w-5 h-5 text-red-400" /> Cons</h3>
                <div className="space-y-2">
                  {detail.cons.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />{c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {s === 'alternatives' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {detail.alternatives.map(alt => (
                <Link key={alt.slug} to={`/ai-tools/${alt.slug}`}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3"
                    style={{ background: `linear-gradient(135deg, ${getCsvCategoryColor(tool.category)}, #d946ef)` }}>
                    {alt.name.charAt(0)}
                  </div>
                  <div className="text-white font-medium group-hover:text-purple-400 transition-colors">{alt.name}</div>
                  <div className="text-gray-500 text-xs mt-1 line-clamp-2">{alt.desc}</div>
                </Link>
              ))}
            </div>
          )}

          {s === 'faq' && (
            <div className="space-y-4">
              {detail.faqs.map((f, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />{f.q}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          )}

          {s === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detail.security.map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <Shield className="w-5 h-5 text-emerald-400 mb-3" />
                  <h4 className="text-white font-medium mb-1">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
              <div className="md:col-span-2 p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-gray-400">
                Always enable two-factor authentication, use a unique password, and review connected third-party apps regularly to keep your {tool.name} account secure.
              </div>
            </div>
          )}

          {s === 'tips' && (
            <div className="space-y-3">
              {detail.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          )}

          {s === 'play' && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${catColor}, #d946ef)` }}>
                <Play className="w-10 h-10 text-white fill-current" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Use {tool.name} Online</h3>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Open {tool.name} directly in your browser — no download needed. Start with a free account.
              </p>
              <a href={detail.website} target="_blank" rel="noopener noreferrer">
                <Button size="lg" icon={ExternalLink}>Open {tool.name}</Button>
              </a>
              <div className="mt-6 text-sm text-gray-500">
                Also available: <Link to={`/ai-tools/${tool.slug}/download`} className="text-purple-400 hover:underline">Download apps</Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function StepRow({ step, title, desc, color }: { step: number; title: string; desc: string; color: string }) {
  return (
    <div className="flex gap-4">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}, #d946ef)` }}
      >
        {step}
      </div>
      <div>
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-gray-400 text-sm mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
