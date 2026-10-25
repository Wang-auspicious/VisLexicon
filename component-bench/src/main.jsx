import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Live, ScaledStage, useUsage } from './components/Live.jsx'
import { byId, defaults } from './lib/model.js'

// ?solo=<id> renders one component at the 800×500 design size; scripts/posters.mjs captures it.
function Solo({ id }) {
  const entry = byId[id]
  const [values, setValues] = useState(() => entry ? defaults(entry) : {})
  const [replay, setReplay] = useState(0)
  const [fill, setFill] = useState('dark')
  const [view, setView] = useState('preview')
  const ready = useCallback(() => {
    window.__benchReady = true
    if (window.parent !== window) window.parent.postMessage({ type: 'vislexicon:ready', id }, '*')
  }, [id])
  const usage = useUsage(entry ? id : 'number-ticker', values)
  useEffect(() => {
    const receive = event => {
      if (event.source !== window.parent) return
      if (event.data?.type === 'vislexicon:replay') { setReplay(value => value + 1); return }
      if (event.data?.type === 'vislexicon:view') { if (['code', 'preview'].includes(event.data.mode)) setView(event.data.mode); return }
      if (event.data?.type === 'vislexicon:theme') { if (['light', 'dark'].includes(event.data.theme)) setFill(event.data.theme); return }
      if (event.data?.type === 'vislexicon:sound') {
        document.documentElement.dataset.sound = event.data.enabled ? 'on' : 'off'
        if (id === 'tick-nav' || id === 'pixel-loader') void import('./vendor/fancy/react/src/sound/sound').then(({ sound }) => event.data.enabled ? sound.enable() : sound.disable())
        return
      }
      if (event.data?.type !== 'vislexicon:props') return
      const incoming = event.data.values
      if (!incoming || typeof incoming !== 'object') return
      setValues(current => ({ ...current, ...Object.fromEntries((entry?.controls ?? []).filter(c => Object.hasOwn(incoming, c.key) && ['string', 'number', 'boolean'].includes(typeof incoming[c.key])).map(c => [c.key, incoming[c.key]])) }))
    }
    addEventListener('message', receive)
    return () => removeEventListener('message', receive)
  }, [entry])
  useEffect(() => { if (window.parent !== window && usage) window.parent.postMessage({ type: 'vislexicon:usage', usage }, '*') }, [usage])
  useEffect(() => {
    const key = event => { if (event.key === 'Escape' && window.parent !== window) window.parent.postMessage({ type: 'vislexicon:escape' }, '*') }
    addEventListener('keydown', key); return () => removeEventListener('keydown', key)
  }, [])
  if (!entry) return <p>Preview unavailable. Return to the component list.</p>
  const remount = (entry.remountOn ?? []).map(key => values[key]).join('|')
  return (
    <ScaledStage className="relative h-screen w-screen" fill={fill}>
      {view === 'preview' && <Live key={`${replay}|${remount}`} id={id} values={values} onReady={ready} />}
    </ScaledStage>
  )
}

const parameters = new URLSearchParams(location.search)
const solo = parameters.get('solo')
if (parameters.get('embed') === '1') document.documentElement.dataset.embed = 'true'
if (solo) createRoot(document.getElementById('root')).render(<StrictMode><Solo id={solo} /></StrictMode>)
else {
  const localStandalone = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && ['5288', '5289'].includes(location.port)
  const nativeOrigin = import.meta.env.VITE_VISLEXICON_ORIGIN || (localStandalone ? `${location.protocol}//${location.hostname}:5291` : location.origin)
  location.replace(new URL('/#/components' + (parameters.get('c') ? '?' + new URLSearchParams({ component: parameters.get('c') }) : ''), nativeOrigin).href)
}
