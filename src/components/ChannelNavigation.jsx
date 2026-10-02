import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n.js'

export default function ChannelNavigation({ channels, activeName, t }) {
  const en = useLocale() === 'en'
  const viewport = useRef(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  function reveal(link) {
    const node = viewport.current
    if (!node || !link) return
    const box = node.getBoundingClientRect(), item = link.getBoundingClientRect()
    if (item.left < box.left + 32) node.scrollLeft += item.left - box.left - 32
    else if (item.right > box.right - 32) node.scrollLeft += item.right - box.right + 32
  }

  useEffect(() => {
    const node = viewport.current
    let alive = true
    const measure = () => {
      if (!alive) return
      const next = { start: node.scrollLeft > 2, end: node.scrollWidth - node.clientWidth - node.scrollLeft > 2 }
      setEdges(previous => previous.start === next.start && previous.end === next.end ? previous : next)
    }
    let previousWidth = node.clientWidth
    const resize = () => { if (alive) { if (node.clientWidth !== previousWidth) { previousWidth = node.clientWidth; reveal(node.querySelector('[aria-current="page"]')) } measure() } }
    const showActive = () => { if (alive) { reveal(node.querySelector('[aria-current="page"]')); measure() } }
    const wheel = event => {
      if (node.scrollWidth <= node.clientWidth || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return
      const before = node.scrollLeft
      node.scrollLeft += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientWidth : 1)
      if (node.scrollLeft !== before) event.preventDefault()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(node)
    node.addEventListener('scroll', measure, { passive: true })
    node.addEventListener('wheel', wheel, { passive: false })
    const frame = requestAnimationFrame(showActive)
    document.fonts?.ready.then(showActive)
    return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); node.removeEventListener('scroll', measure); node.removeEventListener('wheel', wheel) }
  }, [activeName, en])

  const scroll = direction => viewport.current?.scrollBy({
    left: direction * Math.max(120, viewport.current.clientWidth * 0.7),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })

  return <div className="nav-channel-strip" data-overflow-start={edges.start} data-overflow-end={edges.end}>
    <div className="nav-links" ref={viewport} onFocusCapture={event => reveal(event.target.closest('a'))}>
      {channels.map(channel => <a key={channel.hash} className={`nav-link ${channel.match(activeName) ? 'on' : ''}`} href={channel.hash} aria-current={channel.match(activeName) ? 'page' : undefined}>{t(channel.key)}</a>)}
    </div>
    <button type="button" className="nav-scroll nav-scroll-prev" hidden={!edges.start} onClick={() => scroll(-1)} aria-label={en ? 'Show earlier sections' : '显示前面的栏目'} title={en ? 'Show earlier sections' : '显示前面的栏目'}><span aria-hidden="true">‹</span></button>
    <button type="button" className="nav-scroll nav-scroll-next" hidden={!edges.end} onClick={() => scroll(1)} aria-label={en ? 'Show more sections' : '显示后面的栏目'} title={en ? 'Show more sections' : '显示后面的栏目'}><span aria-hidden="true">›</span></button>
  </div>
}
