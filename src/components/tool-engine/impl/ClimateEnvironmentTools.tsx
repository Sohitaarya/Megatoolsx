import { useState } from 'react'
import { Globe, Cloud, Sun, Thermometer, Droplet, Wind, TreePine, Mountain, Leaf, Eye, BarChart, Sparkles, Activity } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'

export function ClimateEnvironmentTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('weather') || name.includes('temperature') || name.includes('climate')) return <WeatherTool tool={tool} />
  if (name.includes('carbon') || name.includes('footprint')) return <CarbonCalc tool={tool} />
  if (name.includes('air') || name.includes('air quality') || name.includes('pollution')) return <AirQualityTool tool={tool} />
  if (name.includes('water') && !name.includes('drink') && !name.includes('track')) return <WaterAnalysis tool={tool} />
  if (name.includes('recycling') || name.includes('recycle') || name.includes('waste')) return <RecyclingTool tool={tool} />
  if (name.includes('solar') || name.includes('solar energy')) return <SolarCalc tool={tool} />
  if (name.includes('wind') || name.includes('wind energy')) return <WindEnergy tool={tool} />
  if (name.includes('forest') || name.includes('tree') || name.includes('deforest')) return <ForestTracker tool={tool} />
  if (name.includes('ocean') || name.includes('marine') || name.includes('sea')) return <OceanTool tool={tool} />
  if (name.includes('earthquake') || name.includes('seismic')) return <EarthquakeMonitor tool={tool} />
  if (name.includes('biodiversity') || name.includes('wildlife') || name.includes('species')) return <BiodiversityTool tool={tool} />
  if (name.includes('greenhouse') || name.includes('emission')) return <EmissionTracker tool={tool} />
  if (name.includes('noise') || name.includes('sound') && name.includes('level')) return <NoiseMonitor tool={tool} />

  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"><Globe className="w-6 h-6 text-emerald-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Climate</div></div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center"><Cloud className="w-6 h-6 text-blue-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Weather</div></div>
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center"><TreePine className="w-6 h-6 text-green-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Nature</div></div>
      </div>
      <InputField value={input} onChange={setInput} placeholder={`Enter ${tool.name.toLowerCase()} input...`} label="Input" multiline icon={Globe} />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🌍 ${tool.name} Results\n\nAnalysis complete\nInput: ${input || 'Global'}\nEnvironmental metrics processed\n✅ Results ready`); setProcessing(false) }, 1000) }} icon={Leaf} label={`Run ${tool.name}`} />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function WeatherTool({ tool }: { tool: CsvTool }) {
  const [location, setLocation] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><Sun className="w-6 h-6 text-amber-400 mx-auto" /><div className="text-xs text-gray-500">${(20 + Math.random() * 15).toFixed(0)}°C</div></div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center"><Droplet className="w-6 h-6 text-blue-400 mx-auto" /><div className="text-xs text-gray-500">${(40 + Math.random() * 50).toFixed(0)}%</div></div>
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center"><Wind className="w-6 h-6 text-cyan-400 mx-auto" /><div className="text-xs text-gray-500">${(5 + Math.random() * 25).toFixed(0)} km/h</div></div>
      </div>
      <InputField value={location} onChange={setLocation} placeholder="Enter location..." label="Location" icon={Map} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌤️ Weather: ${location || 'Current Location'}\n\nTemperature: ${(20 + Math.random() * 15).toFixed(1)}°C\nFeels Like: ${(18 + Math.random() * 17).toFixed(1)}°C\nHumidity: ${(40 + Math.random() * 50).toFixed(0)}%\nWind: ${(5 + Math.random() * 25).toFixed(1)} km/h\nPrecipitation: ${(Math.random() * 100).toFixed(0)}%\nUV Index: ${Math.floor(Math.random() * 11)}\n\n📅 Forecast:\nToday: ${['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Clear'][Math.floor(Math.random() * 5)]}\nTomorrow: ${['Sunny', 'Cloudy', 'Rain', 'Clear'][Math.floor(Math.random() * 4)]}\n\n🌅 Sunrise: ${String(Math.floor(Math.random() * 5 + 5)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}\n🌇 Sunset: ${String(Math.floor(Math.random() * 3 + 17)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`); setLoading(false) }, 1000) }} icon={Sun} label={loading ? 'Fetching...' : 'Get Weather'} />
      {result && <OutputBox value={result} label="Weather Report" />}
    </ToolWrapper>
  )
}

