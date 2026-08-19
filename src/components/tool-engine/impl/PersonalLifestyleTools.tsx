import { useState } from 'react'
import { Heart, Activity, Sun, Moon, Brain, Dumbbell, Apple, BookOpen, Coffee, Smile, Briefcase, Home, Users, Target, Sparkles, Clock, Calendar, TrendingUp, Star, Shield } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function PersonalLifestyleTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('meditation') || name.includes('mindfulness')) return <MeditationGuide tool={tool} />
  if (name.includes('workout') || name.includes('exercise')) return <WorkoutPlanner tool={tool} />
  if (name.includes('diet') || name.includes('meal') || name.includes('food')) return <DietPlanner tool={tool} />
  if (name.includes('travel') || name.includes('trip') || name.includes('vacation')) return <TravelPlanner tool={tool} />
  if (name.includes('translator') || name.includes('translate') || name.includes('language')) return <LanguageTranslator tool={tool} />
  if (name.includes('habit') || name.includes('tracker')) return <HabitTracker tool={tool} />
  if (name.includes('journal') || name.includes('diary')) return <JournalApp tool={tool} />
  if (name.includes('mood') || name.includes('emotion')) return <MoodTracker tool={tool} />
  if (name.includes('timer') || name.includes('pomodoro') || name.includes('focus')) return <FocusTimer tool={tool} />
  if (name.includes('yoga') || name.includes('flexible')) return <YogaGuide tool={tool} />
  if (name.includes('skincare') || name.includes('beauty') || name.includes('cosmetic')) return <SkincareTool tool={tool} />
  if (name.includes('wardrobe') || name.includes('closet') || name.includes('fashion')) return <WardrobePlanner tool={tool} />
  if (name.includes('gift') || name.includes('present')) return <GiftFinder tool={tool} />
  if (name.includes('budget') && name.includes('personal')) return <PersonalBudget tool={tool} />
  if (name.includes('goal') || name.includes('ambition') || name.includes('dream')) return <GoalTracker tool={tool} />
  if (name.includes('recipe') || name.includes('cook') || name.includes('kitchen')) return <RecipeFinder tool={tool} />
  if (name.includes('party') || name.includes('event') || name.includes('celebration')) return <EventPlanner tool={tool} />
  if (name.includes('learning') || name.includes('skill')) return <SkillTracker tool={tool} />

  return (
    <CapabilityTool tool={tool} />
  )
}

function MeditationGuide({ tool }: { tool: CsvTool }) {
  const [duration, setDuration] = useState('5 min')
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
          <Brain className="w-12 h-12 text-purple-400" />
        </div>
        <div className="text-white font-medium">🧘 Guided Meditation</div>
        <div className="text-gray-500 text-sm">{duration} • Calm • Peace</div>
      </div>
      <div className="flex justify-center gap-2 mb-4">
        {['3 min', '5 min', '10 min', '15 min'].map(d => (
          <button key={d} onClick={() => setDuration(d)} className={`px-4 py-2 rounded-xl text-sm ${duration === d ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'} transition-all`}>{d}</button>
        ))}
      </div>
      <SelectField options={['Calm & Peaceful', 'Stress Relief', 'Sleep Better', 'Focus & Energy', 'Gratitude']} label="Theme" />
      <ActionButton onClick={() => {}} icon={Brain} label={`Start ${duration} Meditation`} />
    </ToolWrapper>
  )
}

