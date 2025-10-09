import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import ExampleCard from './ExampleCard.vue'
import './style.css'
import './global.css'
import './styles/card.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp(options) {
    const { app } = options
    app.component('ExampleCard', ExampleCard)
  },
} satisfies Theme
