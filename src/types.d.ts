import { BundleAsyncOptions, CustomAtRules } from "lightningcss"

declare module "postcss-lightningcss" {
  interface postcssLightningcssOptions {
    browsers?: string|string[],
    cssModules?: "auto"|RegExp|boolean,
    cssModulesJSON?: (cssFileName: string, json: object, outputFileName: string) => {},
    lightningcssOptions?: Omit<BundleAsyncOptions<CustomAtRules>,
    | "filename"
    | "resolver"
    | "analyzeDependencies"
    | "inputSourceMap"
    | "projectRoot"
    >,
  }

  function postcssLightningcss(options?: postcssLightningcssOptions)

  export = postcssLightningcss
}