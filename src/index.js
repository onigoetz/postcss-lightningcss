const browserslist = require('browserslist');
const css = require('@parcel/css');

const defaultOptions = {
  parcelCssOptions: {
    // Disabled for now as we have no way to feed the sourcemap from postcss to @parcel/css
    // Or from @parcel/css to postcss
    // might be doable by doing : https://github.com/parcel-bundler/parcel/blob/v2/packages/transformers/css-experimental/src/CSSTransformer.js#L54-L64
    sourceMap: false,
    minify: true
  }
};

function parcelCssPlugin (options = {}) {
  const initializedOptions = {
    ...defaultOptions,
    ...options,
    parcelCssOptions: {
      ...defaultOptions.parcelCssOptions,
      ...(options.parcelCssOptions || {})
    }
  };

  if (initializedOptions.browsers != null) {
    const browsers = browserslist(initializedOptions.browsers);
    initializedOptions.parcelCssOptions.targets =
      css.browserslistToTargets(browsers);
  }

  return {
    postcssPlugin: 'postcss-parcel-css',
    OnceExit (root, { result, postcss }) {
      const fullOptions = {
        filename: root.source.file || '',

        ...initializedOptions.parcelCssOptions
      };

      const intermediateResult = root.toResult({
        map: !!fullOptions.sourceMap
      });

      fullOptions.code = Buffer.from(intermediateResult.css);

      const res = css.transform(fullOptions);

      result.root = postcss.parse(res.code.toString(), {
        from: root.source.file
      });
    }
  };
}

parcelCssPlugin.postcss = true;

module.exports = parcelCssPlugin;
