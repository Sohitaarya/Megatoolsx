// Multi-language support for all tools
export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ar' | 'pt' | 'ru' | 'ja'

export const LANGUAGES: { code: Language; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
]

type TranslationMap = Record<string, Record<Language, string>>

const COMMON: TranslationMap = {
  'search': { en: 'Search', hi: 'खोजें', es: 'Buscar', fr: 'Rechercher', de: 'Suche', zh: '搜索', ar: 'بحث', pt: 'Pesquisar', ru: 'Поиск', ja: '検索' },
  'tools': { en: 'Tools', hi: 'उपकरण', es: 'Herramientas', fr: 'Outils', de: 'Werkzeuge', zh: '工具', ar: 'أدوات', pt: 'Ferramentas', ru: 'Инструменты', ja: 'ツール' },
  'categories': { en: 'Categories', hi: 'श्रेणियाँ', es: 'Categorías', fr: 'Catégories', de: 'Kategorien', zh: '分类', ar: 'فئات', pt: 'Categorias', ru: 'Категории', ja: 'カテゴリー' },
  'guide': { en: 'Guide', hi: 'गाइड', es: 'Guía', fr: 'Guide', de: 'Anleitung', zh: '指南', ar: 'دليل', pt: 'Guia', ru: 'Руководство', ja: 'ガイド' },
  'download': { en: 'Download', hi: 'डाउनलोड', es: 'Descargar', fr: 'Télécharger', de: 'Herunterladen', zh: '下载', ar: 'تحميل', pt: 'Baixar', ru: 'Скачать', ja: 'ダウンロード' },
  'features': { en: 'Features', hi: 'विशेषताएं', es: 'Características', fr: 'Fonctionnalités', de: 'Funktionen', zh: '功能', ar: 'ميزات', pt: 'Recursos', ru: 'Возможности', ja: '機能' },
  'faq': { en: 'FAQ', hi: 'सामान्य प्रश्न', es: 'Preguntas Frecuentes', fr: 'FAQ', de: 'FAQ', zh: '常见问题', ar: 'الأسئلة الشائعة', pt: 'Perguntas Frequentes', ru: 'Часто задаваемые вопросы', ja: 'よくある質問' },
  'how_to_use': { en: 'How to Use', hi: 'कैसे उपयोग करें', es: 'Cómo Usar', fr: 'Comment Utiliser', de: 'Wie Benutzt Man', zh: '如何使用', ar: 'كيفية الاستخدام', pt: 'Como Usar', ru: 'Как использовать', ja: '使い方' },
  'alternatives': { en: 'Alternatives', hi: 'विकल्प', es: 'Alternativas', fr: 'Alternatives', de: 'Alternativen', zh: '替代品', ar: 'بدائل', pt: 'Alternativas', ru: 'Альтернативы', ja: '代替品' },
  'pricing': { en: 'Pricing', hi: 'मूल्य निर्धारण', es: 'Precios', fr: 'Tarifs', de: 'Preise', zh: '价格', ar: 'التسعير', pt: 'Preços', ru: 'Цены', ja: '料金' },
  'reviews': { en: 'Reviews', hi: 'समीक्षाएं', es: 'Reseñas', fr: 'Avis', de: 'Bewertungen', zh: '评论', ar: 'التعليقات', pt: 'Avaliações', ru: 'Отзывы', ja: 'レビュー' },
  'problems': { en: 'Problems', hi: 'समस्याएं', es: 'Problemas', fr: 'Problèmes', de: 'Probleme', zh: '问题', ar: 'مشاكل', pt: 'Problemas', ru: 'Проблемы', ja: '問題' },
  'solutions': { en: 'Solutions', hi: 'समाधान', es: 'Soluciones', fr: 'Solutions', de: 'Lösungen', zh: '解决方案', ar: 'حلول', pt: 'Soluções', ru: 'Решения', ja: '解決策' },
  'community': { en: 'Community', hi: 'समुदाय', es: 'Comunidad', fr: 'Communauté', de: 'Community', zh: '社区', ar: 'المجتمع', pt: 'Comunidade', ru: 'Сообщество', ja: 'コミュニティ' },
  'resources': { en: 'Resources', hi: 'संसाधन', es: 'Recursos', fr: 'Ressources', de: 'Ressourcen', zh: '资源', ar: 'موارد', pt: 'Recursos', ru: 'Ресурсы', ja: 'リソース' },
}

