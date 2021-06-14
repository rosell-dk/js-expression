import path  from 'path'

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    library: {
      type: 'module'
    },
    path: path.resolve(__dirname, "dist/mjs"),
    filename: "index.js",
    clean: true,
  },
  experiments: {
    outputModule: true
  }
};
