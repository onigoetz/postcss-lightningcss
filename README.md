# postcss-parcel-css

This PostCSS plugin uses [@parcel/css](https://www.npmjs.com/package/@parcel/css) to compile and minify your CSS.

`@parcel/css` is more than a minifier as it can replace quite a few PostCSS plugins such as `autoprefixer`.
You can find the complete list of features in the [package's documentation](https://github.com/parcel-bundler/parcel-css#from-node) and the list of plugins it's able to replace below.

## Install

```
yarn add -D postcss-parcel-css
```

## Usage

```javascript
const postcss = require("postcss");
const postcssParcelCss = require("postcss-parcel-css");

postcss([postcssParcelCss(/* pluginOptions */)]).process(
  YOUR_CSS /*, processOptions */
);
```

## Options

```javascript
const postcssParcelCss = require("postcss-parcel-css");

postcssParcelCss({
  // Use a browserslist query that will inform which browsers are supported
  // Will add or remove vendor prefixes that are needed or not anymore
  browsers: ">= .25%",
  // Will pass all options to @parcel/css
  // Check out their documentation for details:
  // https://www.npmjs.com/package/@parcel/css#user-content-documentation
  parcelCssOptions: {
    // Enable minification (default: true)
    minify: true,

    // Enable source maps (default: true)
    sourceMap: true,

    // Compile as cssModules (default: undefined)
    cssModules: false,

    // For which browsers to compile (default: undefined)
    // Can be omitted if you set the `browsers` option
    targets: {
      safari: (13 << 16) | (2 << 8), // represents Safari 13.2.0
    },

    // Individually enable various drafts
    drafts: {
      // Enable css nesting (default: undefined)
      nesting: false,
    },
  },
});
```

The detailed list of `parcelCssOptions` can be found [here](https://github.com/parcel-bundler/parcel-css/blob/master/node/index.d.ts)

## About source maps

Source maps will pass through `@parcel/css`.
But many mappings will be lost in translation; __`@parcel/css` creates only a source map for selectors__.
Mappings for properties cannot be re-created after this transformation.

## PostCSS plugins that you can remove if you have `@parcel/css`

The rows marked as "Depends on browser config" will convert your CSS only if:
1. You set the `browsers` or `parcelCssOptions.targets` options
2. one of the target browsers doesn't support the feature

| PostCSS Plugin                      | @parcel/css option                    |
| ----------------------------------- | ------------------------------------- |
| `autoprefixer`                      | Depends on browser config             |
| `postcss-clamp`                     | Depends on browser config             |
| `postcss-color-hex-alpha`           | Depends on browser config             |
| `postcss-color-hsl`                 | Depends on browser config             |
| `postcss-color-rgb`                 | Depends on browser config             |
| `postcss-custom-media`              | `parcelCssOptions.drafts.customMedia` |
| `postcss-double-position-gradients` | Depends on browser config             |
| `postcss-media-minmax`              | Depends on browser config             |
| `postcss-multi-value-display`       | Depends on browser config             |
| `postcss-nesting`                   | `parcelCssOptions.drafts.nesting`     |
| `postcss-overflow-shorthand`        | Depends on browser config             |
| `postcss-place`                     | Depends on browser config             |
| `postcss-logical`                   | Depends on browser config (1)         |

1. `@parcel/css` doesn't support the [`logical` shorthand keyword](https://drafts.csswg.org/css-logical/#logical-shorthand-keyword) as its syntax is likely to change

## License

MIT
