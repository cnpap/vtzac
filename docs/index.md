---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'vtzac'
  text: 'vite + nestjs'
  tagline: Next-generation full-stack solution
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started

features:
  - icon:
      src: '/typescript.svg'
      width: '48'
      height: '48'
    title: End-to-End Type Safety
    details: Full-stack type safety from frontend to backend calls, shortest call chain, fastest IDE feedback, AI-friendly, minimalist TypeScript full-stack solution, compile-time error detection, next-generation full-stack development experience
  - icon:
      src: '/nestjs_vitejs.svg'
      width: '96'
      height: '48'
    title: Fully Compatible
    details: Fully compatible with NestJS + Vite ecosystem, zero learning cost, file upload, websocket - everything you need is adapted and compatible by default
  - icon:
      src: '/electron.svg'
      width: '48'
      height: '48'
    title: Client Application Development (Planned)
    details: Built on NestJS + Vite core, one codebase for both Web and Electron clients; run NestJS in Electron with almost zero cost, no additional adaptation needed, efficiency improved by at least 100%
---

<ExampleCard desc="NestJS backend and frontend call example with end-to-end type safety." twoCol>
  <template #title>
    <span>End-to-End Example</span>
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
    @Body() metadata: { title: string }
  ) {
    return {
      success: true,
      userId,
      version,
      filename: file.filename,
      metadata,
    };
  }
}
```

  </template>

<template #right>

```tsx
import { _http } from 'vtzac/hook';
import { UserController } from './backend/user.controller';

const api = _http({
  ofetchOptions: { baseURL: 'http://localhost:3000' },
}).controller(UserController);

function UploadComponent() {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // File type
    if (!file) return;

    // Type-safe call
    // Actual request: POST /api/user/123/upload?version=v2
    const result = await api.uploadAvatar(
      '123', // @Param('id')
      'v2', // @Query('version')
      file as unknown as Express.Multer.File, // @UploadedFile()
      { title: 'Avatar' } // @Body()
    );

    console.log(result._data);
    // Output: { success: true, userId: '123', version: 'v2', filename: 'avatar.jpg', metadata: { title: 'Avatar' } }
  };

  return <input type="file" onChange={handleUpload} />;
}
```

  </template>
</ExampleCard>
