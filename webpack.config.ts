import path from "path";
import { Configuration } from "webpack";

const distPath = path.resolve(__dirname, "dist");

const config: Configuration = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: distPath,
    filename: "abledev-react.js",
    library: {
      name: "abledev-react",
      type: "umd",
    },
    globalObject: "this",
  },
  target: "web",
  externals: {
    react: {
      root: "React",
      commonjs: "react",
      commonjs2: "react",
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs: "react-dom",
      commonjs2: "react-dom",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                declaration: true,
                outDir: distPath,
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".ts", ".js"],
  },
  optimization: {
    minimize: false,
  },
};

export default config;
