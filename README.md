# dp-color-picker

## 1. 组件概述

**组件名称**: `dp-color-picker`  
**版本号**: `0.0.1`

`dp-color-picker` 是一款基于 Vue 3 + TypeScript 开发的高级颜色选择器组件。它不仅支持标准的单色（Solid）选择，还内置了强大的渐变色（Gradient）编辑功能。组件集成了透明度调节、HSV/RGB/HEX 格式切换、系统预设颜色面板以及智能的“最近使用颜色”记录功能。其设计目标是为开发者提供一个开箱即用、交互流畅且高度可配置的色彩解决方案，适用于各类设计工具、后台管理系统及个性化配置场景。

**技术依赖**:
- Vue: `^3.5.24`

---

## 2. 能力说明

| 功能模块 | 功能点 | 说明 |
|:--------|:-------|:-----|
| **色彩模式** | 单色/渐变切换 | 支持纯色与线性渐变（Linear Gradient）的无缝切换与编辑。 |
| **色彩空间** | 多格式支持 | 支持 HEX、RGB(A)、CSS 格式输入输出；内部使用 HSV 模型保证色彩计算精度。 |
| **透明度** | Alpha 通道 | 提供独立的透明度滑块，支持 0-100% 透明度调节。 |
| **交互体验** | 拖拽操作 | 饱和度面板、色相带、透明度带及渐变轴均支持流畅的拖拽交互，采用 RAF 优化性能。 |
| **预设管理** | 系统预设 | 内置 20 种常用标准色，支持通过 Props 自定义。 |
| **历史记录** | 最近使用颜色 | 自动记录用户最近选择的颜色，支持去重、持久化存储（LocalStorage）、最大数量限制及一键清除。 |
| **渐变编辑** | 多色标支持 | 支持添加、删除、拖拽渐变色标（Stop），可调节渐变角度。 |

**性能特征**:
- **高性能渲染**: 拖拽交互均使用 `requestAnimationFrame` 进行节流处理，避免高频 DOM 操作导致的卡顿。
- **按需更新**: 仅在必要时更新 DOM 和触发计算属性。

**限制条件**:
- 目前渐变模式仅支持 `linear-gradient`。
- 即使关闭 `enableAlpha`，内部计算仍保留 Alpha 通道，输出时会根据格式自动截断。

---

## 3. Props 规范

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|:-------|:-----|:-----|:-------|:-----|
| `modelValue` | `string` | 是 | `'#000000'` | 绑定的颜色值，支持 v-model。可以是 HEX、RGBA 或 CSS 渐变字符串。 |
| `defaultColor` | `string` | 否 | `'#000000'` | 当 modelValue 为空时的回退颜色。 |
| `enableAlpha` | `boolean` | 否 | `true` | 是否启用透明度（Alpha）滑块及输出支持。 |
| `format` | `'HEX' \| 'RGB'` | 否 | `'HEX'` | 颜色输出格式。⚠️ 注意：渐变模式下始终输出 CSS 渐变字符串。 |
| `swatchColors` | `string[]` | 否 | `[...]` | 系统预设颜色列表。默认包含 20 种常用色。 |
| `enableRecentColors`| `boolean` | 否 | `true` | 是否启用“最近使用颜色”功能。 |
| `maxCount` | `number` | 否 | `10` | 最近使用颜色的最大记录数量（1-20）。 |

### 复杂 Props 示例

**swatchColors**:
```typescript
const mySwatches = [
  '#FF0000', 
  'rgba(0, 255, 0, 0.5)', 
  'linear-gradient(90deg, #000 0%, #fff 100%)' // 支持渐变预设
];
```

---

## 4. Emit 事件说明

| 事件名 | 回调参数 | 触发时机 |
|:-------|:---------|:---------|
| `update:modelValue` | `(value: string)` | 当颜色发生任何变化时实时触发（拖拽、输入、点击预设）。 |
| `change` | `(value: string)` | 当颜色选择面板**关闭**时触发。通常用于提交最终选择结果。 |

---

## 5. 使用指南

### 基础使用

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DpColorPicker } from 'dp-color-picker';
import 'dp-color-picker/dist/dp-color-picker.css'; // 引入样式

const color = ref('#4096ff');

const handleChange = (val: string) => {
  console.log('最终选择颜色:', val);
};
</script>

<template>
  <DpColorPicker 
    v-model="color" 
    @change="handleChange"
  />
</template>
```

### 高级配置

启用 RGB 格式输出并自定义最近使用记录数量：

```vue
<DpColorPicker 
  v-model="color"
  format="RGB"
  :enable-alpha="true"
  :enable-recent-colors="true"
  :max-count="15"
/>
```

### 常见问题

**Q: 渐变色字符串无法解析？**
A: 组件目前主要支持标准的 CSS `linear-gradient` 格式。请确保传入的字符串格式规范，例如 `linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)`。

**Q: 如何禁用最近使用颜色？**
A: 设置 `:enable-recent-colors="false"` 即可隐藏该区域并停止记录。

---

### 扩展接口
组件导出了内部工具函数，可供二次开发使用：
```typescript
import { 
  rgb2hex, 
  hsv2rgb, 
  parseGradient, 
  formatGradient 
} from 'dp-color-picker';
```
