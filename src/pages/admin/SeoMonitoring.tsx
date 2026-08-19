import { useEffect, useState } from 'react'
import { Alert, Skeleton } from '@/components/ui'
import type { SeoMonitoringReport, SearchPerformance, IndexingMetrics, CwvSummary } from '@/seo/monitoring'
import { ChevronDown, ChevronRight, Activity, Search, TrendingUp, Lightbulb, Wrench, MessageSquare, PieChart, Filter, Database, Server, AlertTriangle, FileText } from 'lucide-react'

interface ApiReport {
  status: string
  health?: {
    monitoring: string
    searchConsole: string
    history: string
    rum: string
  }
  generatedAt: string
  searchConsole: any
  indexing: any
  searchPerformance: any
  sitemap: any
  http: any[]
  httpSummary?: any
  cwv: any
  alerts: any[]
  opportunities: any[]
}

type ReportSource = 'api' | 'static' | 'none'

export function SeoMonitoring() {
  const [report, setReport] = useState<SeoMonitoringReport | null>(null)
  const [apiReport, setApiReport] = useState<ApiReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<ReportSource>('none')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      // Try API first (requires server-side Bearer auth; may fail in dev without token).
      try {
        const res = await fetch('/api/seo/monitoring', { headers: { Authorization: `Bearer ${localStorage.getItem('seo_admin_token') || ''}` } })
        if (res.ok) {
          const data = await res.json() as ApiReport
          if (!cancelled) { setApiReport(data); setSource('api'); setLoading(false); return }
        }
      } catch { /* API unavailable */ }

      // Fallback: static report (written by CLI/scheduler).
      try {
        const res = await fetch('/reports/seo-monitoring.json')
        if (res.ok) {
          const data = await res.json() as SeoMonitoringReport
          if (!cancelled) { setReport(data); setSource('static'); setLoading(false); return }
        }
      } catch { /* static report not deployed */ }

      if (!cancelled) {
        setError('SEO monitoring report not deployed — run `npm run seo:monitor` server-side and serve reports/, or configure /api/seo/monitoring.')
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const data = (apiReport || report) as ApiReport | SeoMonitoringReport | null

  if (loading) return <div className="p-6 space-y-3"><Skeleton className="h-8 w-64" /><Skeleton className="h-32 w-full rounded-2xl" /></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">SEO Monitoring</h1>
        <span className="text-xs text-gray-500">
          {source === 'api' ? 'Live API' : source === 'static' ? 'Historical snapshot' : 'No data'}
        </span>
      </div>

      {error && <Alert variant="warning" title="External data unavailable">{error}</Alert>}

      {data && (
        <>
          <Section title="System Health" icon={<Activity className="w-4 h-4" />} defaultOpen>
            <SystemHealth health={(data as ApiReport).health} />
          </Section>

          <Section title="Search Console" icon={<Search className="w-4 h-4" />} defaultOpen>
            <SearchConsolePanel data={data} source={source} />
          </Section>

          <Section title="Traffic Overview" icon={<TrendingUp className="w-4 h-4" />}>
            <TrafficOverview data={data} />
          </Section>

          <Section title="Top Opportunities" icon={<Lightbulb className="w-4 h-4" />}>
            <OpportunitiesPanel opportunities={(data as ApiReport).opportunities || (data as SeoMonitoringReport).opportunities || []} />
          </Section>

          <Section title="Top Tools" icon={<Wrench className="w-4 h-4" />}>
            <TopToolsPanel data={data} />
          </Section>

          <Section title="Top Queries" icon={<MessageSquare className="w-4 h-4" />}>
            <TopQueriesPanel data={data} />
          </Section>

          <Section title="Brand vs Non-Brand" icon={<PieChart className="w-4 h-4" />}>
            <BrandPanel data={data} />
          </Section>

          <Section title="Categories" icon={<Filter className="w-4 h-4" />}>
            <CategoriesPanel data={data} />
          </Section>

          <Section title="Collections" icon={<FileText className="w-4 h-4" />}>
            <CollectionsPanel data={data} />
          </Section>

          <Section title="Query Opportunities" icon={<Lightbulb className="w-4 h-4" />}>
            <QueryOpportunitiesPanel data={data} />
          </Section>

          <Section title="Trend" icon={<TrendingUp className="w-4 h-4" />}>
            <TrendPanel data={data} />
          </Section>

          <Section title="SEO Opportunity Score" icon={<Activity className="w-4 h-4" />}>
            <SeoScorePanel data={data} />
          </Section>

          <Section title="Content Gaps" icon={<FileText className="w-4 h-4" />}>
            <ContentGapsPanel data={data} />
          </Section>

          <Section title="Cannibalization" icon={<Filter className="w-4 h-4" />}>
            <CannibalizationPanel data={data} />
          </Section>

          <Section title="Internal Link Opportunities" icon={<Server className="w-4 h-4" />}>
            <InternalLinksPanel data={data} />
          </Section>

          <Section title="Optimization Proposals" icon={<Lightbulb className="w-4 h-4" />}>
            <OptimizationPanel data={data} />
          </Section>

          <Section title="Data Quality" icon={<Database className="w-4 h-4" />}>
            <DataQualityPanel data={data} />
          </Section>

          <Section title="Crawl / Indexability" icon={<Server className="w-4 h-4" />}>
            <CrawlPanel data={data} />
          </Section>

          <Section title="History" icon={<Activity className="w-4 h-4" />}>
            <HistoryPanel data={data} />
          </Section>

          <Section title="Alerts" icon={<AlertTriangle className="w-4 h-4" />}>
            <AlertsPanel alerts={(data as ApiReport).alerts || (data as SeoMonitoringReport).alerts || []} />
          </Section>
        </>
      )}
    </div>
  )
}

