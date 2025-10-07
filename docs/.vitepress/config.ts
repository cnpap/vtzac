import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'vtzac',
  description: 'Vite + NestJS 全栈方案',
  lang: 'zh-CN',

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
        text: '使用指南',
        items: [
          { text: '集成 NestJS【步骤1】', link: '/nestjs-integration' },
          { text: '集成 Vite 插件【步骤2】', link: '/vite-plugin-integration' },
          { text: '注意事项【必读】', link: '/guide/notes' },
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
