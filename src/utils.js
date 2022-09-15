const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const SVGIcons2SVGFont = require("svgicons2svgfont");
const copy = require("copy-template-dir");
const ttf2eot = require("ttf2eot");
const svg2ttf = require("svg2ttf");
const ttf2woff = require("ttf2woff");
const ttf2woff2 = require("ttf2woff2");

let UnicodeObj = {};
// Unicode Private Use Area start.
// https://en.wikipedia.org/wiki/Private_Use_Areas
let startUnicode = 0xea01;

/*
 * Get icon unicode
 * @return {Array} unicode array
 */
function getIconUnicode(name) {
  let unicode = String.fromCharCode(startUnicode++);
  UnicodeObj[name] = unicode;
  return [unicode];
}
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
exports.createSVG = (OPTIONS) => {
  number = OPTIONS.unicodeStart;
  return new Promise((resolve, reject) => {
    // init
    const fontStream = new SVGIcons2SVGFont({
      ...OPTIONS.svgicons2svgfont,
    });
    function writeFontStream(svgPath) {
      // file name
      let _name = path.basename(svgPath, ".svg");
      const glyph = fs.createReadStream(svgPath);
      glyph.metadata = { unicode: getIconUnicode(_name), name: _name };
      fontStream.write(glyph);
    }

    const DIST_PATH = path.join(OPTIONS.fontsDist, OPTIONS.fontName + ".svg");
    // Setting the font destination
    fontStream
      .pipe(fs.createWriteStream(DIST_PATH))
      .on("finish", () => {
        console.log(`SVG font successfully created! ${DIST_PATH}`);
        resolve(UnicodeObj);
      })
      .on("error", (err) => {
        if (err) {
          console.log(err);
          reject(err);
        }
      });
    filterSvgFiles(OPTIONS.src).forEach((svg) => {
      if (typeof svg !== "string") return false;
      writeFontStream(svg);
    });

    // Do not forget to end the stream
    fontStream.end();
  });
};

/**
 * SVG font to TTF
 */
exports.createTTF = (OPTIONS) => {
  return new Promise((resolve, reject) => {
    OPTIONS.svg2ttf = OPTIONS.svg2ttf || {};
    const DIST_PATH = path.join(OPTIONS.fontsDist, OPTIONS.fontName + ".ttf");
    let ttf = svg2ttf(
      fs.readFileSync(
        path.join(OPTIONS.fontsDist, OPTIONS.fontName + ".svg"),
        "utf8"
      ),
      OPTIONS.svg2ttf
    );
    ttf = this.ttf = new Buffer.from(ttf.buffer);
    if (OPTIONS.linkMode === 'inline') OPTIONS.ttfBase64 = `data:font/ttf;base64,${ttf.toString("base64")}`;
    fs.writeFile(DIST_PATH, ttf, (err, data) => {
      if (err) {
        return reject(err);
      }
      var bitmap = fs.readFileSync(DIST_PATH, "utf8");
      console.log(`TTF font successfully created! ${DIST_PATH}`);
      resolve(data);
    });
  });
};

/**
 * TTF font to EOT
 */
exports.createEOT = (OPTIONS) => {
  return new Promise((resolve, reject) => {
    const DIST_PATH = path.join(OPTIONS.fontsDist, OPTIONS.fontName + ".eot");
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
exports.createWOFF = (OPTIONS) => {
  return new Promise((resolve, reject) => {
    const DIST_PATH = path.join(OPTIONS.fontsDist, OPTIONS.fontName + ".woff");
    const woff = new Buffer.from(ttf2woff(this.ttf).buffer);
    if (OPTIONS.linkMode === 'inline') OPTIONS.woffBase64 = `data:font/woff;base64,${woff.toString("base64")}`;
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
exports.createWOFF2 = (OPTIONS) => {
  return new Promise((resolve, reject) => {
    const DIST_PATH = path.join(OPTIONS.fontsDist, OPTIONS.fontName + ".woff2");
    const woff = new Buffer.from(ttf2woff2(this.ttf).buffer);
    if (OPTIONS.linkMode === 'inline') OPTIONS.woff2Base64 = `data:font/woff2;base64,${woff.toString("base64")}`;
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
 * Copy template files
 */
exports.copyTemplate = (inDir, outDir, vars) => {
  return new Promise((resolve, reject) => {
    copy(inDir, outDir, vars, (err, createdFiles) => {
      if (err) reject(err);
      resolve(createdFiles);
    });
  });
};

/**
 * Create HTML
 */
exports.createHTML = ({ outPath, data = {}, options = {} }) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(outPath, data, options, (err, str) => {
      if (err) reject(err);
      resolve(str);
    });
  });
};
