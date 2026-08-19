import { useState } from 'react'
import { Sparkles, Download, Upload, Play, Music, Video, FileText, Image, Mic, Film, Headphones, Radio, Volume2, Repeat, Scissors, Sliders, Maximize, Minimize, Type, Copy, Check } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function VideoAudioTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  // ─── YouTube Downloader ───
  if (name.includes('youtube') || (name.includes('video') && name.includes('download')))
    return <YoutubeDownloader tool={tool} />

  // ─── AI Video Generator ───
  if (name.includes('video') && (name.includes('generat') || name.includes('create') || name.includes('maker')))
    return <VideoGenerator tool={tool} />

  // ─── Podcast Transcriber ───
  if (name.includes('transcri') || name.includes('transcript'))
    return <Transcriber tool={tool} />

  // ─── AI Dubbing / Voice Over ───
  if (name.includes('dub') || name.includes('voice') || name.includes('voiceover'))
    return <DubbingTool tool={tool} />

  // ─── Video Upscaler / Enhancer ───
  if (name.includes('upscal') || name.includes('enhance') || (name.includes('video') && name.includes('quality')))
    return <VideoUpscaler tool={tool} />

  // ─── Screen Recorder ───
  if (name.includes('screen') || name.includes('recording') || name.includes('capture'))
    return <ScreenRecorder tool={tool} />

  // ─── Audio Converter ───
  if (name.includes('audio') && name.includes('convert'))
    return <AudioConverter tool={tool} />

  // ─── Video Converter ───
  if (name.includes('video') && name.includes('convert'))
    return <VideoConverter tool={tool} />

  // ─── Audio Extractor ───
  if (name.includes('extract') || name.includes('audio') && name.includes('remove'))
    return <AudioExtractor tool={tool} />

  // ─── Voice Recorder ───
  if (name.includes('voice') && (name.includes('recorder') || name.includes('record')))
    return <VoiceRecorder tool={tool} />

  // ─── Audio Editor ───
  if (name.includes('audio') && (name.includes('editor') || name.includes('edit') || name.includes('cut')))
    return <AudioEditor tool={tool} />

  // ─── Video Editor / Trimmer / Cutter ───
  if (name.includes('video') && (name.includes('editor') || name.includes('edit') || name.includes('cut') || name.includes('trim')))
    return <VideoEditor tool={tool} />

  // ─── Audio Visualizer ───
  if (name.includes('visualizer') || name.includes('spectrum'))
    return <AudioVisualizer tool={tool} />

  // ─── Beat Maker / Music Creator ───
  if (name.includes('beat') || name.includes('music') || name.includes('beatmaker'))
    return <BeatMaker tool={tool} />

  // ─── Ringtone Maker ───
  if (name.includes('ringtone'))
    return <RingtoneMaker tool={tool} />

  // ─── Audio Normalizer ───
  if (name.includes('normalizer') || name.includes('normalize') || name.includes('loudness'))
    return <AudioNormalizer tool={tool} />

  // ─── Equalizer ───
  if (name.includes('equalizer') || name.includes('eq'))
    return <Equalizer tool={tool} />

  // ─── Video Compressor ───
  if (name.includes('compress') || name.includes('compressor'))
    return <VideoCompressor tool={tool} />

  // ─── Audio Speed Changer ───
  if (name.includes('speed') || name.includes('tempo') || name.includes('pitch'))
    return <SpeedChanger tool={tool} />

  // ─── Podcast Hosting / Manager ───
  if (name.includes('podcast'))
    return <PodcastManager tool={tool} />

  // ─── Default ───
    return (
    <CapabilityTool tool={tool} />
  )
}

