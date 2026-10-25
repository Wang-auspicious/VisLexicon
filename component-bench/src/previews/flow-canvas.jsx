import { useCallback, useMemo } from 'react'
import { ReactFlow, Background, Position, addEdge, useEdgesState, useNodesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { tag } from '../lib/jsx'

// Left-to-right pipeline, so handles sit on the left and right edges.
const NODES = [
  ['spec', 0, 80, 'Spec'], ['tests', 200, 0, 'Tests'], ['impl', 200, 160, 'Implement'], ['verify', 400, 80, 'Verify'], ['ship', 590, 80, 'Deliver'],
].map(([id, x, y, label]) => ({ id, position: { x, y }, data: { label }, sourcePosition: Position.Right, targetPosition: Position.Left }))
const LINKS = [['spec', 'tests'], ['spec', 'impl'], ['tests', 'verify'], ['impl', 'verify'], ['verify', 'ship']]

export default function Preview({ p }) {
  const initialEdges = useMemo(() => LINKS.map(([source, target]) => ({ id: `${source}-${target}`, source, target, animated: p.animated })), [p.animated])
  const [nodes, , onNodesChange] = useNodesState(NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onConnect = useCallback(connection => setEdges(current => addEdge({ ...connection, animated: p.animated }, current)), [setEdges, p.animated])
  const shown = edges.map(edge => edge.animated === p.animated ? edge : { ...edge, animated: p.animated })
  return (
    <div className="h-full w-full">
      <ReactFlow nodes={nodes} edges={shown} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
        snapToGrid={p.snapToGrid} snapGrid={[p.gap, p.gap]} panOnDrag={p.panOnDrag} colorMode="dark" fitView fitViewOptions={{ padding: 0.25 }} proOptions={{ hideAttribution: false }}>
        <Background variant={p.variant} gap={p.gap} />
      </ReactFlow>
    </div>
  )
}
export const usage = p => `import { ReactFlow, Background } from "@xyflow/react"
import "@xyflow/react/dist/style.css"

${tag('ReactFlow', { nodes: '{nodes}', edges: '{edges}', snapToGrid: p.snapToGrid, panOnDrag: p.panOnDrag, fitView: true }, `  ${tag('Background', { variant: p.variant, gap: p.gap })}`).replace(/="\{(\w+)\}"/g, '={$1}')}`
