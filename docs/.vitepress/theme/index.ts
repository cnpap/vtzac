import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import ExampleCard from './ExampleCard.vue'
import VersionBadge from './VersionBadge.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'nav-bar-content-after': () => h(VersionBadge),
    })
  },
  enhanceApp(options) {
    const { app } = options
    app.component('ExampleCard', ExampleCard)
    app.component('VersionBadge', VersionBadge)
  },
} satisfies Theme
