const fs = require("fs-extra");
const path = require("path");
const {
  createSVG,
  createIconBlocks,
  createTTF,
  createEOT,
  createWOFF,
  createWOFF2,
  createCSS,
  createHTML,
} = require("./utils");

function create(options) {
  if (!options) options = {};
  // 输出文件路径
  options.dist = options.dist || path.join(process.cwd(), "dist");
  // svg资源文件路径
  options.src = options.src || path.join(process.cwd(), "svg");
  // 输出的字体包文件名称
  options.fontsDistName = options.fontsDistName || "";
  // 输出的字体包文件路径
  options.fontsDist = path.join(options.dist, options.fontsDistName);
  // 生成的图标字体的字体名称
  options.fontName = options.fontName || "geek-icon";
  // 生成图标字体前缀
  options.classNamePrefix = options.classNamePrefix || "geekicon";
  // 生成图标字体后缀
  options.ext = options.ext || "css";

  options.unicodeStart = options.unicodeStart || 10000;
  options.svg2ttf = options.svg2ttf || {};
  options.emptyDist = options.emptyDist;
  options.svgicons2svgfont = options.svgicons2svgfont || {};
  options.svgicons2svgfont.fontName = options.fontName;
  options.UnicodeObject = {};
  // Unicode Private Use Area start.
  // https://en.wikipedia.org/wiki/Private_Use_Areas
  options.startUnicode = 0xea01;

  fs.emptyDirSync(path.join(options.dist, options.fontsDistName));
  fs.emptyDirSync(options.fontsDist);

  options.cssString = [];
  options.cssIconHtml = [];

  return createSVG(options)
    .then(() => createIconBlocks(options))
    .then(() => createTTF(options))
    .then(() => createEOT(options))
    .then(() => createWOFF(options))
    .then(() => createWOFF2(options))
    .then(() => createCSS(options))
    .then(() => createHTML(options));
}

module.exports = create;