import { setLocale, useStore } from '../store.js'
import { useT } from '../i18n.js'

export default function LangToggle() {
  const locale = useStore().locale === 'en' ? 'en' : 'zh'
  const t = useT()

  return (
    <div className="lang-toggle" role="radiogroup" aria-label={t('lang')}>
      <button
        type="button"
        role="radio"
        aria-checked={locale === 'zh'}
        className={`lang-opt ${locale === 'zh' ? 'on' : ''}`}
        onClick={() => setLocale('zh')}
      >
        中
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={locale === 'en'}
        className={`lang-opt ${locale === 'en' ? 'on' : ''}`}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  )
}