function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section aria-label={title} className="border border-white/5 rounded-2xl bg-white/[0.02]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-2 text-white font-semibold">{icon}{title}</div>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-white/5 bg-white/[0.03]">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  )
}

function SystemHealth({ health }: { health?: any }) {
  if (!health) return <Alert variant="info" title="Unavailable">System health data not available.</Alert>
  const items = [
    { label: 'Monitoring', value: health.monitoring === 'enabled' ? 'Enabled' : 'Disabled' },
    { label: 'Search Console', value: health.searchConsole },
    { label: 'History', value: health.history === 'available' ? 'Available' : 'Not configured' },
    { label: 'RUM', value: health.rum === 'enabled' ? 'Enabled' : 'Disabled' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(i => <Stat key={i.label} label={i.label} value={i.value} />)}
    </div>
  )
}

function SearchConsolePanel({ data, source }: { data: any; source: ReportSource }) {
  const sc = data.searchConsole || data.searchPerformance
  const status = sc?.status || 'unavailable'
  const isApi = source === 'api'

  if (status === 'not_configured' || status === 'NOT_CONFIGURED') {
    return (
      <Alert variant="info" title="Not Configured">
        <p className="mb-2"><strong>Data source:</strong> {isApi ? 'Live API (no credentials)' : 'Historical snapshot (no credentials)'}</p>
        <p>Set <code className="text-xs bg-white/10 px-1 py-0.5 rounded">GOOGLE_SERVICE_ACCOUNT_CREDENTIALS</code> or <code className="text-xs bg-white/10 px-1 py-0.5 rounded">GOOGLE_ACCESS_TOKEN</code> and <code className="text-xs bg-white/10 px-1 py-0.5 rounded">SEO_GSC_PROPERTY</code> on the server to connect.</p>
      </Alert>
    )
  }

  if (status === 'available' && sc.total) {
    return (
      <div>
        <p className="text-xs text-gray-500 mb-2">Data source: {isApi ? 'Live Google Search Console' : 'Historical snapshot'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Clicks" value={String(sc.total.clicks)} />
          <Stat label="Impressions" value={String(sc.total.impressions)} />
          <Stat label="CTR" value={`${(sc.total.ctr * 100).toFixed(2)}%`} />
          <Stat label="Position" value={sc.total.position.toFixed(1)} />
        </div>
      </div>
    )
  }

  return (
    <Alert variant={status === 'error' ? 'danger' : 'warning'} title={status === 'error' ? 'Error' : 'Unavailable'}>
      <p className="mb-1"><strong>Data source:</strong> {isApi ? 'Live Google Search Console' : 'Historical snapshot'}</p>
      <p>{(sc as any)?.reason || 'Google API credentials / property access are not configured or returned an error on the server.'}</p>
    </Alert>
  )
}

function TrafficOverview({ data }: { data: any }) {
  const sc = data.searchConsole || data.searchPerformance
  if (sc?.status !== 'available' || !sc.total) {
    return <Alert variant="info" title="No data">Traffic overview requires Search Console data.</Alert>
  }
  const t = sc.total
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat label="Clicks" value={String(t.clicks)} />
      <Stat label="Impressions" value={String(t.impressions)} />
      <Stat label="CTR" value={`${(t.ctr * 100).toFixed(2)}%`} />
      <Stat label="Avg Position" value={t.position.toFixed(1)} />
    </div>
  )
}

