#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const svg2icon = require('../src/index.js')

let options = {};
if (fs.existsSync(path.resolve(".svg2iconrc.js"))) {
  options = require(path.resolve(".svg2iconrc.js")) || {};
}
svg2icon(options);