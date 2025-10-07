# Transformation Logic

## Automatic Transformation Process

vtzac scans your NestJS controller files, analyzes decorators and method signatures, and then automatically generates corresponding frontend calling code.

### Transformation Example

#### Your Backend Code

```typescript
@Controller('api/test')
export class TestController {
  @Post('upload/single')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: { title: string, description: string },
  ) {
    return { success: true, filename: file.filename, metadata }
  }
}
```

#### Auto-Generated Frontend Calling Code

```javascript
// Auto-generated
export class TestController {
  uploadFile(options, ...args) {
    const input = {
      method: 'POST',
      path: 'api/test/upload/single',
      parameters: [
        {
          name: '_file',
          decorator: 'UploadedFile',
          fileInfo: {
            uploadType: 'single',
            fileFields: [{ fieldName: 'file', isArray: false }],
          },
        },
        {
          name: '_metadata',
          decorator: 'Body',
        },
      ],
      fileUpload: {
        type: 'single',
        fieldNames: ['file'],
      },
    }
    input.ofetchOptions = options.ofetchOptions
    return _api(input, args)
  }
}
```

## Supported Decorators

- `@Get()`, `@Post()`, `@Put()`, `@Delete()` - HTTP methods
- `@Param()` - Path parameters
- `@Query()` - Query parameters
- `@Body()` - Request body
- `@Headers()` - Request headers
- `@UploadedFile()` - Single file upload
- `@UploadedFiles()` - Multiple file upload

## Parameter Processing Rules

1. **Path Parameters** - Passed in order, will replace placeholders in the URL
2. **Query Parameters** - Will be added to the URL query string
3. **Request Body** - Will be sent as JSON
4. **File Upload** - Will be sent using FormData format
5. **Request Headers** - Will be added to HTTP request headers
