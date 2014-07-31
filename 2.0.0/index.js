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
         * @trigger 触发显示拾色器的元素，暂时只支持单一元素
         * @defaultColor 取色器默认初始化颜色，十六进制（支持三位/六位）
         * @complete 取色完成时可调用的行为函数
         */
        self.trigger = S.one(cfg.trigger);
        self.defaultColor = cfg.defaultColor || "#f00";
        self.complete = cfg.complete || function(){};
        self.colorList = [];
        self.color = self.defaultColor;
        self.isShow = false;
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
            self.colorSlider = [
                {hex: "ff0000", per: 0},
                {hex: "ff00ff", per: 42 / 256},
                {hex: "0000ff", per: 85 / 256},
                {hex: "00ffff", per: 127 / 256},
                {hex: "00ff00", per: 170 / 256},
                {hex: "ffff00", per: 212 / 256},
                {hex: "ff0000", per: 1}
            ];
            self.setter = self.cp.one(".J_SetColor");
            self.setArrow = self.setter.one(".J_SetArrow");
            self.trigger.on("click", function(e){
                e.preventDefault();
                self.reLocation();
                if(!self.isShow){
                    self.show();
                }else{
                    self.hide();
                }
            });
            self.setter.on("click", function(e){
                e.preventDefault();
                var aposY = self.moveArrow(e);
                var slideColor = self.newColor(aposY);
                self.setColor(slideColor);
            })
        },
        createColorPicker: function(cid) {
            var self = this;
            var node = D.create("<div class=\"ks-colorpicker\">"
                + "<div class=\"J_ColorBox\">"
                + "<canvas class=\"colorTable\" id=\"" + cid + "\" width=\"256\" height=\"256\">您的浏览器不支持Canvas标签。</canvas>"
                + "<img src=\"http://img02.taobaocdn.com/tps/i2/T1SO8vFoVXXXc1zPrr-9-9.png\" width=\"9\" height=\"9\" class=\"J_ColorTarget ks-colortarget\">"
                + "</div>"
                + "<div class=\"J_SetColor\">"
                + "<img src=\"http://img04.taobaocdn.com/tps/i4/T1_xdvFgtbXXbf40rs-25-246.png\" width=\"25\" height=\"246\">"
                + "<span class=\"J_SetArrow\"></span>"
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
            self.isShow = true;
        },
        hide: function(){
            var self = this;
            self.cp.css("visibility", "hidden");
            self.isShow = false;
        },
        moveArrow: function(ev){
            var self = this;
            var sposY = self.setter.offset().top;
            var sy = ev.clientY;
            var top = sy - sposY;
            if(top < 0){
                top = 0;
            }else if(top > self.setter.height()){
                top = self.setter.height() - 1;
            }
            var percent = top / self.setter.height();
            top = top - Math.floor(self.setArrow.outerHeight() / 2);
            self.setArrow.css("top", top);
            return percent;
        },
        newColor: function(pos){
            var self = this;
            for(var i = 0; i < self.colorSlider.length - 1; i++){
                if(pos >= self.colorSlider[i].per && pos <= self.colorSlider[i + 1].per){
                    var col = self.createColor(i, pos - self.colorSlider[i].per, self.colorSlider[i], self.colorSlider[i + 1]);
                    break;
                }
            }
            return col;
        },
        createColor: function(index, pos, sc, ec){
            var self = this;
            var tscR = sc.hex.substr(0, 2),
                tscG = sc.hex.substr(2, 2),
                tscB = sc.hex.substr(4, 2),
                tecR = ec.hex.substr(0, 2),
                tecG = ec.hex.substr(2, 2),
                tecB = ec.hex.substr(4, 2);
            var dR = 0, dG = 0, dB = 0;
            if(index === 0 || index === 3){ //红色到紫色过渡和蓝色到绿色过渡，只有B变化
                dB = ((parseInt(tecB, 16) - parseInt(tscB, 16)) / (ec.per - sc.per)) * pos;
            }else if(index === 1 || index === 4) { //紫色到青色过渡和绿色到黄色过渡，只有R变化
                dR = ((parseInt(tecR, 16) - parseInt(tscR, 16)) / (ec.per - sc.per)) * pos;
            }else{ //其余只有G变化
                dG = ((parseInt(tecG, 16) - parseInt(tscG, 16)) / (ec.per - sc.per)) * pos;
            }
            var outR = Math.floor(parseInt(tscR, 16) + dR).toString(16);
            var outG = Math.floor(parseInt(tscG, 16) + dG).toString(16);
            var outB = Math.floor(parseInt(tscB, 16) + dB).toString(16);
            outR = outR.length === 1 ? "0" + outR : outR;
            outG = outG.length === 1 ? "0" + outG : outG;
            outB = outB.length === 1 ? "0" + outB : outB;
            var tcolor = "#" + outR + outG + outB;
            return tcolor;
        }
    }, {ATTRS : /** @lends ColorPicker*/{

    }});
    return ColorPicker;
}, {requires:['node', 'base']});



