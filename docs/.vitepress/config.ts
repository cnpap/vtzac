import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'vtzac',
  description: 'Vite + NestJS Full-Stack Solution',
  lang: 'en-US',

  // Set default to dark mode
  appearance: 'dark',

  // Ignore dead links for local development server
  ignoreDeadLinks: [
    /^http:\/\/localhost:\d+/,
  ],

  // Multi-language support
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'vtzac',
      description: 'Vite + NestJS Full-Stack',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Quick Start', link: '/getting-started' },
              { text: '[Step 1] NestJS Integration', link: '/nestjs-integration' },
              { text: '[Step 2] Vite Plugin Integration', link: '/vite-plugin-integration' },
            ],
          },
          {
            text: 'How It Works',
            items: [
              { text: 'Transformation Logic', link: '/how-it-works' },
            ],
          },
          {
            text: 'Guide',
            items: [
              { text: '[Important] Notes', link: '/guide/notes' },
              { text: 'Configuration', link: '/guide/configuration' },
              { text: 'Troubleshooting', link: '/troubleshooting' },
            ],
          },
          {
            text: 'Use Cases',
            items: [
              { text: 'Parameter Handling', link: '/guide/params-usage' },
              { text: 'File Upload', link: '/guide/file-upload-usage' },
            ],
          },
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/cnpap/vtzac' },
        ],
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'vtzac',
      description: 'Vite + NestJS 全栈',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
        ],
        sidebar: [
          {
            text: '快速开始',
            items: [
              { text: '开始', link: '/zh/getting-started' },
              { text: '【步骤 1】集成 NestJS', link: '/zh/nestjs-integration' },
              { text: '【步骤 2】集成 Vite 插件', link: '/zh/vite-plugin-integration' },
            ],
          },
          {
            text: '工作原理',
            items: [
              { text: '转换逻辑', link: '/zh/how-it-works' },
            ],
          },
          {
            text: '使用指南',
            items: [
              { text: '【必读】注意事项', link: '/zh/guide/notes' },
              { text: '配置说明', link: '/zh/guide/configuration' },
              { text: '故障排除', link: '/zh/troubleshooting' },
            ],
          },
          {
            text: '使用用例',
            items: [
              { text: '参数处理用例', link: '/zh/guide/params-usage' },
              { text: '文件上传用例', link: '/zh/guide/file-upload-usage' },
            ],
          },
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/cnpap/vtzac' },
        ],
      },
    },
  },
})
