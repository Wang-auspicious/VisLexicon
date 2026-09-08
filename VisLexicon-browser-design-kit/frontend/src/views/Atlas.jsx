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
  useEffect(() => {
    const resolvedTheme = theme === 'dark' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
    const sendLocale = () => frameRef.current?.contentWindow?.postMessage({ type: 'vislexicon-host-state', locale: locale === 'en' ? 'en' : 'zh', theme: resolvedTheme }, window.location.origin)
    sendLocale()
    frameRef.current?.addEventListener('load', sendLocale)
    return () => frameRef.current?.removeEventListener('load', sendLocale)
  }, [locale])
  return <iframe ref={frameRef} title="效果图谱" src="/effects-atlas/index.html" style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 88px)', border: 0, display: 'block' }} />
}
