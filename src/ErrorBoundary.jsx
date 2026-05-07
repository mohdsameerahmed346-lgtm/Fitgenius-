import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("APP CRASH:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: "black",
          color: "white",
          minHeight: "100vh",
          padding: "20px"
        }}>
          <h2>FitGenius Crash</h2>
          <pre>{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
