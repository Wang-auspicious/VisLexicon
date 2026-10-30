// Owner-facing facts for the about, sponsor, submit and legal pages.
// The pages and scripts/build-seo-pages.mjs both read this file, so the
// static HTML that search engines see says exactly what the app says.

export const CONTACT_EMAIL = 'zjz652158@outlook.com'
export const SITE_NAME = { zh: '视元 VisLexicon', en: 'VisLexicon' }
export const LEGAL_UPDATED = '2026-10-29'

// One-time sponsorship, not a subscription: pick an amount, sponsor once.
// Sponsors appear as cards labelled "赞助 / Sponsored" inside the listings
// (like designeer.xyz) and stay on the thank-you list.
export const SPONSOR_AMOUNTS = [10, 50, 100, 200]

export const SPONSOR_FAQ = [
  { qZh: '赞助会影响收录吗？', aZh: '不会。收录和排序只看编辑标准；赞助卡片单独展示，并标着“赞助”。', qEn: 'Does sponsoring affect what is listed?', aEn: 'No. Selection and ranking follow the editorial standards only. Sponsor cards are shown separately and labelled Sponsored.' },
  { qZh: '赞助一次能得到什么？', aZh: '你的产品会以带“赞助”标签的卡片出现在网站列表里，和其他赞助者轮流展示；名字会留在赞助者名单里。', qEn: 'What does one sponsorship get me?', aEn: 'Your product appears as a card labelled Sponsored in the listings, rotating with other sponsors, and your name stays on the sponsor list.' },
  { qZh: '需要准备什么？', aZh: '一个方形品牌标志、产品名、一句话介绍和跳转链接。上线前我们会看一下文案和素材。', qEn: 'What do you need from me?', aEn: 'A square brand mark, product name, one-line description and destination URL. We review copy and assets before they go live.' },
  { qZh: '什么产品不接？', aZh: '与设计、开发、创作无关的产品，以及违法、误导、成人、赌博、加密货币投机类产品。', qEn: 'What do you not accept?', aEn: 'Products unrelated to design, development or making, and anything unlawful, misleading, adult, gambling or speculative crypto.' },
]

export const SUBMIT_KINDS = [
  { id: 'site', zh: '网站或作品', en: 'Website or work' },
  { id: 'components', zh: '组件库或设计系统', en: 'Component library or design system' },
  { id: 'tool', zh: '工具', en: 'Tool' },
  { id: 'assets', zh: '素材或模板', en: 'Assets or templates' },
  { id: 'resource', zh: 'Skill、PPT 或其他资源', en: 'Skill, deck or other resource' },
]

