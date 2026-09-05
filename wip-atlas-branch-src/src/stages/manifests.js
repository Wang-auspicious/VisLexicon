/* 纯数据的舞台清单汇总。
 * 与 registry.js 分开：清单不含 JSX，node --test 能直接 import 它跑认领校验。
 * 新增一族舞台 = 新建目录、写 manifest、在这里追加一行。外壳零改动。
 */
import textReveal from './text-reveal/manifest.js'
import agentComposer from './agent-composer/manifest.js'
import overlayLayers from './overlay-layers/manifest.js'
import formAnatomy from './form-anatomy/manifest.js'
import surfaceTransition from './surface-transition/manifest.js'
import dataDisplay from './data-display/manifest.js'
import stateLoading from './state-loading/manifest.js'
import navigation from './navigation/manifest.js'
import pointerGestures from './pointer-gestures/manifest.js'

export const MANIFESTS = [
  textReveal,
  agentComposer,
  overlayLayers,
  formAnatomy,
  surfaceTransition,
  dataDisplay,
  stateLoading,
  navigation,
  pointerGestures,
]
