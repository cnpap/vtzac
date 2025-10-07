import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'vtzac',
  description: 'Vite + NestJS 全栈方案',
  lang: 'zh-CN',

  // 设置默认为暗模式
  appearance: 'dark',

  // 忽略本地开发服务器的死链接
  ignoreDeadLinks: [
    /^http:\/\/localhost:\d+/,
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
    ],
    sidebar: [
      {
        text: '快速开始',
        items: [
          { text: '开始', link: '/getting-started' },
          { text: '【步骤 1】集成 NestJS', link: '/nestjs-integration' },
          { text: '【步骤 2】集成 Vite 插件', link: '/vite-plugin-integration' },
        ],
      },
      {
        text: '工作原理',
        items: [
          { text: '转换逻辑', link: '/how-it-works' },
        ],
      },
      {
        text: '使用指南',
        items: [

          { text: '【必读】注意事项', link: '/guide/notes' },
          { text: '故障排除', link: '/troubleshooting' },
        ],
      },
      {
        text: '使用用例',
        items: [
          { text: '参数处理用例', link: '/guide/params-usage' },
          { text: '文件上传用例', link: '/guide/file-upload-usage' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/cnpap/vtzac' },
    ],
  },
})
