# grunt-inline-assets

将HTML代码中引用的js和css文件读取为内联，外部文件可以是本地也可以来自网络

## Getting Started

依赖 Grunt 版本`~0.4.1`

安装

```shell
npm install grunt-inline-assets --save-dev
```

安装后，在 Gruntfile.js 中载入任务

```js
grunt.loadNpmTasks('grunt-inline-assets');
```

## 任务配置

### 步骤

在 `grunt.initConfig()` 中添加的配置：

```js
'inline-assets':{
	options:{
		encoding:'utf8',
		// KISSY Modules Maps File 地址，会新增到KISSY MINI种子文件的后面
		// 如果没有引用KISSY，将不会新增
		comboMapFile:'../../map.js',
		onlineFileSSIOnly: true, // 只合并线上文件，本地文件不合并，默认为false
		jsmin: true, //内置js文件时是否进行jsmin，默认为false
		cssmin: true //内置css文件是否进行cssmin，默认false
	},
	main:{
		files: [
			{
				expand: true,
				cwd:'build',
				src: ['pages/**/*.html'],
				dest: 'build/'
			}
		]
	}
}
```

比如源文件：

```html
<!DOCTYPE HTML>
<html>
<head>
	<link rel="stylesheet" href="./index.less.css"/>
	<link rel="stylesheet" type="text/css" href="http://g.tbcdn.cn/??tpi/pi/1.1.0/base/index-min.css" />
	<script src="http://g.tbcdn.cn/kissy/m/0.2.1/mini-full-min.js"></script>
	<script src="../../config.js"></script>
</head>
<body>...</body>
</html>
```

构建后的文件

```html
<!DOCTYPE HTML>
<html>
<head>
	<style>CSS文件内容</style>
	<style>CSS文件内容</style>
	<script>KISSY MINI 种子文件内容</script>
	<script>map.js内容</script>
	<script>config.js内容</script>
</head>
<body>...</body>
</html>
```
