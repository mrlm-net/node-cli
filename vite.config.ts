import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "src/index.ts")
      },
      name: "MRLM.NET Node.js Scaffolder",
      // the proper extensions will be added
      fileName: "vsts-extension-devstack",
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