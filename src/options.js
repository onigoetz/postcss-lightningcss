const browserslist = require("browserslist");
const css = require("lightningcss");

const defaultLightningcssOptions = {
  minify: true,
};

function prepareGlobalOptions(pluginOptions = {}) {
  const lightningcssOptions = {
    ...defaultLightningcssOptions,
    ...(pluginOptions.lightningcssOptions || {}),
  };

  // lightningcss uses a custom syntax to declare supported browsers
  // the `browsers` option provides a helper to declare them with
  // a `browerslist` query
  if (pluginOptions.browsers != null) {
    const browsers = browserslist(pluginOptions.browsers);
    lightningcssOptions.targets = css.browserslistToTargets(browsers);
  }

  return lightningcssOptions;
}

function setCssModulesOption(filename, options, pluginOptions) {
  let cssModules = pluginOptions.cssModules;

  if (!cssModules) {
    return;
  }

  if (cssModules === "auto") {
    cssModules = /\.module(s)?\.\w+$/i;
  }

  if (cssModules instanceof RegExp) {
    options.cssModules = cssModules.test(filename);
    return;
  }

  // At this stage, cssModules is a truthy value
  // and pass it through
  options.cssModules = cssModules;
}

function prepareOptions(filename, map, lightningcssOptions, pluginOptions) {
  const options = {
    filename,
    sourceMap: !!map,
    ...lightningcssOptions,
  };

  if (!options.hasOwnProperty("cssModules")) {
    setCssModulesOption(filename, options, pluginOptions);
  }

  return options;
}

module.exports = { prepareGlobalOptions, prepareOptions };
