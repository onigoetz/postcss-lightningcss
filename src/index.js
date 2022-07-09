const browserslist = require('browserslist');
const css = require('@parcel/css');

const SOURCEMAP_COMMENT = "sourceMappingURL=data:application/json;base64";

const defaultParcelCssOptions = {
  minify: true
};

function toBase64(content) {
  return Buffer.from(content).toString('base64');
}

function parcelCssPlugin (partialOptions = {}) {
  const parcelCssOptions = {
    ...defaultParcelCssOptions,
    ...(partialOptions.parcelCssOptions || {})
  };

  // @parcel/css uses a custom syntax to declare supported browsers
  // the `browsers` option provides a helper to declare them with
  // a `browerslist` query
  if (partialOptions.browsers != null) {
    const browsers = browserslist(partialOptions.browsers);
    parcelCssOptions.targets = css.browserslistToTargets(browsers);
  }

  return {
    postcssPlugin: 'postcss-parcel-css',
    OnceExit (root, { result, postcss }) {
      // Infer sourcemaps options from postcss
      const map = result.opts.map;

      const options = {
        filename: root.source.file || '',
        sourceMap: !!map,
        ...parcelCssOptions
      };

      const intermediateResult = root.toResult({
        map: map ? { inline: true } : false
      });

      options.code = Buffer.from(intermediateResult.css);

      const res = css.transform(options);

      let code = res.code.toString();

      // https://postcss.org/api/#sourcemapoptions
      if (map && res.map != null) {
        // If @parcel/css returned a map we'll use it
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

parcelCssPlugin.postcss = true;

module.exports = parcelCssPlugin;
