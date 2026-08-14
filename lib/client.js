/**
 * dsh-refined —— 客户端插件 bundle（部署级）。
 *
 * 由 dsh-client-modules 通过 /plugins/dsh-refined/client.js 在运行时加载。
 * 协议：window.__ModuleLoader__.load({ id, factory })，
 * factory 内可 require 共享模块（react 等平台 seed）。
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

    // ============ 由调色板生成主题 token 覆盖层 ============
    function buildTokens(p) {
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
        '--dsw-alias-label-primary': { light: L.labelPrimary, dark: D.labelPrimary },
        '--dsw-alias-label-secondary': { light: L.labelSecondary, dark: D.labelSecondary },
        '--dsw-alias-label-tertiary': { light: L.labelTertiary, dark: D.labelTertiary },
        '--dsw-alias-label-caption': { light: L.labelCaption, dark: D.labelCaption },
        '--dsw-alias-markdown-inline-code': { light: L.inlineCodeBg, dark: D.inlineCodeBg },
        '--dsw-alias-markdown-code-block': { light: L.codeBlockBg, dark: D.codeBlockBg },
        '--dsw-alias-markdown-code-block-banner': { light: L.codeBannerBg, dark: D.codeBannerBg },
        '--dsw-specific-sidebar-fill': { light: L.bg, dark: D.bg },
        '--dsw-specific-bubble': { light: L.bgLayer2, dark: D.bgLayer2 },
      }
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
        '/* 行内代码文字颜色 */',
        md + ' :not(pre)>code { color: ' + L.inlineCodeText + ' !important; }',
        'body[data-ds-dark-theme] ' + md + ' :not(pre)>code { color: ' + D.inlineCodeText + ' !important; }',
        '/* 引用块：Border 点阵图案背景 + 圆角竖条 */',
        md + ' blockquote { border-left: none !important; border-radius: 6px; position: relative; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'%3E%3Cpath fill=\'%23' + L.blockquoteDot + '\' fill-opacity=\'0.12\' d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\'%3E%3C/path%3E%3C/svg%3E"); }',
        'body[data-ds-dark-theme] ' + md + ' blockquote { background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'%3E%3Cpath fill=\'%23' + D.blockquoteDot + '\' fill-opacity=\'0.12\' d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\'%3E%3C/path%3E%3C/svg%3E"); }',
        md + ' blockquote blockquote { background-image: none !important; }',
        md + ' blockquote::before { content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 4px; border-radius: 4px; background: var(--dsw-alias-brand-primary); }'
      ].join('\n')
    }

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

      React.useEffect(function () {
        return props.ctx.on('theme/change', function (snapshot) {
          setScheme(snapshot.active.colorScheme)
        })
      }, [])

      var names = Object.keys(props.themes)
      var pal = props.themes[name][scheme]

      function optionStyle(n) {
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
          color: n === name ? pal.brandPrimary : pal.labelPrimary,
          fontWeight: n === name ? 600 : 400,
        }
      }

      return React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
          type: 'button',
          title: '切换主题',
          'aria-label': '切换主题',
          'aria-expanded': open,
          onClick: function () { setOpen(!open) },
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
              style: optionStyle(n),
            },
              React.createElement('span', null, n),
              React.createElement('span', { style: { visibility: n === name ? 'visible' : 'hidden' } }, '\u2713'),
            )
          }),
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
      apply(ctx) {
        var theme = ctx.get('theme')
        if (theme === undefined) return

        var styleEl = document.createElement('style')
        styleEl.setAttribute('data-plugin', 'dsh-refined')
        document.head.appendChild(styleEl)

        var tokenDisposer = null
        var current = 'Border'
        var applied = false

        function applyTheme(name) {
          if (!THEMES[name]) return
          if (applied && name === current) return
          current = name
          if (tokenDisposer) { tokenDisposer(); tokenDisposer = null }
          tokenDisposer = theme.overrideTokens('dsh-refined', buildTokens(THEMES[name]))
          styleEl.textContent = buildCss(THEMES[name])
          applied = true
          saveTheme(name)
        }

        var initial = loadTheme()
        applyTheme(initial)

        var floating = null
        var cleanupNodes = [styleEl]

        // 卸载时清理所有 DOM / token 副作用
        ctx.effect(function () {
          return function () {
            if (tokenDisposer) tokenDisposer()
            cleanupNodes.forEach(function (node) {
              if (node && node.parentNode) node.parentNode.removeChild(node)
            })
          }
        })

        // 优先放入会话头部右侧槽位；失败则浮动按钮兜底
        var placed = false
        var slots = ctx.get('slots')
        if (slots !== undefined && React !== null) {
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
      },
    }

    return module.exports
  },
})
