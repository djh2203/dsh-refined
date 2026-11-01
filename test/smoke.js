/**
 * dsh-refined 冒烟测试 —— 无需浏览器：stub 掉 window / document / theme，
 * 真正执行 lib/client.js 里的 factory 并调用 apply，验证关键行为。
 *
 *   node test/smoke.js
 *
 * 覆盖：令牌拆分（文字 vs 表面）、前景 !important 样式表、第三方背景让位、
 *       菜单开关、行内代码点击复制的判定、样式标签标记（避免被模块系统回收）。
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const SRC = path.join(__dirname, '..', 'lib', 'client.js')
let fail = 0
const assert = (cond, msg) => {
  console.log((cond ? 'ok  : ' : 'FAIL: ') + msg)
  if (!cond) fail++
}

function makeEl(tag) {
  return {
    tagName: tag.toUpperCase(), attrs: {}, children: [], style: {}, textContent: '', parentNode: null,
    setAttribute(k, v) { this.attrs[k] = v },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null },
    removeAttribute(k) { delete this.attrs[k] },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c },
    querySelector(sel) { this._q = this._q || {}; return (this._q[sel] = this._q[sel] || { textContent: '' }) },
    classList: { toggle() {}, add() {}, remove() {} },
    querySelectorAll() { return [] },
    addEventListener() {},
  }
}

// 极简选择器匹配：tag / .class / [attr] / [attr=v] / [attr*=v]（不带组合嵌套）
function matches(node, sel) {
  let rest = sel.trim()
  const cls = rest.match(/^\.([A-Za-z0-9_-]+)/)
  if (cls) {
    if ((' ' + (node.getAttribute('class') || '') + ' ').indexOf(' ' + cls[1] + ' ') === -1) return false
    rest = rest.slice(cls[0].length)
  }
  const tag = rest.match(/^([a-z]+)/)
  if (tag) {
    if (node.tagName !== tag[1].toUpperCase()) return false
    rest = rest.slice(tag[0].length)
  }
  const re = /\[([a-z-]+)(?:([*^$]?=)"?([^"\]]*)"?)?\]/g
  let m
  while ((m = re.exec(rest))) {
    const v = node.getAttribute(m[1])
    if (v === null) return false
    if (m[2] === '=' && v !== m[3]) return false
    if (m[2] === '*=' && v.indexOf(m[3]) === -1) return false
  }
  return true
}

/** specs 从最内层到最外层 */
function chain(specs) {
  const nodes = specs.map((s) => ({
    tagName: s.tag.toUpperCase(), attrs: s.attrs || {}, textContent: s.text || '', parent: null,
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null },
    contains(other) {
      let cur = other
      while (cur) {
        if (cur === this) return true
        cur = cur.parent
      }
      return false
    },
    closest(sel) {
      const parts = sel.split(',').map((x) => x.trim())
      let cur = this
      while (cur) {
        if (parts.some((p) => matches(cur, p))) return cur
        cur = cur.parent
      }
      return null
    },
  }))
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].parent = nodes[i + 1]
  return nodes[0]
}

