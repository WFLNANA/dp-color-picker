<!--
 * @Author       : wfl
 * @LastEditors  : wfl
 * @description  : Color Picker Panel Component
 * @updateInfo   : Extracted from index.vue
 * @Date         : 2025-12-26 15:30:00
 * @LastEditTime : 2025-12-26 11:52:54
-->

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import {
  hsv2rgb,
  rgb2hsv,
  rgb2hex,
  parseColor,
  parseGradient,
  formatGradient,
  type HSVA,
  type RGB,
  type GradientColor,
  type GradientStop,
} from './utils';

defineOptions({ name: 'IkColorPickerPanel' });

const props = defineProps({
  modelValue: {
    type: String,
    default: '#000000',
  },
  defaultColor: {
    type: String,
    default: '#000000',
  },
  enableAlpha: {
    type: Boolean,
    default: true,
  },
  format: {
    type: String,
    default: 'HEX', // HEX, RGB
    validator: (val: string) => ['HEX', 'RGB'].includes(val),
  },
  swatchColors: {
    type: Array as () => string[],
    default: () => [],
  },
  recentColors: {
    type: Array as () => string[],
    default: () => [],
  },
  maxCount: {
    type: Number,
    default: 10,
    validator: (val: number) => val > 0 && val <= 20,
  },
  enableRecentColors: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'close']);

// State
const isDragging = ref(false);

// Recent Colors State
interface RecentColorItem {
  color: string;
  timestamp: number;
}
const recentColorsList = ref<RecentColorItem[]>([]);
const STORAGE_KEY = 'dp-color-picker-recent-colors';

// Load recent colors
onMounted(() => {
  if (props.enableRecentColors) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        recentColorsList.value = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load recent colors', e);
    }
  }
});

// Save to storage (Immediate, no debounce)
const saveRecentColors = () => {
  if (!props.enableRecentColors) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentColorsList.value));
  } catch (e) {
    console.warn('Failed to save recent colors', e);
  }
};

const addRecentColor = () => {
  if (!props.enableRecentColors) return;
  const colorStr = getCurrentColorString();

  // Deduplicate
  const index = recentColorsList.value.findIndex((item) => item.color === colorStr);
  if (index !== -1) {
    recentColorsList.value.splice(index, 1);
  }

  recentColorsList.value.unshift({
    color: colorStr,
    timestamp: Date.now(),
  });

  if (recentColorsList.value.length > props.maxCount) {
    recentColorsList.value.length = props.maxCount;
  }

  saveRecentColors();
};

// Expose addRecentColor to parent if needed, or handle it internally on close
defineExpose({
  addRecentColor,
});

const clearRecentColors = () => {
  recentColorsList.value = [];
  localStorage.removeItem(STORAGE_KEY);
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

// Mode: 'solid' | 'gradient'
const mode = ref<'solid' | 'gradient'>('solid');

// Solid Color State (HSVA)
const color = ref<HSVA>({ h: 0, s: 1, v: 1, a: 1 });

// Gradient State
const gradient = ref<GradientColor>({
  type: 'linear',
  degree: 90,
  stops: [
    { color: '#ffffff', percent: 0, id: 'start' },
    { color: '#000000', percent: 100, id: 'end' },
  ],
});
const selectedStopId = ref<string>('');

// Format State
const inputFormat = ref<'HEX' | 'RGBA' | 'CSS'>('HEX'); // Controlled by dropdown

// Helper to get current color string based on format
const getCurrentColorString = () => {
  if (mode.value === 'gradient') {
    return formatGradient(gradient.value);
  }
  const { h, s, v, a } = color.value;
  const rgb = hsv2rgb(h, s, v);
  if (props.enableAlpha || props.format === 'RGB') {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(a.toFixed(2))})`;
  }
  return rgb2hex(rgb.r, rgb.g, rgb.b); // HEX default (no alpha)
};

const getCurrentHex = () => {
  const { h, s, v, a } = color.value;
  const rgb = hsv2rgb(h, s, v);
  return rgb2hex(rgb.r, rgb.g, rgb.b, props.enableAlpha ? a : undefined);
};

const getCurrentSolidColor = () => {
  const { h, s, v, a } = color.value;
  const rgb = hsv2rgb(h, s, v);
  if (props.enableAlpha || props.format === 'RGB') {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(a.toFixed(2))})`;
  }
  return rgb2hex(rgb.r, rgb.g, rgb.b);
};

