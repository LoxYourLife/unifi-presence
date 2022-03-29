const config = {
  moduleFileExtensions: ['js', 'json', 'vue'],
  testEnvironment: 'node',
  verbose: false,
  collectCoverageFrom: ['webfrontend/**/*.js', 'bin/**/*.js', 'app/**/*.js', 'app/**/*.vue'],
  coveragePathIgnorePatterns: ['app/lang', 'app/main.js', 'bin/index'],
  coverageReporters: ['text', 'lcov', 'cobertura', 'html'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue3-jest'
  }
};

module.exports = config;
