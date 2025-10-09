---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "vtzac"
  text: "vite + nestjs full-stack"
  tagline: Next-generation full-stack solution
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started

features:
  - icon:
      src: "/typescript.svg"
      width: "48"
      height: "48"
    title: End-to-End Type Safety
    details: Complete type safety throughout frontend-backend communication, elegant TypeScript full-stack solution with compile-time error detection
  - icon:
      src: "/nestjs_vitejs.svg"
      width: "96"
      height: "48"
    title: Full Compatibility
    details: Fully compatible with the NestJS + Vite ecosystem. Zero learning curve; file uploads, WebSocket—everything you need works out of the box.
  - icon:
      src: "/electron.svg"
      width: "48"
      height: "48"
    title: Client Application Development
    details: Built on NestJS + Vite a single codebase for Web and Electron clients. Run NestJS inside Electron with near-zero effort—no extra adaptation—and boost efficiency by at least 100%.
---

<ExampleCard desc="NestJS backend and frontend example with end-to-end type safety." twoCol>
  <template #title>
    <span>End-to-end Example</span>
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
    const file = event.target.files?.[0] // File type
    if (!file)
      return

    // Type-safe call
    // Actual request: POST /api/user/123/upload?version=v2
    const result = await api.call(
      'uploadAvatar',
      '123', // @Param('id')
      'v2', // @Query('version')
      file as unknown as Express.Multer.File, // @UploadedFile()
      { title: 'Avatar' }, // @Body()
    )

    console.log(result._data)
    // Output: { success: true, userId: '123', version: 'v2', filename: 'avatar.jpg', metadata: { title: 'Avatar' } }
  }

  return <input type="file" onChange={handleUpload} />
}
```

  </template>
</ExampleCard>
