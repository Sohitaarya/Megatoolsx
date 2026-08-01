export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getColorForCategory(category: string): string {
  const colors: Record<string, string> = {
    'AI Tools': '#6366f1',
    'AI Models': '#8b5cf6',
    'Chatbots': '#a855f7',
    'Image Generators': '#d946ef',
    'Video Tools': '#ec4899',
    'Audio Tools': '#f43f5e',
    'Writing Tools': '#ef4444',
    'Coding Tools': '#f97316',
    'Design Tools': '#f59e0b',
    'SEO Tools': '#10b981',
    'Marketing Tools': '#14b8a6',
    'Business Tools': '#06b6d4',
    'Finance Tools': '#0ea5e9',
    'Office Tools': '#3b82f6',
    'Education': '#6366f1',
    'Developer Tools': '#8b5cf6',
    'Cloud': '#a855f7',
    'Hosting': '#d946ef',
    'WordPress': '#ec4899',
    'Windows': '#f43f5e',
    'Mac': '#ef4444',
    'Linux': '#f97316',
    'Android': '#84cc16',
    'iPhone': '#22c55e',
    'Google': '#10b981',
    'Microsoft': '#14b8a6',
    'Adobe': '#06b6d4',
    'Meta': '#0ea5e9',
    'OpenAI': '#3b82f6',
    'GitHub': '#6366f1',
    'Canva': '#8b5cf6',
    'Figma': '#a855f7',
    'Notion': '#d946ef',
    'Slack': '#ec4899',
    'Discord': '#f43f5e',
    'Zoom': '#ef4444',
    'Netflix': '#f97316',
    'YouTube': '#f59e0b',
    'Instagram': '#eab308',
    'Facebook': '#84cc16',
    'WhatsApp': '#22c55e',
    'LinkedIn': '#10b981',
    'Pinterest': '#14b8a6',
    'Reddit': '#06b6d4',
    'X (Twitter)': '#0ea5e9',
    'Amazon': '#3b82f6',
    'Google Maps': '#6366f1',
    'Google Drive': '#8b5cf6',
    'Google Docs': '#a855f7',
    'Google Sheets': '#d946ef',
    'Google Chrome': '#ec4899',
    'Gmail': '#f43f5e',
    'Google Photos': '#ef4444',
    'Google Meet': '#f97316',
    'Google Calendar': '#f59e0b',
  }
  return colors[category] || '#6366f1'
}

/** Colors for the actual CSV category names (16 categories). */
export function getCsvCategoryColor(category: string): string {
  const csvColors: Record<string, string> = {
    'Video/Audio Tools': '#ec4899',
    'Content Writing': '#ef4444',
    'SEO/Digital Marketing': '#10b981',
    'Design/Creative': '#a855f7',
    'Developers/Coding': '#3b82f6',
    'Business/Finance': '#06b6d4',
    'Technology/Future': '#8b5cf6',
    'Personal/Lifestyle': '#22c55e',
    'Education/Learning': '#f97316',
    'HealthTech/BioTech': '#14b8a6',
    'Climate/Environment': '#0ea5e9',
    'Space/Astronomy': '#6366f1',
    'Gaming/ARVR': '#f59e0b',
    'IoT/Robotics': '#64748b',
    'Generative Science': '#d946ef',
    'Entertainment/Culture': '#f43f5e',
  }
  return csvColors[category] || '#6366f1'
}

export function getIconForCategory(category: string): string {
  const icons: Record<string, string> = {
    'AI Tools': 'Bot',
    'AI Models': 'Brain',
    'Chatbots': 'MessageCircle',
    'Image Generators': 'Image',
    'Video Tools': 'Video',
    'Audio Tools': 'Music',
    'Writing Tools': 'Pen',
    'Coding Tools': 'Code',
    'Design Tools': 'Palette',
    'SEO Tools': 'Search',
    'Marketing Tools': 'Megaphone',
    'Business Tools': 'Briefcase',
    'Finance Tools': 'DollarSign',
    'Office Tools': 'Building2',
    'Education': 'GraduationCap',
    'Developer Tools': 'Terminal',
    'Cloud': 'Cloud',
    'Hosting': 'Server',
    'WordPress': 'Globe',
    'Windows': 'Monitor',
    'Mac': 'Monitor',
    'Linux': 'Terminal',
    'Android': 'Smartphone',
    'iPhone': 'Smartphone',
    'Google': 'Search',
    'Microsoft': 'Window',
    'Adobe': 'Palette',
    'Meta': 'Globe',
    'OpenAI': 'Sparkles',
    'GitHub': 'GitBranch',
    'Canva': 'Image',
    'Figma': 'Pen',
    'Notion': 'FileText',
    'Slack': 'MessageSquare',
    'Discord': 'Headphones',
    'Zoom': 'Video',
    'Netflix': 'Film',
    'YouTube': 'Youtube',
    'Instagram': 'Camera',
    'Facebook': 'Facebook',
    'WhatsApp': 'MessageCircle',
    'LinkedIn': 'Linkedin',
    'Pinterest': 'Image',
    'Reddit': 'MessageCircle',
    'X (Twitter)': 'Twitter',
    'Amazon': 'ShoppingCart',
    'Google Maps': 'Map',
    'Google Drive': 'HardDrive',
    'Google Docs': 'FileText',
    'Google Sheets': 'Table',
    'Google Chrome': 'Globe',
    'Gmail': 'Mail',
    'Google Photos': 'Image',
    'Google Meet': 'Video',
    'Google Calendar': 'Calendar',
  }
  return icons[category] || 'Box'
}
