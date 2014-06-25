/*
 * Modifyed @ 2013-12-26 代码很乱，需要重构
 *
 * Copyright (c) 2013 拔赤
 * Licensed under the MIT license.
 */

var util = require('util');
var fs = require('fs');
var http = require('http');
var ssi = require('./ssi').ssi,
	ssiChunk = require('./ssi').ssiChunk,
	chunkParser = require('./chunk').parse,
	path = require('path');

var isUtf8 = require('./is-utf8');
var insertMapFile = require('./insert-map').insertMap;
var iconv = require('iconv-lite');
var async = require('async');

module.exports = function(grunt) {

	grunt.registerMultiTask('inline-assets', 'inline Assets.', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options();
		var done = this.async();
		var comboMapFile = options.comboMapFile;

		var that = this;
		var pwd = process.cwd();

        var asyncFns = [];
		this.files.forEach(function(v,k){

            var asyncFn = function (callback) {

                console.log(v.dest);
                var p = v.src[0];
                var bf = read(p);
                var dirname = path.dirname(v.dest);
                var fDestName = path.basename(v.dest,path.extname(v.dest));
                var filep = path.join(dirname, fDestName);

                // 一定是utf8格式的
                // var chunk = ssiChunk(p,bf.toString('utf8'),'<!--#(include)(\\s([a-z]+)=[\'"](.+?)[\'"])* -->');
				// 执行本地文件的替换
				var chunk = bf.toString('utf8');
				if(typeof comboMapFile != 'undefined'){
					chunk = insertMapFile(chunk,comboMapFile);
				}
                chunk = ssiChunk(p,chunk,'<(s)(c)(r)ipt[^>]*? src=[\'"](.+?)[\'"].*<\/script>');
                chunk = ssiChunk(p,chunk,'<(l)(i)(n)k[^>]*? href=[\'"](.+\.css)[\'"].*>');

				// 执行在线文件的替换
                chunkParser(chunk,function(chunk){
                    chunk = teardownChunk(chunk,options.encoding);
                    if(!(chunk instanceof Buffer)){
                        chunk = new Buffer(chunk);
                    }
                    if(options.encoding == 'gbk'){
                        chunk = iconv.encode(iconv.decode(chunk, 'utf8'),'gbk');
                    }
                    fs.writeFileSync(v.dest,chunk);
                    callback();
                });

            };

            asyncFns.push(asyncFn);

		});

        async.parallel(asyncFns, function (err, result) {
			done();
            if (err) {
                console.warn('combohtml 生成有错误');
                console.error(err);
            }
        });

	});

};
// 传入的chunk一定是utf8的
function teardownChunk(chunk,encoding){
	if(!(chunk instanceof Buffer)){
		chunk = new Buffer(chunk);
	}
	if(encoding == 'gbk'){
		chunk = iconv.encode(iconv.decode(chunk, 'utf8'),'gbk');
	}
	return chunk;
}

function writeFile(page, prjInfo, pageContent) {
    var pagePathDir = path.dirname(page);
    if (prjInfo.charset[0].match(/gbk/i)) {
        pageContent = iconv.encode(pageContent, 'gbk');
    }
    fs.writeFileSync(page, pageContent);
    return;
}

function consoleColor(str,num){
	if (!num) {
		num = '32';
	}
	return "\033[" + num +"m" + str + "\033[0m";
}

function green(str){
	return consoleColor(str,32);
}

function yellow(str){
	return consoleColor(str,33);
}

function red(str){
	return consoleColor(str,31);
}

function blue(str){
	return consoleColor(str,34);
}

function log(statCode, url, err) {
  var logStr = blue(statCode) + ' - ' + url ;
  if (err)
    logStr += ' - ' + red(err);
  console.log(logStr);
}

function isDir(dir){
	if(fs.existsSync(dir)){
		var stat = fs.lstatSync(dir);
		return stat.isDirectory();
	} else {
		return false;
	}
}

function isFile(dir){
	if(fs.existsSync(dir)){
		var stat = fs.lstatSync(dir);
		return stat.isFile();
	} else {
		return false;
	}
}

// 得到的一定是utf8编码的buffer
function read(file){
	var fd = fs.readFileSync(file),
        bf;

	if(isUtf8(fd)){
		bf = fs.readFileSync(file);
	} else {
		bf = iconv.encode(iconv.decode(fd, 'gbk'),'utf8');
	}
	return bf;
}

function die(){
	console.log.apply(this,arguments)
	process.exit();
}
