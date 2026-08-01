export interface AiToolBase {
  name: string
  slug: string
  category: string
  description: string
}

export interface AiDownload {
  platform: string
  url: string
  description: string
  official: boolean
}

export interface AiStep {
  step: number
  title: string
  desc: string
}

export interface AiPricingPlan {
  plan: string
  price: string
  features: string[]
  popular?: boolean
}

export interface AiFAQ {
  q: string
  a: string
}

export interface AiAlt {
  name: string
  slug: string
  desc: string
}

export interface AiToolDetail {
  website: string
  downloads: AiDownload[]
  howToUse: AiStep[]
  installSteps: AiStep[]
  features: string[]
  pricing: AiPricingPlan[]
  pros: string[]
  cons: string[]
  faqs: AiFAQ[]
  alternatives: AiAlt[]
  security: { title: string; desc: string }[]
  tips: string[]
}

// Real official websites for well-known AI tools
const WEBSITES: Record<string, string> = {
  'ChatGPT': 'https://chatgpt.com',
  'Claude': 'https://claude.ai',
  'Gemini': 'https://gemini.google.com',
  'Copilot': 'https://copilot.microsoft.com',
  'Midjourney': 'https://www.midjourney.com',
  'DALL-E': 'https://openai.com/dall-e',
  'Stable Diffusion': 'https://stability.ai',
  'Adobe Firefly': 'https://firefly.adobe.com',
  'Leonardo AI': 'https://leonardo.ai',
  'Runway ML': 'https://runwayml.com',
  'Synthesia': 'https://www.synthesia.io',
  'ElevenLabs': 'https://elevenlabs.io',
  'Murf AI': 'https://murf.ai',
  'Grammarly': 'https://www.grammarly.com',
  'Jasper AI': 'https://www.jasper.ai',
  'Copy AI': 'https://www.copy.ai',
  'Writesonic': 'https://writesonic.com',
  'Perplexity AI': 'https://www.perplexity.ai',
  'You.com': 'https://you.com',
  'Notion AI': 'https://www.notion.so',
  'Gamma AI': 'https://gamma.app',
  'Beautiful AI': 'https://www.beautiful.ai',
  'Canva AI': 'https://www.canva.com',
  'HeyGen': 'https://www.heygen.com',
  'Pictory': 'https://pictory.ai',
  'Descript': 'https://www.descript.com',
  'Otter AI': 'https://otter.ai',
  'Sora': 'https://openai.com/sora',
  'DeepSeek': 'https://www.deepseek.com',
  'Grok': 'https://grok.x.ai',
}

function storeLink(platform: 'ios' | 'android', query: string): string {
  const q = encodeURIComponent(query)
  return platform === 'ios'
    ? `https://apps.apple.com/us/app/name/${q}`
    : `https://play.google.com/store/search?q=${q}&c=apps`
}

