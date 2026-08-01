import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Home, ArrowLeft, Sparkles } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui'
import { useToolsStore } from '@/store/toolsStore'

export function NotFound() {
  const { csvTools } = useToolsStore()

  return (
    <div>
      <Helmet>
        <title>404 - Page Not Found | MegatoolsX</title>
        <meta name="description" content="The page you're looking for doesn't exist. Browse 2500+ tools at MegatoolsX." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="text-9xl font-bold gradient-text mb-4">404</div>
          <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            But don't worry — we have {csvTools.length.toLocaleString()}+ tools waiting for you!
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/">
              <Button icon={Home}>Go Home</Button>
            </Link>
            <Link to="/tools">
              <Button variant="outline" icon={Search}>Browse Tools</Button>
            </Link>
          </div>
          <div className="mt-12">
            <Link to="/ai-tools" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
              <Sparkles className="w-4 h-4" />
              Or explore our AI Tools collection
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
