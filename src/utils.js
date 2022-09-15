const fs = require("fs");
const path = require("path");
const SVGIcons2SVGFont = require("svgicons2svgfont");
const ttf2eot = require("ttf2eot");
const svg2ttf = require("svg2ttf");
const ttf2woff = require("ttf2woff");
const ttf2woff2 = require("ttf2woff2");
/*
 * Filter svg files
 * @return {Array} svg files
 */
function filterSvgFiles(svgFolderPath) {
  let files = fs.readdirSync(svgFolderPath, "utf-8");
  let svgArr = [];
  if (!files) {
    throw new Error(`Error! Svg folder is empty.${svgFolderPath}`);
  }

  for (let i in files) {
    if (typeof files[i] !== "string" || path.extname(files[i]) !== ".svg")
      continue;
    if (!~svgArr.indexOf(files[i])) {
      svgArr.push(path.join(svgFolderPath, files[i]));
    }
  }
  return svgArr;
}

/**
 * SVG to SVG font
 */
exports.createSVG = (options) => {
  return new Promise((resolve, reject) => {
    // init
    let {
      UnicodeObject,
      startUnicode
    } = options;
    const fontStream = new SVGIcons2SVGFont({
      ...options.svgicons2svgfont,
    });
    const DIST_PATH = path.join(options.fontsDist, options.fontName + ".svg");
    // Setting the font destination
    fontStream
      .pipe(fs.createWriteStream(DIST_PATH))
      .on("finish", () => {
        console.log(`SVG font successfully created! ${DIST_PATH}`);
        resolve(options);
      })
      .on("error", (err) => {
        if (err) {
          console.log(err);
          reject(err);
        }
      });
    filterSvgFiles(options.src).forEach((svgPath) => {
      if (typeof svgPath !== "string") return false;
      // 写入文件
      let _name = path.basename(svgPath, ".svg");
      const glyph = fs.createReadStream(svgPath);
      const unicode = String.fromCharCode(startUnicode++);
      UnicodeObject[_name] = unicode;
      glyph.metadata = {
        unicode: [unicode],
        name: _name
      };
      fontStream.write(glyph);
    });
    // Do not forget to end the stream
    fontStream.end();
  });
};

/**
 * 创建代码块
 * @param {*} options 
 * @returns 
 */
exports.createIconBlocks = (options) => {
  return new Promise((resolve, reject) => {
    const {
      cssString,
      cssIconHtml,
      classNamePrefix,
      UnicodeObject
    } = options;
    Object.keys(UnicodeObject).forEach((name) => {
      let _code = UnicodeObject[name];
      cssIconHtml.push(
        `<li class="class-icon">
          <i class="${classNamePrefix}-${name}"></i>
          <p class="name">${classNamePrefix}-${name}</p>
        </li>`
      );
      cssString.push(
        `.${classNamePrefix}-${name}:before { content: "\\${_code
          .charCodeAt(0)
          .toString(16)}"; }\n`
      );
    });
    resolve(options)
  })
}

/**
 * SVG font to TTF
 */
exports.createTTF = (options) => {
  return new Promise((resolve, reject) => {
    options.svg2ttf = options.svg2ttf || {};
    const DIST_PATH = path.join(options.fontsDist, options.fontName + ".ttf");
    let ttf = svg2ttf(
      fs.readFileSync(
        path.join(options.fontsDist, options.fontName + ".svg"),
        "utf8"
      ),
      options.svg2ttf
    );
    ttf = this.ttf = new Buffer.from(ttf.buffer);
    if (options.linkMode === 'inline') options.ttfBase64 = `data:font/ttf;base64,${ttf.toString("base64")}`;
    fs.writeFile(DIST_PATH, ttf, (err, data) => {
      if (err) {
        return reject(err);
      }
      console.log(`TTF font successfully created! ${DIST_PATH}`);
      resolve(data);
    });
  });
};

/**
 * TTF font to EOT
 */
