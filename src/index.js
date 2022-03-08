const browserslist = require('browserslist');
const css = require('@parcel/css');
const remapping = require('@ampproject/remapping');

const defaultParcelCssOptions = {
  minify: true
};

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
        map: map ? { annotation: false, inline: false } : false
      });

      options.code = Buffer.from(intermediateResult.css);

      const res = css.transform(options);

      // If we have a source map from PostCSS and @parcel/css
      // we can merge the two together to get the original positions
      let prev = null;
      if (res.map != null && intermediateResult.map != null) {
        const remapped = remapping(
          [res.map.toString(), intermediateResult.map.toString()],
          () => null
        );

        prev = remapped.toString();
      } else if (res.map != null) {
        // If we only have the source map from @parcel/css we'll at least use that
        prev = res.map.toString();
      }

      let code = res.code.toString();

      // https://postcss.org/api/#sourcemapoptions
      if (map) {
        if (typeof map === 'object') {
          map.prev = prev;
        } else {
          // `map` was set to a boolean true
          // Which means that the sourcemap is output as inline
          // the only way to keep it as inline is to inline it in the input
          code = `${code}\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from(
            prev
          ).toString('base64')} */`;
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
