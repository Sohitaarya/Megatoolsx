import { useState, type ReactNode } from 'react'
import { Play, Check, Copy } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'

export function ToolWrapper({ tool, children }: { tool: CsvTool; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{tool.name}</h3>
            <p className="text-gray-500 text-sm">Working Tool — Try it now</p>
          </div>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  )
}

export function ActionButton({ onClick, icon: Icon, label, variant = 'primary' }: {
  onClick: () => void; icon: any; label: string; variant?: 'primary' | 'secondary' | 'danger' | 'success'
}) {
  const colors = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  }
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${colors[variant]}`}>
      <Icon className="w-4 h-4" />{label}
    </button>
  )
}

export function OutputBox({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="mt-4">
      {label && <div className="text-sm text-gray-400 mb-2">{label}</div>}
      <div className="relative group">
        <textarea readOnly value={value} className="w-full h-32 p-4 rounded-xl bg-black/40 border border-white/10 text-gray-300 text-sm font-mono resize-none focus:outline-none" />
        <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export function InputField({ value, onChange, placeholder, label, multiline, icon: Icon, type }: {
  value: string; onChange: (v: string) => void; placeholder?: string; label?: string; multiline?: boolean; icon?: any; type?: string
}) {
  return (
    <div className="space-y-2">
      {label && <div className="text-sm text-gray-400">{label}</div>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />}
        {multiline ? (
          <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px] resize-y`} />
        ) : (
          <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type || 'text'}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50`} />
        )}
      </div>
    </div>
  )
}

export function SelectField({ value, onChange, options, label }: {
  value?: string; onChange?: (v: string) => void; options: string[]; label?: string
}) {
  return (
    <div className="space-y-2">
      {label && <div className="text-sm text-gray-400">{label}</div>}
      <select value={value} onChange={e => onChange?.(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function useToolState() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [processing, setProcessing] = useState(false)
  return { input, setInput, output, setOutput, processing, setProcessing }
}
