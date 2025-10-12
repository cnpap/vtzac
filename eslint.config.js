// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    // 明确排除子项目目录和 README 文件，避免 tsconfigRootDir 冲突
    ignores: [
      'playground/**/*',
      'examples/**/*',
      'docs/**/*',
      'README.md',
      'README.zh.md',
    ],
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    rules: {
      'ts/strict-boolean-expressions': 'off',
    },
  },
  {
    // 明确指定只处理根目录的源文件
    files: ['src/**/*.ts', 'test/**/*.ts', 'types/**/*.ts', 'vitest.config.ts'],
  },
)
