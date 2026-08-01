import type { Tool } from '@/types/tool'
import { slugify } from '@/lib/utils'

const TOOL_NAMES: string[] = [
  // AI Tools & Models
  'ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Firefly',
  'Leonardo AI', 'Runway ML', 'Synthesia', 'ElevenLabs', 'Murf AI', 'Descript', 'Otter AI',
  'Jasper AI', 'Copy AI', 'Writesonic', 'Rytr', 'Grammarly', 'ProWritingAid', 'Quillbot',
  'Perplexity AI', 'You.com', 'Phind', 'Consensus', 'Elicit', 'Scite', 'Notion AI',
  'Mem AI', 'Reflect', 'Obsidian', 'Roam Research', 'Logseq', 'Craft', 'Bear',
  'Gamma AI', 'Beautiful AI', 'Tome', 'Pitch', 'Canva AI', 'Adobe Firefly', 'Clipdrop',
  'Remove BG', 'Upscale Media', 'Topaz Labs', 'Luminar Neo', 'Let\'s Enhance', 'Fotor',
  'Picsart', 'Facetune', 'Remini', 'VanceAI', 'HitPaw', 'Wondershare',
  'HeyGen', 'Synthesys', 'Colossyan', 'Elai', 'Pictory', 'InVideo', 'Kapwing',
  'Fliki', 'Lumen5', 'Animoto', 'Vyond', 'Powtoon', 'Moovly', 'Biteable',
  'Soundraw', 'Boomy', 'AIVA', 'Amper Music', 'Mureka', 'Beatoven', 'Mubert',
  'TensorFlow', 'PyTorch', 'Hugging Face', 'Replicate', 'Modal', 'Botpress', 'Rasa',
  'LangChain', 'LlamaIndex', 'Haystack', 'Cohere', 'Anthropic', 'OpenAI', 'Mistral AI',
  // Design Tools
  'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'Lightroom',
  'Affinity Designer', 'Affinity Photo', 'Affinity Publisher', 'CorelDRAW', 'Procreate',
  'Inkscape', 'GIMP', 'Krita', 'Blender', 'Canva', 'Crello', 'VistaCreate', 'Stencil',
  'Snappa', 'PicMonkey', 'BeFunky', 'Pixelmator', 'Photopea', 'Paint.NET', 'DaVinci Resolve',
  'Final Cut Pro', 'Premiere Pro', 'After Effects', 'Motion', 'HitFilm', 'Shotcut',
  'OpenShot', 'DaVinci Resolve', 'CapCut', 'InShot', 'VN Editor', 'Kinemaster',
  // Development Tools
  'VS Code', 'Visual Studio', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'GoLand', 'Android Studio',
  'Xcode', 'Sublime Text', 'Atom', 'Notepad++', 'Vim', 'Neovim', 'Emacs',
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SourceTree', 'GitKraken', 'Fork',
  'GitHub Desktop', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Travis CI',
  'Docker', 'Kubernetes', 'Podman', 'Vagrant', 'Terraform', 'Ansible', 'Puppet',
  'Chef', 'SaltStack', 'Nomad', 'Consul', 'Vault', 'Minikube', 'Kind',
  'Postman', 'Insomnia', 'Bruno', 'Swagger', 'OpenAPI', 'GraphQL', 'Apollo',
  'Hasura', 'Supabase', 'Firebase', 'Appwrite', 'PocketBase', 'Nhost', 'Convex',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch', 'Cassandra',
  'DynamoDB', 'Firestore', 'Neo4j', 'CockroachDB', 'PlanetScale', 'Neon', 'Supabase DB',
  'DigitalOcean', 'AWS', 'Azure', 'GCP', 'Linode', 'Vultr', 'Hetzner',
  'Netlify', 'Vercel', 'Cloudflare Pages', 'Railway', 'Render', 'Fly.io', 'Koyeb',
  // Cloud Services
  'Cloudflare', 'AWS Lambda', 'Azure Functions', 'Google Cloud Functions', 'Supabase Edge Functions',
  'Amazon S3', 'Google Cloud Storage', 'Azure Blob Storage', 'Cloudinary', 'Imgix', 'ImageKit',
  'SendGrid', 'Mailgun', 'Postmark', 'Resend', 'Loops', 'Brevo', 'Mailchimp',
  'Twilio', 'Vonage', 'Pusher', 'Ably', 'PubNub', 'Socket.io', 'WebSockets',
  'Auth0', 'Clerk', 'NextAuth', 'Supabase Auth', 'Firebase Auth', 'AWS Cognito', 'Okta',
  // Productivity & Office
  'Microsoft 365', 'Word', 'Excel', 'PowerPoint', 'Outlook', 'OneNote', 'Teams',
  'Google Workspace', 'Google Docs', 'Google Sheets', 'Google Slides', 'Gmail', 'Google Drive', 'Google Calendar',
  'Google Meet', 'Google Chat', 'Google Keep', 'Google Tasks', 'Notion', 'Coda', 'Airtable',
  'Monday.com', 'ClickUp', 'Asana', 'Trello', 'Jira', 'Linear', 'Basecamp',
  'Slack', 'Discord', 'Mattermost', 'Rocket Chat', 'Telegram', 'Signal', 'WhatsApp',
  'Evernote', 'OneNote', 'Bear', 'Roam Research', 'Logseq', 'Obsidian', 'Notion',
  'Todoist', 'TickTick', 'Any.do', 'Things', 'OmniFocus', 'Microsoft To Do', 'Remember The Milk',
  'RescueTime', 'Toggle', 'Clockify', 'Harvest', 'Time Doctor', 'Focusmate', 'Forest',
  'LastPass', '1Password', 'Bitwarden', 'Dashlane', 'KeePass', 'NordPass', 'Keeper',
  'Acrobat', 'PDF Expert', 'Foxit Reader', 'Nitro PDF', 'PDFescape', 'SmallPDF', 'iLovePDF',
  'DocuSign', 'HelloSign', 'PandaDoc', 'SignNow', 'Adobe Sign', 'Dropbox Sign', 'SignEasy',
  // Communication & Video
  'Zoom', 'Google Meet', 'Microsoft Teams', 'Cisco Webex', 'GoToMeeting', 'BlueJeans', 'Whereby',
  'Skype', 'FaceTime', 'WhatsApp', 'Telegram', 'Signal', 'WeChat', 'Line',
  'OBS Studio', 'Streamlabs', 'XSplit', 'vMix', 'Wirecast', 'Ecamm Live', 'Restream',
  'YouTube', 'Vimeo', 'Twitch', 'TikTok', 'Instagram Reels', 'Facebook Live', 'LinkedIn Live',
  // Social Media
  'Instagram', 'Facebook', 'Twitter', 'Threads', 'LinkedIn', 'Pinterest', 'Tumblr',
  'Reddit', 'Discord', 'Telegram', 'Snapchat', 'TikTok', 'YouTube', 'WhatsApp',
  'Hootsuite', 'Buffer', 'Sprout Social', 'Later', 'Planoly', 'SocialBee', 'TweetDeck',
  'Canva', 'Adobe Express', 'Picsart', 'Lightroom', 'VSCO', 'Snapseed', 'Afterlight',
  // Marketing & SEO
  'Google Analytics', 'Google Search Console', 'Google Ads', 'Google Tag Manager', 'Google Data Studio',
  'SEMrush', 'Ahrefs', 'Moz', 'Majestic', 'Serpstat', 'SpyFu', 'Mangools',
  'Yoast SEO', 'Rank Math', 'All in One SEO', 'SEOPress', 'The SEO Framework', 'SmartCrawl',
  'HubSpot', 'Marketo', 'Salesforce', 'Pipedrive', 'Zoho CRM', 'Freshsales', 'Copper',
  'Mailchimp', 'ConvertKit', 'ActiveCampaign', 'Klaviyo', 'Brevo', 'Sendinblue', 'MailerLite',
  'Mailgun', 'Postmark', 'SendGrid', 'Amazon SES', 'Resend', 'Loops', 'Buttondown',
  'Shopify', 'WooCommerce', 'BigCommerce', 'Magento', 'OpenCart', 'PrestaShop', 'Salesforce Commerce',
  'Wix', 'Squarespace', 'Webflow', 'WordPress', 'Drupal', 'Joomla', 'Ghost',
  'Typeform', 'Gravity Forms', 'WPForms', 'Formstack', 'JotForm', 'Google Forms', 'Typebot',
  'SurveyMonkey', 'Google Forms', 'Typeform', 'Jotform', 'SurveySparrow', 'Alchemer', 'Qualtrics',
  'Salesforce', 'HubSpot CRM', 'Zoho CRM', 'Pipedrive', 'Freshsales', 'Copper', 'Keap',
  'Calendly', 'Cal.com', 'Acuity', 'SimplyBook', 'Book Like A Boss', 'YouCanBookMe', 'Appointy',
  // E-commerce
  'Shopify', 'WooCommerce', 'BigCommerce', 'Magento', 'OpenCart', 'PrestaShop', 'Medusa',
  'Stripe', 'PayPal', 'Square', 'Authorize.net', 'Braintree', 'Adyen', 'Mollie',
  'Amazon', 'eBay', 'Etsy', 'Walmart Marketplace', 'Alibaba', 'Rakuten', 'Shopee',
  'Gumroad', 'Payhip', 'Paddle', 'Lemon Squeezy', 'Gumlet', 'Sellfy', 'Easy Digital Downloads',
  'Printful', 'Printify', 'SPOD', 'CustomCat', 'Gooten', 'AOP+', 'Prodigi',
  'ShipStation', 'ShipBob', 'Shippo', 'EasyShip', 'Parcel2Go', 'Parcel Monkey', 'Sendcloud',
  // Finance & Accounting
  'QuickBooks', 'Xero', 'FreshBooks', 'Wave', 'Zoho Books', 'Sage', 'FreeAgent',
  'TurboTax', 'H&R Block', 'TaxSlayer', 'TaxAct', 'Credit Karma', 'Wise', 'QuickBooks',
  'Expensify', 'Concur', 'Zoho Expense', 'Rydoo', 'Shoeboxed', 'Receipt Bank', 'Debitoor',
  'Mint', 'YNAB', 'Personal Capital', 'PocketGuard', 'Goodbudget', 'Moneydance', 'Quicken',
  'Robinhood', 'E*TRADE', 'Charles Schwab', 'Fidelity', 'Vanguard', 'TD Ameritrade', 'Wealthfront',
  'Betterment', 'Acorns', 'Stash', 'SoFi', 'Coinbase', 'Binance', 'Kraken',
  'MetaMask', 'Rainbow', 'Trust Wallet', 'Ledger', 'Trezor', 'Phantom', 'Exodus',
  // Education & Learning
  'Duolingo', 'Babbel', 'Rosetta Stone', 'Memrise', 'Anki', 'Quizlet', 'Khan Academy',
  'Coursera', 'Udemy', 'edX', 'Skillshare', 'LinkedIn Learning', 'Pluralsight', 'DataCamp',
  'Brilliant', 'Codecademy', 'freeCodeCamp', 'The Odin Project', 'Scrimba', 'Frontend Masters', 'Egghead',
  'Figma', 'Miro', 'Mural', 'Lucidchart', 'Draw.io', 'Whimsical', 'Excalidraw',
  'Notion', 'Evernote', 'OneNote', 'Bear', 'Roam Research', 'Craft', 'Logseq',
  'GoodNotes', 'Notability', 'Noteshelf', 'PDF Expert', 'MarginNote', 'LiquidText', 'Flexcil',
  'Headspace', 'Calm', 'Medito', 'Breethe', 'Ten Percent', 'Insight Timer', 'Day One',
  // Entertainment
  'Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Amazon Prime Video', 'Apple TV+', 'Paramount+',
  'Spotify', 'Apple Music', 'Amazon Music', 'Tidal', 'Deezer', 'YouTube Music', 'Pandora',
  'Audible', 'Libro.fm', 'Google Play Books', 'Apple Books', 'Kindle', 'Scribd', 'Everand',
  'Twitch', 'Kick', 'YouTube Gaming', 'Facebook Gaming', 'Trovo', 'DLive', 'Steam',
  'Steam', 'Epic Games', 'GOG', 'Xbox', 'PlayStation', 'Nintendo', 'Battle.net',
  // Operating Systems
  'Windows 11', 'Windows 10', 'macOS', 'Ubuntu', 'Fedora', 'Debian', 'Arch Linux',
  'Android', 'iOS', 'iPadOS', 'ChromeOS', 'Linux Mint', 'Pop!_OS', 'Manjaro',
  // Browsers & Extensions
  'Google Chrome', 'Mozilla Firefox', 'Safari', 'Microsoft Edge', 'Opera', 'Brave', 'Vivaldi',
  'Arc Browser', 'Zen Browser', 'Floorp', 'LibreWolf', 'Tor Browser', 'Chromium', 'Pale Moon',
  'AdBlock', 'uBlock Origin', 'AdGuard', 'Ghostery', 'Privacy Badger', 'NoScript', 'HTTPS Everywhere',
  'Grammarly', 'ProWritingAid', 'LanguageTool', 'Honey', 'CamelCamelCamel', 'Wikibuy', 'Capital One Shopping',
  'LastPass', '1Password', 'Bitwarden', 'NordPass', 'Dashlane', 'KeePass', 'RoboForm',
  'React Developer Tools', 'Redux DevTools', 'Vue DevTools', 'React Router', 'Next.js', 'Nuxt', 'Remix',
  'GoFullPage', 'Awesome Screenshot', 'LightShot', 'Nimbus', 'FireShot', 'Screen Recorder', 'Loom',
  // Google Services
  'Google Search', 'Google Maps', 'Google Drive', 'Gmail', 'Google Photos', 'Google Calendar', 'Google Docs',
  'Google Sheets', 'Google Slides', 'Google Forms', 'Google Meet', 'Google Chat', 'Google Keep', 'Google Tasks',
  'Google Translate', 'Google Lens', 'Google Earth', 'Google Flights', 'Google Hotels', 'Google News', 'Google Scholar',
  'Google Analytics', 'Google Ads', 'Google Search Console', 'Google Tag Manager', 'Google Data Studio', 'Google Optimize', 'Google Trends',
  'Google Cloud Platform', 'Google Colab', 'Google Firebase', 'Google Play Console', 'Google AdSense', 'Google My Business', 'Google Workspace',
  // Microsoft Services
  'Windows', 'Microsoft 365', 'Azure', 'Teams', 'Outlook', 'OneDrive', 'OneNote',
  'SharePoint', 'Dynamics 365', 'Power BI', 'Power Apps', 'Power Automate', 'Microsoft Edge', 'Bing',
  'Visual Studio', 'VS Code', 'GitHub', 'LinkedIn', 'Skype', 'Defender', 'Xbox',
  'Microsoft Teams', 'Microsoft To Do', 'Microsoft Planner', 'Microsoft Project', 'Microsoft Access', 'Microsoft Publisher', 'Microsoft Visio',
  // Adobe Services
  'Photoshop', 'Illustrator', 'InDesign', 'Premiere Pro', 'After Effects', 'Lightroom', 'XD',
  'Acrobat', 'Dreamweaver', 'Animate', 'Audition', 'Flash', 'Aero', 'Fresco',
  'Adobe Express', 'Adobe Firefly', 'Adobe Fonts', 'Adobe Color', 'Adobe Stock', 'Adobe Portfolio', 'Adobe Bridge',
  'Creative Cloud', 'Adobe Fonts', 'Behance', 'Tumblr', 'Spark', 'Photoshop Elements', 'Premiere Elements',
  // Meta Services
  'Facebook', 'Instagram', 'WhatsApp', 'Messenger', 'Facebook Marketplace', 'Facebook Groups', 'Facebook Pages',
  'Meta Ads', 'Meta Business Suite', 'Meta Pixel', 'Meta Horizon', 'Meta Quest', 'Meta AI', 'Meta Threads',
  // OpenAI
  'ChatGPT', 'DALL-E', 'Whisper', 'OpenAI API', 'GPT-4', 'GPT-4o', 'GPT-4o-mini',
  'Codex', 'OpenAI Playground', 'ChatGPT Enterprise', 'ChatGPT Mobile', 'ChatGPT Plugins', 'ChatGPT Vision', 'Sora',
  // GitHub
  'GitHub', 'GitHub Actions', 'GitHub Pages', 'GitHub Discussions', 'GitHub Issues', 'GitHub Projects', 'GitHub Wiki',
  'GitHub Gist', 'GitHub Codespaces', 'GitHub Copilot', 'GitHub Desktop', 'GitHub Mobile', 'GitHub CLI', 'GitHub API',
  'GitHub Marketplace', 'GitHub Security', 'GitHub Sponsors', 'GitHub Insights', 'GitHub Archive', 'GitHub Star', 'GitHub Notifications',
  // Notion
  'Notion', 'Notion AI', 'Notion API', 'Notion Templates', 'Notion Databases', 'Notion Pages', 'Notion Calendar',
  'Notion Docs', 'Notion Wikis', 'Notion Projects', 'Notion Goals', 'Notion Forms', 'Notion Automations', 'Notion Integrations',
  // Slack
  'Slack', 'Slack Channels', 'Slack Huddles', 'Slack Canvas', 'Slack Clips', 'Slack Workflow', 'Slack Connect',
  'Slack AI', 'Slack Apps', 'Slack API', 'Slack Bots', 'Slack Integrations', 'Slack Files', 'Slack Search',
  // Discord
  'Discord', 'Discord Servers', 'Discord Channels', 'Discord Voice', 'Discord Video', 'Discord Screen Share', 'Discord Bots',
  'Discord Webhooks', 'Discord API', 'Discord Nitro', 'Discord Roles', 'Discord Moderation', 'Discord Stage', 'Discord Forum',
  // Zoom
  'Zoom', 'Zoom Meetings', 'Zoom Video', 'Zoom Webinar', 'Zoom Rooms', 'Zoom Phone', 'Zoom Chat',
  'Zoom AI Companion', 'Zoom Whiteboard', 'Zoom Apps', 'Zoom API', 'Zoom Recording', 'Zoom Breakout', 'Zoom Polls',
  // YouTube
  'YouTube', 'YouTube Studio', 'YouTube Analytics', 'YouTube Shorts', 'YouTube Live', 'YouTube Music', 'YouTube TV',
  'YouTube Kids', 'YouTube Studio Mobile', 'YouTube Creator', 'YouTube Community', 'YouTube Premiere', 'YouTube Clips', 'YouTube Chapters',
  // Instagram
  'Instagram', 'Instagram Stories', 'Instagram Reels', 'Instagram Live', 'Instagram Shop', 'Instagram Explore', 'Instagram DMs',
  'Instagram Feed', 'Instagram Highlights', 'Instagram Insights', 'Instagram Ads', 'Instagram Creator Studio', 'Threads', 'Instagram API',
  // Facebook
  'Facebook', 'Facebook News Feed', 'Facebook Stories', 'Facebook Watch', 'Facebook Marketplace', 'Facebook Groups', 'Facebook Pages',
  'Facebook Events', 'Facebook Messenger', 'Facebook Ads', 'Facebook Business Suite', 'Facebook Analytics', 'Facebook Pixel', 'Facebook Shops',
  // LinkedIn
  'LinkedIn', 'LinkedIn Profile', 'LinkedIn Feed', 'LinkedIn Jobs', 'LinkedIn Messaging', 'LinkedIn Learning', 'LinkedIn Premium',
  'LinkedIn Sales Navigator', 'LinkedIn Recruiter', 'LinkedIn Ads', 'LinkedIn Analytics', 'LinkedIn Company Page', 'LinkedIn Groups', 'LinkedIn Events',
  // Shopify
  'Shopify', 'Shopify Store', 'Shopify Admin', 'Shopify POS', 'Shopify Payments', 'Shopify Shipping', 'Shopify Markets',
  'Shopify Apps', 'Shopify Themes', 'Shopify API', 'Shopify Analytics', 'Shopify Marketing', 'Shopify SEO', 'Shopify Flow',
  // WordPress
  'WordPress', 'WordPress Admin', 'WordPress Posts', 'WordPress Pages', 'WordPress Themes', 'WordPress Plugins', 'WordPress Blocks',
  'WordPress WooCommerce', 'WordPress SEO', 'WordPress Security', 'WordPress Backup', 'WordPress Multisite', 'WordPress REST API', 'WordPress Gutenberg',
  // Amazon
  'Amazon', 'Amazon Shopping', 'Amazon Prime', 'Amazon Prime Video', 'Amazon Music', 'Amazon Kindle', 'Amazon Audible',
  'Amazon AWS', 'Amazon S3', 'Amazon Lambda', 'Amazon Seller Central', 'Amazon Advertising', 'Amazon Flex', 'Amazon Fresh',
  // Streaming Services
  'Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Peacock', 'Paramount+', 'Amazon Prime Video',
  'Apple TV+', 'Discovery+', 'Crunchyroll', 'ESPN+', 'Starz', 'Showtime', 'FuboTV',
  'Spotify', 'Apple Music', 'Amazon Music', 'Tidal', 'Deezer', 'Pandora', 'SoundCloud',
  'YouTube Music', 'Qobuz', 'Bandcamp', 'Napster', 'iHeartRadio', 'Audible', 'Libby',
  // Web Hosting
  'Bluehost', 'SiteGround', 'HostGator', 'DreamHost', 'Hostinger', 'GoDaddy', 'Namecheap',
  'Cloudways', 'Kinsta', 'WP Engine', 'Flywheel', 'Pressable', 'Nexcess', 'Liquid Web',
  'AWS', 'Google Cloud', 'Azure', 'DigitalOcean', 'Vultr', 'Linode', 'Hetzner',
  'Netlify', 'Vercel', 'Cloudflare Pages', 'Render', 'Railway', 'Fly.io', 'Supabase',
  // Email Services
  'Gmail', 'Outlook', 'Yahoo Mail', 'Proton Mail', 'Tutanota', 'Fastmail', 'Zoho Mail',
  'Mailchimp', 'ConvertKit', 'ActiveCampaign', 'Klaviyo', 'Brevo', 'HubSpot Email', 'MailerLite',
  'Superhuman', 'Spark', 'Newton', 'Canary', 'Shortwave', 'Mimestream', 'Edison Mail',
  // Project Management
  'Asana', 'Trello', 'Monday.com', 'ClickUp', 'Jira', 'Linear', 'Basecamp',
  'Notion', 'Coda', 'Airtable', 'Smartsheet', 'Wrike', 'Height', 'Taskade',
  'Taiga', 'OpenProject', 'Redmine', 'Trac', 'Leankit', 'Kanbanize', 'Freedcamp',
  // Design Resources
  'Unsplash', 'Pexels', 'Pixabay', 'Freepik', 'Flaticon', 'Icons8', 'IconScout',
  'Dribbble', 'Behance', 'Figma Community', 'UI8', 'Humaaans', 'Blush', 'ManyPixels',
  'Noun Project', 'Undraw', 'DrawKit', 'LottieFiles', 'Motion', 'Haikei', 'Coolors',
  'Adobe Fonts', 'Google Fonts', 'Font Squirrel', 'DaFont', 'TypeKit', 'Fontshare', 'Fontsource',
  // Analytics
  'Google Analytics', 'Mixpanel', 'Amplitude', 'Heap', 'PostHog', 'Plausible', 'Fathom',
  'Hotjar', 'Crazy Egg', 'Lucky Orange', 'FullStory', 'Smartlook', 'Mouseflow', 'VWO',
  'Tableau', 'Power BI', 'Google Data Studio', 'Looker', 'Metabase', 'Grafana', 'Kibana',
  // Backup & Sync
  'Google Drive', 'Dropbox', 'OneDrive', 'iCloud', 'MEGA', 'pCloud', 'Sync.com',
  'Backblaze', 'Carbonite', 'Acronis', 'EaseUS Todo Backup', 'Macrium Reflect', 'Duplicati', 'Rclone',
  'Resilio Sync', 'Syncthing', 'Nextcloud', 'ownCloud', 'Seafile', 'FileCloud', 'Koofr',
  // Password Managers
  'LastPass', '1Password', 'Bitwarden', 'Dashlane', 'KeePass', 'NordPass', 'RoboForm',
  'Keeper', 'Sticky Password', 'Enpass', 'SafeInCloud', 'Buttercup', 'Password Safe', 'Gauth',
  // Video Editing
  'Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'CapCut', 'iMovie', 'Filmora', 'Vegas Pro',
  'After Effects', 'Motion', 'HitFilm', 'Shotcut', 'OpenShot', 'Kdenlive', 'Lightworks',
  'InShot', 'VN Editor', 'Kinemaster', 'PowerDirector', 'Alight Motion', 'CapCut Desktop', 'Clipchamp',
  // Audio Tools
  'Audacity', 'Adobe Audition', 'GarageBand', 'Logic Pro', 'FL Studio', 'Ableton Live', 'Pro Tools',
  'Cubase', 'Studio One', 'Reaper', 'LMMS', 'WavePad', 'Ocenaudio', 'Sound Forge',
  'iZotope RX', 'Melodyne', 'Auto-Tune', 'VocAlign', 'Serum', 'Massive', 'Sylenth1',
  // Photo Editing
  'Photoshop', 'Lightroom', 'Capture One', 'Affinity Photo', 'GIMP', 'Pixelmator', 'Photopea',
  'Luminar Neo', 'ON1 Photo RAW', 'DxO PhotoLab', 'Corel PaintShop', 'ACDSee', 'Darktable', 'RawTherapee',
  'Canva', 'Fotor', 'Picsart', 'Snapseed', 'VSCO', 'Remini', 'Facetune',
  // Navigation & Travel
  'Google Maps', 'Apple Maps', 'Waze', 'MapQuest', 'Here WeGo', 'Citymapper', 'Moovit',
  'Uber', 'Lyft', 'DiDi', 'Grab', 'Bolt', 'Via', 'Curb',
  'Booking.com', 'Airbnb', 'Expedia', 'Kayak', 'Skyscanner', 'Hotels.com', 'TripAdvisor',
  'Google Flights', 'Google Hotels', 'Google Travel', 'Rome2Rio', 'Hopper', 'Uber Eats', 'DoorDash',
  // Messaging
  'WhatsApp', 'Telegram', 'Signal', 'Messenger', 'WeChat', 'Line', 'Viber',
  'Discord', 'Slack', 'Teams', 'Kik', 'Snapchat', 'GroupMe', 'Element',
  'TextNow', 'Google Voice', 'Skype', 'Wire', 'Session', 'Threema', 'Silence',
  // Note Taking
  'Notion', 'Evernote', 'OneNote', 'Bear', 'Roam Research', 'Logseq', 'Obsidian',
  'Google Keep', 'Apple Notes', 'Simplenote', 'Standard Notes', 'Joplin', 'Notability', 'GoodNotes',
  'Craft', 'Drafts', 'iA Writer', 'Ulysses', 'Scrivener', 'FocusWriter', 'Typora',
  // Reading & Books
  'Kindle', 'Apple Books', 'Google Play Books', 'Audible', 'Libby', 'Kobo', 'Scribd',
  'ComiXology', 'Manga Plus', 'Webtoon', 'Wattpad', 'Medium', 'Substack', 'Ghost',
  'Pocket', 'Instapaper', 'Feedly', 'Flipboard', 'Inoreader', 'NewsBlur', 'RSS',
  // Fitness & Health
  'Strava', 'Nike Run Club', 'Adidas Running', 'MapMyRun', 'Peloton', 'Fitbit', 'Garmin',
  'MyFitnessPal', 'Lose It', 'FatSecret', 'Cronometer', 'Noom', 'Weight Watchers', 'Calorie Counter',
  'Apple Health', 'Google Fit', 'Samsung Health', 'WHOOP', 'Oura', 'Withings', 'Sleep Cycle',
  'Meditation Studio', 'Headspace', 'Calm', 'Ten Percent', 'Insight Timer', 'Breethe', 'Simple Habit',
  // Parenting
  'BabyCenter', 'What to Expect', 'The Bump', 'Glow Baby', 'Baby Tracker', 'Sprout Baby', 'Huckleberry',
  'Ovia', 'Pregnancy+', 'Babys First', 'BabySparks', 'Wonder Weeks', 'Kinedu', 'Peanut',
  // Smart Home
  'Google Home', 'Amazon Alexa', 'Apple HomeKit', 'Samsung SmartThings', 'Philips Hue', 'Nest', 'Ring',
  'Ecobee', 'August', 'Lutron', 'TP-Link Kasa', 'Wyze', 'Arlo', 'Blink',
  // VPN Services
  'NordVPN', 'ExpressVPN', 'Surfshark', 'CyberGhost', 'Private Internet Access', 'Proton VPN', 'Windscribe',
  'Mullvad', 'TunnelBear', 'IPVanish', 'VyprVPN', 'Hotspot Shield', 'Atlas VPN', 'PrivateVPN',
  // Security Tools
  'Windows Defender', 'Malwarebytes', 'Norton', 'McAfee', 'Kaspersky', 'Avast', 'AVG',
  'Bitdefender', 'ESET', 'Sophos', 'Trend Micro', 'CrowdStrike', 'Palo Alto', 'Fortinet',
  'Wireshark', 'Nmap', 'Burp Suite', 'Metasploit', 'OWASP ZAP', 'Acunetix', 'Nessus',
  'Cloudflare', 'Sucuri', 'Wordfence', 'Defender', 'Akamai', 'Imperva', 'Fastly',
  // Weather
  'AccuWeather', 'Weather Channel', 'Weather Underground', 'Dark Sky', 'Windy', 'Carrot Weather', 'WeatherBug',
  'Yahoo Weather', 'Storm Radar', 'RainViewer', 'RadarScope', 'MyRadar', 'Weather Mate', 'Flowx',
  // Recipes & Food
  'Allrecipes', 'Food Network', 'Yummly', 'Tasty', 'Kitchen Stories', 'SideChef', 'Paprika',
  'MyFridgeFood', 'SuperCook', 'Mealime', 'Plan to Eat', 'Whisk', 'Cookpad', 'Food52',
  // Music Production
  'Ableton Live', 'FL Studio', 'Logic Pro', 'Pro Tools', 'GarageBand', 'Cubase', 'Studio One',
  'Reason', 'Reaper', 'Bitwig', 'Audacity', 'LMMS', 'BandLab', 'Soundtrap',
  'Native Instruments', 'Spectrasonics', 'Arturia', 'iZotope', 'Waves', 'Valhalla', 'Soundtoys',
  // 3D & Animation
  'Blender', 'Maya', '3ds Max', 'Cinema 4D', 'Houdini', 'LightWave', 'Modo',
  'ZBrush', 'Substance Painter', 'Marmoset Toolbag', 'SketchUp', 'Rhino', 'SolidWorks', 'Fusion 360',
  'Unreal Engine', 'Unity', 'Godot', 'GameMaker', 'Construct', 'RPG Maker', 'CryEngine',
  // Stock Media
  'Shutterstock', 'Getty Images', 'iStock', 'Adobe Stock', 'Alamy', 'Depositphotos', '123RF',
  'Storyblocks', 'Envato Elements', 'Audio Jungle', 'VideoHive', 'GraphicRiver', 'ThemeForest', 'CodeCanyon',
  // Location & Maps
  'Google Maps', 'Apple Maps', 'Waze', 'Mapbox', 'Leaflet', 'OpenStreetMap', 'Carto',
  'MapQuest', 'Bing Maps', 'Here Maps', 'Gaia GPS', 'AllTrails', 'Komoot', 'Trailforks',
  // Form Builders
  'Google Forms', 'Typeform', 'Jotform', 'Formstack', 'Gravity Forms', 'WPForms', 'Typebot',
  'Cognito Forms', 'Paperform', 'Formsite', '123 Form Builder', 'FormAssembly', 'Zoho Forms', 'FormIo',
  // Landing Page Builders
  'Unbounce', 'Leadpages', 'Instapage', 'GetResponse', 'Landingi', 'Lander', 'Carrd',
  'Tilda', 'Webflow', 'Wix', 'Squarespace', 'Convertri', 'ClickFunnels', 'Builderall',
  // Web Design Tools
  'Figma', 'Webflow', 'Wix Studio', 'SquareSpace', 'Framer', 'Readymag', 'Pixpa',
  'Duda', 'Jimdo', 'Weebly', 'WordPress', 'Ghost', 'Semplice', 'Format',
  // Survey Tools
  'SurveyMonkey', 'Typeform', 'Google Forms', 'SurveySparrow', 'Alchemer', 'Qualtrics', 'Zoho Survey',
  'SoGoSurvey', 'SurveyLegend', 'QuestionPro', 'Poll Everywhere', 'SurveyPlanet', 'FreeOnlineSurveys', 'Esurv',
  // Community Platforms
  'Discourse', 'Vanilla Forums', 'XenForo', 'phpBB', 'Flarum', 'NodeBB', 'Reddit',
  'Circle', 'Skool', 'Mighty Networks', 'Kajabi', 'Teachable', 'Thinkific', 'Podia',
  'Discord', 'Slack', 'Telegram', 'Facebook Groups', 'LinkedIn Groups', 'Loom', 'Miro',
  // Newsletter Platforms
  'Substack', 'ConvertKit', 'Mailchimp', 'Buttondown', 'Revue', 'Curated', 'Letterdrop',
  'Ghost', 'Beehiiv', 'Newsletter Glue', 'Sendy', 'MailerLite', 'Brevo', 'ActiveCampaign',
  // Digital Assets
  'OpenSea', 'Rarible', 'Foundation', 'SuperRare', 'LooksRare', 'Blur', 'Magic Eden',
  'Coinbase NFT', 'Zora', 'Manifold', 'Async Art', 'Nifty Gateway', 'Objkt.com', 'Teia',
  // Cryptocurrency
  'Binance', 'Coinbase', 'Kraken', 'Gemini', 'KuCoin', 'Crypto.com', 'Bitfinex',
  'CoinMarketCap', 'CoinGecko', 'DexScreener', 'TradingView', 'DeBank', 'Zapper', 'Zerion',
  'MetaMask', 'Rainbow', 'Phantom', 'Exodus', 'Trust Wallet', 'Ledger', 'Trezor',
  // Web3 & Blockchain
  'Ethereum', 'Solana', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche', 'Near',
  'Infura', 'Alchemy', 'Moralis', 'Thirdweb', 'Alchemy', 'QuickNode', 'Chainlink',
  'The Graph', 'IPFS', 'Filecoin', 'Arweave', 'Web3.js', 'Ethers.js', 'Hardhat',
  // Data Science
  'Tableau', 'Power BI', 'Looker', 'Google Data Studio', 'R Studio', 'Jupyter', 'Anaconda',
  'KNIME', 'RapidMiner', 'Alteryx', 'IBM SPSS', 'SAS', 'STATA', 'MATLAB',
  'Apache Spark', 'Hadoop', 'Databricks', 'Snowflake', 'BigQuery', 'Redshift', 'dbt',
  // DevOps & SRE
  'Grafana', 'Prometheus', 'Datadog', 'New Relic', 'Dynatrace', 'Splunk', 'ELK Stack',
  'Nagios', 'Zabbix', 'Sentry', 'Datadog APM', 'AppDynamics', 'New Relic APM', 'Jaeger',
  'Docker', 'Kubernetes', 'Helm', 'ArgoCD', 'Flux', 'Terraform', 'Pulumi',
  // No Code Tools
  'Webflow', 'Bubble', 'Adalo', 'FlutterFlow', 'Appgyver', 'OutSystems', 'Mendix',
  'Airtable', 'Notion', 'Coda', 'Zapier', 'Make', 'n8n', 'Tally',
  'Glide', 'Softr', 'Carrd', 'Sheetly', 'Stacker', 'Monday.com', 'ClickUp',
  // Automation
  'Zapier', 'Make', 'n8n', 'Pipedream', 'IFTTT', 'Workato', 'Automate.io',
  'UiPath', 'Automation Anywhere', 'Blue Prism', 'Microsoft Power Automate', 'Keyboard Maestro', 'Hazel', 'Alfred',
  'Shortcuts', 'Tasker', 'Automate', 'MacroDroid', 'RobotJS', 'Puppeteer', 'Playwright',
  // Digital Marketing
  'Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Twitter Ads', 'Pinterest Ads', 'TikTok Ads', 'Snapchat Ads',
  'SEMrush', 'Ahrefs', 'Moz', 'SpyFu', 'Serpstat', 'Majestic', 'BuzzSumo',
  'HubSpot', 'Marketo', 'Salesforce Marketing Cloud', 'ActiveCampaign', 'Klaviyo', 'Brevo', 'Customer.io',
  'WhatConverts', 'CallRail', 'Unbounce', 'Instapage', 'Optimizely', 'VWO', 'Google Optimize',
  // Customer Service
  'Zendesk', 'Intercom', 'Freshdesk', 'Zoho Desk', 'Help Scout', 'Crisp', 'Drift',
  'LiveChat', 'Tidio', 'HubSpot Service Hub', 'Desk', 'Front', 'Hiver', 'Groove',
  'Jira Service Management', 'ServiceNow', 'Freshservice', 'SysAid', 'SolarWinds', 'ManageEngine', 'Spiceworks',
  // Database Management
  'MongoDB Atlas', 'Supabase DB', 'PlanetScale', 'Neon', 'CockroachDB', 'Aiven', 'Railway DB',
  'MongoDB Compass', 'TablePlus', 'DBeaver', 'DataGrip', 'Sequel Pro', 'HeidiSQL', 'Adminer',
  'pgAdmin', 'MySQL Workbench', 'Laravel Tinker', 'Prisma', 'Drizzle', 'TypeORM', 'Mongoose',
  // Mobile Development
  'Android Studio', 'Xcode', 'Expo', 'React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose',
  'Xamarin', '.NET MAUI', 'Ionic', 'Cordova', 'Capacitor', 'NativeScript', 'Framework7',
  'TestFlight', 'Google Play Console', 'App Store Connect', 'Fabric', 'Firebase', 'Sentry', 'RevenueCat',
  // API Tools
  'Postman', 'Insomnia', 'Bruno', 'RapidAPI', 'Swagger', 'Postwoman', 'Hoppscotch',
  'GraphiQL', 'Altair GraphQL', 'Studio Apollo', 'HTTPie', 'curl', 'wget', 'Paw',
  'NGINX', 'Apache', 'HAProxy', 'Caddy', 'Traefik', 'Envoy', 'Istio',
  // Debugging & Profiling
  'Chrome DevTools', 'Firefox DevTools', 'Safari Web Inspector', 'React Developer Tools', 'Vue DevTools', 'Redux DevTools', 'React Query DevTools',
  'Lighthouse', 'PageSpeed Insights', 'WebPageTest', 'GTmetrix', 'Pingdom', 'SolarWinds PM', 'New Relic Browser',
  'Fiddler', 'Charles Proxy', 'Wireshark', 'Proxyman', 'mitmproxy', 'Burp Suite', 'OWASP ZAP',
  // Code Quality
  'ESLint', 'Prettier', 'Stylelint', 'JSHint', 'TSLint', 'Standard JS', 'XO',
  'Husky', 'lint-staged', 'commitlint', 'semantic-release', 'Commitizen', 'Release It', 'Ship.js',
  'SonarQube', 'CodeClimate', 'Codacy', 'DeepSource', 'SonarCloud', 'Coveralls', 'Codecov',
  // Testing Tools
  'Jest', 'Vitest', 'Mocha', 'Cypress', 'Playwright', 'Selenium', 'Puppeteer',
  'Testing Library', 'Enzyme', 'React Testing Library', 'Chai', 'Sinon', 'Ava', 'Supertest',
  'JUnit', 'PyTest', 'PHPUnit', 'RSpec', 'Jasmine', 'Karma', 'Nightwatch',
  // CMS
  'WordPress', 'Drupal', 'Joomla', 'Ghost', 'Contentful', 'Strapi', 'Sanity',
  'Prismic', 'Storyblok', 'Cosmic', 'ButterCMS', 'Kentico', 'CloudCannon', 'Tina CMS',
  'Headless CMS', 'Directus', 'Payload CMS', 'KeystoneJS', 'Strapi', 'Ghost', 'Flotiq',
  // Fashion & Style
  'Pinterest', 'Instagram', 'ASOS', 'Zara', 'H&M', 'Nike', 'Adidas',
  'Stitch Fix', 'Trunk Club', 'ThredUp', 'Poshmark', 'Depop', 'Mercari', 'Grailed',
  'Stylebook', 'Cladwell', 'Combyne', 'Pureple', 'Your Closet', 'Wishi', 'Lookbook',
  // Interior Design
  'Houzz', 'Pinterest', 'IKEA Place', 'Homer', 'Room Planner', 'MagicPlan', 'HomeByMe',
  'SketchUp', 'Floorplanner', 'Planner 5D', 'Roomstyler', 'HomeStyler', 'Sweet Home 3D', 'Chief Architect',
  // Video Conferencing
  'Zoom', 'Google Meet', 'Microsoft Teams', 'Cisco Webex', 'GoToMeeting', 'BlueJeans', 'Whereby',
  'RingCentral', '8x8', 'Jitsi', 'BigBlueButton', 'TrueConf', 'StarLeaf', 'Lifesize',
  'Voxer', 'Walkie-Talkie', 'Mumble', 'TeamSpeak', 'Zello', 'Remo', 'Gather',
  // Screen Recording
  'OBS Studio', 'Streamlabs', 'Screenflow', 'Camtasia', 'Snagit', 'Loom', 'QuickTime',
  'Screencastify', 'ScreenPal', 'Filmora Scrn', 'Bandicam', 'Action', 'ShadowPlay', 'ShareX',
  // Time Management
  'RescueTime', 'Toggl', 'Clockify', 'Harvest', 'Time Doctor', 'Focusmate', 'Forest',
  'Pomodone', 'Be Focused', 'Focus Booster', 'Pomofocus', 'Tide', 'Brain Focus', 'TimeTune',
  // Habit Tracking
  'Habitica', 'HabitBull', 'Loop Habit Tracker', 'Streaks', 'Productive', 'Habitify', 'Strides',
  'Atomic Habits', 'Daylio', 'Exist Track', 'Reporter', 'Track This', 'Nomie', 'Moodistory',
  // Remote Work
  'Zoom', 'Slack', 'Teams', 'Notion', 'Miro', 'Asana', 'Todoist',
  'RescueTime', 'Toggl', 'Focusmate', 'Wework', 'Remote', 'Coworker', 'Workfrom',
  'TeamViewer', 'AnyDesk', 'Chrome Remote Desktop', 'Splashtop', 'LogMeIn', 'VNC Connect', 'Parsec',
  // Cryptography
  'VeraCrypt', 'BitLocker', 'FileVault', 'LUKS', 'AxCrypt', 'BoxCryptor', 'Cryptomator',
  'GnuPG', 'OpenSSL', 'Let\'s Encrypt', 'Certbot', 'ACME', 'SSL Labs', 'Keybase',
  // Sales
  'Salesforce', 'HubSpot CRM', 'Pipedrive', 'Zoho CRM', 'Freshsales', 'Copper', 'DealHub',
  'SalesLoft', 'Outreach', 'Gong', 'Chorus', 'Refiner', 'Clari', 'Base',
  'Proposify', 'PandaDoc', 'HelloSign', 'DocuSign', 'ContractBook', 'Qwilr', 'Better Proposals',
  // HR & People
  'Workday', 'BambooHR', 'Gusto', 'Zenefits', 'Rippling', 'ADP', 'Paychex',
  'Lattice', '15Five', 'OfficeVibe', 'Culture Amp', 'Peakon', 'Leapsome', 'Betterworks',
  'Greenhouse', 'Lever', 'Breezy', 'Workable', 'ApplicantStack', 'SmartRecruiters', 'JazzHR',
  // Knowledge Management
  'Notion', 'Confluence', 'Slab', 'Guru', 'BookStack', 'Outline', 'Dendron',
  'Foam', 'Obsidian', 'Logseq', 'Athens', 'Roam', 'Mem', 'Reflect',
  'GitBook', 'Wiki.js', 'MediaWiki', 'Document360', 'ReadTheDocs', 'MkDocs', 'Jekyll',
  // Event Management
  'Eventbrite', 'Meetup', 'Luma', 'Partiful', 'Ticketmaster', 'Eventzilla', 'Bizzabo',
  'Zoom Events', 'Hopin', 'Run The World', 'Airmeet', 'Eventory', 'Whova', 'Whale',
  'Calendly', 'Cal.com', 'Acuity', 'Appointy', 'YouCanBookMe', 'SimplyBook', 'Setmore',
  // APIs & Data
  'Google Maps API', 'Stripe API', 'Twilio API', 'SendGrid API', 'YouTube API', 'Instagram API', 'Twitter API',
  'OpenAI API', 'Anthropic API', 'Cohere API', 'Hugging Face API', 'RapidAPI', 'API Gateway', 'Kong',
  // Virtual Machines
  'VirtualBox', 'VMware', 'Hyper-V', 'Parallels', 'QEMU', 'Boxes', 'UTM',
  'Vagrant', 'Packer', 'Docker', 'Podman', 'LXC', 'Proxmox', 'VMware ESXi',
]

