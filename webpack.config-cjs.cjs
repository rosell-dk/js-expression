const path = require("path");
module.exports = {
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, "dist/cjs"),
    filename: "index.js",
    //clean: true,
  },
  experiments: {
    outputModule: true
  }
};
