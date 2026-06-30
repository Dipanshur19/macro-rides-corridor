import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  label?: string;
}
interface State {
  hasError: boolean;
  message?: string;
}

/** Contains rendering errors (e.g. from the map/3D layers) to a graceful panel. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[Macro Rides] render error:', error);
  }

  handleReset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid h-full w-full place-items-center bg-bg p-6 text-center">
          <div className="max-w-sm">
            <AlertTriangle className="mx-auto mb-3 text-warning" size={28} />
            <h3 className="text-sm font-semibold">
              {this.props.label ?? 'Something went wrong'}
            </h3>
            <p className="mt-1 text-xs text-muted">{this.state.message}</p>
            <button
              onClick={this.handleReset}
              className="btn-primary mt-4 rounded-lg px-4 py-2 text-xs font-semibold"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