const CATEGORIES: Record<string, string[]> = {
  'AI Tools': ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Firefly',
    'Leonardo AI', 'Runway ML', 'Synthesia', 'ElevenLabs', 'Murf AI', 'Descript', 'Otter AI',
    'Jasper AI', 'Copy AI', 'Writesonic', 'Rytr', 'Grammarly', 'ProWritingAid', 'Quillbot',
    'Perplexity AI', 'You.com', 'Phind', 'Consensus', 'Elicit', 'Scite', 'Notion AI',
    'Mem AI', 'Reflect', 'Gamma AI', 'Beautiful AI', 'Tome', 'Pitch', 'Canva AI'],
  'AI Models': ['TensorFlow', 'PyTorch', 'Hugging Face', 'Replicate', 'Modal', 'LangChain', 'LlamaIndex',
    'Haystack', 'Cohere', 'Anthropic', 'OpenAI', 'Mistral AI', 'GPT-4', 'GPT-4o', 'Sora',
    'Whisper', 'Codex'],
  Chatbots: ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Jasper AI', 'Copy AI', 'Botpress', 'Rasa'],
  'Image Generators': ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Firefly', 'Leonardo AI', 'Clipdrop', 'Remove BG',
    'Upscale Media', 'Topaz Labs', 'Fotor', 'Picsart', 'Facetune', 'Remini', 'VanceAI', 'Imagen'],
  'Video Tools': ['Runway ML', 'Synthesia', 'HeyGen', 'Synthesys', 'Colossyan', 'Elai', 'Pictory',
    'InVideo', 'Kapwing', 'Fliki', 'Lumen5', 'Animoto', 'Vyond', 'Powtoon',
    'Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'CapCut', 'iMovie', 'Filmora', 'Vegas Pro',
    'After Effects', 'HitFilm', 'Shotcut', 'OpenShot', 'Kdenlive', 'Lightworks', 'InShot',
    'VN Editor', 'Kinemaster', 'PowerDirector', 'CapCut Desktop', 'Clipchamp'],
  'Audio Tools': ['Audacity', 'Adobe Audition', 'GarageBand', 'Logic Pro', 'FL Studio', 'Ableton Live', 'Pro Tools',
    'Cubase', 'Studio One', 'Reaper', 'LMMS', 'ElevenLabs', 'Murf AI', 'Soundraw', 'Boomy',
    'AIVA', 'Amper Music', 'Mubert'],
  'Writing Tools': ['Grammarly', 'ProWritingAid', 'Quillbot', 'Jasper AI', 'Copy AI', 'Writesonic', 'Rytr',
    'LanguageTool', 'iA Writer', 'Ulysses', 'Scrivener', 'FocusWriter', 'Typora'],
  'Coding Tools': ['VS Code', 'Visual Studio', 'IntelliJ IDEA', 'WebStorm', 'PyCharm', 'Android Studio', 'Xcode',
    'Sublime Text', 'Atom', 'Vim', 'Neovim', 'Git', 'GitHub', 'GitLab',
    'Postman', 'Insomnia', 'Docker', 'Kubernetes', 'GitHub Copilot', 'Cursor', 'Windsurf'],
  'Design Tools': ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'Lightroom',
    'Affinity Designer', 'Affinity Photo', 'Canva', 'Procreate', 'Figma', 'Blender', 'Inkscape', 'GIMP', 'Krita'],
  'SEO Tools': ['Google Analytics', 'Google Search Console', 'SEMrush', 'Ahrefs', 'Moz', 'Majestic', 'Serpstat',
    'SpyFu', 'Mangools', 'Yoast SEO', 'Rank Math'],
  'Marketing Tools': ['HubSpot', 'Marketo', 'Mailchimp', 'ConvertKit', 'ActiveCampaign', 'Klaviyo', 'Brevo',
    'MailerLite', 'Google Ads', 'Facebook Ads', 'Hootsuite', 'Buffer', 'Sprout Social'],
  'Business Tools': ['Salesforce', 'HubSpot CRM', 'Pipedrive', 'Zoho CRM', 'Notion', 'Monday.com', 'Asana',
    'Trello', 'Jira', 'Linear', 'Slack', 'Teams'],
  'Finance Tools': ['QuickBooks', 'Xero', 'FreshBooks', 'Wave', 'Mint', 'YNAB', 'Expensify',
    'Coinbase', 'Binance', 'Robinhood', 'PayPal', 'Stripe', 'Square'],
  'Office Tools': ['Microsoft 365', 'Word', 'Excel', 'PowerPoint', 'Outlook', 'OneNote', 'Teams',
    'Google Workspace', 'Google Docs', 'Google Sheets', 'Gmail', 'Google Drive', 'Google Calendar'],
  Education: ['Duolingo', 'Babbel', 'Rosetta Stone', 'Khan Academy', 'Coursera', 'Udemy', 'edX',
    'Skillshare', 'LinkedIn Learning', 'Brilliant', 'Codecademy', 'freeCodeCamp', 'Notion', 'Obsidian'],
  'Developer Tools': ['VS Code', 'Git', 'Docker', 'Postman', 'GitHub', 'GitLab', 'Terminal',
    'iTerm2', 'Warp', 'Hyper', 'Oh My Zsh', 'Homebrew', 'Chocolatey', 'Scoop',
    'ESLint', 'Prettier', 'Webpack', 'Vite', 'Rollup', 'esbuild', 'Turbo'],
  Cloud: ['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Linode', 'Vultr', 'Hetzner',
    'Cloudflare', 'Vercel', 'Netlify', 'Render', 'Railway', 'Fly.io', 'Supabase',
    'MongoDB Atlas', 'PlanetScale', 'Neon', 'Snowflake', 'Databricks', 'BigQuery'],
  Hosting: ['Bluehost', 'SiteGround', 'HostGator', 'DreamHost', 'Hostinger', 'GoDaddy', 'Namecheap',
    'Cloudways', 'Kinsta', 'WP Engine', 'Netlify', 'Vercel', 'Render', 'Railway'],
  WordPress: ['WordPress', 'WordPress Admin', 'WooCommerce', 'Yoast SEO', 'Elementor', 'Divi', 'Jetpack',
    'WPForms', 'Gravity Forms', 'WordFence', 'Rank Math', 'Astra', 'GeneratePress'],
  Windows: ['Windows 11', 'Windows 10', 'Microsoft 365', 'Visual Studio', 'PowerToys', 'ShareX', 'Everything',
    'EarTrumpet', 'TranslucentTB', 'AutoHotkey', 'Rainmeter', 'Notepad++'],
  Mac: ['macOS', 'Finder', 'Spotlight', 'Time Machine', 'Safari', 'QuickTime', 'Preview',
    'Alfred', 'Raycast', 'BetterTouchTool', 'Magnet', 'Rectangle', 'Bartender'],
  Linux: ['Ubuntu', 'Fedora', 'Debian', 'Arch Linux', 'Linux Mint', 'Pop!_OS', 'Manjaro',
    'Nginx', 'Apache', 'Bash', 'Zsh', 'systemd', 'Docker', 'Podman'],
  Android: ['Android Studio', 'Google Play', 'Tasker', 'Nova Launcher', 'KLWP', 'KWGT', 'MacroDroid',
    'Samsung One UI', 'Gboard', 'Google Photos', 'Google Drive'],
  iPhone: ['iOS', 'Safari', 'Apple Music', 'Apple Podcasts', 'Shortcuts', 'FaceTime', 'iMessage',
    'Health', 'Wallet', 'Maps', 'Photos', 'Files', 'Freeform'],
  Google: ['Google Search', 'Google Maps', 'Google Drive', 'Gmail', 'Google Photos', 'Google Calendar', 'Google Docs',
    'Google Sheets', 'Google Slides', 'Google Meet', 'Google Keep', 'Google Translate', 'Google Lens',
    'Google Analytics', 'Google Ads', 'Google Search Console', 'Google Cloud', 'Google Workspace'],
  Microsoft: ['Windows', 'Microsoft 365', 'Azure', 'Teams', 'Outlook', 'OneDrive', 'OneNote',
    'SharePoint', 'Power BI', 'Visual Studio', 'VS Code', 'GitHub', 'LinkedIn', 'Bing'],
  Adobe: ['Photoshop', 'Illustrator', 'InDesign', 'Premiere Pro', 'After Effects', 'Lightroom', 'XD',
    'Acrobat', 'Adobe Express', 'Adobe Firefly', 'Adobe Fonts', 'Creative Cloud', 'Behance'],
  Meta: ['Facebook', 'Instagram', 'WhatsApp', 'Messenger', 'Meta Ads', 'Meta Business Suite', 'Meta Horizon',
    'Meta AI', 'Threads', 'Facebook Marketplace', 'Facebook Groups'],
  OpenAI: ['ChatGPT', 'DALL-E', 'Whisper', 'OpenAI API', 'GPT-4', 'GPT-4o', 'Sora', 'Codex'],
  GitHub: ['GitHub', 'GitHub Actions', 'GitHub Pages', 'GitHub Copilot', 'GitHub Desktop', 'GitHub CLI', 'GitHub API',
    'GitHub Discussions', 'GitHub Codespaces', 'GitHub Mobile', 'GitHub Security'],
  Canva: ['Canva', 'Canva AI', 'Canva Templates', 'Canva Print', 'Canva Presentations', 'Canva Docs', 'Canva Video'],
  Figma: ['Figma', 'Figma Design', 'Figma Prototyping', 'Figma Dev Mode', 'Figma Community', 'Figma Auto Layout', 'Figma Variables',
    'Figma Components', 'Figma Plugins'],
  Notion: ['Notion', 'Notion AI', 'Notion Templates', 'Notion Databases', 'Notion Wiki', 'Notion Calendar', 'Notion API'],
  Slack: ['Slack', 'Slack Channels', 'Slack Huddles', 'Slack Canvas', 'Slack Workflow', 'Slack Connect', 'Slack API'],
  Discord: ['Discord', 'Discord Servers', 'Discord Bots', 'Discord API', 'Discord Nitro', 'Discord Screen Share', 'Discord Voice'],
  Zoom: ['Zoom', 'Zoom Meetings', 'Zoom Webinar', 'Zoom Rooms', 'Zoom Phone', 'Zoom AI Companion', 'Zoom Whiteboard'],
  Netflix: ['Netflix', 'Netflix Streaming', 'Netflix Downloads', 'Netflix Profiles', 'Netflix Party', 'Netflix Games'],
  YouTube: ['YouTube', 'YouTube Studio', 'YouTube Analytics', 'YouTube Shorts', 'YouTube Live', 'YouTube Music', 'YouTube TV'],
  Instagram: ['Instagram', 'Instagram Stories', 'Instagram Reels', 'Instagram Live', 'Instagram Shop', 'Instagram Insights', 'Threads'],
  Facebook: ['Facebook', 'Facebook Groups', 'Facebook Pages', 'Facebook Marketplace', 'Facebook Events', 'Facebook Ads', 'Facebook Watch'],
  WhatsApp: ['WhatsApp', 'WhatsApp Business', 'WhatsApp Web', 'WhatsApp Channels', 'WhatsApp Communities', 'WhatsApp Status'],
  LinkedIn: ['LinkedIn', 'LinkedIn Profile', 'LinkedIn Jobs', 'LinkedIn Learning', 'LinkedIn Premium', 'LinkedIn Sales Navigator', 'LinkedIn Ads'],
  Pinterest: ['Pinterest', 'Pinterest Boards', 'Pinterest Pins', 'Pinterest Ads', 'Pinterest Analytics', 'Pinterest Shop'],
  Reddit: ['Reddit', 'Reddit Communities', 'Reddit Posts', 'Reddit Awards', 'Reddit Moderation', 'Reddit API'],
  'X (Twitter)': ['Twitter', 'X', 'Twitter Analytics', 'Twitter Ads', 'Twitter API', 'TweetDeck', 'Twitter Spaces'],
  Amazon: ['Amazon', 'Amazon Prime', 'Amazon Shopping', 'Amazon Kindle', 'Amazon AWS', 'Amazon Seller Central', 'Amazon Fresh'],
  'Google Maps': ['Google Maps', 'Google Earth', 'Google Street View', 'Google Maps API', 'Google Local Guide', 'My Maps'],
  'Google Drive': ['Google Drive', 'Google Docs', 'Google Sheets', 'Google Slides', 'Google Forms', 'Google My Drive'],
}

