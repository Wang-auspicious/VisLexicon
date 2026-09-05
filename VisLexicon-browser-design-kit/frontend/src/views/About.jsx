import { useEffect, useMemo, useState } from 'react'
import { COUNT_DEFINITIONS, siteWideCounts } from '../lib/counts.js'
import { COLLECTIONS } from '../data/collections.js'
import DeltaEDemo from '../components/DeltaEDemo.jsx'

/* ============ 关于页（方案 §2.1、§8 第 3/9/10 条） ============
 * 这一页是全站唯一一处「承诺可被核验」的落点：方法论、数字口径表、
 * Agent 端点、我们删掉了什么、分组清单、提交说明。
 *
 * 纪律：页面上每个数字都由 siteWideCounts() 现算，模块内没有任何统计量字面量；
 * 算不出来的显示「未知」，不用别的数字顶替。
 */

/* 口径表每一行的数字点到哪里去（导流表 L9）。
 * 候选条目没有浏览页面——它只公开在 Agent 索引端点的 counts 里，就链到那儿，
 * 不假装有一个候选目录可以逛。 */
const COUNT_TARGETS = {
  approvedEntries: { href: '#/sites', labelZh: '全部站点' },
  candidateEntries: { href: '/r/registry.json', labelZh: 'registry.json 的 counts', external: true },
  atlasTerms: { href: '#/atlas', labelZh: '图鉴' },
  atlasTermsOnStage: { href: '#/atlas', labelZh: '图鉴 · 已入台' },
  atlasMachineTranslated: { href: '#/atlas', labelZh: '图鉴 · 译名欠账' },
  unknownLicense: { href: '#/sites?licenses=unknown', labelZh: '全部站点 · 许可未知' },
}

/* 三个 Agent 端点。路径抄 shadcn 的 registry 约定（方案 §6.2），
 * 这里列的每一条都会在运行时真的 fetch 一次——不存在就如实说不存在。 */
const ENDPOINTS = [
  { path: '/r/registry.json', titleZh: 'Agent 索引', descZh: '已审核条目的清单：id、名字、主页、许可、获取方式、核验时间。筛选用，不含正文。' },
  { path: '/site/shadcn-ui.md', titleZh: 'DESIGN.md（每条一份）', descZh: 'Google Labs 规范的两层结构：frontmatter + Overview + Do’s and Don’ts。许可条款原句照抄，带证据 URL。' },
  { path: '/llms.txt', titleZh: 'llms.txt', descZh: '给模型看的站点导览：机器接口在哪、已审核条目有哪些。' },
]

const REMOVED = [
  {
    what: '候选目录与首屏大数字',
    whyZh: '旧首页最大的字是候选池规模，而页面上实际能打开的只有已核验的那一批。没被人看过的东西不该当作成绩摆在最前面。候选规模现在只出现在下面的口径表和 Agent 索引里，并注明它来自样本包自述。',
  },
  {
    what: '分类下拉',
    whyZh: '旧的全部站点页用五个下拉筛十几条内容。分类字段留在后台（它是编辑判断的一部分），但前台不再有分类维度——要收口就用切面 chips，每个值旁边带命中数。',
  },
  {
    what: '「工具」频道的两张端点卡',
    whyZh: '卡片区标题写着「全部为真实可用的开放协议与端点」，而站点根本没有生成过那两个文件。现在只列上面三个真的存在、且每次打开这一页都会被重新 fetch 一遍的端点。',
  },
  {
    what: '图鉴的「导出代码」按钮',
    whyZh: '它导出的不是舞台上那个部件，是一个写死的占位盒子，却盖着「Verified Spec」徽章。图鉴的定位是看懂与比较，不出包。',
  },
  {
    what: '策展卡上的作者头像',
    whyZh: '那六张是图库里的陌生人照片，被当成真实作者的头像。作者信息现在只从站点自己的页面上取，并且必须带出处链接。',
  },
  {
    what: '旧的 62 条词典词条',
    whyZh: '它是上一代产品的数据模型，顶栏进不去，只能靠命令面板找到，和图鉴的 220 条术语互不相通。整批删除前先导出成清单存档（docs/legacy-62-entries.md），一条都没有悄悄丢。',
  },
]

