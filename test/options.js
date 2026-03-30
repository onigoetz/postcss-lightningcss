const path = require('path');
const { prepareGlobalOptions, prepareOptions } = require('../src/options.js');

test('global: sets default config', () => {
  const result = prepareGlobalOptions(path.join(__dirname, '..'), {});

  expect(result).toEqual({ minify: true });
});

test('global: passes other options through', () => {
  const result = prepareGlobalOptions(path.join(__dirname, '..'), {
    lightningcssOptions: { drafts: { nesting: true } }
  });

  expect(result).toEqual({ minify: true, drafts: { nesting: true } });
});

test('global: use browserslist config', () => {
  const result = prepareGlobalOptions(path.join(__dirname, 'fixtures', 'browserslist'));

  expect(result).toEqual({
    minify: true,
    targets: {
      chrome: 100 << 16
    }
  });
});

test('global: prepares browser targets', () => {
  const result = prepareGlobalOptions(path.join(__dirname, '..'), {
    browsers: 'chrome 95'
  });

  expect(result).toEqual({
    minify: true,
    targets: {
      chrome: 95 << 16
    }
  });
});

test('per-file: override automatic source-map', () => {
  const lightningcssOptions = {
    minify: true,
    sourceMap: true
  };
  const pluginOptions = {};

  const sourceMap = false;
  const filename = 'file.css';

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  expect(options).toEqual({
    filename,
    sourceMap: true,
    minify: true
  });
});

test('per-file: automatic css-modules: enable', () => {
  const lightningcssOptions = {
    minify: true
  };
  const pluginOptions = {
    cssModules: 'auto'
  };

  const sourceMap = true;
  const filename = 'file.module.css';

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  expect(options).toEqual({
    filename,
    sourceMap,
    minify: true,
    cssModules: true
  });
});

test('per-file: automatic css-modules: disable', () => {
  const lightningcssOptions = {
    minify: true
  };
  const pluginOptions = {
    cssModules: 'auto'
  };

  const sourceMap = true;
  const filename = 'file.css';

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  expect(options).toEqual({
    filename,
    sourceMap,
    minify: true,
    cssModules: false
  });
});

test('per-file: automatic css-modules: always on', () => {
  const lightningcssOptions = {
    minify: true,
    cssModules: true
  };
  const pluginOptions = {
    cssModules: 'auto' // should be ignored
  };

  const sourceMap = true;
  const filename = 'file.css';

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  expect(options).toEqual({
    filename,
    sourceMap,
    minify: true,
    cssModules: true
  });
});

test('per-file: automatic css-modules: regex', () => {
  const lightningcssOptions = {
    minify: true
  };
  const pluginOptions = {
    cssModules: /\.this-is-a-module(s)?\.\w+$/
  };

  const sourceMap = true;
  const filename = 'file.this-is-a-module.css';

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  expect(options).toEqual({
    filename,
    sourceMap,
    minify: true,
    cssModules: true
  });
});

test('per-file: automatic css-modules: custom pattern', () => {
  const lightningcssOptions = {
    minify: true,
    cssModules: {
      pattern: 'my-company-[name]-[hash]-[local]'
    }
  };
  const pluginOptions = {
    cssModules: 'auto' // should be ignored
  };

  const sourceMap = true;
  const filename = 'file.css';

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  expect(options).toEqual({
    filename,
    sourceMap,
    minify: true,
    cssModules: {
      pattern: 'my-company-[name]-[hash]-[local]'
    }
  });
});

test('per-file: automatic css-modules: custom pattern, at plugin level', () => {
  const lightningcssOptions = {
    minify: true
  };
  const pluginOptions = {
    cssModules: {
      pattern: 'my-company-[name]-[hash]-[local]'
    }
  };

  const sourceMap = true;
  const filename = 'file.css';

  const options = prepareOptions(
    filename,
    sourceMap,
    lightningcssOptions,
    pluginOptions
  );

  expect(options).toEqual({
    filename,
    sourceMap,
    minify: true,
    cssModules: {
      pattern: 'my-company-[name]-[hash]-[local]'
    }
  });
});
