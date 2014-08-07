// 'use strict';
var util = require('util');
var fs = require('fs');
var path = require('path');
var pwd = process.cwd();
var isUtf8 = require('./is-utf8');
var iconv = require('iconv-lite');
var os = require('os');

//var reg = '<!--#([a-z]+)(\\s([a-z]+)=[\'"](.+?)[\'"])* -->';
var G_REG = '<!--#(include)(\\s([a-z]+)=[\'"](.+?)[\'"])* -->';
var p = './xx.html';
var CTS = {};
var root = null;

// p：绝对路径
// return:结果
function parseOne(p,assets_reg){
	var p = path.resolve(p);
	if(root === null){
		root = p;
	}
	var firstInclude = hasIncludes(p,assets_reg);
	var r;
	if(firstInclude){
		r = parseFirstIncludes(p,getContent(p),assets_reg);
		CTS[p] = r;
		r = parseOne(p,assets_reg);
	} else {
		r = getContent(p);
	}
	return r;
}

function hasIncludes(p,assets_reg){
	
	if(typeof assets_reg !== 'undefined'){
		var reg = assets_reg;
	} else {
		var reg = G_REG;
	}
	var content = getContent(p);
	var r = content.match(new RegExp(reg,'i'));
	if(r){
		var f = RegExp.$4;
		if(/^http/i.test(f)){
			return f;
		} else {
			return path.resolve(path.dirname(p),f);
		}
	} else {
		return false;
	}
}

function parseFirstIncludes(p,content,assets_reg){
	if(typeof assets_reg !== 'undefined'){
		var reg = assets_reg;
	} else {
		var reg = G_REG;
	}
	var pathname = path.dirname(p);
	var includefile = hasIncludes(p,assets_reg);
	var type = getType(includefile);
	var dpath = path.resolve(pathname,includefile);
	var dcontent = getContent(dpath);
	var rep = path.dirname(path.relative(pathname,includefile));
	// xcontent 是递归取参数的时候用的，只有在类型是HTML的时候才会进入
	var xcontent = dcontent.replace(new RegExp(reg,'gi'),function(){
		var args = arguments;
		return "<!--#include " + args[3] + '="' + path.join(rep,args[4]) + '" -->';
	});
	CTS[dpath] = dcontent;
	xcontent = dollerEncode(xcontent);
	if(type == 'js'){
		var r_content = content.replace(new RegExp(reg,'i'),'<script>'+xcontent+'</script>');
	} else if(type == 'css'){
		var r_content = content.replace(new RegExp(reg,'i'),'<style>'+xcontent+'</style>');
	} else if(type == 'html'){
		var r_content = content.replace(new RegExp(reg,'i'),'<!--include:'+p+'-->'+xcontent+'<!--/include-->');
	} else {

	}
	r_content = dollerDecode(r_content);
	// console.log(r_content);
	return r_content;
}

// p:绝对路径
function getContent(p){
	if(os.platform().indexOf('win32')>=0){
		var http_url_reg = /^.+\\http:\\([^\\].+)$/;
	} else {
		var http_url_reg = /^.+\/http:\/([^\/].+)$/;
	}
	if(CTS[p]){
		return CTS[p];
	} else if(isFile(p)){
		var bf = read(p);
		return bf.toString('utf-8');
	} else if(http_url_reg.test(p)){
		var f_url = p.match(http_url_reg)[1];
		if(os.platform().indexOf('win32') >= 0){
			f_url = f_url.replace(/\\/ig,'/');
		}
		// 返回待替换的URL，由chunk去执行网络抓取和替换
		var type = getType(f_url);
		return '--#assets '+type+'="'+f_url+'" --';
	} else {
		return "<!-- " + p + " is not found! -->";
	}
}

function getType(f_url){
	if(/(\.css|\.css\?)/i.test(f_url)){
		var type = 'css';
	} else if(/(\.js|\.js?)/i.test(f_url)){
		var type = 'js';
	} else {
		var type = 'html';
	}
	return type;
}

function isFile(p) {
	if(fs.existsSync(p)){
		var stat = fs.lstatSync(p);
		return stat.isFile();
	} else {
		return false;
	}
}

// data: string
function ssiChunk(filepath,data,assets_reg){
	var filepath = path.resolve(filepath);
	CTS = {};
	CTS[filepath] = data;	
	return parseOne(filepath,assets_reg);
}

// 得到的一定是utf8编码的buffer
function read(file){
	var fd = fs.readFileSync(file);

	if(isUtf8(fd)){
		var bf = fs.readFileSync(file);
	} else {
		var bf = iconv.encode(iconv.decode(fd, 'gbk'),'utf8');
	}
	return bf;
}

// 
function dollerEncode(content){
	if(content.indexOf('$')>=0){
		content = content.replace("'$'",">>_doller_<<",'ig');
		content = content.replace('"$"','>>>_doller_<<<','ig');
		content = content.replace('$','>_doller_<','ig');
		content = content.replace('$1','>_doller1_<','ig');
		content = content.replace('$2','>_doller2_<','ig');
		content = content.replace('$3','>_doller3_<','ig');
		content = content.replace('$4','>_doller4_<','ig');
		content = content.replace('$5','>_doller5_<','ig');
		content = content.replace('$6','>_doller6_<','ig');
		content = content.replace('$7','>_doller7_<','ig');
		content = content.replace('$8','>_doller8_<','ig');
		content = content.replace('$9','>_doller9_<','ig');
		var content = arguments.callee(content);
	} else {
		return content;
	}
	return content.replace('$','>_doller_<','ig');
}
function dollerDecode(content){
	if(content.indexOf('>_doller')>=0){
		content = content.replace(">>_doller_<<","'T_DOLLOR'",'ig');
		content = content.replace("T_DOLLOR",'$','ig');
		content = content.replace('>>>_doller_<<<"','"T_DOLLOR"','ig');
		content = content.replace("T_DOLLOR",'$','ig');
		content = content.replace('>_doller_<','$','ig');
		content = content.replace('>_doller1_<','$1','ig');
		content = content.replace('>_doller2_<','$2','ig');
		content = content.replace('>_doller3_<','$3','ig');
		content = content.replace('>_doller4_<','$4','ig');
		content = content.replace('>_doller5_<','$5','ig');
		content = content.replace('>_doller6_<','$6','ig');
		content = content.replace('>_doller7_<','$7','ig');
		content = content.replace('>_doller8_<','$8','ig');
		content = content.replace('>_doller9_<','$9','ig');
		content = arguments.callee(content);
	} else {
		return content;
	}
	return content.replace('>_doller_<','$','igm');
}

//ssi()

exports.ssi = parseOne;
exports.ssiChunk = ssiChunk;