/** null / undefined 一律显示「未知」，不用 0 顶替（0 是一个结论，未知是另一个）。 */
function CountValue({ value, target }) {
  if (value === null || value === undefined) return <span className="ab-num none">未知</span>
  if (!target) return <span className="ab-num">{value}</span>
  return (
    <a
      className="ab-num"
      href={target.href}
      target={target.external ? '_blank' : undefined}
      rel={target.external ? 'noreferrer' : undefined}
    >
      {value}
      <span className="sr-only">，去{target.labelZh}</span>
    </a>
  )
}

function EndpointRow({ endpoint }) {
  const [state, setState] = useState('checking')   /* checking | ok | missing */

  useEffect(() => {
    let alive = true
    fetch(endpoint.path, { method: 'HEAD' })
      .then((res) => { if (alive) setState(res.ok ? 'ok' : 'missing') })
      .catch(() => { if (alive) setState('missing') })
    return () => { alive = false }
  }, [endpoint.path])

  return (
    <li className="ab-endpoint">
      <div className="ab-endpoint-h">
        <a className="inline-link x-mono" href={endpoint.path} target="_blank" rel="noreferrer">{endpoint.path}</a>
        <span className={`ab-probe ${state}`}>
          {state === 'checking' ? '正在核对…' : state === 'ok' ? '刚刚核对：文件存在' : '刚刚核对：取不到这个文件'}
        </span>
      </div>
      <p className="ab-endpoint-t">{endpoint.titleZh}</p>
      <p className="ab-endpoint-d">{endpoint.descZh}</p>
    </li>
  )
}

