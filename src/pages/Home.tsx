import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, Sparkles, ArrowRight, Grid, Bot, Palette, Code, Globe, Zap, BookOpen, Users, Cloud, Smartphone, ChevronDown, Mail, Send, Star, Quote } from 'lucide-react'
import { useToolsStore } from '@/store/toolsStore'
import { Button, SectionHeader, StatusBadge } from '@/components/ui'
import { useSearchStore } from '@/store/searchStore'
import { useState } from 'react'
import { SEOHead } from '@/components/seo/SEOHead'
import { breadcrumbSchema } from '@/components/seo/schemas'
import { DiscoveryWidget } from '@/discovery'

const categoryIcons: Record<string, any> = {
  'Video/Audio Tools': Zap, 'Content Writing': BookOpen, 'SEO/Digital Marketing': Globe,
  'Design/Creative': Palette, 'Developers/Coding': Code, 'Business/Finance': Globe,
  'Technology/Future': Zap, 'Personal/Lifestyle': Users, 'Education/Learning': BookOpen,
  'HealthTech/BioTech': Users, 'Climate/Environment': Globe, 'Entertainment/Culture': Grid,
  'Gaming/ARVR': Smartphone, 'IoT/Robotics': Zap, 'Space/Astronomy': Globe, 'Generative Science': BookOpen,
}

const categoryColors: Record<string, string> = {
  'Video/Audio Tools': 'from-indigo-500 to-purple-600',
  'Content Writing': 'from-pink-500 to-rose-600',
  'SEO/Digital Marketing': 'from-emerald-500 to-teal-600',
  'Design/Creative': 'from-purple-500 to-pink-600',
  'Developers/Coding': 'from-blue-500 to-cyan-600',
  'Business/Finance': 'from-amber-500 to-orange-600',
  'Technology/Future': 'from-violet-500 to-purple-600',
  'Personal/Lifestyle': 'from-green-500 to-emerald-600',
  'Education/Learning': 'from-red-500 to-pink-600',
  'HealthTech/BioTech': 'from-teal-500 to-green-600',
  'Climate/Environment': 'from-sky-500 to-blue-600',
  'Entertainment/Culture': 'from-orange-500 to-red-600',
  'Gaming/ARVR': 'from-cyan-500 to-blue-600',
  'IoT/Robotics': 'from-gray-500 to-slate-600',
  'Space/Astronomy': 'from-indigo-500 to-blue-600',
  'Generative Science': 'from-fuchsia-500 to-pink-600',
}

const stats = [
  { label: 'Mega Tools', value: '2,500+', icon: Grid },
  { label: 'AI Tools', value: '30+', icon: Bot },
  { label: 'Categories', value: '16+', icon: BookOpen },
  { label: 'Monthly Users', value: '5M+', icon: Users },
]

