import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'no-alert': 'off',
    'no-cond-assign': 'off',
    'prefer-rest-params': 'off',
    'node/prefer-global/process': 'off',
    'ts/consistent-type-imports': 'off',
    'regexp/no-unused-capturing-group': 'off',
    'style/no-mixed-operators': 'off',
  },
  ignores: [
    '*.py',
    '*.ps1',
  ],
})