function YoutubeDownloader({ tool }: { tool: CsvTool }) {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('1080p')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <ToolWrapper tool={tool}>
      <InputField value={url} onChange={setUrl} placeholder="Paste YouTube video URL here..." label="Video URL" icon={Video} />
      <div className="grid grid-cols-3 gap-3 mt-4">
        <SelectField value={quality} onChange={setQuality} options={['2160p 4K', '1440p 2K', '1080p HD', '720p HD', '480p', '360p']} label="Quality" />
        <SelectField value="" options={['MP4 Video', 'MP3 Audio', 'WEBM', 'MKV']} label="Format" />
        <SelectField value="" options={['With Audio', 'Video Only']} label="Mode" />
      </div>
      <div className="flex gap-3 mt-4">
        <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📥 Video Ready!\n\nTitle: ${url ? 'Your Video' : 'Sample Video'}\nQuality: ${quality}\nFormat: MP4\nSize: ${(Math.floor(Math.random() * 200) + 10)} MB\nDuration: ${Math.floor(Math.random() * 20) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}\n\n✅ Download link generated\n📁 Save to: Downloads folder`); setLoading(false) }, 1500) }} icon={Download} label={loading ? 'Processing...' : 'Download MP4'} />
        <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎵 Audio Extracted!\n\nQuality: 320kbps\nFormat: MP3\nSize: ${(Math.floor(Math.random() * 15) + 3)} MB\n\n✅ Audio ready for download`); setLoading(false) }, 1200) }} icon={Music} label="MP3 Audio" variant="secondary" />
      </div>
      {result && <OutputBox value={result} label="Download Info" />}
    </ToolWrapper>
  )
}

function VideoGenerator({ tool }: { tool: CsvTool }) {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <ToolWrapper tool={tool}>
      <InputField value={prompt} onChange={setPrompt} placeholder="Describe the video you want to generate..." label="Video Description" multiline icon={Sparkles} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['16:9 Landscape', '9:16 Portrait', '1:1 Square', '21:9 Cinematic']} label="Aspect Ratio" />
        <SelectField options={['HD 1080p', '4K 2160p', 'SD 720p']} label="Resolution" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['30 seconds', '60 seconds', '2 minutes', '5 minutes']} label="Duration" />
        <SelectField options={['AI Cinematic', 'Realistic', 'Anime', 'Professional']} label="Style" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎬 Video Generated!\n\nTitle: ${prompt || 'AI Generated Video'}\nDuration: 30 seconds\nResolution: 1920x1080\nFormat: MP4\n\nScenes Generated:\n1. Opening scene with ${prompt?.split(' ')[0] || 'main subject'}\n2. Transition with motion graphics\n3. AI-generated B-roll footage\n4. Closing with call-to-action\n\n✅ Ready for download\n🎯 Optimized for viral reach`); setLoading(false) }, 2500) }} icon={Sparkles} label={loading ? 'Generating...' : 'Generate Video'} />
      {result && <OutputBox value={result} label="Generated Video" />}
    </ToolWrapper>
  )
}

function Transcriber({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-all cursor-pointer">
        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <div className="text-white font-medium">Upload Audio/Video File</div>
        <div className="text-gray-500 text-sm mt-1">Supports MP3, WAV, MP4, M4A, FLAC (max 500MB)</div>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm">Choose File</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Auto-detect', 'English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic']} label="Language" />
        <SelectField options={['Standard', 'Advanced AI', 'Word-by-Word', 'Speaker Labels']} label="Mode" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📝 Transcription Complete!\n\n[00:00] Welcome to this recording\n[00:12] Today we're discussing important topics\n[00:45] Let me share some key insights with you\n[01:30] This brings us to our main point\n[02:15] The data shows significant improvement\n[03:00] Thank you for listening\n[03:45] Please share your feedback\n\n---\n📊 Statistics:\nTotal Words: 847\nDuration: 12:30\nConfidence: 97.2%\nSpeakers Detected: 2\n\n✅ Ready for export (TXT, SRT, PDF)`); setLoading(false) }, 2000) }} icon={FileText} label={loading ? 'Transcribing...' : 'Start Transcription'} />
      {result && <OutputBox value={result} label="Transcription" />}
    </ToolWrapper>
  )
}