// Initialize color from props
watch(
  () => props.modelValue,
  (val) => {
    if (isDragging.value) return; // Prevent external update during dragging
    if (val) {
      if (val.includes('gradient')) {
        mode.value = 'gradient';
        const parsed = parseGradient(val);
        if (parsed) {
          gradient.value = parsed;
          // Select first stop by default if none selected
          if (!selectedStopId.value && gradient.value.stops.length > 0) {
            const firstStop = gradient.value.stops[0];
            if (firstStop) {
              selectedStopId.value = firstStop.id;
              // Sync main color picker to selected stop
              color.value = parseColor(firstStop.color);
            }
          }
        }
      } else {
        mode.value = 'solid';
        color.value = parseColor(val);
      }
    } else {
      color.value = parseColor(props.defaultColor);
    }
  },
  { immediate: true },
);

// Update Model Value
const updateModel = () => {
  let output = '';
  if (mode.value === 'gradient') {
    output = formatGradient(gradient.value);
  } else {
    const val = getCurrentHex();
    output = val;
    if (props.format === 'RGB' || inputFormat.value === 'RGBA') {
      const { h, s, v, a } = color.value;
      const rgb = hsv2rgb(h, s, v);
      output = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(a.toFixed(2))})`;
    } else {
      output = rgb2hex(
        hsv2rgb(color.value.h, color.value.s, color.value.v).r,
        hsv2rgb(color.value.h, color.value.s, color.value.v).g,
        hsv2rgb(color.value.h, color.value.s, color.value.v).b,
        color.value.a,
      );
    }
  }
  emit('update:modelValue', output);
  // Remove real-time change event
  // emit('change', output);
};

// --- Interactions ---

// Sync Gradient Stop Color
const updateGradientStopColor = () => {
  if (mode.value !== 'gradient' || !selectedStopId.value) return;

  // Get current color from picker
  const { h, s, v, a } = color.value;
  const rgb = hsv2rgb(h, s, v);
  // Use rgba for gradients to support alpha
  const colorStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(a.toFixed(2))})`;

  const stopIndex = gradient.value.stops.findIndex((s) => s.id === selectedStopId.value);
  if (stopIndex !== -1) {
    const stop = gradient.value.stops[stopIndex];
    if (stop) {
      stop.color = colorStr;
      updateModel();
    }
  }
};

// 1. Saturation/Value Panel
const svPanelRef = ref<HTMLElement | null>(null);
const handleSvDown = (e: MouseEvent) => {
  e.preventDefault();
  if (!svPanelRef.value) return;
  const rect = svPanelRef.value.getBoundingClientRect();
  let rafId: number | null = null;
  isDragging.value = true;

  const onMove = (me: MouseEvent) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      let x = me.clientX - rect.left;
      let y = me.clientY - rect.top;

      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      color.value.s = x / rect.width;
      color.value.v = 1 - y / rect.height;

      if (mode.value === 'gradient') {
        updateGradientStopColor();
      } else {
        updateModel();
      }
      rafId = null;
    });
  };

  const onUp = () => {
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    isDragging.value = false;
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  onMove(e);
};

// 2. Hue Slider
const hueSliderRef = ref<HTMLElement | null>(null);
const handleHueDown = (e: MouseEvent) => {
  e.preventDefault();
  if (!hueSliderRef.value) return;
  const rect = hueSliderRef.value.getBoundingClientRect();
  let rafId: number | null = null;
  isDragging.value = true;

  const onMove = (me: MouseEvent) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      let x = me.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      color.value.h = (x / rect.width) * 360;

      if (mode.value === 'gradient') {
        updateGradientStopColor();
      } else {
        updateModel();
      }
      rafId = null;
    });
  };

  const onUp = () => {
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    isDragging.value = false;
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  onMove(e);
};

