# postcss-lightningcss

[![GitHub CI](https://github.com/onigoetz/postcss-lightningcss/actions/workflows/build.yml/badge.svg)](https://github.com/onigoetz/postcss-lightningcss) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=onigoetz_postcss-lightningcss&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=onigoetz_postcss-lightningcss) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=onigoetz_postcss-lightningcss&metric=coverage)](https://sonarcloud.io/summary/new_code?id=onigoetz_postcss-lightningcss)

This PostCSS plugin uses [lightningcss](https://lightningcss.dev/) to compile and minify your CSS.

`lightningcss` is more than a minifier as it can replace quite a few PostCSS plugins such as `autoprefixer`.
You can find the complete list of features in the [package's documentation](https://github.com/parcel-bundler/lightningcss#from-node) and the list of plugins it's able to replace below.

## Install

```
yarn add -D postcss-lightningcss
```

## Usage

```javascript
const postcss = require("postcss");
const postcssLightningcss = require("postcss-lightningcss");

postcss([postcssLightningcss(/* pluginOptions */)]).process(
  YOUR_CSS /*, processOptions */
);
```

## Options

```javascript
const postcssLightningcss = require("postcss-lightningcss");

postcssLightningcss({
  // Use a browserslist query that will inform which browsers are supported
  // Will add or remove vendor prefixes that are needed or not anymore
  browsers: ">= .25%",
  // Auto set lightningcssOptions.cssModules, possible values:
  // - auto - enable CSS modules for all files matching `/\.module(s)?\.\w+$/i.test(filename)`
  // - RegExp - enable CSS modules for all files matching `/RegExp/i.test(filename)`
  // - boolean - true enable css modules for all files
  // Will be overwrite by the lightningcssOptions cssModules(boolean) option
  cssModules: /\.module\.css/,

  // Callback containing the transformed class names for cssModules
  // this runs only if cssModules is enabled
  cssModulesJSON(cssFileName: string, json: object, outputFileName: string): {},
  // Will pass all options to lightningcss
  // Check out their documentation for details:
  // https://www.npmjs.com/package/lightningcss#user-content-documentation
  lightningcssOptions: {
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

The detailed list of `lightningcssOptions` can be found [here](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts)

### CSS Modules

When transforming CSS Modules, class names get changed, to get the mapping of the class names, you can specify a `cssModulesJSON` function like the following:

```javascript
const path = require("path");
const fs = require("fs");

postcssLightningcss({
  cssModules: /\.module\.css/,
  cssModulesJSON(cssFileName, json, outputFileName) {
    const cssName = path.basename(cssFileName, ".css");
    const jsonFileName = path.resolve("./build/" + cssName + ".json");
    fs.writeFileSync(jsonFileName, JSON.stringify(json));
  },
});
```

You may also combine this with [custom naming patterns](https://lightningcss.dev/css-modules.html#custom-naming-patterns):

```javascript
postcssLightningcss({
  cssModulesJSON(cssFileName, json, outputFileName) {
    // Your export function here
  },
  lightningcssOptions: {
    cssModules: {
      pattern: "my-company-[name]-[hash]-[local]",
    },
  },
});
```

> Note that using a custom pattern cannot be used at the same time as using a RegEx to conditionally enable cssModules because the `cssModules` option within `lightningcssOptions` takes precedence over the plugin's `cssModules` option

## About source maps

Source maps will pass through `lightningcss`.
But many mappings will be lost in translation; **`lightningcss` creates only a source map for selectors**.
Mappings for properties cannot be re-created after this transformation.

## PostCSS plugins that you can remove if you have `lightningcss`

> This list is not exhaustive, if you have a doubt, have a look at the [Lightning CSS Playground](https://lightningcss.dev/playground/index.html)

The rows marked as "Depends on browser config" will convert your CSS only if:

1. You set the `browsers` or `lightningcssOptions.targets` options
2. one of the target browsers doesn't support the feature

| PostCSS Plugin                          | lightningcss option                      |
| --------------------------------------- | ---------------------------------------- |
| `autoprefixer`                          | Depends on browser config                |
| `postcss-clamp`                         | Depends on browser config                |
| `postcss-color-hex-alpha`               | Depends on browser config                |
| `postcss-color-hsl`                     | Depends on browser config                |
| `postcss-color-rgb`                     | Depends on browser config                |
| `postcss-color-function`                | Depends on browser config                |
| `postcss-color-rebeccapurple`           | Depends on browser config                |
| `postcss-custom-media`                  | `lightningcssOptions.drafts.customMedia` |
| `postcss-double-position-gradients`     | Depends on browser config                |
| `postcss-hwb-function`                  | Depends on browser config                |
| `postcss-lab-function`                  | Depends on browser config                |
| `postcss-logical`                       | Depends on browser config (1)            |
| `postcss-media-minmax`                  | Depends on browser config                |
| `postcss-multi-value-display`           | Depends on browser config                |
| `postcss-nesting`                       | `lightningcssOptions.drafts.nesting`     |
| `postcss-normalize-display-values`      | Depends on browser config                |
| `postcss-oklab-function`                | Depends on browser config                |
| `postcss-overflow-shorthand`            | Depends on browser config                |
| `postcss-place`                         | Depends on browser config                |
| `postcss-progressive-custom-properties` | Depends on browser config (2)            |

1. `lightningcss` doesn't support the [`logical` shorthand keyword](https://drafts.csswg.org/css-logical/#logical-shorthand-keyword) as its syntax is likely to change
2. Progressive custom properties works only if the properties don't contain properties themselves:

- `lab(29.2345% 39.3825 20.0664)` has a proper fallback
- `oklch(40% 0.234 0.39 / var(--opacity-50))` will not have a fallback

## License

MIT
