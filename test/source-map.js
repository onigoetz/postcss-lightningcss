const test = require('ava');
const postcss = require('postcss');
const postcssScss = require('postcss-scss');
const postcssAdvancedVariables = require('@knagis/postcss-advanced-variables');
const postcssParcelCss = require('../src/index.js');

const inputCSS1 = `$dir: assets/icons;

@each $icon in (foo, bar, baz) {
  .icon-$icon {
    background: url('$dir/$icon.png');
  }
}

@for $count from 1 to 5 by 2 {
  @if $count > 2 {
    .col-$count {
      width: #{$count}0%;
    }
  }
}
`;
const minifiedCSS1 = `.icon-foo{background:url(assets/icons/foo.png)}.icon-bar{background:url(assets/icons/bar.png)}.icon-baz{background:url(assets/icons/baz.png)}.col-3{width:30%}.col-5{width:50%}
/*# sourceMappingURL=input.css.map */`;
const minifiedSourceMap1 = {
  version: 3,
  sources: ['input.css'],
  names: [],
  mappings: 'AAGE,UAAA,oCAAA,CAAA,UAAA,oCAAA,CAAA,UAAA,oCAAA,CAOE,OAAA,SAAA,CAAA,OAAA,SAAA',
  file: 'input.css',
  sourcesContent: [
    inputCSS1 // The sourceContent in the sourcemap should be the original source
  ]
};

test('Should not add a sourcemap when nothing is specified', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss())
    .process(
      '.test { color: #ff0000; padding: 2px; padding-right: 3em; }'
    )
    .then((result) =>
      t.is(
        result.css,
        '.test{color:red;padding:2px 3em 2px 2px}'
      )
    );
});

test('Should not add a sourcemap when disabled', (t) => {
  t.plan(1);

  return postcss()
    .use(postcssParcelCss())
    .process(
      '.test { color: #ff0000; padding: 2px; padding-right: 3em; }',
      { map: false }
    )
    .then((result) =>
      t.is(
        result.css,
        '.test{color:red;padding:2px 3em 2px 2px}'
      )
    );
});

test('should remap the sourcemap to the original file', (t) => {
  t.plan(2);

  return postcss()
    .use(postcssAdvancedVariables())
    .use(postcssParcelCss())
    .process(inputCSS1, { from: 'input.css', parser: postcssScss, map: { inline: false } })
    .then((result) => {
      // Debugging
      // Source maps can be checked in https://evanw.github.io/source-map-visualization/ or https://sokra.github.io/source-map-visualization/

      // - Intermediate result
      // require("fs").writeFileSync("intermediate.css", root.toResult({ map: { inline: true } }).css);

      // - Minified
      // require("fs").writeFileSync(
      //   "minified.css",
      //   `${res.code.toString()}\n/*# sourceMappingURL=data:application/json;base64,${res.map.toString("base64")} */`
      // );

      // - Remapped
      // require("fs").writeFileSync(
      //   "remapped.css",
      //   `${res.code.toString()}\n/*# sourceMappingURL=data:application/json;base64,${btoa(remapped.toString())} */`
      // );

      // - Final
      // console.log(`https://sokra.github.io/source-map-visualization/#base64,${btoa(result.css)},${btoa(result.map.toString())},${btoa(inputCSS1)}`);
      // require('fs').writeFileSync('final.css', result.css.replace("input.css.map", `data:application/json;base64,${btoa(result.map.toString())}`))

      t.is(result.css, minifiedCSS1);
      t.deepEqual(result.map.toJSON(), minifiedSourceMap1);
    });
});
