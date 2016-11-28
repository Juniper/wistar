
/**
 * @class draw2d
 * global namespace declarations
 * 
 * @private
 */
var draw2d = 
{
    geo: {
    },

    io:{
        json:{},
        png:{},
        svg:{}  
    },
    
       
    storage:{
    },
    
    util : {
    	spline: {}
    },

    shape : {
    	basic:{},
        composite:{},
        arrow:{},
        node: {},
        note: {},
        diagram:{},
        flowchart:{},
        analog:{},
        icon:{},
        layout:{},
        pert:{},
        state:{},
        widget:{}
    },
    
    policy : {
        canvas:{},
        connection:{},
        line:{},
        port:{},
        figure:{}
    },
    
    command : {
    },

    decoration:{
    	connection:{}
    }, 
    
    layout: {
        connection :{},
	    anchor :{},
	    mesh :{},
	    locator: {}
    },
    
    
    ui :{
    	
    },
    
    isTouchDevice : (
            //Detect iPhone
            (navigator.platform.indexOf("iPhone") != -1) ||
            //Detect iPod
            (navigator.platform.indexOf("iPod") != -1)||
            //Detect iPad
            (navigator.platform.indexOf("iPad") != -1)
        )
    
};


if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(callback ) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    var t = Object(this), len = t.length >>> 0, k = 0, value;
    if (arguments.length == 2) {
      value = arguments[1];
    } else {
      while (k < len && ! k in t) {
        k++; 
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      value = t[k++];
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };
}
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k;
    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {
    var k;
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = +fromIndex || 0;
    if (Math.abs(n) === Infinity) {
      n = 0;
    }
    if (n >= len) {
      return -1;
    }
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}
if (!String.prototype.includes) {
  String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}
if(!Number.MAX_SAFE_INTEGER){
  Number.MAX_SAFE_INTEGER = 9007199254740991; 
}
if (!Object.prototype.watch) {
  Object.defineProperty(Object.prototype, "watch", {
    enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop, handler) {
      var
          oldval = this[prop]
          , newval = oldval
          , getter = function () {
            return newval;
          }
          , setter = function (val) {
            oldval = newval;
            return newval = handler.call(this, prop, oldval, val);
          }
          ;
      if (delete this[prop]) { 
        Object.defineProperty(this, prop, {
          get: getter
          , set: setter
          , enumerable: true
          , configurable: true
        });
      }
    }
  });
}
if (!Object.prototype.unwatch) {
  Object.defineProperty(Object.prototype, "unwatch", {
    enumerable: false
    , configurable: true
    , writable: false
    , value: function (prop) {
      var val = this[prop];
      delete this[prop]; 
      this[prop] = val;
    }
  });
}
draw2d.util.Base64 = {
    byteToCharMap_ :null,
    charToByteMap_: null,
    byteToCharMapWebSafe_ : null,
    charToByteMapWebSafe_ : null,
    ENCODED_VALS_BASE : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    ENCODED_VALS : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + '+/=',
    ENCODED_VALS_WEBSAFE :'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + '-_.',
    encodeByteArray: function(input, opt_webSafe) {
        draw2d.util.Base64.init();
        var byteToCharMap = opt_webSafe ?  draw2d.util.Base64.byteToCharMapWebSafe_ : draw2d.util.Base64.byteToCharMap_;
        var output = [];
        for (var i = 0; i < input.length; i += 3) {
          var byte1 = input[i];
          var haveByte2 = i + 1 < input.length;
          var byte2 = haveByte2 ? input[i + 1] : 0;
          var haveByte3 = i + 2 < input.length;
          var byte3 = haveByte3 ? input[i + 2] : 0;
          var outByte1 = byte1 >> 2;
          var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
          var outByte3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6);
          var outByte4 = byte3 & 0x3F;
          if (!haveByte3) {
            outByte4 = 64;
            if (!haveByte2) {
              outByte3 = 64;
            }
          }
          output.push(byteToCharMap[outByte1],
                      byteToCharMap[outByte2],
                      byteToCharMap[outByte3],
                      byteToCharMap[outByte4]);
        }
        return output.join('');
      },
     encode: function(input, opt_webSafe) {
        return draw2d.util.Base64.encodeByteArray( draw2d.util.Base64.stringToByteArray(input), opt_webSafe);
      },
      decode: function(input, opt_webSafe) {
        draw2d.util.Base64.init();
        var charToByteMap = opt_webSafe ?draw2d.util.Base64.charToByteMapWebSafe_ : draw2d.util.Base64.charToByteMap_;
        var output = [];
        for (var i = 0; i < input.length; ) {
          var byte1 = charToByteMap[input.charAt(i++)];
          var haveByte2 = i < input.length;
          var byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
          ++i;
          var haveByte3 = i < input.length;
          var byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 0;
          ++i;
          var haveByte4 = i < input.length;
          var byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 0;
          ++i;
          if (byte1 == null || byte2 == null ||
              byte3 == null || byte4 == null) {
            throw Error();
          }
          var outByte1 = (byte1 << 2) | (byte2 >> 4);
          output.push(outByte1);
          if (byte3 != 64) {
            var outByte2 = ((byte2 << 4) & 0xF0) | (byte3 >> 2);
            output.push(outByte2);
            if (byte4 != 64) {
              var outByte3 = ((byte3 << 6) & 0xC0) | byte4;
              output.push(outByte3);
            }
          }
        }
        return output;
     },
    stringToByteArray: function(str) {
      var output = [], p = 0;
      for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        while (c > 0xff) {
          output[p++] = c & 0xff;
          c >>= 8;
        }
        output[p++] = c;
      }
      return output;
    },
    init: function() {
        if (!draw2d.util.Base64.byteToCharMap_) {
            draw2d.util.Base64.byteToCharMap_ = {};
            draw2d.util.Base64.charToByteMap_ = {};
            draw2d.util.Base64.byteToCharMapWebSafe_ = {};
            draw2d.util.Base64.charToByteMapWebSafe_ = {};
          for (var i = 0; i < draw2d.util.Base64.ENCODED_VALS.length; i++) {
              draw2d.util.Base64.byteToCharMap_[i] = draw2d.util.Base64.ENCODED_VALS.charAt(i);
              draw2d.util.Base64.charToByteMap_[draw2d.util.Base64.byteToCharMap_[i]] = i;
              draw2d.util.Base64.byteToCharMapWebSafe_[i] = draw2d.util.Base64.ENCODED_VALS_WEBSAFE.charAt(i);
              draw2d.util.Base64.charToByteMapWebSafe_[draw2d.util.Base64.byteToCharMapWebSafe_[i]] = i;
          }
        }
    }
};
window.debug = (function(){
  var window = this,
    aps = Array.prototype.slice,
    con = window.console,
    that = {},
    callback_func,
    callback_force,
    log_level = 9,
    log_methods = [ 'error', 'warn', 'info', 'debug', 'log' ],
    pass_methods = 'assert clear count dir dirxml exception group groupCollapsed groupEnd profile profileEnd table time timeEnd trace'.split(' '),
    idx = pass_methods.length,
    logs = [];
  while ( --idx >= 0 ) {
    (function( method ){
      that[ method ] = function() {
        log_level !== 0 && con && con[ method ]
          && con[ method ].apply( con, arguments );
      };
    })( pass_methods[idx] );
  }
  idx = log_methods.length;
  while ( --idx >= 0 ) {
    (function( idx, level ){
      that[ level ] = function() {
        var args = aps.call( arguments ),
          log_arr = [ level ].concat( args );
        logs.push( log_arr );
        exec_callback( log_arr );
        if ( !con || !is_level( idx ) ) { return; }
        con.firebug ? con[ level ].apply( window, args )
          : con[ level ] ? con[ level ]( args )
          : con.log( args );
      };
    })( idx, log_methods[idx] );
  }
  function exec_callback( args ) {
    if ( callback_func && (callback_force || !con || !con.log) ) {
      callback_func.apply( window, args );
    }
  };
  that.setLevel = function( level ) {
    log_level = typeof level === 'number' ? level : 9;
  };
  function is_level( level ) {
    return log_level > 0
      ? log_level > level
      : log_methods.length + log_level <= level;
  };
  that.setCallback = function() {
    var args = aps.call( arguments ),
      max = logs.length,
      i = max;
    callback_func = args.shift() || null;
    callback_force = typeof args[0] === 'boolean' ? args.shift() : false;
    i -= typeof args[0] === 'number' ? args.shift() : max;
    while ( i < max ) {
      exec_callback( logs[i++] );
    }
  };
  return that;
})();
draw2d.util.Color = Class.extend({
    init: function( red, green, blue) {
      this.hashString = null;
      if(typeof red === "undefined" || red===null){
          this.hashString = "none";
      }
      else if(red instanceof draw2d.util.Color){
          if(red.hashString==="none"){
              this.hashString = "none";
          }
          else{
              this.red = red.red;
              this.green = red.green;
              this.blue = red.blue;
          }
      }
      else if(typeof red === "string")
      {
           if (red === "none") {
              this.hashString = "none";
           }
           else {
              var rgb = this.hex2rgb(red);
              this.red = rgb[0];
              this.green = rgb[1];
              this.blue = rgb[2];
          }
      }
      else if(typeof red === "object" && typeof red.red==="number")
      {
        this.red= red.red;
        this.green = red.green;
        this.blue = red.blue;
      }
      else if(red instanceof Array && red.length===3)
      {
        this.red= red[0];
        this.green = red[1];
        this.blue = red[2];
      }
      else if(typeof red === "object" && typeof red.length ==="number" && red.length===3)
      {
        this.red= red[0];
        this.green = red[1];
        this.blue = red[2];
      }
      else
      {
        this.red= parseInt(red);
        this.green = parseInt(green);
        this.blue = parseInt(blue);
      }
    },
    getHTMLStyle: function()
    {
      return "rgb("+this.red+","+this.green+","+this.blue+")";
    },
    getRed: function()
    {
      return this.red;
    },
    getGreen: function()
    {
      return this.green;
    },
    getBlue: function()
    {
      return this.blue;
    },
    getIdealTextColor: function()
    {
       var nThreshold = 105;
       var bgDelta = (this.red * 0.299) + (this.green * 0.587) + (this.blue * 0.114);
       return (255 - bgDelta < nThreshold) ? new  draw2d.util.Color(0,0,0) : new  draw2d.util.Color(255,255,255);
    },
    hex2rgb: function(hexcolor)
    {
      hexcolor = hexcolor.replace("#","");
      return(
             {0:parseInt(hexcolor.substr(0,2),16),
              1:parseInt(hexcolor.substr(2,2),16),
              2:parseInt(hexcolor.substr(4,2),16)}
             );
    },
    hex: function()
    { 
      return(this.int2hex(this.red)+this.int2hex(this.green)+this.int2hex(this.blue)); 
    },
    hash: function()
    {
        if(this.hashString===null){
            this.hashString= "#"+this.hex();
        }
        return this.hashString;
    },
    int2hex: function(v)
    {
      v=Math.round(Math.min(Math.max(0,v),255));
      return("0123456789ABCDEF".charAt((v-v%16)/16)+"0123456789ABCDEF".charAt(v%16));
    },
    darker: function(fraction)
    {
       if(this.hashString==="none")
           return this;
       var red   = parseInt(Math.round (this.getRed()   * (1.0 - fraction)));
       var green = parseInt(Math.round (this.getGreen() * (1.0 - fraction)));
       var blue  = parseInt(Math.round (this.getBlue()  * (1.0 - fraction)));
       if (red   < 0) red   = 0; else if (red   > 255) red   = 255;
       if (green < 0) green = 0; else if (green > 255) green = 255;
       if (blue  < 0) blue  = 0; else if (blue  > 255) blue  = 255;
       return new draw2d.util.Color(red, green, blue);
    },
    lighter: function( fraction)
    {
        if(this.hashString==="none")
            return this;
        var red   = parseInt(Math.round (this.getRed()   * (1.0 + fraction)));
        var green = parseInt(Math.round (this.getGreen() * (1.0 + fraction)));
        var blue  = parseInt(Math.round (this.getBlue()  * (1.0 + fraction)));
        if (red   < 0) red   = 0; else if (red   > 255) red   = 255;
        if (green < 0) green = 0; else if (green > 255) green = 255;
        if (blue  < 0) blue  = 0; else if (blue  > 255) blue  = 255;
        return new draw2d.util.Color(red, green, blue);
    },
    fadeTo: function(color, pc){
        var r= Math.floor(this.red+(pc*(color.red-this.red)) + .5);
        var g= Math.floor(this.green+(pc*(color.green-this.green)) + .5);
        var b= Math.floor(this.blue+(pc*(color.blue-this.blue)) + .5);
        return new draw2d.util.Color(r,g,b);   
    },
	equals: function( o)
	{
		if(!(o instanceof draw2d.util.Color)){
			return false;
		}
		return this.hash()==o.hash();
	}
});
draw2d.util.ArrayList = Class.extend({
    init: function( a) {
        if($.isArray(a)){
            this.data = a;
        }
        else{
        	this.data = [];
        }
    },
    clear: function()
    {
        this.data = [];
        return this;
    },
     reverse: function()
     {
        this.data.reverse();
        return this;
     },
     getSize: function()
     {
        return this.data.length;
     },
     isEmpty: function()
     {
        return this.getSize() === 0;
     },
     last: function()
     {
         return this.data[this.data.length - 1];
     },
     getLastElement: function(){return this.last();},
     asArray: function()
     {
       return this.data;
     },
     first: function()
     {
        if (this.data.length>0){
           return this.data[0];
        }
        return null;
     },
     getFirstElement: function(){return this.first();},
     get: function(i)
     {
        return this.data[i];
     },
     add: function(obj)
     {
        this.data.push(obj);
        return this;
     },
     grep: function(func){
         this.data = $.grep(this.data, func);
         return this;
     },
     find: function(func){
        var result= $.grep(this.data, func);
        if(result.length===0){
            return null;
        }
        return result[0];
     },
     map: function(func){
         this.data = $.map(this.data, func);
         return this;
     },
     unique: function(){
         this.data = $.unique(this.data);
         return this;
     },
     addAll: function(list, avoidDuplicates)
     {
        if(!(list instanceof draw2d.util.ArrayList)){
          throw "Unable to handle unknown object type in ArrayList.addAll";
        }
        this.data = this.data.concat(list.data);
        if(avoidDuplicates){
        	this.unique();
        }
        return this;
     },
     pop: function() {
         return this.removeElementAt(this.data.length - 1);
     },
     push: function( value) {
         this.add(value);
     },
     remove: function( obj)
     {
        var index = this.indexOf(obj);
        if(index>=0){
           return this.removeElementAt(index);
        }
        return null;
     },
     insertElementAt: function(obj, index)
     {
        this.data.splice(index,0,obj);
        return this;
     },
     removeElementAt: function(index)
     {
        var element = this.data[index];
        this.data.splice(index,1);
        return element;
     },
     removeAll: function(elements)
    {
        if (elements instanceof draw2d.util.ArrayList) {
            elements = elements.data;
        }
        if($.isArray(elements)){
            $.each(elements, $.proxy(function (i, e) {
                this.remove(e);
            }, this));
        }
        return this;
     },
     indexOf: function(obj)
     {
        return this.data.indexOf(obj);
     },
     contains: function(obj)
     {
        return this.indexOf(obj)!==-1;
     },
     sort: function(f)
     {
         if(typeof f ==="function"){
             this.data.sort(f);
         }
         else{
             this.data.sort(function(a,b) {
            	  if (a[f] < b[f])
            	    return -1;
            	  if (a[f] > b[f])
            	    return 1;
            	  return 0;
            });
        }
        return this;
     },
     clone: function(deep)
     {
        var newVector = new draw2d.util.ArrayList();
        if (deep) {
            for ( var i = 0; i < this.data.length; i++) {
                newVector.data.push(this.data[i].clone());
            }
        }
        else {
            newVector.data = this.data.slice(0);
        }
        return newVector;
     },
      each: function(func, reverse)
      {
         if(typeof reverse !=="undefined" && reverse===true){
             for (var i=this.data.length-1; i>=0; i--) {
                 if(func(i, this.data[i])===false)
                     break;
             }
          }
         else{
             for (var i=0; i<this.data.length; i++) {
                if(func(i, this.data[i])===false)
                    break;
             }
         }
          return this;
      },
     overwriteElementAt: function(obj, index)
     {
        this.data[index] = obj;
        return this;
     },
     getPersistentAttributes: function()
     {
        return {data: this.data};
     },
     setPersistentAttributes: function(memento)
     {
         this.data = memento.data;
     }
});
draw2d.util.ArrayList.EMPTY_LIST = new draw2d.util.ArrayList();
Raphael.fn.polygon = function(pointString) {
  var poly  = ['M'];
  var point = pointString.split(' ');
  for(var i=0; i < point.length; i++) {
     var c = point[i].split(',');
     for(var j=0; j < c.length; j++) {
        var d = parseFloat(c[j]);
        if (!isNaN(d))
          poly.push(d);
     };
     if (i == 0)
      poly.push('L');
  }
  poly.push('Z');
  return this.path(poly);
};
draw2d.util.JSON = {
        set: function(data, path, value) {
          if(!path || path===''){ 
              return;
          }
          var re = /[\w-]+|\[\]|([^\[[\w]\]]|["'](.*?)['"])/g;
          var pathList = path.match(re);
          var parent = data;
          var parentKey;
          var grandParent = null;
          var grandParentKey = null;
          var addObj = function(obj, key, data) {
            if(key === '[]') {
              obj.push(data);
            } else {
              obj[key] = data;
            }
          };
          while(pathList.length > 0) {
            parentKey = pathList.shift().replace(/["']/g, '');
            // Number, treat it as an array
            if (!isNaN(+parentKey) || parentKey === "[]") {
              if($.type(parent)!=="array" ) {
                parent = [];
                addObj(grandParent, grandParentKey, parent);
              }
            // String, treat it as a key
            } 
            else if ($.type(parentKey)==="string") {
              if(!$.isPlainObject(parent)) {
                parent = {};
                addObj(grandParent, grandParentKey, parent);
              }
            }
            // Next
            grandParent = parent;
            grandParentKey = parentKey;
            parent = parent[parentKey];
          }
          addObj(grandParent, grandParentKey, value);
        },
        /**
         * @method
         * Returns the value defined by the path passed in
         *
         * @param  {Object} data the JSON data object
         * @param  {String} path string leading to a desired value
         */
        get: function(data, path) {
          var regex = /[\w-]+|\[\]|([^\[[\w]\]]|["'](.*?)['"])/g;
          //check if path is truthy
          if (!path){
              return undefined;
          }
          //parse path on dots and brackets
          var paths = path.match(regex);
          //step through data object until all keys in path have been processed
          while (data !== null && paths.length > 0) {
            if(data.propertyIsEnumerable(paths[0].replace(/"/g, ''))){
              data = data[paths.shift().replace(/"/g, '')];
            }
            else{
              return undefined;
            }
          }
          return data;
        },
        diff: function(obj1, obj2) {
            var result = {};
            for(key in obj1) {
            	var v1 = obj1[key];
            	var v2 = obj2[key];
                if(v1 !== v2) {
                	if(v1.equals ){
                		if(!v1.equals(v2)){
                			result[key] = obj1[key];
                		}
                	}
                	else{
            			result[key] = obj1[key];
                	}
                }
            }
            return result;
        },
        flatDiff: function(obj1, obj2) {
            var result = {};
            for(key in obj1) {
                if(obj1[key] !== obj2[key]) {
                    result[key] = obj1[key];
                }
            }
            return result;
        },
        ensureDefault:function( json, attribute, value)
        {
            if (!json.hasOwnProperty(attribute)) {
                json[attribute] = value;
            }
        }
};
draw2d.util.UUID=function()
{
};
draw2d.util.UUID.create=function()
{
  var segment=function() 
  {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (segment()+segment()+"-"+segment()+"-"+segment()+"-"+segment()+"-"+segment()+segment()+segment());
};
draw2d.util.spline.Spline = Class.extend({
    NAME : "draw2d.util.spline.Spline",
    init: function()
    {
    },
    generate: function(controlPoints, parts){
        throw "inherit classes must implement the method 'draw2d.util.spline.Spline.generate()'";
    }
});
draw2d.util.spline.CubicSpline = draw2d.util.spline.Spline.extend(
{
    NAME : "draw2d.util.spline.CubicSpline",
    init: function()
    {
        this._super();
    },
    generate: function(controlPoints, parts)
    {
        var cp = new draw2d.util.ArrayList();
        cp.add(controlPoints.get(0));
        cp.addAll(controlPoints);
        cp.add(controlPoints.get(controlPoints.getSize()-1));
      var n = cp.getSize();
      var spline = new draw2d.util.ArrayList();
      spline.add(controlPoints.get(0));
      spline.add( this.p(1, 0, cp) );
      for (var i = 1; i < n - 2; i++) {
        for (var j = 1; j <= parts; j++) {
          spline.add( this.p(i, j / parts, cp));
        }
      }
      spline.add(controlPoints.get(controlPoints.getSize()-1));
      return spline;      
    },
      p: function( i,  t,  cp)
      {
        var x = 0.0;
        var y = 0.0;
        var k = i-1;
        for (var j = -2; j <= 1; j++) {
          var b = this.blend (j, t);
          var p = cp.get(k++);
          x += b * p.x;
          y += b * p.y;
        }
       return new draw2d.geo.Point(x, y);
      },
      blend: function(i, t)
      {
        if (i === -2)
            return (((-t + 3) * t - 3) * t + 1) / 6;
        else if (i === -1)
            return (((3 * t - 6) * t) * t + 4) / 6;
        else if (i === 0)
            return (((-3 * t + 3) * t + 3) * t + 1) / 6;
        return (t * t * t) / 6;
      }
});
draw2d.util.spline.CatmullRomSpline = draw2d.util.spline.CubicSpline.extend(
{
    NAME : "draw2d.util.spline.CatmullRomSpline",
    init: function()
    {
        this._super();
    },
    blend: function(i, t) {
        if (i == -2)
            return ((-t + 2) * t - 1) * t / 2;
        else if (i == -1)
            return (((3 * t - 5) * t) * t + 2) / 2;
        else if (i == 0)
            return ((-3 * t + 4) * t + 1) * t / 2;
        else
            return ((t - 1) * t * t) / 2;
    }
});
draw2d.util.spline.BezierSpline = draw2d.util.spline.Spline.extend(
{
    NAME : "draw2d.util.spline.BezierSpline",
    init: function()
    {
        this._super();
    },
    generate: function(controlPoints, parts)
    {
      var n = controlPoints.getSize();
      var spline = new draw2d.util.ArrayList();
      spline.add(this.p(0, 0, controlPoints));
      for (var i = 0; i < n - 3; i += 3) {
        for (var j = 1; j <= parts; j++) {
           spline.add(this.p (i, j /  parts, controlPoints));
        }
      }
      return spline;      
    },
    p: function( i,  t,  cp)
    {
      var x = 0.0;
      var y = 0.0;
      var k = i;
      for (var j = 0; j <= 3; j++) {
        var b = this.blend (j, t);
        var p = cp.get(k++);
        x += b * p.x;
        y += b * p.y;
     }
      return new draw2d.geo.Point( x, y);
    },
    blend: function ( i,  t)
    {
      if      (i == 0) return (1 - t) * (1 - t) * (1 - t);
      else if (i == 1) return 3 * t * (1 - t) * (1 - t);
      else if (i == 2) return 3 * t * t * (1 - t);
      else             return t * t * t;
    }
});
draw2d.geo.PositionConstants=function()
{
};
draw2d.geo.PositionConstants.NORTH =  1;
draw2d.geo.PositionConstants.SOUTH =  4;
draw2d.geo.PositionConstants.WEST  =  8;
draw2d.geo.PositionConstants.EAST  = 16;
draw2d.geo.Point = Class.extend({
    NAME : "draw2d.geo.Point",
    init: function(x, y)
    {
        if(x instanceof draw2d.geo.Point){
            this.x = x.x;
            this.y = x.y;
        }
        else if($.isNumeric(x.x) && $.isNumeric(x.y)){
            this.x = x.x;
            this.y = x.y;
        }
        else{
            this.x = x;
            this.y = y;
        }
        this.bx = null;
        this.by = null;
        this.bw = null;
        this.bh = null;
    },
    setBoundary: function(bx, by, bw, bh)
    {
        if(bx instanceof draw2d.geo.Rectangle){
            this.bx = bx.x;
            this.by = bx.y;
            this.bw = bx.w;
            this.bh = bx.h;
        }else
        {
            this.bx = bx;
            this.by = by;
            this.bw = bw;
            this.bh = bh;
        }
        this.adjustBoundary();
        return this;
    },
    adjustBoundary: function()
    {
        if(this.bx===null){
            return;
        }
        this.x = Math.min(Math.max(this.bx, this.x), this.bw);
        this.y = Math.min(Math.max(this.by, this.y), this.bh);
        return this;
    },
    translate: function( dx,  dy)
    {
      this.x +=dx;
      this.y +=dy;
      this.adjustBoundary();
      return this;
    },
    getX: function()
    {
        return this.x;
    },
    getY: function()
    {
        return this.y;
    },
    setX: function(x)
    {
        this.x = x;
        this.adjustBoundary();
        return this;
    },
    setY: function(y)
    {
        this.y = y;
        this.adjustBoundary();
        return this;
    },
    setPosition: function(x,y)
    {
        if(x instanceof draw2d.geo.Point){
     	   this.x=x.x;
    	   this.y=x.y;
    	}
    	else{
    	   this.x=x;
    	   this.y=y;
    	}
        this.adjustBoundary();
        return this;
    },
    getPosition: function(p)
    {
        var dx = p.x - this.x;
        var dy = p.y - this.y;
        if (Math.abs(dx) > Math.abs(dy))
        {
            if (dx < 0)
                return draw2d.geo.PositionConstants.WEST;
            return draw2d.geo.PositionConstants.EAST;
        }
        if (dy < 0)
            return draw2d.geo.PositionConstants.NORTH;
        return draw2d.geo.PositionConstants.SOUTH;
    },
    equals: function(p)
    {
        return this.x === p.x && this.y === p.y;
    },
    distance: function(other)
    {
        return Math.sqrt((this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y));
    },
    getDistance: function(other){return this.distance(other);},
    length: function()
    {
        return Math.sqrt(this.x  * this.x  + this.y * this.y);
    },
    translated: function(x,y)
    {
        var other = new draw2d.geo.Point(x,y);
        return new draw2d.geo.Point(this.x + other.x, this.y + other.y);
    },
    scale: function(factor)
    {
        this.x *= factor;
        this.y *= factor;
        this.adjustBoundary();
        return this;
    },
    scaled: function(factor)
    {
        return new draw2d.geo.Point(this.x * factor, this.y * factor);
    },
    getScaled: function(factor){ return this.scaled(factor);},
    getPersistentAttributes: function()
    {
        return {
            x : this.x,
            y : this.y
        };
    },
    setPersistentAttributes: function(memento)
    {
        this.x    = memento.x;
        this.y    = memento.y;
    },
    subtract: function(that)
    {
    	return new draw2d.geo.Point(this.x-that.x,this.y-that.y);
    },
    dot: function(that)
    {
    	return this.x*that.x+this.y*that.y;
    },
    cross: function(that)
    {
    	return this.x*that.y-this.y*that.x;
    },
    lerp: function(that,t)
    {
    	return new draw2d.geo.Point(this.x+(that.x-this.x)*t,this.y+(that.y-this.y)*t);
    },
    clone: function()
    {
       return new draw2d.geo.Point(this.x,this.y);
    }
});
draw2d.geo.Rectangle = draw2d.geo.Point.extend({
    NAME : "draw2d.geo.Rectangle",
    init: function( x, y,  w, h)
    {
    	if(x instanceof draw2d.geo.Rectangle){
    		y= x.y;
    		w = x.w;
    		h = x.h;
    		x = x.x;
    	}
    	else if(typeof x.x ==="number" && typeof x.y ==="number"){
    		y= x.y;
    		w = x.w | x.width;
    		h = x.h | x.height;
    		x = x.x;
    	}
		else if(typeof x.top ==="number" && typeof x.left ==="number"){
			y=  x.top;
			w = x.w | x.width;
			h = x.h | x.height;
			x = x.left;
		}
    	this._super(x,y);
        this.w = w;
        this.h = h;
    },
    adjustBoundary: function()
    {
        if(this.bx===null){
            return;
        }
        this.x = Math.min(Math.max(this.bx, this.x), this.bw-this.w);
        this.y = Math.min(Math.max(this.by, this.y), this.bh-this.h);
        this.w = Math.min(this.w, this.bw);
        this.h = Math.min(this.h, this.bh);
    },
	resize: function(dw,  dh)
	{
	  this.w +=dw;
	  this.h +=dh;
      this.adjustBoundary();
	  return this;
	},
    scale: function( dw, dh)
    {
      this.w +=(dw);
      this.h +=(dh);
      this.x -=(dw/2);
      this.y -=(dh/2);
      this.adjustBoundary();
      return this;
    },
	translate: function(x,y)
	{
		var other = new draw2d.geo.Point(x,y);
		this.x += other.x;
		this.y += other.y;
		this.adjustBoundary();
		return this;
	},
	translated: function(x,y)
	{
		var other = new draw2d.geo.Point(x,y);
		return new draw2d.geo.Rectangle(this.x + other.x, this.y + other.y, this.w, this.h);
	},
	setBounds: function( rect)
	{
	    this.setPosition(rect.x,rect.y);
	    this.w = rect.w;
	    this.h = rect.h;
  	   return this;
	},
	isEmpty: function()
	{
	  return this.w <= 0 || this.h <= 0;
	},
	getWidth: function()
	{
	  return this.w;
	},
	setWidth: function(w)
    {
      this.w = w;
      this.adjustBoundary();
      return this;
	},
	getHeight: function()
	{
	  return this.h;
	},
    setHeight: function(h)
    {
      this.h = h;
      this.adjustBoundary();
      return this;
    },	
    getLeft: function()
    {
      return this.x;
    },
	getRight: function()
	{
	  return this.x+this.w;
	},
    getTop: function()
    {
      return this.y;
    },
	getBottom: function()
	{
	  return this.y+this.h;
	},
	getTopLeft: function()
	{
	  return new draw2d.geo.Point(this.x,this.y);
	},
    getTopCenter: function()
    {
      return new draw2d.geo.Point(this.x+(this.w/2),this.y);
    },
	getTopRight: function()
	{
	  return new draw2d.geo.Point(this.x+this.w,this.y);
	},
	getCenterLeft: function()
	{
		return new draw2d.geo.Point(this.x,this.y+(this.h/2));
	},
	getBottomLeft: function()
	{
	  return new draw2d.geo.Point(this.x,this.y+this.h);
	},
    getBottomCenter: function()
    {
      return new draw2d.geo.Point(this.x+(this.w/2),this.y+this.h);
    },
	getCenter: function()
	{
	  return new draw2d.geo.Point(this.x+this.w/2,this.y+this.h/2);
	},
	getBottomRight: function()
	{
	  return new draw2d.geo.Point(this.x+this.w,this.y+this.h);
	},
	getVertices: function()
	{
	    var result = new draw2d.util.ArrayList();
        result.add(this.getTopLeft());
        result.add(this.getTopRight());
        result.add(this.getBottomRight());
        result.add(this.getBottomLeft());
        return result;
	},
	moveInside: function(rect)
    {
	    var newRect = new draw2d.geo.Rectangle(rect.x,rect.y,rect.w,rect.h);
	    newRect.x= Math.max(newRect.x,this.x);
	    newRect.y= Math.max(newRect.y,this.y);
	    if(newRect.w<this.w){
	        newRect.x = Math.min(newRect.x+newRect.w, this.x+this.w)-newRect.w; 
	    }
	    else{
	        newRect.x = this.x;
	    }
        if(newRect.h<this.h){
            newRect.y = Math.min(newRect.y+newRect.h, this.y+this.h)-newRect.h; 
        }
        else{
            newRect.y = this.y;
        }
        return newRect;
	},
	getDistance: function (pointOrRectangle)
    {
		var cx = this.x;
		var cy = this.y;
		var cw = this.w;
		var ch = this.h;
		var ox = pointOrRectangle.getX();
		var oy = pointOrRectangle.getY();
		var ow = 1;
		var oh = 1;
		if(pointOrRectangle instanceof draw2d.geo.Rectangle){
			ow = pointOrRectangle.getWidth();
			oh = pointOrRectangle.getHeight();
		}
		var oct=9;
		if(cx + cw <= ox){
			if((cy + ch) <= oy){
				oct = 0;
			}
			else if(cy >= (oy + oh)){
				oct = 6;
			}
			else{
				oct = 7;
			}
	    }
		else if(cx >= ox + ow){
			if(cy + ch <= oy){
				oct = 2;
			}
			else if(cy >= oy + oh){
				oct = 4;
			}
			else{
				oct = 3;
			}
		}
		else if(cy + ch <= oy){
			oct = 1;
		}
		else if(cy >= oy + oh){
			oct = 5;
		}
		else{
			return 0;
		}
		switch( oct){
			case 0:
				cx = (cx + cw) - ox;
				cy = (cy + ch) - oy;
				return -(cx + cy) ;
			case 1:
				return -((cy + ch) - oy);
			case 2:
				cx = (ox + ow) - cx;
				cy = (cy + ch) - oy;
				return -(cx + cy);
			case 3:
				return -((ox + ow) - cx);
			case 4:
				cx = (ox + ow) - cx;
				cy = (oy + oh) - cy;
				return -(cx + cy);
			case 5:
				return -((oy + oh) - cy);
			case 6:
				cx = (cx + cw) - ox;
				cy = (oy + oh) - cy;
				return -(cx + cy);
			case 7:
				return -((cx + cw) - ox);
		}
		throw "Unknown data type of parameter for distance calculation in draw2d.geo.Rectangle.getDistance(..)";
	},
    determineOctant: function( r2)
    {
        var HISTERESE= 3; 
        var ox = this.x+HISTERESE;
        var oy = this.y+HISTERESE;
        var ow = this.w-(HISTERESE*2);
        var oh = this.h-(HISTERESE*2);
        var cx = r2.x;
        var cy = r2.y;
        var cw = 2;
        var ch = 2;
        if(r2 instanceof draw2d.geo.Rectangle){
            cw = r2.w;
            ch = r2.h;
        }
        var oct =0;
        if(cx + cw <= ox){
            if((cy + ch) <= oy){
                oct = 0;
            }
            else if(cy >= (oy + oh)){
                oct = 6;
            }
            else{
                oct = 7;
            }
        }
        else if(cx >= ox + ow){
            if(cy + ch <= oy){
                oct = 2;
            }
            else if(cy >= oy + oh){
                oct = 4;
            }
            else{
                oct = 3;
            }
        }
        else if(cy + ch <= oy){
            oct = 1;
        }
        else if(cy >= oy + oh){
            oct = 5;
        }
        else{
            oct= 8;
        }
        return oct;
    },
    getDirection: function(other)
    {
        var current = this.getTopLeft();
        switch(this.determineOctant(other)){
            case 0:
                if((current.x-other.x)<(current.y-other.y))
                    return draw2d.geo.Rectangle.DIRECTION_UP;
                return draw2d.geo.Rectangle.DIRECTION_LEFT;
            case 1:
                return draw2d.geo.Rectangle.DIRECTION_UP;
            case 2:
                current = this.getTopRight();
                if((other.x-current.x)<(current.y-other.y))
                    return draw2d.geo.Rectangle.DIRECTION_UP;
                return draw2d.geo.Rectangle.DIRECTION_RIGHT;
            case 3:
                return draw2d.geo.Rectangle.DIRECTION_RIGHT;
            case 4:
                current = this.getBottomRight();
                if((other.x-current.x)<(other.y-current.y))
                    return draw2d.geo.Rectangle.DIRECTION_DOWN;
                return draw2d.geo.Rectangle.DIRECTION_RIGHT;
            case 5:
                return draw2d.geo.Rectangle.DIRECTION_DOWN;
            case 6:
                current = this.getBottomLeft();
                if((current.x-other.x)<(other.y-current.y))
                    return draw2d.geo.Rectangle.DIRECTION_DOWN;
                return draw2d.geo.Rectangle.DIRECTION_LEFT;
            case 7:
                return draw2d.geo.Rectangle.DIRECTION_LEFT;
            case 8: 
                if(other.y>this.y){
                    return draw2d.geo.Rectangle.DIRECTION_DOWN;
                }
                return draw2d.geo.Rectangle.DIRECTION_UP;
        }
        return draw2d.geo.Rectangle.DIRECTION_UP;
    },
	equals: function( o)
	{
	  return this.x==o.x && this.y==o.y && this.w==o.w && this.h==o.h;
	},
    hitTest : function ( iX , iY)
    {
    	if(iX instanceof draw2d.geo.Point){
    		iY = iX.y;
    		iX = iX.x;
    	}
        var iX2 = this.x + this.getWidth();
        var iY2 = this.y + this.getHeight();
        return (iX >= this.x && iX <= iX2 && iY >= this.y && iY <= iY2);
    },
    isInside : function ( rect)
    {
       	return    rect.hitTest(this.getTopLeft()) 
    	       && rect.hitTest(this.getTopRight())
    	       && rect.hitTest(this.getBottomLeft()) 
    	       && rect.hitTest(this.getBottomRight());
    },
    contains : function ( rect)
    {
        return    this.hitTest(rect.getTopLeft()) 
               && this.hitTest(rect.getTopRight())
               && this.hitTest(rect.getBottomLeft()) 
               && this.hitTest(rect.getBottomRight());
    },
    intersects: function (rect)
    {
        var x11 = rect.x,
            y11 = rect.y,
            x12 = rect.x + rect.w,
            y12 = rect.y + rect.h,
            x21 = this.x,
            y21 = this.y,
            x22 = this.x + this.w,
            y22 = this.y + this.h;
        var x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
        var y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
        return x_overlap*y_overlap!==0;
    },
    merge: function(rect)
    {
        var r= Math.max(rect.getRight(), this.getRight());
        var b = Math.max(rect.getBottom(), this.getBottom());
        this.setPosition(Math.min(this.x,rect.x),Math.min(this.y,rect.y));
        this.w =r-this.x;
        this.h = b-this.y;
        return this;
    },
    intersectionWithLine: function(start, end)
    {
        var result = new draw2d.util.ArrayList();
        var v = this.getVertices();
        v.add(v.first());
        var p1 = v.first();
        var p2 = null;
        for(var i=1; i<5;i++){
            p2 = v.get(i);
            p1 = draw2d.shape.basic.Line.intersection(start,end,p1,p2);
            if(p1!==null){
                result.add(p1);
            }
            p1 = p2;
        }
        return result;
    },
	clone: function()
	{
		return new draw2d.geo.Rectangle(this.x, this.y, this.w, this.h);
	},
    toJSON: function()
    {
        return  { 
              width : this.w,
              height: this.h,
              x     : this.x,
              y     : this.y
          };
      }
});
draw2d.geo.Rectangle.DIRECTION_UP    =0;
draw2d.geo.Rectangle.DIRECTION_RIGHT =1;
draw2d.geo.Rectangle.DIRECTION_DOWN  =2;
draw2d.geo.Rectangle.DIRECTION_LEFT  =3;
draw2d.geo.Util=
{
    insetPoint: function(start, end, distanceFromStart){
        if(start.equals(end)){
            return start;
        }
        var vx = start.x-end.x;
        var vy = start.y-end.y;
        var length = Math.sqrt(vx*vx + vy*vy);
        var localDistance = Math.min(length/2,distanceFromStart);
        return {x: end.x + vx/length * (length - localDistance),
                y: end.y + vy/length * (length - localDistance)};
    }
};
draw2d.geo.Ray = draw2d.geo.Point.extend({
    NAME : "draw2d.geo.Ray",
    init: function( x, y)
    {
        this._super(x,y);
    },
    isHorizontal: function()
    {
       return this.x != 0;
    },
    similarity: function( otherRay)
    {
       return Math.abs(this.dot(otherRay));
    },
    getAveraged: function( otherRay)
    {
        return new draw2d.geo.Ray((this.x + otherRay.x) / 2, (this.y + otherRay.y) / 2);
    }
});
draw2d.geo.Line = {
    inverseLerp: function( X1, Y1,  X2,  Y2, px, py)
    {
        var nenner = Math.abs(X2-X1);
        var zaehler= Math.abs(X2-px);
        if(nenner===0){
            nenner = Math.abs(Y2-Y1);
            zaehler= Math.abs(Y2-py);
            if(nenner==0){
                return 1;
            }
        }
        return zaehler/nenner;
    },
    pointProjection: function( X1, Y1,  X2,  Y2, px, py)
    {
        var r = new draw2d.geo.Point(0,0);
        if (X1 == X2 && Y1 == Y2) X1 -= 0.00001;
        var U = ((px - X1) * (X2 - X1)) + ((py - Y1) * (Y2 - Y1));
        var Udenom = Math.pow(X2 - X1, 2) + Math.pow(Y2 - Y1, 2);
        U /= Udenom;
        r.x = X1 + (U * (X2 - X1));
        r.y = Y1 + (U * (Y2 - Y1));
        var minx, maxx, miny, maxy;
        minx = Math.min(X1, X2);
        maxx = Math.max(X1, X2);
        miny = Math.min(Y1, Y2);
        maxy = Math.max(Y1, Y2);
        var isValid = (r.x >= minx && r.x <= maxx) && (r.y >= miny && r.y <= maxy);
        return isValid ? r : null;
    },
    distance : function( X1, Y1,  X2,  Y2, px, py)
    {
        X2 -= X1;
        Y2 -= Y1;
        px -= X1;
        py -= Y1;
        var dotprod = px * X2 + py * Y2;
        var projlenSq;
        if (dotprod <= 0.0) {
            projlenSq = 0.0;
        } else {
            px = X2 - px;
            py = Y2 - py;
            dotprod = px * X2 + py * Y2;
            if (dotprod <= 0.0) {
                projlenSq = 0.0;
            } else {
                projlenSq = dotprod * dotprod / (X2 * X2 + Y2 * Y2);
            }
        }
        var lenSq = px * px + py * py - projlenSq;
        if (lenSq < 0) {
            lenSq = 0;
        }
        return Math.sqrt(lenSq);
    }
};
draw2d.command.CommandType = Class.extend({
    NAME : "draw2d.command.CommandType",
    init: function( policy)
    {
       this.policy = policy;
    },
    getPolicy: function()
    {
       return this.policy;
    }
});
draw2d.command.CommandType.DELETE               = "DELETE";
draw2d.command.CommandType.MOVE                 = "MOVE";
draw2d.command.CommandType.CONNECT              = "CONNECT";
draw2d.command.CommandType.MOVE_BASEPOINT       = "MOVE_BASEPOINT";
draw2d.command.CommandType.MOVE_VERTEX          = "MOVE_VERTEX";
draw2d.command.CommandType.MOVE_VERTICES        = "MOVE_VERTICES";
draw2d.command.CommandType.MOVE_GHOST_VERTEX    = "MOVE_GHOST_VERTEX";
draw2d.command.CommandType.RESIZE               = "RESIZE";
draw2d.command.CommandType.RESET                = "RESET";
draw2d.command.CommandType.ROTATE               = "ROTATE";
draw2d.command.Command = Class.extend({
    NAME : "draw2d.command.Command", 
    init: function( label)
    {
        this.label = label;
    },
    getLabel: function()
    {
       return this.label;
    },
    canExecute: function()
    {
      return true;
    },
    execute: function()
    {
    },
    cancel: function()
    {
    },
    undo: function()
    {
    },
    redo: function()
    {
    }
});
draw2d.command.CommandCollection = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandCollection", 
    init: function(commandLabel)
     {
       this._super((typeof commandLabel === 'undefined') ? draw2d.Configuration.i18n.command.collection : commandLabel);
       this.commands = new draw2d.util.ArrayList();
    },
    getLabel: function()
    {
        if(this.commands.getSize()===1){
           return this.commands.first().getLabel();
        }
        if(this.commands.getSize()>1){
            var labels = this.commands.clone().map(function(e){
                return e.getLabel();
            });
            labels.unique();
            if(labels.getSize()===1){
                return labels.first();
            }
        }
        return this._super();
    },
    add: function(command)
    {
    	this.commands.add(command);
    },
    canExecute: function()
    {
        var canExec = false;
        this.commands.each(function(i,cmd){
            canExec = canExec|| cmd.canExecute();
        });
        return canExec;
    },
    execute: function()
    {
    	this.commands.each(function(i,cmd){
    	    cmd.execute();
    	});
    },
    redo: function()
    {
        this.commands.each(function(i,cmd){
            cmd.redo();
        });
    },
    undo: function()
    {
        this.commands.reverse();
        this.commands.each(function(i,cmd){
            cmd.undo();
        });
        this.commands.reverse();
    }
});
draw2d.command.CommandStack = Class.extend({
    NAME : "draw2d.command.CommandStack", 
    init: function( )
    {
       this.undostack = [];
       this.redostack = [];
       this.maxundo = 50;
       this.transactionCommand = null;
       this.eventListeners = new draw2d.util.ArrayList();
    },
    setUndoLimit: function( count)
    {
      this.maxundo = count;
      return this;
    },
    markSaveLocation: function()
    {
       this.undostack = [];
       this.redostack = [];
       this.notifyListeners(new draw2d.command.Command(), draw2d.command.CommandStack.POST_EXECUTE);
       return this;
    },
    execute: function(command)
    {
        if(typeof command === "undefined")
            throw "Missing parameter [command] for method call CommandStack.execute";
       if(command===null)
          return; 
       if(command.canExecute()===false)
          return;
       if(this.transactionCommand!==null){
           this.transactionCommand.add(command);
           return;
       }
       this.notifyListeners(command, draw2d.command.CommandStack.PRE_EXECUTE);
       this.undostack.push(command);
       command.execute();
       this.redostack = [];
       if(this.undostack.length > this.maxundo)
       {
          this.undostack = this.undostack.slice(this.undostack.length-this.maxundo);
       }
       this.notifyListeners(command, draw2d.command.CommandStack.POST_EXECUTE);
       return this;
    },
    startTransaction: function(commandLabel)
    {
        this.transactionCommand = new draw2d.command.CommandCollection(commandLabel);
        return this;
    },
    commitTransaction: function()
    {
        if(this.transactionCommand===null){
            return;
        }
        var cmd = this.transactionCommand;
        this.transactionCommand =null;
        if(cmd.commands.getSize()===1){
        	this.execute(cmd.commands.first());
        }
        else{
        	this.execute(cmd);
        }
        return this;
    },
    undo: function()
    {
       var command = this.undostack.pop();
       if(command)
       {
          this.notifyListeners(command, draw2d.command.CommandStack.PRE_UNDO);
          this.redostack.push(command);
          command.undo();
          this.notifyListeners(command, draw2d.command.CommandStack.POST_UNDO);
       }
       return this;
    },
    redo: function()
    {
       var command = this.redostack.pop();
       if(command){
          this.notifyListeners(command, draw2d.command.CommandStack.PRE_REDO);
          this.undostack.push(command);
          command.redo();
          this.notifyListeners(command, draw2d.command.CommandStack.POST_REDO);
       }
       return this;
    },
    getRedoLabel: function()
    {
       if(this.redostack.length===0)
         return "";
       var command = this.redostack[this.redostack.length-1];
       if(command){
          return command.getLabel();
       }
       return "";
    },
    getUndoLabel: function()
    {
       if(this.undostack.length===0)
         return "";
       var command = this.undostack[this.undostack.length-1];
       if(command){
          return command.getLabel();
       }
       return "";
    },
    canRedo: function()
    {
       return this.redostack.length>0;
    },
    canUndo: function()
    {
       return this.undostack.length>0;
    },
    addEventListener: function( listener)
    {
        if(listener instanceof draw2d.command.CommandStackEventListener){
          this.eventListeners.add(listener);
        }
        else if(typeof listener.stackChanged ==="function"){
          this.eventListeners.add(listener);
        }
        else if(typeof listener === "function"){
          this.eventListeners.add( {  stackChanged : listener });
        }
        else{
          throw "Object doesn't implement required callback interface [draw2d.command.CommandStackListener]";
        }
        return this;
    },
    removeEventListener: function(listener)
    {
        var size = this.eventListeners.getSize();
        for (var i = 0; i < size; i++){
            var entry = this.eventListeners.get(i);
            if(entry ===listener || entry.stackChanged === listener){
                this.eventListeners.remove(entry);
                return;
            }
         }
        return this;
    },
    notifyListeners: function(command,  state)
    {
      var event = new draw2d.command.CommandStackEvent(this, command, state);
      var size = this.eventListeners.getSize();
      for (var i = 0; i < size; i++){
         this.eventListeners.get(i).stackChanged(event);
      }
    }
});
draw2d.command.CommandStack.PRE_EXECUTE=1;
draw2d.command.CommandStack.PRE_REDO=2;
draw2d.command.CommandStack.PRE_UNDO=4;
draw2d.command.CommandStack.POST_EXECUTE=8;
draw2d.command.CommandStack.POST_REDO=16;
draw2d.command.CommandStack.POST_UNDO=32;
draw2d.command.CommandStack.POST_INIT=64;
draw2d.command.CommandStack.POST_MASK = draw2d.command.CommandStack.POST_EXECUTE | draw2d.command.CommandStack.POST_UNDO | draw2d.command.CommandStack.POST_REDO;
draw2d.command.CommandStack.PRE_MASK  = draw2d.command.CommandStack.PRE_EXECUTE  | draw2d.command.CommandStack.PRE_UNDO  |draw2d.command.CommandStack.PRE_REDO;
draw2d.command.CommandStackEvent = Class.extend({
    NAME : "draw2d.command.CommandStackEvent", 
    init: function(stack, command, details)
    {
    	this.stack = stack;
        this.command = command;
        this.details = details;
    },
    getStack: function()
    {
       return this.stack;
    },
    getCommand: function()
    {
       return this.command;
    },
    getDetails: function()
    {
       return this.details;
    },
    isPostChangeEvent: function()
    {
       return 0 != (this.getDetails() & draw2d.command.CommandStack.POST_MASK);
    },
    isPreChangeEvent: function()
    {
       return 0 != (this.getDetails() & draw2d.command.CommandStack.PRE_MASK);
    }
});
draw2d.command.CommandStackEventListener = Class.extend({
    NAME : "draw2d.command.CommandStackEventListener", 
    init: function()
    {
    },
    stackChanged: function(event)
    {
    }
});
draw2d.command.CommandMove = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandMove", 
    init: function(figure, x, y)
    {
        this._super(draw2d.Configuration.i18n.command.moveShape);
        this.figure = figure;
        if (typeof x === "undefined")
        {
            this.oldX = figure.getX();
            this.oldY = figure.getY();
        }
        else
        {
            this.oldX = x;
            this.oldY = y;
        }
   },
    setStartPosition: function( x,  y)
    {
       this.oldX = x;
       this.oldY = y;
    },
    setPosition: function( x,  y)
    {
       this.newX = x;
       this.newY = y;
    },
    canExecute: function()
    {
      return this.newX!=this.oldX || this.newY!=this.oldY;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
       this.figure.setPosition(this.oldX, this.oldY);
    },
    redo: function()
    {
       this.figure.setPosition(this.newX, this.newY);
    }
});
draw2d.command.CommandAttr = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandAttr",
    init: function(figure, newAttributes)
    {
        var _this = this;
        this._super(draw2d.Configuration.i18n.command.changeAttributes);
        this.figure = figure;
        this.newAttributes = newAttributes;
        this.oldAttributes = {};
        $.each(newAttributes, function(key, value){
            _this.oldAttributes[key] = figure.attr(key);
        });
    },
    canExecute: function()
    {
      return true;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        this.figure.attr(this.oldAttributes);
    },
    redo: function()
    {
        this.figure.attr(this.newAttributes);
    }
});
draw2d.command.CommandMoveLine = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandMoveLine", 
    init: function(figure)
    {
        this._super(draw2d.Configuration.i18n.command.moveLine);
        this.line = figure;
        this.dx = 0;
        this.dy = 0;
    },
    setTranslation: function(dx, dy)
    {
        this.dx = dx;
        this.dy = dy;
    },
   canExecute: function()
   {
     return this.dx !==0 && this.dy !==0;
   },
   execute: function()
   {
      this.redo();
   },
   undo: function()
   {
       var _this = this;
       this.line.getVertices().each(function(i,e){
           e.translate(-_this.dx, -_this.dy);
       });
       this.line.svgPathString = null;
       this.line.setPosition(this.line.getStartPoint());
   },
   redo: function()
   {
       var _this = this;
       this.line.getVertices().each(function(i,e){
           e.translate(_this.dx, _this.dy);
       });
       this.line.svgPathString = null;       
       this.line.setPosition(this.line.getStartPoint());
   }
});
draw2d.command.CommandMoveConnection = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandMoveConnection",
    init: function(figure)
    {
        this._super(draw2d.Configuration.i18n.command.moveLine);
        this.line = figure;
        this.dx = 0;
        this.dy = 0;
    },
    setTranslation: function(dx, dy)
    {
        this.dx = dx;
        this.dy = dy;
    },
   canExecute: function()
   {
     return this.dx !==0 && this.dy !==0;
   },
   execute: function()
   {
      this.redo();
   },
   undo: function()
   {
       var _this = this;
       this.line.getVertices().each(function(i,e){
           e.translate(-_this.dx, -_this.dy);
       });
       this.line.svgPathString = null;
       this.line.setPosition(this.line.getStartPoint());
   },
   redo: function()
   {
       var _this = this;
       this.line.getVertices().each(function(i,e){
           e.translate(_this.dx, _this.dy);
       });
       this.line.svgPathString = null;       
       this.line.setPosition(this.line.getStartPoint());
   }
});
draw2d.command.CommandMoveVertex = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandMoveVertex", 
    init: function(line)
    {
        this._super(draw2d.Configuration.i18n.command.moveVertex);
        this.line = line;
        this.index = -1;
        this.newPoint = null;
    },
    setIndex: function( index)
    {
       this.index = index;
       this.origPoint = this.line.getVertices().get(this.index).clone();
    },
    updatePosition: function(x,y)
    {
        this.newPoint = new draw2d.geo.Point(x,y);
    },
    canExecute: function()
    {
      return this.index!==-1 && this.newPoint!==null;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        this.line.setVertex(this.index, this.origPoint.x, this.origPoint.y);
    },
    redo: function()
    {
        this.line.setVertex(this.index, this.newPoint.x, this.newPoint.y);
    }
});
draw2d.command.CommandMoveVertices = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandMoveVertices", 
    init: function(line)
    {
        this._super(draw2d.Configuration.i18n.command.moveVertices);
        this.line = line;
        this.oldVertices = line.getVertices().clone(true);
        this.newVertices = null;
    },
    updateVertices: function(newVertices)
    {
       this.newVertices = newVertices;
    },
    canExecute: function()
    {
      return this.newVertices!==null;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        this.line.setVertices(this.oldVertices);
    },
    redo: function()
    {
        this.line.setVertices(this.newVertices);
    }
});
draw2d.command.CommandResize = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandResize", 
    init: function(figure, width, height)
    {
        this._super(draw2d.Configuration.i18n.command.resizeShape);
        this.figure = figure;
        if (typeof width === "undefined")
        {
            this.oldWidth = figure.getWidth();
            this.oldHeight = figure.getHeight();
        }
        else
        {
            this.oldWidth = width;
            this.oldHeight = height;
        }
    },
    setDimension: function( width, height)
    {
       this.newWidth  = width|0;
       this.newHeight = height|0;
    },
    canExecute: function()
    {
      return this.newWidth!=this.oldWidth || this.newHeight!=this.oldHeight;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
       this.figure.setDimension(this.oldWidth, this.oldHeight);
    },
    redo: function()
    {
       this.figure.setDimension(this.newWidth, this.newHeight);
    }
});
draw2d.command.CommandRotate = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandRotate", 
    init: function(figure, angle)
    {
        this._super(draw2d.Configuration.i18n.command.rotateShape);
        this.figure = figure;
        this.oldAngle = figure.getRotationAngle();
        this.newAngle = angle;
    },
    canExecute: function()
    {
      return this.oldAngle!=this.newAngle;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        this.rotate(this.oldAngle);
    },
    redo: function()
    {
        this.rotate(this.newAngle)
    },
    rotate: function(angle){
        var w = this.figure.getWidth();
        var h = this.figure.getHeight();
        this.figure.setRotationAngle(angle);
        this.figure.setDimension(h,w);
        this.figure.portRelayoutRequired=true;
    }
});
draw2d.command.CommandConnect = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandConnect", 
    init: function(source, target, dropTarget)
     {
       this._super(draw2d.Configuration.i18n.command.connectPorts);
       this.canvas     = target.getCanvas();
       this.source     = source;
       this.target     = target;
       this.connection = null;
       this.dropTarget = dropTarget; 
    },
    setConnection: function(connection)
    {
       this.connection=connection;
    },
    getConnection: function()
    {
        return this.connection;
    },
    execute: function()
    {
        var optionalCallback = $.proxy(function(conn){
            this.connection = conn;
            this.connection.setSource(this.source);
            this.connection.setTarget(this.target);
            this.canvas.add(this.connection);
        },this);
        if(this.connection===null){
          var result = draw2d.Configuration.factory.createConnection(this.source, this.target, optionalCallback, this.dropTarget);
          debugger;
          if(typeof result==="undefined"){
              return;
          }
          this.connection = result;
        }
        optionalCallback(this.connection);
    },
    redo: function()
    {
       this.canvas.add(this.connection);
       this.connection.reconnect();
    },
    undo: function()
    {
        this.canvas.remove(this.connection);
    }
});
draw2d.command.CommandReconnect = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandReconnect", 
    init: function(con)
    {
       this._super(draw2d.Configuration.i18n.command.connectPorts);
       this.con      = con;
       this.oldSourcePort  = con.getSource();
       this.oldTargetPort  = con.getTarget();
   },
    canExecute: function()
    {
      return true;
    },
    setNewPorts: function(source,  target)
    {
      this.newSourcePort = source;
      this.newTargetPort = target;
    },
    setIndex: function( index)
    {
    },
    updatePosition: function(x,y)
    {
    },
    execute: function()
    {
       this.redo();
    },
    cancel: function()
    {
        this.con.setSource(this.oldSourcePort);
        this.con.setTarget(this.oldTargetPort);
        this.con.routingRequired =true;
        this.con.repaint();
    },
    undo: function()
    {
      this.con.setSource(this.oldSourcePort);
      this.con.setTarget(this.oldTargetPort);
      this.con.routingRequired =true;
      this.con.repaint();
    },
    redo: function()
    {
      this.con.setSource(this.newSourcePort);
      this.con.setTarget(this.newTargetPort);
      this.con.routingRequired =true;
      this.con.repaint();
    }
});
draw2d.command.CommandDelete = draw2d.command.Command.extend({
    NAME: "draw2d.command.CommandDelete",
    init: function( figure)
    {
       this._super(draw2d.Configuration.i18n.command.deleteShape);
       this.parent   = figure.getParent();
       this.figure   = figure;
       this.canvas   = figure.getCanvas();
       this.connections = null;
       this.removedParentEntry = null; 
       this.indexOfChild = -1;
    },
    canExecute: function()
    {
        return this.figure.getCanvas()!==null;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        if(this.parent!==null){
            this.parent.add(this.removedParentEntry.figure, this.removedParentEntry.locator, this.indexOfChild);
            this.canvas.setCurrentSelection(this.parent);
        }
        else{
            this.canvas.add(this.figure);
            this.canvas.setCurrentSelection(this.figure);
        }
        if(this.figure instanceof draw2d.Connection){
           this.figure.reconnect();
        }
        for (var i = 0; i < this.connections.getSize(); ++i){
           this.canvas.add(this.connections.get(i));
           this.connections.get(i).reconnect();
        }
    },
    redo: function()
    {
       this.canvas.setCurrentSelection(null);
       if(this.connections===null)
       {
          if(this.figure instanceof draw2d.shape.node.Node){
              this.connections = this.figure.getConnections();
          }
          else{
              this.connections = new draw2d.util.ArrayList();
          }
       }
       for (var i = 0; i < this.connections.getSize(); ++i){
           this.canvas.remove(this.connections.get(i));
       }
       if(this.parent!==null){
          this.indexOfChild = this.parent.getChildren().indexOf(this.figure);
          this.removedParentEntry= this.parent.remove(this.figure);
       }
       else{
           this.canvas.remove(this.figure);
       }
    }
});
draw2d.command.CommandDeleteGroup = draw2d.command.Command.extend({
    NAME: "draw2d.command.CommandDeleteGroup",
    init: function( group)
    {
       this._super(draw2d.Configuration.i18n.command.deleteShape);
       this.parent   = group.getParent();
       this.group    = group;
       this.canvas   = group.getCanvas();
       this.removedParentEntry = null; 
       this.indexOfChild = -1;
       this.batchDelete = null;
    },
    canExecute: function()
    {
        var children = this.group.getAssignedFigures();
        for(var i=0; i<children.getSize();i++){
            if(children.get(i).isDeleteable()===false){
                return false;
            }
        }
        return this.group.getCanvas()!==null;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        this.batchDelete.undo();
        this.canvas.setCurrentSelection(this.group);
    },
    redo: function()
    {
        if(this.batchDelete ===null){
            this.batchDelete = new  draw2d.command.CommandCollection();
            this.batchDelete.add(new  draw2d.command.CommandUngroup(this.canvas, this.group));
            var children = this.group.getAssignedFigures();
            for(var i=0; i<children.getSize();i++){
                var child = children.get(i);
                var cmd = child.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.DELETE));
                this.batchDelete.add(cmd);
            }
        }
        this.batchDelete.execute();
    }
});
draw2d.command.CommandAdd = draw2d.command.Command.extend({
    NAME: "draw2d.command.CommandAdd",
    init: function(canvas, figure, x,y)
    {
       this._super(draw2d.Configuration.i18n.command.addShape);
       this.figure = figure;
       this.canvas = canvas;
       this.pos = new draw2d.geo.Point(x,y);
    },
    canExecute: function()
    {
        return this.figure.getCanvas()===null;
    },
    execute: function()
    {
       this.canvas.add(this.figure, this.pos.x, this.pos.y);
    },
    redo: function()
    {
        this.execute();
    },
    undo: function()
    {
        this.canvas.remove(this.figure);
    }
});
draw2d.command.CommandGroup = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandGroup", 
    init: function(canvas,  figures)
    {
       this._super(draw2d.Configuration.i18n.command.groupShapes);
       if(figures instanceof draw2d.Selection){
           this.figures = figures.getAll();
       }
       else{
           this.figures = figures;
       }
       this.figures.grep(function(figure){
           return figure.getComposite()===null;
       });
       this.canvas = canvas;
       this.group = new draw2d.shape.composite.Group();
    },
    canExecute: function()
    {
      return !this.figures.isEmpty();
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        var _this=this;
        this.figures.each(function(i,figure){
            _this.group.unassignFigure(figure);
        });
        this.canvas.remove(this.group);
        this.canvas.setCurrentSelection(this.figures);
    },
    redo: function()
    {
        var _this = this;
        this.figures.each(function(i,figure){
            _this.group.assignFigure(figure);
        });
        this.canvas.add(this.group);
        this.canvas.setCurrentSelection(this.group);
    }
});
draw2d.command.CommandUngroup = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandUngroup", 
    init: function(canvas,  group)
    {
       this._super(draw2d.Configuration.i18n.command.ungroupShapes);
       if(group instanceof draw2d.Selection){
           this.group = group.getAll().first();
       }
       else{
           this.group   = group;
       }
       this.canvas = canvas;
       this.figures = this.group.getAssignedFigures().clone();
    },
    canExecute: function()
    {
      return !this.figures.isEmpty();
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        var _this = this;
        this.figures.each(function(i,figure){
            _this.group.assignFigure(figure);
        });
        this.canvas.add(this.group);
        this.canvas.setCurrentSelection(this.group);
    },
    redo: function()
    {
        var _this = this;
        this.figures.each(function(i,figure){
            _this.group.unassignFigure(figure);
        });
        this.canvas.setCurrentSelection(this.figures);
        this.canvas.remove(this.group);
    }
});
draw2d.command.CommandAddVertex = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandAddVertex", 
    init: function(line, index, x ,y)
    {
        this._super(draw2d.Configuration.i18n.command.addVertex);
        this.line = line;
        this.index = index;
        this.newPoint = new draw2d.geo.Point(x,y);
    },
    canExecute: function()
    {
      return true;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        this.line.removeVertexAt(this.index);
    },
    redo: function()
    {
        this.line.insertVertexAt(this.index, this.newPoint.x, this.newPoint.y);
    }
});
draw2d.command.CommandAssignFigure = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandAssignFigure", 
    init: function(figure, composite)
    {
        this._super(draw2d.Configuration.i18n.command.assignShape);
        this.figure    = figure;
        this.composite = composite;
        this.assignedConnections = new draw2d.util.ArrayList();
        this.isNode = this.figure instanceof draw2d.shape.node.Node;
        this.oldBoundingBox = composite.getBoundingBox();
        this.newBoundingBox = null; 
   },
    canExecute: function()
    {
      return true;
    },
    execute: function()
    {
        this.composite.assignFigure(this.figure);
        this.newBoundingBox = this.composite.getBoundingBox();
        if(this.isNode===true){
            var connections = this.figure.getConnections();
            var _this = this;
            connections.each(function(i, connection){
                if(connection.getSource().getParent().getComposite()===_this.composite && connection.getTarget().getParent().getComposite()===_this.composite){
                    if(connection.getComposite()!==_this.composite){
                        _this.assignedConnections.add({oldComposite:connection.getComposite(), connection:connection});
                        _this.composite.assignFigure(connection);
                    }
                }
            });
        }
    },
    undo: function()
    {
       this.composite.unassignFigure(this.figure);
       this.assignedConnections.each(function(i, entry){
           if(entry.oldComposite!==null){
               entry.oldComposite.assignFigure(entry.connection);
           }
           else{
               entry.connection.getComposite().unassignFigure(entry.connection);
           }
       });
       this.composite.stickFigures=true;
       this.composite.setBoundingBox(this.oldBoundingBox);
       this.composite.stickFigures=false;
    },
    redo: function()
    {
       this.composite.setBoundingBox(this.oldBoundingBox);
       this.composite.assignFigure(this.figure);
       var _this=this;
       this.assignedConnections.each(function(i, entry){
           _this.composite.assignFigure(entry.connection);
       });
    }
});
draw2d.command.CommandBoundingBox = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandResize", 
    init: function(figure, boundingBox)
    {
        this._super(draw2d.Configuration.i18n.command.resizeShape);
        this.figure = figure;
        this.oldBoundingBox = this.figure.getBoundingBox();
        this.newBoundingBox = boundingBox;
    },
    canExecute: function()
    {
      return !this.oldBoundingBox.equals(this.newBoundingBox);
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
       this.figure.setBoundingBox(this.oldBoundingBox);
    },
    redo: function()
    {
        this.figure.setBoundingBox(this.newBoundingBox);
    }
});
draw2d.command.CommandRemoveVertex = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandRemoveVertex", 
    init: function(line, index)
    {
        this._super(draw2d.Configuration.i18n.command.deleteVertex);
        this.line = line;
        this.index = index;
        this.oldPoint = line.getVertices().get(index).clone();
    },
    canExecute: function()
    {
      return true;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
    	this.line.insertVertexAt(this.index, this.oldPoint.x, this.oldPoint.y);
    },
    redo: function()
    {
    	this.line.removeVertexAt(this.index);
    }
});
draw2d.command.CommandReplaceVertices = draw2d.command.Command.extend({
    NAME : "draw2d.command.CommandReplaceVertices", 
    init: function(line, originalVertices, newVertices)
    {
        this._super(draw2d.Configuration.i18n.command.addSegment);
        this.line = line;
        this.originalVertices = originalVertices;
        this.newVertices = newVertices;
    },
    canExecute: function()
    {
      return true;
    },
    execute: function()
    {
       this.redo();
    },
    undo: function()
    {
        this.line.setVertices(this.originalVertices);
    },
    redo: function()
    {
        this.line.setVertices(this.newVertices);
    }
});
draw2d.layout.connection.ConnectionRouter = Class.extend({
    NAME : "draw2d.layout.connection.ConnectionRouter",
    init: function()
    {
    },
    route: function( connection, routingHints)
    {
    	throw "subclasses must implement the method [ConnectionRouter.route]";
    },
    _paint: function(conn)
    {
        var ps = conn.getVertices();
        var p = ps.get(0);
        var radius = conn.getRadius();
        var path = ["M",(p.x|0)+0.5," ",(p.y|0)+0.5];
        var i=1;
        var length,inset, p2;
        if(radius>0){
            var lastP = p;
            length = (ps.getSize()-1);
            for(  ;i<length;i++){
                  p = ps.get(i);
                  inset = draw2d.geo.Util.insetPoint(p,lastP, radius);
                  path.push("L", (inset.x|0)+0.5, ",", (inset.y|0)+0.5);
                  p2 = ps.get(i+1);
                  inset = draw2d.geo.Util.insetPoint(p,p2,radius);
                  path.push("Q",p.x,",",p.y," ", (inset.x|0)+0.5, ", ", (inset.y|0)+0.5);
                  lastP = p;
            }
            p = ps.get(i);
            path.push("L", (p.x|0)+0.5, ",", (p.y|0)+0.5);
       }
        else{
            length = ps.getSize();
            for( ;i<length;i++){
                p = ps.get(i);
                path.push("L", (p.x|0)+0.5, ",", (p.y|0)+0.5);
          }
        }
         conn.svgPathString = path.join("");
     },
    onInstall: function(connection)
    {
    },
    onUninstall: function(connection)
    {
    },
    canRemoveVertexAt: function(index)
    {
        return false;
    },
    canRemoveSegmentAt: function(index)
    {
        return false;
    },
    getPersistentAttributes: function(line, memento)
    {   
        return memento;
    },
    setPersistentAttributes: function(line, memento)
    {
    },
    onDrag: function(line, dx, dy, dx2, dy2)
    {
    },
    verticesSet: function(line)
    {
    }
});
draw2d.layout.connection.DirectRouter = draw2d.layout.connection.ConnectionRouter.extend({
    NAME : "draw2d.layout.connection.DirectRouter",
    init: function()
    {
        this._super();
    },
    onInstall: function(connection)
    {
        connection.installEditPolicy(new draw2d.policy.line.LineSelectionFeedbackPolicy());
    },
    invalidate: function()
    {
    },
    route: function( connection, routingHints)
    {
       var start =connection.getStartPoint();
       var end = connection.getEndPoint();
       connection.addPoint(start);
       connection.addPoint(end);
       var path = ["M",start.x," ",start.y];
       path.push("L", end.x, " ", end.y);
       connection.svgPathString = path.join("");
    }
});
draw2d.layout.connection.VertexRouter = draw2d.layout.connection.ConnectionRouter.extend({
    NAME : "draw2d.layout.connection.VertexRouter",
    init: function()
    {
        this._super();
    },
    onInstall: function(connection)
    {
        connection.installEditPolicy(new draw2d.policy.line.VertexSelectionFeedbackPolicy());
    },
    invalidate: function()
    {
    },
    route: function( connection, routingHints)
    {
       var count = routingHints.oldVertices.getSize();
       for(var i=0; i<count;i++){
           connection.addPoint(routingHints.oldVertices.get(i));
       }
       var ps = connection.getVertices();
       var startAnchor = connection.getStartPoint(ps.get(1));
       var endAnchor   = connection.getEndPoint(ps.get(ps.getSize()-2));
       ps.first().setPosition(startAnchor);
       ps.last().setPosition(endAnchor);
       this._paint(connection);
    },
    canRemoveVertexAt: function(conn, index)
    {
        return false;
    },
    canRemoveSegmentAt: function(conn, index)
    {
       var segmentCount= conn.getVertices().getSize()-1; 
       if( (index<=0) || (index>= segmentCount)){
          return false;
       }
       if(segmentCount<2){
          return false;
       }
       return true;
    },
    getPersistentAttributes: function(line, memento)
    {   
        memento.vertex = [];
        line.getVertices().each(function(i,e){
            memento.vertex.push({x:e.x, y:e.y});
        });
        return memento;
    },
    setPersistentAttributes: function(line, memento)
    {
        if($.isArray(memento.vertex) && memento.vertex.length>1){
            line.oldPoint=null;
            line.lineSegments = new draw2d.util.ArrayList();
            line.setVertices(memento.vertex);
        }
    },
    onDrag: function(line, dx, dy, dx2, dy2)
    {
       var count = line.getVertices().getSize() - 1;
        for (var i = 1; i < count; i++) {
            line.getVertex(i).translate(dx2, dy2);
        }
    }
});
draw2d.layout.connection.ManhattanConnectionRouter = draw2d.layout.connection.ConnectionRouter.extend({
    NAME : "draw2d.layout.connection.ManhattanConnectionRouter",
	MINDIST : 20,
	TOL     : 0.1,
	TOLxTOL : 0.01,
    TOGGLE_DIST : 20,
    init: function()
	{
        this._super();
    },
    onInstall: function(connection)
    {
        connection.installEditPolicy(new draw2d.policy.line.LineSelectionFeedbackPolicy());
    },
	route: function( conn, routingHints)
	{
	   var fromPt  = conn.getStartPoint();
	   var fromDir = conn.getSource().getConnectionDirection( conn.getTarget());
       var toPt    = conn.getEndPoint();
	   var toDir   = conn.getTarget().getConnectionDirection( conn.getSource());
	   this._route(conn,toPt, toDir, fromPt, fromDir);
	   this._paint(conn);
	},
	_route: function( conn, fromPt, fromDir, toPt, toDir)
	{
	   var UP   = draw2d.geo.Rectangle.DIRECTION_UP;
	   var RIGHT= draw2d.geo.Rectangle.DIRECTION_RIGHT;
	   var DOWN = draw2d.geo.Rectangle.DIRECTION_DOWN;
	   var LEFT = draw2d.geo.Rectangle.DIRECTION_LEFT;
	   var xDiff = fromPt.x - toPt.x;
	   var yDiff = fromPt.y - toPt.y;
	   var point;
	   var dir;
       var pos;
	   if (((xDiff * xDiff) < (this.TOLxTOL)) && ((yDiff * yDiff) < (this.TOLxTOL))){
          conn.addPoint(new draw2d.geo.Point(toPt.x, toPt.y));
	      return;
	   }
	   if (fromDir === LEFT) {
	      if ((xDiff > 0) && ((yDiff * yDiff) < this.TOL) && (toDir === RIGHT)) {
	         point = toPt;
	         dir = toDir;
	      } 
	      else {
	         if (xDiff < 0) {
	            point = new draw2d.geo.Point(fromPt.x - this.MINDIST, fromPt.y);
	         }
	         else if (((yDiff > 0) && (toDir === DOWN)) || ((yDiff < 0) && (toDir === UP))) {
	            point = new draw2d.geo.Point(toPt.x, fromPt.y);
	         }
	         else if (fromDir == toDir) {
	            pos = Math.min(fromPt.x, toPt.x) - this.MINDIST;
	            point = new draw2d.geo.Point(pos, fromPt.y);
	         }
	         else{
	            point = new draw2d.geo.Point(fromPt.x - (xDiff / 2), fromPt.y);
	         }
	         if (yDiff > 0) {
	            dir = UP;
	         }
	         else{
	            dir = DOWN;
	         }
	      }
	   }
	   else if (fromDir === RIGHT)  {
	      if ((xDiff < 0) && ((yDiff * yDiff) < this.TOL)&& (toDir === LEFT)) 
	      {
	         point = toPt;
	         dir = toDir;
	      } 
	      else 
	      {
	         if (xDiff > 0) 
	         {
	           point = new draw2d.geo.Point(fromPt.x + this.MINDIST, fromPt.y);
	         } 
	         else if (((yDiff > 0) && (toDir === DOWN)) || ((yDiff < 0) && (toDir === UP))) 
	         {
	            point = new draw2d.geo.Point(toPt.x, fromPt.y);
	         } 
	         else if (fromDir === toDir) 
	         {
                pos = Math.max(fromPt.x, toPt.x) + this.MINDIST;
	            point = new draw2d.geo.Point(pos, fromPt.y);
	         } 
	         else 
	         {
	               point = new draw2d.geo.Point(fromPt.x - (xDiff / 2), fromPt.y);
	         }
	         if (yDiff > 0)
	         {
	            dir = UP;
	         }
	         else
	         {
	            dir = DOWN;
	         }
	      }
	   } 
	   else if (fromDir === DOWN) 
	   {
	      if (((xDiff * xDiff) < this.TOL) && (yDiff < 0)&& (toDir === UP)) 
	      {
	         point = toPt;
	         dir = toDir;
	      } 
	      else 
	      {
	         if (yDiff > 0) 
	         {
	            point = new draw2d.geo.Point(fromPt.x, fromPt.y + this.MINDIST);
	         } 
	         else if (((xDiff > 0) && (toDir === RIGHT)) || ((xDiff < 0) && (toDir === LEFT))) 
	         {
	           point = new draw2d.geo.Point(fromPt.x, toPt.y);
	         } 
	         else if (fromDir === toDir) 
	         {
	            pos = Math.max(fromPt.y, toPt.y) + this.MINDIST;
	            point = new draw2d.geo.Point(fromPt.x, pos);
	         } 
	         else 
	         {
	            point = new draw2d.geo.Point(fromPt.x, fromPt.y - (yDiff / 2));
	         }
	         if (xDiff > 0) 
	         {
	            dir = LEFT;
	         }
	         else 
	         {
	            dir = RIGHT;
	         }
	      }
	   } 
	   else if (fromDir === UP) 
	   {
	      if (((xDiff * xDiff) < this.TOL) && (yDiff > 0) && (toDir === DOWN))
	      {
	         point = toPt;
	         dir = toDir;
	      } 
	      else 
	      {
	         if (yDiff < 0) 
	         {
	            point = new draw2d.geo.Point(fromPt.x, fromPt.y - this.MINDIST);
	         } 
	         else if (((xDiff > 0) && (toDir === RIGHT)) || ((xDiff < 0) && (toDir === LEFT))) 
	         {
	            point = new draw2d.geo.Point(fromPt.x, toPt.y);
	         } 
	         else if (fromDir === toDir) 
	         {
                pos = Math.min(fromPt.y, toPt.y) - this.MINDIST;
	            point = new draw2d.geo.Point(fromPt.x, pos);
	         } 
	         else 
	         {
	            point = new draw2d.geo.Point(fromPt.x, fromPt.y - (yDiff / 2));
	         }
	         if (xDiff > 0)
	         {
	            dir = LEFT;
	         }
	         else
	         {
	            dir = RIGHT;
	         }
	      }
	   }
	   this._route(conn,point, dir, toPt, toDir);
	   conn.addPoint(fromPt);
	}
});
draw2d.layout.connection.ManhattanBridgedConnectionRouter = draw2d.layout.connection.ManhattanConnectionRouter.extend({
    NAME : "draw2d.layout.connection.ManhattanBridgedConnectionRouter",
	BRIDGE_HORIZONTAL_LR : " r 0 0 3 -4 7 -4 10 0 13 0 ", 
    BRIDGE_HORIZONTAL_RL : " r 0 0 -3 -4 -7 -4 -10 0 -13 0 ", 
    init: function()
	{
        this._super();
    },
    onInstall: function(connection)
	{
        connection.installEditPolicy(new draw2d.policy.line.LineSelectionFeedbackPolicy());
    },
	route: function(conn, routingHints)
	{
		var fromPt  = conn.getStartPoint();
		var fromDir = conn.getSource().getConnectionDirection( conn.getTarget());
		var toPt  = conn.getEndPoint();
		var toDir = conn.getTarget().getConnectionDirection( conn.getSource());
		this._route(conn, toPt, toDir, fromPt, fromDir);
        var intersectionsASC = conn.getCanvas().getIntersection(conn).sort("x");
        var intersectionsDESC= intersectionsASC.clone().reverse();
        var intersectionForCalc = intersectionsASC;
		var i = 0;
		var ps = conn.getVertices();
		var p = ps.get(0);
		var path = [ "M", (p.x|0)+0.5, " ", (p.y|0)+0.5 ];
		var oldP = p;
		for (i = 1; i < ps.getSize(); i++) {
			p = ps.get(i);
			var bridgeWidth = 5;
			var bridgeCode = this.BRIDGE_HORIZONTAL_LR;
			if (oldP.x > p.x) {
				intersectionForCalc=intersectionsDESC;
				bridgeCode = this.BRIDGE_HORIZONTAL_RL;
				bridgeWidth = -bridgeWidth;
			}
			intersectionForCalc.each(function(ii, interP) {
				if (interP.justTouching ==false && draw2d.shape.basic.Line.hit(1, oldP.x, oldP.y, p.x, p.y, interP.x, interP.y) === true) {
					if (p.y === interP.y) {
						path.push(" L", ((interP.x - bridgeWidth)|0)+0.5, " ", (interP.y|0)+0.5);
						path.push(bridgeCode);
					}
				}
			});
			path.push(" L", (p.x|0)+0.5, " ", (p.y|0)+0.5);
			oldP = p;
		}
		conn.svgPathString = path.join("");
	}
});
draw2d.layout.connection.InteractiveManhattanConnectionRouter = draw2d.layout.connection.ManhattanConnectionRouter.extend({
    NAME : "draw2d.layout.connection.InteractiveManhattanConnectionRouter",
    init: function()
    {
        this._super();
    },
    onInstall: function(conn)
    {
        conn.installEditPolicy(new draw2d.policy.line.OrthogonalSelectionFeedbackPolicy());
        if(!conn._routingMetaData){
            conn._routingMetaData = {
                routedByUserInteraction:false,
                fromDir:-1,
                toDir:-1
            };
        }
    },
    onUninstall: function(conn)
    {
        delete conn._routingMetaData;
    },
    route: function(conn, routingHints)
    {
        if (!routingHints.oldVertices) {
            debugger
        }
        if(routingHints.oldVertices.getSize()===0 || conn._routingMetaData.routedByUserInteraction===false){
            this._super(conn, routingHints);
            conn._routingMetaData.fromDir = conn.getSource().getConnectionDirection( conn.getTarget());
            conn._routingMetaData.toDir   = conn.getTarget().getConnectionDirection( conn.getSource());
        }
        else{
            this.halfRoute(conn, routingHints);
            this._paint(conn);
        }
    },
    halfRoute: function(conn, routingHints)
    {
        var MINDIST = this.MINDIST;
        var max = Math.max;
        var min = Math.min;
        routingHints = routingHints||{};
        var oldVertices = routingHints.oldVertices;
        var vertexCount  = oldVertices.getSize();
        var fromPt  = conn.getStartPoint();
        var fromDir = conn.getSource().getConnectionDirection( conn.getTarget());
        var toPt    = conn.getEndPoint();
        var toDir   = conn.getTarget().getConnectionDirection( conn.getSource());
        if(conn._routingMetaData.fromDir !== fromDir || conn._routingMetaData.toDir !== toDir){
            conn._routingMetaData.routedByUserInteraction = false;
            this.route(conn, oldVertices);
        }
        if(    (fromDir===draw2d.geo.Rectangle.DIRECTION_RIGHT ) && (toDir === draw2d.geo.Rectangle.DIRECTION_LEFT)
            && (fromPt.x > toPt.x) && (vertexCount<=4)){
            conn._routingMetaData.routedByUserInteraction = false;
            this.route(conn, {oldVertices:oldVertices});
        }
        oldVertices.each(function(i,vertex){
            conn.addPoint(vertex);
        });
        if(conn.isInDragDrop){
            return;
        }
        if(routingHints.startMoved || !fromPt.equals(oldVertices.get(0))){
            var p1 = oldVertices.get(1);
            var p2 = oldVertices.get(2);
            conn.setVertex(0,fromPt);
            switch(fromDir){
                case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                    conn.setVertex(1,max(fromPt.x+MINDIST,p1.x),fromPt.y);
                    conn.setVertex(2,max(fromPt.x+MINDIST,p1.x),p2.y);    
                    break;
                case draw2d.geo.Rectangle.DIRECTION_LEFT:
                    conn.setVertex(1,min(fromPt.x-MINDIST,p1.x),fromPt.y);
                    conn.setVertex(2,min(fromPt.x-MINDIST,p1.x),p2.y);    
                    break;
                case draw2d.geo.Rectangle.DIRECTION_UP:
                    conn.setVertex(1,fromPt.x, min(fromPt.y-MINDIST,p1.y)); 
                    conn.setVertex(2,p2.x    , min(fromPt.y-MINDIST,p1.y)); 
                    break;
                case draw2d.geo.Rectangle.DIRECTION_DOWN:
                    conn.setVertex(1,fromPt.x, max(fromPt.y+MINDIST,p1.y)); 
                    conn.setVertex(2,p2.x    , max(fromPt.y+MINDIST,p1.y));     
                    break;
            }
        }
        if(routingHints.endMoved || !toPt.equals(oldVertices.get(vertexCount-1))){
            var p1 = oldVertices.get(vertexCount-2);
            var p2 = oldVertices.get(vertexCount-3);
            conn.setVertex(vertexCount-1,toPt);                        
            switch(toDir){
                case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                    conn.setVertex(vertexCount-2,max(toPt.x+MINDIST,p1.x),toPt.y);  
                    conn.setVertex(vertexCount-3,max(toPt.x+MINDIST,p1.x),p2.y);    
                    break;
                case draw2d.geo.Rectangle.DIRECTION_LEFT:
                    conn.setVertex(vertexCount-2,min(toPt.x-MINDIST,p1.x),toPt.y);  
                    conn.setVertex(vertexCount-3,min(toPt.x-MINDIST,p1.x),p2.y);    
                    break;
                case draw2d.geo.Rectangle.DIRECTION_UP:
                    conn.setVertex(vertexCount-2, toPt.x,min(toPt.y-MINDIST,p1.y));  
                    conn.setVertex(vertexCount-3, p2.x  ,min(toPt.y-MINDIST,p1.y));  
                    break;
                case draw2d.geo.Rectangle.DIRECTION_DOWN:
                    conn.setVertex(vertexCount-2,toPt.x,max(toPt.y+MINDIST,p1.y));  
                    conn.setVertex(vertexCount-3,p2.x  ,max(toPt.y+MINDIST,p1.y));  
                    break;
            }
        }
    },
    canRemoveSegmentAt: function(conn, index){
        var segmentCount= conn.getVertices().getSize()-1; 
        if( (index<=0) || ((index+1)>= segmentCount)){
            return false;
        }
        if(segmentCount<4){
            return false;
        }
        var fromPt  = conn.getStartPoint();
        var fromDir = conn.getSource().getConnectionDirection( conn.getTarget());
        var toPt    = conn.getEndPoint();
        var toDir   = conn.getTarget().getConnectionDirection( conn.getSource());
        if(segmentCount<=5){
            if( (fromDir === draw2d.geo.Rectangle.DIRECTION_RIGHT) && ( toDir === draw2d.geo.Rectangle.DIRECTION_LEFT) && (fromPt.x >= toPt.x)){
                return false;
            }
            if( (fromDir == draw2d.geo.Rectangle.DIRECTION_LEFT) & ( toDir == draw2d.geo.Rectangle.DIRECTION_RIGHT) && (fromPt.x <= toPt.x)){
                return false;
            }
            if( (fromDir == draw2d.geo.Rectangle.DIRECTION_UP) & ( toDir == draw2d.geo.Rectangle.DIRECTION_DOWN) && (fromPt.y <= toPt.y)){
                return false;
            }
            if( (fromDir == draw2d.geo.Rectangle.DIRECTION_DOWN) & ( toDir == draw2d.geo.Rectangle.DIRECTION_UP) && (fromPt.y >= toPt.y)){
                return false;
            }
            var tmpConn = new draw2d.Connection();
            tmpConn.lineSegments = new draw2d.util.ArrayList();
            tmpConn.vertices   = new draw2d.util.ArrayList();
            tmpConn.sourcePort = conn.sourcePort;
            tmpConn.targetPort = conn.targetPort;
            tmpConn._routingMetaData = {routedByUserInteraction:false,fromDir:-1,toDir:-1};
            this.route(tmpConn, {oldVertices:new draw2d.util.ArrayList()});
            var curSegmentCount = conn.getVertices().getSize()-1;
            var minSegmentCount = tmpConn.getVertices().getSize()-1;
            if(curSegmentCount<=minSegmentCount){
                return false;
            }
        }
        return true;
    },
    onDrag: function(line, dx, dy, dx2, dy2)
    {
        var i=0;
        if(line.draggedSegment===null){
            var count = line.getVertices().getSize()-1;
            for( i=1; i<count;i++){
                line.getVertex(i).translate(dx2, dy2);
            }
            return;
        }
        if(line.draggedSegment.index===0 || line.draggedSegment.index === (line.getSegments().getSize()-1)){
            return;
        }
        line._routingMetaData.routedByUserInteraction = true;
        var p0  = line.draggedSegment.start;
        var p1  = line.draggedSegment.end;
            i   = line.draggedSegment.index;
        var lp0 = line.getVertices().first();
        var lp1 = line.getVertices().last();
        var distance=0;
        if(p0.y === p1.y) {
            if(i === 1) distance =p0.y - lp0.y;
            if(i === line.getSegments().getSize()-2)  distance =p1.y - lp1.y;
            if(distance<0 && dy2>0) {
                dy2 = Math.min(dy2, (-distance)-this.MINDIST);
            }
            else if(distance>0 && dy2<0) {
                dy2 = -Math.min(-dy2, (distance)-this.MINDIST);
            }
            line.getVertex(i).translate(0, dy2);
            line.getVertex(i+1).translate(0, dy2);
        }
        else if(p0.x === p1.x){
            if (i === 1) {
                distance =p0.x - lp0.x;
                if(distance<0 && dx2>0) {
                    dx2 = Math.min(dx2, (-distance)-this.MINDIST);
                }
                else if(distance>0 && dx2<0) {
                    dx2 = -Math.min(-dx2, (distance)-this.MINDIST);
                }
            }
            if(i === line.getSegments().getSize()-2)  {
                distance =p1.x - lp1.x;
                if(distance<0 && dx2>0) {
                    dx2 = Math.min(dx2, (-distance)-this.MINDIST);
                }
                else if(distance>0 && dx2<0) {
                    dx2 = -Math.min(-dx2, (distance)-this.MINDIST);
                }
            }
            line.getVertex(i).translate(dx2, 0);
            line.getVertex(i+1).translate(dx2, 0);
        }
    },
    verticesSet: function(conn)
    {
        conn._routingMetaData.routedByUserInteraction = true;
        if(conn.getSource()!==null && conn.getTarget()!==null) {
            conn._routingMetaData.fromDir = conn.getSource().getConnectionDirection(conn.getTarget());
            conn._routingMetaData.toDir = conn.getTarget().getConnectionDirection(conn.getSource());
        }
    },
    getPersistentAttributes: function(line, memento)
    {
        memento.vertex = [];
        line.getVertices().each(function(i,e){
            memento.vertex.push({x:e.x, y:e.y});
        });
        memento.routingMetaData = $.extend({},line._routingMetaData);
        return memento;
    },
    setPersistentAttributes: function(line, memento)
    {
        if($.isArray(memento.vertex)){
            line.oldPoint=null;
            line.lineSegments = new draw2d.util.ArrayList();
            line.setVertices(memento.vertex);
        }
        if(typeof memento.routingMetaData !== "undefined"){
            line._routingMetaData = $.extend({},memento.routingMetaData);
        }
    }
});
draw2d.layout.connection.CircuitConnectionRouter = draw2d.layout.connection.ManhattanConnectionRouter.extend({
    NAME : "draw2d.layout.connection.CircuitConnectionRouter",
    init: function()
    {
        this._super();
        this.setBridgeRadius(4);
        this.setVertexRadius(2);
        this.abortRoutingOnFirstVertexNode=false;
    },
    onInstall: function(connection)
    {
        connection.installEditPolicy(new draw2d.policy.line.LineSelectionFeedbackPolicy());
    },
    onUninstall: function(connection)
    {
        if(typeof connection.vertexNodes!=="undefined" && connection.vertexNodes!==null){
            connection.vertexNodes.remove();
            connection.vertexNodes = null;
        }
    },
    setVertexRadius: function(radius)
    {
        this.vertexRadius=radius;
        return this;
    },
    setJunctionRadius: function(radius){ this.vertexRadius=radius;},
    setBridgeRadius: function(radius)
    {
        this.bridgeRadius=radius;
        this.bridge_LR = [" r", 0.5, -0.5, radius-(radius/2), -(radius-radius/4), radius, -radius,radius+(radius/2), -(radius-radius/4), radius*2, "0 "].join(" ");
        this.bridge_RL = [" r", -0.5, -0.5, -(radius-(radius/2)), -(radius-radius/4), -radius, -radius,-(radius+(radius/2)), -(radius-radius/4), -radius*2, "0 "].join(" ");
        return this;
    },
	route: function(conn, routingHints)
    {
		var fromPt  = conn.getStartPoint();
		var fromDir = conn.getSource().getConnectionDirection( conn.getTarget());
		var toPt  = conn.getEndPoint();
		var toDir = conn.getTarget().getConnectionDirection( conn.getSource());
		this._route(conn, toPt, toDir, fromPt, fromDir);
        var intersectionsASC = conn.getCanvas().getIntersection(conn).sort("x");
        var intersectionsDESC= intersectionsASC.clone().reverse();
        var intersectionForCalc = intersectionsASC;
        var i = 0;
        if(typeof conn.vertexNodes!=="undefined" && conn.vertexNodes!==null){
            conn.vertexNodes.remove();
        }
        conn.vertexNodes = conn.canvas.paper.set();
		var ps = conn.getVertices();
		var p = ps.get(0);
        var path = [ "M", (p.x|0)+0.5, " ", (p.y|0)+0.5 ];
        var oldP = p;
        var bridgeWidth = null;
        var bridgeCode  = null;
        var lastVertexNode=null;
        for (i = 1; i < ps.getSize(); i++) {
			p = ps.get(i);
            if (oldP.x > p.x) {
                intersectionForCalc=intersectionsDESC;
                bridgeCode = this.bridge_RL;
                bridgeWidth = -this.bridgeRadius;
            }
            else{
                intersectionForCalc=intersectionsASC;
                bridgeCode = this.bridge_LR;
                bridgeWidth = this.bridgeRadius;
            }
            intersectionForCalc.each($.proxy(function(ii, interP) {
                if (draw2d.shape.basic.Line.hit(1, oldP.x, oldP.y, p.x, p.y, interP.x, interP.y) === true) {
    			    if(conn.sharingPorts(interP.other)){
    			        var other = interP.other;
                        var otherZ = other.getZOrder();
                        var connZ = conn.getZOrder();
                        if(connZ<otherZ){
                            var vertexNode=conn.canvas.paper.ellipse(interP.x,interP.y, this.vertexRadius, this.vertexRadius).attr({fill:conn.lineColor.hash()});
        			        conn.vertexNodes.push(vertexNode);
        			        if(this.abortRoutingOnFirstVertexNode===true){
            				    if(conn.getSource()==other.getSource()|| conn.getSource()==other.getTarget()){
            				        path = [ "M", (interP.x|0)+0.5, " ", (interP.y|0)+0.5 ];
            				        if(lastVertexNode!==null){
                                        lastVertexNode.remove();
            				            conn.vertexNodes.exclude(lastVerteNode);
            				        }
            				    }
                                lastVertexNode = vertexNode;
        			        }
                        }
    			    }
    			    else if (p.y === interP.y) {
                        path.push(" L", ((interP.x - bridgeWidth)|0)+0.5, " ", (interP.y|0)+0.5);
                        path.push(bridgeCode);
    			    }
                }
			},this));
			path.push(" L", (p.x|0)+0.5, " ", (p.y|0)+0.5);
			oldP = p;
		}
		conn.svgPathString = path.join("");
	}
});
draw2d.layout.connection.MuteableManhattanConnectionRouter = draw2d.layout.connection.ManhattanConnectionRouter.extend({
    NAME : "draw2d.layout.connection.MuteableManhattanConnectionRouter",
    UP      : new draw2d.geo.Ray(0, -1),
    DOWN    : new draw2d.geo.Ray(0, 1),
    LEFT    : new draw2d.geo.Ray(-1, 0),
    RIGHT   : new draw2d.geo.Ray(1, 0),
    init: function()
    {
        this._super();
        this.rowsUsed     = {};
        this.colsUsed     = {};
        this.constraints  = {};
        this.reservedInfo = {};
    },
    route: function( conn, routingHints)
    {
        this.rowsUsed     = {};
        this.colsUsed     = {};
        this.constraints  = {};
        this.reservedInfo = {};
        var canvas = conn.getCanvas();
        var i;
        var startPoint= conn.getStartPoint();
        var endPoint= conn.getEndPoint();
        var start   = new draw2d.geo.Ray(startPoint);
        var end     = new draw2d.geo.Ray(endPoint);
        var average = new draw2d.geo.Ray((start.x+end.x)/2,(start.y+end.y)/2);
        var direction   = new draw2d.geo.Ray(end.x-start.x, end.y-start.y);
        var startNormal = this.getStartDirection(conn);
        var endNormal   = this.getEndDirection(conn);
        var positions  = new draw2d.util.ArrayList();
        var horizontal = startNormal.isHorizontal();
        if (horizontal){
            positions.add(start.y);
        }
        else{
            positions.add(start.x);
        }
        horizontal = !horizontal;
        if (startNormal.dot(endNormal) === 0) {
            if ((startNormal.dot(direction) >= 0)  && (endNormal.dot(direction) <= 0)) {
            } else {
                if (startNormal.dot(direction) < 0)
                    i = startNormal.similarity(start.translated(startNormal.getScaled(10)));
                else {
                    if (horizontal) 
                        i = average.y;
                    else 
                        i = average.x;
                }
                positions.add(i);
                horizontal = !horizontal;
                if (endNormal.dot(direction) > 0){
                    i = endNormal.similarity(end.translated(endNormal.getScaled(10)));
                }
                else {
                    if (horizontal) {
                        i = average.y;
                    }
                    else {
                        i = average.x;
                    }
                }
                positions.add(i);
                horizontal = !horizontal;
            }
        } else {
            if (startNormal.dot(endNormal) > 0) {
                if (startNormal.dot(direction) >= 0)
                    i = startNormal.similarity(start.translated(startNormal.getScaled(10)));
                else
                    i = endNormal.similarity(end.translated(endNormal.getScaled(10)));
                positions.add( i);
                horizontal = !horizontal;
            } else {
                if (startNormal.dot(direction) < 0) {
                    i = startNormal.similarity(start.translated(startNormal.getScaled(10)));
                    positions.add(i);
                    horizontal = !horizontal;
                }
                if (this.isCycle(conn)) {
                    if (horizontal)
                        i = conn.getSource().getParent().getBoundingBox().getTop() - 10;
                    else
                        i = conn.getSource().getParent().getBoundingBox().getRight() + 10;
                } else {
                    if (horizontal) {
                        var j = average.y;
                        var next = endNormal.similarity(end.translated(endNormal.getScaled(10)));
                        var trial = new draw2d.geo.Ray((positions.get(positions.getSize() - 1)), j);
                        var figure = this.findFirstFigureAtStraightLine(canvas, trial, this.LEFT, draw2d.util.ArrayList.EMPTY_LIST);
                        while (figure != null && figure.getBoundingBox().x + figure.getBoundingBox().width > next) {
                            j = figure.getBoundingBox().y + figure.getBoundingBox().height + 5;
                            trial.y = j;
                            figure = this.findFirstFigureAtStraightLine(canvas, trial, this.LEFT, Collections.EMPTY_LIST);                        
                        }
                        i = j;
                    } else {
                        var figure = this.findFirstFigureAtStraightLine(canvas, start, this.RIGHT, this.getExcludingFigures(conn));
                        if (figure == null)
                            i = average.x;
                        else {
                            i = Math.min(average.x, start.translated(new draw2d.geo.Ray(3 * (figure.getBoundingBox().x - start.x) / 4, 0)).x);
                            i = Math.max(start.x, i);
                        }
                        i = this.adjust(conn, i);
                    }
                }
                positions.add(i);
                horizontal = !horizontal;
            }
        }
        if (horizontal) 
            positions.add(end.y);
        else 
            positions.add( end.x);
        this.processPositions(start, end, positions, startNormal.isHorizontal(), conn);
        this._paint(conn);
    },
    getColumnNear: function (connection, r, n, x)
    {
        var min = Math.min(n, x);
        var max = Math.max(n, x);
        if (min > r) {
            max = min;
            min = r - (min - r);
        }
        if (max < r) {
            min = max;
            max = r + (r - max);
        }
        var proximity = 0;
        var direction = -1;
        if (r % 6 != 0){
            r = r - ( r % 6);
        }
        var i;
        while (proximity < r) {
            i = parseInt(r + proximity * direction);
            if (! (i in this.colsUsed)) {
                this.colsUsed[i]= i;
                this.reserveColumn(connection, i);
                return i;
            }
            if (i <= min){
                return i + 6;
            }
            if (i >= max){
                return i - 6;
            }
            if (direction === 1){
                direction = -1;
            }
            else {
                direction = 1;
                proximity += 6;
            }
        }
        return r;
    },
    getRowNear: function(connection, r, n, x)
    {
        var min = Math.min(n, x);
        var max = Math.max(n, x);
        if (min > r) {
            max = min;
            min = r - (min - r);
        }
        if (max < r) {
            min = max;
            max = r + (r - max);
        }
        var proximity = 0;
        var direction = -1;
        if (r % 6 != 0){
            r = r - ( r % 6);
        }
        var i;
        while (proximity < r) {
            i = parseInt(r + proximity * direction);
            if (! (i in this.rowsUsed)) {
                this.rowsUsed[i]= i;
                this.reserveRow(connection, i);
                return i;
            }
            if (i <= min)
                return i + 6;
            if (i >= max)
                return i - 6;
            if (direction == 1)
                direction = -1;
            else {
                direction = 1;
                proximity += 6;
            }
        }
        return r;
    },
    getEndDirection: function( conn)
    {
        var p    = conn.getEndPoint();
        var rect= conn.getTarget().getParent().getBoundingBox();
        return this.getDirection(rect, p);
    },
    getStartDirection: function( conn)
    {
        var p    = conn.getStartPoint();
        var rect= conn.getSource().getParent().getBoundingBox();
        return this.getDirection(rect, p);
    },
    getDirection: function( r,  p)
    {
        var i=Math.abs(r.y - p.y);
        var distance = Math.abs(r.x - p.x);
        var direction = this.LEFT;
        if (i <= distance) {
            distance = i;
            direction = this.UP;
        }
        i = Math.abs(r.getBottom() - p.y);
        if (i <= distance) {
          distance = i;
          direction = this.DOWN;
        }
        i = Math.abs(r.getRight() - p.x);
        if (i < distance) {
            distance = i;
            direction = this.RIGHT;
        }
        return direction;
    },
    processPositions: function( start,  end,  positions,  horizontal,  conn)
    {
        this.removeReservedLines(conn);
        var pos =  [];
        if (horizontal)
            pos.push(start.x);
        else
            pos.oush(start.y);
        var i;
        for (i = 0; i < positions.getSize(); i++) {
            pos.push(positions.get(i));
        }
        if (horizontal == (positions.getSize() % 2 == 1)){
            pos.push(end.x);
        }
        else{
            pos.push(end.y);
        }
        conn.addPoint(new draw2d.geo.Point(start.x, start.y));
        var p;
        var current, prev, min, max;
        var adjust;
        for (i = 2; i < pos.length - 1; i++) {
            horizontal = !horizontal;
            prev = pos[i - 1];
            current = pos[i];
            adjust = (i !== pos.length - 2);
            if (horizontal) {
                if (adjust) {
                    min = pos[i - 2];
                    max = pos[i + 2];
                    pos[i] = current = this.getRowNear(conn, current, min, max);
                }
                p = new draw2d.geo.Point(prev, current);
            } else {
                if (adjust) {
                    min = pos[i - 2];
                    max = pos[i + 2];
                    pos[i] = current = this.getColumnNear(conn, current, min, max);
                }
                p = new draw2d.geo.Point(current, prev);
            }
            conn.addPoint(p);
        }
        conn.addPoint(new draw2d.geo.Point(end.x, end.y));
    },
   removeReservedLines: function( connection)
   {
        var rInfo = this.reservedInfo[connection];
        if ( typeof rInfo ==="undefined" || rInfo === null) 
            return;
        for (var i = 0; i < rInfo.reservedRows.getSize(); i++) {
            delete this.rowsUsed[rInfo.reservedRows.get(i)];
        }
        for (var i = 0; i < rInfo.reservedCols.getSize(); i++) {
            delete this.colsUsed[rInfo.reservedCols.get(i)];
        }
        delete this.reservedInfo[connection];
    },
    reserveColumn: function( connection,  column)
    {
        var info = this.reservedInfo[connection];
        if ( typeof info ==="undefined" || info === null) {
           info = {reservedCols: new draw2d.util.ArrayList(), reservedRows: new draw2d.util.ArrayList()};
           this.reservedInfo[connection] = info;
        }
        info.reservedCols.add(column);
    },
    reserveRow: function(connection, row)
    {
        var info = this.reservedInfo[connection];
        if ( typeof info ==="undefined" || info === null) {
            info = {reservedCols: new draw2d.util.ArrayList(), reservedRows: new draw2d.util.ArrayList()};
            this.reservedInfo[connection] = info;
        }
        info.reservedRows.add(row);
    },
    getConstraint: function( connection)
    {
        return this.constraints[connection];
    },
    setConstraint: function( connection,  constraint)
    {
        this.constraints[connection]= constraint;
    },
    isCycle: function( conn)
    {
        var source = conn.getSource().getParent();
        var target = conn.getTarget().getParent();
        return source.id===target.id;
    },
    getExcludingFigures: function( conn)
    {
        var excluding = new draw2d.util.ArrayList();
        excluding.add(conn.getSource().getParent());
        excluding.add(conn.getTarget().getParent());
        return excluding;
    },
    findFirstFigureAtStraightLine: function(canvas,  start,  direction,  excluding)
    {
        var figure = null;
        var figures = canvas.getFigures();
        var _this = this;
        figures.each(function(i,child) {
            try{
                if (!excluding.contains(child)) {
                    var rect = child.getBoundingBox();
                    if (_this.LEFT.equals(direction)) {
                        if (start.x > rect.x && start.y >= rect.y && start.y <= rect.y + rect.h) {                 
                            if (figure === null || rect.x > figure.getBoundingBox().x)
                                figure = child;
                        }
                    } else if (_this.RIGHT.equals(direction)) {
                        if (start.x < rect.x + rect.w && start.y >= rect.y && start.y <= rect.y + rect.h) {                    
                            if (figure == null || rect.x < figure.getBoundingBox().x)
                                figure = child;
                        } 
                    } else if (_this.UP.equals(direction)){
                        if (start.y > rect.y && start.x >= rect.x && start.x <= rect.x + rect.w) {
                            if (figure === null || rect.y > figure.getBoundingBox().y)
                                figure = child;
                        }           
                    } else if (_this.DOWN.equals(direction)){
                        if (start.y < rect.y + rect.h && start.x >= rect.x && start.x <= rect.x + rect.w) {
                            if (figure === null || rect.y < figure.getBoundingBox().y)
                                figure = child;
                        }                   
                    }
                }
            }
            catch(exc){
                console.log(exc);
                debugger;
            }
        });
        return figure;
    },
    adjust: function( connection,  col)
    {
        var column = col;
        var start = connection.getSource().getPosition();
        var connections = connection.getCanvas().getLines();
        connections.each(function(i,conn) {
            try{
                if (conn===connection)
                    return;
                var end = conn.getTarget().getPosition();
                if (start.x < end.x && start.y == end.y) {
                    if (conn.getVertices().getMidpoint().x <= col)
                        column = conn.getVertices().getMidpoint().x - 5;
                }
            }
            catch(exc){
                console.log(exc);
                debugger;
            }
        });
        return column;
    }
});
draw2d.layout.locator.Locator= Class.extend({
    NAME : "draw2d.layout.locator.Locator",
    init: function( )
    {
    },
    bind: function(figure, child)
    {
        child.setDraggable(false);
        child.setSelectable(false);
    },
    unbind: function(figure, child)
    {
    },
    relocate: function(index, figure)
    {
        figure.repaint();
    },
    clone: function()
    {
        return eval("new "+this.NAME+"()");
    }
});
draw2d.layout.locator.PortLocator = draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.PortLocator",
    init: function( )
    {
      this._super();
    },
    applyConsiderRotation: function(port, x, y)
    {
    	var parent = port.getParent();
        var halfW = parent.getWidth()/2;
        var halfH = parent.getHeight()/2;
    	var rotAngle = parent.getRotationAngle();
    	var m = Raphael.matrix();
    	m.rotate(rotAngle, halfW, halfH);
        if(rotAngle=== 90|| rotAngle===270){
            var ratio = parent.getHeight()/parent.getWidth();
            m.scale(ratio, 1/ratio, halfW, halfH);
        }
        port.setPosition( m.x(x,y), m.y(x,y));
    }
});
draw2d.layout.locator.DraggableLocator= draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.DraggableLocator",
    init: function( )
    {
        this._super();
    },
    bind: function(parent, child)
    {
        child.setSelectionAdapter( function(){
            return child;
        });
    },
    unbind: function(parent, child)
    {
        child.setSelectionAdapter(null);
    }
});
draw2d.layout.locator.SmartDraggableLocator= draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.SmartDraggableLocator",
    init: function( )
    {
        this._super();
        this.boundedCorners={
            init:false,
            parent:0,
            child:0,
            dist: Number.MAX_SAFE_INTEGER,
            xOffset: 0,
            yOffset: 0
        }
    },
    bind: function(parent, child)
    {
        var _this = this;
        var calcBoundingCorner=function() {
            _this.boundedCorners={
                init:false,
                parent:0,
                child:0,
                dist: Number.MAX_SAFE_INTEGER,
                xOffset: 0,
                yOffset: 0
            };
            var parentVertices = child.getParent().getBoundingBox().getVertices();
            var childVertices  = child.getBoundingBox().getVertices();
            var i_parent, i_child;
            var p1, p2, distance;
            for (i_parent = 0; i_parent < parentVertices.getSize(); i_parent++) {
                for (i_child = 0; i_child < childVertices.getSize(); i_child++) {
                    p1 = parentVertices.get(i_parent);
                    p2 = childVertices.get(i_child);
                    distance = Math.abs(p1.distance(p2));
                    if (distance < _this.boundedCorners.dist) {
                        _this.boundedCorners = {
                            parent: i_parent,
                            child: i_child,
                            dist: distance,
                            xOffset:p1.x-p2.x,
                            yOffset:p1.y-p2.y
                        }
                    }
                }
            }
            _this.boundedCorners.init=true;
        };
        child.setSelectionAdapter( function(){
            return child;
        });
        child.getParent().on("added",calcBoundingCorner);
        child.on("dragend",calcBoundingCorner);
    },
    unbind: function(parent, child)
    {
        child.setSelectionAdapter(null);
    },
    relocate: function(index, figure)
    {
        this._super(index, figure);
        if(this.boundedCorners.init===true) {
            var parentVertices = figure.getParent().getBoundingBox().getVertices();
            var childVertices = figure.getBoundingBox().getVertices();
            var p1 = parentVertices.get(this.boundedCorners.parent);
            var p2 = childVertices.get(this.boundedCorners.child);
            var xOffset = p1.x - p2.x;
            var yOffset = p1.y - p2.y;
            figure.translate(xOffset - this.boundedCorners.xOffset, yOffset - this.boundedCorners.yOffset);
        }
    }
});
draw2d.layout.locator.XYAbsPortLocator = draw2d.layout.locator.PortLocator.extend({
    NAME : "draw2d.layout.locator.XYAbsPortLocator",
    init: function(x ,y )
    {
      this._super();
      this.x = x;
      this.y = y;
    },    
    relocate: function(index, figure)
   {
        this.applyConsiderRotation( figure, this.x, this.y);
    }
});
draw2d.layout.locator.XYRelPortLocator = draw2d.layout.locator.PortLocator.extend({
    NAME : "draw2d.layout.locator.XYRelPortLocator",
    init: function(xPercentage ,yPercentage )
    {
      this._super();
      this.x = xPercentage;
      this.y = yPercentage;
    },    
    relocate: function(index, figure)
    {
        var node = figure.getParent();
        var x = node.getWidth()/100 * this.x;
        var y = node.getHeight()/100  * this.y;
        this.applyConsiderRotation( figure, x, y);
    }
});
draw2d.layout.locator.InputPortLocator = draw2d.layout.locator.PortLocator.extend({
    NAME : "draw2d.layout.locator.InputPortLocator",
    init: function()
    {
      this._super();
    },    
    relocate: function(index, figure)
   {
        var node = figure.getParent();
        var dividerFactor = 1;
        var thisNAME = this.NAME;
        var portIndex =1;
        node.getPorts().each(function(i,p){
        	portIndex = (p===figure)?dividerFactor:portIndex;
        	dividerFactor += p.getLocator().NAME === thisNAME?1:0;
        });
        this.applyConsiderRotation( figure, 0, (node.getHeight()/dividerFactor)*portIndex);
    }
});
draw2d.layout.locator.OutputPortLocator = draw2d.layout.locator.PortLocator.extend({
    NAME : "draw2d.layout.locator.OutputPortLocator",
    init: function( )
    {
      this._super();
    },    
    relocate: function(index, figure)
   {
        var node = figure.getParent();
        var dividerFactor = 1;
        var thisNAME = this.NAME;
        var portIndex =1;
        node.getPorts().each(function(i,p){
        	portIndex = (p===figure)?dividerFactor:portIndex;
        	dividerFactor += p.getLocator().NAME === thisNAME?1:0;
        });
        this.applyConsiderRotation( figure, node.getWidth(), (node.getHeight()/dividerFactor)*portIndex);
    }
});
draw2d.layout.locator.ConnectionLocator= draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.ConnectionLocator",
    init: function()
    {
      this._super();
    }
});
draw2d.layout.locator.ManhattanMidpointLocator= draw2d.layout.locator.ConnectionLocator.extend({
    NAME : "draw2d.layout.locator.ManhattanMidpointLocator",
    init: function()
    {
      this._super();
    },
    relocate: function(index, target)
    {
       var conn = target.getParent();
       var points = conn.getVertices();
       var segmentIndex = Math.floor((points.getSize() -2) / 2);
       if (points.getSize() <= segmentIndex+1)
          return; 
       var p1 = points.get(segmentIndex);
       var p2 = points.get(segmentIndex + 1);
       var x = ((p2.x - p1.x) / 2 + p1.x - target.getWidth()/2)|0;
       var y = ((p2.y - p1.y) / 2 + p1.y - target.getHeight()/2)|0;
       target.setPosition(x,y);
    }
});
draw2d.layout.locator.PolylineMidpointLocator= draw2d.layout.locator.ManhattanMidpointLocator.extend({
    NAME : "draw2d.layout.locator.PolylineMidpointLocator",
    init: function()
    {
      this._super();
    },
    relocate: function(index, target)
    {
       var conn = target.getParent();
       var points = conn.getVertices();
       if(points.getSize()%2===0){
           this._super(index, target);
       }
       else{
           var index = Math.floor(points.getSize() / 2);
           var p1 = points.get(index);
           target.setPosition(p1.x- (target.getWidth()/2),p1.y-(target.getHeight()/2));
       }      
    }
});
draw2d.layout.locator.ParallelMidpointLocator= draw2d.layout.locator.ConnectionLocator.extend({
    NAME : "draw2d.layout.locator.ParallelMidpointLocator",
    init: function(distanceFromConnection)
    {
      this._super();
      if(typeof distanceFromConnection!=="undefined"){
          this.distanceFromConnection = parseFloat(distanceFromConnection);
      }
      else{
          this.distanceFromConnection = -5;
      }
    },
    relocate: function(index, target)
    {
       var conn = target.getParent();
       var points = conn.getVertices();
       var segmentIndex = Math.floor((points.getSize() -2) / 2);
       if (points.getSize() <= segmentIndex+1) {
           return;
       }
       var p1 = points.get(segmentIndex);
       var p2 = points.get(segmentIndex + 1);
       var distance = this.distanceFromConnection<=0?this.distanceFromConnection-target.getHeight():this.distanceFromConnection; 
       var nx =p1.x-p2.x;
       var ny =p1.y-p2.y;
       var length = Math.sqrt(nx*nx+ny*ny);
       var radian = -Math.asin(ny/length);
       var angle  = (180/Math.PI) * radian;
       if(radian<0)
       {
          if(p2.x<p1.x){
              radian = Math.abs(radian) + Math.PI;
              angle = 360-angle;
              distance = -distance-target.getHeight();
          }
          else{
              radian = Math.PI*2- Math.abs(radian);
              angle = 360+angle;
          }
       }
       else
       {
          if(p2.x<p1.x){
              radian = Math.PI-radian;
              angle = 360-angle;
              distance = -distance-target.getHeight();
          }
       }
       var rotAnchor = this.rotate(length/2-target.getWidth()/2, distance, 0, 0, radian);
       var rotCenterOfLabel = this.rotate(0,0,target.getWidth()/2, target.getHeight()/2, radian);
       target.setRotationAngle(angle);
       target.setPosition(rotAnchor.x-rotCenterOfLabel.x+p1.x,rotAnchor.y-rotCenterOfLabel.y+p1.y);
   },
    rotate: function(x, y, xm, ym, radian)
    {
        var cos = Math.cos,
            sin = Math.sin;
            return {x: (x - xm) * cos(radian) - (y - ym) * sin(radian)   + xm,
                    y: (x - xm) * sin(radian) + (y - ym) * cos(radian)   + ym};
    }
});
draw2d.layout.locator.TopLocator= draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.TopLocator",
    init: function()
    {
      this._super();
    },
    relocate: function(index, target)
    {
       var parent = target.getParent();
       var boundingBox = parent.getBoundingBox();
       var offset = (parent instanceof draw2d.Port)?boundingBox.w/2:0;
       var targetBoundingBox = target.getBoundingBox();
       if(target instanceof draw2d.Port){
           target.setPosition(boundingBox.w/2-offset,0);
       }
       else{
           target.setPosition(boundingBox.w/2-(targetBoundingBox.w/2)-offset,-(targetBoundingBox.h+2));
       }
    }
});
draw2d.layout.locator.BottomLocator= draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.BottomLocator",
    init: function()
    {
      this._super();
    },
    relocate: function(index, target)
    {
       var parent = target.getParent();
       var boundingBox = parent.getBoundingBox();
       var offset = (parent instanceof draw2d.Port)?boundingBox.w/2:0;
       var targetBoundingBox = target.getBoundingBox();
       if(target instanceof draw2d.Port){
           target.setPosition(boundingBox.w/2-offset,boundingBox.h);
       }
       else{
           target.setPosition(boundingBox.w/2-targetBoundingBox.w/2-offset,2+boundingBox.h);
       }
    }
});
draw2d.layout.locator.LeftLocator= draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.LeftLocator",
    init: function(attr)
    {
      this._super();
      this.margin = (attr && ( "margin" in attr))?attr.margin :5;
    },
    relocate: function(index, target)
    {
       var parent = target.getParent();
       var boundingBox = parent.getBoundingBox();
       var offset = (parent instanceof draw2d.Port)?boundingBox.h/2:0;
       if(target instanceof draw2d.Port){
           target.setPosition(0,(boundingBox.h/2)-offset);
       }
       else{
           var targetBoundingBox = target.getBoundingBox();
           target.setPosition(-targetBoundingBox.w-this.margin,(boundingBox.h/2)-(targetBoundingBox.h/2)-offset);
       }
    }
});
draw2d.layout.locator.RightLocator = draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.RightLocator",
    init: function(attr)
    {
      this._super();
      this.margin = (attr && ( "margin" in attr))?attr.margin :5;
    },
    relocate: function(index, target)
    {
       var parent = target.getParent();
       var boundingBox = parent.getBoundingBox();
       var offset = (parent instanceof draw2d.Port)?boundingBox.h/2:0;
       if(target instanceof draw2d.Port){
           target.setPosition(boundingBox.w,(boundingBox.h/2)-offset);
       }
       else{
           var targetBoundingBox = target.getBoundingBox();
           target.setPosition(boundingBox.w+this.margin,(boundingBox.h/2)-(targetBoundingBox.h/2)-offset);
       }
    }
});
draw2d.layout.locator.CenterLocator= draw2d.layout.locator.Locator.extend({
    NAME : "draw2d.layout.locator.CenterLocator",
    init: function()
    {
      this._super();
    },
    relocate: function(index, target)
    {
       var parent = target.getParent();
       var boundingBox = parent.getBoundingBox();
       if(target instanceof draw2d.Port){
           target.setPosition(boundingBox.w/2,boundingBox.h/2);
       }
       else{
           var targetBoundingBox = target.getBoundingBox();
           target.setPosition(((boundingBox.w/2-targetBoundingBox.w/2)|0)+0.5,((boundingBox.h/2-(targetBoundingBox.h/2))|0)+0.5);
       }
    }
});
draw2d.policy.EditPolicy = Class.extend({
    NAME : "draw2d.policy.EditPolicy",
    init: function( attr, setter, getter){
        this.setterWhitelist = $.extend({
        },setter);
        this.getterWhitelist = $.extend({
        },getter);
        this.attr(attr);
    },
    attr: function(name, value)
    {
        if($.isPlainObject(name)){
            for(key in name){
                var func=this.setterWhitelist[key];
                if(func){
                    func.call(this,name[key]); 
                }
                else if($.isFunction(name[key])){
                    this[key] = $.proxy(name[key],this);
                }
            }
        }
        else if(typeof name === "string"){
            if(typeof value ==="undefined"){
                var getter = this.getterWhitelist[name];
                if($.isFunction(getter)){
                    return getter.call(this);
                }
                return; 
            }
            if($.isFunction(value)){
                value = value();
            }
            var setter = this.setterWhitelist[name];
            if (setter){setter.call(this,value);}
        }
        else if(typeof name === "undefined"){
        	var result = {};
        	for(key in this.getterWhitelist){
         		result[key] = this.getterWhitelist[key].call(this);
        	}
        	return result;
        }
        return this;
    },
    onInstall: function( host)
    {
    },
    onUninstall: function( host)
    {
    }
});
draw2d.policy.canvas.CanvasPolicy = draw2d.policy.EditPolicy.extend({
    NAME : "draw2d.policy.canvas.CanvasPolicy",
    init: function( attr, setter, getter)
    {
        this.canvas = null;
        this._super( attr, setter, getter);
    },
    onInstall: function(canvas)
    {
        this.canvas = canvas;
    },
    onUninstall: function(canvas)
    {
        this.canvas = null;
    },
    onClick: function(figure, mouseX, mouseY, shiftKey, ctrlKey)
    {
    },
    onMouseMove: function(canvas, x, y, shiftKey, ctrlKey)
    {
    },
    onDoubleClick: function(figure, mouseX, mouseY, shiftKey, ctrlKey)
    {
    },
    onMouseDown: function(canvas, x, y, shiftKey, ctrlKey)
    {
    },
    onMouseDrag: function(canvas, dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
    },
    onMouseUp: function(figure, x, y, shiftKey, ctrlKey)
    {
    },
    onRightMouseDown: function(figure, x, y, shiftKey, ctrlKey)
    {
    },
    onMouseWheel: function(wheelDelta, x, y, shiftKey, ctrlKey)
    {
        return true;
    },
    snap: function(canvas, figure, modifiedPos, originalPos)
    {
        return modifiedPos;
    },
    createMonochromGif: function(w,h,d,color)
    {
    	color = new draw2d.util.Color(color);
        var r = String.fromCharCode(w%256) + String.fromCharCode(w/256) + String.fromCharCode(h%256) + String.fromCharCode(h/256) ;
        var gif = "GIF89a" + r + "\xf0\0\0\xff\xff\xff" + String.fromCharCode(color.red) + String.fromCharCode(color.green) + String.fromCharCode(color.blue) + "\x21\xf9\4\1\0\0\0\0,\0\0\0\0" + r + "\0\2";
        var b = { 
                bit: 1,
                byte_: 0,
                data : "",
            writeBit: function(b) {
                if(b) this.byte_ |= this.bit;
                this.bit <<= 1;
                if(this.bit == 256) {
                    this.bit = 1;
                    this.data += String.fromCharCode(this.byte_);
                    this.byte_ = 0;
                }
            },
            get: function() {
                var result = "";
                var data = this.data;
                if(this.bit != 1) { data += String.fromCharCode(this.byte_); }
                for(var i=0; i<data.length + 1; i+=255) {
                    chunklen = data.length - i; if(chunklen < 0) chunklen = 0;
                    if(chunklen > 255) chunklen=255;
                    result += String.fromCharCode(chunklen) + data.substring(i,i+255);
                }
                return result + "\0";
            }
        };
        for(var y=0; y<h; y++) {
            for(var x=0; x<w; x++) {
                b.writeBit(d[x+w*y]); b.writeBit(0); b.writeBit(0);
                b.writeBit(0); b.writeBit(0); b.writeBit(1);
            }
        }
        gif += b.get() + ";" ;
        return "data:image/gif;base64," + draw2d.util.Base64.encode(gif);
    }
});
draw2d.policy.canvas.ZoomPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME : "draw2d.policy.canvas.ZoomPolicy",
    init: function()
    {
        this._super();
    },
    onInstall: function(canvas)
    {
        this._super(canvas);
        canvas.setZoom(1);
    },
    onUninstall: function(canvas)
    {
        this._super(canvas);
    },
    setZoom: function( zoomFactor, animated)
    {
        var canvas = this.canvas;
        var _zoom = function(z){
            canvas.zoomFactor = Math.min(Math.max(0.01,z),10);
            var viewBoxWidth  = (canvas.initialWidth*(canvas.zoomFactor))|0;
            var viewBoxHeight = (canvas.initialHeight*(canvas.zoomFactor))|0;
            canvas.paper.setViewBox(0, 0, viewBoxWidth, viewBoxHeight);
            canvas.fireEvent("zoom", {value:canvas.zoomFactor});
        };
        if(animated){
            var myTweenable = new Tweenable();
            myTweenable.tween({
                from:     { 'x': canvas.zoomFactor  },
                to:       { 'x': zoomFactor },
                duration: 300,
                easing : "easeOutSine",
                step: function (params) {
                    _zoom(params.x);
                },
                finish: function (state) {
                    canvas.fireEvent("zoomed", {value:canvas.zoomFactor});
                }
            });
        }
        else{
            _zoom(zoomFactor);
            canvas.fireEvent("zoomed", {value:canvas.zoomFactor});
        }
    }
});
draw2d.policy.canvas.WheelZoomPolicy = draw2d.policy.canvas.ZoomPolicy.extend({
    NAME : "draw2d.policy.canvas.WheelZoomPolicy",
    init: function(){
        this._super();
        this.center=null;
        var _this = this;
        this.debouncedZoomedCallback = this._debounce(function(){
            var canvas = _this.canvas;
            if(canvas!==null){
                canvas.fireEvent("zoomed", {value:canvas.zoomFactor});
            }
            _this.center=null;
        },200);
    },
    onInstall: function(canvas)
    {
        this._super(canvas);
        canvas.setZoom(1);
        canvas.__wheelZoom = 1;
    },
    onUninstall: function(canvas)
    {
        this._super(canvas);
        delete canvas.__wheelZoom;
    },
    onMouseWheel: function(wheelDelta, x, y, shiftKey, ctrlKey)
    {
        if(shiftKey ===false){
            return true;
        }
        wheelDelta = wheelDelta/1024;
        var newZoom = ((Math.min(5,Math.max(0.1,this.canvas.zoomFactor+wheelDelta))*10000|0)/10000);
        if(this.center===null){
            var client = this.canvas.fromCanvasToDocumentCoordinate(x,y);
            this.center={
                x:x,
                y:y,
                clientX: client.x,
                clientY: client.y
            };
        }
        this._zoom(newZoom,this.center);
        this.debouncedZoomedCallback();
        return false;
    },
    setZoom: function( zoomFactor, animated)
    {
        var scrollTop   = this.canvas.getScrollTop();
        var scrollLeft  = this.canvas.getScrollLeft();
        var scrollWidth = this.canvas.getScrollArea().width();
        var scrollHeight= this.canvas.getScrollArea().width();
        var centerY = scrollTop+(scrollHeight/2)*this.canvas.zoomFactor;
        var centerX = scrollLeft+(scrollWidth/2)*this.canvas.zoomFactor;
        var _this = this;
        if(animated){
            var myTweenable = new Tweenable();
            myTweenable.tween({
                from:     { 'x': this.canvas.zoomFactor  },
                to:       { 'x': zoomFactor },
                duration: 300,
                easing : "easeOutSine",
                step: function (params) {
                    _this._zoom(params.x, centerX, centerY);
                },
                finish: function (state) {
                    _this.debouncedZoomedCallback();
                }
            });
        }
        else{
            this._zoom(zoomFactor, {x:centerX, y:centerY});
            this.debouncedZoomedCallback();
        }
    },
     _zoom: function(zoom, center){
         var canvas = this.canvas;
         if(zoom === canvas.zoomFactor){
            return;
         }
         canvas.zoomFactor=zoom;
         canvas.paper.setViewBox(0, 0, canvas.initialWidth, canvas.initialHeight);
         $(canvas.html)
             .find("svg")
             .attr({'width': canvas.initialWidth/zoom,
                   'height': canvas.initialHeight/zoom});
         if(center.clientX) {
             var coordsAfter = canvas.fromCanvasToDocumentCoordinate(center.x, center.y);
             canvas.scrollTo(this.canvas.getScrollTop() - (center.clientY - coordsAfter.y), canvas.getScrollLeft() - (center.clientX - coordsAfter.x));
         }
         canvas.fireEvent("zoom", {value:canvas.zoomFactor});
    },
    _debounce: function (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
});
draw2d.policy.canvas.KeyboardPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME : "draw2d.policy.canvas.KeyboardPolicy",
    init: function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
    },
    onKeyUp: function(canvas, keyCode, shiftKey, ctrlKey)
    {
    },
    onKeyDown: function(canvas, keyCode, shiftKey, ctrlKey)
    {
    }
});
draw2d.policy.canvas.DefaultKeyboardPolicy = draw2d.policy.canvas.KeyboardPolicy.extend({
    NAME : "draw2d.policy.canvas.DefaultKeyboardPolicy",
    init: function()
    {
        this._super();
    },
    onKeyDown: function(canvas, keyCode, shiftKey, ctrlKey)
    {
        if(keyCode===46 && canvas.getPrimarySelection()!==null){
            canvas.getCommandStack().startTransaction(draw2d.Configuration.i18n.command.deleteShape);
            canvas.getSelection().each(function(index, figure){
               var cmd = figure.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.DELETE));
               if(cmd!==null){
                   canvas.getCommandStack().execute(cmd);
               }
           });
           canvas.getCommandStack().commitTransaction();
        }
        else{
            this._super(canvas, keyCode, shiftKey, ctrlKey);
         }
    }
});
draw2d.policy.canvas.ExtendedKeyboardPolicy = draw2d.policy.canvas.KeyboardPolicy.extend({
    NAME : "draw2d.policy.canvas.ExtendedKeyboardPolicy",
    init: function()
    {
        this._super();
    },
    onKeyDown: function(canvas, keyCode, shiftKey, ctrlKey)
    {
        if(canvas.getPrimarySelection()!==null && ctrlKey ===true){
            switch(keyCode){
                case 71: 
                    if(canvas.getPrimarySelection() instanceof draw2d.shape.composite.Group && canvas.getSelection().getSize()===1){
                        canvas.getCommandStack().execute(new draw2d.command.CommandUngroup(canvas, canvas.getPrimarySelection()));
                    }
                    else{
                        canvas.getCommandStack().execute(new draw2d.command.CommandGroup(canvas, canvas.getSelection()));
                    }
                    break;
                case 66: 
                    canvas.getPrimarySelection().toBack();
                    break;
                case 70: 
                    canvas.getPrimarySelection().toFront();
            }
        }
        else{
           this._super(canvas, keyCode, shiftKey, ctrlKey);
        }
    }
});
draw2d.policy.canvas.SelectionPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME : "draw2d.policy.canvas.SelectionPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    select: function(canvas, figure)
    {
    },
    unselect: function(canvas, figure)
    {
        canvas.getSelection().remove(figure);
        figure.unselect();
        canvas.fireEvent("unselect",{figure:figure});
        canvas.fireEvent("select",{figure:null});
    }
});
draw2d.policy.canvas.SingleSelectionPolicy =  draw2d.policy.canvas.SelectionPolicy.extend({
    NAME : "draw2d.policy.canvas.SingleSelectionPolicy",
    init: function()
    {
        this._super();
        this.mouseMovedDuringMouseDown = false;
        this.mouseDraggingElement = null;
        this.mouseDownElement = null;
    },
    select: function(canvas, figure)
    {
        if(canvas.getSelection().contains(figure)){
            return; 
        }
        var oldSelection = canvas.getSelection().getPrimary();
        if(canvas.getSelection().getPrimary()!==null){
            this.unselect(canvas, canvas.getSelection().getPrimary());
        }
        if(figure !==null) {
            figure.select(true); 
        }
        canvas.getSelection().setPrimary(figure);
        if(oldSelection !== figure){
            canvas.fireEvent("select",{figure:figure});
        }
    },
    onMouseDown: function(canvas, x, y, shiftKey, ctrlKey)
    {
        this.mouseMovedDuringMouseDown  = false;
        var canDragStart = true;
        var figure = canvas.getBestFigure(x, y, draw2d.Port);
        while(figure!==null){
            var delegate = figure.getSelectionAdapter()();
            if(delegate===figure){
                break;
            }
            figure = delegate;
        }
        if (figure !== null && figure.isDraggable()) {
            canDragStart = figure.onDragStart(x - figure.getAbsoluteX(), y - figure.getAbsoluteY(), shiftKey, ctrlKey);
            this.mouseDraggingElement = canDragStart===false ? null : figure;
        }
        this.mouseDownElement = figure;
        if(this.mouseDownElement!==null){
            this.mouseDownElement.fireEvent("mousedown", {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        }
        if (figure !== canvas.getSelection().getPrimary() && figure !== null && figure.isSelectable() === true) {
            this.select(canvas,figure);
            if (figure instanceof draw2d.shape.basic.Line) {
                if (!(figure instanceof draw2d.Connection)) {
                    canvas.draggingLineCommand = figure.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE));
                    if (canvas.draggingLineCommand !== null) {
                        canvas.draggingLine = figure;
                    }
                }
            }
            else if (canDragStart === false) {
                figure.unselect();
            }
        }
    },
    onMouseDrag: function(canvas, dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
        this.mouseMovedDuringMouseDown = true;
        if (this.mouseDraggingElement !== null) {
            var sel =canvas.getSelection();
            if(!sel.contains(this.mouseDraggingElement)){
                this.mouseDraggingElement.onDrag(dx, dy, dx2, dy2, shiftKey, ctrlKey);
            }
            else{
                sel.each(function(i,figure){
                    figure.onDrag(dx, dy, dx2, dy2, shiftKey, ctrlKey);
                });
            }
            var p = canvas.fromDocumentToCanvasCoordinate(canvas.mouseDownX + (dx/canvas.zoomFactor), canvas.mouseDownY + (dy/canvas.zoomFactor));           
            var target = canvas.getBestFigure(p.x, p.y,this.mouseDraggingElement);
            if (target !== canvas.currentDropTarget) {
                if (canvas.currentDropTarget !== null) {
                    canvas.currentDropTarget.onDragLeave(this.mouseDraggingElement);
                    canvas.currentDropTarget.fireEvent("dragLeave",{draggingElement:this.mouseDraggingElement});
                    canvas.currentDropTarget = null;
                }
                if (target !== null) {
                    canvas.currentDropTarget = target.delegateTarget(this.mouseDraggingElement);
                    if( canvas.currentDropTarget !==null) {
                        canvas.currentDropTarget.onDragEnter(this.mouseDraggingElement); 
                        canvas.currentDropTarget.fireEvent("dragEnter", {draggingElement: this.mouseDraggingElement});
                    }
                }
            }
       }
       else if(this.mouseDownElement!==null && !(this.mouseDownElement instanceof draw2d.Connection)){
           if(this.mouseDownElement.panningDelegate!==null){
               this.mouseDownElement.panningDelegate.fireEvent("panning", {dx:dx,dy:dy,dx2:dx2,dy2:dy2, shiftKey:shiftKey, ctrlKey:ctrlKey});
               this.mouseDownElement.panningDelegate.onPanning(dx, dy, dx2, dy2, shiftKey, ctrlKey);
           }
           else{
               this.mouseDownElement.fireEvent("panning", {dx:dx, dy:dy, dx2:dx2, dy2:dy2, shiftKey:shiftKey, ctrlKey:ctrlKey });
               this.mouseDownElement.onPanning(dx, dy, dx2, dy2, shiftKey, ctrlKey);
           }
       }
    },
    onMouseUp: function(canvas, x, y, shiftKey, ctrlKey)
    {       
        if (this.mouseDraggingElement !== null) {
            var redrawConnection = new draw2d.util.ArrayList();
            if(this.mouseDraggingElement instanceof draw2d.shape.node.Node){
                canvas.lineIntersections.each(function(i, inter){
                    if(!redrawConnection.contains(inter.line))redrawConnection.add(inter.line);
                    if(!redrawConnection.contains(inter.other))redrawConnection.add(inter.other);
                });
            }
            canvas.getCommandStack().startTransaction();
                    var sel =canvas.getSelection().getAll();
                    if(!sel.contains(this.mouseDraggingElement)){
                        this.mouseDraggingElement.onDragEnd( x, y, shiftKey, ctrlKey);
                    }
                    else{
                        canvas.getSelection().getAll().each(function(i,figure){
                             figure.onDragEnd( x, y, shiftKey, ctrlKey);
                        });
                    }
                    if(canvas.currentDropTarget!==null && !this.mouseDraggingElement.isResizeHandle){
                        this.mouseDraggingElement.onDrop(canvas.currentDropTarget, x, y, shiftKey, ctrlKey);
                        canvas.currentDropTarget.onDragLeave(this.mouseDraggingElement);
                        canvas.currentDropTarget.fireEvent("dragLeave",{draggingElement:this.mouseDraggingElement});
                        canvas.currentDropTarget.onCatch(this.mouseDraggingElement, x, y, shiftKey, ctrlKey);
                        canvas.currentDropTarget = null;
                    }
            canvas.getCommandStack().commitTransaction();
            if(this.mouseDraggingElement instanceof draw2d.shape.node.Node){
                canvas.lineIntersections.each(function(i, inter){
                    if(!redrawConnection.contains(inter.line))redrawConnection.add(inter.line);
                    if(!redrawConnection.contains(inter.other))redrawConnection.add(inter.other);
                });
                redrawConnection.each(function(i, line){
                    line.svgPathString=null;
                    line.repaint();
                });
            }
            this.mouseDraggingElement = null;
        }
        else if(this.mouseDownElement!==null && !(this.mouseDownElement instanceof draw2d.Connection)){
            if(this.mouseDownElement.panningDelegate!==null){
                this.mouseDownElement.panningDelegate.fireEvent("panningEnd");
                this.mouseDownElement.panningDelegate.onPanningEnd();
            }
            else{
                this.mouseDownElement.fireEvent("panningEnd");
                this.mouseDownElement.onPanningEnd();
            }
        }
        if (this.mouseDownElement === null && this.mouseMovedDuringMouseDown===false) {
            this.select(canvas,null);
        }
        if(this.mouseDownElement!==null){
            this.mouseDownElement.fireEvent("mouseup", {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        }
        this.mouseDownElement = null;
        this.mouseMovedDuringMouseDown  = false;
    },
    onClick: function(figure, mouseX, mouseY, shiftKey, ctrlKey)
    {
        if(figure!==null){
            figure.fireEvent("click", {
                figure:figure,
                x:mouseX,
                y:mouseY,
                relX: mouseX-figure.getAbsoluteX(),
                relY: mouseY-figure.getAbsoluteY(),
                shiftKey:shiftKey,
                ctrlKey:ctrlKey});
            figure.onClick();
        }
    },
    onDoubleClick: function(figure, mouseX, mouseY, shiftKey, ctrlKey)
    {
        if(figure!==null){
            figure.fireEvent("dblclick", {x:mouseX, y:mouseY, shiftKey:shiftKey, ctrlKey:ctrlKey});
            figure.onDoubleClick();
        }
    }
});
draw2d.policy.canvas.PanningSelectionPolicy =  draw2d.policy.canvas.SingleSelectionPolicy.extend({
    NAME : "draw2d.policy.canvas.PanningSelectionPolicy",
    init: function()
    {
        this._super();
    },
    onMouseDrag: function(canvas, dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
        this._super(canvas, dx,dy,dx2,dy2, shiftKey, ctrlKey);
        if (this.mouseDraggingElement === null && this.mouseDownElement===null) {
           var area = canvas.getScrollArea();
           area.scrollTop(area.scrollTop()-dy2);
           area.scrollLeft(area.scrollLeft()-dx2);
       }
    }
});
draw2d.policy.canvas.BoundingboxSelectionPolicy =  draw2d.policy.canvas.SingleSelectionPolicy.extend({
    NAME : "draw2d.policy.canvas.BoundingboxSelectionPolicy",
    init: function()
    {
        this.isInsideMode   = function(rect1,rect2){return rect1.isInside(rect2);};
        this.intersectsMode = function(rect1,rect2){return rect1.intersects(rect2);};
        this.decision = this.isInsideMode;
        this._super();
        this.boundingBoxFigure1 = null;
        this.boundingBoxFigure2 = null;
        this.x = 0;
        this.y = 0;
        this.canDrawBoundingBox = false;
     },
     select: function(canvas, figure)
     {
         if(canvas.getSelection().contains(figure)){
             return; 
         }
         var oldSelection = canvas.getSelection().getPrimary();
         if(figure !==null) {
             figure.select(true); 
         }
         if(oldSelection!==figure){
             canvas.getSelection().setPrimary(figure);
             canvas.fireEvent("select",{figure:figure});
         }
         var _this = this;
         var selection = canvas.getSelection();
         canvas.getLines().each(function(i,line){
             if(line instanceof draw2d.Connection){
                 if(selection.contains(line.getSource().getRoot()) && selection.contains(line.getTarget().getRoot())){
                     _this.select(canvas,line,false);
                 }
             }
         });
     },
     setDecisionMode: function(useIntersectionMode)
     {
         if(useIntersectionMode===true){
             this.decision = this.intersectsMode;
         }
         else{
             this.decision = this.isInsideMode;
         }
         return this;
     },
     onMouseDown: function(canvas, x, y, shiftKey, ctrlKey)
     {
         try{
            var _this = this;
            this.x = x;
            this.y = y;
            var currentSelection = canvas.getSelection().getAll();
            this.mouseMovedDuringMouseDown  = false;
            var canDragStart = true;
             this.canDrawBoundingBox = false;
             var figure = canvas.getBestFigure(x, y);
             while(figure!==null){
                var delegated = figure.getSelectionAdapter()();
                if(delegated===figure){
                    break;
                }
                figure = delegated;
             }
             if (figure instanceof draw2d.Port) {
                 return;
             }
             this.canDrawBoundingBox = true;
            if (figure !== null && figure.isDraggable()) {
                canDragStart = figure.onDragStart(x - figure.getAbsoluteX(), y - figure.getAbsoluteY(), shiftKey, ctrlKey);
                this.mouseDraggingElement = canDragStart===false ? null : figure;
            }
             this.mouseDownElement = figure;
             if(this.mouseDownElement!==null){
                 this.mouseDownElement.fireEvent("mousedown", {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
             }
            if(shiftKey === false){
                if(this.mouseDownElement!==null && this.mouseDownElement.isResizeHandle===false && !currentSelection.contains(this.mouseDownElement)){
                    currentSelection.each(function(i, figure){
                        _this.unselect(canvas,figure);
                    });
                }
            }
            if (figure !== canvas.getSelection().getPrimary() && figure !== null && figure.isSelectable() === true) {
                this.select(canvas,figure);
                if (figure instanceof draw2d.shape.basic.Line) {
                    if (!(figure instanceof draw2d.Connection)) {
                        canvas.draggingLineCommand = figure.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE));
                        if (canvas.draggingLineCommand !== null) {
                            canvas.draggingLine = figure;
                        }
                    }
                }
                else if (canDragStart === false) {
                    figure.unselect();
                }
            }
            if(this.mouseDownElement!==null && this.mouseDownElement.isResizeHandle===false) {
                currentSelection = canvas.getSelection().getAll();
                currentSelection.each(function (i, figure) {
                    var fakeDragX = 1;
                    var fakeDragY = 1;
                    var handleRect = figure.getHandleBBox();
                    if (handleRect !== null) {
                        handleRect.translate(figure.getAbsolutePosition().scale(-1));
                        fakeDragX = handleRect.x + 1;
                        fakeDragY = handleRect.y + 1;
                    }
                    var canDragStart = figure.onDragStart(fakeDragX, fakeDragY, shiftKey, ctrlKey, true );
                    if (figure instanceof draw2d.shape.basic.Line) {
                    }
                    else if (canDragStart === false) {
                        _this.unselect(canvas, figure);
                    }
                });
            }
         }
         catch(exc){
             console.log(exc);
         }
     },
    onMouseDrag: function(canvas, dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
        if( this.canDrawBoundingBox===false){
            return;
        }
        try{
            this._super(canvas, dx,dy,dx2,dy2, shiftKey, ctrlKey);
            if (this.mouseDraggingElement === null && this.mouseDownElement===null && this.boundingBoxFigure1===null) {
                this.boundingBoxFigure1 = new draw2d.shape.basic.Rectangle({
                	width  :1,
                	height :1,
                	x      : this.x,
                	y      : this.y,
                	bgColor: "#d4d1d4",
                	alpha  : 0.1
                });
                this.boundingBoxFigure1.setCanvas(canvas);
                this.boundingBoxFigure2 = new draw2d.shape.basic.Rectangle({
                	width:1,
                	height:1,
                	x: this.x,
                	y:this.y,
                	dash:"--..",
                	stroke:0.5,
                	color:"#37a8ff",
                	bgColor:null
                });
                this.boundingBoxFigure2.setCanvas(canvas);
           }
            if (this.boundingBoxFigure1!==null) {
            	this.boundingBoxFigure1.setDimension(Math.abs(dx),Math.abs(dy));
            	this.boundingBoxFigure1.setPosition(this.x + Math.min(0,dx), this.y + Math.min(0,dy));
            	this.boundingBoxFigure2.setDimension(Math.abs(dx),Math.abs(dy));
            	this.boundingBoxFigure2.setPosition(this.x + Math.min(0,dx), this.y + Math.min(0,dy));
            }
        }
        catch(exc){
            console.log(exc);
        }
    },
    onMouseUp: function(canvas, x,y, shiftKey, ctrlKey)
    {
        try{
            var _this = this;
            if(this.mouseDownElement===null){
                canvas.getSelection().getAll().each(function(i,figure){
                    _this.unselect(canvas, figure);
                });
            }
            else if(this.mouseDownElement instanceof draw2d.ResizeHandle || (this.mouseDownElement instanceof draw2d.shape.basic.LineResizeHandle)){
            }
            else if(this.mouseDownElement!==null && this.mouseMovedDuringMouseDown===false){
                var sel =canvas.getSelection().getAll();
                if(!sel.contains(this.mouseDownElement)){
                   canvas.getSelection().getAll().each(function(i,figure){
                       _this.unselect(canvas, figure);
                   });
                }   
            }
            this._super(canvas, x,y, shiftKey, ctrlKey);
            if (this.boundingBoxFigure1!==null) {
            	var selectionRect = this.boundingBoxFigure1.getBoundingBox();
             	canvas.getFigures().each(function(i,figure){
            		if(figure.isSelectable() === true && _this.decision(figure.getBoundingBox(),selectionRect)){
                        var fakeDragX = 1;
                        var fakeDragY = 1;
                        var handleRect = figure.getHandleBBox();
                        if(handleRect!==null){
                            handleRect.translate(figure.getAbsolutePosition().scale(-1));
                            fakeDragX = handleRect.x+1;
                            fakeDragY = handleRect.y+1;
                        }
                        var canDragStart = figure.onDragStart(fakeDragX,fakeDragY, shiftKey, ctrlKey);
                        if(canDragStart===true){
                            _this.select(canvas,figure,false);
                        }
            		}
            	});
        	  this.boundingBoxFigure1.setCanvas(null);
           	  this.boundingBoxFigure1 = null;
          	  this.boundingBoxFigure2.setCanvas(null);
           	  this.boundingBoxFigure2 = null;
            }
        }
        catch(exc){
            console.log(exc);
            debugger;
        }
   }
});
draw2d.policy.canvas.ReadOnlySelectionPolicy = draw2d.policy.canvas.SelectionPolicy.extend({
    NAME : "draw2d.policy.canvas.ReadOnlySelectionPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onInstall: function(canvas)
    {
        this._super(canvas);
        canvas.getAllPorts().each(function(i,port){
            port.setVisible(false);
        });
    },
    onUninstall: function(canvas)
    {
        canvas.getAllPorts().each(function(i,port){
            port.setVisible(true);
        });
        this._super(canvas);
    },
    onMouseDrag: function(canvas, dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
        var area = canvas.getScrollArea();
        area.scrollTop(area.scrollTop()-dy2);
        area.scrollLeft(area.scrollLeft()-dx2);
    }
});
draw2d.policy.canvas.DecorationPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME : "draw2d.policy.canvas.DecorationPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    }
});
draw2d.policy.canvas.FadeoutDecorationPolicy = draw2d.policy.canvas.DecorationPolicy.extend({
    NAME : "draw2d.policy.canvas.FadeoutDecorationPolicy",
    DEFAULT_FADEOUT_DURATION : 60,
    DEFAULT_ALPHA_DECREMENT: 0.05,
    init: function()
    {
        this._super();
        this.alpha = 1.0;
        this.alphaDec = this.DEFAULT_ALPHA_DECREMENT;
        this.hidePortsCounter = this.DEFAULT_FADEOUT_DURATION;
        this.portDragging = false;
    },
    onInstall: function(canvas)
    {
        this._super(canvas);
        this.timerId = window.setInterval($.proxy(this.onTimer,this), 50);
        this.hidePortsCounter=1;
        this.alpha = 0.1;
    },
    onUninstall: function(canvas)
    {
        window.clearInterval(this.timerId);
        this.canvas.getAllPorts().each(function(i,port){
            port.setAlpha(1.0);
        });
        this._super(canvas);
    },
    onTimer: function()
    {
        this.hidePortsCounter--;
        var _this = this;
        if(this.hidePortsCounter<=0 && this.alpha >0){
            this.alpha = Math.max(0,this.alpha-this.alphaDec);
            this.canvas.getAllPorts().each(function(i,port){
                port.setAlpha(_this.alpha);
            });
            this.canvas.getSelection().getAll().each(function(i,figure){
                figure.selectionHandles.each(function(i,handle){
                    handle.setAlpha(_this.alpha);
                });
            });
        }
        else if(this.hidePortsCounter>0 && this.alpha!==1.0){
            this.alpha =1;
            this.alphaDec = this.DEFAULT_ALPHA_DECREMENT;
            this.duringHide = false;
            this.canvas.getAllPorts().each(function(i,port){
                port.setAlpha(_this.alpha);
            });
            this.canvas.getSelection().getAll().each(function(i,figure){
                figure.selectionHandles.each(function(i,handle){
                    handle.setAlpha(_this.alpha);
                });
            });
        }
    },
    onMouseDown: function(canvas, x,y, shiftKey, ctrlKey)
    {
        this.hidePortsCounter=this.DEFAULT_FADEOUT_DURATION;
        this.portDragging = (canvas.getBestFigure(x, y) instanceof draw2d.Port);
    },
    onMouseMove: function(canvas, x, y, shiftKey, ctrlKey)
    {
        this.hidePortsCounter=this.DEFAULT_FADEOUT_DURATION;
        this.portDragging = false;
    },
    onMouseDrag: function(canvas, dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
        if(this.portDragging === false){
            this.hidePortsCounter=0;
            this.alphaDec = 0.1;
            this.onTimer();
        }
    },
    onMouseUp: function(figure, x, y, shiftKey, ctrlKey)
    {
        this.hidePortsCounter=this.DEFAULT_FADEOUT_DURATION;
        this.portDragging = false;
    }
});
draw2d.policy.canvas.CoronaDecorationPolicy = draw2d.policy.canvas.DecorationPolicy.extend({
    NAME : "draw2d.policy.canvas.CoronaDecorationPolicy",
    init: function( attr, setter, getter){
        this.startDragX = 0;
        this.startDragY = 0;
        this.diameterToBeFullVisible = 0;
        this.diameterToBeVisible = 0;
        this.sumDiameter =0;
        this._super(
            $.extend({diameterToBeVisible: 200, diameterToBeFullVisible:20},attr) ,
            $.extend({
                diameterToBeVisible    : this.setDiameterToBeVisible,
                diameterToBeFullVisible : this.setDiameterToBeFullVisible
           },setter),
            $.extend({
                diameterToBeVisible    : this.getDiameterToBeVisible,
                diameterToBeFullVisible: this.getDiameterToBeFullVisible
           },getter)
        );
   },
   setDiameterToBeVisible: function(diameter)
   {
       this.diameterToBeVisible = diameter;
       this.sumDiameter = this.diameterToBeFullVisible + this.diameterToBeVisible;
   },
   getDiameterToBeVisible: function()
   {
	   return this.diameterToBeVisible;
   },
   setDiameterToBeFullVisible: function(diameter)
   {
       this.diameterToBeFullVisible = diameter;
       this.sumDiameter = this.diameterToBeFullVisible + this.diameterToBeVisible;
   },
   getDiameterToBeFullVisible: function()
   {
	   return this.diameterToBeFullVisible;
   },
    onInstall: function(canvas)
   {
       this._super(canvas);
        var figures = canvas.getFigures();
        figures.each(function(i,figure){
            figure.getPorts().each(function(i,p){
                p.setVisible(false);
            });
        });
    },
    onUninstall: function(canvas)
    {
        this._super(canvas);
        var figures = canvas.getFigures();
        figures.each(function(i,figure){
            figure.getPorts().each(function(i,p){
                if(p.__origAlpha){
                    p.setAlpha(p.__origAlpha);
                    delete p.__origAlpha;
                }
                p.setVisible(true);
            });
        });
    },
    onMouseDown: function(canvas, x, y, shiftKey, ctrlKey)
    {
        this.startDragX = x;
        this.startDragY = y;
    },
    onMouseMove: function(canvas, x, y, shiftKey, ctrlKey)
    {
        this.updatePorts(canvas, x, y);
    },
    onMouseDrag: function(canvas, dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
        this.updatePorts(canvas, this.startDragX+dx, this.startDragY+dy);
    },
    updatePorts: function(canvas,x,y)
    {
        var figures = canvas.getFigures();
        var _this=this;
        figures.each(function(i,figure){
            if(figure instanceof draw2d.shape.node.Node){
                if (figure.isVisible()===true && figure.hitTest(x, y, _this.sumDiameter) === true){
                    figure.getPorts().each(function(i,p){
                        if(p.isVisible()===false){
                            p.__origAlpha= figure.getAlpha();
                        }
                        var dist = figure.getBoundingBox().getDistance(new draw2d.geo.Point(x,y));
                        var alpha = 1-((100/(_this.diameterToBeVisible- _this.diameterToBeFullVisible))*dist)/100.0;
                        p.setAlpha(alpha);
                        p.setVisible(true);
                    });
                }
                else{
                    figure.getPorts().each(function(i,p){
                        if(p.__origAlpha){
                            p.setAlpha(p.__origAlpha);
                            delete p.__origAlpha;
                        }
                        p.setVisible(false);
                    });
                }
            }
        });
    }
});
draw2d.SnapToHelper = {};
draw2d.SnapToHelper.NORTH   =  1;
draw2d.SnapToHelper.SOUTH   =  4;
draw2d.SnapToHelper.WEST    =  8;
draw2d.SnapToHelper.EAST    = 16;
draw2d.SnapToHelper.CENTER_H= 32;
draw2d.SnapToHelper.CENTER_V= 642;
draw2d.SnapToHelper.NORTH_EAST  = draw2d.SnapToHelper.NORTH | draw2d.SnapToHelper.EAST;
draw2d.SnapToHelper.NORTH_WEST  = draw2d.SnapToHelper.NORTH | draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.SOUTH_EAST  = draw2d.SnapToHelper.SOUTH | draw2d.SnapToHelper.EAST;
draw2d.SnapToHelper.SOUTH_WEST  = draw2d.SnapToHelper.SOUTH | draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.NORTH_SOUTH = draw2d.SnapToHelper.NORTH | draw2d.SnapToHelper.SOUTH;
draw2d.SnapToHelper.EAST_WEST   = draw2d.SnapToHelper.EAST | draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.NSEW        = draw2d.SnapToHelper.NORTH_SOUTH | draw2d.SnapToHelper.EAST_WEST;
draw2d.policy.canvas.SnapToEditPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME : "draw2d.policy.canvas.SnapToEditPolicy",
    init: function( attr, setter, getter)
    {
        this.lineColor = null;
        this._super(
            $.extend({
                lineColor: "#51C1FC"
            },attr),
            $.extend({
                lineColor : this.setLineColor
            }, setter),
            $.extend({
                lineColor : this.getLineColor
            }, getter));
    },
    setLineColor: function( color)
    {
        this.lineColor = new draw2d.util.Color(color);
        return this;
    },
    getLineColor: function()
    {
        return this.lineColor;
    },
    snap: function(canvas, figure, modifiedPos, originalPos)
    {
        return modifiedPos;
    }
});
draw2d.policy.canvas.ShowGridEditPolicy = draw2d.policy.canvas.DecorationPolicy.extend({
    NAME : "draw2d.policy.canvas.ShowGridEditPolicy",
    GRID_COLOR  : "#f0f0f0",
    GRID_WIDTH  : 20,
    init: function( grid)
    {
        this.color = new draw2d.util.Color(this.GRID_COLOR);
        this.zoom=1;
        this.svg = null;
        this._super();
        if(typeof grid ==="number"){
            this.grid = grid;
        }
        else{
            this.grid = this.GRID_WIDTH;
        }
    },
	onInstall: function(canvas)
	{
        this._super(canvas);
	    this.zoom = canvas.getZoom();
        this.setGrid(this.grid);
	},
	onUninstall: function(canvas)
	{
        this._super(canvas);
        if(this.svg  !==null){
            this.svg.remove();
        }
	},
	setGridColor: function(color)
	{
	    this.color=new draw2d.util.Color(color);
        this.setGrid(this.grid);
	},
    setGrid: function(grid)
    {
        this.grid = grid;
        if(this.canvas !=null){
            if(this.svg  !==null){
                    this.svg.remove();
            }
            var r= this.canvas.paper;
            var d = this.grid, i;
            var w= r.width;
            var h = r.height;
            var props = {stroke: this.color.hash()};
            r.setStart();
                for (i = d+0.5; i < h; i += d) {
                    r.path([[ "M", 0, i], ["L", w, i]]).attr(props);
                }
                for (i = d+0.5; i < w; i += d) {
                    r.path([["M", i, 0], ["L", i, h]]).attr(props);
                }
            this.svg = r.setFinish();
            this.svg.toBack();
        }
    }
});
draw2d.policy.canvas.SnapToGridEditPolicy = draw2d.policy.canvas.ShowGridEditPolicy.extend({
    NAME : "draw2d.policy.canvas.SnapToGridEditPolicy",
    init: function( grid)
    {
        this._super(grid);
	},
    snap: function(canvas, figure, modifiedPos, originalPos)
    {
        if(figure instanceof draw2d.shape.basic.Line) {
            return modifiedPos;
        }
        var snapPoint = figure.getSnapToGridAnchor();
        modifiedPos.x= modifiedPos.x+snapPoint.x;
        modifiedPos.y= modifiedPos.y+snapPoint.y;
        modifiedPos.x = this.grid*Math.floor(((modifiedPos.x + this.grid/2.0) / this.grid));
        modifiedPos.y = this.grid*Math.floor(((modifiedPos.y + this.grid/2.0) / this.grid));
        modifiedPos.x= modifiedPos.x-snapPoint.x;
        modifiedPos.y= modifiedPos.y-snapPoint.y;
        return modifiedPos;
    }
});
draw2d.policy.canvas.ShowDotEditPolicy = draw2d.policy.canvas.DecorationPolicy.extend({
    NAME : "draw2d.policy.canvas.ShowDotEditPolicy",
    DOT_COLOR  : "#999999",
    DOT_RADIUS  : 1,
    DOT_DISTANCE : 20,
    init: function( dotDistance, dotRadius, dotColor)
    {
        this._super();
        this.dotDistance = dotDistance ? dotDistance : this.DOT_DISTANCE;
        this.dotRadius = dotRadius ? dotRadius : this.DOT_RADIUS;
        this.dotColor = new draw2d.util.Color(dotColor ? dotColor : this.DOT_COLOR);
        var mypixels = Array(this.dotDistance*this.dotDistance);
        mypixels[0] = 1;
        this.imageDataURL = this.createMonochromGif(this.dotDistance, this.dotDistance, mypixels, this.dotColor);
    },
    onInstall: function(canvas)
    {
        this._super(canvas);
        this.oldBg =  this.canvas.html.css("background-image");
        $(canvas.paper.canvas).css({"background-image": "url('"+this.imageDataURL+"')"});
    },
    onUninstall: function(canvas)
    {
        this._super(canvas);
        $(canvas.paper.canvas).css({"background-image": this.oldBg});
    }
});
draw2d.policy.canvas.SnapToGeometryEditPolicy = draw2d.policy.canvas.SnapToEditPolicy.extend({
    NAME : "draw2d.policy.canvas.SnapToGeometryEditPolicy",
    SNAP_THRESHOLD   : 3,
    FADEOUT_DURATION : 300,
    init: function( attr, setter, getter)
    {
        this._super(attr, setter,getter);
        this.rows=null;
        this.cols=null;
        this.vline = null;
        this.hline = null;
    },
    onMouseUp: function(figure, x, y, shiftKey, ctrlKey)
    {
        this.rows=null;
        this.cols=null;
        this.hideVerticalLine();
        this.hideHorizontalLine();
    },
    snap: function(canvas, figure, modifiedPos, originalPos)
    {
        if(figure instanceof draw2d.shape.basic.Line) {
            return modifiedPos;
        }
        var result;
        var allowXChanges = modifiedPos.x=== originalPos.x;
        var allowYChanges = modifiedPos.y=== originalPos.y;
        if(!allowXChanges && !allowYChanges){
            return modifiedPos;
        }
        if(figure instanceof draw2d.ResizeHandle)
        {
           var snapPoint = figure.getSnapToGridAnchor();
           modifiedPos.x+= snapPoint.x;
           modifiedPos.y+= snapPoint.y;
           var snapDirections = figure.getSnapToDirection();
            result = this.snapPoint(snapDirections, modifiedPos);
           if(allowXChanges && (snapDirections & draw2d.SnapToHelper.EAST_WEST) && !(result.edge & draw2d.SnapToHelper.EAST_WEST)) {
               this.showVerticalLine(figure, draw2d.SnapToHelper.WEST, result.point.x);
           }
           else {
               this.hideVerticalLine();
           }
           if(allowYChanges && (snapDirections & draw2d.SnapToHelper.NORTH_SOUTH) && !(result.edge & draw2d.SnapToHelper.NORTH_SOUTH)) {
               this.showHorizontalLine(figure, draw2d.SnapToHelper.NORTH, result.point.y);
           }
           else {
               this.hideHorizontalLine();
           }
           result.point.x= allowXChanges? result.point.x-snapPoint.x: modifiedPos.x;
           result.point.y= allowYChanges? result.point.y-snapPoint.y: modifiedPos.y;
           return result.point;
        }
        var inputBounds = new draw2d.geo.Rectangle(modifiedPos.x,modifiedPos.y, figure.getWidth(), figure.getHeight());
        result = this.snapRectangle( inputBounds);
        if(!allowXChanges){
            result.bounds.x= modifiedPos.x;
        }
        if(!allowYChanges){
            result.bounds.y=modifiedPos.y;
        }
        if(allowXChanges && !(result.edge & draw2d.SnapToHelper.WEST)) {
            this.showVerticalLine(figure, draw2d.SnapToHelper.WEST, result.bounds.x);
        }
        else if(allowXChanges && ! (result.edge & draw2d.SnapToHelper.EAST)) {
            this.showVerticalLine(figure, draw2d.SnapToHelper.EAST, result.bounds.x + result.bounds.getWidth());
        }
        else {
            this.hideVerticalLine();
        }
        if(allowYChanges && !(result.edge & draw2d.SnapToHelper.NORTH)) {
            this.showHorizontalLine(figure, draw2d.SnapToHelper.NORTH, result.bounds.y);
        }
        else if(allowYChanges && !(result.edge & draw2d.SnapToHelper.SOUTH)) {
            this.showHorizontalLine(figure, draw2d.SnapToHelper.SOUTH, result.bounds.y + result.bounds.getHeight());
        }
        else {
            this.hideHorizontalLine();
        }
        return result.bounds.getTopLeft();
    },
    snapRectangle: function(inputBounds)
    {
        var resultBounds = inputBounds.clone();
        var topLeft = this.snapPoint(draw2d.SnapToHelper.NORTH_WEST, inputBounds.getTopLeft());
        resultBounds.x = topLeft.point.x;
        resultBounds.y = topLeft.point.y;
        var bottomRight = this.snapPoint(draw2d.SnapToHelper.SOUTH_EAST, inputBounds.getBottomRight());
        if(topLeft.edge & draw2d.SnapToHelper.WEST) {
            resultBounds.x = bottomRight.point.x - inputBounds.getWidth();
        }
        if(topLeft.edge & draw2d.SnapToHelper.NORTH) {
            resultBounds.y = bottomRight.point.y - inputBounds.getHeight();
        }
        return {edge: topLeft.edge|bottomRight.edge , bounds:resultBounds};
    },
    snapPoint: function( snapOrientation,  inputPoint)
    {
        var resultPoint = inputPoint.clone();
       if(this.rows===null || this.cols===null)
         this.populateRowsAndCols();
       if ((snapOrientation & draw2d.SnapToHelper.EAST) !== 0) 
       {
          var rightCorrection = this.getCorrectionFor(this.cols, inputPoint.x +1, 1);
          if (rightCorrection !== this.SNAP_THRESHOLD) 
          {
             snapOrientation &= ~draw2d.SnapToHelper.EAST;
             resultPoint.x += rightCorrection;
          }
       }
       if ((snapOrientation & draw2d.SnapToHelper.WEST) !== 0) 
       {
          var leftCorrection = this.getCorrectionFor(this.cols, inputPoint.x, -1);
          if (leftCorrection !== this.SNAP_THRESHOLD) 
          {
             snapOrientation &= ~draw2d.SnapToHelper.WEST;
             resultPoint.x += leftCorrection;
          }
       }
       if ((snapOrientation & draw2d.SnapToHelper.SOUTH) !== 0) 
       {
          var bottomCorrection = this.getCorrectionFor(this.rows,  inputPoint.y +1, 1);
          if (bottomCorrection !== this.SNAP_THRESHOLD) 
          {
             snapOrientation &= ~draw2d.SnapToHelper.SOUTH;
             resultPoint.y += bottomCorrection;
          }
       }
       if ((snapOrientation & draw2d.SnapToHelper.NORTH) !== 0) 
       {
          var topCorrection = this.getCorrectionFor(this.rows, inputPoint.y, -1);
          if (topCorrection !== this.SNAP_THRESHOLD) 
          {
             snapOrientation &= ~draw2d.SnapToHelper.NORTH;
             resultPoint.y += topCorrection;
          }
       }
       return {edge: snapOrientation, point: resultPoint};
    },
    populateRowsAndCols: function()
    {
       var selection = this.canvas.getSelection();
       this.rows = [];
       this.cols = [];
       var figures = this.canvas.getFigures();
       for (var i = 0; i < figures.getSize();i++ )
       {
          var figure = figures.get(i);
          if(!selection.contains(figure, true))
          {
             var bounds = figure.getBoundingBox();
             this.cols.push({type:-1, location: bounds.x});
             this.cols.push({type:0 , location: bounds.x + (bounds.w - 1) / 2});
             this.cols.push({type:1 , location: bounds.getRight() +1 });
             this.rows.push({type:-1, location: bounds.y});
             this.rows.push({type:0 , location: bounds.y + (bounds.h - 1) / 2});
             this.rows.push({type:1 , location: bounds.getBottom()+1 });
         }
       }
    },
    getCorrectionFor: function( entries,  value,  side)
    {
       var resultMag = this.SNAP_THRESHOLD;
       var result = this.SNAP_THRESHOLD;
       for (var i = 0; i < entries.length; i++) 
       {
          var entry = entries[i];
          var magnitude;
          if (entry.type === -1 && side !== 0) 
          {
             magnitude = Math.abs(value - entry.location);
             if (magnitude < resultMag)
             {
                   resultMag = magnitude;
                   result = entry.location - value;
             }
          }
          else if (entry.type === 0 && side === 0) 
          {
             magnitude = Math.abs(value - entry.location);
             if (magnitude < resultMag)
             {
                resultMag = magnitude;
                result = entry.location - value;
             }
          }
          else if (entry.type === 1 && side !== 0) 
          {
             magnitude = Math.abs(value - entry.location);
             if (magnitude < resultMag)
             {
                resultMag = magnitude;
                result = entry.location - value;
             }
          }
       }
       return result;
    },
    showVerticalLine: function(causedFigure, edge, x)
    {
        if(this.vline!=null){
            this.vline.stop();
            this.vline.remove();
        }
        var figures = this.canvas.getFigures().clone();
        figures.removeAll(this.canvas.getSelection().getAll(true));
        figures.map(function(figure){
            return figure.getBoundingBox();
        });
        figures.grep(function(bbox){
            return (Math.abs(bbox.x-x)<=1) || (Math.abs(bbox.getRight()-x)<=1);
        });
        if(figures.getSize()===0){
            return;
        }
        var causedBox  = causedFigure.getBoundingBox();
        var causedCenter  = causedBox.getCenter();
        figures.sort(function(a,b){
            var d_a = a.getCenter().getDistance(causedCenter);
            var d_b = b.getCenter().getDistance(causedCenter);
            return d_a-d_b;
        });
        var fromY = 0;
        var maxLength= this.canvas.getHeight()*Math.max(1,this.canvas.getZoom());
        var yLength  = maxLength;
        var snappedBox = figures.get(0);
        if(causedBox.y <snappedBox.y){
            fromY   = causedBox.y;
            yLength = snappedBox.getBottom()-causedBox.y;
        }
        else{
            fromY   = snappedBox.y;
            yLength = causedBox.getBottom()-snappedBox.y;
        }
        x=(x|0)+0.5; 
        this.canvas.paper.setStart();
        this.canvas.paper.path("M " + x + " 0 l 0 " + maxLength)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M " + x + " "+fromY+" l 0 " + yLength)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.vline = this.canvas.paper.setFinish();
        this.vline.toBack();
    },
    hideVerticalLine: function()
    {
        if(this.vline==null){
            return;
        }
        this.vline.animate(
            {opacity: 0.1},
            this.FADEOUT_DURATION,
            $.proxy(function(){
                if(this.vline!==null) {
                    this.vline.remove();
                    this.vline = null;
                }
            },this)
        );
    },
    showHorizontalLine: function(causedFigure, edge, y)
    {
        if(this.hline!=null){
            this.hline.stop();
            this.hline.remove();
        }
        var figures = this.canvas.getFigures().clone();
        figures.removeAll(this.canvas.getSelection().getAll(true));
        figures.map(function(figure){
            return figure.getBoundingBox();
        });
        figures.grep(function(bbox){
            return (Math.abs(bbox.y-y)<=1) || (Math.abs(bbox.getBottom()-y)<=1);
        });
        if(figures.getSize()===0){
            return;
        }
        var causedBox  = causedFigure.getBoundingBox();
        var causedCenter  = causedBox.getCenter();
        figures.sort(function(a,b){
            var d_a = a.getCenter().getDistance(causedCenter);
            var d_b = b.getCenter().getDistance(causedCenter);
            return d_a-d_b;
        });
        var fromX = 0;
        var maxLength;
        var xLength  = maxLength = this.canvas.getWidth()*Math.max(1,this.canvas.getZoom());
        var snappedBox = figures.get(0);
        if(causedBox.x <snappedBox.x){
            fromX   = causedBox.x;
            xLength = snappedBox.getRight()-causedBox.x;
        }
        else{
            fromX   = snappedBox.x;
            xLength = causedBox.getRight()-snappedBox.x;
        }
        y=(y|0)+0.5; 
        this.canvas.paper.setStart();
        this.canvas.paper.path("M 0 "+y+ " l " + maxLength+" 0")
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M "+fromX+" " + y + " l " + xLength + " 0")
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.hline = this.canvas.paper.setFinish();
        this.hline.toBack();
    },
    hideHorizontalLine: function()
    {
        if(this.hline===null){
            return; 
        }
        this.hline.animate(
            {opacity: 0.1},
            this.FADEOUT_DURATION,
            $.proxy(function(){
                if(this.hline!==null) {
                    this.hline.remove();
                    this.hline = null;
                }
            },this)
        );
    }
});
draw2d.policy.canvas.SnapToVerticesEditPolicy = draw2d.policy.canvas.SnapToEditPolicy.extend({
    NAME : "draw2d.policy.canvas.SnapToVerticesEditPolicy",
    SNAP_THRESHOLD   : 3,
    FADEOUT_DURATION : 300,
    init: function( attr, setter, getter)
    {
        this._super(attr, setter,getter);
        this.constraints = null;
        this.vline = null;
        this.hline = null;
    },
    onMouseUp: function(figure, x, y, shiftKey, ctrlKey)
    {
        this.constraints = null;
        this.hideVerticalLine();
        this.hideHorizontalLine();
    },
    snap: function(canvas, figure, modifiedPos, originalPos)
    {
        if(!(figure instanceof draw2d.shape.basic.VertexResizeHandle)){
            return modifiedPos;
        }
        var allowXChanges = modifiedPos.x=== originalPos.x;
        var allowYChanges = modifiedPos.y=== originalPos.y;
        if(!allowXChanges && !allowYChanges){
            return modifiedPos;
        }
        var result = modifiedPos.clone();
        var correction  = this.getCorrectionFor(figure, originalPos);
        if(allowXChanges && (correction.vertical.x !==Number.MAX_SAFE_INTEGER)) {
            result.x = correction.vertical.x;
            this.showVerticalLine(originalPos, correction.vertical);
        }
        else {
            this.hideVerticalLine();
        }
        if(allowYChanges && (correction.horizontal.y !==Number.MAX_SAFE_INTEGER)) {
            result.y = correction.horizontal.y;
            this.showHorizontalLine(originalPos, correction.horizontal);
        }
        else {
            this.hideHorizontalLine();
        }
        return result;
    },
    getCorrectionFor: function(vertexResizeHandle, point)
    {
        var _this =this;
        if(this.constraints===null) {
            this.constraints = [];
            var lines = this.canvas.getLines();
            lines.each(function (i, line) {
                line.getVertices().each(function (ii, vertex) {
                    if(vertexResizeHandle.index!==ii || vertexResizeHandle.owner!==line)
                        _this.constraints.push(vertex);
                });
            });
        }
        var SNAP = this.SNAP_THRESHOLD;
        var vertical   = {x:Number.MAX_SAFE_INTEGER, y:Number.MAX_SAFE_INTEGER, diffy:Number.MAX_SAFE_INTEGER};
        var horizontal = {x:Number.MAX_SAFE_INTEGER, y:Number.MAX_SAFE_INTEGER, diffx:Number.MAX_SAFE_INTEGER};
        var diffx, diffy;
        for (var i = 0; i < this.constraints.length; i++) {
           var entry = this.constraints[i];
           diffx = Math.abs(point.x - entry.x);
           diffy = Math.abs(point.y - entry.y);
           if (diffx < SNAP) {
             if(diffy<vertical.diffy){
                 vertical   = {x:entry.x, y:entry.y, diffy:diffy};
             }
           }
           if (diffy < SNAP) {
               if(diffx<horizontal.diffx){
                   horizontal = {x:entry.x, y:entry.y, diffx:diffx};
               }
           }
       }
       return {vertical:vertical, horizontal:horizontal};
    },
    showVerticalLine: function(originalPos, snappedPos)
    {
        if(this.vline!=null){
            this.vline.stop();
            this.vline.remove();
        }
        var maxLength = this.canvas.getHeight();
        var x=(snappedPos.x|0)+0.5; 
        this.canvas.paper.setStart();
        this.canvas.paper.path("M " + x + " 0 l 0 " + maxLength)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M " + x + " "+originalPos.y+" L "+x+" " + snappedPos.y)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.vline = this.canvas.paper.setFinish();
        this.vline.toBack();
    },
    hideVerticalLine: function()
    {
        if(this.vline==null){
            return;
        }
        this.vline.animate(
            {opacity: 0.1},
            this.FADEOUT_DURATION,
            $.proxy(function(){
                if(this.vline!==null) {
                    this.vline.remove();
                    this.vline = null;
                }
            },this)
        );
    },
    showHorizontalLine: function(originalPos, snappedPos)
    {
        if(this.hline!=null) {
            this.hline.stop();
            this.hline.remove();
        }
        var maxLength = this.canvas.getWidth();
        var y=(snappedPos.y|0)+0.5; 
        this.canvas.paper.setStart();
        this.canvas.paper.path("M 0 "+y+ " l " + maxLength+" 0")
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M "+originalPos.x+" " + y + " L " + snappedPos.x + " "+y)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.hline = this.canvas.paper.setFinish();
        this.hline.toBack();
    },
    hideHorizontalLine: function()
    {
        if(this.hline===null){
            return; 
        }
        this.hline.animate(
            {opacity: 0.1},
            this.FADEOUT_DURATION,
            $.proxy(function(){
                if(this.hline!==null) {
                    this.hline.remove();
                    this.hline = null;
                }
            },this)
        );
    }
});
draw2d.policy.canvas.SnapToInBetweenEditPolicy = draw2d.policy.canvas.SnapToEditPolicy.extend({
    NAME : "draw2d.policy.canvas.SnapToInBetweenEditPolicy",
    SNAP_THRESHOLD   : 5,
    FADEOUT_DURATION : 500,
    init: function( attr, setter, getter){
        this._super(attr, setter, getter);
        this.bounds=null;
        this.horizontalGuideLines = null;
        this.verticalGuideLines = null;
    },
    onMouseUp: function(figure, x, y, shiftKey, ctrlKey)
    {
        this.bounds=null;
        this.hideHorizontalGuides(false);
        this.hideVerticalGuides(false);
    },
    snap: function(canvas, figure, modifiedPos, originalPos)
    {
        if(figure instanceof draw2d.ResizeHandle) {
           return modifiedPos;
        }
        if(figure instanceof draw2d.shape.basic.Line) {
            return modifiedPos;
        }
        var allowXChanges = modifiedPos.x=== originalPos.x;
        var allowYChanges = modifiedPos.y=== originalPos.y;
        var inputBounds = new draw2d.geo.Rectangle(modifiedPos.x,modifiedPos.y, figure.getWidth(), figure.getHeight());
        modifiedPos = modifiedPos.clone();
        if(allowXChanges===true) {
            var horizontal = this.snapHorizontal(inputBounds);
            if (horizontal.snapped) {
                this.showHorizontalGuides(figure, horizontal);
                modifiedPos.x += horizontal.diff;
            }
            else {
                this.hideHorizontalGuides(true);
            }
        }
        else{
            this.hideHorizontalGuides(true);
        }
        if(allowYChanges===true) {
            var vertical = this.snapVertical(inputBounds);
            if (vertical.snapped) {
                this.showVerticalGuides(figure, vertical);
                modifiedPos.y += vertical.diff;
            }
            else {
                this.hideVerticalGuides(true);
            }
        }
        else{
            this.hideVerticalGuides(true);
        }
        return modifiedPos;
    },
    snapHorizontal: function( boundingBox )
    {
        var center = boundingBox.getCenter();
        if(this.bounds===null)
         this.populateBounds();
        var result = {
            point:center,
            snapped:false,
            snappedBox : boundingBox.clone()
        };
        var intersectionPoint=null;
        var leftIntersections = [];
        var leftInputPoint = center.clone();
        leftInputPoint.x=0;
        this.bounds.forEach(function( bbox,index){
            intersectionPoint =  draw2d.shape.basic.Line.intersection(bbox.getTopRight(), bbox.getBottomRight(), center, leftInputPoint);
            if (intersectionPoint !== null) {
                intersectionPoint.causedBBox = bbox;
                leftIntersections.push(intersectionPoint);
            }
        });
        if(leftIntersections.length===0){
            return result;
        }
        leftIntersections.sort(function(a, b) {
            return b.x - a.x;
        });
        var rightIntersections= [];
        var rightInputPoint = center.clone();
        rightInputPoint.x= Number.MAX_SAFE_INTEGER;
        this.bounds.forEach(function( bbox,index){
            intersectionPoint =  draw2d.shape.basic.Line.intersection(bbox.getTopLeft(), bbox.getBottomLeft(), center, rightInputPoint);
            if (intersectionPoint !== null) {
                intersectionPoint.causedBBox = bbox;
                rightIntersections.push(intersectionPoint);
            }
        });
        if(rightIntersections.length===0){
            return result;
        }
        rightIntersections.sort(function(a, b) {
            return a.x - b.x;
        });
        var snappedRect = boundingBox.clone();
        var diff = ((leftIntersections[0].x + rightIntersections[0].x)/2)-center.x;
        snappedRect.x +=diff;
        return {snapped: Math.abs(diff)<this.SNAP_THRESHOLD, snappedRect:snappedRect, diff:diff, leftSide:leftIntersections[0], rightSide:rightIntersections[0]};
    },
    snapVertical: function( boundingBox )
    {
        var center = boundingBox.getCenter();
        if(this.bounds===null) {
            this.populateBounds();
        }
        var result = {
            point:center,
            snapped:false,
            snappedBox : boundingBox.clone()
        };
        var intersectionPoint=null;
        var topIntersections = [];
        var topInputPoint = center.clone();
        topInputPoint.y=0;
        this.bounds.forEach(function( bbox){
            intersectionPoint =  draw2d.shape.basic.Line.intersection(bbox.getBottomLeft(), bbox.getBottomRight(), center, topInputPoint);
            if (intersectionPoint !== null) {
                intersectionPoint.causedBBox = bbox;
                topIntersections.push(intersectionPoint);
            }
        });
        if(topIntersections.length===0){
            return result;
        }
        topIntersections.sort(function(a, b) {
            return b.y - a.y;
        });
        var bottomIntersections= [];
        var bottomInputPoint = center.clone();
        bottomInputPoint.y= Number.MAX_SAFE_INTEGER;
        this.bounds.forEach(function( bbox){
            intersectionPoint =  draw2d.shape.basic.Line.intersection(bbox.getTopLeft(), bbox.getTopRight(), center, bottomInputPoint);
            if (intersectionPoint !== null) {
                intersectionPoint.causedBBox = bbox;
                bottomIntersections.push(intersectionPoint);
            }
        });
        if(bottomIntersections.length===0){
            return result;
        }
        bottomIntersections.sort(function(a, b) {
            return a.y - b.y;
        });
        var snappedRect = boundingBox.clone();
        var diff = ((topIntersections[0].y + bottomIntersections[0].y)/2)-center.y;
        snappedRect.y +=diff;
        return {snapped: Math.abs(diff)<this.SNAP_THRESHOLD, snappedRect:snappedRect, diff:diff, topSide:topIntersections[0], bottomSide:bottomIntersections[0]};
    },
    populateBounds: function()
    {
       var selection = this.canvas.getSelection().getAll(true);
       var bounds = this.bounds = [];
       var figures = this.canvas.getFigures();
       figures.each(function(index,figure){
          if(!selection.contains(figure)){
             bounds.push(figure.getBoundingBox());
         }
       });
    },
    showHorizontalGuides: function(causedFigure, constraint)
    {
        if(this.horizontalGuideLines!=null){
            this.horizontalGuideLines.stop();
            this.horizontalGuideLines.remove();
        }
        var snapTopLeft  = constraint.snappedRect.getTopLeft();
        var snapTopRight = constraint.snappedRect.getTopRight();
        var y = ((Math.min(constraint.leftSide.causedBBox.getTopRight().y,Math.min(constraint.rightSide.causedBBox.y,causedFigure.getY()))-50)|0)+0.5;
        this.canvas.paper.setStart();
        this.canvas.paper.path("M " + ((constraint.leftSide.x|0)+0.5)   + " "+y+" L "+((constraint.leftSide.x|0)+0.5) + " "  + constraint.leftSide.y)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});;
        this.canvas.paper.path("M " + ((snapTopLeft.x |0)+0.5)  + " "+y+" L "+((snapTopLeft.x|0)+0.5) + " "  + snapTopLeft.y)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});;
        this.canvas.paper.path("M " + ((snapTopRight.x|0)+0.5)   + " "+y+" L "+((snapTopRight.x|0)+0.5) + " "  + snapTopRight.y)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});;
        this.canvas.paper.path("M " + ((constraint.rightSide.x|0)+0.5)  + " "+y+" L "+((constraint.rightSide.x|0)+0.5)+ " "  + constraint.rightSide.y)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});;
        this.canvas.paper.path("M " + (constraint.leftSide.x)   + " "+(y+5)+" L "+(snapTopLeft.x)+ " "  + (y+5)).attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path("M " + (constraint.rightSide.x)  + " "+(y+5)+" L "+(snapTopRight.x)+ " "  + (y+5)).attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path(
              " M " + (constraint.leftSide.x+5) + " "+(y)
             +" L " + (constraint.leftSide.x) + " "+(y+5)
             +" L " + (constraint.leftSide.x+5) + " "+(y+10))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path(
             " M " + (snapTopLeft.x-5) + " "+(y)
            +" L " + (snapTopLeft.x) + " "+(y+5)
            +" L " + (snapTopLeft.x-5) + " "+(y+10))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path(
             " M " + (snapTopRight.x+5) + " "+(y)
            +" L " + (snapTopRight.x) + " "+(y+5)
            +" L " + (snapTopRight.x+5) + " "+(y+10))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path(
             " M " + (constraint.rightSide.x-5) + " "+(y)
            +" L " + (constraint.rightSide.x) + " "+(y+5)
            +" L " + (constraint.rightSide.x-5) + " "+(y+10))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.horizontalGuideLines = this.canvas.paper.setFinish();
        this.horizontalGuideLines.toFront();
    },
    hideHorizontalGuides: function( fast)
    {
        if(this.horizontalGuideLines==null){
            return;
        }
        if(fast===true) {
            if (this.horizontalGuideLines !== null) {
                this.horizontalGuideLines.remove();
                this.horizontalGuideLines = null;
            }
        }
        else {
            this.horizontalGuideLines.animate(
                {opacity: 0.1},
                this.FADEOUT_DURATION,
                $.proxy(function () {
                    if (this.horizontalGuideLines !== null) {
                        this.horizontalGuideLines.remove();
                        this.horizontalGuideLines = null;
                    }
                }, this)
            );
        }
    },
    showVerticalGuides: function(causedFigure, constraint)
    {
        if(this.verticalGuideLines!=null){
            this.verticalGuideLines.stop();
            this.verticalGuideLines.remove();
        }
        var snapTopRight    = constraint.snappedRect.getTopRight();
        var snapBottomRight = constraint.snappedRect.getBottomRight();
        var x = ((Math.max(constraint.topSide.causedBBox.getRight(),Math.max(constraint.bottomSide.causedBBox.getRight(),causedFigure.getX()))+40)|0)+0.5;
        this.canvas.paper.setStart();
        this.canvas.paper.path("M " + x + " "+((constraint.topSide.y|0)+0.5)+" L "+((constraint.topSide.x|0)+0.5) + " "  + ((constraint.topSide.y|0)+0.5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M " + x + " "+((snapTopRight.y|0)+0.5)+" L "+((snapTopRight.x|0)+0.5) + " "  + ((snapTopRight.y|0)+0.5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M " + x + " "+((snapBottomRight.y|0)+0.5)+" L "+((snapBottomRight.x|0)+0.5) + " "  + ((snapBottomRight.y|0)+0.5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M " + x   + " "+((constraint.bottomSide.y|0)+0.5)+" L "+((constraint.bottomSide.x|0)+0.5) + " "  + ((constraint.bottomSide.y|0)+0.5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M " + (x-5)  + " "+(((constraint.topSide.y|0)+0.5))+" L "+(x-5)+ " "  +((snapTopRight.y|0)+0.5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path("M " + (x-5)  + " "+(((constraint.bottomSide.y|0)+0.5))+" L "+(x-5)+ " "  +((snapBottomRight.y|0)+0.5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path(
             " M " + (x-10)+ " "+(constraint.topSide.y+5)
            +" L " + (x-5) + " "+(constraint.topSide.y)
            +" L " + (x)   + " "+(constraint.topSide.y+5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path(
             " M " + (x-10)+ " "+(snapTopRight.y-5)
            +" L " + (x-5) + " "+(snapTopRight.y)
            +" L " + (x)   + " "+(snapTopRight.y-5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path(
             " M " + (x-10)+ " "+(snapBottomRight.y+5)
            +" L " + (x-5) + " "+(snapBottomRight.y)
            +" L " + (x)   + " "+(snapBottomRight.y+5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.canvas.paper.path(
             " M " + (x-10)+ " "+(constraint.bottomSide.y-5)
            +" L " + (x-5) + " "+(constraint.bottomSide.y)
            +" L " + (x)   + " "+(constraint.bottomSide.y-5))
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.verticalGuideLines = this.canvas.paper.setFinish();
        this.verticalGuideLines.toFront();
    },
    hideVerticalGuides: function()
    {
        if(this.verticalGuideLines==null){
            return; 
        }
        this.verticalGuideLines.animate(
            {opacity: 0.1},
            this.FADEOUT_DURATION,
            $.proxy(function(){
                if(this.verticalGuideLines!==null) {
                    this.verticalGuideLines.remove();
                    this.verticalGuideLines = null;
                }
            },this)
        );
    }
});
draw2d.policy.canvas.SnapToCenterEditPolicy = draw2d.policy.canvas.SnapToEditPolicy.extend({
    NAME : "draw2d.policy.canvas.SnapToCenterEditPolicy",
    SNAP_THRESHOLD   : 5,
    FADEOUT_DURATION : 500,
    init: function( attr, setter, getter)
    {
        this._super(attr, setter, getter);
        this.centers=null;
        this.horizontalGuideLines = null;
        this.verticalGuideLines = null;
    },
    onMouseUp: function(figure, x, y, shiftKey, ctrlKey)
    {
        this.centers=null;
        this.hideHorizontalGuides(false);
        this.hideVerticalGuides(false);
    },
    snap: function(canvas, figure, modifiedPos, originalPos)
    {
        if(figure instanceof draw2d.ResizeHandle) {
           return modifiedPos;
        }
        if(figure instanceof draw2d.shape.basic.Line) {
            return modifiedPos;
        }
        var allowXChanges = modifiedPos.x=== originalPos.x;
        var allowYChanges = modifiedPos.y=== originalPos.y;
        var inputBounds = new draw2d.geo.Rectangle(modifiedPos.x,modifiedPos.y, figure.getWidth(), figure.getHeight());
        var inputCenter = inputBounds.getCenter();
        modifiedPos = modifiedPos.clone();
        if(allowXChanges===true) {
            var horizontal = this.snapHorizontal(inputCenter);
            if (horizontal.snapped) {
                this.showHorizontalGuides(figure, horizontal);
                modifiedPos.y += horizontal.diff;
            }
            else {
                this.hideHorizontalGuides(true);
            }
        }
        else{
            this.hideHorizontalGuides(true);
        }
        if(allowYChanges===true) {
            var vertical = this.snapVertical(inputCenter);
            if (vertical.snapped) {
                this.showVerticalGuides(figure, vertical);
                modifiedPos.x += vertical.diff;
            }
            else {
                this.hideVerticalGuides(true);
            }
        }
        else{
            this.hideVerticalGuides(true);
        }
        return modifiedPos;
    },
    snapVertical: function( center  )
    {
        var _this = this;
        if(this.centers===null) {
            this.populateCenters();
        }
        var result = {
            point:center,
            snapped:false,
            diff : 0
        };
        var candidates= [];
        this.centers.forEach(function( point){
            if(Math.abs(point.x - center.x)<_this.SNAP_THRESHOLD){
                candidates.push(point);
            }
        });
        if(candidates.length===0){
            return result;
        }
        candidates.sort(function(a, b) {
            return a.x - b.x;
        });
        var diff = candidates[0].x -center.x;
        var snappedPoint = center.clone();
        snappedPoint.x +=diff;
        return {snapped: true, diff:diff, point:candidates[0], snappedPoint:snappedPoint};
    },
    snapHorizontal: function( center  )
    {
        var _this = this;
        if(this.centers===null) {
            this.populateCenters();
        }
        var result = {
            point:center,
            snapped:false,
            diff : 0
        };
        var candidates= [];
        this.centers.forEach(function( point){
            if(Math.abs(point.y - center.y)<_this.SNAP_THRESHOLD){
                candidates.push(point);
            }
        });
        if(candidates.length===0){
            return result;
        }
        candidates.sort(function(a, b) {
            return a.y - b.y;
        });
        var diff = candidates[0].y -center.y;
        var snappedPoint = center.clone();
        snappedPoint.y +=diff;
        return {snapped: true, diff:diff, point:candidates[0], snappedPoint:snappedPoint};
    },
    populateCenters: function()
    {
       var selection = this.canvas.getSelection().getAll(true);
       var centers = this.centers = [];
       var figures = this.canvas.getFigures();
       figures.each(function(index, figure){
          if(!selection.contains(figure)){
             centers.push(figure.getBoundingBox().getCenter());
         }
       });
    },
    showHorizontalGuides: function(causedFigure, constraint)
    {
        if(this.horizontalGuideLines!==null){
            this.horizontalGuideLines.stop();
            this.horizontalGuideLines.remove();
        }
        var start  = constraint.point;
        var end    = constraint.snappedPoint;
        this.canvas.paper.setStart();
        this.canvas.paper.path("M " + (start.x)  + " "+((start.y|0)+0.5)+" L "+(end.x)+ " "  + ((end.y|0)+0.5)).attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.horizontalGuideLines = this.canvas.paper.setFinish();
        this.horizontalGuideLines.toFront();
    },
    hideHorizontalGuides: function( fast)
    {
        if(this.horizontalGuideLines===null){
            return;
        }
        if(fast===true) {
            if (this.horizontalGuideLines !== null) {
                this.horizontalGuideLines.remove();
                this.horizontalGuideLines = null;
            }
        }
        else {
            this.horizontalGuideLines.animate(
                {opacity: 0.1},
                this.FADEOUT_DURATION,
                $.proxy(function () {
                    if (this.horizontalGuideLines !== null) {
                        this.horizontalGuideLines.remove();
                        this.horizontalGuideLines = null;
                    }
                }, this)
            );
        }
    },
    showVerticalGuides: function(causedFigure, constraint)
    {
        if(this.verticalGuideLines!==null){
            this.verticalGuideLines.stop();
            this.verticalGuideLines.remove();
        }
        var start  = constraint.point;
        var end    = constraint.snappedPoint;
        this.canvas.paper.setStart();
        this.canvas.paper.path("M " + ((start.x|0)+0.5)  + " "+(start.y)+" L "+((end.x|0)+0.5)+ " "  + (end.y)).attr({"stroke":this.lineColor.hash(),"stroke-width":1});
        this.verticalGuideLines = this.canvas.paper.setFinish();
        this.verticalGuideLines.toFront();
    },
    hideVerticalGuides: function( fast)
    {
        if(this.verticalGuideLines===null){
            return;
        }
        if(fast===true) {
            if (this.verticalGuideLines !== null) {
                this.verticalGuideLines.remove();
                this.verticalGuideLines = null;
            }
        }
        else {
            this.verticalGuideLines.animate(
                {opacity: 0.1},
                this.FADEOUT_DURATION,
                $.proxy(function () {
                    if (this.verticalGuideLines !== null) {
                        this.verticalGuideLines.remove();
                        this.verticalGuideLines = null;
                    }
                }, this)
            );
        }
    }
});
draw2d.policy.canvas.DropInterceptorPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME : "draw2d.policy.canvas.DropInterceptorPolicy",
    init: function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
    },
    delegateTarget: function(connectInquirer, connectIntent)
    {
    	if(!(connectInquirer instanceof draw2d.Port) && connectIntent instanceof draw2d.shape.composite.StrongComposite){
    		return connectIntent;
    	}
    	if(!(connectIntent instanceof draw2d.Port) || !(connectInquirer instanceof draw2d.Port)){
    		return null;
    	}
    	if(connectIntent.getConnections().getSize() >= connectIntent.getMaxFanOut()){
    	    return null;
    	}
        if (connectInquirer instanceof draw2d.OutputPort && connectIntent instanceof draw2d.OutputPort) {
            return null;
        }
        if (connectInquirer instanceof draw2d.InputPort && connectIntent instanceof draw2d.InputPort) {
            return null;
        }
        if((connectInquirer instanceof draw2d.Port) && (connectIntent instanceof draw2d.Port)){
	        if(connectInquirer.getParent() === connectIntent.getParent()){
	            return null;
	         }
        }
        if((connectInquirer instanceof draw2d.Port) && (connectIntent instanceof draw2d.shape.node.Hub)) {
            return connectIntent.getHybridPort(0);
        }
        return connectIntent;
    }
});
draw2d.policy.connection.ConnectionCreatePolicy = draw2d.policy.canvas.KeyboardPolicy.extend({
    NAME : "draw2d.policy.connection.ConnectionCreatePolicy",
    init: function(attr, setter, getter)
    {
        this._super( attr,setter,getter);
    },
    createConnection:function()
    {
        return new draw2d.Connection({
            router: new draw2d.layout.connection.DirectRouter()
        });
    },
    ripple: function(x,y, type)
    {
        switch(type){
            case 0:
                var circle = this.canvas.paper.circle(x, y, 3, 3).attr({fill: null, stroke:"#d0d0ff"});
                var anim = Raphael.animation(
                    {transform: "s6", opacity:0.0, "stroke-width":3 },
                    500,
                    "linear",
                    function(){circle.remove()}
                );
                circle.animate(anim);
                return this.canvas.paper.set();
                break;
            case 1:
                var circle1 = this.canvas.paper.circle(x, y, 3, 3).attr({fill: null, stroke:"#3f72bf"});
                var circle2 = this.canvas.paper.circle(x, y, 3, 3).attr({fill: null, stroke:"#ff0000"});
                var anim1 = Raphael.animation(
                    {transform: "s6", opacity:0.0, "stroke-width":1 },
                    1200,
                    "linear"
                ).repeat(Infinity);
                circle1.animate(anim1);
                var anim2 = Raphael.animation(
                    {transform: "s12", opacity:0.0, "stroke-width":4 },
                    500,
                    "linear",
                    function(){circle2.remove()}
                );
                circle2.animate(anim2);
                return circle1;
                break;
        }
    }
});
draw2d.policy.connection.ComposedConnectionCreatePolicy = draw2d.policy.connection.ConnectionCreatePolicy.extend({
    NAME : "draw2d.policy.connection.ComposedConnectionCreatePolicy",
    init: function( policies )
    {
        this.policies = policies;
        this._super();
    },
    onMouseDown: function()
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onMouseDown.apply(p,_arg);
        });
    },
    onMouseDrag: function()
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onMouseDrag.apply(p,_arg);
        });
    },
    onMouseUp: function()
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onMouseUp.apply(p,_arg);
        });
    },
    onClick: function()
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onClick.apply(p,_arg);
        });
    },
    onMouseMove: function()
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onMouseMove.apply(p,_arg);
        });
    },
    onKeyUp: function(canvas, keyCode, shiftKey, ctrlKey)
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onKeyUp.apply(p,_arg);
        });
    },
    onKeyDown: function(canvas, keyCode, shiftKey, ctrlKey)
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onKeyDown.apply(p,_arg);
        });
    },
    onInstall: function(canvas)
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onInstall.apply(p,_arg);
        });
    },
    onUninstall: function(canvas)
    {
        var _arg = arguments;
        $.each(this.policies, function(i,p){
            p.onUninstall.apply(p,_arg);
        });
    }
});
draw2d.policy.connection.ClickConnectionCreatePolicy = draw2d.policy.connection.ConnectionCreatePolicy.extend({
    NAME : "draw2d.policy.connection.ClickConnectionCreatePolicy",
    init: function(attr, setter, getter)
    {
        this._super( attr, setter, getter);
        this.port1 = null;
        this.beeline = null;
        this.pulse= null;
        this.tempConnection = null;
        this.vertices = [];
    },
    onClick: function(figure, x, y, shiftKey, ctrlKey)
    {
        var _this = this;
        var port = figure;
        if(port === null && this.port1 === null){
            return;
        }
        if(port===null){
            this.vertices.push(new draw2d.geo.Point(x,y));
            this.beeline.setStartPosition(x,y);
            this.tempConnection.setVertices(this.vertices);
            if(this.pulse!==null) {
                this.pulse.remove();
                this.pulse = null;
            }
            this.ripple(x,y,0);
            return;
        }
        if(!(port instanceof draw2d.Port)){
            return;
        }
        if(this.port1===null){
            var canvas = port.getCanvas();
            this.port1 = port;
            this.vertices.push(port.getAbsolutePosition());
            this.beeline = new draw2d.shape.basic.Line({
                start: this.port1.getAbsolutePosition(),
                end: this.port1.getAbsolutePosition(),
                dasharray:"- ",
                color:"#2C70FF"
            });
            this.beeline.hide= function(){
                _this.beeline.setCanvas(null);
            };
            this.beeline.show= function(canvas){
                _this.beeline.setCanvas(canvas);
                _this.beeline.shape.toFront();
            };
            this.beeline.show(canvas);
            this.tempConnection = new draw2d.shape.basic.PolyLine({
                start: this.port1.getAbsolutePosition(),
                end: this.port1.getAbsolutePosition(),
                stroke:2,
                color:"#2C70FF"
            });
            this.tempConnection.hide= function(){
                _this.tempConnection.setCanvas(null);
            };
            this.tempConnection.show= function(canvas){
                _this.tempConnection.setCanvas(canvas);
                _this.tempConnection.shape.toFront();
            };
            this.tempConnection.show(canvas);
            this.tempConnection.setVertices([this.port1.getAbsolutePosition(),this.port1.getAbsolutePosition()]);
            var a= function() {
                _this.tempConnection.shape.animate({"stroke-width" : 2}, 800, b);
            };
            var b=function() {
                _this.tempConnection.shape.animate({"stroke-width":1}, 800, a);
            };
            a();
            var pos = port.getAbsolutePosition();
            this.pulse =this.ripple(pos.x, pos.y, 1);
            return;
        }
        var possibleTarget = port.delegateTarget(this.port1);
        if(!(possibleTarget instanceof draw2d.Port)){
            return; 
        }
        var request = new draw2d.command.CommandType(draw2d.command.CommandType.CONNECT);
        request.source = this.port1;
        request.target = port;
        var command = null;
        if(this.port1 instanceof draw2d.InputPort) {
             command = this.port1.createCommand(request);
        }
        else{
             command = port.createCommand(request);
        }
        if(command!==null){
            this.vertices.push(port.getPosition());
            command.setConnection( this.createConnection());
            figure.getCanvas().getCommandStack().execute(command);
            this.beeline.hide();
            this.tempConnection.hide();
            if(this.pulse!==null) {
                this.pulse.remove();
                this.pulse = null;
            }
            this.beeline = null;
            this.port1=null;
            this.vertices = [];
        }
    },
    onMouseMove: function(canvas, x, y, shiftKey, ctrlKey)
    {
        if(this.beeline!==null){
            this.beeline.setEndPosition(x,y);
        }
    },
    onKeyDown: function(canvas, keyCode, shiftKey, ctrlKey)
    {
        var KEYCODE_ENTER = 13;
        var KEYCODE_ESC = 27;
        if (keyCode === KEYCODE_ESC && this.beeline!==null){
            this.beeline.hide();
            this.tempConnection.hide();
            this.beeline = null;
            this.port1=null;
            this.vertices = [];
            if(this.pulse!=null) {
                this.pulse.remove();
                this.pulse=null;
            }
        }
    },
    createConnection: function()
    {
        var connection = this._super();
        if(this.vertices.length===2){
            connection.setRouter(new draw2d.layout.connection.DirectRouter());
        }
        else {
            connection.setRouter(new draw2d.layout.connection.VertexRouter());
            connection.setVertices(this.vertices);
        }
        connection.setRadius(10);
        return connection;
    }
});
draw2d.policy.connection.OrthogonalConnectionCreatePolicy = draw2d.policy.connection.ConnectionCreatePolicy.extend({
    NAME : "draw2d.policy.connection.ClickConnectionCreatePolicy",
    init: function(attr, setter, getter)
    {
        this._super( attr, setter, getter);
        this.port1 = null;
        this.beeline = null;
        this.pulse= null;
        this.tempConnection = null;
        this.vertices = new draw2d.util.ArrayList();
    },
    onClick: function(figure, x, y, shiftKey, ctrlKey)
    {
        var UP   = draw2d.geo.Rectangle.DIRECTION_UP;
        var RIGHT= draw2d.geo.Rectangle.DIRECTION_RIGHT;
        var DOWN = draw2d.geo.Rectangle.DIRECTION_DOWN;
        var LEFT = draw2d.geo.Rectangle.DIRECTION_LEFT;
        var _this = this;
        var port = figure;
        if(port === null && this.port1 === null){
            return;
        }
        if(port===null){
            var canvas = this.port1.getCanvas();
            var newPos = this.beeline.getEndPosition();
            this.vertices.add(newPos);
            this.beeline.setStartPosition(this.beeline.getEndPosition());
            this.tempConnection.setVertices(this.vertices);
            if(this.pulse!==null) {
                this.pulse.remove();
                this.pulse = null;
            }
            this.ripple(newPos.x, newPos.y, 0);
            return;
        }
        if(!(port instanceof draw2d.Port)){
            return;
        }
        if(this.port1===null){
            var canvas = port.getCanvas();
            this.port1 = port;
            this.vertices.add(port.getAbsolutePosition());
            this.beeline = new draw2d.shape.basic.Line({
                start: this.port1.getAbsolutePosition(),
                end: this.port1.getAbsolutePosition(),
                dasharray:"- ",
                color:"#2C70FF"
            });
            this.beeline.hide= function(){
                _this.beeline.setCanvas(null);
            };
            this.beeline.show= function(canvas){
                _this.beeline.setCanvas(canvas);
                _this.beeline.shape.toFront();
            };
            this.beeline.show(canvas);
            this.tempConnection = new draw2d.shape.basic.PolyLine({
                start: this.port1.getAbsolutePosition(),
                end: this.port1.getAbsolutePosition(),
                stroke:2,
                color:"#2C70FF"
            });
            this.tempConnection.hide= function(){
                _this.tempConnection.setCanvas(null);
            };
            this.tempConnection.show= function(canvas){
                _this.tempConnection.setCanvas(canvas);
                _this.tempConnection.shape.toFront();
            };
            this.tempConnection.show(canvas);
            this.tempConnection.setVertices([this.port1.getAbsolutePosition(),this.port1.getAbsolutePosition()]);
            var a= function() {
                _this.tempConnection.shape.animate({"stroke-width" : 2}, 800, b);
            };
            var b=function() {
                _this.tempConnection.shape.animate({"stroke-width":1}, 800, a);
            };
            a();
            canvas.paper.setStart();
            if(this.pulse!==null) {
                this.pulse.remove();
                this.pulse = null;
            }
            var pos = port.getAbsolutePosition();
            this.ripple(pos.x, pos.y, 1);
            this.pulse = canvas.paper.setFinish();
        }
        else {
            var possibleTarget = port.delegateTarget(this.port1);
            if (!(possibleTarget instanceof draw2d.Port)) {
                return; 
            }
            var request = new draw2d.command.CommandType(draw2d.command.CommandType.CONNECT);
            request.source = this.port1;
            request.target = port;
            var command = null;
            if (this.port1 instanceof draw2d.InputPort) {
                command = this.port1.createCommand(request);
            }
            else {
                command = port.createCommand(request);
            }
            if (command !== null) {
                var connection = this.createConnection();
                command.setConnection(connection);
                port.getCanvas().getCommandStack().execute(command);
                this.beeline.hide();
                this.tempConnection.hide();
                if (this.pulse !== null) {
                    this.pulse.remove();
                    this.pulse = null;
                }
                this.beeline = null;
                this.port1 = null;
                if(this.vertices.getSize()<=2){
                    return;
                }
                var MINDIST = command.getConnection().getRouter().MINDIST;
                var beforeVertex = this.vertices.get(this.vertices.getSize()-2);
                var lastVertex   = this.vertices.last();
                var portPos      = port.getAbsolutePosition();
                var lastSegmentDir = UP;
                if(lastVertex.x === beforeVertex.x){
                    lastSegmentDir = lastVertex.y< beforeVertex.y ? UP : DOWN;
                }
                else{
                    lastSegmentDir = lastVertex.x< beforeVertex.x ? LEFT : RIGHT;
                }
                switch(port.getConnectionDirection(this.port1)){
                    case UP:
                        switch(lastSegmentDir){
                            case UP:
                                if(lastVertex.y<(portPos.y-MINDIST)) {
                                    this.vertices.add(new draw2d.geo.Point(portPos.x, lastVertex.y));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.y = portPos.y-MINDIST;
                                    this.vertices.add(new draw2d.geo.Point(portPos.x, lastVertex.y));
                                    this.vertices.add(portPos);
                                }
                                break;
                            case RIGHT:
                                if(lastVertex.y>(portPos.y-MINDIST)){
                                    beforeVertex.y = portPos.y-MINDIST;
                                    lastVertex.x = portPos.x;
                                    lastVertex.y = beforeVertex.y;
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.x = portPos.x;
                                    this.vertices.add(portPos);
                                }
                                break;
                            case DOWN:
                                if(lastVertex.y<(portPos.y-MINDIST)) {
                                    beforeVertex.x = portPos.x;
                                    lastVertex.setPosition(portPos);
                                }
                                else{
                                    lastVertex.y = portPos.y-MINDIST;
                                    this.vertices.add(new draw2d.geo.Point(portPos.x,lastVertex.y ));
                                    this.vertices.add(portPos);
                                }
                                break;
                            case LEFT:
                                if(lastVertex.y>(portPos.y-MINDIST)){
                                    beforeVertex.y = portPos.y-MINDIST;
                                    lastVertex.x = portPos.x;
                                    lastVertex.y = beforeVertex.y;
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.x = portPos.x;
                                    this.vertices.add(portPos);
                                }
                                break;
                        }
                        break;
                    case RIGHT:
                        switch(lastSegmentDir){
                            case UP:
                                if(lastVertex.x > (portPos.x+MINDIST)){
                                    lastVertex.y = portPos.y;
                                    this.vertices.add(portPos);
                                }
                                else{
                                    this.vertices.add(new draw2d.geo.Point(portPos.x+MINDIST, lastVertex.y));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x+MINDIST, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                break;
                            case RIGHT:
                                if(lastVertex.x > (portPos.x+MINDIST)){
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.x =  portPos.x+MINDIST;
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                break;
                            case DOWN:
                                if(lastVertex.x > (portPos.x+MINDIST)){
                                    lastVertex.y = portPos.y;
                                    this.vertices.add(portPos);
                                }
                                else{
                                    this.vertices.add(new draw2d.geo.Point(portPos.x+MINDIST, lastVertex.y));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x+MINDIST, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                break;
                            case LEFT:
                                if(lastVertex.x > (portPos.x+MINDIST)){
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.x =  portPos.x+MINDIST;
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                break;
                        }
                        break;
                    case DOWN:
                        switch(lastSegmentDir){
                            case UP:
                                if(lastVertex.y<(portPos.y+MINDIST)) {
                                    lastVertex.y = portPos.y+MINDIST;
                                    this.vertices.add(new draw2d.geo.Point(portPos.x, lastVertex.y));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.x   = portPos.x;
                                    lastVertex.y   = portPos.y;
                                    beforeVertex.x = portPos.x;
                                }
                                break;
                            case RIGHT:
                                if(lastVertex.y<(portPos.y+MINDIST)){
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, portPos.y+MINDIST));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x, portPos.y+MINDIST));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.x = portPos.x;
                                    this.vertices.add(portPos);
                                }
                                break;
                            case DOWN:
                                if(lastVertex.y<(portPos.y+MINDIST)) {
                                    lastVertex.y = portPos.y+MINDIST;
                                    this.vertices.add(new draw2d.geo.Point(portPos.x,lastVertex.y ));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    this.vertices.add(new draw2d.geo.Point(portPos.x,lastVertex.y ));
                                    this.vertices.add(portPos);
                                }
                                break;
                            case LEFT:
                                if(lastVertex.y<(portPos.y-MINDIST)){
                                    beforeVertex.y = portPos.y-MINDIST;
                                    lastVertex.x = portPos.x;
                                    lastVertex.y = beforeVertex.y;
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.x = portPos.x;
                                    this.vertices.add(portPos);
                                }
                                break;
                        }
                        break;
                    case LEFT:
                        switch(lastSegmentDir){
                            case UP:
                                if(lastVertex.x >= (portPos.x-MINDIST)){
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, lastVertex.y));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                else if(lastVertex.y > portPos.y && lastVertex.x < (portPos.x-MINDIST)){
                                    lastVertex.y = portPos.y;
                                    this.vertices.add(portPos);
                                }
                                else{
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, lastVertex.y));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                break;
                            case RIGHT:
                                if(lastVertex.y<portPos.y && lastVertex.x > (portPos.x-MINDIST)){
                                    var center = portPos.y-(portPos.y-lastVertex.y)/2;
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, center));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, center));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                else if(lastVertex.y>portPos.y && lastVertex.x > (portPos.x-MINDIST)){
                                    var center = portPos.y+(lastVertex.y-portPos.y)/2;
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, center));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, center));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                break;
                            case DOWN:
                                if(lastVertex.x >= (portPos.x-MINDIST)){
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, lastVertex.y));
                                    this.vertices.add(new draw2d.geo.Point(portPos.x-MINDIST, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.y=portPos.y;
                                    this.vertices.add(portPos);
                                }
                                break;
                            case LEFT:
                                if(lastVertex.x < (portPos.x-MINDIST)){
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, portPos.y));
                                    this.vertices.add(portPos);
                                }
                                else{
                                    lastVertex.x =  portPos.x-MINDIST;
                                    this.vertices.add(new draw2d.geo.Point(lastVertex.x, portPos.y));
                                    this.vertices.add(portPos);
                                }
                            break;
                        }
                    break;
                }
                if(this.vertices.getSize()>3) {
                    connection._routingMetaData.routedByUserInteraction = true;
                    connection.setVertices(this.vertices);
                }
                this.vertices.clear();
            }
        }
    },
    onMouseMove: function(canvas, x, y, shiftKey, ctrlKey)
    {
        if(this.beeline!==null){
            this.beeline.setEndPosition(this.orthogonal(this.vertices.last(), {x:x,y:y}));
        }
    },
    onKeyDown: function(canvas, keyCode, shiftKey, ctrlKey)
    {
        var KEYCODE_ENTER = 13;
        var KEYCODE_ESC = 27;
        if (keyCode === KEYCODE_ESC && this.beeline!==null){
            this.beeline.hide();
            this.tempConnection.hide();
            this.beeline = null;
            this.port1=null;
            this.vertices.clear();
            if(this.pulse!=null) {
                this.pulse.remove();
                this.pulse=null;
            }
        }
    },
    orthogonal: function(anchor, p)
    {
        var xDiff = Math.abs(anchor.x- p.x)+10;
        var xDist = draw2d.geo.Line.distance(anchor.x-xDiff, anchor.y, anchor.x+xDiff, anchor.y, p.x, p.y);
        var yDiff = Math.abs(anchor.y- p.y)+10;
        var yDist = draw2d.geo.Line.distance(anchor.x, anchor.y-yDiff, anchor.x, anchor.y+yDiff, p.x, p.y);
        return yDist>xDist? {x: p.x, y:anchor.y}:{x: anchor.x, y: p.y};
    },
    createConnection: function()
    {
        var connection = this._super();
        connection.attr({radius:7, stroke:3});
        connection.setRouter(new draw2d.layout.connection.InteractiveManhattanConnectionRouter());
        return connection;
    }
});
draw2d.policy.connection.DragConnectionCreatePolicy = draw2d.policy.connection.ConnectionCreatePolicy.extend({
    NAME : "draw2d.policy.connection.DragConnectionCreatePolicy",
    init: function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
        this.mouseDraggingElement =null;
        this.currentDropTarget = null;
        this.currentTarget = null;
    },
    onMouseDown: function(canvas, x, y, shiftKey, ctrlKey)
    {
        var port = canvas.getBestFigure(x, y);
        if(port===null){
            return;
        }
        if(!(port instanceof draw2d.Port)){
            return;
        }
        if(port.isInDragDrop===true){
            port.onDragEnd( x, y, shiftKey, ctrlKey);
            port.isInDragDrop=false;
        }
        if (port.isDraggable()) {
            var canDragStart = port.onDragStart(x - port.getAbsoluteX(), y - port.getAbsoluteY(), shiftKey, ctrlKey);
            if(canDragStart) {
                port.fireEvent("dragstart", {x: x - port.getAbsoluteX(), y: y - port.getAbsoluteY(), shiftKey: shiftKey, ctrlKey: ctrlKey});
            }
            this.mouseDraggingElement = canDragStart===false ? null : port;
            this.mouseDownElement = port;
        }
    },
    onMouseDrag: function(canvas, dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
        try{
            if (this.mouseDraggingElement !== null) {
                var de = this.mouseDraggingElement;
                var ct = this.currentTarget;
                de.isInDragDrop = true;
                de.onDrag(dx, dy, dx2, dy2, shiftKey, ctrlKey);
                var target=canvas.getBestFigure(de.getAbsoluteX(),de.getAbsoluteY(), de);
                if(target!==ct){
                    if(ct!==null){
                        ct.onDragLeave(de);
                        ct.fireEvent("dragLeave",{draggingElement:de});
                        de.editPolicy.each(function(i,e){
                            if(e instanceof draw2d.policy.port.PortFeedbackPolicy){
                                e.onHoverLeave(canvas, de, ct);
                            }
                        });
                    }
                    if(target!==null){
                        this.currentTarget= ct = target.delegateTarget(de);
                        if(ct!==null){
                            ct.onDragEnter(de); 
                            ct.fireEvent("dragEnter",{draggingElement:de});
                            de.editPolicy.each(function(i,e){
                                if(e instanceof draw2d.policy.port.PortFeedbackPolicy){
                                    e.onHoverEnter(canvas, de, ct);
                                }
                            });
                        }
                    }
                    else{
                        this.currentTarget = null;
                    }
                }
                var p = canvas.fromDocumentToCanvasCoordinate(canvas.mouseDownX + (dx/canvas.zoomFactor), canvas.mouseDownY + (dy/canvas.zoomFactor));
                var target = canvas.getBestFigure(p.x, p.y,this.mouseDraggingElement);
                if (target !== this.currentDropTarget) {
                    if (this.currentDropTarget !== null) {
                        this.currentDropTarget.onDragLeave(this.mouseDraggingElement);
                        this.currentDropTarget.fireEvent("dragLeave",{draggingElement:this.mouseDraggingElement});
                        this.currentDropTarget = null;
                    }
                    if (target !== null) {
                        this.currentDropTarget = target.delegateTarget(this.mouseDraggingElement);
                        if( this.currentDropTarget !==null) {
                            this.currentDropTarget.onDragEnter(this.mouseDraggingElement); 
                            this.currentDropTarget.fireEvent("dragEnter", {draggingElement: this.mouseDraggingElement});
                        }
                    }
                }
            }
        }
        catch(exc){
            console.log(exc);
            debugger;
        }
    },
    onMouseUp: function(canvas, x, y, shiftKey, ctrlKey)
    {
        if (this.mouseDraggingElement !== null) {
            var de = this.mouseDraggingElement;
            var ct = this.currentTarget;
            canvas.getCommandStack().startTransaction();
            de.onDragEnd(x, y, shiftKey, ctrlKey);
            if(ct){
                de.editPolicy.each(function(i,e){
                    if(e instanceof draw2d.policy.port.PortFeedbackPolicy){
                        e.onHoverLeave(canvas, de, ct);
                    }
                });
            }
            de.editPolicy.each(function(i,e){
                if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                    e.onDragEnd(canvas, de, x, y, shiftKey, ctrlKey);
                }
            });
            this.currentTarget = null;
            de.isInDragDrop =false;
            de.fireEvent("dragend",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
            if (this.currentDropTarget !== null) {
                this.mouseDraggingElement.onDrop(this.currentDropTarget, x, y, shiftKey, ctrlKey);
                this.currentDropTarget.onDragLeave(this.mouseDraggingElement);
                this.currentDropTarget.fireEvent("dragLeave", {draggingElement: this.mouseDraggingElement});
                if(this.currentDropTarget instanceof draw2d.Port){
                    var request = new draw2d.command.CommandType(draw2d.command.CommandType.CONNECT);
                    request.source = this.currentDropTarget;
                    request.target = this.mouseDraggingElement;
                    var command = this.mouseDraggingElement.createCommand(request);
                    if(command!==null){
                        command.setConnection(this.createConnection());
                        canvas.getCommandStack().execute(command);
                        this.currentDropTarget.onCatch(this.mouseDraggingElement, x, y, shiftKey, ctrlKey);
                    }
                }
            }
            canvas.getCommandStack().commitTransaction();
            this.currentDropTarget = null;
            this.mouseDraggingElement = null;
        }
    },
    createConnection: function()
    {
        var connection = this._super();
        connection.setRouter(new draw2d.layout.connection.DirectRouter());
        return connection;
    }
});
draw2d.policy.figure.FigureEditPolicy = draw2d.policy.EditPolicy.extend({
    NAME : "draw2d.policy.figure.FigureEditPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onRightMouseDown: function(figure, x, y, shiftKey, ctrlKey)
    {
    }
});
draw2d.policy.figure.DragDropEditPolicy = draw2d.policy.figure.FigureEditPolicy.extend({
    NAME : "draw2d.policy.figure.DragDropEditPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onDragStart: function(canvas, figure, x, y, shiftKey, ctrlKey)
    {
    	figure.shape.attr({cursor:"move"});
        if(figure.isMoving===true){
            figure.setAlpha(figure.originalAlpha);
        }
        figure.originalAlpha = figure.getAlpha();
    	figure.isMoving = false;
        return true;
    },
    onDrag: function(canvas, figure)
    {
        if(figure.isMoving===false){
            figure.isMoving = true;
            figure.setAlpha(figure.originalAlpha*0.4);
        }    	
    },
    onDragEnd: function(canvas, figure, x, y, shiftKey, ctrlKey)
    {
        figure.shape.attr({cursor:"default"});
        figure.isMoving = false;
        figure.setAlpha(figure.originalAlpha);
    },
    adjustPosition: function(figure, x,y)
    {
        if(x instanceof draw2d.geo.Point){
            return x;
        }
        return new draw2d.geo.Point(x,y);
    },
    adjustDimension: function(figure, w, h)
    {
        return new draw2d.geo.Rectangle(0,0,w,h);
    },
    moved: function(canvas,figure) 
    {
    }
});
draw2d.policy.figure.RegionEditPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({
    NAME : "draw2d.policy.figure.RegionEditPolicy",
    init: function( x,y,w,h){
        this._super();
        if(x instanceof draw2d.geo.Rectangle){
            this.constRect = x;
        }
        else if(typeof h === "number"){
            this.constRect = new draw2d.geo.Rectangle(x,y,w,h);
        }
        else{
            throw "Invalid parameter. RegionEditPolicy need a rectangle as parameter in the constructor";
        }
    },
    setBoundingBox: function(boundingBox)
    {
      this.constRect = boundingBox;  
      return this;
    },
    adjustPosition: function(figure, x, y)
    {
        var r = null;
        if (x instanceof draw2d.geo.Point) {
            r = new draw2d.geo.Rectangle(x.x, x.y, figure.getWidth(), figure.getHeight());
        }
        else {
            r = new draw2d.geo.Rectangle(x, y, figure.getWidth(), figure.getHeight());
        }
        r = this.constRect.moveInside(r);
        return r.getTopLeft();
    },
    adjustDimension: function(figure, w, h)
    {
        var diffW = (figure.getAbsoluteX()+w)-this.constRect.getRight();
        var diffH = (figure.getAbsoluteY()+h)-this.constRect.getBottom();
        if(diffW>0){
            w = w- diffW;
        }
        if(diffH>0){
            h = h- diffH;
        }
        return {w:w, h:h};
    }
});
draw2d.policy.figure.HorizontalEditPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({
    NAME : "draw2d.policy.figure.HorizontalEditPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    adjustPosition: function(figure, x, y)
    {
        return new draw2d.geo.Point(x,figure.getY());
    }
});
draw2d.policy.figure.VerticalEditPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({
    NAME : "draw2d.policy.figure.VerticalEditPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    adjustPosition: function(figure, x, y)
    {
        return new draw2d.geo.Point(figure.getX(),y);
    }
});
draw2d.policy.figure.SelectionFeedbackPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({
    NAME : "draw2d.policy.figure.SelectionFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onSelect: function(canvas, figure, isPrimarySelection)
    {
    },
    onUnselect: function(canvas, figure )
    {
        figure.selectionHandles.each(function(i,e){
            e.hide();
        });
        figure.selectionHandles = new draw2d.util.ArrayList();
    },
    onInstall: function( figure)
    {
        this._super(figure);
        var canvas = figure.getCanvas();
        if(canvas!==null){
            if(canvas.getSelection().contains(figure)){
                this.onSelect(canvas, figure, true);
            }
        }
    },
    onUninstall: function( figure)
    {
        this._super(figure);
        if(typeof figure.selectionHandles ==="undefined"){
            return;
        }
        figure.selectionHandles.each(function(i,e){
            e.hide();
        });
        figure.selectionHandles = new draw2d.util.ArrayList();
    }
});
draw2d.policy.figure.ResizeSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({
    NAME : "draw2d.policy.figure.ResizeSelectionFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onSelect: function(canvas, figure, isPrimarySelection){
        if(figure.selectionHandles.isEmpty())
        {
            var r1= draw2d.Configuration.factory.createResizeHandle(figure,1); 
            var r3= draw2d.Configuration.factory.createResizeHandle(figure,3); 
            var r5= draw2d.Configuration.factory.createResizeHandle(figure,5); 
            var r7= draw2d.Configuration.factory.createResizeHandle(figure,7); 
            figure.selectionHandles.add(r1);
            figure.selectionHandles.add(r3);
            figure.selectionHandles.add(r5);
            figure.selectionHandles.add(r7);
            r1.show(canvas);
            r3.show(canvas);
            r5.show(canvas);
            r7.show(canvas);
            if(figure.isResizeable()===false) {
              r1.setBackgroundColor(null);
              r3.setBackgroundColor(null);
              r5.setBackgroundColor(null);
              r7.setBackgroundColor(null);
              r1.setDraggable(false);
              r3.setDraggable(false);
              r5.setDraggable(false);
              r7.setDraggable(false);
            }
            if((!figure.getKeepAspectRatio()) && figure.isResizeable()){
                var r2= draw2d.Configuration.factory.createResizeHandle(figure,2); 
                var r4= draw2d.Configuration.factory.createResizeHandle(figure,4); 
                var r6= draw2d.Configuration.factory.createResizeHandle(figure,6); 
                var r8= draw2d.Configuration.factory.createResizeHandle(figure,8); 
                figure.selectionHandles.add(r2);
                figure.selectionHandles.add(r4);
                figure.selectionHandles.add(r6);
                figure.selectionHandles.add(r8);
                r2.show(canvas);
                r4.show(canvas);
                r6.show(canvas);
                r8.show(canvas);
            }
        }
        this.moved(canvas, figure);
   },
    moved: function(canvas, figure ){
        if(figure.selectionHandles.isEmpty()){
            return; 
        }
        var objHeight   = figure.getHeight();
        var objWidth    = figure.getWidth();
        var xPos = figure.getX();
        var yPos = figure.getY();
        var r1= figure.selectionHandles.find(function(handle){return handle.type===1});
        var r3= figure.selectionHandles.find(function(handle){return handle.type===3});
        var r5= figure.selectionHandles.find(function(handle){return handle.type===5});
        var r7= figure.selectionHandles.find(function(handle){return handle.type===7});
        r1.setPosition(xPos-r1.getWidth(),yPos-r1.getHeight());
        r3.setPosition(xPos+objWidth,yPos-r3.getHeight());
        r5.setPosition(xPos+objWidth,yPos+objHeight);
        r7.setPosition(xPos-r7.getWidth(),yPos+objHeight);
        if(!figure.getKeepAspectRatio())
        {
            var r2= figure.selectionHandles.find(function(handle){return handle.type===2});
            var r4= figure.selectionHandles.find(function(handle){return handle.type===4});
            var r6= figure.selectionHandles.find(function(handle){return handle.type===6});
            var r8= figure.selectionHandles.find(function(handle){return handle.type===8});
            r2.setPosition(xPos+(objWidth/2)-(r2.getWidth()/2),yPos-r2.getHeight());
            r4.setPosition(xPos+objWidth,yPos+(objHeight/2)-(r4.getHeight()/2));
            r6.setPosition(xPos+(objWidth/2)-(r6.getWidth()/2),yPos+objHeight);
            r8.setPosition(xPos-r8.getWidth(),yPos+(objHeight/2)-(r8.getHeight()/2));
        }
    }
});
draw2d.policy.figure.RectangleSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({
    NAME : "draw2d.policy.figure.RectangleSelectionFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onSelect: function(canvas, figure, isPrimarySelection)
    {
        if(figure.selectionHandles.isEmpty())
        {
            var box = new draw2d.shape.basic.Rectangle({bgColor:null, dashArray:"- ", color:"#2C70FF", stroke:0.5});
            box.hide= function(){
                box.setCanvas(null);
            };
            box.show= function(canvas){
                box.setCanvas(canvas);
                box.toFront(figure);
            };
            var r1= draw2d.Configuration.factory.createResizeHandle(figure,1); 
            var r3= draw2d.Configuration.factory.createResizeHandle(figure,3); 
            var r5= draw2d.Configuration.factory.createResizeHandle(figure,5); 
            var r7= draw2d.Configuration.factory.createResizeHandle(figure,7); 
            figure.selectionHandles.add(r1);
            figure.selectionHandles.add(r3);
            figure.selectionHandles.add(r5);
            figure.selectionHandles.add(r7);
            r1.show(canvas);
            r3.show(canvas);
            r5.show(canvas);
            r7.show(canvas);
            if(figure.isResizeable()===false) {
              r1.setBackgroundColor(null);
              r3.setBackgroundColor(null);
              r5.setBackgroundColor(null);
              r7.setBackgroundColor(null);
              r1.setDraggable(false);
              r3.setDraggable(false);
              r5.setDraggable(false);
              r7.setDraggable(false);
            }
            if((!figure.getKeepAspectRatio()) && figure.isResizeable())
            {
                var r2= draw2d.Configuration.factory.createResizeHandle(figure,2); 
                var r4= draw2d.Configuration.factory.createResizeHandle(figure,4); 
                var r6= draw2d.Configuration.factory.createResizeHandle(figure,6); 
                var r8= draw2d.Configuration.factory.createResizeHandle(figure,8); 
                figure.selectionHandles.add(r2);
                figure.selectionHandles.add(r4);
                figure.selectionHandles.add(r6);
                figure.selectionHandles.add(r8);
                r2.show(canvas);
                r4.show(canvas);
                r6.show(canvas);
                r8.show(canvas);
            }
            figure.selectionHandles.add(box);
            box.show(canvas);
        }
        this.moved(canvas, figure);
   },
    moved: function(canvas, figure )
    {
        if(figure.selectionHandles.isEmpty()){
            return; 
        }
        var objHeight   = figure.getHeight();
        var objWidth    = figure.getWidth();
        var xPos = figure.getAbsoluteX();
        var yPos = figure.getAbsoluteY();
        var r1= figure.selectionHandles.find(function(handle){return handle.type===1});
        var r3= figure.selectionHandles.find(function(handle){return handle.type===3});
        var r5= figure.selectionHandles.find(function(handle){return handle.type===5});
        var r7= figure.selectionHandles.find(function(handle){return handle.type===7});
        r1.setPosition(xPos-r1.getWidth(),yPos-r1.getHeight());
        r3.setPosition(xPos+objWidth,yPos-r3.getHeight());
        r5.setPosition(xPos+objWidth,yPos+objHeight);
        r7.setPosition(xPos-r7.getWidth(),yPos+objHeight);
        if(!figure.getKeepAspectRatio()  && figure.isResizeable())
        {
            var r2= figure.selectionHandles.find(function(handle){return handle.type===2});
            var r4= figure.selectionHandles.find(function(handle){return handle.type===4});
            var r6= figure.selectionHandles.find(function(handle){return handle.type===6});
            var r8= figure.selectionHandles.find(function(handle){return handle.type===8});
            r2.setPosition(xPos+(objWidth/2)-(r2.getWidth()/2),yPos-r2.getHeight());
            r4.setPosition(xPos+objWidth,yPos+(objHeight/2)-(r4.getHeight()/2));
            r6.setPosition(xPos+(objWidth/2)-(r6.getWidth()/2),yPos+objHeight);
            r8.setPosition(xPos-r8.getWidth(),yPos+(objHeight/2)-(r8.getHeight()/2));
        }
        var box= figure.selectionHandles.last();
        box.setPosition(figure.getAbsolutePosition().translate(-2.5,-2.5));
        box.setDimension(figure.getWidth()+4, figure.getHeight()+4);
        box.setRotationAngle(figure.getRotationAngle());
    }
});
draw2d.policy.figure.AntSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({
    NAME : "draw2d.policy.figure.AntSelectionFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onSelect: function(canvas, figure, isPrimarySelection)
    {
        if (figure.selectionHandles.isEmpty()) {
            var box = new draw2d.shape.basic.Rectangle({bgColor:null, dasharray:"- ", color:"#2C70FF"});
            box.hide= function(){
                box.setCanvas(null);
            };
            box.show= function(canvas){
                box.setCanvas(canvas);
                box.shape.toFront();
            };
            box.show(canvas);
            figure.selectionHandles.add(box);
            if(figure.getParent()!==null){
                var line = new draw2d.shape.basic.Line({opacity:0.5, bgColor:null, dasharray:"- ", color:"#2C70FF"});
                line.show= function(canvas) {
                    line.setCanvas(canvas);
                };
                line.hide= function(){
                    line.setCanvas(null);
                };
                line.show(canvas);
                figure.selectionHandles.add(line);
                this._updateBeeLine(line, figure);
            }
        }
        this.moved(canvas, figure);
   },
    moved: function(canvas, figure)
    {
        if(figure.selectionHandles.isEmpty()){
            return; 
        }
        var box= figure.selectionHandles.first();
        box.setPosition(figure.getAbsolutePosition().translate(-2.5,-2.5));
        box.setDimension(figure.getWidth()+4, figure.getHeight()+4);
        box.setRotationAngle(figure.getRotationAngle());
        if(figure.selectionHandles.getSize()>1){
            var line = figure.selectionHandles.get(1);
            this._updateBeeLine( line, figure);
        }
    },
    _updateBeeLine: function(line, figure){
        var parent = figure.getParent();
        if(parent===null){
            return;
        }
        if(parent instanceof draw2d.shape.basic.Line){
            var center =figure.getBoundingBox().getCenter();
            var projection= parent.pointProjection(center);
            if(projection===null){
                var p1= line.getStartPosition();
                var p2= line.getEndPosition();
                var d1= center.distance(p1);
                var d2= center.distance(p1);
                projection=d1<d2?p1:p2;
            }
            var intersection =figure.getBoundingBox().intersectionWithLine(center, projection);
            if(intersection.getSize()>0) {
                line.setStartPosition(figure.getBoundingBox().intersectionWithLine(center, projection).get(0))
                    .setEndPosition(projection);
            }
            else{
                line.setStartPosition(figure.getBoundingBox().getCenter())
                    .setEndPosition(projection);
            }
        }
        else {
            var rect1 = figure.getBoundingBox(),
                rect2 = parent.getBoundingBox();
            var center1 = rect1.getCenter();
            var center2 = rect2.getCenter();
            if (rect1.intersects(rect2)) {
                line.setStartPosition(center1)
                    .setEndPosition(center2);
            }
            else if (rect1.hitTest(center2) || rect2.hitTest(center1)) {
                line.setStartPosition(center1)
                    .setEndPosition(center2);
            }
            else {
                rect1.scale(3, 3);
                rect2.scale(3, 3);
                line.setStartPosition(rect1.intersectionWithLine(center1, center2).get(0))
                    .setEndPosition(rect2.intersectionWithLine(center1, center2).get(0));
            }
        }
    }
}); 
draw2d.policy.figure.VertexSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({
    NAME : "draw2d.policy.figure.VertexSelectionFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onSelect: function(canvas, connection, isPrimarySelection)
    {
    	var points = connection.getVertices();
    	for(var i=0 ; i<points.getSize(); i++){
    		var handle = new draw2d.shape.basic.VertexResizeHandle(connection, i);
            connection.selectionHandles.add( handle);         
            handle.setDraggable(connection.isResizeable());
            handle.show(canvas);
            if(i!==0){
        		var handle = new draw2d.shape.basic.GhostVertexResizeHandle(connection, i-1);
                connection.selectionHandles.add( handle);         
                handle.setDraggable(connection.isResizeable());
                handle.show(canvas);
            }
        }
        this.moved(canvas, connection);
    },
    moved: function(canvas,figure)
    {
        figure.selectionHandles.each(function(i,e){
            e.relocate();
        });
    }
});
draw2d.policy.line.LineSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({
    NAME : "draw2d.policy.line.LineSelectionFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onSelect: function(canvas, figure, isPrimarySelection)
    {
        if(figure.selectionHandles.isEmpty()){
            figure.selectionHandles.add( new draw2d.shape.basic.LineStartResizeHandle(figure));
            figure.selectionHandles.add( new draw2d.shape.basic.LineEndResizeHandle(figure));
            figure.selectionHandles.each(function(i,e){
                e.setDraggable(figure.isResizeable());
                e.show(canvas);
            });
        }
        this.moved(canvas, figure);
    },
    moved: function(canvas,figure)
    {
    	figure.selectionHandles.each(function(i,e){
            e.relocate();
        });
    }
});
draw2d.policy.line.VertexSelectionFeedbackPolicy = draw2d.policy.line.LineSelectionFeedbackPolicy.extend({
    NAME : "draw2d.policy.line.VertexSelectionFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onSelect: function(canvas, figure, isPrimarySelection)
    {
        var startHandle =  new draw2d.shape.basic.LineStartResizeHandle(figure);
        var endHandle = new draw2d.shape.basic.LineEndResizeHandle(figure);
        figure.selectionHandles.add(startHandle);
        figure.selectionHandles.add( endHandle);
    	var points = figure.getVertices();
    	var count = points.getSize()-1;
    	var i=1;
    	for( ; i<count; i++){
    	    figure.selectionHandles.add( new draw2d.shape.basic.VertexResizeHandle(figure, i));         
    	    figure.selectionHandles.add( new draw2d.shape.basic.GhostVertexResizeHandle(figure, i-1));         
        }
    	figure.selectionHandles.add( new draw2d.shape.basic.GhostVertexResizeHandle(figure, i-1));         
    	figure.selectionHandles.each(function(i,e){
            e.setDraggable(figure.isResizeable());
            e.show(canvas);
        });
        this.moved(canvas, figure);
    }   
});
draw2d.policy.line.OrthogonalSelectionFeedbackPolicy = draw2d.policy.line.LineSelectionFeedbackPolicy.extend({
    NAME : "draw2d.policy.line.OrthogonalSelectionFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
        this.ResizeHandle = draw2d.ResizeHandle.extend({
            NAME : "draw2d.policy.line.OrthogonalSelectionFeedbackPolicy.ResizeHandle",
             init: function( figure, index)
             {
                this._super(figure);
                this.index = index;
             },
            onDragStart: function(x, y, shiftKey, ctrlKey)
            {
                this._super(x, y, shiftKey, ctrlKey);
                this.command = this.getCanvas().getPrimarySelection().createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE_VERTICES));
                this.vertex = this.owner.getVertex(this.index).clone();
            },
            onDrag: function(dx, dy, dx2, dy2)
            {
                if (this.command == null) {
                    return false;
                }
                var MINDIST = this.owner.getRouter().MINDIST || 10;
                var fromDir = this.owner.getSource().getConnectionDirection(this.owner.getTarget());
                var toDir   = this.owner.getTarget().getConnectionDirection(this.owner.getSource());
                this.vertex.translate(dx2, dy2);
                var vertices = this.owner.getVertices();
                var   count  = vertices.getSize();
                var max = Math.max;
                var min = Math.min;
                if(this.index === 1){
                    var p0 = vertices.get(this.index-1); 
                    var p1 = vertices.get(this.index  ); 
                    var p2 = vertices.get(this.index+1); 
                    if((p1.x == p2.x) && (p0.y == p1.y)){
                       switch(fromDir){
                       case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                          this.owner.setVertex(1,max(p0.x+MINDIST,this.vertex.x), p1.y); 
                          this.owner.setVertex(2,max(p0.x+MINDIST,this.vertex.x), p2.y); 
                          break;
                       case draw2d.geo.Rectangle.DIRECTION_LEFT:
                          this.owner.setVertex(1,min(p0.x-MINDIST,this.vertex.x), p1.y); 
                          this.owner.setVertex(2,min(p0.x-MINDIST,this.vertex.x), p2.y); 
                          break;
                       }
                    }
                    else{
                       switch(fromDir){
                       case draw2d.geo.Rectangle.DIRECTION_UP:
                          this.owner.setVertex(1,p1.x,min(p0.y-MINDIST,this.vertex.y)); 
                          this.owner.setVertex(2,p2.x,min(p0.y-MINDIST,this.vertex.y)); 
                          break;
                       case draw2d.geo.Rectangle.DIRECTION_DOWN:
                          this.owner.setVertex(1,p1.x,max(p0.y+MINDIST,this.vertex.y)); 
                          this.owner.setVertex(2,p2.x,max(p0.y+MINDIST,this.vertex.y)); 
                          break;
                       }
                    }
                 }
                else if(this.index === (count-2)){
                   var p2 = vertices.get(this.index-1);  
                   var p1 = vertices.get(this.index  );  
                   var p0 = vertices.get(this.index+1);  
                   if((p0.x === p1.x) && (p2.y === p1.y)){
                      switch(toDir){
                      case draw2d.geo.Rectangle.DIRECTION_UP:
                         this.owner.setVertex(count - 2,p1.x, min(p0.y-MINDIST,this.vertex.y)); 
                         this.owner.setVertex(count - 3,p2.x, min(p0.y-MINDIST,this.vertex.y)); 
                         break;
                      case draw2d.geo.Rectangle.DIRECTION_DOWN:
                          this.owner.setVertex(count - 2,p1.x, max(p0.y+MINDIST,this.vertex.y)); 
                          this.owner.setVertex(count - 3,p2.x, max(p0.y+MINDIST,this.vertex.y)); 
                         break;
                      }
                   }
                   else{
                      switch(toDir){
                      case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                          this.owner.setVertex(count -2,max(p0.x+MINDIST,this.vertex.x),p1.y); 
                          this.owner.setVertex(count -3,max(p0.x+MINDIST,this.vertex.x),p2.y); 
                         break;
                      case draw2d.geo.Rectangle.DIRECTION_LEFT:
                          this.owner.setVertex(count -2,min(p0.x-MINDIST,this.vertex.x),p1.y); 
                          this.owner.setVertex(count -3,min(p0.x-MINDIST,this.vertex.x),p2.y); 
                         break;
                      }
                   }
                }
                else{
                   var p_m1= vertices.get(this.index-2);
                   var p0  = vertices.get(this.index-1);
                   var p1  = vertices.get(this.index);   
                   var p2  = vertices.get(this.index+1);
                   var p3  = vertices.get(this.index+2);
                   if((p1.x=== p2.x) && (p1.y === p0.y)){
                      if(this.index-2 === 0) {
                         switch(fromDir){
                         case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                             this.owner.setVertex(this.index-1,p0.x,max(this.vertex.y,p_m1.y-MINDIST));          
                             this.owner.setVertex(this.index  ,this.vertex.x,max(this.vertex.y,p_m1.y-MINDIST)); 
                             this.owner.setVertex(this.index+1,this.vertex.x,p2.y);                         
                            break;
                         case draw2d.geo.Rectangle.DIRECTION_LEFT:
                             this.owner.setVertex(this.index-1,p0.x,min(this.vertex.y,p_m1.y+MINDIST));          
                             this.owner.setVertex(this.index  ,this.vertex.x,this.vertex.y); 
                             this.owner.setVertex(this.index+1,this.vertex.x,p2.y);                         
                            break;
                         case draw2d.geo.Rectangle.DIRECTION_UP:
                             this.owner.setVertex(this.index-1,p0.x,min(this.vertex.y,p_m1.y-MINDIST));          
                             this.owner.setVertex(this.index  ,this.vertex.x,min(this.vertex.y,p_m1.y-MINDIST)); 
                             this.owner.setVertex(this.index+1,this.vertex.x,p2.y);                         
                            break;
                         case draw2d.geo.Rectangle.DIRECTION_DOWN:
                             this.owner.setVertex(this.index-1,p0.x,max(this.vertex.y,p_m1.y+MINDIST));          
                             this.owner.setVertex(this.index  ,this.vertex.x,max(this.vertex.y,p_m1.y+MINDIST)); 
                             this.owner.setVertex(this.index+1,this.vertex.x, p2.y);                        
                            break;
                         }
                      }
                      else if((this.index-count+3) === 0) {
                         switch(toDir){
                         case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                             this.owner.setVertex(this.index-1,p0.x,this.vertex.y);                       
                             this.owner.setVertex(this.index  ,max(this.vertex.x,p3.x+MINDIST),this.vertex.y); 
                             this.owner.setVertex(this.index+1,max(this.vertex.x,p3.x+MINDIST),p2.y);          
                            break;
                         case draw2d.geo.Rectangle.DIRECTION_LEFT:
                             this.owner.setVertex(this.index-1,p0.x,this.vertex.y);                       
                             this.owner.setVertex(this.index  ,min(this.vertex.x,p3.x-MINDIST),this.vertex.y); 
                             this.owner.setVertex(this.index+1,min(this.vertex.x,p3.x-MINDIST),p2.y);          
                            break;
                         }
                      }
                      else{
                          this.owner.setVertex(this.index-1,p0.x,this.vertex.y);                          
                          this.owner.setVertex(this.index  ,this.vertex);                                 
                          this.owner.setVertex(this.index+1,this.vertex.x,p2.y);                          
                      }
                   }
                   else if((p0.x === p1.x) && (p1.y===p2.y)){
                      if(this.index-2 === 0) {
                         switch(fromDir){
                         case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                             this.owner.setVertex(this.index-1,max(this.vertex.x,p_m1.x+MINDIST),p0.y);          
                             this.owner.setVertex(this.index  ,max(this.vertex.x,p_m1.x+MINDIST),this.vertex.y); 
                             this.owner.setVertex(this.index+1,p2.x,this.vertex.y);                              
                            break;
                         case draw2d.geo.Rectangle.DIRECTION_LEFT:
                             this.owner.setVertex(this.index-1,min(this.vertex.x,p_m1.x-MINDIST),p0.y);          
                             this.owner.setVertex(this.index  ,min(this.vertex.x,p_m1.x-MINDIST),this.vertex.y); 
                             this.owner.setVertex(this.index+1,p2.x,this.vertex.y);                              
                            break;
                         }
                      }
                      else if((this.index-count+3) === 0) {
                         switch(toDir){
                         case draw2d.geo.Rectangle.DIRECTION_UP:
                             this.owner.setVertex(this.index-1, this.vertex.x,max(this.vertex.y,p0.y));      
                             this.owner.setVertex(this.index  , this.vertex.x,min(this.vertex.y,p3.y-MINDIST));   
                             this.owner.setVertex(this.index+1, p2.x         ,min(this.vertex.y,p3.y-MINDIST));   
                            break;
                         case draw2d.geo.Rectangle.DIRECTION_DOWN:
                             this.owner.setVertex(this.index-1, this.vertex.x,p0.y);                
                             this.owner.setVertex(this.index  , this.vertex.x,max(this.vertex.y,p3.y+MINDIST));   
                             this.owner.setVertex(this.index+1, p2.x         ,max(this.vertex.y,p3.y+MINDIST));   
                            break;
                         }
                      }
                      else{
                          this.owner.setVertex(this.index-1, this.vertex.x,p0.y         );                  
                          this.owner.setVertex(this.index  , this.vertex                );                  
                          this.owner.setVertex(this.index+1, p2.x         ,this.vertex.y);                  
                      }
                   }
                }
                this.relocate();
                if(this.command!==null){
                    this.command.updateVertices(this.owner.getVertices().clone());                   
                }
                this.owner._routingMetaData.routedByUserInteraction = true;             
                return true;
            },
            onDragEnd: function( x, y, shiftKey, ctrlKey)
            {
                var stack = this.getCanvas().getCommandStack();
                stack.execute(this.command);
                this.command = null;
                return true;
            },
            relocate: function()
            {
                var resizeWidthHalf = this.getWidth()/2;
                var resizeHeightHalf= this.getHeight()/2;
                var anchor = this.owner.getVertices().get(this.index);
                if(anchor)
                this.setPosition(anchor.x-resizeWidthHalf,anchor.y-resizeHeightHalf);
            }
        });
    },
    onSelect: function(canvas, connection, isPrimarySelection){
    	this._super(canvas, connection, isPrimarySelection);
    	var points = connection.getVertices();
    	var i=1;
    	for( ; i<(points.getSize()-1); i++){
    		var handle = new this.ResizeHandle(connection, i);
            connection.selectionHandles.add( handle);         
            handle.setDraggable(connection.isResizeable());
            handle.show(canvas);
        }
        this.moved(canvas, connection);
    },
    removeSegment: function(conn, segmentIndex){
       var PADDING = 10;
       var segmentCount  = conn.getVertices().getSize()-1;
       var fromPt  = conn.getStartPoint();
       var fromDir = conn.getSource().getConnectionDirection(conn.getTarget());
       var toPt    = conn.getEndPoint();
       var toDir   = conn.getTarget().getConnectionDirection( conn.getSource());
       var p0 = conn.getVertex(segmentIndex -1);
       var p1 = conn.getVertex(segmentIndex   );
       var p2 = conn.getVertex(segmentIndex +1);
       var p3 = conn.getVertex(segmentIndex +2);
       if(p1.y === p2.y){
          var newX = (p1.x + p2.x) / 2;
          if(segmentIndex === 1){
              switch(fromDir){
                  case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                      newX = Math.max(newX ,fromPt.x+PADDING);
                      break;
                  case draw2d.geo.Rectangle.DIRECTION_LEFT:
                      newX = Math.min(newX ,fromPt.x-PADDING);
                      break;
                  case draw2d.geo.Rectangle.DIRECTION_UP:
                      newX = fromPt.x;
                      break;
                  case draw2d.geo.Rectangle.DIRECTION_DOWN:
                      newX = fromPt.x;
                      break;
              }
          }
          if(segmentIndex === segmentCount-2){
              switch(fromDir){
                  case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                      newX = Math.max(newX ,toPt.x+PADDING);
                      break;
                  case draw2d.geo.Rectangle.DIRECTION_LEFT:
                      newX = Math.min(newX ,toPt.x-PADDING);
                      break;
                  case draw2d.geo.Rectangle.DIRECTION_UP:
                      newX = toPt.x;
                      break;
                  case draw2d.geo.Rectangle.DIRECTION_DOWN:
                      newX = toPt.x;
                      break;
              }
          }
          conn.setVertex(segmentIndex -1, new draw2d.geo.Point(newX,p0.y));
          conn.setVertex(segmentIndex +2, new draw2d.geo.Point(newX,p3.y));
          conn.removeVertexAt(segmentIndex);
          conn.removeVertexAt(segmentIndex);
          conn._routingMetaData.routedByUserInteraction = true; 
       }
       else if(p1.x === p2.x){
           var newY = (p1.y + p2.y) / 2;
           if(segmentIndex === 1){
               switch(fromDir){
                   case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                   case draw2d.geo.Rectangle.DIRECTION_LEFT:
                       newY = fromPt.y;
                       break;
                   case draw2d.geo.Rectangle.DIRECTION_UP:
                   case draw2d.geo.Rectangle.DIRECTION_DOWN:
                       newX = fromPt.x;
                       break;
               }
           }
           if(segmentIndex === segmentCount-2){
               switch(toDir){
                   case draw2d.geo.Rectangle.DIRECTION_RIGHT:
                   case draw2d.geo.Rectangle.DIRECTION_LEFT:
                       newY = toPt.y;
                       break;
                   case draw2d.geo.Rectangle.DIRECTION_UP:
                   case draw2d.geo.Rectangle.DIRECTION_DOWN:
                       newX = toPt.x;
                       break;
               }
           }
           conn.setVertex(segmentIndex -1, new draw2d.geo.Point(p0.x,newY));
           conn.setVertex(segmentIndex +2, new draw2d.geo.Point(p3.x,newY));
           conn.removeVertexAt(segmentIndex);
           conn.removeVertexAt(segmentIndex);
           conn._routingMetaData.routedByUserInteraction = true; 
       }
    },
    splitSegment: function(conn, segmentIndex, x, y){
       var segmentCount  = conn.getVertices().getSize()-1;
       var p1 = conn.getVertex(segmentIndex   );
       var p2 = conn.getVertex(segmentIndex +1);
       var length= 40;
       if(p1.x == p2.x){
          conn._routingMetaData.routedByUserInteraction = true; 
          if(segmentCount === 1){
              var newSegLength = (p1.getDistance(p2)/4)/2; 
              var np1 = new draw2d.geo.Point(p1.x       , y-newSegLength);
              var np2 = new draw2d.geo.Point(p2.x+length, y-newSegLength);
              var np3 = new draw2d.geo.Point(p2.x+length, y+newSegLength);
              var np4 = new draw2d.geo.Point(p2.x       , y+newSegLength);
              conn.insertVertexAt(segmentIndex+1, np1);
              conn.insertVertexAt(segmentIndex+2, np2);
              conn.insertVertexAt(segmentIndex+3, np3);
              conn.insertVertexAt(segmentIndex+4, np4);
          }
          else{
              var np1 = new draw2d.geo.Point(0,0);
              var np2 = new draw2d.geo.Point(0,0);
              if(segmentIndex===0){
                  np1.y = y;
                  np1.x = p1.x ;
                  np2.y = y;
                  np2.x = p2.x+length;
                  conn.setVertex(segmentIndex+1, new draw2d.geo.Point(np2.x,p2.y));
              }
              else if(segmentIndex === segmentCount-1){
                  np1.y = y;
                  np1.x = p1.x-length;
                  np2.y = y;
                  np2.x = p2.x;
                  conn.setVertex(segmentIndex  , new draw2d.geo.Point(np1.x,p1.y));
              }
              else {
                  np1.y = y;
                  np1.x = p1.x - (length/2);
                  np2.y = y;
                  np2.x = p2.x + (length/2);
                  conn.setVertex(segmentIndex  , new draw2d.geo.Point(np1.x,p1.y));
                  conn.setVertex(segmentIndex+1, new draw2d.geo.Point(np2.x,p2.y));
              }
              conn.insertVertexAt(segmentIndex+1, np1);
              conn.insertVertexAt(segmentIndex+2, np2);
          }
       }
       else if(p1.y == p2.y){
          conn._routingMetaData.routedByUserInteraction = true; 
          if(segmentCount===1){
              var newSegLength = (p1.getDistance(p2)/4)/2; 
              var np1 = new draw2d.geo.Point(x-newSegLength, p1.y);
              var np2 = new draw2d.geo.Point(x-newSegLength, p1.y-length);
              var np3 = new draw2d.geo.Point(x+newSegLength, p1.y-length);
              var np4 = new draw2d.geo.Point(x+newSegLength, p1.y);
              conn.insertVertexAt(segmentIndex+1, np1);
              conn.insertVertexAt(segmentIndex+2, np2);
              conn.insertVertexAt(segmentIndex+3, np3);
              conn.insertVertexAt(segmentIndex+4, np4);
          }
          else{
              var np1 = new draw2d.geo.Point(0,0);
              var np2 = new draw2d.geo.Point(0,0);
              if(segmentIndex===0){
                  np1.x = x;
                  np1.y = p1.y;
                  np2.x = x;
                  np2.y = p2.y+length;
                  conn.setVertex(segmentIndex+1, new draw2d.geo.Point(p2.x,np2.y));
              }
              else if(segmentIndex === segmentCount-1){
                  np1.x = x;
                  np1.y = p1.y-length;
                  np2.x = x;
                  np2.y = p2.y;
                  conn.setVertex(segmentIndex  , new draw2d.geo.Point(p1.x,np1.y));
              }
              else {
                  np1.x = x;
                  np1.y = p1.y - (length/2);
                  np2.x = x;
                  np2.y = p2.y + (length/2);
                  conn.setVertex(segmentIndex  , new draw2d.geo.Point(p1.x,np1.y));
                  conn.setVertex(segmentIndex+1, new draw2d.geo.Point(p2.x,np2.y));
              }
              conn.insertVertexAt(segmentIndex+1, np1);
              conn.insertVertexAt(segmentIndex+2, np2);
          }
       }
    },
    onRightMouseDown: function(conn, x, y, shiftKey, ctrlKey){
        var segment = conn.hitSegment(x,y);
        var items = {"split":  {name: draw2d.Configuration.i18n.menu.addSegment}};
        if(segment===null){
            return;
        }
        if(conn.getRouter().canRemoveSegmentAt(conn, segment.index)){
            items.remove= {name: draw2d.Configuration.i18n.menu.deleteSegment};
        }
        $.contextMenu({
            selector: 'body', 
            events:
            {  
                hide: function(){ $.contextMenu( 'destroy' ); }
            },
            callback: $.proxy(function(key, options) 
            {
               switch(key){
               case "remove":
                   var originalVertices = conn.getVertices().clone(true);
                   this.removeSegment(conn, segment.index);
                   var newVertices = conn.getVertices().clone(true);
                   conn.getCanvas().getCommandStack().execute(new draw2d.command.CommandReplaceVertices(conn, originalVertices, newVertices));
                   break;
               case "split":
                   var originalVertices = conn.getVertices().clone(true);
                   this.splitSegment(conn, segment.index, x, y);
                   var newVertices = conn.getVertices().clone(true);
                   conn.getCanvas().getCommandStack().execute(new draw2d.command.CommandReplaceVertices(conn, originalVertices, newVertices));
                   break;
               default:
                   break;
               }
            },this),
            x:x,
            y:y,
            items: items
        });
    }
});
draw2d.policy.port.PortFeedbackPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({
    NAME : "draw2d.policy.port.PortFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
    },
    onHoverEnter: function(canvas, draggedFigure, hoverFigure)
    {
    },
    onHoverLeave: function(canvas, draggedFigure, hoverFigure)
    {
    }
});
draw2d.policy.port.ElasticStrapFeedbackPolicy = draw2d.policy.port.PortFeedbackPolicy.extend({
    NAME : "draw2d.policy.port.ElasticStrapFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
        this.connectionLine = null;
    },
    onDragStart: function(canvas, figure, x, y, shiftKey, ctrlKey)
    {
        this.connectionLine = new draw2d.shape.basic.Line();
        this.connectionLine.setCanvas(canvas);
        this.connectionLine.getShapeElement();
        this.onDrag(canvas, figure);
    },
    onDrag: function(canvas, figure)
    {
        var x1 = figure.ox+figure.getParent().getAbsoluteX();
        var y1 = figure.oy+figure.getParent().getAbsoluteY();
        this.connectionLine.setStartPoint(x1,y1);
        this.connectionLine.setEndPoint(figure.getAbsoluteX(),figure.getAbsoluteY());
    },
    onDragEnd: function(canvas, figure, x, y, shiftKey, ctrlKey)
    {
        this.connectionLine.setCanvas(null);
        this.connectionLine = null;
    },
    onHoverEnter: function(canvas, draggedFigure, hoverFiger)
    {
    	this.connectionLine.setGlow(true);
    	hoverFiger.setGlow(true);
    },
    onHoverLeave: function(canvas, draggedFigure, hoverFiger)
    {
    	hoverFiger.setGlow(false);
    	this.connectionLine.setGlow(false);
    }
});
draw2d.policy.port.IntrusivePortsFeedbackPolicy = draw2d.policy.port.PortFeedbackPolicy.extend({
    NAME : "draw2d.policy.port.IntrusivePortsFeedbackPolicy",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
        this.connectionLine = null;
        this.tweenable = null;
    },
    onDragStart: function(canvas, figure, x, y, shiftKey, ctrlKey)
    {
        var start = 0;
        var allPorts = canvas.getAllPorts().clone();
        allPorts.each(function(i, element){
            if(typeof element.__beforeInflate ==="undefined") {
                element.__beforeInflate = element.getWidth();
            }
	        start = element.__beforeInflate;
    	});
        allPorts.grep(function(p){
    	    return (p.NAME != figure.NAME && p.parent!==figure.parent) || (p instanceof draw2d.HybridPort) || (figure instanceof draw2d.HybridPort);
    	});
        this.tweenable = new Tweenable();
        this.tweenable.tween({
          from:     { 'size': start/2 },
          to:       { 'size': start   },
          duration: 200,
          easing : "easeOutSine",
          step: function(params) {
        	  allPorts.each(function(i, element){
                  element.shape.attr({rx : params.size, ry :params.size});
                  element.width = element.height = params.size*2;
              });
          }
        });
        this.connectionLine = new draw2d.shape.basic.Line();
        this.connectionLine.setCanvas(canvas);
        this.connectionLine.getShapeElement();
        this.connectionLine.setDashArray("- ");
        this.connectionLine.setColor("#30c48a");
        this.onDrag(canvas, figure);
        return true;
    },
    onDrag: function(canvas, figure)
    {
        var x1 = figure.ox+figure.getParent().getAbsoluteX();
        var y1 = figure.oy+figure.getParent().getAbsoluteY();
        this.connectionLine.setStartPoint(x1,y1);
        this.connectionLine.setEndPoint(figure.getAbsoluteX(),figure.getAbsoluteY());
    },
    onDragEnd: function(canvas, figure, x, y, shiftKey, ctrlKey)
    {
        if(this.tweenable) {
            this.tweenable.stop(true);
            this.tweenable.dispose();
            this.tweenable = null;
        }
        canvas.getAllPorts().each(function(i, element){
    	    element.shape.attr({rx : element.__beforeInflate/2, ry :element.__beforeInflate/2});
            element.width = element.height = element.__beforeInflate;
            delete element.__beforeInflate;
    	});
        this.connectionLine.setCanvas(null);
        this.connectionLine = null;
    },
    onHoverEnter: function(canvas, draggedFigure, hoverFiger)
    {
    	this.connectionLine.setGlow(true);
    	hoverFiger.setGlow(true);
    },
    onHoverLeave: function(canvas, draggedFigure, hoverFiger)
    {
    	hoverFiger.setGlow(false);
        if(this.connectionLine===null){
            debugger;
        }
    	this.connectionLine.setGlow(false);
    }
});
draw2d.Configuration = {
    version : "6.1.65",
    i18n : {
        command : {
            move : "Move Shape",
            assignShape : "Add Shapes to Composite",
            groupShapes : "Group Shapes",
            ungroupShapes : "Ungroup Shapes",
            deleteShape : "Delete Shape",
            moveShape : "Move Shape",
            moveLine : "Move Line",
            addShape : "Add Shape",
            moveVertex : "Move Vertex",
            moveVertices : "Move Vertices",
            deleteVertex : "Delete Vertex",
            resizeShape : "Resize Shape",
            collection : "Execute Commands",
            addVertex : "Add Vertex",
            changeAttributes:"Change Attributes",
            connectPorts : "Connect Ports"
        },
        menu : {
            deleteSegment : "Delete Segment",
            addSegment : "Add Segment"
        },
        dialog : {
            filenamePrompt : "Enter Filename:"
        }
    },
    factory:{
    	createResizeHandle: function(forShape, type){
    		return new draw2d.ResizeHandle(forShape, type);
    	},
    	createConnection: function(sourcePort, targetPort, callback, dropTarget){
            console.log("deprecated call factory.createConnection");
            debugger;
    	    return new draw2d.Connection();
    	},
    	createInputPort: function(relatedFigure){
    	    return new draw2d.InputPort();
    	},
        createOutputPort: function(relatedFigure){
            return new draw2d.OutputPort();
        },
        createHybridPort: function(relatedFigure){
            return new draw2d.HybridPort();
        }
    }
};
draw2d.Canvas = Class.extend(
{
    NAME : "draw2d.Canvas",
    init: function(canvasId, width, height)
    {
        var _this = this;
        this.setScrollArea(document.body);
        this.canvasId = canvasId;
        this.html = $("#"+canvasId);
        this.html.css({"cursor":"default"});
        if($.isNumeric(width) && $.isNumeric(height)){
            this.initialWidth  = width;
            this.initialHeight = height;
        }
        else{
            this.initialWidth  = this.getWidth();
            this.initialHeight = this.getHeight();
        }
        this.html.css({"-webkit-tap-highlight-color": "rgba(0,0,0,0)"});
        if(typeof this.html.droppable !=="undefined"){
            this.html.droppable({
                accept: '.draw2d_droppable',
                over: function(event, ui) {
                    _this.onDragEnter(ui.draggable);
                },
                out: function(event, ui) {
                    _this.onDragLeave(ui.draggable);
                },
                drop: function(event, ui){
                    event = _this._getEvent(event);
                    var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    _this.onDrop(ui.draggable, pos.getX(), pos.getY(), event.shiftKey, event.ctrlKey);
                }
            });
            $(".draw2d_droppable").draggable({
                appendTo:"body",
                stack:"body",
                zIndex: 27000,
                helper:"clone",
                drag: function(event, ui){
                    event = _this._getEvent(event);
                    var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    _this.onDrag(ui.draggable, pos.getX(), pos.getY(), event.shiftKey, event.ctrlKey);
                },
                stop: function(e, ui){
                },
                start: function(e, ui){
                    $(ui.helper).addClass("shadow");
                }
           });
        }
        if($.isNumeric(height)){
            this.paper = Raphael(canvasId, width, height);
        }
        else{
            this.paper = Raphael(canvasId, this.getWidth(), this.getHeight());
        }
        this.paper.canvas.style.position="absolute";
        this.zoomPolicy = null; 
        this.zoomFactor = 1.0; 
        this.selection  = new draw2d.Selection();
        this.currentDropTarget = null;
        this.currentHoverFigure = null;
        this.regionDragDropConstraint =  new draw2d.policy.figure.RegionEditPolicy(0,0,this.getWidth(), this.getHeight());
        this.eventSubscriptions = {};
        this.editPolicy = new draw2d.util.ArrayList();
        this.figures     = new draw2d.util.ArrayList();
        this.lines       = new draw2d.util.ArrayList(); 
        this.commonPorts = new draw2d.util.ArrayList();
        this.dropTargets = new draw2d.util.ArrayList();
        this.resizeHandles = new draw2d.util.ArrayList();
        this.commandStack = new draw2d.command.CommandStack();
        this.linesToRepaintAfterDragDrop =  new draw2d.util.ArrayList();
        this.lineIntersections = new draw2d.util.ArrayList();
        this.installEditPolicy( new draw2d.policy.canvas.WheelZoomPolicy());                
        this.installEditPolicy( new draw2d.policy.canvas.DefaultKeyboardPolicy());          
        this.installEditPolicy( new draw2d.policy.canvas.BoundingboxSelectionPolicy());     
        this.installEditPolicy( new draw2d.policy.canvas.DropInterceptorPolicy());          
        this.installEditPolicy( new draw2d.policy.connection.ComposedConnectionCreatePolicy(
                                [
                                    new draw2d.policy.connection.DragConnectionCreatePolicy(),  
                                    new draw2d.policy.connection.ClickConnectionCreatePolicy()  
                                ])
        );
        this.commandStack.addEventListener(function(event){
            if(event.isPostChangeEvent()===true){
                _this.calculateConnectionIntersection();
                _this.linesToRepaintAfterDragDrop.each(function(i,line){
                    line.svgPathString=null;
                    line.repaint();
                });
                _this.linesToRepaintAfterDragDrop =  new draw2d.util.ArrayList();
            }
        });
        this.mouseDown  = false;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.mouseDragDiffX =0;
        this.mouseDragDiffY =0;
        this.html.bind("mouseup touchend", function(event)
        {
            if (_this.mouseDown === false){
                return;
            }
            event = _this._getEvent(event);
            _this.calculateConnectionIntersection();
            _this.mouseDown = false;
            var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
            _this.editPolicy.each(function(i,policy){
                policy.onMouseUp(_this, pos.x, pos.y, event.shiftKey, event.ctrlKey);
            });
            _this.mouseDragDiffX = 0;
            _this.mouseDragDiffY = 0;
        });
        this.html.bind("mousemove touchmove", function(event)
        {
            event  = _this._getEvent(event);
            var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
            if (_this.mouseDown === false){
               try{
	               var hover = _this.getBestFigure(pos.x,pos.y);
	               if(hover !== _this.currentHoverFigure && _this.currentHoverFigure!==null){
	            	   _this.currentHoverFigure.onMouseLeave(); 
	            	   _this.currentHoverFigure.fireEvent("mouseleave");
                       _this.fireEvent("mouseleave", {figure:_this.currentHoverFigure});
	               }
	               if(hover !== _this.currentHoverFigure && hover!==null){
	            	   hover.onMouseEnter();
	            	   hover.fireEvent("mouseenter");
                       _this.fireEvent("mouseenter", {figure:hover});
	               }
	               _this.currentHoverFigure = hover;
               }
               catch(exc){
            	   console.log(exc);
               }
               _this.editPolicy.each(function(i,policy){
                   policy.onMouseMove(_this, pos.x, pos.y, event.shiftKey, event.ctrlKey);
               });
               _this.fireEvent("mousemove",{x:pos.x, y:pos.y, shiftKey:event.shiftKey, ctrlKey:event.ctrlKey, hoverFigure:_this.currentHoverFigure});
            }
            else{
               var diffXAbs = (event.clientX - _this.mouseDownX)*_this.zoomFactor;
               var diffYAbs = (event.clientY - _this.mouseDownY)*_this.zoomFactor;
               _this.editPolicy.each(function(i,policy){
                   policy.onMouseDrag(_this,diffXAbs, diffYAbs, diffXAbs-_this.mouseDragDiffX, diffYAbs-_this.mouseDragDiffY,  event.shiftKey, event.ctrlKey);
               });
               _this.mouseDragDiffX = diffXAbs;
               _this.mouseDragDiffY = diffYAbs;
               _this.fireEvent("mousemove",{x:pos.x, y:pos.y, shiftKey:event.shiftKey, ctrlKey:event.ctrlKey, hoverFigure:_this.currentHoverFigure});
           }
        });
        this.html.bind("mousedown touchstart", function(event)
        {
            try{
            var pos = null;
            switch (event.which) {
            case 1: 
            case 0: 
                try{
                    event.preventDefault();
                    event = _this._getEvent(event);
                    _this.mouseDownX = event.clientX;
                    _this.mouseDownY = event.clientY;
                    _this.mouseDragDiffX = 0;
                    _this.mouseDragDiffY = 0;
                    pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    _this.mouseDown = true;
                    _this.editPolicy.each(function(i,policy){
                        policy.onMouseDown(_this,pos.x,pos.y, event.shiftKey, event.ctrlKey);
                    });
                }
                catch(exc){
                    console.log(exc);
                }
                break;
            case 3: 
                event.preventDefault();
                event = _this._getEvent(event);
                pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                _this.onRightMouseDown(pos.x, pos.y, event.shiftKey, event.ctrlKey);
                break;
            case 2:
                break;
             default:
            }
            }
            catch(exc){
                console.log(exc);
            }
        });
        this.html.on("dblclick",function(event)
        {
            event = _this._getEvent(event);
            _this.mouseDownX = event.clientX;
            _this.mouseDownY = event.clientY;
            var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
            _this.onDoubleClick(pos.x, pos.y, event.shiftKey, event.ctrlKey);
        });
        this.html.on("click",function(event)
        {
            event = _this._getEvent(event);
            if(_this.mouseDownX === event.clientX ||  _this.mouseDownY === event.clientY){
                var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                _this.onClick(pos.x, pos.y, event.shiftKey, event.ctrlKey);
            }
        });
        this.html.on('MozMousePixelScroll DOMMouseScroll mousewheel', function(e) {
            var event = _this._getEvent(e);
            var pos = _this.fromDocumentToCanvasCoordinate(event.originalEvent.clientX, event.originalEvent.clientY);
            var delta = 0;
            if (e.type == 'mousewheel') {
                delta = (e.originalEvent.wheelDelta * -1);
            }
            else if (e.type == 'DOMMouseScroll') {
                delta = 40 * e.originalEvent.detail;
            }
            var returnValue = _this.onMouseWheel(delta, pos.x, pos.y, event.shiftKey, event.ctrlKey);
            if(returnValue===false){
                e.preventDefault();
            }
        });
        this.keyupCallback = function(event) {
            var target =$(event.target);
            if(!target.is("input") && !target.is("textarea")){
                _this.editPolicy.each(function(i,policy){
                    if(policy instanceof draw2d.policy.canvas.KeyboardPolicy){
                        policy.onKeyUp(_this, event.keyCode, event.shiftKey, event.ctrlKey);
                    }
               });
             }
        };
        $(document).bind("keyup", this.keyupCallback);
        this.keydownCallback = function(event) {
            var target =$(event.target);
            if(!target.is("input") && !target.is("textarea")){
               _this.editPolicy.each(function(i,policy){
                   if(policy instanceof draw2d.policy.canvas.KeyboardPolicy){
                       policy.onKeyDown(_this, event.keyCode, event.shiftKey, event.ctrlKey);
                   }
              });
            }
        };
        $(document).bind("keydown",this.keydownCallback);
    },
    destroy: function()
    {
      this.clear();
      $(document).unbind("keydown", this.keydownCallback);
      $(document).unbind("keyup"  , this.keyupCallback);
      this.eventSubscriptions = {};
     try{
          this.paper.remove();
      }catch(exc){
      }
    },
    clear: function()
    {
        this.fireEvent("clear");
        var _this = this;
        this.lines.clone().each(function(i,e){
            _this.remove(e);
        });
         this.figures.clone().each(function(i,e){
            _this.remove(e);
        });
        this.zoomFactor =1.0;
        this.selection.clear();
        this.currentDropTarget = null;
        this.figures = new draw2d.util.ArrayList();
        this.lines = new draw2d.util.ArrayList();
        this.commonPorts = new draw2d.util.ArrayList();
        this.dropTargets = new draw2d.util.ArrayList();
        this.commandStack.markSaveLocation();
        this.linesToRepaintAfterDragDrop =  new draw2d.util.ArrayList();
        this.lineIntersections = new draw2d.util.ArrayList();
        this.fireEvent("select",{figure:null});
        return this;
    },
    hideDecoration: function()
    {
    },
    showDecoration: function()
    {
    },
    calculateConnectionIntersection: function()
    {
        var _this = this;
        this.lineIntersections = new draw2d.util.ArrayList();
        var lines = this.getLines().clone();
        while(lines.getSize()>0){
            var l1 = lines.removeElementAt(0);
            lines.each(function(ii,l2){
                var partInter =l1.intersection(l2);
                if(partInter.getSize()>0){
                   _this.lineIntersections.add({line:l1, other:l2, intersection:partInter});
                   _this.lineIntersections.add({line:l2, other:l1, intersection:partInter});
                }
            });
        }
        return this;
    },
    installEditPolicy: function(policy)
    {
        var _this = this;
        if(policy instanceof draw2d.policy.canvas.SelectionPolicy){
            this.getSelection().getAll().each(function(i,figure){
                figure.unselect();
            });
            this.editPolicy.grep(function(p){
                var stay = !(p instanceof draw2d.policy.canvas.SelectionPolicy); 
                if(stay===false){
                    p.onUninstall(_this);
                }
                return stay;
            });
        }
        else if(policy instanceof draw2d.policy.canvas.ZoomPolicy){
            this.editPolicy.grep(function(p){
                var stay = !(p instanceof draw2d.policy.canvas.ZoomPolicy);
                if(stay===false){
                    p.onUninstall(_this);
                }
                return stay;
            });
            this.zoomPolicy = policy;
        }
        else if(policy instanceof draw2d.policy.connection.ConnectionCreatePolicy){
            this.editPolicy.grep(function(p){
                var stay = !(p instanceof draw2d.policy.connection.ConnectionCreatePolicy);
                if(stay===false){
                    p.onUninstall(_this);
                }
                return stay;
            });
        }
        else if( policy instanceof draw2d.policy.canvas.DropInterceptorPolicy){
        }
        policy.onInstall(this);
        this.editPolicy.add(policy);  
        return this;
    },
    uninstallEditPolicy: function(policy)
    {
        if(policy===null){
            return; 
        }
        var removed = this.editPolicy.remove(policy);
        if(removed!==null){
            removed.onUninstall(this);
            if(removed instanceof draw2d.policy.canvas.ZoomPolicy){
                this.zoomPolicy = null;
            }
        }
        else{
            var _this = this;
            var name = (typeof policy === "string")?policy:policy.NAME;
            this.editPolicy.grep(function(p){
                if(p.NAME === name){
                    p.onUninstall(_this);
                    if(p instanceof draw2d.policy.canvas.ZoomPolicy){
                        _this.zoomPolicy = null;
                    }
                    return false;
                }
                return true;
            });
        }
        return this;
    },
    getDropInterceptorPolicies: function()
    {
        return  this.editPolicy.clone().grep(function(p){
                   return (p instanceof  draw2d.policy.canvas.DropInterceptorPolicy);
                });
    },
    setZoom: function(zoomFactor, animated)
    {
        if(this.zoomPolicy){
            this.zoomPolicy.setZoom(zoomFactor, animated);
        }
    },
    getZoom: function()
    {
        return this.zoomFactor;
    },
    getDimension: function()
    {
        return new draw2d.geo.Rectangle(0,0,this.initialWidth, this.initialHeight);
    },
    setDimension: function(dim, height)
    {
        if (typeof dim === "undefined"){
            var widths  = this.getFigures().clone().map(function(f){ return f.getAbsoluteX()+f.getWidth();});
            var heights = this.getFigures().clone().map(function(f){ return f.getAbsoluteY()+f.getHeight();});
            this.initialHeight = Math.max.apply(Math,heights.asArray());
            this.initialWidth  = Math.max.apply(Math,widths.asArray());
        }
        else if(dim instanceof draw2d.geo.Rectangle){
            this.initialWidth  = dim.w;
            this.initialHeight = dim.h;
        }
        else if(typeof dim.width ==="number" && typeof dim.height ==="number"){
            this.initialWidth  = dim.width;
            this.initialHeight = dim.height;
        }
        else if(typeof dim ==="number" && typeof height ==="number"){
            this.initialWidth  = dim;
            this.initialHeight = height;
        }
        this.html.css({"width":this.initialWidth+"px", "height":this.initialHeight+"px"});
        this.paper.setSize(this.initialWidth, this.initialHeight);
        this.setZoom(this.zoomFactor, false);
        return this;
    },
    fromDocumentToCanvasCoordinate: function(x, y)
    {
        return new draw2d.geo.Point(
                (x - this.getAbsoluteX() + this.getScrollLeft())*this.zoomFactor,
                (y - this.getAbsoluteY() + this.getScrollTop())*this.zoomFactor);
    },
    fromCanvasToDocumentCoordinate: function(x,y)
    {
        return new draw2d.geo.Point(
                ((x*(1/this.zoomFactor)) + this.getAbsoluteX() - this.getScrollLeft()),
                ((y*(1/this.zoomFactor)) + this.getAbsoluteY() - this.getScrollTop()));
    },
    getHtmlContainer: function()
    {
       return this.html; 
    },
    _getEvent: function(event)
    {
      if(typeof event.originalEvent !== "undefined"){  
          if(event.originalEvent.touches && event.originalEvent.touches.length) {
               return event.originalEvent.touches[0];
          } else if(event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
               return event.originalEvent.changedTouches[0];
          }
      }
      return event;
    },
    setScrollArea: function(elementSelector)
    {
       this.scrollArea= $(elementSelector);
       return this;
    },
    getScrollArea: function()
    {
       return this.scrollArea;
    },
    getScrollLeft: function()
    {
      return this.getScrollArea().scrollLeft();
    },
    getScrollTop: function()
    {
      return this.getScrollArea().scrollTop();
    },
    setScrollLeft: function(left)
    {
        this.getScrollArea().scrollLeft();
        return this;
    },
    setScrollTop: function(top)
    {
        this.getScrollArea().scrollTop();
        return this;
    },
    scrollTo: function(top, left)
    {
        this.getScrollArea().scrollTop(top);
        this.getScrollArea().scrollLeft(left);
        return this;
    },
    getAbsoluteX: function()
    {
        return this.html.offset().left;
    },
    getAbsoluteY: function()
    {
      return this.html.offset().top;
    },
    getWidth: function()
    {
        return this.html.width();
    },
    getHeight: function()
    {
      return this.html.height();
    },
    add: function( figure , x,  y)
    {
        if(figure.getCanvas()===this){
            return;
        }
        if(figure instanceof draw2d.shape.basic.Line){
         this.lines.add(figure);
         this.linesToRepaintAfterDragDrop = this.lines;
        }
        else{
         this.figures.add(figure);
         if(typeof y !== "undefined"){
             figure.setPosition(x,y);
         }
         else if(typeof x !== "undefined"){
             figure.setPosition(x);
         }
        }
        figure.setCanvas(this);
        figure.installEditPolicy(this.regionDragDropConstraint);
        figure.getShapeElement();
        figure.repaint();
        this.fireEvent("figure:add", {figure:figure, canvas:this});
        figure.fireEvent("added",{figure:figure, canvas:this});
        figure.fireEvent("move",{figure:figure, dx:0, dy:0});
        if(figure instanceof draw2d.shape.basic.PolyLine) {
            this.calculateConnectionIntersection();
            this.linesToRepaintAfterDragDrop.each(function (i, line) {
                line.svgPathString = null;
                line.repaint();
            });
            this.linesToRepaintAfterDragDrop = new draw2d.util.ArrayList();
        }
        return this;
    },
    remove: function(figure){
        if(figure.getCanvas()!==this){
            return this;
        }
        var _this = this;
        this.editPolicy.each(function(i,policy){
            if(typeof policy.unselect==="function"){
                policy.unselect(_this,figure);
            }
        });
        if(figure instanceof draw2d.shape.basic.Line){
           this.lines.remove(figure);
        }
        else {
           this.figures.remove(figure);
        }
        figure.setCanvas(null);
        if(figure instanceof draw2d.Connection){
           figure.disconnect();
        }
        this.fireEvent("figure:remove", {figure:figure});
        figure.fireEvent("removed", {figure:figure, canvas:this});
        return this;
    },
    getLines: function()
    {
      return this.lines;
    },
    getFigures: function()
    {
      return this.figures;
    },
    getLine: function( id)
    {
      var count = this.lines.getSize();
      for(var i=0; i<count;i++)
      {
         var line = this.lines.get(i);
         if(line.getId()===id){
            return line;
         }
      }
      return null;
    },
    getFigure: function( id)
    {
      var figure = null;
      this.figures.each(function(i,e){
          if(e.id===id){
              figure=e;
              return false;
           }
      });
      return figure;
    },
    getIntersection: function(line)
    {
       var result = new draw2d.util.ArrayList();
       this.lineIntersections.each(function(i, entry){
           if(entry.line ===line){
               entry.intersection.each(function(i,p){
                   result.add({x:p.x, y:p.y, justTouching:p.justTouching, other:entry.other});
               });
           }
       });
       return result;
    },
    snapToHelper:function(figure,  pos)
    {
        if(this.getSelection().getSize()>1){
            return pos;
        }
        var _this = this;
        var orig = pos.clone();
        this.editPolicy.each(function(i,policy){
             pos = policy.snap(_this, figure, pos, orig);
        });
        return pos;
    },
    registerPort: function(port )
    {
      if(!this.commonPorts.contains(port)){
          this.commonPorts.add(port);
      }
      return this;
    },
    unregisterPort: function(port )
    {
        this.commonPorts.remove(port);
        return this;
    },
    getAllPorts: function()
    {
        return this.commonPorts;
    },
    getCommandStack: function()
    {
      return this.commandStack;
    },
    getPrimarySelection: function()
    {
      return this.selection.getPrimary();
    },
    getSelection: function()
    {
      return this.selection;
    },
    setCurrentSelection: function( object )
    {
        var _this = this;
        this.selection.each(function(i,e){
            _this.editPolicy.each(function(i,policy){
                if(typeof policy.unselect==="function"){
                    policy.unselect(_this,e);
                }
            });
        });
        this.addSelection(object);
        return this;
    },
    addSelection:function( object )
    {
        var _this = this;
        var add = function(i, figure){
            _this.editPolicy.each(function(i,policy){
                if(typeof policy.select==="function"){
                    policy.select(_this,figure);
                }
            });            
        };
        if(object instanceof draw2d.util.ArrayList){
            object.each(add);
        }
        else{
            add(0,object);
        }
        return this;
    },
    getBestFigure: function(x, y, blacklist, whitelist)
    {
    	if(!$.isArray(blacklist)){
            if(blacklist)
                blacklist = [blacklist];
            else
                blacklist = [];
    	}
        if(!$.isArray(whitelist)){
            if(whitelist)
                whitelist = [whitelist];
            else
                whitelist = [];
        }
        var result = null;
        var testFigure = null;
        var isInList = function(testFigure, list){
            var i,len; 
            for(i=0,len=list.length; i<len;i++){
                var considering=list[i];
                if($.isFunction(considering)){
                    if(testFigure instanceof considering){
                        return true;
                    }
                }
                else if((considering===testFigure) || (considering.contains(testFigure))){
                    return true;
                }
            }
            return false;
        };
        var isInBlacklist=function(item){return isInList(item,blacklist)};
        var isInWhitelist=whitelist.length===0?function(){return true;}:function(item){return isInList(item,whitelist)};
        var checkRecursive = function(children){
            children.each(function(i,e){
                var c=e.figure;
                checkRecursive(c.children);
                if(result===null && c.isVisible() && c.hitTest(x,y) && !isInBlacklist(c) &&  isInWhitelist(c)){
                    result = c;
                }
                return result===null; 
            });
        };
        var i,len;
        for ( i = 0, len = this.resizeHandles.getSize(); i < len; i++) {
            testFigure = this.resizeHandles.get(i);
            if (testFigure.isVisible() && testFigure.hitTest(x, y) && !isInBlacklist(testFigure) &&  isInWhitelist(testFigure)){
                return testFigure;
            }
        }
        for ( i = 0, len = this.commonPorts.getSize(); i < len; i++) {
            port = this.commonPorts.get(i);
            checkRecursive( port.children);
            if(result===null && port.isVisible() && port.hitTest(x, y) && !isInBlacklist(port) &&  isInWhitelist(port)){
                result = port;
            }
            if(result !==null){
                return result;
            }
        }
        for ( i = (this.figures.getSize()-1); i >=0; i--)
        {
            var figure = this.figures.get(i);
            checkRecursive( figure.children);
            if (result ===null && figure.isVisible() && figure.hitTest(x, y) && !isInBlacklist(figure) &&  isInWhitelist(figure)) {
                result = figure;
            }
            if(result !==null){
                {
                    var resultLine = this.getBestLine(x,y,result);
                    if(resultLine !==null){
                        var lineIndex   = $(resultLine.shape.node).index();
                        var resultIndex = $(result.shape.node).index();
                        if(resultIndex<lineIndex) {
                            return resultLine;
                        }
                    }
                }
                return result;
            }
        }
        var count = this.lines.getSize();
        for(i=0;i< count;i++)
        {
          var line = this.lines.get(i);
          checkRecursive( line.children);
          if(result !==null){
              return result;
          }
        }
        result = this.getBestLine(x,y,blacklist, whitelist);
        if(result !==null){
            return result;
        }
       return result;
    },
    getBestLine: function( x,  y,  lineToIgnore)
    {
    	if(!$.isArray(lineToIgnore)){
    		if(lineToIgnore instanceof draw2d.Figure){
    			lineToIgnore = [lineToIgnore];
    		}
    		else{
    			lineToIgnore=[];
    		}
    	}
    	var count = this.lines.getSize();
	    for(var i=0;i< count;i++)
	    {
	      var line = this.lines.get(i);
	      if(line.isVisible()===true && line.hitTest(x,y)===true  && $.inArray(line, lineToIgnore)===-1)
	      {
	          return line;
	      }
	    }
	    return null;
    }, 
    onDragEnter: function( draggedDomNode )
    {
    },
    onDrag: function(draggedDomNode, x, y )
    {
    },
    onDragLeave: function( draggedDomNode )
    {
    },
    onDrop: function(droppedDomNode, x, y, shiftKey, ctrlKey)
    {
    },
    onDoubleClick: function(x, y, shiftKey, ctrlKey)
    {
        var figure = this.getBestFigure(x, y);
        if(figure===null){
            figure = this.getBestLine(x,y);
        }
        this.fireEvent("dblclick",  {figure:figure, x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        this.editPolicy.each(function(i,policy){
            policy.onDoubleClick(figure, x,y, shiftKey, ctrlKey);
        });
    },
    onClick: function(x, y, shiftKey, ctrlKey)
    {
        var figure = this.getBestFigure(x, y);
        this.fireEvent("click", {
            figure:figure,
            x:x,
            y:y,
            relX: figure!==null?x-figure.getAbsoluteX():0,
            relY: figure!==null?y-figure.getAbsoluteY():0,
            shiftKey:shiftKey,
            ctrlKey:ctrlKey});
        this.editPolicy.each(function(i,policy){
            policy.onClick(figure, x, y, shiftKey, ctrlKey);
        });
    },
    onRightMouseDown: function(x, y, shiftKey, ctrlKey)
    {
        var figure = this.getBestFigure(x, y);
        this.fireEvent("contextmenu",  {figure:figure, x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        if(figure!==null){
            figure.fireEvent("contextmenu", {figure:figure, x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
            figure.onContextMenu(x,y);
            figure.editPolicy.each(function(i,policy){
                policy.onRightMouseDown(figure, x, y, shiftKey, ctrlKey);
            });
        }
        this.editPolicy.each(function(i,policy){
            policy.onRightMouseDown(figure, x, y, shiftKey, ctrlKey);
        });
    },
    onMouseWheel: function(wheelDelta, x, y, shiftKey, ctrlKey)
    {
        var returnValue = true;
        this.fireEvent("wheel", {wheelDelta:wheelDelta, x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        this.editPolicy.each(function(i,policy){
            returnValue =  policy.onMouseWheel( wheelDelta, x, y, shiftKey, ctrlKey) && returnValue;
        });
        return returnValue;
    },
    fireEvent: function(event, args)
    {
        if (typeof this.eventSubscriptions[event] === 'undefined') {
            return;
        }
        var subscribers = this.eventSubscriptions[event];
        for (var i=0; i<subscribers.length; i++) {
            try{
                subscribers[i](this, args);
            }
            catch(exc){
                console.log(exc);
                console.log(subscribers[i]);
                debugger;
            }
        }
    },
    on: function(event, callback)
    {
        var events = event.split(" ");
        for(var i=0; i<events.length; i++){
            if (typeof this.eventSubscriptions[events[i]] === 'undefined') {
                this.eventSubscriptions[events[i]] = [];
            }
            this.eventSubscriptions[events[i]].push(callback);
        }
        return this;
    },
    off: function( eventOrFunction)
    {
        if(typeof eventOrFunction ==="undefined"){
            this.eventSubscriptions = {};
        }
        else if( typeof eventOrFunction === 'string'){
            this.eventSubscriptions[eventOrFunction] = [];
        }
        else{
            for(var event in this.eventSubscriptions ){
                this.eventSubscriptions[event] =$.grep(this.eventSubscriptions[event], function( callback ) { return callback !== eventOrFunction; });
            }
        }
        return this;
    }
});
draw2d.Selection = Class.extend({
    NAME : "draw2d.Selection",
    init: function()
    {
        this.primary = null;
        this.all = new draw2d.util.ArrayList();
    },
    clear: function()
    {
        this.primary = null;
        this.all = new draw2d.util.ArrayList();
        return this;
    },
    getPrimary: function()
    {
        return this.primary;
    },
    setPrimary: function(figure)
    {
        this.primary = figure;
        this.add(figure);
        return this;
    },
    remove: function(figure)
    {
        this.all.remove(figure);
        if(this.primary===figure){
            this.primary = null;
        }
        return this;
    },
    add: function(figure)
    {
        if(figure!==null && !this.all.contains(figure)){
            this.all.add(figure);
        }
        return this;
    },
    contains: function(figure, checkDescendant)
    {
        if(checkDescendant){
            for(var i=0; i<this.all.getSize();i++){
                var figureToCheck = this.all.get(i);
                if(figureToCheck===figure || figureToCheck.contains(figure)){
                    return true;
                }
            }
            return false;
        }
        return this.all.contains(figure);
    },
    getSize: function()
    {
        return this.all.getSize();
    },
    getAll: function(expand)
    {
        if(expand ===true){
            var result = new draw2d.util.ArrayList();
            var addRecursive = function(figures){
                result.addAll(figures,true);
                figures.each(function(index, figure){
                    if(figure instanceof draw2d.shape.composite.StrongComposite){
                        addRecursive(figure.getAssignedFigures());
                    }
                });
            };
            addRecursive(this.all);
            return result;
        }
        return this.all.clone();
    },
    each: function( func, reverse)
    {
        this.all.each(func, reverse);
        return this;
    }
});
draw2d.Figure = Class.extend({
	NAME : "draw2d.Figure",
	MIN_TIMER_INTERVAL: 50, 
    init: function( attr, setter, getter) {
        this.setterWhitelist = $.extend({
            id   : this.setId,
            x   : this.setX,
            y   : this.setY,
            width   : this.setWidth,
            height   : this.setHeight,
            boundingBox : this.setBoundingBox,
            minWidth   : this.setMinWidth,
            minHeight   : this.setMinHeight,
            cssClass   : this.setCssClass,
            userData   : this.setUserData,
            resizeable : this.setResizeable,
            selectable : this.setSelectable,
            angle      : this.setRotationAngle,
            alpha  : this.setAlpha,
            opacity  : this.setAlpha,
            glow  : this.setGlow,
            visible  : this.setVisible,
            keepAspectRatio : this.setKeepAspectRatio
        },setter);
        this.getterWhitelist = $.extend({
            id: this.getId,
            visible: this.isVisible,
            angle: this.getRotationAngle,
            x: this.getX,
            y: this.getY,
            width : this.getWidth,
            height: this.getHeight,
            resizeable : this.isResizeable,
            selectable : this.isSelectable,
            alpha  : this.getAlpha,
            opacity : this.getAlpha
        },getter);
        var _this = this;
        this.id = draw2d.util.UUID.create();
        this.isResizeHandle=false;
        this.command = null;
        this.canvas = null;
        this.shape  = null;
        this.children = new draw2d.util.ArrayList();
        this.selectable = true;
        this.deleteable = true;
        this.resizeable = true;
        this.draggable = true;
        this.visible = true;
        this.keepAspectRatio = false; 
        this.canSnapToHelper = true;
        this.snapToGridAnchor = new draw2d.geo.Point(0,0);    
        this.editPolicy = new draw2d.util.ArrayList();
        this.timerId = -1;
        this.timerInterval = 0;
        this.parent = null;
        this.composite = null;
        this.userData = null;
        this.x = 0;
        this.y = 0;
        this.minHeight = 5;
        this.minWidth = 5;
        this.rotationAngle = 0;
        this.cssClass = this.NAME.replace(new RegExp("[.]","g"), "_");
        this.width  = this.getMinWidth();
        this.height = this.getMinHeight();
        this.alpha = 1.0;
        this.isInDragDrop =false;
        var _this = this;
        this.ox = 0;
        this.oy = 0;
        this.repaintBlocked=false;
        this.lastAppliedAttributes = {};
        this.selectionHandles = new draw2d.util.ArrayList();
        this.panningDelegate = null;
        this.eventSubscriptions = {};
        this.relocateChildrenEventCallback = function(){
            _this.children.each(function(i,e){
                e.locator.relocate(i, e.figure);
            });
        };
        this.defaultSelectionAdapter = this.selectionAdapter = function(){
            return _this;
        };
        this.installEditPolicy(new draw2d.policy.figure.RectangleSelectionFeedbackPolicy());
        this.attr(attr);
    },
    attr: function(name, value){
        var _this = this;
        var orig = this.repaintBlocked;
        try{
            if($.isPlainObject(name)){
                for(key in name){
                    if(key.substring(0,9)==="userData."){
                        if(this.userData===null){this.userData={};}
                        draw2d.util.JSON.set({userData:this.userData}, key, name[key]);
                        this.fireEvent("change:"+key,{value:name[key]});
                    }
                    else{
                        var func=this.setterWhitelist[key];
                        if(func){
                            func.call(this,name[key]); 
                        }
                        else if($.isFunction(name[key])){
                            this[key] = $.proxy(name[key],this);
                        }
                    }
                }
            }
            else if(typeof name === "string"){
                if(typeof value ==="undefined"){
                    var getter = this.getterWhitelist[name];
                    if($.isFunction(getter)){
                        return getter.call(this);
                    }
                    else if(name.substring(0,9)==="userData."){
                        var data = {userData:this.userData};
                        return draw2d.util.JSON.get(data, name);
                    }
                    return; 
                }
                if($.isFunction(value)){
                    value = value();
                }
                if(name.substring(0,9)==="userData."){
                    if(this.userData===null){this.userData={};}
                    draw2d.util.JSON.set({userData:this.userData}, name, value);
                    this.fireEvent("change:"+name,{value:value});
                }
                else{
                    var setter = this.setterWhitelist[name];
                    if (setter){setter.call(this,value);}
                }
            }
            else if($.isArray(name)){
                result = {};
                $.each(name,function(index, entry){
                    result[entry] = _this.attr(entry);
                });
                return result;
            }
            else if(typeof name === "undefined"){
            	var result = {};
            	for(key in this.getterWhitelist){
             		result[key] = this.getterWhitelist[key].call(this);
            	}
            	return result;
            }
        }
        finally{
            this.repaintBlocked=orig;
        }
        return this;
    },
    pick: function(obj, var_keys) {
        var keys = typeof arguments[1] !== 'string' ? arguments[1] : Array.prototype.slice.call(arguments, 1);
        var out = {}, key;
        for (key in keys) {
            if(typeof obj[key] !== "undefined")
                out[key] = obj[key];
        }
        return out;
    },
    select: function(asPrimarySelection){
        if(typeof asPrimarySelection==="undefined"){
            asPrimarySelection=true;
        }
        var _this=this;
        this.editPolicy.each(function(i,e){
              if(e instanceof draw2d.policy.figure.SelectionFeedbackPolicy){
                  e.onSelect(_this.canvas, _this,asPrimarySelection);
              }
        });
        if(this.canvas !== null){
            this.canvas.getSelection().add(this);
        }
         return this;
    },
    unselect: function()
    {
        var _this = this;
        this.editPolicy.each(function(i,e){
              if(e instanceof draw2d.policy.figure.SelectionFeedbackPolicy){
                  e.onUnselect(_this.canvas, _this);
              }
        });
        if(this.canvas !==null){
            this.canvas.getSelection().remove(this);
        }
        return this;
    },
    setSelectionAdapter: function(adapter)
    {
        if(adapter==null){
            this.selectionAdapter = this.defaultSelectionAdapter;
        }
        else {
            this.selectionAdapter = adapter;
        }
        return this;
    },
    getSelectionAdapter: function()
    {
        return this.selectionAdapter;
    },
    isSelected: function(){
        if(this.canvas !==null){
            return this.canvas.getSelection().contains(this);
        }
        return false;
    },
    setUserData: function(object)
    {
      this.userData = object;  
      this.fireEvent("change:userData",{value:object});
      return this;
    },
    getUserData: function()
    {
        return this.userData;
    },
    getId: function()
    {
       return this.id; 
    },
    setId: function(newId)
    {
        this.id = newId; 
        return this;
    },
    getCssClass: function()
    {
       return this.cssClass; 
    },
    setCssClass: function(cssClass)
    {
        this.cssClass = cssClass===null?null:$.trim(cssClass);
        if(this.shape===null){
            return this;
        }
        if(this.cssClass===null){
            this.shape.node.removeAttribute("class");
        }
        else{
            this.shape.node.setAttribute("class", this.cssClass);
        }
        this.fireEvent("change:cssClass",{value:this.cssClass});
        return this;
    },
    hasCssClass: function(className) {
        if(this.cssClass===null){
            return false;
        }
        return new RegExp(' ' + $.trim(className) + ' ').test(' ' + this.cssClass + ' ');
    },
    addCssClass: function( className) 
    {
        className = $.trim(className);
        if (!this.hasCssClass( className)) {
            if(this.cssClass===null){
                this.setCssClass(className);
            }
            else{
                this.setCssClass(this.cssClass + ' ' + className);
            }
            this.fireEvent("change:cssClass",{value:this.cssClass});
        }
        return this;
    },
    removeCssClass: function(className)
    {
        className = $.trim(className);
        var newClass = ' ' + this.cssClass.replace( /[\t\r\n]/g, ' ') + ' ';
        if (this.hasCssClass(className)) {
            while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
                newClass = newClass.replace(' ' + className + ' ', ' ');
            }
            this.setCssClass( newClass.replace(/^\s+|\s+$/g, ''));
            this.fireEvent("change:cssClass",{value:this.cssClass});
       }
        return this;
    },
    toggleCssClass: function( className)
    {
        className = $.trim(className);
        var newClass = ' ' + this.cssClass.replace( /[\t\r\n]/g, ' ' ) + ' ';
        if (this.hasCssClass( className)) {
            while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
                newClass = newClass.replace( ' ' + className + ' ' , ' ' );
            }
            this.setCssClass( newClass.replace(/^\s+|\s+$/g, ''));
        } else {
            this.setCssClass(this.cssClass + ' ' + className);
        }
        this.fireEvent("change:cssClass",{value:this.cssClass});
        return this;
    },
    setCanvas: function( canvas )
    {
      if(canvas===null && this.shape!==null)
      {
         this.unselect();
         this.shape.remove();
         this.shape=null;
      }
      this.canvas = canvas;
      if(this.canvas!==null){
          this.getShapeElement();
      }
      this.lastAppliedAttributes = {};
      if(canvas === null){
    	  this.stopTimer();
      }
      else{
    	  if(this.timerInterval>= this.MIN_TIMER_INTERVAL){
              this.startTimer(this.timerInterval);
    	  }
      }
      this.children.each(function(i,e){
          e.figure.setCanvas(canvas);
      });
      return this;    
     },
     getCanvas: function()
     {
         return this.canvas;
     },
     startTimer: function(milliSeconds)
     {
    	 this.stopTimer();
    	 this.timerInterval = Math.max(this.MIN_TIMER_INTERVAL, milliSeconds);
    	 if(this.canvas!==null){
    		 this.timerId = window.setInterval($.proxy(function(){
    		     this.onTimer();
    		     this.fireEvent("timer");
    		 },this), this.timerInterval);
    	 }
    	 return this;
     },
     stopTimer: function()
     {
    	if(this.timerId>=0){
  		  window.clearInterval(this.timerId);
		  this.timerId=-1;
    	} 
    	return this;
     },
     onTimer: function()
     {
     },
     toFront: function(figure)
     {
         if(this.composite instanceof draw2d.shape.composite.StrongComposite && (typeof figure !=="undefined")){
             var indexFigure = figure.getZOrder();
             var indexComposite= this.composite.getZOrder();
             if(indexFigure<indexComposite){
                 figure = this.composite;
             }
         }
         if(typeof figure ==="undefined"){
             this.getShapeElement().toFront();
             if(this.canvas!==null){
                 var figures = this.canvas.getFigures();
                 var lines = this.canvas.getLines();
                 if(figures.remove(this)!==null){
                     figures.add(this);
                 }else if(lines.remove(this)!==null){
                     lines.add(this);
                 }
             }
         }
         else{
             this.getShapeElement().insertAfter(figure.getTopLevelShapeElement());
             if(this.canvas!==null){
                 var figures = this.canvas.getFigures();
                 var lines = this.canvas.getLines();
                 if(figures.remove(this)!==null){
                     var index = figures.indexOf(figure);
                     figures.insertElementAt(this, index+1);
                 }else if(lines.remove(this)!==null){
                     lines.add(this);
                 }
             }
         }
         var _this = this;
         this.children.each(function(i,child){
             child.figure.toFront(_this);
         });
         this.selectionHandles.each(function(i,handle){
             handle.toFront();
         });
         return this;
     },
     toBack: function(figure )
     {
         if(this.composite instanceof draw2d.shape.composite.StrongComposite){
             this.toFront(this.composite);
             return;
         }
         if(this.canvas!==null){
             var figures = this.canvas.getFigures();
             var lines = this.canvas.getLines();
             if(figures.remove(this)!==null){
                 figures.insertElementAt(this,0);
             }else if(lines.remove(this)!==null){
                 lines.insertElementAt(this,0);
             }
             if(typeof figure !=="undefined"){
                 this.getShapeElement().insertBefore(figure.getShapeElement());
             }
             else{
                 this.getShapeElement().toBack();
             }
         }
         var _this = this;
         this.children.each(function(i,child){
             child.figure.toFront(_this);
         }, true);
         return this;
     },
     installEditPolicy: function(policy)
     {
         if(policy instanceof draw2d.policy.figure.SelectionFeedbackPolicy){
             var _this = this;
             this.editPolicy.grep(function(p){
                 var stay = !(p instanceof draw2d.policy.figure.SelectionFeedbackPolicy); 
                 if(!stay){
                     p.onUninstall(_this);
                 }
                 return stay;
             });
         }
         policy.onInstall(this);
         this.editPolicy.add(policy);
         return this;
     },
     uninstallEditPolicy: function(policy)
     {
         var removedPolicy = this.editPolicy.remove(policy);
         if(removedPolicy !==null){
             removedPolicy.onUninstall(this);
             return; 
         }
         var _this = this;
         var name = (typeof policy === "string")?policy:policy.NAME;
         this.editPolicy.grep(function(p){
             if(p.NAME === name){
                 p.onUninstall(_this);
                 return false;
             }
             return true;
         });
     },
     add: function(child, locator, index)
     {
         if(typeof locator ==="undefined" || locator ===null){
             throw "Second parameter 'locator' is required for method 'Figure#add'";
         }
         child.setParent(this);
         locator.bind(this, child);
         child.on("resize", this.relocateChildrenEventCallback);
         if($.isNumeric(index)){
             this.children.insertElementAt({figure:child, locator:locator}, index);
         }
         else{
             this.children.add({figure:child, locator:locator});
         }
         if(this.canvas!==null){
             child.setCanvas(this.canvas);
         }
         this.repaint();
         return this;
     },
     remove: function(child)
     {
         if(typeof child ==="undefined" || child ===null){
             debug.warn("The parameter child is required for Figure.remove");
             return null;
         }
         var removed = null;
         this.children.grep(function(e){
             var stay = e.figure!==child;
             if(!stay){
                 removed=e;
             }
             return stay;
         });
         if(removed!==null){
             child.setParent(null);
             child.setCanvas(null);
             removed.locator.unbind(this, child);
             child.off(this.relocateChildrenEventCallback);
             this.repaint();
             return removed;
         }
         return null;
     },
     getChildren: function()
     {
         return this.children.clone().map(function(e){return e.figure;});
     },
     resetChildren: function()
     {
         this.children.each(function(i,e){
             e.figure.setCanvas(null);
         });
         this.children= new draw2d.util.ArrayList();
         this.repaint();
         return this;
     },
    getShapeElement: function()
    {
       if(this.shape!==null){
         return this.shape;
       }
      this.shape=this.createShapeElement();
      if(!this.isVisible()){
          this.shape.hide();
      }
      if(this.cssClass!==null){
          this.shape.node.setAttribute("class",this.cssClass);
      }
      return this.shape;
    },
    getTopLevelShapeElement: function()
    {
        return this.getShapeElement();
    },
    createShapeElement: function()
    {
        throw "Inherited class ["+this.NAME+"] must override the abstract method createShapeElement";
    },
     repaint: function(attributes)
     {
         if (this.repaintBlocked===true || this.shape === null){
             return this;
         }
         attributes = attributes || {};
         if(this.visible===true){
             if(this.shape.isVisible()===false){
                 if($.isNumeric(attributes.visibleDuration)){
                     var _this = this;
                     $(this.shape.node).fadeIn(attributes.visibleDuration, function(){
                         _this.shape.show();
                     });
                 }
                 else {
                     this.shape.show();
                 }
             }
         }
         else{
             if(this.shape.isVisible()===true){
                 if($.isNumeric(attributes.visibleDuration)){
                     var _this = this;
                     $(this.shape.node).fadeOut(attributes.visibleDuration, function(){
                         _this.shape.hide();
                     });
                 }
                 else {
                     this.shape.hide();
                 }
             }
        	 return this;
         }
         attributes.opacity = this.alpha;
         attributes = draw2d.util.JSON.flatDiff(attributes, this.lastAppliedAttributes);
         this.lastAppliedAttributes= attributes;
         if(!$.isEmptyObject(attributes)) {
             this.shape.attr(attributes);
         }
         this.applyTransformation();
         this.children.each(function(i,e){
            e.locator.relocate(i, e.figure);
         });
         return this;
     },
     applyTransformation: function()
     {
         return this;
     },
     setGlow: function(flag)
     {
         return this;
     },
     getHandleBBox: function()
     {
        return null;
     },
    onDragStart: function(x, y, shiftKey, ctrlKey )
    {
      this.isInDragDrop =false;
      var bbox = this.getHandleBBox();
      if(bbox!==null && bbox.translate(this.getAbsolutePosition().scale(-1)).hitTest(x,y)===false){
          this.panningDelegate = this.getBestChild(this.getX()+x,this.getY()+y);
          if(this.panningDelegate!==null){
              this.panningDelegate.onDragStart(x-this.panningDelegate.x, y-this.panningDelegate.y, shiftKey, ctrlKey);
          }
          return false;
      }
      this.command = this.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE));
      if(this.command!==null){
         this.ox = this.getX();
         this.oy = this.getY();
         this.isInDragDrop =true;
         var _this = this;
         var canStartDrag = true;
         this.editPolicy.each(function(i,e){
             if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                 canStartDrag = canStartDrag && e.onDragStart(_this.canvas, _this, x,y,shiftKey,ctrlKey);
             }
         });
          if(canStartDrag) {
              this.fireEvent("dragstart", {x: x, y: y, shiftKey: shiftKey, ctrlKey: ctrlKey});
          }
          return canStartDrag;
      }
      return false;
    },
    onDrag: function( dx,  dy, dx2, dy2, shiftKey, ctrlKey)
    {
      var _this = this;
      this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                var newPos = e.adjustPosition(_this,_this.ox+dx,_this.oy+dy);
                if(newPos) {
                    dx = newPos.x - _this.ox;
                    dy = newPos.y - _this.oy;
                }
            }
      });
      var newPos = new draw2d.geo.Point(this.ox+dx, this.oy+dy);
      if(this.getCanSnapToHelper()){
        newPos = this.getCanvas().snapToHelper(this, newPos);
      }
      this.setPosition(newPos);
      this.editPolicy.each(function(i,e){
          if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
              e.onDrag(_this.canvas, _this);
          }
      });
      this.fireEvent("drag",{dx:dx, dy:dy, dx2:dx2, dy2:dy2, shiftKey:shiftKey, ctrlKey:ctrlKey});
    },
    onPanning: function(dx, dy, dx2, dy2, shiftKey, ctrlKey)
    {
    },
    onPanningEnd: function()
    {
    },
    onDragEnd: function( x, y, shiftKey, ctrlKey)
    {
      var _this = this;
      if (this.command !== null) {
          this.command.setPosition(this.x, this.y);
          this.canvas.getCommandStack().execute(this.command);
          this.command = null;
      }
      this.isInDragDrop = false;
      this.panningDelegate=null;
      this.editPolicy.each(function(i,e){
          if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
              e.onDragEnd(_this.canvas, _this, x, y, shiftKey, ctrlKey);
          }
      });
      this.fireEvent("move",    {figure:this, dx:0, dy:0});
      this.fireEvent("change:x",{figure:this, dx:0});
      this.fireEvent("change:y",{figure:this, dy:0});
      this.fireEvent("dragend",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
    },
    delegateTarget: function( draggedFigure )
    {
        var _this = this;
        var delegate = draggedFigure;
        this.getCanvas().getDropInterceptorPolicies().each(function(i, policy){
            delegate = policy.delegateTarget(draggedFigure, _this);
            if(delegate!==null){
                return false; 
            }
        });
        return delegate;
    },
    onDragEnter: function( draggedFigure )
    {
    },
    onDragLeave: function( draggedFigure )
    {
    },
    onDrop: function(dropTarget, x, y, shiftKey, ctrlKey)
    {
    },
    onCatch: function(droppedFigure, x, y, shiftKey, ctrlKey)
    {
    },
    onMouseEnter: function()
    {
    },
    onMouseLeave: function()
    {
    },
    onDoubleClick: function()
    {
    },
    onClick: function()
    {
    },
    onContextMenu: function(x,y)
    {
    },
    setAlpha: function( percent)
    {
      percent = Math.min(1,Math.max(0,parseFloat(percent)));
      if(percent===this.alpha){
         return;
      }
      this.alpha =percent;
      this.repaint();
      this.fireEvent("change:opacity",{value:this.alpha});
      return this;
    },
    getAlpha: function()
    {
        return this.alpha;
    },
    setRotationAngle: function(angle)
    {
        var _this = this;
        this.rotationAngle = angle;
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                e.moved(_this.canvas, _this);
            }
        });
        this.fireEvent("change:angle",{value:this.rotationAngle});
        this.repaint();
        return this;
    },
    getRotationAngle: function()
    {
        return this.rotationAngle;
    },
    setVisible: function(flag, duration)
    {
        flag=!!flag;
        if(flag===this.visible){
            return;
        }
    	this.visible = flag;
    	this.repaint({visibleDuration:duration});
        if (this.visible) {
            this.fireEvent("show");
        } else {
            this.fireEvent("hide");
        }
        this.fireEvent("change:visibility",{value:this.visible});
    	return this;
    },
    isVisible: function()
    {
        return this.visible && this.shape!==null;
    },
    setKeepAspectRatio: function( flag)
    {
        this.keepAspectRatio = flag;
        return this;
    },
    getKeepAspectRatio: function()
    {
        return this.keepAspectRatio;
    },
    getZOrder: function()
    {
        if(this.shape===null){
            return -1;
        }
        var i = 0;
        var child = this.shape.node;
        while( (child = child.previousSibling) !== null ) {
          i++;
        }
        return i;
    },
    setCanSnapToHelper: function(flag)
    {
      this.canSnapToHelper = !!flag;
      return this;
    },
    getCanSnapToHelper: function()
    {
      return this.canSnapToHelper;
    },
    getSnapToGridAnchor: function()
    {
      return this.snapToGridAnchor;
    },
    setSnapToGridAnchor: function(point)
    {
      this.snapToGridAnchor = point;
      return this;
    },
    setWidth: function( width)
    {
        this.setDimension(parseFloat(width), this.getHeight());
        this.fireEvent("change:width",{value:this.width});
        return this;
    },
    getWidth: function()
    {
      return this.width;
    },
    setHeight: function( height)
    {
        this.setDimension(this.getWidth(), parseFloat(height));
        this.fireEvent("change:height",{value:this.height});
        return this;
    },
    getHeight: function()
    {
      return this.height;
    },
    getMinWidth: function()
    {
      return this.minWidth;
    },
    setMinWidth: function(w)
    {
      this.minWidth = parseFloat(w);
      this.fireEvent("change:minWidth",{value:this.minWidth});
      this.setWidth(this.getWidth());
      return this;
    },
    getMinHeight: function()
    {
      return this.minHeight;
    },
    setMinHeight: function(h)
    {
        this.minHeight =parseFloat(h);
        this.fireEvent("change:minHeight",{value:this.minHeight});
        this.setHeight(this.getHeight());
        return this;
    },
    setX: function(x)
    {
        this.setPosition(parseFloat(x), this.y);
        this.fireEvent("change:x",{value:this.x});
        return this;
    },
    getX: function()
    {
        return this.x;
    },
    setY: function(y)
    {
        this.setPosition(this.x, parseFloat(y));
        this.fireEvent("change:y",{value:this.y});
        return this;
    },
    getY: function()
    {
        return this.y;
    },
    getAbsoluteX: function()
    {
        if(!this.parent){
            return this.getX();
        }
        return this.getX() + this.parent.getAbsoluteX();  
    },
    getAbsoluteY: function()
    {
        if(!this.parent){
            return this.getY();
        }
        return this.getY() + this.parent.getAbsoluteY();  
    },
    getAbsolutePosition: function()
    {
      return new draw2d.geo.Point(this.getAbsoluteX(), this.getAbsoluteY());
    },
    getAbsoluteBounds: function()
    {
      return new draw2d.geo.Rectangle(this.getAbsoluteX(), this.getAbsoluteY(),this.getWidth(),this.getHeight());
    },
    setPosition: function(x, y)
    {
        if(typeof x==="undefined"){
            debugger;
        }
        var oldPos = {x:this.x, y:this.y};
        if (x instanceof draw2d.geo.Point) {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x;
            this.y = y;
        }
        var _this = this;
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                var newPos = e.adjustPosition(_this,_this.x,_this.y);
                _this.x = newPos.x;
                _this.y = newPos.y;
            }
        });
        this.repaint();
        {
            this.editPolicy.each(function (i, e) {
                if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                    e.moved(_this.canvas, _this);
                }
            });
            var dx = this.x-oldPos.x;
            var dy = this.y-oldPos.y;
            this.fireEvent("move",     {figure:this,dx: dx, dy:dy});
            this.fireEvent("change:x", {figure:this,dx: dx});
            this.fireEvent("change:y", {figure:this,dy: dy});
        }
        return this;
    },
    getPosition: function()
    {
        return new draw2d.geo.Point(this.getX(), this.getY());
    },
    translate: function(dx , dy )
    {
    	this.setPosition(this.getX()+dx,this.getY()+dy);
    	return this;
    },
    setDimension: function(w, h)
    {
        var old = {width:this.width, height:this.height};
        var _this = this;
        w = Math.max(this.getMinWidth(),w);
        h = Math.max(this.getMinHeight(),h);
        if(this.width === w && this.height ===h){
            this.editPolicy.each(function(i,e){
                if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                    e.moved(_this.canvas, _this);
                }
             });
            return this;
        }
        this.editPolicy.each(function(i,e){
              if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                  var newDim = e.adjustDimension(_this,w,h);
                  w = newDim.w;
                  h = newDim.h;
              }
        });
        if(this.keepAspectRatio===true){
            if (w >= this.getMinWidth()) {
                h = this.getHeight() * (w/this.getWidth());
                if(h>=this.getMinHeight()){
                    this.width = w;
                    this.height= h;
                }
            } 
        }
        else{
            this.width = Math.max(this.getMinWidth(),w);
            this.height= Math.max(this.getMinHeight(),h);
        }
        {
            this.repaint();
            this.fireEvent("resize");
            this.fireEvent("change:dimension",{value:{height:this.height, width:this.width, old:old}});
            this.editPolicy.each(function (i, e) {
                if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                    e.moved(_this.canvas, _this);
                }
            });
        }
		return this;
    },
    setBoundingBox: function(rect)
    {
    	rect = new draw2d.geo.Rectangle(rect);
        var orig = this.repaintBlocked;
        this.repaintBlocked=true;
        this.setPosition(rect.x, rect.y);
        this.repaintBlocked=orig;
        this.setDimension(rect.w,rect.h);
        return this;
    },
    getBoundingBox: function()
    {
        return new draw2d.geo.Rectangle(this.getAbsoluteX(),this.getAbsoluteY(),this.getWidth(),this.getHeight());
    },
    hitTest: function ( iX , iY, corona)
    {
        if(typeof corona === "number"){
            return this.getBoundingBox().scale(corona,corona).hitTest(iX,iY);
        }
        return this.getBoundingBox().hitTest(iX,iY);
    },
    setDraggable: function(flag)
    {
      this.draggable= !!flag;
      return this;
    },
    isDraggable: function()
    {
        if(this.composite!==null){
            return this.composite.isMemberDraggable(this, this.draggable);
        }
        return this.draggable;
    },
    isResizeable: function()
    {
      return this.resizeable;
    },
    setResizeable: function(flag)
    {
      this.resizeable=!!flag;
      this.fireEvent("change:resizeable",{value:this.resizeable});
      return this;
    },
    isSelectable: function()
    {
        if(this.composite!==null){
            return this.composite.isMemberSelectable(this, this.selectable);
        }
        return this.selectable;
    },
    setSelectable: function(flag)
    {
      this.selectable=!!flag;
      this.fireEvent("change:selectable",{value:this.selectable});
      return this;
    },
    isStrechable: function()
    {
      return !this.getKeepAspectRatio();
    },
    isDeleteable: function()
    {
      return this.deleteable;
    },
    setDeleteable: function(flag)
    {
      this.deleteable = !!flag;
      this.fireEvent("change:deleteable",{value:this.deleteable});
      return this;
    },
    setParent: function( parent)
    {
      this.parent = parent;
      if(parent!==null) {
          this.setSelectionAdapter(parent.getSelectionAdapter());
      }
      else{
          this.setSelectionAdapter(null);
      }
      return this;
    },
    getParent: function()
    {
      return this.parent;
    },
    contains: function(containedFigure)
    {
        if(containedFigure.getParent()===this){
            return true;
        }
        for(var i= 0,len=this.children.getSize(); i<len;i++){
            var child = this.children.get(i).figure;
            if(child.contains(containedFigure)) {
                return true;
            }
        }
        return false;
    },
    getRoot: function()
    {
        var root = this.parent;
        while(root!==null && root.parent!==null){
            root = root.parent;
        }
        return root;
    },
    setComposite: function( composite)
    {
        if(composite!==null && !(composite instanceof draw2d.shape.composite.StrongComposite)){
            throw "'composite must inherit from 'draw2d.shape.composite.StrongComposite'";
        }
        this.composite = composite;
        return this;
    },
    getComposite: function()
    {
      return this.composite;
    },
    fireEvent: function(event, args) 
    {
        try{
            if (typeof this.eventSubscriptions[event] === 'undefined') {
                return;
            }
            if(this._inEvent===true){
                return;
            }
            this._inEvent=true;
            var subscribers = this.eventSubscriptions[event];
            for (var i=0; i<subscribers.length; i++) {
                subscribers[i](this, args);
            }
        }
        finally{
            this._inEvent=false;
            if(event.substring(0,7)==="change:"){
                this.fireEvent("change",event.substring(7));
            }
       }
    },
    on: function(event, callback, context) {
        var events = event.split(" ");
        if(typeof callback ==="undefined"){
            debugger;
        }
        if(context){
            callback = $.proxy(callback,context);
            callback.___originalCallback = callback;
        }
        for(var i=0; i<events.length; i++){
            if (typeof this.eventSubscriptions[events[i]] === 'undefined') {
                this.eventSubscriptions[events[i]] = [];
            }
            if(-1 !== $.inArray(callback, this.eventSubscriptions[events[i]])){
            }
            else {
                this.eventSubscriptions[events[i]].push(callback);
            }
        }
        return this;
    },
    off: function( eventOrFunction)
    {
        if(typeof eventOrFunction ==="undefined"){
            this.eventSubscriptions = {};
        }
        else if( typeof eventOrFunction === 'string'){
            this.eventSubscriptions[eventOrFunction] = [];
        }
        else{
            for(var event in this.eventSubscriptions ){
                this.eventSubscriptions[event] =$.grep(this.eventSubscriptions[event], function( callback ) { 
                    if(typeof callback.___originalCallback !=="undefined"){
                        return callback.___originalCallback !== eventOrFunction;
                    }
                    return callback !== eventOrFunction; 
                });
            }
        }
        return this;
    },
    getBestChild: function(x, y, figureToIgnore)
    {
        if(!$.isArray(figureToIgnore)){
            if(figureToIgnore instanceof draw2d.Figure){
                figureToIgnore = [figureToIgnore];
            }
            else{
                figureToIgnore=[];
            }
        }
        var result = null;
        var checkRecursive = function(children){
            children.each(function(i,e){
                var c=e.figure;
                checkRecursive(c.children);
                if(result===null && c.isVisible()===true && c.hitTest(x,y)===true && $.inArray(c, figureToIgnore)===-1){
                    result = c;
                }
                return result===null; 
            });
        };
        checkRecursive( this.children);
        return result;
    },
    createCommand: function( request)
    {
      if(request===null){
          return null;
      }
      if(request.getPolicy() === draw2d.command.CommandType.MOVE)
      {
        if(!this.isDraggable()){
          return null;
        }
        return new draw2d.command.CommandMove(this);
      }
      if(request.getPolicy() === draw2d.command.CommandType.DELETE)
      {
        if(!this.isDeleteable()){
           return null;
        }
        return new draw2d.command.CommandDelete(this);
      }
      if(request.getPolicy() === draw2d.command.CommandType.RESIZE)
      {
        if(!this.isResizeable()){
           return null;
        }
        return new draw2d.command.CommandResize(this);
      }
      return null;
    },
    clone: function(cloneMetaData)
    {
        cloneMetaData = $.extend({exludeChildren:false},cloneMetaData);
        var clone = eval("new "+this.NAME+"();");
        var initialId = clone.id;
        clone.setPersistentAttributes( this.getPersistentAttributes());
        clone.id = initialId;
        if(cloneMetaData.exludeChildren===false) {
            clone.resetChildren();
            this.children.each(function (i, entry) {
                var child = entry.figure.clone();
                var locator = entry.locator.NAME ? eval("new " + entry.locator.NAME + "();") : null;
                clone.add(child, locator);
            });
        }
        return clone;
    },
    getPersistentAttributes: function()
    {
        var memento= {
            type  : this.NAME,
            id    : this.id,
            x     : this.getX(),
            y     : this.getY(),
            width : this.width,
            height: this.height,
            alpha : this.alpha,
            angle : this.rotationAngle,
           userData: $.extend(true,{},this.userData)
        };
        if(this.cssClass!==null){
            memento.cssClass= this.cssClass;
        }
        if(this.composite!==null){
            memento.composite = this.composite.getId();
        }
        return memento;
    },
    setPersistentAttributes: function(memento)
    {
        this.id    = memento.id;
        this.setPosition( parseFloat(memento.x), parseFloat(memento.y));
        if(typeof memento.width !== "undefined"){
            this.width = parseFloat(memento.width);
        }
        if(typeof memento.height !== "undefined"){
            this.height= parseFloat(memento.height);
        }
        if(typeof memento.userData !== "undefined"){
            this.userData= memento.userData;
        }
        if(typeof memento.cssClass !== "undefined"){
            this.setCssClass(memento.cssClass);
        }
        if(typeof memento.alpha !== "undefined"){
            this.setAlpha(parseFloat(memento.alpha));
        }
        if(typeof memento.angle !== "undefined"){
            this.rotationAngle = parseFloat(memento.angle);
        }
        return this;
    }
});
draw2d.shape.node.Node = draw2d.Figure.extend({
	NAME : "draw2d.shape.node.Node",
    init: function( attr ,setter , getter) 
    {
      this.inputPorts = new draw2d.util.ArrayList();
      this.outputPorts= new draw2d.util.ArrayList();
      this.hybridPorts= new draw2d.util.ArrayList();
      this.persistPorts = true;
      this.portRelayoutRequired = true;
      this.cachedPorts = null;
      this._super(
              $.extend({width:50, height:50}, attr),
              $.extend({
                  persistPorts : this.setPersistPorts
              }, setter),
              $.extend({
                  persistPorts : this.getPersistPorts
              }, getter));
    },
    setPersistPorts: function(flag)
    {
        this.persistPorts = flag;
        this.fireEvent("change:persistPorts",{value:this.persistPorts});
        return this;
    },
    getPersistPorts: function()
    {
        return this.persistPorts;
    },
    toFront: function(figure)
    {
        this._super(figure);
        var _this = this;
        this.getPorts().each(function(i,port){
            port.getConnections().each(function(i,connection){
                connection.toFront(figure);
            });
            port.toFront(_this);
        });
        return this;
    },
    toBack: function(figure)
    {
        this.getPorts().each(function(i,port){
            port.getConnections().each(function(i,connection){
                connection.toBack(figure);
            });
            port.toBack(figure);
        });
        this._super(figure);
        return this;
    },
    setVisible: function(flag, duration)
    {
    	if(!flag){
    		this.getPorts().each(function(i,port){
    			port.__initialVisibilityState=port.isVisible();
    			port.setVisible(false, duration);
    		});
    	}
    	else{
    		this.getPorts().each(function(i,port){
    			if(typeof port.__initialVisibilityState !=="undefined"){
    				port.setVisible(port.__initialVisibilityState, duration);
    			}
    			else{
    				port.setVisible(true, duration);
    			}
    			delete port.__initialVisibilityState;
    		});
    	}
    	this._super(flag, duration);
    },
    getPorts: function(recursive)
    {
      if(typeof recursive === "boolean" && recursive===false){
          var ports = new draw2d.util.ArrayList();
          ports.addAll(this.inputPorts);
          ports.addAll(this.outputPorts);
          ports.addAll(this.hybridPorts);
          return ports;
      }
      if(this.cachedPorts===null ){
          this.cachedPorts = new draw2d.util.ArrayList();
          this.cachedPorts.addAll(this.inputPorts);
          this.cachedPorts.addAll(this.outputPorts);
          this.cachedPorts.addAll(this.hybridPorts);
          var _this = this;
          this.children.each(function(i,e){
              _this.cachedPorts.addAll( e.figure.getPorts());
          });
      }
      return this.cachedPorts;
    },
    getInputPorts: function()
    {
      return this.inputPorts
               .clone()
               .addAll(this.hybridPorts);
    },
    getOutputPorts: function()
    {
      return this.outputPorts
          .clone()
          .addAll(this.hybridPorts);
    },
    clone: function(cloneMetaData)
    {
        cloneMetaData = $.extend({excludePorts:false},cloneMetaData);
        var clone = this._super(cloneMetaData);
        if(cloneMetaData.excludePorts ===false) {
            clone.resetPorts();
            var ports = this.getPorts(false);
            ports.each(function (i, port) {
                var clonePort = port.clone();
                var locator = port.getLocator().clone();
                clone.addPort(clonePort, locator);
            });
        }
        return clone;
    },
    getPort: function( portName)
    {
    	var port = null;
        this.getPorts().each(function(i,e){
            if (e.getName() === portName) {
                port = e;
         		return false;
            }
        });
        return port;
    },
    getInputPort: function( portNameOrIndex)
    {
        if(typeof portNameOrIndex === "number"){
            return this.inputPorts.get(portNameOrIndex);
        }
        for ( var i = 0; i < this.inputPorts.getSize(); i++) {
            var port = this.inputPorts.get(i);
            if (port.getName() === portNameOrIndex) {
                return port;
            }
        }
        return null;
    },
    getOutputPort: function( portNameOrIndex)
    {
        if(typeof portNameOrIndex === "number"){
            return this.outputPorts.get(portNameOrIndex);
        }
         for ( var i = 0; i < this.outputPorts.getSize(); i++) {
            var port = this.outputPorts.get(i);
            if (port.getName() === portNameOrIndex) {
                return port;
            }
        }
        return null;
    },
    getHybridPort: function( portNameOrIndex)
    {
        if(typeof portNameOrIndex === "number"){
            return this.hybridPorts.get(portNameOrIndex);
        }
        for ( var i = 0; i < this.hybridPorts.getSize(); i++) {
            var port = this.hybridPorts.get(i);
            if (port.getName() === portNameOrIndex) {
                return port;
            }
        }
        return null;
    },
    addPort: function(port, locator)
    {
        if(!(port instanceof draw2d.Port)){
            throw "Argument is not typeof 'draw2d.Port'. \nFunction: draw2d.shape.node.Node#addPort";
        }
        if(this.cachedPorts !== null){
        	this.cachedPorts.add(port);
        };
        this.portRelayoutRequired=true;
        if (port instanceof draw2d.InputPort) {
            this.inputPorts.add(port);
        }
        else if(port instanceof draw2d.OutputPort){
            this.outputPorts.add(port);
        }
        else if(port instanceof draw2d.HybridPort){
            this.hybridPorts.add(port);
        }
        if((typeof locator !== "undefined") && (locator instanceof draw2d.layout.locator.Locator)){
            port.setLocator(locator);
        }
        port.setParent(this);
        port.setCanvas(this.canvas);
        port.setDeleteable(false);
        if (this.canvas !== null) {
            port.getShapeElement();
            this.canvas.registerPort(port);
        }
    },
    resetPorts: function()
    {
        var _this = this;
        this.getPorts().each(function(i,port){
            _this.removePort(port);
        });
        return this;
    },
    removePort: function(port)
    {
        this.portRelayoutRequired=true;
        this.cachedPorts = null;
        this.inputPorts.remove(port);
        this.outputPorts.remove(port);
        this.hybridPorts.remove(port);
        if (port.getCanvas() !== null) {
            port.getCanvas().unregisterPort(port);
            var connections = port.getConnections();
            for ( var i = 0; i < connections.getSize(); ++i) {
                port.getCanvas().remove(connections.get(i));
            }
        }
        port.setCanvas(null);
    },
    createPort: function(type, locator){
        var newPort = null;
        var count =0;
    	switch(type){
    	case "input":
    		newPort= draw2d.Configuration.factory.createInputPort(this);
    		count = this.inputPorts.getSize();
    		break;
    	case "output":
    		newPort= draw2d.Configuration.factory.createOutputPort(this);
            count = this.outputPorts.getSize();
    		break;
        case "hybrid":
            newPort= draw2d.Configuration.factory.createHybridPort(this);
            count = this.hybridPorts.getSize();
            break;
    	default:
            throw "Unknown type ["+type+"] of port requested";
    	}
   	    newPort.setName(type+count);
    	this.addPort(newPort, locator);
    	this.setDimension(this.width,this.height);
    	return newPort;
    },
    getConnections: function()
    {
        var connections = new draw2d.util.ArrayList();
        var ports = this.getPorts();
        for(var i=0; i<ports.getSize(); i++)
        {
          var port = ports.get(i);
          for (var c = 0, c_size = port.getConnections().getSize() ; c< c_size ; c++)
          {
              if(!connections.contains(port.getConnections().get(c)))
              {
                connections.add(port.getConnections().get(c));
              }
          }
        }
        return connections;
    },
    setCanvas: function(canvas)
    {
        var oldCanvas = this.canvas;
        this._super(canvas);
        var ports = this.getPorts();
        if (oldCanvas !== null) {
            ports.each(function(i,port){
                oldCanvas.unregisterPort(port);
            });
        }
        if (canvas !== null) {
            ports.each(function(i,port){
                port.setCanvas(canvas);
                canvas.registerPort(port);
            });
            this.setDimension(this.width,this.height);
        }
        else {
            ports.each(function(i,port){
                port.setCanvas(null);
            });
        }
    },
    setRotationAngle: function(angle)
    {
        this.portRelayoutRequired=true;
        this._super(angle);
        this.layoutPorts();
    },
    setDimension: function(w,h)
    {
        this.portRelayoutRequired=true;
        this._super(w,h);
    },
    onPortValueChanged: function(relatedPort)
    {
    },
     repaint: function(attributes)
     {
         if (this.repaintBlocked===true || this.shape === null){
             return;
         }
         this._super(attributes);
         this.layoutPorts();
     },
     layoutPorts: function()
    {
         if(this.portRelayoutRequired===false){
             return;
         }
         this.portRelayoutRequired=false;
         this.outputPorts.each(function(i, port){
             port.locator.relocate(i,port);
         });
         this.inputPorts.each(function(i, port){
             port.locator.relocate(i,port);
         });
         this.hybridPorts.each(function(i, port){
             port.locator.relocate(i,port);
         });
     },
    createCommand: function( request)
    {
        if(request===null){
            return null;
        }
        if(request.getPolicy() === draw2d.command.CommandType.ROTATE){
            return new draw2d.command.CommandRotate(this, (this.getRotationAngle()+90)%360);
        }
        return this._super(request);
    },
     getPersistentAttributes: function()
     {
         var memento = this._super();
         if(this.persistPorts===true){
             memento.ports = [];
             this.getPorts().each(function(i,port){
                 memento.ports.push($.extend(port.getPersistentAttributes(),{
                     name   : port.getName(),
                     port   : port.NAME,
                     locator: port.getLocator().NAME
                 }));
             });
         }
         return memento;
     },
     setPersistentAttributes: function(memento)
     {
         this._super(memento);
         if(typeof memento.ports !=="undefined"){
             this.persistPorts = true;
             this.resetPorts();
             $.each(memento.ports, $.proxy(function(i,e){
                 var port    =  eval("new "+e.port+"()");
                 var locator =  eval("new "+e.locator+"()");
                 port.setPersistentAttributes(e);
                 this.addPort(port, locator);
                 port.setName(e.name);
             },this));
         }
     }
});
draw2d.VectorFigure = draw2d.shape.node.Node.extend({
    NAME : "draw2d.VectorFigure",
    init: function( attr, setter, getter)
    {
        this.stroke = 1;
        this.radius = 0;
        this.bgColor= new draw2d.util.Color("#ffffff");
        this.color  = new draw2d.util.Color("#303030");
        this.dasharray = null;
        this.strokeBeforeGlow = this.stroke;
        this.glowIsActive = false;
        this._super( attr, 
            $.extend({
                dasharray : this.setDashArray,
                radius : this.setRadius,
                bgColor: this.setBackgroundColor,
                color  : this.setColor,
                stroke : this.setStroke
            }, setter),
            $.extend({
               dasharray: this.getDashArray,
               radius :   this.getRadius,
               bgColor:   this.getBackgroundColor,
               color  :   this.getColor,
               stroke :   this.getStroke
            }, getter)
        );
    },
     setRadius: function(radius)
     {
        this.radius = radius;
        this.repaint();
        this.fireEvent("change:radius",{value:this.radius});
        return this;
    },
    getRadius: function()
    {
        return this.radius;
    },
    setDashArray: function(dashPattern)
    {
        this.dasharray = dashPattern;
        this.repaint();
        this.fireEvent("change:dashArray",{value:this.dasharray});
        return this;
    },
    getDashArray: function()
    {
        return this.dasharray;
    },
    setGlow: function(flag)
    {
        if(flag === this.glowIsActive) {
            return this;
        }
        this.glowIsActive = flag;
        if(flag===true){
            this.strokeBeforeGlow = this.getStroke();
            this.setStroke(this.strokeBeforeGlow*2.5);
        }
        else {
            this.setStroke(this.strokeBeforeGlow);
        }
        return this;
    },
    repaint: function(attributes)
    {
        if (this.repaintBlocked===true || this.shape === null){
            return;
        }
        attributes= attributes || {};
        attributes.x = this.getAbsoluteX();
        attributes.y = this.getAbsoluteY();
        if(typeof attributes.stroke==="undefined"){
            if(this.color === null || this.stroke ===0){
                attributes.stroke = "none";
            }
            else {
                attributes.stroke = this.color.hash();
            }
        }
        draw2d.util.JSON.ensureDefault(attributes,"stroke-width" , this.stroke);
        draw2d.util.JSON.ensureDefault(attributes,"fill" ,this.bgColor.hash());
        draw2d.util.JSON.ensureDefault(attributes,"dasharray" , this.dasharray);
        this._super(attributes);
        return this;
    },
    setBackgroundColor: function(color)
    {
        this.bgColor = new draw2d.util.Color(color);
        this.repaint();
        this.fireEvent("change:bgColor",{value:this.bgColor});
        return this;
    },
   getBackgroundColor: function()
   {
     return this.bgColor;
   },
   setStroke: function( w )
   {
     this.stroke=w;
     this.repaint();
     this.fireEvent("change:stroke",{value:this.stroke});
     return this;
   },
   getStroke: function( )
   {
     return this.stroke;
   },
   setColor: function( color)
   {
     this.color = new draw2d.util.Color(color);
     this.repaint();
     this.fireEvent("change:color",{value:this.color});
     return this;
   },
   getColor: function()
   {
     return this.color;
   },
   getPersistentAttributes: function()
   {
       var memento = $.extend(this._super(), {
           bgColor : this.bgColor.hash(),
           color   : this.color.hash(),
           stroke  : this.stroke,
           radius  : this.radius,
           dasharray : this.dasharray
       });
       return memento;
   },
   setPersistentAttributes: function(memento)
   {
       this._super(memento);
       if(typeof memento.radius !=="undefined"){
           this.setRadius(memento.radius);
        }
       if(typeof memento.bgColor !== "undefined"){
           this.setBackgroundColor(memento.bgColor);
       }
       if(typeof memento.color !== "undefined"){
           this.setColor(memento.color);
       }
       if(typeof memento.stroke !== "undefined" ){
           this.setStroke(memento.stroke===null?0:parseFloat(memento.stroke));
       }
       if(typeof memento.dasharray ==="string"){
           this.dasharray = memento.dasharray;
       }
       return this;
   }  
});
draw2d.shape.basic.Rectangle = draw2d.VectorFigure.extend({
    NAME : "draw2d.shape.basic.Rectangle",
    init: function( attr, setter, getter) {
       this.dasharray = null;
       this._super(
           $.extend({bgColor:"#a0a0a0", color:"#1B1B1B"},attr),
           $.extend({},{
               dash  : this.setDashArray,
               dasharray  : this.setDashArray
           }, setter),
           $.extend({},{
               dash  : this.getDashArray,
               dasharray  : this.getDashArray
           }, getter)
       );
       this.lastAppliedTransformation = "";
     },
    repaint: function(attributes)
    {
        if(this.repaintBlocked===true || this.shape===null){
            return;
        }
        attributes =$.extend({},{
            width : this.getWidth(),
            height: this.getHeight(),
            r     : this.getRadius()
        },attributes);
        if(this.dasharray!==null){
            attributes["stroke-dasharray"]=this.dasharray;
        }
        this._super(attributes);
        return this;
    },
    applyTransformation: function()
    {
        var ts= "R"+this.rotationAngle;
        if(this.getRotationAngle()=== 90|| this.getRotationAngle()===270){
            var ratio = this.getHeight()/this.getWidth();
            ts = ts+"S"+ratio+","+1/ratio+","+(this.getAbsoluteX() +this.getWidth()/2)+","+(this.getAbsoluteY() +this.getHeight()/2);
        }
            this.shape.transform(ts);
            this.lastAppliedTransformation = ts;
        return this;
    },
    createShapeElement: function()
    {
       return this.canvas.paper.rect(this.getAbsoluteX(),this.getAbsoluteY(),this.getWidth(), this.getHeight());
    },
    setDashArray: function(pattern)
    {
        this.dasharray = pattern;
        this.repaint();
        this.fireEvent("change:dashArray",{value:this.dasharray});
        return this;
    },
    getDashArray: function(dashPattern)
    {
        return this.dasharray;
    },
    getPersistentAttributes: function()
    {
        var memento = this._super();
        if(this.dasharray!==null){
            memento.dasharray = this.dasharray;
        }
        return memento;
    },
    setPersistentAttributes: function(memento)
    {
        this._super(memento);
        if(typeof memento.dasharray ==="string"){
            this.dasharray = memento.dasharray;
        }
        return this;
    }
});
draw2d.SetFigure = draw2d.shape.basic.Rectangle.extend({
    NAME : "draw2d.SetFigure",
    init: function( attr ,setter, getter)
    {
      this.svgNodes=null;
      this.originalWidth = null;
      this.originalHeight= null;
      this.scaleX = 1;
      this.scaleY = 1;
      this.strokeScale = true; 
      this._super( $.extend({ stroke:0, bgColor:null},attr),setter, getter );
    },
    setCanvas: function( canvas )
    {
      if(canvas===null && this.svgNodes!==null){
         this.svgNodes.remove();
         this.svgNodes=null;
      }
      this._super(canvas);
     },
     setCssClass: function(cssClass)
     {
         this._super(cssClass);
         if(this.svgNodes===null){
             return this;
         }
         if(this.cssClass===null){
             this.svgNodes.forEach(function(e){
                 e.node.removeAttribute("class");
             });
         }
         else{
             this.svgNodes.forEach(function(e){
                 e.node.setAttribute("class", cssClass);
             });
         }
         return this;
     },
    repaint: function(attributes)
    {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (this.originalWidth !== null) {
        	this.scaleX = this.width / this.originalWidth;
        	this.scaleY = this.height / this.originalHeight;
        }
        attributes= attributes || {};
        this.applyAlpha();
        this._super(attributes);
    },
    setVisible: function(flag, duration)
    {
        this._super(flag, duration);
        if(this.svgNodes!==null){
            if(duration){
                if (this.visible === true) {
                    this.svgNodes.forEach(function(shape){
                        $(shape.node).fadeIn(duration, function(){
                            shape.show();
                        });
                    });
                }
                else {
                    this.svgNodes.forEach(function(shape){
                        $(shape.node).fadeOut(duration, function(){
                            shape.hide();
                        });
                    });
                }
            }
            else {
                if (this.visible === true) {
                    this.svgNodes.show();
                }
                else {
                    this.svgNodes.hide();
                }
            }
        }
    },
    applyAlpha: function()
    {
        this.svgNodes.attr({opacity: this.alpha});
    },
    applyTransformation: function()
    {
        var s = 
        	"S"+this.scaleX+","+this.scaleY+",0,0 "+
        	"R"+this.rotationAngle+","+((this.getWidth()/2)|0)+","+((this.getHeight()/2)|0)+
        	"T" + this.getAbsoluteX() + "," + this.getAbsoluteY()+
            "";
    	this.svgNodes.transform(s);
        if(this.rotationAngle===90 || this.rotationAngle===270){
            var before  = this.svgNodes.getBBox(true);
            var ratio = before.height/before.width;
            var reverseRatio = before.width/before.height;
            var rs = "...S"+ratio+","+reverseRatio+","+(this.getAbsoluteX() +this.getWidth()/2)+","+(this.getAbsoluteY() +this.getHeight()/2);
        	this.svgNodes.transform(rs);
        }
    },
    toFront: function(figure)
    {
        if(this.composite instanceof draw2d.shape.composite.StrongComposite && (typeof figure !=="undefined")){
            var indexFigure = figure.getZOrder();
            var indexComposite= this.composite.getZOrder();
            if(indexFigure<indexComposite){
                figure = this.composite;
            }
        }
        if(typeof figure ==="undefined"){
            this.getShapeElement().toFront();
            if(this.svgNodes!==null){
                this.svgNodes.toFront();
            }
            if(this.canvas!==null){
                var figures = this.canvas.getFigures();
                var lines = this.canvas.getLines();
                if(figures.remove(this)!==null){
                    figures.add(this);
                }else if(lines.remove(this)!==null){
                    lines.add(this);
                }
            }
        }
        else{
            if(this.svgNodes!==null){
                this.svgNodes.insertAfter(figure.getTopLevelShapeElement());
            }
            this.getShapeElement().insertAfter(figure.getTopLevelShapeElement());
            if(this.canvas!==null){
                var figures = this.canvas.getFigures();
                var lines = this.canvas.getLines();
                if(figures.remove(this)!==null){
                    var index = figures.indexOf(figure);
                    figures.insertElementAt(this, index+1);
                }else if(lines.remove(this)!==null){
                    lines.add(this);
                }
            }
        }
        this.children.each(function(i,child){
            child.figure.toFront(figure);
        });
        var _this = this;
        this.getPorts().each(function(i,port){
            port.getConnections().each(function(i,connection){
                connection.toFront(figure);
            });
            port.toFront(_this);
        });
        this.selectionHandles.each(function(i,handle){
            handle.toFront();
        });
        return this;
    },
    toBack: function(figure)
    {
        if(this.composite instanceof draw2d.shape.composite.StrongComposite){
            this.toFront(this.composite);
            return;
        }
        if(this.canvas!==null){
            var figures = this.canvas.getFigures();
            var lines = this.canvas.getLines();
            if(figures.remove(this)!==null){
                figures.insertElementAt(this,0);
            }
            else if(lines.remove(this)!==null){
                lines.insertElementAt(this,0);
            }
        }
        this.children.each(function(i,child){
            child.figure.toBack(figure);
        }, true);
        if(this.svgNodes!==null){
            if(typeof figure !=="undefined"){
                this.svgNodes.insertBefore(figure.getShapeElement());
            }
            else{
                this.svgNodes.toBack();
            }
        }
        if(this.canvas!==null) {
            if (typeof figure !== "undefined") {
                this.getShapeElement().insertBefore(figure.getShapeElement());
            }
            else {
                this.getShapeElement().toBack();
            }
        }
        var _this = this;
        this.getPorts().each(function(i,port){
            port.getConnections().each(function(i,connection){
                connection.toFront(_this);
            });
            port.toFront(_this);
        });
        return this;
    },
    getTopLevelShapeElement: function()
    {
        if(this.svgNodes.length===0) {
            return this.shape;
        }
        return this.svgNodes;
    },
    createShapeElement: function()
    {
       var shape= this.canvas.paper.rect(this.getX(),this.getY(),this.getWidth(), this.getHeight());
       this.svgNodes = this.createSet();
       if(typeof this.svgNodes.forEach==="undefined"){
           var set = this.canvas.paper.set();
           set.push(this.svgNodes);
           this.svgNodes = set;
       }
       this.svgNodes.attr({"stroke-scale": this.strokeScale});
       this.setVisible(this.visible);
       this.setCssClass(this.cssClass);
       var bb = this.svgNodes.getBBox();
       this.originalWidth = bb.width;
       this.originalHeight= bb.height;
       return shape;
    },
    createSet: function()
    {
    	return this.canvas.paper.set(); 
    }
});
draw2d.SVGFigure = draw2d.SetFigure.extend({
    NAME : "draw2d.SVGFigure",
    init: function(attr, setter, getter)
    {
        this.svg = null;
        this._super(
            $.extend({},attr),
            $.extend({
                svg : this.setSVG
            },setter),
            $.extend({
                svg : this.getSVG
            },getter)
        );
    },
    createSet: function()
    {
        if(this.svg === null) {
            this.svg = this.getSVG();
        }
		return this.importSVG(this.canvas, this.svg);
	},
    getSVG: function()
    {
        return this.svg;
    },
    setSVG: function(svg, duration)
    {
        this.svg = svg;
        if(this.canvas !==null && this.svgNodes !==null){
            var newSVGNodes = this.createSet();
            if($.isNumeric(duration)) {
                newSVGNodes.hide();
                newSVGNodes.insertAfter(this.svgNodes);
                var oldSVG = this.svgNodes;
                this.svgNodes = newSVGNodes;
                this.applyTransformation();
                oldSVG.forEach(function ( shape) {
                    $(shape.node).fadeOut(duration, function () {
                        shape.remove();
                    });
                });
                newSVGNodes.forEach(function (shape) {
                    $(shape.node).fadeIn(duration);
                });
            }
            else {
                newSVGNodes.insertAfter(this.svgNodes);
                this.svgNodes.remove();
                this.svgNodes = newSVGNodes;
                this.applyTransformation();
            }
        }
        return this;
    },
    importSVG : function (canvas, rawSVG) 
    {
      var set = canvas.paper.set();
      try {
        if (typeof rawSVG === 'undefined'){
          throw 'No data was provided.';
        }
        var svgDOM= $(rawSVG);
        if(typeof this._dimensionReadFromJSON ==="undefined"){
            if(svgDOM.attr("width") && svgDOM.attr("height")){
                this.setDimension(parseFloat(svgDOM.attr("width")), parseFloat(svgDOM.attr("height")));
            }
            delete this._dimensionReadFromJSON;
        }
        var findStyle = new RegExp('([a-z0-9\-]+) ?: ?([^ ;]+)[ ;]?','gi');
        svgDOM.children().each(function(i,element){
          var shape=null;
          var style=null;
          var attr = { };
          var node = element.tagName;
          var index = node.indexOf(":");
          if(index != -1)
              node = node.substr(index+1);
          $(element.attributes).each(function() {
            switch(this.nodeName) {
              case 'stroke-dasharray':
                attr[this.nodeName] = '- ';
              break;
              case 'style':
                style = this.nodeValue;
              break;
              case 'id':
              case 'xml:space':
                  break;
              default:
                if(this.value){
                    attr[this.nodeName] = this.value;
                }
                else{
                    attr[this.nodeName] = this.nodeValue;
                }
              break;
            }
          });
          if ( style !== null){
            while(findStyle.exec(style)){
              attr[RegExp.$1] = RegExp.$2;
            }
          }
          if (typeof attr['stroke-width'] === 'undefined'){
              attr['stroke-width'] = (typeof attr.stroke === 'undefined' ? 0 : 1.2);
          }
          switch(node) {
            case 'rect':
              shape = canvas.paper.rect();
              if(typeof attr["rx"]!=="undefined") {
                  attr.r = parseInt(attr.rx);
                  delete attr.rx;
              }
              break;
            case 'circle':
              shape = canvas.paper.circle();
              break;
            case 'ellipse':
              shape = canvas.paper.ellipse();
              break;
            case 'path':
              attr.fill ="none";
              shape = canvas.paper.path(attr.d);
              break;
            case 'line':
              attr.d= "M "+attr.x1+" "+attr.y1+"L"+attr.x2+" "+attr.y2;
              attr.fill ="none";
              shape = canvas.paper.path(attr.d);
             break;
            case 'polyline':
              var path = attr.points;
              attr.d = "M "+path.replace(" "," L");
              shape = canvas.paper.path(attr.d);
              break;
            case 'polygon':
              shape = canvas.paper.polygon(attr.points);
              break;
            case 'image':
              shape = canvas.paper.image();
              break;
            case 'tspan':
            case 'text':
                if(element.childNodes.length>0){
                    var child = element.firstChild;
                    do {
                       switch(child.nodeType){
                            case 2:
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                            case 9:
                            case 10:
                            case 11:
                            case 12:
                                return;
                            case 3:
                            	child = element;
                            	break;
                            case 1:
                        }
                        var subShape = canvas.paper.text(0,0,$(child).text());
                        var subAttr ={"x":parseFloat(child.attributes.x.value), "y":parseFloat(child.attributes.y.value)};
                        subAttr["text-anchor"] = "start";
                        if(typeof child.attributes["text-anchor"]!=="undefined"){
                            subAttr["text-anchor"] = child.attributes["text-anchor"].value;
                        }
                        else if(typeof attr["text-anchor"]!=="undefined"){
                            subAttr["text-anchor"] = attr["text-anchor"];
                        }
                        if(typeof child.attributes["font-size"]!=="undefined"){
                            subAttr["font-size"] = parseInt(child.attributes["font-size"].value);
                        }
                        else if(typeof attr["font-size"]!=="undefined"){
                            subAttr["font-size"] = parseInt(attr["font-size"]);
                        }
                        if(typeof child.attributes["font-family"]!=="undefined"){
                            subAttr["font-family"] = child.attributes["font-family"].value;
                        }
                        else if(typeof attr["font-family"]!=="undefined"){
                            subAttr["font-family"] = attr["font-family"];
                        }
                        subAttr["fill"] = "#000000";
                        if(typeof child.attributes["fill"]!=="undefined"){
                            subAttr["fill"] = child.attributes["fill"].value;
                        }
                        else if(typeof attr["fill"]!=="undefined"){
                            subAttr["fill"] = attr["fill"];
                        }
                        subAttr.y= subAttr.y+subShape.getBBox().height/2;
                        subShape.attr(subAttr);
                        set.push(subShape);
                        child = child.nextSibling;
                    }while(child && child.nodeType === 3); 
                }
                else{
                  shape = canvas.paper.text(0,0,$(element).html());
                  if(typeof attr["fill"]==="undefined")
                      attr["fill"] = "#000000";
                  if(typeof attr["text-anchor"]==="undefined")
                      attr["text-anchor"] = "start";
                  if(typeof attr["font-size"]!=="undefined")
                      attr["font-size"] = parseInt(attr["font-size"]);
                  if(typeof attr["font-family"]!=="undefined")
                      attr["font-family"] = parseInt(attr["font-family"]);
                  attr.y= parseFloat(attr.y)+shape.getBBox().height/2;
                }
              break;
          }
          if(shape!==null){
              shape.attr(attr);
              set.push(shape);
          }
        });
      } catch (error) {
        alert('The SVG data you entered was invalid! (' + error + ')');
      }
      return set;
    },
    setPersistentAttributes: function(memento)
    {
        this._super(memento);
        if(typeof memento.width !== "undefined"){
            this._dimensionReadFromJSON=true;
        }
        else if(typeof memento.height !== "undefined"){
            this._dimensionReadFromJSON=true;
        }
        return this;
    }  
});
draw2d.shape.basic.Oval = draw2d.VectorFigure.extend({
    NAME : "draw2d.shape.basic.Oval",
    init: function(attr, setter, getter ) 
    {
        this._super( 
                $.extend({
                    bgColor:"#C02B1D", 
                    color:"#1B1B1B"
                    },attr),
                $.extend({
                    center: this.setCenter
                    },setter),
                getter);
    },
   createShapeElement: function()
   {
     var halfW = this.getWidth()/2;
     var halfH = this.getHeight()/2;
     return this.canvas.paper.ellipse(this.getAbsoluteX()+halfW, this.getAbsoluteY()+halfH, halfW, halfH);
   },
   getCenter: function(){
       var w2= this.getWidth()/2;
       var h2= this.getHeight()/2;
       return this.getPosition().translate(w2,h2);
   },
   setCenter: function(x, y)
   {
       var pos = new draw2d.geo.Point(x,y);
       var w2= this.getWidth()/2;
       var h2= this.getHeight()/2;
       pos.translate(-w2,-h2);
       this.setPosition(pos);
       this.fireEvent("change:center",{value:{x:x,y:y}});
       return this;
   },
   repaint: function(attributes)
   {
       if(this.repaintBlocked===true || this.shape===null){
           return;
       }
       attributes= attributes || {};
       if(typeof attributes.rx === "undefined"){
           attributes.rx = this.width/2;
           attributes.ry = this.height/2;
       }
       if(typeof attributes.cx === "undefined"){
           attributes.cx = this.getAbsoluteX()+attributes.rx;
           attributes.cy = this.getAbsoluteY()+attributes.ry;
       }
       this._super(attributes);
   },
   intersectionWithLine: function(a1, a2)
   {
	   var rx = this.getWidth()/2;
	   var ry = this.getHeight()/2;
	   var result= new draw2d.util.ArrayList();
       var origin = new draw2d.geo.Point(a1.x, a1.y);
       var dir    = a2.subtract(a1);
       var center = new draw2d.geo.Point(this.getAbsoluteX()+rx, this.getAbsoluteY()+ry);
       var diff   = origin.subtract(center);
       var mDir   = new draw2d.geo.Point( dir.x/(rx*rx),  dir.y/(ry*ry)  );
       var mDiff  = new draw2d.geo.Point( diff.x/(rx*rx), diff.y/(ry*ry) );
       var a = dir.dot(mDir);
       var b = dir.dot(mDiff);
       var c = diff.dot(mDiff) - 1.0;
       var d = b*b - a*c;
       if ( d < 0 ) {
       } else if ( d > 0 ) {
           var root = Math.sqrt(d);
           var t_a  = (-b - root) / a;
           var t_b  = (-b + root) / a;
           if ( (t_a < 0 || 1 < t_a) && (t_b < 0 || 1 < t_b) ) {
               if ( (t_a < 0 && t_b < 0) || (t_a > 1 && t_b > 1) ){
               }
               else{            	   
                   ;
               }
           } else {
               if ( 0 <= t_a && t_a <= 1 )
                   result.add( a1.lerp(a2, t_a) );
               if ( 0 <= t_b && t_b <= 1 )
                   result.add( a1.lerp(a2, t_b) );
           }
       } else {
           var t = -b/a;
           if ( 0 <= t && t <= 1 ) {
               result.add( a1.lerp(a2, t) );
           } else {
           }
       }
       return result;
   }	 
});
draw2d.shape.basic.Circle = draw2d.shape.basic.Oval.extend({
    NAME : "draw2d.shape.basic.Circle", 
    init: function( attr, setter, getter)
    {
        this._super(
            attr,
            $.extend({
                diameter : this.setDiameter,
                radius   : this.setRadius
            },setter),
            $.extend({
                diameter : this.getDiameter,
                radius   : this.getRadius
            },getter));
        this.setKeepAspectRatio(true);
    },
    setDiameter: function(d)
    {
        var center = this.getCenter();
        this.setDimension(d,d);
        this.setCenter(center); 
        this.fireEvent("change:diameter", {value:d});
        return this;
    },
    getDiameter: function()
    {
        return this.getWidth();
    },
    setRadius: function(r)
    {
        this.setDiameter(r*2);
        this.fireEvent("change:radius", {value:r});
        return this;
    },
    getPersistentAttributes: function()
    {
        var memento =this._super();
        delete memento.radius;
        return memento;
    }
});
draw2d.shape.basic.Label= draw2d.SetFigure.extend({
	NAME : "draw2d.shape.basic.Label",
    FONT_FALLBACK:  {
      'Georgia'            :'Georgia, serif',
      'Palatino Linotype'  :'"Palatino Linotype", "Book Antiqua", Palatino, serif',
      'Times New Roman'    :'"Times New Roman", Times, serif',
      'Arial'              :'Arial, Helvetica, sans-serif',
      'Arial Black'        :'"Arial Black", Gadget, sans-serif',   
      'Comic Sans MS'      :'"Comic Sans MS", cursive, sans-serif',    
      'Impact'             :'Impact, Charcoal, sans-serif',
      'Lucida Sans Unicode':'"Lucida Sans Unicode", "Lucida Grande", sans-serif',  
      'Tahoma, Geneva'     :'Tahoma, Geneva, sans-seri',
      'Trebuchet MS'       :'"Trebuchet MS", Helvetica, sans-serif',
      'Verdana'            :'Verdana, Geneva, sans-serif',
      'Courier New'        :'"Courier New", Courier, monospace',
      'Lucida Console'     :'"Lucida Console", Monaco, monospace'},
    init: function(attr, setter, getter)
    {
        this.text = "";
        this.cachedWidth  = null;
        this.cachedHeight = null;
        this.cachedMinWidth  = null;
        this.cachedMinHeight = null;
        this.fontSize = 12;
        this.fontColor = new draw2d.util.Color("#080808");
        this.fontFamily = null;
        this.padding = {top:4, right:4, bottom:4,left:4};
        this.outlineStroke = 0;
        this.outlineColor = new draw2d.util.Color(null);
        this.bold = false;
        this.editor = null;
        this._super(
            $.extend({stroke:1, width:1,height:1,resizeable:false},attr),
            $.extend({
                text  : this.setText,
                editor : this.installEditor,
                outlineStroke  : this.setOutlineStroke,
                outlineColor  : this.setOutlineColor,
                fontFamily  : this.setFontFamily,
                fontSize  : this.setFontSize,
                fontColor  : this.setFontColor,
                padding  : this.setPadding,
                bold  : this.setBold
            }, setter),
            $.extend({
                text          : this.getText,
                outlineStroke : this.getOutlineStroke,
                outlineColor  : this.getOutlineColor,
                fontFamily    : this.getFontFamily,
                fontSize      : this.getFontSize,
                fontColor     : this.getFontColor,
                padding       : this.getPadding,
                bold          : this.isBold
            }, getter));
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());
        this.lastAppliedLabelRotation = "";
        this.lastAppliedTextAttributes= {};
    },
    createSet: function()
    {
    	return this.canvas.paper.text(0, 0, this.text);
    },
    setCanvas: function( canvas )
    {
        this.clearCache();
        this._super(canvas);
        this.clearCache();
    },
    repaint: function(attributes)
    {
        if(this.repaintBlocked===true || this.shape===null || (this.parent && this.parent.repaintBlocked===true)){
            return;
        }
        var lattr = this.calculateTextAttr();
        lattr.text = this.text;        
        var attrDiff = draw2d.util.JSON.flatDiff(lattr, this.lastAppliedTextAttributes);
        this.lastAppliedTextAttributes= lattr;
        if(!$.isEmptyObject(attrDiff)){
            this.svgNodes.attr(lattr);
            this.svgNodes.attr({
                    x: (this.padding.left+this.stroke),
                    y: (this.svgNodes.getBBox(true).height/2 +this.padding.top + this.getStroke())
                });
        }
        this._super(attributes);
    },
    calculateTextAttr: function()
    {
        var lattr={"text-anchor":"start",
                   "font-size":this.fontSize,
                   "font-weight":(this.bold===true)?"bold":"normal",
                   fill: this.fontColor.hash(),
                   stroke : this.outlineColor.hash(),
                   "stroke-width": this.outlineStroke
                   };
        if(this.fontFamily!==null){
            lattr["font-family"] = this.fontFamily;
        }
        return lattr;
    },
    applyTransformation: function()
    {
        var ts= "R"+this.rotationAngle;
            this.shape.transform(ts);
            this.lastAppliedLabelRotation = ts;
        this.svgNodes.transform(
                "R" + this.rotationAngle+
                "T" + this.getAbsoluteX() + "," + this.getAbsoluteY());
        return this;
    },
    setFontSize: function( size)
    {
      this.clearCache();
      this.fontSize = size;
      this.repaint();
      this.fireEvent("change:fontSize",{value:this.fontSize});
      this.fireEvent("resize");
      var _this = this;
      this.editPolicy.each(function(i,e){
         if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
             e.moved(_this.canvas, _this);
         }
      });
      return this;
    },
    getFontSize: function( )
    {
      return this.fontSize;
    },
    setBold: function( bold)
    {
      this.clearCache();
      this.bold = bold;
      this.repaint();
      this.fireEvent("change:bold",{value:this.bold});
      this.fireEvent("resize");
      var _this = this;
      this.editPolicy.each(function(i,e){
         if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
             e.moved(_this.canvas, _this);
         }
      });
      return this;
    },
    isBold: function()
    {
        return this.bold;
    },
    setOutlineColor: function( color)
    {
      this.outlineColor = new draw2d.util.Color(color);
      this.repaint();
      this.fireEvent("change:outlineColor",{value:this.outlineColor});
      return this;
    },
    getOutlineColor: function()
    {
      return this.outlineColor;
    },
    setOutlineStroke: function( w )
    {
      this.outlineStroke=w;
      this.repaint();
      this.fireEvent("change:outlineStroke",{value:this.outlineStroke});
      return this;
    },
    getOutlineStroke: function( )
    {
      return this.outlineStroke;
    },
    setFontColor: function( color)
    {
      this.fontColor = new draw2d.util.Color(color);
      this.repaint();
      this.fireEvent("change:fontColor",{value:this.fontColor});
      return this;
    },
    getFontColor: function()
    {
      return this.fontColor;
    },
    setPadding: function( padding)
    {
      this.clearCache();
      if(typeof padding ==="number"){
          this.padding = {top:padding, right:padding, bottom:padding, left:padding};
      }
      else{
          $.extend(this.padding, padding);
      }
      this.repaint();
      this.fireEvent("change:padding",{value:this.padding});
      return this;
    },
    getPadding: function( )
    {
      return this.padding;
    },
    setFontFamily: function( font)
    {
      this.clearCache();
      if((typeof font!=="undefined") && font!==null && typeof this.FONT_FALLBACK[font] !== "undefined"){
          font=this.FONT_FALLBACK[font];
      }
      this.fontFamily = font;
      this.repaint();
      this.fireEvent("change:fontFamily",{value:this.fontFamily});
      return this;
    },
    getFontFamily: function(){
        return this.fontFamily;
    },
    setDimension: function( w, h)
    {
        this.clearCache();
        this._super(w,h);
        return this;
    },
    clearCache: function()
    {
        this.portRelayoutRequired=true;
        this.cachedMinWidth  = null;
        this.cachedMinHeight = null;
        this.cachedWidth=null;
        this.cachedHeight=null;
        this.lastAppliedTextAttributes= {};
        return this;
    },
    getMinWidth: function()
    {
        if (this.shape === null) {
            return 0;
        }
        if(this.cachedMinWidth=== null){
            this.cachedMinWidth= this.svgNodes.getBBox(true).width
                                +this.padding.left
                                +this.padding.right
                                +2*this.getStroke();
       }
        return this.cachedMinWidth;
    },
    getMinHeight: function()
    {
        if (this.shape === null) {
            return 0;
        }
        if(this.cachedMinHeight=== null){
            this.cachedMinHeight= this.svgNodes.getBBox(true).height
                                 +this.padding.top
                                 +this.padding.bottom
                                 +(2*this.getStroke());
        }
        return this.cachedMinHeight;
    },
    getWidth: function()
    {    
        if (this.shape === null) {
            return 0;
        }
        if(this.cachedWidth===null){
            if(this.resizeable===true){
                this.cachedWidth = Math.max(this.width, this.getMinWidth());
            }
            else{
                this.cachedWidth = this.getMinWidth();
            }
        }
        return this.cachedWidth;
    },
    getHeight: function()
    {
        if (this.shape === null) {
            return 0;
        }
        if(this.cachedHeight===null){
            this.cachedHeight = Math.max(this.height, this.getMinHeight());
        }
        return this.cachedHeight;
    },
    installEditor: function( editor )
    {
        if(typeof editor ==="string"){
            editor = eval("new "+editor+"()");
        }
        this.editor = editor;
        return this;
    },
    onDoubleClick: function()
    {
        if(this.editor!==null){
            this.editor.start(this);
        }
    },
    getText: function()
    {
      return this.text;
    },
    setText: function( text )
    {
      this.clearCache();
      this.text = text;
      this.repaint();
      var _this = this;
      this.editPolicy.each(function(i,e){
         if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
             e.moved(_this.canvas, _this);
         }
      });
      this.fireEvent("resize");
      this.fireEvent("change:text",{value:this.text});
      if(this.parent!==null){
          this.parent.repaint();
      }
      return this;
    },
    hitTest: function(x, y) 
    {
        if( this.rotationAngle === 0){
            return this._super(x,y); 
        }
        var matrix = this.shape.matrix;
        var points = this.getBoundingBox().getVertices();
        points.each(function(i,point){
            var x = matrix.x(point.x,point.y);
            var y = matrix.y(point.x,point.y);
            point.x=x;
            point.y=y;
        });
        var polySides=4;
        var i=0;
        var j=polySides-1 ;
        var oddNodes=false;
        for (i=0; i<polySides; i++) {
            var pi = points.get(i);
            var pj = points.get(j);
            if ((pi.y< y && pj.y>=y
            ||   pj.y< y && pi.y>=y)
            &&  (pi.x<=x || pj.x<=x)) {
              if (pi.x+(y-pi.y)/(pj.y-pi.y)*(pj.x-pi.x)<x) {
                oddNodes=!oddNodes; }}
            j=i; }
        return oddNodes; 
     },
     getPersistentAttributes: function()
     {
         var memento = this._super();
         memento.text = this.text;
         memento.outlineStroke = this.outlineStroke;
         memento.outlineColor = this.outlineColor.hash();
         memento.fontSize = this.fontSize;
         memento.fontColor = this.fontColor.hash();
         memento.fontFamily = this.fontFamily;
         if(this.editor !==null){
             memento.editor = this.editor.NAME;
         }
         return memento;
     },
     setPersistentAttributes: function(memento)
     {
         this._super(memento);
         if(typeof memento.text !=="undefined"){
             this.setText(memento.text);
         }
         if(typeof memento.outlineStroke !=="undefined"){
             this.setOutlineStroke(memento.outlineStroke);
         }
         if(typeof memento.outlineColor !=="undefined"){
             this.setOutlineColor(memento.outlineColor);
         }
         if(typeof memento.fontFamily !=="undefined"){
             this.setFontFamily(memento.fontFamily);
         }
         if(typeof memento.fontSize !=="undefined"){
             this.setFontSize(memento.fontSize);
         }
         if(typeof memento.fontColor !=="undefined"){
             this.setFontColor(memento.fontColor);
         }
         if(typeof memento.editor === "string"){
             this.installEditor( eval("new "+memento.editor+"()"));
         }
     }
});
draw2d.shape.basic.Text= draw2d.shape.basic.Label.extend({
	NAME : "draw2d.shape.basic.Text",
    init: function(attr, setter, getter)
    {
        this.cachedWrappedAttr = null;
        this._super($.extend({width:100, height:50, resizeable:true},attr), setter, getter);
        this.installEditPolicy(new draw2d.policy.figure.WidthSelectionFeedbackPolicy());
    },
    repaint: function(attributes)
    {
        if(this.repaintBlocked===true || this.shape===null){
            return;
        }
       this.svgNodes.attr($.extend({},this.calculateTextAttr(),this.wrappedTextAttr(this.text, this.getWidth()-this.padding.left-this.padding.right)));
        this.svgNodes.attr({x:this.padding.left, y: this.getHeight()/2});
        draw2d.SetFigure.prototype.repaint.call(this,attributes);
    },
    setDimension: function( w, h)
    {
        this.clearCache();
        var attr = this.wrappedTextAttr(this.text, w);
        this.cachedMinWidth = Math.max(w,attr.width);
        this.cachedMinHeight= attr.height;
        draw2d.shape.node.Node.prototype.setDimension.call(this,this.cachedMinWidth, this.cachedMinHeight);
        this.fireEvent("change:dimension",{value:{width:this.cachedMinWidth, height:this.cachedMinHeight}});
        return this;
    },
    clearCache: function()
    {
        this._super();
        this.cachedWrappedAttr = null;
        return this;
    },
    getMinWidth: function()
    {
        if (this.shape === null) {
            return 0;
        }
        if(this.cachedMinWidth === null){
            var longestWord = this.text.split(" ").reduce(function(arg1,arg2){ return arg1.length > arg2.length ? arg1 : arg2; });
            var svgText = this.canvas.paper
                                     .text(0, 0, longestWord)
                                     .attr($.extend({},this.calculateTextAttr(),{text:longestWord}));
            this.cachedMinWidth= svgText.getBBox(true).width+this.padding.left+this.padding.right+2*this.getStroke();
            svgText.remove();
        }
        return this.cachedMinWidth;
    },
    wrappedTextAttr: function(text, width) 
    {
    	var words = text.split(" ");
        if(this.canvas ===null || words.length===0){
            return {text:text, width:width, height:20};
        }
        if(this.cachedWrappedAttr===null){
            var abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var svgText = this.canvas.paper.text(0, 0, "").attr($.extend({},this.calculateTextAttr(),{text:abc}));
            var letterWidth = svgText.getBBox(true).width / abc.length;
            var s = [words[0]], x=s[0].length*letterWidth;
            var w =null;
            for ( var i = 1; i < words.length; i++) {
            	w= words[i];
                var l = w.length* letterWidth;
                if ((x+l) > width) {
                    s.push("\n");
                    x = l;
                }
                else{
                    s.push(" ");
                    x += l;
                }
                s.push(w);
            }
            svgText.attr({text: s.join("")});
            var bbox = svgText.getBBox(true);
            svgText.remove();
            this.cachedWrappedAttr= {text: s.join(""), width:(Math.max(width,bbox.width)+this.padding.left+this.padding.right), height: (bbox.height+this.padding.top+this.padding.bottom)};
        }
        return this.cachedWrappedAttr;
     },
     getPersistentAttributes: function()
     {
         var memento = this._super();
         return memento;
     },
     setPersistentAttributes: function(memento)
     {
         this._super(memento);
         return this;
     }
});
draw2d.shape.basic.Line = draw2d.Figure.extend({
    NAME : "draw2d.shape.basic.Line",
    DEFAULT_COLOR : new draw2d.util.Color(0,0,0),
    init: function(attr, setter, getter) 
    {
        this.corona = 10;
        this.isGlowing = false;
        this.lineColor = this.DEFAULT_COLOR;
        this.stroke=1;
        this.outlineStroke = 0;
        this.outlineColor = new draw2d.util.Color(null);
        this.outlineVisible = false;
        this.draggedSegment = null;
        this.dasharray = null;
        this.start = new draw2d.geo.Point(30,30);
        this.end   = new draw2d.geo.Point(100,100);
        this.vertices = new draw2d.util.ArrayList();
        this.vertices.add(this.start.clone());
        this.vertices.add(this.end.clone());
        this._super(
             $.extend({
                deleteable:false,
                selectable:true
             },attr),
             $.extend({},{
                    start: this.setStartPosition,
                    startX: this.setStartX,
                    startY: this.setStartY,
                    end: this.setEndPosition,
                    endX: this.setEndX,
                    endY: this.setEndY,
                    vertices: this.setVertices,
                    outlineColor : this.setOutlineColor,
                    outlineStroke : this.setOutlineStroke,
                    color : this.setColor,
                    stroke : this.setStroke,
                    dasharray : this.setDashArray,
                    glow  : this.setGlow
                }, setter),
             $.extend({},{
                start:         this.getStartPosition,
                end:           this.getEndPosition,
                outlineColor:  this.getOutlineColor,
                outlineStroke: this.getOutlineStroke,
                stroke:        this.getStroke,
                color:         this.getColor,
                dasharray:     this.getDashArray,
                vertices:      this.getVertices
            }, getter));
            if(this.editPolicy.getSize()===0) {
                this.installEditPolicy(new draw2d.policy.line.LineSelectionFeedbackPolicy());
            }
    },
   setOutlineColor: function( color)
   {
     this.outlineColor = new draw2d.util.Color(color);
     this.repaint();
     this.fireEvent("change:outlineColor",{value:this.outlineColor});
     return this;
   },
   getOutlineColor: function()
   {
     return this.outlineColor;
   },
   setOutlineStroke: function( w )
   {
     this.outlineStroke=w;
     this.repaint();
     this.fireEvent("change:outlineStroke",{value:this.outlineStroke});
     return this;
   },
   getOutlineStroke: function()
   {
     return this.outlineStroke;
   },
    onDragStart: function(x, y, shiftKey, ctrlKey, isFaked )
    {
        var result = this._super(x,y,shiftKey, ctrlKey);
        if(result===true && isFaked!==true){
            this.draggedSegment =  {index: 0, start:this.start, end: this.end};
        }
        return result;
    },
   onDrag: function( dx, dy, dx2, dy2)
   {
       if(this.command ===null){
           return;
       }
       this.vertices.each(function(i,e){
           e.translate(dx2, dy2);
       });
       this.command.updateVertices(this.vertices.clone());
       this.start.translate(dx2, dy2);
       this.end.translate(dx2, dy2);
       this.svgPathString = null;
       this._super(dx, dy, dx2, dy2);
   },
   onDragEnd: function( x, y, shiftKey, ctrlKey)
   {
       this.isInDragDrop = false;
       this.draggedSegment = null;
       if(this.command===null){
           return;
       }
       var _this = this;
       this.canvas.getCommandStack().execute(this.command);
	   this.command = null;
	   this.isMoving = false;
	   this.editPolicy.each(function(i,e){
    	   if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
    		   e.onDragEnd(_this.canvas, _this, x, y, shiftKey, ctrlKey);
    	   }
	   });
       this.fireEvent("move",{figure:this, dx:0, dy:0});
       this.fireEvent("dragend",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
   },
   onClick: function()
   {
   },
   setDashArray: function(dashPattern)
   {
       this.dasharray = dashPattern;
       this.repaint();
       this.fireEvent("change:dashArray",{value:this.dasharray});
       return this;
   },
   getDashArray: function()
   {
       return this.dasharray;
   },
   setCoronaWidth: function( width)
   {
      this.corona = width;
      return this;
   },
   createShapeElement: function()
   {
     var set=  this.canvas.paper.set();
     set.push(this.canvas.paper.path("M"+this.start.x+" "+this.start.y+"L"+this.end.x+" "+this.end.y));
     set.push(this.canvas.paper.path("M"+this.start.x+" "+this.start.y+"L"+this.end.x+" "+this.end.y));
     set.node = set.items[1].node;
     this.outlineVisible = true;
     return set;
   },
   repaint: function(attributes)
   {
       if(this.repaintBlocked===true || this.shape===null){
           return;
       }
       if(typeof attributes === "undefined"){
           attributes = {"stroke":this.lineColor.hash(),
                         "stroke-width":this.stroke,
                         "path":["M",this.start.x,this.start.y,"L",this.end.x,this.end.y].join(" ")};
       }
       else{
           if(typeof attributes.path ==="undefined"){
    		   attributes.path =["M",this.start.x,this.start.y,"L",this.end.x,this.end.y].join(" ");
    	   }
           draw2d.util.JSON.ensureDefault(attributes,"stroke" ,this.lineColor.hash());
           draw2d.util.JSON.ensureDefault(attributes,"stroke-width" ,this.stroke);
       }
       draw2d.util.JSON.ensureDefault(attributes,"stroke-dasharray" ,this.dasharray);
       this._super(attributes);
       if(this.outlineStroke>0){
           this.shape.items[0].attr({"stroke-width":(this.outlineStroke+this.stroke), "stroke":this.outlineColor.hash()});
           if(this.outlineVisible===false)
               this.shape.items[0].show();
           this.outlineVisible = true;
       }
       else if(this.outlineVisible===true){
           this.shape.items[0].attr({"stroke-width":0, "stroke":"none"});
           this.shape.items[0].hide();
       }
   },
   toBack: function(figure )
   {
	   this._super(figure);
	   if(this.outlineVisible===true){
    	   this.shape.items[0].insertBefore(this.shape.items[1]);
	   }
       return this;
   },
   setGlow: function(flag)
   {
	   if(this.isGlowing===flag){
		   return;
	   }
	   if(flag===true){
		   this._lineColor = this.lineColor;
		   this._stroke = this.stroke;
	       this.setColor( new draw2d.util.Color("#3f72bf"));
	       this.setStroke((this.stroke*4)|0);
	   }
	   else{
	       this.setColor(this._lineColor);
	       this.setStroke(this._stroke);
	   }
	   this.isGlowing = flag;
	   return this;
   },
   isResizeable: function()
   {
     return true;
   },
   setStroke: function(w)
   {
     this.stroke=parseFloat(w);
     this.repaint();
     this.fireEvent("change:stroke",{value:this.stroke});
     return this;
   },
   getStroke: function( )
   {
     return this.stroke;
   },
   setColor: function( color)
   {
     this.lineColor = new draw2d.util.Color(color);
     this.repaint();
     this.fireEvent("change:color",{value:this.lineColor});
     return this;
   },
   getColor: function()
   {
     return this.lineColor;
   },
   translate: function(dx , dy )
   {
       this.vertices.each(function(i,e){
           e.translate(dx, dy);
       });
       this.start=this.vertices.first().clone();
       this.end=this.vertices.last().clone();
       var _this = this;
       this.editPolicy.each(function(i,e){
           if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
               e.moved(_this.canvas, _this);
           }
       });
       this.svgPathString = null;
       this.repaint();
       return this;
   },
   getBoundingBox: function()
   {
       var minX = Math.min.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.x;}));
       var minY = Math.min.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.y;}));
       var maxX = Math.max.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.x;}));
       var maxY = Math.max.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.y;}));
       var width = maxX - minX;
       var height= maxY - minY;
       return new draw2d.geo.Rectangle(minX, minY, width, height);
   },
   setStartPosition: function( x, y)
   {
     var pos = new draw2d.geo.Point(x,y);
     if(this.start.equals(pos)){
        return this;
     }
     this.start.setPosition(pos);
     this.vertices.first().setPosition(pos);
     this.repaint();
     var _this = this;
     this.editPolicy.each(function(i,e){
         if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
             e.moved(_this.canvas, _this);
         }
     });
     this.fireEvent("change:start",{value:this.start});
     return this;
  },
  setStartPoint: function(x,y){return this.setStartPosition(x,y);},
  setStartX: function(x)
  {
      this.setStartPoint(x, this.start.y);
  },
  setStartY: function(y)
  {
      this.setStartPoint(this.start.x, y);
  },
  setEndX: function(x)
  {
      this.setEndPoint(x, this.end.y);
  },
  setEndY: function(y)
  {
      this.setEndPoint(this.end.x, y);
  },
   setEndPosition: function(x, y)
   {
     var pos = new draw2d.geo.Point(x,y);
     if(this.end.equals(pos)){
        return this;
     }
     this.end.setPosition(pos);
     this.vertices.last().setPosition(pos);
     this.repaint();
     var _this = this;
     this.editPolicy.each(function(i,e){
         if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
             e.moved(_this.canvas, _this);
         }
     });
     this.fireEvent("change:end",{value:this.end});
     return this;
   },
   setEndPoint: function(x,y){return this.setEndPosition(x,y)},
   getStartX: function()
   {
     return this.start.x;
   },
   getStartY: function()
   {
     return this.start.y;
   },
   getStartPosition: function()
   {
     return this.start.clone();
   },
    getStartPoint: function(){return this.getStartPosition();},
   getEndX: function()
   {
     return this.end.x;
   },
   getEndY: function()
   {
     return this.end.y;
   },
   getEndPosition: function()
   {
     return this.end.clone();
   },
   getEndPoint: function(){return this.getEndPosition();},
    getX: function()
    {
        return this.getBoundingBox().x;
    },
    getY: function()
    {
        return this.getBoundingBox().y;
    },
   getVertex: function( index)
   {
       return this.vertices.get(index);
   },
    setVertex: function(index, x, y)
    {
        if(x instanceof draw2d.geo.Point){
            y = x.y;
            x = x.x;
        }
        var vertex = this.vertices.get(index);
        if (vertex === null || (vertex.x === x && vertex.y === y)) {
            return;
        }
        vertex.x = parseFloat(x);
        vertex.y = parseFloat(y);
        this.start=this.vertices.first().clone();
        this.end=this.vertices.last().clone();
        this.svgPathString = null;
        this.routingRequired=true;
        this.repaint();
        var _this = this;
        this.editPolicy.each(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(_this.canvas, _this);
            }
        });
        this.fireEvent("change:vertices",{value:this.vertices});
        return this;
    },
   getVertices: function()
   {
       return this.vertices;
   },
   setVertices: function(vertices)
   {
       var _this = this;
       if($.isArray(vertices)){
           this.vertices= new draw2d.util.ArrayList();
           $.each(vertices,function(index, element){
                _this.vertices.add(new draw2d.geo.Point(element));
           });
       }
       else if (vertices instanceof draw2d.util.ArrayList){
           this.vertices= vertices.clone(true);
       }
       else{
           throw "invalid argument for Line.setVertices";
       }
       if(this.vertices.getSize()>1) {
           this.start = this.vertices.first().clone();
           this.end = this.vertices.last().clone();
       }
       this.svgPathString = null;
       this.repaint();
       if(!this.selectionHandles.isEmpty()){
           this.editPolicy.each(function(i, e) {
               if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
                   e.onUnselect(_this.canvas, _this);
                   e.onSelect(_this.canvas, _this);
               }
           });
       }
       this.editPolicy.each(function(i, e) {
           if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
               e.moved(_this.canvas, _this);
           }
       });
       this.fireEvent("change:vertices",{value:this.vertices});
       return this;
   },
   getSegments: function()
   {
       var result = new draw2d.util.ArrayList();
       result.add({start: this.getStartPosition(), end: this.getEndPosition()});
       return result;
   },
   getLength: function()
   {
     return Math.sqrt((this.start.x-this.end.x)*(this.start.x-this.end.x)+(this.start.y-this.end.y)*(this.start.y-this.end.y));
   },
   getAngle: function()
   {
     var length = this.getLength();
     var angle = -(180/Math.PI) *Math.asin((this.start.y-this.end.y)/length);
     if(angle<0)
     {
        if(this.end.x<this.start.x){
          angle = Math.abs(angle) + 180;
        }
        else{
          angle = 360- Math.abs(angle);
        }
     }
     else
     {
        if(this.end.x<this.start.x){
          angle = 180-angle;
        }
     }
     return angle;
   },
   createCommand: function( request)
   {
     if(request.getPolicy() === draw2d.command.CommandType.MOVE){
         if(this.isDraggable()){
             return new draw2d.command.CommandMoveVertices(this);
          }
     }
     if(request.getPolicy() === draw2d.command.CommandType.DELETE){
        if(this.isDeleteable()){
            return new draw2d.command.CommandDelete(this);
        }
     }
       if(request.getPolicy() === draw2d.command.CommandType.MOVE_BASEPOINT){
           if(this.isDraggable()){
               return new draw2d.command.CommandMoveVertex(this);
           }
       }
       return null;
   },
    installEditPolicy: function(policy)
    {
        if(!(policy instanceof draw2d.policy.line.LineSelectionFeedbackPolicy) && policy instanceof draw2d.policy.figure.SelectionFeedbackPolicy){
            return;
        }
        this._super(policy);
    },
   hitTest: function( px, py)
   {
     return draw2d.shape.basic.Line.hit(this.corona+ this.stroke, this.start.x,this.start.y, this.end.x, this.end.y, px,py);
   },
    pointProjection: function( px, py)
    {
        var pt =  new draw2d.geo.Point(px,py);
        var p1=this.getStartPosition();
        var p2=this.getEndPosition();
        return draw2d.geo.Line.pointProjection(p1.x,p1.y,p2.x,p2.y,pt.x,pt.y);
    },
    lerp: function(percentage)
    {
        var p1=this.getStartPosition();
        var p2=this.getEndPosition();
        percentage = Math.min(1,Math.max(0,percentage));
        return new draw2d.geo.Point(p1.x+(p2.x-p1.x)*percentage,p1.y+(p2.y-p1.y)*percentage);
    },
   intersection: function (other)
   {
       var result = new draw2d.util.ArrayList();
       if(other === this){
           return result;
       }
       var segments1= this.getSegments();
       var segments2= other.getSegments();
       segments1.each(function(i, s1){
           segments2.each(function(j, s2){
               var p= draw2d.shape.basic.Line.intersection(s1.start, s1.end, s2.start, s2.end);
               if(p!==null){
                   result.add(p);
               }
           });
       });
       return result;
   },
   getPersistentAttributes: function()
   {
       var memento = this._super();
       delete memento.x;
       delete memento.y;
       delete memento.width;
       delete memento.height;
       memento.stroke = this.stroke;
       memento.color  = this.getColor().hash();
       memento.outlineStroke = this.outlineStroke;
       memento.outlineColor = this.outlineColor.hash();
       if(this.dasharray!==null){
           memento.dasharray = this.dasharray;
       }
       if(this.editPolicy.getSize()>0){
           memento.policy = this.editPolicy.first().NAME;
       }
       memento.vertex = [];
       this.getVertices().each(function(i,e){
           memento.vertex.push({x:e.x, y:e.y});
       });
       return memento;
   },
   setPersistentAttributes: function(memento)
   {
       this._super(memento);
       if(typeof memento.dasharray ==="string"){
           this.dasharray = memento.dasharray;
       }
       if(typeof memento.stroke !=="undefined"){
           this.setStroke(parseFloat(memento.stroke));
       }
       if(typeof memento.color !=="undefined"){
           this.setColor(memento.color);
       }
       if(typeof memento.outlineStroke !=="undefined"){
           this.setOutlineStroke(memento.outlineStroke);
       }
       if(typeof memento.outlineColor !=="undefined"){
           this.setOutlineColor(memento.outlineColor);
       }
       if(typeof memento.policy !=="undefined"){
           try{
               this.installEditPolicy(eval("new "+memento.policy +"()" ));
           }
           catch(exc){
               debug.warn("Unable to install edit policy '"+memento.policy+"' forced by "+this.NAME+".setPersistendAttributes. Using default.");
           }
       }
       if($.isArray(memento.vertex) && memento.vertex.length>1) {
           this.setVertices(memento.vertex);
       }
   }
});
draw2d.shape.basic.Line.intersection = function(a1, a2, b1, b2) {
    var result=null;
    var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
    if ( u_b != 0 ) {
        var ua = ua_t / u_b;
        var ub = ub_t / u_b;
        if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
            result = new draw2d.geo.Point((a1.x + ua * (a2.x - a1.x))|0, (a1.y + ua * (a2.y - a1.y))|0);
            result.justTouching=( 0 == ua || ua == 1 || 0 == ub || ub == 1 );
        }
    }
    return result;
};
draw2d.shape.basic.Line.hit= function( coronaWidth, X1, Y1,  X2,  Y2, px, py)
{
    return draw2d.geo.Line.distance(X1, Y1,  X2,  Y2, px, py)<coronaWidth;
};
draw2d.shape.basic.PolyLine = draw2d.shape.basic.Line.extend({
	NAME : "draw2d.shape.basic.PolyLine",
    init: function( attr, setter, getter )
    {
      this.svgPathString = null;
      this.oldPoint=null;
      this.router = null;
      this.routingRequired = true;
      this.lineSegments = new draw2d.util.ArrayList();
      this.radius = "";
      this._super(
         $.extend(
              {
                  router:new draw2d.layout.connection.VertexRouter()
              },attr),
         $.extend({},{
             router : this.setRouter,
             radius : this.setRadius
        }, setter),
        $.extend({},{
            router: this.getRouter,
            radius: this.getRadius
        }, getter)
      );
    },
     setRadius: function(radius)
     {
        this.radius = radius;
        this.svgPathString =null;
        this.repaint();
        this.fireEvent("change:radius",{value:this.radius});
        return this;
    },
    getRadius: function()
    {
        return this.radius;
    },
    setStartPoint: function( x, y)
    {
        if(this.vertices.getSize()>0){
            this.vertices.first().setPosition(x,y);
        }
        else{
            this.vertices.add(new draw2d.geo.Point(x,y));
        }
		this.start = this.vertices.first().clone();
		    this.calculatePath({startMoved:true, endMoved:false});
        this.repaint();
        var _this = this;
		this.editPolicy.each(function(i, e) {
			if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
				e.moved(_this.canvas, _this);
			}
		});
        this.fireEvent("change:start",{value:this.start});
		return this;
    },
    setEndPoint: function(x, y)
    {
        if(this.vertices.getSize()>1){
            this.vertices.last().setPosition(x,y);
        }
        else{
            this.vertices.add(new draw2d.geo.Point(x,y));
        }
        this.end = this.vertices.last().clone();
        if(this.isInDragDrop===false)
            this.calculatePath({startMoved:false, endMoved:true});
        this.repaint();
        var _this = this;
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                e.moved(_this.canvas, _this);
            }
        });
        this.fireEvent("change:end",{value:this.end});
        return this;
    },
    addVertex: function(x, y)
    {
        this.vertices.add(new draw2d.geo.Point(x,y));
        this.start=this.vertices.first().clone();
        this.end=this.vertices.last().clone();
        this.svgPathString = null;
        this.repaint();
        if(!this.selectionHandles.isEmpty()){
            var _this = this;
            this.editPolicy.each(function(i, e) {
                if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
                    e.onUnselect(_this.canvas, _this);
                    e.onSelect(_this.canvas, _this);
                }
            });
        }
        this.fireEvent("change:vertices",{value:this.vertices});
        return this;
    },
    insertVertexAt: function(index, x, y)
    {
        var vertex = new draw2d.geo.Point(x,y);
        this.vertices.insertElementAt(vertex,index);
        this.start=this.vertices.first().clone();
        this.end=this.vertices.last().clone();
        this.svgPathString = null;
        this.repaint();
        if(!this.selectionHandles.isEmpty()){
            var _this = this;
	        this.editPolicy.each(function(i, e) {
	            if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
	                e.onUnselect(_this.canvas, _this);
	                e.onSelect(_this.canvas, _this);
	            }
	        });
        }
        this.fireEvent("change:vertices",{value:this.vertices});
        return this;
    },
    removeVertexAt: function(index)
    {
        var removedPoint = this.vertices.removeElementAt(index);
        this.start=this.vertices.first().clone();
        this.end=this.vertices.last().clone();
        this.svgPathString = null;
        this.repaint();
        if(!this.selectionHandles.isEmpty()){
            var _this = this;
	        this.editPolicy.each(function(i, e) {
	            if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
	                e.onUnselect(_this.canvas, _this);
	                e.onSelect(_this.canvas, _this);
	            }
	        });
        }
        this.fireEvent("change:vertices",{value:this.vertices});
        return removedPoint;
    },
    setRouter: function(router)
    {
      if(this.router !==null){
          this.router.onUninstall(this);
      }
      if(typeof router ==="undefined" || router===null){
          this.router = new draw2d.layout.connection.DirectRouter();
      }
      else{
          this.router = router;
      }
      this.router.onInstall(this);
      this.routingRequired =true;
      this.repaint();
      this.fireEvent("change:router",{value:this.router});
      return this;
    },
    getRouter: function()
    {
      return this.router;
    },
    calculatePath: function(routingHints)
    {
        routingHints = routingHints ||{};
        if(this.shape===null){
            return;
        }
        this.svgPathString = null;
        routingHints.oldVertices = this.vertices;
        this.oldPoint=null;
        this.lineSegments = new draw2d.util.ArrayList();
        this.vertices     = new draw2d.util.ArrayList();
        this.router.route(this, routingHints);
        this.routingRequired=false;
        this.fireEvent("routed");
        this.fireEvent("change:route",{});
     },
    repaint: function(attributes)
    {
        if(this.repaintBlocked===true || this.shape===null){
          return this;
        }
        if(this.svgPathString===null || this.routingRequired===true){
          this.calculatePath();
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        attributes.path=this.svgPathString;
        draw2d.util.JSON.ensureDefault(attributes,"stroke-linecap" , "round");
        draw2d.util.JSON.ensureDefault(attributes,"stroke-linejoin", "round");
        return this._super( attributes);
    },
    getSegments: function()
    {
        return this.lineSegments;
    },
    addPoint: function( p, y)
    {
      if(typeof y!=="undefined"){
          p = new draw2d.geo.Point(p, y);
      }
      this.vertices.add(p);
      if(this.oldPoint!==null){
        this.lineSegments.add({
            start: this.oldPoint,
            end:p
        });
      }
      this.svgPathString=null;
      this.oldPoint = p;
    },
    onDragStart: function(x, y, shiftKey, ctrlKey, isFaked )
    {
        var result = this._super(x,y,shiftKey, ctrlKey, isFaked);
        if(result===true && isFaked!==true){
            this.draggedSegment =  this.hitSegment(x,y);
        }
        return result;
    },
    getLength: function()
    {
        var result = 0;
        for(var i = 0; i< this.lineSegments.getSize();i++) {
            var segment = this.lineSegments.get(i);
            var p1 = segment.start;
            var p2 = segment.end;
            result += Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
        }
        return result;
    },
    setVertices: function(vertices)
    {
        this.router.verticesSet(this);
        this._super(vertices);
    },
    pointProjection: function( px, py)
    {
        var result=null,
            projection=null,
            p1=null,
            p2 = null,
            segment=null;
        var lastDist = Number.MAX_SAFE_INTEGER;
        var pt = new draw2d.geo.Point(px,py);
        for(var i = 0; i< this.lineSegments.getSize();i++) {
            segment = this.lineSegments.get(i);
            p1 = segment.start;
            p2 = segment.end;
            projection= draw2d.geo.Line.pointProjection(p1.x,p1.y,p2.x,p2.y,pt.x,pt.y);
            if(projection!==null) {
                var dist = projection.distance(pt);
                if (result == null || dist < lastDist) {
                    result = projection;
                    result.index=i;
                    lastDist = dist;
                }
            }
        }
        if (result !== null) {
            var length = 0;
            var segment;
            for(var i = 0; i< result.index;i++) {
                segment = this.lineSegments.get(i);
                length += segment.start.distance(segment.end);
            }
            segment = this.lineSegments.get(result.index);
            p1 = segment.start;
            p2 = segment.end;
            length +=  p1.distance(p2)*draw2d.geo.Line.inverseLerp(p2.x,p2.y,p1.x,p1.y,result.x,result.y);
            result.percentage=(1.0/this.getLength())*length;
        }
        return result;
    },
    lerp: function(percentage)
    {
        var length = this.getLength()*percentage;
        var lastValidLength=length;
        var segment=null,p1=null,p2=null;
        for(var i = 0; i< this.lineSegments.getSize();i++) {
            segment = this.lineSegments.get(i);
            p1 = segment.start;
            p2 = segment.end;
            length = length-p1.distance(p2);
            if(length<=0){
                percentage = 1.0/p1.distance(p2)*lastValidLength;
                return new draw2d.geo.Point(p1.x+(p2.x-p1.x)*percentage,p1.y+(p2.y-p1.y)*percentage)
            }
            lastValidLength=length;
        }
        return p2;
    },
     hitSegment: function( px, py)
     {
       for(var i = 0; i< this.lineSegments.getSize();i++){
          var segment = this.lineSegments.get(i);
          if(draw2d.shape.basic.Line.hit(this.corona+this.stroke, segment.start.x,segment.start.y,segment.end.x, segment.end.y, px,py)){
            return {index: i, start:segment.start, end: segment.end};
          }
       }
       return null;
     },
    hitTest: function( px, py)
    {
      return this.hitSegment(px,py) !== null;
    },
    createCommand: function(request)
    {
      if(request.getPolicy() === draw2d.command.CommandType.DELETE){
        if(this.isDeleteable()===true){
          return new draw2d.command.CommandDelete(this);
        }
      }
      else if(request.getPolicy() === draw2d.command.CommandType.MOVE_VERTEX){
          if(this.isResizeable()===true){
              return new draw2d.command.CommandMoveVertex(this);
            }
      }
      else if(request.getPolicy() === draw2d.command.CommandType.MOVE_VERTICES){
          if(this.isResizeable()===true){
              return new draw2d.command.CommandMoveVertices(this);
            }
      }
      return this._super(request);
    },
    getPersistentAttributes: function()
    {   
        var memento=  $.extend( this._super() ,{
            router : this.router.NAME,
            radius : this.radius
        });
        memento = this.router.getPersistentAttributes(this, memento);
        return memento;
    },
    setPersistentAttributes: function(memento)
    {
        this._super(memento);
        if(typeof memento.router !=="undefined"){
            try{
                this.setRouter(eval("new "+memento.router+"()"));
            }
            catch(exc){
                debug.warn("Unable to install router '"+memento.router+"' forced by "+this.NAME+".setPersistendAttributes. Using default");
            }
        }
        if(typeof memento.radius !=="undefined"){
            this.setRadius(memento.radius);
        }
        this.router.setPersistentAttributes(this, memento);
        if(this.vertices.getSize()>1) {
            this.start = this.vertices.first().clone();
            this.end = this.vertices.last().clone();
        }
    }
});
draw2d.shape.basic.Image = draw2d.shape.node.Node.extend({
    NAME : "draw2d.shape.basic.Image",
    init: function(attr, setter, getter)
    {
        this._super(attr, 
        $.extend({
            path  : this.setPath
        }, setter),
        $.extend({
            path : this.getPath
        }, getter));
    },
    setPath: function(path){
        this.path = path;
        if(this.shape!==null){
            this.shape.attr({src:this.path});
        }
        this.fireEvent("change:path",{value:this.path});
        return this;
    },
    getPath: function()
    {
        return this.path;
    },
    repaint: function(attributes)
    {
        if (this.repaintBlocked===true || this.shape === null){
            return this;
        }
        attributes= attributes || {};
        attributes.x = this.getAbsoluteX();
        attributes.y = this.getAbsoluteY();
        attributes.width = this.getWidth();
        attributes.height = this.getHeight();
        attributes.src = this.path;
        $(this.shape.node).css({ display: "inline-block", "width":attributes.width, "height":attributes.height});
        this._super(attributes);
        return this;
    },
    createShapeElement: function()
    {
       return this.canvas.paper.image(this.path,this.getX(),this.getY(),this.getWidth(), this.getHeight());
    },
    getPersistentAttributes: function()
    {
        return $.extend( this._super(),{
            path : this.path
        });
    },
    setPersistentAttributes: function(memento)
    {
        this._super(memento);
        if(typeof memento.path !=="undefined"){
            this.setPath(memento.path);
        }
    }
});
draw2d.shape.basic.Polygon = draw2d.VectorFigure.extend({
    NAME: "draw2d.shape.basic.Polygon",
    init: function(attr, setter, getter )
    {
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
        this.vertices   = new draw2d.util.ArrayList();
        this._super(attr, setter, getter);
        if(this.vertices.getSize()===0){
            var w= this.width;
            var h= this.height;
            var pos= this.getPosition();
            this.addVertex(new draw2d.geo.Point(0,0) );
            this.addVertex(new draw2d.geo.Point(w,0) );
            this.addVertex(new draw2d.geo.Point(w,h) );
            this.setPosition(pos);
        }
        this.svgPathString=null;
        this.installEditPolicy(new draw2d.policy.figure.VertexSelectionFeedbackPolicy());
    },
     setRadius: function(radius)
     {
        this.svgPathString =null;
        this._super(radius);
        this.fireEvent("change:radius",{value:radius});
        return this;
    },
    createShapeElement: function()
    {
        return this.canvas.paper.path("M0 10L100 100");
    },
    calculatePath: function()
    {
        var radius = this.getRadius();
        var path = [];
        if(radius === 0){
            var length = this.vertices.getSize();
            var p = this.vertices.get(0);
            path.push("M",p.x," ", p.y);
            for(var i=1;i<length;i++){
                  p = this.vertices.get(i);
                  path.push("L", p.x, " ", p.y);
            }
            path.push("Z");
        }
        else{
            length = this.vertices.getSize();
            var start = this.vertices.first();
            var end   = this.vertices.last();
            if(start.equals(end)){
                length = length-1;
                end = this.vertices.get(length-1);
            }
            var begin   = draw2d.geo.Util.insetPoint(start,end, radius);
            path.push("M", begin.x, ",", begin.y);
            for( var i=0 ;i<length;i++){
                  start = this.vertices.get(i);
                  end   = this.vertices.get((i+1)%length);
                  modStart = draw2d.geo.Util.insetPoint(start,end, radius);
                  modEnd   = draw2d.geo.Util.insetPoint(end,start,radius);
                  path.push("Q",start.x,",",start.y," ", modStart.x, ", ", modStart.y);
                  path.push("L", modEnd.x, ",", modEnd.y);
            }
        }
        this.svgPathString = path.join("");
        return this;
    },
    repaint: function(attributes)
    {
        if(this.repaintBlocked===true || this.shape===null){
            return;
        }
        if(this.svgPathString===null){
            this.calculatePath();
        }
        attributes= attributes || {};
        draw2d.util.JSON.ensureDefault(attributes,"path" ,this.svgPathString);
        this._super(attributes);
    },
    translate: function(dx , dy )
    {
        var _this = this;
        dx = this.x+dx;
        dy = this.y+dy;
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                var newPos = e.adjustPosition(_this,dx,dy);
                dx = newPos.x;
                dy = newPos.y;
            }
        });
        dx = dx-this.x;
        dy = dy-this.y;
        this.vertices.each(function(i,e){
            e.translate(dx,dy);
        });
        this.svgPathString = null;
        this.updateBoundingBox();
        this.repaint();
        this.editPolicy.each(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(_this.canvas, _this);
            }
        });
        this.fireEvent("move",{figure:this, dx:dx, dy:dy});
        this.fireEvent("change:x",{value:this.x});
        this.fireEvent("change:y",{value:this.y});
        return this;
    },
    setPosition: function(x, y)
    {
        if (x instanceof draw2d.geo.Point) {
            y = x.y;
            x = x.x;
        }
        this.svgPathString = null;
        var dx = x-this.minX;
        var dy = y-this.minY;
        this.translate(dx,dy);
        this.x = x;
        this.y = y;
        return this;
    },
    setDimension: function(w, h)
    {
        var oldWidth = this.width;
        var oldHeight= this.height;
        this._super(w,h);
        var fracWidth  = (1/oldWidth)*this.width;
        var fracHeight = (1/oldHeight)*this.height;
        var thisX = this.x;
        var thisY = this.y;
        this.vertices.each(function(i,e){
            var diffX = (e.getX()-thisX)*fracWidth;
            var diffY = (e.getY()-thisY)*fracHeight;
            e.setPosition(thisX+diffX,thisY+diffY);
        });
        this.svgPathString = null;
        this.repaint();
        this.fireEvent("change:dimension",{value:{width:this.width, height:this.height}});
        return this;
    },
    getVertices: function()
    {
        return this.vertices;
    },
    getVertex: function( index)
    {
        return this.vertices.get(index);
    },
    resetVertices: function()
    {
        this.vertices = new draw2d.util.ArrayList();
        this.svgPathString = null;
        this.repaint();
        this.updateBoundingBox();
        var _this = this;
        this.editPolicy.each(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(_this.canvas, _this);
            }
        });
    },
    setVertex: function(index, x, y)
    {
        var vertex = this.vertices.get(index);
        if (vertex === null || (vertex.x === x && vertex.y === y)) {
            return this;
        }
        vertex.x = parseFloat(x);
        vertex.y = parseFloat(y);
        this.svgPathString = null;
        this.repaint();
        this.updateBoundingBox();
        var _this = this;
        this.editPolicy.each(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(_this.canvas, _this);
            }
        });
        this.fireEvent("change:vertices",{value:this.vertices});
        return this;
    },
    addVertex: function( x, y)
    {
        this.vertices.add(new draw2d.geo.Point(x,y));
        this.svgPathString = null;
        this.repaint();
        this.updateBoundingBox();
        var _this = this;
        this.editPolicy.each(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(_this.canvas, _this);
            }
        });
        this.fireEvent("change:vertices",{value:this.vertices});
        return this;
    },
    insertVertexAt: function(index, x, y)
    {
        this.vertices.insertElementAt(new draw2d.geo.Point(x,y),index);
        this.svgPathString = null;
        this.repaint();
        this.updateBoundingBox();
        if(!this.selectionHandles.isEmpty()){
            var _this = this;
	        this.editPolicy.each(function(i, e) {
	            if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
	                e.onUnselect(_this.canvas, _this);
	                e.onSelect(_this.canvas, _this);
	            }
	        });
        }
        this.fireEvent("change:vertices",{value:this.vertices});
        return this;
    },
    removeVertexAt: function(index)
    {
        if(this.vertices.getSize()<=3){
            return null;
        }
        var vertex = this.vertices.removeElementAt(index);
        this.svgPathString = null;
        this.repaint();
        this.updateBoundingBox();
        if(!this.selectionHandles.isEmpty()){
            var _this = this;
	        this.editPolicy.each(function(i, e) {
	            if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
	                e.onUnselect(_this.canvas, _this);
	                e.onSelect(_this.canvas, _this);
	            }
	        });
        }
        this.fireEvent("change:vertices",{value:this.vertices});
        return vertex;
    },
    setRotationAngle: function(angle)
    {
        this.rotationAngle = 360%angle;
        var radian =  angle / (180/Math.PI);
        var center = this.getBoundingBox().getCenter();
        var rotate = function(x, y, xm, ym, radian) {
            var cos = Math.cos,
                sin = Math.sin;
                return {x: (x - xm) * cos(radian) - (y - ym) * sin(radian)   + xm,
                        y: (x - xm) * sin(radian) + (y - ym) * cos(radian)   + ym};
        };
        this.vertices.each(function(i,e){
            var rot =rotate(e.x,e.y,center.x,center.y,radian);
            e.setPosition(rot.x,rot.y);
        });
        this.updateBoundingBox();
        var _this = this;
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                e.moved(_this.canvas, _this);
            }
        });
        this.repaint();
        this.fireEvent("change:angle",{value:this.rotationAngle});
        return this;
    },
    updateBoundingBox: function()
    {
        if(this.vertices.isEmpty()){
            this.minX = this.x;
            this.minY = this.y;
            this.maxX = this.x+this.width;
            this.maxY = this.y+this.height;
        }
        else{
            this.minX = this.x= Math.min.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.x;}));
            this.minY = this.y= Math.min.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.y;}));
            this.maxX = Math.max.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.x;}));
            this.maxY = Math.max.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.y;}));
            this.width = this.maxX - this.minX;
            this.height= this.maxY - this.minY;
        }
    },
    createCommand: function(request)
    {
      if(request.getPolicy() === draw2d.command.CommandType.MOVE_VERTEX){
          if(this.isResizeable()===true){
              return new draw2d.command.CommandMoveVertex(this);
            }
      }
      return this._super(request);
    },
    getPersistentAttributes: function()
    {   
        var memento = this._super();
        memento.vertices = [];
        this.vertices.each(function(i,e){
            memento.vertices.push({x:e.x, y:e.y});
        });
        return memento;
    },
    setPersistentAttributes: function( memento)
    {
        this._super(memento);
        if(typeof memento.vertices !=="undefined"){
            this.vertices = new draw2d.util.ArrayList();
            var _this = this;
            $.each(memento.vertices, function(i,point){
                _this.addVertex(point);
            });
        }
    }
});
draw2d.shape.composite.Composite = draw2d.SetFigure.extend({
    NAME : "draw2d.shape.composite.Composite",
    init: function( attr, setter, getter) 
    {
      this._super($.extend({stroke:1,"color": "#f0f0f0"},attr), setter, getter);
    },
    onDoubleClick: function()
    {
    },
    isMemberSelectable: function( figure, selectable)
    {
        return selectable;
    },
    isMemberDraggable: function( figure, draggable)
    {
        return draggable;
    },
    setCanvas: function( canvas ) 
    {
        this._super(canvas);
        if(canvas!==null){
            this.toBack();
        }
    }
});
draw2d.shape.composite.StrongComposite = draw2d.shape.composite.Composite.extend({
    NAME : "draw2d.shape.composite.StrongComposite",
    init: function( attr, setter, getter) 
    {
        this.assignedFigures = new draw2d.util.ArrayList();
        this._super(attr, setter, getter);
    },
    contains: function(containedFigure)
    {
        for(var i= 0,len=this.assignedFigures.getSize(); i<len;i++){
            var child = this.assignedFigures.get(i);
            if(child===containedFigure || child.contains(containedFigure)) {
                return true;
            }
        }
        return this._super(containedFigure);
    },
    assignFigure: function(figure)
    {
        return this;
    },
    unassignFigure: function(figure)
    {
        return this;
    },
    getAssignedFigures: function()
    {
        return this.assignedFigures;
    },
    onDrop: function(dropTarget, x, y, shiftKey, ctrlKey)
    {
    },
    onCatch: function(droppedFigure, x, y, shiftKey, ctrlKey)
    {
    },
     toFront: function(figure)
     {
         this._super(figure);
         var figures = this.getAssignedFigures().clone();
         figures.sort(function(a,b){
             return a.getZOrder()>b.getZOrder()?-1:1;
         });
         var _this = this;
         figures.each(function(i,f){
             f.toFront(_this);
         });
         return this;
     },
     toBack: function(figure)
     {
         this._super(figure);
         var figures = this.getAssignedFigures().clone();
         figures.sort(function(a,b){
             return a.getZOrder()>b.getZOrder()?-1:1;
         });
         var _this = this;
         figures.each(function(i,f){
             f.toBack(_this);
         });
         return this;
     }     
});
draw2d.shape.composite.Group = draw2d.shape.composite.StrongComposite.extend({
    NAME : "draw2d.shape.composite.Group",
    init: function( attr, setter, getter) 
    {
        this._super($.extend({bgColor:null, color:null, resizeable:false},attr), setter, getter);
        this.stickFigures = false;
    },
    isMemberSelectable: function( figure, selectable)
    {
        return false;
    },
    isMemberDraggable: function( figure, draggable)
    {
        return false;
    },
    setPosition: function(x, y)
    {
        var oldX = this.x;
        var oldY = this.y;
        this._super(x,y);
        var dx = this.x-oldX;
        var dy = this.y-oldY;
        if(dx ===0 && dy===0 ){
            return this;
        }
        if(this.stickFigures===false){
            this.assignedFigures.each(function(i,figure){
                figure.translate(dx,dy);
            });
        }
        return this;
    },
    assignFigure: function(figure)
    {
        if(!this.assignedFigures.contains(figure)){
            var _this = this;
            this.stickFigures=true;
            if(this.assignedFigures.isEmpty()===true){
                this.setBoundingBox(figure.getBoundingBox());
            }
            else{
                this.setBoundingBox(this.getBoundingBox().merge(figure.getBoundingBox()));
            }
            this.assignedFigures.add(figure);
            figure.setComposite(this);
            figure.setSelectionAdapter(function(){
                return _this;
            });
            this.stickFigures=false;
        }
        return this;
    },
    unassignFigure: function(figure)
    {
        if(this.assignedFigures.contains(figure)){
            this.stickFigures=true;
            figure.setComposite(null);
            figure.setSelectionAdapter(null);
            this.assignedFigures.remove(figure);
            if(!this.assignedFigures.isEmpty()){
                var box = this.assignedFigures.first().getBoundingBox();
                this.assignedFigures.each(function(i,figure){
                    box.merge(figure.getBoundingBox());
                });
                this.setBoundingBox(box);
            }
            this.stickFigures=false;
        }
        return this;
    },
    createCommand: function( request)
    {
        if(request===null){
            return null;
        }
        if(request.getPolicy() === draw2d.command.CommandType.DELETE)
        {
            if(!this.isDeleteable()){
                return null;
            }
            return new draw2d.command.CommandDeleteGroup(this);
        }
        return this._super(request);
    }
});
draw2d.shape.composite.Jailhouse = draw2d.shape.composite.StrongComposite.extend({
    NAME : "draw2d.shape.composite.Jailhouse",
    init: function( attr, setter, getter) 
    {
      this.policy = new draw2d.policy.figure.RegionEditPolicy(0,0,10,10);
      this._super($.extend({bgColor:"#f0f0f0",color:"#333333"},attr), setter, getter);
      this.stickFigures = false;
    },
    setDimension: function(w, h)
    {
        this._super(w,h);
        this.policy.setBoundingBox(this.getAbsoluteBounds());
    },
    setPosition: function(x, y)
    {
        var oldX = this.x;
        var oldY = this.y;
        this._super(x,y);
        var dx = this.x-oldX;
        var dy = this.y-oldY;
        if(dx ===0 && dy===0 ){
            return this;
        }
        this.policy.setBoundingBox(this.getAbsoluteBounds());
        if(this.stickFigures===false){
            this.assignedFigures.each(function(i,figure){
                figure.translate(dx,dy);
            });
        }
        return this;
    },
    assignFigure: function(figure)
    {
        if(!this.assignedFigures.contains(figure) && figure!==this){
            this.stickFigures=true;
            this.setBoundingBox(this.getBoundingBox().merge(figure.getBoundingBox()));
            this.assignedFigures.add(figure);
            figure.setComposite(this);
            figure.installEditPolicy(this.policy);
            figure.toFront(this);
            this.stickFigures=false;
        }
        return this;
    },
    unassignFigure: function(figure)
    {
        if(this.assignedFigures.contains(figure)){
            this.stickFigures=true;
            figure.setComposite(null);
            figure.uninstallEditPolicy(this.policy);
            this.assignedFigures.remove(figure);
            if(!this.assignedFigures.isEmpty()){
                var box = this.assignedFigures.first().getBoundingBox();
                this.assignedFigures.each(function(i,figure){
                    box.merge(figure.getBoundingBox());
                });
                this.setBoundingBox(box);
            }
            this.stickFigures=false;
        }
        return this;
    },
    onCatch: function(droppedFigure, x, y, shiftKey, ctrlKey)
    {
        this.getCanvas().getCommandStack().execute(new draw2d.command.CommandAssignFigure(droppedFigure, this));
    },
     getMinWidth: function()
     {
         var width=0;
         this.assignedFigures.each(function(i,figure){
             width = Math.max(width,figure.getBoundingBox().getRight());
         });
         return width-this.getAbsoluteX();
     },
     getMinHeight: function()
     {
         var height=0;
         this.assignedFigures.each(function(i,figure){
             height = Math.max(height,figure.getBoundingBox().getBottom());
         });
         return height-this.getAbsoluteY();
     }
});
draw2d.shape.composite.WeakComposite = draw2d.shape.composite.Composite.extend({
    NAME : "draw2d.shape.composite.WeakComposite",
    init: function( attr, setter, getter)
    {
       this._super(attr, setter, getter);
    }
});
draw2d.shape.composite.Raft = draw2d.shape.composite.WeakComposite.extend({
    NAME : "draw2d.shape.composite.Raft",
    init: function( attr, setter, getter)
    {
      this.aboardFigures = new draw2d.util.ArrayList();
      this._super($.extend({bgColor:"#f0f0f0", color:"#1B1B1B"},attr), setter, getter);
    },
    onDragStart: function(x, y, shiftKey, ctrlKey )
    {
        this._super(x,y,shiftKey,ctrlKey);
        this.aboardFigures=new draw2d.util.ArrayList();
        this.getAboardFigures(this.isInDragDrop);
        return true;
    },
    setPosition: function(x, y, dontApplyToChildren)
    {
        var oldX = this.x;
        var oldY = this.y;
        var aboardedFigures = (dontApplyToChildren)?draw2d.util.ArrayList.EMPTY_LIST:this.getAboardFigures(this.isInDragDrop===false);
        this._super(x,y);
        var dx = this.x-oldX;
        var dy = this.y-oldY;
        if(dx ===0 && dy===0 ){
            return this;
        }
        if(this.canvas!==null) {
            aboardedFigures = aboardedFigures.clone();
            this.canvas.getLines().each(function (i, line) {
                if (line instanceof draw2d.Connection) {
                    if (aboardedFigures.contains(line.getSource().getRoot()) && aboardedFigures.contains(line.getTarget().getRoot())) {
                        aboardedFigures.add(line);
                    }
                }
            });
        }
        aboardedFigures.each(function(i,figure){
            figure.translate(dx,dy);
        });
        return this;
    },
    onDrag: function( dx,  dy, dx2, dy2, shiftKey, ctrlKey)
    {
        var _this = this;
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                var newPos = e.adjustPosition(_this,_this.ox+dx,_this.oy+dy);
                if(newPos) {
                    dx = newPos.x - _this.ox;
                    dy = newPos.y - _this.oy;
                }
            }
        });
        var newPos = new draw2d.geo.Point(this.ox+dx, this.oy+dy);
        if(this.getCanSnapToHelper()){
            newPos = this.getCanvas().snapToHelper(this, newPos);
        }
        this.setPosition(newPos.x, newPos.y, shiftKey);
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                e.onDrag(_this.canvas, _this);
            }
        });
        this.fireEvent("drag",{dx:dx, dy:dy, dx2:dx2, dy2:dy2, shiftKey:shiftKey, ctrlKey:ctrlKey});
    },
    getAboardFigures: function(recalculate)
    {
        if(recalculate===true && this.canvas !==null){
            var raftBoundingBox = this.getBoundingBox();
            var zIndex = this.getZOrder();
            this.aboardFigures=new draw2d.util.ArrayList();
            var _this = this;
            this.getCanvas().getFigures().each(function(i,figure){
                if(figure !==_this && figure.isSelectable() === true && figure.getBoundingBox().isInside(raftBoundingBox)){
                    if(_this.getNextComposite(figure)!==_this){
                        return;
                    }
                    if(figure.getZOrder()> zIndex){
                        _this.aboardFigures.add(figure);
                    }
                }
            });
        }
        return this.aboardFigures;
    },
    getNextComposite: function(figureToTest)
    {
        var nextComposite = null;
        this.getCanvas().getFigures().each(function(i, figure){
            if(figureToTest === figure){
                return;
            }
            if(figure instanceof draw2d.shape.composite.Composite){
                if(nextComposite!==null && nextComposite.getZOrder() > figure.getZOrder()){
                    return;
                }
                if(figure.getBoundingBox().contains(figureToTest.getBoundingBox())){
                    nextComposite = figure;
                }
            }
        });
        return nextComposite;
    }
});
draw2d.Connection = draw2d.shape.basic.PolyLine.extend({
    NAME : "draw2d.Connection",
    init: function( attr, setter, getter)
    {
      this.sourcePort = null;
      this.targetPort = null;
      this.oldPoint=null;
      this.sourceDecorator = null; 
      this.targetDecorator = null; 
      this.sourceDecoratorNode = null;
      this.targetDecoratorNode=null;
      this.isMoving=false;
      var _this = this;
      this.moveListener = function( figure)
      {
          if(figure===_this.sourcePort){
            _this.setStartPoint(_this.sourcePort.getAbsoluteX(), _this.sourcePort.getAbsoluteY());
          }
          else{
            _this.setEndPoint(_this.targetPort.getAbsoluteX(), _this.targetPort.getAbsoluteY());
          }
       };
      this._super(
          $.extend({
              color: "#129CE4",
              stroke:2,
              radius:3
          },attr) ,
          $.extend({
              sourceDecorator : this.setSourceDecorator,
              targetDecorator : this.setTargetDecorator,
              source : this.setSource,
              target : this.setTarget
         },setter),
          $.extend({
              sourceDecorator: this.getSourceDecorator,
              targetDecorator: this.getTargetDecorator,
              source: this.getSource,
              target: this.getTarget
         },getter)
      );
   },
    disconnect: function()
    {
        if (this.sourcePort!== null) {
            this.sourcePort.off(this.moveListener);
            this.sourcePort.connections.remove(this);
            this.sourcePort.fireEvent("disconnect", {port: this.sourcePort, connection:this});
            if(this.canvas!==null){
                this.canvas.fireEvent("disconnect", {"port": this.sourcePort, "connection":this});
            }
            this.sourcePort.onDisconnect(this);
            this.fireSourcePortRouteEvent();
        }
        if (this.targetPort!== null) {
            this.targetPort.off(this.moveListener);
            this.targetPort.connections.remove(this);
            this.targetPort.fireEvent("disconnect", {port: this.targetPort, connection:this});
            if(this.canvas!==null){
                this.canvas.fireEvent("disconnect", {"port": this.targetPort, "connection":this});
            }
            this.targetPort.onDisconnect(this);
            this.fireTargetPortRouteEvent();
        }
    },
    reconnect: function()
    {
        if (this.sourcePort !== null) {
            this.sourcePort.on("move",this.moveListener);
            this.sourcePort.connections.add(this);
            this.sourcePort.fireEvent("connect", {port: this.sourcePort, connection:this});
            if(this.canvas!==null){
                this.canvas.fireEvent("connect", {"port": this.sourcePort, "connection":this});
            }
            this.sourcePort.onConnect(this);
            this.fireSourcePortRouteEvent();
        }
        if (this.targetPort !== null) {
            this.targetPort.on("move",this.moveListener);
            this.targetPort.connections.add(this);
            this.targetPort.fireEvent("connect", {port: this.targetPort, connection:this});
            if(this.canvas!==null){
                this.canvas.fireEvent("connect", {"port": this.targetPort, "connection":this});
            }
            this.targetPort.onConnect(this);
            this.fireTargetPortRouteEvent();
        }
        this.routingRequired =true;
        this.repaint();
    },
    isResizeable: function()
    {
        return this.isDraggable();
    },
    add: function(child, locator)
    {
        if(!(locator instanceof draw2d.layout.locator.ConnectionLocator)){
           throw "Locator must implement the class draw2d.layout.locator.ConnectionLocator"; 
        }
        this._super(child, locator);
    },
    setSourceDecorator: function( decorator)
    {
      this.sourceDecorator = decorator;
      this.routingRequired = true;
      if(this.sourceDecoratorNode!==null){
          this.sourceDecoratorNode.remove();
          this.sourceDecoratorNode=null;
      }
      this.repaint();
    },
    getSourceDecorator: function()
    {
      return this.sourceDecorator;
    },
    setTargetDecorator: function( decorator)
    {
      this.targetDecorator = decorator;
      this.routingRequired =true;
      if(this.targetDecoratorNode!==null){
          this.targetDecoratorNode.remove();
          this.targetDecoratorNode=null;
      }      
      this.repaint();
    },
    getTargetDecorator: function()
    {
      return this.targetDecorator;
    },
    calculatePath: function(routingHints)
    {
        if(this.sourcePort===null || this.targetPort===null){
            return this;
        }
        this._super(routingHints);
        if(this.shape!==null) {
            var z1 = this.sourcePort.getZOrder();
            var z2 = this.targetPort.getZOrder();
            z1 < z2 ? this.toBack(this.sourcePort) : this.toBack(this.targetPort);
        }
        return this;
    },
    repaint: function(attributes)
    {
      if(this.repaintBlocked===true || this.shape===null){
          return;
      }
      if(this.sourcePort===null || this.targetPort===null){
          return;
      }
      this._super(attributes);
        if(this.targetDecorator!==null && this.targetDecoratorNode===null){
	      	this.targetDecoratorNode= this.targetDecorator.paint(this.getCanvas().paper);
	    }
	    if(this.sourceDecorator!==null && this.sourceDecoratorNode===null){
	      	this.sourceDecoratorNode= this.sourceDecorator.paint(this.getCanvas().paper);
	    }
        var _this = this;
	    if(this.sourceDecoratorNode!==null){
	    	var start = this.getVertices().first();
	  	    this.sourceDecoratorNode.transform("r"+this.getStartAngle()+"," + start.x + "," + start.y +" t" + start.x + "," + start.y);
	  	    this.sourceDecoratorNode.attr({"stroke":"#"+this.lineColor.hex(), opacity:this.alpha});
            this.sourceDecoratorNode.forEach(function(shape){
                shape.node.setAttribute("class",_this.cssClass!==null?_this.cssClass:"");
            });
	    }
        if(this.targetDecoratorNode!==null){
	    	var end = this.getVertices().last();
            this.targetDecoratorNode.transform("r"+this.getEndAngle()+"," + end.x + "," + end.y+" t" + end.x + "," + end.y);
            this.targetDecoratorNode.attr({"stroke":"#"+this.lineColor.hex(), opacity:this.alpha});
            this.targetDecoratorNode.forEach(function(shape){
                shape.node.setAttribute("class",_this.cssClass!==null?_this.cssClass:"");
            });
        }
    },
    getAbsoluteX: function()
    {
        return 0;
    },
    getAbsoluteY: function()
    {
        return 0;
    },
    postProcess: function(postProcessCache)
    {
    	this.router.postProcess(this, this.getCanvas(), postProcessCache);
    },
    onDrag: function( dx, dy, dx2, dy2)
    {
        if(this.command ===null){
            return;
        }
        this.router.onDrag(this, dx, dy, dx2, dy2);
        this.command.updateVertices(this.getVertices().clone());
        var _this = this;
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                e.onDrag(_this.canvas, _this);
            }
        });
       this.svgPathString = null;
       this.repaint();
        this.editPolicy.each(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(_this.canvas, _this);
            }
        });
        this.fireEvent("move",{figure:this, dx:dx, dy:dx});
    },
    toFront: function(figure)
    {
        this._super(figure);
        if( this.shape!==null) {
            if (this.targetDecoratorNode !== null) {
                this.targetDecoratorNode.insertAfter(this.shape);
            }
            if (this.sourceDecoratorNode !== null) {
                this.sourceDecoratorNode.insertAfter(this.shape);
            }
        }
        return this;
    },
    toBack: function(figure )
    {
        this._super(figure);
        if( this.shape!==null) {
            if (this.targetDecoratorNode !== null) {
                this.targetDecoratorNode.insertAfter(this.shape);
            }
            if (this.sourceDecoratorNode !== null) {
                this.sourceDecoratorNode.insertAfter(this.shape);
            }
        }
        return this;
    },
    getStartPoint: function( refPoint)
     {
      if(this.isMoving===false){
          if(refPoint){
              return this.sourcePort.getConnectionAnchorLocation(refPoint, this);
          }
          return this.sourcePort.getConnectionAnchorLocation(this.targetPort.getConnectionAnchorReferencePoint(this), this);
      }
      return this._super();
     },
     getEndPoint: function(refPoint)
     {
      if(this.isMoving===false){
          if(refPoint){
              return this.targetPort.getConnectionAnchorLocation(refPoint, this);
          }
         return this.targetPort.getConnectionAnchorLocation(this.sourcePort.getConnectionAnchorReferencePoint(this), this);
      }
      return this._super();
     },
    setSource: function( port)
    {
      if(this.sourcePort!==null){
        this.sourcePort.off(this.moveListener);
        this.sourcePort.connections.remove(this);
        this.sourcePort.fireEvent("disconnect", {port: this.sourcePort, connection:this});
        if(this.canvas!==null){
            this.canvas.fireEvent("disconnect", {"port": this.sourcePort, "connection":this});
        }
        this.sourcePort.onDisconnect(this);
      }
      this.sourcePort = port;
      if(this.sourcePort===null){
        return;
      }
      this.routingRequired = true;
      this.fireSourcePortRouteEvent();
      this.sourcePort.connections.add(this);
      this.sourcePort.on("move",this.moveListener);
      if(this.canvas!==null){
          this.canvas.fireEvent("connect", {"port":this.sourcePort, "connection":this});
      }
      this.sourcePort.fireEvent("connect", {port: this.sourcePort, connection:this});
      this.sourcePort.onConnect(this);
      this.setStartPoint(port.getAbsoluteX(), port.getAbsoluteY());
      this.fireEvent("connect", {"port":this.sourcePort, "connection":this});
    },
    getSource: function()
    {
      return this.sourcePort;
    },
    setTarget: function( port)
    {
      if(this.targetPort!==null){
        this.targetPort.off(this.moveListener);
        this.targetPort.connections.remove(this);
        this.targetPort.fireEvent("disconnect", {port: this.targetPort, connection:this});
        if(this.canvas!==null){
            this.canvas.fireEvent("disconnect", {"port": this.targetPort, "connection":this});
        }
        this.targetPort.onDisconnect(this);
      }
      this.targetPort = port;
      if(this.targetPort===null){
        return;
      }
      this.routingRequired = true;
      this.fireTargetPortRouteEvent();
      this.targetPort.connections.add(this);
      this.targetPort.on("move",this.moveListener);
      if(this.canvas!==null){
         this.canvas.fireEvent("connect", {"port": this.targetPort, "connection":this});
      }
      this.targetPort.fireEvent("connect", {port: this.targetPort, connection:this});
      this.targetPort.onConnect(this);
      this.setEndPoint(port.getAbsoluteX(), port.getAbsoluteY());
      this.fireEvent("connect", {"port":this.targetPort, "connection":this});
    },
    getTarget: function()
    {
      return this.targetPort;
    },
    sharingPorts: function(other){
        return this.sourcePort== other.sourcePort ||
               this.sourcePort== other.targetPort ||
               this.targetPort== other.sourcePort ||
               this.targetPort== other.targetPort;
    },
    setCanvas: function( canvas )
    {
       if(this.canvas === canvas){
           return; 
       }
       var notiCanvas = this.canvas==null? canvas: this.canvas;
       this._super(canvas);
        if(canvas !==null &&  draw2d.Connection.DROP_FILTER === null ){
            draw2d.Connection.DROP_FILTER =  canvas.paper.createFilter();
            draw2d.Connection.DROP_FILTER.element.setAttribute("width",  "250%");
            draw2d.Connection.DROP_FILTER.element.setAttribute("height", "250%");
            draw2d.Connection.DROP_FILTER.createShadow(1,1,2, 0.3);
        }
        if(this.sourceDecoratorNode!==null){
           this.sourceDecoratorNode.remove();
           this.sourceDecoratorNode=null;
       }
       if(this.targetDecoratorNode!==null){
           this.targetDecoratorNode.remove();
           this.targetDecoratorNode=null;
       }
       if(this.canvas===null){
           if(this.sourcePort!==null){
               this.sourcePort.off(this.moveListener);
               notiCanvas.fireEvent("disconnect", {"port": this.sourcePort, "connection":this});
               this.sourcePort.onDisconnect(this);
           }
           if(this.targetPort!==null){
               this.targetPort.off(this.moveListener);
               notiCanvas.fireEvent("disconnect", {"port": this.targetPort, "connection":this});
               this.targetPort.onDisconnect(this);
           }
       }
       else{
           this.shape.items[0].filter(draw2d.Connection.DROP_FILTER);
           if(this.sourcePort!==null){
               this.sourcePort.on("move",this.moveListener);
               this.canvas.fireEvent("connect", {"port":this.sourcePort, "connection":this});
               this.sourcePort.onConnect(this);
           }
           if(this.targetPort!==null){
               this.targetPort.on("move",this.moveListener);
               this.canvas.fireEvent("connect", {"port": this.targetPort, "connection":this});
               this.targetPort.onConnect(this);
           }
       }
    },
    getStartAngle: function()
    {
    	if( this.lineSegments.getSize()===0){
    		return 0;
    	}
      var p1 = this.lineSegments.get(0).start;
      var p2 = this.lineSegments.get(0).end;
      if(this.router instanceof draw2d.layout.connection.SplineConnectionRouter)
      {
       p2 = this.lineSegments.get(5).end;
      }
      var length = Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
      var angle = -(180/Math.PI) *Math.asin((p1.y-p2.y)/length);
      if(angle<0)
      {
         if(p2.x<p1.x){
           angle = Math.abs(angle) + 180;
         }
         else{
           angle = 360- Math.abs(angle);
         }
      }
      else
      {
         if(p2.x<p1.x){
           angle = 180-angle;
         }
      }
      return angle;
    },
    getEndAngle: function()
    {
      if (this.lineSegments.getSize() === 0) {
        return 90;
      }
      var p1 = this.lineSegments.get(this.lineSegments.getSize()-1).end;
      var p2 = this.lineSegments.get(this.lineSegments.getSize()-1).start;
      if(this.router instanceof draw2d.layout.connection.SplineConnectionRouter)
      {
       p2 = this.lineSegments.get(this.lineSegments.getSize()-5).end;
      }
      var length = Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
      var angle = -(180/Math.PI) *Math.asin((p1.y-p2.y)/length);
      if(angle<0)
      {
         if(p2.x<p1.x){
           angle = Math.abs(angle) + 180;
         }
         else{
           angle = 360- Math.abs(angle);
         }
      }
      else
      {
         if(p2.x<p1.x){
           angle = 180-angle;
         }
      }
      return angle;
    },
    fireSourcePortRouteEvent: function()
    {
       this.sourcePort.getConnections().each(function(i,conn){
           conn.routingRequired = true;
           conn.repaint();
       });
    },
    fireTargetPortRouteEvent: function()
    {
       this.targetPort.getConnections().each(function(i,conn){
           conn.routingRequired = true;
           conn.repaint();
       });
    },
    createCommand: function( request)
    {
        if(request.getPolicy() === draw2d.command.CommandType.MOVE){
            if(this.isDraggable()){
                return new draw2d.command.CommandMoveVertices(this);
            }
        }
        if(request.getPolicy() === draw2d.command.CommandType.MOVE_BASEPOINT) {
          return new draw2d.command.CommandReconnect(this);
        }
        return this._super(request);
    },
    getPersistentAttributes: function()
    {
        var memento = this._super();
        var parentNode = this.getSource().getParent();
        while(parentNode.getParent()!==null){
        	parentNode = parentNode.getParent();
        }
        memento.source = {
                  node:parentNode.getId(),
                  port: this.getSource().getName()
                };
        var parentNode = this.getTarget().getParent();
        while(parentNode.getParent()!==null){
        	parentNode = parentNode.getParent();
        }
        memento.target = {
                  node:parentNode.getId(),
                  port:this.getTarget().getName()
                };
        if(this.sourceDecorator!==null){
            memento.source.decoration = this.sourceDecorator.NAME;
        }
        if(this.targetDecorator!==null){
            memento.target.decoration = this.targetDecorator.NAME;
        }
        return memento;
    },
    setPersistentAttributes: function(memento)
    {
        this._super(memento);
        if(typeof memento.target.decoration !=="undefined" && memento.target.decoration!=null){
            this.setTargetDecorator( eval("new "+memento.target.decoration));
        }
        if(typeof memento.source.decoration !=="undefined" && memento.source.decoration!=null){
            this.setSourceDecorator( eval("new "+memento.source.decoration));
        }
    }
});
draw2d.Connection.DROP_FILTER = null;
draw2d.VectorFigure = draw2d.shape.node.Node.extend({
    NAME : "draw2d.VectorFigure",
    init: function( attr, setter, getter)
    {
        this.stroke = 1;
        this.radius = 0;
        this.bgColor= new draw2d.util.Color("#ffffff");
        this.color  = new draw2d.util.Color("#303030");
        this.dasharray = null;
        this.strokeBeforeGlow = this.stroke;
        this.glowIsActive = false;
        this._super( attr, 
            $.extend({
                dasharray : this.setDashArray,
                radius : this.setRadius,
                bgColor: this.setBackgroundColor,
                color  : this.setColor,
                stroke : this.setStroke
            }, setter),
            $.extend({
               dasharray: this.getDashArray,
               radius :   this.getRadius,
               bgColor:   this.getBackgroundColor,
               color  :   this.getColor,
               stroke :   this.getStroke
            }, getter)
        );
    },
     setRadius: function(radius)
     {
        this.radius = radius;
        this.repaint();
        this.fireEvent("change:radius",{value:this.radius});
        return this;
    },
    getRadius: function()
    {
        return this.radius;
    },
    setDashArray: function(dashPattern)
    {
        this.dasharray = dashPattern;
        this.repaint();
        this.fireEvent("change:dashArray",{value:this.dasharray});
        return this;
    },
    getDashArray: function()
    {
        return this.dasharray;
    },
    setGlow: function(flag)
    {
        if(flag === this.glowIsActive) {
            return this;
        }
        this.glowIsActive = flag;
        if(flag===true){
            this.strokeBeforeGlow = this.getStroke();
            this.setStroke(this.strokeBeforeGlow*2.5);
        }
        else {
            this.setStroke(this.strokeBeforeGlow);
        }
        return this;
    },
    repaint: function(attributes)
    {
        if (this.repaintBlocked===true || this.shape === null){
            return;
        }
        attributes= attributes || {};
        attributes.x = this.getAbsoluteX();
        attributes.y = this.getAbsoluteY();
        if(typeof attributes.stroke==="undefined"){
            if(this.color === null || this.stroke ===0){
                attributes.stroke = "none";
            }
            else {
                attributes.stroke = this.color.hash();
            }
        }
        draw2d.util.JSON.ensureDefault(attributes,"stroke-width" , this.stroke);
        draw2d.util.JSON.ensureDefault(attributes,"fill" ,this.bgColor.hash());
        draw2d.util.JSON.ensureDefault(attributes,"dasharray" , this.dasharray);
        this._super(attributes);
        return this;
    },
    setBackgroundColor: function(color)
    {
        this.bgColor = new draw2d.util.Color(color);
        this.repaint();
        this.fireEvent("change:bgColor",{value:this.bgColor});
        return this;
    },
   getBackgroundColor: function()
   {
     return this.bgColor;
   },
   setStroke: function( w )
   {
     this.stroke=w;
     this.repaint();
     this.fireEvent("change:stroke",{value:this.stroke});
     return this;
   },
   getStroke: function( )
   {
     return this.stroke;
   },
   setColor: function( color)
   {
     this.color = new draw2d.util.Color(color);
     this.repaint();
     this.fireEvent("change:color",{value:this.color});
     return this;
   },
   getColor: function()
   {
     return this.color;
   },
   getPersistentAttributes: function()
   {
       var memento = $.extend(this._super(), {
           bgColor : this.bgColor.hash(),
           color   : this.color.hash(),
           stroke  : this.stroke,
           radius  : this.radius,
           dasharray : this.dasharray
       });
       return memento;
   },
   setPersistentAttributes: function(memento)
   {
       this._super(memento);
       if(typeof memento.radius !=="undefined"){
           this.setRadius(memento.radius);
        }
       if(typeof memento.bgColor !== "undefined"){
           this.setBackgroundColor(memento.bgColor);
       }
       if(typeof memento.color !== "undefined"){
           this.setColor(memento.color);
       }
       if(typeof memento.stroke !== "undefined" ){
           this.setStroke(memento.stroke===null?0:parseFloat(memento.stroke));
       }
       if(typeof memento.dasharray ==="string"){
           this.dasharray = memento.dasharray;
       }
       return this;
   }  
});
draw2d.ResizeHandle = draw2d.shape.basic.Rectangle.extend({
    NAME : "draw2d.ResizeHandle",
    init: function( figure , type) {
      this._super({bgColor:"#FDFDFD", stroke:0.5, color:"#a0a0a0", radius:1});
      this.isResizeHandle=true;
      this.owner = figure;
      this.type = type;
      this.command = null;
      this.commandMove=null;
      this.commandResize=null;
      this.useGradient = true; 
      this.setSelectable(false);
      this.setDimension(); 
    },
    getSnapToDirection: function()
    {
      switch(this.type)
      {
        case 1:
         return draw2d.SnapToHelper.NORTH_WEST;
        case 2:
         return draw2d.SnapToHelper.NORTH;
        case 3:
         return draw2d.SnapToHelper.NORTH_EAST;
        case 4:
         return draw2d.SnapToHelper.EAST;
        case 5:
         return draw2d.SnapToHelper.SOUTH_EAST;
        case 6:
         return draw2d.SnapToHelper.SOUTH;
        case 7:
         return draw2d.SnapToHelper.SOUTH_WEST;
        case 8:
         return draw2d.SnapToHelper.WEST;
        case 9:
         return draw2d.SnapToHelper.NSEW;
        default :
         return draw2d.SnapToHelper.EAST;
      }
    },
    createShapeElement: function()
    {
       var shape= this._super();
       shape.node.setAttribute("type",this.type);
       this.updateCursor(shape);
       return shape;
    },
    updateCursor: function(shape)
    {
        if(shape===null){
            return this;
        }
        if(this.isDraggable()===false){
            shape.attr({"cursor":"default"});
            return this;
        }
        switch(this.type)
        {
          case 1:
              shape.attr({"cursor":"nw-resize"});
              break;
          case 2:
              shape.attr({"cursor":"n-resize"});
              break;
          case 3:
              shape.attr({"cursor":"ne-resize"});
              break;
          case 4:
              shape.attr({"cursor":"e-resize"});
              break;
          case 5:
              shape.attr({"cursor":"se-resize"});
              break;
          case 6:
              shape.attr({"cursor":"s-resize"});
              break;
          case 7:
              shape.attr({"cursor":"sw-resize"});
              break;
          case 8:
              shape.attr({"cursor":"w-resize"});
              break;
          default:
              shape.attr({"cursor":"move"});
              break;
        }
        return this;
    },
    setDraggable: function(flag)
    {
      this._super(flag);
      this.updateCursor(this.shape);
      return this;
    },
    onDragStart: function(x, y, shiftKey, ctrlKey)
    {
        if (!this.isDraggable()) {
            return false;
        }
        this.ox = this.getAbsoluteX();
        this.oy = this.getAbsoluteY();
        this.commandMove = this.owner.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE));
        this.commandResize = this.owner.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.RESIZE));
        return true;
    },
    onDrag: function(dx, dy, dx2, dy2)
    {
        if (this.isDraggable() === false) {
            return;
        }
        var oldX = this.getAbsoluteX();
        var oldY = this.getAbsoluteY();
        this._super(dx, dy, dx2, dy2);
        var diffX = this.getAbsoluteX() - oldX;
        var diffY = this.getAbsoluteY() - oldY;
        var obj = this.owner;
        var objPosX   = obj.getAbsoluteX();
        var objPosY   = obj.getAbsoluteY();
        var objWidth  = obj.getWidth();
        var objHeight = obj.getHeight();
        var newX=null;
        var newY=null;
        var corrPos=null;
        switch(this.type) {
        case 1:
            obj.setDimension(objWidth - diffX, objHeight - diffY);
            newX=objPosX + (objWidth - obj.getWidth());
            newY=objPosY + (objHeight - obj.getHeight());
            obj.setPosition(newX, newY);
            break;
        case 2:
            obj.setDimension(objWidth, objHeight - diffY);
            newX= objPosX;
            newY= objPosY + (objHeight - obj.getHeight());
            obj.setPosition(newX, newY);
            break;
        case 3:
            obj.setDimension(objWidth + diffX, objHeight - diffY);
            newX= objPosX;
            newY= objPosY + (objHeight - obj.getHeight());
            obj.setPosition(newX, newY);
            break;
        case 4:
            obj.setDimension(objWidth + diffX, objHeight);
            break;
        case 5:
            obj.setDimension(objWidth + diffX, objHeight + diffY);
            break;
        case 6:
            obj.setDimension(objWidth, objHeight + diffY);
            break;
        case 7:
            obj.setDimension(objWidth - diffX, objHeight + diffY);
            newX=objPosX + (objWidth - obj.getWidth());
            newY=objPosY;
            obj.setPosition(newX, newY);
            break;
        case 8:
            obj.setDimension(objWidth - diffX, objHeight);
            newX = objPosX + (objWidth - obj.getWidth());
            newY = objPosY;
            obj.setPosition(newX, newY);
            break;
        }
        if(newX!==null){
            corrPos = obj.getPosition();
            if(corrPos.x!==newX || corrPos.y!==newY){
                obj.setDimension(obj.getWidth() - (corrPos.x-newX), obj.getHeight()- (corrPos.y-newY));
            }
        }
    },
    onDragEnd: function(x, y, shiftKey, ctrlKey)
    {
        if (!this.isDraggable()) {
            return;
        }
        if (this.commandMove !== null) {
            this.commandMove.setPosition(this.owner.getX(), this.owner.getY());
            this.canvas.getCommandStack().execute(this.commandMove);
            this.commandMove = null;
        }
        if (this.commandResize !== null) {
            this.commandResize.setDimension(this.owner.getWidth(), this.owner.getHeight());
            this.canvas.getCommandStack().execute(this.commandResize);
            this.commandResize = null;
        }
    },
    setPosition: function(x, y) {
        if (x instanceof draw2d.geo.Point) {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x;
            this.y = y;
        }
        if (this.repaintBlocked===true || this.shape === null){
            return this;
        }
        this.shape.attr({x:this.x, y:this.y});
    },
    setDimension: function(width, height)
    {
    	if(typeof height !=="undefined"){
    		this._super(width, height);
    	}
    	else{
	        if(draw2d.isTouchDevice){
	        	this._super(15,15);
	        }
	        else{
	        	this._super(8,8);
	        }
    	}
        var offset= this.getWidth();
        var offset2 = offset/2;
        switch(this.type)
        {
          case 1:
            this.setSnapToGridAnchor(new draw2d.geo.Point(offset,offset));
            break;
          case 2:
            this.setSnapToGridAnchor(new draw2d.geo.Point(offset2,offset));
            break;
          case 3:
            this.setSnapToGridAnchor(new draw2d.geo.Point(0,offset));
            break;
          case 4:
            this.setSnapToGridAnchor(new draw2d.geo.Point(0,offset2));
            break;
          case 5:
            this.setSnapToGridAnchor(new draw2d.geo.Point(0,0));
            break;
          case 6:
            this.setSnapToGridAnchor(new draw2d.geo.Point(offset2,0));
            break;
          case 7:
            this.setSnapToGridAnchor(new draw2d.geo.Point(offset,0));
            break;
          case 8:
            this.setSnapToGridAnchor(new draw2d.geo.Point(offset,offset2));
            break;
          case 9:
            this.setSnapToGridAnchor(new draw2d.geo.Point(offset2,offset2));
            break;
        }
        return this;
    },
    show: function(canvas)
    {
      this.setCanvas(canvas);
      if(canvas !==null &&  draw2d.ResizeHandle.DROP_FILTER === null ){
          draw2d.ResizeHandle.DROP_FILTER =  canvas.paper.createFilter();
          draw2d.ResizeHandle.DROP_FILTER.element.setAttribute("width",  "250%");
          draw2d.ResizeHandle.DROP_FILTER.element.setAttribute("height", "250%");
          draw2d.ResizeHandle.DROP_FILTER.createShadow(1,1,2, 0.3);
      }
      this.shape.filter(draw2d.ResizeHandle.DROP_FILTER);
      this.canvas.resizeHandles.add(this);
      this.shape.insertAfter(this.owner.getShapeElement());
      this.repaint();
      return this;
    },
    hide: function()
    {
      if(this.shape===null){
        return;
      }
      this.canvas.resizeHandles.remove(this);
      this.setCanvas(null);
      return this;
    },
     setBackgroundColor: function(color)
     {
         color = new draw2d.util.Color(color);
         this.bgGradient= "90-"+color.darker(0.2).hash()+"-"+color.hash();
         this._super(color);
         return this;
     },
     repaint: function(attributes)
     {
        if(this.repaintBlocked===true || this.shape===null){
            return;
        }
        attributes= attributes || {};
        if(this.bgColor.hash()==="none"){
            attributes.fill="none";
        }
        else if(this.getAlpha()<0.9 || this.useGradient===false){
            attributes.fill=this.bgColor.hash();
        }
        else{
            attributes.fill=this.bgGradient;
        }
        this._super(attributes);
    },
    supportsSnapToHelper: function()
    {
    	return true;
    },
    onKeyDown: function(keyCode, ctrl)
    {
      this.canvas.onKeyDown(keyCode,ctrl);
    },
    fireEvent: function(event, args)
    {
    }
});
draw2d.ResizeHandle.DROP_FILTER = null;
draw2d.shape.basic.LineResizeHandle = draw2d.shape.basic.Circle.extend({
    NAME : "draw2d.shape.basic.LineResizeHandle",
    init: function(figure, index)
    {
        this._super();
        this.owner = figure;
        this.index = index;
        this.isResizeHandle=true;
        if (draw2d.isTouchDevice) {
            this.setDimension(20, 20);
        }
        else {
            this.setDimension(10, 10);
        }
        this.setBackgroundColor("#5bcaff");
        this.setStroke(1);
        this.setSelectable(false);
        this.currentTarget = null;
    },
    createShapeElement: function()
    {
        var shape= this._super();
        shape.attr({"cursor":"move"});
        return shape;
     },
      setBackgroundColor: function(color)
      {
          color = new draw2d.util.Color(color);
          this.bgGradient= "r(.4,.3)"+color.hash()+"-"+color.darker(0.1).hash()+":60-"+color.darker(0.2).hash();
          this._super(color);
          this.setColor(color.darker(0.3));
          return this;
      },
    getRelatedPort: function()
    {
      return null;
    },
    getOppositePort: function()
    {
      return null;
    },
    repaint: function(attributes)
    {
        if(this.repaintBlocked===true || this.shape===null){
            return;
        }
        attributes= attributes || {};
        if(this.bgColor.hash()==="none"){
            attributes.fill=this.bgColor.hash();
        }
        else if(this.getAlpha()<0.9){
            attributes.fill=this.bgColor.hash();
        }
        else{
            attributes.fill=this.bgGradient;
        }
        this._super(attributes);
    },
    onDragStart: function(x, y, shiftKey, ctrlKey)
    {
        this.command = this.owner.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE_BASEPOINT));
        if(this.command !==null){
            this.command.setIndex(this.index);
        }
        this.setAlpha(0.2);
        this.shape.attr({"cursor":"crosshair"});
        this.fireEvent("dragstart",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        return true;
    },
    onDrag: function(dx, dy, dx2, dy2)
    {
        this.setPosition(this.x + dx2, this.y + dy2);
        var port = this.getOppositePort();
        var target = port!==null?port.getCanvas().getBestFigure(this.getX(), this.getY(), [this, this.owner]): null;
        if (target !== this.currentTarget) {
            if (this.currentTarget !== null) {
                this.currentTarget.onDragLeave(port);
                this.currentTarget.setGlow(false);
                this.currentTarget.fireEvent("dragLeave", {draggingElement:port});
            }
            if (target !== null) {
                this.currentTarget = target.delegateTarget(port);
                if(this.currentTarget!==null){
                    this.currentTarget.setGlow(true);
                    this.currentTarget.onDragEnter(port); 
                    this.currentTarget.fireEvent("dragEnter", {draggingElement:port});
                }
            }
        }
        return true;
    },
    onDragEnd: function( x, y, shiftKey, ctrlKey)
    {
        if (!this.isDraggable()) {
            return false;
        }
        this.shape.attr({"cursor":"move"});
        var port = this.getOppositePort();
        if (port !== null) {
            if (this.currentTarget !== null) {
                this.onDrop(this.currentTarget, x, y, shiftKey, ctrlKey);
                this.currentTarget.onDragLeave(port);
                this.currentTarget.setGlow(false);
                this.currentTarget.fireEvent("dragLeave", {draggingElement:port});
                this.currentTarget.onCatch(this, x, y, shiftKey, ctrlKey);
                this.currentTarget = null;
            }
        }
        this.owner.isMoving=false;
        if (this.owner instanceof draw2d.Connection) {
            if (this.command !== null) {
                this.command.cancel();
            }
        }
        else {
            if (this.command !== null) {
                this.getCanvas().getCommandStack().execute(this.command);
            }
        }
        this.command = null;
        this.setAlpha(1);
        this.fireEvent("dragend",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
    },
    relocate: function()
    {
        return this;
    },
    supportsSnapToHelper: function()
    {
      if(this.owner instanceof draw2d.Connection){
        return false;
      }
      return true;
    },
    show: function(canvas, x, y)
    {
      this.setCanvas(canvas);
      this.shape.toFront();
      this.canvas.resizeHandles.add(this);
    },
    hide: function()
    {
      if(this.shape===null){
        return;
      }
      this.canvas.resizeHandles.remove(this);
      this.setCanvas(null);
    },
    onKeyDown: function(keyCode, ctrl)
    {
      this.canvas.onKeyDown(keyCode,ctrl);
    }
});
draw2d.shape.basic.LineStartResizeHandle = draw2d.shape.basic.LineResizeHandle.extend({
    NAME : "draw2d.shape.basic.LineStartResizeHandle",
    init: function( figure)
    {
        this._super(figure, 0);
    },
    getRelatedPort: function()
    {
    	if(this.owner instanceof draw2d.Connection)
    		return this.owner.getSource();
    	return null;
    },
    getOppositePort: function()
    {
    	if(this.owner instanceof draw2d.Connection)
         return this.owner.getTarget();
    	return null;
    },
    onDrag: function( dx, dy, dx2, dy2)
    {
      this._super(dx, dy, dx2, dy2);
      var objPos = this.owner.getStartPoint();
      objPos.translate(dx2, dy2);
      if(this.command!==null) {
          this.command.updatePosition(objPos);
      }
      this.owner.setStartPoint(objPos);
      this.owner.isMoving = true;
      return true;
    },
    onDrop: function( dropTarget, x, y, shiftKey, ctrlKey)
    {
    	this.owner.isMoving=false;
      if(this.owner instanceof draw2d.Connection && this.command !==null) {
         this.command.setNewPorts(dropTarget, this.owner.getTarget());
         this.getCanvas().getCommandStack().execute(this.command);
      }
      this.command = null;
    },
    relocate: function()
    {
        var resizeWidthHalf = this.getWidth()/2;
        var resizeHeightHalf= this.getHeight()/2;
        var anchor   = this.owner.getStartPoint();
        this.setPosition(anchor.x-resizeWidthHalf,anchor.y-resizeHeightHalf);
        return this;
    }
});
draw2d.shape.basic.LineEndResizeHandle = draw2d.shape.basic.LineResizeHandle.extend({
    NAME : "draw2d.shape.basic.LineEndResizeHandle",
    init: function( figure)
    {
        this._super(figure, figure.getVertices().getSize()-1);
    },
    getRelatedPort: function()
    {
    	if(this.owner instanceof draw2d.Connection){
         return this.owner.getTarget();
    	}
    	return null;
    },
    getOppositePort: function()
    {
    	if(this.owner instanceof draw2d.Connection) {
         return this.owner.getSource();
    	}
    	return null;
    },
    onDrag: function( dx, dy, dx2, dy2)
    {
        this._super(dx,dy, dx2, dy2);
        var objPos = this.owner.getEndPoint().clone();
        objPos.translate(dx2, dy2);
        if(this.command!==null) {
            this.command.updatePosition(objPos);
        }
        this.owner.setEndPoint(objPos);
        this.owner.isMoving = true;
        return true;
    },
    onDrop: function( dropTarget, x, y, shiftKey, ctrlKey)
    {
    	this.owner.isMoving=false;
      if(this.owner instanceof draw2d.Connection && this.command !==null){
         this.command.setNewPorts(this.owner.getSource(),dropTarget);
         this.getCanvas().getCommandStack().execute(this.command);
      }
      this.command = null;
    },
    relocate: function(){
        var resizeWidthHalf = this.getWidth()/2;
        var resizeHeightHalf= this.getHeight()/2;
        var anchor   = this.owner.getEndPoint();
        this.setPosition(anchor.x-resizeWidthHalf,anchor.y-resizeHeightHalf);
        return this;
    }    
});
draw2d.shape.basic.VertexResizeHandle = draw2d.ResizeHandle.extend({
    NAME : "draw2d.shape.basic.VertexResizeHandle",
    SNAP_THRESHOLD   : 3,
    LINE_COLOR       : "#1387E6",
    FADEOUT_DURATION : 300,
    init: function( figure, index)
    {
        this._super(figure);
        this.index = index;
        this.isDead = false;
    },
    onDoubleClick: function()
    {
       	var cmd  = new draw2d.command.CommandRemoveVertex(this.owner, this.index );
        this.getCanvas().getCommandStack().execute(cmd);
        this.isDead = true;
    },
    onDragStart: function(x,y, shiftKey, ctrlKey)
    {
    	if(this.isDead===true){
    		return;
    	}
        this._super();
        this.command = this.getCanvas().getPrimarySelection().createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE_VERTEX));
        if(this.command!=null){
            this.command.setIndex(this.index);
            this.setAlpha(0.2);
            this.shape.attr({"cursor":"crosshair"});
        }
        this.vertex = this.owner.getVertex(this.index).clone();
        this.fireEvent("dragstart",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        return true;
    },
    onDrag: function(dx, dy, dx2, dy2)
    {
        if (this.isDead===true || this.command == null) {
            return;
        }
        this.setPosition(this.x+dx2, this.y+dy2);
        this.vertex.translate(dx2, dy2);
        var newPos = this.vertex.clone();
        if(this.getCanSnapToHelper()){
            newPos = this.getCanvas().snapToHelper(this, newPos);
        }
        this.owner.setVertex(this.index, newPos.x, newPos.y);
        this.command.updatePosition(this.vertex.x, this.vertex.y);
    },
    onDragEnd: function( x, y, shiftKey, ctrlKey)
    {
        if (this.isDead===true || this.command===null) {
            return;
        }
        this.shape.attr({"cursor":"move"});
        var stack = this.getCanvas().getCommandStack();
        stack.startTransaction();
        try{
	        stack.execute(this.command);
	        this.command = null;
	        var angle = this.getEnclosingAngle();
	        if(angle>178){
	           	var cmd  = new draw2d.command.CommandRemoveVertex(this.owner, this.index );
	            stack.execute(cmd);
	        }
        }
        finally{
        	stack.commitTransaction();
        }
        this.setAlpha(1);
        this.fireEvent("dragend",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
    },
    relocate: function()
    {
        var resizeWidthHalf = this.getWidth()/2;
        var resizeHeightHalf= this.getHeight()/2;
        var anchor = this.owner.getVertex(this.index);
  		this.setPosition(anchor.x-resizeWidthHalf,anchor.y-resizeHeightHalf);
    },
    getEnclosingAngle: function()
    {
        var points = this.owner.getVertices();
        var trans  = this.vertex.getScaled(-1);
        var size = points.getSize();
        var left   = points.get((this.index-1 +size)%size).translated(trans); 
        var right  = points.get((this.index+1)%size).translated(trans);       
        var dot = left.dot(right);
        var acos = Math.acos(dot/(left.length() * right.length()));
        return acos*180/Math.PI;
    }
});
draw2d.shape.basic.GhostVertexResizeHandle = draw2d.shape.basic.LineResizeHandle.extend({
    NAME : "draw2d.shape.basic.GhostVertexResizeHandle",
    init: function( figure, precursorIndex)
    {
        this.maxOpacity = 0.35;
        this._super(figure);
        this.precursorIndex = precursorIndex;
        this.setAlpha(this.maxOpacity);
    },
    createShapeElement: function()
    {
        var shape= this._super();
        shape.attr({"cursor":"pointer"});
        return shape;
     },
     setAlpha: function( percent)
     {
       percent = Math.min(this.maxOpacity,Math.max(0,parseFloat(percent)));
       this._super(percent);
       return this;
     },
    onClick: function()
    {
    	var cmd  = new draw2d.command.CommandAddVertex(this.owner, this.precursorIndex+1,this.getAbsoluteX() + this.getWidth()/2, this.getAbsoluteY() + this.getHeight()/2 );
        this.getCanvas().getCommandStack().execute(cmd);
    },
    onDragStart: function(x, y, shiftKey, ctrlKey)
    {
        return true;
    },
    onDrag: function(dx, dy, dx2, dy2)
    {
        return true;
    },
    onDragEnd: function(x, y, shiftKey, ctrlKey)
    {
        this.fireEvent("dragend",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        return true;
    },
    relocate: function()
    {
        var p1 = this.owner.getVertices().get(this.precursorIndex);
        var p2 = this.owner.getVertices().get(this.precursorIndex+1);
        var x = ((p2.x - p1.x) / 2 + p1.x - this.getWidth()/2);
        var y = ((p2.y - p1.y) / 2 + p1.y - this.getHeight()/2);
  		this.setPosition(x,y);
    }    
});
draw2d.Port = draw2d.shape.basic.Circle.extend({
    NAME : "draw2d.Port",
    DEFAULT_BORDER_COLOR:new draw2d.util.Color("#1B1B1B"),
    MAX_SAFE_INTEGER : 9007199254740991,
    init: function( attr, setter, getter)
    {
        var _this = this;
        this.locator = null;
        this.lighterBgColor =null;
        this.name = null;
        this._super($.extend({
                bgColor: "#4f6870",
                stroke:1,
                diameter:draw2d.isTouchDevice?25:10,
                color:"#1B1B1B",
                selectable:false
            },attr),
            setter,
            getter);
        this.ox = this.x;
        this.oy = this.y;
        this.coronaWidth = 5; 
        this.corona = null; 
        this.useGradient = true;
        this.preferredConnectionDirection = null;
        this.connections = new draw2d.util.ArrayList();
        this.moveListener = function( emitter, event){
            _this.repaint();
            _this.fireEvent("move",{figure:_this, dx:0, dy:0});
        };
        this.connectionAnchor = new draw2d.layout.anchor.ConnectionAnchor(this);
        this.value = null; 
        this.maxFanOut = this.MAX_SAFE_INTEGER;
        this.setCanSnapToHelper(false);
        this.editPolicy.each(function(i, policy){
            _this.uninstallEditPolicy(policy);
        });
        this.installEditPolicy(new draw2d.policy.port.IntrusivePortsFeedbackPolicy());
        this.portSelectionAdapter = function(){
            return _this;
        };
    },
    getSelectionAdapter: function()
    {
        return this.portSelectionAdapter;
    },
    setMaxFanOut: function(count)
    {
        this.maxFanOut = Math.max(1,count);
        this.fireEvent("change:maxFanOut", {value:this.maxFanOut});
        return this;
    },
    getMaxFanOut: function()
    {
        return this.maxFanOut;
    },
    setConnectionAnchor: function( anchor)
    {
        if(typeof anchor ==="undefined" || anchor===null){
    		anchor = new draw2d.layout.anchor.ConnectionAnchor( );
    	}
        this.connectionAnchor = anchor;
        this.connectionAnchor.setOwner(this);
        this.fireEvent("move",{figure:this, dx:0, dy:0});
        return this;
    },
    getConnectionAnchorLocation: function(referencePoint, inquiringConnection)
    {
    	return this.connectionAnchor.getLocation(referencePoint, inquiringConnection);
    },
    getConnectionAnchorReferencePoint: function(inquiringConnection)
    {
    	return this.connectionAnchor.getReferencePoint(inquiringConnection);
    },
    getConnectionDirection: function( peerPort)
    {
        if(typeof this.preferredConnectionDirection==="undefined" || this.preferredConnectionDirection===null){
            return this.getParent().getBoundingBox().getDirection(this.getAbsolutePosition());
        }
        return this.preferredConnectionDirection;
    },
    setConnectionDirection: function(direction)
    {
        this.preferredConnectionDirection = direction;
        this.fireEvent("move",{figure:this, dx:0, dy:0});
        return this;
    },
    setLocator: function(locator)
    {
        this.locator = locator;
        return this;
    },
    getLocator: function()
    {
        return this.locator;
    },
     setBackgroundColor: function(color)
     {
        this._super(color);
        this.lighterBgColor=this.bgColor.lighter(0.3).hash();
        return this;
     },
    setValue: function(value)
    {
        this.value = value;
        if(this.getParent()!==null){
           this.getParent().onPortValueChanged(this);
        }
        this.fireEvent("change:value", {value:this.value});
        return this;
    },
    getValue: function()
    {
        return this.value;
    },
     repaint: function(attributes)
     {
         if(this.repaintBlocked===true || this.shape===null){
             return;
         }
         attributes= attributes || {};
         attributes.cx = this.getAbsoluteX();
         attributes.cy = this.getAbsoluteY();
         attributes.rx = this.width/2;
         attributes.ry = attributes.rx;
         attributes.cursor = "move";
         if(this.getAlpha()<0.9 || this.useGradient===false){
             attributes.fill=this.bgColor.hash();
         }
         else{
             attributes.fill = ["90",this.bgColor.hash(),this.lighterBgColor].join("-");
         }
         this._super(attributes);
     },
    onMouseEnter: function()
    {
        this._oldstroke = this.getStroke();
        this.setStroke(2);
    },
    onMouseLeave: function()
    {
        this.setStroke(this._oldstroke);
    },
    getConnections: function()
    {
      return this.connections;
    },
    setParent: function(parent)
    {
        if(this.parent!==null){
            this.parent.off(this.moveListener);
        }
        this._super(parent);
        if(this.parent!==null) {
          this.parent.on("move",this.moveListener);
        }
    },
    getCoronaWidth: function()
    {
       return this.coronaWidth;
    },
    setCoronaWidth: function( width)
    {
       this.coronaWidth = width;
    },
    onDragStart: function(x, y, shiftKey, ctrlKey)
    {
        if(this.getConnections().getSize() >= this.maxFanOut){
            return false;
        }
        var _this = this;
        this.ox = this.x;
        this.oy = this.y;
         var canStartDrag = true;
         this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                canStartDrag = canStartDrag && e.onDragStart(_this.canvas, _this, x, y, shiftKey, ctrlKey);
            }
         });
         return canStartDrag;
    },
    onDrag: function(dx, dy, dx2, dy2)
    {
        this._super( dx, dy);
    },
    onDragEnd: function(x, y, shiftKey, ctrlKey)
    {
      this.setAlpha(1.0);
      this.setPosition(this.ox,this.oy);
    },
    onDrop: function(dropTarget, x, y, shiftKey, ctrlKey)
    {
    },
    onConnect: function(connection)
    {
    },
    onDisconnect: function(connection)
    {
    },
    getName: function()
    {
      return this.name;
    },
    setName: function( name)
    {
      this.name=name;
    },
    hitTest: function ( iX , iY, corona)
    {
        var x   = this.getAbsoluteX()-this.coronaWidth-this.getWidth()/2;
        var y   = this.getAbsoluteY()-this.coronaWidth-this.getHeight()/2;
        var iX2 = x + this.getWidth()  + (this.coronaWidth*2);
        var iY2 = y + this.getHeight() + (this.coronaWidth*2);
        return (iX >= x && iX <= iX2 && iY >= y && iY <= iY2);
    },
    setGlow: function( flag)
    {
      if(flag===true && this.corona===null)
      {
    	  this.corona = new draw2d.Corona();
    	  this.corona.setDimension(this.getWidth()+(this.getCoronaWidth()*2),this.getWidth()+(this.getCoronaWidth()*2));
          this.corona.setPosition(this.getAbsoluteX()-this.getCoronaWidth()-this.getWidth()/2, this.getAbsoluteY()-this.getCoronaWidth()-this.getHeight()/2);
          this.corona.setCanvas(this.getCanvas());
          this.corona.getShapeElement();
          this.corona.repaint();
      }
      else if(flag===false && this.corona!==null)
      {
    	  this.corona.setCanvas(null);
    	  this.corona = null;
      }
      return this;
    },
    createCommand: function(request)
    {
       if(request.getPolicy() === draw2d.command.CommandType.MOVE) {
         if(!this.isDraggable()){
            return null;
         }
         return new draw2d.command.CommandMovePort(this);
       }
       return null;
    },
    fireEvent: function(event, args)
    {
        if (this.isInDragDrop === true && event!=="drag") {
            return;
        }
        this._super(event,args);
    },
    getPersistentAttributes: function()
    {
       var memento= this._super();
        memento.maxFanOut = this.maxFanOut;
        memento.name      = this.name;
        delete memento.x;
        delete memento.y;
        delete memento.ports;
        return memento;
    },
    setPersistentAttributes: function(memento)
    {
        this._super(memento);
        if(typeof memento.maxFanOut !== "undefined"){
            if(typeof memento.maxFanOut ==="number"){
                this.maxFanOut = memento.maxFanOut;
            }
            else {
                this.maxFanOut = Math.max(1, parseInt(memento.maxFanOut));
            }
        }
        if(typeof memento.name !== "undefined") {
            this.setName( memento.name);
        }
        return this;
    }
});
draw2d.Corona = draw2d.shape.basic.Circle.extend({
    init: function()
    {
        this._super();
        this.setAlpha(0.3);
        this.setBackgroundColor(new  draw2d.util.Color(178,225,255));
        this.setColor(new draw2d.util.Color(102,182,252));
    },
    setAlpha: function(percent)
    {
        this._super(Math.min(0.3, percent));
        this.setDeleteable(false);
        this.setDraggable(false);
        this.setResizeable(false);
        this.setSelectable(false);
        return this;
    }
});
draw2d.InputPort = draw2d.Port.extend({
    NAME : "draw2d.InputPort",
    init: function( attr, setter, getter)
    {
        this._super( attr, setter, getter);
        this.locator=new draw2d.layout.locator.InputPortLocator();
    },
    createCommand: function( request)
    {
       if(request.getPolicy() === draw2d.command.CommandType.CONNECT)  {
           return new draw2d.command.CommandConnect(request.source, request.target, request.source, request.router);
       }
       return this._super(request);
    }
});
draw2d.OutputPort = draw2d.Port.extend({
    NAME : "draw2d.OutputPort",
    init: function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
        this.locator=new draw2d.layout.locator.OutputPortLocator();
    },
    createCommand: function(request)
    {
       if(request.getPolicy() === draw2d.command.CommandType.CONNECT){
           return new draw2d.command.CommandConnect(request.target, request.source, request.source, request.router);
       }
       return this._super(request);
    }
});
draw2d.HybridPort = draw2d.Port.extend({
    NAME : "draw2d.HybridPort",
    init: function(attr, setter, getter)
    {
        this._super(attr, setter, getter);
        this.locator=new draw2d.layout.locator.InputPortLocator();
    },
    createCommand: function(request)
    {
       if(request.getPolicy() === draw2d.command.CommandType.CONNECT) {
         if(request.source.getParent().getId() === request.target.getParent().getId()){
            return null;
         }    
         if (request.source instanceof draw2d.InputPort) {
            return new draw2d.command.CommandConnect(request.target, request.source, request.source, request.router);
         }
         else if (request.source instanceof draw2d.OutputPort) {
            return new draw2d.command.CommandConnect(request.source, request.target, request.source, request.router);
         }
         else if (request.source instanceof draw2d.HybridPort) {
            return new draw2d.command.CommandConnect(request.target,request.source, request.source, request.router);
         }
         return null;
       }
       return this._super(request);
    }
});
draw2d.layout.anchor.ConnectionAnchor = Class.extend({
    NAME : "draw2d.layout.anchor.ConnectionAnchor",
    init: function(owner)
    {
        this.owner = owner;
    },
    getLocation: function(reference, inquiringConnection)
    {
       return this.getReferencePoint(inquiringConnection);
    },
    getOwner: function()
    {
       return this.owner;
    },
    setOwner: function( owner)
    {
    	if(typeof owner ==="undefined"){
    		throw "Missing parameter for 'owner' in ConnectionAnchor.setOwner";
    	}
        this.owner=owner;
    },
    getBox: function()
    {
      return this.getOwner().getAbsoluteBounds();
    },
    getReferencePoint: function(inquiringConnection)
    {
       return this.getOwner().getAbsolutePosition();
    }
});
draw2d.layout.anchor.ChopboxConnectionAnchor = draw2d.layout.anchor.ConnectionAnchor.extend({
	NAME : "draw2d.layout.anchor.ChopboxConnectionAnchor",
	init: function(owner)
	{
		this._super(owner);
	},
	getLocation: function(reference, inquiringConnection)
	{
		var r = new draw2d.geo.Rectangle(0,0);
		r.setBounds(this.getBox());
		r.translate(-1, -1);
		r.resize(1, 1);
		var center = r.getCenter();
		if (r.isEmpty()	|| (reference.x === center.x && reference.y === center.y)){
			return center; 
		}
		var dx = reference.x - center.x;
		var dy = reference.y - center.y;
		var scale = 0.5 / Math.max(Math.abs(dx) / r.w, Math.abs(dy)	/ r.h);
		dx *= scale;
		dy *= scale;
		center.translate( dx, dy);
		return center;
	},
	getBox: function()
	{
		return this.getOwner().getParent().getBoundingBox();
	},
	getReferencePoint: function(inquiringConnection)
	{
		return this.getBox().getCenter();
	}
});
draw2d.shape.layout.Layout= draw2d.shape.basic.Rectangle.extend({
	NAME : "draw2d.shape.layout.Layout",
    init: function(attr, setter, getter )
    {
        this.padding = {top:0, right:0, bottom:0,left:0};
        this._super($.extend({bgColor:null, radius:0, stroke:0},attr),
            $.extend({
                padding  : this.setPadding
            }, setter),
            $.extend({
                padding  : this.getPadding
            }, getter));
        var _this = this;
        this.resizeListener = function(figure){
            if(_this.getParent() instanceof draw2d.shape.layout.Layout){
                _this.fireEvent("resize");
            }
            else {
                _this.setDimension(1,1);
                _this.fireEvent("resize");
            }
        };
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());
    },
    add: function(child, locator, index)
    {
       this._super(child, locator, index);
       child.on("resize",this.resizeListener);
       child.on("change:visibility", this.resizeListener);
       child.visible =  child.visible && this.visible;
       return this;
    },
    remove: function(child)
    {
       var r= this._super(child);
       child.off(this.resizeListener);
       this.setDimension(1,1);
       return r;
    },
    setPadding: function( padding)
    {
        if(typeof padding ==="number"){
            this.padding = {top:padding, right:padding, bottom:padding, left:padding};
        }
        else{
            $.extend(this.padding, padding);
        }
        this.fireEvent("change:padding",{value:this.padding});
        this.setDimension(1,1);
        return this;
    },
    getPadding: function( )
    {
        return this.padding;
    },
    setVisible: function(flag)
    {
        this.children.each(function(i,e){
            e.figure.setVisible(flag)
        });
        this._super(flag);
        this.setDimension(1,1);
        return this;
    },
    createCommand: function( request)
    {
        if(request.getPolicy() === draw2d.command.CommandType.ROTATE){
            return null;
        }
        return this._super(request);
    }
});
draw2d.shape.layout.HorizontalLayout= draw2d.shape.layout.Layout.extend({
	NAME : "draw2d.shape.layout.HorizontalLayout",
    init: function(attr, setter, getter)
    {
        this.gap = 0;
        var _this = this;
        this.locator ={ 
                translate: function(figure, diff){
                    figure.setPosition(figure.x+diff.x,figure.y+diff.y);
                },
                bind: function(){},
                unbind: function(){},
                relocate: function(index, target)
                {
                    var stroke = _this.getStroke();
                    var yPos = stroke+_this.padding.top;
                    var xPos = stroke+_this.padding.left; 
                    for (var i=0;i<index;i++){
                        var child = _this.children.get(i).figure;
                        if(child.isVisible()){
                            xPos += child.getWidth()+_this.gap;
                        }
                    }
                    target.setPosition(xPos,yPos);
                 }
        };
        this._super(
                $.extend({width:1, height:1, gap:0},attr),
                $.extend({
                    gap : this.setGap
                },setter),
                $.extend({
                    gap : this.getGap
                },getter));
   },
    add: function(child, locator, index)
    {
        this._super(child, this.locator, index);
        this.setDimension(1,1);
        return this;
    },
   setGap: function(gap)
   {
       this.gap = gap;
       this.setDimension(1,1);
       return this;
   },
   getGap: function()
   {
       return this.gap;
   },
    getMinWidth: function()
    {
        var _this = this;
        var width=this.stroke*2+this.padding.left+this.padding.right;
        var gap = 0;
        this.children.each(function(i,e){
            if(e.figure.isVisible()){
                width += (e.figure.isResizeable()?e.figure.getMinWidth():e.figure.getWidth()+gap);
                gap = _this.gap;
            }
        });
        return width;
    },
    getMinHeight: function()
    {
        var markup=(this.stroke*2)+this.padding.top+this.padding.bottom;
        var height=0;
        this.children.each(function(i,e){
            height = Math.max(height,(e.figure.isResizeable()? e.figure.getMinHeight(): e.figure.getHeight()));
        });
        return height+markup;
    },
    setDimension: function( w, h)
    {
        this._super(w,h);
        var diff = this.width-this.getMinWidth();
        if(diff>0){
            diff = (diff/this.children.getSize())|0;
            this.children.each(function(i,e){
                if(e.figure.isResizeable()===true){
                    e.figure.setDimension(e.figure.getMinWidth()+diff,e.figure.getHeight());
                }
            });
        }
        else{
            var minHeight = this.getMinHeight();
            this.children.each(function(i,e){
                if(e.figure.isResizeable()===true){
                    e.figure.setDimension(1,minHeight);
                }
            });
        }
        return this;
    },
    getPersistentAttributes: function()
    {
        var memento = this._super();
        memento.gap = this.gap;
        return memento;
    },
    setPersistentAttributes: function(memento)
    {
        this._super(memento);
        if(typeof memento.gap ==="number"){
            this.gap = memento.gap;
        }
        return this;
    }
});
draw2d.shape.layout.VerticalLayout= draw2d.shape.layout.Layout.extend({
	NAME : "draw2d.shape.layout.VerticalLayout",
    init: function(attr, setter, getter)
    {
        this.gap = 0;
        var _this = this;
        this.locator = {
            translate: function(figure, diff){
                figure.setPosition(figure.x+diff.x,figure.y+diff.y);
            },
            bind: function(){},
            unbind: function(){},
            relocate: function(index, target)
            {
                var stroke = _this.getStroke();
                var yPos =stroke+ _this.padding.top; 
                var xPos =_this.padding.left;
                for (var i=0;i<index;i++) {
                    var child = _this.children.get(i).figure;
                    if (child.isVisible()){
                        yPos += child.getHeight() + _this.gap;
                    }
                }
                target.setPosition(xPos,yPos);
             }
        };
        this._super(
                $.extend({width:10, height:10},attr),
                $.extend({
                    gap : this.setGap
                },setter),
                $.extend({
                    gap: this.getGap
                },getter));
    },
    add: function(child, locator, index)
    {
        this._super(child, this.locator, index);
        this.setDimension(1,1);
        return this;
    },
    setGap: function(gap)
    {
        this.gap = gap;
        this.setDimension(1,1);
    },
    getMinWidth: function()
    {
        var markup=(this.stroke*2)+this.padding.left+this.padding.right;
        var width=10;
        this.children.each(function(i,e){
        	if(e.figure.isVisible())
        		width = Math.max(width, e.figure.isResizeable()? e.figure.getMinWidth(): e.figure.getWidth());
        });
        return width+markup;
    },
    getMinHeight: function()
    {
        var _this = this;
    	var gap = 0;
        var markup=(this.stroke*2)+this.padding.top+this.padding.bottom;
        var height=0;
        this.children.each(function(i,e){
        	if(e.figure.isVisible()){
        		height += ((e.figure.isResizeable()?e.figure.getMinHeight():e.figure.getHeight())+gap);
        		gap = _this.gap;
        	}
        });
        return height+markup;
    },
    setDimension: function( w, h)
    {
        this._super(w,h);
        var width=this.width-this.padding.left-this.padding.right;
        if (width === this._recursiveWidth) {
            return this;
        }
        this._recursiveWidth = width;
        this.children.each(function(i,e){
            if(e.figure.isResizeable() && e.figure.isVisible()){
                e.figure.setDimension(width,e.figure.getMinHeight());
            }
        });
        delete this._recursiveWidth;
        return this;
    },
    getPersistentAttributes: function()
    {
        var memento = this._super();
        memento.gap = this.gap;
        return memento;
    },
    setPersistentAttributes: function(memento)
    {
        this._super(memento);
        if(typeof memento.gap ==="number"){
            this.gap = memento.gap;
        }
        return this;
    }
});
draw2d.shape.layout.TableLayout= draw2d.shape.layout.Layout.extend({
	NAME : "draw2d.shape.layout.TableLayout",
	DUMMY_CELL : {
	               getMinHeight: function(){return 1;},
	               getMinWidth:  function(){return 1;},
	               off:          function(){}
                 },
    init: function(attr, setter, getter)
    {
        var _this = this;
        this.cellLocator = {
            relocate: function(index, figure){ 
                if(_this.repaintBlocked===true){
                    return;
                }
                var cell= figure.__cell;
                var layout = _this.getCellLayout(cell.row,cell.column);
                var outerWidth = _this.getWidth();
                var minWidth   = _this.getMinWidth();
                var widthOffset =0;
                if(outerWidth!=minWidth){
                	widthOffset= ((outerWidth-minWidth)/ _this.layoutInfos[0].length)*cell.column;
                }
                var width  = figure.getWidth();
                var height = figure.getHeight();
            	var x = layout.x+_this.padding.left+layout.padding.left+widthOffset;
            	var y = layout.y+_this.padding.top +layout.padding.top;
                if(figure.isResizeable()){
                	var w = Math.max(figure.getMinWidth() , layout.w-(layout.padding.left+layout.padding.right)+widthOffset);
                	var h = Math.max(figure.getMinHeight(), layout.h-(layout.padding.top+layout.padding.bottom));
                	figure.setDimension(w,h);
                }
                else{
                	switch(layout.valign){
                	case "middle":
                		y=y+ (layout.h-height)/2;
                		break;
                	case "bottom":
                		y=y+ (layout.h-height);
                		break;
                	}
                	switch(layout.align){
                	case "center":
                		x=x+ (layout.w-width)/2+(widthOffset/2);
                		break;
                	case "right":
                		x=x+ (layout.w-width)+widthOffset;
                		break;
                	}                	
                }
                figure.setPosition(x, y);
            },
            bind: function(){},
            unbind: function(){},
            translate: function(figure, diff){
                figure.setPosition(figure.x+diff.x,figure.y+diff.y);
            }
        };
        this.padding = {top:4, right:4, bottom:4,left:4};
        this.grid = [];
        this.layoutInfos = [];
        this.layoutInfos[0]=[];
        this.layoutInfos[0][0]={x:0, y:0, w:1, h:1, valign:"top", align:"left"};
        this._super(
                $.extend({stroke:1, resizeable:false},attr),
                $.extend({
                    padding  : this.setPadding
                }, setter),
                $.extend({
                    padding  : this.getPadding
                }, getter));
    },
    setCellPadding: function(row, column, padding)
    {
    	var layout = this.getCellLayout(row, column);
    	if(layout===null){
    		return this;
    	}
    	if(typeof padding ==="number"){
          layout.padding = {top:padding, right:padding, bottom:padding, left:padding};
    	}
    	else{
          $.extend(layout.padding, padding);
    	}
        this.calculateLayout();
    	this.setDimension(1,1);
    	return this;
    },
    getCellPadding: function(row, column )
    {
        var layout = this.getCellLayout(row, column);
    	if(layout===null || typeof layout.padding==="undefined"){
    		return {top:0, right:0, bottom:0, left:0};
    	}
    	return layout.padding;
    },
    setPadding: function( padding)
    {
        if(typeof padding ==="number"){
            this.padding = {top:padding, right:padding, bottom:padding, left:padding };
        }
        else{
            $.extend(this.padding, padding);
        }
        this.calculateLayout();
        this.setDimension(1,1);
        this.fireEvent("change:padding",{value:this.padding});
        return this;
    },
    getPadding: function( )
    {
      return this.padding;
    },
    setCanvas: function(canvas)
    {
         this._super(canvas);  
         this.calculateLayout();
         this.setDimension(2,2);
        return this;
    },
    add: function(child, locator, index)
    {
        this._super(child, locator, index);
        this.setDimension(1,1);
        return this;
    },
    removeRow: function(index)
    {
        var _this = this;
    	var removedRow = this.grid.splice(index, 1);
    	removedRow[0].forEach(function(figure){
    		_this.remove(figure);
    	});
    	this.calculateLayout();
    	this.setDimension(2,2);
        return removedRow;
    },
    addRow: function ()
    {
        var figuresToAdd = [];
        var _this = this;
    	var args = Array.prototype.slice.call(arguments); 
    	var rowCount    = this.grid.length+1;
    	var columnCount = this.grid.length>0?Math.max(this.grid[0].length, args.length):args.length;
    	var row = [];
    	args.forEach(function(figure, index){
    		if(typeof figure ==="string"){
    		    figure = new draw2d.shape.basic.Label({text:figure});
    		}
    		row.push(figure);
    		figuresToAdd.push(figure);
    	});
    	this.grid.push(row);
    	this.grid.forEach(function(row, index){
    	    var missingColumns = columnCount-row.length;
    	    for(var i=0;i<missingColumns;i++){
    	        row.push(_this.DUMMY_CELL);
    	    }
    	});
        var orig = this.repaintBlocked;
    	this.repaintBlocked=true;
        figuresToAdd.forEach(function(figure){
            _this.add(figure, _this.cellLocator);
        });
        this.repaintBlocked = orig;
        this.calculateLayout();
        this.setDimension(1,1);
    	return this;
    },
    getMinWidth: function()
    {
        if(this.canvas===null ||this.layoutInfos.length===0){
            return 10;
        }
    	var bottom     = this.layoutInfos[this.layoutInfos.length-1];
    	var layout= bottom[bottom.length-1];
    	return layout.w+layout.x+this.padding.left+this.padding.right;
    },
    getMinHeight: function()
    {
        if(this.canvas===null ||this.layoutInfos.length===0){
            return 10;
        }
        var bottom     = this.layoutInfos[this.layoutInfos.length-1];
    	var layout= bottom[bottom.length-1];
    	return layout.h+layout.y+ this.padding.top+this.padding.bottom;
    },
    setCellVerticalAlign: function(row, column, valign){
       	var layout = this.getCellLayout(row, column);
    	if(layout===null){
    		return; 
    	}
    	switch(valign){
	    	case "top":
	    	case "middle":
	    	case "bottom":
	    		layout.valign = valign;
	            this.calculateLayout();
	            this.setDimension(1,1);
    	}
        return this;
    },
     getCellVerticalAlign: function(row, column){
        var layout = this.getCellLayout(row, column);
        if(layout===null){
            return "top";
        }
        return layout.valign;
    },
    setCellAlign: function(row, column, align){
    	var layout = this.getCellLayout(row, column);
    	if(layout===null){
    		return; 
    	}
    	switch(align){
	    	case "left":
	    	case "center":
	    	case "right":
	    		layout.align = align;
	            this.calculateLayout();
	            this.setDimension(1,1);
    	}
        return this;
    },
    getCellAlign: function(row, column){
        var layout = this.getCellLayout(row, column);
        if(layout===null){
            return "left";
        }
        return layout.align;
    },
    getCellLayout: function(row, column)
    {
    	if(row<0 || column<0){
    		return null; 
    	}
    	if(row >= this.layoutInfos.length){
    		return null; 
    	}
    	var layouts = this.layoutInfos[row];
    	if(column >= layouts.length){
    		return null; 
    	}
    	return layouts[column];
    },
    calculateLayout: function()
    {
    	var _this = this;
    	var rowCount    = this.grid.length;
    	var columnCount = this.grid.length>0?this.grid[0].length:0;
    	var newLayoutInfos = [];
        for (var row=0;row<rowCount;row++) {
        	newLayoutInfos[row]=[];
        	for (var column=0;column<columnCount;column++) {
        		newLayoutInfos[row][column]={width:0, height:0, x:0, y:0, valign:this.getCellVerticalAlign(row, column), align:this.getCellAlign(row, column), padding: this.getCellPadding(row, column)};
	         }
        }
        var layoutWidths = new Array(columnCount+1).join('0').split('').map(parseFloat);
        var layoutHeights= new Array(rowCount+1).join('0').split('').map(parseFloat);
        this.grid.forEach(function(figures, row){
        	for(var column=0; column<columnCount; column++){
        		var layout = newLayoutInfos[row][column];
        		var figure = figures[column];
                figure.__cell = {row:row, column:column};
                layoutHeights[row]   = Math.max(layoutHeights[row]  , figure.getMinHeight() +layout.padding.top + layout.padding.bottom);
                layoutWidths[column] = Math.max(layoutWidths[column], figure.getMinWidth()  +layout.padding.left+ layout.padding.right );
        	}
        });
        var x=0, y=0;
        for (row=0;row<rowCount;row++) {
       		for(column=0;column<columnCount;column++) {
       			var layout = newLayoutInfos[row][column];
       			layout.w = layoutWidths[column];
       			layout.h = layoutHeights[row];
       			layout.x = x;
       			layout.y = y;
       			x = x+layout.w;
	        }
       		y= y+layoutHeights[row];
       		x=0;
        }
        this.layoutInfos = newLayoutInfos;
        return this;
    }
});
draw2d.shape.layout.FlexGridLayout= draw2d.shape.layout.Layout.extend({
	NAME : "draw2d.shape.layout.FlexGridLayout",
    init: function(attr, setter, getter)
    {
        var _this = this;
        this.cellLocator = {
            relocate: function(index, figure){ 
                if(_this.gridDef.layoutRequired===true){
                    _this._layout();
                }
                var cell = figure.__cellConstraint;
                var x = cell.x;
                var y = cell.y;
                if(figure.isResizeable()){
                    figure.setDimension( 
                            Math.max(figure.getMinWidth() , cell.width),
                            Math.max(figure.getMinHeight(), cell.height));
                }
                else{
                    switch(cell.valign){
                    case "middle":
                        y=y+ (cell.height-figure.getHeight())/2;
                        break;
                    case "bottom":
                        y=y+ (cell.height-figure.getHeight());
                        break;
                    }
                    switch(cell.align){
                    case "center":
                        x=x+ (cell.width-figure.getWidth())/2;
                        break;
                    case "right":
                        x=x+ (cell.width-figure.getWidth());
                        break;
                    }                   
                }
                figure.setPosition(x, y);
            },
            bind: function(){},
            unbind: function(){},
            translate: function(figure, diff){
                figure.setPosition(figure.x+diff.x,figure.y+diff.y);
            }
        };
        this.debug=false;
        this.gridDef={
            debugLines : [],
            def_cols  : [],
            def_rows  : [],
            min_height: [],
            min_width : [],      
            minGridWidth:10,
            minGridHeight:10,
            hResizeable:false,
            vResizeable:false,
            layoutRequired:true
        };
        this._super(
                $.extend({stroke:2},attr),
                $.extend({
                }, setter),
                $.extend({
                }, getter));
        this.resizeListener = function(figure)
        {
            _this.gridDef.layoutRequired=true;
            if(_this.getParent() instanceof draw2d.shape.layout.Layout){
                _this.fireEvent("resize");
            }
            else {
                _this.setDimension(
                        _this.gridDef.hResizeable===true?_this.getWidth():1,
                        _this.gridDef.vResizeable===true?_this.getHeight():1
                        );
            }
        };
        var rows   = attr.rows.split(",");
        var columns= attr.columns.split(",");
        for(var i=0;i<columns.length;i++){
            this.gridDef.def_cols[i]=this.cellWidthFromDef(columns[i]);
        }
        for(var i=0;i<rows.length;i++){
            this.gridDef.def_rows[i]=this.cellWidthFromDef(rows[i]);
        }
        this.installEditPolicy(new draw2d.policy.figure.RectangleSelectionFeedbackPolicy());
    },
    add: function(figure, cellConstraint){
        figure.__cellConstraint=  $.extend({},{row:0, col:0, rowspan:1, colspan:1, align:"left", valign:"top", width:1, height:1}, cellConstraint);
        this._super(figure, this.cellLocator);
        this._layout();
    },
    getMinWidth: function()
    {
        return this.gridDef.minGridWidth;
    },
    getMinHeight: function()
    {
        return this.gridDef.minGridHeight;
    },
    setCanvas: function(canvas){
        this.gridDef.layoutRequired=true;
        this._super(canvas);
        return this;
    },
    repaint: function(attributes){
        if (this.repaintBlocked===true || this.shape === null){
            return this;
        }
        this._super(attributes);
        if(this.debug){
            this.paintDebugGrid();
        }
        return this;
    },
    setDimension: function(w,h)
    {
        if(this.gridDef.layoutRequired===true){
            this._layout();
        }
        this._super(w,h);
        this.gridDef.layoutRequired=true;
        this.repaint();
        return this;
    },
    _layout: function()
    {
       this.gridDef.layoutRequired=false;
       var figures = this.getChildren();
       this.gridDef.min_height = this.gridDef.def_rows.slice(0);
       this.gridDef.min_width  = this.gridDef.def_cols.slice(0);
       for(var i=0;i<figures.getSize();i++){
           var figure = figures.get(i);
           var cell = figure.__cellConstraint;
           this.gridDef.min_width[cell.col]=Math.max(this.gridDef.min_width[cell.col],figure.getMinWidth());
       		if(cell.rowspan>1){
       			var eHeight = figure.getMinHeight();         
       			var cHeight = this.cellHeight(cell.row,cell.row+cell.rowspan);
       		    if(cHeight<eHeight){
       		        var diff= eHeight-cHeight;
       		     this.gridDef.min_height[cell.row+cell.rowspan-1] = this.gridDef.min_height[cell.row+cell.rowspan-1]+diff;
       		    }
       		}
       		else{
       		 this.gridDef.min_height[cell.row]=Math.max(this.gridDef.min_height[cell.row],figure.getMinHeight());
    	   	}
       }
       this.gridDef.minGridWidth =this._getGridWidth();
       this.gridDef.minGridHeight=this._getGridHeight();
       var gridHeight = this._getGridHeight();
       for ( var i = 0; i < this.gridDef.def_rows.length; i++) {
           if (this.gridDef.def_rows[i] === -1){
               this.gridDef.min_height[i] = this.gridDef.min_height[i] +Math.max(0,this.getHeight() - gridHeight);
               this.gridDef.vResizeable=true;
               break;
           }
       }
       var gridWidth= this._getGridWidth();
       for(var i=0;i<this.gridDef.def_cols.length;i++){
           if(this.gridDef.def_cols[i] === -1){
               this.gridDef.min_width[i]= this.gridDef.min_width[i]+Math.max(0,this.getWidth()-gridWidth);
               this.gridDef.hResizeable=true;
      	       break;
       	   }
       }
       for(var i=0;i<figures.getSize();i++) {
           var cell = figures.get(i).__cellConstraint;
     	   cell.width  = this.cellWidth(cell.col ,cell.col+cell.colspan);
     	   cell.height = this.cellHeight(cell.row,cell.row+cell.rowspan);
           cell.x   = this.cellX(cell.col);
           cell.y   = this.cellY(cell.row);
       }
        return this;
    },
    cellX: function(col )
    {
        var r=0;
    	for(var i=0;i<col;i++){
    	 r= r+this.gridDef.min_width[i];
    	}
    	return r;
    },
    cellY: function(row )
    {
        var r=0;
    	for(var i=0;i<row;i++){
    	    r= r+this.gridDef.min_height[i];
    	}
    	return r;
    },
    cellWidth: function(from, to)
    {
    	var r =0;
    	for(var i=from;i<to;i++){
    	    r= r+this.gridDef.min_width[i];
    	}
        return r;
    },
    cellHeight: function(from, to)
    {
    	var r =0;
    	for(var i=from;i<to;i++){
    	    r= r+this.gridDef.min_height[i];
    	}
    	return r;
    },
    paintDebugGrid: function()
    {
        for(var i=0;i<this.gridDef.debugLines.length;i++)
            this.gridDef.debugLines[i].remove();
        this.gridDef.debugLines= [];
    	var gridHeight=this._getGridHeight();
    	var gridWidth=this._getGridWidth();
    	var posX = this.getAbsoluteX();
    	var posY = this.getAbsoluteY();
        var x=posX;
        for(var i=0;i<=this.gridDef.min_width.length;i++)
        {
           var newLine =  this.canvas.paper.path("M "+x+" " + posY + " l 0 " + gridHeight) .attr({"stroke":"#FF0000","stroke-width":1});
           this.gridDef.debugLines.push(newLine);
           if(i<this.gridDef.min_width.length)
    	       x=x+this.gridDef.min_width[i];
        }
        var y=posY;
        for(var i=0;i<=this.gridDef.min_height.length;i++)
        {
            var newLine =  this.canvas.paper.path("M "+posX+" " + y + " l " + gridWidth + " 0") .attr({"stroke":"#FF0000","stroke-width":1});
            this.gridDef.debugLines.push(newLine);
            if(i<this.gridDef.min_height.length)
    	       y=y+this.gridDef.min_height[i];
        }
    },
    _getGridWidth: function()
    {
        var gridWidth=0;
        for(var i=0;i<this.gridDef.min_width.length;i++) {
            gridWidth = gridWidth + this.gridDef.min_width[i];
        }
        return gridWidth;
    },
    _getGridHeight: function()
    {
        var gridHeight=0;
        for(var i=0;i<this.gridDef.min_height.length;i++) {
            gridHeight = gridHeight + this.gridDef.min_height[i];
        }
        return gridHeight;
    },
    cellWidthFromDef: function( def)
    {
      var pattern = new RegExp("(\\d+)(?:px)?");
      var match = def.match(pattern);
      if (match!=null) {
          return parseInt(match[1]);
      }
      pattern = new RegExp("p(?:ref)?");
      match = def.match(pattern);
      if (match!=null) {
          return 0;
      }
      pattern = new RegExp("g(?:row)?");
      match = def.match(pattern);
      if (match!=null){
        this.autoResize=false;
        return -1;
      }
      return 0;
    }
});
draw2d.shape.layout.StackLayout= draw2d.shape.layout.Layout.extend({
	NAME : "draw2d.shape.layout.StackLayout",
    init: function(attr, setter, getter)
    {
        this.visibleLayer = 0;
        this.locator = new draw2d.layout.locator.XYAbsPortLocator(0,0);
        this._super(
                $.extend({resizeable:true, width:10, height:10},attr),
                $.extend({}, setter),
                $.extend({}, getter));
        this.resizeListener = function(figure){ };
        this.installEditPolicy(new draw2d.policy.figure.RectangleSelectionFeedbackPolicy());
    },
    setVisibleLayer: function(visibleLayer, duration){
        this.getChildren().get(this.visibleLayer).setVisible(false, duration);
        this.visibleLayer = Math.min(this.getChildren().getSize()-1,Math.max(0,visibleLayer));
        this.getChildren().get(this.visibleLayer).setVisible(true, duration);
        return this;
    },
    getVisibleLayer: function(){
        return this.visibleLayer;
    },
    add: function(child, locator, index)
    {
        child.hitTest = function(){return false};
        this.getChildren().each(function(i, c){
            c.setVisible(false);
        });
        this.visibleLayer = this.getChildren().getSize();
        return this._super(child, this.locator, index);
    },
    setVisible: function(flag)
    {
        draw2d.shape.basic.Rectangle.prototype.setVisible.call(this,flag);
        return this;
    },
    getMinWidth: function()
    {
        var markup=(this.stroke*2)+this.padding.left+this.padding.right;
        var width=10;
        this.children.each(function(i,e){
        		width = Math.max(width, e.figure.isResizeable()? e.figure.getMinWidth(): e.figure.getWidth());
        });
        return width+markup;
    },
    getMinHeight: function()
    {
        var markup=(this.stroke*2)+this.padding.top+this.padding.bottom;
        var height=10;
        this.children.each(function(i,e){
            height = Math.max(height, e.figure.isResizeable()? e.figure.getMinHeight(): e.figure.getHeight());
        });
        return height+markup;
    },
    setDimension: function( w, h)
    {
        this._super(w,h);
        var width=this.width-this.padding.left-this.padding.right;
        var height=this.height-this.padding.top-this.padding.bottom;
        if (width === this._recursiveWidth && height === this._recursiveHeight) {
            return this;
        }
        this._recursiveHeight= height;
        this._recursiveWidth = width;
        this.children.each(function(i,e){
            if(e.figure.isResizeable()){
                e.figure.setDimension(width,height);
            }
        });
        delete this._recursiveHeight;
        delete this._recursiveWidth;
        return this;
    }
});
draw2d.ui.LabelEditor = Class.extend({
    NAME : "draw2d.ui.LabelEditor",
    init: function(listener)
    {
        this.configuration = $.extend({onCommit: function(){}, onCancel: function(){}, text:"Value"},listener);
     },
    start: function( label)
    {
        var newText = prompt(this.configuration.text, label.getText());
        if(newText){
            var cmd =new draw2d.command.CommandAttr(label, {text:newText});
            label.getCanvas().getCommandStack().execute(cmd);
            this.configuration.onCommit(label.getText());
        }
        else{
            this.configuration.onCancel();
        }
    }
});
draw2d.ui.LabelInplaceEditor =  draw2d.ui.LabelEditor.extend({
    NAME: "draw2d.ui.LabelInplaceEditor",
    init: function(listener)
    {
        this._super();
        this.listener = $.extend({onCommit: function(){}, onCancel: function(){}},listener);
    },
    start: function( label)
    {
        this.label = label;
        this.commitCallback = $.proxy(this.commit,this);
        $("body").bind("click",this.commitCallback);
        this.html = $('<input id="inplaceeditor">');
        this.html.val(label.getText());
        this.html.hide();
        $("body").append(this.html);
        this.html.autoResize({animate:false});
        this.html.bind("keyup",$.proxy(function(e){
            switch (e.which) {
            case 13:
                 this.commit();
                 break;
            case 27:
                this.cancel();
                 break;
           }
         },this));
         this.html.bind("blur",this.commitCallback);
         this.html.bind("click",function(e){
             e.stopPropagation();
             e.preventDefault();
         });
        var canvas = this.label.getCanvas();
        var bb = this.label.getBoundingBox();
        bb.setPosition(canvas.fromCanvasToDocumentCoordinate(bb.x,bb.y));
        var scrollDiv = canvas.getScrollArea();
        if(scrollDiv.is($("body"))){
           bb.translate(canvas.getScrollLeft(), canvas.getScrollTop());
        }
        bb.translate(-1,-1);
        bb.resize(2,2);
        this.html.css({position:"absolute","top": bb.y, "left":bb.x, "min-width":bb.w*(1/canvas.getZoom()), "height":Math.max(25,bb.h*(1/canvas.getZoom()))});
        this.html.fadeIn($.proxy(function(){
            this.html.focus();
        },this));
    },
    commit: function()
    {
        this.html.unbind("blur",this.commitCallback);
        $("body").unbind("click",this.commitCallback);
        var label = this.html.val();
        var cmd =new draw2d.command.CommandAttr(this.label, {text:label});
        this.label.getCanvas().getCommandStack().execute(cmd);
        this.html.fadeOut($.proxy(function(){
            this.html.remove();
            this.html = null;
            this.listener.onCommit(this.label.getText());
        },this));
    },
    cancel: function()
    {
        this.html.unbind("blur",this.commitCallback);
        $("body").unbind("click",this.commitCallback);
        this.html.fadeOut($.proxy(function(){
            this.html.remove();
            this.html = null;
            this.listener.onCancel();
        },this));
    }
});
draw2d.decoration.connection.Decorator = Class.extend({
	NAME : "draw2d.decoration.connection.Decorator",
	init: function(width, height) {
        if(typeof width === "undefined" || width<1){
            this.width  = 20;
        }
        else{
            this.width = width;
        }
        if(typeof height === "undefined" || height<1){
            this.height = 15;
        }
        else{
            this.height = height;
        }
		this.color = new draw2d.util.Color(0, 0, 0);
		this.backgroundColor = new  draw2d.util.Color(250, 250, 250);
	},
	paint: function(paper) {
	},
	setColor: function(c) {
		this.color = new draw2d.util.Color(c);
		return this;
	},
	setBackgroundColor: function(c) {
		this.backgroundColor = new draw2d.util.Color(c);
		return this;
	},
    setDimension: function( width, height)
    {
        this.width=width;
        this.height=height;
        return this;
    }
});
draw2d.io.Reader = Class.extend({
    init: function(){
    },
    unmarshal: function(canvas, document){
    }
});
draw2d.io.Writer = Class.extend({
    init: function(){
    },
    marshal: function(canvas, resultCallback){
        if(typeof resultCallback !== "function"){
            throw "Writer.marshal method signature has been change from version 2.10.1 to version 3.0.0. Please consult the API documentation about this issue.";
        }
        resultCallback("", "");
    },
    formatXml: function(xml) {
        var formatted = '';
        var reg = new RegExp("(>)(<)(\/*)","g");
        xml = xml.replace(reg, '$1\r\n$2$3');
        var pad = 0;
        jQuery.each(xml.split('\r\n'), function(index, node) {
            var indent = 0;
            if (node.match( new RegExp(".+<\/\w[^>]*>$") )) {
                indent = 0;
            } else if (node.match( new RegExp("^<\/\w") )) {
                if (pad != 0) {
                    pad -= 1;
                }
            } else if (node.match( new RegExp("^<\w[^>]*[^\/]>.*$") )) {
                indent = 1;
            } else {
                indent = 0;
            }
            var padding = '';
            for (var i = 0; i < pad; i++) {
                padding += '  ';
            }
            formatted += padding + node + '\r\n';
            pad += indent;
        });
        return formatted;
    }
});
draw2d.io.svg.Writer = draw2d.io.Writer.extend({
    init: function(){
        this._super();
    },
    marshal: function(canvas, callback){
        if(typeof callback !== "function"){
            throw "Writer.marshal method signature has been change from version 2.10.1 to version 3.0.0. Please consult the API documentation about this issue.";
        }
        var s =canvas.getPrimarySelection();
        canvas.setCurrentSelection(null);
        var svg = canvas.getHtmlContainer().html()
                     .replace(/>\s+/g, ">")
                     .replace(/\s+</g, "<");
        svg = this.formatXml(svg);
        svg = svg.replace(/<desc>.*<\/desc>/g,"<desc>Create with draw2d JS graph library and RaphaelJS</desc>");
        canvas.setCurrentSelection(s);
    	var base64Content = draw2d.util.Base64.encode(svg);
    	callback( svg, base64Content);
    }
});
draw2d.io.png.Writer = draw2d.io.Writer.extend({
    init: function(){
        this._super();
    },
    marshal: function(canvas, resultCallback, cropBoundingBox){
        if(typeof resultCallback !== "function"){
            throw "Writer.marshal method signature has been change from version 2.10.1 to version 3.0.0. Please consult the API documentation about this issue.";
        }
        var svg = "";
        if(canvas instanceof draw2d.Figure){
            var origPos = canvas.getPosition();
            canvas.setPosition(1,1);
            svg =   "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" >"
                  + canvas.shape.node.outerHTML
                  + "</svg>";
            canvas.setPosition(origPos);
            canvas.initialWidth = canvas.getWidth()+2;
            canvas.initialHeight= canvas.getHeight()+2;
        }
        else {
            canvas.hideDecoration();
            svg = canvas.getHtmlContainer().html().replace(/>\s+/g, ">").replace(/\s+</g, "<");
            if(!svg.includes("http://www.w3.org/1999/xlink")) {
                svg = svg.replace("<svg ", "<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" ");
            }
        }
        if(document.all){
            svg = svg.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');
        }
        canvasDomNode= $('<canvas id="canvas_png_export_for_draw2d" style="display:none"></canvas>');
        $('body').append(canvasDomNode);
        fullSizeCanvas = $("#canvas_png_export_for_draw2d")[0];
        fullSizeCanvas.width = canvas.initialWidth;
        fullSizeCanvas.height = canvas.initialHeight;
        canvg("canvas_png_export_for_draw2d", svg, { 
            ignoreMouse: true, 
            ignoreAnimation: true,
            renderCallback: function(){
                try{
                    if(canvas instanceof draw2d.Canvas)
                        canvas.showDecoration();
                    if(typeof cropBoundingBox!=="undefined"){
                          var sourceX = cropBoundingBox.x;
                          var sourceY = cropBoundingBox.y;
                          var sourceWidth = cropBoundingBox.w;
                          var sourceHeight = cropBoundingBox.h;
                          croppedCanvas = document.createElement('canvas');
                          croppedCanvas.width = sourceWidth;
                          croppedCanvas.height = sourceHeight;
                          croppedCanvas.getContext("2d").drawImage(fullSizeCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0,sourceWidth, sourceHeight);
                          var dataUrl = croppedCanvas.toDataURL("image/png");
                          var base64Image = dataUrl.replace("data:image/png;base64,","");
                          resultCallback(dataUrl, base64Image);
                    }
                    else{
                        var img = fullSizeCanvas.toDataURL("image/png");
                        resultCallback(img,img.replace("data:image/png;base64,",""));
                    }
                }
                finally{
                    canvasDomNode.remove();
                }
           }
        }) ;   
    }
});
draw2d.io.json.Writer = draw2d.io.Writer.extend({
    init: function()
    {
        this._super();
    },
    marshal: function(canvas, resultCallback)
    {
        if(typeof resultCallback !== "function"){
            throw "Writer.marshal method signature has been change from version 2.10.1 to version 3.0.0. Please consult the API documentation about this issue.";
        }
        var result = [];
        canvas.getFigures().each(function(i, figure){
            result.push(figure.getPersistentAttributes());
        });
        canvas.getLines().each(function(i, element){
            result.push(element.getPersistentAttributes());
        });
    	var base64Content = draw2d.util.Base64.encode(JSON.stringify(result, null, 2));
    	resultCallback(result, base64Content);
    }
});
draw2d.io.json.Reader = draw2d.io.Reader.extend({
    NAME : "draw2d.io.json.Reader",
    init: function(){
        this._super();
    },
    unmarshal: function(canvas, json){
        var _this = this;
        var result = new draw2d.util.ArrayList();
        if(typeof json ==="string"){
            json = JSON.parse(json);
        }
        var node=null;
        $.each(json, $.proxy(function(i, element){
            try{
                var o = _this.createFigureFromType(element.type);
                var source= null;
                var target=null;
                for(i in element){
                    var val = element[i];
                    if(i === "source"){
                        node = canvas.getFigure(val.node);
                        if(node===null){
                            throw "Source figure with id '"+val.node+"' not found";
                        }
                        source = node.getPort(val.port);
                        if(source===null){
                            throw "Unable to find source port '"+val.port+"' at figure '"+val.node+"' to unmarschal '"+element.type+"'";
                        }
                    }
                    else if (i === "target"){
                        node = canvas.getFigure(val.node);
                        if(node===null){
                            throw "Target figure with id '"+val.node+"' not found";
                        }
                        target = node.getPort(val.port);
                        if(target===null){
                            throw "Unable to find target port '"+val.port+"' at figure '"+val.node+"' to unmarschal '"+element.type+"'";
                        }
                    }
                }
                if(source!==null && target!==null){
                    o.setSource(source);
                    o.setTarget(target);
                }
                o.setPersistentAttributes(element);
                canvas.add(o);
                result.add(o);
            }
            catch(exc){
                debug.error(element,"Unable to instantiate figure type '"+element.type+"' with id '"+element.id+"' during unmarshal by "+this.NAME+". Skipping figure..");
                debug.error(exc);
                debug.warn(element);
            }
        },this));
        $.each(json, $.proxy(function(i, element){
            if(typeof element.composite !== "undefined"){
               var figure = canvas.getFigure(element.id);
               if(figure===null){
                   figure =canvas.getLine(element.id);
               }
               var group = canvas.getFigure(element.composite);
               group.assignFigure(figure);
            }
        },this));
        canvas.calculateConnectionIntersection();
        canvas.getLines().each(function(i,line){
            line.svgPathString=null;
            line.repaint();
        });
        canvas.linesToRepaintAfterDragDrop = canvas.getLines().clone();
        canvas.showDecoration();
        return result;
    },
    createFigureFromType:function(type)
    {
        return eval("new "+type+"()");
    }
});




// avoid iPad bounce effect during DragDrop
//
document.ontouchmove = function(e){e.preventDefault();};

// hide context menu
//document.oncontextmenu = function() {return false;};


// hacking RaphaelJS to support groups of elements
//
(function() {
    Raphael.fn.group = function(f, g) {
        var enabled = document.getElementsByTagName("svg").length > 0;
        if (!enabled) {
            // return a stub for VML compatibility
            return {
                add : function() {
                    // intentionally left blank
                }
            };
        }
      var i;
      this.svg = "http://www.w3.org/2000/svg";
      this.defs = document.getElementsByTagName("defs")[f];
      this.svgcanv = document.getElementsByTagName("svg")[f];
      this.group = document.createElementNS(this.svg, "g");
      for(i = 0;i < g.length;i++) {
        this.group.appendChild(g[i].node);
      }
      this.svgcanv.appendChild(this.group);
      this.group.translate = function(c, a) {
        this.setAttribute("transform", "translate(" + c + "," + a + ") scale(" + this.getAttr("scale").x + "," + this.getAttr("scale").y + ")");
      };
      this.group.rotate = function(c, a, e) {
        this.setAttribute("transform", "translate(" + this.getAttr("translate").x + "," + this.getAttr("translate").y + ") scale(" + this.getAttr("scale").x + "," + this.getAttr("scale").y + ") rotate(" + c + "," + a + "," + e + ")");
      };
      this.group.scale = function(c, a) {
        this.setAttribute("transform", "scale(" + c + "," + a + ") translate(" + this.getAttr("translate").x + "," + this.getAttr("translate").y + ")");
      };
      this.group.push = function(c) {
        this.appendChild(c.node);
      };
      this.group.getAttr = function(c) {
        this.previous = this.getAttribute("transform") ? this.getAttribute("transform") : "";
        var a = [], e, h, j;
        a = this.previous.split(" ");
        for(i = 0;i < a.length;i++) {
          if(a[i].substring(0, 1) == "t") {
            var d = a[i], b = [];
            b = d.split("(");
            d = b[1].substring(0, b[1].length - 1);
            b = [];
            b = d.split(",");
            e = b.length === 0 ? {x:0, y:0} : {x:b[0], y:b[1]};
          }else {
            if(a[i].substring(0, 1) === "r") {
              d = a[i];
              b = d.split("(");
              d = b[1].substring(0, b[1].length - 1);
              b = d.split(",");
              h = b.length === 0 ? {x:0, y:0, z:0} : {x:b[0], y:b[1], z:b[2]};
            }else {
              if(a[i].substring(0, 1) === "s") {
                d = a[i];
                b = d.split("(");
                d = b[1].substring(0, b[1].length - 1);
                b = d.split(",");
                j = b.length === 0 ? {x:1, y:1} : {x:b[0], y:b[1]};
              }
            }
          }
        }
        if(typeof e === "undefined") {
          e = {x:0, y:0};
        }
        if(typeof h === "undefined") {
          h = {x:0, y:0, z:0};
        }
        if(typeof j === "undefined") {
          j = {x:1, y:1};
        }
        
        if(c == "translate") {
          var k = e;
        }else {
          if(c == "rotate") {
            k = h;
          }else {
            if(c == "scale") {
              k = j;
            }
          }
        }
        return k;
      };
      this.group.copy = function(el){
         this.copy = el.node.cloneNode(true);
         this.appendChild(this.copy);
      };
      return this.group;
    };
})();


/**
 * adding support method to check if the node is already visible
 **/
(function() {
    Raphael.el.isVisible = function() {
        return (this.node.style.display !== "none");
    }
})();

Math.sign = function()
{
 if (this < 0) {return -1;}
 return 1;
};
