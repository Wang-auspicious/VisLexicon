import { Large } from '../vendor/gosrock/src/stories/Button/Button.stories.jsx'

// Render the repository's actual Large story with its original args.
export default function GosrockButtonLarge({ p = {} } = {}) {
  return <Large {...Large.args} {...p} />
}