// Build tool objects
export function generateTools(): { tools: Tool[], categories: { id: string, name: string, slug: string, description: string, icon: string, color: string, count: number }[] } {
  const tools: Tool[] = []
  const uniqueNames = [...new Set(TOOL_NAMES)]

  uniqueNames.forEach((name, index) => {
    const slug = slugify(name)
    const category = findCategory(name)
    const catData = getCategoryInfo(category)
    const id = `tool-${slug}`

    tools.push({
      id,
      name,
      slug,
      tagline: `Complete guide to ${name} - How to use, tips, and solutions`,
      description: `Learn everything about ${name}. Our comprehensive guide covers what it is, how to use it, step-by-step tutorials, troubleshooting common problems, and expert tips & tricks.`,
      longDescription: `${name} is a powerful ${category.toLowerCase()} platform that helps users accomplish their tasks efficiently. ${getCategoryDescription(category)} With millions of users worldwide, ${name} has become an essential tool for professionals, beginners, and everyone in between. This comprehensive guide covers everything you need to know about using ${name} effectively.`,
      category,
      subcategory: category,
      icon: catData.icon,
      color: catData.color,
      logoUrl: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com` || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${catData.color.replace('#', '')}&color=fff`,
      websiteUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      documentationUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/docs`,
      downloadUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/download`,
      officialLinks: [
        { label: 'Official Website', url: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` },
        { label: 'Documentation', url: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/docs` },
        { label: 'Support', url: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/support` },
        { label: 'Blog', url: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/blog` },
        { label: 'Community', url: `https://community.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` },
        { label: 'Status', url: `https://status.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` },
        { label: 'Twitter/X', url: `https://twitter.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` },
        { label: 'GitHub', url: `https://github.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}` },
      ],
      platform: getPlatforms(category),
      pricingType: getPricingType(category),
      priceRange: getPriceRange(category),
      operatingSystem: getOS(category),
      difficulty: getDifficulty(category),
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(100 + Math.random() * 9000),
      totalUsers: `${(10 + Math.floor(Math.random() * 990))}M+`,
      releaseDate: `${2014 + Math.floor(Math.random() * 11)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      latestUpdate: `${2026}-${String(Math.floor(Math.random() * 7) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      developer: getDeveloper(name),
      developerUrl: `https://${getDeveloper(name).toLowerCase().replace(/\s+/g, '')}.com`,
      isFeatured: index < 100,
      isTrending: Math.random() > 0.8,
      isPopular: index < 500,
      isNew: index > 2400,
      overview: `${name} is a comprehensive ${category.toLowerCase()} platform designed to help users ${getAction(category)}. Whether you're a beginner or an advanced user, ${name} provides the tools and features you need to succeed. This guide covers every aspect of using ${name}, from basic setup to advanced techniques.`,
      whatItIs: `${name} is a ${getDifficulty(category)}-friendly ${category.toLowerCase()} platform that enables users to ${getAction(category)}. It was developed by ${getDeveloper(name)} and has grown to serve millions of users worldwide.`,
      whatItDoes: `${name} allows users to ${getAction(category)} through its intuitive interface and powerful features. It supports ${getPlatforms(category).join(', ')} and offers seamless integration with other popular tools.`,
      whyPeopleUseIt: `Users choose ${name} for its reliability, ease of use, comprehensive feature set, and excellent support. It's trusted by professionals, businesses, and individuals worldwide for ${getAction(category)}.`,
      howItWorks: `${name} works by ${getHowItWorks(category)}. The platform uses advanced technology to ensure fast performance, reliable results, and a smooth user experience across all devices.`,
      features: generateFeatures(name, category),
      stepByStepGuide: generateSteps(name, category, 'beginner'),
      beginnerGuide: generateSteps(name, category, 'beginner'),
      advancedGuide: generateSteps(name, category, 'advanced'),
      screenshots: generateScreenshots(name),
      videos: [
        { title: `Getting Started with ${name}`, url: `https://youtube.com/watch?v=${slug}`, duration: '10:30', platform: 'youtube' },
        { title: `${name} Advanced Tutorial 2026`, url: `https://youtube.com/watch?v=${slug}-advanced`, duration: '25:15', platform: 'youtube' },
        { title: `${name} Tips & Tricks`, url: `https://youtube.com/watch?v=${slug}-tips`, duration: '15:45', platform: 'youtube' },
      ],
      faqs: generateFAQs(name, category),
      commonErrors: generateErrors(name, category),
      tips: generateTips(name),
      warnings: [
        `Always keep ${name} updated to the latest version`,
        'Backup your data before major updates',
        'Use strong passwords and enable 2FA',
        'Review privacy settings regularly',
        'Be cautious with third-party integrations',
      ],
      requirements: generateRequirements(category),
      alternatives: generateAlternatives(name, category),
      similarTools: generateAlternatives(name, category).slice(0, 6).map(a => a.name),
      pros: generatePros(category),
      cons: generateCons(category),
      history: `${name} was launched by ${getDeveloper(name)} to ${getAction(category)}. Since its inception, it has evolved through numerous updates and improvements, becoming one of the most popular ${category.toLowerCase()} platforms available today. The platform continues to innovate with regular feature updates and community-driven improvements.`,
      pricing: generatePricing(category),
      reviews: generateReviews(name),
      updates: generateUpdates(name),
      tags: [name, category, ...name.split(' '), ...getPlatforms(category)],
      relatedArticles: [
        { title: `How to Master ${name} in 2026`, slug: `master-${slug}`, excerpt: `Learn the best strategies for using ${name} like a pro.` },
        { title: `${name} vs Competitors: A Comprehensive Comparison`, slug: `${slug}-vs-alternatives`, excerpt: `Compare ${name} with other popular ${category.toLowerCase()} tools.` },
        { title: `Top 10 ${name} Features You Should Know`, slug: `top-10-${slug}-features`, excerpt: `Discover the most powerful features of ${name}.` },
        { title: `${name} Security Best Practices`, slug: `${slug}-security`, excerpt: `Keep your ${name} account and data secure.` },
        { title: `${name} for Beginners: Complete Getting Started Guide`, slug: `${slug}-for-beginners`, excerpt: `Everything you need to know to start using ${name}.` },
      ],
      communityDiscussions: [
        { platform: 'Reddit', title: `${name} Tips & Discussion`, url: `https://reddit.com/r/${slug}`, participants: Math.floor(1000 + Math.random() * 90000) },
        { platform: 'Stack Overflow', title: `${name} Questions`, url: `https://stackoverflow.com/questions/tagged/${slug}`, participants: Math.floor(100 + Math.random() * 9000) },
        { platform: 'GitHub', title: `${name} Community`, url: `https://github.com/${name.toLowerCase().replace(/\s+/g, '')}/discussions`, participants: Math.floor(500 + Math.random() * 9500) },
        { platform: 'Discord', title: `Official ${name} Server`, url: `https://discord.gg/${slug}`, participants: Math.floor(1000 + Math.random() * 99000) },
        { platform: 'Twitter/X', title: `#${name.replace(/\s+/g, '')} Community`, url: `https://twitter.com/hashtag/${name.replace(/\s+/g, '')}`, participants: Math.floor(10000 + Math.random() * 900000) },
      ],
      integrations: generateIntegrations(name, category),
      keyboardShortcuts: generateShortcuts(category),
      apiEndpoints: [
        { method: 'GET', endpoint: `/api/v1/${slug}`, description: `Fetch ${name} data` },
        { method: 'POST', endpoint: `/api/v1/${slug}/create`, description: `Create new ${name} resource` },
        { method: 'PUT', endpoint: `/api/v1/${slug}/update`, description: `Update ${name} resource` },
        { method: 'DELETE', endpoint: `/api/v1/${slug}/delete`, description: `Delete ${name} resource` },
      ],
      templates: [
        { title: `${name} Starter Template`, description: `Quick start template for getting started with ${name}`, url: `https://${slug}.com/templates/starter` },
        { title: `${name} Pro Template`, description: `Advanced template with all ${name} features configured`, url: `https://${slug}.com/templates/pro` },
      ],
      resources: [
        { title: `${name} Official Documentation`, type: 'documentation', url: `https://${slug}.com/docs` },
        { title: `${name} Video Tutorials`, type: 'video', url: `https://youtube.com/${slug}` },
        { title: `${name} Blog`, type: 'blog', url: `https://${slug}.com/blog` },
        { title: `${name} Community`, type: 'community', url: `https://community.${slug}.com` },
      ],
    })
  })

  // Build categories statistics
  const categoryMap = new Map<string, number>()
  tools.forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + 1)
  })

  const categories = Object.keys(CATEGORIES).map(catName => {
    const catInfo = getCategoryInfo(catName)
    return {
      id: slugify(catName),
      name: catName,
      slug: slugify(catName),
      description: `Comprehensive guides and tutorials for ${catName.toLowerCase()}. Learn how to use the best ${catName.toLowerCase()} tools like a pro.`,
      icon: catInfo.icon,
      color: catInfo.color,
      count: categoryMap.get(catName) || 0,
    }
  })

  return { tools, categories }
}