const TOOL_SPECIFIC: Record<string, TranslationMap> = {
  'youtube-video-downloader': {
    'paste_url': { en: 'Paste YouTube URL', hi: 'YouTube URL डालें', es: 'Pegar URL de YouTube', fr: 'Coller l\'URL YouTube', de: 'YouTube-URL einfügen', zh: '粘贴YouTube链接', ar: 'لصق رابط يوتيوب', pt: 'Colar URL do YouTube', ru: 'Вставьте ссылку YouTube', ja: 'YouTube URLを貼り付け' },
    'download_mp4': { en: 'Download MP4', hi: 'MP4 डाउनलोड करें', es: 'Descargar MP4', fr: 'Télécharger MP4', de: 'MP4 herunterladen', zh: '下载MP4', ar: 'تحميل MP4', pt: 'Baixar MP4', ru: 'Скачать MP4', ja: 'MP4をダウンロード' },
    'download_mp3': { en: 'Download MP3', hi: 'MP3 डाउनलोड करें', es: 'Descargar MP3', fr: 'Télécharger MP3', de: 'MP3 herunterladen', zh: '下载MP3', ar: 'تحميل MP3', pt: 'Baixar MP3', ru: 'Скачать MP3', ja: 'MP3をダウンロード' },
    'quality': { en: 'Quality', hi: 'गुणवत्ता', es: 'Calidad', fr: 'Qualité', de: 'Qualität', zh: '质量', ar: 'الجودة', pt: 'Qualidade', ru: 'Качество', ja: '品質' },
  },
  'ai-code-generator': {
    'describe_code': { en: 'Describe the code', hi: 'कोड का वर्णन करें', es: 'Describe el código', fr: 'Décrivez le code', de: 'Code beschreiben', zh: '描述代码', ar: 'صف الكود', pt: 'Descreva o código', ru: 'Опишите код', ja: 'コードを説明' },
    'generate_code': { en: 'Generate Code', hi: 'कोड जनरेट करें', es: 'Generar Código', fr: 'Générer le Code', de: 'Code generieren', zh: '生成代码', ar: 'توليد الكود', pt: 'Gerar Código', ru: 'Сгенерировать код', ja: 'コードを生成' },
    'language': { en: 'Language', hi: 'भाषा', es: 'Idioma', fr: 'Langage', de: 'Sprache', zh: '语言', ar: 'لغة', pt: 'Linguagem', ru: 'Язык', ja: '言語' },
  },
}

export function t(key: string, lang: Language = 'en'): string {
  // Check tool-specific first
  for (const [, translations] of Object.entries(TOOL_SPECIFIC)) {
    if (translations[key]) return translations[key][lang] || translations[key]['en']
  }
  return COMMON[key]?.[lang] || COMMON[key]?.['en'] || key
}

export function getLangFromPath(path: string): { lang: Language; cleanPath: string } {
  const parts = path.split('/').filter(Boolean)
  const first = parts[0] as Language
  if (LANGUAGES.some(l => l.code === first)) {
    return { lang: first, cleanPath: '/' + parts.slice(1).join('/') }
  }
  return { lang: 'en', cleanPath: path }
}

// Get hreflang tags for current page
export function getHreflangs(path: string, toolSlug?: string): { lang: Language; url: string }[] {
  const baseUrl = 'https://megatoolsx.com'
  const cleanPath = path.replace(/^\/(en|hi|es|fr|de|zh|ar|pt|ru|ja)/, '')
  return LANGUAGES.map(l => ({
    lang: l.code,
    url: `${baseUrl}${l.code === 'en' ? '' : '/' + l.code}${cleanPath}`
  }))
}
