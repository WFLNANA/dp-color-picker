<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import DpColorPicker from '../src/index.vue';

// --- Playground State ---
const playgroundColor = ref('#1976D2');
const playgroundConfig = reactive({
  enableAlpha: true,
  format: 'HEX',
  enableRecentColors: true,
  clearable: true,
  overlay: false,
  placement: 'bottom-start',
  defaultColor: '#000000',
  maxCount: 10,
  zIndex: 2000,
  threshold: 20,
  animationDuration: 200,
  useCustomSwatches: false,
  showText: true,
});

const formatOptions = ['HEX', 'RGB'];
const placementOptions = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];

// --- Examples State ---
const gradientColor = ref('linear-gradient(90deg, #FF0000 0%, #00FF00 100%)');
const minimalColor = ref('#FF5722');
const customSwatchesColor = ref('#9C27B0');
const customSwatches = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];

// --- Code Preview ---
const codePreview = computed(() => {
  const props = [];
  props.push(`v-model="playgroundColor"`);
  if (!playgroundConfig.enableAlpha) props.push(`:enableAlpha="false"`);
  if (playgroundConfig.format !== 'HEX') props.push(`format="${playgroundConfig.format}"`);
  if (!playgroundConfig.enableRecentColors) props.push(`:enableRecentColors="false"`);
  if (playgroundConfig.clearable) props.push(`clearable`);
  if (playgroundConfig.overlay) props.push(`overlay`);
  if (playgroundConfig.placement !== 'bottom-start')
    props.push(`placement="${playgroundConfig.placement}"`);
  if (playgroundConfig.defaultColor !== '#000000')
    props.push(`defaultColor="${playgroundConfig.defaultColor}"`);
  if (playgroundConfig.maxCount !== 10) props.push(`:maxCount="${playgroundConfig.maxCount}"`);
  if (playgroundConfig.zIndex !== 2000) props.push(`:zIndex="${playgroundConfig.zIndex}"`);
  if (playgroundConfig.threshold !== 20) props.push(`:threshold="${playgroundConfig.threshold}"`);
  if (playgroundConfig.animationDuration !== 200)
    props.push(`:animationDuration="${playgroundConfig.animationDuration}"`);
  if (!playgroundConfig.showText) props.push(`:showText="false"`);
  if (playgroundConfig.useCustomSwatches) props.push(`:swatchColors="[...] "`); // Abbreviated for preview

  return `<DpColorPicker
  ${props.join('\n  ')}
/>`;
});

