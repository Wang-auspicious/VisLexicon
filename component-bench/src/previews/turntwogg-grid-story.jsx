import ThemeProvider from '../vendor/turntwogg/react-ui/src/ThemeProvider.tsx'
import { Grid } from '../vendor/turntwogg/react-ui/stories/2-Grid.stories.tsx'

export default function TurntwoggGrid() {
  return <ThemeProvider><div style={{ boxSizing: 'border-box', padding: 12, width: '100%' }}><Grid /></div></ThemeProvider>
}
