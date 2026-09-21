import { useEffect, useState } from 'react'
import { createFavoritesRepository } from '../lib/local-favorites.js'
import { exportBoard, readBoard } from '../lib/local-board.js'

export default function Favorites() {
  const [rows, setRows] = useState([])
  const [repo] = useState(() => createFavoritesRepository())
  const [board] = useState(() => readBoard())
  useEffect(() => { repo.listFavorites().then(setRows) }, [repo])
  const downloadBoard = () => {
    const blob = new Blob([exportBoard(board)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'vislexicon-board.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <section className="vl-favorites">
      <p className="x-mono">LOCAL LIBRARY</p>
      <h1>我的收藏</h1>
      {!repo.persistent ? <p role="status">当前浏览器无法持久保存收藏。</p> : null}
      {rows.length ? <ul>{rows.map((row) => <li key={row.entryId}><a href={`#/site/${row.entryId}`}>{row.entryId}</a></li>)}</ul> : <p>还没有收藏站点。浏览策展目录时，把想反复查看的站点收藏起来。</p>}
      <section aria-labelledby="local-board-title">
        <p className="x-mono">LOCAL BOARD</p>
        <h2 id="local-board-title">本地 Design Spec 板</h2>
        <p>Board 只保存在当前浏览器。没有主动导出或交付时，外部 Agent 不会读取它。</p>
        <button type="button" onClick={downloadBoard}>导出 Board JSON（{board.length}）</button>
        {board.length === 0 ? <p>还没有保存的 Design Spec。</p> : <ul>{board.map((item) => <li key={item.key}>{item.spec.selection.label}</li>)}</ul>}
      </section>
    </section>
  )
}