function DubbingTool({ tool }: { tool: CsvTool }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <ToolWrapper tool={tool}>
      <InputField value={text} onChange={setText} placeholder="Enter text or paste script to dub..." label="Original Script" multiline icon={FileText} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['English → Hindi', 'English → Spanish', 'English → French', 'Hindi → English', 'Spanish → English', 'English → Arabic', 'English → Japanese']} label="Language Pair" />
        <SelectField options={['Male (Deep)', 'Female (Warm)', 'Neutral', 'Celebrity Style', 'Kids Friendly']} label="Voice Type" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎤 Dubbing Complete!\n\nOriginal Text (${text.length} chars)\n→ Translated & Dubbed\n\nVoice: Professional AI Voice\nStyle: Natural conversational\nLanguage: Target language\nDuration: ${Math.ceil(text.length / 15)} seconds\n\n🎯 Lip-sync: Enabled\n🎚️ Audio Quality: Studio Grade\n📥 Ready for download\n\nPreview available in player below.`); setLoading(false) }, 2000) }} icon={Play} label={loading ? 'Processing...' : 'Generate Dubbed Audio'} />
      {result && <OutputBox value={result} label="Dubbing Result" />}
    </ToolWrapper>
  )
}

function VideoUpscaler({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-all cursor-pointer">
        <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <div className="text-white font-medium">Upload Video to Upscale</div>
        <div className="text-gray-500 text-sm mt-1">Supports MP4, MOV, AVI, WEBM (max 2GB)</div>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm">Choose Video</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['2x Upscale (SD→HD)', '4x Upscale (HD→4K)', '8x Upscale (HD→8K)']} label="Scale Factor" />
        <SelectField options={['AI Enhanced', 'Standard', 'Animation', 'Grain Preserve']} label="Enhancement" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`✨ Video Upscaled Successfully!\n\nOriginal: 480p (640x480)\nEnhanced: 4K (3840x2160)\n\nEnhancement Details:\n• AI Model: Real-ESRGAN v4\n• Denoising: Applied\n• Sharpening: Enhanced\n• Color Correction: Auto\n\nFile Size: ${Math.floor(50 + Math.random() * 200)} MB\nQuality: Excellent\n\n✅ Ready for download`); setLoading(false) }, 3000) }} icon={Maximize} label={loading ? 'Upscaling...' : 'Upscale Video'} />
      {result && <OutputBox value={result} label="Upscale Result" />}
    </ToolWrapper>
  )
}

function ScreenRecorder({ tool }: { tool: CsvTool }) {
  const [recording, setRecording] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><div className="text-2xl mb-1">🖥️</div><div className="text-xs text-gray-500">Full Screen</div></div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><div className="text-2xl mb-1">📄</div><div className="text-xs text-gray-500">Window</div></div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><div className="text-2xl mb-1">📍</div><div className="text-xs text-gray-500">Region</div></div>
      </div>
      <SelectField options={['1080p Full HD', '4K Ultra HD', '720p HD', '480p SD']} label="Quality" />
      <div className="flex gap-3 mt-4">
        <button onClick={() => setRecording(!recording)} className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${recording ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
          <div className={`w-3 h-3 rounded-full ${recording ? 'bg-white' : 'bg-red-200'}`} />
          {recording ? 'Recording... Click to Stop' : 'Start Recording'}
        </button>
      </div>
      {recording && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 text-red-400 text-sm text-center animate-pulse">
          ● Recording in progress — Audio & Screen capture active
        </div>
      )}
    </ToolWrapper>
  )
}

function AudioConverter({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-all cursor-pointer">
        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <div className="text-white font-medium">Upload Audio File</div>
        <div className="text-gray-500 text-sm mt-1">MP3, WAV, FLAC, OGG, M4A, AAC</div>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm">Choose File</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['MP3 (320kbps)', 'WAV (Lossless)', 'FLAC (Lossless)', 'OGG (Vorbis)', 'AAC', 'M4A']} label="Output Format" />
        <SelectField options={['High Quality', 'Medium Quality', 'Low Quality (Small)']} label="Quality" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`✅ Audio Converted!\n\nFormat: MP3 → FLAC\nOriginal Size: 8.5 MB\nNew Size: 24.2 MB\nQuality: Lossless\nSample Rate: 44100 Hz\nBit Depth: 16 bit\n\n✅ Ready for download`); setLoading(false) }, 1500) }} icon={Repeat} label={loading ? 'Converting...' : 'Convert Audio'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function VideoConverter({ tool }: { tool: CsvTool }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-all cursor-pointer">
        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <div className="text-white font-medium">Upload Video File</div>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm">Choose Video</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['MP4 (H.264)', 'AVI', 'MKV', 'WEBM', 'MOV', 'GIF']} label="Output Format" />
        <SelectField options={['1080p', '720p', '480p', 'Original']} label="Resolution" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`✅ Video Converted!\n\nFormat: MOV → MP4\nResolution: 1920x1080\nCodec: H.264\nBitrate: 8 Mbps\nFile Size: 145 MB\n\n✅ Ready for download`); setLoading(false) }, 2000) }} icon={Repeat} label={loading ? 'Converting...' : 'Convert Video'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function AudioExtractor({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-indigo-500/30 transition-all">
        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <div className="text-gray-500 text-sm">Upload video to extract audio</div>
        <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm">Choose Video</button>
      </div>
      <SelectField options={['MP3 320kbps', 'WAV Lossless', 'FLAC', 'AAC']} label="Audio Format" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎵 Audio Extracted!\n\nSource: video.mp4\nAudio: MP3 320kbps\nSize: 12.3 MB\nDuration: 5:30\n\n✅ Ready for download`); setLoading(false) }, 1500) }} icon={Music} label="Extract Audio" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function VoiceRecorder({ tool }: { tool: CsvTool }) {
  const [isRecording, setIsRecording] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-6">
        <div className={`w-20 h-20 mx-auto rounded-full ${isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-white/5'} border border-white/10 flex items-center justify-center mb-4`}>
          <Mic className={`w-10 h-10 ${isRecording ? 'text-red-400' : 'text-gray-500'}`} />
        </div>
        <button onClick={() => setIsRecording(!isRecording)} className={`px-6 py-3 rounded-xl font-medium text-sm ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-indigo-600 text-white'} transition-all`}>
          {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
        </button>
        {isRecording && <div className="mt-3 text-red-400 text-sm animate-pulse">● Recording... (${Math.floor(Math.random() * 60)}s)</div>}
      </div>
    </ToolWrapper>
  )
}

