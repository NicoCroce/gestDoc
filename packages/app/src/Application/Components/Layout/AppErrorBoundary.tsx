import { Component, ErrorInfo, ReactNode } from 'react';
import { hasAttemptedRecovery, recoverApp } from '@app/Application/Helpers';
import { Button } from '@blendverse/design/ui/button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render errors (usually stale cached data or assets from a previous
 * deploy) and clears the caches automatically instead of showing a blank screen.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
    if (!hasAttemptedRecovery()) void recoverApp();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (!hasAttemptedRecovery()) return null;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">Ocurrió un error inesperado</p>
        <p className="text-muted-foreground">
          Intentá recargar la aplicación. Si el problema persiste, contactate
          con soporte.
        </p>
        <Button onClick={() => void recoverApp(true)}>Recargar</Button>
      </div>
    );
  }
}
