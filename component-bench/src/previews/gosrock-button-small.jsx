import { SmallTest } from '../vendor/gosrock/src/stories/Button/Button.stories.jsx'

// Render the repository's actual SmallTest story with its original args.
export default function GosrockButtonSmall({ p = {} } = {}) {
  return <SmallTest {...SmallTest.args} {...p} />
}