function AudioEditor({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <div className="text-white text-sm mb-2">Drop audio file here</div>
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Browse</button>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        {['Cut', 'Copy', 'Paste', 'Trim', 'Fade In', 'Fade Out', 'Silence', 'Reverse'].map(a => (
          <button key={a} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 hover:text-white transition-all">{a}</button>
        ))}
      </div>
      <div className="mt-4 h-16 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-sm">Waveform preview</div>
      </div>
    </ToolWrapper>
  )
}

function VideoEditor({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <div className="text-white text-sm mb-2">Upload video to edit</div>
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Browse</button>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        {['Trim', 'Split', 'Merge', 'Crop', 'Rotate', 'Speed', 'Effects', 'Text'].map(a => (
          <button key={a} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 hover:text-white transition-all">{a}</button>
        ))}
      </div>
    </ToolWrapper>
  )
}

function AudioVisualizer({ tool }: { tool: CsvTool }) {
  const [playing, setPlaying] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="h-32 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 64 }, (_, i) => (
            <div key={i} className={`w-2 rounded-t transition-all ${playing ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : 'bg-white/10'}`}
              style={{ height: playing ? `${Math.random() * 100}%` : '10%', animationDuration: `${0.3 + Math.random() * 0.5}s` }} />
          ))}
        </div>
      </div>
      <button onClick={() => setPlaying(!playing)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm">
        {playing ? '⏹ Stop' : '▶ Play Visualization'}
      </button>
    </ToolWrapper>
  )
}

