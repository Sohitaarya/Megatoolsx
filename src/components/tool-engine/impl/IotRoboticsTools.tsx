import { useState } from 'react'
import { Cpu, Wifi, Bluetooth, Battery, Thermometer, Activity, Settings, HardDrive, Monitor, Smartphone, Zap, Globe, Bot, Server, Cloud, Shield } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function IotRoboticsTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('iot') || name.includes('device') || name.includes('sensor')) return <IoTDeviceTool tool={tool} />
  if (name.includes('robot') || name.includes('bot') || name.includes('automate')) return <RobotControl tool={tool} />
  if (name.includes('drone') || name.includes('uav')) return <DroneControl tool={tool} />
  if (name.includes('smart') && name.includes('home')) return <SmartHomeTool tool={tool} />
  if (name.includes('firmware') || name.includes('update')) return <FirmwareTool tool={tool} />
  if (name.includes('network') || name.includes('mesh') || name.includes('protocol')) return <NetworkTool tool={tool} />
  if (name.includes('sensor') || name.includes('detector') || name.includes('monitor')) return <SensorMonitor tool={tool} />
  if (name.includes('actuator') || name.includes('motor')) return <ActuatorControl tool={tool} />
  if (name.includes('tracker') || name.includes('gps') || name.includes('location')) return <GPSTracker tool={tool} />

  return (
    <CapabilityTool tool={tool} />
  )
}

function IoTDeviceTool({ tool }: { tool: CsvTool }) {
  const [devices, setDevices] = useState([{ n: 'Temp Sensor', s: 'Online' }, { n: 'Motion Sensor', s: 'Online' }, { n: 'Light Sensor', s: 'Offline' }])
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"><Wifi className="w-8 h-8 text-emerald-400 mx-auto" /><div className="text-sm text-emerald-400 font-bold">${devices.filter(d => d.s === 'Online').length} Online</div></div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"><Battery className="w-8 h-8 text-red-400 mx-auto" /><div className="text-sm text-red-400 font-bold">${devices.filter(d => d.s === 'Offline').length} Offline</div></div>
      </div>
      {devices.map((d, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-2">
          <span className="text-sm text-white">{d.n}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${d.s === 'Online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{d.s}</span>
        </div>
      ))}
      <ActionButton onClick={() => setDevices(devices.map(d => ({ ...d, s: Math.random() > 0.3 ? 'Online' : 'Offline' })))} icon={Wifi} label="Scan Devices" variant="secondary" />
    </ToolWrapper>
  )
}