const copyCode = () => {
  navigator.clipboard.writeText(codePreview.value);
  // Could add toast here
};
</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <header class="hero">
      <div class="hero-content">
        <h1>DpColorPicker</h1>
        <p class="subtitle">Modern, accessible, and highly customizable color picker for Vue 3.</p>
        <div class="install-cmd">
          <code>npm install dp-color-picker</code>
          <button
            class="copy-btn"
            @click="() => navigator.clipboard.writeText('npm install dp-color-picker')"
          >
            Copy
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Examples Grid -->
      <section class="examples-section">
        <h2>示例</h2>
        <div class="examples-grid">
          <!-- Gradient -->
          <div class="example-card">
            <div class="card-header">
              <h3>渐变色支持</h3>
              <p>原生支持 linear-gradient 格式。</p>
            </div>
            <div class="card-body">
              <DpColorPicker
                v-model="gradientColor"
                @change="(v: any) => handleEvent('gradient-change', v)"
              />
              <div class="mini-value">{{ gradientColor }}</div>
            </div>
          </div>

          <!-- Minimal -->
          <div class="example-card">
            <div class="card-header">
              <h3>极简配置</h3>
              <p>无透明度，无最近使用颜色。</p>
            </div>
            <div class="card-body">
              <DpColorPicker
                v-model="minimalColor"
                :enableAlpha="false"
                :enableRecentColors="false"
                @change="(v: any) => handleEvent('minimal-change', v)"
              />
              <div class="mini-value">{{ minimalColor }}</div>
            </div>
          </div>

          <!-- Custom Swatches -->
          <div class="example-card">
            <div class="card-header">
              <h3>自定义预设颜色</h3>
              <p>传入自定义的色板数组。</p>
            </div>
            <div class="card-body">
              <DpColorPicker
                v-model="customSwatchesColor"
                :swatchColors="customSwatches"
                @change="(v: any) => handleEvent('swatch-change', v)"
              />
              <div class="mini-value">{{ customSwatchesColor }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Playground Section -->
      <section class="playground-section">
        <h2>交互式演示</h2>
        <div class="playground-container">
          <!-- Left: Preview -->
          <div class="preview-panel">
            <div
              class="component-wrapper"
              :style="{ backgroundColor: playgroundConfig.overlay ? '#f5f5f5' : 'transparent' }"
            >
              <DpColorPicker
                v-model="playgroundColor"
                :enableAlpha="playgroundConfig.enableAlpha"
                :format="playgroundConfig.format"
                :enableRecentColors="playgroundConfig.enableRecentColors"
                :clearable="playgroundConfig.clearable"
                :overlay="playgroundConfig.overlay"
                :placement="playgroundConfig.placement"
                :defaultColor="playgroundConfig.defaultColor"
                :maxCount="playgroundConfig.maxCount"
                :zIndex="playgroundConfig.zIndex"
                :threshold="playgroundConfig.threshold"
                :animationDuration="playgroundConfig.animationDuration"
                :swatchColors="playgroundConfig.useCustomSwatches ? customSwatches : undefined"
                :showText="playgroundConfig.showText"
                @change="(v: any) => handleEvent('change', v)"
                @clear="() => handleEvent('clear', '')"
                @palette-change="(v: any) => handleEvent('palette-change', v)"
              />
            </div>
            <div class="value-display">
              <span class="label">当前值:</span>
              <code class="value">{{ playgroundColor }}</code>
            </div>
          </div>

          <!-- Right: Controls -->
          <div class="controls-panel">
            <div class="control-group">
              <h3>代码预览</h3>
              <div class="code-block">
                <pre>{{ codePreview }}</pre>
                <button class="copy-btn-small" @click="copyCode">复制</button>
              </div>
            </div>
            <div class="control-group">
              <h3>配置项</h3>

              <div class="control-item">
                <label>颜色格式 (Format)</label>
                <select v-model="playgroundConfig.format">
                  <option v-for="opt in formatOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <div class="control-item">
                <label>弹出位置 (Placement)</label>
                <select v-model="playgroundConfig.placement">
                  <option v-for="opt in placementOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <div class="control-item">
                <label>默认颜色 (Default Color)</label>
                <div class="input-row">
                  <input type="color" v-model="playgroundConfig.defaultColor" />
                  <input type="text" v-model="playgroundConfig.defaultColor" class="text-input" />
                </div>
              </div>

              <div class="control-item">
                <label>最大最近颜色数 (Max Recent Colors)</label>
                <input
                  type="number"
                  v-model.number="playgroundConfig.maxCount"
                  min="1"
                  max="20"
                  class="number-input"
                />
              </div>

              <div class="control-item">
                <label>翻转阈值 (Flip Threshold px)</label>
                <input
                  type="number"
                  v-model.number="playgroundConfig.threshold"
                  class="number-input"
                />
              </div>

              <div class="control-item">
                <label>动画时长 (Animation Duration ms)</label>
                <input
                  type="number"
                  v-model.number="playgroundConfig.animationDuration"
                  step="50"
                  class="number-input"
                />
              </div>

              <div class="control-item checkbox">
                <label>
                  <input type="checkbox" v-model="playgroundConfig.useCustomSwatches" />
                  使用自定义色板
                </label>
              </div>

              <div class="control-item checkbox">
                <label>
                  <input type="checkbox" v-model="playgroundConfig.showText" />
                  显示色值文本
                </label>
              </div>

              <div class="control-item checkbox">
                <label>
                  <input type="checkbox" v-model="playgroundConfig.enableAlpha" />
                  启用透明度 (Alpha)
                </label>
              </div>

              <div class="control-item checkbox">
                <label>
                  <input type="checkbox" v-model="playgroundConfig.enableRecentColors" />
                  显示最近使用颜色
                </label>
              </div>

              <div class="control-item checkbox">
                <label>
                  <input type="checkbox" v-model="playgroundConfig.clearable" />
                  可清空 (Clearable)
                </label>
              </div>

              <div class="control-item checkbox">
                <label>
                  <input type="checkbox" v-model="playgroundConfig.overlay" />
                  显示遮罩层 (Overlay)
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>DpColorPicker &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
}

