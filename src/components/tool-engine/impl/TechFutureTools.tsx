import { useState } from 'react'
import { Sparkles, Cpu, Globe, Code, Shield, Zap, Box, Server, Cloud, Bot, Radio, Satellite, Wifi, Microscope } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function TechFutureTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('quantum')) return <QuantumTool tool={tool} />
  if (name.includes('blockchain') || name.includes('contract')) return <BlockchainTool tool={tool} />
  if (name.includes('metaverse') || name.includes('avatar') || name.includes('vr')) return <MetaverseTool tool={tool} />
  if (name.includes('robot') || name.includes('automation')) return <RobotTool tool={tool} />
  if (name.includes('neural') || name.includes('brain') || name.includes('mind')) return <NeuralTool tool={tool} />
  if (name.includes('hologram') || name.includes('holo')) return <HologramTool tool={tool} />
  if (name.includes('nanotech') || name.includes('nano')) return <NanoTool tool={tool} />
  if (name.includes('drone') || name.includes('uav')) return <DroneTool tool={tool} />
  if (name.includes('gene') || name.includes('dna') || name.includes('genetic')) return <GeneTool tool={tool} />
  if (name.includes('fusion') || name.includes('nuclear')) return <FusionTool tool={tool} />
  if (name.includes('solar') || name.includes('renewable')) return <RenewableTool tool={tool} />
  if (name.includes('cyber') || name.includes('security')) return <CyberTool tool={tool} />

  return (
    <CapabilityTool tool={tool} />
  )
}

function QuantumTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-center"><div className="text-2xl font-bold text-purple-400">32</div><div className="text-xs text-gray-500">Qubits</div></div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center"><div className="text-2xl font-bold text-emerald-400">1000x</div><div className="text-xs text-gray-500">Speedup</div></div>
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter quantum circuit or algorithm..." label="Quantum Input" multiline icon={Infinity} />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`⚛️ Quantum Computing Simulation\n\nAlgorithm: ${input || 'Shor\'s Algorithm'}\nQubits: 32\nSimulation Mode: Quantum Circuit\n\nResults:\n• Superposition states: Active\n• Quantum entanglement: True\n• Interference pattern: Detected\n• Decoherence rate: 0.001%\n\nExecution Time: ${(Math.random() * 100 + 10).toFixed(0)}ms\nClassical Equivalent: ${(Math.random() * 1000 + 500).toFixed(0)}ms\nSpeedup: ${(Math.random() * 50 + 10).toFixed(0)}x`); setProcessing(false) }, 2000) }} icon={Infinity} label="Run Quantum Simulation" />
      {output && <OutputBox value={output} label="Simulation Results" />}
    </ToolWrapper>
  )
}

function BlockchainTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Describe your smart contract..." label="Contract Description" multiline icon={Code} />
      <SelectField options={['Ethereum', 'Solana', 'Polygon', 'Arbitrum', 'Avalanche']} label="Blockchain" />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🔗 Smart Contract Generated\n\nContract: ${input || 'Custom Contract'}\nBlockchain: Ethereum\nNetwork: Sepolia Testnet\n\npragma solidity ^0.8.19;\ncontract ${(input || 'MyContract').replace(/\s+/g, '')} {\n    address public owner;\n    constructor() {\n        owner = msg.sender;\n    }\n}\n\n✅ Contract verified\n📊 Gas estimate: 245,000 units`); setProcessing(false) }, 1800) }} icon={Code} label="Generate Smart Contract" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function MetaverseTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Describe your metaverse avatar..." label="Avatar Description" multiline />
      <div className="grid grid-cols-3 gap-2 mt-4">
        {['Human', 'Fantasy', 'Cyberpunk', 'Cartoon', 'Realistic', 'Minimal'].map(s => (
          <button key={s} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:border-indigo-500/30 transition-all">{s}</button>
        ))}
      </div>
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🌐 Metaverse Avatar Created\n\nStyle: ${input || 'Custom'}\nPolygons: 24,500\nTextures: 4K PBR\nRigging: Full body IK\n\n📥 Ready for: VRChat, Decentraland, Meta Horizon\n🎮 File size: 12.5 MB`); setProcessing(false) }, 1500) }} icon={Globe} label="Create Avatar" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function RobotTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {['🦾', '⚡', '🔋'].map((e, i) => <div key={i} className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center text-3xl">{e}</div>)}
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter robot command or sequence..." label="Robot Command" multiline icon={Bot} />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🤖 Robot Control\n\nCommand Received: ${input || 'STANDARD_SEQUENCE'}\nMotor Status: ✅ All systems online\nBattery: 85%\n\nExecuting Movement Sequence:\n1. Forward 10cm ✓\n2. Rotate 90° ✓\n3. Sensor scan ✓\n4. Object detected (${(Math.random() * 10).toFixed(1)}m)\n5. Return to origin ✓\n\n🗺️ Environment mapped: ${(Math.random() * 100).toFixed(1)}%\n✅ Sequence complete`); setProcessing(false) }, 1000) }} icon={Bot} label="Send Command" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function NeuralTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Describe neural network task..." label="Network Description" multiline icon={Brain} />
      <SelectField options={['Image Recognition', 'NLP', 'Time Series', 'Reinforcement Learning', 'GAN']} label="Architecture" />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🧠 Neural Network Analysis\n\nArchitecture: Deep Neural Network\nLayers: ${Math.floor(5 + Math.random() * 30)}\nParameters: ${(Math.random() * 100 + 1).toFixed(1)}M\n\nTraining Results:\n• Accuracy: ${(85 + Math.random() * 14).toFixed(1)}%\n• Loss: ${(Math.random() * 0.5).toFixed(3)}\n• Epochs: ${Math.floor(10 + Math.random() * 90)}\n\n📊 Model Size: ${(Math.random() * 500).toFixed(0)}MB\n⚡ Inference: ${(Math.random() * 50 + 1).toFixed(1)}ms`); setProcessing(false) }, 1500) }} icon={Brain} label="Run Neural Network" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function HologramTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
        <div className="text-6xl mb-2">🌐</div>
        <div className="text-indigo-400 font-medium">Holographic Projection Ready</div>
      </div>
      <InputField value={input} onChange={setInput} placeholder="Describe hologram content..." label="Hologram Content" multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🪄 Hologram Generated!\n\nContent: ${input || '3D Display'}\nResolution: 8K\nFormat: Volumetric\n\nDepth: Full 3D\nInteraction: Gesture-enabled\nViewing Angle: 360°\n\n📊 Quality: ${(85 + Math.random() * 15).toFixed(0)}%`); setProcessing(false) }, 1000) }} icon={Globe} label="Generate Hologram" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function NanoTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Describe nanostructure..." label="Design Description" multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🧬 Nanotechnology Design\n\nDesign: ${input || 'Molecular Structure'}\nScale: ${(Math.random() * 100).toFixed(1)} nm\nMaterial: ${['Carbon', 'Gold', 'Silicon', 'Graphene'][Math.floor(Math.random() * 4)]}\n\nProperties:\n• Strength: ${(70 + Math.random() * 30).toFixed(0)}%\n• Conductivity: ${(80 + Math.random() * 20).toFixed(0)}%\n• Reactivity: ${(Math.random() * 50).toFixed(0)}%\n\n✅ Design validated\n🔬 Synthesis: Feasible`); setProcessing(false) }, 1000) }} icon={Atom} label="Simulate" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function DroneTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"><div className="text-sm text-emerald-400 font-bold">✅ Connected</div><div className="text-xs text-gray-500">Drone Status</div></div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"><div className="text-sm text-white font-bold">85%</div><div className="text-xs text-gray-500">Battery</div></div>
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter flight path or mission..." label="Mission" multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🚁 Drone Mission Plan\n\nMission: ${input || 'Aerial Survey'}\nAltitude: ${Math.floor(30 + Math.random() * 100)}m\nRange: ${Math.floor(1 + Math.random() * 5)}km\nDuration: ${Math.floor(10 + Math.random() * 30)} min\n\nWaypoints:\n1. Takeoff →\n2. Survey area A\n3. Survey area B\n4. Return to base\n\n📡 Signal: Excellent\n🔒 GPS: Locked (12 satellites)\n✅ Mission ready`); setProcessing(false) }, 1000) }} icon={Radio} label="Plan Mission" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function GeneTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Enter gene sequence or description..." label="Genetic Input" multiline icon={Dna} />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🧬 Gene Analysis Complete\n\nSequence: ${input || 'Standard Reference'}\nLength: ${Math.floor(100 + Math.random() * 900)} base pairs\n\nAnalysis:\n• Gene type: ${['Coding', 'Regulatory', 'Non-coding'][Math.floor(Math.random() * 3)]}\n• Function: ${['Protein synthesis', 'Cell regulation', 'Immune response'][Math.floor(Math.random() * 3)]}\n• Expression level: ${(Math.random() * 100).toFixed(1)}%\n\n✅ Analysis complete\n🔬 Confidence: ${(90 + Math.random() * 10).toFixed(0)}%`); setProcessing(false) }, 1500) }} icon={Dna} label="Analyze Gene" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function FusionTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Enter fusion parameters..." label="Fusion Parameters" multiline />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`⚡ Fusion Simulation\n\nReactor: Tokamak\nTemperature: ${(100 + Math.random() * 50).toFixed(1)} million °C\nPlasma Pressure: ${(Math.random() * 10).toFixed(2)} atm\n\nEnergy Output: ${(Math.random() * 500).toFixed(0)} MW\nEfficiency: ${(Math.random() * 30 + 5).toFixed(1)}%\nPlasma Stability: ${(70 + Math.random() * 30).toFixed(0)}%\n\n✅ Simulation running\n⏱️ Confinement time: ${(Math.random() * 10 + 1).toFixed(1)}s`); setProcessing(false) }, 2000) }} icon={Sun} label="Run Simulation" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function RenewableTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Location or energy parameters..." label="Input" />
      <SelectField options={['Solar', 'Wind', 'Hydropower', 'Geothermal', 'Biomass']} label="Energy Type" />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`☀️ Renewable Energy Analysis\n\nType: ${['Solar', 'Wind', 'Geothermal'][Math.floor(Math.random() * 3)]}\nCapacity: ${Math.floor(1 + Math.random() * 100)} MW\n\nGeneration:\n• Daily: ${(Math.floor(Math.random() * 1000) + 100)} MWh\n• Monthly: ${(Math.floor(Math.random() * 30000) + 3000)} MWh\n• CO₂ Saved: ${Math.floor(Math.random() * 50000 + 5000)} tons/yr\n\nEfficiency: ${(75 + Math.random() * 20).toFixed(0)}%\nROI: ${(5 + Math.random() * 20).toFixed(1)} years\n\n✅ Green energy ready`); setProcessing(false) }, 1000) }} icon={Sun} label="Analyze Energy" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function CyberTool({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <InputField value={input} onChange={setInput} placeholder="Enter target/system to analyze..." label="System Input" multiline icon={Shield} />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🛡️ Cybersecurity Analysis\n\nTarget: ${input || 'Network'}\n\nVulnerabilities Found: ${Math.floor(Math.random() * 10)}\n• Port scan: ${Math.floor(Math.random() * 100)} open ports\n• ${Math.floor(Math.random() * 5)} critical issues\n• ${Math.floor(Math.random() * 8)} medium issues\n\nRisk Score: ${(Math.random() * 100).toFixed(0)}/100\nThreat Level: ${['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)]}\n\n✅ Security report generated\n🔒 Recommendations: ${Math.floor(3 + Math.random() * 8)}`); setProcessing(false) }, 1500) }} icon={Shield} label="Run Security Scan" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function Brain(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg> }
function Infinity(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12c-2-2.5-4-4-6-4s-4 1.5-4 4 1.5 4 4 4 4-1.5 6-4zm0 0c2 2.5 4 4 6 4s4-1.5 4-4-1.5-4-4-4-4 1.5-6 4z"/></svg> }
function Atom(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c-4.5 4.5-11.9 4.5-16.4 0s-4.5-11.9 0-16.4 11.9-4.5 16.4 0"/><path d="M3.8 20.2c4.5 4.5 11.9 4.5 16.4 0s4.5-11.9 0-16.4-11.9-4.5-16.4 0"/></svg> }
function Dna(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="2" r="1.5"/><circle cx="12" cy="22" r="1.5"/><path d="M8 5c0 2 0 4 4 6s4 4 4 6"/><path d="M8 19c0-2 0-4 4-6s4-4 4-6"/><path d="M4 4c4-2 8 0 8 4"/><path d="M4 20c4 2 8 0 8-4"/></svg> }
function Sun(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> }