function RobotControl({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {['🦾', '⚙️', '🔥'].map((e, i) => <div key={i} className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center text-2xl">{e}</div>)}
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter robot command..." label="Robot Command" icon={Bot} />
      <div className="flex gap-3 mt-4">
        {['Forward', 'Back', 'Left', 'Right', 'Stop', 'Scan'].map(c => (
          <button key={c} onClick={() => setInput(c)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10">{c}</button>
        ))}
      </div>
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🤖 Command: ${input || 'STANDARD_SCAN'}\nStatus: Executing...\nMotors: ✅ Active\nSensors: ✅ Reading\n\n📊 Telemetry:\n• Speed: ${Math.floor(Math.random() * 100)} mm/s\n• Battery: ${(70 + Math.random() * 30).toFixed(0)}%\n• Signal: ${['Strong', 'Excellent', 'Good'][Math.floor(Math.random() * 3)]}\n\n✅ Command complete`); setProcessing(false) }, 800) }} icon={Bot} label="Execute Command" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function DroneControl({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"><div className="text-emerald-400 font-bold">🟢 Flying</div><div className="text-xs text-gray-500">Status</div></div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"><div className="text-white font-bold">${(70 + Math.random() * 30).toFixed(0)}%</div><div className="text-xs text-gray-500">Battery</div></div>
      </div>
      <InputField value={input} onChange={setInput} placeholder="Enter flight plan..." label="Flight Command" />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🚁 Drone Command\n\nCommand: ${input || 'AUTO_SURVEY'}\nAltitude: ${Math.floor(30 + Math.random() * 100)}m\nSpeed: ${Math.floor(5 + Math.random() * 15)} m/s\n\nGPS: Locked (${Math.floor(8 + Math.random() * 8)} satellites)\nCamera: ${['Recording 4K', 'Standby', 'Streaming'][Math.floor(Math.random() * 3)]}\n\n✅ Mission: ${['In progress', 'Completed', 'Ready'][Math.floor(Math.random() * 3)]}`); setProcessing(false) }, 800) }} icon={Radio} label="Send Command" />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function SmartHomeTool({ tool }: { tool: CsvTool }) {
  const [lights, setLights] = useState(false); const [temp, setTemp] = useState(22); const [locked, setLocked] = useState(true)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className={`text-2xl mb-1 ${lights ? 'text-yellow-400' : 'text-gray-600'}`}>💡</div>
          <div className="text-sm text-white">{lights ? 'ON' : 'OFF'}</div>
          <button onClick={() => setLights(!lights)} className="mt-2 px-3 py-1 rounded-lg text-xs bg-indigo-600 text-white">{lights ? 'Turn Off' : 'Turn On'}</button>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl mb-1">🌡️</div>
          <div className="text-sm text-white">{temp}°C</div>
          <div className="flex gap-1 justify-center mt-2">
            <button onClick={() => setTemp(temp - 1)} className="px-2 py-0.5 rounded bg-white/10 text-xs text-white">-</button>
            <button onClick={() => setTemp(temp + 1)} className="px-2 py-0.5 rounded bg-white/10 text-xs text-white">+</button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
        <span className="text-sm text-white">🔒 Front Door</span>
        <button onClick={() => setLocked(!locked)} className={`px-3 py-1 rounded-lg text-xs ${locked ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>{locked ? 'Locked' : 'Unlocked'}</button>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 mt-2">
        <span className="text-sm text-white">🎵 Living Room Speaker</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Playing</span>
      </div>
    </ToolWrapper>
  )
}

function FirmwareTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Device model" label="Device" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📦 Firmware Info\n\nDevice: [Model]\nCurrent: v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 100)}\nLatest: v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 100)}\n\n📋 Changelog:\n• Bug fixes\n• Performance improvements\n• Security patches\n\n✅ ${Math.random() > 0.3 ? 'Up to date' : 'Update available'}\n📦 Size: ${(5 + Math.random() * 50).toFixed(0)} MB`); setLoading(false) }, 800) }} icon={Settings} label="Check Firmware" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function NetworkTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Network address" label="Network" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🌐 Network Diagnostics\n\nNetwork: [Your Network]\nSignal: ${(60 + Math.random() * 40).toFixed(0)}%\nFrequency: 2.4 GHz / 5 GHz\n\nDevices Connected: ${Math.floor(2 + Math.random() * 15)}\n\n📊 Performance:\n• Download: ${(50 + Math.random() * 450).toFixed(0)} Mbps\n• Upload: ${(10 + Math.random() * 90).toFixed(0)} Mbps\n• Ping: ${Math.floor(5 + Math.random() * 50)} ms\n\n🛡️ Security: ${['WPA3', 'WPA2'][Math.floor(Math.random() * 2)]}\n✅ Status: Healthy`); setLoading(false) }, 800) }} icon={Globe} label="Analyze Network" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function SensorMonitor({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><Thermometer className="w-6 h-6 text-red-400 mx-auto" /><div className="text-lg font-bold text-white">${(20 + Math.random() * 8).toFixed(1)}°C</div><div className="text-xs text-gray-500">Temperature</div></div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><Activity className="w-6 h-6 text-blue-400 mx-auto" /><div className="text-lg font-bold text-white">${(30 + Math.random() * 40).toFixed(0)}%</div><div className="text-xs text-gray-500">Humidity</div></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><Radar className="w-6 h-6 text-emerald-400 mx-auto" /><div className="text-lg font-bold text-white">${(Math.random() * 100).toFixed(0)}</div><div className="text-xs text-gray-500">Light Level</div></div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"><Activity className="w-6 h-6 text-amber-400 mx-auto" /><div className="text-lg font-bold text-white">${(Math.random() * 100).toFixed(0)}</div><div className="text-xs text-gray-500">Motion</div></div>
      </div>
      <ActionButton onClick={() => {}} icon={Radar} label="Refresh Sensors" variant="secondary" />
    </ToolWrapper>
  )
}

function ActuatorControl({ tool }: { tool: CsvTool }) {
  const [angle, setAngle] = useState(90); const [active, setActive] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-4">
        <div className={`w-24 h-24 mx-auto rounded-full border-4 ${active ? 'border-emerald-500' : 'border-gray-700'} flex items-center justify-center mb-4 transition-all ${active ? 'bg-emerald-500/10' : ''}`}>
          <div className="text-2xl font-bold text-white" style={{ transform: `rotate(${angle}deg)` }}>→</div>
        </div>
        <div className="text-sm text-gray-500">Position: {angle}°</div>
        <input type="range" min="0" max="180" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full mt-2" />
      </div>
      <ActionButton onClick={() => setActive(!active)} icon={active ? Shield : Zap} label={active ? 'Deactivate' : 'Activate'} />
    </ToolWrapper>
  )
}

function GPSTracker({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Device ID or name" label="Device" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📍 GPS Tracker\n\nDevice: [Device Name]\nStatus: Active\n\n📍 Current Location:\nLat: ${(20 + Math.random() * 30).toFixed(6)}° N\nLng: ${(70 + Math.random() * 30).toFixed(6)}° E\n\n📊 Movement:\n• Speed: ${(Math.random() * 60).toFixed(1)} km/h\n• Heading: ${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]}\n• Altitude: ${Math.floor(Math.random() * 200)} m\n\n🔋 Battery: ${(50 + Math.random() * 50).toFixed(0)}%\n✅ Location updated: ${new Date().toLocaleString()}`); setLoading(false) }, 800) }} icon={Map} label="Track Device" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function Map(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> }
function Radar(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6a6 6 0 1 0 6 6"/><path d="M12 10a2 2 0 1 0 2 2"/></svg> }
function Radio(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4"/><path d="M19.1 4.9a10 10 0 0 1 0 14.2"/><path d="M7.8 16.2a6 6 0 0 1 0-8.4"/><path d="M4.9 19.1a10 10 0 0 1 0-14.2"/></svg> }
