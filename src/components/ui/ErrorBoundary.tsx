import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Keeps a rendering failure in one subtree from taking down the whole product.
 * Technical details are logged to the console only — never rendered to users.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('CampusMood AI render error:', error, info.componentStack)
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] items-center justify-center px-6">
            <div className="surface-card max-w-md p-6 text-center">
              <h2 className="text-lg font-semibold">Something went wrong</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                This section could not be displayed. Your session data is unaffected — try
                refreshing the page.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary mt-5"
              >
                Reload application
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
