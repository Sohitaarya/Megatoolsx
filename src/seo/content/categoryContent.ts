/**
 * Category Content — per-category topical-hub model.
 * Content depends on the actual category name + tool count. Deterministic,
 * unique per category, never generic filler. Only real catalog counts are shown.
 */

export interface CategoryContent {
  title: string
  intro: string
  overview: string
  benefits: string[]
  commonTasks: string[]
  howToChoose: string[]
  faq: { q: string; a: string }[]
  relatedSearches: string[]
  relatedCategories: string[]
}

const CATEGORY_TOPICS: Record<string, { task: string; taskNoun: string }> = {
  'Video/Audio Tools': { task: 'create, edit and convert video and audio', taskNoun: 'video and audio' },
  'Content Writing': { task: 'write, improve and optimize content', taskNoun: 'writing' },
  'SEO/Digital Marketing': { task: 'rank, measure and grow online visibility', taskNoun: 'SEO and marketing' },
  'Design/Creative': { task: 'design, resize and generate creative assets', taskNoun: 'design and creative' },
  'Developers/Coding': { task: 'write, format and debug code', taskNoun: 'developer' },
  'Business/Finance': { task: 'manage, budget and analyse finances', taskNoun: 'business and finance' },
  'Education/Learning': { task: 'learn, study and teach', taskNoun: 'learning' },
  'HealthTech/BioTech': { task: 'track, assess and support health', taskNoun: 'health' },
  'Personal/Lifestyle': { task: 'organize and simplify daily tasks', taskNoun: 'lifestyle' },
  'Technology/Future': { task: 'explore and build with new technology', taskNoun: 'technology' },
  'Climate/Environment': { task: 'measure and reduce environmental impact', taskNoun: 'climate' },
  'Entertainment/Culture': { task: 'create and enjoy entertainment', taskNoun: 'entertainment' },
  'Gaming/ARVR': { task: 'play, create and explore games', taskNoun: 'gaming' },
  'IoT/Robotics': { task: 'connect, control and automate devices', taskNoun: 'IoT and robotics' },
  'Space/Astronomy': { task: 'model, explore and understand space', taskNoun: 'space' },
  'Generative Science': { task: 'run and understand AI and scientific tools', taskNoun: 'AI and science' },
}

export function buildCategoryContent(categoryName: string, toolCount: number): CategoryContent {
  const topic = CATEGORY_TOPICS[categoryName] ?? { task: 'accomplish tasks', taskNoun: 'digital' }
  const n = categoryName.toLowerCase()
  const display = categoryName
  return {
    title: `${display} Tools — ${toolCount} Guides, Tutorials & FAQs`,
    intro: `${display} tools help you ${topic.task} — covered with ${toolCount} real, documented tools.`,
    overview: `This category brings together ${toolCount} tools for ${topic.taskNoun}. Each tool has a guide, features, how-to steps, FAQs and troubleshooting.`,
    benefits: [
      `Real workflows for ${topic.taskNoun}`,
      'Step-by-step instructions for every skill level',
      'Free guides + working interactive tools',
    ],
    commonTasks: [
      `Complete ${topic.taskNoun} tasks quickly`,
      'Compare and choose the right tool',
      'Learn best practices and avoid mistakes',
    ],
    howToChoose: [
      'Start with your goal, then match it to a tool',
      'Compare features, pricing and supported formats',
      'Check the guide + FAQ before committing',
    ],
    faq: [
      { q: `What are ${display} tools?`, a: `Tools in this category help you ${topic.task}. There are ${toolCount} documented tools here.` },
      { q: 'Are these tools free?', a: 'Every guide on MegatoolsX is free to read, and most tools work directly in the browser.' },
      { q: `How do I pick the right ${topic.taskNoun} tool?`, a: 'Review each tool\'s guide, features and FAQ, then compare them side by side.' },
    ],
    relatedSearches: [`best ${topic.taskNoun} tools`, `${topic.taskNoun} guide`, `free ${topic.taskNoun} tool`, `how to choose ${topic.taskNoun} tools`],
    relatedCategories: relatedCategoriesFor(categoryName),
  }
}

function relatedCategoriesFor(name: string): string[] {
  const map: Record<string, string[]> = {
    'Video/Audio Tools': ['Content Writing', 'Design/Creative'],
    'Design/Creative': ['Video/Audio Tools', 'Content Writing'],
    'Developers/Coding': ['Technology/Future', 'Business/Finance'],
    'SEO/Digital Marketing': ['Content Writing', 'Business/Finance'],
    'Education/Learning': ['Technology/Future', 'Generative Science'],
    'AI Tools': ['Generative Science', 'Developers/Coding'],
    'Generative Science': ['Technology/Future', 'AI Tools'],
    'Gaming/ARVR': ['Entertainment/Culture', 'Technology/Future'],
    'IoT/Robotics': ['Technology/Future', 'Developers/Coding'],
  }
  return map[name] ?? ['Design/Creative', 'Developers/Coding']
}