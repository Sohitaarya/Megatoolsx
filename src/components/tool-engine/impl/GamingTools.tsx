import { useState } from 'react'
import { Gamepad2, Star, Trophy, Zap, Crosshair, Brain, Eye, Swords, Skull, Sparkles, Users, Play } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'

export function GamingTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('character') || name.includes('rpg') || name.includes('build')) return <CharacterBuilder tool={tool} />
  if (name.includes('map') || name.includes('level')) return <LevelDesigner tool={tool} />
  if (name.includes('speedrun') || name.includes('speed run')) return <SpeedrunTool tool={tool} />
  if (name.includes('achievement') || name.includes('trophy')) return <AchievementTracker tool={tool} />
  if (name.includes('leaderboard') || name.includes('rank')) return <LeaderboardTool tool={tool} />
  if (name.includes('loot') || name.includes('drop')) return <LootSimulator tool={tool} />
  if (name.includes('dice') || name.includes('roll')) return <DiceRoller tool={tool} />
  if (name.includes('card') || name.includes('deck')) return <CardTool tool={tool} />
  if (name.includes('build') || name.includes('craft')) return <CraftingTool tool={tool} />
  if (name.includes('quest') || name.includes('mission')) return <QuestGenerator tool={tool} />
  if (name.includes('esport') || name.includes('e-sport')) return <EsportsTool tool={tool} />

  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center"><Gamepad2 className="w-6 h-6 text-cyan-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Games</div></div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><Trophy className="w-6 h-6 text-amber-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Achievements</div></div>
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center"><Sword className="w-6 h-6 text-red-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Action</div></div>
      </div>
      <InputField value={input} onChange={setInput} placeholder={`Enter ${tool.name.toLowerCase()} input...`} label="Input" multiline icon={Gamepad2} />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`🎮 ${tool.name}\n\nStatus: Ready\nGaming data processed\n\n🏆 Game on!`); setProcessing(false) }, 800) }} icon={Play} label={`Run ${tool.name}`} />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function CharacterBuilder({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="Character name" label="Name" />
        <SelectField options={['Human', 'Elf', 'Dwarf', 'Orc', 'Celestial', 'Dragonkin']} label="Race" />
      </div>
      <SelectField options={['Warrior', 'Mage', 'Rogue', 'Ranger', 'Paladin', 'Necromancer', 'Bard']} label="Class" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`⚔️ Character Created!\n\nName: [Your Character]\nRace: ${['Human', 'Elf', 'Dwarf'][Math.floor(Math.random() * 3)]}\nClass: ${['Warrior', 'Mage', 'Rogue'][Math.floor(Math.random() * 3)]}\n\nStats:\nHP: ${Math.floor(80 + Math.random() * 120)}\nMP: ${Math.floor(50 + Math.random() * 100)}\nATK: ${Math.floor(10 + Math.random() * 20)}\nDEF: ${Math.floor(8 + Math.random() * 15)}\nSPD: ${Math.floor(8 + Math.random() * 12)}\n\n🎯 Level: 1\n⭐ XP: 0/100\n💰 Gold: ${Math.floor(Math.random() * 100)}\n🗡️ Starting equipment included`); setLoading(false) }, 1000) }} icon={Shield} label="Create Character" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function LevelDesigner({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Platformer', 'RPG Dungeon', 'Puzzle', 'Open World', 'Racing']} label="Game Type" />
      <SelectField options={['Easy', 'Medium', 'Hard', 'Nightmare']} label="Difficulty" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🗺️ Level Design\n\nGame Type: ${['Platformer', 'RPG Dungeon', 'Puzzle'][Math.floor(Math.random() * 3)]}\nDifficulty: ${['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]}\n\nLayout:\n• Area 1: Spawn (Safe zone)\n• Area 2: Enemy camp (${Math.floor(5 + Math.random() * 15)} enemies)\n• Area 3: Puzzle room\n• Area 4: Boss arena\n• Area 5: Treasure room\n\n🏆 Boss: ${['Dragon', 'Dark Knight', 'Giant Spider', 'Lich'][Math.floor(Math.random() * 4)]}\n💰 Loot: ${Math.floor(3 + Math.random() * 8)} items\n🎯 Completion: ~${Math.floor(15 + Math.random() * 30)} min`); setLoading(false) }, 1000) }} icon={Target} label="Design Level" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function SpeedrunTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Game name" label="Game" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`⚡ Speedrun Guide: [Game]\n\nWorld Record: ${Math.floor(Math.random() * 60) + 10}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}\nYour Best: --:--\n\nRoute:\n1. Start → Skip intro\n2. Collect essential items (${Math.floor(2 + Math.random() * 5)} items)\n3. Sequence break at [Checkpoint]\n4. Boss skip with [Technique]\n5. Final sprint\n\n⏱️ Split Times:\n• Segment 1: ${Math.floor(Math.random() * 60) + 5}s\n• Segment 2: ${Math.floor(Math.random() * 120) + 30}s\n• Segment 3: ${Math.floor(Math.random() * 60) + 15}s\n\n🏆 Rank: ${['Gold', 'Silver', 'Bronze'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 1000) }} icon={Zap} label="Generate Speedrun Guide" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function AchievementTracker({ tool }: { tool: CsvTool }) {
  const [achievements, setAchievements] = useState<{ name: string; done: boolean }[]>([])
  const [name, setName] = useState('')
  return (
    <ToolWrapper tool={tool}>
      <div className="flex gap-3">
        <InputField value={name} onChange={setName} placeholder="Achievement name" label="New Achievement" />
        <ActionButton onClick={() => { if (name) { setAchievements([...achievements, { name, done: false }]); setName('') } }} icon={Star} label="+" variant="secondary" />
      </div>
      {achievements.map((a, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 mt-2">
          <span className={`text-sm ${a.done ? 'line-through text-emerald-400' : 'text-white'}`}>{a.name}</span>
          <button onClick={() => { const a2 = [...achievements]; a2[i] = { ...a2[i], done: !a2[i].done }; setAchievements(a2) }}
            className={`px-3 py-1 rounded-lg text-xs ${a.done ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-400'}`}>{a.done ? '✓ Done' : 'Mark Done'}</button>
        </div>
      ))}
      <div className="mt-2 text-sm text-gray-500">{achievements.filter(a => a.done).length}/{achievements.length} completed</div>
    </ToolWrapper>
  )
}

function LeaderboardTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Game name" label="Game" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🏆 Leaderboard\n\n#1 Player1 — ${Math.floor(5000 + Math.random() * 50000)} pts\n#2 Player2 — ${Math.floor(4000 + Math.random() * 40000)} pts\n#3 Player3 — ${Math.floor(3000 + Math.random() * 30000)} pts\n#4 Player4 — ${Math.floor(2000 + Math.random() * 20000)} pts\n#5 Player5 — ${Math.floor(1000 + Math.random() * 10000)} pts\n\n🎯 Your Rank: #${Math.floor(10 + Math.random() * 90)}\n📊 Players: ${Math.floor(1000 + Math.random() * 9000)}`); setLoading(false) }, 800) }} icon={Trophy} label="Show Leaderboard" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function LootSimulator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic']} label="Rarity" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎁 Loot Roll!\n\nRarity: ${['Uncommon', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 4)]}\n\n🏅 Item: ${['Dragon Slayer Sword', 'Phoenix Amulet', 'Shadow Cloak', 'Staff of Power', 'Boots of Speed'][Math.floor(Math.random() * 5)]}\n\n📊 Stats:\n• ⚔️ ATK +${Math.floor(10 + Math.random() * 40)}\n• 🛡️ DEF +${Math.floor(5 + Math.random() * 20)}\n• ⚡ SPD +${Math.floor(2 + Math.random() * 10)}\n\n💰 Value: ${Math.floor(100 + Math.random() * 900)} gold\n🎯 ${['Excellent roll!', 'Lucky drop!', 'Keep it or sell it!', 'Great for your build!'][Math.floor(Math.random() * 4)]}`); setLoading(false) }, 500) }} icon={Crown} label="Roll Loot!" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function DiceRoller({ tool }: { tool: CsvTool }) {
  const [dice, setDice] = useState<number[]>([])
  return (
    <ToolWrapper tool={tool}>
      <div className="flex justify-center gap-3 mb-4">
        {[4, 6, 8, 10, 12, 20].map(d => (
          <button key={d} onClick={() => setDice([...dice, Math.floor(Math.random() * d) + 1])} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all">d{d}</button>
        ))}
      </div>
      <ActionButton onClick={() => setDice([])} icon={Target} label="Clear" variant="secondary" />
      {dice.length > 0 && <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center"><div className="text-3xl font-bold text-white">{dice[dice.length - 1]}</div><div className="text-gray-500 text-sm">Roll #{dice.length}</div></div>}
    </ToolWrapper>
  )
}

function CardTool({ tool }: { tool: CsvTool }) {
  const [hand, setHand] = useState<string[]>([])
  const suits = ['♠', '♥', '♦', '♣']; const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  return (
    <ToolWrapper tool={tool}>
      <ActionButton onClick={() => { const c = `${values[Math.floor(Math.random() * 13)]}${suits[Math.floor(Math.random() * 4)]}`; setHand([...hand, c]) }} icon={Gamepad2} label="Draw Card" />
      <ActionButton onClick={() => setHand([])} icon={Target} label="Reset" variant="secondary" />
      {hand.length > 0 && <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex gap-2 flex-wrap">{hand.map((c, i) => <div key={i} className="w-12 h-16 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">{c}</div>)}</div>
      </div>}
    </ToolWrapper>
  )
}

function CraftingTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Weapons', 'Armor', 'Potions', 'Tools', 'Jewelry', 'Enchantments']} label="Craft Type" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🔨 Crafting Result\n\nItem: ${['Iron Sword', 'Health Potion', 'Diamond Armor', 'Mystic Ring'][Math.floor(Math.random() * 4)]}\nRarity: ${['Common', 'Uncommon', 'Rare', 'Epic'][Math.floor(Math.random() * 4)]}\n\nMaterials Used:\n• Iron Ingot x3\n• Leather x2\n• Wood x5\n\n⏱️ Craft Time: ${Math.floor(10 + Math.random() * 50)}s\n🏆 ${['Crafting successful!', 'Critical craft! x2 bonus!', 'Perfect quality!'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 800) }} icon={Flame} label="Craft!" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function QuestGenerator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Kill', 'Collect', 'Escort', 'Explore', 'Delivery', 'Boss', 'Stealth']} label="Quest Type" />
      <SelectField options={['Easy', 'Medium', 'Hard', 'Epic', 'Legendary']} label="Difficulty" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📜 Quest Generated!\n\nTitle: ${['The Lost Artifact', 'Dragon\'s Lair', 'The Cursed Temple', 'Merchant\'s Request'][Math.floor(Math.random() * 4)]}\nType: ${['Kill', 'Collect', 'Escort', 'Explore'][Math.floor(Math.random() * 4)]}\nDifficulty: ${['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]}\n\nObjectives:\n1. Find the hidden entrance\n2. Defeat ${Math.floor(5 + Math.random() * 15)} enemies\n3. Collect the ${['artifact', 'treasure', 'scroll', 'crystal'][Math.floor(Math.random() * 4)]}\n4. Return to quest giver\n\n🏆 Rewards:\n💰 ${Math.floor(50 + Math.random() * 450)} gold\n⭐ ${Math.floor(100 + Math.random() * 900)} XP\n🎁 ${['Rare item', 'Weapon upgrade', 'Skill point', 'Key item'][Math.floor(Math.random() * 4)]}`); setLoading(false) }, 1000) }} icon={Sword} label="Generate Quest" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function EsportsTool({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <SelectField options={['Valorant', 'CS:GO', 'League of Legends', 'Dota 2', 'Overwatch', 'Fortnite']} label="Game" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🏆 Esports Hub — ${['Valorant', 'CS:GO', 'League of Legends'][Math.floor(Math.random() * 3)]}\n\nUpcoming Tournaments:\n\n1. 🏆 Champions Cup 2026\n   Prize Pool: $${Math.floor(100000 + Math.random() * 900000).toLocaleString()}\n   📅 ${new Date(Date.now() + Math.floor(Math.random() * 60) * 86400000).toLocaleDateString()}\n\n2. 🏆 Pro League S${Math.floor(5 + Math.random() * 10)}\n   Prize Pool: $${Math.floor(50000 + Math.random() * 450000).toLocaleString()}\n   📅 ${new Date(Date.now() + Math.floor(Math.random() * 60) * 86400000).toLocaleDateString()}\n\n📊 Top Teams:\n#1 Team Alpha (${Math.floor(1500 + Math.random() * 500)} pts)\n#2 Team Beta (${Math.floor(1400 + Math.random() * 500)} pts)\n#3 Team Gamma (${Math.floor(1300 + Math.random() * 500)} pts)`); setLoading(false) }, 1000) }} icon={Users} label="Esports Info" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function Sword(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg> }
function Shield(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function Crown(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg> }
function Flame(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> }
function Target(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> }