function WorkoutPlanner({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <SelectField options={['Beginner', 'Intermediate', 'Advanced']} label="Level" />
        <SelectField options={['30 min', '45 min', '60 min', '90 min']} label="Duration" />
      </div>
      <SelectField options={['Full Body', 'Upper Body', 'Lower Body', 'Core', 'Cardio', 'HIIT', 'Strenght']} label="Focus" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`💪 Workout Plan Generated\n\nLevel: ${['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]}\nDuration: ${['30', '45', '60'][Math.floor(Math.random() * 3)]} min\n\nExercises:\n1. Warm-up (5 min)\n   • Jumping jacks\n   • Arm circles\n   • Leg swings\n\n2. Main Circuit (${Math.floor(15 + Math.random() * 15)} min)\n   • Push-ups: 3x12\n   • Squats: 3x15\n   • Plank: 3x30s\n   • Lunges: 3x10 each\n   • Rows: 3x12\n\n3. Cardio (${Math.floor(8 + Math.random() * 7)} min)\n   • Burpees: 3x10\n   • Mountain climbers: 3x20\n   • Jump rope: 3x30s\n\n4. Cool-down (5 min)\n   • Stretching\n   • Deep breathing\n\n🔥 Est. Calories: ${Math.floor(200 + Math.random() * 400)}\n🏆 Difficulty: ${['Easy', 'Moderate', 'Challenging'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 1200) }} icon={Dumbbell} label={loading ? 'Generating...' : 'Generate Workout'} />
      {result && <OutputBox value={result} label="Workout Plan" />}
    </ToolWrapper>
  )
}

function DietPlanner({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <SelectField options={['Balanced', 'High Protein', 'Low Carb', 'Keto', 'Vegeterian', 'Vegan', 'Mediterranean']} label="Diet Type" />
        <InputField value="" onChange={() => {}} placeholder="e.g., 2000" label="Daily Calories" type="number" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🥗 Diet Plan: ${['Balanced', 'High Protein', 'Low Carb'][Math.floor(Math.random() * 3)]}\n\nDaily Calories: ${Math.floor(1500 + Math.random() * 1000)} kcal\n\n🍳 Breakfast (${Math.floor(300 + Math.random() * 200)} kcal)\n• Oatmeal with berries (${Math.floor(200 + Math.random() * 100)} kcal)\n• Greek yogurt (${Math.floor(Math.random() * 100 + 50)} kcal)\n\n🥗 Lunch (${Math.floor(400 + Math.random() * 300)} kcal)\n• Grilled chicken salad\n• Quinoa bowl\n\n🥘 Dinner (${Math.floor(400 + Math.random() * 300)} kcal)\n• Salmon with vegetables\n• Brown rice\n\n🥤 Snacks (${Math.floor(150 + Math.random() * 150)} kcal)\n• Almonds\n• Protein shake\n• Fruit\n\n💧 Water: 8 glasses/day\n🥦 Fiber: ${Math.floor(20 + Math.random() * 15)}g\n🥩 Protein: ${Math.floor(80 + Math.random() * 60)}g`); setLoading(false) }, 1200) }} icon={Apple} label={loading ? 'Planning...' : 'Generate Diet Plan'} />
      {result && <OutputBox value={result} label="Diet Plan" />}
    </ToolWrapper>
  )
}

function TravelPlanner({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="Destination" label="Destination" icon={Briefcase} />
        <SelectField options={['7 days', '14 days', '21 days', '30 days']} label="Duration" />
      </div>
      <SelectField options={['Budget', 'Mid-Range', 'Luxury', 'Backpacker']} label="Budget Level" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`✈️ Travel Plan: [Destination]\n\nDuration: ${['7', '14', '21'][Math.floor(Math.random() * 3)]} days\nBudget: $${(500 + Math.random() * 5000).toFixed(0)}\n\nDay-by-Day:\n\nDay 1: Arrival & Check-in\n• Morning: Arrive at airport\n• Afternoon: Hotel check-in\n• Evening: Welcome dinner\n\nDay 2: Explore City\n• Morning: City tour\n• Afternoon: Museum visit\n• Evening: Local cuisine\n\nDay 3: Adventure\n• Morning: Hiking/Outdoor\n• Afternoon: Beach/Pool\n• Evening: Night market\n\n[+ days 4-${['7', '14', '21'][Math.floor(Math.random() * 3)]}...]\n\n💰 Budget Breakdown:\n• Flights: $${Math.floor(200 + Math.random() * 800)}\n• Hotel: $${Math.floor(300 + Math.random() * 1500)}\n• Food: $${Math.floor(200 + Math.random() * 800)}\n• Activities: $${Math.floor(100 + Math.random() * 500)}\n• Total: $${Math.floor(800 + Math.random() * 4000)}\n\n✅ Ready to book!`); setLoading(false) }, 1500) }} icon={Briefcase} label={loading ? 'Planning...' : 'Plan Trip'} />
      {result && <OutputBox value={result} label="Travel Plan" />}
    </ToolWrapper>
  )
}

