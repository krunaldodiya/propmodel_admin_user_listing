export default {
  testEnvironment: "node",
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/tests/**/*.test.js"],
  verbose: true,
  testPathIgnorePatterns: ["/node_modules/"],
  roots: ["<rootDir>"],
  modulePaths: ["<rootDir>"],
};
