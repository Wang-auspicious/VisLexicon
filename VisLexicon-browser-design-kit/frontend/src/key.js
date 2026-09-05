/* ============ 检索表（Dichotomous Key） ============
 * 像鉴定植物一样鉴定动效/布局：二叉问答，无需词汇量。
 * 每个节点 = 一个肯定/否定分支；叶子指向词条 id。
 */

export const KEY = {
  root: 'k-root',
  nodes: {
    'k-root': {
      q: '你要描述的那个「效果」，更像「一块布局结构」，还是「一个点上的动作或质感」？',
      opts: [
        { t: '像整块的布局结构', next: 'k-S' },
        { t: '像局部的动作 / 质感', next: 'k-L' },
      ],
    },
    'k-S': {
      q: '它主要体现在「怎么摆块」，还是「滚动时怎么变」？',
      opts: [
        { t: '怎么把块摆开（静态分布）', next: 'k-SB' },
        { t: '滚动时它在变化', next: 'k-SZ' },
      ],
    },
    'k-SZ': {
      q: '滚动过程中，是不是有一块始终「钉住不动」？',
      opts: [
        { t: '对，有一块钉住，另一边往上走', next: 'result:sticky-scroll' },
        { t: '不是——是多层以不同速度移动', next: 'result:parallax' },
      ],
    },
    'k-SB': {
      q: '这些块，是「高矮整齐」，还是「参差不齐往下堆」？',
      opts: [
        { t: '参差不齐，像瀑布往下掉', next: 'result:masonry' },
        { t: '整齐的格子或几大块', next: 'k-SP' },
      ],
    },
    'k-SP': {
      q: '像一列列竖着的「泳道 / 任务列」吗？',
      opts: [
        { t: '像并列的几列（看板）', next: 'result:kanban' },
        { t: '不是列，是整片的格子', next: 'k-SG' },
      ],
    },
    'k-SG': {
      q: '其中是不是有一个小格子被特意放得特别大、盖住相邻几格？',
      opts: [
        { t: '对，有一块明显更大', next: 'result:bento-grid' },
        { t: '没有特别大的块', next: 'k-SL' },
      ],
    },
    'k-SL': {
      q: '是横向切成左右两大半、中间一条线隔开？',
      opts: [
        { t: '对，左右对半 + 中缝', next: 'result:split-screen' },
        { t: '不是左右对半', next: 'k-ST' },
      ],
    },
    'k-ST': {
      q: '是沿一条竖线的上下左右、交替排布的一串小节点（时间 / 步骤）？',
      opts: [
        { t: '对，像时间轴', next: 'result:timeline' },
        { t: '都不是——是一条悬浮的图标条', next: 'result:dock' },
      ],
    },
    'k-L': {
      q: '它是「跟着鼠标动」，还是「自己一直循环播放」？',
      opts: [
        { t: '跟着我鼠标动 / 变', next: 'k-LM' },
        { t: '自己一直在循环 / 进场', next: 'k-LA' },
      ],
    },
    'k-LM': {
      q: '整个卡片 / 元素会跟着鼠标「转起来」或「倾斜」？',
      opts: [
        { t: '对，卡片在鼠标下立体倾斜', next: 'result:hover-tilt' },
        { t: '不是倾斜，是别的', next: 'k-LP' },
      ],
    },
    'k-LP': {
      q: '元素（比如按钮）会被「吸」向光标、松手又弹回？',
      opts: [
        { t: '对，被磁吸过去又弹回', next: 'result:magnetic-button' },
        { t: '不是平移吸附', next: 'k-LS' },
      ],
    },
    'k-LS': {
      q: '是一个光点 / 光晕跟着鼠标在元素表面走？',
      opts: [
        { t: '对，有一圈光跟着鼠标', next: 'result:spotlight-card' },
        { t: '不是，是靠近时会…', next: 'result:spring' },
      ],
    },
    'k-LA': {
      q: '是有文字在一格一格「乱码翻滚」后落定成正常字？',
      opts: [
        { t: '对，文字解码式翻滚', next: 'result:text-scramble' },
        { t: '不是文字乱码', next: 'k-AR' },
      ],
    },
    'k-AR': {
      q: '是一串文字 / Logo 一直往同一方向「无限滚」？',
      opts: [
        { t: '对，一直横向跑马', next: 'result:marquee' },
        { t: '不是一直滚', next: 'k-AQ' },
      ],
    },
    'k-AQ': {
      q: '是列表 / 菜单里的项一个接一个「依次出现、带节奏」？',
      opts: [
        { t: '对，一个接一个进场', next: 'result:stagger-reveal' },
        { t: '不是依次进场', next: 'k-AF' },
      ],
    },
    'k-AF': {
      q: '是灰灰的占位块上，有一道光「斜着扫过」？',
      opts: [
        { t: '对，加载中的光扫过', next: 'result:shimmer' },
        { t: '都不是——更像是某种「材质 / 质感」', next: 'k-MAT' },
      ],
    },
    'k-MAT': {
      q: '它看起来像「半透明磨砂玻璃」吗？',
      opts: [
        { t: '像磨砂玻璃，背后还能隐约透出', next: 'result:glassmorphism' },
        { t: '不像玻璃', next: 'k-MB' },
      ],
    },
    'k-MB': {
      q: '像「硬纸板」：粗黑边框 + 硬邦邦的斜阴影 + 高饱和撞色？',
      opts: [
        { t: '对，硬边框硬阴影', next: 'result:neo-brutalism' },
        { t: '不是硬纸板', next: 'k-MC' },
      ],
    },
    'k-MC': {
      q: '像「软糖 / 果冻」：大圆角 + 内部鼓起来的柔影？',
      opts: [
        { t: '对，软糯圆润', next: 'result:claymorphism' },
        { t: '不是果冻', next: 'k-MD' },
      ],
    },
    'k-MD': {
      q: '像「命令行 / 黑客屏」：等宽字 + 荧光绿或琥珀？',
      opts: [
        { t: '对，像终端', next: 'result:terminal' },
        { t: '不是终端', next: 'k-ME' },
      ],
    },
    'k-ME': {
      q: '像「杂志 / 报纸」：衬线大标题、首字下沉、细栏线？',
      opts: [
        { t: '对，像纸质杂志排版', next: 'result:editorial' },
        { t: '都不是——是一大团流动的彩色光晕', next: 'result:aurora-gradient' },
      ],
    },
  },
}
