/**
 * dsh-refined —— 客户端插件 bundle（部署级）。
 *
 * 由 dsh-client-modules 在运行时按 package.json 的 dsh.client 声明
 * 从 /plugins 组合路由加载（只注册工厂，materialize 时才执行）。
 * 协议：window.__ModuleLoader__.load({ id, factory })，
 * factory 内可 require 共享模块（react 等平台 seed）。
 * 插件对象必须声明 inject: ['theme', 'slots']，否则 apply 可能在外壳服务
 * 就绪之前运行，整个插件静默失效。
 * 与动态插件版不同：这里运行在真实页面上下文，可直接使用
 * window / document / localStorage，主题选择因此持久化到浏览器，
 * 即使 DSH 后端重启也不丢失。
 *
 * 安装：见仓库 README（部署级）与 main.js（动态粘贴版）。
 */
window.__ModuleLoader__.load({
  id: 'dsh-refined',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    // ============ 主题调色板（移植自 DeepSeek-Refined） ============
    var THEMES = {
      'Border': {
        light: {
          bg: '#F9F6F4', bgBase: '#F9F6F4', bgLayer2: '#F2E0E4', bgLayer3: '#EBE4F0',
          labelPrimary: '#4A4348', labelSecondary: '#8B7F88', labelTertiary: '#A9A0A6', labelCaption: '#8B7F88',
          brandPrimary: '#793f82', brandText: '#9B7AA0',
          borderL1: 'rgba(74, 67, 72, 0.06)', borderL2: 'rgba(74, 67, 72, 0.10)', borderL3: 'rgba(74, 67, 72, 0.14)',
          inlineCodeBg: '#F2E0E4', codeBlockBg: '#FEFBF5', codeBannerBg: '#F7F0E3',
          strong: 'hsl(350, 80%, 55%)', em: 'hsl(28, 80%, 50%)', math: '#1a6fb5', inlineCodeText: '#dd1399',
          heading: ['#bd5151', '#c77b23', '#478f14', '#0585a8', '#726293', '#127d52'],
          blockquoteDot: '000000', toastBg: '#fff', toastText: '#333',
        },
        dark: {
          bg: '#27282e', bgBase: '#27282e', bgLayer1: '#27282e', bgLayer2: '#2d2e34', bgLayer3: '#32333a',
          labelPrimary: 'hsl(232, 6%, 88%)', labelSecondary: 'hsl(232, 9%, 64%)', labelTertiary: 'hsl(232, 12%, 48%)', labelCaption: 'hsl(232, 9%, 56%)',
          brandPrimary: 'hsl(232, 70%, 65%)', brandText: 'hsl(232, 70%, 70%)',
          borderL1: 'rgba(255, 255, 255, 0.06)', borderL2: 'rgba(255, 255, 255, 0.10)', borderL3: 'rgba(255, 255, 255, 0.14)',
          inlineCodeBg: '#2d2e34', codeBlockBg: '#2d2e34', codeBannerBg: '#32333a',
          strong: '#ff7881', em: '#fbbb83', math: '#8dd3f6', inlineCodeText: '#f2b6de',
          heading: ['#d18989', '#cea38d', '#93c89c', '#7eb8f1', '#bab3ef', '#7ec8c5'],
          blockquoteDot: 'ffffff', toastBg: '#2d2e34', toastText: '#e0e0e0',
        },
      },
      'Nord': {
        light: {
          bg: '#ECEFF4', bgBase: '#ECEFF4', bgLayer2: '#E5E9F0', bgLayer3: '#D8DEE9',
          labelPrimary: '#2E3440', labelSecondary: '#4C566A', labelTertiary: '#7B88A1', labelCaption: '#4C566A',
          brandPrimary: '#5E81AC', brandText: '#5E81AC',
          borderL1: 'rgba(46, 52, 64, 0.06)', borderL2: 'rgba(46, 52, 64, 0.10)', borderL3: 'rgba(46, 52, 64, 0.14)',
          inlineCodeBg: '#E5E9F0', codeBlockBg: '#FFFFFF', codeBannerBg: '#D8DEE9',
          strong: '#BF616A', em: '#D08770', math: '#5E81AC', inlineCodeText: '#5E81AC',
          heading: ['#BF616A', '#D08770', '#A88B3F', '#7FA46B', '#5E81AC', '#8E6F9E'],
          blockquoteDot: '000000', toastBg: '#FFFFFF', toastText: '#2E3440',
        },
        dark: {
          bg: '#2E3440', bgBase: '#2E3440', bgLayer1: '#2E3440', bgLayer2: '#3B4252', bgLayer3: '#434C5E',
          labelPrimary: '#ECEFF4', labelSecondary: '#D8DEE9', labelTertiary: '#7B88A1', labelCaption: '#D8DEE9',
          brandPrimary: '#88C0D0', brandText: '#88C0D0',
          borderL1: 'rgba(216, 222, 233, 0.06)', borderL2: 'rgba(216, 222, 233, 0.10)', borderL3: 'rgba(216, 222, 233, 0.14)',
          inlineCodeBg: '#434C5E', codeBlockBg: '#3B4252', codeBannerBg: '#434C5E',
          strong: '#BF616A', em: '#D08770', math: '#88C0D0', inlineCodeText: '#8FBCBB',
          heading: ['#BF616A', '#D08770', '#EBCB8B', '#A3BE8C', '#88C0D0', '#B48EAD'],
          blockquoteDot: 'ffffff', toastBg: '#3B4252', toastText: '#ECEFF4',
        },
      },
      'Twilight': {
        light: {
          bg: '#F7F3FB', bgBase: '#F7F3FB', bgLayer2: '#EDE4F5', bgLayer3: '#E3D4EF',
          labelPrimary: '#3D2E4F', labelSecondary: '#6E5C82', labelTertiary: '#9C8AB0', labelCaption: '#6E5C82',
          brandPrimary: '#8B5CF6', brandText: '#7C3AED',
          borderL1: 'rgba(61, 46, 79, 0.06)', borderL2: 'rgba(61, 46, 79, 0.10)', borderL3: 'rgba(61, 46, 79, 0.14)',
          inlineCodeBg: '#EDE4F5', codeBlockBg: '#FFFFFF', codeBannerBg: '#EDE4F5',
          strong: '#DB2777', em: '#D97706', math: '#6D28D9', inlineCodeText: '#8B5CF6',
          heading: ['#DB2777', '#D97706', '#A16207', '#059669', '#2563EB', '#7C3AED'],
          blockquoteDot: '000000', toastBg: '#FFFFFF', toastText: '#3D2E4F',
        },
        dark: {
          bg: '#1A1124', bgBase: '#1A1124', bgLayer1: '#1A1124', bgLayer2: '#241736', bgLayer3: '#2E1F44',
          labelPrimary: '#EDE4F5', labelSecondary: '#B9A6CC', labelTertiary: '#7E6C96', labelCaption: '#A894BC',
          brandPrimary: '#C084FC', brandText: '#D3A9FF',
          borderL1: 'rgba(237, 228, 245, 0.06)', borderL2: 'rgba(237, 228, 245, 0.10)', borderL3: 'rgba(237, 228, 245, 0.14)',
          inlineCodeBg: '#2E1F44', codeBlockBg: '#241736', codeBannerBg: '#2E1F44',
          strong: '#FF79C6', em: '#FFD866', math: '#82AAFF', inlineCodeText: '#C084FC',
          heading: ['#FF79C6', '#FFB86C', '#F1FA8C', '#50FA7B', '#8BE9FD', '#BD93F9'],
          blockquoteDot: 'ffffff', toastBg: '#241736', toastText: '#EDE4F5',
        },
      },
      'GitHub': {
        light: {
          bg: '#FFFFFF', bgBase: '#FFFFFF', bgLayer2: '#F6F8FA', bgLayer3: '#EFF3F6',
          labelPrimary: '#1F2328', labelSecondary: '#59636E', labelTertiary: '#8D959E', labelCaption: '#59636E',
          brandPrimary: '#0969DA', brandText: '#0969DA',
          borderL1: 'rgba(31, 35, 40, 0.06)', borderL2: 'rgba(31, 35, 40, 0.10)', borderL3: 'rgba(31, 35, 40, 0.14)',
          inlineCodeBg: '#EFF1F3', codeBlockBg: '#F6F8FA', codeBannerBg: '#EFF3F6',
          strong: '#CF222E', em: '#9A6700', math: '#8250DF', inlineCodeText: '#8250DF',
          heading: ['#CF222E', '#BC4C00', '#1A7F37', '#0969DA', '#8250DF', '#1F2328'],
          blockquoteDot: '000000', toastBg: '#FFFFFF', toastText: '#1F2328',
        },
        dark: {
          bg: '#0D1117', bgBase: '#0D1117', bgLayer1: '#0D1117', bgLayer2: '#161B22', bgLayer3: '#21262D',
          labelPrimary: '#E6EDF3', labelSecondary: '#9198A1', labelTertiary: '#7D8590', labelCaption: '#9198A1',
          brandPrimary: '#4493F8', brandText: '#4493F8',
          borderL1: 'rgba(230, 237, 243, 0.06)', borderL2: 'rgba(230, 237, 243, 0.10)', borderL3: 'rgba(230, 237, 243, 0.14)',
          inlineCodeBg: '#21262D', codeBlockBg: '#161B22', codeBannerBg: '#21262D',
          strong: '#FF7B72', em: '#D29922', math: '#A371F7', inlineCodeText: '#79C0FF',
          heading: ['#FF7B72', '#FFA657', '#7EE787', '#79C0FF', '#A371F7', '#9198A1'],
          blockquoteDot: 'ffffff', toastBg: '#21262D', toastText: '#E6EDF3',
        },
      },
      'Atom One': {
        light: {
          bg: '#FAFAFA', bgBase: '#FAFAFA', bgLayer2: '#F0F0F1', bgLayer3: '#E5E5E6',
          labelPrimary: '#383A42', labelSecondary: '#696C77', labelTertiary: '#A0A1A7', labelCaption: '#696C77',
          brandPrimary: '#4078F2', brandText: '#4078F2',
          borderL1: 'rgba(56, 58, 66, 0.06)', borderL2: 'rgba(56, 58, 66, 0.10)', borderL3: 'rgba(56, 58, 66, 0.14)',
          inlineCodeBg: '#F0F0F1', codeBlockBg: '#F5F5F6', codeBannerBg: '#E8E8EA',
          strong: '#E45649', em: '#C18401', math: '#4078F2', inlineCodeText: '#A626A4',
          heading: ['#E45649', '#C18401', '#986801', '#50A14F', '#4078F2', '#A626A4'],
          blockquoteDot: '000000', toastBg: '#FFFFFF', toastText: '#383A42',
        },
        dark: {
          bg: '#282C34', bgBase: '#282C34', bgLayer1: '#282C34', bgLayer2: '#2C313A', bgLayer3: '#353B45',
          labelPrimary: '#ABB2BF', labelSecondary: '#7F848E', labelTertiary: '#5C6370', labelCaption: '#7F848E',
          brandPrimary: '#61AFEF', brandText: '#61AFEF',
          borderL1: 'rgba(171, 178, 191, 0.06)', borderL2: 'rgba(171, 178, 191, 0.10)', borderL3: 'rgba(171, 178, 191, 0.14)',
          inlineCodeBg: '#353B45', codeBlockBg: '#21252B', codeBannerBg: '#2C313A',
          strong: '#E06C75', em: '#D19A66', math: '#61AFEF', inlineCodeText: '#98C379',
          heading: ['#E06C75', '#D19A66', '#E5C07B', '#98C379', '#61AFEF', '#C678DD'],
          blockquoteDot: 'ffffff', toastBg: '#2C313A', toastText: '#ABB2BF',
        },
      },
    }

    // ============ 持久化（localStorage，后端重启不丢） ============
    var STORAGE_KEY = 'dsr_theme'

    function loadTheme() {
      try {
        var saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved && THEMES[saved]) return saved
      } catch (e) { /* ignore */ }
      return 'Border'
    }

    function saveTheme(name) {
      try {
        window.localStorage.setItem(STORAGE_KEY, name)
      } catch (e) { /* ignore */ }
    }

    // ============ 由调色板生成「表面」token 覆盖层 ============
    // 表面（底色 / 描边 / 品牌色 / 代码块底色）走 theme.overrideTokens 层：
    // 主题层的普通声明会盖掉别的插件用样式表画的背景，所以这些令牌是可让位的
    // （见 shouldYieldSurfaces）。文字色不在这一层，见 buildForegroundCss。
    function buildSurfaceTokens(p) {
      var L = p.light
      var D = p.dark
      return {
        '--dsw-alias-bg-base': { light: L.bgBase, dark: D.bgBase },
        '--dsw-alias-bg-layer-1': { light: L.bgLayer1 || L.bgBase, dark: D.bgLayer1 || D.bgBase },
        '--dsw-alias-bg-layer-2': { light: L.bgLayer2, dark: D.bgLayer2 },
        '--dsw-alias-bg-layer-3': { light: L.bgLayer3, dark: D.bgLayer3 },
        '--dsw-alias-bg-overlay': { light: L.toastBg, dark: D.toastBg },
        '--dsw-alias-border-l1': { light: L.borderL1, dark: D.borderL1 },
        '--dsw-alias-border-l2': { light: L.borderL2, dark: D.borderL2 },
        '--dsw-alias-brand-primary': { light: L.brandPrimary, dark: D.brandPrimary },
        '--dsw-alias-markdown-inline-code': { light: L.inlineCodeBg, dark: D.inlineCodeBg },
        '--dsw-alias-markdown-code-block': { light: L.codeBlockBg, dark: D.codeBlockBg },
        '--dsw-alias-markdown-code-block-banner': { light: L.codeBannerBg, dark: D.codeBannerBg },
        '--dsw-specific-sidebar-fill': { light: L.bg, dark: D.bg },
        '--dsw-specific-bubble': { light: L.bgLayer2, dark: D.bgLayer2 },
      }
    }

    // ============ 前景（文字）色：走自己的样式表 + !important ============
    // 主题令牌层由 ui-layout 的 presenter 以 **body 行内样式**（普通声明）落地，
    // 所以「后注册的层」永远改动文字色。要稳定保住文字色，就绕开这条赛道：
    // 作者样式表里的 !important 声明优先级高于行内普通声明，谁后写都不影响。
    var FOREGROUND_TOKENS = [
      ['--dsw-alias-label-primary', 'labelPrimary'],
      ['--dsw-alias-label-secondary', 'labelSecondary'],
      ['--dsw-alias-label-tertiary', 'labelTertiary'],
      ['--dsw-alias-label-caption', 'labelCaption'],
    ]

    function foregroundDecls(palette) {
      return FOREGROUND_TOKENS.map(function (pair) {
        return pair[0] + ': ' + palette[pair[1]] + ' !important;'
      }).join(' ')
    }

    function buildForegroundCss(p) {
      return [
        '/* dsh-refined: 前景文字令牌（!important ⇒ 盖过主题令牌层与其它插件的普通声明） */',
        'body { ' + foregroundDecls(p.light) + ' }',
        'body[data-ds-dark-theme] { ' + foregroundDecls(p.dark) + ' }',
      ].join('\n')
    }

    // ============ 与其它插件共存 ============
    // 分工：别人可以接管背景（壁纸 / 玻璃 / 图片底），文字色留在本插件。
    var SURFACE_KEY = 'dsr_surface'        // 'auto' | 'own' | 'other'
    var FOREGROUND_KEY = 'dsr_foreground'  // 'own' | 'other'

    function loadChoice(key, fallback, allowed) {
      try {
        var saved = window.localStorage.getItem(key)
        if (saved && allowed.indexOf(saved) !== -1) return saved
      } catch (e) { /* ignore */ }
      return fallback
    }

    function saveChoice(key, value) {
      try {
        window.localStorage.setItem(key, value)
      } catch (e) { /* ignore */ }
    }

    // 表面令牌的「别人」长什么样：第三方插件用自己的样式表重声明页面基色
    // （壁纸 / 玻璃类插件都会写 `--dsw-alias-bg-base: transparent` 之类）。
    // 主题层的普通声明会压过这类样式表，所以自动模式下主动让位。
    var SURFACE_PROBES = ['--dsw-alias-bg-base']

    function sheetDeclaresSurface(sheet) {
      var rules = sheet.cssRules
      return visit(rules)

      function visit(list) {
        for (var i = 0; i < list.length; i++) {
          var style = list[i].style
          if (style) {
            for (var p = 0; p < SURFACE_PROBES.length; p++) {
              if (style.getPropertyValue(SURFACE_PROBES[p])) return true
            }
          }
          if (list[i].cssRules && visit(list[i].cssRules)) return true
        }
        return false
      }
    }

    /**
     * 找出「自己画背景」的第三方插件 id，没有则返回 null。
     * 只认 `<style data-plugin>`：内核自带的样式表（`@deepseek-ai/*`）和无主样式表都跳过，
     * 否则宿主自带调色板会让自动模式永远让位。
     */
    function foreignSurfaceOwner() {
      var sheets = document.styleSheets
      for (var i = 0; i < sheets.length; i++) {
        var node = sheets[i].ownerNode
        if (!node || node.tagName !== 'STYLE' || !node.getAttribute) continue
        var id = node.getAttribute('data-plugin')
        if (id === null || id === 'dsh-refined' || id.indexOf('@deepseek-ai/') === 0) continue
        try {
          if (sheetDeclaresSurface(sheets[i])) return id
        } catch (e) { /* 跨源样式表读不到，跳过 */ }
      }
      return null
    }

    // ============ 由调色板生成 Markdown 美化 CSS ============
    function buildCss(p) {
      var L = p.light
      var D = p.dark
      var md = '[class*="_markdown_"]'
      return [
        '/* dsh-refined: 标题左侧彩色圆角竖条 */',
        md + ' :where(h1,h2,h3,h4,h5,h6) { border-left: none !important; padding-left: 16px !important; position: relative; }',
        md + ' :where(h1,h2,h3,h4,h5,h6)::before { content: ""; position: absolute; left: 0; top: 4px; bottom: 4px; width: 4px; border-radius: 4px; }',
        md + ' h1::before { background: ' + L.heading[0] + '; }',
        md + ' h2::before { background: ' + L.heading[1] + '; }',
        md + ' h3::before { background: ' + L.heading[2] + '; }',
        md + ' h4::before { background: ' + L.heading[3] + '; }',
        md + ' h5::before { background: ' + L.heading[4] + '; }',
        md + ' h6::before { background: ' + L.heading[5] + '; }',
        'body[data-ds-dark-theme] ' + md + ' h1::before { background: ' + D.heading[0] + '; }',
        'body[data-ds-dark-theme] ' + md + ' h2::before { background: ' + D.heading[1] + '; }',
        'body[data-ds-dark-theme] ' + md + ' h3::before { background: ' + D.heading[2] + '; }',
        'body[data-ds-dark-theme] ' + md + ' h4::before { background: ' + D.heading[3] + '; }',
        'body[data-ds-dark-theme] ' + md + ' h5::before { background: ' + D.heading[4] + '; }',
        'body[data-ds-dark-theme] ' + md + ' h6::before { background: ' + D.heading[5] + '; }',
        '/* 粗体 / 斜体 */',
        md + ' strong { color: ' + L.strong + ' !important; }',
        'body[data-ds-dark-theme] ' + md + ' strong { color: ' + D.strong + ' !important; }',
        md + ' em { color: ' + L.em + ' !important; }',
        'body[data-ds-dark-theme] ' + md + ' em { color: ' + D.em + ' !important; }',
        '/* 数学公式（KaTeX） */',
        md + ' .katex, ' + md + ' .katex * { color: ' + L.math + ' !important; }',
        'body[data-ds-dark-theme] ' + md + ' .katex, body[data-ds-dark-theme] ' + md + ' .katex * { color: ' + D.math + ' !important; }',
        '/* 行内代码文字颜色（整块可点击复制） */',
        md + ' :not(pre)>code { color: ' + L.inlineCodeText + ' !important; cursor: pointer; }',
        'body[data-ds-dark-theme] ' + md + ' :not(pre)>code { color: ' + D.inlineCodeText + ' !important; }',
        '/* 引用块：Border 点阵图案背景 + 圆角竖条 */',
        md + ' blockquote { border-left: none !important; border-radius: 6px; position: relative; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'%3E%3Cpath fill=\'%23' + L.blockquoteDot + '\' fill-opacity=\'0.12\' d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\'%3E%3C/path%3E%3C/svg%3E"); }',
        'body[data-ds-dark-theme] ' + md + ' blockquote { background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'%3E%3Cpath fill=\'%23' + D.blockquoteDot + '\' fill-opacity=\'0.12\' d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\'%3E%3C/path%3E%3C/svg%3E"); }',
        md + ' blockquote blockquote { background-image: none !important; }',
        md + ' blockquote::before { content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 4px; border-radius: 4px; background: var(--dsw-alias-brand-primary); }'
      ].join('\n') + '\n' + TOAST_CSS
    }

    // ============ 「已复制」提示条（用主题令牌，深浅色自动跟随） ============
    var TOAST_CSS = [
      '.dsr-toast {',
      '  position: fixed; top: 16px; left: 50%; z-index: 99999;',
      '  display: flex; align-items: center; gap: 8px;',
      '  max-width: min(70vw, 520px); padding: 9px 14px;',
      '  border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;',
      '  background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary);',
      '  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);',
      '  font-size: 13px; line-height: 20px;',
      '  opacity: 0; pointer-events: none;',
      '  transform: translate(-50%, -10px);',
      '  transition: opacity 0.18s ease, transform 0.18s ease;',
      '}',
      '.dsr-toast[data-show] { opacity: 1; transform: translate(-50%, 0); }',
      '.dsr-toast-icon {',
      '  flex: none; display: grid; place-items: center;',
      '  width: 16px; height: 16px; border-radius: 50%;',
      '  background: var(--dsw-alias-state-success-primary); color: #fff;',
      '}',
      '.dsr-toast[data-tone="error"] .dsr-toast-icon { background: var(--dsw-alias-state-error-primary); }',
      '.dsr-toast-icon svg { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }',
      '.dsr-toast-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '@media (prefers-reduced-motion: reduce) { .dsr-toast { transition: none; } }',
    ].join('\n')

    // ============ React 主题切换按钮（会话头部右侧槽位） ============
    var React = null
    try {
      React = require('react')
    } catch (e) {
      React = null
    }

    function ThemePicker(props) {
      var openState = React.useState(false)
      var open = openState[0]
      var setOpen = openState[1]
      var nameState = React.useState(props.initial)
      var name = nameState[0]
      var setName = nameState[1]
      var schemeState = React.useState(props.initialScheme)
      var scheme = schemeState[0]
      var setScheme = schemeState[1]
      var surfaceState = React.useState(props.getSurface ? props.getSurface() : { mode: 'auto', yielded: false })
      var surface = surfaceState[0]
      var setSurface = surfaceState[1]
      var foregroundState = React.useState(props.getForeground ? props.getForeground() : 'own')
      var foreground = foregroundState[0]
      var setForeground = foregroundState[1]

      React.useEffect(function () {
        return props.ctx.on('theme/change', function (snapshot) {
          setScheme(snapshot.active.colorScheme)
        })
      }, [])

      var names = Object.keys(props.themes)
      var pal = props.themes[name][scheme]

      var SURFACE_LABEL = {
        auto: '背景：自动',
        own: '背景：我的',
        other: '背景：让出',
      }

      function optionStyle(active) {
        return {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.4,
          cursor: 'pointer',
          color: active ? pal.brandPrimary : pal.labelPrimary,
          fontWeight: active ? 600 : 400,
        }
      }

      function checkRow(key, label, active, onClick) {
        return React.createElement('div', { key: key, onClick: onClick, style: optionStyle(active) },
          React.createElement('span', { style: { whiteSpace: 'nowrap' } }, label),
          React.createElement('span', { style: { visibility: active ? 'visible' : 'hidden' } }, '\u2713'),
        )
      }

      function cycleSurface() {
        if (!props.onCycleSurface) return
        setSurface(props.onCycleSurface())
      }

      function toggleForeground() {
        if (!props.onToggleForeground) return
        setForeground(props.onToggleForeground())
      }

      return React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
          type: 'button',
          title: '切换主题',
          'aria-label': '切换主题',
          'aria-expanded': open,
          onClick: function () {
            // 打开菜单时复检一次：别人的样式表可能刚注入
            if (!open && props.onRecheck && setSurface) setSurface(props.onRecheck())
            setOpen(!open)
          },
          style: {
            width: 32,
            height: 32,
            border: '1px solid ' + pal.borderL2,
            borderRadius: 8,
            background: 'transparent',
            color: pal.labelSecondary,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
          React.createElement('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 18, height: 18 },
            React.createElement('circle', { cx: 12, cy: 12, r: 3 }),
            React.createElement('circle', { cx: 12, cy: 5, r: 1.7 }),
            React.createElement('circle', { cx: 19, cy: 9, r: 1.7 }),
            React.createElement('circle', { cx: 17, cy: 18, r: 1.7 }),
            React.createElement('circle', { cx: 7, cy: 18, r: 1.7 }),
            React.createElement('circle', { cx: 5, cy: 9, r: 1.7 }),
          ),
        ),
        open && React.createElement('div', {
          onClick: function () { setOpen(false) },
          style: { position: 'fixed', inset: 0, zIndex: 40 },
        }),
        open && React.createElement('div', {
          style: {
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 150,
            padding: 4,
            borderRadius: 10,
            background: pal.toastBg,
            color: pal.labelPrimary,
            border: '1px solid ' + pal.borderL2,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 50,
          },
        },
          names.map(function (n) {
            return React.createElement('div', {
              key: n,
              onClick: function () { props.onPick(n); setName(n); setOpen(false) },
              style: optionStyle(n === name),
            },
              React.createElement('span', null, n),
              React.createElement('span', { style: { visibility: n === name ? 'visible' : 'hidden' } }, '\u2713'),
            )
          }),
          React.createElement('div', {
            key: 'divider',
            style: { height: 1, margin: '4px 6px', background: pal.borderL2 },
          }),
          checkRow('surface', SURFACE_LABEL[surface.mode] + (surface.mode === 'auto' && surface.yielded ? '\uff08已让出\uff09' : ''), surface.yielded, cycleSurface),
          checkRow('foreground', '文字：跟随其它插件', foreground === 'other', toggleForeground),
        ),
      )
    }

    // ============ 浮动按钮兜底（DOM 版，样式用主题 token 自动适配） ============
    function createFloatingPicker(opts) {
      var wrap = document.createElement('div')
      wrap.className = 'dsr-floating'

      var styleTag = document.createElement('style')
      styleTag.textContent = [
        '.dsr-floating { position: fixed; top: 64px; right: 14px; z-index: 9999; }',
        '@media (max-width: 767px) { .dsr-floating { top: 12px; } }',
        '.dsr-floating-btn { width: 36px; height: 36px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 50%; background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }',
        '.dsr-floating-menu { display: none; position: absolute; top: calc(100% + 6px); right: 0; min-width: 150px; padding: 4px; border-radius: 10px; background: var(--dsw-alias-bg-overlay); border: 1px solid var(--dsw-alias-border-l2); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }',
        '.dsr-floating.open .dsr-floating-menu { display: block; }',
        '.dsr-floating-opt { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; color: var(--dsw-alias-label-primary); }',
        '.dsr-floating-opt:hover { background: var(--dsw-alias-bg-layer-2); }',
        '.dsr-floating-opt.active { color: var(--dsw-alias-brand-primary); font-weight: 600; }'
      ].join('\n')
      document.head.appendChild(styleTag)

      var btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'dsr-floating-btn'
      btn.title = '切换主题'
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="5" r="1.7"/><circle cx="19" cy="9" r="1.7"/><circle cx="17" cy="18" r="1.7"/><circle cx="7" cy="18" r="1.7"/><circle cx="5" cy="9" r="1.7"/></svg>'

      var menu = document.createElement('div')
      menu.className = 'dsr-floating-menu'

      var options = {}
      Object.keys(opts.themes).forEach(function (n) {
        var opt = document.createElement('div')
        opt.className = 'dsr-floating-opt'
        var label = document.createElement('span')
        label.textContent = n
        var check = document.createElement('span')
        check.textContent = '\u2713'
        check.style.visibility = 'hidden'
        opt.appendChild(label)
        opt.appendChild(check)
        opt.addEventListener('click', function (e) {
          e.stopPropagation()
          opts.onPick(n)
          markActive(n)
          wrap.classList.remove('open')
        })
        menu.appendChild(opt)
        options[n] = { opt: opt, check: check }
      })

      function markActive(n) {
        Object.keys(options).forEach(function (k) {
          options[k].check.style.visibility = k === n ? 'visible' : 'hidden'
          options[k].opt.classList.toggle('active', k === n)
        })
      }

      btn.addEventListener('click', function (e) {
        e.stopPropagation()
        wrap.classList.toggle('open')
      })
      document.addEventListener('click', function () {
        wrap.classList.remove('open')
      })
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') wrap.classList.remove('open')
      })

      wrap.appendChild(btn)
      wrap.appendChild(menu)
      markActive(opts.initial)
      return { node: wrap, styleTag: styleTag }
    }

    // ============ 插件主体 ============
    module.exports = {
      name: 'dsh-refined',
      // 必须声明服务依赖：theme / slots 由外壳插件提供，且往往晚于本插件的
      // worker 加载完成。声明 inject 后 cordis 会等到两个服务就位才调用 apply。
      // 之前用 ctx.get() 自行探测、探测失败就静默 return，服务没就绪时整个插件
      // 什么都不做（主题不生效、按钮不出现），表现为“装上了但时灵时不灵”。
      inject: ['theme', 'slots'],
      apply(ctx) {
        var theme = ctx.theme
        var slots = ctx.slots

        // 同一页面可能被重复应用（HMR / 重新启用），先清掉上一轮的残留节点
        var stale = document.querySelectorAll('style[data-plugin="dsh-refined"], .dsr-floating, .dsr-toast')
        for (var i = 0; i < stale.length; i++) {
          if (stale[i].parentNode) stale[i].parentNode.removeChild(stale[i])
        }

        var styleEl = document.createElement('style')
        styleEl.setAttribute('data-plugin', 'dsh-refined')
        document.head.appendChild(styleEl)

        var surfaceDisposer = null
        var surfaceYielded = null      // 当前是否已让出表面令牌；null = 还没算过
        var surfaceMode = loadChoice(SURFACE_KEY, 'auto', ['auto', 'own', 'other'])
        var foregroundMode = loadChoice(FOREGROUND_KEY, 'own', ['own', 'other'])
        var current = 'Border'
        var applied = false

        function shouldYieldSurfaces() {
          if (surfaceMode === 'other') return true
          if (surfaceMode === 'own') return false
          return foreignSurfaceOwner() !== null
        }

        // 表面层：让出时不注册（宿主 presenter 会把令牌从 body 行内样式里撤掉，
        // 别人的背景样式表才看得见）。只在结论变化时才动，避免无谓的 publish。
        function syncSurfaces() {
          var yieldNow = shouldYieldSurfaces()
          if (yieldNow === surfaceYielded) return yieldNow
          surfaceYielded = yieldNow
          if (surfaceDisposer) { surfaceDisposer(); surfaceDisposer = null }
          if (!yieldNow) surfaceDisposer = theme.overrideTokens('dsh-refined', buildSurfaceTokens(THEMES[current]))
          return yieldNow
        }

        function paint() {
          var palette = THEMES[current]
          styleEl.textContent = buildCss(palette) +
            (foregroundMode === 'own' ? '\n' + buildForegroundCss(palette) : '')
        }

        function applyTheme(name) {
          if (!THEMES[name]) return
          if (applied && name === current) return
          current = name
          paint()
          applied = true
          saveTheme(name)
          surfaceYielded = null        // 表面层内容跟着主题变，强制重算一次
          syncSurfaces()
        }

        var initial = loadTheme()
        applyTheme(initial)

        function setSurfaceMode(next) {
          surfaceMode = next
          saveChoice(SURFACE_KEY, next)
          surfaceYielded = null
          return { mode: next, yielded: syncSurfaces() }
        }

        function setForegroundMode(next) {
          foregroundMode = next
          saveChoice(FOREGROUND_KEY, next)
          paint()
          return next
        }

        // 别人的样式表可能比我们晚注入：延后复检一次，再在主题变化 / 打开菜单时复检
        var surfaceRecheck = window.setTimeout(syncSurfaces, 1500)

        // ============ 行内代码点击复制 ============
        // 只认聊天正文里的行内代码：排除代码块 / 工具输出块 / 链接 / 文件引用按钮，
        // 有选区时让位给原生选择（拖选文字不该被当成点击）。
        var MD = '[class*="_markdown_"]'
        var SKIP = 'pre, .md-code-block, [data-read], [data-diff], [data-search], [data-terminal]'
        var INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary, [contenteditable="true"]'

        var toast = null
        var toastTimer = 0

        function showToast(message, tone) {
          if (toast === null) {
            toast = document.createElement('div')
            toast.className = 'dsr-toast'
            toast.innerHTML =
              '<span class="dsr-toast-icon"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' +
              '<span class="dsr-toast-text"></span>'
            document.body.appendChild(toast)
          }
          toast.setAttribute('data-tone', tone === 'error' ? 'error' : 'ok')
          toast.querySelector('.dsr-toast-text').textContent = message
          toast.removeAttribute('data-show')
          // 强制一次重排，连续点击时动画能重新播放
          void toast.offsetWidth
          toast.setAttribute('data-show', '')
          window.clearTimeout(toastTimer)
          toastTimer = window.setTimeout(function () {
            if (toast) toast.removeAttribute('data-show')
          }, 1800)
        }

        function copyText(text) {
          if (window.navigator.clipboard && window.navigator.clipboard.writeText) {
            return window.navigator.clipboard.writeText(text)['catch'](legacyCopy)
          }
          return legacyCopy()
          // 非安全上下文（http / 老浏览器）剪贴板 API 不可用时的退路
          function legacyCopy() {
            var area = document.createElement('textarea')
            area.value = text
            area.setAttribute('readonly', '')
            area.style.cssText = 'position:fixed;top:-1000px;opacity:0;'
            document.body.appendChild(area)
            area.select()
            var ok = false
            try {
              ok = document.execCommand('copy')
            } catch (e) {
              ok = false
            }
            document.body.removeChild(area)
            return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'))
          }
        }

        function isInlineCode(el) {
          return el !== null && el.tagName === 'CODE' && el.closest(MD) !== null && el.closest(SKIP) === null
        }

        function onDocumentClick(e) {
          var target = e.target
          if (!target || typeof target.closest !== 'function') return
          // 点的是可交互元素（链接 / 按钮 / 输入框）就完全不插手，
          // 包括 `<code><button>…</button></code>` 这类嵌套引用芯片。
          if (target.closest(INTERACTIVE) !== null) return
          var code = target.closest('code')
          if (!isInlineCode(code)) return
          var selection = window.getSelection()
          if (selection && selection.isCollapsed === false && String(selection)) return

          e.preventDefault()
          var text = code.textContent || ''
          copyText(text).then(function () {
            showToast('已复制：' + (text.length > 48 ? text.slice(0, 48) + '…' : text))
          }, function () {
            showToast('复制失败，请手动选中后复制', 'error')
          })
        }

        document.addEventListener('click', onDocumentClick, true)

        var floating = null
        var cleanupNodes = [styleEl]

        // 卸载时清理所有 DOM / token / 监听副作用
        ctx.effect(function () {
          return function () {
            document.removeEventListener('click', onDocumentClick, true)
            window.clearTimeout(toastTimer)
            window.clearTimeout(surfaceRecheck)
            if (toast && toast.parentNode) toast.parentNode.removeChild(toast)
            if (surfaceDisposer) surfaceDisposer()
            cleanupNodes.forEach(function (node) {
              if (node && node.parentNode) node.parentNode.removeChild(node)
            })
          }
        })

        // 主题变化时复检「表面归属」：别人的样式表可能刚注入 / 刚被卸载。
        // 结论没变时 syncSurfaces 直接返回，不会每次都把令牌层重新压到最上面。
        ctx.effect(function () {
          return ctx.on('theme/change', function () { syncSurfaces() })
        })

        // 优先放入会话头部右侧槽位；React 缺失时退回浮动按钮
        var placed = false
        if (React !== null) {
          try {
            slots.inject('conversation.session.header.utilities', function () {
              return slots.register(
                { name: 'conversation.session.header.utilities', id: 'dsh-refined-picker', order: 100 },
                function () {
                  return React.createElement(ThemePicker, {
                    ctx: ctx,
                    themes: THEMES,
                    initial: initial,
                    initialScheme: theme.getTheme().active.colorScheme,
                    onPick: applyTheme,
                    // 共存开关：表面（背景）归属 / 文字色归属
                    onCycleSurface: function () {
                      var order = ['auto', 'own', 'other']
                      return setSurfaceMode(order[(order.indexOf(surfaceMode) + 1) % order.length])
                    },
                    onToggleForeground: function () {
                      return setForegroundMode(foregroundMode === 'own' ? 'other' : 'own')
                    },
                    getSurface: function () { return { mode: surfaceMode, yielded: surfaceYielded === true } },
                    getForeground: function () { return foregroundMode },
                    onRecheck: function () {
                      surfaceYielded = null
                      return { mode: surfaceMode, yielded: syncSurfaces() }
                    },
                  })
                }
              )
            })
            placed = true
          } catch (e) {
            console.error('dsh-refined: slot registration failed, falling back to floating button', e)
          }
        }
        if (!placed) {
          floating = createFloatingPicker({ themes: THEMES, initial: initial, onPick: applyTheme })
          document.body.appendChild(floating.node)
          cleanupNodes.push(floating.node, floating.styleTag)
        }

        console.info('[dsh-refined] 已启用：主题 ' + initial + (placed ? '，切换按钮在会话头部右侧' : '，切换按钮为浮动按钮'))
      },
    }

    return module.exports
  },
})
