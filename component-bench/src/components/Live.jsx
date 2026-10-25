import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'

// Each preview is its own chunk: heavy libraries (React Flow, Recharts) load
// only when that component is opened or hovered.
const loaders = import.meta.glob('../previews/*.jsx')
const cache = new Map()
export function loadPreview(id) {
  if (!cache.has(id)) {
    const load = loaders[`../previews/${id}.jsx`]
    const promise = load()
    cache.set(id, { promise, Lazy: lazy(() => promise) })
  }
  return cache.get(id)
}

class Boundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch() { if (window.parent !== window) window.parent.postMessage({ type: 'vislexicon:error', message: 'Preview failed to render' }, '*') }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null }) }
  render() {
    if (this.state.error) return <div className="max-w-sm px-6 text-center text-sm text-red-300">预览出错：{String(this.state.error.message || this.state.error)}</div>
    return this.props.children
  }
}

/** Render a preview with the given values. */
function ReadySignal({ onReady }) {
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => onReady?.()) })
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second) }
  }, [onReady])
  return null
}

export function Live({ id, values, resetKey, onReady }) {
  const { Lazy } = loadPreview(id)
  return (
    <Boundary resetKey={resetKey}>
      <Suspense fallback={<div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />}>
        <Lazy p={values} />
        {onReady && <ReadySignal onReady={onReady} />}
      </Suspense>
    </Boundary>
  )
}

/** Usage code for the current values; needs the preview module. */
export function useUsage(id, values) {
  const [mod, setMod] = useState(null)
  useEffect(() => { let live = true; loadPreview(id).promise.then(m => live && setMod(m)); return () => { live = false } }, [id])
  return mod?.usage ? mod.usage(values) : ''
}

/**
 * A fixed design-size stage scaled to fit its box. Previews are authored for
 * 800×500, so the card, the detail view and the poster all show the same frame.
 */
export function ScaledStage({ children, width = 800, height = 500, className = "relative", fill = "dark" }) {
  const box = useRef(null)
  const [scale, setScale] = useState(0)
  useEffect(() => {
    const el = box.current
    const measure = () => setScale(Math.min(el.clientWidth / width, el.clientHeight / height))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [width, height])
  return (
    <div ref={box} className={`overflow-hidden ${className}`}>
      <div className="bench-stage absolute left-1/2 top-1/2 grid place-items-center" data-fill={fill}
        style={{ width, height, transform: `translate(-50%, -50%) scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </div>
  )
}
