import React, { ErrorInfo, PropsWithChildren } from "react";

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Ozlax render failure", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-shell">
          <div className="error-boundary-card">
            <img src="/logo.svg" alt="Ozlax" className="error-boundary-logo" />
            <h1>Something went wrong.</h1>
            <p>Please refresh the page or try again later. Ozlax caught the crash before it could leave you staring at a blank screen.</p>
            <button type="button" className="button-primary" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
