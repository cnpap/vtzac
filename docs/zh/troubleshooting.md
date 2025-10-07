# NestJS 集成常见问题与故障排除

本文档收集了在使用 vtzac 进行 NestJS + Vite 前后端一体化开发时的常见问题和解决方案。

## 装饰器相关错误

### 问题：装饰器无法识别

**错误信息**：`Experimental support for decorators is a feature that is subject to change in a future release.`

**解决方案**：
确保在 `tsconfig.app.json` 和 `tsconfig.server.json` 中都添加了装饰器支持：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 问题：Multer 类型错误

**错误信息**：`命名空间"global.Express"没有已导出的成员"Multer"`

**解决方案**：

1. 安装必要的依赖：

   ```bash
   pnpm add multer @types/multer
   ```

2. 在 `tsconfig.app.json` 中添加 multer 类型：
   ```json
   {
     "compilerOptions": {
       "types": ["vite/client", "multer"]
     }
   }
   ```

### 问题：装饰器元数据丢失

**错误信息**：`Cannot resolve dependency` 或依赖注入失败

**解决方案**：
确保安装了 `reflect-metadata` 并在应用入口处导入：

```bash
pnpm add reflect-metadata
```

在 `src/backend/main.ts` 顶部添加：

```typescript
import 'reflect-metadata'
```

## 模块系统配置

### 问题：模块导入错误

**错误信息**：`Cannot use import statement outside a module` 或 `require() of ES modules is not supported`

**解决方案**：
确保后端使用 CommonJS 模块系统，在 `src/backend/package.json` 中设置：

```json
{
  "type": "commonjs"
}
```
