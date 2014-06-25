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
		// KISSY Modules Maps File 地址，会新增到KISSY种子文件的后面
		// 如果没有引用KISSY，将不会新增
		comboMapFile:'http://g.tbcdn.cn/trip/0.1.0/h5-test/map-min.js'
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

