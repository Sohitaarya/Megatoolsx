import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Globe, BookOpen, Users, Shield, Zap, Heart, Award } from 'lucide-react'
import { Button } from '@/components/ui'
import { SEOHead } from '@/components/seo/SEOHead'
import { aboutPageSchema, breadcrumbSchema } from '@/components/seo/schemas'

const stats = [
  { value: '2,500+', label: 'Mega Tools', icon: Zap },
  { value: '30+', label: 'AI Tools', icon: Sparkles },
  { value: '16+', label: 'Categories', icon: BookOpen },
  { value: '1M+', label: 'Monthly Visitors', icon: Users },
]

const values = [
  { title: 'Knowledge for All', desc: 'Democratizing digital tool knowledge worldwide.', icon: Globe },
  { title: 'Quality Content', desc: 'Accurate, up-to-date guides and tutorials.', icon: Shield },
  { title: 'User First', desc: 'Everything we build serves our users.', icon: Heart },
  { title: 'Innovation', desc: 'Constantly evolving with the digital landscape.', icon: Award },
]

export function About() {
  const description = "Learn about MegatoolsX — the world's largest digital tools knowledge platform with 2500+ tool guides, AI tools, tutorials, and expert insights."
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]

  return (
    <div>
      <SEOHead
        title="About Us"
        description={description}
        path="/about"
        jsonLd={[
          aboutPageSchema({ title: 'About Us', description, path: '/about' }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Our Story</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              The World's Largest
              <span className="gradient-text"> Digital Tools</span> Platform
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              MegatoolsX is your ultimate resource for learning how to use any digital tool,
              AI tool, software, website, app, and browser extension. We provide step-by-step
              guides, tutorials, and solutions for every tool imaginable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                In today's digital world, there are thousands of tools available, but finding
                reliable, comprehensive guides for each one is a challenge. MegatoolsX was created
                to solve this problem.
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                We curate and create the most comprehensive guides for digital tools of all kinds —
                from AI-powered platforms to everyday productivity apps. Our database includes detailed
                information about 2,500+ tools across 16+ categories.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Whether you're a beginner looking to learn a new tool or an expert seeking advanced
                tips, MegatoolsX has you covered with step-by-step tutorials, troubleshooting guides,
                and expert insights.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent p-8">
              <h3 className="text-xl font-bold text-white mb-4">What We Offer</h3>
              <ul className="space-y-4">
                {[
                  { title: '2,500+ Tool Guides', desc: 'Comprehensive guides for every tool in our database' },
                  { title: 'AI Tools Collection', desc: 'Curated collection of 30+ featured AI tools' },
                  { title: 'Step-by-Step Tutorials', desc: 'Detailed walkthroughs for all skill levels' },
                  { title: 'Troubleshooting', desc: 'Solutions for common problems and errors' },
                  { title: 'Regular Updates', desc: 'Content updated regularly to stay current' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent text-center">
                <v.icon className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/20 p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Start Exploring Tools</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join millions of users who rely on MegatoolsX for their digital tool knowledge.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/tools"><Button size="lg">Browse Mega Tools</Button></Link>
              <Link to="/ai-tools"><Button variant="outline" size="lg">Explore AI Tools</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
