# svg2icon
Svg to icon

## Usage

```bash
npm i @geektech/svg2icon
```

Makge dir '.svg2iconrc.js' in your project root like below;

```js
module.exports = {
  dist: "dist", // output path(输出文件路径)
  src: "svg", // svg path(svg资源路径)
  fontName: "geek-icon", // font name （字体名称）
  classNamePrefix: "geekicon", // class name prefix （class前缀）
  linkMode: 'inline', // inline\link
  ext: 'wxss' // 后缀名
}
```

Makge dir 'svg' in your project and put in svg files;

Run

```bash
svg2icon
```

Or you can use your own script like below js:

```js
const svgtoiconfont = require("@geektech/svg2icon");
 
svgtoiconfont({
  dist: "dist", // output path(输出文件路径)
  src: "svg", // svg path(svg资源路径)
  fontName: "geek-icon", // font name （字体名称）
  classNamePrefix: "geekicon", // class name prefix （class前缀）
  linkMode: 'link', // inline\link [default link]
  ext: 'less' // 后缀名
});
```
