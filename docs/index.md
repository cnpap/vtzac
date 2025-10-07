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
  - icon: ⚡
    title: End-to-End Type Safety
    details: Complete type safety throughout frontend-backend communication, elegant TypeScript full-stack solution with compile-time error detection
  - icon: 🔄
    title: Fully Compatible
    details: Fully compatible with NestJS + Vite ecosystem, zero learning curve, seamless integration with existing projects
  - icon: 🚀
    title: Developer Experience
    details: Shortest call chain, fastest IDE feedback, AI-friendly, 5-minute setup, next-generation full-stack development experience
---

### Backend Code

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

### Frontend Usage

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
