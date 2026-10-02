// 浏览器探针（Tier 2 的眼睛）。
// 规格：docs/superpowers/specs/2026-09-02-routed-deep-mining-and-threshold-design.md §4.4
//
// 这个函数被序列化后注入页面执行（CDP `Runtime.evaluate` 或 Playwright `page.evaluate` 都可以），
// 因此它必须完全自足：不能引用模块作用域的任何东西，不能用 import。
//
// 纪律：浏览器只负责「读」。量到什么就报什么，不做判断、不做换算。
// 亮度、对比度、占比、三态标签全部在 Node 侧算——放在页面里就没法用夹具测试了。
// 每次调用只测当前一个视口；三档视口由调用方分别执行，再用 mergeProbeReadings 拼起来。

export const PROBE_SOURCE_VERSION = 1

export const DEFAULT_VIEWPORTS = Object.freeze([
  Object.freeze({ label: 'mobile', width: 320, height: 720 }),
  Object.freeze({ label: 'tablet', width: 768, height: 1024 }),
  Object.freeze({ label: 'desktop', width: 1440, height: 900, primary: true }),
])

/* eslint-disable no-undef -- 本函数在页面上下文执行，document/window 由浏览器提供 */
/**
 * 在页面上下文执行，返回一档视口的原始读数。
 * options: { label, primary, sampleLimit, contrastSampleLimit, thickBorderPx, scalePopThreshold }
 */