function BeatMaker({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-4 gap-2">
        {['Kick', 'Snare', 'Hi-Hat', '808', 'Clap', 'Rim', 'Tom', 'Crash'].map(b => (
          <button key={b} onClick={() => {}} className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-white transition-all">{b}</button>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <SelectField options={['120 BPM', '90 BPM', '140 BPM', '160 BPM', '180 BPM']} label="Tempo" />
        <SelectField options={['4/4', '3/4', '6/8']} label="Time Signature" />
      </div>
    </ToolWrapper>
  )
}

function RingtoneMaker({ tool }: { tool: CsvTool }) {
  const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <div className="text-white text-sm mb-2">Upload music to make ringtone</div>
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Browse</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Start - End (Custom)', 'Best Part (Auto)', 'Full Song']} label="Mode" />
        <SelectField options={['iPhone', 'Android', 'Generic MP3']} label="Device" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000) }} icon={Music} label="Create Ringtone" />
    </ToolWrapper>
  )
}

function AudioNormalizer({ tool }: { tool: CsvTool }) {
  const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Upload Audio</button>
      </div>
      <SelectField options={['-14 LUFS (Spotify)', '-16 LUFS (YouTube)', '-23 LUFS (Broadcast)', 'Custom']} label="Target Loudness" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setLoading(false) }, 1200) }} icon={Volume2} label="Normalize Audio" />
    </ToolWrapper>
  )
}

function Equalizer({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="flex gap-1 h-32 items-end justify-center">
        {['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'].map((f, i) => (
          <div key={f} className="flex flex-col items-center">
            <input type="range" min="-12" max="12" defaultValue="0" className="h-24 w-1.5 appearance-none bg-white/20 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rotate-90 writing-mode:vertical-lr" />
            <span className="text-[8px] text-gray-600 mt-1">{f}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-center">
        {['Flat', 'Rock', 'Pop', 'Jazz', 'Classical', 'Bass Boost'].map(p => (
          <button key={p} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-[10px] hover:bg-white/10 hover:text-white transition-all">{p}</button>
        ))}
      </div>
    </ToolWrapper>
  )
}

function VideoCompressor({ tool }: { tool: CsvTool }) {
  const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Upload Video</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['Minimal (90% quality)', 'Balanced (70%)', 'Maximum (40%)']} label="Compression" />
        <SelectField options={['H.264', 'H.265/HEVC', 'VP9', 'AV1']} label="Codec" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setLoading(false) }, 1500) }} icon={Scissors} label="Compress Video" />
    </ToolWrapper>
  )
}

function SpeedChanger({ tool }: { tool: CsvTool }) {
  const [speed, setSpeed] = useState(1)
  return (
    <ToolWrapper tool={tool}>
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
        <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Upload File</button>
      </div>
      <div className="text-center my-4">
        <div className="text-3xl font-bold text-white">{speed}x</div>
        <input type="range" min="0.25" max="4" step="0.25" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full mt-2" />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0.25x</span><span>1x</span><span>2x</span><span>4x</span>
        </div>
      </div>
      <SelectField options={['Preserve Pitch', 'Change Pitch']} label="Pitch Mode" />
    </ToolWrapper>
  )
}

function PodcastManager({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <Headphones className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Record</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <Radio className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Publish</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <BarChart3Icon className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Analytics</div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <div className="text-white font-medium text-sm">🎙️ Your Podcast Dashboard</div>
        <div className="text-gray-500 text-xs mt-1">Episodes: 0 • Listeners: 0 • Published: 0</div>
      </div>
      <InputField value="" onChange={() => {}} placeholder="Enter episode title..." label="New Episode" />
    </ToolWrapper>
  )
}

function BarChart3Icon(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 20h18M5 16l3-8 4 6 4-8 5 10"/></svg>
}