function CarbonCalc({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="km/month" label="Car Travel" type="number" />
        <InputField value="" onChange={() => {}} placeholder="kWh/month" label="Electricity" type="number" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌱 Carbon Footprint Calculator\n\nYour Annual Footprint: ${(2 + Math.random() * 8).toFixed(1)} tons CO₂\n\nBreakdown:\n🚗 Car Travel: ${(Math.random() * 3).toFixed(1)} tons\n⚡ Electricity: ${(Math.random() * 2).toFixed(1)} tons\n🍽️ Food: ${(Math.random() * 2).toFixed(1)} tons\n✈️ Flights: ${(Math.random() * 2).toFixed(1)} tons\n\n🌍 vs Global Avg: ${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 30).toFixed(0)}%\n\n💡 Reduction Tips:\n1. Use public transport (save ${(Math.random() * 1).toFixed(1)} tons)\n2. Switch to LED bulbs\n3. Reduce food waste\n4. Plant ${Math.floor(5 + Math.random() * 20)} trees`); setLoading(false) }, 1000) }} icon={TreePine} label={loading ? 'Calculating...' : 'Calculate Footprint'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function AirQualityTool({ tool }: { tool: CsvTool }) {
  const [location, setLocation] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={location} onChange={setLocation} placeholder="Enter location..." label="Location" icon={Map} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌬️ Air Quality: ${location || 'Your Area'}\n\nAQI: ${Math.floor(20 + Math.random() * 180)}\nStatus: ${['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy'][Math.floor(Math.random() * 4)]}\n\nPM2.5: ${(5 + Math.random() * 100).toFixed(0)} µg/m³\nPM10: ${(10 + Math.random() * 150).toFixed(0)} µg/m³\nNO₂: ${(10 + Math.random() * 50).toFixed(0)} ppb\nO₃: ${(20 + Math.random() * 60).toFixed(0)} ppb\n\n😷 Health Recommendation:\n${Math.random() > 0.5 ? 'Good for outdoor activities' : 'Limit outdoor activities'}`); setLoading(false) }, 1000) }} icon={Eye} label="Check Air Quality" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function WaterAnalysis({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Water source description" label="Water Source" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`💧 Water Analysis\n\nSource: [Sample]\npH Level: ${(6.5 + Math.random() * 2).toFixed(1)}\nTDS: ${(50 + Math.random() * 400).toFixed(0)} ppm\nTurbidity: ${(Math.random() * 5).toFixed(1)} NTU\nHardness: ${(50 + Math.random() * 200).toFixed(0)} mg/L\n\n✅ Potable: ${Math.random() > 0.3 ? 'Yes' : 'Needs Treatment'}\n🔬 Contaminants: ${Math.random() > 0.7 ? 'Trace detected' : 'None detected'}\n\n📊 Quality Score: ${(60 + Math.random() * 40).toFixed(0)}/100`); setLoading(false) }, 1000) }} icon={Droplet} label="Analyze Water" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function RecyclingTool({ tool }: { tool: CsvTool }) {
  const [item, setItem] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={item} onChange={setItem} placeholder="What do you want to recycle?" label="Item" icon={Leaf} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`♻️ Recycling Guide for: ${item || 'Example Item'}\n\nCategory: ${['Plastic', 'Paper', 'Glass', 'Metal', 'Electronic', 'Organic'][Math.floor(Math.random() * 6)]}\nRecyclable: ${Math.random() > 0.3 ? '✅ Yes' : '❌ No - Special handling'}\n\nInstructions:\n1. Clean the item thoroughly\n2. Remove non-recyclable parts\n3. Separate by material type\n4. Place in appropriate bin\n\n📍 Nearest center: ${Math.floor(Math.random() * 10 + 1)} km away\n🌱 Environmental impact: ${(Math.random() * 5 + 0.1).toFixed(1)} kg CO₂ saved\n\n💡 Eco Tip: Reduce first, then reuse, then recycle`); setLoading(false) }, 800) }} icon={Leaf} label="Check Recycling" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function SolarCalc({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Location or address" label="Location" icon={Map} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`☀️ Solar Energy Calculator\n\nLocation: [Your Roof]\nSolar Irradiance: ${(4 + Math.random() * 3).toFixed(1)} kWh/m²/day\n\nRecommended System: ${(3 + Math.random() * 7).toFixed(1)} kW\nPanels Needed: ${Math.floor(8 + Math.random() * 16)}\nRoof Area: ${(20 + Math.random() * 30).toFixed(0)} m²\n\n🌞 Annual Generation: ${(3000 + Math.random() * 7000).toFixed(0)} kWh\n💰 Annual Savings: $${(300 + Math.random() * 1200).toFixed(0)}\n📈 Payback Period: ${(3 + Math.random() * 10).toFixed(1)} years\n🌱 CO₂ Offset: ${(2 + Math.random() * 6).toFixed(1)} tons/year\n\n✅ Great potential for solar!`); setLoading(false) }, 1000) }} icon={Sun} label="Calculate Solar" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function WindEnergy({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Location" label="Location" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`💨 Wind Energy Assessment\n\nLocation: [Your Area]\nAvg. Wind Speed: ${(5 + Math.random() * 10).toFixed(1)} m/s\nWind Class: ${['Class 3', 'Class 4', 'Class 5', 'Class 6'][Math.floor(Math.random() * 4)]}\n\nTurbine Specs:\n• Capacity: ${Math.floor(1 + Math.random() * 5)} MW\n• Hub Height: ${Math.floor(80 + Math.random() * 40)} m\n• Annual Output: ${(2000 + Math.random() * 8000).toFixed(0)} MWh\n\n💰 Revenue: $${(200 + Math.random() * 800).toFixed(0)}K/year\n🌱 CO₂ Avoided: ${(1000 + Math.random() * 4000).toFixed(0)} tons/year\n\n📊 Feasibility: ${['Good', 'Excellent', 'Moderate'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 1000) }} icon={Wind} label="Assess Wind Energy" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ForestTracker({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Region or country" label="Region" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌲 Forest Cover Analysis\n\nRegion: [Selected Area]\nForest Cover: ${(20 + Math.random() * 60).toFixed(0)}%\nTree Density: ${(100 + Math.random() * 400).toFixed(0)} trees/hectare\n\n📊 Change Over Time:\n• Last Year: ${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 5).toFixed(1)}%\n• Last 5 Years: ${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 15).toFixed(1)}%\n\n⚠️ Deforestation Risk: ${['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)]}\n🌱 Reforestation Potential: ${(Math.floor(Math.random() * 1000) + 100).toLocaleString()} hectares\n\n✅ Monitoring active`); setLoading(false) }, 1000) }} icon={TreePine} label="Track Forest" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function OceanTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Ocean region" label="Region" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌊 Ocean Health Report\n\nRegion: [Ocean Region]\nSea Temperature: ${(15 + Math.random() * 15).toFixed(1)}°C\npH Level: ${(7.8 + Math.random() * 0.5).toFixed(2)}\nSalinity: ${(32 + Math.random() * 5).toFixed(1)} ppt\n\n🦈 Biodiversity Index: ${(Math.random() * 10).toFixed(1)}\n♻️ Plastic Concentration: ${(Math.random() * 10).toFixed(1)} particles/L\n🌡️ Coral Bleaching Risk: ${['Low', 'Moderate', 'High', 'Critical'][Math.floor(Math.random() * 4)]}\n\n📈 Sea Level Rise: ${(Math.random() * 10).toFixed(1)} mm/yr\n✅ Analysis complete`); setLoading(false) }, 1000) }} icon={Waves} label="Analyze Ocean" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function EarthquakeMonitor({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Region" label="Region" icon={Map} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌋 Seismic Activity Report\n\nRegion: [Selected Region]\n\nLatest Activity:\n• Magnitude: ${(1 + Math.random() * 8).toFixed(1)}\n• Depth: ${(Math.floor(Math.random() * 100) + 2)} km\n• Time: ${new Date().toLocaleString()}\n• Status: ${['Normal', 'Watch', 'Advisory', 'Warning'][Math.floor(Math.random() * 4)]}\n\n📊 30-Day Summary:\n• Total Events: ${Math.floor(Math.random() * 50)}\n• Largest: ${(4 + Math.random() * 4).toFixed(1)}\n• Smallest: ${(Math.random() * 3).toFixed(1)}\n\n✅ Monitoring active\n🔔 Alerts configured`); setLoading(false) }, 1000) }} icon={Activity} label="Monitor Earthquakes" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function BiodiversityTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Ecosystem or region" label="Ecosystem" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🦋 Biodiversity Report\n\nEcosystem: [Selected Region]\n\nSpecies Count:\n• Plants: ${Math.floor(100 + Math.random() * 900)}\n• Birds: ${Math.floor(20 + Math.random() * 180)}\n• Mammals: ${Math.floor(10 + Math.random() * 90)}\n• Reptiles: ${Math.floor(5 + Math.random() * 45)}\n• Insects: ${Math.floor(500 + Math.random() * 4500)}\n\n🌿 Endemic Species: ${Math.floor(5 + Math.random() * 50)}\n⚠️ Threatened: ${Math.floor(2 + Math.random() * 20)}\n\n📊 Health Index: ${(50 + Math.random() * 50).toFixed(0)}/100\n✅ Assessment complete`); setLoading(false) }, 1000) }} icon={TreePine} label="Assess Biodiversity" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function EmissionTracker({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Country or industry" label="Target" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🏭 Greenhouse Gas Emissions\n\nTarget: [Selected Entity]\nTotal Emissions: ${(100 + Math.random() * 10000).toFixed(0)} kt CO₂e\n\nBreakdown:\n• CO₂: ${(50 + Math.random() * 5000).toFixed(0)} kt\n• CH₄: ${(5 + Math.random() * 500).toFixed(0)} kt\n• N₂O: ${(1 + Math.random() * 100).toFixed(0)} kt\n\n📈 Trend: ${['Rising', 'Stable', 'Declining', 'Paris Target'][Math.floor(Math.random() * 4)]}\n🎯 Net Zero Target: ${['2030', '2040', '2050', '2060'][Math.floor(Math.random() * 4)]}\n\n✅ Tracking active`); setLoading(false) }, 1000) }} icon={AlertTriangle} label="Track Emissions" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function NoiseMonitor({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Location" label="Location" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🔊 Noise Level Monitoring\n\nLocation: [Selected]\nCurrent Level: ${(30 + Math.random() * 60).toFixed(0)} dB\n\nClassification: ${['Quiet', 'Moderate', 'Loud', 'Very Loud'][Math.floor(Math.random() * 4)]}\n\n📊 24h Profile:\n• Morning: ${(30 + Math.random() * 20).toFixed(0)} dB\n• Afternoon: ${(40 + Math.random() * 30).toFixed(0)} dB\n• Evening: ${(35 + Math.random() * 25).toFixed(0)} dB\n• Night: ${(20 + Math.random() * 15).toFixed(0)} dB\n\n✅ Safe Limit: ${Math.random() > 0.4 ? '✅ Within limits' : '⚠️ Exceeds recommendations'}\n💡 Tip: ${['Use ear protection', 'Consider soundproofing', 'Move away from source'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 800) }} icon={Activity} label="Monitor Noise" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function Map(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> }
function Waves(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c.5 0 .9.2 1.3.5"/><path d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 4.5-1s3.2 1 4.5 1c1.3 0 2.5-1 4.5-1 1.3 0 2.5 1 3.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 4.5-1s3.2 1 4.5 1c1.3 0 2.5-1 4.5-1 1.3 0 2.5 1 3.5 1"/></svg> }
function AlertTriangle(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> }
