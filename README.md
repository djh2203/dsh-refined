# DSH Refined

**DeepSeek-Refined 的 DeepSeek Harness 移植版** —— 一个动态 Cordis 插件，为 DeepSeek Harness（DSH）前端注入 Obsidian Border 风格的 Markdown 美化与多主题配色。

原版是一个 Tampermonkey 用户脚本（见 [`DeepSeek-Refined`](https://github.com/djh2203/DeepSeek-Refined)），作用于网页版 DeepSeek Chat。本目录把它改造成 DSH 的**动态 Cordis 插件**：不注入脚本、不改动 DSH 源码，纯前端扩展，随时可停用恢复原样。

## 功能

| 功能 | 说明 |
| --- | --- |
| 5 套主题 | Border（默认）/ Nord / Twilight / GitHub / Atom One，深色/浅色自动跟随系统 |
| 设计令牌覆盖 | 通过 `theme.overrideTokens()` 覆盖 DSH 的 `--dsw-alias-*` CSS 变量（与网页版同一套变量名），整站配色统一生效 |
| Markdown 美化 | 各级标题左侧彩色圆角竖条；引用块 Border 点阵图案背景 + 品牌色圆角竖条；粗体/斜体/行内代码/KaTeX 公式独立配色 |
| 主题切换 | 会话头部右侧调色板按钮，一键切换，选择自动记住（页面刷新后保持） |

## 安装方法（最终用户）

不需要自己拆代码段，也不需要改任何配置：

1. 打开 [`main.js`](./main.js)，全选复制全文（GitHub 仓库页点 **Raw** 再复制更干净）
2. 打开你的 DSH Web，**新建一个会话**
3. 把全文粘贴到输入框发送，附上一句话：
   > 请把上面的内容创建为动态 Cordis 插件并运行：HOST 段 → `code.host`，CLIENT 段 → `code.client`
4. 助手定义并运行插件后，聊天里会出现**运行卡片**，点「**允许**」授权
5. 主题立即生效：会话头部右侧出现调色板按钮，可切换 5 套主题

### 常见疑问

- **Settings → 插件 页面里没有它？** 正常。动态插件属于创建它的那个会话，不走部署配置；Settings → 插件 只显示部署级（composition）插件。
- **换会话 / 重启 DSH 后没了？** 正常。动态插件是会话级的临时扩展，重新粘贴安装一次即可（也可考虑改为部署级插件，见下文）。

## 与原版的差异

- **选择器适配**：DSH 的 Markdown 容器是 CSS Modules 哈希类名（如 `_markdown_1nba0_5`），使用 `[class*="_markdown_"]` 前缀匹配，避免依赖具体哈希值
- **深色模式钩子相同**：DSH 与网页版一样使用 `body[data-ds-dark-theme]`
- **持久化方式不同**：原版用 `localStorage`；本插件保存在 Host 进程内（页面刷新保持，Host 重启后回到默认主题）
- **未移植**：行内代码点击复制（依赖页面全局 `document`，动态插件沙箱不可用）、消息宽度 75% 与表格宽度 70%（DSH 布局为固定列宽 + 表格自适应滚动，强行收窄会破坏版面）

## 自定义

所有配色集中在 `main.js` 的 `THEMES` 对象中，字段含义与根目录 README 一致（`strong` = 粗体、`em` = 斜体、`math` = 公式、`heading` = 标题竖条数组 `[h1..h6]` 等）。新增主题：复制任意一个主题对象改名即可，切换菜单会自动出现。
