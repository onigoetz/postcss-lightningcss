const test = require("ava");
const { prepareGlobalOptions, prepareOptions } = require("../src/options.js");

test("global: sets default config", (t) => {
  const result = prepareGlobalOptions({});

  t.deepEqual(result, { minify: true });
});

test("global: passes other options through", (t) => {
  const result = prepareGlobalOptions({
    lightningcssOptions: { drafts: { nesting: true } },
  });

  t.deepEqual(result, { minify: true, drafts: { nesting: true } });
});

test("global: prepares browser targets", (t) => {
  const result = prepareGlobalOptions({
    browsers: "chrome 95",
  });

  t.deepEqual(result, {
    minify: true,
    targets: {
      chrome: 95 << 16,
    },
  });
});

test("per-file: override automatic source-map", (t) => {
  const lightningcssOptions = {
    minify: true,
    sourceMap: true,
  };
  const pluginOptions = {};

  const sourceMap = false;
  const filename = "file.css";

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  t.deepEqual(options, {
    filename,
    sourceMap: true,
    minify: true,
  });
});

test("per-file: automatic css-modules: enable", (t) => {
  const lightningcssOptions = {
    minify: true,
  };
  const pluginOptions = {
    cssModules: "auto",
  };

  const sourceMap = true;
  const filename = "file.module.css";

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  t.deepEqual(options, {
    filename,
    sourceMap,
    minify: true,
    cssModules: true,
  });
});

test("per-file: automatic css-modules: disable", (t) => {
  const lightningcssOptions = {
    minify: true,
  };
  const pluginOptions = {
    cssModules: "auto",
  };

  const sourceMap = true;
  const filename = "file.css";

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  t.deepEqual(options, {
    filename,
    sourceMap,
    minify: true,
    cssModules: false,
  });
});

test("per-file: automatic css-modules: always on", (t) => {
  const lightningcssOptions = {
    minify: true,
    cssModules: true,
  };
  const pluginOptions = {
    cssModules: "auto", // should be ignored
  };

  const sourceMap = true;
  const filename = "file.css";

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  t.deepEqual(options, {
    filename,
    sourceMap,
    minify: true,
    cssModules: true,
  });
});

test("per-file: automatic css-modules: regex", (t) => {
  const lightningcssOptions = {
    minify: true,
  };
  const pluginOptions = {
    cssModules: /\.this-is-a-module(s)?\.\w+$/,
  };

  const sourceMap = true;
  const filename = "file.this-is-a-module.css";

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  t.deepEqual(options, {
    filename,
    sourceMap,
    minify: true,
    cssModules: true,
  });
});

test("per-file: automatic css-modules: custom pattern", (t) => {
  const lightningcssOptions = {
    minify: true,
    cssModules: {
      pattern: "my-company-[name]-[hash]-[local]",
    },
  };
  const pluginOptions = {
    cssModules: "auto", // should be ignored
  };

  const sourceMap = true;
  const filename = "file.css";

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  t.deepEqual(options, {
    filename,
    sourceMap,
    minify: true,
    cssModules: {
      pattern: "my-company-[name]-[hash]-[local]",
    },
  });
});

test("per-file: automatic css-modules: custom pattern, at plugin level", (t) => {
  const lightningcssOptions = {
    minify: true,
  };
  const pluginOptions = {
    cssModules: {
      pattern: "my-company-[name]-[hash]-[local]",
    },
  };

  const sourceMap = true;
  const filename = "file.css";

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  t.deepEqual(options, {
    filename,
    sourceMap,
    minify: true,
    cssModules: {
      pattern: "my-company-[name]-[hash]-[local]",
    },
  });
});
