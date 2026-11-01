/**
 * 双实现一致性检查 —— `main.js`（动态粘贴版）与 `lib/client.js`（部署版）的
 * 调色板与令牌清单不能悄悄漂移。
 *
 *   node test/parity.js
 *
 * 只做静态抽取与比较，不执行任何插件代码、不依赖浏览器。
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = path.join(__dirname, '..')
let fail = 0
const assert = (cond, msg) => {
  console.log((cond ? 'ok  : ' : 'FAIL: ') + msg)
  if (!cond) fail++
}

/** 抽出源码里第一个 `THEMES = {…}` 字面量并求值 */
function extractThemes(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8')
  const start = src.indexOf('THEMES = {')
  if (start < 0) throw new Error(file + ': 找不到 THEMES 字面量')
  const open = src.indexOf('{', start)
  let depth = 0
  let end = -1
  for (let i = open; i < src.length; i++) {
    const ch = src[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  if (end < 0) throw new Error(file + ': THEMES 字面量没有闭合')
  const literal = src.slice(open, end + 1)
  return vm.runInNewContext('(' + literal + ')', {})
}

/** 递归比较，返回第一处差异路径（null 表示相同） */
function diff(a, b, trail) {
  const where = trail || ''
  if (a === b) return null
  if (typeof a !== typeof b) return where + ' 类型不同'
  if (a === null || b === null || typeof a !== 'object') return where + ' 值不同：' + JSON.stringify(a) + ' vs ' + JSON.stringify(b)
  if (Array.isArray(a) !== Array.isArray(b)) return where + ' 数组/对象不一致'
  const keys = Array.from(new Set(Object.keys(a).concat(Object.keys(b))))
  for (const k of keys) {
    if (!(k in a)) return where + '.' + k + ' 只在 main.js 有'
    if (!(k in b)) return where + '.' + k + ' 只在 lib/client.js 有'
    const d = diff(a[k], b[k], where + '.' + k)
    if (d) return d
  }
  return null
}

const deployed = extractThemes('lib/client.js')
const dynamic = extractThemes('main.js')

const nameOf = (all) => Object.keys(all).sort()

assert(nameOf(deployed).join(',') === nameOf(dynamic).join(','),
  '主题集合一致：' + nameOf(deployed).join(' / '))

for (const theme of nameOf(deployed)) {
  const d = diff(dynamic[theme], deployed[theme], theme)
  assert(d === null, '主题「' + theme + '」逐字段一致' + (d ? '（差异：' + d + '）' : ''))
}

// 每个主题的 light/dark 都必须含代码真正读取的字段（bgLayer1 只在 dark 里给，可选）
const REQUIRED_FIELDS = [
  'bgBase', 'bgLayer2', 'bgLayer3', 'labelPrimary', 'labelSecondary', 'labelTertiary', 'labelCaption',
  'brandPrimary', 'borderL1', 'borderL2', 'inlineCodeBg', 'codeBlockBg', 'codeBannerBg',
  'strong', 'em', 'math', 'inlineCodeText', 'heading', 'blockquoteDot', 'toastBg', 'toastText',
]
for (const theme of nameOf(deployed)) {
  for (const scheme of ['light', 'dark']) {
    const palette = deployed[theme][scheme]
    const missingFields = REQUIRED_FIELDS.filter((f) => !(f in palette))
    const headingOk = Array.isArray(palette.heading) && palette.heading.length === 6
    assert(missingFields.length === 0 && headingOk,
      theme + '/' + scheme + ' 必需字段齐全（缺：' + (missingFields.join(',') || '无') + '；heading 六色：' + headingOk + '）')
  }
}

// 令牌清单：部署版的表面令牌必须由 main.js 全部覆盖（动态版是全量令牌层）
const readSrc = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
const tokenNames = (src) => {
  const out = new Set()
  const re = /'(--dsw-[a-z0-9-]+)'/g
  let m
  while ((m = re.exec(src))) out.add(m[1])
  return out
}
const deployedTokens = tokenNames(readSrc('lib/client.js'))
const dynamicTokens = tokenNames(readSrc('main.js'))
const missing = Array.from(deployedTokens).filter((t) => !dynamicTokens.has(t))
assert(missing.length === 0, '部署版覆盖的令牌动态版都有（缺：' + (missing.join(', ') || '无') + '）')

console.log(fail ? '\n有 ' + fail + ' 项不一致' : '\n两版调色板一致')
process.exitCode = fail ? 1 : 0
