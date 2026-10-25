import { TextArea } from '../vendor/paradise-ui/packages/components/TextArea/src/TextArea.tsx'
import { tailwindTextAreaElementClass } from '../vendor/paradise-ui/packages/components/TextArea/src/elementClass.ts'

// Preserve the original Basic story's label, placeholder and Tailwind element-class renderer.
export default function ParadiseTextAreaBasic({ p = {} } = {}) {
  return (
    <form style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
      <TextArea {...p} elementClass={tailwindTextAreaElementClass} />
    </form>
  )
}
