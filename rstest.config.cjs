module.exports = {
  output: {
    module: false // execute test files as CJS (not ESM)
  },
  testEnvironment: 'node',
  include: ['test/**/*.js'], // test files don't have .test.js suffix
  reporters: [
    'default',
    ['junit', { outputPath: './coverage/TEST-rstest.xml' }]
  ],
  coverage: {
    provider: 'istanbul',
    reporters: ['lcovonly', 'text'],
    reportsDirectory: './coverage'
  }
};