function findCategory(name: string): string {
  for (const [cat, items] of Object.entries(CATEGORIES)) {
    if (items.some(item => item.toLowerCase() === name.toLowerCase())) return cat
  }
  return 'Tools'
}

function getCategoryInfo(category: string): { color: string, icon: string } {
  const colorMap: Record<string, string> = {
    'AI Tools': '#6366f1', 'AI Models': '#8b5cf6', Chatbots: '#a855f7',
    'Image Generators': '#d946ef', 'Video Tools': '#ec4899', 'Audio Tools': '#f43f5e',
    'Writing Tools': '#ef4444', 'Coding Tools': '#f97316', 'Design Tools': '#f59e0b',
    'SEO Tools': '#10b981', 'Marketing Tools': '#14b8a6', 'Business Tools': '#06b6d4',
    'Finance Tools': '#0ea5e9', 'Office Tools': '#3b82f6', Education: '#6366f1',
    'Developer Tools': '#8b5cf6', Cloud: '#a855f7', Hosting: '#d946ef',
    WordPress: '#ec4899', Windows: '#f43f5e', Mac: '#ef4444', Linux: '#f97316',
    Android: '#84cc16', iPhone: '#22c55e', Google: '#10b981', Microsoft: '#14b8a6',
    Adobe: '#06b6d4', Meta: '#0ea5e9', OpenAI: '#3b82f6', GitHub: '#6366f1',
    Canva: '#8b5cf6', Figma: '#a855f7', Notion: '#d946ef', Slack: '#ec4899',
    Discord: '#f43f5e', Zoom: '#ef4444', Netflix: '#f97316', YouTube: '#f59e0b',
    Instagram: '#eab308', Facebook: '#84cc16', WhatsApp: '#22c55e', LinkedIn: '#10b981',
    Pinterest: '#14b8a6', Reddit: '#06b6d4', 'X (Twitter)': '#0ea5e9', Amazon: '#3b82f6',
    'Google Maps': '#6366f1', 'Google Drive': '#8b5cf6',
  }
  const iconMap: Record<string, string> = {
    'AI Tools': 'Bot', 'AI Models': 'Brain', Chatbots: 'MessageCircle',
    'Image Generators': 'Image', 'Video Tools': 'Video', 'Audio Tools': 'Music',
    'Writing Tools': 'Pen', 'Coding Tools': 'Code', 'Design Tools': 'Palette',
    'SEO Tools': 'Search', 'Marketing Tools': 'Megaphone', 'Business Tools': 'Briefcase',
    'Finance Tools': 'DollarSign', 'Office Tools': 'Building2', Education: 'GraduationCap',
    'Developer Tools': 'Terminal', Cloud: 'Cloud', Hosting: 'Server',
    WordPress: 'Globe', Windows: 'Monitor', Mac: 'Monitor', Linux: 'Terminal',
    Android: 'Smartphone', iPhone: 'Smartphone', Google: 'Search', Microsoft: 'Window',
    Adobe: 'Palette', Meta: 'Globe', OpenAI: 'Sparkles', GitHub: 'GitBranch',
    Canva: 'Image', Figma: 'Pen', Notion: 'FileText', Slack: 'MessageSquare',
    Discord: 'Headphones', Zoom: 'Video', Netflix: 'Film', YouTube: 'Youtube',
    Instagram: 'Camera', Facebook: 'Facebook', WhatsApp: 'MessageCircle', LinkedIn: 'Linkedin',
    Pinterest: 'Image', Reddit: 'MessageCircle', 'X (Twitter)': 'Twitter', Amazon: 'ShoppingCart',
    'Google Maps': 'Map', 'Google Drive': 'HardDrive',
  }
  return {
    color: colorMap[category] || '#6366f1',
    icon: iconMap[category] || 'Box',
  }
}