// 3. Alpha Slider
const alphaSliderRef = ref<HTMLElement | null>(null);
const handleAlphaDown = (e: MouseEvent) => {
  e.preventDefault();
  if (!alphaSliderRef.value) return;
  const rect = alphaSliderRef.value.getBoundingClientRect();
  let rafId: number | null = null;
  isDragging.value = true;

  const onMove = (me: MouseEvent) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      let x = me.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      color.value.a = parseFloat((x / rect.width).toFixed(2));

      if (mode.value === 'gradient') {
        updateGradientStopColor();
      } else {
        updateModel();
      }
      rafId = null;
    });
  };

  const onUp = () => {
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    isDragging.value = false;
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  onMove(e);
};

// 4. Gradient Bar
const gradientBarRef = ref<HTMLElement | null>(null);

// 4.1 Gradient Angle Slider
const gradientAngleSliderRef = ref<HTMLElement | null>(null);
const handleGradientAngleDown = (e: MouseEvent) => {
  e.preventDefault();
  if (!gradientAngleSliderRef.value) return;
  const rect = gradientAngleSliderRef.value.getBoundingClientRect();
  let rafId: number | null = null;
  isDragging.value = true;

  const onMove = (me: MouseEvent) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      let x = me.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      // Map 0-width to 0-360
      gradient.value.degree = Math.round((x / rect.width) * 360);
      updateModel();
      rafId = null;
    });
  };

  const onUp = () => {
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    isDragging.value = false;
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  onMove(e);
};

const handleGradientBarDblClick = (e: MouseEvent) => {
  if (!gradientBarRef.value) return;
  const rect = gradientBarRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

  const newStop: GradientStop = {
    color: getCurrentSolidColor(),
    percent: Number(percent.toFixed(2)),
    id: Math.random().toString(36).substr(2, 9),
  };
  gradient.value.stops.push(newStop);
  selectedStopId.value = newStop.id;
  updateModel();
};

const handleStopDown = (e: MouseEvent, stop: GradientStop) => {
  e.stopPropagation(); // Prevent bar click
  if (e.button === 2) {
    // Right click handled by contextmenu
    return;
  }
  selectedStopId.value = stop.id;
  // Sync picker to this stop's color
  color.value = parseColor(stop.color);

  // Start dragging
  if (!gradientBarRef.value) return;
  const rect = gradientBarRef.value.getBoundingClientRect();
  let rafId: number | null = null;
  isDragging.value = true;

  const onMove = (me: MouseEvent) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const x = me.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      stop.percent = Number(percent.toFixed(2));
      updateModel();
      rafId = null;
    });
  };

  const onUp = () => {
    if (rafId) cancelAnimationFrame(rafId);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    isDragging.value = false;
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
};

const deleteStop = (index: number) => {
  if (gradient.value.stops.length <= 2) return; // Minimum 2 stops
  gradient.value.stops.splice(index, 1);
  const currentStop = gradient.value.stops[index];
  const firstStop = gradient.value.stops[0];

  if (selectedStopId.value === currentStop?.id) {
    selectedStopId.value = firstStop?.id || '';
  } else if (!gradient.value.stops.find((s) => s.id === selectedStopId.value)) {
    selectedStopId.value = firstStop?.id || '';
  }
  updateModel();
};

// --- Inputs ---
const cssInput = computed({
  get: () => {
    if (mode.value === 'gradient') {
      return formatGradient(gradient.value);
    }
    return getCurrentColorString();
  },
  set: (val) => {
    // Simple readonly for now or try parse
    if (val.includes('gradient')) {
      const parsed = parseGradient(val);
      if (parsed) {
        mode.value = 'gradient';
        gradient.value = parsed;
        updateModel();
      }
    } else {
      const parsed = parseColor(val);
      if (parsed) {
        mode.value = 'solid';
        color.value = parsed;
        updateModel();
      }
    }
  },
});

