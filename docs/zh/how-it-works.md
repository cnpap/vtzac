# 转换逻辑

## 自动转换过程

vtzac 会扫描你的 NestJS 控制器文件，分析装饰器和方法签名，然后自动生成对应的前端调用代码。

### 转换示例

#### 你写的后端代码

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

#### 自动生成的前端调用代码

```javascript
// 自动生成
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

## 支持的装饰器

- `@Get()`, `@Post()`, `@Put()`, `@Delete()` - HTTP 方法
- `@Param()` - 路径参数
- `@Query()` - 查询参数
- `@Body()` - 请求体
- `@Headers()` - 请求头
- `@UploadedFile()` - 单文件上传
- `@UploadedFiles()` - 多文件上传

## 参数处理规则

1. **路径参数** - 按顺序传递，会替换 URL 中的占位符
2. **查询参数** - 会添加到 URL 的查询字符串中
3. **请求体** - 会作为 JSON 发送
4. **文件上传** - 会使用 FormData 格式发送
5. **请求头** - 会添加到 HTTP 请求头中
