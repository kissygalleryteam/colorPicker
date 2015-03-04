# color

color parse and format util

[![color](https://nodei.co/npm/modulex-color.png)](https://npmjs.org/package/modulex-color)
[![NPM downloads](http://img.shields.io/npm/dm/modulex-color.svg)](https://npmjs.org/package/modulex-color)
[![Build Status](https://secure.travis-ci.org/kissyteam/color.png?branch=master)](https://travis-ci.org/kissyteam/color)
[![Coverage Status](https://img.shields.io/coveralls/kissyteam/color.svg)](https://coveralls.io/r/kissyteam/color?branch=master)
[![Dependency Status](https://gemnasium.com/kissyteam/color.png)](https://gemnasium.com/kissyteam/color)
[![Bower version](https://badge.fury.io/bo/modulex-color.svg)](http://badge.fury.io/bo/modulex-color)
[![node version](https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square)](http://nodejs.org/download/)

[![browser support](https://ci.testling.com/kissyteam/color.png)](https://ci.testling.com/kissyteam/color)


## example

```javascript
var Color = require('modulex-color');
describe('color', function () {
    it('parse rgba right', function () {
        var rgba = Color.parse('rgba(1,2,3,0.4)');
        rgba.getR()//1
        rgba.getG()//2
        rgba.getB()//3
        rgba.getA()//4
    });
});
```