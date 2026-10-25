import { Alert } from '../vendor/paradise-ui/packages/components/Alert/src/Alert.tsx'
import '../vendor/paradise-ui/packages/components/Alert/src/style.scss'

// The isolated preview keeps the original AlertWithCustomContent story's component, props, title and body.
export default function ParadiseAlertCustomContent({ p = {} } = {}) {
  return (
    <form style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
      <Alert {...p} closeable={p.closeable ?? true}>
        <h3>Lorem ipsum title</h3>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
          text ever since the 1500s
        </p>
      </Alert>
    </form>
  )
}
