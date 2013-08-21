var filename = process.argv[2];
var fs = require('fs');
var stat = fs.statSync(filename);
var fileContent = '';
var fd = fs.openSync(filename, 'r');
var bytes = fs.readSync(fd, stat.size, 0, 'ascii');
fileContent += bytes[0];
fs.closeSync(fd);

//TODO cssのparse
function parseCSS() {
	var ret = {};
	return ret;
}

//TODO パースされたオブジェクトをJavaScriptのオブジェクト記述に変換
function transObjectCode(css) {
	var ret = '';
	return ret;
}

console.log(transObjectCode(parseCSS(fileContent)));