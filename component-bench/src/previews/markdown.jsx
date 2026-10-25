import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Preview({ p }) {
  return (
    <div className="bench-md max-h-[90%] w-[min(460px,90%)] overflow-auto rounded-2xl bg-zinc-900/80 p-6 ring-1 ring-white/10">
      <Markdown remarkPlugins={p.gfm ? [remarkGfm] : []} skipHtml={p.skipHtml}>{p.children}</Markdown>
    </div>
  )
}
export const usage = p => `import Markdown from "react-markdown"${p.gfm ? '\nimport remarkGfm from "remark-gfm"' : ''}

<Markdown${p.gfm ? ' remarkPlugins={[remarkGfm]}' : ''}${p.skipHtml ? ' skipHtml' : ''}>
  {markdown}
</Markdown>`
