<!--
 * @Author       : wfl
 * @LastEditors  : wfl
 * @description  : 单选框组组件
 * @updateInfo   :
 * @Date         : 2025-12-25 15:34:51
 * @LastEditTime : 2025-12-26 16:32:30
-->

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
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
  zIndex: {
    type: Number,
    default: 2000,
  },
  placement: {
    type: String,
    default: 'bottom-start', // bottom-start, bottom-end, top-start, top-end
  },
  threshold: {
    type: Number,
    default: 20,
  },
  animationDuration: {
    type: Number,
    default: 200,
  },
  overlay: {
    type: Boolean,
    default: false,
  },
  showText: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'palette-change', 'clear']);

// State
const isShow = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<InstanceType<typeof Panel> | null>(null);
const panelContainerRef = ref<HTMLElement | null>(null);
const panelPosition = ref({ top: 0, left: 0, placement: 'bottom-start', arrowLeft: 0 });

// ResizeObserver for panel size changes
let resizeObserver: ResizeObserver | null = null;

watch(isShow, (val) => {
  if (val) {
    nextTick(() => {
      updatePosition();
      // Setup ResizeObserver to handle panel size changes (e.g. mode switch)
      if (window.ResizeObserver && panelContainerRef.value) {
        resizeObserver = new ResizeObserver(() => {
          updatePosition();
        });
        resizeObserver.observe(panelContainerRef.value);
      }
    });
  } else {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  }
});

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
const updatePosition = () => {
  if (!isShow.value || !triggerRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const panelEl = panelRef.value?.$el as HTMLElement;
  if (!panelEl) return;

  // We need panel dimensions, but if it's hidden (v-if), it might not be rendered yet.
  // Since we use v-if, we call this in nextTick after setting isShow=true.
  const panelWidth = panelEl.offsetWidth || 260; // Approximate fallback
  const panelHeight = panelEl.offsetHeight || 300;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

  let top = 0;
  let left = 0;
  let currentPlacement = props.placement;

  // Mobile check: if width < 576px, center it
  const isMobile = viewportWidth <= 576;

  if (isMobile) {
    // Center logic for mobile
    left = (viewportWidth - panelWidth) / 2 + scrollLeft;
    top = (viewportHeight - panelHeight) / 2 + scrollTop;
    // Ensure positive coords
    if (left < 0) left = 0;
    if (top < 0) top = 0;

    panelPosition.value = {
      top,
      left,
      placement: 'center',
      arrowLeft: 0, // No arrow on mobile center mode usually
    };
    return;
  }

  // Initial calculation based on trigger position
  // Default: bottom-start (aligned left, below trigger)

  // Decide vertical position
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  // Check if we need to flip vertically
  if (
    currentPlacement.startsWith('bottom') &&
    spaceBelow < panelHeight + props.threshold &&
    spaceAbove > panelHeight
  ) {
    currentPlacement = currentPlacement.replace('bottom', 'top');
  } else if (
    currentPlacement.startsWith('top') &&
    spaceAbove < panelHeight + props.threshold &&
    spaceBelow > panelHeight
  ) {
    currentPlacement = currentPlacement.replace('top', 'bottom');
  }

  if (currentPlacement.startsWith('bottom')) {
    top = triggerRect.bottom + scrollTop + 10; // 10px margin for arrow
  } else {
    top = triggerRect.top + scrollTop - panelHeight - 10;
  }

  // Decide horizontal position
  // Default alignment to start (left)
  const spaceRight = viewportWidth - triggerRect.left;
  const spaceLeft = triggerRect.right;

  // Check horizontal flip
  if (currentPlacement.endsWith('start')) {
    // Aligned left
    if (spaceRight < panelWidth + props.threshold && spaceLeft > panelWidth) {
      // Not enough space on right, try align end (right)
      // But 'end' means aligning to the right edge of trigger
      left = triggerRect.right + scrollLeft - panelWidth;
      currentPlacement = currentPlacement.replace('start', 'end');
    } else {
      left = triggerRect.left + scrollLeft;
    }
  } else {
    // Aligned right (end)
    left = triggerRect.right + scrollLeft - panelWidth;
    if (left < props.threshold) {
      // If goes off-screen left, flip to start
      left = triggerRect.left + scrollLeft;
      currentPlacement = currentPlacement.replace('end', 'start');
    }
  }

  // Final viewport boundary check (prevent overflow)
  if (left + panelWidth > viewportWidth + scrollLeft) {
    left = viewportWidth + scrollLeft - panelWidth - props.threshold;
  }
  if (left < scrollLeft) {
    left = scrollLeft + props.threshold;
  }

  // Calculate arrow position
  // Arrow is relative to panel-container
  const triggerCenter = triggerRect.left + scrollLeft + triggerRect.width / 2;
  let arrowLeft = triggerCenter - left;

  // Clamp arrow position to be within panel border radius (approx 12px)
  const arrowLimit = 12;
  if (arrowLeft < arrowLimit) arrowLeft = arrowLimit;
  if (arrowLeft > panelWidth - arrowLimit) arrowLeft = panelWidth - arrowLimit;

  panelPosition.value = { top, left, placement: currentPlacement, arrowLeft };
};

const togglePanel = () => {
  if (isShow.value) {
    // If open, close it properly to save state/emit events
    closePanel();
  } else {
    isShow.value = true;
    // Position update is handled by watch(isShow)
  }
};

const closePanel = () => {
  if (!isShow.value) return;
  isShow.value = false;
  // Since we use @mousedown.stop on trigger and panel container,
  // any mousedown reaching here (document level) must be from outside.
  // We can safely close the panel.

  // Only save when panel is closed
  if (panelRef.value) {
    panelRef.value.addRecentColor();
  }
  // Emit change event only when closing panel to confirm selection
  emit('change', props.modelValue);
};

const handleResize = () => {
  if (isShow.value) {
    updatePosition();
  }
};

onMounted(() => {
  document.addEventListener('mousedown', closePanel); // Changed from click to mousedown for better UX
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleResize, true); // Capture scroll on any element
});

