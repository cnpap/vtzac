<script setup lang="ts">
defineProps<{ desc?: string, twoCol?: boolean, theme?: 'light' | 'dark' | 'auto' }>()
</script>

<template>
  <section class="example-card" :class="[theme]">
    <header class="example-card__header">
      <div class="example-card__title">
        <slot name="title">
          <span class="default-title">Example</span>
        </slot>
      </div>
      <div v-if="desc" class="example-card__desc">
        {{ desc }}
      </div>
    </header>

    <div class="example-card__grid" :class="{ 'two-col': twoCol }">
      <div class="example-card__col">
        <slot name="left" />
      </div>
      <div v-if="$slots.right" class="example-card__col">
        <slot name="right" />
      </div>
    </div>

    <footer v-if="$slots.footer" class="example-card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.example-card {
  position: relative;
  width: 100%;
  border: 1px solid rgba(22, 119, 255, 0.08);
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.7) 100%
  );
  backdrop-filter: blur(10px);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(22, 119, 255, 0.04);
  box-sizing: border-box; /* include border in width to avoid overflow */
  max-width: 100%;
  overflow: hidden; /* prevent inner elements from pushing outside */
  background-clip: padding-box; /* keep frosted effect inside border */
}

.dark .example-card {
  background: linear-gradient(
    135deg,
    rgba(24, 24, 27, 0.72) 0%,
    rgba(24, 24, 27, 0.58) 100%
  );
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.35),
    0 4px 14px rgba(0, 0, 0, 0.25);
}

.example-card__header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.example-card__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.example-card__desc {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.example-card__grid {
  display: grid;
  grid-template-columns: 1fr; /* default single column */
  gap: 1px;
  min-width: 0; /* allow grid to shrink within card */
}

.example-card__grid.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* horizontal two columns */
  position: relative; /* enable pseudo-element divider positioning */
}

/* vertical divider between two columns, matching header bottom border color */
.example-card__grid.two-col::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  border-left: 1px solid var(--vp-c-divider);
  pointer-events: none;
}

.example-card__col {
  min-width: 0; /* allow content to shrink within grid column */
  display: block;
}

.example-card__col > :deep(pre.shiki) {
  margin-top: 0;
  margin-bottom: 0; /* remove vertical margins */
  max-width: 100%;
  overflow: hidden; /* hide scrollbars */
  display: block;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
}

/* ensure code lines wrap to avoid horizontal scrolling */
.example-card__col > :deep(pre.shiki code) {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.example-card__footer {
  margin-top: 14px;
}

/* responsive fallback to single column on narrow screens */
@media (max-width: 800px) {
  .example-card__grid.two-col {
    grid-template-columns: 1fr;
  }
  .example-card__grid.two-col::before {
    content: none; /* hide divider on single column layout */
  }
}
</style>
