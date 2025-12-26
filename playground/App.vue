<script setup lang="ts">
import { ref } from 'vue';
import DpColorPicker from '../src/index.vue';

// 1. Basic Solid
const colorSolid = ref('#1976D2');

// 2. Basic Gradient
const colorGradient = ref('linear-gradient(90deg, #FF0000 0%, #00FF00 100%)');

// 3. Alpha Disabled
const colorNoAlpha = ref('#FF5722');

// 4. RGB Format
const colorRgb = ref('rgba(0, 150, 136, 1)');

// 5. Custom Swatches
const colorCustomSwatches = ref('#9C27B0');
const mySwatches = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];

// 6. No Recent Colors
const colorNoRecent = ref('#607D8B');

// Event Log
const eventLogs = ref<string[]>([]);
const handleEvent = (type: string, val: string) => {
  const log = `[${new Date().toLocaleTimeString()}] ${type}: ${val}`;
  eventLogs.value.unshift(log);
  if (eventLogs.value.length > 5) eventLogs.value.pop();
};
</script>

<template>
  <div class="playground">
    <header>
      <h1>DpColorPicker Playground</h1>
      <p>DpColorPicker 组件演示(渐变模式下双击添加点位，右击删除点位)</p>
    </header>

    <div class="grid">
      <!-- 1. Basic Solid -->
      <div class="card">
        <h3>1. Basic Solid Color</h3>
        <p class="desc">Default configuration with HEX color.</p>
        <div class="demo-box">
          <DpColorPicker
            v-model="colorSolid"
            @change="(v: any) => handleEvent('change (solid)', v)"
          />
        </div>
        <div class="value-display">Value: {{ colorSolid }}</div>
      </div>

      <!-- 2. Gradient -->
      <div class="card">
        <h3>2. Gradient Mode</h3>
        <p class="desc">Supports linear-gradient strings.</p>
        <div class="demo-box">
          <DpColorPicker
            v-model="colorGradient"
            @change="(v: any) => handleEvent('change (gradient)', v)"
          />
        </div>
        <div class="value-display">Value: {{ colorGradient }}</div>
      </div>

      <!-- 3. No Alpha -->
      <div class="card">
        <h3>3. Alpha Disabled</h3>
        <p class="desc"><code>:enableAlpha="false"</code></p>
        <div class="demo-box">
          <DpColorPicker
            v-model="colorNoAlpha"
            :enableAlpha="false"
            @change="(v: any) => handleEvent('change (no-alpha)', v)"
          />
        </div>
        <div class="value-display">Value: {{ colorNoAlpha }}</div>
      </div>

      <!-- 4. RGB Format -->
      <div class="card">
        <h3>4. RGB Format</h3>
        <p class="desc"><code>format="RGB"</code></p>
        <div class="demo-box">
          <DpColorPicker
            v-model="colorRgb"
            format="RGB"
            @change="(v: any) => handleEvent('change (rgb)', v)"
          />
        </div>
        <div class="value-display">Value: {{ colorRgb }}</div>
      </div>

      <!-- 5. Custom Swatches -->
      <div class="card">
        <h3>5. Custom Swatches</h3>
        <p class="desc">Custom <code>swatchColors</code> prop.</p>
        <div class="demo-box">
          <DpColorPicker
            v-model="colorCustomSwatches"
            :swatchColors="mySwatches"
            @change="(v: any) => handleEvent('change (custom-swatch)', v)"
          />
        </div>
        <div class="value-display">Value: {{ colorCustomSwatches }}</div>
      </div>

      <!-- 6. No Recent Colors -->
      <div class="card">
        <h3>6. No Recent Colors</h3>
        <p class="desc"><code>:enableRecentColors="false"</code></p>
        <div class="demo-box">
          <DpColorPicker
            v-model="colorNoRecent"
            :enableRecentColors="false"
            @change="(v: any) => handleEvent('change (no-recent)', v)"
          />
        </div>
        <div class="value-display">Value: {{ colorNoRecent }}</div>
      </div>
    </div>

    <!-- Event Logs -->
    <div class="logs-section">
      <h3>Event Logs</h3>
      <div class="logs-container">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-item">{{ log }}</div>
        <div v-if="eventLogs.length === 0" class="no-logs">
          Interact with pickers to see events...
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.playground {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;

  header {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      margin: 0 0 10px;
      font-size: 2.5rem;
      color: #007fff;
    }

    p {
      color: #a9a9a9;
      font-size: 1.1rem;
    }
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.card {
  background: #000000;
  border-radius: 12px;
  padding: 24px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  // border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;

  h3 {
    margin: 0 0 8px;
    font-size: 1.1rem;
    color: #568fc7;
  }

  .desc {
    margin: 0 0 20px;
    font-size: 0.9rem;
    color: #bdbbbb;

    code {
      background: #181818;
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      color: #e83e8c;
    }
  }

  .demo-box {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 45px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .value-display {
    font-family: monospace;
    font-size: 0.85rem;
    background: #282c34;
    color: #abb2bf;
    padding: 10px;
    border-radius: 6px;
    word-break: break-all;
  }
}

.logs-section {
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #3f3d3d;

  h3 {
    margin-top: 0;
  }

  .logs-container {
    background: #1e1e1e;
    color: #fff;
    padding: 16px;
    border-radius: 8px;
    height: 150px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 0.9rem;

    .log-item {
      margin-bottom: 4px;
      border-bottom: 1px solid #333;
      padding-bottom: 4px;

      &:last-child {
        border-bottom: none;
      }
    }

    .no-logs {
      color: #666;
      font-style: italic;
    }
  }
}
</style>