/** Deterministic, per-tool rich content. No randomness — stable across renders/builds. */
export function getAiToolDetail(tool: AiToolBase): AiToolDetail {
  const name = tool.name
  const slug = tool.slug
  const cat = tool.category || 'AI Tool'
  const desc = tool.description || `${name} — a leading ${cat} platform.`
  const website = WEBSITES[name] || `https://${slug}.com`

  const lower = name.toLowerCase()

  // Features specific to common AI tool types
  const isChat = cat.includes('Chat') || ['grok', 'deepseek', 'perplexity', 'you'].some(s => lower.includes(s))
  const isImage = cat.includes('Image') || cat.includes('Design')
  const isVideo = cat.includes('Video') || cat.includes('Avatar')
  const isAudio = cat.includes('Audio') || cat.includes('Voice')
  const isWriting = cat.includes('Writing')
  const isCode = cat.includes('Coding')

  const features = [
    `${isChat ? 'Natural language conversations' : isImage ? 'Generate high-quality images from text' : isVideo ? 'Create studio-quality video from prompts' : isAudio ? 'Clone and generate realistic voices' : isCode ? 'Write and review code with AI assistance' : 'Intelligent AI-powered workflows'} powered by ${name}`,
    'User-friendly interface designed for both beginners and professionals',
    'Fast, real-time responses with low latency',
    'Secure data handling with encryption in transit and at rest',
    'Available on web, desktop, and mobile platforms',
    'Regular updates with new models and features',
    'API access for developers and integrations',
    'Cloud-based — no installation required for web use',
    'Multi-language support',
    'Customizable settings and preferences',
  ]

  const howToUse: AiStep[] = [
    { step: 1, title: `Visit ${name}`, desc: `Open the official website: ${website}. No sign-up is needed to try basic features on most plans.` },
    { step: 2, title: 'Create an account', desc: `Sign up with your email, Google, or Microsoft account. This saves your history and unlocks advanced features.` },
    { step: 3, title: 'Explore the dashboard', desc: 'Take a tour of the interface. Learn where to type prompts, access history, and change settings.' },
    { step: 4, title: 'Start with a simple prompt', desc: `Type a clear, specific prompt. For example: "${examplePrompt(name, cat)}" — and press Enter.` },
    { step: 5, title: 'Refine and iterate', desc: `If the result isn't perfect, ask follow-up questions or adjust your prompt with more detail.` },
    { step: 6, title: 'Save and share', desc: 'Export your work, copy results, or share them directly. Learn keyboard shortcuts in the Tips & Tricks section.' },
  ]

  const installSteps: AiStep[] = [
    { step: 1, title: 'Choose your platform', desc: `${name} is available as a web app, plus native apps for iOS, Android, Windows, and macOS (depending on the tool).` },
    { step: 2, title: 'Install the mobile app', desc: `Search "${name}" on the Apple App Store or Google Play Store, or use the download links on this page, and tap Install.` },
    { step: 3, title: 'Install the desktop app', desc: `Visit ${website}/download, choose your operating system (Windows/macOS), and run the installer.` },
    { step: 4, title: 'Sign in', desc: 'Open the app and sign in with the account you created. Your data syncs across devices automatically.' },
    { step: 5, title: 'Enable notifications (optional)', desc: 'Allow notifications to get updates, reminders, and new-feature announcements.' },
  ]

  const pricing: AiPricingPlan[] = [
    { plan: 'Free', price: '$0', features: ['Basic access with limited daily usage', 'Core features included', 'Community support'], popular: false },
    { plan: 'Pro', price: '$20/mo', features: ['Unlimited or high usage limits', 'Access to the latest models', 'Priority response times', 'Advanced features and tools', 'API credits (on some plans)'], popular: true },
    { plan: 'Enterprise', price: 'Custom', features: ['Team and admin controls', 'Dedicated support', 'Custom data handling options', 'SSO and security compliance'], popular: false },
  ]

  const pros = [
    `Saves significant time on ${lower.includes('code') ? 'coding' : lower.includes('image') ? 'design work' : lower.includes('video') ? 'video production' : 'everyday tasks'}`,
    'Beginner-friendly with a gentle learning curve',
    'Available across web, iOS, Android, and desktop',
    'Regular model and feature updates',
    'Strong security and privacy controls',
    'Generous free tier to get started',
  ]

  const cons = [
    'Advanced features require a paid subscription',
    'Results depend on prompt quality — there is a learning curve',
    'Occasional output can be inaccurate or need review',
    'Free tier has usage limits and rate caps',
  ]

  const faqs: AiFAQ[] = [
    { q: `What is ${name}?`, a: `${name} is a ${cat} platform that ${desc} It is designed to help users work faster and smarter with AI assistance.` },
    { q: `Is ${name} free?`, a: `Yes, ${name} offers a free plan with core features. Paid plans add higher limits, the latest models, and priority support.` },
    { q: `How do I download ${name}?`, a: `Open the official website at ${website}, or use the Download section on this page for direct links to iOS, Android, Windows, and macOS apps.` },
    { q: `Does ${name} have a mobile app?`, a: 'Most popular AI tools ship native apps for iOS and Android. Check the Download section for current availability.' },
    { q: `Is my data safe with ${name}?`, a: `${name} uses encryption and follows industry security standards. Review its privacy policy and adjust your privacy settings in the account dashboard.` },
    { q: `Can I integrate ${name} with other tools?`, a: 'Yes — most tools offer an API and native integrations with platforms like Slack, Zapier, Google Workspace, and more.' },
  ]

  const alternatives: AiAlt[] = AI_ALT_MAP[cat] || AI_ALT_MAP['default']

  const security = [
    { title: 'Encryption', desc: 'Data is encrypted in transit (TLS) and at rest.' },
    { title: 'Account security', desc: 'Enable two-factor authentication (2FA) in your account settings.' },
    { title: 'Privacy controls', desc: 'Control chat history, training data usage, and export/delete your data from the privacy dashboard.' },
    { title: 'Vetting third parties', desc: 'Review connected apps and revoke access you no longer use.' },
  ]

  const tips = [
    `Be specific — detailed prompts give much better results with ${name}`,
    'Use the edit/regenerate feature to improve responses instead of starting over',
    'Learn the keyboard shortcuts to work faster (see our guide)',
    'Save effective prompts as templates or custom instructions',
    'Enable 2FA and review privacy settings on day one',
    'Use the mobile app to continue work on the go',
  ]

  return {
    website,
    downloads: [
      { platform: 'Web', url: website, description: 'Use in any browser — no install needed', official: true },
      { platform: 'iOS', url: storeLink('ios', name), description: 'Native iOS app on the App Store', official: true },
      { platform: 'Android', url: storeLink('android', name), description: 'Native Android app on Google Play', official: true },
      { platform: 'Windows / macOS', url: `${website}/download`, description: 'Desktop app installer', official: true },
    ],
    howToUse,
    installSteps,
    features,
    pricing,
    pros,
    cons,
    faqs,
    alternatives,
    security,
    tips,
  }
}

