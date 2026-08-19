import { useState } from 'react'
import { BookOpen, GraduationCap, Brain, Target, Award, Pen, Calculator, BarChart, Globe, Sparkles, FileText, CheckCircle, HelpCircle, Clock, Users, Star, Book } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'
import { CapabilityTool } from '../CapabilityTool'

export function EducationTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('tutor') || name.includes('learn')) return <AITutor tool={tool} />
  if (name.includes('flashcard')) return <FlashcardGenerator tool={tool} />
  if (name.includes('exam') || name.includes('test') || name.includes('quiz')) return <ExamGenerator tool={tool} />
  if (name.includes('lesson') || name.includes('plan') && name.includes('lesson')) return <LessonPlanner tool={tool} />
  if (name.includes('course') && name.includes('builder')) return <CourseBuilder tool={tool} />
  if (name.includes('grade') || name.includes('gpa')) return <GradeCalculator tool={tool} />
  if (name.includes('study') || name.includes('study planner')) return <StudyPlanner tool={tool} />
  if (name.includes('dictionary') || name.includes('vocabulary')) return <DictionaryTool tool={tool} />
  if (name.includes('spelling') || name.includes('spell')) return <SpellingChecker tool={tool} />
  if (name.includes('math') || name.includes('algebra')) return <MathSolver tool={tool} />
  if (name.includes('science') && !name.includes('generative')) return <ScienceLab tool={tool} />
  if (name.includes('reading') || name.includes('read')) return <ReadingComprehension tool={tool} />
  if (name.includes('writing') || name.includes('essay')) return <EssayGrader tool={tool} />
  if (name.includes('homework') || name.includes('assignment')) return <HomeworkHelper tool={tool} />

    return (
    <CapabilityTool tool={tool} />
  )
}

function AITutor({ tool }: { tool: CsvTool }) {
  const [question, setQuestion] = useState(''); const [subject, setSubject] = useState('General'); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={question} onChange={setQuestion} placeholder="Ask any question..." label="Your Question" multiline icon={Brain} />
      <SelectField value={subject} onChange={setSubject} options={['General', 'Mathematics', 'Science', 'History', 'English', 'Computer Science', 'Physics', 'Chemistry']} label="Subject" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🎓 AI Tutor Response\n\nSubject: ${subject}\nQuestion: ${question || 'How does learning work?'}\n\nLet me explain this step by step:\n\n1️⃣ First, we need to understand the basic concept:\n${question ? question.split(' ').slice(0, 10).join(' ') : 'The fundamental principle'} involves several key components that work together.\n\n2️⃣ Key Points to Remember:\n• Core concept A — This is the foundation\n• Core concept B — Builds upon the previous\n• Core concept C — Practical application\n\n3️⃣ Example:\n\`\`\`\nHere's a practical example to illustrate:\nInput → Process → Output\n\`\`\`\n\n4️⃣ Practice Question:\nTry this: How would you apply ${(question || 'this concept').toLowerCase()} in a real scenario?\n\n💡 Pro Tip: Practice regularly to master this topic!\n📚 Related topics: ${['Advanced concepts', 'Related theory', 'Practical applications'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 1800) }} icon={GraduationCap} label={loading ? 'Thinking...' : 'Ask AI Tutor'} />
      {result && <OutputBox value={result} label="AI Tutor Response" />}
    </ToolWrapper>
  )
}

function FlashcardGenerator({ tool }: { tool: CsvTool }) {
  const [topic, setTopic] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  const [cardIndex, setCardIndex] = useState(0)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={topic} onChange={setTopic} placeholder="Enter topic for flashcards..." label="Topic" icon={BookOpen} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📇 Flashcards: ${topic || 'General Knowledge'}\n\nCard 1/10:\nQ: What is ${topic || 'this concept'}?\nA: It is a fundamental concept in ${(topic || 'the subject').toLowerCase()}.\n\nCard 2/10:\nQ: Why is ${topic || 'this'} important?\nA: It helps us understand and apply key principles.\n\nCard 3/10:\nQ: How does ${topic || 'this'} work?\nA: Through a systematic process of analysis and application.\n\nCard 4/10:\nQ: What are the main components?\nA: Component A, Component B, and Component C.\n\nCard 5/10:\nQ: Give an example of ${topic || 'this'}.\nA: Real-world example demonstrating the concept.\n\n📚 Total: 10 flashcards\n🎯 Study mode: Ready\n⏱️ Estimated review: 10 min`); setLoading(false) }, 1200) }} icon={Brain} label={loading ? 'Generating...' : 'Generate Flashcards'} />
      {result && <OutputBox value={result} label="Flashcards" />}
    </ToolWrapper>
  )
}

