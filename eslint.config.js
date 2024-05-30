import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'no-alert': 'off',
    'no-cond-assign': 'off',
    'prefer-rest-params': 'off',
    'node/prefer-global/process': 'off',
  },
  ignores: [
    '*.py',
    '*.ps1',
  ],
})
