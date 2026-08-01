import { useState } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { useToolsStore } from '@/store/toolsStore'
import { motion } from 'framer-motion'
import {
  Lock, LogOut, LayoutDashboard, Plus, Edit, Trash2, Search,
  BarChart3, Users, BookOpen, Star, Settings, Download, Upload,
  FileText, Image, Tag, MessageCircle, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, Card } from '@/components/ui'

export function AdminDashboard() {
  const { isAuthenticated, login, logout } = useAdminStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: any[] = useToolsStore().csvTools as any[]
  const categories = useToolsStore().csvCategories
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl border border-white/5 bg-white/[0.03]"
        >
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Enter password to access dashboard</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); if (!login(password)) setError(true) }} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {error && <p className="text-red-400 text-sm">Invalid password</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </motion.div>
      </div>
    )
  }

  const stats = [
    { label: 'Total Tools', value: tools.length, icon: LayoutDashboard, color: 'text-indigo-400' },
    { label: 'Categories', value: categories.length, icon: Tag, color: 'text-purple-400' },
    { label: 'Total Users', value: '5M+', icon: Users, color: 'text-emerald-400' },
    { label: 'Reviews', value: tools.reduce((a: number, t: any) => a + (t.reviewCount || 0), 0).toLocaleString(), icon: Star, color: 'text-amber-400' },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-indigo-500" />
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl border border-white/5 bg-white/[0.03]"
            >
              <stat.icon className={cn('w-8 h-8 mb-3', stat.color)} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Add Tool', icon: Plus, color: 'bg-emerald-500/10 text-emerald-400' },
            { label: 'Bulk Import CSV', icon: Upload, color: 'bg-blue-500/10 text-blue-400' },
            { label: 'AI Generation', icon: Star, color: 'bg-purple-500/10 text-purple-400' },
            { label: 'SEO Manager', icon: Settings, color: 'bg-amber-500/10 text-amber-400' },
          ].map((action, i) => (
            <button key={action.label}
              className={cn('flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all')}
            >
              <div className={cn('p-2 rounded-lg', action.color)}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-white text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Tools Table */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">All Tools ({tools.length})</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search tools..." className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="p-4 text-gray-500 text-sm font-medium">Name</th>
                  <th className="p-4 text-gray-500 text-sm font-medium">Category</th>
                  <th className="p-4 text-gray-500 text-sm font-medium">Rating</th>
                  <th className="p-4 text-gray-500 text-sm font-medium">Pricing</th>
                  <th className="p-4 text-gray-500 text-sm font-medium">Platforms</th>
                  <th className="p-4 text-gray-500 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.slice(0, 50).map((tool, i) => (
                  <tr key={tool.slug || i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {tool.name.charAt(0)}
                        </div>
                        <span className="text-white text-sm">{tool.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{tool.category}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-white text-sm">{tool.rating}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400">{tool.pricingType}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {tool.platform.slice(0, 2).map((p: string) => (
                          <span key={p} className="text-xs text-gray-500">{p}</span>
                        ))}
                        {tool.platform.length > 2 && <span className="text-xs text-gray-600">+{tool.platform.length - 2}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
