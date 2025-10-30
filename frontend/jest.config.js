// jest.config.js
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  setupFiles: ['<rootDir>/jest.polyfills.js'],          // NEW – runs before env loads
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  moduleDirectories: ['node_modules', '<rootDir>'],     // ⬅️ absolute “@/” now resolves
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },

  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: [
    '<rootDir>/e2e/',
    '<rootDir>/ct/',
    '\\.ct\\.tsx?$',
    '/node_modules/',
    '/\\.next/',
  ],
});
