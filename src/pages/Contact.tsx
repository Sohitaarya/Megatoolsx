import { motion } from 'framer-motion'
import { Mail, MessageCircle, Globe, MapPin, Send, CheckCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui'
import { useState } from 'react'

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div>
      <Helmet>
        <title>Contact Us | MegatoolsX</title>
        <meta name="description" content="Get in touch with the MegatoolsX team. We're here to help!" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question, suggestion, or need help? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: Mail, title: 'Email', desc: 'hello@megatoolsx.com', action: 'Send us an email' },
              { icon: MessageCircle, title: 'Support', desc: 'Help Center', action: 'Visit help center' },
              { icon: Globe, title: 'Social', desc: '@megatoolsx', action: 'Follow us' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.03]">
                <item.icon className="w-6 h-6 text-indigo-500 mb-3" />
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
                <span className="text-indigo-400 text-sm">{item.action} →</span>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-6 lg:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                      <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Your Email</label>
                      <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Subject</label>
                    <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Message</label>
                    <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y" placeholder="Tell us more about your inquiry..." />
                  </div>
                  <Button type="submit" icon={Send}>Send Message</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