function getCategoryDescription(cat: string): string {
  const descs: Record<string, string> = {
    'AI Tools': 'It leverages artificial intelligence to automate tasks, generate content, and provide intelligent insights.',
    'AI Models': 'It provides state-of-the-art machine learning models and infrastructure for building AI-powered applications.',
    Chatbots: 'It enables natural language conversations and automated customer interactions.',
    'Image Generators': 'It uses AI to create stunning visuals, artwork, and images from text descriptions.',
    'Video Tools': 'It offers professional video editing, creation, and production capabilities.',
    'Audio Tools': 'It provides audio recording, editing, mixing, and production features.',
    'Writing Tools': 'It helps improve writing quality with AI-powered grammar, style, and tone suggestions.',
    'Coding Tools': 'It streamlines software development with powerful code editing, debugging, and collaboration features.',
    'Design Tools': 'It enables creative design work with professional-grade tools for graphics, UI/UX, and more.',
    'SEO Tools': 'It helps optimize websites for search engines to improve rankings and visibility.',
    'Marketing Tools': 'It provides comprehensive marketing automation and campaign management capabilities.',
    'Business Tools': 'It helps businesses manage operations, projects, and customer relationships efficiently.',
    'Finance Tools': 'It simplifies financial management, accounting, and expense tracking.',
    'Office Tools': 'It enhances workplace productivity with documents, spreadsheets, presentations, and communication tools.',
    Education: 'It makes learning accessible and engaging through interactive courses and educational content.',
    'Developer Tools': 'It provides essential tools and utilities for software development workflows.',
    Cloud: 'It offers scalable cloud computing infrastructure and services for hosting applications.',
    Hosting: 'It provides reliable web hosting services for websites and web applications.',
  }
  return descs[cat] || 'It provides essential functionality for users across various industries and use cases.'
}

