## colorPicker

* 版本：2.0.0
* 教程：[http://kg.kissyui.com/colorPicker/2.0.0/guide/index.html](http://kg.kissyui.com/colorPicker/2.0.0/guide/index.html)
* demo：[http://kg.kissyui.com/colorPicker/2.0.0/demo/index.html](http://kg.kissyui.com/colorPicker/2.0.0/demo/index.html)

## 效果预览

![](http://img03.taobaocdn.com/tps/i3/T1cr8vFd0aXXboRUv4-486-295.png)

## 插件说明

点击控制按钮**显示/隐藏**拾色器，拾色器显示状态下点击取色区域获取目标颜色；

**点击**彩色条，设置选色去主色调；

兼容**支持Canvas**的浏览器。

## 使用方法

本地环境添加包配置如下：

	var S = KISSY;
    KISSY.Config.debug = true;
    if (S.Config.debug) {
        var srcPath = "../../../";
        S.config({
            packages:[
                {
                    name:"kg",
                    path:srcPath,
                    charset:"utf-8",
                    ignorePackageNameInUri:true
                }
            ]
        });
    }

初始化组件方法：

	S.use('kg/colorPicker/2.0.0/index,kg/colorPicker/2.0.0/index.css', function (S, ColorPicker) {
        var colorPicker = new ColorPicker({
           defaultColor: "#f50",
           trigger: "#colorPickerTrigger",
           complete: function(){
                var color = colorPicker.getColor();
                var blank = parseInt("ffffff", 16);
                var hex = parseInt(color.substr(1), 16);
                var bgc = (blank - hex).toString(16);
                while(bgc.length < 6){
                    bgc = "0" + bgc;
                }
                S.one("#showColorSelected").val(color).css({"color": color, "background-color": "#" + bgc});
           }
        });
    });

## 配置说明

* @trigger 拾色器**打开/关闭**，触发器，目前只支持单一元素
* @defaultColor 拾色器初始化默认颜色，支持 3 位或 6 位十六进制颜色值，勿忘 `#`
* @complete 选色完成后执行的方法，随色彩变化实时执行

## 常用方法

* getColor() 获取拾色器当前选中颜色的十六进制值，例：#ff0000
* setColor(hex) 设置拾色器的默认颜色

## changelog

### V2.0.0


