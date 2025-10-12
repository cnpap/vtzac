# 文件上传

vtzac 支持多种文件上传方式，让你能够以**类型安全**的方式处理文件上传功能。

## 单文件：基础文件上传

**后端控制器示例：**

```typescript
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/upload')
export class UploadController {
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata?: any
  ) {
    return {
      success: true,
      filename: file.originalname,
      size: file.size,
      metadata,
    };
  }
}
```

**前端调用示例：**

```tsx
import { _http } from 'vtzac/hook';
import { UploadController } from './backend/upload.controller';

// 创建上传控制器实例
const uploadController = _http(UploadController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
  },
});

async function handleSingleUpload(file: File) {
  // 直接传递文件对象和元数据
  const res = await uploadController.uploadSingle(
    file as unknown as Express.Multer.File,
    { description: '测试文件' }
  );

  console.log(res._data);
  // 输出：{ success: true, filename: 'test.txt', size: 1024, metadata: { description: '测试文件' } }
}
```

```
// 实际会发起的请求：
// POST /api/upload/single
// Content-Type: multipart/form-data
// 包含文件数据和元数据
```

## 多文件：批量文件上传

**后端控制器示例：**

```typescript
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/upload')
export class UploadController {
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() metadata?: any
  ) {
    return {
      success: true,
      count: files.length,
      files: files.map(file => ({
        filename: file.originalname,
        size: file.size,
      })),
      metadata,
    };
  }
}
```

**前端调用示例：**

```tsx
async function handleMultipleUpload(files: File[]) {
  // 传递文件数组和元数据
  const res = await uploadController.uploadMultiple(
    files as unknown as Express.Multer.File[],
    { description: '批量上传' }
  );

  console.log(res._data);
  // 输出：{ success: true, count: 3, files: [{ filename: 'file1.txt', size: 1024 }, ...], metadata: { description: '批量上传' } }
}
```

```
// 实际会发起的请求：
// POST /api/upload/multiple
// Content-Type: multipart/form-data
// 包含多个文件和元数据，最多5个文件
```

## 分类上传：不同类型文件分组

**后端控制器示例：**

```typescript
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('api/upload')
export class UploadController {
  @Post('categorized')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documents', maxCount: 3 },
      { name: 'images', maxCount: 2 },
    ])
  )
  uploadCategorized(
    @UploadedFiles()
    files: {
      documents?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
    @Body() metadata?: any
  ) {
    return {
      success: true,
      documents:
        files.documents?.map(file => ({
          filename: file.originalname,
          size: file.size,
        })) || [],
      images:
        files.images?.map(file => ({
          filename: file.originalname,
          size: file.size,
        })) || [],
      metadata,
    };
  }
}
```

**前端调用示例：**

```tsx
async function handleCategorizedUpload(documents: File[], images: File[]) {
  // 按文件类型分组上传
  const res = await uploadController.uploadCategorized(
    {
      documents: documents as unknown as Express.Multer.File[],
      images: images as unknown as Express.Multer.File[],
    },
    { description: '分类上传' }
  );

  console.log(res._data);
  // 输出：{ success: true, documents: [...], images: [...], metadata: { description: '分类上传' } }
}
```

```
// 实际会发起的请求：
// POST /api/upload/categorized
// Content-Type: multipart/form-data
// 文档类型文件最多3个，图片类型文件最多2个
```

vtzac 会自动处理文件上传的 `multipart/form-data` 格式转换，确保文件和元数据能够正确传递到后端，同时保持**类型安全**。
