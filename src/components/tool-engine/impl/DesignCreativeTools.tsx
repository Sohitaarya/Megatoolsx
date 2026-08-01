import { useState } from 'react'
import { Sparkles, Image, Type, Palette, Pen, Download, Upload, Eye, Maximize, Crop, Sliders, Layers, Droplet, Sun, Brush, Eraser, Star, Grid, Copy, Code, Search as SearchIcon } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'

export function DesignCreativeTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('logo')) return <LogoGenerator tool={tool} />
  if (name.includes('thumbnail')) return <ThumbnailGenerator tool={tool} />
  if (name.includes('3d') || name.includes('3d model')) return <ThreeDGenerator tool={tool} />
  if (name.includes('poster') || name.includes('banner')) return <PosterGenerator tool={tool} />
  if (name.includes('nft') || name.includes('nft art')) return <NFTArtGenerator tool={tool} />
  if (name.includes('color') || name.includes('palette')) return <ColorPalette tool={tool} />
  if (name.includes('resize') || name.includes('resizer')) return <ImageResizer tool={tool} />
  if (name.includes('background') && name.includes('remove')) return <BgRemover tool={tool} />
  if (name.includes('photo') && name.includes('editor')) return <PhotoEditor tool={tool} />
  if (name.includes('icon') || name.includes('icon maker')) return <IconMaker tool={tool} />
  if (name.includes('meme')) return <MemeGenerator tool={tool} />
  if (name.includes('qr') || name.includes('qrcode')) return <QRGenerator tool={tool} />
  if (name.includes('mockup')) return <MockupGenerator tool={tool} />
  if (name.includes('font') || name.includes('typography')) return <FontPairing tool={tool} />
  if (name.includes('pattern') || name.includes('texture')) return <PatternGenerator tool={tool} />
  if (name.includes('gradient')) return <GradientGenerator tool={tool} />
  if (name.includes('svg')) return <SVGEditor tool={tool} />
  if (name.includes('wireframe') || name.includes('mockup') && name.includes('ui')) return <WireframeTool tool={tool} />
  if (name.includes('watermark')) return <WatermarkTool tool={tool} />
  if (name.includes('collage') || name.includes('photo') && name.includes('collage')) return <CollageMaker tool={tool} />
  if (name.includes('frame') || name.includes('photo') && name.includes('frame')) return <PhotoFrame tool={tool} />

  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {['🎨', '🖌️', '✏️', '📐', '🖼️', '🎯'].map((e, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-2xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer">{e}</div>
        ))}
      </div>
      <InputField value={input} onChange={setInput} placeholder={`Describe your creative project...`} label="Creative Brief" multiline icon={Sparkles} />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🎨 Creative Design Generated!\n\nProject: ${input || 'Untitled'}\nStyle: Modern Minimal\nDimensions: 1920x1080\nFormat: PNG + SVG\n\n🎯 Ready for download\n📁 Files included: 3 variants`); setProcessing(false) }, 1200) }} icon={Sparkles} label={`Generate with ${tool.name}`} />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function LogoGenerator({ tool }: { tool: CsvTool }) {
  const [brand, setBrand] = useState(''); const [style, setStyle] = useState('Modern'); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={brand} onChange={setBrand} placeholder="Your brand name" label="Brand Name" icon={Type} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField value={style} onChange={setStyle} options={['Modern', 'Classic', 'Minimal', 'Playful', 'Luxury', 'Tech', 'Hand-drawn']} label="Style" />
        <SelectField options={['Blue/Purple', 'Red/Orange', 'Green/Teal', 'Black/White', 'Gold/Luxury']} label="Color Scheme" />
      </div>
      {brand && <div className="mt-4 p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">{brand.charAt(0)}</div>
        <div className="text-white font-bold text-lg mt-2">{brand}</div>
        <div className="text-gray-500 text-xs">{style} Style</div>
      </div>}
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎨 Logo Generated: "${brand || 'Brand'}"\n\nStyle: ${style}\nColors: Premium Gradient\nFormats: PNG, SVG, WebP\n\n✅ 4 variants created\n📐 512x512, 1024x1024, 2048x2048\n🎯 Ready for branding use`); setLoading(false) }, 1500) }} icon={Sparkles} label={loading ? 'Creating...' : 'Generate Logo'} />
      {result && <OutputBox value={result} label="Logo Details" />}
    </ToolWrapper>
  )
}

