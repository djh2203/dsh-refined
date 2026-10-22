<h1 align="center">dsh-refined</h1>
<p align="center">
  <img src="https://img.shields.io/github/license/djh2203/DeepSeek-Refined?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/DeepSeek-5786FE?style=flat-square&logo=deepseek&logoColor=white" alt="DeepSeek" />
  <img src="https://img.shields.io/badge/Obsidian-7C3AED?style=flat-square&logo=obsidian&logoColor=white" alt="Obsidian" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
</p>
<p align="center">
<h3 align="center">
DeepSeek-Refined 的 DeepSeek Harness 移植版</h3>
为 DeepSeek Harness（DSH）前端注入 Obsidian Border 风格的 Markdown 美化与多主题配色。
</p>

原版是一个 Tampermonkey 用户脚本（见 [`DeepSeek-Refined`](https://github.com/djh2203/DeepSeek-Refined)），作用于网页版 DeepSeek Chat。本仓库把它移植到 DSH，提供**两种安装形态**：

| 形态 | 持久性 | 适用场景 |
| --- | --- | --- |
| **部署级插件**（bundle 包，推荐） | 常驻，后端重启不丢，所有会话生效，一条命令安装 | 自己/团队的部署 |
| **动态插件**（`main.js` 粘贴版） | 会话级，进程重启后需重装 | 快速体验、无法改部署的场合 |

不注入脚本、不改动 DSH 源码，纯前端扩展，随时可卸载恢复原样。

## 功能

| 功能 | 说明 |
| --- | --- |
| 5 套主题 | Border（默认）/ Nord / Twilight / GitHub / Atom One，深色/浅色自动跟随系统 |
| 设计令牌覆盖 | 通过 `theme.overrideTokens()` 覆盖 DSH 的 `--dsw-alias-*` CSS 变量（与网页版同一套变量名），整站配色统一生效 |
| Markdown 美化 | 各级标题左侧彩色圆角竖条；引用块 Border 点阵图案背景 + 品牌色圆角竖条；粗体/斜体/行内代码/KaTeX 公式独立配色 |
| 主题切换 | 会话头部右侧调色板按钮，一键切换；选择存在浏览器 `localStorage`（后端重启也保持） |

## 安装方法

### 方式一：一条命令（推荐，部署级）

```bash
npm i -g pnpm                                  # 一次性：dsh plugin 是 pnpm 转发器
dsh plugin --profile web add github:djh2203/dsh-refined
dsh web --port 3080                            # 重启 DSH
```

**无需改任何配置**：本包声明了 `dsh.bundle`，`dsh plugin add` 安装后会自动把 `dsh-refined` 加入 profile 的 `dsh.profile.bundles`，重启即生效。

- **发布前/本地试装**：把 github 地址换成本地路径 → `dsh plugin --profile web add file:/绝对路径/dsh-refined`
- **profile 名**：`web` 换成你自己的（`dsh --profile <名字> ...` 用的那个）
- **验证**：Settings → 插件 出现 `dsh-refined`；任意会话头部右侧出现调色板按钮
- **更新**：`dsh plugin --profile web update dsh-refined` → 重启
- **卸载**：`dsh plugin --profile web remove dsh-refined` → 重启

### 方式二：install.sh（没有 pnpm 的环境）

```bash
git clone <本仓库地址> dsh-refined
cd dsh-refined
./install.sh web                  # web 换成 profile 名
dsh web --port 3080               # 重启
```

脚本把包链接进 `~/.dsh/profiles/web/node_modules/`，并在 `cordis.patch.yml` 追加条目（幂等，可重复执行）。卸载：删除条目与链接后重启。

### 方式三：动态粘贴（临时体验）

1. 打开 [`main.js`](./main.js)，全选复制全文（GitHub 仓库页点 **Raw** 再复制更干净）
2. 打开你的 DSH Web，**新建一个会话**
3. 把全文粘贴到输入框发送，附上一句话：
   > 请把上面的内容创建为动态 Cordis 插件并运行：HOST 段 → `code.host`，CLIENT 段 → `code.client`
4. 助手定义并运行插件后，聊天里会出现**运行卡片**，点「**允许**」授权
5. 主题立即生效：会话头部右侧出现调色板按钮，可切换 5 套主题

## 常见疑问

- **Settings → 插件 页面里没有它？** 正常——那是部署级插件的清单。动态粘贴版属于创建它的那个会话，只在聊天里的运行卡片可见。
- **装上了，但没生效 / 有时有效有时无效？** 这是 1.0.0 的一个启动竞态：插件原先用 `ctx.get('theme')` 自己探测服务，外壳的 `theme` / `slots` 服务还没就绪时 apply 直接静默返回，于是主题不生效、按钮也不出现。现在插件对象声明了 `inject: ['theme', 'slots']`，由 cordis 等两个服务就位后再激活（同时 `dsh.client.immediately` 让客户端包在启动阶段就预取）。升级：`dsh plugin --profile web update dsh-refined` 后重启。判断是否生效：浏览器控制台会有 `[dsh-refined] 已启用：主题 …`。
- **重启 DSH 后没效果了？** 动态粘贴版是会话级临时扩展，重启即失，请改用**方式一**部署级安装。
- **`dsh plugin` 报 pnpm 找不到？** 先 `npm i -g pnpm`（方式一第一步）。

## 开发注意

- 客户端插件对象必须显式声明 `inject: ['theme', 'slots']`。不要用 `ctx.get('theme')` 自己探测后就 `return`——那就是上面那个“时灵时不灵”bug 的成因。
- 改完 `lib/client.js` 后要重装（`dsh plugin --profile web update dsh-refined`）或重启 DSH；浏览器端 bundle 是按 mtime 快照分发的，直接改文件不会自动重载。

## 与原版的差异

- **选择器适配**：DSH 的 Markdown 容器是 CSS Modules 哈希类名（如 `_markdown_1nba0_5`），使用 `[class*="_markdown_"]` 前缀匹配，避免依赖具体哈希值
- **深色模式钩子相同**：DSH 与网页版一样使用 `body[data-ds-dark-theme]`
- **持久化**：原版用 `localStorage`；部署版同样用 `localStorage`（后端重启保持）
- **未移植**：行内代码点击复制、消息宽度 75% 与表格宽度 70%（DSH 布局为固定列宽 + 表格自适应滚动，强行收窄会破坏版面）

## 自定义

所有配色集中在 **`lib/client.js`**（部署版）与 **`main.js`**（动态版）顶部的 `THEMES` 对象中，两处保持一致即可。字段含义：`strong` = 粗体、`em` = 斜体、`math` = 公式、`heading` = 标题竖条颜色数组 `[h1..h6]`、`blockquoteDot` = 引用块点阵颜色等。新增主题：复制任意一个主题对象改名即可，切换菜单会自动出现。
