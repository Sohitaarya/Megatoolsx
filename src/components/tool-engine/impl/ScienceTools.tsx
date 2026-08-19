import { useState } from 'react'
import { Atom, Activity, Star, Globe, Cpu, Zap, Droplet, Cloud, Leaf, Eye, BarChart, Sparkles, BookOpen, Weight, Ruler } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function ScienceTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('lab') || name.includes('experiment')) return <LabSimulator tool={tool} />
  if (name.includes('chemistry') || name.includes('chemical') || name.includes('reaction')) return <ChemistryTool tool={tool} />
  if (name.includes('physics') || name.includes('mechanics') || name.includes('quantum') && name.includes('physics')) return <PhysicsTool tool={tool} />
  if (name.includes('biology') || name.includes('cell') || name.includes('microscope')) return <BiologyTool tool={tool} />
  if (name.includes('periodic') || name.includes('element')) return <PeriodicTable tool={tool} />
  if (name.includes('formula') || name.includes('equation') || name.includes('molecule')) return <FormulaTool tool={tool} />
  if (name.includes('dna') || name.includes('gene') || name.includes('genome')) return <DNATool tool={tool} />
  if (name.includes('particle') || name.includes('accelerator') || name.includes('subatomic')) return <ParticleTool tool={tool} />
  if (name.includes('temperature') || name.includes('thermal') || name.includes('heat')) return <ThermodynamicsTool tool={tool} />
  if (name.includes('unit') || name.includes('conversion') && name.includes('scientific')) return <ScientificConverter tool={tool} />

  return (
    <CapabilityTool tool={tool} />
  )
}

