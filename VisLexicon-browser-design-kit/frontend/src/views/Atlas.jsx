import { useEffect, useRef } from 'react'
import '../atlas.css'
import { useStore } from '../store.js'

/**
 * The effects atlas is authored in the downloaded DC document. The host app
 * owns the global navigation/search/language controls; this route only mounts
 * the atlas surface so it cannot grow a second header.
 */
export default function Atlas() {
  const { locale, theme } = useStore()
  const frameRef = useRef(null)
  // Keep the document mounted when preferences change: reloading loses the
  // selected category, detail, scroll position, and parameter edits.
  const initialSrc = useRef(`/effects-atlas/index.html?lang=${locale === 'en' ? 'en' : 'zh'}&theme=${theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'}`)
  useEffect(() => {
    const frame = frameRef.current
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const sendState = () => frame?.contentWindow?.postMessage({
      type: 'vislexicon-host-state',
      locale: locale === 'en' ? 'en' : 'zh',
      theme: theme === 'dark' || (theme === 'system' && media?.matches) ? 'dark' : 'light',
    }, window.location.origin)
    sendState()
    frame?.addEventListener('load', sendState)
    media?.addEventListener('change', sendState)
    return () => {
      frame?.removeEventListener('load', sendState)
      media?.removeEventListener('change', sendState)
    }
  }, [locale, theme])
  return <iframe ref={frameRef} title={locale === 'en' ? 'Effects atlas' : '效果图谱'} src={initialSrc.current} style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 88px)', border: 0, display: 'block' }} />
}
