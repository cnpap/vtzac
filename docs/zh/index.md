---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "vtzac"
  text: "vite + nestjs 全栈"
  tagline: 新一代的全栈解决方案
  actions:
    - theme: brand
      text: 立即开始
      link: /zh/getting-started

features:
  - icon:
      src: "/typescript.svg"
      width: "48"
      height: "48"
    title: 全程类型安全
    details: 前后端调用全过程类型安全，调用链路最短、IDE 反馈最快、AI 最友好，简约的 TypeScript 全栈方案，编译时发现错误，全新一代的全栈开发体验
  - icon:
      src: "/nestjs_vitejs.svg"
      width: "96"
      height: "48"
    title: 完全兼容
    details: 完全兼容 NestJS + Vite 生态，零学习成本，文件上传、websocket 你所需要的一切都默认适配兼容
  - icon:
      src: "/electron.svg"
      width: "48"
      height: "48"
    title: 客户端应用开发
    details: NestJS + Vite 为核心，一套代码同时适配 Web 与 Electron 客户端；几乎零成本把 NestJS 运行在 Electron 中，无需额外适配，效率至少提升 100%
---

<ExampleCard desc="NestJS 后端与前端调用示例，端到端类型安全。" twoCol>
  <template #title>
    <span>端到端示例</span>
  </template>

<template #left>

```typescript
@Controller('api/user')
export class UserController {
  @Post(':id/upload')
  async uploadAvatar(
    @Param('id') userId: string,
    @Query('version') version: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: { title: string },
  ) {
    return {
      success: true,
      userId,
      version,
      filename: file.filename,
      metadata,
    }
  }
}
```

  </template>

<template #right>

```tsx
import { zac } from 'vtzac/hook'
import { UserController } from './backend/user.controller'

const api = zac(UserController)

function UploadComponent() {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] // File 类型
    if (!file)
      return

    // 类型安全调用
    // 实际请求: POST /api/user/123/upload?version=v2
    const result = await api.call(
      'uploadAvatar',
      '123', // @Param('id')
      'v2', // @Query('version')
      file as unknown as Express.Multer.File, // @UploadedFile()
      { title: '头像' }, // @Body()
    )

    console.log(result._data)
    // 打印出: { success: true, userId: '123', version: 'v2', filename: 'avatar.jpg', metadata: { title: '头像' } }
  }

  return <input type="file" onChange={handleUpload} />
}
```

  </template>
</ExampleCard>
