module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/test/**/*.test.ts'],
  
  transformIgnorePatterns: [
    // Ignore everything in node_modules EXCEPT jose (and possibly others you need)
    'node_modules/(?!(jose)/)',
  ],
  
  // Let jest use babel-jest for JavaScript files
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/jest.setup.js'],
};