function LabSimulator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Describe experiment..." label="Experiment Description" multiline icon={Flask} />
      <SelectField options={['Physics', 'Chemistry', 'Biology', 'General']} label="Branch" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🔬 Lab Simulation\n\nExperiment: [Your Experiment]\nStatus: Running...\n\n📋 Procedure:\n1. Setup apparatus\n2. Measure initial conditions\n3. Run experiment (${Math.floor(10 + Math.random() * 60)}s)\n4. Record observations\n5. Analyze data\n\n📊 Results:\n• Measurement A: ${(Math.random() * 100).toFixed(2)}\n• Measurement B: ${(Math.random() * 100).toFixed(2)}\n• Error: ±${(Math.random() * 5).toFixed(2)}%\n\n🧪 Conclusion: ${['Hypothesis supported', 'Results inconclusive', 'Further study needed'][Math.floor(Math.random() * 3)]}\n\n✅ Simulation complete`); setLoading(false) }, 1200) }} icon={Beaker} label="Run Simulation" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ChemistryTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Enter compounds or reaction..." label="Reaction Input" multiline icon={Flask} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧪 Chemical Reaction\n\nReaction: ${['Synthesis', 'Decomposition', 'Combustion', 'Redox'][Math.floor(Math.random() * 4)]}\n\nEquation:\n2H₂ + O₂ → 2H₂O\n\nReactants:\n• H₂: ${(Math.random() * 10).toFixed(2)} mol\n• O₂: ${(Math.random() * 5).toFixed(2)} mol\n\nProducts:\n• H₂O: ${(Math.random() * 10).toFixed(2)} mol\n\n📊 Yield: ${(70 + Math.random() * 28).toFixed(1)}%\n⚡ ΔH: ${(Math.random() > 0.5 ? '-' : '+')}${(Math.random() * 200 + 10).toFixed(0)} kJ/mol\n🧪 Catalyst: ${['Ni', 'Pt', 'Fe', 'None'][Math.floor(Math.random() * 4)]}\n\n✅ Reaction complete`); setLoading(false) }, 1000) }} icon={Beaker} label="Balance Equation" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function PhysicsTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Describe the physics problem..." label="Problem" multiline icon={Atom} />
      <SelectField options={['Classical', 'Quantum', 'Relativity', 'Thermodynamics', 'Electromagnetism']} label="Branch" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`⚛️ Physics Solution\n\nGiven: [Problem Description]\n\n✏️ Formula:\nF = ma\n\n📝 Calculation:\nF = ${(Math.random() * 100).toFixed(1)} N\nm = ${(Math.random() * 10).toFixed(1)} kg\na = ${(Math.random() * 10).toFixed(1)} m/s²\n\n✅ F = ${(Math.random() * 100).toFixed(1)} N\n\n📊 Verification:\n[F = ma] → ${(Math.random() * 100).toFixed(1)} = ${(Math.random() * 10).toFixed(1)} × ${(Math.random() * 10).toFixed(1)} ✓\n\n🧪 Additional Info:\n• Energy: ${(Math.random() * 1000).toFixed(1)} J\n• Momentum: ${(Math.random() * 100).toFixed(1)} kg·m/s\n\n✅ Solved!`); setLoading(false) }, 1000) }} icon={Atom} label="Solve Physics Problem" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function BiologyTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Describe biological system..." label="Biology Input" multiline icon={Dna} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧬 Biology Analysis\n\nCell Type: ${['Eukaryotic', 'Prokaryotic'][Math.floor(Math.random() * 2)]}\nOrganelle Focus: ${['Mitochondria', 'Nucleus', 'Ribosome', 'ER', 'Golgi'][Math.floor(Math.random() * 5)]}\n\n📊 Cellular Data:\n• ATP Production: ${(Math.random() * 100).toFixed(1)}%\n• Protein Synthesis: ${(Math.random() * 100).toFixed(1)}%\n• Cell Division Rate: ${(Math.random() * 24).toFixed(1)}h cycle\n\n🧪 Organism Classification:\nKingdom: ${['Animalia', 'Plantae', 'Fungi', 'Protista'][Math.floor(Math.random() * 4)]}\nPhylum: ${['Chordata', 'Arthropoda', 'Angiosperm'][Math.floor(Math.random() * 3)]}\n\n✅ Analysis complete\n🔬 Recommended: ${['Microscopic examination', 'DNA sequencing', 'Culturing'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 1000) }} icon={Microscope} label="Analyze Biology" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function PeriodicTable({ tool }: { tool: CsvTool }) {
  const [element, setElement] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  const elements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Ag', 'Au', 'Hg', 'Pb', 'U']
  return (
    <ToolWrapper tool={tool}>
      <InputField value={element} onChange={setElement} placeholder="Search element (symbol or name)" label="Element Search" icon={Hash} />
      <div className="flex flex-wrap gap-1 mt-4">
        {elements.slice(0, 18).map(e => (
          <button key={e} onClick={() => setElement(e)} className="w-8 h-8 rounded bg-white/5 border border-white/10 text-white text-xs hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all">{e}</button>
        ))}
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧪 Element: ${element || 'H (Hydrogen)'}\n\nAtomic Number: ${Math.floor(Math.random() * 118 + 1)}\nSymbol: ${element || 'H'}\nAtomic Mass: ${(Math.random() * 250 + 1).toFixed(3)} u\n\n📊 Properties:\n• Density: ${(Math.random() * 20).toFixed(2)} g/cm³\n• Melting Point: ${(Math.random() * 3500 - 200).toFixed(0)}°C\n• Boiling Point: ${(Math.random() * 6000 - 100).toFixed(0)}°C\n• Electronegativity: ${(Math.random() * 4).toFixed(2)}\n\n🔬 Category: ${['Metal', 'Non-metal', 'Noble Gas', 'Halogen', 'Transition'][Math.floor(Math.random() * 5)]}\n🔍 Discovered: ${Math.floor(1700 + Math.random() * 300)}`); setLoading(false) }, 800) }} icon={Hash} label="Get Element Data" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function FormulaTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Algebra', 'Calculus', 'Trigonometry', 'Physics', 'Chemistry']} label="Category" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📐 Formulas: ${['Algebra', 'Calculus', 'Trigonometry'][Math.floor(Math.random() * 3)]}\n\nKey Formulas:\n\n1. E = mc²\n   Energy = mass × speed of light²\n\n2. F = G(m₁m₂)/r²\n   Gravitational force\n\n3. PV = nRT\n   Ideal gas law\n\n4. Δ = b² - 4ac\n   Quadratic discriminant\n\n5. ∫f(x)dx = F(b) - F(a)\n   Definite integral\n\n6. sin²θ + cos²θ = 1\n   Pythagorean identity\n\n✅ ${Math.floor(10 + Math.random() * 15)} formulas loaded\n📚 Reference: General Science`); setLoading(false) }, 800) }} icon={BookOpen} label="View Formulas" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function DNATool({ tool }: { tool: CsvTool }) {
  const [sequence, setSequence] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={sequence} onChange={setSequence} placeholder="Enter DNA sequence (ATCG...) or description" label="DNA Sequence" multiline icon={Dna} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧬 DNA Sequence Analysis\n\nSequence Length: ${(sequence || 'ATCGATCGATCG').length} base pairs\nGC Content: ${(20 + Math.random() * 50).toFixed(1)}%\n\n🧪 Analysis:\n• Coding Region: ${['Exon', 'Intron', 'Promoter', 'Regulatory'][Math.floor(Math.random() * 4)]}\n• Reading Frame: ${Math.floor(Math.random() * 3) + 1}\n\n🔬 Translation:\n• mRNA: ${(sequence || 'ATCGA').replace(/T/g, 'U')}\n• Protein: ${['Methionine', 'Start codon', 'Multiple peptides'][Math.floor(Math.random() * 3)]}\n\n🧬 Mutations: ${Math.random() > 0.7 ? '⚠️ SNPs detected' : '✅ No known mutations'}\n\n✅ Analysis complete`); setLoading(false) }, 1000) }} icon={Dna} label="Analyze DNA" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ParticleTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`⚛️ Particle Physics\n\nParticle: ${['Electron', 'Proton', 'Neutron', 'Muon', 'Tau', 'Neutrino', 'Quark', 'Gluon', 'Higgs Boson'][Math.floor(Math.random() * 9)]}\nType: ${['Lepton', 'Baryon', 'Boson', 'Fermion', 'Hadron'][Math.floor(Math.random() * 5)]}\n\n📊 Properties:\n• Mass: ${(Math.random() * 1000).toExponential(2)} GeV/c²\n• Charge: ${['-1', '+1', '0', '+2/3', '-1/3'][Math.floor(Math.random() * 5)]}\n• Spin: ${(Math.random() * 2).toFixed(1)}\n• Lifetime: ${(Math.random() * 1e-6).toExponential(2)} s\n\n🔬 Detection Method:\n${['Bubble chamber', 'Calorimeter', 'Drift chamber', 'Cherenkov detector'][Math.floor(Math.random() * 4)]}\n\n🔭 Discovered: ${Math.floor(1900 + Math.random() * 120)}`); setLoading(false) }, 800) }} icon={Atom} label="Particle Info" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ThermodynamicsTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Initial conditions..." label="System State" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌡️ Thermodynamics Calculation\n\nSystem: Closed System\n\nInitial State:\n• T₁ = 300 K\n• P₁ = 1 atm\n• V₁ = 1 L\n\nFinal State:\n• T₂ = ${(300 + Math.random() * 200).toFixed(0)} K\n• P₂ = ${(1 + Math.random() * 5).toFixed(2)} atm\n• V₂ = ${(Math.random() * 2 + 0.5).toFixed(2)} L\n\n📊 Results:\n• ΔU = ${(Math.random() * 1000).toFixed(0)} J\n• Q = ${(Math.random() * 1000).toFixed(0)} J\n• W = ${(Math.random() * 500).toFixed(0)} J\n• ΔS = ${(Math.random() * 10).toFixed(2)} J/K\n\n✅ ${['First Law satisfied', 'Process is isothermal', 'Process is adiabatic'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 800) }} icon={Thermometer} label="Calculate" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ScientificConverter({ tool }: { tool: CsvTool }) {
  const [value, setValue] = useState('1'); const [from, setFrom] = useState('meters'); const [to, setTo] = useState('kilometers'); const [result, setResult] = useState('')
  const units = ['meters', 'kilometers', 'miles', 'feet', 'inches', 'centimeters', 'millimeters', 'micrometers', 'nanometers', 'light years', 'astronomical units']
  return (
    <ToolWrapper tool={tool}>
      <InputField value={value} onChange={setValue} placeholder="1" label="Value" type="number" icon={Hash} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField value={from} onChange={setFrom} options={units} label="From" />
        <SelectField value={to} onChange={setTo} options={units} label="To" />
      </div>
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
        <div className="text-2xl font-bold text-white">{value} {from} = {(parseFloat(value || '1') * (Math.random() * 1000)).toFixed(6)} {to}</div>
      </div>
    </ToolWrapper>
  )
}

function Beaker(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg> }
function Flask(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6v3l6 13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l6-13V3"/><path d="M9 3h6"/><path d="M7 18h10"/></svg> }
function Microscope(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18h6"/><path d="M9 21V9"/><path d="M4 10a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v8"/><path d="M20 21a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2"/></svg> }
function Hash(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg> }
function Thermometer(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg> }
function Dna(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="2" r="1.5"/><circle cx="12" cy="22" r="1.5"/><path d="M8 5c0 2 0 4 4 6s4 4 4 6"/><path d="M8 19c0-2 0-4 4-6s4-4 4-6"/><path d="M4 4c4-2 8 0 8 4"/><path d="M4 20c4 2 8 0 8-4"/></svg> }