export default function About() {
  const [items, setItems] = useState(null)
  const [atlas, setAtlas] = useState(null)
  const [manifests, setManifests] = useState(null)
  const [sampleInfo, setSampleInfo] = useState(null)
  const [dataError, setDataError] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch('/data/site-index.json').then((res) => (res.ok ? res.json() : null)).catch(() => null),
      import('../data/visual-atlas.json').then((mod) => mod.default).catch(() => null),
      import('../stages/manifests.js').then((mod) => mod.MANIFESTS).catch(() => null),
      import('../data/site-catalog.json').then((mod) => mod.default?.sampleInfo ?? null).catch(() => null),
    ]).then(([siteIndex, atlasData, manifestList, sample]) => {
      if (!alive) return
      setItems(siteIndex?.items ?? null)
      setAtlas(atlasData)
      setManifests(manifestList)
      setSampleInfo(sample)
      if (!siteIndex) setDataError(true)
    })
    return () => { alive = false }
  }, [])

  /* 缺哪份数据，对应的数字就是 null → 渲染成「未知」。
   * 站点索引还没到手时不能显示 0：0 是一个结论，未知是另一个。 */
  const counts = useMemo(() => {
    const computed = siteWideCounts({ items: items ?? [], atlas, manifests, sampleInfo })
    if (items === null) {
      return { ...computed, approvedEntries: null, unknownLicense: null, latestCheckedAt: null }
    }
    return computed
  }, [items, atlas, manifests, sampleInfo])

  const latest = counts.latestCheckedAt ? counts.latestCheckedAt.slice(0, 10) : null

  return (
    <article className="about">
      <header className="ab-head">
        <h1>关于</h1>
        <p className="ab-lede">
          这个站只做一件事：把同类的东西摆在一起，让差别自己显出来。
          站点是一条一条进站看过的，术语是一台一台摆上去的；
          每个数字下面这张表都写明它是什么、怎么算的。
        </p>
        {dataError && <p className="ab-warn" role="alert">站点索引没能加载，下面表里的站点侧数字会显示为「未知」。</p>}
      </header>

      {/* ---------------- 方法论 ---------------- */}
      <section className="ab-sec" id="method" aria-labelledby="ab-method-h">
        <h2 id="ab-method-h">我们怎么核验一个站</h2>
        <p>
          一条记录成立的条件是三件事同时具备：进站抓到三张证据图、每条事实各自带出处、
          以及整理的人和确认的人不是同一个。缺任何一件，这条记录就停在候选里，不会出现在浏览页面上。
        </p>

        <h3>三张证据图各自回答一个问题</h3>
        <dl className="ab-dl">
          <dt>身份页（identity）</dt>
          <dd>这个站自称是什么。取它的首页或产品页——名字、定位、归属都在这一屏上。</dd>
          <dt>范围页（breadth）</dt>
          <dd>它到底有多少东西。取组件总览、目录页或索引页，用来判断「一个站」和「一个 demo」的区别。</dd>
          <dt>事实页（proof）</dt>
          <dd>它的说法能不能被验证。取一个具体条目的详情页——有没有可运行示例、安装命令、API、许可声明。</dd>
        </dl>
        <p>
          每张图都记着它是从哪个 URL 抓的、为什么选这一页（<code className="x-mono">selectionRationale</code>），
          详情页上三张图各自可以点回原页。抓图不是配图，是可以被人复核的取证。
        </p>

        <h3>独立复核</h3>
        <p>
          分类与结论由一个人整理，再由另一个人确认；两个人是同一个的记录，
          在数据里标成「未独立复核」，界面上照实显示，不因为不好看就藏起来。
          我们只公开这个布尔值，不公开是谁——评价的是流程，不是人。
        </p>

        <h3>checkedAt 是什么意思</h3>
        <p>
          它是「我们最后一次真的打开这个站是什么时候」，不是收录时间，也不是更新时间。
          它会过期，所以它必须显示在卡片和详情页上，让你自己判断这条记录还新不新。
          {latest
            ? <> 当前语料里最近的一次核验是 <span className="x-mono">{latest}</span>。</>
            : <> 当前取不到核验时间，界面上会显示为未知。</>}
        </p>

        <h3>一个真实例子：origin-ui 变成了 Coss UI</h3>
        <p>
          语料里有一条 <code className="x-mono">origin-ui</code>。进站核验那天（
          <span className="x-mono">2026-09-01</span>）打开它，落地页已经是
          <a className="inline-link" href="https://coss.com/ui" target="_blank" rel="noreferrer"> coss.com/ui ↗</a>，
          页面自称 Coss UI，页脚写着 Built by and for the team of Cal.com, Inc.。
          于是这条记录的名字按站点当天的自述改成了 Coss UI，
          <code className="x-mono">finalUrl</code> 记的是跳转之后的地址而不是我们输进去的那个，
          组织与作者两条事实各自链回那张事实页。
        </p>
        <p>
          这条记录同时暴露了一处尚未追平的地方：许可事实取自
          <a
            className="inline-link"
            href="https://github.com/cosscom/coss/blob/main/apps/ui/package.json"
            target="_blank"
            rel="noreferrer"
          > apps/ui/package.json ↗</a> 里的 MIT 声明，
          <strong>语料记录的 license 仍是单一 MIT，待下次核验</strong>——
          站点已经改名换域，仓库结构是否随之变化我们还没有重新看过。
          在重新看过之前，我们不会自己替它改写这条事实。
          你在这个站上看到的每条许可信息都是这个成色：写的是我们那天看到的原句，不是我们的法务判断。
        </p>

        <DeltaEDemo items={items} />
      </section>

      {/* ---------------- 数字口径表 ---------------- */}
      <section className="ab-sec" id="counts" aria-labelledby="ab-counts-h">
        <h2 id="ab-counts-h">数字口径</h2>
        <p>
          站上出现的每个数字都由当前加载的数据现算，源码里没有写死的统计量。
          同一个词在不同分母下会是不同的数——所以这里逐个写明它数的是什么。
          表里每个数字都能点到它对应的那份清单。
        </p>
        <div className="ab-table-wrap" role="region" aria-label="数字口径表（可横向滚动）" tabIndex={0}>
          <table className="ab-table">
            <thead>
              <tr>
                <th scope="col">数字</th>
                <th scope="col">它是什么</th>
                <th scope="col">怎么算的</th>
                <th scope="col">现在是</th>
              </tr>
            </thead>
            <tbody>
              {COUNT_DEFINITIONS.map((definition) => (
                <tr key={definition.id}>
                  <th scope="row">{definition.labelZh}</th>
                  <td>{definition.definitionZh}</td>
                  <td className="ab-method">{definition.methodZh}</td>
                  <td className="ab-value">
                    <CountValue value={counts[definition.id]} target={COUNT_TARGETS[definition.id]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ab-foot-note">
          候选条目的规模只出现在这一行。它不是我们数出来的，是样本包自述字段
          <code className="x-mono"> sampleInfo.productionCandidateCount</code>（见
          <code className="x-mono"> src/data/site-catalog.json</code>）。
          候选条目不出现在任何浏览页面，也不出现在 Agent 索引的条目列表里——只公开这一个计数。
        </p>
        <p className="ab-foot-note">
          这是一个样本构建：图鉴那几行数的是本样本包里的 220 条语料，不是生产总量。
        </p>
      </section>

      {/* ---------------- Agent 端点 ---------------- */}
      <section className="ab-sec" id="endpoints" aria-labelledby="ab-endpoints-h">
        <h2 id="ab-endpoints-h">给 Agent 的三个端点</h2>
        <p>
          同一条记录的两种渲染，一先一后，不是两套产品：人看的是这个网站，
          模型读的是下面三个静态文件。无鉴权、无限流、构建期生成。
          每次打开这一页，浏览器都会真的请求一次这三个地址，下面显示的是这次请求的结果。
        </p>
        <ul className="ab-endpoints">
          {ENDPOINTS.map((endpoint) => <EndpointRow key={endpoint.path} endpoint={endpoint} />)}
        </ul>
        <p className="ab-foot-note">
          每条记录的详情端点是 <code className="x-mono">/r/&lt;entryId&gt;.json</code>，
          DESIGN.md 是 <code className="x-mono">/site/&lt;entryId&gt;.md</code>；
          上面第二行拿其中一条做样例。索引里每一条都带着自己的这两个地址。
        </p>
      </section>

      {/* ---------------- 分组清单 ---------------- */}
      <section className="ab-sec" id="collections" aria-labelledby="ab-collections-h">
        <h2 id="ab-collections-h">分组清单</h2>
        <p>
          分组是编辑挑出来的罗列，不是标签也不是分类。它是可下架的编辑物，
          所以每组都记着上架日期，复审时先看最老的那组。
        </p>
        <div className="ab-table-wrap" role="region" aria-label="分组清单（可横向滚动）" tabIndex={0}>
          <table className="ab-table">
            <thead>
              <tr>
                <th scope="col">分组</th>
                <th scope="col">说明</th>
                <th scope="col">成员</th>
                <th scope="col">上架日期</th>
              </tr>
            </thead>
            <tbody>
              {COLLECTIONS.map((group) => (
                <tr key={group.id}>
                  <th scope="row"><a className="inline-link" href="#/">{group.titleZh}</a></th>
                  <td>{group.blurbZh}</td>
                  <td className="ab-value">{group.entryIds.length}</td>
                  <td className="ab-value x-mono">{group.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- 我们删掉了什么 ---------------- */}
      <section className="ab-sec" id="removed" aria-labelledby="ab-removed-h">
        <h2 id="ab-removed-h">我们删掉了什么</h2>
        <p>
          这一版拿掉的东西比加上的多。下面这几条是你以前在页面上能看见、现在看不见了的，
          每条都写明为什么。
        </p>
        <ol className="ab-removed">
          {REMOVED.map((item) => (
            <li key={item.what}>
              <h3>{item.what}</h3>
              <p>{item.whyZh}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- 提交说明 ---------------- */}
      <section className="ab-sec" id="submit" aria-labelledby="ab-submit-h">
        <h2 id="ab-submit-h">想让我们收一个站</h2>
        <p>
          <strong>先说清楚：本站当前没有接收提交的后端。</strong>
          页脚那个框只做一件事——把你粘的地址和已发布的索引在你自己的浏览器里比一次。
          它不会把任何东西发出去，也不会给你一个「已进入候选队列」的假状态。
        </p>
        <ul className="ab-list">
          <li>命中已发布索引 → 直接给你那条记录的详情页。</li>
          <li>没命中 → 给你一段可复制的 JSON，你自己决定发给谁。</li>
        </ul>
        <p>收进来要过的门槛，就是上面「我们怎么核验一个站」写的三条：</p>
        <ol className="ab-list">
          <li>能抓到身份 / 范围 / 事实三张页面，且每张都说得出为什么选它。</li>
          <li>许可、作者、归属这类事实各自有出处链接，取不到就记 unknown，不猜。</li>
          <li>整理与确认由两个人分别完成。</li>
        </ol>
        <p className="ab-foot-note">
          有一个后端之后，这里会写清楚它做什么、多久回一次。在那之前不写。
        </p>
      </section>
    </article>
  )
}