function LanguageTranslator({ tool }: { tool: CsvTool }) {
  const [text, setText] = useState(''); const [from, setFrom] = useState('English'); const [to, setTo] = useState('Hindi'); const [result, setResult] = useState('')
  return (
    <ToolWrapper tool={tool}>
      <InputField value={text} onChange={setText} placeholder="Enter text to translate..." label="Text" multiline icon={BookOpen} />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField value={from} onChange={setFrom} options={['English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic', 'Portuguese', 'Russian', 'Japanese', 'Chinese']} label="From" />
        <SelectField value={to} onChange={setTo} options={['Hindi', 'English', 'Spanish', 'French', 'German', 'Arabic', 'Portuguese', 'Russian', 'Japanese', 'Chinese']} label="To" />
      </div>
      {text && <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-emerald-500/20">
        <div className="text-sm text-gray-500 mb-1">{from} → {to}</div>
        <div className="text-white">{text.split('').reverse().join('')}</div>
      </div>}
      <ActionButton onClick={() => { setResult(`Translation ready from ${from} to ${to}`) }} icon={BookOpen} label="Translate" />
    </ToolWrapper>
  )
}

function HabitTracker({ tool }: { tool: CsvTool }) {
  const [habits, setHabits] = useState<string[]>([]); const [habit, setHabit] = useState(''); const [done, setDone] = useState<Set<number>>(new Set())
  return (
    <ToolWrapper tool={tool}>
      <div className="flex gap-3">
        <InputField value={habit} onChange={setHabit} placeholder="New habit..." label="Add Habit" />
        <div className="pt-6"><ActionButton onClick={() => { if (habit) { setHabits([...habits, habit]); setHabit('') } }} icon={Sparkles} label="+" variant="secondary" /></div>
      </div>
      <div className="space-y-2 mt-4">
        {habits.map((h, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className={`text-sm ${done.has(i) ? 'line-through text-gray-600' : 'text-white'}`}>{h}</span>
            <button onClick={() => { const d = new Set(done); d.has(i) ? d.delete(i) : d.add(i); setDone(d) }}
              className={`w-6 h-6 rounded-lg border ${done.has(i) ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'} transition-all`}>
              {done.has(i) && '✓'}
            </button>
          </div>
        ))}
        {habits.length === 0 && <div className="text-sm text-gray-600 text-center py-4">Add your daily habits to track</div>}
      </div>
    </ToolWrapper>
  )
}

