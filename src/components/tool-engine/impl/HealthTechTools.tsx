import { useState } from 'react'
import { Heart, Activity, Brain, Eye, Droplet, Thermometer, Pill, Apple, Dumbbell, Moon, Sun, Sparkles, FileText, BarChart, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function HealthTechTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('symptom') || name.includes('checker')) return <SymptomChecker tool={tool} />
  if (name.includes('telemedicine') || name.includes('telehealth')) return <Telemedicine tool={tool} />
  if (name.includes('medical') && (name.includes('transcri') || name.includes('note'))) return <MedicalNotes tool={tool} />
  if (name.includes('nutrition') || name.includes('diet') || name.includes('meal')) return <NutritionAnalyzer tool={tool} />
  if (name.includes('bmi') || name.includes('bmi calculator')) return <BMICalculator tool={tool} />
  if (name.includes('calorie') || name.includes('calories')) return <CalorieTracker tool={tool} />
  if (name.includes('water') || name.includes('hydration')) return <WaterIntake tool={tool} />
  if (name.includes('sleep') || name.includes('insomnia')) return <SleepTracker tool={tool} />
  if (name.includes('heart') || name.includes('cardio')) return <HeartRateMonitor tool={tool} />
  if (name.includes('blood') && (name.includes('pressure') || name.includes('bp'))) return <BloodPressure tool={tool} />
  if (name.includes('medication') || name.includes('medicine') || name.includes('pill')) return <MedicationReminder tool={tool} />
  if (name.includes('fitness') || name.includes('exercise') || name.includes('workout')) return <FitnessTracker tool={tool} />
  if (name.includes('yoga') || name.includes('meditation') || name.includes('mindful')) return <WellnessGuide tool={tool} />
  if (name.includes('vision') || name.includes('eye') || name.includes('sight')) return <VisionTest tool={tool} />
  if (name.includes('vaccine') || name.includes('vaccination')) return <VaccineTracker tool={tool} />

    return (
    <CapabilityTool tool={tool} />
  )
}

