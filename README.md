# vtzac

> **vite + nestjs full-stack** - Next-generation full-stack solution

[![npm version](https://img.shields.io/npm/v/vtzac.svg)](https://www.npmjs.com/package/vtzac)
[![license](https://img.shields.io/npm/l/vtzac.svg)](https://github.com/cnpap/vtzac/blob/main/LICENSE.md)

[中文](./README.zh.md) | English

Auto-generate type-safe frontend API clients for Vite + NestJS full-stack development.

## ✨ Features

- **⚡ End-to-End Type Safety** - Complete type safety from backend to frontend
- **🔄 Zero Learning Curve** - Fully compatible with NestJS + Vite ecosystem
- **🚀 5-Minute Setup** - AI-friendly, fastest IDE feedback

## 🚀 Quick Start

### Backend

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

### Frontend

```tsx
import { zac } from 'vtzac/hook'
import { UserController } from './backend/user.controller'

const api = zac(UserController)

function UploadComponent() {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file)
      return

    // Type-safe call - POST /api/user/123/upload?version=v2
    const result = await api.call(
      'uploadAvatar',
      '123', // @Param('id')
      'v2', // @Query('version')
      file as unknown as Express.Multer.File, // @UploadedFile()
      { title: 'Avatar' }, // @Body()
    )

    console.log(result._data)
  }

  return <input type="file" onChange={handleUpload} />
}
```

## 📖 Documentation

**👉 [Get Started](https://vtzac.pages.dev/getting-started)**

## 📦 Installation

```bash
pnpm add vtzac
```

## License

[MIT](./LICENSE.md) © [cnpap](https://github.com/cnpap)