function examplePrompt(name: string, cat: string): string {
  if (cat.includes('Chat')) return 'Explain the difference between supervised and unsupervised learning in simple terms'
  if (cat.includes('Image')) return 'A photorealistic sunrise over mountains, warm colors, high detail'
  if (cat.includes('Video')) return 'A 10-second product promo video for a coffee brand, modern style'
  if (cat.includes('Audio')) return 'Generate a professional voiceover for a 30-second ad'
  if (cat.includes('Writing')) return 'Rewrite this paragraph in a friendly, professional tone'
  if (cat.includes('Coding')) return 'Write a TypeScript function that debounces a search input'
  if (cat.includes('Search')) return 'Summarize the latest research on renewable energy storage'
  if (cat.includes('Presentation')) return 'Create a 10-slide pitch deck outline for a startup'
  if (cat.includes('Transcription')) return 'Summarize the key decisions from this meeting transcript'
  return `Help me get started with ${name}`
}

const AI_ALT_MAP: Record<string, AiAlt[]> = {
  'AI Chatbots': [
    { name: 'Claude', slug: 'claude', desc: 'Anthropic\'s advanced AI assistant for complex tasks' },
    { name: 'Gemini', slug: 'gemini', desc: 'Google\'s multimodal AI model' },
    { name: 'DeepSeek', slug: 'deepseek', desc: 'Advanced AI language model' },
    { name: 'Perplexity AI', slug: 'perplexity-ai', desc: 'AI-powered search and research assistant' },
  ],
  'AI Coding': [
    { name: 'Copilot', slug: 'copilot', desc: 'AI pair programmer by GitHub and Microsoft' },
    { name: 'Claude', slug: 'claude', desc: 'Anthropic\'s AI assistant with strong coding skills' },
    { name: 'Gemini', slug: 'gemini', desc: 'Google\'s AI model with coding support' },
  ],
  'AI Image Generation': [
    { name: 'Midjourney', slug: 'midjourney', desc: 'AI image generation from text prompts' },
    { name: 'Stable Diffusion', slug: 'stable-diffusion', desc: 'Open-source AI image generation' },
    { name: 'Leonardo AI', slug: 'leonardo-ai', desc: 'AI art and image generation platform' },
    { name: 'DALL-E', slug: 'dall-e', desc: 'OpenAI\'s image generation model' },
  ],
  'AI Video': [
    { name: 'Runway ML', slug: 'runway-ml', desc: 'AI-powered video editing and generation' },
    { name: 'Synthesia', slug: 'synthesia', desc: 'AI video generation with virtual avatars' },
    { name: 'HeyGen', slug: 'heygen', desc: 'AI video generation platform with avatars' },
    { name: 'Pictory', slug: 'pictory', desc: 'AI video creation from long-form content' },
  ],
  'AI Audio': [
    { name: 'Murf AI', slug: 'murf-ai', desc: 'AI voiceover and text-to-speech platform' },
    { name: 'Descript', slug: 'descript', desc: 'AI-powered video and audio editing' },
  ],
  'AI Writing': [
    { name: 'Grammarly', slug: 'grammarly', desc: 'AI-powered writing assistant' },
    { name: 'Jasper AI', slug: 'jasper-ai', desc: 'AI content generation for marketing' },
    { name: 'Writesonic', slug: 'writesonic', desc: 'AI writing platform for marketing content' },
  ],
  'AI Search': [
    { name: 'Perplexity AI', slug: 'perplexity-ai', desc: 'AI-powered search engine and research assistant' },
    { name: 'You.com', slug: 'you-com', desc: 'AI search engine with chat capabilities' },
  ],
  'AI Productivity': [
    { name: 'Notion AI', slug: 'notion-ai', desc: 'AI-powered writing and productivity assistant' },
    { name: 'Otter AI', slug: 'otter-ai', desc: 'AI meeting transcription and note-taking' },
  ],
  'AI Presentations': [
    { name: 'Gamma AI', slug: 'gamma-ai', desc: 'AI-powered presentation creation' },
    { name: 'Beautiful AI', slug: 'beautiful-ai', desc: 'AI-powered slide deck design' },
  ],
  'AI Design': [
    { name: 'Canva AI', slug: 'canva-ai', desc: 'AI-powered design features in Canva' },
    { name: 'Adobe Firefly', slug: 'adobe-firefly', desc: 'Adobe\'s generative AI for creatives' },
  ],
  'AI Transcription': [
    { name: 'Otter AI', slug: 'otter-ai', desc: 'AI meeting transcription and note-taking' },
    { name: 'Descript', slug: 'descript', desc: 'AI-powered video and audio editing' },
  ],
  default: [
    { name: 'ChatGPT', slug: 'chatgpt', desc: 'AI-powered conversational assistant by OpenAI' },
    { name: 'Claude', slug: 'claude', desc: 'Anthropic\'s advanced AI assistant' },
    { name: 'Gemini', slug: 'gemini', desc: 'Google\'s multimodal AI model' },
    { name: 'Perplexity AI', slug: 'perplexity-ai', desc: 'AI-powered search and research assistant' },
  ],
}