export function Home() {
  const { csvTools, csvCategories, aiTools, latestTools, popularTools } = useToolsStore()
  const openSearch = useSearchStore(s => s.open)
  const topCategories = csvCategories.slice(0, 12)

  return (
    <div>
      <SEOHead
        title="Master Every Digital Tool in One Place"
        description="Free guides, tutorials, and solutions for 2500+ digital tools, AI tools, software, and apps. Learn how to use any tool step-by-step at MegatoolsX."
        path="/"
        jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }])}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>The World's Largest Digital Tools Platform</span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Master Every Digital
              <span className="gradient-text"> Tool </span>
              in One Place
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              2,500+ tools from our CSV database + 30 featured AI tools. Step-by-step guides, tutorials, and solutions for everything.
            </p>

            {/* Search */}
            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              onClick={openSearch}
              className="w-full max-w-2xl mx-auto flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-indigo-500/30 transition-all group">
              <Search className="w-6 h-6 text-gray-500 group-hover:text-indigo-400 transition-colors" />
              <div className="flex-1">
                <div className="text-white font-medium">Search 2,500+ tools...</div>
                <div className="text-sm text-gray-500">Search AI tools + Mega Tools database</div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-600">
                <kbd className="px-2 py-1 rounded-md bg-white/10 font-mono">⌘</kbd>
                <kbd className="px-2 py-1 rounded-md bg-white/10 font-mono">K</kbd>
              </div>
            </motion.button>

            {/* Quick Links */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-gray-600">Explore:</span>
              <Link to="/ai-tools" className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition-all">✨ AI Tools</Link>
              <Link to="/tools" className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm hover:bg-indigo-500/20 transition-all">📦 Mega Tools</Link>
              <Link to="/categories" className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-all">📂 Categories</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Discovery Widgets */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <DiscoveryWidget widget='trendingToday' limit={6} className="mt-10" />
          <DiscoveryWidget widget='aiRecommended' limit={6} className="mt-10" />
          <DiscoveryWidget widget='recentlyUpdated' limit={6} className="mt-10" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-indigo-500" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories from CSV */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Browse Categories" description="All categories generated from the CSV database." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topCategories.map((cat, i) => {
              const Icon = categoryIcons[cat.name] || Grid
              const colors = categoryColors[cat.name] || 'from-indigo-500 to-purple-600'
              return (
                <Link to={`/category/${cat.slug}`} key={cat.name}>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }} className="relative group p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 transition-all overflow-hidden">
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${colors}`} />
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-0.5">{cat.name}</h3>
                      <span className="text-xs text-indigo-400">{cat.count} tools</span>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trending AI Tools */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Trending AI Tools" subtitle="Featured Collection"
            description="Popular AI tools separate from the main database." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiTools.slice(0, 8).map((tool, i) => (
              <Link key={tool.slug} to={`/ai-tools/${tool.slug}`}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                  className="p-4 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-purple-500/20 hover:from-purple-500/5 transition-all group h-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm mb-3">
                    {tool.name.charAt(0)}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-purple-400 transition-colors">{tool.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">{tool.category}</span>
                  <p className="text-gray-500 text-xs mt-2 line-clamp-2">{tool.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/ai-tools"><Button variant="outline" size="lg" icon={Sparkles}>View All AI Tools</Button></Link>
          </div>
        </div>
      </section>

      {/* Latest Mega Tools (from CSV) */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Latest Mega Tools" subtitle="From CSV Database"
            description="Recently added tools from our 2,500+ tool database." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestTools.slice(0, 12).map((tool, i) => (
              <Link key={tool.slug} to={`/tools/${tool.slug}`}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }}
                  className="p-4 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 hover:from-indigo-500/5 transition-all group h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      {tool.name.charAt(0)}
                    </div>
                    <StatusBadge status={tool.status} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors truncate">{tool.name}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2">{tool.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/tools"><Button variant="outline" size="lg" icon={ArrowRight}>Browse All Mega Tools</Button></Link>
          </div>
        </div>
      </section>

      {/* Popular Mega Tools */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Popular Mega Tools" description="Most popular tools from our database." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularTools.slice(0, 12).map((tool, i) => (
              <Link key={tool.slug} to={`/tools/${tool.slug}`}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }}
                  className="p-4 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 transition-all group h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                      {tool.name.charAt(0)}
                    </div>
                    <StatusBadge status={tool.status} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-400 transition-colors truncate">{tool.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{tool.category}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Frequently Asked Questions" subtitle="FAQ"
            description="Everything you need to know about MegatoolsX." />
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="What Our Users Say" subtitle="Testimonials"
            description="Trusted by professionals, students, and creators worldwide." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent">
                <Quote className="w-8 h-8 text-indigo-500/40 mb-4" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/20 p-10 lg:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_#6366f1,_transparent_60%)]" />
            <div className="relative">
              <Mail className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">Stay Updated</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Get new tool guides, tutorials, and platform updates delivered to your inbox.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/20 p-12 text-center overflow-hidden">
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Master Digital Tools?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                2,500+ tools in our database + 30 featured AI tools. All in one place.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/tools"><Button size="lg" icon={BookOpen}>Explore Mega Tools</Button></Link>
                <Link to="/ai-tools"><Button variant="outline" size="lg" icon={Sparkles}>Explore AI Tools</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const FAQ_ITEMS = [
  { q: 'What is MegatoolsX?', a: 'MegatoolsX is the world\'s largest digital tools knowledge platform. We provide comprehensive guides, tutorials, and solutions for 2,500+ tools across 16+ categories.' },
  { q: 'Are the tools free to use?', a: 'Many tools in our database offer free plans. Every tool page includes pricing details so you can compare free and paid plans before you start.' },
  { q: 'How do I find a specific tool?', a: 'Use the search bar in the top navigation, browse by category, or check the popular and trending sections. Every tool has its own dedicated guide page.' },
  { q: 'Is the tool database updated regularly?', a: 'Yes! We continuously add new tools and update existing guides. Check the "Latest Update" section on each tool page for the most recent changes.' },
  { q: 'Can I bookmark or save tools?', a: 'Absolutely. Use the Save, Like, and Compare buttons on any tool page. Your saved tools appear in the "My Tools" section and are stored locally in your browser.' },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Digital Marketer', text: 'MegatoolsX saved me hours of research. Every tool I need has a complete guide with pricing, tutorials, and troubleshooting. It\'s my go-to resource now.' },
  { name: 'James Wilson', role: 'Freelance Developer', text: 'The step-by-step guides are incredibly detailed. I found answers for tools I\'ve used for years. The compare feature is brilliant for choosing between options.' },
  { name: 'Aisha Khan', role: 'Content Creator', text: 'From AI generators to video editors, everything is in one place. The search is instant and the guides are beginner-friendly. Highly recommended!' },
]

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const panelId = `faq-panel-${index}`
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
      <h3>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
        >
          <span className="text-white font-medium">{question}</span>
          <ChevronDown className={`w-5 h-5 text-indigo-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-6 pb-5 text-gray-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  if (subscribed) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
        🎉 You're subscribed! Check your inbox soon.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-md mx-auto">
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        autoComplete="email"
        className="flex-1 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
      <Button type="submit" size="lg" icon={Send}>Subscribe</Button>
    </form>
  )
}