const hexInput = computed({
  get: () => getCurrentHex(),
  set: (val) => {
    const parsed = parseColor(val);
    if (parsed) {
      color.value = parsed;
      if (mode.value === 'gradient') updateGradientStopColor();
      else updateModel();
    }
  },
});

const rgbInput = computed(() => {
  const { h, s, v } = color.value;
  return hsv2rgb(h, s, v);
});

const updateRgb = (key: keyof RGB, val: string) => {
  let num = parseInt(val);
  if (isNaN(num)) num = 0;
  num = Math.max(0, Math.min(255, num));
  const current = hsv2rgb(color.value.h, color.value.s, color.value.v);
  const newRgb = { ...current, [key]: num };
  const hsv = rgb2hsv(newRgb.r, newRgb.g, newRgb.b);
  color.value = { ...hsv, a: color.value.a };
  if (mode.value === 'gradient') updateGradientStopColor();
  else updateModel();
};

const alphaPercentage = computed({
  get: () => Math.round(color.value.a * 100),
  set: (val) => {
    color.value.a = Math.max(0, Math.min(100, val)) / 100;
    if (mode.value === 'gradient') updateGradientStopColor();
    else updateModel();
  },
});

// --- Computed Styles ---
const hueColorStyle = computed(() => {
  return `hsl(${color.value.h}, 100%, 50%)`;
});

const alphaGradientStyle = computed(() => {
  const { r, g, b } = hsv2rgb(color.value.h, color.value.s, color.value.v);
  return `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`;
});

const gradientBarStyle = computed(() => {
  return {
    background: formatGradient({ ...gradient.value, degree: 90 }), // Display horizontally in bar
  };
});

const selectSwatch = (c: string, fromRecent = false) => {
  if (c.includes('gradient')) {
    mode.value = 'gradient';
    const parsed = parseGradient(c);
    if (parsed) {
      gradient.value = parsed;
      // Select first stop
      if (gradient.value.stops.length > 0) {
        const firstStop = gradient.value.stops[0];
        if (firstStop) {
          selectedStopId.value = firstStop.id;
          color.value = parseColor(firstStop.color);
        }
      }
      updateModel();
    }
    return;
  }

  if (fromRecent) {
    mode.value = 'solid';
    const parsed = parseColor(c);
    color.value = parsed;
    updateModel();
    return;
  }

  if (mode.value === 'gradient') {
    // In gradient mode, picking a swatch changes the selected stop color
    const parsed = parseColor(c);
    color.value = parsed;
    updateGradientStopColor();
  } else {
    const parsed = parseColor(c);
    color.value = parsed;
    updateModel();
  }
};

const handleModeChange = (newMode: 'solid' | 'gradient') => {
  mode.value = newMode;
  // When switching, we might want to convert current color
  // But for now, just keep state separate or use default
  if (newMode === 'gradient') {
    if (!gradient.value.stops.length) {
      gradient.value.stops = [
        { color: getCurrentSolidColor(), percent: 0, id: '1' },
        { color: '#ffffff', percent: 100, id: '2' },
      ];
      selectedStopId.value = '1';
    }
    // Force update to gradient string
    updateModel();
  } else {
    // Switch to solid: maybe pick the first stop's color or keep current
    updateModel();
  }
};
</script>

