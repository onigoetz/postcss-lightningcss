const { test, expect } = require('@rstest/core');
const postcss = require('postcss');
const postcssScss = require('postcss-scss');
const postcssAdvancedVariables = require('@knagis/postcss-advanced-variables');
const postcssLightningcss = require('../src/index.js');

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
const minifiedCSS1 = '.icon-foo{background:url(assets/icons/foo.png)}.icon-bar{background:url(assets/icons/bar.png)}.icon-baz{background:url(assets/icons/baz.png)}.col-3{width:30%}.col-5{width:50%}';
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

test('Should not add a sourcemap when nothing is specified', () => {
  expect.assertions(1);

  return postcss()
    .use(postcssLightningcss())
    .process(
      '.test { color: #ff0000; padding: 2px; padding-right: 3em; }'
    )
    .then((result) =>
      expect(result.css).toBe(
        '.test{color:red;padding:2px 3em 2px 2px}'
      )
    );
});

test('Should not add a sourcemap when disabled', () => {
  expect.assertions(1);

  return postcss()
    .use(postcssLightningcss())
    .process(
      '.test { color: #ff0000; padding: 2px; padding-right: 3em; }',
      { map: false }
    )
    .then((result) =>
      expect(result.css).toBe(
        '.test{color:red;padding:2px 3em 2px 2px}'
      )
    );
});

test('should remap the sourcemap to the original file', () => {
  expect.assertions(2);

  return postcss()
    .use(postcssAdvancedVariables())
    .use(postcssLightningcss())
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

      expect(result.css).toBe(minifiedCSS1);
      expect(result.map.toJSON()).toEqual(minifiedSourceMap1);
    });
});

test('should remap the sourcemap to the original file, inline sourcemaps', () => {
  expect.assertions(2);

  return postcss()
    .use(postcssAdvancedVariables())
    .use(postcssLightningcss())
    .process(inputCSS1, { from: 'input.css', parser: postcssScss, map: { inline: true } })
    .then((result) => {
      expect(result.css.split('\n')[0]).toBe(minifiedCSS1);

      // Extract the sourcemap for comparison
      const sourcemapComment = result.css.split('\n')[1];
      const base64 = sourcemapComment.split(';base64,')[1].split(' ')[0];

      expect(JSON.parse(Buffer.from(base64, 'base64'))).toEqual(minifiedSourceMap1);
    });
});

test('should remap the sourcemap to the original file, boolean option', () => {
  expect.assertions(2);

  return postcss()
    .use(postcssAdvancedVariables())
    .use(postcssLightningcss())
    .process(inputCSS1, { from: 'input.css', parser: postcssScss, map: true })
    .then((result) => {
      expect(result.css.split('\n')[0]).toBe(minifiedCSS1);

      // Extract the sourcemap for comparison
      const sourcemapComment = result.css.split('\n')[1];
      const base64 = sourcemapComment.split(';base64,')[1].split(' ')[0];

      expect(JSON.parse(Buffer.from(base64, 'base64'))).toEqual(minifiedSourceMap1);
    });
});
