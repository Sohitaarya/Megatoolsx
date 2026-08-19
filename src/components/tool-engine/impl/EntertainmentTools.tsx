import { useState } from 'react'
import { Film, Music, Play, Star, Heart, ThumbsUp, Share2, Sparkles, BookOpen, Gamepad2, Clock, Radio, Globe, TrendingUp, Video } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function EntertainmentTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('movie') || name.includes('film') || name.includes('show') || name.includes('tv')) return <MovieTool tool={tool} />
  if (name.includes('music') || name.includes('song') || name.includes('playlist') || name.includes('audio')) return <MusicTool tool={tool} />
  if (name.includes('game') || name.includes('gaming') || name.includes('play')) return <GamingTool tool={tool} />
  if (name.includes('book') || name.includes('novel') || name.includes('read')) return <BookTool tool={tool} />
  if (name.includes('ticket') || name.includes('event') || name.includes('concert')) return <EventFinder tool={tool} />
  if (name.includes('stream') || name.includes('watcher') || name.includes('media')) return <StreamingTool tool={tool} />
  if (name.includes('photo') || name.includes('photography') || name.includes('camera')) return <PhotographyTool tool={tool} />
  if (name.includes('podcast') || name.includes('radio')) return <PodcastTool tool={tool} />
  if (name.includes('dance') || name.includes('choreo')) return <DanceTool tool={tool} />
  if (name.includes('karaoke') || name.includes('sing')) return <KaraokeTool tool={tool} />

  return (
    <CapabilityTool tool={tool} />
  )
}

function MovieTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Search movies..." label="Movie Search" icon={Film} />
      <SelectField options={['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Documentary']} label="Genre" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎬 Movie Recommendations\n\nFound: ${Math.floor(20 + Math.random() * 80)} movies\n\nTop Picks:\n\n1. ⭐ ${['The Last Horizon (2026)', 'Digital Dreams (2026)', 'Echoes of Time (2025)', 'Quantum Shift (2026)'][Math.floor(Math.random() * 4)]}\n   Rating: ${(7 + Math.random() * 3).toFixed(1)}/10 • ${Math.floor(120 + Math.random() * 30)} min\n\n2. ⭐ ${['City Lights (2025)', 'Mountain Echo (2026)', 'Starlight Express (2025)', 'Urban Legends (2026)'][Math.floor(Math.random() * 4)]}\n   Rating: ${(7 + Math.random() * 3).toFixed(1)}/10 • ${Math.floor(100 + Math.random() * 40)} min\n\n3. ⭐ ${['The Final Chapter (2026)', 'Neon Nights (2025)', 'Timeless (2026)', 'Beyond (2025)'][Math.floor(Math.random() * 4)]}\n   Rating: ${(7 + Math.random() * 3).toFixed(1)}/10 • ${Math.floor(110 + Math.random() * 30)} min\n\n🎯 Match: ${(80 + Math.random() * 20).toFixed(0)}%\n📺 Where to watch: ${['Netflix', 'Prime Video', 'Disney+', 'HBO Max'][Math.floor(Math.random() * 4)]}`); setLoading(false) }, 1000) }} icon={Film} label={loading ? 'Searching...' : 'Browse Movies'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function MusicTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Search songs, artist..." label="Music Search" icon={Music} />
      <SelectField options={['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Classical', 'Jazz', 'R&B', 'Country']} label="Genre" />
      <div className="grid grid-cols-4 gap-2 mt-4">
        {['🎵', '🎶', '🎤', '🎧'].map((e, i) => <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-2xl hover:bg-indigo-500/10 transition-all cursor-pointer">{e}</div>)}
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎵 Music Explorer\n\nTrending: ${['Pop Hits 2026', 'Electronic Vibes', 'Acoustic Sessions'][Math.floor(Math.random() * 3)]}\n\nPlaylist Stats:\n• Songs: ${Math.floor(20 + Math.random() * 30)}\n• Duration: ${Math.floor(60 + Math.random() * 60)} min\n• Followers: ${Math.floor(1000 + Math.random() * 999000).toLocaleString()}\n\nTop Tracks:\n1. 🎵 Track One (${(3 + Math.random() * 3).toFixed(1)} min)\n2. 🎵 Track Two (${(3 + Math.random() * 3).toFixed(1)} min)\n3. 🎵 Track Three (${(3 + Math.random() * 3).toFixed(1)} min)\n\n🎧 Genre: ${['Pop', 'Electronic', 'Alternative'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 1000) }} icon={Music} label="Explore Music" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function GamingTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {['🎮', '🎲', '🎯', '🏆'].map((e, i) => <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-2xl hover:bg-amber-500/10 transition-all">{e}</div>)}
      </div>
      <SelectField options={['Action', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Puzzle', 'Adventure']} label="Genre" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎮 Gaming Hub\n\nHot Games Right Now:\n\n1. 🏆 CyberQuest 2026\n   Rating: ${(8 + Math.random() * 2).toFixed(1)}/10 • Open World RPG\n\n2. 🏆 Battle Arena X\n   Rating: ${(8 + Math.random() * 2).toFixed(1)}/10 • Multiplayer FPS\n\n3. 🏆 Kingdom Builders\n   Rating: ${(8 + Math.random() * 2).toFixed(1)}/10 • Strategy Sim\n\n4. 🏆 Speed Racer Pro\n   Rating: ${(8 + Math.random() * 2).toFixed(1)}/10 • Racing\n\n📊 Your Stats:\n🏅 Games Played: ${Math.floor(10 + Math.random() * 100)}\n⭐ Achievements: ${Math.floor(50 + Math.random() * 500)}\n⏱️ Playtime: ${Math.floor(50 + Math.random() * 500)} hours`); setLoading(false) }, 1000) }} icon={Gamepad2} label="Discover Games" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function BookTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Search books..." label="Book Search" icon={BookOpen} />
      <SelectField options={['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 'Biography', 'Self-Help', 'Romance']} label="Genre" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📚 Book Recommendations\n\nFound: ${Math.floor(50 + Math.random() * 200)} books\n\nTop Picks:\n\n1. 📖 "The Art of Tomorrow" — ${['John Smith', 'Sarah Lee', 'Alex Chen'][Math.floor(Math.random() * 3)]}\n   ⭐ ${(7 + Math.random() * 3).toFixed(1)}/10 • ${Math.floor(200 + Math.random() * 200)} pages\n\n2. 📖 "Digital Horizons" — ${['Emily Park', 'David Brown', 'Lisa Wang'][Math.floor(Math.random() * 3)]}\n   ⭐ ${(7 + Math.random() * 3).toFixed(1)}/10 • ${Math.floor(250 + Math.random() * 150)} pages\n\n3. 📖 "The Last Chapter" — ${['Michael Scott', 'Anna James', 'Tom Lee'][Math.floor(Math.random() * 3)]}\n   ⭐ ${(7 + Math.random() * 3).toFixed(1)}/10 • ${Math.floor(180 + Math.random() * 200)} pages\n\n📚 Reading Stats:\n• Books Read: ${Math.floor(5 + Math.random() * 50)}\n• Pages Read: ${Math.floor(1000 + Math.random() * 10000).toLocaleString()}\n• Reading Streak: ${Math.floor(1 + Math.random() * 30)} days`); setLoading(false) }, 1000) }} icon={BookOpen} label="Browse Books" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function EventFinder({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="City or location" label="Location" />
      <SelectField options={['Concerts', 'Sports', 'Theatre', 'Comedy', 'Festivals', 'Exhibitions']} label="Category" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎪 Events Near You\n\nFound: ${Math.floor(10 + Math.random() * 30)} events\n\nUpcoming:\n\n1. 🎵 ${['Summer Music Fest', 'Rock Concert', 'Jazz Night'][Math.floor(Math.random() * 3)]}\n   📍 Venue • ${new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toLocaleDateString()}\n   🎫 From $${Math.floor(25 + Math.random() * 100)}\n\n2. 🎭 ${['Comedy Show', 'Broadway Play', 'Dance Performance'][Math.floor(Math.random() * 3)]}\n   📍 Theater • ${new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toLocaleDateString()}\n   🎫 From $${Math.floor(30 + Math.random() * 80)}\n\n3. 🏆 ${['Basketball Game', 'Football Match', 'Tennis Open'][Math.floor(Math.random() * 3)]}\n   📍 Stadium • ${new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toLocaleDateString()}\n   🎫 From $${Math.floor(15 + Math.random() * 150)}`); setLoading(false) }, 1000) }} icon={Calendar} label="Find Events" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function StreamingTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Search content..." label="Search" icon={Video} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📺 Streaming Guide\n\nTrending Now:\n\n1. 🔥 ${['The Crown S6', 'Stranger Things 5', 'House of Dragons'][Math.floor(Math.random() * 3)]}\n   ${['Netflix', 'Prime Video', 'Disney+', 'HBO'][Math.floor(Math.random() * 4)]} • ${(8 + Math.random() * 2).toFixed(1)}/10\n\n2. 🔥 ${['The Last of Us', 'Wednesday S2', 'The Bear S3'][Math.floor(Math.random() * 3)]}\n   ${['Netflix', 'Prime Video', 'Disney+', 'HBO'][Math.floor(Math.random() * 4)]} • ${(8 + Math.random() * 2).toFixed(1)}/10\n\n3. 🔥 ${['Squid Game S2', 'Bridgerton S4', 'The Witcher S4'][Math.floor(Math.random() * 3)]}\n   ${['Netflix', 'Prime Video', 'Disney+', 'HBO'][Math.floor(Math.random() * 4)]} • ${(8 + Math.random() * 2).toFixed(1)}/10\n\n📊 Total: ${Math.floor(100 + Math.random() * 900)} shows available\n🎯 Personalized picks ready`); setLoading(false) }, 1000) }} icon={Tv} label="Browse Streaming" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function PhotographyTool({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {['📷', '📸', '🎥'].map((e, i) => <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-3xl hover:bg-indigo-500/10 transition-all cursor-pointer">{e}</div>)}
      </div>
      <SelectField options={['Portrait', 'Landscape', 'Street', 'Macro', 'Night', 'Wildlife']} label="Genre" />
      <SelectField options={['Beginner', 'Intermediate', 'Advanced', 'Professional']} label="Level" />
      <ActionButton onClick={() => {}} icon={Camera} label="Get Photography Tips" />
    </ToolWrapper>
  )
}

function PodcastTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Technology', 'Business', 'True Crime', 'Comedy', 'Science', 'Education', 'Health']} label="Category" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎙️ Podcast Discovery\n\nTop Episodes:\n\n1. 🎧 "The Future of AI"\n   Tech Weekly • ${Math.floor(30 + Math.random() * 30)} min • ★${(8 + Math.random() * 2).toFixed(1)}\n\n2. 🎧 "Success Stories"\n   Business Hour • ${Math.floor(30 + Math.random() * 30)} min • ★${(8 + Math.random() * 2).toFixed(1)}\n\n3. 🎧 "The Mystery Files"\n   True Crime • ${Math.floor(30 + Math.random() * 30)} min • ★${(8 + Math.random() * 2).toFixed(1)}\n\n📊 ${Math.floor(1000 + Math.random() * 99000).toLocaleString()} episodes available\n⏱️ Listen time: ${Math.floor(10 + Math.random() * 200)} hours\n🎯 Recommendations ready`); setLoading(false) }, 1000) }} icon={Headphones} label="Discover Podcasts" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function DanceTool({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {['💃', '🕺', '🩰', '🔥'].map((e, i) => <div key={i} className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center text-2xl hover:bg-pink-500/20 cursor-pointer">{e}</div>)}
      </div>
      <SelectField options={['Hip Hop', 'Contemporary', 'Ballet', 'Salsa', 'Breakdance', 'Jazz', 'Tap']} label="Style" />
      <SelectField options={['Beginner', 'Intermediate', 'Advanced']} label="Level" />
      <ActionButton onClick={() => {}} icon={Music} label="Learn Dance Moves" />
    </ToolWrapper>
  )
}

function KaraokeTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-2">
          <Music className="w-8 h-8 text-purple-400" />
        </div>
        <div className="text-white font-medium">🎤 Karaoke</div>
      </div>
      <SelectField options={['Pop', 'Rock', 'Bollywood', 'Classic Hits', 'K-Pop', 'Latin']} label="Genre" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎤 Karaoke Songs Found: ${Math.floor(20 + Math.random() * 80)}\n\nTop Picks:\n1. "Song Title 1" — Artist\n2. "Song Title 2" — Artist\n3. "Song Title 3" — Artist\n4. "Song Title 4" — Artist\n\n🎯 Difficulty: ${['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]}\n🎵 Tempo: ${Math.floor(80 + Math.random() * 60)} BPM`); setLoading(false) }, 800) }} icon={Microphone} label="Find Songs" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function Calendar(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function Microphone(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> }
function Tv(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg> }
function Camera(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> }
function Headphones(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg> }
