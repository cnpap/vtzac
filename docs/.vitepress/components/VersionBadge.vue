<template>
  <a 
    href="https://www.npmjs.com/package/vtzac" 
    target="_blank" 
    rel="noopener noreferrer"
    class="version-badge"
  >
    <img 
      src="https://img.shields.io/npm/v/vtzac.svg?style=flat-square&color=orange&label=version" 
      alt="npm version"
      class="version-img"
    />
  </a>
</template>

<script setup lang="ts">
// 版本徽章组件，显示当前 npm 包版本
</script>

<style scoped>
.version-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 12px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.version-badge:hover {
  opacity: 0.8;
}

.version-img {
  height: 20px;
  border-radius: 3px;
}

/* 适配暗色主题 */
.dark .version-img {
  filter: brightness(0.9);
}
</style>