import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useToolsStore } from '@/store/toolsStore'
import { ArrowRight, Bot, Palette, Code, Globe, Zap, BookOpen, Cloud, Smartphone, Briefcase, Users, Gamepad2, Cpu, Telescope, Atom } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { collectionPageSchema, breadcrumbSchema } from '@/components/seo/schemas'

const iconMap: Record<string, any> = {
  'Video/Audio Tools': Zap,
  'Content Writing': BookOpen,
  'SEO/Digital Marketing': Globe,
  'Design/Creative': Palette,
  'Developers/Coding': Code,
  'Business/Finance': Briefcase,
  'Technology/Future': Cpu,
  'Personal/Lifestyle': Users,
  'Education/Learning': BookOpen,
  'HealthTech/BioTech': Bot,
  'Climate/Environment': Globe,
  'Entertainment/Culture': Smartphone,
  'Gaming/ARVR': Gamepad2,
  'IoT/Robotics': Cpu,
  'Space/Astronomy': Telescope,
  'Generative Science': Atom,
}

export function Categories() {
  const { csvCategories, csvTools } = useToolsStore()
  const description = `Browse ${csvTools.length}+ digital tool guides across ${csvCategories.length} categories. Find step-by-step tutorials, features, FAQs, and solutions for every tool.`
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Categories', path: '/categories' }]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEOHead
        title="Browse All Categories"
        description={description}
        path="/categories"
        jsonLd={[
          collectionPageSchema({
            title: 'Browse All Categories',
            description,
            path: '/categories',
            items: csvCategories.map(c => ({ name: c.name, path: `/category/${c.slug}` })),
          }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
        <p className="text-gray-400 mb-8">
          Browse {csvTools.length}+ tools across {csvCategories.length} categories from the CSV database
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {csvCategories.map((cat, i) => {
          const Icon = iconMap[cat.name] || GridIcon
          return (
            <Link to={`/category/${cat.slug}`} key={cat.slug}>
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    {Icon && <Icon className="w-6 h-6" />}
                  </div>
                  <span className="text-2xl font-bold text-white/20">{cat.count}</span>
                </div>
                <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors">{cat.name}</h3>
                <div className="flex items-center gap-1 text-indigo-400 text-sm mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Browse tools</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* AI Tools section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Featured Collection</h2>
        <Link to="/ai-tools"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
          <Bot className="w-5 h-5" /> Browse AI Tools Collection
        </Link>
      </div>
    </div>
  )
}

function GridIcon(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
}
