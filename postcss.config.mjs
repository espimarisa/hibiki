import purgeCSSPlugin from "@fullhuman/postcss-purgecss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcssImport from "postcss-import";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const cssnanoOptions = IS_PRODUCTION ? cssnano({}) : false;
const purgecssOptions = IS_PRODUCTION
  ? purgeCSSPlugin({
      content: ["./src/web/**/**/*.{liquid}"],
      css: ["./src/web/**/**/*.{css}"],
      fontFace: true,
      variables: true,
      keyframes: true,
    })
  : false;

export default {
  plugins: [postcssImport, autoprefixer, purgecssOptions, cssnanoOptions],
};
