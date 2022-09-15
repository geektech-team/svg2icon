const fs = require("fs-extra");
const path = require("path");
const {
  createSVG,
  createTTF,
  createEOT,
  createWOFF,
  createWOFF2,
  createHTML,
  copyTemplate,
} = require("./utils");

function create(options) {
  if (!options) options = {};
  // 输出文件路径
  options.dist = options.dist || path.join(process.cwd(), "dist");
  // svg资源文件路径
  options.src = options.src || path.join(process.cwd(), "svg");
  // 输出的字体包文件名称
  options.fontsDistName = options.fontsDistName || "fonts";
  // 输出的字体包文件路径
  options.fontsDist = path.join(options.dist, options.fontsDistName);
  // 生成的图标字体的字体名称
  options.fontName = options.fontName || "icon";
  // 生成图标字体前缀
  options.classNamePrefix = options.classNamePrefix || "icon";

  options.unicodeStart = options.unicodeStart || 10000;
  options.svg2ttf = options.svg2ttf || {};
  options.emptyDist = options.emptyDist;
  options.svgicons2svgfont = options.svgicons2svgfont || {};
  options.svgicons2svgfont.fontName = options.fontName;
  options.website = {};

  fs.emptyDirSync(path.join(options.dist, options.fontsDistName));
  fs.emptyDirSync(options.fontsDist);

  let cssString = [];
  let cssIconHtml = [];
  let fontClassPath = path.join(options.dist, "index.html");

  return createSVG(options)
    .then((UnicodeObject) => {
      Object.keys(UnicodeObject).forEach((name) => {
        let _code = UnicodeObject[name];
        cssIconHtml.push(
          `<li class="class-icon">
            <i class="${options.classNamePrefix}-${name}"></i>
            <p class="name">${options.classNamePrefix}-${name}</p>
          </li>`
        );
        cssString.push(
          `.${options.classNamePrefix}-${name}:before { content: "\\${_code
            .charCodeAt(0)
            .toString(16)}"; }\n`
        );
      });
    })
    .then(() => createTTF(options))
    .then(() => createEOT(options))
    .then(() => createWOFF(options))
    .then(() => createWOFF2(options))
    .then(() => {
      const font_temp = path.resolve(
        __dirname,
        `styles/${options.linkMode === "inline" ? "inline" : "link"}`
      );
      return copyTemplate(font_temp, options.dist, {
        fontname: options.fontName,
        fontsDistName: options.fontsDistName,
        cssString: cssString.join(""),
        timestamp: new Date().getTime(),
        prefix: options.classNamePrefix,
        ttf: options.ttfBase64,
        woff: options.woffBase64,
        woff2: options.woff2Base64,
      });
    })
    .then((filePaths) => {
      // output log
      filePaths &&
        filePaths.length > 0 &&
        filePaths.forEach((filePath) => console.log(`Created ${filePath} `));
    })
    .then(() => {
      // default template
      options.website.template = path.join(__dirname, "template.ejs");
      // template data
      this.tempData = {
        ...options.website,
        _link: `icon-font.css`,
        _IconHtml: cssIconHtml.join(""),
      };
      return createHTML({
        outPath: options.website.template,
        data: this.tempData,
      });
      // }
    })
    .then((str) => {
      if (options.website) {
        fs.outputFileSync(
          fontClassPath,
          // minify(str, { collapseWhitespace: true, minifyCSS: true })
          str
        );
        console.log(`Created ${fontClassPath} `);
      }
    });
}

module.exports = create;
