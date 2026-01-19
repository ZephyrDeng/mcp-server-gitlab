import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "gitlab-tools-sdk": "src/gitlab-tools-sdk.ts",
  },
  format: ["esm"],
  target: "node18",
  bundle: true,
  clean: true,
  dts: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  minify: false,
  esbuildOptions(options) {
    options.charset = "utf8";
  },
});
