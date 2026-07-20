import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-8 text-center">
          <AlertOctagon className="text-destructive" size={40} />
          <h1 className="text-lg font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md font-mono">{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
