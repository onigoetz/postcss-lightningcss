const { SonarReporter } = require('rstest-sonar-reporter');
module.exports = {
  output: {
    module: false // execute test files as CJS (not ESM)
  },
  testEnvironment: 'node',
  include: ['test/**/*.js'], // test files don't have .test.js suffix
  reporters: [
    'default',
    new SonarReporter({ outputFile: './coverage/sonar-report.xml' })
  ],
  coverage: {
    provider: 'istanbul',
    reporters: ['lcovonly', 'text'],
    reportsDirectory: './coverage'
  }
};
