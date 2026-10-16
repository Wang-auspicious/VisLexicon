import { useEffect, useRef, useState } from 'react'
import '../atlas.css'
import { useStore } from '../store.js'
import { createHostState, targetOriginForFrame } from '../lib/effects-host-protocol.js'
import { loadReleaseManifest } from '../lib/public-data.js'
import { atlasFrameUrl } from '../lib/atlas-deeplink.js'

/**
 * The effects atlas is authored in the downloaded DC document. The host app
 * owns the global navigation/search/language controls; this route only mounts
 * the atlas surface so it cannot grow a second header.
 */
export default function Atlas({ active = true, stage, term, query = {} }) {
  const { locale, theme } = useStore()
  const frameRef = useRef(null)
  const routeStage = stage || query.stageId || ''
  const routeTerm = term || query.termId || query.term || ''
  const routeQuery = query.q || ''
  // Keep the document mounted when preferences change: reloading loses the
  // selected category, detail, scroll position, and parameter edits.
  const initialMedia = typeof window === 'undefined' ? null : window.matchMedia?.('(prefers-color-scheme: dark)')
  const [initialSrc] = useState(() => `${atlasFrameUrl({
    locale,
    theme: theme === 'system' ? (initialMedia?.matches ? 'dark' : 'light') : theme,
    stageId: routeStage,
    termId: routeTerm,
    query: routeQuery,
  })}&active=${active ? '1' : '0'}`)
  const routeRef = useRef(`${routeStage}/${routeTerm}/${routeQuery}`)
  useEffect(() => {
    const frame = frameRef.current
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    let live = true
    const nextRoute = `${routeStage}/${routeTerm}/${routeQuery}`
    const navigate = active && routeRef.current !== nextRoute && Boolean(routeStage || routeTerm || routeQuery)
    routeRef.current = nextRoute
    const sendState = async () => {
      const release = await loadReleaseManifest().catch(() => null)
      if (!live) return
      frame?.contentWindow?.postMessage(createHostState({
        releaseId: release?.releaseId,
        locale: locale === 'en' ? 'en' : 'zh',
        theme: theme === 'system' ? (media?.matches ? 'dark' : 'light') : theme,
        active,
        ...(navigate ? { stageId: routeStage || undefined, termId: routeTerm || undefined, query: routeQuery || undefined, navigate: true } : {}),
      }), targetOriginForFrame(frame?.src, window.location.origin))
    }
    const onReady = event => {
      if (event.source === frame?.contentWindow && event.origin === window.location.origin && event.data?.type === 'vislexicon.atlas-ready') void sendState()
    }
    sendState()
    window.addEventListener('message', onReady)
    frame?.addEventListener('load', sendState)
    media?.addEventListener('change', sendState)
    return () => {
      live = false
      window.removeEventListener('message', onReady)
      frame?.removeEventListener('load', sendState)
      media?.removeEventListener('change', sendState)
    }
  }, [active, locale, theme, routeStage, routeTerm, routeQuery])
  return <iframe ref={frameRef} title={locale === 'en' ? 'Effects atlas' : '效果图谱'} src={initialSrc} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 88px)', border: 0, display: 'block' }} />
}