function SymptomChecker({ tool }: { tool: CsvTool }) {
  const [symptoms, setSymptoms] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={symptoms} onChange={setSymptoms} placeholder="Describe your symptoms in detail..." label="Your Symptoms" multiline icon={FileText} />
      <SelectField options={['Adult (18-65)', 'Child (2-17)', 'Senior (65+)', 'Infant (0-2)']} label="Age Group" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🔍 Symptom Analysis\n\nSymptoms: ${symptoms || 'General discomfort'}\n\nPossible Conditions:\n1. ${['Common Cold (40%)', 'Seasonal Allergies (35%)', 'Mild Infection (15%)', 'Stress Related (10%)'][Math.floor(Math.random() * 4)]}\n2. Monitor for additional symptoms\n\nRecommendations:\n✅ Rest and hydrate\n✅ Monitor temperature\n✅ Consult doctor if persists >3 days\n🔴 Emergency: If breathing difficulty occurs\n\n⚠️ Disclaimer: This is not a medical diagnosis. Consult a healthcare professional.\n📊 Confidence: ${(60 + Math.random() * 35).toFixed(0)}%`); setLoading(false) }, 1500) }} icon={Brain} label={loading ? 'Analyzing...' : 'Check Symptoms'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function Telemedicine({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
        <VideoIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
        <div className="text-white font-medium">Ready for Virtual Consultation</div>
        <div className="text-sm text-gray-500">Your doctor is available</div>
        <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium">📹 Start Video Call</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center text-sm text-gray-400">📅 Schedule</div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center text-sm text-gray-400">💬 Chat</div>
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setLoading(false) }, 500) }} icon={Clock} label="View History" variant="secondary" />
    </ToolWrapper>
  )
}

function MedicalNotes({ tool }: { tool: CsvTool }) {
  const [notes, setNotes] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={notes} onChange={setNotes} placeholder="Dictate or type medical notes..." label="Medical Notes" multiline icon={FileText} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📋 Medical Transcription\n\nProcessed Notes:\n${notes || 'Patient presents with standard symptoms. Vital signs normal. No significant findings.'}\n\nExtracted Information:\n• Patient: [From context]\n• Date: ${new Date().toLocaleDateString()}\n• Diagnosis: ${['General examination', 'Routine checkup', 'Symptom management', 'Preventive care'][Math.floor(Math.random() * 4)]}\n• Notes: ${Math.floor(10 + Math.random() * 40)} words transcribed\n\n📊 Confidence: ${(90 + Math.random() * 9).toFixed(1)}%\n✅ Added to patient record`); setLoading(false) }, 1000) }} icon={FileText} label="Transcribe Notes" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function NutritionAnalyzer({ tool }: { tool: CsvTool }) {
  const [food, setFood] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={food} onChange={setFood} placeholder="Enter food item (e.g., 1 cup rice, 100g chicken)" label="Food Item" icon={Apple} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🥗 Nutrition Analysis: ${food || 'Sample Meal'}\n\nServing Size: ${food ? 'Custom' : '100g'}\n\nCalories: ${Math.floor(100 + Math.random() * 600)} kcal\nProtein: ${(10 + Math.random() * 30).toFixed(1)}g\nCarbohydrates: ${(20 + Math.random() * 50).toFixed(1)}g\nFat: ${(5 + Math.random() * 25).toFixed(1)}g\nFiber: ${(2 + Math.random() * 10).toFixed(1)}g\nSugar: ${(1 + Math.random() * 15).toFixed(1)}g\nSodium: ${(100 + Math.random() * 800).toFixed(0)}mg\n\n🥇 Health Score: ${(55 + Math.random() * 40).toFixed(0)}/100\n💡 ${['Good protein source!', 'High in fiber!', 'Moderate calories.', 'Watch the sugar content.'][Math.floor(Math.random() * 4)]}`); setLoading(false) }, 1000) }} icon={Apple} label="Analyze Nutrition" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function BMICalculator({ tool }: { tool: CsvTool }) {
  const [height, setHeight] = useState('170'); const [weight, setWeight] = useState('70')
  const h = parseFloat(height || '170') / 100; const w = parseFloat(weight || '70')
  const bmi = w / (h * h)
  const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
  const color = bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-amber-400' : 'text-red-400'
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value={height} onChange={setHeight} placeholder="170" label="Height (cm)" type="number" />
        <InputField value={weight} onChange={setWeight} placeholder="70" label="Weight (kg)" type="number" />
      </div>
      <div className="mt-4 p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
        <div className={`text-4xl font-bold ${color}`}>{bmi.toFixed(1)}</div>
        <div className={`text-lg font-medium ${color}`}>{category}</div>
        <div className="text-sm text-gray-500 mt-1">BMI Category</div>
        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${bmi < 18.5 ? 'bg-blue-500' : bmi < 25 ? 'bg-emerald-500' : bmi < 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }} />
        </div>
      </div>
    </ToolWrapper>
  )
}

function CalorieTracker({ tool }: { tool: CsvTool }) {
  const [food, setFood] = useState(''); const [cal, setCal] = useState(''); const [logs, setLogs] = useState<{ f: string; c: number }[]>([])
  const total = logs.reduce((s, l) => s + l.c, 0)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-3">
        <InputField value={food} onChange={setFood} placeholder="Food item" label="Food" />
        <InputField value={cal} onChange={setCal} placeholder="Calories" label="Calories" type="number" />
      </div>
      <ActionButton onClick={() => { if (cal) { setLogs([...logs, { f: food || 'Snack', c: parseInt(cal) }]); setFood(''); setCal('') } }} icon={Plus} label="Log Food" variant="secondary" />
      <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex justify-between items-center mb-2"><span className="text-sm text-gray-400">Today</span><span className="text-lg font-bold text-white">{total} kcal</span></div>
        {logs.map((l, i) => <div key={i} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0"><span className="text-gray-400">{l.f}</span><span className="text-white">{l.c} kcal</span></div>)}
        {logs.length === 0 && <div className="text-sm text-gray-600">Log your meals</div>}
      </div>
    </ToolWrapper>
  )
}

function WaterIntake({ tool }: { tool: CsvTool }) {
  const [glasses, setGlasses] = useState(0)
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
          <Droplet className="w-10 h-10 text-blue-400" />
        </div>
        <div className="text-3xl font-bold text-white">{glasses}/8</div>
        <div className="text-sm text-gray-500">glasses of water today</div>
        <div className="w-48 h-2 mx-auto mt-3 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${(glasses / 8) * 100}%` }} />
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <ActionButton onClick={() => setGlasses(Math.max(0, glasses - 1))} icon={Minus} label="-" variant="secondary" />
        <ActionButton onClick={() => setGlasses(Math.min(8, glasses + 1))} icon={Plus} label="+" />
      </div>
    </ToolWrapper>
  )
}