function build(foreignBackground, options) {
  const opts = options || {}
  const copied = []
  const overrides = []
  const listeners = {}
  const captured = {}
  const clickHandlers = []
  const docListeners = { click: [], keydown: [] }
  const effects = []
  const head = makeEl('head')
  const body = makeEl('body')
  const extraSheets = []

  const document = {
    head, body, documentElement: makeEl('html'),
    createElement: (t) => makeEl(t),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener(name, fn) {
      if (name === 'click') clickHandlers.push(fn)
      if (docListeners[name]) docListeners[name].push(fn)
    },
    removeEventListener(name, fn) {
      if (docListeners[name]) docListeners[name] = docListeners[name].filter((x) => x !== fn)
    },
    execCommand: () => (opts.execOk === undefined ? true : opts.execOk),
    get styleSheets() {
      const own = head.children.filter((el) => el.tagName === 'STYLE').map((el) => ({ ownerNode: el, cssRules: [] }))
      return own.concat(extraSheets)
    },
  }

  const addForeignSheet = () => {
    const node = makeEl('style')
    node.setAttribute('data-plugin', 'dsh-plugin-wallpaper-engine')
    head.appendChild(node)
    extraSheets.push({
      ownerNode: node,
      cssRules: [{ style: { getPropertyValue: (k) => (k.indexOf('--dsw-alias-bg-base') === 0 ? 'transparent' : '') } }],
    })
  }
  if (foreignBackground) addForeignSheet()

  const theme = {
    overrideTokens(source, tokens) {
      overrides.push({ kind: 'reg', tokens })
      return () => overrides.push({ kind: 'dispose' })
    },
    getTheme: () => ({ active: { colorScheme: 'light', tokens: {} } }),
  }
  const slots = {
    inject: (key, cb) => {
      if (opts.noSlot) throw new Error('slot unavailable (test)')
      return cb()
    },
    register: (opts, comp) => { if (typeof comp === 'function') comp(); return () => {} },
  }
  const ctx = {
    theme, slots,
    effect(fn) { effects.push(fn()) },
    on(name, fn) { listeners[name] = fn; return () => {} },
  }
  const React = {
    createElement: (type, props) => {
      if (typeof type === 'function') {
        if (type.name === 'ThemePicker') captured.props = props
        return type(props)
      }
      return null
    },
    useState: (v) => [v, () => {}],
    useEffect: () => {},
  }
  const window = {
    localStorage: { getItem: () => null, setItem: () => {} },
    setTimeout: () => 0, clearTimeout: () => {},
    setInterval: () => 0, clearInterval: () => {},
    navigator: {
      clipboard: {
        writeText: (t) => {
          if (opts.clipboardSyncThrow) throw new Error('blocked by policy (test)')
          copied.push(t)
          return Promise.resolve()
        },
      },
    },
    getSelection: () => (opts.selection ? opts.selection() : null),
  }
  let factory = null
  window.__ModuleLoader__ = { load: (r) => { factory = r.factory } }

  vm.runInNewContext(fs.readFileSync(SRC, 'utf8'), {
    window, document, console, Promise, navigator: window.navigator,
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    setInterval: window.setInterval, clearInterval: window.clearInterval,
  })

  const mod = factory((spec) => {
    if (spec === 'react') return React
    throw new Error('unexpected require: ' + spec)
  })
  mod.apply(ctx)

  return {
    copied, overrides, listeners, captured, head, docListeners,
    disposeAll: () => effects.forEach((fn) => { if (typeof fn === 'function') fn() }),
    click: clickHandlers[0],
    addForeignSheet,
    styleNode: () => head.children.find((el) => /^dsh-refined/.test(el.getAttribute('data-plugin') || '')),
  }
}

