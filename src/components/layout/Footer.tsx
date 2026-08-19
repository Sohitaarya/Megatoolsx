import { Link } from 'react-router-dom'
import { Sparkles, GitBranch, Globe, Mail, Heart } from 'lucide-react'

const footerLinks = {
  'Platform': [
    { label: 'All Tools', path: '/tools' },
    { label: 'Categories', path: '/categories' },
    { label: 'Trending', path: '/trending' },
    { label: 'New Tools', path: '/new-tools' },
    { label: 'Popular', path: '/popular' },
    { label: 'Compare Tools', path: '/compare' },
    { label: 'My Tools', path: '/my-tools' },
  ],
  'Categories': [
    { label: 'AI Tools Collection', path: '/ai-tools' },
    { label: 'Mega Tools', path: '/tools' },
    { label: 'All Categories', path: '/categories' },
    { label: 'Video/Audio Tools', path: '/category/video-audio-tools' },
    { label: 'Content Writing', path: '/category/content-writing' },
  ],
  'Resources': [
    { label: 'Blog', path: '/blog' },
    { label: 'AI Tools', path: '/ai-tools' },
    { label: 'All Tools', path: '/tools' },
    { label: 'Categories', path: '/categories' },
    { label: 'Trending Tools', path: '/trending' },
  ],
  'Company': [
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Admin Dashboard', path: '/admin' },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-500 hover:text-indigo-400 text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="text-white font-bold">
                Megatools<span className="text-indigo-400">X</span>
              </span>
              <span className="text-gray-600 text-sm ml-2">
                &copy; {new Date().getFullYear()} — All rights reserved
              </span>
            </div>

            <p className="text-gray-600 text-sm flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-red-500" /> by MegatoolsX Team
            </p>

            <div className="flex items-center gap-4">
              <a href="https://x.com/megatoolsx" aria-label="MegatoolsX on X (Twitter)" className="text-gray-600 hover:text-indigo-400 transition-colors" target="_blank" rel="noopener noreferrer">
                <Globe className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="https://github.com/megatoolsx" aria-label="MegatoolsX on GitHub" className="text-gray-600 hover:text-indigo-400 transition-colors" target="_blank" rel="noopener noreferrer">
                <GitBranch className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="mailto:hello@megatoolsx.com" aria-label="Email MegatoolsX" className="text-gray-600 hover:text-indigo-400 transition-colors">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
