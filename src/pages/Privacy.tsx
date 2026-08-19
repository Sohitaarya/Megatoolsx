import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Server, Mail, Cookie } from 'lucide-react'
import { SEOHead } from '@/components/seo/SEOHead'
import { webPageSchema, breadcrumbSchema } from '@/components/seo/schemas'

const sections = [
  { icon: Shield, title: 'Information We Collect', content: 'We collect information you provide directly, such as your name and email address when you contact us or subscribe to our newsletter. We also collect anonymous usage data through cookies and analytics to improve our service.' },
  { icon: Lock, title: 'How We Use Your Information', content: 'Your information is used to provide and improve our services, respond to your inquiries, send updates with your consent, and analyze usage patterns to enhance user experience. We never sell your personal information to third parties.' },
  { icon: Eye, title: 'Data Protection', content: 'We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data. However, no method of transmission over the internet is 100% secure.' },
  { icon: Server, title: 'Data Storage', content: 'Your data is stored on secure servers. We retain your information only as long as necessary to provide our services and comply with legal obligations. You can request deletion of your data at any time.' },
  { icon: Mail, title: 'Communication', content: 'We may send you service-related emails. You can opt out of marketing communications at any time. We will never ask for sensitive information via email.' },
  { icon: Cookie, title: 'Cookies', content: 'We use essential cookies for site functionality and analytics cookies to understand usage patterns. You can control cookie preferences through your browser settings.' },
]

export function Privacy() {
  const description = 'MegatoolsX privacy policy — how we collect, use, and protect your data when you use our website.'
  const breadcrumbs = [{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }]

  return (
    <div>
      <SEOHead
        title="Privacy Policy"
        description={description}
        path="/privacy"
        jsonLd={[
          webPageSchema({ title: 'Privacy Policy', description, path: '/privacy', breadcrumbs }),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: January 2026</p>
          <p className="text-gray-400 mt-4 leading-relaxed">
            At MegatoolsX, we take your privacy seriously. This policy describes how we collect,
            use, and protect your personal information when you use our website.
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
          <h3 className="text-lg font-bold text-indigo-400 mb-2">Contact Us</h3>
          <p className="text-gray-400">If you have questions about this privacy policy, please contact us at <span className="text-indigo-400">privacy@megatoolsx.com</span>.</p>
        </div>
      </div>
    </div>
  )
}
