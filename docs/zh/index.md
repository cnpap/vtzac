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
  - icon: ⚡
    title: 全程类型安全
    details: 前后端调用全过程类型安全，简约的 TypeScript 全栈方案，编译时发现错误
  - icon: 🔄
    title: 完全兼容
    details: 完全兼容 NestJS + Vite 生态，零学习成本，无缝集成现有项目
  - icon: 🚀
    title: 开发体验
    details: 调用链路最短、IDE 反馈最快、AI 最友好、5 分钟上手，全新一代的全栈开发体验
---

### 后端代码

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

### 前端调用

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