function getAction(cat: string): string {
  const actions: Record<string, string> = {
    'AI Tools': 'generate AI-powered content and automate intelligent workflows',
    'AI Models': 'train, deploy, and scale machine learning models',
    Chatbots: 'build conversational AI and automate customer interactions',
    'Image Generators': 'create, edit, and enhance images and artwork',
    'Video Tools': 'edit, produce, and share professional videos',
    'Audio Tools': 'record, edit, mix, and master audio content',
    'Writing Tools': 'write, edit, and polish their written content',
    'Coding Tools': 'write, debug, and deploy software applications',
    'Design Tools': 'create stunning visual designs and prototypes',
    'SEO Tools': 'improve search engine rankings and organic traffic',
    'Marketing Tools': 'manage marketing campaigns and grow their audience',
    'Business Tools': 'streamline business operations and increase productivity',
    'Finance Tools': 'manage finances, track expenses, and handle accounting',
    'Office Tools': 'create documents, analyze data, and collaborate with teams',
    Education: 'learn new skills, study effectively, and track progress',
    'Developer Tools': 'build, test, and deploy software more efficiently',
    Cloud: 'deploy, scale, and manage cloud infrastructure',
    Hosting: 'host websites and web applications with reliable infrastructure',
  }
  return actions[cat] || 'accomplish their goals more efficiently'
}

