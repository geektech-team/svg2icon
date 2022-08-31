#!/usr/bin/env node

const svg2icon = require('../src/index.js')

const defaultOptions = {
  dist: "dist", // output path(输出文件路径)
  src: "svg", // svg path(svg资源路径)
  fontName: "geek-icon", // font name （字体名称）
  classNamePrefix: "geekicon", // class name prefix （class前缀）
};
let options = {};
let inputOptions = {};
if (fs.existsSync(path.resolve(".svg2iconrc.js"))) {
  inputOptions = require(path.resolve(".svg2iconrc.js")) || {};
}
options = { ...defaultOptions, ...inputOptions };
svg2icon(options);