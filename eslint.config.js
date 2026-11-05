const expo = require('eslint-config-expo/flat');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...expo,
  {
    ignores: [
      '**/node_modules/**',
      '**/.expo/**',
      '**/android/**',
      '**/ios/**',
      '**/dist/**',
      '**/web-build/**',
    ],
  },
];
