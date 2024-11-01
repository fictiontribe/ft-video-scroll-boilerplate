const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const config = require("./site.config");

//Webpack loaders
const html = {
  test: /\.(html)$/,
  use: [
    {
      loader: "html-loader",
      options: {
        interpolate: true,
      },    
    },
  ],
};

const javascript = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: ["babel-loader"],
};

const images = {
  test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
  type: "asset/resource",
};

const fontsAndSvgs = {
  test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
  type: "asset/inline",
};

// Style loaders
const styleLoader = {
  loader: "style-loader",
};

const cssLoader = {
  loader: "css-loader",
};

const postcssLoader = {
  loader: "postcss-loader",
  options: {
    postcssOptions: {
      plugins: [require("autoprefixer")()],
    },
  },
};

const css = {
  test: /\.css$/,
  use: [
    config.env === "production" ? MiniCssExtractPlugin.loader : styleLoader,
    cssLoader,
    postcssLoader,
  ],
};

const sass = {
  test: /\.s[c|a]ss$/,
  use: [
    config.env === "production" ? MiniCssExtractPlugin.loader : styleLoader,
    cssLoader,
    postcssLoader,
    {
      loader: "sass-loader",
      options: {
        sassOptions: { quietDeps: true },
      },
    },
  ],
};

module.exports = [html, javascript, images, fontsAndSvgs, css, sass];
