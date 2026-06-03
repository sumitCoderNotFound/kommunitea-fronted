import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

/** Catches render errors so one bad screen never white-screens the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Render error caught by ErrorBoundary:", error);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="font-display text-2xl font-bold">Something went wrong</p>
          <p className="max-w-sm text-sm text-ink-muted">
            This page hit an unexpected error. You can try again without losing your place.
          </p>
          <div className="flex gap-2">
            <button onClick={this.reset}
              className="rounded-xl bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark">
              Try again
            </button>
            <button onClick={() => window.location.assign("/feed")}
              className="rounded-xl border border-sand-border bg-sand-card px-4 py-2 text-sm font-medium text-ink-soft hover:border-coral">
              Go to feed
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
