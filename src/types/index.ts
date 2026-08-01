export interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  subcategory: string;
  icon: string;
  image: string;
  color: string;
  platform: Platform[];
  pricing: PricingType;
  os: OS[];
  difficulty: Difficulty;
  company: string;
  website: string;
  documentation: string;
  downloadUrl: string;
  isPopular: boolean;
  isTrending: boolean;
  isNew: boolean;
  isAi: boolean;
  isApp: boolean;
  isExtension: boolean;
  isWebsite: boolean;
  isSoftware: boolean;
  rating: number;
  reviewCount: number;
  rank: number;
  createdAt: string;
  updatedAt: string;
  features: string[];
  howToUse: HowToUse[];
  installation: InstallationStep[];
  setup: SetupStep[];
  loginSteps: string[];
  signupSteps: string[];
  pricingTiers: PricingTier[];
  keyboardShortcuts: KeyboardShortcut[];
  apiEndpoints: ApiEndpoint[];
  automations: Automation[];
  integrations: Integration[];
  extensions: ExtensionItem[];
  plugins: PluginItem[];
  commonProblems: Problem[];
  errorCodes: ErrorCode[];
  faqs: FAQ[];
  alternatives: Alternative[];
  pros: string[];
  cons: string[];
  history: HistoryEvent[];
  latestUpdate: UpdateInfo;
  newsItems: NewsItem[];
  reviews: Review[];
  communityLinks: CommunityLink[];
  resources: Resource[];
  officialLinks: OfficialLink[];
  videoTutorials: VideoTutorial[];
  screenshots: Screenshot[];
  tips: string[];
  warnings: string[];
  requirements: Requirements;
  relatedTools: string[];
}

export type Platform = 'web' | 'mobile' | 'desktop' | 'browser-extension' | 'cli' | 'api';
export type PricingType = 'free' | 'freemium' | 'paid' | 'open-source' | 'subscription';
export type OS = 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'chrome-os' | 'web';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface HowToUse {
  title: string;
  steps: string[];
  image?: string;
}

export interface InstallationStep {
  platform: string;
  steps: string[];
  command?: string;
}

export interface SetupStep {
  title: string;
  description: string;
  image?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export interface KeyboardShortcut {
  keys: string;
  action: string;
  platform?: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth?: boolean;
}

export interface Automation {
  title: string;
  description: string;
  platform: string;
}

export interface Integration {
  name: string;
  description: string;
  url?: string;
}

export interface ExtensionItem {
  name: string;
  description: string;
  url?: string;
}

export interface PluginItem {
  name: string;
  description: string;
  url?: string;
}

export interface Problem {
  problem: string;
  cause: string;
  solution: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorCode {
  code: string;
  message: string;
  cause: string;
  solution: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Alternative {
  name: string;
  description: string;
  url: string;
  pros: string[];
  cons: string[];
  rating: number;
}

export interface HistoryEvent {
  date: string;
  title: string;
  description: string;
}

export interface UpdateInfo {
  version: string;
  date: string;
  changes: string[];
}

export interface NewsItem {
  title: string;
  date: string;
  url: string;
  summary: string;
}

export interface Review {
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  avatar?: string;
}

export interface CommunityLink {
  platform: string;
  name: string;
  url: string;
  members?: string;
}

export interface Resource {
  title: string;
  type: 'guide' | 'tutorial' | 'documentation' | 'course' | 'book' | 'video' | 'article';
  url: string;
  description: string;
}

export interface OfficialLink {
  title: string;
  url: string;
  description: string;
}

export interface VideoTutorial {
  title: string;
  url: string;
  duration: string;
  thumbnail?: string;
  author?: string;
}

export interface Screenshot {
  title: string;
  url: string;
  description?: string;
}

export interface Requirements {
  minimum: string[];
  recommended: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  name: string;
  slug: string;
  count: number;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export type SortOption = 'popularity' | 'newest' | 'trending' | 'rating' | 'name';
export type FilterOptions = {
  platform?: Platform[];
  pricing?: PricingType[];
  os?: OS[];
  difficulty?: Difficulty[];
  category?: string;
  company?: string;
};
