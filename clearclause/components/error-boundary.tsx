"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-0">
              <CardHeader className="bg-red-50 border-b border-red-100">
                <CardTitle className="text-red-800 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600 mb-4">
                  We're sorry, but there was an error loading this page. Please try refreshing or contact support if the
                  problem persists.
                </p>
                <div className="bg-slate-50 p-3 rounded text-sm font-mono text-slate-700 overflow-auto max-h-32">
                  {this.state.error?.message || "Unknown error"}
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
                <Button onClick={() => window.location.reload()} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </CardFooter>
            </Card>
          </div>
        )
      )
    }

    return this.props.children
  }
}
