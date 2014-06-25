// 'use strict';
var util = require('util');
var fs = require('fs');
var path = require('path');
var pwd = process.cwd();
var isUtf8 = require('./is-utf8');
var iconv = require('iconv-lite');
var os = require('os');

// content 一定是utf8个是的文本
exports.insertMap = function(content,comboMapFile){
	var G_REG = '<script[^>]*? src=[\'"](.+?(mini-full-min|mini-full)\.js)[\'"].*<\/script>';
	var xcontent = content.replace(new RegExp(G_REG,'i'),function(){
		var args = arguments;
		return args[0] + '\n\r<script src="'+comboMapFile+'"></script>';
	});
	return xcontent;
};
