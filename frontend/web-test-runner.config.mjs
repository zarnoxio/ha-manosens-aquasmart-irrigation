import { playwrightLauncher } from "@web/test-runner-playwright";
import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: "test/**/*.test.ts",
  nodeResolve: true,
  browsers: [playwrightLauncher({ product: "chromium" })],
  plugins: [esbuildPlugin({ ts: true, target: "es2020", tsconfig: "tsconfig.json" })],
};
