import '../atlas.css'

/**
 * The effects atlas is authored in the downloaded DC document. The host app
 * owns the global navigation/search/language controls; this route only mounts
 * the atlas surface so it cannot grow a second header.
 */
export default function Atlas() {
  return <iframe title="效果图谱" src="/effects-atlas/index.html" style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 88px)', border: 0, display: 'block' }} />
}