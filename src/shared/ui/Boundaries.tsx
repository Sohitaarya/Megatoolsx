import { Component, Suspense, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '@/analytics'
import { Skeleton, Alert } from '@/components/ui'

/** Fallback shown while a lazy route chunk loads. */
export function RouteSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      {children}
    </Suspense>
  )
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex flex-col justify-center gap-4 px-6" role="status" aria-label={label}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface ErrorBoundaryState { hasError: boolean; message: string }

/** React error boundary — catches render/runtime errors per route. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string | number }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error): ErrorBoundaryState {
    return { hasError: true, message: err?.message ?? 'Something went wrong' }
  }

  componentDidCatch(err: Error): void {
    analyticsApi.trackError({ message: err?.message ?? 'Boundary error', origin: 'boundary' })
  }

  componentDidUpdate(prev: { resetKey?: string | number }) {
    if (this.props.resetKey !== prev.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: '' })
    }
  }

  private reset = () => this.setState({ hasError: false, message: '' })

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-3">⚠️</div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">{this.state.message}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.reset}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-all"
              >
                Try again
              </button>
              <Link to="/" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all">
                Go home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}