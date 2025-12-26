# 颜色变量规范文档

本项目统一采用 CSS 变量（Custom Properties）进行颜色管理，所有变量均定义在 `src/styles/variables.css` 文件的 `:root` 作用域中。

## 命名规范

1.  **前缀**：所有变量必须以 `--dp-cp-` 开头。
2.  **格式**：使用 kebab-case（短横线命名法）。
3.  **语义化**：变量名应清晰表达其用途或属性。

## 变量列表

### 1. 品牌色 (Brand Colors)

| 变量名 | 默认值 | 说明 | 适用场景 |
| :--- | :--- | :--- | :--- |
| `--dp-cp-primary-color` | `#0052d9` | 主色 | 高亮、选中状态、边框聚焦、主要按钮等 |
| `--dp-cp-primary-text` | `#4096ff` | 主色文字 | 深色背景上的高亮文字、链接、激活状态文本 |
| `--dp-cp-danger-color` | `#ff4d4f` | 危险色 | 删除按钮、清除操作、错误提示 |

### 2. 文本颜色 (Text Colors)

| 变量名 | 默认值 | 说明 | 适用场景 |
| :--- | :--- | :--- | :--- |
| `--dp-cp-text-color` | `#e0e0e0` | 主要文字颜色 | 正文、输入框文字、标题 |
| `--dp-cp-text-secondary` | `#999999` | 次要文字颜色 | 图标、提示信息、辅助说明 |
| `--dp-cp-text-light` | `#cccccc` | 浅色文字 | 次要层级较弱的文字 |
| `--dp-cp-text-inverse` | `#ffffff` | 反色文字 | 深色背景上的白色文字、滑块中心点 |
| `--dp-cp-color-black` | `#000000` | 纯黑 | 黑色背景或文字 |

### 3. 背景颜色 (Background Colors)

| 变量名 | 默认值 | 说明 | 适用场景 |
| :--- | :--- | :--- | :--- |
| `--dp-cp-bg-panel` | `#2b2b2b` | 面板背景色 | 颜色选择器主面板背景 |
| `--dp-cp-bg-trigger` | `#2b2b2b` | 触发器背景色 | 颜色选择器触发区域背景 |
| `--dp-cp-bg-input` | `#333333` | 输入框背景色 | 文本输入框、下拉框背景 |
| `--dp-cp-bg-tab` | `#3a3a3a` | 标签页背景色 | 非激活状态的标签页背景 |
| `--dp-cp-bg-tab-active` | `#2d2c2c` | 激活标签页背景 | 当前选中的标签页背景 |
| `--dp-cp-bg-tab-divider` | `#48494b` | 标签页分割线 | 标签页区域的底色或分割线 |
| `--dp-cp-bg-overlay` | `rgba(0, 0, 0, 0.1)` | 遮罩层背景 | 模态框遮罩、轻微暗化 |
| `--dp-cp-bg-clear` | `rgba(0, 0, 0, 0.42)` | 清除按钮背景 | 输入框清除按钮背景 |
| `--dp-cp-bg-clear-hover` | `rgba(255, 255, 255, 0.1)` | 清除按钮悬停 | 清除按钮 Hover 状态 |

### 4. 边框颜色 (Border Colors)

| 变量名 | 默认值 | 说明 | 适用场景 |
| :--- | :--- | :--- | :--- |
| `--dp-cp-border-color` | `#444444` | 通用边框颜色 | 面板边框、输入框边框、分割线 |
| `--dp-cp-border-color-dark` | `#555555` | 深色边框颜色 | 需要更深对比度的边框 |

### 5. 阴影颜色 (Shadow Colors)

| 变量名 | 默认值 | 说明 | 适用场景 |
| :--- | :--- | :--- | :--- |
| `--dp-cp-shadow-color-base` | `rgba(0, 0, 0, 0.3)` | 基础阴影 | 面板基础投影 |
| `--dp-cp-shadow-color-light` | `rgba(0, 0, 0, 0.2)` | 浅色阴影 | 轻微浮起效果 |
| `--dp-cp-shadow-color-dark` | `rgba(0, 0, 0, 0.4)` | 深色阴影 | 较深层次的投影 |
| `--dp-cp-shadow-color-heavy` | `rgba(0, 0, 0, 0.5)` | 重阴影 | 滑块阴影、明显浮层 |
| `--dp-cp-shadow-color-deep` | `rgba(0, 0, 0, 0.6)` | 最深阴影 | 强调的悬浮元素 |

### 6. 渐变与图案 (Gradients & Patterns)

| 变量名 | 说明 | 适用场景 |
| :--- | :--- | :--- |
| `--dp-cp-gradient-hue` | 色相条彩虹渐变 | 色相选择滑块背景 |
| `--dp-cp-gradient-white` | 白色透明渐变 | 饱和度面板遮罩 |
| `--dp-cp-gradient-black` | 黑色透明渐变 | 饱和度面板遮罩 |
| `--dp-cp-bg-checkerboard` | 棋盘格图案 | 透明度展示背景、Alpha 滑块背景 |

## 使用示例

```css
.my-component {
  background-color: var(--dp-cp-bg-panel);
  color: var(--dp-cp-text-color);
  border: 1px solid var(--dp-cp-border-color);
}

.my-component:hover {
  border-color: var(--dp-cp-primary-color);
}
```

## 注意事项

1.  **新增变量**：如果需要新增颜色，请先在 `src/styles/variables.css` 中定义，并更新本文档。
2.  **禁止硬编码**：禁止在组件 `style` 中直接使用 Hex、RGB 等颜色值。
3.  **透明度**：如果需要使用带透明度的颜色，建议使用定义的 `rgba` 变量，或者使用 `color-mix` (现代浏览器) 或在变量中存储 RGB 值 (高级用法)。目前项目中主要使用预定义的 RGBA 变量处理阴影和遮罩。
