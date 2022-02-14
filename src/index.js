const browserslist = require("browserslist");
const css = require("@parcel/css");
const remapping = require("@ampproject/remapping");

const defaultParcelCssOptions = {
  minify: true,
};

function parcelCssPlugin(partialOptions = {}) {
  const parcelCssOptions = {
    ...defaultParcelCssOptions,
    ...(partialOptions.parcelCssOptions || {}),
  };

  // @parcel/css uses a custom syntax to declare supported browsers
  // the `browsers` option provides a helper to declare them with
  // a `browerslist` query
  if (partialOptions.browsers != null) {
    const browsers = browserslist(partialOptions.browsers);
    parcelCssOptions.targets = css.browserslistToTargets(browsers);
  }

  return {
    postcssPlugin: "postcss-parcel-css",
    OnceExit(root, { result, postcss }) {
      // Infer sourcemaps options from postcss
      const map = result.opts.map;

      const options = {
        filename: root.source.file || "",
        sourceMap: !!map,
        ...parcelCssOptions,
      };

      const intermediateResult = root.toResult({
        map: map ? { annotation: false, inline: false } : false,
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

      result.root = postcss.parse(
        map
          ? `${res.code.toString()}\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from(
              prev
            ).toString("base64")} */`
          : res.code.toString(),
        {
          // TODO :: should we pass more options ?
          from: result.opts.from,
          map
        }
      );
    },
  };
}

parcelCssPlugin.postcss = true;

module.exports = parcelCssPlugin;