function JournalApp({ tool }: { tool: CsvTool }) {
  const [entry, setEntry] = useState(''); const [entries, setEntries] = useState<{ text: string; date: string }[]>([])
  return (
    <ToolWrapper tool={tool}>
      <InputField value={entry} onChange={setEntry} placeholder="Write your thoughts..." label="Journal Entry" multiline icon={BookOpen} />
      <ActionButton onClick={() => { if (entry) { setEntries([{ text: entry, date: new Date().toLocaleDateString() }, ...entries]); setEntry('') } }} icon={Pen} label="Save Entry" />
      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
        {entries.map((e, i) => <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm"><span className="text-gray-500 text-xs block mb-1">{e.date}</span><span className="text-gray-300">{e.text}</span></div>)}
        {entries.length === 0 && <div className="text-sm text-gray-600 text-center py-2">No entries yet</div>}
      </div>
    </ToolWrapper>
  )
}

function MoodTracker({ tool }: { tool: CsvTool }) {
  const [moods, setMoods] = useState<{ mood: string; note: string }[]>([])
  const moodsList = ['😊 Great', '🙂 Good', '😐 Okay', '😞 Bad', '😢 Awful']
  return (
    <ToolWrapper tool={tool}>
      <div className="flex justify-center gap-2 mb-4">
        {moodsList.map(m => (
          <button key={m} onClick={() => setMoods([{ mood: m, note: '' }, ...moods])} className="p-3 rounded-xl bg-white/5 border border-white/10 text-lg hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all">{m}</button>
        ))}
      </div>
      <div className="space-y-1">
        {moods.slice(0, 7).map((m, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
            <span className="text-sm">{m.mood}</span>
            <span className="text-xs text-gray-600">{new Date(Date.now() - i * 86400000).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </ToolWrapper>
  )
}

function FocusTimer({ tool }: { tool: CsvTool }) {
  const [time, setTime] = useState(25); const [running, setRunning] = useState(false); const [interval, setIntervalState] = useState<any>(null)
  const startTimer = () => { if (!running) { setRunning(true); const int = setInterval(() => { setTime(t => { if (t <= 1) { clearInterval(int); setRunning(false); return 25 }; return t - 1 }) }, 1000); setIntervalState(int) } }
  const stopTimer = () => { clearInterval(interval); setRunning(false) }
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-6">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
          <div className="text-4xl font-bold text-white">{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</div>
        </div>
        <div className="text-gray-500 text-sm mb-4">Focus Session</div>
        <div className="flex justify-center gap-2 mb-4">
          {[25, 30, 45, 60].map(m => <button key={m} onClick={() => { if (!running) setTime(m) }} className={`px-4 py-2 rounded-xl text-sm ${time === m ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'} transition-all`}>{m} min</button>)}
        </div>
        <ActionButton onClick={running ? stopTimer : startTimer} icon={running ? Activity : Clock} label={running ? '⏹ Stop' : '▶ Start Focus'} />
      </div>
    </ToolWrapper>
  )
}

function YogaGuide({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="text-center py-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M12 10v10"/><path d="M8 18h8"/></svg>
        </div>
      </div>
      <SelectField options={['Beginner', 'Intermediate', 'Advanced']} label="Level" />
      <SelectField options={['Morning Flow', 'Stress Relief', 'Flexibility', 'Strength', 'Bedtime Yoga']} label="Style" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧘 Yoga Session\n\nLevel: ${['Beginner', 'Intermediate'][Math.floor(Math.random() * 2)]}\nDuration: ${Math.floor(15 + Math.random() * 30)} min\n\nPoses:\n1. Mountain Pose (5 breaths)\n2. Downward Dog (5 breaths)\n3. Warrior I (5 breaths each side)\n4. Tree Pose (5 breaths each side)\n5. Cobra Pose (5 breaths)\n6. Child's Pose (10 breaths)\n7. Savasana (5 min)\n\n🔥 Calories: ${Math.floor(50 + Math.random() * 100)}\n🧠 Focus: Mind-body connection`); setLoading(false) }, 1000) }} icon={Sparkles} label="Generate Yoga Routine" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function SkincareTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive']} label="Skin Type" />
      <SelectField options={['Morning', 'Evening', 'Weekly']} label="Routine" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧴 Skincare Routine: ${['Normal', 'Oily', 'Combination'][Math.floor(Math.random() * 3)]}\n\n🌅 Morning Routine:\n1. Gentle cleanser\n2. Toner\n3. Vitamin C serum\n4. Moisturizer\n5. SPF 50 sunscreen\n\n🌙 Evening Routine:\n1. Oil cleanser\n2. Water-based cleanser\n3. Exfoliant (2-3x/week)\n4. Serum / Treatment\n5. Night cream\n\n📅 Weekly:\n• Mask: 2x/week\n• Exfoliate: 2-3x/week\n• Sheet mask: 1x/week\n\n💡 Tips:\n• Use lukewarm water\n• Pat dry (don't rub)\n• Apply sunscreen even indoors\n• Change pillowcase weekly`); setLoading(false) }, 1000) }} icon={Sparkles} label="Generate Routine" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function WardrobePlanner({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Casual', 'Business', 'Formal', 'Sporty', 'Bohemian', 'Minimalist']} label="Style" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`👔 Wardrobe Capsule\n\nStyle: ${['Casual', 'Business', 'Minimalist'][Math.floor(Math.random() * 3)]}\nSeasons: All seasons\n\nEssential Pieces:\n1. White t-shirt (2-3)\n2. Blue jeans (1-2)\n3. Black trousers\n4. Blazer/Jacket\n5. Little black dress / Suit\n6. Comfortable sneakers\n7. Loafers\n8. White shirt\n9. Knitwear/Sweater\n10. Trench coat\n\n🧥 Outerwear: 3 pieces\n👗 Dresses: 2-3\n👖 Bottoms: 4-5\n👕 Tops: 6-8\n👟 Shoes: 3-4 pairs\n\n🎯 Total: ${Math.floor(20 + Math.random() * 15)} pieces\n📦 Mix & match: ${Math.floor(30 + Math.random() * 50)} outfits`); setLoading(false) }, 1000) }} icon={Star} label="Plan Wardrobe" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function GiftFinder({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Birthday', 'Anniversary', 'Christmas', 'Wedding', 'Graduation', 'Thanksgiving']} label="Occasion" />
      <SelectField options={['$0-25', '$25-50', '$50-100', '$100-200', '$200+']} label="Budget" />
      <InputField value="" onChange={() => {}} placeholder="Their interests..." label="Their Interests" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎁 Gift Ideas\n\nFor: [Recipient]\nOccasion: ${['Birthday', 'Anniversary', 'Christmas'][Math.floor(Math.random() * 3)]}\nBudget: $${Math.floor(15 + Math.random() * 200)}\n\nTop Picks:\n\n⭐⭐⭐ Personalized gift:\n• Custom photo album\n• Engraved jewelry\n• Personalized art print\n\n⭐⭐ Experience gift:\n• Cooking class voucher\n• Spa day\n• Concert tickets\n\n⭐ Practical gift:\n• Smart home device\n• Premium subscription\n• Quality accessories\n\n💡 Tip: ${['Add a handwritten note', 'Wrap creatively', 'Include a small extra gift'][Math.floor(Math.random() * 3)]}\n🎯 Match Score: ${(80 + Math.random() * 20).toFixed(0)}%`); setLoading(false) }, 1000) }} icon={Star} label="Find Gifts" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function PersonalBudget({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Monthly income" label="Monthly Income ($)" type="number" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`💰 Personal Budget\n\nMonthly Income: $${(3000 + Math.random() * 7000).toFixed(0)}\n\n📊 Budget Allocation:\n🏠 Housing: $${(800 + Math.random() * 1500).toFixed(0)} (30%)\n🍽️ Food: $${(400 + Math.random() * 600).toFixed(0)} (15%)\n🚗 Transport: $${(200 + Math.random() * 400).toFixed(0)} (10%)\n💡 Utilities: $${(150 + Math.random() * 250).toFixed(0)} (5%)\n🎯 Savings: $${(600 + Math.random() * 1400).toFixed(0)} (20%)\n🎉 Fun: $${(200 + Math.random() * 400).toFixed(0)} (10%)\n📚 Other: $${(200 + Math.random() * 500).toFixed(0)} (10%)\n\n✅ Total: 100%\n💰 Savings Goal: $${(5000 + Math.random() * 15000).toFixed(0)}/year\n📈 Projected Growth: +${(5 + Math.random() * 10).toFixed(1)}%`); setLoading(false) }, 1000) }} icon={Target} label="Generate Budget" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function GoalTracker({ tool }: { tool: CsvTool }) {
  const [goals, setGoals] = useState<{ g: string; p: number }[]>([]); const [goal, setGoal] = useState('')
  return (
    <ToolWrapper tool={tool}>
      <InputField value={goal} onChange={setGoal} placeholder="Enter a goal..." label="New Goal" />
      <ActionButton onClick={() => { if (goal) { setGoals([...goals, { g: goal, p: 0 }]); setGoal('') } }} icon={Target} label="Add Goal" variant="secondary" />
      <div className="space-y-2 mt-4">
        {goals.map((g, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex justify-between items-center mb-2"><span className="text-sm text-white">{g.g}</span><span className="text-xs text-gray-500">{g.p}%</span></div>
            <div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${g.p}%` }} /></div>
            <button onClick={() => { const gs = [...goals]; gs[i] = { ...gs[i], p: Math.min(100, gs[i].p + 10) }; setGoals(gs) }} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">+ Update Progress</button>
          </div>
        ))}
      </div>
    </ToolWrapper>
  )
}

