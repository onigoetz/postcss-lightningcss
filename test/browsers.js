const test = require('ava');
const postcss = require('postcss');
const postcssParcelCss = require('../src/index.js');

const css1 = `.foo {
    background: yellow;

    -webkit-border-radius: 2px;
    -moz-border-radius: 2px;
    border-radius: 2px;

    -webkit-transition: background 200ms;
    -moz-transition: background 200ms;
    transition: background 200ms;
}`;
const minified1 =
  '.foo{background:#ff0;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px;-webkit-transition:background .2s;-moz-transition:background .2s;transition:background .2s}';
const minified2 =
  '.foo{background:#ff0;border-radius:2px;transition:background .2s}';

test('Should not remove prefixes without a list of browsers', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss())
    .process(css1)
    .then((result) => t.is(result.css, minified1));
});

test('Should remove prefixes when browsers are set', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'chrome 95' }))
    .process(css1)
    .then((result) => t.is(result.css, minified2));
});

test('Should remove prefixes when targets are set', (t) => {
  t.plan(1);

  return postcss()
    .use(
      postcssParcelCss({ parcelCssOptions: { targets: { chrome: 6225920 } } })
    )
    .process(css1)
    .then((result) => t.is(result.css, minified2));
});

test('Should convert logical properties', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process(`.banner {
        color: #222222;
        inset: 0 5px 10px;
        padding-inline: 20px 40px;
        resize: block;
        transition: color 200ms;
      }`)
    .then((result) =>
      t.is(
        result.css,
        '.banner{color:#222;resize:block;padding-left:var(--ltr,20px)var(--rtl,40px);padding-right:var(--ltr,40px)var(--rtl,20px);transition:color .2s;top:0;bottom:10px;left:5px;right:5px}[dir=ltr]{--ltr:initial;--rtl: }[dir=rtl]{--ltr: ;--rtl:initial}'
      )
    );
});

test('Should convert hwb colors', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process('body { color: hwb(90, 0%, 0%, 0.5); }')
    .then((result) => t.is(result.css, 'body{color:rgba(128,255,0,.5)}'));
});

test('Should convert space separated hsl colors', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process('body { color: hsl(200grad 100% 50% / 20%); }')
    .then((result) => t.is(result.css, 'body{color:rgba(0,255,255,.2)}'));
});

test('Should convert space separated rgba colors', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process('body { color: rgba(0 255 255 / 20%); }')
    .then((result) => t.is(result.css, 'body{color:rgba(0,255,255,.2)}'));
});

test('Should convert clamp', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process('body { width: clamp(10px, 4em, 80px); }')
    .then((result) => t.is(result.css, 'body{width:max(10px,min(4em,80px))}'));
});

test('Should convert multi value display', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process('body { display: block flow; }')
    .then((result) => t.is(result.css, 'body{display:block}'));
});

test('Should convert overflow shorthand', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process('body { overflow: hidden auto; }')
    .then((result) =>
      t.is(result.css, 'body{overflow-x:hidden;overflow-y:auto}')
    );
});

test('Should convert alignment shorthand', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process(
      '.example { place-self: center; place-content: space-between center; }'
    )
    .then((result) =>
      t.is(
        result.css,
        '.example{align-content:space-between;justify-content:center;align-self:center;justify-self:center}'
      )
    );
});

test('Should convert double position gradients', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process(
      'body { background-image: linear-gradient(90deg, black 25% 50%, blue 50% 75%); }'
    )
    .then((result) =>
      t.is(
        result.css,
        'body{background-image:linear-gradient(90deg,#000 25%,#000 50%,#00f 50%,#00f 75%)}'
      )
    );
});

test('Should convert media query range', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss({ browsers: 'edge 18' }))
    .process(
      '@media screen and (500px <= width <= 1200px) {.bar { display: block;}}'
    )
    .then((result) =>
      t.is(
        result.css,
        '@media screen and (min-width:500px) and (max-width:1200px){.bar{display:block}}'
      )
    );
});
