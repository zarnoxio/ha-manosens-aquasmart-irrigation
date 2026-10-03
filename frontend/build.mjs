// Bundles the card (+ its editor, imported from within aquasmart-flow-card.ts)
// into a single ES module. The output is COMMITTED to
// ../custom_components/aquasmart_irrigation/www/ - HACS installs just copy
// custom_components/, no build step runs on the end user's machine. CI
// (.github/workflows/validate.yml) re-runs this build and fails if the
// committed file would change, so it can never go stale.
import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [path.join(__dirname, "src/aquasmart-flow-card.ts")],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2020",
  legalComments: "none",
  outfile: path.join(
    __dirname,
    "../custom_components/aquasmart_irrigation/www/aquasmart-flow-card.js",
  ),
});

console.log("Built custom_components/aquasmart_irrigation/www/aquasmart-flow-card.js");
