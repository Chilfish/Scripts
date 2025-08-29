import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'no-alert': 'off',
    'prefer-rest-params': 'off',
    'node/prefer-global/process': 'off',
    'ts/consistent-type-imports': 'off',
    'regexp/no-unused-capturing-group': 'off',
    'style/no-mixed-operators': 'off',
    'no-unused-vars': 'warn',
    'no-cond-assign': 'warn',
    'unused-imports/no-unused-vars': 'warn',
    'no-undef': 'warn',
    'unicorn/consistent-function-scoping': 'warn',
    'no-var': 'warn',
    'antfu/no-top-level-await': 'off',
    'vars-on-top': 'off',
    'no-use-before-define': 'warn',
  },
  ignores: [
    '*.py',
    '*.ps1',
    'pnpm-lock.yaml',
    'python/**',
  ],
})