function OpportunitiesPanel({ opportunities }: { opportunities: any[] }) {
  if (!opportunities.length) return <Alert variant="info" title="No opportunities">No opportunities detected from current data.</Alert>
  return (
    <div className="space-y-2">
      {opportunities.slice(0, 20).map((o, i) => (
        <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">{o.type}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${o.priorityTier === 'P0' ? 'bg-red-500/20 text-red-400' : o.priorityTier === 'P1' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{o.priorityTier}</span>
          </div>
          <p className="text-xs text-gray-400 mb-1">{o.what}</p>
          <p className="text-xs text-gray-500">{o.evidence}</p>
          <p className="text-xs text-indigo-300 mt-1">{o.action}</p>
        </div>
      ))}
    </div>
  )
}

function TopToolsPanel({ data }: { data: any }) {
  const tools = (data as any).tools
  if (!tools?.length) return <Alert variant="info" title="No data">No tool insights available.</Alert>
  return (
    <div className="space-y-2">
      {tools.slice(0, 20).map((t: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] text-sm">
          <span className="text-gray-300">{t.slug || t.page}</span>
          <span className="text-gray-500">{t.impressions?.toLocaleString()} imp | {t.clicks?.toLocaleString()} cl</span>
        </div>
      ))}
    </div>
  )
}

function TopQueriesPanel({ data }: { data: any }) {
  const rows = (data as any).searchConsole?.byQuery || (data as any).searchPerformance?.byQuery || []
  if (!rows.length) return <Alert variant="info" title="No data">No query data available.</Alert>
  return (
    <div className="space-y-2">
      {rows.slice(0, 20).map((r: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] text-sm">
          <span className="text-gray-300 truncate max-w-[60%]">{r.query || r.keys?.[0]}</span>
          <span className="text-gray-500">{r.impressions?.toLocaleString()} imp | {r.clicks?.toLocaleString()} cl</span>
        </div>
      ))}
    </div>
  )
}

function BrandPanel({ data }: { data: any }) {
  const brand = (data as any).brand
  if (!brand) return <Alert variant="info" title="No data">Brand split requires Search Console data.</Alert>
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat label="Brand Clicks" value={String(brand.clicks)} />
      <Stat label="Brand Impressions" value={String(brand.impressions)} />
      <Stat label="Brand CTR" value={`${(brand.ctr * 100).toFixed(2)}%`} />
      <Stat label="Brand Position" value={brand.position?.toFixed(1) || '—'} />
    </div>
  )
}

function CategoriesPanel({ data }: { data: any }) {
  const cats = (data as any).categories
  if (!cats?.length) return <Alert variant="info" title="No data">No category data available.</Alert>
  return (
    <div className="space-y-2">
      {cats.slice(0, 15).map((c: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] text-sm">
          <span className="text-gray-300">{c.slug}</span>
          <span className="text-gray-500">{c.impressions?.toLocaleString()} imp</span>
        </div>
      ))}
    </div>
  )
}

