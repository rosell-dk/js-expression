import path  from 'path'

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    library: {    // https://webpack.js.org/configuration/output/#outputlibrary
      //name: 'Expression',
      type: 'commonjs2'
    },
    path: path.resolve(__dirname, "dist/cjs"),
    filename: "index.js",
    clean: true,
  },
  experiments: {
    outputModule: true
  }
};
