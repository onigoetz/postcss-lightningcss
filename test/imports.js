const test = require('ava');
const postcss = require('postcss');
const postcssLightningcss = require('../src/index.js');
const path = require('path');

const importStatementWithUrlAndOptions = {
  input: '@import url("./fixtures/import.css") layer(foo) supports(display: grid) screen and (max-width: 400px);',
  expected: '@import "./fixtures/import.css" layer(foo) supports(display:grid) screen and (width<=400px);'
}
const importStatementWithoutUrl = '@import "./fixtures/import.css";';

const imported = {
  input: '@import "./fixtures/import.css";',
  expected: '.foo{background:red}',
}

const importedWithUrlAndOptions = {
  input: '@import url("./fixtures/import.css") layer(foo) supports(display: grid) screen and (max-width: 400px);',
  expected: '@supports (display:grid){@media screen and (width<=400px){@layer foo{.foo{background:red}}}}',
}

test('Should remove url() from import statement', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssLightningcss())
    .process(importStatementWithUrlAndOptions.input)
    .then((result) => t.is(result.css, importStatementWithUrlAndOptions.expected));
});

test('Should leave import statement as it is', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssLightningcss())
    .process(importStatementWithoutUrl)
    .then((result) => t.is(result.css, importStatementWithoutUrl));
});

// TODO - Fix this test: the imported file is not found
test('Should import CSS file', (t) => {
  t.plan(1);
  return postcss()
    .use(postcssLightningcss({
      bundle: true,
    }))
    .process(imported.input, {
      from: path.join(__dirname, 'input.css'),
    })
    .then((result) => t.is(result.css, imported.expected));
});

// TODO - Fix this test: the imported file is not found
test('Should import CSS file and set all options', (t) => {
  t.plan(1);
  return postcss()
    .use(postcssLightningcss({
      bundle: true,
    }))
    .process(importedWithUrlAndOptions.input, {
      from: path.join(__dirname, 'input.css'),
    })
    .then((result) => t.is(result.css, importedWithUrlAndOptions.expected));
});
