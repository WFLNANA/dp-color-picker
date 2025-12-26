<!--
 * @Author       : Trae AI
 * @description  : Playground for DpColorPicker
 * @Date         : 2025-12-26
-->
<script setup lang="ts">
import { ref } from 'vue';
import DpColorPicker from '../src/index.vue';

const color = ref('#1976D2');
const gradientColor = ref('linear-gradient(90deg, #FF0000 0%, #00FF00 100%)');

const handleChange = (val: string) => {
  console.log('Color changed:', val);
};
</script>

<template>
  <div class="playground">
    <h1>DpColorPicker Playground</h1>
    
    <div class="section">
      <h2>Solid Color</h2>
      <DpColorPicker v-model="color" @change="handleChange" />
      <p>Value: {{ color }}</p>
    </div>

    <div class="section">
      <h2>Gradient</h2>
      <DpColorPicker v-model="gradientColor" @change="handleChange" />
      <p>Value: {{ gradientColor }}</p>
    </div>
  </div>
</template>

<style scoped>
.playground {
  padding: 20px;
  font-family: sans-serif;
}

.section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