function CollectionsPanel({ data }: { data: any }) {
  const cols = (data as any).collections
  if (!cols?.length) return <Alert variant="info" title="No data">No collection data available.</Alert>
  return (
    <div className="space-y-2">
      {cols.slice(0, 15).map((c: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] text-sm">
          <span className="text-gray-300">{c.slug}</span>
          <span className="text-gray-500">{c.impressions?.toLocaleString()} imp</span>
        </div>
      ))}
    </div>
  )
}

function QueryOpportunitiesPanel({ data }: { data: any }) {
  const opps = (data as any).opportunities || []
  const queryOpps = opps.filter((o: any) => o.type === 'HIGH_IMPRESSIONS_LOW_CTR' || o.type === 'POSITION_4_10' || o.type === 'POSITION_11_20')
  if (!queryOpps.length) return <Alert variant="info" title="No data">No query opportunities detected.</Alert>
  return (
    <div className="space-y-2">
      {queryOpps.slice(0, 20).map((o: any, i: number) => (
        <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm">
          <div className="text-white font-medium">{o.type}</div>
          <div className="text-gray-400 text-xs mt-1">{o.page} {o.query ? `— "${o.query}"` : ''}</div>
          <div className="text-gray-500 text-xs">{o.evidence}</div>
        </div>
      ))}
    </div>
  )
}

function DataQualityPanel({ data }: { data: any }) {
  const dq = (data as any).dataQuality
  if (!dq) return <Alert variant="info" title="No data">Data quality metrics require a recent GSC fetch.</Alert>
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat label="Rows Received" value={String(dq.rowsReceived)} />
      <Stat label="Rows Accepted" value={String(dq.rowsAccepted)} />
      <Stat label="Rows Rejected" value={String(dq.rowsRejected)} />
      <Stat label="Truncated" value={dq.truncated ? 'YES' : 'NO'} />
    </div>
  )
}

function CrawlPanel({ data }: { data: any }) {
  const http = (data as any).http || []
  const s200 = http.filter((h: any) => h.status >= 200 && h.status < 300).length
  const s4xx = http.filter((h: any) => h.status >= 400 && h.status < 500).length
  const s5xx = http.filter((h: any) => h.status >= 500).length
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat label="200 OK" value={String(s200)} />
      <Stat label="4xx" value={String(s4xx)} />
      <Stat label="5xx" value={String(s5xx)} />
      <Stat label="Tested" value={String(http.length)} />
    </div>
  )
}

function HistoryPanel({ data }: { data: any }) {
  const history = (data as any).history || []
  if (!history.length) return <Alert variant="info" title="No history">No historical snapshots available.</Alert>
  return (
    <div className="space-y-2">
      {history.slice(-10).reverse().map((h: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] text-sm">
          <span className="text-gray-300">{h.date}</span>
          <span className="text-gray-500">{h.clicks ?? 0} clicks | {h.impressions ?? 0} imp</span>
        </div>
      ))}
    </div>
  )
}

