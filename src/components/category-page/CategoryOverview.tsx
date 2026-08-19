import type { CsvTool } from '@/data/csvData'

/**
 * Category Hub — overview. Explains the category, who it's for, use cases and
 * typical workflows, derived deterministically (never duplicated per category).
 */
export function CategoryOverview({ name, tools }: { name: string; tools: CsvTool[] }) {
  const cat = name.toLowerCase()
  const sample = tools.slice(0, 3).map(t => t.name).join(', ') || 'popular tools'

  return (
    <section aria-label={`About ${name} tools`} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-3">What are {name} tools?</h2>
        <p className="text-gray-300 leading-relaxed">
          {name} tools help users {actionFor(cat)}. This category covers {tools.length} carefully
          documented tools — from {sample} — each with step-by-step guides, features, pricing,
          FAQs and troubleshooting.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Block title="Who it's for">
          <p className="text-sm text-gray-400">Beginners and professionals looking for {cat} solutions with clear guidance.</p>
        </Block>
        <Block title="Common use cases">
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Everyday {cat} tasks</li>
            <li>• Professional workflows</li>
            <li>• Learning & comparison</li>
          </ul>
        </Block>
        <Block title="Typical workflow">
          <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
            <li>Browse and compare tools</li>
            <li>Open the guide for your pick</li>
            <li>Follow step-by-step instructions</li>
          </ol>
        </Block>
      </div>
    </section>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
      <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>
      {children}
    </div>
  )
}

function actionFor(cat: string): string {
  const map: Record<string, string> = {
    'video/audio tools': 'create, edit and enhance video and audio content',
    'content writing': 'write, edit and improve written content',
    'seo/digital marketing': 'optimize and grow websites and campaigns',
    'design/creative': 'design visuals, logos and creative assets',
    'developers/coding': 'build, debug and ship software',
    'business/finance': 'manage money, invoices and business operations',
    'education/learning': 'learn, study and teach effectively',
    'healthtech/biotec': 'support health, wellness and research workflows',
    'personal/lifestyle': 'simplify daily personal tasks',
    'technology/future': 'explore and build with emerging technology',
    'climate/environment': 'measure, reduce and manage environmental impact',
    'space/astronomy': 'explore, model and understand space',
    'gaming/arvr': 'create and enjoy gaming and immersive experiences',
    'iot/robotics': 'connect, control and automate devices',
    'generative science': 'run and understand AI and scientific tools',
    'entertainment/culture': 'create and enjoy entertainment content',
  }
  return map[cat] ?? 'accomplish their goals efficiently'
}