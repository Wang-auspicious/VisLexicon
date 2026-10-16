import { useState } from 'react'
import OriginalSkillDocument from '../OriginalSkillDocument.jsx'
import IMAGE_PROMPTS_EN from '../../data/image-prompts.en.json'
import { imageResourcePresentation } from '../../lib/image-prompts.js'
import { useLocale } from '../../i18n.js'
import { englishText, topicEnglish } from '../../lib/localized-content.js'

// 生图 Prompt 详情：来源效果图、可复制提示词、使用方法与署名。
export default function ImagePromptDetail({ item, back }) {
  const en = useLocale() === 'en'
  const [copyState, setCopyState] = useState('idle')
  const translation = IMAGE_PROMPTS_EN[item.id]
  const presentation = imageResourcePresentation(en ? { ...item, prompt: translation?.prompt || englishText(item.prompt) } : item)
  const { isSkill, prompt, images, comparison, sourceOnly, links } = presentation
  return <article className="rl-detail">
    <div className="rl-breadcrumb"><button type="button" onClick={back}>{en?'← All prompts':'← 返回提示词'}</button><span>{en ? topicEnglish(item.topicZh) : item.topicZh}</span></div>
    <div className="rl-detail-layout"><div>
      <div className={images.length > 1 ? 'rl-comparison-pair' : undefined}>{images.map(image=><figure className={comparison.kind ? 'rl-stage rl-comparison' : 'rl-stage'} key={image.src}><img src={image.src} alt={`${en?item.titleEn:item.titleZh} · ${en?image.labelEn:image.labelZh}`}/><figcaption>{en?image.labelEn:image.labelZh} · {en ? englishText(translation?.imageCredit, englishText(item.imageCredit, englishText(item.sourceName, 'Original creator'))) : item.imageCredit || item.sourceName}</figcaption></figure>)}</div>
      {(comparison.caption || sourceOnly)&&<p>{en ? englishText(translation?.comparisonCaption, 'Original source example; not independently reproduced here.') : comparison.caption || '前后效果请查看来源原图。'}{(comparison.sourceUrl || sourceOnly)&&<> <a href={comparison.sourceUrl || item.sourceUrl} target="_blank" rel="noreferrer">{en?'View comparison source':'查看效果来源'}</a></>}</p>}
      <h1>{en?item.titleEn:item.titleZh}</h1><p className="rl-lead">{en?(item.descriptionEn || item.titleEn):item.descriptionZh}</p>
      {item.originalDocument && <OriginalSkillDocument key={item.originalDocument.sha256} document={item.originalDocument} en={en} />}
      {prompt&&<section><h2>{en?'Reusable prompt':'可复制提示词'}</h2><p>{isSkill ? (en?'Use this invocation according to the original Skill instructions.':'按 Skill 原文说明使用下方调用提示。') : (en?'Upload your reference photo, then use this adapted prompt. The source example was not generated with this adapted wording.':'先上传你的参考照片，再使用下方整理版提示词。上方为来源效果图，整理版尚未独立复现。')}</p>
        <textarea className="rl-prompt" aria-label={en?'Image editing prompt':'图像编辑提示词'} readOnly value={prompt}/>
        <button className="rl-copy" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setCopyState('copied')}catch{setCopyState('failed')}}}>{copyState==='copied'?(en?'Copied':'已复制'):(en?'Copy prompt':'复制提示词')}</button>
        <span role="status">{copyState==='failed'?(en?'Select the prompt above to copy it manually.':'复制未成功，可选中上方文本手动复制。'):copyState==='copied'?(en?'Prompt copied.':'提示词已复制。'):''}</span>
      </section>}
      {item.inputPreview&&<figure className="rl-stage"><img src={item.inputPreview} alt={en?'Original reference image':'来源参考原图'} loading="lazy"/><figcaption>{en?'Source input reference':'来源输入参考图'}</figcaption></figure>}
    </div><aside className="rl-detail-notes">
      <section><h2>{en?'How to use':'使用方法'}</h2>{isSkill ? <><p>{en ? translation?.skillName || englishText(item.skillName) : item.skillName}</p><p>{en ? (item.usageEn || 'Read the original Skill and follow its setup instructions.') : (item.usageZh || '打开 Skill 原文，按说明获取并使用。')}</p></> : <ol><li>{en?'Upload a photo you may use.':'上传你可以使用的人物、宠物或物品照片。'}</li><li>{en?'Copy the prompt into an image editing model and adjust bracketed subjects.':'复制提示词到支持图像编辑的模型，按需要替换对象与文字。'}</li><li>{en?'Check identity, composition and details in the output.':'检查主体辨识度、构图和细节，再按需调整。'}</li></ol>}</section>
      {links.length>0&&<section><h2>{en?'Skill and recommendation':'Skill 与分享出处'}</h2>{links.map(link=><p key={link.zh}><a href={link.href} target="_blank" rel="noreferrer">{en?link.en:link.zh}</a></p>)}</section>}
      <section><h2>{en?'Original source':'原始来源'}</h2><a href={item.sourceUrl} target="_blank" rel="noreferrer">{en ? englishText(translation?.sourceName, englishText(item.sourceName, 'Original source')) : item.sourceName}</a>{item.authorUrl&&<p><a href={item.authorUrl} target="_blank" rel="noreferrer">{en?'Author / original post':'作者／原帖'}</a></p>}<p>{en?'Reference model':'来源标注模型'}：{en ? englishText(item.model, 'Not specified') : item.model || '未注明'}</p><p>{en?'Model usage fees depend on your provider.':'模型使用费用以你的服务商为准。'}</p></section>
      {item.publishedAt&&<p>{en?'Original post date':'原帖发布日期'}：<time dateTime={item.publishedAt}>{item.publishedAt.slice(0,10)}</time></p>}
      {item.collectorUrl&&<p><a href={item.collectorUrl} target="_blank" rel="noreferrer">{en?'Collected prompt and example':'收录原文与效果图'}</a></p>}
      {item.sourceVerification?.noteZh&&<p>{en ? (item.sourceVerification.noteEn || 'Source attribution checked through a public collection or mirror.') : item.sourceVerification.noteZh}</p>}
      <section><h2>{en?'Image attribution':'图片署名'}</h2><p>{en ? englishText(translation?.imageCredit, englishText(item.imageCredit, englishText(item.sourceName, 'Original creator'))) : item.imageCredit || item.sourceName}</p>{item.imageLicenseUrl&&<a href={item.imageLicenseUrl} target="_blank" rel="noreferrer">{en ? englishText(item.imageLicense, 'Source license') : item.imageLicense || '来源许可'}</a>}</section>
    </aside></div>
  </article>
}
