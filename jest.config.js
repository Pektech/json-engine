module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\.(tsx?|js)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    'src/store/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/types/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.test.{ts,tsx}',
    // UI component and Next app shells are covered by Playwright e2e specs in this repo.
    // Unit coverage is scoped to logic layers to keep jsdom tests focused and deterministic.
    '!src/components/**/*.{ts,tsx}',
    '!src/app/**/*.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}