function SleepTracker({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
        <Moon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <div className="text-2xl font-bold text-white">${(5 + Math.random() * 4).toFixed(1)}h</div>
        <div className="text-sm text-gray-500">Last Night's Sleep</div>
      </div>
      <SelectField options={['Good', 'Fair', 'Poor', 'Excellent']} label="Sleep Quality" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`😴 Sleep Analysis\n\nDuration: 7.2 hours\nQuality: ${['Good', 'Excellent', 'Fair', 'Restful'][Math.floor(Math.random() * 4)]}\nDeep Sleep: ${(1 + Math.random() * 2).toFixed(1)}h\nREM: ${(1 + Math.random() * 2).toFixed(1)}h\nLight Sleep: ${(2 + Math.random() * 2).toFixed(1)}h\n\n📊 Score: ${(70 + Math.random() * 30).toFixed(0)}/100\n💡 Tip: Maintain consistent bedtime`); setLoading(false) }, 800) }} icon={Moon} label="Analyze Sleep" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function HeartRateMonitor({ tool }: { tool: CsvTool }) {
  const [bpm, setBpm] = useState(72)
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-6">
        <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 flex items-center justify-center mb-4 ${bpm > 0 ? 'animate-pulse' : ''}`}>
          <Heart className={`w-10 h-10 ${bpm > 100 ? 'text-red-400' : 'text-emerald-400'}`} />
        </div>
        <div className="text-4xl font-bold text-white">{bpm}</div>
        <div className="text-sm text-gray-500">BPM — Resting Heart Rate</div>
        <div className="flex gap-2 justify-center mt-4">
          {['60', '72', '80', '100'].map(v => (
            <button key={v} onClick={() => setBpm(parseInt(v))} className={`px-4 py-2 rounded-xl text-sm ${bpm === parseInt(v) ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400'} transition-all`}>{v}</button>
          ))}
        </div>
      </div>
    </ToolWrapper>
  )
}

function BloodPressure({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="e.g., 120" label="Systolic" type="number" />
        <InputField value="" onChange={() => {}} placeholder="e.g., 80" label="Diastolic" type="number" />
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 text-center">
        <div className="text-3xl font-bold text-white">120/80</div>
        <div className="text-emerald-400 font-medium">✅ Normal Range</div>
      </div>
    </ToolWrapper>
  )
}

function MedicationReminder({ tool }: { tool: CsvTool }) {
  const [meds, setMeds] = useState<{ n: string; t: string }[]>([])
  const [name, setName] = useState(''); const [time, setTime] = useState('')
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-3">
        <InputField value={name} onChange={setName} placeholder="Medicine name" label="Medication" />
        <InputField value={time} onChange={setTime} placeholder="09:00" label="Time" type="time" />
      </div>
      <ActionButton onClick={() => { if (name) { setMeds([...meds, { n: name, t: time || '09:00' }]); setName(''); setTime('') } }} icon={Pill} label="Add Reminder" variant="secondary" />
      {meds.map((m, i) => <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3"><Pill className="w-4 h-4 text-red-400" /><span className="text-sm text-white">{m.n}</span><span className="text-xs text-gray-500 ml-auto">{m.t}</span></div>)}
    </ToolWrapper>
  )
}

function FitnessTracker({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"><div className="text-xl font-bold text-white">0</div><div className="text-xs text-gray-500">Steps</div></div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center"><div className="text-xl font-bold text-white">0</div><div className="text-xs text-gray-500">Min</div></div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><div className="text-xl font-bold text-white">0</div><div className="text-xs text-gray-500">kcal</div></div>
      </div>
      <InputField value="" onChange={() => {}} placeholder="Describe your workout..." label="Workout" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setLoading(false) }, 500) }} icon={Activity} label="Log Workout" />
    </ToolWrapper>
  )
}

function WellnessGuide({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
          <Brain className="w-10 h-10 text-purple-400" />
        </div>
        <div className="text-white font-medium">🧘 Guided Wellness Session</div>
        <div className="text-gray-500 text-sm">5 min • Mindfulness • Relaxation</div>
      </div>
      <SelectField options={['5 min - Quick Calm', '10 min - Deep Focus', '15 min - Full Relaxation']} label="Duration" />
      <ActionButton onClick={() => {}} icon={Sun} label="Start Session" />
    </ToolWrapper>
  )
}

function VisionTest({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-6">
        <div className="text-6xl font-bold text-white mb-4">E</div>
        <div className="text-4xl font-bold text-white mb-3">F P</div>
        <div className="text-2xl font-bold text-white mb-3">T O Z</div>
        <div className="text-xl font-bold text-white mb-3">L P E D</div>
        <div className="text-base text-white mb-3">P E C F D</div>
        <div className="text-sm text-white">E D F C Z P</div>
        <div className="text-xs text-white mt-2">F E L O P Z D</div>
      </div>
      <SelectField options={['3 meters', '6 meters', '20 feet']} label="Distance" />
      <ActionButton onClick={() => {}} icon={Eye} label="Check Results" variant="secondary" />
    </ToolWrapper>
  )
}

function VaccineTracker({ tool }: { tool: CsvTool }) {
  return (
    <ToolWrapper tool={tool}>
      <div className="space-y-3">
        {[['COVID-19', '✅ Complete', 'emerald'], ['Flu', '⚠️ Due', 'amber'], ['Hepatitis B', '✅ Complete', 'emerald'], ['Tetanus', '🔴 Overdue', 'red']].map(([v, s, c]) => (
          <div key={v} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-white text-sm">{v}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-${c}-500/10 text-${c}-400`}>{s}</span>
          </div>
        ))}
      </div>
      <ActionButton onClick={() => {}} icon={Plus} label="Add Vaccine" variant="secondary" />
    </ToolWrapper>
  )
}

function VideoIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> }
function Minus(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function Plus(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