.hero {
  background: linear-gradient(135deg, #0052d9 0%, #0033a0 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;

  h1 {
    font-size: 3.5rem;
    margin: 0 0 16px;
    font-weight: 700;
  }

  .subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
    margin: 0 0 32px;
  }

  .install-cmd {
    background: rgba(0, 0, 0, 0.3);
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 8px;
    backdrop-filter: blur(4px);

    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      margin-right: 12px;
      font-size: 1rem;
    }

    .copy-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.main-content {
  max-width: 1200px;
  margin: -40px auto 0;
  padding: 0 20px 60px;
  position: relative;
  z-index: 10;
}

section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
  padding: 32px;
  border: 1px solid #eaeaea;

  h2 {
    margin: 0 0 24px;
    font-size: 1.5rem;
    color: #1a1a1a;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 12px;
  }
}

.playground-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.preview-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 8px;
  padding: 40px;
  border: 1px dashed #ddd;

  .component-wrapper {
    margin-bottom: 32px;
    padding: 20px;
    border-radius: 8px;
    transition: background-color 0.3s;
  }

  .value-display {
    text-align: center;

    .label {
      display: block;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 8px;
    }

    .value {
      background: #f5f5f5;
      padding: 6px 12px;
      border-radius: 4px;
      font-family: monospace;
      color: #0052d9;
      font-weight: 600;
    }
  }
}

.controls-panel {
  .control-group {
    margin-bottom: 24px;

    h3 {
      font-size: 1.1rem;
      margin: 0 0 16px;
      color: #333;
    }
  }

  .control-item {
    margin-bottom: 12px;

    label {
      display: block;
      font-size: 0.9rem;
      color: #555;
      margin-bottom: 4px;
    }

    select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;

      &:focus {
        border-color: #0052d9;
        outline: none;
      }
    }

    .input-row {
      display: flex;
      gap: 8px;
      align-items: center;

      input[type='color'] {
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
      }
    }

    .text-input,
    .number-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;

      &:focus {
        border-color: #0052d9;
        outline: none;
      }
    }

    &.checkbox {
      label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        margin-bottom: 0;
      }

      input[type='checkbox'] {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }
    }
  }

  .code-block {
    position: relative;
    background: #282c34;
    border-radius: 6px;
    padding: 16px;

    pre {
      margin: 0;
      color: #abb2bf;
      font-family: monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      overflow-x: auto;
    }

    .copy-btn-small {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 3px;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.example-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    background: #f9f9f9;
    padding: 16px;
    border-bottom: 1px solid #eee;

    h3 {
      margin: 0 0 4px;
      font-size: 1.1rem;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
      color: #666;
    }
  }

  .card-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    .mini-value {
      font-family: monospace;
      font-size: 0.8rem;
      color: #888;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.logs-section {
  .logs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 12px;

    h2 {
      margin: 0;
      border: none;
      padding: 0;
    }

    button {
      background: none;
      border: 1px solid #ddd;
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;

      &:hover {
        background: #f5f5f5;
        color: #d93025;
        border-color: #d93025;
      }
    }
  }

  .logs-container {
    background: #1e1e1e;
    color: #fff;
    padding: 16px;
    border-radius: 8px;
    height: 200px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 0.9rem;

    .empty-logs {
      color: #666;
      font-style: italic;
      text-align: center;
      margin-top: 80px;
    }

    .log-entry {
      padding: 4px 0;
      border-bottom: 1px solid #333;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.footer {
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 0.9rem;
}
</style>