export function collectProbeReading(options) {
  var config = options || {}
  var LABEL = config.label || 'desktop'
  var SAMPLE_LIMIT = config.sampleLimit || 400
  var CONTRAST_LIMIT = config.contrastSampleLimit || 40
  var THICK_BORDER_PX = config.thickBorderPx || 3
  var SCALE_POP = config.scalePopThreshold || 1.15
  var LARGE_AREA_RATIO = config.largeAreaRatio || 0.15

  var viewportWidth = window.innerWidth
  var viewportHeight = window.innerHeight
  var viewportArea = viewportWidth * viewportHeight

  var PIXEL_FONT_HINTS = [
    'press start', 'pixel', 'silkscreen', 'vt323', 'minecraft', 'nes', 'arcade',
    'dogica', 'pixelify', 'jersey', 'micro 5', 'monogram',
  ]

  function lower(value) {
    return typeof value === 'string' ? value.toLowerCase() : ''
  }

  function isOpaque(color) {
    if (!color) return false
    if (color === 'transparent') return false
    var match = /rgba?\(([^)]+)\)/i.exec(color)
    if (!match) return true
    var parts = match[1].split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 4) return true
    return Number.parseFloat(parts[3]) >= 1
  }

  // 采样而非全量遍历：大站的 DOM 可以到十万节点，全量遍历会拖垮抓取批次。
  function sampleElements(limit) {
    var all = document.body ? document.body.querySelectorAll('*') : []
    var total = all.length
    if (total <= limit) return Array.prototype.slice.call(all)
    var step = total / limit
    var picked = []
    for (var index = 0; index < limit; index += 1) {
      picked.push(all[Math.floor(index * step)])
    }
    return picked
  }

  function effectiveBackground(element) {
    var node = element
    while (node && node !== document.documentElement) {
      var color = window.getComputedStyle(node).backgroundColor
      if (isOpaque(color)) return color
      node = node.parentElement
    }
    var rootColor = window.getComputedStyle(document.documentElement).backgroundColor
    return isOpaque(rootColor) ? rootColor : 'rgb(255, 255, 255)'
  }

  var samples = sampleElements(SAMPLE_LIMIT)

  /* ---- hero：首屏覆盖面积最大的不透明背景 ---- */
  var heroColor = null
  var heroArea = 0
  for (var h = 0; h < samples.length; h += 1) {
    var heroNode = samples[h]
    var heroRect = heroNode.getBoundingClientRect()
    if (heroRect.top > viewportHeight || heroRect.bottom < 0) continue
    var heroStyle = window.getComputedStyle(heroNode)
    if (!isOpaque(heroStyle.backgroundColor)) continue
    var visibleHeight = Math.min(heroRect.bottom, viewportHeight) - Math.max(heroRect.top, 0)
    var visibleWidth = Math.min(heroRect.right, viewportWidth) - Math.max(heroRect.left, 0)
    var area = Math.max(0, visibleHeight) * Math.max(0, visibleWidth)
    if (area > heroArea) {
      heroArea = area
      heroColor = heroStyle.backgroundColor
    }
  }
  if (heroColor === null && document.body) {
    heroColor = effectiveBackground(document.body)
    heroArea = viewportArea
  }

  /* ---- 形状、边框、渐变、像素化 ---- */
  var measuredElements = 0
  var zeroRadiusElements = 0
  var thickElements = 0
  var largeAreaGradients = 0
  var imageRenderingPixelated = false
  var fontFamiliesSeen = {}

  for (var s = 0; s < samples.length; s += 1) {
    var node = samples[s]
    var rect = node.getBoundingClientRect()
    if (rect.width < 4 || rect.height < 4) continue
    var style = window.getComputedStyle(node)
    measuredElements += 1
    if (Number.parseFloat(style.borderTopLeftRadius) === 0) zeroRadiusElements += 1
    if (Number.parseFloat(style.borderTopWidth) >= THICK_BORDER_PX && style.borderTopStyle !== 'none') {
      thickElements += 1
    }
    if (lower(style.backgroundImage).indexOf('gradient') !== -1) {
      if ((rect.width * rect.height) / viewportArea >= LARGE_AREA_RATIO) largeAreaGradients += 1
    }
    if (lower(style.imageRendering) === 'pixelated') imageRenderingPixelated = true
    fontFamiliesSeen[style.fontFamily] = true
  }

  /* ---- 排版 ---- */
  var headingFamilies = []
  var headings = document.querySelectorAll('h1, h2, h3')
  for (var g = 0; g < headings.length && g < 20; g += 1) {
    headingFamilies.push(window.getComputedStyle(headings[g]).fontFamily)
  }

  var bodyMeasureCh = null
  var paragraphs = document.querySelectorAll('p')
  for (var p = 0; p < paragraphs.length && p < 30; p += 1) {
    var paragraph = paragraphs[p]
    var text = (paragraph.textContent || '').trim()
    if (text.length < 80) continue
    var paragraphStyle = window.getComputedStyle(paragraph)
    var fontSize = Number.parseFloat(paragraphStyle.fontSize)
    if (!Number.isFinite(fontSize) || fontSize <= 0) continue
    // 0.5em 是拉丁文平均字宽的通用近似；这是估算，Node 侧只把它当阈值输入。
    var width = paragraph.getBoundingClientRect().width
    var estimate = width / (fontSize * 0.5)
    if (bodyMeasureCh === null || estimate < bodyMeasureCh) bodyMeasureCh = estimate
    break
  }

  var pixelFontMatch = false
  for (var family in fontFamiliesSeen) {
    if (!Object.prototype.hasOwnProperty.call(fontFamiliesSeen, family)) continue
    var loweredFamily = lower(family)
    for (var f = 0; f < PIXEL_FONT_HINTS.length; f += 1) {
      if (loweredFamily.indexOf(PIXEL_FONT_HINTS[f]) !== -1) pixelFontMatch = true
    }
  }

  /* ---- 动效：transform 维度、滚动驱动、scale 过冲关键帧 ---- */
  var transformProperties = []
  var scalePopKeyframes = 0
  var scrollDriven = false
  var scrollTransformSites = 0

  function noteTransform(value) {
    var lowered = lower(value)
    var names = ['translate', 'scale', 'rotate', 'skew', 'perspective', 'matrix']
    for (var t = 0; t < names.length; t += 1) {
      if (lowered.indexOf(names[t]) !== -1 && transformProperties.indexOf(names[t]) === -1) {
        transformProperties.push(names[t])
      }
    }
  }

  for (var sheetIndex = 0; sheetIndex < document.styleSheets.length; sheetIndex += 1) {
    var rules = null
    try {
      rules = document.styleSheets[sheetIndex].cssRules
    } catch {
      // 跨域样式表读不到规则，这是浏览器安全边界，不是抓取失败。
      continue
    }
    if (!rules) continue
    for (var ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
      var rule = rules[ruleIndex]
      var cssText = rule.cssText || ''
      if (lower(cssText).indexOf('animation-timeline') !== -1 ||
          lower(cssText).indexOf('scroll-timeline') !== -1) {
        scrollDriven = true
      }
      if (!rule.cssRules || String(rule.constructor.name).indexOf('Keyframes') === -1) {
        if (lower(cssText).indexOf('transform') !== -1) noteTransform(cssText)
        continue
      }
      for (var frameIndex = 0; frameIndex < rule.cssRules.length; frameIndex += 1) {
        var frameText = rule.cssRules[frameIndex].cssText || ''
        noteTransform(frameText)
        var scaleMatch = /scale3?d?\(\s*([\d.]+)/i.exec(frameText)
        if (scaleMatch && Number.parseFloat(scaleMatch[1]) > SCALE_POP) scalePopKeyframes += 1
      }
    }
  }

  if (!scrollDriven && (window.ScrollTrigger || (window.gsap && window.gsap.plugins &&
      window.gsap.plugins.scrollTrigger))) {
    scrollDriven = true
  }
  if (scrollDriven) {
    for (var w = 0; w < samples.length; w += 1) {
      var scrollStyle = window.getComputedStyle(samples[w])
      if (scrollStyle.transform && scrollStyle.transform !== 'none') scrollTransformSites += 1
    }
  }

  /* ---- 渲染能力 ---- */
  var webglContexts = 0
  var canvases = document.querySelectorAll('canvas')
  for (var c = 0; c < canvases.length; c += 1) {
    // getContext 在同一 canvas 上重复调用会返回既有 context，不会新建，因此这是只读探测。
    try {
      if (canvases[c].getContext('webgl2') || canvases[c].getContext('webgl')) webglContexts += 1
    } catch {
      // 有些页面覆写了 getContext；探测失败按未检测处理。
    }
  }
  var threeJsSignature = Boolean(window.THREE || window.__THREE__ || window.__r3f ||
    document.querySelector('[data-engine*="three" i]'))

  /* ---- 对比度采样：只报颜色对，比值在 Node 算 ---- */
  var contrastSamples = []
  var textNodes = document.querySelectorAll('p, li, span, a, h1, h2, h3, h4, td, dd, figcaption')
  for (var n = 0; n < textNodes.length && contrastSamples.length < CONTRAST_LIMIT; n += 1) {
    var textNode = textNodes[n]
    var content = (textNode.textContent || '').trim()
    if (content.length < 8) continue
    var textRect = textNode.getBoundingClientRect()
    if (textRect.width < 8 || textRect.height < 8) continue
    var textStyle = window.getComputedStyle(textNode)
    if (textStyle.visibility === 'hidden' || textStyle.display === 'none') continue
    contrastSamples.push({
      foreground: textStyle.color,
      background: effectiveBackground(textNode),
    })
  }

  /* ---- 视口健康度 ---- */
  var horizontalOverflowPx = Math.max(
    0,
    (document.documentElement ? document.documentElement.scrollWidth : 0) - viewportWidth,
  )
  var overlapHits = 0
  var blocks = []
  for (var b = 0; b < samples.length && blocks.length < 120; b += 1) {
    var blockStyle = window.getComputedStyle(samples[b])
    if (blockStyle.position !== 'static' || blockStyle.display === 'inline') continue
    var blockRect = samples[b].getBoundingClientRect()
    if (blockRect.width < 40 || blockRect.height < 20) continue
    if ((samples[b].textContent || '').trim().length < 8) continue
    blocks.push(blockRect)
  }
  for (var i = 0; i < blocks.length; i += 1) {
    for (var j = i + 1; j < blocks.length; j += 1) {
      var a = blocks[i]
      var d = blocks[j]
      var overlapX = Math.min(a.right, d.right) - Math.max(a.left, d.left)
      var overlapY = Math.min(a.bottom, d.bottom) - Math.max(a.top, d.top)
      if (overlapX > 8 && overlapY > 8) overlapHits += 1
    }
  }

  /* ---- 页面事实：交给 Node 侧的硬否决层判断这到底是不是目标站 ---- */
  // 浏览器的网络错误页会保留原 URL，所以只比对 origin 是抓不出来的。
  // 这里只报事实（DOM 规模、样式表数量、正文长度、标题），由 vetoReasons 决定是否否决。
  var allElements = document.querySelectorAll('*')
  var bodyText = document.body ? (document.body.innerText || document.body.textContent || '') : ''
  var contentImages = 0
  var images = document.querySelectorAll('img, picture, svg')
  for (var m = 0; m < images.length; m += 1) {
    var imageRect = images[m].getBoundingClientRect()
    if (imageRect.width >= 24 && imageRect.height >= 24) contentImages += 1
  }

  return {
    probeVersion: 1,
    primary: config.primary === true,
    url: window.location.href,
    finalUrl: window.location.href,
    capturedAt: new Date().toISOString(),
    page: {
      title: document.title,
      domElementCount: allElements.length,
      styleSheetCount: document.styleSheets.length,
      mainTextLength: bodyText.trim().length,
      canvasCount: document.querySelectorAll('canvas').length,
      contentImageCount: contentImages,
    },
    viewport: {
      label: LABEL,
      width: viewportWidth,
      height: viewportHeight,
      horizontalOverflowPx: horizontalOverflowPx,
      overlapHits: overlapHits,
    },
    hero: {
      backgroundColor: heroColor,
      coverage: viewportArea > 0 ? Math.min(1, heroArea / viewportArea) : 0,
    },
    radii: { measuredElements: measuredElements, zeroRadiusElements: zeroRadiusElements },
    borders: { thickElements: thickElements },
    typography: { headingFamilies: headingFamilies, bodyMeasureCh: bodyMeasureCh },
    motion: {
      transformProperties: transformProperties,
      scrollDriven: scrollDriven,
      scrollTransformSites: scrollTransformSites,
      scalePopKeyframes: scalePopKeyframes,
    },
    render: {
      webglContexts: webglContexts,
      threeJsSignature: threeJsSignature,
      imageRenderingPixelated: imageRenderingPixelated,
      pixelFontMatch: pixelFontMatch,
      largeAreaGradients: largeAreaGradients,
    },
    contrastSamples: contrastSamples,
  }
}
/* eslint-enable no-undef */

/**
 * 序列化成可注入的表达式。CDP 与 Playwright 的注入方式不同，但都接受一段自执行表达式。
 */
export function probeExpression(options = {}) {
  return `(${collectProbeReading.toString()})(${JSON.stringify(options)})`
}
