# Vite 集成指南

vtzac 是一个专为 Vite + NestJS 全栈开发设计的插件，它能够自动生成前端 API 客户端代码，实现前后端类型安全的无缝集成。

## 快速开始

### 1. 安装 vtzac

```bash
pnpm add -D vtzac
```

### 2. 配置 Vite

在你的 `vite.config.ts` 文件中添加 vtzac 插件：

```typescript
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import vtzac from 'vtzac'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vtzac({
      glob: ['src/backend/**/*.controller.ts'],
    }),
    react(),
    tailwindcss()
  ],
})
```

## 配置选项

### glob

- **类型**: `string[]`
- **必需**: 是
- **描述**: 指定 NestJS 控制器文件的匹配模式

`glob` 选项用于告诉 vtzac 在哪里查找你的 NestJS 控制器文件。插件会扫描这些文件并自动生成对应的前端 API 客户端代码。

#### 示例配置

```typescript
vtzac({
  // 扫描 src/backend 目录下所有的 .controller.ts 文件
  glob: ['src/backend/**/*.controller.ts'],
})
```

```typescript
vtzac({
  // 扫描多个目录
  glob: [
    'src/backend/**/*.controller.ts',
    'src/api/**/*.controller.ts',
  ],
})
```

```typescript
vtzac({
  // 更精确的匹配模式
  glob: [
    'src/backend/controllers/*.controller.ts',
    'src/backend/modules/*/*.controller.ts',
  ],
})
```

## 工作原理

1. **扫描控制器**: vtzac 根据 `glob` 配置扫描你的 NestJS 控制器文件
2. **解析 API**: 分析控制器中的装饰器（如 `@Get`、`@Post` 等）和方法签名
3. **生成客户端**: 自动生成类型安全的前端 API 客户端代码
4. **热更新**: 在开发模式下，当控制器文件发生变化时自动重新生成客户端代码

## 项目结构建议

为了更好地使用 vtzac，建议采用以下项目结构：

```
project-root/
├── src/
│   ├── backend/           # NestJS 后端代码
│   │   ├── controllers/   # 控制器文件
│   │   │   ├── app.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── file.controller.ts
│   │   ├── services/      # 服务文件
│   │   ├── modules/       # 模块文件
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── package.json
│   ├── components/        # React 组件
│   ├── pages/            # 页面组件
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── vite.config.ts        # Vite 配置（包含 vtzac 插件）
└── package.json
```

## 与其他插件集成

vtzac 可以与其他 Vite 插件无缝集成：

### 与 React 集成

```typescript
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import vtzac from 'vtzac'

export default defineConfig({
  plugins: [
    vtzac({
      glob: ['src/backend/**/*.controller.ts'],
    }),
    react(),
  ],
})
```