function getHowItWorks(cat: string): string {
  const works: Record<string, string> = {
    'AI Tools': 'processing user inputs through advanced AI models that understand context and generate relevant outputs',
    'AI Models': 'providing a platform to train, evaluate, and deploy machine learning models at scale',
    Chatbots: 'understanding natural language queries and providing contextual responses using NLP',
    'Image Generators': 'converting text descriptions into visual content using advanced neural networks',
    'Video Tools': 'providing a timeline-based editing interface with layers, effects, and transitions',
    'Audio Tools': 'offering multi-track editing with effects, automation, and real-time processing',
    'Writing Tools': 'analyzing text for grammar, style, clarity, and tone using AI-powered language models',
    'Coding Tools': 'providing intelligent code completion, debugging, and refactoring capabilities',
    'Design Tools': 'offering a canvas-based interface with vector and raster editing capabilities',
    'SEO Tools': 'analyzing websites and providing actionable recommendations for search engine optimization',
  }
  return works[cat] || 'providing an intuitive interface and powerful backend processing'
}

function getPlatforms(cat: string): string[] {
  const web = ['Web Browser']
  const mobile = ['iOS', 'Android']
  const desktop = ['Windows', 'macOS', 'Linux']
  const all = [...web, ...mobile, ...desktop]

  const m: Record<string, string[]> = {
    'AI Tools': all, 'Video Tools': [...desktop, ...mobile, 'Web Browser'],
    'Audio Tools': [...desktop, ...mobile], 'Coding Tools': [...desktop, 'Web Browser'],
    'Design Tools': all, 'Office Tools': all, Education: all,
    'Developer Tools': all, Cloud: ['Web Browser'], Hosting: ['Web Browser'],
    Windows: ['Windows'], Mac: ['macOS'], 'Mobile Apps': [...mobile],
    Android: ['Android'], iPhone: ['iOS'],
    Google: ['Web Browser', ...mobile], Microsoft: [...desktop, 'Web Browser', ...mobile],
  }
  return m[cat] || all
}

function getOS(cat: string): string[] {
  return getPlatforms(cat).filter(p => ['Windows', 'macOS', 'Linux', 'iOS', 'Android'].includes(p))
}

function getPricingType(cat: string): 'free' | 'freemium' | 'paid' | 'open-source' {
  const m: Record<string, any> = {
    'AI Tools': 'freemium', 'AI Models': 'open-source', Chatbots: 'freemium',
    'Image Generators': 'freemium', 'Video Tools': 'paid', 'Audio Tools': 'paid',
    'Writing Tools': 'freemium', 'Coding Tools': 'free', 'Design Tools': 'freemium',
    'SEO Tools': 'paid', 'Marketing Tools': 'paid', 'Business Tools': 'paid',
    'Finance Tools': 'paid', Education: 'free', 'Developer Tools': 'free',
    Cloud: 'paid', Hosting: 'paid', WordPress: 'free',
    Google: 'free', Microsoft: 'paid', Adobe: 'paid',
    GitHub: 'freemium', Canva: 'freemium', Figma: 'freemium',
    Notion: 'freemium', Slack: 'freemium', Discord: 'free',
    Zoom: 'freemium', Netflix: 'paid', Meta: 'free',
    OpenAI: 'paid',
  }
  return m[cat] || 'free'
}

function getPriceRange(cat: string): string {
  const m: Record<string, string> = {
    'AI Tools': '$0-$200/mo', 'Video Tools': '$10-$80/mo', 'Audio Tools': '$20-$600',
    'Coding Tools': 'Free', 'Design Tools': '$0-$70/mo', 'Office Tools': '$0-$25/mo',
    Cloud: 'Pay-as-you-go', Hosting: '$3-$200/mo', Google: 'Free',
    Microsoft: '$6-$57/mo', Adobe: '$20-$80/mo', GitHub: '$0-$21/mo',
    OpenAI: '$0-$200/mo', Netflix: '$7-$20/mo',
  }
  return m[cat] || 'Free'
}

function getDifficulty(cat: string): 'beginner' | 'intermediate' | 'advanced' {
  const m: Record<string, any> = {
    'AI Tools': 'beginner', 'Video Tools': 'intermediate', 'Audio Tools': 'intermediate',
    'Coding Tools': 'intermediate', 'Developer Tools': 'intermediate',
    Cloud: 'advanced', 'AI Models': 'advanced',
  }
  return m[cat] || 'beginner'
}

function getDeveloper(name: string): string {
  const devs: Record<string, string> = {
    ChatGPT: 'OpenAI', Claude: 'Anthropic', Gemini: 'Google', Copilot: 'Microsoft/GitHub',
    Midjourney: 'Midjourney Inc', 'DALL-E': 'OpenAI', 'Stable Diffusion': 'Stability AI',
    Photoshop: 'Adobe', Figma: 'Figma Inc', VS_Code: 'Microsoft', 'VS Code': 'Microsoft',
    WordPress: 'Automattic', Notion: 'Notion Labs', Slack: 'Salesforce',
    GitHub: 'Microsoft', GitLab: 'GitLab Inc', Discord: 'Discord Inc',
  }
  return devs[name] || `${name} Inc`
}

function generateFeatures(name: string, cat: string) {
  return [
    { title: 'User-Friendly Interface', description: `Intuitive and easy-to-navigate interface designed for users of all skill levels`, icon: 'Layout' },
    { title: 'Cross-Platform Support', description: `Access ${name} on all major platforms including web, mobile, and desktop`, icon: 'Monitor' },
    { title: 'Advanced Security', description: `Enterprise-grade security with encryption, 2FA, and regular security audits`, icon: 'Shield' },
    { title: 'Real-Time Collaboration', description: `Work together with your team in real-time with seamless collaboration tools`, icon: 'Users' },
    { title: 'Cloud Integration', description: `Seamless cloud sync and backup across all your devices`, icon: 'Cloud' },
    { title: 'API Access', description: `Powerful API for custom integrations and automation`, icon: 'Code' },
    { title: 'Analytics Dashboard', description: `Comprehensive analytics and insights to track your usage and performance`, icon: 'BarChart' },
    { title: '24/7 Support', description: `Round-the-clock customer support via chat, email, and phone`, icon: 'Headphones' },
    { title: 'Regular Updates', description: `Frequent updates with new features, improvements, and security patches`, icon: 'RefreshCw' },
    { title: 'Customization', description: `Extensive customization options to tailor the experience to your needs`, icon: 'Settings' },
    { title: 'Templates & Presets', description: `Ready-to-use templates and presets to accelerate your workflow`, icon: 'FileText' },
    { title: 'Offline Mode', description: `Work offline and sync automatically when you reconnect`, icon: 'Wifi' },
  ]
}

