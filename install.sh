#!/usr/bin/env bash
# ============================================================================
# dsh-refined 部署级安装脚本
#
# 用法:  ./install.sh [profile 名]       默认 profile 为 web
#
# 作用:
#   1. 把本包链接进 <DSH_HOME>/profiles/<profile>/node_modules/dsh-refined
#   2. 往 <DSH_HOME>/profiles/<profile>/cordis.patch.yml 插入 loader 条目（幂等）
#   3. 提示重启 dsh web
#
# 之后由你手动重启 DSH（重启会中断当前会话）：
#   dsh web --port 3080
#
# 注意：本脚本用于没有 pnpm 的环境。若已用「dsh plugin add」安装过
# （README 方式一），请勿再运行本脚本，否则 patch 条目会与 bundle 条目重复。
# ============================================================================
set -euo pipefail

PROFILE="${1:-web}"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE_DIR="$DSH_HOME/profiles/$PROFILE"
PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$PROFILE_DIR" ]; then
  echo "错误: 找不到 profile 目录 $PROFILE_DIR" >&2
  echo "请确认 profile 存在（dsh --profile $PROFILE 首次启动会自动创建），或用: $0 <profile名>" >&2
  exit 1
fi

# ---------- 1) 链接包到 profile 的 node_modules ----------
mkdir -p "$PROFILE_DIR/node_modules"
LINK="$PROFILE_DIR/node_modules/dsh-refined"
if [ -e "$LINK" ]; then
  echo "已存在: $LINK（跳过链接）"
else
  ln -s "$PKG_DIR" "$LINK"
  echo "已链接: $LINK -> $PKG_DIR"
fi

# ---------- 2) 写入 cordis.patch.yml 条目（幂等） ----------
PATCH="$PROFILE_DIR/cordis.patch.yml"
SNIPPET='- insert:
    - id: dsh-refined
      name: dsh-refined
      config: {}'

if [ -f "$PATCH" ] && grep -q "id: dsh-refined" "$PATCH"; then
  echo "patch 已包含 dsh-refined 条目（跳过）: $PATCH"
else
  # 移除孤立的空列表行 []（patch 模板初始内容），避免 YAML 双值报错
  if [ -f "$PATCH" ]; then
    sed -i '/^\[\]$/d' "$PATCH" 2>/dev/null || true
  else
    printf '# dsh profile patch layer\n' > "$PATCH"
  fi
  printf '\n%s\n' "$SNIPPET" >> "$PATCH"
  echo "已写入 patch: $PATCH"
fi

echo ""
echo "=============================================="
echo "完成。请重启 DSH（当前运行中的进程会被替换）:"
echo ""
echo "  dsh --profile $PROFILE web --port 3080"
echo ""
echo "重启后验证:"
echo "  1. Settings → 插件 出现 dsh-refined 条目"
echo "  2. 任意会话头部右侧出现调色板按钮"
echo "  3. 主题选择存在浏览器 localStorage，后端再重启也不丢"
echo "=============================================="
