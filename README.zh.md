# vtzac

> **vite + nestjs 全栈** - 下一代全栈解决方案

[![npm version](https://img.shields.io/npm/v/vtzac.svg)](https://www.npmjs.com/package/vtzac)
[![license](https://img.shields.io/npm/l/vtzac.svg)](https://github.com/cnpap/vtzac/blob/main/LICENSE.md)

中文 | [English](./README.md)

为 Vite + NestJS 全栈开发自动生成类型安全的前端 API 客户端。

## ✨ 特性

- **⚡ 端到端类型安全** - 前后端完全类型安全
- **🔄 零学习成本** - 完全兼容 NestJS + Vite 生态系统
- **🚀 5分钟搭建** - AI 友好，最快 IDE 反馈

## 🚀 快速开始

### 后端

```typescript
@Controller('api/user')
export class UserController {
  @Post(':id/upload')
  async uploadAvatar(
    @Param('id') userId: string,
    @Query('version') version: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: { title: string }
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

### 前端

```tsx
import { _http } from 'vtzac/hook'
import { UserController } from './backend/user.controller'

const api = _http(UserController)

function UploadComponent() {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file)
      return

    // 类型安全调用 - POST /api/user/123/upload?version=v2
    const result = await api.call(
      'uploadAvatar',
      '123', // @Param('id')
      'v2', // @Query('version')
      file as unknown as Express.Multer.File, // @UploadedFile()
      { title: 'Avatar' } // @Body()
    )

    console.log(result._data)
  }

  return <input type="file" onChange={handleUpload} />
}
```

## 📖 文档

**👉 [开始使用](https://vtzac.pages.dev/getting-started)**

## 📦 安装

```bash
pnpm add vtzac
```

## 许可证

[MIT](./LICENSE.md) © [cnpap](https://github.com/cnpap)
