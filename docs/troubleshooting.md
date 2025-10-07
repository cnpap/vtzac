# NestJS Integration Common Issues and Troubleshooting

This document collects common issues and solutions when using vtzac for NestJS + Vite full-stack development.

## Decorator-Related Errors

### Issue: Decorators not recognized
**Error message**: `Experimental support for decorators is a feature that is subject to change in a future release.`

**Solution**:
Ensure decorator support is added in both `tsconfig.app.json` and `tsconfig.server.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Issue: Multer type error
**Error message**: `Namespace "global.Express" has no exported member "Multer"`

**Solution**:
1. Install necessary dependencies:
   ```bash
   pnpm add multer @types/multer
   ```

2. Add multer types in `tsconfig.app.json`:
   ```json
   {
     "compilerOptions": {
       "types": ["vite/client", "multer"]
     }
   }
   ```

### Issue: Decorator metadata lost
**Error message**: `Cannot resolve dependency` or dependency injection failure

**Solution**:
Ensure `reflect-metadata` is installed and imported at the application entry point:

```bash
pnpm add reflect-metadata
```

Add at the top of `src/backend/main.ts`:
```typescript
import 'reflect-metadata'
```

## Module System Configuration

### Issue: Module import error
**Error message**: `Cannot use import statement outside a module` or `require() of ES modules is not supported`

**Solution**:
Ensure the backend uses CommonJS module system, set in `src/backend/package.json`:

```json
{
  "type": "commonjs"
}
```
