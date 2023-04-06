// The tests here are largely inspired by the tests in postcss-csso

const test = require('ava');
const postcss = require('postcss');
const postcssNested = require('postcss-nested');
const postcssLightningcss = require('../src/index.js');

const css1 =
  '.a { color: #ff0000; } @media all { .b { color: rgba(255, 0, 0, 1) } }';
const css2  = '.class-name { color: green; } :global(.global-class-name) { color: green; }'
const minified2 = '.class-name{color:green}:global(.global-class-name){color:green}'
const minified1 = '.a{color:red}.b{color:red}';

test('works as a postcss plugin via .use()', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssLightningcss())
    .process(css1)
    .then((result) => t.is(result.css, minified1));
});

test('works as a postcss plugin via postcss([..]) w/o config', (t) => {
  t.plan(1);

  return postcss([postcssLightningcss])
    .process(css1)
    .then((result) => t.is(result.css, minified1));
});
test('works as a postcss plugin via postcss([..]) w/ config', (t) => {
  t.plan(1);

  return postcss([postcssLightningcss({})])
    .process(css1)
    .then((result) => t.is(result.css, minified1));
});

test('edge cases: should process empty', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssLightningcss)
    .process('')
    .then((result) => t.is(result.css, ''));
});

test('error handling: postcss error', async (t) => {
  const error = await t.throwsAsync(postcss([postcssLightningcss]).process('.test { color }'));

  t.is(error.name, 'CssSyntaxError');
  t.is(
    error.message,
    '<css input>:1:9: Unknown word'
  );
  t.is(error.line, 1);
  t.is(error.column, 9);
});

test('error handling: lightningcss error', async (t) => {
  const error = await t.throwsAsync(postcss([postcssLightningcss]).process('{foo:1}'));

  t.is(error.name, 'SyntaxError');
  t.is(
    error.message,
    'Invalid empty selector'
  );
  t.is(error.loc.line, 1);
  t.is(error.loc.column, 1);
});

// TODO :: postcss-nested is embedded inside lightningcss
// we should try to find other postcss plugins to test with
test('should work with postcss-nested', (t) => {
  t.plan(1);

  return postcss([postcssNested, postcssLightningcss])
    .process('.c { .touch &:hover { color: #ff0000; } }')
    .then((result) => t.is(result.css, '.touch .c:hover{color:red}'));
});

test('should work with cssmodules: boolean', async (t) => {

  const moduleCssResult = postcss([postcssLightningcss({ cssModules: true })])
    .process(css2, { from: 'input.css' })
  // css modules generate different hash on CI and local machine
  t.not(moduleCssResult.css, minified2)
  const nonModuleCssResult = await postcss([postcssLightningcss({ cssModules: false })])
    .process(css2, { from: 'input.css' })
  t.is(nonModuleCssResult.css, minified2)
});

test('should work with cssmodules: auto', async (t) => {

  const moduleCssResult = postcss([postcssLightningcss({ cssModules: 'auto' })])
    .process(css2, { from: 'input.module.css' })
  t.not(moduleCssResult.css, minified2)
  const nonModuleCssResult = await postcss([postcssLightningcss({ cssModules: 'auto' })])
    .process(css2, { from: 'input.css' })
  t.is(nonModuleCssResult.css, minified2)
});

test('should work with cssmodules: regex', async (t) => {
  const moduleCssResult = await postcss([postcssLightningcss({ cssModules: /\.custom\.css/ })])
    .process(css2, { from: 'input.custom.css' })
  t.not(moduleCssResult.css, minified2);
  
  const nonModuleCssResult = await postcss([postcssLightningcss({ cssModules: /\.custom\.css/ })])
    .process(css2, { from: 'input.module.css' })
  t.is(nonModuleCssResult.css, minified2);
});

test('should work overwrite by lightningcssOptions.cssModules', (t) => {
  t.plan(1);

  return postcss([postcssLightningcss({ cssModules: /\.module\.css/, lightningcssOptions: { cssModules: false } })])
    .process(css2, { from: 'input.module.css' })
    .then((result) => t.is(result.css, minified2));
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
    '.a{color:red;width:100px}.b{width:100px;color:#01020380}'
  ],
  [
    '.test { padding-top: 1px; padding-right: 2px; padding-bottom: 1px; padding-left: 2px }',
    '.test{padding:1px 2px}'
  ]
];

for (const [input, expected] of tests) {
  test(`ast transformations: ${input}`, (t) => {
    t.plan(1);
    return postcss([postcssLightningcss({ forceMediaMerge: true })])
      .process(input)
      .then((result) => t.is(result.css, expected));
  });
}
