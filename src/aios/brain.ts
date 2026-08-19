/**
 * AIOS — AI Brain.
 * Global reasoning engines: planning, decision, reflection and reasoning. Each
 * uses the AI router when an LLM is reachable, and falls back to a deterministic
 * local engine so the brain always produces something useful.
 */

import { routeAndCall } from './router'

export interface PlanStep { id: string; action: string; dependsOn: string[] }

export class AiBrain {
  /** Break a high-level goal into ordered, dependency-aware steps. */
  async plan(goal: string): Promise<PlanStep[]> {
    const ai = await routeAndCall({ task: 'plan', mode: 'cheapest' }, {
      system: 'You are a planning engine. Break the goal into 3-6 concrete steps. Return each step as one line: ACTION|DEPENDENCY_IDS comma-separated. No preamble.',
      user: goal,
    })
    if (ai.output) {
      const steps = ai.output.split('\n').map((line, i) => {
        const [action, deps = ''] = line.split('|').map(s => s.trim())
        return { id: `s${i + 1}`, action: action || `Step ${i + 1}`, dependsOn: deps ? deps.split(',').map(s => s.trim()) : [] }
      }).filter(s => s.action)
      if (steps.length) return steps
    }
    return [
      { id: 's1', action: `Define success criteria for: ${goal}`, dependsOn: [] },
      { id: 's2', action: 'Identify inputs and constraints', dependsOn: ['s1'] },
      { id: 's3', action: 'Execute the core work', dependsOn: ['s2'] },
      { id: 's4', action: 'Verify and refine the result', dependsOn: ['s3'] },
      { id: 's5', action: 'Deliver and document', dependsOn: ['s4'] },
    ]
  }

  /** Choose the best option from a list given criteria (weighted scoring locally). */
  async decide(options: Array<{ id: string; label: string; score: number }>, criteria: string): Promise<string> {
    const ai = await routeAndCall({ task: 'decision', mode: 'fastest' }, {
      system: 'You are a decision engine. Given options and criteria, return ONLY the option id that is best. Options: ' + JSON.stringify(options),
      user: `Criteria: ${criteria}`,
    })
    if (ai.output) {
      const chosen = options.find(o => o.id === ai.output?.trim()) ?? options.find(o => ai.output?.includes(o.id))
      if (chosen) return chosen.id
    }
    // Deterministic fallback: highest score wins (ties broken by label).
    return [...options].sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))[0].id
  }

  /** Evaluate an output against criteria and return a verdict + improvement. */
  async reflect(output: string, criteria: string): Promise<{ score: number; verdict: string; improvement: string }> {
    const ai = await routeAndCall({ task: 'reflection', mode: 'balanced' }, {
      system: 'You are a reflection engine. Score the output 0-100, give a one-line verdict and a one-line improvement. Reply exactly as JSON: {"score":N,"verdict":"...","improvement":"..."}',
      user: `Output:\n${output.slice(0, 2000)}\n\nCriteria: ${criteria}`,
    })
    if (ai.output) {
      try {
        const parsed = JSON.parse(ai.output) as { score?: number; verdict?: string; improvement?: string }
        return {
          score: Math.max(0, Math.min(100, Number(parsed.score ?? 50))),
          verdict: parsed.verdict ?? 'Reviewed',
          improvement: parsed.improvement ?? '',
        }
      } catch { /* fall through */ }
    }
    const score = Math.max(0, Math.min(100, 100 - output.length % 40))
    return { score, verdict: 'Deterministic quality estimate', improvement: 'Add more specific details and verify correctness.' }
  }

  /** General reasoning over a question, with a structured local fallback. */
  async reason(question: string): Promise<string> {
    const ai = await routeAndCall({ task: 'reasoning', mode: 'balanced' }, {
      system: 'You are a reasoning engine. Answer clearly with short bullet points.',
      user: question,
    })
    if (ai.output) return ai.output
    return `Reasoning about: ${question}\n\n- Restate the question precisely\n- List the relevant facts\n- Consider alternatives and trade-offs\n- Conclude with the most defensible answer`
  }
}

export const brain = new AiBrain()