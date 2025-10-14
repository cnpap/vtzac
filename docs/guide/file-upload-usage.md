# File Upload

vtzac supports multiple file upload methods, allowing you to handle file upload functionality in a **type-safe** manner.

## Single File: Basic File Upload

**Backend Controller Example:**

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

**Frontend Usage Example:**

```tsx
import { _http } from 'vtzac';
import { UploadController } from './backend/upload.controller';

// Create upload controller instance
const uploadController = _http({
  ofetchOptions: {
    baseURL: 'http://localhost:3000',
  },
}).controller(UploadController);

async function handleSingleUpload(file: File) {
  // Directly pass file object and metadata
  const res = await uploadController.uploadSingle(
    file as unknown as Express.Multer.File,
    { description: 'Test file' }
  );

  console.log(res._data);
  // Output: { success: true, filename: 'test.txt', size: 1024, metadata: { description: 'Test file' } }
}
```

```
// Actual request sent:
// POST /api/upload/single
// Content-Type: multipart/form-data
// Contains file data and metadata
```

## Multiple Files: Batch File Upload

**Backend Controller Example:**

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

**Frontend Usage Example:**

```tsx
async function handleMultipleUpload(files: File[]) {
  // Pass file array and metadata
  const res = await uploadController.uploadMultiple(
    files as unknown as Express.Multer.File[],
    { description: 'Batch upload' }
  );

  console.log(res._data);
  // Output: { success: true, count: 3, files: [{ filename: 'file1.txt', size: 1024 }, ...], metadata: { description: 'Batch upload' } }
}
```

```
// Actual request sent:
// POST /api/upload/multiple
// Content-Type: multipart/form-data
// Contains multiple files and metadata, maximum 5 files
```

## Categorized Upload: Different File Types Grouped

**Backend Controller Example:**

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

**Frontend Usage Example:**

```tsx
async function handleCategorizedUpload(documents: File[], images: File[]) {
  // Upload files grouped by type
  const res = await uploadController.uploadCategorized(
    {
      documents: documents as unknown as Express.Multer.File[],
      images: images as unknown as Express.Multer.File[],
    },
    { description: 'Categorized upload' }
  );

  console.log(res._data);
  // Output: { success: true, documents: [...], images: [...], metadata: { description: 'Categorized upload' } }
}
```

```
// Actual request sent:
// POST /api/upload/categorized
// Content-Type: multipart/form-data
// Maximum 3 document files, maximum 2 image files
```

vtzac automatically handles the `multipart/form-data` format conversion for file uploads, ensuring that files and metadata are correctly passed to the backend while maintaining **type safety**.