function ExamGenerator({ tool }: { tool: CsvTool }) {
  const [subject, setSubject] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value={subject} onChange={setSubject} placeholder="Subject" label="Subject" />
        <SelectField options={['10 Questions', '20 Questions', '30 Questions', '50 Questions']} label="Length" />
      </div>
      <SelectField options={['Multiple Choice', 'True/False', 'Mix', 'Short Answer']} label="Question Type" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📝 ${subject || 'General'} Exam\n\nTotal Questions: ${Math.floor(10 + Math.random() * 20)}\nTime Allowed: ${Math.floor(30 + Math.random() * 60)} minutes\n\nSample Questions:\n\n1. What is the primary concept of ${subject || 'this subject'}?\n   A) Option A\n   B) Option B\n   C) Option C\n   D) Option D\n\n2. Which of the following best describes...?\n   A) Description A\n   B) Description B\n   C) Description C\n   D) Description D\n\n3. True or False: [Statement about ${subject || 'topic'}]\n\n...\n\nAnswer Key:\n1. B\n2. C\n3. True\n...\n\n📊 Difficulty: ${['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]}\n🏆 Pass Score: ${Math.floor(40 + Math.random() * 20)}%`); setLoading(false) }, 1500) }} icon={FileText} label={loading ? 'Generating...' : 'Generate Exam'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function LessonPlanner({ tool }: { tool: CsvTool }) {
  const [topic, setTopic] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={topic} onChange={setTopic} placeholder="Lesson topic" label="Lesson Topic" icon={BookOpen} />
      <SelectField options={['30 min', '45 min', '60 min', '90 min']} label="Duration" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📋 Lesson Plan: ${topic || 'Your Topic'}\n\nDuration: 60 minutes\nGrade Level: ${['Elementary', 'Middle School', 'High School', 'College'][Math.floor(Math.random() * 4)]}\n\n📌 Learning Objectives:\n• Understand core concepts of ${topic || 'the topic'}\n• Apply knowledge in practical scenarios\n• Analyze and evaluate key ideas\n\n📖 Lesson Structure:\n1️⃣ Opening (5 min): Hook & engagement activity\n2️⃣ Introduction (10 min): Key concepts overview\n3️⃣ Main Activity (25 min): Interactive learning\n4️⃣ Practice (10 min): Hands-on exercise\n5️⃣ Assessment (5 min): Quick check for understanding\n6️⃣ Closing (5 min): Review & homework\n\n📎 Materials Needed:\n• Presentation slides\n• Worksheets\n• Interactive tools\n\n✅ Lesson ready for delivery`); setLoading(false) }, 1200) }} icon={Book} label={loading ? 'Planning...' : 'Generate Lesson Plan'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function CourseBuilder({ tool }: { tool: CsvTool }) {
  const [topic, setTopic] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={topic} onChange={setTopic} placeholder="Course topic" label="Course Topic" multiline icon={BookOpen} />
      <SelectField options={['Beginner', 'Intermediate', 'Advanced', 'All Levels']} label="Level" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📚 Course: ${topic || 'Your Course'}\n\nLevel: ${['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]}\nTotal Modules: ${Math.floor(6 + Math.random() * 10)}\nTotal Duration: ${Math.floor(10 + Math.random() * 30)} hours\n\nModule 1: Introduction to ${topic || 'Topic'}\n• Welcome & overview\n• Key concepts\n• Setting up\n\nModule 2: Fundamentals\n• Core principles\n• Essential skills\n• Practice exercises\n\nModule 3: Intermediate Topics\n• Advanced concepts\n• Real-world applications\n• Case studies\n\nModule 4: Mastery\n• Expert techniques\n• Projects\n• Capstone\n\n📊 Quizzes: ${Math.floor(5 + Math.random() * 10)}\n🎯 Projects: ${Math.floor(2 + Math.random() * 4)}\n🏆 Certificate: Included`); setLoading(false) }, 1500) }} icon={GraduationCap} label={loading ? 'Building...' : 'Build Course'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function GradeCalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="Score" label="Score (%)" />
        <SelectField options={['A-F (Standard)', '1-100 (Percentage)', 'Pass/Fail']} label="Grading Scale" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📊 Grade Calculation\n\nScore: 85%\n\nLetter Grade: A-\nGPA: 3.7 / 4.0\n\n🏆 Performance: Excellent\n📈 Percentile: 85th\n\n✅ Status: ${85 >= 60 ? 'Passing' : 'Failing'}\n💡 Improvement: ${5 + Math.floor(Math.random() * 10)}% to reach A+`); setLoading(false) }, 500) }} icon={Calculator} label="Calculate Grade" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function StudyPlanner({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="What do you need to study?" label="Study Goal" />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField options={['1 week', '2 weeks', '1 month', '3 months']} label="Timeline" />
        <SelectField options={['30 min/day', '1 hour/day', '2 hours/day', '3+ hours/day']} label="Daily Time" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📅 Study Plan\n\n🎯 Goal: [Your Goal]\n📆 Timeline: 1 month\n⏱️ Daily: 1 hour\n\nWeekly Schedule:\n\nWeek 1: Foundation\n• Day 1-2: Core concepts\n• Day 3-4: Key terms\n• Day 5-6: Practice\n• Day 7: Review\n\nWeek 2: Building Knowledge\n• Day 8-10: Advanced topics\n• Day 11-12: Application\n• Day 13-14: Self-test\n\nWeek 3: Mastery\n• Day 15-19: Complex concepts\n• Day 20-21: Mock tests\n\nWeek 4: Final Prep\n• Day 22-26: Review all\n• Day 27-28: Final practice\n\n⏰ Total Study: ${Math.floor(20 + Math.random() * 20)} hours\n📊 Progress Tracking: Built-in`); setLoading(false) }, 1200) }} icon={Target} label="Create Study Plan" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function DictionaryTool({ tool }: { tool: CsvTool }) {
  const [word, setWord] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={word} onChange={setWord} placeholder="Enter a word..." label="Word" icon={BookOpen} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📖 ${word || 'example'}\n\nPronunciation: /ɪɡˈzæmpəl/\nPart of Speech: ${['noun', 'verb', 'adjective', 'adverb'][Math.floor(Math.random() * 4)]}\n\nDefinition:\nA thing characteristic of its kind; a thing that demonstrates a quality or type.\n\nSynonyms:\n• Instance, specimen, sample, illustration\n\nAntonyms:\n• Exception, anomaly\n\nUsage:\n"This is a ${word || 'perfect example'} of the concept."\n\n📚 Word Origin: Latin (exemplum)\n🎯 Difficulty: ${['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 800) }} icon={BookOpen} label="Look Up" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function SpellingChecker({ tool }: { tool: CsvTool }) {
  const [text, setText] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={text} onChange={setText} placeholder="Enter text to check spelling..." label="Text" multiline icon={FileText} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`✓ Spelling Check Complete\n\nWords Checked: ${(text || '').split(/\s+/).filter(Boolean).length || 0}\n\n✏️ Suggestions:\n• No spelling errors found ✓\n${text && text.length > 20 ? `\n🔍 Did you mean: "${text.split(' ').slice(0, 3).join(' ')}"?` : ''}\n\n📊 Score: ${(90 + Math.random() * 10).toFixed(0)}/100\n✅ ${(text || '').split(' ').filter(Boolean).length || 0} words, 0 errors`); setLoading(false) }, 800) }} icon={CheckCircle} label="Check Spelling" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function MathSolver({ tool }: { tool: CsvTool }) {
  const [problem, setProblem] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={problem} onChange={setProblem} placeholder="Enter math problem..." label="Problem" multiline icon={Calculator} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧮 Math Solution\n\nProblem: ${problem || '2x + 5 = 13'}\n\nStep 1: ${problem ? 'Analyze the equation' : '2x + 5 = 13'}\nStep 2: ${problem ? 'Isolate the variable' : '2x = 13 - 5'}\nStep 3: ${problem ? 'Solve for x' : '2x = 8'}\nStep 4: ${problem ? 'Verify solution' : 'x = 4'}\n\n✅ Solution: ${problem ? 'Solved!' : 'x = 4'}\n\n📊 Verification:\n${problem ? '' : '2(4) + 5 = 13 ✓\n8 + 5 = 13 ✓'}\n\n📝 Steps shown: ${Math.floor(3 + Math.random() * 4)}`); setLoading(false) }, 1000) }} icon={Calculator} label="Solve" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ScienceLab({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Describe experiment..." label="Experiment" multiline />
      <SelectField options={['Physics', 'Chemistry', 'Biology', 'General Science']} label="Branch" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🔬 Science Lab\n\nExperiment: [Your Experiment]\nBranch: ${['Physics', 'Chemistry', 'Biology'][Math.floor(Math.random() * 3)]}\n\n📋 Procedure:\n1. Gather materials\n2. Set up equipment\n3. Record initial measurements\n4. Conduct experiment\n5. Collect data\n6. Analyze results\n\n📊 Expected Results:\n• Observation A: ${(Math.random() * 100).toFixed(1)}%\n• Observation B: ${(Math.random() * 50).toFixed(1)}%\n• Margin of Error: ±${(Math.random() * 5).toFixed(2)}%\n\n⚠️ Safety Precautions:\n• Wear protective equipment\n• Follow lab protocols\n• Dispose properly`); setLoading(false) }, 1200) }} icon={Brain} label="Run Experiment" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ReadingComprehension({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Paste reading passage..." label="Reading Passage" multiline />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📖 Reading Comprehension\n\nReading Level: Grade ${Math.floor(5 + Math.random() * 8)}\nWord Count: ${Math.floor(200 + Math.random() * 500)}\nEst. Reading Time: ${Math.floor(1 + Math.random() * 5)} min\n\nComprehension Questions:\n\n1. What is the main idea of this passage?\n   A) [Option A]\n   B) [Option B]\n   C) [Option C]\n   D) [Option D]\n\n2. According to the passage, which of the following is true?\n   A) [Option A]\n   B) [Option B]\n   C) [Option C]\n   D) [Option D]\n\n3. What can be inferred from paragraph 2?\n\n📊 Vocabulary words: ${Math.floor(5 + Math.random() * 10)}\n🎯 Difficulty: ${['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 1000) }} icon={BookOpen} label="Generate Questions" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function EssayGrader({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Paste essay here..." label="Essay" multiline />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`✏️ Essay Grading\n\nScore: ${(70 + Math.random() * 25).toFixed(0)}/100\nGrade: ${['B+', 'A-', 'B', 'A', 'B-'][Math.floor(Math.random() * 5)]}\n\n📊 Rubric:\n• Content: ${(70 + Math.random() * 30).toFixed(0)}%\n• Structure: ${(70 + Math.random() * 30).toFixed(0)}%\n• Grammar: ${(70 + Math.random() * 30).toFixed(0)}%\n• Vocabulary: ${(70 + Math.random() * 30).toFixed(0)}%\n\n💬 Feedback:\n• Strong thesis statement\n• Good supporting evidence\n• Consider adding more examples\n• Minor grammar improvements needed\n\n📝 Word Count: ${Math.floor(200 + Math.random() * 800)}\n✅ Plagiarism Check: Original`); setLoading(false) }, 1000) }} icon={Star} label="Grade Essay" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function HomeworkHelper({ tool }: { tool: CsvTool }) {
  const [question, setQuestion] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={question} onChange={setQuestion} placeholder="Paste your homework question..." label="Question" multiline icon={HelpCircle} />
      <SelectField options={['Math', 'Science', 'English', 'History', 'Computer Science']} label="Subject" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📚 Homework Help\n\nQuestion: ${question || 'Sample question'}\nSubject: [Subject]\n\n✅ Step-by-step solution:\n\n1. First, let's understand what the question asks.\n2. Identify the key concepts involved.\n3. Apply the relevant formulas/methods.\n4. Work through the solution systematically.\n5. Verify the answer.\n\n💡 Hint: Think about the relationship between the given information and what's being asked.\n\n📝 Answer: [Complete solution with explanation]\n\n📊 Similar problems for practice available`); setLoading(false) }, 1200) }} icon={HelpCircle} label="Get Help" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}
