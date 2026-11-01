/**
 * dsh-refined —— Host 侧入口（占位插件）。
 *
 * 本插件是纯客户端美化插件，Host 侧无需任何逻辑；
 * 但 loader 条目需要一个可激活的插件对象，因此这里提供空实现。
 * 所有功能都在 lib/client.js（由 dsh-client-modules 经 /plugins 的**组合路由**
 * ——`/plugins/??…&rev=…#`——在浏览器里加载；单文件的 /plugins/dsh-refined/client.js 会 404）。
 */
module.exports = {
  name: 'dsh-refined',
  apply(ctx) {
    // 无 Host 侧行为
  },
}
