<!--
 * @Author       : wfl
 * @LastEditors  : wfl
 * @description  : 单选框组组件
 * @updateInfo   :
 * @Date         : 2025-12-25 15:34:51
 * @LastEditTime : 2025-12-26 13:56:49
-->

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { hsv2rgb, rgb2hex, parseColor } from './utils';
import Panel from './Panel.vue';

defineOptions({ name: 'IkColorPicker' });

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
    default: () => [
      // System default colors
      '#F44336',
      '#E91E63',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#2196F3',
      '#03A9F4',
      '#00BCD4',
      '#009688',
      '#4CAF50',
      '#8BC34A',
      '#CDDC39',
      '#FFEB3B',
      '#FFC107',
      '#FF9800',
      '#FF5722',
      '#795548',
      '#9E9E9E',
      '#607D8B',
      '#000000',
    ],
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
  clearable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'palette-change', 'clear']);

// State
const isShow = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<InstanceType<typeof Panel> | null>(null);

// Helper to get current color string for trigger display
const getCurrentColorString = () => {
  const val = props.modelValue;
  if (val === '') return 'transparent';
  if (!val) return props.defaultColor;
  return val;
};

const getCurrentHex = () => {
  const val = props.modelValue;
  if (!val) return '';
  if (val.includes('gradient')) return '';

  const parsed = parseColor(val);
  const { h, s, v, a } = parsed;
  const rgb = hsv2rgb(h, s, v);
  return rgb2hex(rgb.r, rgb.g, rgb.b, props.enableAlpha ? a : undefined);
};

// --- Popup Logic ---
const togglePanel = () => {
  isShow.value = !isShow.value;
};

const closePanel = (e: MouseEvent) => {
  if (
    isShow.value &&
    triggerRef.value &&
    !triggerRef.value.contains(e.target as Node) &&
    panelRef.value &&
    panelRef.value.$el &&
    !panelRef.value.$el.contains(e.target as Node)
  ) {
    // Only save when panel is closed
    if (panelRef.value) {
      panelRef.value.addRecentColor();
    }
    // Emit change event only when closing panel to confirm selection
    emit('change', props.modelValue);
    isShow.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closePanel);
});

onUnmounted(() => {
  document.removeEventListener('click', closePanel);
});

const handleUpdateModelValue = (val: string) => {
  emit('update:modelValue', val);
};

const handleClear = (e: MouseEvent) => {
  e.stopPropagation();
  emit('update:modelValue', '');
  emit('change', '');
  emit('clear');
};
</script>

<template>
  <div class="ik-color-picker">
    <!-- Trigger -->
    <div class="ik-color-picker__trigger" ref="triggerRef" @click="togglePanel">
      <div class="ik-color-picker__trigger--inner">
        <span class="color-block" :style="{ background: getCurrentColorString() }">
          {{ modelValue }}
        </span>
        <span class="color-text" v-if="!modelValue?.includes('gradient')">{{
          getCurrentHex()
        }}</span>
        <span class="color-text" v-else></span>
      </div>
      <div v-if="clearable && modelValue" class="ik-color-picker__clear" @click="handleClear">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </div>
    </div>

    <!-- Panel -->
    <Panel
      v-if="isShow"
      ref="panelRef"
      :modelValue="modelValue"
      :defaultColor="defaultColor"
      :enableAlpha="enableAlpha"
      :format="format"
      :swatchColors="swatchColors"
      :recentColors="recentColors"
      :maxCount="maxCount"
      :enableRecentColors="enableRecentColors"
      @update:modelValue="handleUpdateModelValue"
    />
  </div>
</template>

<style lang="scss" scoped>
.ik-color-picker {
  position: relative;
  display: inline-block;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
  color: #e0e0e0;
  /* Dark mode text */
  width: 100%;

  &__trigger {
    border: 1px solid #444;
    /* Dark mode border */
    border-radius: 3px;
    cursor: pointer;
    background: #2b2b2b;
    /* Dark mode bg */
    transition: all 0.2s;
    height: 32px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:hover {
      border-color: #0052d9;
    }

    &--inner {
      display: flex;
      align-items: center;
      height: 100%;
      flex: 1;
      overflow: hidden;
    }

    .color-block {
      width: 100%;
      height: 100%;
      border-radius: 2px;
      border: 1px solid #555;
      /* Dark mode border */
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .color-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #ccc;
      /* Light text */
    }

    .arrow-icon {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid #999;
      margin-left: 6px;
      transition: transform 0.2s;

      &.open {
        transform: rotate(180deg);
      }
    }
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    padding: 2px;
    border-radius: 50%;
    transition: all 0.2s;
    position: absolute;
    right: 4px;
    background: rgb(0 0 0 / 42%);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }

  // Panel positioning is handled by absolute positioning in CSS,
  // but since Panel is now a child component, we might need to adjust styles slightly
  // or ensure Panel component has correct root styles.
  // The Panel component has .ik-color-picker__panel class which has absolute positioning styles removed
  // because it's now wrapped. Wait, in original it was absolute.
  // We need to make sure the Panel component is positioned correctly.

  :deep(.ik-color-picker__panel) {
    position: absolute;
    left: 0;
    top: 34px;
    margin-top: 4px;
  }
}
</style>