function generateSteps(name: string, cat: string, level: string) {
  return [
    { step: 1, title: 'Create an Account', description: `Visit the ${name} website and sign up for a free account. Provide your email address and create a strong password.` },
    { step: 2, title: 'Complete Setup', description: `Follow the on-screen setup wizard to configure your preferences, notification settings, and privacy options.` },
    { step: 3, title: 'Explore Dashboard', description: `Take a tour of the main dashboard to familiarize yourself with the layout, navigation, and key features.` },
    { step: 4, title: 'Configure Settings', description: `Customize your settings including profile information, notification preferences, and integration connections.` },
    { step: 5, title: 'Start Using ${name}', description: `Begin using ${name} for your ${cat.toLowerCase()} needs. Start with basic tasks and gradually explore advanced features.` },
    { step: 6, title: 'Learn Advanced Features', description: `Explore advanced features, keyboard shortcuts, and power user tips to maximize your productivity.` },
    { step: 7, title: 'Integrate & Automate', description: `Connect ${name} with other tools you use through integrations and set up automation workflows.` },
    { step: 8, title: 'Join Community', description: `Connect with other users in forums, Discord servers, and social media communities to share tips and get help.` },
  ]
}

function generateScreenshots(name: string) {
  return [
    { url: `https://placehold.co/800x500/6366f1/ffffff?text=${encodeURIComponent(name)}+Dashboard`, title: `${name} Dashboard Overview`, description: 'Main dashboard interface' },
    { url: `https://placehold.co/800x500/8b5cf6/ffffff?text=${encodeURIComponent(name)}+Settings`, title: `${name} Settings Page`, description: 'Configuration and settings panel' },
    { url: `https://placehold.co/800x500/a855f7/ffffff?text=${encodeURIComponent(name)}+Editor`, title: `${name} Editor Interface`, description: 'Main editor/workspace view' },
    { url: `https://placehold.co/800x500/d946ef/ffffff?text=${encodeURIComponent(name)}+Analytics`, title: `${name} Analytics Dashboard`, description: 'Analytics and reporting view' },
    { url: `https://placehold.co/800x500/ec4899/ffffff?text=${encodeURIComponent(name)}+Mobile`, title: `${name} Mobile App`, description: 'Mobile application interface' },
    { url: `https://placehold.co/800x500/6366f1/ffffff?text=${encodeURIComponent(name)}+Integrations`, title: `${name} Integrations`, description: 'Third-party integrations panel' },
  ]
}

function generateFAQs(name: string, cat: string) {
  return [
    { question: `What is ${name}?`, answer: `${name} is a leading ${cat.toLowerCase()} platform that helps users ${getAction(cat)}. It offers a comprehensive set of features designed for both beginners and professionals.` },
    { question: `Is ${name} free?`, answer: `${name} offers a free tier with basic features. Premium plans with advanced features start at competitive monthly rates. Check our pricing page for detailed information.` },
    { question: `How do I get started with ${name}?`, answer: `To get started, visit the official ${name} website, create a free account, and follow the onboarding tutorial. Our step-by-step guide above provides detailed instructions.` },
    { question: `What platforms does ${name} support?`, answer: `${name} is available on Web Browser, Windows, macOS, Linux, iOS, and Android platforms.` },
    { question: `Is my data safe with ${name}?`, answer: `Yes, ${name} takes security seriously with end-to-end encryption, regular security audits, SOC 2 compliance, and GDPR compliance. Your data is protected at all times.` },
    { question: `Can I integrate ${name} with other tools?`, answer: `Yes, ${name} offers extensive integration options with popular tools and services through its API and pre-built connectors.` },
    { question: `How often is ${name} updated?`, answer: `${name} releases updates regularly, with major updates every few months and minor improvements and bug fixes released more frequently.` },
    { question: `Does ${name} offer customer support?`, answer: `Yes, ${name} provides customer support through live chat, email, phone, and a comprehensive knowledge base. Premium plans include priority support.` },
  ]
}

function generateErrors(name: string, cat: string) {
  return [
    { code: 'ERR_001', title: 'Connection Error', description: 'Unable to connect to servers', solution: 'Check your internet connection and try again. If the problem persists, check the service status page.' },
    { code: 'ERR_002', title: 'Login Failed', description: 'Invalid username or password', solution: 'Reset your password using the "Forgot Password" option. Ensure caps lock is off and check your email for account verification.' },
    { code: 'ERR_003', title: 'Sync Error', description: 'Failed to sync data across devices', solution: 'Ensure you are signed in to the same account on all devices. Check your internet connection and try manual sync.' },
    { code: 'ERR_004', title: 'File Upload Failed', description: 'Unable to upload file to server', solution: 'Check file size limits and supported formats. Try compressing the file or using a different format.' },
    { code: 'ERR_005', title: 'Permission Denied', description: 'You don\'t have permission to perform this action', solution: 'Contact your account administrator to request the necessary permissions. Check your current plan limitations.' },
  ]
}

function generateTips(name: string) {
  return [
    `Use keyboard shortcuts to speed up your workflow in ${name}`,
    `Enable dark mode to reduce eye strain during extended use`,
    `Set up automated backups to prevent data loss`,
    `Use the search feature to quickly find tools and settings`,
    `Customize your workspace layout for maximum productivity`,
    `Enable notifications to stay updated on important changes`,
    `Use templates to save time on repetitive tasks`,
    `Explore the community forums for advanced tips and tricks`,
    `Integrate ${name} with your favorite tools for a seamless workflow`,
    `Keep your profile updated for personalized recommendations`,
  ]
}

function generateRequirements(cat: string): string[] {
  return [
    'Stable internet connection',
    'Modern web browser (Chrome, Firefox, Safari, Edge)',
    'At least 4GB RAM for optimal performance',
    'Supported operating system (Windows 10+, macOS 11+, Ubuntu 20+)',
    'Free disk space: 500MB minimum',
    'Screen resolution: 1280x720 or higher',
  ]
}

function generateAlternatives(name: string, cat: string): { name: string; slug: string; description: string }[] {
  const alternatives: Record<string, string[]> = {
    'AI Tools': ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Jasper AI'],
    'Video Tools': ['DaVinci Resolve', 'Final Cut Pro', 'Premiere Pro', 'CapCut', 'Shotcut'],
    'Audio Tools': ['Audacity', 'FL Studio', 'Logic Pro', 'Ableton Live', 'GarageBand'],
    'Writing Tools': ['Grammarly', 'ProWritingAid', 'Quillbot', 'LanguageTool', 'Hemingway'],
    'Coding Tools': ['VS Code', 'IntelliJ IDEA', 'WebStorm', 'Sublime Text', 'Vim'],
    'Design Tools': ['Figma', 'Sketch', 'Photoshop', 'Canva', 'Affinity Designer'],
    Cloud: ['AWS', 'Azure', 'GCP', 'DigitalOcean', 'Vercel'],
    Hosting: ['Netlify', 'Vercel', 'Cloudflare Pages', 'AWS', 'DigitalOcean'],
  }
  const names = alternatives[cat] || ['Tool A', 'Tool B', 'Tool C', 'Tool D', 'Tool E']
  return names.filter(n => n !== name).slice(0, 5).map(n => ({
    name: n,
    slug: slugify(n),
    description: `${n} is a popular alternative to ${name} in the ${cat.toLowerCase()} space.`
  }))
}

function generateIntegrations(name: string, cat: string): { name: string; slug: string; description: string }[] {
  const common = [
    { name: 'Slack', slug: 'slack', description: 'Send notifications and updates to Slack channels' },
    { name: 'Google Drive', slug: 'google-drive', description: 'Sync files and collaborate with Google Drive' },
    { name: 'Zapier', slug: 'zapier', description: 'Connect with 3000+ apps through automated workflows' },
    { name: 'GitHub', slug: 'github', description: 'Integrate with GitHub repositories and workflows' },
  ]
  return common
}

function generateShortcuts(cat: string): { key: string; description: string; category: string }[] {
  return [
    { key: 'Ctrl+N', description: 'Create new document/project', category: 'General' },
    { key: 'Ctrl+S', description: 'Save current work', category: 'General' },
    { key: 'Ctrl+Z', description: 'Undo last action', category: 'Editing' },
    { key: 'Ctrl+Y', description: 'Redo last action', category: 'Editing' },
    { key: 'Ctrl+F', description: 'Search within project', category: 'Navigation' },
    { key: 'Ctrl+P', description: 'Print or export', category: 'General' },
    { key: 'Ctrl+Shift+A', description: 'Open advanced settings', category: 'Settings' },
    { key: 'Ctrl+/', description: 'Toggle comment or help', category: 'General' },
    { key: 'Ctrl+B', description: 'Toggle sidebar', category: 'Navigation' },
    { key: 'Ctrl+D', description: 'Duplicate selection', category: 'Editing' },
    { key: 'Escape', description: 'Close current dialog/modal', category: 'Navigation' },
    { key: 'Ctrl+K', description: 'Quick command palette', category: 'Navigation' },
  ]
}

function generatePricing(cat: string) {
  return [
    {
      plan: 'Free', price: '$0', currency: 'USD', period: 'month',
      features: ['Basic features', '1 user', 'Limited storage', 'Community support', 'Standard templates'],
      popular: false,
    },
    {
      plan: 'Pro', price: '$9.99', currency: 'USD', period: 'month',
      features: ['All basic features', 'Up to 5 users', '10GB storage', 'Priority support', 'Advanced templates', 'API access', 'Analytics'],
      popular: true,
    },
    {
      plan: 'Enterprise', price: 'Custom', currency: 'USD', period: 'month',
      features: ['All Pro features', 'Unlimited users', 'Unlimited storage', '24/7 dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option', 'Custom training'],
      popular: false,
    },
  ]
}

function generateReviews(name: string) {
  const names = ['Alex M.', 'Sarah K.', 'James R.', 'Emily L.', 'Michael T.', 'Jessica W.', 'David S.', 'Rachel B.']
  return names.slice(0, 5 + Math.floor(Math.random() * 3)).map((user, i) => ({
    id: `rev-${slugify(name)}-${i}`,
    user,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user)}&background=6366f1&color=fff`,
    rating: 4 + Math.floor(Math.random() * 2),
    title: i === 0 ? 'Excellent tool for daily use' : i === 1 ? 'Great features and support' : 'Highly recommended',
    content: `${name} has completely transformed how I work. The interface is intuitive, features are powerful, and the support team is incredibly helpful. Highly recommended for anyone looking to ${Math.random() > 0.5 ? 'boost productivity' : 'streamline their workflow'}.`,
    date: `2026-${String(Math.floor(Math.random() * 7) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    helpful: Math.floor(Math.random() * 200),
  }))
}

function generateUpdates(name: string) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July']
  return months.slice(0, 4).map((month, i) => ({
    version: `${2026}.${i + 1}.0`,
    date: `2026-${String(i + 1).padStart(2, '0')}-15`,
    title: `${month} 2026 Update - New Features & Improvements`,
    changes: [
      'Performance improvements and bug fixes',
      'New UI customization options',
      'Enhanced security features',
      'Improved cross-platform sync',
      'New integration connectors',
      'Updated documentation and tutorials',
    ]
  }))
}

function generatePros(cat: string): string[] {
  return [
    'Intuitive user interface',
    'Cross-platform accessibility',
    'Regular updates with new features',
    'Strong security measures',
    'Excellent customer support',
    'Large community and resources',
    'Flexible pricing options',
    'Seamless integrations',
  ]
}

function generateCons(cat: string): string[] {
  return [
    'Learning curve for advanced features',
    'Some features require paid subscription',
    'Occasional performance issues',
    'Limited offline functionality',
  ]
}
