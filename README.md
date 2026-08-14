# DSH Refined

**DeepSeek-Refined 的 DeepSeek Harness 移植版** —— 为 DeepSeek Harness（DSH）前端注入 Obsidian Border 风格的 Markdown 美化与多主题配色。

原版是一个 Tampermonkey 用户脚本（见 [`DeepSeek-Refined`](https://github.com/djh2203/DeepSeek-Refined)），作用于网页版 DeepSeek Chat。本仓库把它移植到 DSH，提供**两种安装形态**：

| 形态 | 持久性 | 适用场景 |
| --- | --- | --- |
| **部署级插件**（`package.json` + `lib/`） | 常驻，后端重启不丢，所有会话生效 | 自己/团队的部署，推荐 |
| **动态插件**（`main.js` 粘贴版） | 会话级，进程重启后需重装 | 快速体验、无法改部署的场合 |

不注入脚本、不改动 DSH 源码，纯前端扩展，随时可卸载恢复原样。

## 功能

| 功能 | 说明 |
| --- | --- |
| 5 套主题 | Border（默认）/ Nord / Twilight / GitHub / Atom One，深色/浅色自动跟随系统 |
| 设计令牌覆盖 | 通过 `theme.overrideTokens()` 覆盖 DSH 的 `--dsw-alias-*` CSS 变量（与网页版同一套变量名），整站配色统一生效 |
| Markdown 美化 | 各级标题左侧彩色圆角竖条；引用块 Border 点阵图案背景 + 品牌色圆角竖条；粗体/斜体/行内代码/KaTeX 公式独立配色 |
| 主题切换 | 会话头部右侧调色板按钮，一键切换；部署版选择存 `localStorage`（后端重启也保持），动态版存 Host 内存（页面刷新保持） |

## 安装方法

### 方式一：部署级安装（持久，推荐）

装进 DSH 部署组合：**所有会话自动生效，后端重启不丢**，Settings → 插件 页面可见可启停。

前置条件：一个可用的 DSH profile（默认 `~/.dsh/profiles/web`，对应 `dsh --profile web ...`）。

#### 用安装脚本（推荐）

```bash
git clone <本仓库地址> dsh-refined   # 或直接下载本目录
cd dsh-refined
./install.sh web                     # web 是 profile 名，可换成你自己的
```

脚本会：把包链接进 `~/.dsh/profiles/web/node_modules/`，往 `cordis.patch.yml` 插入条目。然后**重启 DSH**：

```bash
dsh web --port 3080        # 按你平时的启动方式即可
```

#### 手动步骤（不用脚本）

```bash
# 1) 把包放进 profile 的 node_modules（loader 从 profile 目录解析）
ln -s <本目录> ~/.dsh/profiles/web/node_modules/dsh-refined

# 2) 编辑 ~/.dsh/profiles/web/cordis.patch.yml，追加：
- insert:
    - id: dsh-refined
      name: dsh-refined
      config: {}

# 3) 重启 dsh web
```

#### 验证

1. Settings → 插件 出现 `dsh-refined` 条目（可启停）
2. 任意会话头部右侧出现调色板按钮，默认 Border 主题生效
3. 重启后端后主题仍保持（存在浏览器 localStorage）

#### 卸载 / 更新

- **卸载**：从 `cordis.patch.yml` 删除条目 → 删除 `node_modules/dsh-refined` 链接 → 重启
- **更新**：`git pull`（或重新复制 `lib/`）→ 重启
- 注意链接指向克隆目录：移动/删除克隆目录会使链接失效

### 方式二：动态粘贴安装（临时，快速体验）

不需要拆代码段，也不需要改任何配置：

1. 打开 [`main.js`](./main.js)，全选复制全文（GitHub 仓库页点 **Raw** 再复制更干净）
2. 打开你的 DSH Web，**新建一个会话**
3. 把全文粘贴到输入框发送，附上一句话：
   > 请把上面的内容创建为动态 Cordis 插件并运行：HOST 段 → `code.host`，CLIENT 段 → `code.client`
4. 助手定义并运行插件后，聊天里会出现**运行卡片**，点「**允许**」授权
5. 主题立即生效：会话头部右侧出现调色板按钮，可切换 5 套主题

## 常见疑问

- **Settings → 插件 页面里没有它？** 正常——那是部署级插件的清单。动态粘贴版属于创建它的那个会话，只在聊天里的运行卡片可见。
- **重启 DSH 后没效果了？** 动态粘贴版是会话级临时扩展，重启即失，请改用**方式一**部署级安装。
- **主题颜色每个浏览器不一样？** 部署版把选择存在各浏览器 `localStorage`，所以每台设备可独立记住自己的主题。

## 与原版的差异

- **选择器适配**：DSH 的 Markdown 容器是 CSS Modules 哈希类名（如 `_markdown_1nba0_5`），使用 `[class*="_markdown_"]` 前缀匹配，避免依赖具体哈希值
- **深色模式钩子相同**：DSH 与网页版一样使用 `body[data-ds-dark-theme]`
- **持久化**：原版用 `localStorage`；部署版同样用 `localStorage`（后端重启保持），动态粘贴版用 Host 内存（页面刷新保持、后端重启回默认）
- **未移植**：行内代码点击复制、消息宽度 75% 与表格宽度 70%（DSH 布局为固定列宽 + 表格自适应滚动，强行收窄会破坏版面）

## 自定义

所有配色集中在 **`lib/client.js`**（部署版）与 **`main.js`**（动态版）顶部的 `THEMES` 对象中，两处保持一致即可。字段含义：`strong` = 粗体、`em` = 斜体、`math` = 公式、`heading` = 标题竖条颜色数组 `[h1..h6]`、`blockquoteDot` = 引用块点阵颜色等。新增主题：复制任意一个主题对象改名即可，切换菜单会自动出现。
