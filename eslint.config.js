// @ts-check
import antfu from '@antfu/eslint-config'
import globals from 'globals'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
  },
  {
    files: ['src/backend/**/*.ts', 'docs/**/*.ts', '!playground/**/*'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
)