onUnmounted(() => {
  document.removeEventListener('mousedown', closePanel);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize, true);
});

const handleUpdateModelValue = (val: string) => {
  emit('update:modelValue', val);
};

const handleClear = () => {
  // Event propagation stopped by modifier
  emit('update:modelValue', '');
  emit('change', '');
  emit('clear');
};
</script>

<template>
  <div class="ik-color-picker">
    <!-- Trigger -->
    <div class="ik-color-picker__trigger" ref="triggerRef" @mousedown.stop.prevent="togglePanel">
      <div class="ik-color-picker__trigger--inner">
        <span class="color-block" :style="{ background: getCurrentColorString() }">
          <template v-if="showText">{{ modelValue }}</template>
        </span>
        <template v-if="showText">
          <span class="color-text" v-if="!modelValue?.includes('gradient')">{{
            getCurrentHex()
          }}</span>
          <span class="color-text" v-else></span>
        </template>
      </div>
      <div
        v-if="clearable && modelValue"
        class="ik-color-picker__clear"
        @mousedown.stop="handleClear"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </div>
    </div>

    <!-- Panel -->
    <Teleport to="body">
      <!-- Mask Layer -->
      <div
        v-if="overlay && isShow"
        class="ik-color-picker__overlay"
        :style="{ zIndex: zIndex - 1 }"
        @mousedown="closePanel"
      ></div>

      <Transition name="dp-slide-fade">
        <div
          v-if="isShow"
          ref="panelContainerRef"
          class="ik-color-picker__panel-container"
          :class="{ 'is-mobile': panelPosition.placement === 'center' }"
          :style="{
            top: panelPosition.top + 'px',
            left: panelPosition.left + 'px',
            zIndex: zIndex,
            '--animation-duration': animationDuration + 'ms',
          }"
          @mousedown.stop
        >
          <div
            v-if="panelPosition.placement !== 'center'"
            class="ik-color-picker__arrow"
            :class="panelPosition.placement.startsWith('top') ? 'is-bottom' : 'is-top'"
            :style="{ left: panelPosition.arrowLeft + 'px' }"
          ></div>
          <Panel
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
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.ik-color-picker {
  position: relative;
  display: inline-block;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
  color: var(--dp-cp-text-color);
  /* Dark mode text */
  width: 100%;

  &__trigger {
    min-width: 30px;
    /* Dark mode border */
    border-radius: 3px;
    cursor: pointer;
    background: var(--dp-cp-bg-trigger);
    /* Dark mode bg */
    transition: all 0.2s;
    height: 32px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--dp-cp-bg-tab-divider);

    &:hover {
      border-color: var(--dp-cp-primary-color);
      .ik-color-picker__clear {
        display: flex;
      }
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
      color: var(--dp-cp-text-light);
      /* Light text */
    }

    .arrow-icon {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 5px solid var(--dp-cp-text-secondary);
      margin-left: 6px;
      transition: transform 0.2s;

      &.open {
        transform: rotate(180deg);
      }
    }
  }

  &__clear {
    display: none;
    align-items: center;
    justify-content: center;
    color: var(--dp-cp-text-secondary);
    padding: 2px;
    border-radius: 50%;
    transition: all 0.2s;
    position: absolute;
    right: 4px;
    background: var(--dp-cp-bg-clear);

    &:hover {
      background: var(--dp-cp-bg-clear-hover);
      color: var(--dp-cp-text-inverse);
    }
  }

  // Panel positioning is handled by absolute positioning in CSS,
  // but since Panel is now a child component, we might need to adjust styles slightly
  // or ensure Panel component has correct root styles.
  // The Panel component has .ik-color-picker__panel class which has absolute positioning styles removed
  // because it's now wrapped. Wait, in original it was absolute.
  // We need to make sure the Panel component is positioned correctly.

  :deep(.ik-color-picker__panel) {
    /* position: absolute; */
    /* left: 0; */
    /* top: 34px; */
    /* margin-top: 4px; */
  }
}
</style>

<style lang="scss">
@import './styles/variables.css';

/* Global styles for teleported content */
.ik-color-picker__panel-container {
  position: absolute; /* Using absolute but relative to body */
  background: var(--dp-cp-bg-panel);
  border: 1px solid var(--dp-cp-border-color);
  box-shadow: 0 4px 6px var(--dp-cp-shadow-color-base);
  border-radius: 4px;
  /* z-index is set via inline style */
}

.ik-color-picker__overlay {
  position: fixed;
  inset: 0;
  background-color: var(--dp-cp-bg-overlay);
}

.ik-color-picker__arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--dp-cp-bg-panel);
  transform: rotate(45deg);
  border: 1px solid var(--dp-cp-border-color);
  z-index: 1;

  &.is-top {
    top: -6px;
    border-bottom-color: transparent !important;
    border-right-color: transparent !important;
  }

  &.is-bottom {
    bottom: -6px;
    border-top-color: transparent !important;
    border-left-color: transparent !important;
  }
}

/* Transition styles */
.dp-slide-fade-enter-active,
.dp-slide-fade-leave-active {
  transition: all var(--animation-duration, 0.2s) ease;
}

.dp-slide-fade-enter-from,
.dp-slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}
</style>
