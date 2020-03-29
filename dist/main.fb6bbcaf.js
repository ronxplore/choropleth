// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/fetch-jsonp/build/fetch-jsonp.js":[function(require,module,exports) {
var define;
var global = arguments[3];
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.fetchJsonp = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var defaultOptions = {
    timeout: 5000,
    jsonpCallback: 'callback',
    jsonpCallbackFunction: null
  };

  function generateCallbackFunction() {
    return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
  }

  function clearFunction(functionName) {
    // IE8 throws an exception when you try to delete a property on window
    // http://stackoverflow.com/a/1824228/751089
    try {
      delete window[functionName];
    } catch (e) {
      window[functionName] = undefined;
    }
  }

  function removeScript(scriptId) {
    var script = document.getElementById(scriptId);
    if (script) {
      document.getElementsByTagName('head')[0].removeChild(script);
    }
  }

  function fetchJsonp(_url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    // to avoid param reassign
    var url = _url;
    var timeout = options.timeout || defaultOptions.timeout;
    var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

    var timeoutId = undefined;

    return new Promise(function (resolve, reject) {
      var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
      var scriptId = jsonpCallback + '_' + callbackFunction;

      window[callbackFunction] = function (response) {
        resolve({
          ok: true,
          // keep consistent with fetch API
          json: function json() {
            return Promise.resolve(response);
          }
        });

        if (timeoutId) clearTimeout(timeoutId);

        removeScript(scriptId);

        clearFunction(callbackFunction);
      };

      // Check if the user set their own params, and if not add a ? to start a list of params
      url += url.indexOf('?') === -1 ? '?' : '&';

      var jsonpScript = document.createElement('script');
      jsonpScript.setAttribute('src', '' + url + jsonpCallback + '=' + callbackFunction);
      if (options.charset) {
        jsonpScript.setAttribute('charset', options.charset);
      }
      jsonpScript.id = scriptId;
      document.getElementsByTagName('head')[0].appendChild(jsonpScript);

      timeoutId = setTimeout(function () {
        reject(new Error('JSONP request to ' + _url + ' timed out'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
        window[callbackFunction] = function () {
          clearFunction(callbackFunction);
        };
      }, timeout);

      // Caught if got 404/500
      jsonpScript.onerror = function () {
        reject(new Error('JSONP request to ' + _url + ' failed'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    });
  }

  // export as global function
  /*
  let local;
  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }
  local.fetchJsonp = fetchJsonp;
  */

  module.exports = fetchJsonp;
});
},{}],"node_modules/chroma-js/chroma.js":[function(require,module,exports) {
var define;
var global = arguments[3];
/**
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2019, Gregor Aisch
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * -------------------------------------------------------
 *
 * chroma.js includes colors from colorbrewer2.org, which are released under
 * the following license:
 *
 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
 * and The Pennsylvania State University.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * ------------------------------------------------------
 *
 * Named colors are taken from X11 Color Names.
 * http://www.w3.org/TR/css3-color/#svg-color
 *
 * @preserve
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.chroma = factory());
}(this, (function () { 'use strict';

    var limit = function (x, min, max) {
        if ( min === void 0 ) min=0;
        if ( max === void 0 ) max=1;

        return x < min ? min : x > max ? max : x;
    };

    var clip_rgb = function (rgb) {
        rgb._clipped = false;
        rgb._unclipped = rgb.slice(0);
        for (var i=0; i<=3; i++) {
            if (i < 3) {
                if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
                rgb[i] = limit(rgb[i], 0, 255);
            } else if (i === 3) {
                rgb[i] = limit(rgb[i], 0, 1);
            }
        }
        return rgb;
    };

    // ported from jQuery's $.type
    var classToType = {};
    for (var i = 0, list = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i < list.length; i += 1) {
        var name = list[i];

        classToType[("[object " + name + "]")] = name.toLowerCase();
    }
    var type = function(obj) {
        return classToType[Object.prototype.toString.call(obj)] || "object";
    };

    var unpack = function (args, keyOrder) {
        if ( keyOrder === void 0 ) keyOrder=null;

    	// if called with more than 3 arguments, we return the arguments
        if (args.length >= 3) { return Array.prototype.slice.call(args); }
        // with less than 3 args we check if first arg is object
        // and use the keyOrder string to extract and sort properties
    	if (type(args[0]) == 'object' && keyOrder) {
    		return keyOrder.split('')
    			.filter(function (k) { return args[0][k] !== undefined; })
    			.map(function (k) { return args[0][k]; });
    	}
    	// otherwise we just return the first argument
    	// (which we suppose is an array of args)
        return args[0];
    };

    var last = function (args) {
        if (args.length < 2) { return null; }
        var l = args.length-1;
        if (type(args[l]) == 'string') { return args[l].toLowerCase(); }
        return null;
    };

    var PI = Math.PI;

    var utils = {
    	clip_rgb: clip_rgb,
    	limit: limit,
    	type: type,
    	unpack: unpack,
    	last: last,
    	PI: PI,
    	TWOPI: PI*2,
    	PITHIRD: PI/3,
    	DEG2RAD: PI / 180,
    	RAD2DEG: 180 / PI
    };

    var input = {
    	format: {},
    	autodetect: []
    };

    var last$1 = utils.last;
    var clip_rgb$1 = utils.clip_rgb;
    var type$1 = utils.type;


    var Color = function Color() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var me = this;
        if (type$1(args[0]) === 'object' &&
            args[0].constructor &&
            args[0].constructor === this.constructor) {
            // the argument is already a Color instance
            return args[0];
        }

        // last argument could be the mode
        var mode = last$1(args);
        var autodetect = false;

        if (!mode) {
            autodetect = true;
            if (!input.sorted) {
                input.autodetect = input.autodetect.sort(function (a,b) { return b.p - a.p; });
                input.sorted = true;
            }
            // auto-detect format
            for (var i = 0, list = input.autodetect; i < list.length; i += 1) {
                var chk = list[i];

                mode = chk.test.apply(chk, args);
                if (mode) { break; }
            }
        }

        if (input.format[mode]) {
            var rgb = input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
            me._rgb = clip_rgb$1(rgb);
        } else {
            throw new Error('unknown format: '+args);
        }

        // add alpha channel
        if (me._rgb.length === 3) { me._rgb.push(1); }
    };

    Color.prototype.toString = function toString () {
        if (type$1(this.hex) == 'function') { return this.hex(); }
        return ("[" + (this._rgb.join(',')) + "]");
    };

    var Color_1 = Color;

    var chroma = function () {
    	var args = [], len = arguments.length;
    	while ( len-- ) args[ len ] = arguments[ len ];

    	return new (Function.prototype.bind.apply( chroma.Color, [ null ].concat( args) ));
    };

    chroma.Color = Color_1;
    chroma.version = '2.1.0';

    var chroma_1 = chroma;

    var unpack$1 = utils.unpack;
    var max = Math.max;

    var rgb2cmyk = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$1(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r = r / 255;
        g = g / 255;
        b = b / 255;
        var k = 1 - max(r,max(g,b));
        var f = k < 1 ? 1 / (1-k) : 0;
        var c = (1-r-k) * f;
        var m = (1-g-k) * f;
        var y = (1-b-k) * f;
        return [c,m,y,k];
    };

    var rgb2cmyk_1 = rgb2cmyk;

    var unpack$2 = utils.unpack;

    var cmyk2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$2(args, 'cmyk');
        var c = args[0];
        var m = args[1];
        var y = args[2];
        var k = args[3];
        var alpha = args.length > 4 ? args[4] : 1;
        if (k === 1) { return [0,0,0,alpha]; }
        return [
            c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
            m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
            y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
            alpha
        ];
    };

    var cmyk2rgb_1 = cmyk2rgb;

    var unpack$3 = utils.unpack;
    var type$2 = utils.type;



    Color_1.prototype.cmyk = function() {
        return rgb2cmyk_1(this._rgb);
    };

    chroma_1.cmyk = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['cmyk']) ));
    };

    input.format.cmyk = cmyk2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$3(args, 'cmyk');
            if (type$2(args) === 'array' && args.length === 4) {
                return 'cmyk';
            }
        }
    });

    var unpack$4 = utils.unpack;
    var last$2 = utils.last;
    var rnd = function (a) { return Math.round(a*100)/100; };

    /*
     * supported arguments:
     * - hsl2css(h,s,l)
     * - hsl2css(h,s,l,a)
     * - hsl2css([h,s,l], mode)
     * - hsl2css([h,s,l,a], mode)
     * - hsl2css({h,s,l,a}, mode)
     */
    var hsl2css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var hsla = unpack$4(args, 'hsla');
        var mode = last$2(args) || 'lsa';
        hsla[0] = rnd(hsla[0] || 0);
        hsla[1] = rnd(hsla[1]*100) + '%';
        hsla[2] = rnd(hsla[2]*100) + '%';
        if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
            hsla[3] = hsla.length > 3 ? hsla[3] : 1;
            mode = 'hsla';
        } else {
            hsla.length = 3;
        }
        return (mode + "(" + (hsla.join(',')) + ")");
    };

    var hsl2css_1 = hsl2css;

    var unpack$5 = utils.unpack;

    /*
     * supported arguments:
     * - rgb2hsl(r,g,b)
     * - rgb2hsl(r,g,b,a)
     * - rgb2hsl([r,g,b])
     * - rgb2hsl([r,g,b,a])
     * - rgb2hsl({r,g,b,a})
     */
    var rgb2hsl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$5(args, 'rgba');
        var r = args[0];
        var g = args[1];
        var b = args[2];

        r /= 255;
        g /= 255;
        b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);

        var l = (max + min) / 2;
        var s, h;

        if (max === min){
            s = 0;
            h = Number.NaN;
        } else {
            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
        }

        if (r == max) { h = (g - b) / (max - min); }
        else if (g == max) { h = 2 + (b - r) / (max - min); }
        else if (b == max) { h = 4 + (r - g) / (max - min); }

        h *= 60;
        if (h < 0) { h += 360; }
        if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
        return [h,s,l];
    };

    var rgb2hsl_1 = rgb2hsl;

    var unpack$6 = utils.unpack;
    var last$3 = utils.last;


    var round = Math.round;

    /*
     * supported arguments:
     * - rgb2css(r,g,b)
     * - rgb2css(r,g,b,a)
     * - rgb2css([r,g,b], mode)
     * - rgb2css([r,g,b,a], mode)
     * - rgb2css({r,g,b,a}, mode)
     */
    var rgb2css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgba = unpack$6(args, 'rgba');
        var mode = last$3(args) || 'rgb';
        if (mode.substr(0,3) == 'hsl') {
            return hsl2css_1(rgb2hsl_1(rgba), mode);
        }
        rgba[0] = round(rgba[0]);
        rgba[1] = round(rgba[1]);
        rgba[2] = round(rgba[2]);
        if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
            rgba[3] = rgba.length > 3 ? rgba[3] : 1;
            mode = 'rgba';
        }
        return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
    };

    var rgb2css_1 = rgb2css;

    var unpack$7 = utils.unpack;
    var round$1 = Math.round;

    var hsl2rgb = function () {
        var assign;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$7(args, 'hsl');
        var h = args[0];
        var s = args[1];
        var l = args[2];
        var r,g,b;
        if (s === 0) {
            r = g = b = l*255;
        } else {
            var t3 = [0,0,0];
            var c = [0,0,0];
            var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
            var t1 = 2 * l - t2;
            var h_ = h / 360;
            t3[0] = h_ + 1/3;
            t3[1] = h_;
            t3[2] = h_ - 1/3;
            for (var i=0; i<3; i++) {
                if (t3[i] < 0) { t3[i] += 1; }
                if (t3[i] > 1) { t3[i] -= 1; }
                if (6 * t3[i] < 1)
                    { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
                else if (2 * t3[i] < 1)
                    { c[i] = t2; }
                else if (3 * t3[i] < 2)
                    { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
                else
                    { c[i] = t1; }
            }
            (assign = [round$1(c[0]*255),round$1(c[1]*255),round$1(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
        }
        if (args.length > 3) {
            // keep alpha channel
            return [r,g,b,args[3]];
        }
        return [r,g,b,1];
    };

    var hsl2rgb_1 = hsl2rgb;

    var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
    var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
    var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
    var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

    var round$2 = Math.round;

    var css2rgb = function (css) {
        css = css.toLowerCase().trim();
        var m;

        if (input.format.named) {
            try {
                return input.format.named(css);
            } catch (e) {
                // eslint-disable-next-line
            }
        }

        // rgb(250,20,0)
        if ((m = css.match(RE_RGB))) {
            var rgb = m.slice(1,4);
            for (var i=0; i<3; i++) {
                rgb[i] = +rgb[i];
            }
            rgb[3] = 1;  // default alpha
            return rgb;
        }

        // rgba(250,20,0,0.4)
        if ((m = css.match(RE_RGBA))) {
            var rgb$1 = m.slice(1,5);
            for (var i$1=0; i$1<4; i$1++) {
                rgb$1[i$1] = +rgb$1[i$1];
            }
            return rgb$1;
        }

        // rgb(100%,0%,0%)
        if ((m = css.match(RE_RGB_PCT))) {
            var rgb$2 = m.slice(1,4);
            for (var i$2=0; i$2<3; i$2++) {
                rgb$2[i$2] = round$2(rgb$2[i$2] * 2.55);
            }
            rgb$2[3] = 1;  // default alpha
            return rgb$2;
        }

        // rgba(100%,0%,0%,0.4)
        if ((m = css.match(RE_RGBA_PCT))) {
            var rgb$3 = m.slice(1,5);
            for (var i$3=0; i$3<3; i$3++) {
                rgb$3[i$3] = round$2(rgb$3[i$3] * 2.55);
            }
            rgb$3[3] = +rgb$3[3];
            return rgb$3;
        }

        // hsl(0,100%,50%)
        if ((m = css.match(RE_HSL))) {
            var hsl = m.slice(1,4);
            hsl[1] *= 0.01;
            hsl[2] *= 0.01;
            var rgb$4 = hsl2rgb_1(hsl);
            rgb$4[3] = 1;
            return rgb$4;
        }

        // hsla(0,100%,50%,0.5)
        if ((m = css.match(RE_HSLA))) {
            var hsl$1 = m.slice(1,4);
            hsl$1[1] *= 0.01;
            hsl$1[2] *= 0.01;
            var rgb$5 = hsl2rgb_1(hsl$1);
            rgb$5[3] = +m[4];  // default alpha = 1
            return rgb$5;
        }
    };

    css2rgb.test = function (s) {
        return RE_RGB.test(s) ||
            RE_RGBA.test(s) ||
            RE_RGB_PCT.test(s) ||
            RE_RGBA_PCT.test(s) ||
            RE_HSL.test(s) ||
            RE_HSLA.test(s);
    };

    var css2rgb_1 = css2rgb;

    var type$3 = utils.type;




    Color_1.prototype.css = function(mode) {
        return rgb2css_1(this._rgb, mode);
    };

    chroma_1.css = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['css']) ));
    };

    input.format.css = css2rgb_1;

    input.autodetect.push({
        p: 5,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$3(h) === 'string' && css2rgb_1.test(h)) {
                return 'css';
            }
        }
    });

    var unpack$8 = utils.unpack;

    input.format.gl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgb = unpack$8(args, 'rgba');
        rgb[0] *= 255;
        rgb[1] *= 255;
        rgb[2] *= 255;
        return rgb;
    };

    chroma_1.gl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['gl']) ));
    };

    Color_1.prototype.gl = function() {
        var rgb = this._rgb;
        return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
    };

    var unpack$9 = utils.unpack;

    var rgb2hcg = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$9(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var c = delta * 100 / 255;
        var _g = min / (255 - delta) * 100;
        var h;
        if (delta === 0) {
            h = Number.NaN;
        } else {
            if (r === max) { h = (g - b) / delta; }
            if (g === max) { h = 2+(b - r) / delta; }
            if (b === max) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, c, _g];
    };

    var rgb2hcg_1 = rgb2hcg;

    var unpack$a = utils.unpack;
    var floor = Math.floor;

    /*
     * this is basically just HSV with some minor tweaks
     *
     * hue.. [0..360]
     * chroma .. [0..1]
     * grayness .. [0..1]
     */

    var hcg2rgb = function () {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$a(args, 'hcg');
        var h = args[0];
        var c = args[1];
        var _g = args[2];
        var r,g,b;
        _g = _g * 255;
        var _c = c * 255;
        if (c === 0) {
            r = g = b = _g;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;
            var i = floor(h);
            var f = h - i;
            var p = _g * (1 - c);
            var q = p + _c * (1 - f);
            var t = p + _c * f;
            var v = p + _c;
            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var hcg2rgb_1 = hcg2rgb;

    var unpack$b = utils.unpack;
    var type$4 = utils.type;






    Color_1.prototype.hcg = function() {
        return rgb2hcg_1(this._rgb);
    };

    chroma_1.hcg = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcg']) ));
    };

    input.format.hcg = hcg2rgb_1;

    input.autodetect.push({
        p: 1,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$b(args, 'hcg');
            if (type$4(args) === 'array' && args.length === 3) {
                return 'hcg';
            }
        }
    });

    var unpack$c = utils.unpack;
    var last$4 = utils.last;
    var round$3 = Math.round;

    var rgb2hex = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$c(args, 'rgba');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var a = ref[3];
        var mode = last$4(args) || 'auto';
        if (a === undefined) { a = 1; }
        if (mode === 'auto') {
            mode = a < 1 ? 'rgba' : 'rgb';
        }
        r = round$3(r);
        g = round$3(g);
        b = round$3(b);
        var u = r << 16 | g << 8 | b;
        var str = "000000" + u.toString(16); //#.toUpperCase();
        str = str.substr(str.length - 6);
        var hxa = '0' + round$3(a * 255).toString(16);
        hxa = hxa.substr(hxa.length - 2);
        switch (mode.toLowerCase()) {
            case 'rgba': return ("#" + str + hxa);
            case 'argb': return ("#" + hxa + str);
            default: return ("#" + str);
        }
    };

    var rgb2hex_1 = rgb2hex;

    var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    var RE_HEXA = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

    var hex2rgb = function (hex) {
        if (hex.match(RE_HEX)) {
            // remove optional leading #
            if (hex.length === 4 || hex.length === 7) {
                hex = hex.substr(1);
            }
            // expand short-notation to full six-digit
            if (hex.length === 3) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            var u = parseInt(hex, 16);
            var r = u >> 16;
            var g = u >> 8 & 0xFF;
            var b = u & 0xFF;
            return [r,g,b,1];
        }

        // match rgba hex format, eg #FF000077
        if (hex.match(RE_HEXA)) {
            if (hex.length === 5 || hex.length === 9) {
                // remove optional leading #
                hex = hex.substr(1);
            }
            // expand short-notation to full eight-digit
            if (hex.length === 4) {
                hex = hex.split('');
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
            }
            var u$1 = parseInt(hex, 16);
            var r$1 = u$1 >> 24 & 0xFF;
            var g$1 = u$1 >> 16 & 0xFF;
            var b$1 = u$1 >> 8 & 0xFF;
            var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
            return [r$1,g$1,b$1,a];
        }

        // we used to check for css colors here
        // if _input.css? and rgb = _input.css hex
        //     return rgb

        throw new Error(("unknown hex color: " + hex));
    };

    var hex2rgb_1 = hex2rgb;

    var type$5 = utils.type;




    Color_1.prototype.hex = function(mode) {
        return rgb2hex_1(this._rgb, mode);
    };

    chroma_1.hex = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hex']) ));
    };

    input.format.hex = hex2rgb_1;
    input.autodetect.push({
        p: 4,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$5(h) === 'string' && [3,4,5,6,7,8,9].indexOf(h.length) >= 0) {
                return 'hex';
            }
        }
    });

    var unpack$d = utils.unpack;
    var TWOPI = utils.TWOPI;
    var min = Math.min;
    var sqrt = Math.sqrt;
    var acos = Math.acos;

    var rgb2hsi = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
        */
        var ref = unpack$d(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        r /= 255;
        g /= 255;
        b /= 255;
        var h;
        var min_ = min(r,g,b);
        var i = (r+g+b) / 3;
        var s = i > 0 ? 1 - min_/i : 0;
        if (s === 0) {
            h = NaN;
        } else {
            h = ((r-g)+(r-b)) / 2;
            h /= sqrt((r-g)*(r-g) + (r-b)*(g-b));
            h = acos(h);
            if (b > g) {
                h = TWOPI - h;
            }
            h /= TWOPI;
        }
        return [h*360,s,i];
    };

    var rgb2hsi_1 = rgb2hsi;

    var unpack$e = utils.unpack;
    var limit$1 = utils.limit;
    var TWOPI$1 = utils.TWOPI;
    var PITHIRD = utils.PITHIRD;
    var cos = Math.cos;

    /*
     * hue [0..360]
     * saturation [0..1]
     * intensity [0..1]
     */
    var hsi2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        borrowed from here:
        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
        */
        args = unpack$e(args, 'hsi');
        var h = args[0];
        var s = args[1];
        var i = args[2];
        var r,g,b;

        if (isNaN(h)) { h = 0; }
        if (isNaN(s)) { s = 0; }
        // normalize hue
        if (h > 360) { h -= 360; }
        if (h < 0) { h += 360; }
        h /= 360;
        if (h < 1/3) {
            b = (1-s)/3;
            r = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            g = 1 - (b+r);
        } else if (h < 2/3) {
            h -= 1/3;
            r = (1-s)/3;
            g = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            b = 1 - (r+g);
        } else {
            h -= 2/3;
            g = (1-s)/3;
            b = (1+s*cos(TWOPI$1*h)/cos(PITHIRD-TWOPI$1*h))/3;
            r = 1 - (g+b);
        }
        r = limit$1(i*r*3);
        g = limit$1(i*g*3);
        b = limit$1(i*b*3);
        return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
    };

    var hsi2rgb_1 = hsi2rgb;

    var unpack$f = utils.unpack;
    var type$6 = utils.type;






    Color_1.prototype.hsi = function() {
        return rgb2hsi_1(this._rgb);
    };

    chroma_1.hsi = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsi']) ));
    };

    input.format.hsi = hsi2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$f(args, 'hsi');
            if (type$6(args) === 'array' && args.length === 3) {
                return 'hsi';
            }
        }
    });

    var unpack$g = utils.unpack;
    var type$7 = utils.type;






    Color_1.prototype.hsl = function() {
        return rgb2hsl_1(this._rgb);
    };

    chroma_1.hsl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsl']) ));
    };

    input.format.hsl = hsl2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$g(args, 'hsl');
            if (type$7(args) === 'array' && args.length === 3) {
                return 'hsl';
            }
        }
    });

    var unpack$h = utils.unpack;
    var min$1 = Math.min;
    var max$1 = Math.max;

    /*
     * supported arguments:
     * - rgb2hsv(r,g,b)
     * - rgb2hsv([r,g,b])
     * - rgb2hsv({r,g,b})
     */
    var rgb2hsl$1 = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$h(args, 'rgb');
        var r = args[0];
        var g = args[1];
        var b = args[2];
        var min_ = min$1(r, g, b);
        var max_ = max$1(r, g, b);
        var delta = max_ - min_;
        var h,s,v;
        v = max_ / 255.0;
        if (max_ === 0) {
            h = Number.NaN;
            s = 0;
        } else {
            s = delta / max_;
            if (r === max_) { h = (g - b) / delta; }
            if (g === max_) { h = 2+(b - r) / delta; }
            if (b === max_) { h = 4+(r - g) / delta; }
            h *= 60;
            if (h < 0) { h += 360; }
        }
        return [h, s, v]
    };

    var rgb2hsv = rgb2hsl$1;

    var unpack$i = utils.unpack;
    var floor$1 = Math.floor;

    var hsv2rgb = function () {
        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];
        args = unpack$i(args, 'hsv');
        var h = args[0];
        var s = args[1];
        var v = args[2];
        var r,g,b;
        v *= 255;
        if (s === 0) {
            r = g = b = v;
        } else {
            if (h === 360) { h = 0; }
            if (h > 360) { h -= 360; }
            if (h < 0) { h += 360; }
            h /= 60;

            var i = floor$1(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - s * f);
            var t = v * (1 - s * (1 - f));

            switch (i) {
                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
            }
        }
        return [r,g,b,args.length > 3?args[3]:1];
    };

    var hsv2rgb_1 = hsv2rgb;

    var unpack$j = utils.unpack;
    var type$8 = utils.type;






    Color_1.prototype.hsv = function() {
        return rgb2hsv(this._rgb);
    };

    chroma_1.hsv = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hsv']) ));
    };

    input.format.hsv = hsv2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$j(args, 'hsv');
            if (type$8(args) === 'array' && args.length === 3) {
                return 'hsv';
            }
        }
    });

    var labConstants = {
        // Corresponds roughly to RGB brighter/darker
        Kn: 18,

        // D65 standard referent
        Xn: 0.950470,
        Yn: 1,
        Zn: 1.088830,

        t0: 0.137931034,  // 4 / 29
        t1: 0.206896552,  // 6 / 29
        t2: 0.12841855,   // 3 * t1 * t1
        t3: 0.008856452,  // t1 * t1 * t1
    };

    var unpack$k = utils.unpack;
    var pow = Math.pow;

    var rgb2lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$k(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2xyz(r,g,b);
        var x = ref$1[0];
        var y = ref$1[1];
        var z = ref$1[2];
        var l = 116 * y - 16;
        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
    };

    var rgb_xyz = function (r) {
        if ((r /= 255) <= 0.04045) { return r / 12.92; }
        return pow((r + 0.055) / 1.055, 2.4);
    };

    var xyz_lab = function (t) {
        if (t > labConstants.t3) { return pow(t, 1 / 3); }
        return t / labConstants.t2 + labConstants.t0;
    };

    var rgb2xyz = function (r,g,b) {
        r = rgb_xyz(r);
        g = rgb_xyz(g);
        b = rgb_xyz(b);
        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / labConstants.Xn);
        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / labConstants.Yn);
        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / labConstants.Zn);
        return [x,y,z];
    };

    var rgb2lab_1 = rgb2lab;

    var unpack$l = utils.unpack;
    var pow$1 = Math.pow;

    /*
     * L* [0..100]
     * a [-100..100]
     * b [-100..100]
     */
    var lab2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$l(args, 'lab');
        var l = args[0];
        var a = args[1];
        var b = args[2];
        var x,y,z, r,g,b_;

        y = (l + 16) / 116;
        x = isNaN(a) ? y : y + a / 500;
        z = isNaN(b) ? y : y - b / 200;

        y = labConstants.Yn * lab_xyz(y);
        x = labConstants.Xn * lab_xyz(x);
        z = labConstants.Zn * lab_xyz(z);

        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

        return [r,g,b_,args.length > 3 ? args[3] : 1];
    };

    var xyz_rgb = function (r) {
        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$1(r, 1 / 2.4) - 0.055)
    };

    var lab_xyz = function (t) {
        return t > labConstants.t1 ? t * t * t : labConstants.t2 * (t - labConstants.t0)
    };

    var lab2rgb_1 = lab2rgb;

    var unpack$m = utils.unpack;
    var type$9 = utils.type;






    Color_1.prototype.lab = function() {
        return rgb2lab_1(this._rgb);
    };

    chroma_1.lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lab']) ));
    };

    input.format.lab = lab2rgb_1;

    input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$m(args, 'lab');
            if (type$9(args) === 'array' && args.length === 3) {
                return 'lab';
            }
        }
    });

    var unpack$n = utils.unpack;
    var RAD2DEG = utils.RAD2DEG;
    var sqrt$1 = Math.sqrt;
    var atan2 = Math.atan2;
    var round$4 = Math.round;

    var lab2lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$n(args, 'lab');
        var l = ref[0];
        var a = ref[1];
        var b = ref[2];
        var c = sqrt$1(a * a + b * b);
        var h = (atan2(b, a) * RAD2DEG + 360) % 360;
        if (round$4(c*10000) === 0) { h = Number.NaN; }
        return [l, c, h];
    };

    var lab2lch_1 = lab2lch;

    var unpack$o = utils.unpack;



    var rgb2lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$o(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        var ref$1 = rgb2lab_1(r,g,b);
        var l = ref$1[0];
        var a = ref$1[1];
        var b_ = ref$1[2];
        return lab2lch_1(l,a,b_);
    };

    var rgb2lch_1 = rgb2lch;

    var unpack$p = utils.unpack;
    var DEG2RAD = utils.DEG2RAD;
    var sin = Math.sin;
    var cos$1 = Math.cos;

    var lch2lab = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        /*
        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
        These formulas were invented by David Dalrymple to obtain maximum contrast without going
        out of gamut if the parameters are in the range 0-1.

        A saturation multiplier was added by Gregor Aisch
        */
        var ref = unpack$p(args, 'lch');
        var l = ref[0];
        var c = ref[1];
        var h = ref[2];
        if (isNaN(h)) { h = 0; }
        h = h * DEG2RAD;
        return [l, cos$1(h) * c, sin(h) * c]
    };

    var lch2lab_1 = lch2lab;

    var unpack$q = utils.unpack;



    var lch2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        args = unpack$q(args, 'lch');
        var l = args[0];
        var c = args[1];
        var h = args[2];
        var ref = lch2lab_1 (l,c,h);
        var L = ref[0];
        var a = ref[1];
        var b_ = ref[2];
        var ref$1 = lab2rgb_1 (L,a,b_);
        var r = ref$1[0];
        var g = ref$1[1];
        var b = ref$1[2];
        return [r, g, b, args.length > 3 ? args[3] : 1];
    };

    var lch2rgb_1 = lch2rgb;

    var unpack$r = utils.unpack;


    var hcl2rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var hcl = unpack$r(args, 'hcl').reverse();
        return lch2rgb_1.apply(void 0, hcl);
    };

    var hcl2rgb_1 = hcl2rgb;

    var unpack$s = utils.unpack;
    var type$a = utils.type;






    Color_1.prototype.lch = function() { return rgb2lch_1(this._rgb); };
    Color_1.prototype.hcl = function() { return rgb2lch_1(this._rgb).reverse(); };

    chroma_1.lch = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['lch']) ));
    };
    chroma_1.hcl = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['hcl']) ));
    };

    input.format.lch = lch2rgb_1;
    input.format.hcl = hcl2rgb_1;

    ['lch','hcl'].forEach(function (m) { return input.autodetect.push({
        p: 2,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$s(args, m);
            if (type$a(args) === 'array' && args.length === 3) {
                return m;
            }
        }
    }); });

    /**
    	X11 color names

    	http://www.w3.org/TR/css3-color/#svg-color
    */

    var w3cx11 = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflower: '#6495ed',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        laserlemon: '#ffff54',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrod: '#fafad2',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        maroon2: '#7f0000',
        maroon3: '#b03060',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        purple2: '#7f007f',
        purple3: '#a020f0',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32'
    };

    var w3cx11_1 = w3cx11;

    var type$b = utils.type;





    Color_1.prototype.name = function() {
        var hex = rgb2hex_1(this._rgb, 'rgb');
        for (var i = 0, list = Object.keys(w3cx11_1); i < list.length; i += 1) {
            var n = list[i];

            if (w3cx11_1[n] === hex) { return n.toLowerCase(); }
        }
        return hex;
    };

    input.format.named = function (name) {
        name = name.toLowerCase();
        if (w3cx11_1[name]) { return hex2rgb_1(w3cx11_1[name]); }
        throw new Error('unknown color name: '+name);
    };

    input.autodetect.push({
        p: 5,
        test: function (h) {
            var rest = [], len = arguments.length - 1;
            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

            if (!rest.length && type$b(h) === 'string' && w3cx11_1[h.toLowerCase()]) {
                return 'named';
            }
        }
    });

    var unpack$t = utils.unpack;

    var rgb2num = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = unpack$t(args, 'rgb');
        var r = ref[0];
        var g = ref[1];
        var b = ref[2];
        return (r << 16) + (g << 8) + b;
    };

    var rgb2num_1 = rgb2num;

    var type$c = utils.type;

    var num2rgb = function (num) {
        if (type$c(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
            var r = num >> 16;
            var g = (num >> 8) & 0xFF;
            var b = num & 0xFF;
            return [r,g,b,1];
        }
        throw new Error("unknown num color: "+num);
    };

    var num2rgb_1 = num2rgb;

    var type$d = utils.type;



    Color_1.prototype.num = function() {
        return rgb2num_1(this._rgb);
    };

    chroma_1.num = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['num']) ));
    };

    input.format.num = num2rgb_1;

    input.autodetect.push({
        p: 5,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            if (args.length === 1 && type$d(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
                return 'num';
            }
        }
    });

    var unpack$u = utils.unpack;
    var type$e = utils.type;
    var round$5 = Math.round;

    Color_1.prototype.rgb = function(rnd) {
        if ( rnd === void 0 ) rnd=true;

        if (rnd === false) { return this._rgb.slice(0,3); }
        return this._rgb.slice(0,3).map(round$5);
    };

    Color_1.prototype.rgba = function(rnd) {
        if ( rnd === void 0 ) rnd=true;

        return this._rgb.slice(0,4).map(function (v,i) {
            return i<3 ? (rnd === false ? v : round$5(v)) : v;
        });
    };

    chroma_1.rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['rgb']) ));
    };

    input.format.rgb = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgba = unpack$u(args, 'rgba');
        if (rgba[3] === undefined) { rgba[3] = 1; }
        return rgba;
    };

    input.autodetect.push({
        p: 3,
        test: function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            args = unpack$u(args, 'rgba');
            if (type$e(args) === 'array' && (args.length === 3 ||
                args.length === 4 && type$e(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
                return 'rgb';
            }
        }
    });

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     */

    var log = Math.log;

    var temperature2rgb = function (kelvin) {
        var temp = kelvin / 100;
        var r,g,b;
        if (temp < 66) {
            r = 255;
            g = -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log(g);
            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log(b);
        } else {
            r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log(r);
            g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log(g);
            b = 255;
        }
        return [r,g,b,1];
    };

    var temperature2rgb_1 = temperature2rgb;

    /*
     * Based on implementation by Neil Bartlett
     * https://github.com/neilbartlett/color-temperature
     **/


    var unpack$v = utils.unpack;
    var round$6 = Math.round;

    var rgb2temperature = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var rgb = unpack$v(args, 'rgb');
        var r = rgb[0], b = rgb[2];
        var minTemp = 1000;
        var maxTemp = 40000;
        var eps = 0.4;
        var temp;
        while (maxTemp - minTemp > eps) {
            temp = (maxTemp + minTemp) * 0.5;
            var rgb$1 = temperature2rgb_1(temp);
            if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
                maxTemp = temp;
            } else {
                minTemp = temp;
            }
        }
        return round$6(temp);
    };

    var rgb2temperature_1 = rgb2temperature;

    Color_1.prototype.temp =
    Color_1.prototype.kelvin =
    Color_1.prototype.temperature = function() {
        return rgb2temperature_1(this._rgb);
    };

    chroma_1.temp =
    chroma_1.kelvin =
    chroma_1.temperature = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        return new (Function.prototype.bind.apply( Color_1, [ null ].concat( args, ['temp']) ));
    };

    input.format.temp =
    input.format.kelvin =
    input.format.temperature = temperature2rgb_1;

    var type$f = utils.type;

    Color_1.prototype.alpha = function(a, mutate) {
        if ( mutate === void 0 ) mutate=false;

        if (a !== undefined && type$f(a) === 'number') {
            if (mutate) {
                this._rgb[3] = a;
                return this;
            }
            return new Color_1([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
        }
        return this._rgb[3];
    };

    Color_1.prototype.clipped = function() {
        return this._rgb._clipped || false;
    };

    Color_1.prototype.darken = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	var me = this;
    	var lab = me.lab();
    	lab[0] -= labConstants.Kn * amount;
    	return new Color_1(lab, 'lab').alpha(me.alpha(), true);
    };

    Color_1.prototype.brighten = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	return this.darken(-amount);
    };

    Color_1.prototype.darker = Color_1.prototype.darken;
    Color_1.prototype.brighter = Color_1.prototype.brighten;

    Color_1.prototype.get = function(mc) {
        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel);
            if (i > -1) { return src[i]; }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var type$g = utils.type;
    var pow$2 = Math.pow;

    var EPS = 1e-7;
    var MAX_ITER = 20;

    Color_1.prototype.luminance = function(lum) {
        if (lum !== undefined && type$g(lum) === 'number') {
            if (lum === 0) {
                // return pure black
                return new Color_1([0,0,0,this._rgb[3]], 'rgb');
            }
            if (lum === 1) {
                // return pure white
                return new Color_1([255,255,255,this._rgb[3]], 'rgb');
            }
            // compute new color using...
            var cur_lum = this.luminance();
            var mode = 'rgb';
            var max_iter = MAX_ITER;

            var test = function (low, high) {
                var mid = low.interpolate(high, 0.5, mode);
                var lm = mid.luminance();
                if (Math.abs(lum - lm) < EPS || !max_iter--) {
                    // close enough
                    return mid;
                }
                return lm > lum ? test(low, mid) : test(mid, high);
            };

            var rgb = (cur_lum > lum ? test(new Color_1([0,0,0]), this) : test(this, new Color_1([255,255,255]))).rgb();
            return new Color_1(rgb.concat( [this._rgb[3]]));
        }
        return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
    };


    var rgb2luminance = function (r,g,b) {
        // relative luminance
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
        r = luminance_x(r);
        g = luminance_x(g);
        b = luminance_x(b);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    var luminance_x = function (x) {
        x /= 255;
        return x <= 0.03928 ? x/12.92 : pow$2((x+0.055)/1.055, 2.4);
    };

    var interpolator = {};

    var type$h = utils.type;


    var mix = function (col1, col2, f) {
        if ( f === void 0 ) f=0.5;
        var rest = [], len = arguments.length - 3;
        while ( len-- > 0 ) rest[ len ] = arguments[ len + 3 ];

        var mode = rest[0] || 'lrgb';
        if (!interpolator[mode] && !rest.length) {
            // fall back to the first supported mode
            mode = Object.keys(interpolator)[0];
        }
        if (!interpolator[mode]) {
            throw new Error(("interpolation mode " + mode + " is not defined"));
        }
        if (type$h(col1) !== 'object') { col1 = new Color_1(col1); }
        if (type$h(col2) !== 'object') { col2 = new Color_1(col2); }
        return interpolator[mode](col1, col2, f)
            .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    };

    Color_1.prototype.mix =
    Color_1.prototype.interpolate = function(col2, f) {
    	if ( f === void 0 ) f=0.5;
    	var rest = [], len = arguments.length - 2;
    	while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

    	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
    };

    Color_1.prototype.premultiply = function(mutate) {
    	if ( mutate === void 0 ) mutate=false;

    	var rgb = this._rgb;
    	var a = rgb[3];
    	if (mutate) {
    		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
    		return this;
    	} else {
    		return new Color_1([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
    	}
    };

    Color_1.prototype.saturate = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	var me = this;
    	var lch = me.lch();
    	lch[1] += labConstants.Kn * amount;
    	if (lch[1] < 0) { lch[1] = 0; }
    	return new Color_1(lch, 'lch').alpha(me.alpha(), true);
    };

    Color_1.prototype.desaturate = function(amount) {
    	if ( amount === void 0 ) amount=1;

    	return this.saturate(-amount);
    };

    var type$i = utils.type;

    Color_1.prototype.set = function(mc, value, mutate) {
        if ( mutate === void 0 ) mutate=false;

        var ref = mc.split('.');
        var mode = ref[0];
        var channel = ref[1];
        var src = this[mode]();
        if (channel) {
            var i = mode.indexOf(channel);
            if (i > -1) {
                if (type$i(value) == 'string') {
                    switch(value.charAt(0)) {
                        case '+': src[i] += +value; break;
                        case '-': src[i] += +value; break;
                        case '*': src[i] *= +(value.substr(1)); break;
                        case '/': src[i] /= +(value.substr(1)); break;
                        default: src[i] = +value;
                    }
                } else if (type$i(value) === 'number') {
                    src[i] = value;
                } else {
                    throw new Error("unsupported value for Color.set");
                }
                var out = new Color_1(src, mode);
                if (mutate) {
                    this._rgb = out._rgb;
                    return this;
                }
                return out;
            }
            throw new Error(("unknown channel " + channel + " in mode " + mode));
        } else {
            return src;
        }
    };

    var rgb$1 = function (col1, col2, f) {
        var xyz0 = col1._rgb;
        var xyz1 = col2._rgb;
        return new Color_1(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'rgb'
        )
    };

    // register interpolator
    interpolator.rgb = rgb$1;

    var sqrt$2 = Math.sqrt;
    var pow$3 = Math.pow;

    var lrgb = function (col1, col2, f) {
        var ref = col1._rgb;
        var x1 = ref[0];
        var y1 = ref[1];
        var z1 = ref[2];
        var ref$1 = col2._rgb;
        var x2 = ref$1[0];
        var y2 = ref$1[1];
        var z2 = ref$1[2];
        return new Color_1(
            sqrt$2(pow$3(x1,2) * (1-f) + pow$3(x2,2) * f),
            sqrt$2(pow$3(y1,2) * (1-f) + pow$3(y2,2) * f),
            sqrt$2(pow$3(z1,2) * (1-f) + pow$3(z2,2) * f),
            'rgb'
        )
    };

    // register interpolator
    interpolator.lrgb = lrgb;

    var lab$1 = function (col1, col2, f) {
        var xyz0 = col1.lab();
        var xyz1 = col2.lab();
        return new Color_1(
            xyz0[0] + f * (xyz1[0]-xyz0[0]),
            xyz0[1] + f * (xyz1[1]-xyz0[1]),
            xyz0[2] + f * (xyz1[2]-xyz0[2]),
            'lab'
        )
    };

    // register interpolator
    interpolator.lab = lab$1;

    var _hsx = function (col1, col2, f, m) {
        var assign, assign$1;

        var xyz0, xyz1;
        if (m === 'hsl') {
            xyz0 = col1.hsl();
            xyz1 = col2.hsl();
        } else if (m === 'hsv') {
            xyz0 = col1.hsv();
            xyz1 = col2.hsv();
        } else if (m === 'hcg') {
            xyz0 = col1.hcg();
            xyz1 = col2.hcg();
        } else if (m === 'hsi') {
            xyz0 = col1.hsi();
            xyz1 = col2.hsi();
        } else if (m === 'lch' || m === 'hcl') {
            m = 'hcl';
            xyz0 = col1.hcl();
            xyz1 = col2.hcl();
        }

        var hue0, hue1, sat0, sat1, lbv0, lbv1;
        if (m.substr(0, 1) === 'h') {
            (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
            (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
        }

        var sat, hue, lbv, dh;

        if (!isNaN(hue0) && !isNaN(hue1)) {
            // both colors have hue
            if (hue1 > hue0 && hue1 - hue0 > 180) {
                dh = hue1-(hue0+360);
            } else if (hue1 < hue0 && hue0 - hue1 > 180) {
                dh = hue1+360-hue0;
            } else{
                dh = hue1 - hue0;
            }
            hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
            hue = hue0;
            if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
        } else if (!isNaN(hue1)) {
            hue = hue1;
            if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
        } else {
            hue = Number.NaN;
        }

        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
        lbv = lbv0 + f * (lbv1-lbv0);
        return new Color_1([hue, sat, lbv], m);
    };

    var lch$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'lch');
    };

    // register interpolator
    interpolator.lch = lch$1;
    interpolator.hcl = lch$1;

    var num$1 = function (col1, col2, f) {
        var c1 = col1.num();
        var c2 = col2.num();
        return new Color_1(c1 + f * (c2-c1), 'num')
    };

    // register interpolator
    interpolator.num = num$1;

    var hcg$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hcg');
    };

    // register interpolator
    interpolator.hcg = hcg$1;

    var hsi$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsi');
    };

    // register interpolator
    interpolator.hsi = hsi$1;

    var hsl$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsl');
    };

    // register interpolator
    interpolator.hsl = hsl$1;

    var hsv$1 = function (col1, col2, f) {
    	return _hsx(col1, col2, f, 'hsv');
    };

    // register interpolator
    interpolator.hsv = hsv$1;

    var clip_rgb$2 = utils.clip_rgb;
    var pow$4 = Math.pow;
    var sqrt$3 = Math.sqrt;
    var PI$1 = Math.PI;
    var cos$2 = Math.cos;
    var sin$1 = Math.sin;
    var atan2$1 = Math.atan2;

    var average = function (colors, mode, weights) {
        if ( mode === void 0 ) mode='lrgb';
        if ( weights === void 0 ) weights=null;

        var l = colors.length;
        if (!weights) { weights = Array.from(new Array(l)).map(function () { return 1; }); }
        // normalize weights
        var k = l / weights.reduce(function(a, b) { return a + b; });
        weights.forEach(function (w,i) { weights[i] *= k; });
        // convert colors to Color objects
        colors = colors.map(function (c) { return new Color_1(c); });
        if (mode === 'lrgb') {
            return _average_lrgb(colors, weights)
        }
        var first = colors.shift();
        var xyz = first.get(mode);
        var cnt = [];
        var dx = 0;
        var dy = 0;
        // initial color
        for (var i=0; i<xyz.length; i++) {
            xyz[i] = (xyz[i] || 0) * weights[0];
            cnt.push(isNaN(xyz[i]) ? 0 : weights[0]);
            if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
                var A = xyz[i] / 180 * PI$1;
                dx += cos$2(A) * weights[0];
                dy += sin$1(A) * weights[0];
            }
        }

        var alpha = first.alpha() * weights[0];
        colors.forEach(function (c,ci) {
            var xyz2 = c.get(mode);
            alpha += c.alpha() * weights[ci+1];
            for (var i=0; i<xyz.length; i++) {
                if (!isNaN(xyz2[i])) {
                    cnt[i] += weights[ci+1];
                    if (mode.charAt(i) === 'h') {
                        var A = xyz2[i] / 180 * PI$1;
                        dx += cos$2(A) * weights[ci+1];
                        dy += sin$1(A) * weights[ci+1];
                    } else {
                        xyz[i] += xyz2[i] * weights[ci+1];
                    }
                }
            }
        });

        for (var i$1=0; i$1<xyz.length; i$1++) {
            if (mode.charAt(i$1) === 'h') {
                var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
                while (A$1 < 0) { A$1 += 360; }
                while (A$1 >= 360) { A$1 -= 360; }
                xyz[i$1] = A$1;
            } else {
                xyz[i$1] = xyz[i$1]/cnt[i$1];
            }
        }
        alpha /= l;
        return (new Color_1(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
    };


    var _average_lrgb = function (colors, weights) {
        var l = colors.length;
        var xyz = [0,0,0,0];
        for (var i=0; i < colors.length; i++) {
            var col = colors[i];
            var f = weights[i] / l;
            var rgb = col._rgb;
            xyz[0] += pow$4(rgb[0],2) * f;
            xyz[1] += pow$4(rgb[1],2) * f;
            xyz[2] += pow$4(rgb[2],2) * f;
            xyz[3] += rgb[3] * f;
        }
        xyz[0] = sqrt$3(xyz[0]);
        xyz[1] = sqrt$3(xyz[1]);
        xyz[2] = sqrt$3(xyz[2]);
        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
        return new Color_1(clip_rgb$2(xyz));
    };

    // minimal multi-purpose interface

    // @requires utils color analyze


    var type$j = utils.type;

    var pow$5 = Math.pow;

    var scale = function(colors) {

        // constructor
        var _mode = 'rgb';
        var _nacol = chroma_1('#ccc');
        var _spread = 0;
        // const _fixed = false;
        var _domain = [0, 1];
        var _pos = [];
        var _padding = [0,0];
        var _classes = false;
        var _colors = [];
        var _out = false;
        var _min = 0;
        var _max = 1;
        var _correctLightness = false;
        var _colorCache = {};
        var _useCache = true;
        var _gamma = 1;

        // private methods

        var setColors = function(colors) {
            colors = colors || ['#fff', '#000'];
            if (colors && type$j(colors) === 'string' && chroma_1.brewer &&
                chroma_1.brewer[colors.toLowerCase()]) {
                colors = chroma_1.brewer[colors.toLowerCase()];
            }
            if (type$j(colors) === 'array') {
                // handle single color
                if (colors.length === 1) {
                    colors = [colors[0], colors[0]];
                }
                // make a copy of the colors
                colors = colors.slice(0);
                // convert to chroma classes
                for (var c=0; c<colors.length; c++) {
                    colors[c] = chroma_1(colors[c]);
                }
                // auto-fill color position
                _pos.length = 0;
                for (var c$1=0; c$1<colors.length; c$1++) {
                    _pos.push(c$1/(colors.length-1));
                }
            }
            resetCache();
            return _colors = colors;
        };

        var getClass = function(value) {
            if (_classes != null) {
                var n = _classes.length-1;
                var i = 0;
                while (i < n && value >= _classes[i]) {
                    i++;
                }
                return i-1;
            }
            return 0;
        };

        var tMapLightness = function (t) { return t; };
        var tMapDomain = function (t) { return t; };

        // const classifyValue = function(value) {
        //     let val = value;
        //     if (_classes.length > 2) {
        //         const n = _classes.length-1;
        //         const i = getClass(value);
        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
        //     }
        //     return val;
        // };

        var getColor = function(val, bypassMap) {
            var col, t;
            if (bypassMap == null) { bypassMap = false; }
            if (isNaN(val) || (val === null)) { return _nacol; }
            if (!bypassMap) {
                if (_classes && (_classes.length > 2)) {
                    // find the class
                    var c = getClass(val);
                    t = c / (_classes.length-2);
                } else if (_max !== _min) {
                    // just interpolate between min/max
                    t = (val - _min) / (_max - _min);
                } else {
                    t = 1;
                }
            } else {
                t = val;
            }

            // domain map
            t = tMapDomain(t);

            if (!bypassMap) {
                t = tMapLightness(t);  // lightness correction
            }

            if (_gamma !== 1) { t = pow$5(t, _gamma); }

            t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

            t = Math.min(1, Math.max(0, t));

            var k = Math.floor(t * 10000);

            if (_useCache && _colorCache[k]) {
                col = _colorCache[k];
            } else {
                if (type$j(_colors) === 'array') {
                    //for i in [0.._pos.length-1]
                    for (var i=0; i<_pos.length; i++) {
                        var p = _pos[i];
                        if (t <= p) {
                            col = _colors[i];
                            break;
                        }
                        if ((t >= p) && (i === (_pos.length-1))) {
                            col = _colors[i];
                            break;
                        }
                        if (t > p && t < _pos[i+1]) {
                            t = (t-p)/(_pos[i+1]-p);
                            col = chroma_1.interpolate(_colors[i], _colors[i+1], t, _mode);
                            break;
                        }
                    }
                } else if (type$j(_colors) === 'function') {
                    col = _colors(t);
                }
                if (_useCache) { _colorCache[k] = col; }
            }
            return col;
        };

        var resetCache = function () { return _colorCache = {}; };

        setColors(colors);

        // public interface

        var f = function(v) {
            var c = chroma_1(getColor(v));
            if (_out && c[_out]) { return c[_out](); } else { return c; }
        };

        f.classes = function(classes) {
            if (classes != null) {
                if (type$j(classes) === 'array') {
                    _classes = classes;
                    _domain = [classes[0], classes[classes.length-1]];
                } else {
                    var d = chroma_1.analyze(_domain);
                    if (classes === 0) {
                        _classes = [d.min, d.max];
                    } else {
                        _classes = chroma_1.limits(d, 'e', classes);
                    }
                }
                return f;
            }
            return _classes;
        };


        f.domain = function(domain) {
            if (!arguments.length) {
                return _domain;
            }
            _min = domain[0];
            _max = domain[domain.length-1];
            _pos = [];
            var k = _colors.length;
            if ((domain.length === k) && (_min !== _max)) {
                // update positions
                for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
                    var d = list[i];

                  _pos.push((d-_min) / (_max-_min));
                }
            } else {
                for (var c=0; c<k; c++) {
                    _pos.push(c/(k-1));
                }
                if (domain.length > 2) {
                    // set domain map
                    var tOut = domain.map(function (d,i) { return i/(domain.length-1); });
                    var tBreaks = domain.map(function (d) { return (d - _min) / (_max - _min); });
                    if (!tBreaks.every(function (val, i) { return tOut[i] === val; })) {
                        tMapDomain = function (t) {
                            if (t <= 0 || t >= 1) { return t; }
                            var i = 0;
                            while (t >= tBreaks[i+1]) { i++; }
                            var f = (t - tBreaks[i]) / (tBreaks[i+1] - tBreaks[i]);
                            var out = tOut[i] + f * (tOut[i+1] - tOut[i]);
                            return out;
                        };
                    }

                }
            }
            _domain = [_min, _max];
            return f;
        };

        f.mode = function(_m) {
            if (!arguments.length) {
                return _mode;
            }
            _mode = _m;
            resetCache();
            return f;
        };

        f.range = function(colors, _pos) {
            setColors(colors, _pos);
            return f;
        };

        f.out = function(_o) {
            _out = _o;
            return f;
        };

        f.spread = function(val) {
            if (!arguments.length) {
                return _spread;
            }
            _spread = val;
            return f;
        };

        f.correctLightness = function(v) {
            if (v == null) { v = true; }
            _correctLightness = v;
            resetCache();
            if (_correctLightness) {
                tMapLightness = function(t) {
                    var L0 = getColor(0, true).lab()[0];
                    var L1 = getColor(1, true).lab()[0];
                    var pol = L0 > L1;
                    var L_actual = getColor(t, true).lab()[0];
                    var L_ideal = L0 + ((L1 - L0) * t);
                    var L_diff = L_actual - L_ideal;
                    var t0 = 0;
                    var t1 = 1;
                    var max_iter = 20;
                    while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
                        (function() {
                            if (pol) { L_diff *= -1; }
                            if (L_diff < 0) {
                                t0 = t;
                                t += (t1 - t) * 0.5;
                            } else {
                                t1 = t;
                                t += (t0 - t) * 0.5;
                            }
                            L_actual = getColor(t, true).lab()[0];
                            return L_diff = L_actual - L_ideal;
                        })();
                    }
                    return t;
                };
            } else {
                tMapLightness = function (t) { return t; };
            }
            return f;
        };

        f.padding = function(p) {
            if (p != null) {
                if (type$j(p) === 'number') {
                    p = [p,p];
                }
                _padding = p;
                return f;
            } else {
                return _padding;
            }
        };

        f.colors = function(numColors, out) {
            // If no arguments are given, return the original colors that were provided
            if (arguments.length < 2) { out = 'hex'; }
            var result = [];

            if (arguments.length === 0) {
                result = _colors.slice(0);

            } else if (numColors === 1) {
                result = [f(0.5)];

            } else if (numColors > 1) {
                var dm = _domain[0];
                var dd = _domain[1] - dm;
                result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

            } else { // returns all colors based on the defined classes
                colors = [];
                var samples = [];
                if (_classes && (_classes.length > 2)) {
                    for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                        samples.push((_classes[i-1]+_classes[i])*0.5);
                    }
                } else {
                    samples = _domain;
                }
                result = samples.map(function (v) { return f(v); });
            }

            if (chroma_1[out]) {
                result = result.map(function (c) { return c[out](); });
            }
            return result;
        };

        f.cache = function(c) {
            if (c != null) {
                _useCache = c;
                return f;
            } else {
                return _useCache;
            }
        };

        f.gamma = function(g) {
            if (g != null) {
                _gamma = g;
                return f;
            } else {
                return _gamma;
            }
        };

        f.nodata = function(d) {
            if (d != null) {
                _nacol = chroma_1(d);
                return f;
            } else {
                return _nacol;
            }
        };

        return f;
    };

    function __range__(left, right, inclusive) {
      var range = [];
      var ascending = left < right;
      var end = !inclusive ? right : ascending ? right + 1 : right - 1;
      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
      }
      return range;
    }

    //
    // interpolates between a set of colors uzing a bezier spline
    //

    // @requires utils lab




    var bezier = function(colors) {
        var assign, assign$1, assign$2;

        var I, lab0, lab1, lab2;
        colors = colors.map(function (c) { return new Color_1(c); });
        if (colors.length === 2) {
            // linear interpolation
            (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 3) {
            // quadratic bezier interpolation
            (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 4) {
            // cubic bezier interpolation
            var lab3;
            (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
            I = function(t) {
                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
                return new Color_1(lab, 'lab');
            };
        } else if (colors.length === 5) {
            var I0 = bezier(colors.slice(0, 3));
            var I1 = bezier(colors.slice(2, 5));
            I = function(t) {
                if (t < 0.5) {
                    return I0(t*2);
                } else {
                    return I1((t-0.5)*2);
                }
            };
        }
        return I;
    };

    var bezier_1 = function (colors) {
        var f = bezier(colors);
        f.scale = function () { return scale(f); };
        return f;
    };

    /*
     * interpolates between a set of colors uzing a bezier spline
     * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
     */




    var blend = function (bottom, top, mode) {
        if (!blend[mode]) {
            throw new Error('unknown blend mode ' + mode);
        }
        return blend[mode](bottom, top);
    };

    var blend_f = function (f) { return function (bottom,top) {
            var c0 = chroma_1(top).rgb();
            var c1 = chroma_1(bottom).rgb();
            return chroma_1.rgb(f(c0, c1));
        }; };

    var each = function (f) { return function (c0, c1) {
            var out = [];
            out[0] = f(c0[0], c1[0]);
            out[1] = f(c0[1], c1[1]);
            out[2] = f(c0[2], c1[2]);
            return out;
        }; };

    var normal = function (a) { return a; };
    var multiply = function (a,b) { return a * b / 255; };
    var darken$1 = function (a,b) { return a > b ? b : a; };
    var lighten = function (a,b) { return a > b ? a : b; };
    var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
    var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
    var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
    var dodge = function (a,b) {
        if (a === 255) { return 255; }
        a = 255 * (b / 255) / (1 - a / 255);
        return a > 255 ? 255 : a
    };

    // # add = (a,b) ->
    // #     if (a + b > 255) then 255 else a + b

    blend.normal = blend_f(each(normal));
    blend.multiply = blend_f(each(multiply));
    blend.screen = blend_f(each(screen));
    blend.overlay = blend_f(each(overlay));
    blend.darken = blend_f(each(darken$1));
    blend.lighten = blend_f(each(lighten));
    blend.dodge = blend_f(each(dodge));
    blend.burn = blend_f(each(burn));
    // blend.add = blend_f(each(add));

    var blend_1 = blend;

    // cubehelix interpolation
    // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
    // http://astron-soc.in/bulletin/11June/289392011.pdf

    var type$k = utils.type;
    var clip_rgb$3 = utils.clip_rgb;
    var TWOPI$2 = utils.TWOPI;
    var pow$6 = Math.pow;
    var sin$2 = Math.sin;
    var cos$3 = Math.cos;


    var cubehelix = function(start, rotations, hue, gamma, lightness) {
        if ( start === void 0 ) start=300;
        if ( rotations === void 0 ) rotations=-1.5;
        if ( hue === void 0 ) hue=1;
        if ( gamma === void 0 ) gamma=1;
        if ( lightness === void 0 ) lightness=[0,1];

        var dh = 0, dl;
        if (type$k(lightness) === 'array') {
            dl = lightness[1] - lightness[0];
        } else {
            dl = 0;
            lightness = [lightness, lightness];
        }

        var f = function(fract) {
            var a = TWOPI$2 * (((start+120)/360) + (rotations * fract));
            var l = pow$6(lightness[0] + (dl * fract), gamma);
            var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
            var amp = (h * l * (1-l)) / 2;
            var cos_a = cos$3(a);
            var sin_a = sin$2(a);
            var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
            var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
            var b = l + (amp * (+1.97294 * cos_a));
            return chroma_1(clip_rgb$3([r*255,g*255,b*255,1]));
        };

        f.start = function(s) {
            if ((s == null)) { return start; }
            start = s;
            return f;
        };

        f.rotations = function(r) {
            if ((r == null)) { return rotations; }
            rotations = r;
            return f;
        };

        f.gamma = function(g) {
            if ((g == null)) { return gamma; }
            gamma = g;
            return f;
        };

        f.hue = function(h) {
            if ((h == null)) { return hue; }
            hue = h;
            if (type$k(hue) === 'array') {
                dh = hue[1] - hue[0];
                if (dh === 0) { hue = hue[1]; }
            } else {
                dh = 0;
            }
            return f;
        };

        f.lightness = function(h) {
            if ((h == null)) { return lightness; }
            if (type$k(h) === 'array') {
                lightness = h;
                dl = h[1] - h[0];
            } else {
                lightness = [h,h];
                dl = 0;
            }
            return f;
        };

        f.scale = function () { return chroma_1.scale(f); };

        f.hue(hue);

        return f;
    };

    var digits = '0123456789abcdef';

    var floor$2 = Math.floor;
    var random = Math.random;

    var random_1 = function () {
        var code = '#';
        for (var i=0; i<6; i++) {
            code += digits.charAt(floor$2(random() * 16));
        }
        return new Color_1(code, 'hex');
    };

    var log$1 = Math.log;
    var pow$7 = Math.pow;
    var floor$3 = Math.floor;
    var abs = Math.abs;


    var analyze = function (data, key) {
        if ( key === void 0 ) key=null;

        var r = {
            min: Number.MAX_VALUE,
            max: Number.MAX_VALUE*-1,
            sum: 0,
            values: [],
            count: 0
        };
        if (type(data) === 'object') {
            data = Object.values(data);
        }
        data.forEach(function (val) {
            if (key && type(val) === 'object') { val = val[key]; }
            if (val !== undefined && val !== null && !isNaN(val)) {
                r.values.push(val);
                r.sum += val;
                if (val < r.min) { r.min = val; }
                if (val > r.max) { r.max = val; }
                r.count += 1;
            }
        });

        r.domain = [r.min, r.max];

        r.limits = function (mode, num) { return limits(r, mode, num); };

        return r;
    };


    var limits = function (data, mode, num) {
        if ( mode === void 0 ) mode='equal';
        if ( num === void 0 ) num=7;

        if (type(data) == 'array') {
            data = analyze(data);
        }
        var min = data.min;
        var max = data.max;
        var values = data.values.sort(function (a,b) { return a-b; });

        if (num === 1) { return [min,max]; }

        var limits = [];

        if (mode.substr(0,1) === 'c') { // continuous
            limits.push(min);
            limits.push(max);
        }

        if (mode.substr(0,1) === 'e') { // equal interval
            limits.push(min);
            for (var i=1; i<num; i++) {
                limits.push(min+((i/num)*(max-min)));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'l') { // log scale
            if (min <= 0) {
                throw new Error('Logarithmic scales are only possible for values > 0');
            }
            var min_log = Math.LOG10E * log$1(min);
            var max_log = Math.LOG10E * log$1(max);
            limits.push(min);
            for (var i$1=1; i$1<num; i$1++) {
                limits.push(pow$7(10, min_log + ((i$1/num) * (max_log - min_log))));
            }
            limits.push(max);
        }

        else if (mode.substr(0,1) === 'q') { // quantile scale
            limits.push(min);
            for (var i$2=1; i$2<num; i$2++) {
                var p = ((values.length-1) * i$2)/num;
                var pb = floor$3(p);
                if (pb === p) {
                    limits.push(values[pb]);
                } else { // p > pb
                    var pr = p - pb;
                    limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
                }
            }
            limits.push(max);

        }

        else if (mode.substr(0,1) === 'k') { // k-means clustering
            /*
            implementation based on
            http://code.google.com/p/figue/source/browse/trunk/figue.js#336
            simplified for 1-d input values
            */
            var cluster;
            var n = values.length;
            var assignments = new Array(n);
            var clusterSizes = new Array(num);
            var repeat = true;
            var nb_iters = 0;
            var centroids = null;

            // get seed values
            centroids = [];
            centroids.push(min);
            for (var i$3=1; i$3<num; i$3++) {
                centroids.push(min + ((i$3/num) * (max-min)));
            }
            centroids.push(max);

            while (repeat) {
                // assignment step
                for (var j=0; j<num; j++) {
                    clusterSizes[j] = 0;
                }
                for (var i$4=0; i$4<n; i$4++) {
                    var value = values[i$4];
                    var mindist = Number.MAX_VALUE;
                    var best = (void 0);
                    for (var j$1=0; j$1<num; j$1++) {
                        var dist = abs(centroids[j$1]-value);
                        if (dist < mindist) {
                            mindist = dist;
                            best = j$1;
                        }
                        clusterSizes[best]++;
                        assignments[i$4] = best;
                    }
                }

                // update centroids step
                var newCentroids = new Array(num);
                for (var j$2=0; j$2<num; j$2++) {
                    newCentroids[j$2] = null;
                }
                for (var i$5=0; i$5<n; i$5++) {
                    cluster = assignments[i$5];
                    if (newCentroids[cluster] === null) {
                        newCentroids[cluster] = values[i$5];
                    } else {
                        newCentroids[cluster] += values[i$5];
                    }
                }
                for (var j$3=0; j$3<num; j$3++) {
                    newCentroids[j$3] *= 1/clusterSizes[j$3];
                }

                // check convergence
                repeat = false;
                for (var j$4=0; j$4<num; j$4++) {
                    if (newCentroids[j$4] !== centroids[j$4]) {
                        repeat = true;
                        break;
                    }
                }

                centroids = newCentroids;
                nb_iters++;

                if (nb_iters > 200) {
                    repeat = false;
                }
            }

            // finished k-means clustering
            // the next part is borrowed from gabrielflor.it
            var kClusters = {};
            for (var j$5=0; j$5<num; j$5++) {
                kClusters[j$5] = [];
            }
            for (var i$6=0; i$6<n; i$6++) {
                cluster = assignments[i$6];
                kClusters[cluster].push(values[i$6]);
            }
            var tmpKMeansBreaks = [];
            for (var j$6=0; j$6<num; j$6++) {
                tmpKMeansBreaks.push(kClusters[j$6][0]);
                tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
            }
            tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
            limits.push(tmpKMeansBreaks[0]);
            for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
                var v = tmpKMeansBreaks[i$7];
                if (!isNaN(v) && (limits.indexOf(v) === -1)) {
                    limits.push(v);
                }
            }
        }
        return limits;
    };

    var analyze_1 = {analyze: analyze, limits: limits};

    var contrast = function (a, b) {
        // WCAG contrast ratio
        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
        a = new Color_1(a);
        b = new Color_1(b);
        var l1 = a.luminance();
        var l2 = b.luminance();
        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
    };

    var sqrt$4 = Math.sqrt;
    var atan2$2 = Math.atan2;
    var abs$1 = Math.abs;
    var cos$4 = Math.cos;
    var PI$2 = Math.PI;

    var deltaE = function(a, b, L, C) {
        if ( L === void 0 ) L=1;
        if ( C === void 0 ) C=1;

        // Delta E (CMC)
        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CMC.html
        a = new Color_1(a);
        b = new Color_1(b);
        var ref = Array.from(a.lab());
        var L1 = ref[0];
        var a1 = ref[1];
        var b1 = ref[2];
        var ref$1 = Array.from(b.lab());
        var L2 = ref$1[0];
        var a2 = ref$1[1];
        var b2 = ref$1[2];
        var c1 = sqrt$4((a1 * a1) + (b1 * b1));
        var c2 = sqrt$4((a2 * a2) + (b2 * b2));
        var sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + (0.01765 * L1));
        var sc = ((0.0638 * c1) / (1.0 + (0.0131 * c1))) + 0.638;
        var h1 = c1 < 0.000001 ? 0.0 : (atan2$2(b1, a1) * 180.0) / PI$2;
        while (h1 < 0) { h1 += 360; }
        while (h1 >= 360) { h1 -= 360; }
        var t = (h1 >= 164.0) && (h1 <= 345.0) ? (0.56 + abs$1(0.2 * cos$4((PI$2 * (h1 + 168.0)) / 180.0))) : (0.36 + abs$1(0.4 * cos$4((PI$2 * (h1 + 35.0)) / 180.0)));
        var c4 = c1 * c1 * c1 * c1;
        var f = sqrt$4(c4 / (c4 + 1900.0));
        var sh = sc * (((f * t) + 1.0) - f);
        var delL = L1 - L2;
        var delC = c1 - c2;
        var delA = a1 - a2;
        var delB = b1 - b2;
        var dH2 = ((delA * delA) + (delB * delB)) - (delC * delC);
        var v1 = delL / (L * sl);
        var v2 = delC / (C * sc);
        var v3 = sh;
        return sqrt$4((v1 * v1) + (v2 * v2) + (dH2 / (v3 * v3)));
    };

    // simple Euclidean distance
    var distance = function(a, b, mode) {
        if ( mode === void 0 ) mode='lab';

        // Delta E (CIE 1976)
        // see http://www.brucelindbloom.com/index.html?Equations.html
        a = new Color_1(a);
        b = new Color_1(b);
        var l1 = a.get(mode);
        var l2 = b.get(mode);
        var sum_sq = 0;
        for (var i in l1) {
            var d = (l1[i] || 0) - (l2[i] || 0);
            sum_sq += d*d;
        }
        return Math.sqrt(sum_sq);
    };

    var valid = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        try {
            new (Function.prototype.bind.apply( Color_1, [ null ].concat( args) ));
            return true;
        } catch (e) {
            return false;
        }
    };

    // some pre-defined color scales:




    var scales = {
    	cool: function cool() { return scale([chroma_1.hsl(180,1,.9), chroma_1.hsl(250,.7,.4)]) },
    	hot: function hot() { return scale(['#000','#f00','#ff0','#fff'], [0,.25,.75,1]).mode('rgb') }
    };

    /**
        ColorBrewer colors for chroma.js

        Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
        Pennsylvania State University.

        Licensed under the Apache License, Version 2.0 (the "License");
        you may not use this file except in compliance with the License.
        You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0

        Unless required by applicable law or agreed to in writing, software distributed
        under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
        CONDITIONS OF ANY KIND, either express or implied. See the License for the
        specific language governing permissions and limitations under the License.
    */

    var colorbrewer = {
        // sequential
        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

        // diverging

        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

        // qualitative

        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
    };

    // add lowercase aliases for case-insensitive matches
    for (var i$1 = 0, list$1 = Object.keys(colorbrewer); i$1 < list$1.length; i$1 += 1) {
        var key = list$1[i$1];

        colorbrewer[key.toLowerCase()] = colorbrewer[key];
    }

    var colorbrewer_1 = colorbrewer;

    // feel free to comment out anything to rollup
    // a smaller chroma.js built

    // io --> convert colors















    // operators --> modify existing Colors










    // interpolators










    // generators -- > create new colors
    chroma_1.average = average;
    chroma_1.bezier = bezier_1;
    chroma_1.blend = blend_1;
    chroma_1.cubehelix = cubehelix;
    chroma_1.mix = chroma_1.interpolate = mix;
    chroma_1.random = random_1;
    chroma_1.scale = scale;

    // other utility methods
    chroma_1.analyze = analyze_1.analyze;
    chroma_1.contrast = contrast;
    chroma_1.deltaE = deltaE;
    chroma_1.distance = distance;
    chroma_1.limits = analyze_1.limits;
    chroma_1.valid = valid;

    // scale
    chroma_1.scales = scales;

    // colors
    chroma_1.colors = w3cx11_1;
    chroma_1.brewer = colorbrewer_1;

    var chroma_js = chroma_1;

    return chroma_js;

})));

},{}],"data/countries-50m.json":[function(require,module,exports) {
module.exports = {
  "type": "Topology",
  "objects": {
    "countries": {
      "type": "GeometryCollection",
      "geometries": [{
        "type": "Polygon",
        "arcs": [[0, 1, 2, 3]],
        "id": "716",
        "properties": {
          "name": "Zimbabwe"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-3, 4, 5, 6, 7, 8, 9]],
        "id": "894",
        "properties": {
          "name": "Zambia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[10, 11, 12]], [[13]], [[14]], [[15]], [[16]]],
        "id": "887",
        "properties": {
          "name": "Yemen"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[17]], [[18, 19, 20, 21]], [[22]], [[23]], [[24]], [[25]], [[26]], [[27]]],
        "id": "704",
        "properties": {
          "name": "Vietnam"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[28]], [[29]], [[30]], [[31]], [[32, 33, 34, 35]]],
        "id": "862",
        "properties": {
          "name": "Venezuela"
        }
      }, {
        "type": "Polygon",
        "arcs": [[36]],
        "id": "336",
        "properties": {
          "name": "Vatican"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[37]], [[38]], [[39]], [[40]], [[41]], [[42]], [[43]], [[44]], [[45]], [[46]], [[47]], [[48]], [[49]], [[50]]],
        "id": "548",
        "properties": {
          "name": "Vanuatu"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[51, 52, 53, 54, 55], [56]], [[57]], [[58]]],
        "id": "860",
        "properties": {
          "name": "Uzbekistan"
        }
      }, {
        "type": "Polygon",
        "arcs": [[59, 60, 61]],
        "id": "858",
        "properties": {
          "name": "Uruguay"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[62]], [[63]], [[64]], [[65]], [[66]]],
        "id": "583",
        "properties": {
          "name": "Micronesia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[67]], [[68]], [[69]], [[70]], [[71]]],
        "id": "584",
        "properties": {
          "name": "Marshall Is."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[72]], [[73]], [[74]], [[75]], [[76]], [[77]]],
        "id": "580",
        "properties": {
          "name": "N. Mariana Is."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[78]], [[79]], [[80]]],
        "id": "850",
        "properties": {
          "name": "U.S. Virgin Is."
        }
      }, {
        "type": "Polygon",
        "arcs": [[81]],
        "id": "316",
        "properties": {
          "name": "Guam"
        }
      }, {
        "type": "Polygon",
        "arcs": [[82]],
        "id": "016",
        "properties": {
          "name": "American Samoa"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[83]], [[84]], [[85]]],
        "id": "630",
        "properties": {
          "name": "Puerto Rico"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[86]], [[87]], [[88]], [[89]], [[90]], [[91]], [[92]], [[93]], [[94]], [[95]], [[96]], [[97]], [[98]], [[99]], [[100]], [[101]], [[102, 103, 104, 105]], [[106]], [[107]], [[108]], [[109]], [[110]], [[111]], [[112]], [[113]], [[114]], [[115]], [[116]], [[117]], [[118]], [[119]], [[120]], [[121]], [[122]], [[123]], [[124]], [[125]], [[126]], [[127]], [[128]], [[129]], [[130]], [[131]], [[132]], [[133]], [[134]], [[135]], [[136]], [[137]], [[138]], [[139]], [[140]], [[141]], [[142]], [[143]], [[144]], [[145]], [[146]], [[147]], [[148]], [[149]], [[150]], [[151]], [[152]], [[153]], [[154]], [[155]], [[156]], [[157]], [[158]], [[159]], [[160]], [[161]], [[162]], [[163]], [[164, 165, 166, 167, 168]], [[169]], [[170]], [[171]], [[172]], [[173]], [[174]], [[175]], [[176]], [[177]], [[178]], [[179]], [[180]], [[181]], [[182]], [[183]], [[184]], [[185]], [[186]], [[187]], [[188]], [[189]], [[190]], [[191]], [[192]], [[193]], [[194]], [[195]], [[196]], [[197]], [[198]], [[199]], [[200]], [[201]], [[202]], [[203]], [[204]], [[205]], [[206]], [[207]], [[208]], [[209]], [[210]], [[211]], [[212]], [[213]], [[214]], [[215]], [[216]], [[217]], [[218]], [[219]]],
        "id": "840",
        "properties": {
          "name": "United States of America"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[220]], [[221]]],
        "id": "239",
        "properties": {
          "name": "S. Geo. and the Is."
        }
      }, {
        "type": "Polygon",
        "arcs": [[222]],
        "id": "086",
        "properties": {
          "name": "Br. Indian Ocean Ter."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[223]], [[224]]],
        "id": "654",
        "properties": {
          "name": "Saint Helena"
        }
      }, {
        "type": "Polygon",
        "arcs": [[225]],
        "id": "612",
        "properties": {
          "name": "Pitcairn Is."
        }
      }, {
        "type": "Polygon",
        "arcs": [[226]],
        "id": "660",
        "properties": {
          "name": "Anguilla"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[227]], [[228]], [[229]], [[230]], [[231]], [[232]]],
        "id": "238",
        "properties": {
          "name": "Falkland Is."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[233]], [[234]], [[235]]],
        "id": "136",
        "properties": {
          "name": "Cayman Is."
        }
      }, {
        "type": "Polygon",
        "arcs": [[236]],
        "id": "060",
        "properties": {
          "name": "Bermuda"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[237]], [[238]], [[239]]],
        "id": "092",
        "properties": {
          "name": "British Virgin Is."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[240]], [[241]], [[242]]],
        "id": "796",
        "properties": {
          "name": "Turks and Caicos Is."
        }
      }, {
        "type": "Polygon",
        "arcs": [[243]],
        "id": "500",
        "properties": {
          "name": "Montserrat"
        }
      }, {
        "type": "Polygon",
        "arcs": [[244]],
        "id": "832",
        "properties": {
          "name": "Jersey"
        }
      }, {
        "type": "Polygon",
        "arcs": [[245]],
        "id": "831",
        "properties": {
          "name": "Guernsey"
        }
      }, {
        "type": "Polygon",
        "arcs": [[246]],
        "id": "833",
        "properties": {
          "name": "Isle of Man"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[247]], [[248]], [[249]], [[250]], [[251]], [[252]], [[253]], [[254]], [[255]], [[256]], [[257]], [[258]], [[259]], [[260]], [[261]], [[262]], [[263]], [[264]], [[265]], [[266]], [[267]], [[268, 269]], [[270]]],
        "id": "826",
        "properties": {
          "name": "United Kingdom"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[271, 272, 273, 274, 275], [276]], [[277]], [[278]], [[279]], [[280]]],
        "id": "784",
        "properties": {
          "name": "United Arab Emirates"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291]], [[292]]],
        "id": "804",
        "properties": {
          "name": "Ukraine"
        }
      }, {
        "type": "Polygon",
        "arcs": [[293, 294, 295, 296, 297]],
        "id": "800",
        "properties": {
          "name": "Uganda"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[298]], [[-55, 299, 300, 301, 302]]],
        "id": "795",
        "properties": {
          "name": "Turkmenistan"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[303]], [[304, 305, 306, 307, 308, 309, 310]], [[311, 312, 313]]],
        "id": "792",
        "properties": {
          "name": "Turkey"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[314, 315, 316]], [[317]], [[318]]],
        "id": "788",
        "properties": {
          "name": "Tunisia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[319]], [[320]]],
        "id": "780",
        "properties": {
          "name": "Trinidad and Tobago"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[321]], [[322]], [[323]]],
        "id": "776",
        "properties": {
          "name": "Tonga"
        }
      }, {
        "type": "Polygon",
        "arcs": [[324, 325, 326, 327]],
        "id": "768",
        "properties": {
          "name": "Togo"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[328]], [[329, 330]], [[331, 332]]],
        "id": "626",
        "properties": {
          "name": "Timor-Leste"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[333]], [[334]], [[335]], [[336, 337, 338, 339, 340, 341]], [[342]], [[343]], [[344]], [[345]], [[346]], [[347]]],
        "id": "764",
        "properties": {
          "name": "Thailand"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[348]], [[349]], [[-8, 350, 351, 352, -294, 353, 354, 355, 356]], [[357]]],
        "id": "834",
        "properties": {
          "name": "Tanzania"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-53, 358, 359, 360]], [[-57]], [[361]]],
        "id": "762",
        "properties": {
          "name": "Tajikistan"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[362]], [[363]]],
        "id": "158",
        "properties": {
          "name": "Taiwan"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-310, 364, 365, 366, 367, 368]],
        "id": "760",
        "properties": {
          "name": "Syria"
        }
      }, {
        "type": "Polygon",
        "arcs": [[369, 370, 371, 372, 373, 374]],
        "id": "756",
        "properties": {
          "name": "Switzerland"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[375]], [[376]], [[377, 378, 379]], [[380]], [[381]], [[382]]],
        "id": "752",
        "properties": {
          "name": "Sweden"
        }
      }, {
        "type": "Polygon",
        "arcs": [[383, 384]],
        "id": "748",
        "properties": {
          "name": "eSwatini"
        }
      }, {
        "type": "Polygon",
        "arcs": [[385, 386, 387, 388]],
        "id": "740",
        "properties": {
          "name": "Suriname"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-297, 389, 390, 391, 392, 393]],
        "id": "728",
        "properties": {
          "name": "S. Sudan"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-392, 394, 395, 396, 397, 398, 399, 400]],
        "id": "729",
        "properties": {
          "name": "Sudan"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[401]], [[402]], [[403]]],
        "id": "144",
        "properties": {
          "name": "Sri Lanka"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[404]], [[405]], [[406]], [[407]], [[408, 409, 410, 411, 412, 413]], [[414]], [[415]], [[416]], [[417]], [[418]], [[419]], [[420]]],
        "id": "724",
        "properties": {
          "name": "Spain"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[421, 422]], [[423]], [[424]], [[425]], [[426]], [[427]], [[428]], [[429]], [[430]], [[431]], [[432]]],
        "id": "410",
        "properties": {
          "name": "South Korea"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-1, 433, -385, 434, 435, 436, 437], [438]], [[439]]],
        "id": "710",
        "properties": {
          "name": "South Africa"
        }
      }, {
        "type": "Polygon",
        "arcs": [[440, 441, 442, 443]],
        "id": "706",
        "properties": {
          "name": "Somalia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-443, 444, 445, 446]],
        "properties": {
          "name": "Somaliland"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[447]], [[448]], [[449]], [[450]], [[451]], [[452]], [[453]], [[454]], [[455]], [[456]], [[457]], [[458]], [[459]], [[460]], [[461]], [[462]], [[463]], [[464]], [[465]], [[466]], [[467]]],
        "id": "090",
        "properties": {
          "name": "Solomon Is."
        }
      }, {
        "type": "Polygon",
        "arcs": [[-289, 468, 469, 470, 471]],
        "id": "703",
        "properties": {
          "name": "Slovakia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[472, 473, 474, 475, 476]],
        "id": "705",
        "properties": {
          "name": "Slovenia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[477]],
        "id": "702",
        "properties": {
          "name": "Singapore"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[478, 479, 480]], [[481]]],
        "id": "694",
        "properties": {
          "name": "Sierra Leone"
        }
      }, {
        "type": "Polygon",
        "arcs": [[482]],
        "id": "690",
        "properties": {
          "name": "Seychelles"
        }
      }, {
        "type": "Polygon",
        "arcs": [[483, 484, 485, 486, 487, 488, 489, 490]],
        "id": "688",
        "properties": {
          "name": "Serbia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[491, 492, 493, 494, 495, 496, 497]],
        "id": "686",
        "properties": {
          "name": "Senegal"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[498]], [[499]], [[-12, 500, 501, 502, 503, 504, 505, 506, -274, 507]], [[508]]],
        "id": "682",
        "properties": {
          "name": "Saudi Arabia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[509]], [[510]]],
        "id": "678",
        "properties": {
          "name": "São Tomé and Principe"
        }
      }, {
        "type": "Polygon",
        "arcs": [[511]],
        "id": "674",
        "properties": {
          "name": "San Marino"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[512]], [[513]]],
        "id": "882",
        "properties": {
          "name": "Samoa"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[514]], [[515]], [[516]]],
        "id": "670",
        "properties": {
          "name": "St. Vin. and Gren."
        }
      }, {
        "type": "Polygon",
        "arcs": [[517]],
        "id": "662",
        "properties": {
          "name": "Saint Lucia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[518]], [[519]]],
        "id": "659",
        "properties": {
          "name": "St. Kitts and Nevis"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-295, -353, 520, 521]],
        "id": "646",
        "properties": {
          "name": "Rwanda"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[522]], [[523]], [[524]], [[525]], [[526]], [[527]], [[528]], [[529]], [[530]], [[531]], [[532]], [[533]], [[534]], [[535]], [[536]], [[537]], [[538]], [[539, 540, 541, 542, 543, 544, 545, 546, 547, -292, 548, 549, 550, 551, 552, 553, 554]], [[555]], [[556]], [[557]], [[558]], [[559]], [[560]], [[561]], [[562]], [[563]], [[564]], [[565]], [[566]], [[567]], [[568]], [[569]], [[570]], [[571]], [[572]], [[573]], [[574]], [[575]], [[576]], [[577]], [[578]], [[579]], [[580]], [[581]], [[582]], [[583]], [[584]], [[585]], [[586]], [[587]], [[588]], [[589]], [[590]], [[591]], [[592]], [[593]], [[594]], [[595]], [[596]], [[597]], [[598]], [[599]], [[600]], [[601]], [[602]], [[603]], [[604]], [[605]], [[606]], [[607]], [[608]], [[609]], [[610]], [[611]], [[612]], [[613]], [[614]], [[615]], [[616]], [[617]], [[618]], [[619]], [[620]], [[621]], [[622]], [[623]], [[624]], [[625]], [[626]], [[627]], [[628]], [[629]], [[630]], [[631]], [[632]], [[633]], [[634, 635, 636, 637, 638]], [[-283, 639]]],
        "id": "643",
        "properties": {
          "name": "Russia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-285, 640, 641, -491, 642, -287, 643]],
        "id": "642",
        "properties": {
          "name": "Romania"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-506, 644]],
        "id": "634",
        "properties": {
          "name": "Qatar"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[645]], [[-413, 646]], [[647]], [[648]], [[649]], [[650]], [[651]], [[652]], [[653]]],
        "id": "620",
        "properties": {
          "name": "Portugal"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-290, -472, 654, 655, 656, 657, 658, -637, 659, 660]],
        "id": "616",
        "properties": {
          "name": "Poland"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[661]], [[662]], [[663]], [[664]], [[665]], [[666]], [[667]], [[668]], [[669]], [[670]], [[671]], [[672]], [[673]], [[674]], [[675]], [[676]], [[677]], [[678]], [[679]], [[680]], [[681]], [[682]], [[683]], [[684]], [[685]], [[686]], [[687]], [[688]], [[689]], [[690]], [[691]], [[692]], [[693]], [[694]], [[695]], [[696]], [[697]], [[698]], [[699]], [[700]], [[701]], [[702]], [[703]], [[704]], [[705]], [[706]], [[707]], [[708]]],
        "id": "608",
        "properties": {
          "name": "Philippines"
        }
      }, {
        "type": "Polygon",
        "arcs": [[709, 710, 711, 712, 713, 714]],
        "id": "604",
        "properties": {
          "name": "Peru"
        }
      }, {
        "type": "Polygon",
        "arcs": [[715, 716, 717]],
        "id": "600",
        "properties": {
          "name": "Paraguay"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[718]], [[719]], [[720, 721]], [[722]], [[723]], [[724]], [[725]], [[726]], [[727]], [[728]], [[729]], [[730]], [[731]], [[732]], [[733]], [[734]], [[735]], [[736]], [[737]], [[738]], [[739]], [[740]], [[741]], [[742]], [[743]], [[744]]],
        "id": "598",
        "properties": {
          "name": "Papua New Guinea"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[745, 746, 747, 748]], [[749]], [[750]], [[751]], [[752]]],
        "id": "591",
        "properties": {
          "name": "Panama"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[753]], [[754]]],
        "id": "585",
        "properties": {
          "name": "Palau"
        }
      }, {
        "type": "Polygon",
        "arcs": [[755, 756, 757, 758, 759, 760]],
        "id": "586",
        "properties": {
          "name": "Pakistan"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[761]], [[-13, -508, -273, 762]], [[-276, 763]], [[-277]]],
        "id": "512",
        "properties": {
          "name": "Oman"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-378, 764, -554, 765]], [[766]], [[767]], [[768]], [[769]], [[770]], [[771]], [[772]], [[773]], [[774]], [[775]], [[776]], [[777]], [[778]], [[779]], [[780]], [[781]], [[782]], [[783]], [[784]], [[785]], [[786]], [[787]], [[788]], [[789]], [[790]], [[791]], [[792]], [[793]], [[794]], [[795]], [[796]]],
        "id": "578",
        "properties": {
          "name": "Norway"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-422, 797, 798, -540, 799]], [[800]]],
        "id": "408",
        "properties": {
          "name": "North Korea"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[801]], [[802, 803, 804, 805, 806]]],
        "id": "566",
        "properties": {
          "name": "Nigeria"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-807, 807, 808, 809, 810, 811, 812]],
        "id": "562",
        "properties": {
          "name": "Niger"
        }
      }, {
        "type": "Polygon",
        "arcs": [[813, 814, 815, 816]],
        "id": "558",
        "properties": {
          "name": "Nicaragua"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[817]], [[818]], [[819]], [[820]], [[821]], [[822]], [[823]], [[824]], [[825]], [[826]], [[827]], [[828]], [[829]]],
        "id": "554",
        "properties": {
          "name": "New Zealand"
        }
      }, {
        "type": "Polygon",
        "arcs": [[830]],
        "id": "570",
        "properties": {
          "name": "Niue"
        }
      }, {
        "type": "Polygon",
        "arcs": [[831]],
        "id": "184",
        "properties": {
          "name": "Cook Is."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[832, 833, 834]], [[835, 836]], [[837]], [[838]], [[839]], [[840]], [[841]], [[842]], [[843]], [[844]], [[845]], [[846]]],
        "id": "528",
        "properties": {
          "name": "Netherlands"
        }
      }, {
        "type": "Polygon",
        "arcs": [[847]],
        "id": "533",
        "properties": {
          "name": "Aruba"
        }
      }, {
        "type": "Polygon",
        "arcs": [[848]],
        "id": "531",
        "properties": {
          "name": "Curaçao"
        }
      }, {
        "type": "Polygon",
        "arcs": [[849, 850]],
        "id": "524",
        "properties": {
          "name": "Nepal"
        }
      }, {
        "type": "Polygon",
        "arcs": [[851]],
        "id": "520",
        "properties": {
          "name": "Nauru"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-5, 852, -437, 853, 854]],
        "id": "516",
        "properties": {
          "name": "Namibia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-4, -10, 855, -356, 856, -435, -384, -434], [857], [858]],
        "id": "508",
        "properties": {
          "name": "Mozambique"
        }
      }, {
        "type": "Polygon",
        "arcs": [[859, 860, 861]],
        "id": "504",
        "properties": {
          "name": "Morocco"
        }
      }, {
        "type": "Polygon",
        "arcs": [[862, 863, 864, -861]],
        "id": "732",
        "properties": {
          "name": "W. Sahara"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-487, 865, 866, 867, 868, 869]],
        "id": "499",
        "properties": {
          "name": "Montenegro"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-542, 870]],
        "id": "496",
        "properties": {
          "name": "Mongolia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-286, -644]],
        "id": "498",
        "properties": {
          "name": "Moldova"
        }
      }, {
        "type": "Polygon",
        "arcs": [[871, 872]],
        "id": "492",
        "properties": {
          "name": "Monaco"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-167, 873, 874, 875, 876]], [[877]], [[878]], [[879]], [[880]], [[881]], [[882]], [[883]], [[884]], [[885]], [[886]], [[887]], [[888]], [[889]], [[890]], [[891]]],
        "id": "484",
        "properties": {
          "name": "Mexico"
        }
      }, {
        "type": "Polygon",
        "arcs": [[892]],
        "id": "480",
        "properties": {
          "name": "Mauritius"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[893]], [[-498, 894, -864, 895, 896]]],
        "id": "478",
        "properties": {
          "name": "Mauritania"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[897]], [[898]]],
        "id": "470",
        "properties": {
          "name": "Malta"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-492, -897, 899, -810, 900, 901, 902]],
        "id": "466",
        "properties": {
          "name": "Mali"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[903]], [[904]]],
        "id": "462",
        "properties": {
          "name": "Maldives"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-340, 905]], [[906, 907, 908, 909, 910]], [[911]], [[912]], [[913]], [[914]], [[915]], [[916]], [[917, 918]]],
        "id": "458",
        "properties": {
          "name": "Malaysia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-859]], [[-858]], [[-9, -357, -856]]],
        "id": "454",
        "properties": {
          "name": "Malawi"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[919]], [[920]], [[921]]],
        "id": "450",
        "properties": {
          "name": "Madagascar"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-485, 922, 923, 924, 925]],
        "id": "807",
        "properties": {
          "name": "Macedonia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[926, 927, 928]],
        "id": "442",
        "properties": {
          "name": "Luxembourg"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-639, 929]], [[-636, 930, 931, 932, -660]]],
        "id": "440",
        "properties": {
          "name": "Lithuania"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-371, 933]],
        "id": "438",
        "properties": {
          "name": "Liechtenstein"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-315, 934, 935, -397, 936, -812, 937]],
        "id": "434",
        "properties": {
          "name": "Libya"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-479, 938, 939, 940]],
        "id": "430",
        "properties": {
          "name": "Liberia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-439]],
        "id": "426",
        "properties": {
          "name": "Lesotho"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-368, 941, 942]],
        "id": "422",
        "properties": {
          "name": "Lebanon"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-932, 943, 944, -550, 945]],
        "id": "428",
        "properties": {
          "name": "Latvia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-21, 946, -337, 947, 948]],
        "id": "418",
        "properties": {
          "name": "Laos"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-52, 949, 950, -359], [-58], [-59], [-362]],
        "id": "417",
        "properties": {
          "name": "Kyrgyzstan"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[951]], [[-504, 952, 953]]],
        "id": "414",
        "properties": {
          "name": "Kuwait"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-486, -926, 954, -866]],
        "properties": {
          "name": "Kosovo"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[955]], [[956]], [[957]], [[958]], [[959]], [[960]], [[961]], [[962]], [[963]], [[964]], [[965]], [[966]], [[967]], [[968]], [[969]], [[970]], [[971]], [[972]], [[973]]],
        "id": "296",
        "properties": {
          "name": "Kiribati"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[974]], [[-298, -394, 975, -441, 976, -354]]],
        "id": "404",
        "properties": {
          "name": "Kenya"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[977]], [[978]], [[979]], [[-56, -303, 980, -544, 981, -950]]],
        "id": "398",
        "properties": {
          "name": "Kazakhstan"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-366, 982, -502, 983, 984, 985, 986]],
        "id": "400",
        "properties": {
          "name": "Jordan"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[987]], [[988]], [[989]], [[990]], [[991]], [[992]], [[993]], [[994]], [[995]], [[996]], [[997]], [[998]], [[999]], [[1000]], [[1001]], [[1002]], [[1003]], [[1004]], [[1005]], [[1006]], [[1007]], [[1008]], [[1009]], [[1010]], [[1011]], [[1012]], [[1013]], [[1014]], [[1015]], [[1016]], [[1017]], [[1018]], [[1019]], [[1020]]],
        "id": "392",
        "properties": {
          "name": "Japan"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1021]],
        "id": "388",
        "properties": {
          "name": "Jamaica"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-373, 1022, -475, 1023, 1024], [-37], [-512]], [[1025]], [[1026]], [[1027]], [[1028]], [[1029]], [[1030]], [[1031]]],
        "id": "380",
        "properties": {
          "name": "Italy"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-367, -987, 1032, -985, 1033, 1034, 1035, 1036, -942]],
        "id": "376",
        "properties": {
          "name": "Israel"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-1036, 1037, 1038]], [[-986, -1033]]],
        "id": "275",
        "properties": {
          "name": "Palestine"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1039]], [[-269, 1040]]],
        "id": "372",
        "properties": {
          "name": "Ireland"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-309, 1041, 1042, -953, -503, -983, -365]],
        "id": "368",
        "properties": {
          "name": "Iraq"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1043]], [[-301, 1044, -759, 1045, -1042, -308, 1046, 1047, 1048, 1049]]],
        "id": "364",
        "properties": {
          "name": "Iran"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1050]], [[1051]], [[1052]], [[1053]], [[1054]], [[1055]], [[1056]], [[1057]], [[1058]], [[1059]], [[1060]], [[1061]], [[1062]], [[1063]], [[1064]], [[1065]], [[1066]], [[1067]], [[1068]], [[1069]], [[1070]], [[1071]], [[1072]], [[1073]], [[1074]], [[1075]], [[1076]], [[-907, 1077]], [[1078]], [[1079]], [[1080]], [[-330, 1081, -333, 1082]], [[1083]], [[1084]], [[1085]], [[-721, 1086]], [[1087]], [[1088]], [[1089]], [[1090]], [[1091]], [[1092]], [[1093]], [[1094]], [[1095]], [[1096]], [[1097]], [[1098]], [[1099]], [[1100]], [[1101]], [[1102]], [[1103]], [[1104]], [[1105]], [[1106]], [[1107]], [[1108]], [[1109]], [[1110]], [[1111]], [[1112]], [[1113]], [[1114]], [[1115]], [[1116]], [[1117]], [[1118]], [[1119]], [[1120]], [[1121]], [[1122]], [[1123]], [[1124]], [[1125]], [[1126]], [[1127]], [[1128]], [[1129]], [[1130]], [[1131]], [[1132]], [[1133]], [[1134]], [[1135]], [[1136]], [[1137]], [[1138]], [[1139]], [[1140]], [[1141]], [[1142]], [[1143]], [[1144]], [[1145]], [[1146]], [[1147]], [[1148]], [[1149]], [[1150]], [[1151]], [[1152]], [[-918, 1153]], [[1154]], [[1155]], [[1156]], [[1157]], [[1158]], [[1159]], [[1160]], [[1161]], [[1162]], [[1163]], [[1164]], [[1165]], [[1166]], [[1167]], [[1168]], [[1169]], [[1170]], [[1171]], [[1172]], [[1173]], [[1174]], [[1175]], [[1176]], [[1177]], [[1178]], [[1179]], [[1180]], [[1181]], [[1182]], [[1183]]],
        "id": "360",
        "properties": {
          "name": "Indonesia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-757, 1184, 1185, -850, 1186, 1187, 1188, 1189, 1190, 1191]], [[1192]], [[1193]], [[1194]], [[1195]], [[1196]], [[1197]], [[1198]], [[1199]], [[1200]], [[1201]], [[1202]], [[1203]], [[1204]]],
        "id": "356",
        "properties": {
          "name": "India"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1205]],
        "id": "352",
        "properties": {
          "name": "Iceland"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-288, -643, -490, 1206, -477, 1207, -469]],
        "id": "348",
        "properties": {
          "name": "Hungary"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-817, 1208, 1209, 1210, 1211]], [[1212]], [[1213]]],
        "id": "340",
        "properties": {
          "name": "Honduras"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1214, 1215]], [[1216]], [[1217]]],
        "id": "332",
        "properties": {
          "name": "Haiti"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-33, 1218, -388, 1219]],
        "id": "328",
        "properties": {
          "name": "Guyana"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-494, 1220, 1221]], [[1222]], [[1223]], [[1224]], [[1225]], [[1226]], [[1227]]],
        "id": "624",
        "properties": {
          "name": "Guinea-Bissau"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-481, 1228, -1221, -493, -903, 1229, -939]],
        "id": "324",
        "properties": {
          "name": "Guinea"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-876, 1230, 1231, -1211, 1232, 1233]],
        "id": "320",
        "properties": {
          "name": "Guatemala"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1234]],
        "id": "308",
        "properties": {
          "name": "Grenada"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1235]], [[1236]], [[1237]], [[1238]], [[1239]], [[1240]], [[1241]], [[1242]], [[1243]], [[1244]], [[1245]], [[1246]], [[1247]], [[1248]], [[1249]], [[1250]], [[1251]], [[1252]], [[1253]], [[1254]], [[1255]], [[1256]], [[1257]], [[1258]], [[1259]], [[1260]], [[1261]], [[1262]], [[1263]], [[1264]], [[1265]], [[1266]], [[1267]], [[1268]], [[1269]], [[1270]], [[1271]], [[1272]], [[1273]], [[-313, 1274, 1275, -924, 1276]]],
        "id": "300",
        "properties": {
          "name": "Greece"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-327, 1277, 1278, 1279, 1280, 1281]],
        "id": "288",
        "properties": {
          "name": "Ghana"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-375, 1282, -927, 1283, -835, 1284, 1285, 1286, -656, 1287, 1288]], [[1289]], [[-658, 1290]], [[1291]], [[1292]], [[1293]]],
        "id": "276",
        "properties": {
          "name": "Germany"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-305, 1294, -547, 1295, 1296]],
        "id": "268",
        "properties": {
          "name": "Georgia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-496, 1297]],
        "id": "270",
        "properties": {
          "name": "Gambia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1298, 1299, 1300, 1301]],
        "id": "266",
        "properties": {
          "name": "Gabon"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1302]], [[-374, -1025, 1303, -873, 1304, -411, 1305, -409, 1306, 1307, -928, -1283]], [[1308]], [[1309]], [[1310]], [[1311]], [[1312]], [[1313]], [[1314]], [[-386, 1315, 1316]]],
        "id": "250",
        "properties": {
          "name": "France"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1317]], [[1318]]],
        "id": "666",
        "properties": {
          "name": "St. Pierre and Miquelon"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1319]], [[1320]]],
        "id": "876",
        "properties": {
          "name": "Wallis and Futuna Is."
        }
      }, {
        "type": "Polygon",
        "arcs": [[1321, 1322]],
        "id": "663",
        "properties": {
          "name": "St-Martin"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1323]],
        "id": "652",
        "properties": {
          "name": "St-Barthélemy"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1324]], [[1325]], [[1326]], [[1327]], [[1328]], [[1329]], [[1330]], [[1331]], [[1332]], [[1333]], [[1334]], [[1335]], [[1336]], [[1337]], [[1338]], [[1339]], [[1340]], [[1341]], [[1342]], [[1343]], [[1344]]],
        "id": "258",
        "properties": {
          "name": "Fr. Polynesia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1345]], [[1346]], [[1347]], [[1348]], [[1349]], [[1350]]],
        "id": "540",
        "properties": {
          "name": "New Caledonia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1351]], [[1352]], [[1353]]],
        "id": "260",
        "properties": {
          "name": "Fr. S. Antarctic Lands"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1354]], [[1355]], [[1356]]],
        "id": "248",
        "properties": {
          "name": "Åland"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-379, -766, -553, 1357]], [[1358]], [[1359]], [[1360]], [[1361]], [[1362]], [[1363]], [[1364]]],
        "id": "246",
        "properties": {
          "name": "Finland"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1365]], [[1366]], [[1367]], [[1368]], [[1369]], [[1370]], [[1371]], [[1372]], [[1373]], [[1374]], [[1375]], [[1376]], [[1377]], [[1378]], [[1379]], [[1380]], [[1381]], [[1382]], [[1383]], [[1384]]],
        "id": "242",
        "properties": {
          "name": "Fiji"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-393, -401, 1385, 1386, -445, -442, -976]],
        "id": "231",
        "properties": {
          "name": "Ethiopia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-945, 1387, -551]], [[1388]], [[1389]], [[1390]]],
        "id": "233",
        "properties": {
          "name": "Estonia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-400, 1391, 1392, -1386]], [[1393]], [[1394]]],
        "id": "232",
        "properties": {
          "name": "Eritrea"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1395]], [[-1301, 1396, 1397]]],
        "id": "226",
        "properties": {
          "name": "Eq. Guinea"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-1210, 1398, -1233]],
        "id": "222",
        "properties": {
          "name": "El Salvador"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-398, -936, 1399, -1038, -1035, 1400]],
        "id": "818",
        "properties": {
          "name": "Egypt"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-714, 1401, 1402]], [[1403]], [[1404]], [[1405]], [[1406]], [[1407]], [[1408]], [[1409]], [[1410]]],
        "id": "218",
        "properties": {
          "name": "Ecuador"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-1215, 1411]],
        "id": "214",
        "properties": {
          "name": "Dominican Rep."
        }
      }, {
        "type": "Polygon",
        "arcs": [[1412]],
        "id": "212",
        "properties": {
          "name": "Dominica"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-446, -1387, -1393, 1413]],
        "id": "262",
        "properties": {
          "name": "Djibouti"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1414]], [[1415]], [[1416]], [[1417]], [[1418]], [[1419]], [[1420]], [[1421]], [[1422]], [[1423]], [[1424]], [[1425]], [[1426]], [[1427]], [[1428]], [[1429]], [[1430]]],
        "id": "304",
        "properties": {
          "name": "Greenland"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1431]], [[1432]], [[1433]], [[1434]], [[1435]]],
        "id": "234",
        "properties": {
          "name": "Faeroe Is."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1436]], [[-1286, 1437]], [[1438]], [[1439]], [[1440]], [[1441]], [[1442]], [[1443]], [[1444]], [[1445]], [[1446]], [[1447]]],
        "id": "208",
        "properties": {
          "name": "Denmark"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-471, 1448, -1288, -655]],
        "id": "203",
        "properties": {
          "name": "Czechia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1449, 1450]],
        "properties": {
          "name": "N. Cyprus"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-1450, 1451]],
        "id": "196",
        "properties": {
          "name": "Cyprus"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1452]], [[1453]], [[1454]], [[1455]], [[1456]], [[1457]], [[1458]]],
        "id": "192",
        "properties": {
          "name": "Cuba"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-473, -1207, -489, 1459, 1460]], [[1461]], [[1462]], [[1463]], [[1464]], [[1465]], [[1466]], [[1467]], [[1468]], [[1469]], [[1470]], [[1471]], [[-869, 1472, 1473]]],
        "id": "191",
        "properties": {
          "name": "Croatia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-1279, 1474]], [[-902, 1475, -1281, 1476, -940, -1230]]],
        "id": "384",
        "properties": {
          "name": "Côte d'Ivoire"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-748, 1477, -815, 1478]],
        "id": "188",
        "properties": {
          "name": "Costa Rica"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-7, 1479, 1480, 1481, 1482, 1483, -390, -296, -522, 1484, -351]],
        "id": "180",
        "properties": {
          "name": "Dem. Rep. Congo"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-1299, 1485, 1486, -1483, 1487, 1488]],
        "id": "178",
        "properties": {
          "name": "Congo"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1489]], [[1490]], [[1491]]],
        "id": "174",
        "properties": {
          "name": "Comoros"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-35, 1492, -715, -1403, 1493, -746, 1494]], [[1495]]],
        "id": "170",
        "properties": {
          "name": "Colombia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1496]], [[1497]], [[1498]], [[1499]], [[1500]], [[1501]], [[1502]], [[1503]], [[1504]], [[1505]], [[1506]], [[-22, -949, 1507, -1189, 1508, -1187, -851, -1186, 1509, -761, 1510, -360, -951, -982, -543, -871, -541, -799, 1511, 1512, 1513, 1514, 1515]], [[1516]]],
        "id": "156",
        "properties": {
          "name": "China"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-1515, 1517]],
        "id": "446",
        "properties": {
          "name": "Macao"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-1513, 1518]], [[1519]], [[1520]]],
        "id": "344",
        "properties": {
          "name": "Hong Kong"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1521]], [[1522]], [[-712, 1523, 1524, 1525]], [[1526, 1527]], [[1528]], [[1529]], [[1530]], [[1531]], [[1532]], [[1533]], [[1534]], [[1535]], [[1536]], [[1537]], [[1538]], [[1539]], [[1540]], [[1541]], [[1542]], [[1543]], [[1544]], [[1545]], [[1546]], [[1547]], [[1548]], [[1549]], [[1550]], [[1551]], [[1552]], [[1553]], [[1554]]],
        "id": "152",
        "properties": {
          "name": "Chile"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-396, 1555, 1556, -803, -813, -937]],
        "id": "148",
        "properties": {
          "name": "Chad"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-391, -1484, -1487, 1557, -1556, -395]],
        "id": "140",
        "properties": {
          "name": "Central African Rep."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1558]], [[1559]], [[1560]], [[1561]], [[1562]], [[1563]], [[1564]], [[1565]]],
        "id": "132",
        "properties": {
          "name": "Cabo Verde"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1566]], [[1567]], [[1568]], [[-106, 1569, -169, 1570]], [[1571]], [[1572]], [[1573]], [[1574]], [[1575]], [[1576]], [[1577]], [[1578]], [[1579]], [[1580]], [[1581]], [[1582]], [[1583]], [[1584]], [[1585]], [[1586]], [[1587]], [[1588]], [[1589]], [[-165, 1590]], [[1591]], [[1592]], [[1593]], [[1594]], [[1595]], [[1596]], [[1597]], [[1598]], [[1599]], [[1600]], [[1601]], [[1602]], [[1603]], [[1604]], [[1605]], [[1606]], [[1607]], [[1608]], [[1609]], [[1610]], [[1611]], [[1612]], [[1613]], [[1614]], [[-104, 1615]], [[1616]], [[1617]], [[1618]], [[1619]], [[1620]], [[1621]], [[1622]], [[1623]], [[1624]], [[1625]], [[1626]], [[1627]], [[1628]], [[1629]], [[1630]], [[1631]], [[1632]], [[1633]], [[1634]], [[1635]], [[1636]], [[1637]], [[1638]], [[1639]], [[1640]], [[1641]], [[1642]], [[1643]], [[1644]], [[1645]], [[1646]], [[1647]], [[1648]], [[1649]], [[1650]], [[1651]], [[1652]], [[1653]], [[1654]], [[1655]], [[1656]], [[1657]], [[1658]], [[1659]], [[1660]], [[1661]], [[1662]], [[1663]], [[1664]], [[1665]], [[1666]], [[1667]], [[1668]], [[1669]], [[1670]], [[1671]], [[1672]], [[1673]], [[1674]], [[1675]], [[1676]], [[1677]], [[1678]], [[1679]], [[1680]], [[1681]], [[1682]], [[1683]], [[1684]], [[1685]], [[1686]], [[1687]], [[1688]], [[1689]], [[1690]], [[1691]], [[1692]], [[1693]], [[1694]], [[1695]], [[1696]], [[1697]], [[1698]], [[1699]], [[1700]], [[1701]], [[1702]], [[1703]], [[1704]], [[1705]], [[1706]], [[1707]]],
        "id": "124",
        "properties": {
          "name": "Canada"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-804, -1557, -1558, -1486, -1302, -1398, 1708]],
        "id": "120",
        "properties": {
          "name": "Cameroon"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1709]], [[1710]], [[-20, 1711, -338, -947]]],
        "id": "116",
        "properties": {
          "name": "Cambodia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-342, 1712, 1713, -1190, -1508, -948]], [[1714]], [[1715]], [[1716]], [[1717]], [[1718]], [[1719]], [[1720]], [[1721]], [[1722]], [[1723]], [[1724]], [[1725]], [[1726]], [[1727]], [[1728]], [[1729]], [[1730]], [[1731]]],
        "id": "104",
        "properties": {
          "name": "Myanmar"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-352, -1485, -521]],
        "id": "108",
        "properties": {
          "name": "Burundi"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-328, -1282, -1476, -901, -809, 1732]],
        "id": "854",
        "properties": {
          "name": "Burkina Faso"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-314, -1277, -923, -484, -642, 1733]],
        "id": "100",
        "properties": {
          "name": "Bulgaria"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-910, 1734]], [[-909, 1735]]],
        "id": "096",
        "properties": {
          "name": "Brunei"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-34, -1220, -387, -1317, 1736, -62, 1737, -716, 1738, -710, -1493]], [[1739]], [[1740]], [[1741]], [[1742]], [[1743]], [[1744]], [[1745]], [[1746]], [[1747]], [[1748]], [[1749]], [[1750]], [[1751]], [[1752]], [[1753]], [[1754]]],
        "id": "076",
        "properties": {
          "name": "Brazil"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-2, -438, -853]],
        "id": "072",
        "properties": {
          "name": "Botswana"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-870, -1474, 1755, -1460, -488]],
        "id": "070",
        "properties": {
          "name": "Bosnia and Herz."
        }
      }, {
        "type": "Polygon",
        "arcs": [[-711, -1739, -718, 1756, -1524]],
        "id": "068",
        "properties": {
          "name": "Bolivia"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-1188, -1509]],
        "id": "064",
        "properties": {
          "name": "Bhutan"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-325, -1733, -808, -806, 1757]],
        "id": "204",
        "properties": {
          "name": "Benin"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-875, 1758, -1231]], [[1759]], [[1760]]],
        "id": "084",
        "properties": {
          "name": "Belize"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-833, -1284, -929, -1308, 1761, -836]],
        "id": "056",
        "properties": {
          "name": "Belgium"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-291, -661, -933, -946, -549]],
        "id": "112",
        "properties": {
          "name": "Belarus"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1762]],
        "id": "052",
        "properties": {
          "name": "Barbados"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-1191, -1714, 1763]], [[1764]], [[1765]], [[1766]], [[1767]], [[1768]], [[1769]]],
        "id": "050",
        "properties": {
          "name": "Bangladesh"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1770]],
        "id": "048",
        "properties": {
          "name": "Bahrain"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1771]], [[1772]], [[1773]], [[1774]], [[1775]], [[1776]], [[1777]], [[1778]], [[1779]], [[1780]], [[1781]], [[1782]], [[1783]], [[1784]], [[1785]]],
        "id": "044",
        "properties": {
          "name": "Bahamas"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-307, 1786, -1047]], [[-1049, 1787, -1296, -546, 1788], [1789]], [[1790]]],
        "id": "031",
        "properties": {
          "name": "Azerbaijan"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-370, -1289, -1449, -470, -1208, -476, -1023, -372, -934]],
        "id": "040",
        "properties": {
          "name": "Austria"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1791]], [[1792]], [[1793]], [[1794]], [[1795]], [[1796]], [[1797]], [[1798]], [[1799]], [[1800]], [[1801]], [[1802]], [[1803]], [[1804]], [[1805]], [[1806]], [[1807]], [[1808]], [[1809]], [[1810]], [[1811]], [[1812]], [[1813]], [[1814]], [[1815]], [[1816]], [[1817]], [[1818]], [[1819]], [[1820]], [[1821]], [[1822]], [[1823]], [[1824]], [[1825]], [[1826]], [[1827]], [[1828]], [[1829]], [[1830]], [[1831]], [[1832]]],
        "id": "036",
        "properties": {
          "name": "Australia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1833]], [[1834]], [[1835]]],
        "properties": {
          "name": "Indian Ocean Ter."
        }
      }, {
        "type": "Polygon",
        "arcs": [[1836]],
        "id": "334",
        "properties": {
          "name": "Heard I. and McDonald Is."
        }
      }, {
        "type": "Polygon",
        "arcs": [[1837]],
        "id": "574",
        "properties": {
          "name": "Norfolk Island"
        }
      }, {
        "type": "Polygon",
        "arcs": [[1838]],
        "id": "036",
        "properties": {
          "name": "Ashmore and Cartier Is."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-306, -1297, -1788, -1048, -1787], [-1791]], [[-1790]]],
        "id": "051",
        "properties": {
          "name": "Armenia"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-61, 1839, -1525, -1757, -717, -1738]], [[-1527, 1840]], [[1841]], [[1842]]],
        "id": "032",
        "properties": {
          "name": "Argentina"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1843]], [[1844]]],
        "id": "028",
        "properties": {
          "name": "Antigua and Barb."
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[-1482, 1845, -1488]], [[-6, -855, 1846, -1480]]],
        "id": "024",
        "properties": {
          "name": "Angola"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-410, -1306]],
        "id": "020",
        "properties": {
          "name": "Andorra"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-316, -938, -811, -900, -896, -863, -860, 1847]],
        "id": "012",
        "properties": {
          "name": "Algeria"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-867, -955, -925, -1276, 1848]],
        "id": "008",
        "properties": {
          "name": "Albania"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-54, -361, -1511, -760, -1045, -300]],
        "id": "004",
        "properties": {
          "name": "Afghanistan"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-756, -1510, -1185]],
        "properties": {
          "name": "Siachen Glacier"
        }
      }, {
        "type": "MultiPolygon",
        "arcs": [[[1849]], [[1850]], [[1851], [1852]], [[1853]], [[1854]], [[1855]], [[1856]], [[1857]], [[1858]], [[1859]], [[1860]], [[1861]], [[1862]], [[1863]], [[1864]], [[1865]], [[1866]], [[1867]], [[1868]], [[1869]], [[1870]], [[1871]], [[1872]], [[1873]], [[1874]], [[1875]], [[1876]], [[1877]], [[1878]], [[1879]], [[1880]], [[1881]], [[1882]], [[1883]], [[1884]], [[1885]], [[1886]], [[1887]], [[1888]], [[1889]], [[1890]], [[1891]], [[1892]], [[1893]], [[1894]], [[1895]], [[1896]], [[1897]], [[1898]], [[1899]], [[1900]], [[1901]], [[1902]], [[1903]], [[1904]], [[1905]], [[1906]], [[1907]], [[1908]], [[1909]], [[1910]], [[1911]], [[1912]], [[1913]], [[1914]], [[1915]], [[1916]], [[1917]], [[1918]], [[1919]], [[1920]], [[1921]], [[1922]], [[1923]], [[1924]], [[1925]], [[1926]], [[1927]], [[1928]], [[1929]], [[1930]], [[1931]], [[1932]], [[1933]], [[1934]], [[1935]], [[1936]], [[1937]], [[1938]], [[1939]], [[1940]], [[1941]], [[1942]], [[1943]], [[1944]], [[1945]], [[1946]], [[1947]], [[1948]], [[1949]], [[1950]], [[1951]], [[1952]], [[1953]], [[1954]], [[1955]], [[1956]], [[1957]]],
        "id": "010",
        "properties": {
          "name": "Antarctica"
        }
      }, {
        "type": "Polygon",
        "arcs": [[-1322, 1958]],
        "id": "534",
        "properties": {
          "name": "Sint Maarten"
        }
      }]
    },
    "land": {
      "type": "GeometryCollection",
      "geometries": [{
        "type": "MultiPolygon",
        "arcs": [[[853, 1846, 1480, 1845, 1488, 1299, 1396, 1708, 804, 1757, 325, 1277, 1474, 1279, 1476, 940, 479, 1228, 1221, 494, 1297, 496, 894, 864, 861, 1847, 316, 934, 1399, 1038, 1036, 942, 368, 310, 1294, 547, 281, 639, 283, 640, 1733, 311, 1274, 1848, 867, 1472, 1755, 1460, 473, 1023, 1303, 871, 1304, 411, 646, 413, 1306, 1761, 836, 833, 1284, 1437, 1286, 656, 1290, 658, 637, 929, 634, 930, 943, 1387, 551, 1357, 379, 764, 554, 799, 422, 797, 1511, 1518, 1513, 1517, 1515, 18, 1711, 338, 905, 340, 1712, 1763, 1191, 757, 1045, 1042, 953, 504, 644, 506, 274, 763, 271, 762, 10, 500, 983, 1033, 1400, 398, 1391, 1413, 446, 443, 976, 354, 856, 435], [980, 544, 1788, 1049, 301]], [[13]], [[14]], [[15]], [[16]], [[17]], [[22]], [[23]], [[24]], [[25]], [[26]], [[27]], [[28]], [[29]], [[30]], [[31]], [[388, 1315, 1736, 59, 1839, 1525, 712, 1401, 1493, 746, 1477, 815, 1208, 1398, 1233, 876, 167, 1570, 102, 1615, 104, 1569, 1590, 165, 873, 1758, 1231, 1211, 813, 1478, 748, 1494, 35, 1218]], [[37]], [[38]], [[39]], [[40]], [[41]], [[42]], [[43]], [[44]], [[45]], [[46]], [[47]], [[48]], [[49]], [[50]], [[62]], [[63]], [[64]], [[65]], [[66]], [[67]], [[68]], [[69]], [[70]], [[71]], [[72]], [[73]], [[74]], [[75]], [[76]], [[77]], [[78]], [[79]], [[80]], [[81]], [[82]], [[83]], [[84]], [[85]], [[86]], [[87]], [[88]], [[89]], [[90]], [[91]], [[92]], [[93]], [[94]], [[95]], [[96]], [[97]], [[98]], [[99]], [[100]], [[101]], [[106]], [[107]], [[108]], [[109]], [[110]], [[111]], [[112]], [[113]], [[114]], [[115]], [[116]], [[117]], [[118]], [[119]], [[120]], [[121]], [[122]], [[123]], [[124]], [[125]], [[126]], [[127]], [[128]], [[129]], [[130]], [[131]], [[132]], [[133]], [[134]], [[135]], [[136]], [[137]], [[138]], [[139]], [[140]], [[141]], [[142]], [[143]], [[144]], [[145]], [[146]], [[147]], [[148]], [[149]], [[150]], [[151]], [[152]], [[153]], [[154]], [[155]], [[156]], [[157]], [[158]], [[159]], [[160]], [[161]], [[162]], [[163]], [[169]], [[170]], [[171]], [[172]], [[173]], [[174]], [[175]], [[176]], [[177]], [[178]], [[179]], [[180]], [[181]], [[182]], [[183]], [[184]], [[185]], [[186]], [[187]], [[188]], [[189]], [[190]], [[191]], [[192]], [[193]], [[194]], [[195]], [[196]], [[197]], [[198]], [[199]], [[200]], [[201]], [[202]], [[203]], [[204]], [[205]], [[206]], [[207]], [[208]], [[209]], [[210]], [[211]], [[212]], [[213]], [[214]], [[215]], [[216]], [[217]], [[218]], [[219]], [[220]], [[221]], [[222]], [[223]], [[224]], [[225]], [[226]], [[227]], [[228]], [[229]], [[230]], [[231]], [[232]], [[233]], [[234]], [[235]], [[236]], [[237]], [[238]], [[239]], [[240]], [[241]], [[242]], [[243]], [[244]], [[245]], [[246]], [[247]], [[248]], [[249]], [[250]], [[251]], [[252]], [[253]], [[254]], [[255]], [[256]], [[257]], [[258]], [[259]], [[260]], [[261]], [[262]], [[263]], [[264]], [[265]], [[266]], [[267]], [[269, 1040]], [[270]], [[277]], [[278]], [[279]], [[280]], [[292]], [[298]], [[303]], [[317]], [[318]], [[319]], [[320]], [[321]], [[322]], [[323]], [[328]], [[1082, 330, 1081, 331]], [[333]], [[334]], [[335]], [[342]], [[343]], [[344]], [[345]], [[346]], [[347]], [[348]], [[349]], [[357]], [[362]], [[363]], [[375]], [[376]], [[380]], [[381]], [[382]], [[401]], [[402]], [[403]], [[404]], [[405]], [[406]], [[407]], [[414]], [[415]], [[416]], [[417]], [[418]], [[419]], [[420]], [[423]], [[424]], [[425]], [[426]], [[427]], [[428]], [[429]], [[430]], [[431]], [[432]], [[439]], [[447]], [[448]], [[449]], [[450]], [[451]], [[452]], [[453]], [[454]], [[455]], [[456]], [[457]], [[458]], [[459]], [[460]], [[461]], [[462]], [[463]], [[464]], [[465]], [[466]], [[467]], [[477]], [[481]], [[482]], [[498]], [[499]], [[508]], [[509]], [[510]], [[512]], [[513]], [[514]], [[515]], [[516]], [[517]], [[518]], [[519]], [[522]], [[523]], [[524]], [[525]], [[526]], [[527]], [[528]], [[529]], [[530]], [[531]], [[532]], [[533]], [[534]], [[535]], [[536]], [[537]], [[538]], [[555]], [[556]], [[557]], [[558]], [[559]], [[560]], [[561]], [[562]], [[563]], [[564]], [[565]], [[566]], [[567]], [[568]], [[569]], [[570]], [[571]], [[572]], [[573]], [[574]], [[575]], [[576]], [[577]], [[578]], [[579]], [[580]], [[581]], [[582]], [[583]], [[584]], [[585]], [[586]], [[587]], [[588]], [[589]], [[590]], [[591]], [[592]], [[593]], [[594]], [[595]], [[596]], [[597]], [[598]], [[599]], [[600]], [[601]], [[602]], [[603]], [[604]], [[605]], [[606]], [[607]], [[608]], [[609]], [[610]], [[611]], [[612]], [[613]], [[614]], [[615]], [[616]], [[617]], [[618]], [[619]], [[620]], [[621]], [[622]], [[623]], [[624]], [[625]], [[626]], [[627]], [[628]], [[629]], [[630]], [[631]], [[632]], [[633]], [[645]], [[647]], [[648]], [[649]], [[650]], [[651]], [[652]], [[653]], [[661]], [[662]], [[663]], [[664]], [[665]], [[666]], [[667]], [[668]], [[669]], [[670]], [[671]], [[672]], [[673]], [[674]], [[675]], [[676]], [[677]], [[678]], [[679]], [[680]], [[681]], [[682]], [[683]], [[684]], [[685]], [[686]], [[687]], [[688]], [[689]], [[690]], [[691]], [[692]], [[693]], [[694]], [[695]], [[696]], [[697]], [[698]], [[699]], [[700]], [[701]], [[702]], [[703]], [[704]], [[705]], [[706]], [[707]], [[708]], [[718]], [[719]], [[721, 1086]], [[722]], [[723]], [[724]], [[725]], [[726]], [[727]], [[728]], [[729]], [[730]], [[731]], [[732]], [[733]], [[734]], [[735]], [[736]], [[737]], [[738]], [[739]], [[740]], [[741]], [[742]], [[743]], [[744]], [[749]], [[750]], [[751]], [[752]], [[753]], [[754]], [[761]], [[766]], [[767]], [[768]], [[769]], [[770]], [[771]], [[772]], [[773]], [[774]], [[775]], [[776]], [[777]], [[778]], [[779]], [[780]], [[781]], [[782]], [[783]], [[784]], [[785]], [[786]], [[787]], [[788]], [[789]], [[790]], [[791]], [[792]], [[793]], [[794]], [[795]], [[796]], [[800]], [[801]], [[817]], [[818]], [[819]], [[820]], [[821]], [[822]], [[823]], [[824]], [[825]], [[826]], [[827]], [[828]], [[829]], [[830]], [[831]], [[837]], [[838]], [[839]], [[840]], [[841]], [[842]], [[843]], [[844]], [[845]], [[846]], [[847]], [[848]], [[851]], [[877]], [[878]], [[879]], [[880]], [[881]], [[882]], [[883]], [[884]], [[885]], [[886]], [[887]], [[888]], [[889]], [[890]], [[891]], [[892]], [[893]], [[897]], [[898]], [[903]], [[904]], [[907, 1735, 1734, 910, 1077]], [[911]], [[912]], [[913]], [[914]], [[915]], [[916]], [[918, 1153]], [[919]], [[920]], [[921]], [[951]], [[955]], [[956]], [[957]], [[958]], [[959]], [[960]], [[961]], [[962]], [[963]], [[964]], [[965]], [[966]], [[967]], [[968]], [[969]], [[970]], [[971]], [[972]], [[973]], [[974]], [[977]], [[978]], [[979]], [[987]], [[988]], [[989]], [[990]], [[991]], [[992]], [[993]], [[994]], [[995]], [[996]], [[997]], [[998]], [[999]], [[1000]], [[1001]], [[1002]], [[1003]], [[1004]], [[1005]], [[1006]], [[1007]], [[1008]], [[1009]], [[1010]], [[1011]], [[1012]], [[1013]], [[1014]], [[1015]], [[1016]], [[1017]], [[1018]], [[1019]], [[1020]], [[1021]], [[1025]], [[1026]], [[1027]], [[1028]], [[1029]], [[1030]], [[1031]], [[1039]], [[1043]], [[1050]], [[1051]], [[1052]], [[1053]], [[1054]], [[1055]], [[1056]], [[1057]], [[1058]], [[1059]], [[1060]], [[1061]], [[1062]], [[1063]], [[1064]], [[1065]], [[1066]], [[1067]], [[1068]], [[1069]], [[1070]], [[1071]], [[1072]], [[1073]], [[1074]], [[1075]], [[1076]], [[1078]], [[1079]], [[1080]], [[1083]], [[1084]], [[1085]], [[1087]], [[1088]], [[1089]], [[1090]], [[1091]], [[1092]], [[1093]], [[1094]], [[1095]], [[1096]], [[1097]], [[1098]], [[1099]], [[1100]], [[1101]], [[1102]], [[1103]], [[1104]], [[1105]], [[1106]], [[1107]], [[1108]], [[1109]], [[1110]], [[1111]], [[1112]], [[1113]], [[1114]], [[1115]], [[1116]], [[1117]], [[1118]], [[1119]], [[1120]], [[1121]], [[1122]], [[1123]], [[1124]], [[1125]], [[1126]], [[1127]], [[1128]], [[1129]], [[1130]], [[1131]], [[1132]], [[1133]], [[1134]], [[1135]], [[1136]], [[1137]], [[1138]], [[1139]], [[1140]], [[1141]], [[1142]], [[1143]], [[1144]], [[1145]], [[1146]], [[1147]], [[1148]], [[1149]], [[1150]], [[1151]], [[1152]], [[1154]], [[1155]], [[1156]], [[1157]], [[1158]], [[1159]], [[1160]], [[1161]], [[1162]], [[1163]], [[1164]], [[1165]], [[1166]], [[1167]], [[1168]], [[1169]], [[1170]], [[1171]], [[1172]], [[1173]], [[1174]], [[1175]], [[1176]], [[1177]], [[1178]], [[1179]], [[1180]], [[1181]], [[1182]], [[1183]], [[1192]], [[1193]], [[1194]], [[1195]], [[1196]], [[1197]], [[1198]], [[1199]], [[1200]], [[1201]], [[1202]], [[1203]], [[1204]], [[1205]], [[1212]], [[1213]], [[1215, 1411]], [[1216]], [[1217]], [[1222]], [[1223]], [[1224]], [[1225]], [[1226]], [[1227]], [[1234]], [[1235]], [[1236]], [[1237]], [[1238]], [[1239]], [[1240]], [[1241]], [[1242]], [[1243]], [[1244]], [[1245]], [[1246]], [[1247]], [[1248]], [[1249]], [[1250]], [[1251]], [[1252]], [[1253]], [[1254]], [[1255]], [[1256]], [[1257]], [[1258]], [[1259]], [[1260]], [[1261]], [[1262]], [[1263]], [[1264]], [[1265]], [[1266]], [[1267]], [[1268]], [[1269]], [[1270]], [[1271]], [[1272]], [[1273]], [[1289]], [[1291]], [[1292]], [[1293]], [[1302]], [[1308]], [[1309]], [[1310]], [[1311]], [[1312]], [[1313]], [[1314]], [[1317]], [[1318]], [[1319]], [[1320]], [[1322, 1958]], [[1323]], [[1324]], [[1325]], [[1326]], [[1327]], [[1328]], [[1329]], [[1330]], [[1331]], [[1332]], [[1333]], [[1334]], [[1335]], [[1336]], [[1337]], [[1338]], [[1339]], [[1340]], [[1341]], [[1342]], [[1343]], [[1344]], [[1345]], [[1346]], [[1347]], [[1348]], [[1349]], [[1350]], [[1351]], [[1352]], [[1353]], [[1354]], [[1355]], [[1356]], [[1358]], [[1359]], [[1360]], [[1361]], [[1362]], [[1363]], [[1364]], [[1365]], [[1366]], [[1367]], [[1368]], [[1369]], [[1370]], [[1371]], [[1372]], [[1373]], [[1374]], [[1375]], [[1376]], [[1377]], [[1378]], [[1379]], [[1380]], [[1381]], [[1382]], [[1383]], [[1384]], [[1388]], [[1389]], [[1390]], [[1393]], [[1394]], [[1395]], [[1403]], [[1404]], [[1405]], [[1406]], [[1407]], [[1408]], [[1409]], [[1410]], [[1412]], [[1414]], [[1415]], [[1416]], [[1417]], [[1418]], [[1419]], [[1420]], [[1421]], [[1422]], [[1423]], [[1424]], [[1425]], [[1426]], [[1427]], [[1428]], [[1429]], [[1430]], [[1431]], [[1432]], [[1433]], [[1434]], [[1435]], [[1436]], [[1438]], [[1439]], [[1440]], [[1441]], [[1442]], [[1443]], [[1444]], [[1445]], [[1446]], [[1447]], [[1450, 1451]], [[1452]], [[1453]], [[1454]], [[1455]], [[1456]], [[1457]], [[1458]], [[1461]], [[1462]], [[1463]], [[1464]], [[1465]], [[1466]], [[1467]], [[1468]], [[1469]], [[1470]], [[1471]], [[1489]], [[1490]], [[1491]], [[1495]], [[1496]], [[1497]], [[1498]], [[1499]], [[1500]], [[1501]], [[1502]], [[1503]], [[1504]], [[1505]], [[1506]], [[1516]], [[1519]], [[1520]], [[1521]], [[1522]], [[1527, 1840]], [[1528]], [[1529]], [[1530]], [[1531]], [[1532]], [[1533]], [[1534]], [[1535]], [[1536]], [[1537]], [[1538]], [[1539]], [[1540]], [[1541]], [[1542]], [[1543]], [[1544]], [[1545]], [[1546]], [[1547]], [[1548]], [[1549]], [[1550]], [[1551]], [[1552]], [[1553]], [[1554]], [[1558]], [[1559]], [[1560]], [[1561]], [[1562]], [[1563]], [[1564]], [[1565]], [[1566]], [[1567]], [[1568]], [[1571]], [[1572]], [[1573]], [[1574]], [[1575]], [[1576]], [[1577]], [[1578]], [[1579]], [[1580]], [[1581]], [[1582]], [[1583]], [[1584]], [[1585]], [[1586]], [[1587]], [[1588]], [[1589]], [[1591]], [[1592]], [[1593]], [[1594]], [[1595]], [[1596]], [[1597]], [[1598]], [[1599]], [[1600]], [[1601]], [[1602]], [[1603]], [[1604]], [[1605]], [[1606]], [[1607]], [[1608]], [[1609]], [[1610]], [[1611]], [[1612]], [[1613]], [[1614]], [[1616]], [[1617]], [[1618]], [[1619]], [[1620]], [[1621]], [[1622]], [[1623]], [[1624]], [[1625]], [[1626]], [[1627]], [[1628]], [[1629]], [[1630]], [[1631]], [[1632]], [[1633]], [[1634]], [[1635]], [[1636]], [[1637]], [[1638]], [[1639]], [[1640]], [[1641]], [[1642]], [[1643]], [[1644]], [[1645]], [[1646]], [[1647]], [[1648]], [[1649]], [[1650]], [[1651]], [[1652]], [[1653]], [[1654]], [[1655]], [[1656]], [[1657]], [[1658]], [[1659]], [[1660]], [[1661]], [[1662]], [[1663]], [[1664]], [[1665]], [[1666]], [[1667]], [[1668]], [[1669]], [[1670]], [[1671]], [[1672]], [[1673]], [[1674]], [[1675]], [[1676]], [[1677]], [[1678]], [[1679]], [[1680]], [[1681]], [[1682]], [[1683]], [[1684]], [[1685]], [[1686]], [[1687]], [[1688]], [[1689]], [[1690]], [[1691]], [[1692]], [[1693]], [[1694]], [[1695]], [[1696]], [[1697]], [[1698]], [[1699]], [[1700]], [[1701]], [[1702]], [[1703]], [[1704]], [[1705]], [[1706]], [[1707]], [[1709]], [[1710]], [[1714]], [[1715]], [[1716]], [[1717]], [[1718]], [[1719]], [[1720]], [[1721]], [[1722]], [[1723]], [[1724]], [[1725]], [[1726]], [[1727]], [[1728]], [[1729]], [[1730]], [[1731]], [[1739]], [[1740]], [[1741]], [[1742]], [[1743]], [[1744]], [[1745]], [[1746]], [[1747]], [[1748]], [[1749]], [[1750]], [[1751]], [[1752]], [[1753]], [[1754]], [[1759]], [[1760]], [[1762]], [[1764]], [[1765]], [[1766]], [[1767]], [[1768]], [[1769]], [[1770]], [[1771]], [[1772]], [[1773]], [[1774]], [[1775]], [[1776]], [[1777]], [[1778]], [[1779]], [[1780]], [[1781]], [[1782]], [[1783]], [[1784]], [[1785]], [[1791]], [[1792]], [[1793]], [[1794]], [[1795]], [[1796]], [[1797]], [[1798]], [[1799]], [[1800]], [[1801]], [[1802]], [[1803]], [[1804]], [[1805]], [[1806]], [[1807]], [[1808]], [[1809]], [[1810]], [[1811]], [[1812]], [[1813]], [[1814]], [[1815]], [[1816]], [[1817]], [[1818]], [[1819]], [[1820]], [[1821]], [[1822]], [[1823]], [[1824]], [[1825]], [[1826]], [[1827]], [[1828]], [[1829]], [[1830]], [[1831]], [[1832]], [[1833]], [[1834]], [[1835]], [[1836]], [[1837]], [[1838]], [[1841]], [[1842]], [[1843]], [[1844]], [[1849]], [[1850]], [[1852], [1851]], [[1853]], [[1854]], [[1855]], [[1856]], [[1857]], [[1858]], [[1859]], [[1860]], [[1861]], [[1862]], [[1863]], [[1864]], [[1865]], [[1866]], [[1867]], [[1868]], [[1869]], [[1870]], [[1871]], [[1872]], [[1873]], [[1874]], [[1875]], [[1876]], [[1877]], [[1878]], [[1879]], [[1880]], [[1881]], [[1882]], [[1883]], [[1884]], [[1885]], [[1886]], [[1887]], [[1888]], [[1889]], [[1890]], [[1891]], [[1892]], [[1893]], [[1894]], [[1895]], [[1896]], [[1897]], [[1898]], [[1899]], [[1900]], [[1901]], [[1902]], [[1903]], [[1904]], [[1905]], [[1906]], [[1907]], [[1908]], [[1909]], [[1910]], [[1911]], [[1912]], [[1913]], [[1914]], [[1915]], [[1916]], [[1917]], [[1918]], [[1919]], [[1920]], [[1921]], [[1922]], [[1923]], [[1924]], [[1925]], [[1926]], [[1927]], [[1928]], [[1929]], [[1930]], [[1931]], [[1932]], [[1933]], [[1934]], [[1935]], [[1936]], [[1937]], [[1938]], [[1939]], [[1940]], [[1941]], [[1942]], [[1943]], [[1944]], [[1945]], [[1946]], [[1947]], [[1948]], [[1949]], [[1950]], [[1951]], [[1952]], [[1953]], [[1954]], [[1955]], [[1956]], [[1957]]]
      }]
    }
  },
  "bbox": [-180, -89.999, 180, 83.599609375],
  "transform": {
    "scale": [0.0036000360003600037, 0.001736003453784538],
    "translate": [-180, -89.999]
  }
};
},{}],"data/world-translate.csv":[function(require,module,exports) {
module.exports = "/world-translate.4afc4804.csv";
},{}],"data/population-wb.csv":[function(require,module,exports) {
module.exports = "/population-wb.961b7f3f.csv";
},{}],"js/main.js":[function(require,module,exports) {
"use strict";

var _fetchJsonp = _interopRequireDefault(require("fetch-jsonp"));

var _chromaJs = _interopRequireDefault(require("chroma-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var world = require("./../data/countries-50m.json");

var topoData = topojson.feature(world, world.objects.countries).features;

var translationUrl = require("./../data/world-translate.csv");

var populationUrl = require("./../data/population-wb.csv");

console.log("Geographical Data", topoData);
var data = {};
var maxInfection = 0;
var path = d3.geoPath(d3.geoNaturalEarth1());
document.body.addEventListener("mousemove", function (e) {
  d3.select("html").style("background-position-x", +e.offsetX / 10.0 + "px");
  d3.select("html").style("background-position-y", +e.offsetY / 10.0 + "px");
});
(0, _fetchJsonp.default)("https://interface.sina.cn/news/wap/fymap2020_data.d.json").then(function (response) {
  return response.json();
}).then(function (raw) {
  console.log("Infection Data from Sina", raw);
  raw.data.worldlist.forEach(function (country) {
    data[country.name] = country;
    data[country.name].computed = {};
    if (country.name === "中国") data[country.name].conNum = data[country.name].value;
  });
  fetch(translationUrl).then(function (res) {
    return res.text();
  }).then(function (translations) {
    fetch(populationUrl).then(function (res) {
      return res.text();
    }).then(function (population) {
      var translationMap = new Map(d3.csvParse(translations, function (_ref) {
        var en = _ref.en,
            zh = _ref.zh;
        return [en, zh];
      }));
      var populationMap = new Map(d3.csvParse(population, function (_ref2) {
        var country = _ref2.country,
            population = _ref2.population;
        return [country, population];
      }));

      var render = function render(method) {
        d3.select("svg-frame").html("");
        var formula = method.formula,
            dataDefault = method.dataDefault,
            style = method.style,
            properties = method.properties;

        var resetRegion = function resetRegion() {
          d3.select(".rate").html(dataDefault.toFixed(method.properties.toFixed));
          d3.select(".city-name").html("World / 全球");
          d3.select(".grad-bar").style("background", "linear-gradient(to right,".concat(style.interpolation(0.2), ",").concat(style.interpolation(0.5), ",").concat(style.interpolation(0.9), ")"));
        };

        resetRegion();
        d3.select(".title .light").text(properties.title);
        d3.select(".desc").text(properties.desc);
        d3.select("svg-frame").append("svg").attr("viewBox", [150, -170, 730, 850]) // Global
        // .attr("viewBox", [200, 0, 500, 300]) // Atlantic
        .append("g").selectAll("path").data(topoData).join("path").attr("class", "clickable").attr("fill", function (d) {
          var nameCN = translationMap.get(d.properties.name);

          if (nameCN in data) {
            data[nameCN].used = true;
            data[nameCN]["computed"][method.properties.abbv] = formula(d.properties);
            return style.paint(formula(d.properties));
          }

          return "#222";
        }).attr("d", path).on("mouseover", function (d) {
          var nameCN = translationMap.get(d.properties.name);
          d3.select(".city-name").text(d.properties.name);

          if (nameCN in data) {
            d3.select(".rate").text(formula(d.properties).toFixed(method.properties.toFixed));
          } else {
            d3.select(".rate").text(0);
          }
        }).on("click", function (d) {
          var nameCN = translationMap.get(d.properties.name);

          if (nameCN in data) {
            var c = style.paint(formula(d.properties));
            d3.select("body").style("background-color", (0, _chromaJs.default)(c).alpha(0.75));
          } else {
            d3.select("body").style("background-color", "");
          }
        }).on("mouseout", function (d) {
          resetRegion();
        });

        for (var country in data) {
          if (!data[country].used) console.warn("Unused country", country);
        }
      };

      var methods = {
        confirmed: {
          formula: function formula(dProp) {
            return Number(data[translationMap.get(dProp.name)].conNum);
          },
          dataDefault: Number(raw.data.othertotal.certain),
          style: {
            paint: d3.scalePow().interpolate(function () {
              return d3.interpolateCividis;
            }).exponent(0.4).domain([-1000, 100000]),
            interpolation: d3.interpolateCividis
          },
          properties: {
            title: "Confirmed",
            abbv: "confirmed",
            desc: "Number of total infected people",
            toFixed: 0
          }
        },
        rConfirmed: {
          formula: function formula(dProp) {
            var res = Number(data[translationMap.get(dProp.name)].conNum) * 10000 / populationMap.get(dProp.name);
            if (isNaN(res)) console.warn("Missing population data", dProp.name);
            return res;
          },
          dataDefault: Number(raw.data.othertotal.certain) / 770000,
          style: {
            paint: d3.scalePow().interpolate(function () {
              return d3.interpolateInferno;
            }).exponent(0.4).domain([-1, 15]),
            interpolation: d3.interpolateInferno
          },
          properties: {
            title: "Confirmed Ratio",
            abbv: "r-confirmed",
            desc: "Confirmed infections every 10,000 people",
            toFixed: 4
          }
        },
        existing: {
          formula: function formula(dProp) {
            return Number(data[translationMap.get(dProp.name)].conNum) - Number(data[translationMap.get(dProp.name)].cureNum) - Number(data[translationMap.get(dProp.name)].deathNum);
          },
          dataDefault: Number(raw.data.othertotal.certain) - Number(raw.data.othertotal.die) - Number(raw.data.othertotal.recure),
          style: {
            paint: d3.scalePow().interpolate(function () {
              return d3.interpolateCividis;
            }).exponent(0.4).domain([-1000, 80000]),
            interpolation: d3.interpolateCividis
          },
          properties: {
            title: "Existing Confirmed",
            abbv: "existing",
            desc: "Number of existing infected people",
            toFixed: 0
          }
        },
        rExisting: {
          formula: function formula(dProp) {
            var existing = Number(data[translationMap.get(dProp.name)].conNum) - Number(data[translationMap.get(dProp.name)].cureNum) - Number(data[translationMap.get(dProp.name)].deathNum);
            var res = existing * 10000 / populationMap.get(dProp.name);
            return res;
          },
          dataDefault: (Number(raw.data.othertotal.certain) - Number(raw.data.othertotal.die) - Number(raw.data.othertotal.recure)) / 770000,
          style: {
            paint: d3.scalePow().interpolate(function () {
              return d3.interpolateViridis;
            }).exponent(0.4).domain([-0.01, 15]),
            interpolation: d3.interpolateViridis
          },
          properties: {
            title: "Existing Ratio",
            abbv: "r-existing",
            desc: "Existing confirmed infections every 10,000 people",
            toFixed: 4
          }
        },
        rDeath: {
          formula: function formula(dProp) {
            var existing = Number(data[translationMap.get(dProp.name)].deathNum);
            var res = existing * 10000 / populationMap.get(dProp.name);
            return res;
          },
          dataDefault: Number(raw.data.othertotal.die) / 770000,
          style: {
            paint: d3.scalePow().interpolate(function () {
              return d3.interpolateReds;
            }).exponent(0.3).domain([-0.01, 2]),
            interpolation: d3.interpolateReds
          },
          properties: {
            title: "Motality Rate",
            abbv: "r-death",
            desc: "Deaths every 10,000 people",
            toFixed: 4
          }
        },
        deathToConfirmed: {
          formula: function formula(dProp) {
            var existing = Number(data[translationMap.get(dProp.name)].deathNum / Number(data[translationMap.get(dProp.name)].conNum));
            var res = existing;
            return res;
          },
          dataDefault: Number(raw.data.othertotal.die) / 770000,
          style: {
            paint: d3.scalePow().interpolate(function () {
              return d3.interpolateReds;
            }).exponent(0.4).domain([-0.01, 1]),
            interpolation: d3.interpolateReds
          },
          properties: {
            title: "Death to Confirmed",
            abbv: "death-to-confirmed",
            desc: "Deaths / Confirmed Cases",
            toFixed: 4
          }
        }
      };

      var _loop = function _loop(method) {
        d3.select(".methods").append("input").attr("type", "radio").attr("name", "method-ratio").attr("id", method).on("click", function () {
          return render(methods[method]);
        });
        d3.select(".methods").append("label").attr("for", method).attr("class", "clickable").text(methods[method].properties.abbv);
      };

      for (var method in methods) {
        _loop(method);
      } // Fire the first render


      document.querySelector('label[for="rExisting"]').click();

      function sortObject(obj) {
        var arr = [];

        for (var prop in obj) {
          if (obj.hasOwnProperty(prop) && obj[prop].computed["r-existing"] !== undefined) {
            arr.push({
              key: prop,
              value: obj[prop].computed["r-existing"]
            });
          }
        }

        arr.sort(function (a, b) {
          return a.value - b.value;
        });
        return arr;
      }

      console.log(sortObject(data));
    });
  });
}).catch(function (ex) {
  console.log("parsing failed", ex);
});
},{"fetch-jsonp":"node_modules/fetch-jsonp/build/fetch-jsonp.js","chroma-js":"node_modules/chroma-js/chroma.js","./../data/countries-50m.json":"data/countries-50m.json","./../data/world-translate.csv":"data/world-translate.csv","./../data/population-wb.csv":"data/population-wb.csv"}],"../../../Users/cyphe/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60827" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../Users/cyphe/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/main.js"], null)
//# sourceMappingURL=/main.fb6bbcaf.js.map