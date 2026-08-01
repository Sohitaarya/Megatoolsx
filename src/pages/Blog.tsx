import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, Clock, User, ArrowRight, Sparkles, BookOpen, Tag } from 'lucide-react'
import { Button } from '@/components/ui'
import { useToolsStore } from '@/store/toolsStore'
import { blogPosts } from '@/data/blog'

export function Blog() {
  const { csvTools } = useToolsStore()

  return (
    <div>
      <Helmet>
        <title>Blog - Guides & Tutorials | MegatoolsX</title>
        <meta name="description" content="Latest guides, tutorials, and articles about digital tools, AI, and technology." />
      </Helmet>

      {/* Header */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Blog & Tutorials</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Latest Articles</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Guides, tutorials, and insights about digital tools, AI, and technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <Link to={`/blog/${blogPosts[0].slug}`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative group rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-8 lg:p-12 hover:border-indigo-500/30 transition-all">
            <div className="relative">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {blogPosts[0].category}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mt-4 mb-4 group-hover:text-indigo-400 transition-colors">
                {blogPosts[0].title}
              </h2>
              <p className="text-gray-400 text-lg mb-6 max-w-2xl">{blogPosts[0].excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><User className="w-4 h-4" />{blogPosts[0].author}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{blogPosts[0].date}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{blogPosts[0].readTime}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-indigo-400 font-medium">
                Read Article <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post, i) => (
            <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/blog/${post.slug}`} className="block group p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent hover:border-indigo-500/20 hover:from-indigo-500/5 transition-all h-full">
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400">{post.category}</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2 group-hover:text-indigo-400 transition-colors">{post.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Explore Tools CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/20 p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Explore {csvTools.length}+ Tools</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Our database has comprehensive guides for every tool you can imagine.
          </p>
          <Link to="/tools"><Button size="lg" icon={Sparkles}>Browse All Tools</Button></Link>
        </div>
      </section>
    </div>
  )
}
