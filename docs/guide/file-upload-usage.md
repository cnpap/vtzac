# File Upload Use Cases

## Single File Upload

### Backend Implementation

```typescript
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
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
      metadata,
    }
  }
}
```

### Frontend Usage

```tsx
import { zac } from 'vtzac/hook'
import { UploadController } from './backend/upload.controller'

const uploadController = zac(UploadController, {
  ofetchOptions: {
    baseURL: 'http://localhost:3001',
  },
})

async function handleSingleUpload(file: File) {
  const res = await uploadController
    .call(
      'uploadSingle',
      file as unknown as Express.Multer.File, // File object
      { description: 'Test file' }, // Metadata
    )
    .catch(error => console.error('Single file upload failed:', error))

  console.log(res._data)
  // Output: { success: true, filename: 'test.txt', size: 1024, metadata: { description: 'Test file' } }
}
```

## Multiple File Upload

### Backend Implementation

```typescript
import { FilesInterceptor } from '@nestjs/platform-express'

@Controller('api/upload')
export class UploadController {
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 5)) // Maximum 5 files
  uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() metadata?: any,
  ) {
    return {
      success: true,
      count: files.length,
      files: files.map(file => ({
        filename: file.originalname,
        size: file.size,
      })),
      metadata,
    }
  }
}
```

### Frontend Usage

```tsx
async function handleMultipleUpload(files: File[]) {
  const res = await uploadController
    .call(
      'uploadMultiple',
      files as unknown as Express.Multer.File[], // File array
      { description: 'Batch upload' }, // Metadata
    )
    .catch(error => console.error('Multiple file upload failed:', error))

  console.log(res._data)
  // Output: { success: true, count: 3, files: [...], metadata: { description: 'Batch upload' } }
}
```

## Named Multiple File Upload

### Backend Implementation

```typescript
import { FileFieldsInterceptor } from '@nestjs/platform-express'

@Controller('api/upload')
export class UploadController {
  @Post('named-multiple')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documents', maxCount: 3 },
      { name: 'images', maxCount: 2 },
    ]),
  )
  uploadNamedMultiple(
    @UploadedFiles()
    files: {
      documents?: Express.Multer.File[]
      images?: Express.Multer.File[]
    },
    @Body() metadata?: any,
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
    }
  }
}
```

### Frontend Usage

```tsx
async function handleNamedUpload(documents: File[], images: File[]) {
  const res = await uploadController
    .call(
      'uploadNamedMultiple',
      {
        documents: documents as unknown as Express.Multer.File[],
        images: images as unknown as Express.Multer.File[],
      },
      { description: 'Categorized upload' },
    )
    .catch(error =>
      console.error('Named multiple file upload failed:', error),
    )

  console.log(res._data)
  // Output: { success: true, documents: [...], images: [...], metadata: { description: 'Categorized upload' } }
}
```
