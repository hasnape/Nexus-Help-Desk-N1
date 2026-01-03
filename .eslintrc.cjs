module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn', // Downgrade to warn for legacy code
    
    // React specific
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react-hooks/rules-of-hooks': 'warn', // Downgrade to warn for legacy code
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/set-state-in-effect': 'warn', // Downgrade to warn for legacy code
    'react-hooks/immutability': 'warn', // Downgrade to warn for window.location.hash etc.
    'react/no-unescaped-entities': 'warn', // Downgrade to warn for legacy code
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-var': 'warn', // Downgrade to warn for legacy code
    'no-useless-escape': 'warn', // Downgrade to warn for legacy code
    
    // Accessibility - downgrade to warn for gradual improvement
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '.eslintrc.cjs',
    'vite.config.ts',
    'postcss.config.js',
    'tailwind.config.js',
  ],
};
