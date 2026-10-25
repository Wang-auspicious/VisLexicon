import { Secondary } from '../vendor/gosrock/src/stories/Button/Button.stories.jsx'

// Render the repository's actual Secondary story with its original args.
export default function GosrockButtonMedium({ p = {} } = {}) {
  return <Secondary {...Secondary.args} {...p} />
}
