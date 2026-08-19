import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowLeft, Tag, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { blogPosts } from '@/data/blog'
import { SEOHead } from '@/components/seo/SEOHead'
import { blogPostingSchema, breadcrumbSchema } from '@/components/seo/schemas'

export function BlogPost() {
  const { slug } = useParams()
  const path = `/blog/${slug ?? ''}`
  const post = blogPosts.find(p => p.slug === slug)

  if (!post) {
    return (
      <>
        <SEOHead
          title="404 - Article Not Found"
          description="This article doesn't exist or has been moved. Browse the latest MegatoolsX guides, tutorials, and tool articles."
          path={path}
          noIndex
        />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <div className="text-8xl font-bold gradient-text mb-4">404</div>
            <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
            <p className="text-gray-400 mb-8">This article doesn't exist or has been moved.</p>
            <Link to="/blog"><Button icon={ArrowLeft}>Back to Blog</Button></Link>
          </div>
        </div>
      </>
    )
  }

  const related = blogPosts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .concat(blogPosts.filter(p => p.slug !== post.slug && p.category !== post.category))
    .slice(0, 3)

  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path }]

  return (
    <div>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        path={path}
        type="article"
        publishedTime={post.date}
        modifiedTime={post.date}
        jsonLd={[
          blogPostingSchema({
            title: post.title,
            excerpt: post.excerpt,
            datePublished: post.date,
            dateModified: post.date,
            author: post.author,
            image: post.image,
            path,
            category: post.category,
            tags: post.tags,
          }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {post.category}
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mt-4 mb-6 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{post.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">
                <Tag className="w-3 h-3" />{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Body */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {post.body.map((paragraph, i) => (
            <p key={i} className="text-gray-300 leading-relaxed text-lg">{paragraph}</p>
          ))}
        </motion.article>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-8 text-center">
          <BookOpen className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Explore {blogPosts.length} Articles &amp; 2,500+ Tool Guides</h3>
          <p className="text-gray-400 mb-6">Get step-by-step guides for every digital tool.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/tools"><Button icon={Sparkles}>Browse Tools</Button></Link>
            <Link to="/ai-tools"><Button variant="outline">AI Tools</Button></Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map(p => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="block group p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.06] to-transparent hover:border-indigo-500/20 transition-all">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{p.category}</span>
                <h3 className="text-white font-semibold text-sm mt-2 group-hover:text-indigo-400 transition-colors line-clamp-2">{p.title}</h3>
                <p className="text-gray-500 text-xs mt-2 line-clamp-2">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
