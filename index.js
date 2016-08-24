'use strict';
const fs = require("fs");
const path = require("path");
const request = require('request');
const colors = require('colors');

module.exports = function(content, file, conf) {
	new Tinypng()
		.src(file.subpath.substr(1)) //图片目录或单个图片路径
		.dest(conf.to) //必须是目录，如果不设定，则会覆盖压缩
		.key(conf.key)
		.run();
	return null;
}

function Tinypng() {
	var self = this;
	if (!(this instanceof Tinypng)) {
		return new Tinypng();
	}

	self.streams = [];
}


Tinypng.prototype.src = function(file) {
	var self = this;
	if (!arguments.length) {
		return self._src;
	}

	self._src = file;
	return this;
};

Tinypng.prototype.dest = function(dir) {
	var self = this;
	if (!arguments.length) {
		return self._dest;
	}

	self._dest = dir;
	return this;
};

Tinypng.prototype.key = function(apiKey) {
	var self = this;
	if (!arguments.length) {
		return self._key;
	}

	self._key = apiKey;
	return this;
};

Tinypng.prototype.run = function() {
	var self = this;
	//获取存放所有图片路径的数组
	var src = self.src();
	if (self.dest() == undefined) {
		var dest = src;
	} else {
		var dest = self.dest();
	};

	//KEY
	var key = self.key();

	if (!fs.existsSync(dest)) {
		if (fs.statSync(src).isDirectory()) {
			fs.mkdirSync(dest);
		}
	}

	var imgList = [];

	if (fs.existsSync(src)) {
		imgList = self.getImg(src);
	}

	if (imgList.length == 0) {
		console.log("\n   未发现可压缩图片\n");
	} else {
		var saveSize = 0; //压缩了多少空间
		var count = 0; //计数器
		var len = imgList.length.toString();
		//console.log("\n发现未压缩图片共 " + len.bold.white + " 张，正在压缩···");
		//console.log(self.equiLong('\n   图片名', 28) + self.equiLong('压缩前', 15) + self.equiLong('压缩后', 15) + self.equiLong('压缩率', 8));
		imgList.forEach(function(file) {
			var input = fs.createReadStream(file)
			input.pipe(request.post('https://api.tinify.com/shrink', {
				auth: {
					'user': 'api',
					'pass': key
				}
			}, function(err, response, body) {
				var body = JSON.parse(body);
				if (response.statusCode == 201) {
					//打印压缩信息：图片名  压缩前大小  压缩后大小  压缩率
					console.log(self.equiLong('   ' + path.basename(file), 30).bold.white + self.equiLong((body.input.size / 1024).toFixed(2) + 'KB', 18).bold.cyan + self.equiLong((body.output.size / 1024).toFixed(2) + 'KB', 18).bold.green + self.equiLong((1 - (body.output.size / body.input.size)).toFixed(2) + '%', 8).bold.green);
					//写入文件
					var _size = (body.input.size / 1024).toFixed(2) - (body.output.size / 1024).toFixed(2);
					saveSize += _size;
					var output = fs.createWriteStream(dest + '/' + path.basename(file));

					request.get(body.output.url).pipe(output);

					output.on('finish', function() {
						//修改文件尾buffer，作为已压缩图片的特征码
						var buf = fs.readFileSync(dest + '/' + path.basename(file));
						var len = buf.length;
						buf[len - 1] = '0';
						fs.writeFileSync(dest + '/' + path.basename(file), buf);
						count++;
						if (count == imgList.length) {
							console.log('   \n   Total Save: '.bold.green + saveSize.toFixed(2).bold.white + "KB".bold.white);
						}
					})
				} else {
					if (body.error === 'TooManyRequests') {
						console.log('   此KEY压缩图片数量已达限制');
					} else if (body.error === 'Unauthorized') {
						console.log('   此KEY不可用');
					} else {
						console.log(self.equiLong('   ' + path.basename(file), 30).bold.white + '压缩出现问题'.bold.red);
					}
				};
			}));
		});
	}

};

//获取文件夹内所有图片路径数组
Tinypng.prototype.getImg = function(src) {
	var self = this;
	var imgList = [];
	if (fs.statSync(src).isFile() && self.checkImg(src)) {
		var buf = fs.readFileSync(src);
		if (buf[buf.length - 1] != '0') {
			imgList.push(src);
		}
	} else if (fs.statSync(src).isDirectory()) {
		var _current = fs.readdirSync(src);
		_current.forEach(function(img) {
			if (self.checkImg(img)) {
				var buf = fs.readFileSync(src + '/' + img);
				if (buf[buf.length - 1] != '0') {
					imgList.push(src + '/' + img);
				}
			}
		})
	}
	return imgList;
}

//判断是否是图片
Tinypng.prototype.checkImg = function(file) {
	var imgType = ['.png', '.jpg'];
	var extName = path.extname(file);
	for (var i = 0; i < imgType.length; i++) {
		if (imgType[i] == extName) {
			return true;
		}
	}
}

//返回字符串，截断或用空格填充（为了打印压缩信息时对齐）
Tinypng.prototype.equiLong = function(str, len) {
	var length = str.length;
	if (length > len) {
		return str.substr(0, length);
	} else {
		var _str = str;
		for (var j = 0; j < (len - length); j++) {
			_str += ' ';
		};
		return _str;
	}
}