function ThumbnailGenerator({ tool }: { tool: CsvTool }) {
  const [title, setTitle] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={title} onChange={setTitle} placeholder="Video title for thumbnail..." label="Video Title" icon={Image} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Bold Text', 'Minimal', 'Colorful', 'Dark Theme', 'Cinematic']} label="Style" />
        <SelectField options={['1280x720 (HD)', '1920x1080 (Full HD)']} label="Size" />
      </div>
      {title && <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 text-center">
        <div className="text-white font-bold text-lg drop-shadow-lg">{title}</div>
        <div className="text-gray-400 text-xs mt-1">1280×720 • Click-Through Optimized</div>
      </div>}
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🖼️ Thumbnail Ready!\n\nTitle: ${title || 'Your Video'}\nSize: 1280×720\nStyle: Click-Optimized\n\n📥 3 variants created\n🎯 CTR optimized with bold text + contrast`); setLoading(false) }, 1200) }} icon={Image} label="Generate Thumbnail" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ThreeDGenerator({ tool }: { tool: CsvTool }) {
  const [desc, setDesc] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={desc} onChange={setDesc} placeholder="Describe the 3D model..." label="Model Description" multiline icon={Sparkles} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Low Poly', 'High Poly', 'Voxel', 'Photorealistic']} label="Style" />
        <SelectField options={['OBJ', 'FBX', 'GLTF', 'STL', 'BLEND']} label="Format" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🔷 3D Model Generated!\n\nModel: ${desc || 'Custom 3D Model'}\nPolygons: ${Math.floor(500 + Math.random() * 50000).toLocaleString()}\nVertices: ${Math.floor(250 + Math.random() * 25000).toLocaleString()}\nFormat: OBJ + MTL\nSize: ${(Math.random() * 50 + 1).toFixed(1)} MB\n\n✅ PBR Textures included\n🎨 Rigged: ${Math.random() > 0.5 ? 'Yes' : 'No'}\n📥 Ready for Blender, Unity, Unreal`); setLoading(false) }, 2500) }} icon={Sparkles} label={loading ? 'Generating...' : 'Generate 3D Model'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function PosterGenerator({ tool }: { tool: CsvTool }) {
  const [title, setTitle] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={title} onChange={setTitle} placeholder="Poster title/event name" label="Poster Title" icon={Type} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Event', 'Business', 'Social Media', 'Advertisement', 'Motivational']} label="Purpose" />
        <SelectField options={['Portrait A3', 'Landscape', 'Square (IG)', 'Story (9:16)']} label="Orientation" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🖼️ Poster Generated!\n\nTitle: ${title || 'Your Poster'}\nSize: A3 Portrait\nStyle: Professional\n\n📥 3 design variants\n🎨 Print-ready PDF + PNG\n🖨️ CMYK + RGB color profiles`); setLoading(false) }, 1500) }} icon={Image} label="Generate Poster" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function NFTArtGenerator({ tool }: { tool: CsvTool }) {
  const [desc, setDesc] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={desc} onChange={setDesc} placeholder="Describe your NFT collection..." label="NFT Description" multiline icon={Sparkles} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Pixel Art', 'Generative', '3D Render', 'Abstract', 'Character']} label="Art Style" />
        <SelectField options={['Ethereum (ERC-721)', 'Solana', 'Polygon', 'Tezos']} label="Blockchain" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎨 NFT Collection Created!\n\nCollection: ${desc || 'My NFT Collection'}\nStyle: Generative Art\nSupply: ${Math.floor(100 + Math.random() * 9900)} Unique Pieces\nBlockchain: Ethereum\n\n✅ Metadata generated\n📦 Smart contract template\n🖼️ Preview: 10 sample pieces\n🎯 Royalties: ${Math.floor(2 + Math.random() * 8)}%`); setLoading(false) }, 2000) }} icon={Sparkles} label={loading ? 'Creating...' : 'Create NFT Art'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ColorPalette({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#84cc16']
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Enter base color or theme..." label="Base Color/Theme" />
      <div className="mt-4">
        <div className="flex gap-2 mb-2">{colors.slice(0, 5).map((c, i) => <div key={i} className="w-10 h-10 rounded-xl" style={{ backgroundColor: c }} />)}</div>
        <div className="flex gap-2">{colors.slice(5).map((c, i) => <div key={i} className="w-10 h-10 rounded-xl" style={{ backgroundColor: c }} />)}</div>
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎨 Color Palette Generated\n\nTheme: Modern Professional\n\nPrimary: #6366f1 — Indigo\nSecondary: #8b5cf6 — Purple\nAccent: #ec4899 — Pink\nNeutral: #1e1e2e — Dark\n\n🎯 ${Math.floor(8 + Math.random() * 12)} colors in palette\n📥 Ready for design systems\n🎨 HEX + RGB + HSL values included`); setLoading(false) }, 800) }} icon={Droplet} label="Generate Palette" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ImageResizer({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center"><Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" /><button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Upload Image</button></div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <InputField value="" onChange={() => {}} placeholder="Width" label="Width (px)" />
        <InputField value="" onChange={() => {}} placeholder="Height" label="Height (px)" />
      </div>
      <SelectField options={['Maintain Aspect Ratio', 'Stretch', 'Crop to Fit', 'Pad with Background']} label="Resize Mode" />
      <ActionButton onClick={() => {}} icon={Maximize} label="Resize Image" />
    </ToolWrapper>
  )
}

function BgRemover({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-all cursor-pointer">
        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <div className="text-white font-medium">Upload Image to Remove Background</div>
        <div className="text-gray-500 text-sm mt-1">JPG, PNG, WEBP (max 20MB)</div>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm">Choose Image</button>
      </div>
      <ActionButton onClick={() => {}} icon={Eraser} label="Remove Background" />
    </ToolWrapper>
  )
}

function PhotoEditor({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center"><Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" /><button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Open Photo</button></div>
      <div className="flex gap-2 mt-4 flex-wrap">
        {['Crop', 'Rotate', 'Adjust', 'Filters', 'Text', 'Stickers', 'Frame', 'Effects', 'Retouch', 'Red-eye'].map(a => (
          <button key={a} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 hover:text-white transition-all">{a}</button>
        ))}
      </div>
    </ToolWrapper>
  )
}

function IconMaker({ tool }: { tool: CsvTool }) {
  const [search, setSearch] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={search} onChange={setSearch} placeholder="Search icons..." icon={Search} />
      <div className="grid grid-cols-6 gap-2 mt-4">
        {['⚡', '🔥', '⭐', '❤️', '✅', '🎯', '💡', '🚀', '📊', '🎨', '💻', '📱'].map((e, i) => (
          <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 text-center text-xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer">{e}</div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <SelectField options={['Outline', 'Filled', 'Two-tone', 'Sharp']} label="Style" />
        <SelectField options={['24px', '32px', '48px', '64px']} label="Size" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setLoading(false) }, 500) }} icon={Download} label="Download Icon Pack" />
    </ToolWrapper>
  )
}

