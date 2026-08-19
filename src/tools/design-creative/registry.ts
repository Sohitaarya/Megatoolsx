/**
 * Design/Creative — typed capability registry.
 * Every Design/Creative tool in the catalog gets a registry entry derived from
 * its real capability (or an honest 'coming-soon' when the CSV name is
 * auto-generated filler with no real design function).
 */

import { useToolsStore } from '@/store/toolsStore'
import { capabilityForDesign, type DesignCapability } from '@/data/designCreativeCapabilities'
import { familyFromName, type DesignCreativeFamily } from './families'
import { type DesignCreativeStatus } from './status'

export interface DesignRegistryEntry {
  slug: string
  name: string
  family: DesignCreativeFamily
  status: DesignCreativeStatus
  capability: DesignCapability
}

/** Map a capability status to the registry's honest status. */
function toStatus(cap: DesignCapability): DesignCreativeStatus {
  switch (cap.status) {
    case 'working': return 'real'
    case 'beta': return 'partial'
    case 'requires-configuration': return 'requires-external-api'
    case 'needs-data-fix': return 'coming-soon'
    default: return 'coming-soon'
  }
}

/** Build the registry from the live catalog (Design/Creative category only). */
export function buildDesignRegistry(): DesignRegistryEntry[] {
  const { csvTools } = useToolsStore.getState()
  return csvTools
    .filter(t => t.category === 'Design/Creative')
    .map(t => {
      const capability = capabilityForDesign(t.slug, t.name)
      return {
        slug: t.slug,
        name: t.name,
        family: familyFromName(t.name, t.slug),
        status: toStatus(capability),
        capability,
      }
    })
}

let cache: DesignRegistryEntry[] | null = null
export function designRegistry(): DesignRegistryEntry[] {
  if (!cache) cache = buildDesignRegistry()
  return cache
}
export function invalidateDesignRegistry(): void { cache = null }

export function registryEntry(slug: string): DesignRegistryEntry | undefined {
  return designRegistry().find(e => e.slug === slug)
}

export function designCounts(): Record<DesignCreativeStatus, number> {
  const out: Record<DesignCreativeStatus, number> = {
    real: 0, partial: 0, 'requires-ai': 0, 'requires-upload': 0, 'requires-external-api': 0, 'coming-soon': 0,
  }
  for (const e of designRegistry()) out[e.status] += 1
  return out
}