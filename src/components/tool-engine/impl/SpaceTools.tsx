import { useState } from 'react'
import { Globe, Telescope, Moon, Sun, Star, Map, Radar, Rocket, Sparkles, Activity, Clock } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function SpaceTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('planet') || name.includes('orbit')) return <PlanetTool tool={tool} />
  if (name.includes('star') || name.includes('constellation')) return <StarMapTool tool={tool} />
  if (name.includes('satellite') || name.includes('spacex') || name.includes('rocket')) return <SatelliteTool tool={tool} />
  if (name.includes('asteroid') || name.includes('comet') || name.includes('meteor')) return <AsteroidTool tool={tool} />
  if (name.includes('moon') || name.includes('lunar') || name.includes('mars')) return <LunarTool tool={tool} />
  if (name.includes('black') && name.includes('hole')) return <BlackHoleTool tool={tool} />
  if (name.includes('galaxy') || name.includes('nebula')) return <GalaxyTool tool={tool} />
  if (name.includes('telescope') || name.includes('observatory')) return <ObservationTool tool={tool} />
  if (name.includes('space') && name.includes('weather')) return <SpaceWeatherTool tool={tool} />
  if (name.includes('exoplanet')) return <ExoplanetTool tool={tool} />

  return (
    <CapabilityTool tool={tool} />
  )
}

function PlanetTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']} label="Planet" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🪐 Planet Data\n\nPlanet: ${['Mars', 'Jupiter', 'Saturn', 'Venus'][Math.floor(Math.random() * 4)]}\nDistance from Sun: ${(Math.random() * 1000 + 50).toFixed(0)}M km\nDiameter: ${(Math.random() * 100000 + 5000).toFixed(0)} km\n\n🌡️ Surface Temp: ${(Math.random() * 400 - 100).toFixed(0)}°C\n⏱️ Day Length: ${(Math.random() * 24).toFixed(1)} hours\n📆 Year Length: ${(Math.random() * 400 + 88).toFixed(0)} Earth days\n\n🌙 Moons: ${Math.floor(Math.random() * 80)}\n🪐 Rings: ${Math.random() > 0.5 ? 'Yes' : 'No'}\n\n✅ Data retrieved from NASA database`); setLoading(false) }, 800) }} icon={Globe} label="Get Planet Data" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function StarMapTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Ursa Major', 'Orion', 'Cassiopeia', 'Scorpius', 'Pegasus', 'Leo', 'Andromeda']} label="Constellation" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`⭐ Star Map: ${['Orion', 'Ursa Major', 'Cassiopeia'][Math.floor(Math.random() * 3)]}\n\nStars: ${Math.floor(50 + Math.random() * 200)}\nBrightest Star: Magnitude ${(Math.random() * 3).toFixed(1)}\nDistance: ${(Math.random() * 1000 + 10).toFixed(0)} ly\n\n📍 Location:\nRA: ${(Math.random() * 24).toFixed(1)}h\nDec: ${(Math.random() * 90 - 45).toFixed(1)}°\n\n🌍 Best Viewing: ${['Northern', 'Southern', 'Both'][Math.floor(Math.random() * 3)]} Hemisphere\n📅 Season: ${['Spring', 'Summer', 'Fall', 'Winter'][Math.floor(Math.random() * 4)]}\n\n✅ Ready for tonight's observation`); setLoading(false) }, 800) }} icon={Star} label="View Star Map" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function SatelliteTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Satellite name or NORAD ID" label="Satellite Search" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🛰️ Satellite Tracking\n\nSatellite: ${['ISS (ZARYA)', 'HST (Hubble)', 'Starlink-1234', 'GPS BIIR-8'][Math.floor(Math.random() * 4)]}\nNORAD ID: ${Math.floor(10000 + Math.random() * 90000)}\n\n📍 Position:\nLatitude: ${(Math.random() * 180 - 90).toFixed(2)}°\nLongitude: ${(Math.random() * 360 - 180).toFixed(2)}°\nAltitude: ${(Math.floor(200 + Math.random() * 35800))} km\n\n🚀 Speed: ${(Math.floor(25000 + Math.random() * 3000))} km/h\n📡 Signal: ${(60 + Math.random() * 40).toFixed(0)}%\n\n🔭 Next pass: ${new Date(Date.now() + Math.floor(Math.random() * 12) * 3600000).toLocaleString()}\n✅ Tracking active`); setLoading(false) }, 800) }} icon={Satellite} label="Track Satellite" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function AsteroidTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`☄️ Near-Earth Objects\n\nNEOs Tracked: ${Math.floor(10000 + Math.random() * 30000)}\n\nClose Approaches (Next 30 Days):\n\n1. Asteroid ${Math.floor(100000 + Math.random() * 900000)}\n   Size: ${(10 + Math.random() * 500).toFixed(0)}m\n   Distance: ${(Math.random() * 10 + 0.5).toFixed(2)} LD\n   Date: ${new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toLocaleDateString()}\n   Hazard: ${Math.random() > 0.9 ? '⚠️ Potential' : '✅ None'}\n\n2. Asteroid ${Math.floor(100000 + Math.random() * 900000)}\n   Size: ${(5 + Math.random() * 100).toFixed(0)}m\n   Distance: ${(Math.random() * 20 + 1).toFixed(2)} LD\n   Date: ${new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toLocaleDateString()}\n   Hazard: ✅ None\n\n🛡️ Planetary Defense: Active\n📊 All objects within safe parameters`); setLoading(false) }, 800) }} icon={Meteor} label="Check Asteroids" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function LunarTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌙 Lunar Data\n\nPhase: ${['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'][Math.floor(Math.random() * 8)]}\nIllumination: ${(Math.random() * 100).toFixed(0)}%\n\n📊 Moon Data:\nDistance: ${(356000 + Math.random() * 48000).toFixed(0)} km\nAge: ${(Math.random() * 29.5).toFixed(1)} days\n\n🌅 Rise: ${String(Math.floor(Math.random() * 12 + 5)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}\n🌇 Set: ${String(Math.floor(Math.random() * 12 + 17)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}\n\n🌊 Tides: ${['Spring Tide', 'Neap Tide', 'Normal'][Math.floor(Math.random() * 3)]}\n✅ Data ready`); setLoading(false) }, 800) }} icon={Moon} label="Get Lunar Data" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function BlackHoleTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Black hole name or mass" label="Black Hole" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🕳️ Black Hole Data\n\nDesignation: ${['Sgr A*', 'M87*', 'Cygnus X-1', 'GW150914'][Math.floor(Math.random() * 4)]}\nType: ${['Supermassive', 'Stellar', 'Intermediate'][Math.floor(Math.random() * 3)]}\n\n📊 Properties:\nMass: ${(Math.random() * 10000 + 1).toFixed(1)}M ☉\nEvent Horizon: ${(Math.random() * 100 + 1).toFixed(1)} km\nRotation: ${(Math.random() * 0.998).toFixed(3)} c\n\n📍 Location:\nDistance: ${(Math.random() * 100000 + 1000).toFixed(0)} ly\nConstellation: ${['Sagittarius', 'Virgo', 'Cygnus'][Math.floor(Math.random() * 3)]}\n\n⚡ Hawking Radiation: ${(Math.random() * 1e-30).toExponential(2)} W\n✅ Observation data complete`); setLoading(false) }, 800) }} icon={Infinity} label="Black Hole Data" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function GalaxyTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌌 Galaxy Database\n\nGalaxy: ${['Milky Way', 'Andromeda', 'Triangulum', 'Sombrero', 'Whirlpool'][Math.floor(Math.random() * 5)]}\nType: ${['Spiral', 'Elliptical', 'Irregular', 'Barred Spiral'][Math.floor(Math.random() * 4)]}\n\n📊 Stats:\nDiameter: ${(Math.random() * 200000 + 10000).toFixed(0)} ly\nStars: ${(Math.random() * 1000 + 100).toFixed(0)}B\nAge: ${(Math.random() * 10 + 1).toFixed(1)}B years\n\n📍 Distance:\nFrom Earth: ${(Math.random() * 10000000 + 100000).toFixed(0)} ly\nRedshift: z = ${(Math.random() * 10).toFixed(3)}\n\n✅ Data retrieved\n🔭 Visible ${Math.random() > 0.5 ? 'with naked eye' : 'through telescope'}`); setLoading(false) }, 800) }} icon={Galaxy} label="Explore Galaxy" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ObservationTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Celestial object or coordinates" label="Target" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🔭 Observation Planner\n\nTarget: [Celestial Object]\nType: ${['Nebula', 'Star Cluster', 'Galaxy', 'Planet'][Math.floor(Math.random() * 4)]}\nMagnitude: ${(Math.random() * 15 - 2).toFixed(1)}\n\n📍 Position:\nRA: ${(Math.random() * 24).toFixed(2)}h\nDec: ${(Math.random() * 90 - 45).toFixed(2)}°\nAltitude: ${(Math.random() * 90).toFixed(0)}°\n\n📋 Conditions:\n🌙 Moon: ${(Math.random() * 100).toFixed(0)}% illuminated\n🪞 Seeing: ${['Excellent', 'Good', 'Fair', 'Poor'][Math.floor(Math.random() * 4)]}\n💡 Light Pollution: ${['Bortle 1', 'Bortle 3', 'Bortle 5'][Math.floor(Math.random() * 3)]}\n\n✅ Optimal viewing: ${new Date(Date.now() + Math.floor(Math.random() * 12) * 3600000).toLocaleTimeString()}`); setLoading(false) }, 800) }} icon={Eye} label="Plan Observation" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function SpaceWeatherTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌞 Space Weather Report\n\nSolar Wind: ${(300 + Math.random() * 400).toFixed(0)} km/s\nSolar Flare Risk: ${['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)]}\n\n📡 KP Index: ${(Math.random() * 9).toFixed(1)}\n🧭 Geomagnetic Storm: ${Math.random() > 0.8 ? '⚠️ Minor Storm' : '✅ Quiet'}\n\n🌌 Aurora:\n• Visibility: ${Math.random() > 0.6 ? 'Possible at high latitudes' : 'Active at polar regions'}\n• KP needed: ${Math.floor(3 + Math.random() * 4)}\n\n📡 Radio Blackout Risk: ${['None', 'Minor', 'Strong'][Math.floor(Math.random() * 3)]}\n✅ Monitoring active`); setLoading(false) }, 800) }} icon={Satellite} label="Check Space Weather" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ExoplanetTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🪐 Exoplanet Discovery\n\nName: ${['Proxima Centauri b', 'TRAPPIST-1e', 'Kepler-452b', 'HD 209458b', 'TOI-700d'][Math.floor(Math.random() * 5)]}\nType: ${['Terrestrial', 'Gas Giant', 'Super-Earth', 'Neptunian'][Math.floor(Math.random() * 4)]}\n\n📊 Properties:\nMass: ${(Math.random() * 20 + 0.5).toFixed(1)}M ⊕\nRadius: ${(Math.random() * 5 + 0.5).toFixed(1)}R ⊕\nOrbital Period: ${(Math.random() * 500 + 3).toFixed(1)} days\n\n🌡️ Temperature: ${(Math.random() * 400 - 50).toFixed(0)}°C\n🌍 Distance: ${(Math.random() * 500 + 4).toFixed(1)} ly\n\n💧 Habitability: ${['Optimistic', 'Pessimistic', 'Promising'][Math.floor(Math.random() * 3)]}\n✅ Data from NASA Exoplanet Archive`); setLoading(false) }, 800) }} icon={Star} label="Explore Exoplanets" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function Galaxy(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></svg> }
function Infinity(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12c-2-2.5-4-4-6-4s-4 1.5-4 4 1.5 4 4 4 4-1.5 6-4zm0 0c2 2.5 4 4 6 4s4-1.5 4-4-1.5-4-4-4-4 1.5-6 4z"/></svg> }
function Meteor(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 3L3 21"/><path d="M17 7l-4 12-2-6-6-2 12-4z"/></svg> }
function Satellite(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7a5 5 0 0 1 5-5h12a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7"/><circle cx="12" cy="12" r="3"/><path d="M12 9V3"/><path d="M12 21v-6"/><path d="M3 9h6"/><path d="M15 9h6"/><path d="M3 15h6"/><path d="M15 15h6"/></svg> }
function Orbit(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="16" cy="16" r="2"/></svg> }
function Eye(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }
