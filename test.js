const svgtoiconfont = require("./src");
 
svgtoiconfont({
  dist: "dist", // output path(输出文件路径)
  src: "svg", // svg path(svg资源路径)
  fontName: "geek-icon", // font name （字体名称）
  classNamePrefix: "geekicon", // class name prefix （class前缀）
  linkMode: 'link', // inline\link [default link]
  fontsDistName: 'font', // inline\link [default link]
  ext: 'less' // 后缀名
});