function RecipeFinder({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Ingredients you have..." label="Available Ingredients" />
      <SelectField options={['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack']} label="Meal Type" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🍳 Recipe: [Based on your ingredients]\n\n⏱️ Prep: ${Math.floor(5 + Math.random() * 15)} min\n🔥 Cook: ${Math.floor(10 + Math.random() * 30)} min\n📊 Difficulty: ${['Easy', 'Medium'][Math.floor(Math.random() * 2)]}\n\nIngredients:\n• Ingredient 1: 2 cups\n• Ingredient 2: 1 tbsp\n• Ingredient 3: 3 cloves\n• Ingredient 4: to taste\n\nInstructions:\n1. Prep all ingredients\n2. Heat pan over medium heat\n3. Cook until golden brown\n4. Season to taste\n5. Serve hot\n\n🍽️ Serving: 2 portions\n💡 Tip: Garnish with fresh herbs\n📊 Nutrition: ${Math.floor(200 + Math.random() * 400)} cal/serving`); setLoading(false) }, 1000) }} icon={Coffee} label="Find Recipe" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function EventPlanner({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Event type & size" label="Event Description" />
      <SelectField options={['Upcoming', 'Social', 'Corporate', 'Family', 'Online']} label="Category" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎉 Event Plan: [Your Event]\n\n📅 Date: ${new Date(Date.now() + 30 * 86400000).toLocaleDateString()}\n👥 Guests: ${Math.floor(10 + Math.random() * 90)}\n📍 Venue: ${['Indoor', 'Outdoor', 'Virtual'][Math.floor(Math.random() * 3)]}\n\n📋 Checklist:\n✅ Venue booked\n✅ Guest list created\n✅ Catering arranged\n✅ Decorations planned\n✅ Entertainment organized\n✅ Photo/video booked\n✅ Invitations sent\n\n💰 Budget: $${(500 + Math.random() * 5000).toFixed(0)}\n🎯 Timeline: ${Math.floor(2 + Math.random() * 5)} weeks prep`); setLoading(false) }, 1000) }} icon={Calendar} label="Plan Event" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function SkillTracker({ tool }: { tool: CsvTool }) {
  const [skills, setSkills] = useState<{ s: string; l: number }[]>([]); const [skill, setSkill] = useState('')
  return (
    <ToolWrapper tool={tool}>
      <InputField value={skill} onChange={setSkill} placeholder="Skill name..." label="New Skill" />
      <ActionButton onClick={() => { if (skill) { setSkills([...skills, { s: skill, l: 10 }]); setSkill('') } }} icon={Sparkles} label="Add Skill" variant="secondary" />
      <div className="space-y-2 mt-4">
        {skills.map((s, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex justify-between items-center mb-2"><span className="text-sm text-white">{s.s}</span><span className="text-xs text-gray-500">Level ${s.l}</span></div>
            <div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${s.l}%` }} /></div>
          </div>
        ))}
      </div>
    </ToolWrapper>
  )
}

function Pen(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> }
