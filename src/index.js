const css = require('lightningcss');
const { prepareGlobalOptions, prepareOptions } = require('./options.js');

const SOURCEMAP_COMMENT = 'sourceMappingURL=data:application/json;base64';

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
  const dir = process.cwd();

  const lightningcssOptions = prepareGlobalOptions(dir, partialOptions);

  return {
    postcssPlugin: 'postcss-lightningcss',
    OnceExit (root, { result, postcss }) {
      const filename = (root?.source?.input.file) || '';
      // Infer sourcemaps options from postcss
      const map = result.opts.map;

      const options = prepareOptions(filename, map, lightningcssOptions, partialOptions);

      const intermediateResult = root.toResult({
        // The sourcemap needs to be inline for lightningcss to understand it
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

      if (options.cssModules && partialOptions.cssModulesJSON) {
        partialOptions.cssModulesJSON(
          filename,
          res.exports,
          result.opts.to
        );
      }

      result.root = postcss.parse(code, {
        from: result.opts.from,
        map
      });
    }
  };
}

lightningcssPlugin.postcss = true;

module.exports = lightningcssPlugin;
