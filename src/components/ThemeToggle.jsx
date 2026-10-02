import { setTheme, useStore } from '../store.js'
import { useT } from '../i18n.js'

/* ============ 主题三态开关 ============
 * 跟随系统 / 浅 / 深。「跟随系统」写的不是 data-theme="system"，
 * 而是把属性删掉（见 store.js）——tokens.css 的深色规则分两处：
 * `@media (prefers-color-scheme: dark) :root:not([data-theme='light'])`
 * 与 `:root[data-theme='dark']`，只有属性不存在时系统偏好才生效。
 *
 * 三个 radio 而不是一个循环按钮：循环按钮说不清「现在是哪一态、下一步会变成什么」。
 */

const OPTIONS = [
  { value: 'system', key: 'themeSystem', glyph: '◐' },
  { value: 'light', key: 'themeLight', glyph: '○' },
  { value: 'dark', key: 'themeDark', glyph: '●' },
]

export default function ThemeToggle() {
  const { theme } = useStore()
  const t = useT()

  return (
    <div className="theme-toggle" role="radiogroup" aria-label={t('theme')}>
      {OPTIONS.map((option) => {
        const on = theme === option.value
        const label = t(option.key)
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={`theme-opt ${on ? 'on' : ''}`}
            title={label}
            onClick={() => setTheme(option.value)}
          >
            <span aria-hidden="true">{option.glyph}</span>
            <span className="sr-only">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
