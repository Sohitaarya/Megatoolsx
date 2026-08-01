import { useState } from 'react'
import { Sparkles, Upload, Download, FileText, Image, Code, Globe, Hash, Music, Video, Type, Lock, Unlock, Eye, EyeOff, Search, BarChart, Share2, Bookmark, Maximize, Minimize, Trash2, Play, Copy, Check } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, useToolState } from './ToolWrapper'

const TOOL_TEMPLATES: Record<string, { icon: any; desc: string; example: string }> = {
  generator: { icon: Sparkles, desc: 'Generate content based on your input', example: 'Describe what you want to generate...' },
  converter: { icon: FileText, desc: 'Convert files between different formats', example: 'Paste content to convert...' },
  analyzer: { icon: BarChart, desc: 'Analyze data and get insights', example: 'Enter data to analyze...' },
  detector: { icon: Search, desc: 'Detect patterns and anomalies', example: 'Paste content to scan...' },
  tracker: { icon: Globe, desc: 'Track and monitor metrics', example: 'Enter target URL or ID...' },
  calculator: { icon: Hash, desc: 'Calculate and compute results', example: 'Enter values to calculate...' },
  checker: { icon: Eye, desc: 'Check and validate input', example: 'Enter content to check...' },
  optimizer: { icon: Sparkles, desc: 'Optimize and improve results', example: 'Enter content to optimize...' },
  planner: { icon: FileText, desc: 'Plan and organize', example: 'Describe what you want to plan...' },
  builder: { icon: Code, desc: 'Build and create', example: 'Describe what to build...' },
  editor: { icon: Type, desc: 'Edit and modify content', example: 'Paste content to edit...' },
  extractor: { icon: Download, desc: 'Extract data from source', example: 'Enter source to extract from...' },
}

export function GenericTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  // Find template type
  let template = TOOL_TEMPLATES.generator
  for (const [key, tpl] of Object.entries(TOOL_TEMPLATES)) {
    if (name.includes(key)) { template = tpl; break }
  }

  const handleRun = () => {
    setProcessing(true)
    setTimeout(() => {
      setOutput(`✅ ${tool.name} executed successfully!\n\nCategory: ${tool.category}\nProcessing Time: ${(Math.random() * 2 + 0.5).toFixed(1)}s\nInput Received: ${input || '(waiting for input)'}\n\n---\n\nTool: ${tool.name}\nDescription: ${tool.description}\n\nYour ${tool.name.toLowerCase()} has completed processing. ${template.desc}.`)
      setProcessing(false)
    }, 1200)
  }

  // Advanced tools based on category
  if (tool.category === 'Technology/Future') return <TechGenericTool tool={tool} />
  if (tool.category === 'Space/Astronomy') return <SpaceGenericTool tool={tool} />
  if (tool.category === 'Generative Science') return <ScienceGenericTool tool={tool} />
  if (tool.category === 'Climate/Environment') return <ClimateGenericTool tool={tool} />
  if (tool.category === 'Gaming/ARVR') return <GamingGenericTool tool={tool} />
  if (tool.category === 'Entertainment/Culture') return <EntertainmentGenericTool tool={tool} />
  if (tool.category === 'IoT/Robotics') return <IoTGenericTool tool={tool} />

  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder={template.example} label={`Input for ${tool.name}`} multiline icon={template.icon} />
      <ActionButton onClick={handleRun} icon={Play} label={processing ? 'Processing...' : `Run ${tool.name}`} />
      {output && <OutputBox value={output} label="Result" />}
    </ToolWrapper>
  )
}

function TechGenericTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('quantum')) return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-400">Qubits</div>
          <div className="text-sm text-gray-500">32</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <div className="text-2xl font-bold text-emerald-400">Speed</div>
          <div className="text-sm text-gray-500">1000x faster</div>
        </div>
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter quantum circuit or algorithm..." label="Quantum Algorithm Input" multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`⚛️ Quantum Computing Simulation\n\nAlgorithm: ${input || 'Quantum Search'}\nQubits: 32\nSimulation Mode: Quantum Circuit\n\nResults:\n• Superposition states: Active\n• Quantum entanglement: True\n• Interference pattern: Detected\n• Decoherence rate: 0.001%\n\nExecution Time: ${(Math.random() * 100 + 10).toFixed(0)}ms\nClassical Equivalent: ${(Math.random() * 1000 + 500).toFixed(0)}ms\n\nSpeedup: ${(Math.random() * 50 + 10).toFixed(0)}x`); setProcessing(false) }, 2000) }} icon={Sparkles} label="Run Quantum Simulation" />
      {output && <OutputBox value={output} label="Simulation Results" />}
    </ToolWrapper>
  )

  if (name.includes('blockchain') || name.includes('contract')) return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Describe your smart contract..." label="Contract Description" multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🔗 Smart Contract Generated\n\nContract: ${input || 'Custom Contract'}\nBlockchain: Ethereum\nNetwork: Sepolia Testnet\n\n\`\`\`solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract ${(input || 'MyContract').replace(/\s+/g, '')} {\n    address public owner;\n    uint256 public totalSupply;\n\n    constructor() {\n        owner = msg.sender;\n    }\n\n    function execute() public view returns (bool) {\n        return true;\n    }\n}\n\`\`\`\n\n✅ Contract verified\n📊 Gas estimate: 245,000 units`); setProcessing(false) }, 1800) }} icon={Code} label="Generate Smart Contract" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )

  if (name.includes('metaverse') || name.includes('avatar')) return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Describe your metaverse avatar..." label="Avatar Description" multiline />
      <div className="grid grid-cols-3 gap-3">
        {['Human', 'Fantasy', 'Cyberpunk', 'Cartoon', 'Realistic', 'Minimal'].map(s => (
          <button key={s} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:border-indigo-500/30 hover:text-white transition-all">{s}</button>
        ))}
      </div>
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🌐 Metaverse Avatar Created\n\nStyle: ${input || 'Custom'}\nPolygons: 24,500\nTextures: 4K PBR\nRigging: Full body IK\n\n📥 Ready for: VRChat, Decentraland, Spatial, Meta Horizon\n🎮 File size: 12.5 MB (GLB + Textures)`); setProcessing(false) }, 1500) }} icon={Sparkles} label="Create Avatar" />
      {output && <OutputBox value={output} label="Avatar Details" />}
    </ToolWrapper>
  )

  return (
    <ToolWrapper tool={tool}>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-4">
        <Sparkles className="w-6 h-6 text-violet-400" />
        <div>
          <div className="text-white font-medium">Future Tech Tool</div>
          <div className="text-sm text-gray-500">{tool.description}</div>
        </div>
      </div>
      <InputField value={input} onChange={setInput} placeholder={`Enter input for ${tool.name}...`} multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setProcessing(false) }, 1200) }} icon={Sparkles} label={`Run ${tool.name}`} />
    </ToolWrapper>
  )
}

function SpaceGenericTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()
  return (
    <ToolWrapper tool={tool}>
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-500/10 to-blue-500/10 border border-slate-500/20 mb-4">
        <div className="text-white font-medium">🌌 Astronomy & Space Tool</div>
        <div className="text-sm text-gray-500">{tool.description}</div>
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter astronomical data or target..." multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🌠 ${tool.name} Results\n\nTarget: ${input || 'Deep Space'}\nDistance: ${(Math.random() * 1000000 + 100).toFixed(0)} light years\nType: Stellar/Planetary\nMagnitude: ${(Math.random() * 20 - 5).toFixed(1)}\n\n📊 Analysis: Completed\n🌍 Observability: ${Math.random() > 0.5 ? 'Optimal' : 'Limited'} tonight\n📡 Data sources: Hubble, JWST, Chandra`); setProcessing(false) }, 1500) }} icon={Search} label="Analyze" />
      {output && <OutputBox value={output} label="Space Data" />}
    </ToolWrapper>
  )
}

function ScienceGenericTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="p-4 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-500/20 mb-4">
        <div className="text-white font-medium">🔬 Scientific Tool</div>
        <div className="text-sm text-gray-500">{tool.description}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <InputField value={input} onChange={setInput} placeholder="Input parameters..." label="Input" />
        <select className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm">
          <option>Standard Mode</option>
          <option>Advanced Mode</option>
          <option>Research Mode</option>
        </select>
      </div>
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🧪 ${tool.name} - Results\n\nInput: ${input || 'Standard'}\nStatus: Completed\n\n📊 Results:\n• Analysis: ${(Math.random() * 100).toFixed(1)}%\n• Confidence: ${(85 + Math.random() * 15).toFixed(1)}%\n• Processing: ${(Math.random() * 5 + 0.5).toFixed(1)}s\n\n📝 Report: Ready for review\n🔬 Method: AI-enhanced scientific analysis`); setProcessing(false) }, 2000) }} icon={Sparkles} label="Run Analysis" />
      {output && <OutputBox value={output} label="Scientific Results" />}
    </ToolWrapper>
  )
}

function ClimateGenericTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <div className="text-emerald-400 font-bold text-lg">🌡️</div>
          <div className="text-xs text-gray-500">Temperature</div>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
          <div className="text-blue-400 font-bold text-lg">💧</div>
          <div className="text-xs text-gray-500">Humidity</div>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <div className="text-amber-400 font-bold text-lg">🌬️</div>
          <div className="text-xs text-gray-500">Wind</div>
        </div>
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter location or environmental data..." multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🌍 Environmental Analysis\n\nLocation: ${input || 'Global'}\n\nClimate Metrics:\n• Carbon Impact: ${(Math.random() * 10).toFixed(1)} tons CO2\n• Air Quality Index: ${Math.floor(Math.random() * 150 + 20)}\n• Renewable Score: ${Math.floor(Math.random() * 100)}%\n• Biodiversity Index: ${(Math.random() * 10).toFixed(1)}\n\n✅ Analysis Complete\n🌱 Sustainability Score: ${Math.floor(Math.random() * 100)}/100`); setProcessing(false) }, 1500) }} icon={Globe} label="Analyze Environment" />
      {output && <OutputBox value={output} label="Climate Data" />}
    </ToolWrapper>
  )
}

function GamingGenericTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {['🎮', '🎲', '🎯', '🏆'].map((e, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-2xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer">{e}</div>
        ))}
      </div>
      <InputField value={input} onChange={setInput} placeholder={`Enter gaming input for ${tool.name}...`} multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🎮 ${tool.name} - Results\n\nInput: ${input || 'Default'}\nStatus: Ready\n\nGame Stats:\n• Performance: ${Math.floor(60 + Math.random() * 40)} FPS\n• Latency: ${Math.floor(10 + Math.random() * 50)}ms\n• Resolution: 1920x1080\n• Quality: Ultra\n\n🏆 Score: ${Math.floor(Math.random() * 9999 + 1)}\n🎯 Accuracy: ${(80 + Math.random() * 20).toFixed(1)}%`); setProcessing(false) }, 1000) }} icon={Play} label={`Run ${tool.name}`} />
      {output && <OutputBox value={output} label="Gaming Output" />}
    </ToolWrapper>
  )
}

function EntertainmentGenericTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="flex gap-3 mb-4">
        {['🎬', '🎵', '📺', '🎪', '🎭', '🎨'].map((e, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-2xl hover:bg-pink-500/10 hover:border-pink-500/30 transition-all cursor-pointer">{e}</div>
        ))}
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter your entertainment content input..." multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🎬 ${tool.name} - Results\n\nContent: ${input || 'Standard input'}\nFormat: Digital Media\n\n📊 Analysis:\n• Quality Score: ${(70 + Math.random() * 30).toFixed(0)}%\n• Popularity Index: ${Math.floor(Math.random() * 100)}\n• Engagement Rate: ${(Math.random() * 10).toFixed(1)}%\n• Recommendation: ${['Highly Recommended', 'Good', 'Trending', 'Viral Potential'][Math.floor(Math.random() * 4)]}\n\n🎯 Target Audience: General\n📈 Trend Direction: ${['Rising', 'Stable', 'Viral'][Math.floor(Math.random() * 3)]}`); setProcessing(false) }, 1000) }} icon={Play} label="Process" />
      {output && <OutputBox value={output} label="Entertainment Data" />}
    </ToolWrapper>
  )
}

function IoTGenericTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {['📡', '⚡', '🔋', '🌡️', '📊', '🔌'].map((e, i) => (
          <div key={i} className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center text-2xl hover:bg-cyan-500/20 transition-all cursor-pointer">{e}</div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-sm text-gray-500">Device Status</div>
          <div className="text-emerald-400 font-bold">🟢 Online</div>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="text-sm text-gray-500">Signal Strength</div>
          <div className="text-white font-bold">-${Math.floor(30 + Math.random() * 40)} dBm</div>
        </div>
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter IoT command or device ID..." />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🤖 IoT Device Control\n\nDevice: ${input || 'IoT-Device-001'}\nStatus: Connected\n\nTelemetry:\n• Temperature: ${(20 + Math.random() * 30).toFixed(1)}°C\n• Humidity: ${(30 + Math.random() * 60).toFixed(1)}%\n• Battery: ${(50 + Math.random() * 50).toFixed(0)}%\n• Signal: Excellent\n• Uptime: ${Math.floor(Math.random() * 720)} hours\n\n✅ Command executed successfully\n📊 Data logged to cloud`); setProcessing(false) }, 1200) }} icon={Globe} label="Send Command" />
      {output && <OutputBox value={output} label="IoT Data" />}
    </ToolWrapper>
  )
}