(async () => {
// ---- 1. 没有第三方背景插件：表面层归自己，文字走 !important ----
const a = build(false)
const regs = a.overrides.filter((o) => o.kind === 'reg')
assert(regs.length === 1, '注册了一层表面令牌')
const toks = Object.keys(regs[0].tokens)
assert(toks.indexOf('--dsw-alias-bg-base') !== -1, '表面层含 bg-base')
assert(toks.indexOf('--dsw-alias-label-primary') === -1, '表面层不含文字令牌（文字不在令牌层里抢）')
assert(a.styleNode().getAttribute('data-plugin') === 'dsh-refined-theme',
  '样式标签标记避开包名（不会被 dsh-client-modules 回收）')
assert(/body \{ --dsw-alias-label-primary: .* !important/.test(a.styleNode().textContent),
  '文字色用 !important 落在自己的样式表')
assert(a.styleNode().textContent.indexOf('--dsw-alias-bg-base') === -1, '样式表不写底色（不越权）')

// ---- 2. 有壁纸类插件：自动让位 ----
const b = build(true)
assert(b.overrides.filter((o) => o.kind === 'reg').length === 0, '检测到第三方背景样式表 ⇒ 不注册表面层')
assert(/--dsw-alias-label-primary: .* !important/.test(b.styleNode().textContent), '让出背景后文字色仍然生效')

// ---- 3. 运行中第三方样式表出现：theme/change 复检让位 ----
const c = build(false)
assert(c.overrides.filter((o) => o.kind === 'reg').length === 1, '先自己画背景')
c.addForeignSheet()
c.listeners['theme/change']({ active: { colorScheme: 'light' } })
assert(c.overrides.filter((o) => o.kind === 'dispose').length === 1, '复检后撤掉表面层（把背景让出去）')

// ---- 4. 菜单开关 ----
const d = build(true)
const props = d.captured.props
assert(!!props, '拿得到 picker props')
assert(props.getSurface().yielded === true, '自动模式 + 有第三方背景 ⇒ 已让出')
assert(props.onCycleSurface().mode === 'own', 'auto → own：改为自己画')
assert(props.onCycleSurface().mode === 'other', 'own → other：强制让出')
assert(props.onToggleForeground() === 'other', '文字可切换让给其它插件')

// ---- 5. 行内代码点击复制 ----
const e = build(false)
let prevented = 0
const inline = chain([
  { tag: 'span', text: 'array.map' },
  { tag: 'code', text: 'array.map' },
  { tag: 'div', attrs: { class: '_markdown_1ypvv_5' } },
])
e.click({ target: inline, preventDefault() { prevented++ } })
assert(prevented === 1 && e.copied[0] === 'array.map', '行内代码点击被接管并复制')

const inPre = chain([
  { tag: 'code', text: 'x = 1' },
  { tag: 'pre' },
  { tag: 'div', attrs: { class: '_markdown_1ypvv_5' } },
])
e.click({ target: inPre, preventDefault() { prevented++ } })
assert(prevented === 1 && e.copied.length === 1, '代码块里的 code 不复制')

const chip = chain([
  { tag: 'code', text: 'src/main.js' },
  { tag: 'button' },
  { tag: 'div', attrs: { class: '_markdown_1ypvv_5' } },
])
e.click({ target: chip, preventDefault() { prevented++ } })
assert(prevented === 1 && e.copied.length === 1, '引用芯片里的 code 不复制')

const outside = chain([
  { tag: 'code', text: 'const a = 1' },
  { tag: 'div', attrs: { class: '_composer_xyz_1' } },
])
e.click({ target: outside, preventDefault() { prevented++ } })
assert(prevented === 1 && e.copied.length === 1, 'markdown 容器外的 code 不复制')

const editable = chain([
  { tag: 'span', text: 'x' },
  { tag: 'code', text: 'x' },
  { tag: 'div', attrs: { contenteditable: 'true' } },
  { tag: 'div', attrs: { class: '_markdown_1ypvv_5' } },
])
e.click({ target: editable, preventDefault() { prevented++ } })
assert(prevented === 1 && e.copied.length === 1, '可编辑祖先下的 code 不接管')

// ---- 6. 浮动按钮兜底：注册失败时可用，且卸载后不留 document 监听 ----
const f = build(false, { noSlot: true })
assert(f.docListeners.keydown.length === 1, '浮动兜底挂了 1 个 keydown 监听（Esc 关闭菜单）')
assert(f.styleNode() === undefined || f.styleNode().getAttribute('data-plugin') === 'dsh-refined-theme',
  '浮动兜底的样式标签也带本项目标记（不会被模块系统回收）')
f.disposeAll()
assert(f.docListeners.keydown.length === 0 && f.docListeners.click.length === 0,
  '卸载后 document 级监听全部摘掉（重复 apply 不会越挂越多）')

// ---- 7. 页面别处残留选区，不应妨碍复制（只有选区压住该 code 才让位） ----
const elsewhereSelection = {
  isCollapsed: false,
  rangeCount: 1,
  toString: () => '别的消息里的文字',
  getRangeAt: () => ({
    commonAncestorContainer: chain([{ tag: 'span', text: 'x' }, { tag: 'div' }]),
    intersectsNode: () => false,
  }),
}
const g = build(false, { selection: () => elsewhereSelection })
let preventedG = 0
const inlineG = chain([
  { tag: 'code', text: 'array.filter' },
  { tag: 'div', attrs: { class: '_markdown_1ypvv_5' } },
])
g.click({ target: inlineG, preventDefault() { preventedG++ } })
assert(preventedG === 1 && g.copied[0] === 'array.filter', '别处有残留选区时仍然复制')

const coveringSelection = {
  isCollapsed: false,
  rangeCount: 1,
  getRangeAt: () => ({
    commonAncestorContainer: chain([{ tag: 'span', text: 'x' }, { tag: 'div' }]),
    intersectsNode: () => true,
  }),
}
const h = build(false, { selection: () => coveringSelection })
let preventedH = 0
const inlineH = chain([
  { tag: 'code', text: 'array.map' },
  { tag: 'div', attrs: { class: '_markdown_1ypvv_5' } },
])
h.click({ target: inlineH, preventDefault() { preventedH++ } })
assert(preventedH === 0 && h.copied.length === 0, '选区压在该 code 上时让位给原生选择')

// ---- 8. ⌘/Ctrl/Alt + 点击不抢 ----
const k = build(false)
let preventedK = 0
k.click({ target: inlineH, metaKey: true, preventDefault() { preventedK++ } })
assert(preventedK === 0 && k.copied.length === 0, '⌘+点击不接管')
k.click({ target: inlineH, ctrlKey: true, preventDefault() { preventedK++ } })
assert(preventedK === 0 && k.copied.length === 0, 'Ctrl+点击不接管')

// ---- 9. 剪贴板 API 同步抛错 → 走 execCommand 退路 ----
const m = build(false, { clipboardSyncThrow: true })
let preventedM = 0
const inlineM = chain([
  { tag: 'code', text: 'npm i' },
  { tag: 'div', attrs: { class: '_markdown_1ypvv_5' } },
])
m.click({ target: inlineM, preventDefault() { preventedM++ } })
assert(preventedM === 1, '剪贴板 API 抛错时仍然接管点击（走退路）')

const m2 = build(false, { clipboardSyncThrow: true, execOk: false })
m2.click({ target: inlineM, preventDefault() {} })
await new Promise((r) => setTimeout(r, 0))

console.log(fail ? '\n有 ' + fail + ' 项失败' : '\n全部通过')
process.exitCode = fail ? 1 : 0
})()
