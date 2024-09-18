import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      formats: ["es"],
      // Could also be a dictionary or array of multiple entry points
      entry: {
        main: resolve(__dirname, "src/autoloader.ts"),
        engine: resolve(__dirname, "src/engine.ts"),
        index: resolve(__dirname, "src/cli.ts")
      },
      name: "engine",
      // the proper extensions will be added
      fileName: "mrlm-net-node-cli",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn"t be bundled
      // into your library
      external: ["fs", "node", "yargs", "yargs/helpers"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          "node": "node",
          "fs": "fs",
          "yargs": "yargs",
          "yargs/helpers": "yargs/helpers",
        },
      },
    },
  },
  plugins: [dts({
    rollupTypes: true,
    insertTypesEntry: true,
  })],
})