module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
      '^.+\\.(t|j)sx?$': 'ts-jest',
      "^.+\\.svg$": "jest-svg-transformer",
      ".+\\.(css)$": "jest-css-modules-transform",
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
      '^@/layouts(.*)$': '<rootDir>/src/core/layouts$1',
      '^@/styles(.*)$': '<rootDir>/src/core/layouts/styles$1',
      '^@/hooks(.*)$': '<rootDir>/src/hooks$1',
    },
  }