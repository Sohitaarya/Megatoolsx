import { Tool } from '@/types/tool'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { motion } from 'framer-motion'

interface ToolContentProps {
  tool: Tool
  children: React.ReactNode
  className?: string
}

export function ToolContent({ tool, children, className }: ToolContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('prose prose-invert max-w-none', className)}
    >
      {children}
    </motion.div>
  )
}

export function Section({ title, children, id, className }: { title: string; children: React.ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={cn('mb-12', className)}>
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-1 h-7 bg-indigo-500 rounded-full inline-block" />
        {title}
      </h3>
      {children}
    </section>
  )
}

export function StepList({ steps }: { steps: { step: number; title: string; description: string }[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
            {step.step}
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">{step.title}</h4>
            <p className="text-gray-400 text-sm">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function FAQList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <details key={i} className="group rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:bg-white/[0.02] transition-colors">
            {faq.question}
            <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  )
}

export function ErrorList({ errors }: { errors: { code: string; title: string; description: string; solution: string }[] }) {
  return (
    <div className="space-y-4">
      {errors.map((error, i) => (
        <div key={i} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono">{error.code}</code>
                <h4 className="text-white font-medium text-sm">{error.title}</h4>
              </div>
              <p className="text-gray-400 text-sm mb-2">{error.description}</p>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-emerald-400 font-medium flex-shrink-0">Solution:</span>
                <span className="text-gray-300">{error.solution}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PricingCards({ plans }: { plans: { plan: string; price: string; period: string; features: string[]; popular?: boolean }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.plan}
          className={cn(
            'relative rounded-2xl border p-6',
            plan.popular
              ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 to-transparent'
              : 'border-white/5 bg-white/[0.03]'
          )}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>Most Popular</Badge>
            </div>
          )}
          <h3 className="text-xl font-bold text-white mb-2">{plan.plan}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-white">{plan.price}</span>
            <span className="text-gray-500 text-sm ml-1">/{plan.period}</span>
          </div>
          <ul className="space-y-2 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function ScreenshotGrid({ screenshots }: { screenshots: { url: string; title: string; description: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {screenshots.map((s, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-white/5 bg-white/[0.03] group cursor-pointer">
          <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
            <img
              src={s.url}
              alt={s.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="p-3">
            <h4 className="text-white text-sm font-medium">{s.title}</h4>
            <p className="text-gray-500 text-xs mt-0.5">{s.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TipsList({ tips }: { tips: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {tips.map((tip, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
          <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
          </div>
          <span className="text-gray-300 text-sm">{tip}</span>
        </div>
      ))}
    </div>
  )
}

export function AlternativesList({ alternatives }: { alternatives: { name: string; slug: string; description: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {alternatives.map((alt) => (
        <a
          key={alt.slug}
          href={`/tools/${alt.slug}`}
          className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {alt.name.charAt(0)}
          </div>
          <div>
            <h4 className="text-white font-medium group-hover:text-indigo-400 transition-colors">{alt.name}</h4>
            <p className="text-gray-500 text-sm mt-0.5">{alt.description}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
