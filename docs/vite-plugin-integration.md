# Vite Integration Guide

Please ensure that NestJS has been integrated into your Vite project. If not yet integrated, please refer to the [NestJS Integration Guide](/nestjs-integration) first.

## Quick Start

### 1. Install vtzac

```bash
pnpm add -D vtzac
```

### 2. Configure Vite

Add the vtzac plugin to your `vite.config.ts` file:

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

## Configuration Options

### glob

- **Type**: `string[]`
- **Required**: Yes
- **Description**: Specify the matching pattern for NestJS controller files

The `glob` option is used to tell vtzac where to find your NestJS controller files. The plugin will scan these files and automatically generate corresponding frontend API client code.

#### Example Configuration

```typescript
vtzac({
  // Scan all .controller.ts files in the src/backend directory
  glob: ['src/backend/**/*.controller.ts'],
})
```

```typescript
vtzac({
  // Scan multiple directories
  glob: [
    'src/backend/**/*.controller.ts',
    'src/api/**/*.controller.ts',
  ],
})
```

```typescript
vtzac({
  // More precise matching patterns
  glob: [
    'src/backend/controllers/*.controller.ts',
    'src/backend/modules/*/*.controller.ts',
  ],
})
```

## How It Works

1. **Scan Controllers**: vtzac scans your NestJS controller files based on the `glob` configuration
2. **Parse APIs**: Analyzes decorators (such as `@Get`, `@Post`, etc.) and method signatures in controllers
3. **Generate Client**: Automatically generates type-safe frontend API client code
4. **Hot Reload**: In development mode, automatically regenerates client code when controller files change

## Recommended Project Structure

For better use of vtzac, the following project structure is recommended:

```
project-root/
├── src/
│   ├── backend/           # NestJS backend code
│   │   ├── controllers/   # Controller files
│   │   │   ├── app.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── file.controller.ts
│   │   ├── services/      # Service files
│   │   ├── modules/       # Module files
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── package.json
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── vite.config.ts        # Vite configuration (including vtzac plugin)
└── package.json
```

## Integration with Other Plugins

vtzac can seamlessly integrate with other Vite plugins:

### Integration with React

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
