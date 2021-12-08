const path = require("path");
module.exports = {
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    library: {
      type: 'module'
    },
    path: path.resolve(__dirname, "dist/mjs"),
    filename: "index.js",
    //clean: true,
  },
  experiments: {
    outputModule: true
  }
};