function AlertsPanel({ alerts }: { alerts: any[] }) {
  if (!alerts.length) return <Alert variant="info" title="No alerts">No active alerts.</Alert>
  return (
    <div className="space-y-2">
      {alerts.slice(0, 20).map((a, i) => (
        <Alert key={i} variant={a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'} title={a.title}>
          {a.description}
        </Alert>
      ))}
    </div>
  )
}

function TrendPanel({ data }: { data: any }) {
  const trend = (data as any).trends
  if (!trend || trend.direction === 'insufficient_history') {
    return <Alert variant="info" title="Insufficient history">Need at least two comparable snapshots to calculate trend.</Alert>
  }
  const tone = trend.direction === 'improving' ? 'text-emerald-400' : trend.direction === 'declining' ? 'text-red-400' : 'text-gray-400'
  return (
    <div className="space-y-2">
      <div className={`text-lg font-bold ${tone}`}>{trend.direction.toUpperCase()}</div>
      <div className="text-xs text-gray-500">Data source: Historical snapshot</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Clicks delta" value={trend.delta.clicks !== null ? `${trend.delta.clicks.toFixed(1)}%` : '—'} />
        <Stat label="Impressions delta" value={trend.delta.impressions !== null ? `${trend.delta.impressions.toFixed(1)}%` : '—'} />
        <Stat label="CTR delta" value={trend.delta.ctr !== null ? `${trend.delta.ctr.toFixed(1)}%` : '—'} />
        <Stat label="Position delta" value={trend.delta.position !== null ? `${trend.delta.position.toFixed(1)}` : '—'} />
      </div>
    </div>
  )
}

function SeoScorePanel({ data }: { data: any }) {
  const opportunities = (data as any).opportunities || []
  if (!opportunities.length) return <Alert variant="info" title="No score">No opportunities to score.</Alert>
  const high = opportunities.filter((o: any) => o.priority === 'High').length
  const med = opportunities.filter((o: any) => o.priority === 'Medium').length
  const low = opportunities.filter((o: any) => o.priority === 'Low').length
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">Priority distribution (deterministic impact × confidence ÷ effort)</div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="High" value={String(high)} />
        <Stat label="Medium" value={String(med)} />
        <Stat label="Low" value={String(low)} />
      </div>
    </div>
  )
}

function ContentGapsPanel({ data }: { data: any }) {
  const opps = (data as any).opportunities || []
  const gaps = opps.filter((o: any) => o.type === 'CONTENT_GAP')
  if (!gaps.length) return <Alert variant="info" title="No gaps">No content gaps detected.</Alert>
  return (
    <div className="space-y-2">
      {gaps.slice(0, 20).map((o: any, i: number) => (
        <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm">
          <div className="text-white font-medium">{o.query}</div>
          <div className="text-gray-400 text-xs mt-1">{o.page}</div>
          <div className="text-gray-500 text-xs">{o.evidence}</div>
          <div className="text-indigo-300 text-xs mt-1">{o.action}</div>
        </div>
      ))}
    </div>
  )
}

function CannibalizationPanel({ data }: { data: any }) {
  const opps = (data as any).opportunities || []
  const cann = opps.filter((o: any) => o.type === 'QUERY_CANNIBALIZATION')
  if (!cann.length) return <Alert variant="info" title="No cannibalization">No potential query cannibalization detected.</Alert>
  return (
    <div className="space-y-2">
      {cann.slice(0, 20).map((o: any, i: number) => (
        <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm">
          <div className="text-white font-medium">"{o.query}"</div>
          <div className="text-gray-400 text-xs mt-1">{o.evidence}</div>
          <div className="text-indigo-300 text-xs mt-1">{o.action}</div>
        </div>
      ))}
    </div>
  )
}

function InternalLinksPanel({ data }: { data: any }) {
  const opps = (data as any).opportunities || []
  const links = opps.filter((o: any) => o.type === 'WEAK_INTERNAL_LINKING')
  if (!links.length) return <Alert variant="info" title="No opportunities">No internal link opportunities detected.</Alert>
  return (
    <div className="space-y-2">
      {links.slice(0, 20).map((o: any, i: number) => (
        <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm">
          <div className="text-white font-medium">{o.page}</div>
          <div className="text-gray-400 text-xs mt-1">{o.evidence}</div>
          <div className="text-indigo-300 text-xs mt-1">{o.action}</div>
        </div>
      ))}
    </div>
  )
}

function OptimizationPanel({ data }: { data: any }) {
  const proposals = (data as any).optimizationProposals || []
  if (!proposals.length) return <Alert variant="info" title="No proposals">No optimization proposals generated yet.</Alert>
  return (
    <div className="space-y-2">
      {proposals.slice(0, 20).map((p: any, i: number) => (
        <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-medium">{p.field}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'APPLIED' ? 'bg-emerald-500/20 text-emerald-400' : p.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{p.status}</span>
          </div>
          <div className="text-gray-400 text-xs">{p.url}</div>
          <div className="text-gray-500 text-xs mt-1">{p.reason}</div>
        </div>
      ))}
    </div>
  )
}