// Legal pages: plain language, kept short. Sections are { h, p[] }.
export const LEGAL_PAGES = {
  privacy: {
    zh: { title: '隐私', intro: '视元不需要注册，也不卖任何数据。', sections: [
      { h: '我们收集什么', p: ['访问统计：用 Cloudflare Web Analytics 记录页面访问量、来源国家和浏览器类型。它不用 Cookie，不追踪个人。', '投稿：你在投稿表单里填的网址、称呼、邮箱和留言，只用来审核投稿和通知你结果。邮箱可以不填。', 'AI 精排：你输入的检索描述和候选条目会发给模型服务商打分，不附带你的身份信息。'] },
      { h: '存在你浏览器里的东西', p: ['收藏、主题（深浅色）、语言等偏好存在你自己的浏览器（localStorage）里，不上传到我们的服务器。清除浏览器数据就会删除。'] },
      { h: 'Cookie', p: ['我们不设置用于追踪或广告的 Cookie。托管服务 Cloudflare 可能为安全防护设置必要的 Cookie。'] },
      { h: '谁帮我们运行这个网站', p: ['Cloudflare：托管网站、存放图片、运行检索与投稿接口、统计访问量。', '模型服务商（opencode.ai）：处理 AI 精排请求。'] },
      { h: '你的选择', p: [`想删除你提交过的投稿信息，或对隐私有任何问题，写信到 ${CONTACT_EMAIL}。`] },
    ] },
    en: { title: 'Privacy', intro: 'VisLexicon needs no account and sells no data.', sections: [
      { h: 'What we collect', p: ['Visit statistics: Cloudflare Web Analytics records page views, country and browser type. It uses no cookies and does not track individuals.', 'Submissions: the URL, name, email and note you enter are used only to review the submission and tell you the outcome. Email is optional.', 'AI ranking: your search text and candidate entries are sent to the model provider for scoring, without any identity information.'] },
      { h: 'What stays in your browser', p: ['Favourites, theme and language preferences are kept in your own browser (localStorage) and never uploaded. Clearing browser data removes them.'] },
      { h: 'Cookies', p: ['We set no tracking or advertising cookies. Our host, Cloudflare, may set cookies strictly needed for security.'] },
      { h: 'Who helps us run the site', p: ['Cloudflare: hosting, images, the search and submission endpoints, visit statistics.', 'The model provider (opencode.ai): AI ranking requests.'] },
      { h: 'Your choices', p: [`To delete a submission you sent, or for any privacy question, write to ${CONTACT_EMAIL}.`] },
    ] },
  },
  terms: {
    zh: { title: '使用条款', intro: '使用视元即表示你同意以下条款。', sections: [
      { h: '内容', p: ['视元收录的是指向原网站的介绍、截图和实测数据，用于参考和学习。被收录作品的权利属于原作者，详见内容许可。', '页面上的价格、许可、源码等信息以原网站为准。我们会尽量核实，但不保证没有错误或过时。'] },
      { h: '投稿', p: ['投稿免费，所有投稿都要经过编辑审核，提交不代表一定收录。你提交的内容须是你有权推荐的公开网页。'] },
      { h: '赞助', p: ['赞助是一次性的，不是订阅。赞助者的卡片标明“赞助”，不影响收录和排序。我们可以拒绝不合适的赞助，详见退款政策。'] },
      { h: '合理使用', p: ['欢迎人和 Agent 读取公开的数据接口。请不要高频抓取、绕过限流，或把 AI 精排接口用于本站以外的用途。滥用的请求会被限流或屏蔽。'] },
      { h: '变更', p: ['条款可能更新，更新后的版本发布在本页，以页面上的日期为准。'] },
    ] },
    en: { title: 'Terms', intro: 'By using VisLexicon you agree to these terms.', sections: [
      { h: 'Content', p: ['VisLexicon lists descriptions, screenshots and measured details that point to original websites, for reference and learning. Rights in listed work belong to its makers; see the content licence.', 'Prices, licences and source availability shown here defer to the original site. We check them but cannot guarantee they are error-free or current.'] },
      { h: 'Submissions', p: ['Submitting is free. Every submission goes through editorial review and submission does not guarantee a listing. Only submit public pages you are entitled to recommend.'] },
      { h: 'Sponsorship', p: ['Sponsoring is a one-time payment, not a subscription. Sponsor cards are labelled Sponsored and never affect selection or ranking. We may decline unsuitable sponsors; see the refund policy.'] },
      { h: 'Fair use of the site', p: ['People and agents are welcome to read the public data endpoints. Do not scrape at high frequency, bypass rate limits or use the AI ranking endpoint for anything outside this site. Abusive requests are limited or blocked.'] },
      { h: 'Changes', p: ['These terms may change. The current version is published on this page with its date.'] },
    ] },
  },
  licence: {
    zh: { title: '内容许可', intro: '视元展示的作品属于它们的作者。', sections: [
      { h: '作品归作者', p: ['我们展示网站截图、组件截图和简短介绍，只为参考和学习，并始终注明作者或来源，附上原网址。'] },
      { h: '下架与修改署名', p: [`如果你是作品的作者，希望下架或修改署名，写信到 ${CONTACT_EMAIL}，附上页面链接。我们收到后会尽快处理。`] },
      { h: '视元自己的内容', p: ['编辑撰写的中文介绍、分类与结构化数据由视元整理。引用请注明出处并附链接。', '收录的 DESIGN.md、Skill 等原始文件保留其原作者的许可，以各文件标注的许可为准。'] },
    ] },
    en: { title: 'Licence', intro: 'Work shown on VisLexicon belongs to the people who made it.', sections: [
      { h: 'Work belongs to its makers', p: ['We show website and component screenshots with short descriptions for reference and learning, always credited with a link to the source.'] },
      { h: 'Removal or credit changes', p: [`If you made something shown here and want it removed or credited differently, email ${CONTACT_EMAIL} with the page link and we will take care of it promptly.`] },
      { h: 'VisLexicon’s own content', p: ['Editorial descriptions, classification and structured data are compiled by VisLexicon. Please credit and link when quoting.', 'Original files such as DESIGN.md and Skills keep their authors’ licences, as stated on each file.'] },
    ] },
  },
  refunds: {
    zh: { title: '退款政策', intro: '只适用于赞助。浏览、投稿都免费。', sections: [
      { h: '上线前', p: ['赞助卡片上线前改变主意，全额退款。'] },
      { h: '上线后', p: ['赞助是一次性的，上线后不退款；你可以随时来信修改卡片内容或撤下。'] },
      { h: '我们拒绝时', p: ['如果我们认为产品不适合展示（见赞助说明），会全额退回。'] },
      { h: '怎么申请', p: [`写信到 ${CONTACT_EMAIL}，说明赞助金额和原因。`] },
    ] },
    en: { title: 'Refunds', intro: 'Applies to sponsorships only. Browsing and submitting are free.', sections: [
      { h: 'Before it goes live', p: ['Change your mind before your sponsor card goes live for a full refund.'] },
      { h: 'After it goes live', p: ['Sponsoring is one-time and not refundable after launch; you can ask us to edit or remove your card at any time.'] },
      { h: 'If we decline', p: ['If we decide a product is not suitable to show, we refund in full.'] },
      { h: 'How to ask', p: [`Email ${CONTACT_EMAIL} with the amount and the reason.`] },
    ] },
  },
}

export const INFO_ROUTES = ['submit', ...Object.keys(LEGAL_PAGES)]