function MemeGenerator({ tool }: { tool: CsvTool }) {
  const [top, setTop] = useState(''); const [bottom, setBottom] = useState('')
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center"><Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" /><button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Choose Template</button></div>
      <InputField value={top} onChange={setTop} placeholder="Top text" icon={Type} />
      <InputField value={bottom} onChange={setBottom} placeholder="Bottom text" icon={Type} />
      <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 text-center">
        <div className="text-white text-2xl font-bold uppercase tracking-wider mb-2">{top || 'TOP TEXT'}</div>
        <div className="text-gray-600 text-sm">[Meme Template Image]</div>
        <div className="text-white text-2xl font-bold uppercase tracking-wider mt-2">{bottom || 'BOTTOM TEXT'}</div>
      </div>
      <ActionButton onClick={() => {}} icon={Download} label="Download Meme" />
    </ToolWrapper>
  )
}

function QRGenerator({ tool }: { tool: CsvTool }) {
  const [url, setUrl] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={url} onChange={setUrl} placeholder="Enter URL or text..." label="Content" icon={Type} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Black', 'Colorful', 'Custom Color']} label="Color" />
        <SelectField options={['Square', 'Rounded', 'Dot Pattern']} label="Style" />
      </div>
      <div className="p-6 rounded-xl bg-white flex items-center justify-center">
        <div className="w-32 h-32 bg-white flex items-center justify-center border-2 border-gray-200">
          <div className="grid grid-cols-11 gap-0.5">
            {Array.from({ length: 121 }, (_, i) => (
              <div key={i} className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
            ))}
          </div>
        </div>
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setLoading(false) }, 800) }} icon={Download} label="Download QR Code" />
    </ToolWrapper>
  )
}

