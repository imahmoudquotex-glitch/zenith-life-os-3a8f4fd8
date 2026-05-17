// @zenith/config-eslint — Shared ESLint base config
// Reviewer issue #6: Strict TypeScript + security rules

export default {
  rules: {
    // No console.log in production code
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // No eval or Function constructor
    'no-eval': 'error',
    'no-new-func': 'error',
    'no-implied-eval': 'error',
    // No debugger
    'no-debugger': 'error',
    // Enforce const
    'prefer-const': 'error',
    // No var
    'no-var': 'error',
  },
};
