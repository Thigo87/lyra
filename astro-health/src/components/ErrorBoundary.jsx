import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  resetView = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <main className="error-boundary"><div className="error-boundary-card"><p className="eyebrow">SENTINEL · VIEW RECOVERY</p><h1>Camera interface unavailable</h1><p>The optical sensor view encountered an unexpected rendering error. Reset the view and continue in simulated mode if the camera is unavailable.</p><button type="button" className="female-action" onClick={this.resetView}>Reset View</button></div></main>
    }
    return this.props.children
  }
}
