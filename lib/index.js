/**
 * dsh-refined —— Host 侧入口（占位插件）。
 *
 * 本插件是纯客户端美化插件，Host 侧无需任何逻辑；
 * 但 loader 条目需要一个可激活的插件对象，因此这里提供空实现。
 * 所有功能都在 lib/client.js（由 dsh-client-modules 通过 /plugins/dsh-refined/client.js 运行时提供）。
 */
module.exports = {
  name: 'dsh-refined',
  apply(ctx) {
    // 无 Host 侧行为
  },
}
