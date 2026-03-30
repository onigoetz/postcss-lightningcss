// The tests here are largely inspired by the tests in postcss-csso
const { test, expect } = require('@rstest/core');
const postcss = require('postcss');
const postcssNested = require('postcss-nested');
const postcssLightningcss = require('../src/index.js');

async function getError (promise) {
  try {
    await promise;
    throw new Error('Expected promise to reject');
  } catch (err) {
    return err;
  }
}

const css1 =
  '.a { color: #ff0000; } @media all { .b { color: rgba(255, 0, 0, 1) } }';
const css2 =
  '.class-name { color: green; } :global(.global-class-name) { color: green; }';
const minified2 =
  '.class-name{color:green}:global(.global-class-name){color:green}';
const minified1 = '.a{color:red}.b{color:red}';

test('works as a postcss plugin via .use()', () => {
  expect.assertions(1);

  return postcss()
    .use(postcssLightningcss())
    .process(css1)
    .then((result) => expect(result.css).toBe(minified1));
});

test('works as a postcss plugin via postcss([..]) w/o config', () => {
  expect.assertions(1);

  return postcss([postcssLightningcss])
    .process(css1)
    .then((result) => expect(result.css).toBe(minified1));
});
test('works as a postcss plugin via postcss([..]) w/ config', () => {
  expect.assertions(1);

  return postcss([postcssLightningcss({})])
    .process(css1)
    .then((result) => expect(result.css).toBe(minified1));
});

test('edge cases: should process empty', () => {
  expect.assertions(1);

  return postcss()
    .use(postcssLightningcss)
    .process('')
    .then((result) => expect(result.css).toBe(''));
});

test('error handling: postcss error', async () => {
  const error = await getError(
    postcss([postcssLightningcss]).process('.test { color }')
  );

  expect(error.name).toBe('CssSyntaxError');
  expect(error.message).toBe('<css input>:1:9: Unknown word color');
  expect(error.line).toBe(1);
  expect(error.column).toBe(9);
});

test('error handling: lightningcss error', async () => {
  const error = await getError(
    postcss([postcssLightningcss]).process('{foo:1}')
  );

  expect(error.name).toBe('SyntaxError');
  expect(error.message).toBe('Invalid empty selector');
  expect(error.loc.line).toBe(1);
  expect(error.loc.column).toBe(1);
});

// TODO :: postcss-nested is embedded inside lightningcss
// we should try to find other postcss plugins to test with
test('should work with postcss-nested', () => {
  expect.assertions(1);

  return postcss([postcssNested, postcssLightningcss])
    .process('.c { .touch &:hover { color: #ff0000; } }')
    .then((result) => expect(result.css).toBe('.touch .c:hover{color:red}'));
});

test('should work with cssmodules: boolean', async () => {
  const moduleCssResult = postcss([
    postcssLightningcss({ cssModules: true })
  ]).process(css2, { from: 'input.css' });
  // css modules generate different hash on CI and local machine
  expect(moduleCssResult.css).not.toBe(minified2);
  const nonModuleCssResult = await postcss([
    postcssLightningcss({ cssModules: false })
  ]).process(css2, { from: 'input.css' });
  expect(nonModuleCssResult.css).toBe(minified2);
});

test('should work with cssmodules: auto', async () => {
  const moduleCssResult = postcss([
    postcssLightningcss({ cssModules: 'auto' })
  ]).process(css2, { from: 'input.module.css' });
  expect(moduleCssResult.css).not.toBe(minified2);
  const nonModuleCssResult = await postcss([
    postcssLightningcss({ cssModules: 'auto' })
  ]).process(css2, { from: 'input.css' });
  expect(nonModuleCssResult.css).toBe(minified2);
});

test('should work with cssmodules: regex', async () => {
  const moduleCssResult = await postcss([
    postcssLightningcss({ cssModules: /\.custom\.css/ })
  ]).process(css2, { from: 'input.custom.css' });
  expect(moduleCssResult.css).not.toBe(minified2);

  const nonModuleCssResult = await postcss([
    postcssLightningcss({ cssModules: /\.custom\.css/ })
  ]).process(css2, { from: 'input.module.css' });
  expect(nonModuleCssResult.css).toBe(minified2);
});

test('should work with cssmodules: export JSON', async () => {
  expect.assertions(5);
  const moduleCssResult = postcss([
    postcssLightningcss({
      cssModules: true,
      cssModulesJSON: function (cssFileName, json, outputFileName) {
        expect(cssFileName.indexOf('/input.module.css') > -1).toBeTruthy();
        // The actual class name changes between environments,
        // instead we're checking for the format of the output
        expect(Object.keys(json)).toEqual(['class-name']);
        expect(Object.keys(json['class-name'])).toEqual(['name', 'composes', 'isReferenced']);
        expect(outputFileName).toBe('boom.css');
      }
    })
  ]).process(css2, { from: 'input.module.css', to: 'boom.css' });
  expect(moduleCssResult.css).not.toBe(minified2);
});

test('should work overwrite by lightningcssOptions.cssModules', () => {
  expect.assertions(1);

  return postcss([
    postcssLightningcss({
      cssModules: /\.module\.css/,
      lightningcssOptions: { cssModules: false }
    })
  ])
    .process(css2, { from: 'input.module.css' })
    .then((result) => expect(result.css).toBe(minified2));
});

const tests = [
  // TODO :: re-enable after https://github.com/parcel-bundler/lightningcss/issues/43
  // ["/* before */ rule { c: 1 } /*! after */", "rule{c:1}\n/*! after */"],
  // [
  //  `/* before */
  //          rule { d: 1 }
  //          /*! after */`,
  //  "rule{d:1}\n/*! after */"
  // ],
  [
    '.test { color: #ff0000; padding: 2px; padding-right: 3em; }',
    '.test{color:red;padding:2px 3em 2px 2px}'
  ],
  [
    '.super-super-super-super-super-long-selector { padding: 4px; color: blue } .super-super-super-super-super-long-selector, .b { color: red }',
    '.super-super-super-super-super-long-selector{color:#00f;padding:4px}.super-super-super-super-super-long-selector,.b{color:red}'
  ],
  // TODO :: invalid syntax isn't supported yet
  // https://github.com/parcel-bundler/lightningcss/issues/39
  /* [
    ".super-super-super-super-super-long-selector { padding: 4px; color: blue } .super-super-super-super-super-long-selector, .b { color: red !ie }",
    ".super-super-super-super-super-long-selector{padding:4px;color:red!ie}.b{color:red!ie}"
  ], */
  [
    `.a {
                color: red;
                width: 100px;
            }
            .b {
                width: 100px;
                color: rgba(1, 2, 3, .5);
            }`,
    '.a{color:red;width:100px}.b{color:#01020380;width:100px}'
  ],
  [
    '.test { padding-top: 1px; padding-right: 2px; padding-bottom: 1px; padding-left: 2px }',
    '.test{padding:1px 2px}'
  ]
];

for (const [input, expected] of tests) {
  test(`ast transformations: ${input}`, () => {
    expect.assertions(1);
    return postcss([postcssLightningcss({ forceMediaMerge: true })])
      .process(input)
      .then((result) => expect(result.css).toBe(expected));
  });
}
