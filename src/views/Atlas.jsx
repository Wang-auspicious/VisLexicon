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
export default function Atlas({ stage, term, query = {} }) {
  const { locale, theme } = useStore()
  const frameRef = useRef(null)
  const routeStage = stage || query.stageId || ''
  const routeTerm = term || query.termId || query.term || ''
  const routeQuery = query.q || ''
  // Keep the document mounted when preferences change: reloading loses the
  // selected category, detail, scroll position, and parameter edits.
  const initialMedia = typeof window === 'undefined' ? null : window.matchMedia?.('(prefers-color-scheme: dark)')
  const [initialSrc] = useState(() => atlasFrameUrl({
    locale,
    theme: theme === 'system' ? (initialMedia?.matches ? 'dark' : 'light') : theme,
    stageId: routeStage,
    termId: routeTerm,
    query: routeQuery,
  }))
  const routeRef = useRef(`${routeStage}/${routeTerm}`)
  useEffect(() => {
    const frame = frameRef.current
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const sendState = async () => {
      const release = await loadReleaseManifest().catch(() => null)
      frame?.contentWindow?.postMessage(createHostState({
        releaseId: release?.releaseId,
        locale: locale === 'en' ? 'en' : 'zh',
        theme: theme === 'system' ? (media?.matches ? 'dark' : 'light') : theme,
        stageId: routeStage || undefined,
        termId: routeTerm || undefined,
        query: routeQuery || undefined,
      }), targetOriginForFrame(frame?.src, window.location.origin))
    }
    const nextRoute = `${routeStage}/${routeTerm}/${routeQuery}`
    if (frame && routeRef.current !== nextRoute) {
      frame.src = atlasFrameUrl({
        locale,
        theme: theme === 'system' ? (media?.matches ? 'dark' : 'light') : theme,
        stageId: routeStage,
        termId: routeTerm,
        query: routeQuery,
      })
      routeRef.current = nextRoute
    }
    sendState()
    frame?.addEventListener('load', sendState)
    media?.addEventListener('change', sendState)
    return () => {
      frame?.removeEventListener('load', sendState)
      media?.removeEventListener('change', sendState)
    }
  }, [locale, theme, routeStage, routeTerm, routeQuery])
  return <iframe ref={frameRef} title={locale === 'en' ? 'Effects atlas' : '效果图谱'} src={initialSrc} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 88px)', border: 0, display: 'block' }} />
}

