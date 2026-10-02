/* 清单与舞台组件的配对。只有这一层碰 JSX。 */
import { MANIFESTS } from './manifests.js'
import TextRevealStage from './text-reveal/Stage.jsx'
import AgentComposerStage from './agent-composer/Stage.jsx'
import OverlayStage from './overlay-layers/Stage.jsx'
import FormAnatomyStage from './form-anatomy/Stage.jsx'
import SurfaceTransitionStage from './surface-transition/Stage.jsx'
import DataDisplayStage from './data-display/Stage.jsx'
import StateLoadingStage from './state-loading/Stage.jsx'
import NavigationStage from './navigation/Stage.jsx'
import PointerGesturesStage from './pointer-gestures/Stage.jsx'

const COMPONENTS = {
  'text-reveal': TextRevealStage,
  'agent-composer': AgentComposerStage,
  'overlay-layers': OverlayStage,
  'form-anatomy': FormAnatomyStage,
  'surface-transition': SurfaceTransitionStage,
  'data-display': DataDisplayStage,
  'state-loading': StateLoadingStage,
  navigation: NavigationStage,
  'pointer-gestures': PointerGesturesStage,
}

export { MANIFESTS }

export function componentFor(stageId) {
  return COMPONENTS[stageId] || null
}