exports.createEOT = (options) => {
  return new Promise((resolve, reject) => {
    const DIST_PATH = path.join(options.fontsDist, options.fontName + ".eot");
    const eot = new Buffer.from(ttf2eot(this.ttf).buffer);
    fs.writeFile(DIST_PATH, eot, (err, data) => {
      if (err) {
        return reject(err);
      }
      console.log(`EOT font successfully created! ${DIST_PATH}`);
      resolve(data);
    });
  });
};

/**
 * TTF font to WOFF
 */
exports.createWOFF = (options) => {
  return new Promise((resolve, reject) => {
    const DIST_PATH = path.join(options.fontsDist, options.fontName + ".woff");
    const woff = new Buffer.from(ttf2woff(this.ttf).buffer);
    if (options.linkMode === 'inline') options.woffBase64 = `data:font/woff;base64,${woff.toString("base64")}`;
    fs.writeFile(DIST_PATH, woff, (err, data) => {
      if (err) {
        return reject(err);
      }
      console.log(`WOFF font successfully created! ${DIST_PATH}`);
      resolve(data);
    });
  });
};

/**
 * TTF font to WOFF2
 */
exports.createWOFF2 = (options) => {
  return new Promise((resolve, reject) => {
    const DIST_PATH = path.join(options.fontsDist, options.fontName + ".woff2");
    const woff = new Buffer.from(ttf2woff2(this.ttf).buffer);
    if (options.linkMode === 'inline') options.woff2Base64 = `data:font/woff2;base64,${woff.toString("base64")}`;
    fs.writeFile(DIST_PATH, woff, (err, data) => {
      if (err) {
        return reject(err);
      }
      console.log(`WOFF2 font successfully created! ${DIST_PATH}`);
      resolve(data);
    });
  });
};

/**
 * Create CSS
 */
exports.createCSS = (options) => {
  return new Promise((resolve, reject) => {
    const {
      dist,
      fontName,
      fontsDistName,
      classNamePrefix,
      ext,
      linkMode,
      ttfBase64,
      woffBase64,
      woff2Base64,
      cssString
    } = options;
    const timestamp = new Date().getTime();
    let cssContent = fs.readFileSync(path.resolve(__dirname, `${linkMode === "inline" ? 'inline' : 'link'}-icon-font.css`), 'utf8');
    cssContent = cssContent.replace(/{{fontname}}/g, fontName)
      .replace(/{{fontsDistName}}/g, fontsDistName)
      .replace(/{{classNamePrefix}}/g, classNamePrefix);
    if (linkMode === "inline") {
      cssContent = cssContent.replace(/{{ttfBase64}}/g, ttfBase64)
        .replace(/{{woffBase64}}/g, woffBase64)
        .replace(/{{woff2Base64}}/g, woff2Base64)
    } else {
      cssContent = cssContent.replace(/{{timestamp}}/g, timestamp)
    }
    cssContent = cssContent.replace(/{{cssString}}/, cssString.join(""));
    if (ext !== 'css') {
      fs.writeFileSync(path.join(dist, `${fontName}.css`), cssContent)
    }
    const DIST_PATH = path.join(dist, `${fontName}.${ext}`);
    fs.writeFile(DIST_PATH, cssContent, (err, data) => {
      if (err) {
        return reject(err);
      }
      console.log(`Icon Font CSS successfully created! ${DIST_PATH}`);
      resolve(data);
    });
  });
};

/**
 * Create HTML
 */
exports.createHTML = (options) => {
  return new Promise((resolve, reject) => {
    const {
      dist,
      fontName,
      cssIconHtml
    } = options;
    let htmlContent = fs.readFileSync(path.resolve(__dirname, `preview.html`), 'utf8');
    htmlContent = htmlContent.replace(/{{link}}/, `${fontName}.css`)
      .replace(/{{iconHtml}}/, cssIconHtml.join(""))
    const DIST_PATH = path.join(dist, 'preview.html');
    fs.writeFile(DIST_PATH, htmlContent, (err, data) => {
      if (err) {
        return reject(err);
      }
      console.log(`Preview HTML successfully created! ${DIST_PATH}`);
      resolve(data);
    });
  });
};