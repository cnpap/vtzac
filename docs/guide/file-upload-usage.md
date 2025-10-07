# 文件上传用例

## 单文件上传

### 后端实现

```typescript
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('api/upload')
export class UploadController {
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata?: any,
  ) {
    return {
      success: true,
      filename: file.originalname,
      size: file.size,
      metadata
    }
  }
}
```

### 前端调用

```tsx
import { zac } from 'vtzac/hook'
import { UploadController } from './backend/upload.controller'

const uploadController = zac(UploadController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
  }
})

async function handleSingleUpload(file: File) {
  const res = await uploadController.call(
    'uploadSingle',
    file as unknown as Express.Multer.File, // 文件对象
    { description: '测试文件' } // 元数据
  ).catch(error => console.error('单文件上传失败:', error))

  console.log(res._data)
  // 输出: { success: true, filename: 'test.txt', size: 1024, metadata: { description: '测试文件' } }
}
```

## 多文件上传

### 后端实现

```typescript
import { FilesInterceptor } from '@nestjs/platform-express'

@Controller('api/upload')
export class UploadController {
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 5)) // 最多5个文件
  uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() metadata?: any,
  ) {
    return {
      success: true,
      count: files.length,
      files: files.map(file => ({
        filename: file.originalname,
        size: file.size
      })),
      metadata
    }
  }
}
```

### 前端调用

```tsx
async function handleMultipleUpload(files: File[]) {
  const res = await uploadController.call(
    'uploadMultiple',
    files as unknown as Express.Multer.File[], // 文件数组
    { description: '批量上传' } // 元数据
  ).catch(error => console.error('多文件上传失败:', error))

  console.log(res._data)
  // 输出: { success: true, count: 3, files: [...], metadata: { description: '批量上传' } }
}
```

## 具名多文件上传

### 后端实现

```typescript
import { FileFieldsInterceptor } from '@nestjs/platform-express'

@Controller('api/upload')
export class UploadController {
  @Post('named-multiple')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'documents', maxCount: 3 },
    { name: 'images', maxCount: 2 },
  ]))
  uploadNamedMultiple(
    @UploadedFiles() files: {
      documents?: Express.Multer.File[]
      images?: Express.Multer.File[]
    },
    @Body() metadata?: any,
  ) {
    return {
      success: true,
      documents: files.documents?.map(file => ({
        filename: file.originalname,
        size: file.size
      })) || [],
      images: files.images?.map(file => ({
        filename: file.originalname,
        size: file.size
      })) || [],
      metadata
    }
  }
}
```

### 前端调用

```tsx
async function handleNamedUpload(documents: File[], images: File[]) {
  const res = await uploadController.call(
    'uploadNamedMultiple',
    {
      documents: documents as unknown as Express.Multer.File[],
      images: images as unknown as Express.Multer.File[]
    },
    { description: '分类上传' }
  ).catch(error => console.error('具名多文件上传失败:', error))

  console.log(res._data)
  // 输出: { success: true, documents: [...], images: [...], metadata: { description: '分类上传' } }
}
```
