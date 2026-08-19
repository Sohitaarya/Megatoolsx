import { motion } from 'framer-motion'
import { FileText, Scale, AlertTriangle, CheckCircle, Globe, Ban } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { webPageSchema, breadcrumbSchema } from '@/components/seo/schemas'

const sections = [
  { icon: FileText, title: 'Acceptance of Terms', content: 'By accessing and using MegatoolsX, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.' },
  { icon: Scale, title: 'Use License', content: 'Content on MegatoolsX is provided for informational purposes only. You may view, download, and print content for personal, non-commercial use. Redistribution or reproduction of content without permission is prohibited.' },
  { icon: AlertTriangle, title: 'Disclaimer', content: 'The information on MegatoolsX is provided "as is" without warranty of any kind. We strive for accuracy but cannot guarantee that all information is complete or current. Tool information may change after publication.' },
  { icon: CheckCircle, title: 'User Responsibilities', content: 'Users agree to use the website lawfully and not to engage in any activity that could harm the website, its content, or other users. This includes not attempting to access restricted areas or disrupt service.' },
  { icon: Globe, title: 'Third-Party Links', content: 'Our website contains links to third-party websites and tools. We are not responsible for the content, privacy practices, or availability of these external sites. Use them at your own risk.' },
  { icon: Ban, title: 'Limitation of Liability', content: 'MegatoolsX shall not be liable for any damages arising from the use or inability to use our website or the information provided. This includes direct, indirect, incidental, and consequential damages.' },
]

export function Terms() {
  const description = 'MegatoolsX terms of service — the terms and conditions for using our platform and content.'
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Terms of Service', path: '/terms' }]

  return (
    <div>
      <SEOHead
        title="Terms of Service"
        description={description}
        path="/terms"
        jsonLd={[
          webPageSchema({ title: 'Terms of Service', description, path: '/terms', breadcrumbs }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: January 2026</p>
          <p className="text-gray-400 mt-4 leading-relaxed">
            Please read these terms of service carefully before using MegatoolsX.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.03]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{section.title}</h2>
                  <p className="text-gray-400 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
          <h3 className="text-lg font-bold text-indigo-400 mb-2">Contact</h3>
          <p className="text-gray-400">For questions about these terms, contact us at <span className="text-indigo-400">legal@megatoolsx.com</span>.</p>
        </div>
      </div>
    </div>
  )
}
