/**
 * @fileoverview KISSY取色器插件
 * @author Letao<mailzwj@126.com>
 * @module colorPicker
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all, D = S.DOM, E = S.Event;
    /**
     * KISSY取色器插件
     * @class ColorPicker
     * @constructor
     * @extends Base
     */
    function ColorPicker(cfg) {
        var self = this;
        /**
         * @defaultColor 取色器默认初始化颜色，十六进制（支持三位/六位）
         * @complete 取色完成时可调用的行为函数
         */
        self.trigger = S.one(cfg.trigger);
        self.defaultColor = cfg.defaultColor || "#f00";
        self.complete = cfg.complete || function(){};
        self.colorList = [];
        self.color = self.defaultColor;
        self.init();
        //调用父类构造函数
        // ColorPicker.superclass.constructor.call(self, cfg);
    }
    S.extend(ColorPicker, Base, /** @lends ColorPicker.prototype*/{
        init: function(){
            var self = this;
            var cid = S.guid("J_ColorPicker");
            self.cp = self.createColorPicker(cid);
            self.canvas = self.cp.one("#" + cid);
            self.picker = self.cp.one(".J_ColorTarget");
            self.renderPicker();
            self.hide();
            self.trigger.on("click", function(e){
                e.preventDefault();
                self.reLocation();
                self.show();
            });
        },
        createColorPicker: function(cid) {
            var self = this;
            var node = D.create("<div class=\"ks-colorpicker\">"
                + "<div class=\"J_ColorBox\">"
                + "<canvas class=\"colorTable\" id=\"" + cid + "\" width=\"256\" height=\"256\">您的浏览器不支持Canvas标签。</canvas>"
                + "<img src=\"http://img02.taobaocdn.com/tps/i2/T1SO8vFoVXXXc1zPrr-9-9.png\" width=\"9\" height=\"9\" class=\"J_ColorTarget ks-colortarget\">"
                + "</div>"
                + "<div class=\"J_SetColor\">"
                + "<img src=\"http://img04.taobaocdn.com/tps/i4/T1DbtrFbliXXXtxGrx-30-246.png\" width=\"30\" height=\"246\">"
                + "</div>"
                + "</div>");
            S.one("body").append(node);
            return S.one(node);
        },
        setColor: function(color){
            var self = this;
            self.defaultColor = color;
            self.renderPicker();
            self.resetPicker();
        },
        renderPicker: function(){
            var self = this,
                rgb = self.getRgb();
            self.fillColor(rgb);
            if(self.pickColor()){
                self.color = self.pickColor();
            }
        },
        getRgb: function(){
            var self = this;
            var r = 0, g = 0, b = 0;
            var currentCurrent = self.defaultColor;

            currentCurrent = currentCurrent.replace(/^\s+|\s+$/g, "");

            // 十六进制色值合法性检测，非法色值强制转换为#f00
            var colorReg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/gi;
            var result = currentCurrent.match(colorReg);
            // console.log(!result);
            if(!result){
                currentCurrent = "#f00";
            }

            // 还原十进制RGB颜色值
            if(currentCurrent.indexOf("#") !== -1){
                currentCurrent = currentCurrent.replace("#", "");
            }
            if(currentCurrent.length === 6){
                r = currentCurrent.substr(0, 2).toLowerCase();
                g = currentCurrent.substr(2, 2).toLowerCase();
                b = currentCurrent.substr(4, 2).toLowerCase();
            }else{
                r = currentCurrent.substr(0, 1).toLowerCase();
                r = r + "" + r;
                g = currentCurrent.substr(1, 1).toLowerCase();
                g = g + "" + g;
                b = currentCurrent.substr(2, 1).toLowerCase();
                b = b + "" + b;
            }
            r = parseInt(r, 16);
            g = parseInt(g, 16);
            b = parseInt(b, 16);
            return {r: r, g: g, b: b};
        },
        fillColor: function(rgb){
            // 创建颜色块
            var self = this;
            var cc = self.canvas[0];
            var ctx = cc.getContext("2d");
            ctx.width = 256;
            ctx.height = 256;
            // 创建渐变原型
            function createGradient(ctx, startColor, endColor) {
                var gradient = ctx.createLinearGradient(0, 0, 256, 0);
                gradient.addColorStop(0, startColor);
                gradient.addColorStop(1, endColor);
                return gradient;
            }
            // 色值像素点大小
            var pointSize = 1;
            // 计算三原色跳跃步长
            var stepr = (rgb.r * pointSize) / 256, stepg = (rgb.g * pointSize) / 256, stepb = (rgb.b * pointSize) / 256;
            // 绘制取色板
            for(var i = 0, ecr = 0, ecg = 0, ecb = 0, index = 0; i < 256; i += pointSize){
                var sr = (i.toString(16).length === 1) ? ("0" + i.toString(16)) : i.toString(16);
                var sc = "#" + sr + "" + sr + "" + sr;
                ecr = ecr + stepr;
                ecg = ecg + stepg;
                ecb = ecb + stepb;
                //还原十六进制色码
                var hexr = (Math.floor(ecr).toString(16).length === 1) ? ("0" + Math.floor(ecr).toString(16)) : Math.floor(ecr).toString(16);
                var hexg = (Math.floor(ecg).toString(16).length === 1) ? ("0" + Math.floor(ecg).toString(16)) : Math.floor(ecg).toString(16);
                var hexb = (Math.floor(ecb).toString(16).length === 1) ? ("0" + Math.floor(ecb).toString(16)) : Math.floor(ecb).toString(16);
                self.colorList[index++] = {"r": [sr, hexr], "g": [sr, hexg], "b": [sr, hexb]};
                var ec = "#" + hexr + hexg + hexb;
                ctx.fillStyle = createGradient(ctx, sc, ec);
                // console.log(i);
                ctx.fillRect(0, 256 - i - 1, 256, pointSize);
            }
        },
        pickColor: function(){
            //取色
            var self = this, pickFlag = false;
            var picker = self.picker;
            var pickerBox = self.cp.one(".J_ColorBox");
            var delta = Math.floor(picker.width() / 2);
            var clickColor = {};
            var moveColor = {};
            var targetColor = [];
            var origin = {"x": 0, "y": 0};
            // console.log(origin);
            var lastColor = "";
            pickerBox.on("mousedown", function(e){
                pickFlag = true;
                origin.x = self.canvas.offset().left;
                origin.y = self.canvas.offset().top;
                clickColor.x = e.clientX;
                clickColor.y = e.clientY;
                var destColor = {"left": (clickColor.x - origin.x - delta), "top": (clickColor.y - origin.y - delta)};
                if(destColor.left < -delta){
                    destColor.left = -delta;
                }else if(destColor.left > pickerBox.width() - 1 - delta){
                    destColor.left = pickerBox.width() - 1 - delta;
                }
                if(destColor.top < -delta){
                    destColor.top = -delta;
                }else if(destColor.top > pickerBox.height() - 1 - delta){
                    destColor.top = pickerBox.height() - 1 - delta;
                }
                picker.css({"left": destColor.left, "top": destColor.top});
            }).on("mousemove", function(e){
                if(pickFlag){
                    moveColor.x = e.clientX;
                    moveColor.y = e.clientY;
                    var destColor = {"left": (moveColor.x - origin.x - delta), "top": (moveColor.y - origin.y - delta)};
                    if(destColor.left < -delta){
                        destColor.left = -delta;
                    }else if(destColor.left > pickerBox.width() - 1 - delta){
                        destColor.left = pickerBox.width() - 1 - delta;
                    }
                    if(destColor.top < -delta){
                        destColor.top = -delta;
                    }else if(destColor.top > pickerBox.height() - 1 - delta){
                        destColor.top = pickerBox.height() - 1 - delta;
                    }
                    picker.css({"left": destColor.left, "top": destColor.top});
                }
            }).on("mouseup", function(e){
                if(pickFlag){
                    pickFlag = false;
                    moveColor.x = e.clientX;
                    moveColor.y = e.clientY;
                    targetColor[0] = Math.floor(moveColor.x - origin.x);
                    targetColor[1] = Math.floor(moveColor.y - origin.y);
                    if(targetColor[0] < 1){
                        targetColor[0] = 1;
                    }else if(targetColor[0] > pickerBox.width()){
                        targetColor[0] = pickerBox.width();
                    }
                    if(targetColor[1] < 1){
                        targetColor[1] = 1;
                    }else if(targetColor[1] > pickerBox.height()){
                        targetColor[1] = pickerBox.height();
                    }
                    var colorselected = self.colorList[self.colorList.length - targetColor[1]];
                    var stepRh = (parseInt(colorselected["r"][1], 16) - parseInt(colorselected["r"][0], 16)) / 256;
                    var stepGh = (parseInt(colorselected["g"][1], 16) - parseInt(colorselected["g"][0], 16)) / 256;
                    var stepBh = (parseInt(colorselected["b"][1], 16) - parseInt(colorselected["b"][0], 16)) / 256;
                    var targetR = parseInt(colorselected["r"][0], 16) + Math.floor(targetColor[0] * stepRh);
                    targetR = (targetR.toString(16).length === 1) ? "0" + targetR.toString(16) : targetR.toString(16);
                    var targetG = parseInt(colorselected["g"][0], 16) + Math.floor(targetColor[0] * stepGh);
                    targetG = (targetG.toString(16).length === 1) ? "0" + targetG.toString(16) : targetG.toString(16);
                    var targetB = parseInt(colorselected["b"][0], 16) + Math.floor(targetColor[0] * stepBh);
                    targetB = (targetB.toString(16).length === 1) ? "0" + targetB.toString(16) : targetB.toString(16);
                    lastColor = "#" + targetR + targetG + targetB;
                    // if(lastColor === ""){
                    //     lastColor = self.defaultColor;
                    // }
                    self.color = lastColor || self.defaultColor;
                    self.complete && self.complete();
                }
            }).on("selectstart", function(e){
                return false;
            });
        },
        getColor: function(){
            var self = this;
            return self.color;
        },
        resetPicker: function(){
            var self = this;
            self.picker.css({"left": "auto", "right": -Math.floor(self.picker.width() / 2), "top": -Math.floor(self.picker.height() / 2)});
            self.color = self.defaultColor;
            self.complete && self.complete();
        },
        reLocation: function(){
            var self = this;
            var triggerPos = self.trigger.offset();
            self.cp.css({"left": triggerPos.left, "top": triggerPos.top + self.trigger.height() + 10});
        },
        show: function(){
            var self = this;
            self.cp.css("visibility", "visible");
        },
        hide: function(){
            var self = this;
            self.cp.css("visibility", "hidden");
        }
    }, {ATTRS : /** @lends ColorPicker*/{

    }});
    return ColorPicker;
}, {requires:['node', 'base']});



