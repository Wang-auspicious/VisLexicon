import { setTheme, useStore } from '../store.js'

/* ============ 主题三态开关 ============
 * 跟随系统 / 浅 / 深。「跟随系统」写的不是 data-theme="system"，
 * 而是把属性删掉（见 store.js）——tokens.css 的深色规则分两处：
 * `@media (prefers-color-scheme: dark) :root:not([data-theme='light'])`
 * 与 `:root[data-theme='dark']`，只有属性不存在时系统偏好才生效。
 *
 * 三个 radio 而不是一个循环按钮：循环按钮说不清「现在是哪一态、下一步会变成什么」。
 */

const OPTIONS = [
  { value: 'system', labelZh: '跟随系统', glyph: '◐' },
  { value: 'light', labelZh: '浅色', glyph: '○' },
  { value: 'dark', labelZh: '深色', glyph: '●' },
]

export default function ThemeToggle() {
  const { theme } = useStore()

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="配色主题">
      {OPTIONS.map((option) => {
        const on = theme === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={`theme-opt ${on ? 'on' : ''}`}
            title={option.labelZh}
            onClick={() => setTheme(option.value)}
          >
            <span aria-hidden="true">{option.glyph}</span>
            <span className="sr-only">{option.labelZh}</span>
          </button>
        )
      })}
    </div>
  )
}
