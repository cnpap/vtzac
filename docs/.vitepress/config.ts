import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitepress';
// import vtjump from 'vtjump'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      // vtjump({
      //   protocols: ['trae']
      // })
    ],
  },
  title: 'vtzac',
  description: 'Vite + NestJS Full-Stack Solution',
  lang: 'en-US',

  // Set default to dark mode
  appearance: 'dark',

  // Ignore dead links for local development server
  ignoreDeadLinks: [/^http:\/\/localhost:\d+/],

  // Multi-language support
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'vtzac',
      description: 'Vite + NestJS',
      themeConfig: {
        nav: [{ text: 'Home', link: '/' }],
        sidebar: [
          {
            text: 'Quick Start',
            items: [
              { text: 'Introduction', link: '/intro' },
              { text: 'Getting Started', link: '/getting-started' },
            ],
          },
          {
            text: 'User Guide',
            items: [
              { text: '[Must Read] Notes', link: '/guide/notes' },
              { text: 'Configuration', link: '/guide/configuration' },
            ],
          },
          {
            text: 'Use Cases',
            items: [
              { text: 'Parameter Handling', link: '/guide/params-usage' },
              { text: 'File Upload', link: '/guide/file-upload-usage' },
              { text: 'SSE Streaming Response', link: '/guide/sse-usage' },
            ],
          },
          {
            text: 'WebSocket',
            items: [
              {
                text: 'Backend Message Emit',
                link: '/guide/websocket-backend-emit',
              },
              { text: 'Mutual Calls', link: '/guide/websocket-mutual-call' },
            ],
          },
          {
            text: 'AI Agent',
            items: [
              { text: 'Streaming Support', link: '/guide/ai-streaming' },
              { text: 'React Helpers', link: '/guide/ai-react-helpers' },
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
        nav: [{ text: '首页', link: '/zh/' }],
        sidebar: [
          {
            text: '快速开始',
            items: [
              { text: '项目介绍', link: '/zh/intro' },
              { text: '开始', link: '/zh/getting-started' },
            ],
          },
          {
            text: '使用指南',
            items: [
              { text: '[必读]注意事项', link: '/zh/guide/notes' },
              { text: '配置说明', link: '/zh/guide/configuration' },
            ],
          },

          {
            text: '使用用例',
            items: [
              { text: '参数处理用例', link: '/zh/guide/params-usage' },
              { text: '文件上传用例', link: '/zh/guide/file-upload-usage' },
              { text: 'SSE 流式响应', link: '/zh/guide/sse-usage' },
            ],
          },
          {
            text: 'WebSocket',
            items: [
              {
                text: '后端消息发送',
                link: '/zh/guide/websocket-backend-emit',
              },
              {
                text: '前后端相互调用',
                link: '/zh/guide/websocket-mutual-call',
              },
            ],
          },
          {
            text: 'AI Agent',
            items: [
              { text: '流式格式支持', link: '/zh/guide/ai-streaming' },
              { text: 'React 助手函数', link: '/zh/guide/ai-react-helpers' },
            ],
          },
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/cnpap/vtzac' },
        ],
      },
    },
  },
});
