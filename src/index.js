const browserslist = require('browserslist');
const css = require('lightningcss');

const SOURCEMAP_COMMENT = 'sourceMappingURL=data:application/json;base64';

const defaultLightningcssOptions = {
  minify: true
};

function toBase64 (content) {
  return Buffer.from(content).toString('base64');
}

/**
 * @typedef {Object} LightningcssPluginOptions
 * @property {boolean | RegExp | 'auto' | undefined} cssModules
 * @param partialOptions {LightningcssPluginOptions}
 * @returns {import('postcss').Plugin}
 */
function lightningcssPlugin (partialOptions = {}) {
  const lightningcssOptions = {
    ...defaultLightningcssOptions,
    ...(partialOptions.lightningcssOptions || {})
  };

  // lightningcss uses a custom syntax to declare supported browsers
  // the `browsers` option provides a helper to declare them with
  // a `browerslist` query
  if (partialOptions.browsers != null) {
    const browsers = browserslist(partialOptions.browsers);
    lightningcssOptions.targets = css.browserslistToTargets(browsers);
  }

  return {
    postcssPlugin: 'postcss-lightningcss',
    OnceExit (root, { result, postcss }) {
      // Infer sourcemaps options from postcss
      const map = result.opts.map;

      const filename = (root.source && root.source.input.file) || '';
      let cssModules = typeof lightningcssOptions.cssModules === 'boolean'
        ? lightningcssOptions.cssModules
        : partialOptions.cssModules || false;

      if (cssModules === 'auto') {
        cssModules = /\.module(s)?\.\w+$/i;
      }
      // Promise cssModules: boolean or RegExp
      cssModules = typeof cssModules === 'boolean'
        ? cssModules
        : cssModules && cssModules.test(filename);

      const options = {
        filename,
        sourceMap: !!map,
        ...lightningcssOptions,
        cssModules
      };

      const intermediateResult = root.toResult({
        map: map ? { inline: true } : false
      });

      options.code = Buffer.from(intermediateResult.css);

      const res = css.transform(options);

      let code = res.code.toString();

      // https://postcss.org/api/#sourcemapoptions
      if (map && res.map != null) {
        // If lightningcss returned a map we'll use it
        const prev = res.map.toString();

        if (typeof map === 'object') {
          map.prev = prev;
        } else {
          // `map` was set to a boolean true
          // Which means that the sourcemap is output as inline
          // the only way to keep it as inline is to inline it in the input
          code = `${code}\n/*# ${SOURCEMAP_COMMENT},${toBase64(prev)} */`;
        }
      }

      result.root = postcss.parse(code, {
        // TODO :: should we pass more options ?
        from: result.opts.from,
        map
      });
    }
  };
}

lightningcssPlugin.postcss = true;

module.exports = lightningcssPlugin;
