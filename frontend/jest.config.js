// jest.config.ts
import nextJest from 'next/jest'
import type { Config } from 'jest'
import { pathsToModuleNameMapper } from 'ts-jest'

import tsconfig from './tsconfig.json'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Keep CI runs fast. Adjust as needed.
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/', '/ct/', '\\.ct\\.tsx?$'],

  // Mirror tsconfig "paths" so imports like "@/components/..." resolve in tests
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths || {}, {
      prefix: '<rootDir>/',
    }),
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  modulePathIgnorePatterns: ['<rootDir>/dist/'],
}

export default createJestConfig(config)