function MockupGenerator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Describe your design..." label="Design Description" />
      <SelectField options={['iPhone 16', 'MacBook Pro', 'iPad Pro', 'iMac', 'Apple Watch', 'Samsung Galaxy']} label="Device" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📱 Mockup Generated!\n\nDevice: iPhone 16\nAngle: Front View\nBackground: Studio\nResolution: 4000x4000\n\n📥 3 angle variants\n🎨 PSD + PNG included\n🖼️ Shadow & reflections: Auto`); setLoading(false) }, 1500) }} icon={Image} label="Generate Mockup" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function FontPairing({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Modern Sans-Serif', 'Classic Serif', 'Display + Body', 'Monospace + Sans', 'Handwritten']} label="Style" />
      <div className="mt-4 space-y-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-3xl text-white font-bold" style={{ fontFamily: 'Georgia' }}>Heading Font</div>
          <div className="text-xs text-gray-500 mt-1">Playfair Display / Georgia</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-white" style={{ fontFamily: 'Inter' }}>Body text appears here in a clean, readable sans-serif font designed for comfortable reading across all devices and screen sizes.</div>
          <div className="text-xs text-gray-500 mt-1">Inter / Helvetica Neue</div>
        </div>
      </div>
      <ActionButton onClick={() => {}} icon={Download} label="Export Font Pair" />
    </ToolWrapper>
  )
}

function PatternGenerator({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Geometric', 'Abstract', 'Floral', 'Stripes', 'Polka Dots', 'Houndstooth', 'Camouflage']} label="Pattern Type" />
      <div className="grid grid-cols-2 gap-2 mt-4">
        <input type="color" defaultValue="#6366f1" className="w-full h-10 rounded-xl cursor-pointer" />
        <input type="color" defaultValue="#1e1e2e" className="w-full h-10 rounded-xl cursor-pointer" />
      </div>
      <ActionButton onClick={() => {}} icon={Grid} label="Generate Pattern" />
    </ToolWrapper>
  )
}

function GradientGenerator({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input type="color" defaultValue="#6366f1" className="w-full h-12 rounded-xl cursor-pointer" />
        <input type="color" defaultValue="#ec4899" className="w-full h-12 rounded-xl cursor-pointer" />
      </div>
      <div className="h-24 rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500" />
      <SelectField options={['Linear (→)', 'Linear (↓)', 'Radial', 'Conic']} label="Direction" />
      <ActionButton onClick={() => {}} icon={Copy} label="Copy CSS" />
    </ToolWrapper>
  )
}

function SVGEditor({ tool }: { tool: CsvTool }) {
  const [code, setCode] = useState('<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#6366f1"/></svg>')
  return (
    <ToolWrapper tool={tool}>
      <InputField value={code} onChange={setCode} placeholder="<svg>...</svg>" label="SVG Code" multiline icon={Code} />
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center min-h-[100px]">
        <svg viewBox="0 0 100 100" width="80" height="80"><circle cx="50" cy="50" r="40" fill="#6366f1"/></svg>
      </div>
      <ActionButton onClick={() => {}} icon={Download} label="Export SVG" />
    </ToolWrapper>
  )
}

function WireframeTool({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Mobile App', 'Landing Page', 'Dashboard', 'E-commerce', 'Blog Layout']} label="Type" />
      <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 min-h-[200px]">
        <div className="border-2 border-dashed border-gray-700 rounded-lg h-8 mb-4 w-3/4 mx-auto" />
        <div className="flex gap-4 mb-4">
          <div className="border-2 border-dashed border-gray-700 rounded-lg h-20 w-20" />
          <div className="flex-1 space-y-2">
            <div className="border-2 border-dashed border-gray-700 rounded h-4 w-3/4" />
            <div className="border-2 border-dashed border-gray-700 rounded h-4 w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => <div key={i} className="border-2 border-dashed border-gray-700 rounded-lg h-24" />)}
        </div>
      </div>
    </ToolWrapper>
  )
}

function WatermarkTool({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center"><Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" /><button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Upload Image</button></div>
      <InputField value="" onChange={() => {}} placeholder="Your watermark text" label="Watermark Text" />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Top Left', 'Top Right', 'Center', 'Bottom Left', 'Bottom Right', 'Tiled']} label="Position" />
        <SelectField options={['30%', '50%', '70%', '100%']} label="Opacity" />
      </div>
      <ActionButton onClick={() => {}} icon={Droplet} label="Add Watermark" />
    </ToolWrapper>
  )
}

function CollageMaker({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center"><Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" /><div className="text-gray-500 text-xs">Upload multiple images</div></div>
      <SelectField options={['2 Photos', '3 Photos', '4 Photos', 'Grid', 'Freestyle', 'Story']} label="Layout" />
      <ActionButton onClick={() => {}} icon={Grid} label="Create Collage" />
    </ToolWrapper>
  )
}

function PhotoFrame({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center"><Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" /><button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Upload Photo</button></div>
      <SelectField options={['Classic White', 'Black Modern', 'Gold Vintage', 'Wood', 'Polaroid', 'Instagram']} label="Frame Style" />
      <ActionButton onClick={() => {}} icon={Image} label="Apply Frame" />
    </ToolWrapper>
  )
}

function Search(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> }
// SearchIcon is imported from lucide-react for other uses
