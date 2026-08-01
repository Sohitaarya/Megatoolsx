import { create } from 'zustand'
import type { Tool } from '@/types/tool'

interface AdminStore {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  tools: Tool[]
  setTools: (tools: Tool[]) => void
  addTool: (tool: Tool) => void
  updateTool: (id: string, data: Partial<Tool>) => void
  deleteTool: (id: string) => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  isAuthenticated: localStorage.getItem('megatoolsx-admin') === 'authenticated',
  tools: [],

  login: (password: string) => {
    const valid = password === 'admin123' // Simple auth - in production use proper auth
    if (valid) {
      localStorage.setItem('megatoolsx-admin', 'authenticated')
      set({ isAuthenticated: true })
    }
    return valid
  },

  logout: () => {
    localStorage.removeItem('megatoolsx-admin')
    set({ isAuthenticated: false })
  },

  setTools: (tools) => set({ tools }),
  addTool: (tool) => set(state => ({ tools: [...state.tools, tool] })),
  updateTool: (id, data) => set(state => ({
    tools: state.tools.map(t => t.id === id ? { ...t, ...data } : t)
  })),
  deleteTool: (id) => set(state => ({
    tools: state.tools.filter(t => t.id !== id)
  })),
}))