<template>
  <div class="ik-color-picker__panel" ref="panelRef">
    <!-- Tabs -->
    <div class="ik-color-picker__tabs">
      <div
        class="tab-item"
        :class="{ active: mode === 'solid' }"
        @click="handleModeChange('solid')"
      >
        单色
      </div>
      <div
        class="tab-item"
        :class="{ active: mode === 'gradient' }"
        @click="handleModeChange('gradient')"
      >
        渐变
      </div>
    </div>

    <!-- Gradient Bar (Visible only in Gradient Mode) -->
    <div v-if="mode === 'gradient'" class="ik-color-picker__gradient-tools">
      <!-- Gradient Type Selector -->
      <div class="gradient-type-row">
        <select v-model="gradient.type" class="gradient-type-select" @change="updateModel">
          <option value="linear">线性渐变</option>
          <option value="radial">径向渐变</option>
        </select>
      </div>

      <!-- Angle Slider -->
      <div class="gradient-angle-slider-wrapper" v-if="gradient.type === 'linear'">
        <div class="angle-label start">0°</div>
        <div
          class="gradient-angle-slider"
          ref="gradientAngleSliderRef"
          @mousedown="handleGradientAngleDown"
        >
          <div class="slider-thumb" :style="{ left: `${(gradient.degree / 360) * 100}%` }"></div>
        </div>
        <div class="angle-label end">360°</div>
        <div class="current-angle">{{ gradient.degree }}°</div>
      </div>

      <div class="gradient-bar-wrapper">
        <div
          class="gradient-bar"
          ref="gradientBarRef"
          :style="gradientBarStyle"
          @dblclick="handleGradientBarDblClick"
        >
          <div
            v-for="(stop, index) in gradient.stops"
            :key="stop.id"
            class="gradient-stop"
            :class="{ selected: selectedStopId === stop.id }"
            :style="{ left: `${stop.percent}%`, background: stop.color }"
            @mousedown="(e) => handleStopDown(e, stop)"
            @contextmenu.prevent="deleteStop(index)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Saturation/Value Panel -->
    <div
      class="ik-color-picker__saturation"
      ref="svPanelRef"
      @mousedown="handleSvDown"
      :style="{ background: hueColorStyle }"
    >
      <div class="ik-color-picker__saturation--white"></div>
      <div class="ik-color-picker__saturation--black"></div>
      <div
        class="ik-color-picker__saturation--cursor"
        :style="{
          left: `${color.s * 100}%`,
          top: `${(1 - color.v) * 100}%`,
        }"
      ></div>
    </div>

    <!-- Sliders Row -->
    <div class="ik-color-picker__sliders-row">
      <div class="sliders-col">
        <!-- Hue Slider -->
        <div
          class="ik-color-picker__slider hue-slider"
          ref="hueSliderRef"
          @mousedown="handleHueDown"
        >
          <div class="slider-thumb" :style="{ left: `${(color.h / 360) * 100}%` }"></div>
        </div>
        <!-- Alpha Slider -->
        <div
          class="ik-color-picker__slider alpha-slider"
          v-if="enableAlpha"
          ref="alphaSliderRef"
          @mousedown="handleAlphaDown"
        >
          <div class="alpha-bg"></div>
          <div class="alpha-gradient" :style="{ background: alphaGradientStyle }"></div>
          <div class="slider-thumb" :style="{ left: `${color.a * 100}%` }"></div>
        </div>
      </div>
      <div class="color-preview">
        <div class="preview-block" :style="{ background: getCurrentColorString() }"></div>
      </div>
    </div>

    <!-- Inputs -->
    <div class="ik-color-picker__inputs">
      <div class="input-header">
        <select v-model="inputFormat" class="format-select">
          <option value="HEX">HEX</option>
          <option value="RGBA">{{ enableAlpha ? 'RGBA' : 'RGB' }}</option>
          <option value="CSS">CSS</option>
        </select>
      </div>

      <div class="input-body">
        <!-- HEX Input -->
        <div v-if="inputFormat === 'HEX'" class="input-group hex-input">
          <input type="text" v-model="hexInput" maxlength="9" />
        </div>
        <!-- RGB Inputs -->
        <div v-if="inputFormat === 'RGBA'" class="input-group rgb-inputs">
          <div class="rgb-item">
            <input
              :value="rgbInput.r"
              @input="(e) => updateRgb('r', (e.target as HTMLInputElement).value)"
            />
          </div>
          <div class="rgb-item">
            <input
              :value="rgbInput.g"
              @input="(e) => updateRgb('g', (e.target as HTMLInputElement).value)"
            />
          </div>
          <div class="rgb-item">
            <input
              :value="rgbInput.b"
              @input="(e) => updateRgb('b', (e.target as HTMLInputElement).value)"
            />
          </div>
          <div class="rgb-item" v-if="enableAlpha">
            <input v-model="alphaPercentage" type="number" min="0" max="100" />
          </div>
        </div>
        <!-- CSS Input -->
        <div v-if="inputFormat === 'CSS'" class="input-group css-input">
          <input type="text" v-model="cssInput" readonly />
        </div>
      </div>
    </div>

    <!-- Recent -->
    <div class="ik-color-picker__swatches" v-if="enableRecentColors && recentColorsList.length">
      <div class="swatches-title">
        最近使用颜色
        <span class="clear-recent" @click="clearRecentColors" title="清除最近使用">×</span>
      </div>
      <div class="swatches-list">
        <div
          v-for="item in recentColorsList"
          :key="item.color"
          class="swatch-item"
          :style="{ background: item.color }"
          :title="`${item.color} (${formatTime(item.timestamp)})`"
          @click="selectSwatch(item.color, true)"
        ></div>
      </div>
    </div>

    <!-- Swatches -->
    <div class="ik-color-picker__swatches">
      <div class="swatches-title">系统预设颜色</div>
      <div class="swatches-list">
        <div
          v-for="c in swatchColors"
          :key="c"
          class="swatch-item"
          :style="{ background: c }"
          @click="selectSwatch(c)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ik-color-picker {
  &__panel {
    z-index: 1000;
    background: #2b2b2b;
    /* Dark mode panel bg */
    box-shadow:
      0 3px 14px 2px rgba(0, 0, 0, 0.3),
      0 8px 10px 1px rgba(0, 0, 0, 0.2),
      0 5px 5px -3px rgba(0, 0, 0, 0.4);
    border: 1px solid #444;
    border-radius: 3px;
    padding: 12px;
    width: 280px;
    box-sizing: border-box;
  }

  &__tabs {
    display: flex;
    margin-bottom: 12px;
    border-bottom: 1px solid #444;
    /* Dark mode divider */

    .tab-item {
      padding: 4px 12px;
      cursor: pointer;
      border-radius: 2px 2px 0 0;
      color: #999;

      &.active {
        color: #4096ff;
        /* Active color */
        font-weight: 500;
        background: #3a3a3a;
        /* Active bg */
      }

      &:hover {
        color: #4096ff;
      }
    }
  }

  &__gradient-tools {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
    gap: 8px;

    .gradient-type-row {
      .gradient-type-select {
        width: 100%;
        height: 24px;
        border: 1px solid #444;
        border-radius: 2px;
        font-size: 12px;
        outline: none;
        color: #e0e0e0;
        background: #333;
        cursor: pointer;

        &:focus {
          border-color: #0052d9;
        }
      }
    }

    .gradient-angle-slider-wrapper {
      width: 100%;
      height: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      margin-bottom: 4px;

      .angle-label {
        font-size: 10px;
        color: #999;
        width: 24px;
        text-align: center;
      }

      .current-angle {
        font-size: 10px;
        color: #e0e0e0;
        width: 30px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      .gradient-angle-slider {
        flex: 1;
        height: 4px;
        background: #444;
        border-radius: 2px;
        position: relative;
        cursor: pointer;

        .slider-thumb {
          position: absolute;
          top: 50%;
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        &:hover {
          background: #555;
        }
      }
    }

    .gradient-bar-wrapper {
      width: 100%;
      height: 12px;
      position: relative;
    }

    .gradient-bar {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      position: relative;
      cursor: pointer;
      box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5);
      background-image:
        linear-gradient(45deg, #555 25%, transparent 25%),
        linear-gradient(-45deg, #555 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #555 75%),
        linear-gradient(-45deg, transparent 75%, #555 75%);
      background-size: 6px 6px;

      .gradient-stop {
        position: absolute;
        top: 50%;
        width: 10px;
        height: 10px;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        transform: translate(-50%, -50%);
        cursor: grab;
        background: currentColor;

        &.selected {
          border-color: #0052d9;
          transform: translate(-50%, -50%) scale(1.2);
          z-index: 2;
        }
      }
    }
  }

  &__saturation {
    width: 100%;
    height: 140px;
    position: relative;
    border-radius: 2px;
    overflow: hidden;
    cursor: crosshair;
    margin-bottom: 12px;

    &--white {
      background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    &--black {
      background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    &--cursor {
      position: absolute;
      width: 12px;
      height: 12px;
      border: 1px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  }

  &__sliders-row {
    display: flex;
    margin-bottom: 12px;
    align-items: center;
    gap: 12px;

    .sliders-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .color-preview {
      width: 32px;
      height: 32px;
      border-radius: 2px;
      overflow: hidden;
      background-image:
        linear-gradient(45deg, #555 25%, transparent 25%),
        linear-gradient(-45deg, #555 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #555 75%),
        linear-gradient(-45deg, transparent 75%, #555 75%);
      background-size: 8px 8px;
      background-position:
        0 0,
        0 4px,
        4px -4px,
        -4px 0px;
      border: 1px solid #444;

      .preview-block {
        width: 100%;
        height: 100%;
      }
    }
  }

  &__slider {
    position: relative;
    height: 10px;
    border-radius: 5px;
    cursor: pointer;

    .slider-thumb {
      position: absolute;
      top: 50%;
      width: 12px;
      height: 12px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  }

  .hue-slider {
    background: linear-gradient(
      to right,
      #f00 0%,
      #ff0 17%,
      #0f0 33%,
      #0ff 50%,
      #00f 67%,
      #f0f 83%,
      #f00 100%
    );
  }

  .alpha-slider {
    .alpha-bg {
      position: absolute;
      inset: 0;
      border-radius: 5px;
      background-image:
        linear-gradient(45deg, #555 25%, transparent 25%),
        linear-gradient(-45deg, #555 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #555 75%),
        linear-gradient(-45deg, transparent 75%, #555 75%);
      background-size: 6px 6px;
      background-position:
        0 0,
        0 3px,
        3px -3px,
        -3px 0px;
    }

    .alpha-gradient {
      position: absolute;
      inset: 0;
      border-radius: 5px;
    }
  }

  &__inputs {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;

    .input-header {
      width: 60px;
      flex-shrink: 0;

      .format-select {
        width: 100%;
        height: 24px;
        border: 1px solid #444;
        border-radius: 2px;
        font-size: 12px;
        outline: none;
        color: #e0e0e0;
        background: #333;
        cursor: pointer;

        &:focus {
          border-color: #0052d9;
        }
      }
    }

    .input-body {
      flex: 1;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 4px;

      input {
        width: 100%;
        height: 24px;
        border: 1px solid #444;
        border-radius: 2px;
        padding: 0 4px;
        font-size: 12px;
        outline: none;
        color: #e0e0e0;
        background: #333;
        text-align: center;

        &:focus {
          border-color: #0052d9;
        }
      }
    }

    .rgb-inputs {
      .rgb-item {
        flex: 1;
        min-width: 0;
      }
    }
  }

  &__swatches {
    margin-top: 8px;

    .swatches-title {
      font-size: 12px;
      color: #e0e0e0;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .clear-recent {
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        color: #999;
        font-weight: bold;

        &:hover {
          color: #ff4d4f;
        }
      }
    }

    .swatches-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .swatch-item {
      width: 18px;
      height: 18px;
      border-radius: 2px;
      cursor: pointer;
      border: 1px solid #444;
      position: relative;

      &:hover {
        transform: scale(1.1);
        z-index: 1;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
      }
    }
  }
}
</style>
