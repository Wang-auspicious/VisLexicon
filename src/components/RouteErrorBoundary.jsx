import { Component } from 'react'

// Suspense handles pending data, not a rejected request. Keep navigation alive
// if a separately cached route/data file is unavailable during a deployment.
export default class RouteErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    const en = document.documentElement.lang === 'en'
    return <p className="vl-alert" role="alert">
      {en ? 'This section could not load. You can open another section or retry.' : '这个栏目暂时加载失败，可以切换其他栏目或重试。'}{' '}
      <button type="button" onClick={() => window.location.reload()}>{en ? 'Reload' : '重新加载'}</button>
    </p>
  }
}
