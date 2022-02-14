# postcss-parcel-css

This postcss plugin uses [@parcel/css](https://www.npmjs.com/package/@parcel/css) to compile and minify your CSS.

`@parcel/css` is more than a minifier as it is able to replace quite a few postcss plugins like `autoprefixer` You can find the full list of features in the package's documentation and the full list of plugins it's able to replace below.

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
const postcssParcelCss = require('postcss-parcel-css');

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
            safari: (13 << 16) | (2 << 8) // represents Safari 13.2.0
        },

        // Individually enable various drafts
        drafts: {
            // Enable css nesting (default: undefined)
            nesting: false
        }
    }
})
```

## About source maps

Source map support isn't implemented properly at the moment, use it at your own risk

## Postcss plugins that you can remove if you have @parcel/css

Some rows are marked as "Depends on browser config" which means that the `browsers` or `parcelCssOptions.targets` options must be set and one of the target browsers doesn't support the feature for it to be enabled.

| PostCSS Plugin                      | @parcel/css option                |
| ----------------------------------- | --------------------------------- |
| `autoprefixer`                      | Depends on browser config         |
| `postcss-clamp`                     | Depends on browser config         |
| `postcss-color-hex-alpha`           | Depends on browser config         |
| `postcss-color-hsl`                 | Depends on browser config         |
| `postcss-color-rgb`                 | Depends on browser config         |
| `postcss-double-position-gradients` | Depends on browser config         |
| `postcss-media-minmax`              | Depends on browser config         |
| `postcss-multi-value-display`       | Depends on browser config         |
| `postcss-nesting`                   | `parcelCssOptions.drafts.nesting` |
| `postcss-overflow-shorthand`        | Depends on browser config         |
| `postcss-place`                     | Depends on browser config         |
| `postcss-logical`                   | Depends on browser config (1)     |

1. `@parcel/css` doesn't support the [`logical` shorthand keyword](https://drafts.csswg.org/css-logical/#logical-shorthand-keyword) as its syntax is likely to change

## License

MIT
