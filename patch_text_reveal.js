const fs = require('fs')

const path = 'demo/src/stages/text-reveal/Stage.jsx'
let content = fs.readFileSync(path, 'utf-8')

// Add them to PER_CHAR set
content = content.replace(
  "const PER_CHAR = new Set(['typewriter', 'streaming', 'fade', 'blur', 'morph'])",
  "const PER_CHAR = new Set(['typewriter', 'streaming', 'fade', 'blur', 'morph', 'tumble'])"
)

// Add new presets before the final per-char block
const newPresets = `
  if (preset === 'holo') {
    return (
      <div className="tr" style={style} key={\`\${preset}-\${replayKey}\`}>
        <div className="tr-specimen-wrap">
          {guideLines}
          <p className="tr-line tr-holo" data-text={text}>{text}</p>
        </div>
      </div>
    )
  }

  if (preset === 'glitch') {
    return (
      <div className="tr" style={style} key={\`\${preset}-\${replayKey}\`}>
        <div className="tr-specimen-wrap">
          {guideLines}
          <div className="tr-glitch-box">
             <p className="tr-line tr-glitch" data-text={text}>{text}</p>
          </div>
        </div>
      </div>
    )
  }

  if (preset === 'scrub') {
    return (
      <div className="tr" style={style} key={\`\${preset}-\${replayKey}\`}>
        <div className="tr-specimen-wrap">
          {guideLines}
          <p className="tr-line tr-scrub">{text}</p>
        </div>
      </div>
    )
  }
`

content = content.replace("if (!PER_CHAR.has(preset)) {", newPresets + "\n  if (!PER_CHAR.has(preset)) {")

fs.writeFileSync(path, content, 'utf-8')
