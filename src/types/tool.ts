export interface ToolCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  count: number
}

export interface ToolFeature {
  title: string
  description: string
  icon?: string
}

export interface ToolScreenshot {
  url: string
  title: string
  description: string
}

export interface ToolVideo {
  title: string
  url: string
  duration: string
  platform: 'youtube' | 'vimeo' | 'other'
}

export interface ToolFAQ {
  question: string
  answer: string
}

export interface ToolError {
  code: string
  title: string
  description: string
  solution: string
}

export interface ToolStep {
  step: number
  title: string
  description: string
  image?: string
}

export interface ToolReview {
  id: string
  user: string
  avatar: string
  rating: number
  title: string
  content: string
  date: string
  helpful: number
}

export interface ToolPricing {
  plan: string
  price: string
  currency: string
  period: string
  features: string[]
  popular?: boolean
}

export interface ToolUpdate {
  version: string
  date: string
  title: string
  changes: string[]
}

export interface Tool {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  longDescription: string
  category: string
  subcategory: string
  icon: string
  color: string
  logoUrl: string
  websiteUrl: string
  documentationUrl: string
  downloadUrl: string
  officialLinks: {
    label: string
    url: string
  }[]
  platform: string[]
  pricingType: 'free' | 'freemium' | 'paid' | 'open-source'
  priceRange: string
  operatingSystem: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  reviewCount: number
  totalUsers: string
  releaseDate: string
  latestUpdate: string
  developer: string
  developerUrl: string
  isFeatured: boolean
  isTrending: boolean
  isPopular: boolean
  isNew: boolean
  overview: string
  whatItIs: string
  whatItDoes: string
  whyPeopleUseIt: string
  howItWorks: string
  features: ToolFeature[]
  stepByStepGuide: ToolStep[]
  beginnerGuide: ToolStep[]
  advancedGuide: ToolStep[]
  screenshots: ToolScreenshot[]
  videos: ToolVideo[]
  faqs: ToolFAQ[]
  commonErrors: ToolError[]
  tips: string[]
  warnings: string[]
  requirements: string[]
  alternatives: {
    name: string
    slug: string
    description: string
  }[]
  similarTools: string[]
  pros: string[]
  cons: string[]
  history: string
  pricing: ToolPricing[]
  reviews: ToolReview[]
  updates: ToolUpdate[]
  tags: string[]
  relatedArticles: {
    title: string
    slug: string
    excerpt: string
  }[]
  communityDiscussions: {
    platform: string
    title: string
    url: string
    participants: number
  }[]
  integrations: {
    name: string
    slug: string
    description: string
  }[]
  keyboardShortcuts: {
    key: string
    description: string
    category: string
  }[]
  apiEndpoints: {
    method: string
    endpoint: string
    description: string
  }[]
  templates: {
    title: string
    description: string
    url: string
  }[]
  resources: {
    title: string
    type: string
    url: string
  }[]
}

export interface ToolsData {
  tools: Tool[]
  categories: ToolCategory[]
}
