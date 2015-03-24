// Edit 8-29-13 fix getScrollTop and getScrollLeft
// 1-1-14 new version of draw2d
// 6-2-2014 nembery - skip json unserialize of broken connections

var draw2d = {geo: {}, io: {json: {}, png: {}, svg: {}}, util: {spline: {}}, shape: {basic: {}, arrow: {}, node: {}, note: {}, diagram: {}, analog: {}, icon: {}, layout: {}, pert: {}, state: {}, widget: {}}, policy: {canvas: {}, line: {}, port: {}, figure: {}}, command: {}, decoration: {connection: {}}, layout: {connection: {}, anchor: {}, mesh: {}, locator: {}}, ui: {}, isTouchDevice: ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPod") != -1) || (navigator.platform.indexOf("iPad") != -1))};
var node = jQuery("#draw2d_script");
console.log(node);
draw2d.util.Color = Class.extend({init: function(red, green, blue) {
        this.hashString = null;
        if (typeof red === "undefined" || red === null) {
            this.hashString = "none";
        } else {
            if (red instanceof draw2d.util.Color) {
                this.red = red.red;
                this.green = red.green;
                this.blue = red.blue;
            } else {
                if (typeof green === "undefined") {
                    var rgb = this.hex2rgb(red);
                    this.red = rgb[0];
                    this.green = rgb[1];
                    this.blue = rgb[2];
                } else {
                    this.red = red;
                    this.green = green;
                    this.blue = blue;
                }
            }
        }
    }, getHTMLStyle: function() {
        return"rgb(" + this.red + "," + this.green + "," + this.blue + ")";
    }, getRed: function() {
        return this.red;
    }, getGreen: function() {
        return this.green;
    }, getBlue: function() {
        return this.blue;
    }, getIdealTextColor: function() {
        var nThreshold = 105;
        var bgDelta = (this.red * 0.299) + (this.green * 0.587) + (this.blue * 0.114);
        return(255 - bgDelta < nThreshold) ? new draw2d.util.Color(0, 0, 0) : new draw2d.util.Color(255, 255, 255);
    }, hex2rgb: function(hexcolor) {
        hexcolor = hexcolor.replace("#", "");
        return({0: parseInt(hexcolor.substr(0, 2), 16), 1: parseInt(hexcolor.substr(2, 2), 16), 2: parseInt(hexcolor.substr(4, 2), 16)});
    }, hex: function() {
        return(this.int2hex(this.red) + this.int2hex(this.green) + this.int2hex(this.blue));
    }, hash: function() {
        if (this.hashString === null) {
            this.hashString = "#" + this.hex();
        }
        return this.hashString;
    }, int2hex: function(v) {
        v = Math.round(Math.min(Math.max(0, v), 255));
        return("0123456789ABCDEF".charAt((v - v % 16) / 16) + "0123456789ABCDEF".charAt(v % 16));
    }, darker: function(fraction) {
        if (this.hashString === "none") {
            return this;
        }
        var red = parseInt(Math.round(this.getRed() * (1 - fraction)));
        var green = parseInt(Math.round(this.getGreen() * (1 - fraction)));
        var blue = parseInt(Math.round(this.getBlue() * (1 - fraction)));
        if (red < 0) {
            red = 0;
        } else {
            if (red > 255) {
                red = 255;
            }
        }
        if (green < 0) {
            green = 0;
        } else {
            if (green > 255) {
                green = 255;
            }
        }
        if (blue < 0) {
            blue = 0;
        } else {
            if (blue > 255) {
                blue = 255;
            }
        }
        return new draw2d.util.Color(red, green, blue);
    }, lighter: function(fraction) {
        if (this.hashString === "none") {
            return this;
        }
        var red = parseInt(Math.round(this.getRed() * (1 + fraction)));
        var green = parseInt(Math.round(this.getGreen() * (1 + fraction)));
        var blue = parseInt(Math.round(this.getBlue() * (1 + fraction)));
        if (red < 0) {
            red = 0;
        } else {
            if (red > 255) {
                red = 255;
            }
        }
        if (green < 0) {
            green = 0;
        } else {
            if (green > 255) {
                green = 255;
            }
        }
        if (blue < 0) {
            blue = 0;
        } else {
            if (blue > 255) {
                blue = 255;
            }
        }
        return new draw2d.util.Color(red, green, blue);
    }, fadeTo: function(color, pc) {
        var r = Math.floor(this.red + (pc * (color.red - this.red)) + 0.5);
        var g = Math.floor(this.green + (pc * (color.green - this.green)) + 0.5);
        var b = Math.floor(this.blue + (pc * (color.blue - this.blue)) + 0.5);
        return new draw2d.util.Color(r, g, b);
    }});
draw2d.util.ArrayList = Class.extend({init: function(a) {
        this.increment = 10;
        this.size = 0;
        this.data = new Array(this.increment);
        if (typeof a !== "undefined") {
            jQuery.each(a, jQuery.proxy(function(i, e) {
                this.add(e);
            }, this));
        }
    }, reverse: function() {
        var newData = new Array(this.size);
        for (var i = 0; i < this.size; i++) {
            newData[i] = this.data[this.size - i - 1];
        }
        this.data = newData;
        return this;
    }, getCapacity: function() {
        return this.data.length;
    }, getSize: function() {
        return this.size;
    }, isEmpty: function() {
        return this.getSize() === 0;
    }, getLastElement: function() {
        if (this.data[this.getSize() - 1] !== null) {
            return this.data[this.getSize() - 1];
        }
        return null;
    }, asArray: function() {
        this.trimToSize();
        return this.data;
    }, getFirstElement: function() {
        if (this.data[0] !== null && typeof this.data[0] !== "undefined") {
            return this.data[0];
        }
        return null;
    }, get: function(i) {
        return this.data[i];
    }, add: function(obj) {
        if (this.getSize() == this.data.length) {
            this.resize();
        }
        this.data[this.size++] = obj;
        return this;
    }, grep: function(func) {
        this.data = jQuery.grep(this.data, func);
        this.data = jQuery.grep(this.data, function(e) {
            return(typeof e !== "undefined");
        });
        this.size = this.data.length;
        return this;
    }, addAll: function(list, avoidDuplicates) {
        if (!(list instanceof draw2d.util.ArrayList)) {
            throw"Unable to handle unknown object type in ArrayList.addAll";
        }
        var _this = this;
        if (typeof avoidDuplicates === "undefined" || avoidDuplicates === false) {
            list.each(function(i, e) {
                _this.add(e);
            });
        } else {
            list.each(function(i, e) {
                if (!_this.contains(e)) {
                    _this.add(e);
                }
            });
        }
        return this;
    }, pop: function() {
        return this.removeElementAt(this.getSize() - 1);
    }, push: function(path) {
        this.add(path);
    }, remove: function(obj) {
        var index = this.indexOf(obj);
        if (index >= 0) {
            return this.removeElementAt(index);
        }
        return null;
    }, insertElementAt: function(obj, index) {
        if (this.size == this.capacity) {
            this.resize();
        }
        for (var i = this.getSize(); i > index; i--) {
            this.data[i] = this.data[i - 1];
        }
        this.data[index] = obj;
        this.size++;
        return this;
    }, removeElementAt: function(index) {
        var element = this.data[index];
        for (var i = index; i < (this.size - 1); i++) {
            this.data[i] = this.data[i + 1];
        }
        this.data[this.size - 1] = null;
        this.size--;
        return element;
    }, removeAll: function(elements) {
        jQuery.each(elements, jQuery.proxy(function(i, e) {
            this.remove(e);
        }, this));
        return this;
    }, indexOf: function(obj) {
        for (var i = 0; i < this.getSize(); i++) {
            if (this.data[i] == obj) {
                return i;
            }
        }
        return -1;
    }, contains: function(obj) {
        for (var i = 0; i < this.getSize(); i++) {
            if (this.data[i] == obj) {
                return true;
            }
        }
        return false;
    }, resize: function() {
        newData = new Array(this.data.length + this.increment);
        for (var i = 0; i < this.data.length; i++) {
            newData[i] = this.data[i];
        }
        this.data = newData;
        return this;
    }, trimToSize: function() {
        if (this.data.length == this.size) {
            return this;
        }
        var temp = new Array(this.getSize());
        for (var i = 0; i < this.getSize(); i++) {
            temp[i] = this.data[i];
        }
        this.size = temp.length;
        this.data = temp;
        return this;
    }, sort: function(f) {
        var i, j;
        var currentValue;
        var currentObj;
        var compareObj;
        var compareValue;
        for (i = 1; i < this.getSize(); i++) {
            currentObj = this.data[i];
            currentValue = currentObj[f];
            j = i - 1;
            compareObj = this.data[j];
            compareValue = compareObj[f];
            while (j >= 0 && compareValue > currentValue) {
                this.data[j + 1] = this.data[j];
                j--;
                if (j >= 0) {
                    compareObj = this.data[j];
                    compareValue = compareObj[f];
                }
            }
            this.data[j + 1] = currentObj;
        }
        return this;
    }, clone: function() {
        var newVector = new draw2d.util.ArrayList();
        for (var i = 0; i < this.size; i++) {
            newVector.add(this.data[i]);
        }
        return newVector;
    }, each: function(func) {
        for (var i = 0; i < this.size; i++) {
            if (func(i, this.data[i]) === false) {
                break;
            }
        }
    }, overwriteElementAt: function(obj, index) {
        this.data[index] = obj;
        return this;
    }, getPersistentAttributes: function() {
        return{data: this.data, increment: this.increment, size: this.getSize()};
    }, setPersistentAttributes: function(memento) {
        this.data = memento.data;
        this.increment = memento.increment;
        this.size = memento.size;
    }});
draw2d.util.ArrayList.EMPTY_LIST = new draw2d.util.ArrayList();
Raphael.fn.polygon = function(pointString) {
    var poly = ["M"], point = pointString.split(" ");
    for (var i = 0; i < point.length; i++) {
        var c = point[i].split(",");
        for (var j = 0; j < c.length; j++) {
            var d = parseFloat(c[j]);
            if (d) {
                poly.push(d);
            }
        }
        if (i == 0) {
            poly.push("L");
        }
    }
    poly.push("Z");
    return this.path(poly);
};
draw2d.util.UUID = function() {
};
draw2d.util.UUID.create = function() {
    var segment = function() {
        return(((1 + Math.random()) * 65536) | 0).toString(16).substring(1);
    };
    return(segment() + segment() + "-" + segment() + "-" + segment() + "-" + segment() + "-" + segment() + segment() + segment());
};
draw2d.util.spline.Spline = Class.extend({NAME: "draw2d.util.spline.Spline", init: function() {
    }, generate: function(controlPoints, parts) {
        throw"inherit classes must implement the method 'draw2d.util.spline.Spline.generate()'";
    }});
draw2d.util.spline.CubicSpline = draw2d.util.spline.Spline.extend({NAME: "draw2d.util.spline.CubicSpline", init: function() {
        this._super();
    }, generate: function(controlPoints, parts) {
        var cp = new draw2d.util.ArrayList();
        cp.add(controlPoints.get(0));
        cp.addAll(controlPoints);
        cp.add(controlPoints.get(controlPoints.getSize() - 1));
        var n = cp.getSize();
        var spline = new draw2d.util.ArrayList();
        spline.add(controlPoints.get(0));
        spline.add(this.p(1, 0, cp));
        for (var i = 1; i < n - 2; i++) {
            for (var j = 1; j <= parts; j++) {
                spline.add(this.p(i, j / parts, cp));
            }
        }
        spline.add(controlPoints.get(controlPoints.getSize() - 1));
        return spline;
    }, p: function(i, t, cp) {
        var x = 0;
        var y = 0;
        var k = i - 1;
        for (var j = -2; j <= 1; j++) {
            var b = this.blend(j, t);
            var p = cp.get(k++);
            x += b * p.x;
            y += b * p.y;
        }
        return new draw2d.geo.Point(x, y);
    }, blend: function(i, t) {
        if (i === -2) {
            return(((-t + 3) * t - 3) * t + 1) / 6;
        } else {
            if (i === -1) {
                return(((3 * t - 6) * t) * t + 4) / 6;
            } else {
                if (i === 0) {
                    return(((-3 * t + 3) * t + 3) * t + 1) / 6;
                }
            }
        }
        return(t * t * t) / 6;
    }});
draw2d.util.spline.CatmullRomSpline = draw2d.util.spline.CubicSpline.extend({NAME: "draw2d.util.spline.CatmullRomSpline", init: function() {
        this._super();
    }, blend: function(i, t) {
        if (i == -2) {
            return((-t + 2) * t - 1) * t / 2;
        } else {
            if (i == -1) {
                return(((3 * t - 5) * t) * t + 2) / 2;
            } else {
                if (i == 0) {
                    return((-3 * t + 4) * t + 1) * t / 2;
                } else {
                    return((t - 1) * t * t) / 2;
                }
            }
        }
    }});
draw2d.util.spline.BezierSpline = draw2d.util.spline.Spline.extend({NAME: "draw2d.util.spline.BezierSpline", init: function() {
        this._super();
    }, generate: function(controlPoints, parts) {
        var n = controlPoints.getSize();
        var spline = new draw2d.util.ArrayList();
        spline.add(this.p(0, 0, controlPoints));
        for (var i = 0; i < n - 3; i += 3) {
            for (var j = 1; j <= parts; j++) {
                spline.add(this.p(i, j / parts, controlPoints));
            }
        }
        return spline;
    }, p: function(i, t, cp) {
        var x = 0;
        var y = 0;
        var k = i;
        for (var j = 0; j <= 3; j++) {
            var b = this.blend(j, t);
            var p = cp.get(k++);
            x += b * p.x;
            y += b * p.y;
        }
        return new draw2d.geo.Point(x, y);
    }, blend: function(i, t) {
        if (i == 0) {
            return(1 - t) * (1 - t) * (1 - t);
        } else {
            if (i == 1) {
                return 3 * t * (1 - t) * (1 - t);
            } else {
                if (i == 2) {
                    return 3 * t * t * (1 - t);
                } else {
                    return t * t * t;
                }
            }
        }
    }});
draw2d.geo.PositionConstants = function() {
};
draw2d.geo.PositionConstants.NORTH = 1;
draw2d.geo.PositionConstants.SOUTH = 4;
draw2d.geo.PositionConstants.WEST = 8;
draw2d.geo.PositionConstants.EAST = 16;
draw2d.geo.Point = Class.extend({NAME: "draw2d.geo.Point", init: function(x, y) {
        if (x instanceof draw2d.geo.Point) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
        this.bx = null;
        this.by = null;
        this.bw = null;
        this.bh = null;
    }, setBoundary: function(bx, by, bw, bh) {
        if (bx instanceof draw2d.geo.Rectangle) {
            this.bx = bx.x;
            this.by = bx.y;
            this.bw = bx.w;
            this.bh = bx.h;
        } else {
            this.bx = bx;
            this.by = by;
            this.bw = bw;
            this.bh = bh;
        }
        this.adjustBoundary();
        return this;
    }, adjustBoundary: function() {
        if (this.bx === null) {
            return;
        }
        this.x = Math.min(Math.max(this.bx, this.x), this.bw);
        this.y = Math.min(Math.max(this.by, this.y), this.bh);
        return this;
    }, translate: function(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.adjustBoundary();
        return this;
    }, getX: function() {
        return this.x;
    }, getY: function() {
        return this.y;
    }, setX: function(x) {
        this.x = x;
        this.adjustBoundary();
        return this;
    }, setY: function(y) {
        this.y = y;
        this.adjustBoundary();
        return this;
    }, setPosition: function(x, y) {
        if (x instanceof draw2d.geo.Point) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
        this.adjustBoundary();
        return this;
    }, getPosition: function(p) {
        var dx = p.x - this.x;
        var dy = p.y - this.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) {
                return draw2d.geo.PositionConstants.WEST;
            }
            return draw2d.geo.PositionConstants.EAST;
        }
        if (dy < 0) {
            return draw2d.geo.PositionConstants.NORTH;
        }
        return draw2d.geo.PositionConstants.SOUTH;
    }, equals: function(p) {
        return this.x === p.x && this.y === p.y;
    }, getDistance: function(other) {
        return Math.sqrt((this.x - other.x) * (this.x - other.x) + (this.y - other.y) * (this.y - other.y));
    }, length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }, getTranslated: function(other) {
        return new draw2d.geo.Point(this.x + other.x, this.y + other.y);
    }, getScaled: function(factor) {
        return new draw2d.geo.Point(this.x * factor, this.y * factor);
    }, getPersistentAttributes: function() {
        return{x: this.x, y: this.y};
    }, setPersistentAttributes: function(memento) {
        this.x = memento.x;
        this.y = memento.y;
    }, subtract: function(that) {
        return new draw2d.geo.Point(this.x - that.x, this.y - that.y);
    }, dot: function(that) {
        return this.x * that.x + this.y * that.y;
    }, cross: function(that) {
        return this.x * that.y - this.y * that.x;
    }, lerp: function(that, t) {
        return new draw2d.geo.Point(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t);
    }, clone: function() {
        return new draw2d.geo.Point(this.x, this.y);
    }});
draw2d.geo.Rectangle = draw2d.geo.Point.extend({NAME: "draw2d.geo.Rectangle", init: function(x, y, w, h) {
        this._super(x, y);
        this.w = w;
        this.h = h;
    }, adjustBoundary: function() {
        if (this.bx === null) {
            return;
        }
        this.x = Math.min(Math.max(this.bx, this.x), this.bw - this.w);
        this.y = Math.min(Math.max(this.by, this.y), this.bh - this.h);
        this.w = Math.min(this.w, this.bw);
        this.h = Math.min(this.h, this.bh);
    }, resize: function(dw, dh) {
        this.w += dw;
        this.h += dh;
        this.adjustBoundary();
        return this;
    }, scale: function(dw, dh) {
        this.w += (dw);
        this.h += (dh);
        this.x -= (dw / 2);
        this.y -= (dh / 2);
        this.adjustBoundary();
        return this;
    }, setBounds: function(rect) {
        this.setPosition(rect.x, rect.y);
        this.w = rect.w;
        this.h = rect.h;
        return this;
    }, isEmpty: function() {
        return this.w <= 0 || this.h <= 0;
    }, getWidth: function() {
        return this.w;
    }, setWidth: function(w) {
        this.w = w;
        this.adjustBoundary();
        return this;
    }, getHeight: function() {
        return this.h;
    }, setHeight: function(h) {
        this.h = h;
        this.adjustBoundary();
        return this;
    }, getLeft: function() {
        return this.x;
    }, getRight: function() {
        return this.x + this.w;
    }, getTop: function() {
        return this.y;
    }, getBottom: function() {
        return this.y + this.h;
    }, getTopLeft: function() {
        return new draw2d.geo.Point(this.x, this.y);
    }, getTopCenter: function() {
        return new draw2d.geo.Point(this.x + (this.w / 2), this.y);
    }, getTopRight: function() {
        return new draw2d.geo.Point(this.x + this.w, this.y);
    }, getBottomLeft: function() {
        return new draw2d.geo.Point(this.x, this.y + this.h);
    }, getBottomCenter: function() {
        return new draw2d.geo.Point(this.x + (this.w / 2), this.y + this.h);
    }, getCenter: function() {
        return new draw2d.geo.Point(this.x + this.w / 2, this.y + this.h / 2);
    }, getBottomRight: function() {
        return new draw2d.geo.Point(this.x + this.w, this.y + this.h);
    }, getPoints: function() {
        var result = new draw2d.util.ArrayList();
        result.add(this.getTopLeft());
        result.add(this.getTopRight());
        result.add(this.getBottomRight());
        result.add(this.getBottomLeft());
        return result;
    }, moveInside: function(rect) {
        var newRect = new draw2d.geo.Rectangle(rect.x, rect.y, rect.w, rect.h);
        newRect.x = Math.max(newRect.x, this.x);
        newRect.y = Math.max(newRect.y, this.y);
        if (newRect.w < this.w) {
            newRect.x = Math.min(newRect.x + newRect.w, this.x + this.w) - newRect.w;
        } else {
            newRect.x = this.x;
        }
        if (newRect.h < this.h) {
            newRect.y = Math.min(newRect.y + newRect.h, this.y + this.h) - newRect.h;
        } else {
            newRect.y = this.y;
        }
        return newRect;
    }, getDistance: function(pointOrRectangle) {
        var cx = this.x;
        var cy = this.y;
        var cw = this.w;
        var ch = this.h;
        var ox = pointOrRectangle.getX();
        var oy = pointOrRectangle.getY();
        var ow = 1;
        var oh = 1;
        if (pointOrRectangle instanceof draw2d.geo.Rectangle) {
            ow = pointOrRectangle.getWidth();
            oh = pointOrRectangle.getHeight();
        }
        var oct = 9;
        if (cx + cw <= ox) {
            if ((cy + ch) <= oy) {
                oct = 0;
            } else {
                if (cy >= (oy + oh)) {
                    oct = 6;
                } else {
                    oct = 7;
                }
            }
        } else {
            if (cx >= ox + ow) {
                if (cy + ch <= oy) {
                    oct = 2;
                } else {
                    if (cy >= oy + oh) {
                        oct = 4;
                    } else {
                        oct = 3;
                    }
                }
            } else {
                if (cy + ch <= oy) {
                    oct = 1;
                } else {
                    if (cy >= oy + oh) {
                        oct = 5;
                    } else {
                        return 0;
                    }
                }
            }
        }
        switch (oct) {
            case 0:
                cx = (cx + cw) - ox;
                cy = (cy + ch) - oy;
                return -(cx + cy);
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
        throw"Unknown data type of parameter for distance calculation in draw2d.geo.Rectangle.getDistnace(..)";
    }, determineOctant: function(r2) {
        var HISTERESE = 3;
        var ox = this.x + HISTERESE;
        var oy = this.y + HISTERESE;
        var ow = this.w - (HISTERESE * 2);
        var oh = this.h - (HISTERESE * 2);
        var cx = r2.x;
        var cy = r2.y;
        var cw = 2;
        var ch = 2;
        if (r2 instanceof draw2d.geo.Rectangle) {
            cw = r2.w;
            ch = r2.h;
        }
        var oct = 0;
        if (cx + cw <= ox) {
            if ((cy + ch) <= oy) {
                oct = 0;
            } else {
                if (cy >= (oy + oh)) {
                    oct = 6;
                } else {
                    oct = 7;
                }
            }
        } else {
            if (cx >= ox + ow) {
                if (cy + ch <= oy) {
                    oct = 2;
                } else {
                    if (cy >= oy + oh) {
                        oct = 4;
                    } else {
                        oct = 3;
                    }
                }
            } else {
                if (cy + ch <= oy) {
                    oct = 1;
                } else {
                    if (cy >= oy + oh) {
                        oct = 5;
                    } else {
                        oct = 8;
                    }
                }
            }
        }
        return oct;
    }, getDirection: function(other) {
        var current = this.getTopLeft();
        switch (this.determineOctant(other)) {
            case 0:
                if ((current.x - other.x) < (current.y - other.y)) {
                    return 0;
                }
                return 3;
            case 1:
                return 0;
            case 2:
                current = this.getTopRight();
                if ((other.x - current.x) < (current.y - other.y)) {
                    return 0;
                }
                return 1;
            case 3:
                return 1;
            case 4:
                current = this.getBottomRight();
                if ((other.x - current.x) < (other.y - current.y)) {
                    return 2;
                }
                return 1;
            case 5:
                return 2;
            case 6:
                current = this.getBottomLeft();
                if ((current.x - other.x) < (other.y - current.y)) {
                    return 2;
                }
                return 3;
            case 7:
                return 3;
            case 8:
                if (other.y > this.y) {
                    return 2;
                }
                return 0;
        }
        return 0;
    }, equals: function(o) {
        return this.x == o.x && this.y == o.y && this.w == o.w && this.h == o.h;
    }, hitTest: function(iX, iY) {
        if (iX instanceof draw2d.geo.Point) {
            iY = iX.y;
            iX = iX.x;
        }
        var iX2 = this.x + this.getWidth();
        var iY2 = this.y + this.getHeight();
        return(iX >= this.x && iX <= iX2 && iY >= this.y && iY <= iY2);
    }, isInside: function(rect) {
        return rect.hitTest(this.getTopLeft()) && rect.hitTest(this.getTopRight()) && rect.hitTest(this.getBottomLeft()) && rect.hitTest(this.getBottomRight());
    }, intersects: function(rect) {
        x11 = rect.x, y11 = rect.y, x12 = rect.x + rect.w, y12 = rect.y + rect.h, x21 = this.x, y21 = this.y, x22 = this.x + this.w, y22 = this.y + this.h;
        x_overlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21));
        y_overlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21));
        return x_overlap * y_overlap !== 0;
    }, toJSON: function() {
        return{width: this.w, height: this.h, x: this.x, y: this.y};
    }});
draw2d.geo.Ray = draw2d.geo.Point.extend({NAME: "draw2d.geo.Ray", init: function(x, y) {
        this._super(x, y);
    }, isHorizontal: function() {
        return this.x != 0;
    }, similarity: function(otherRay) {
        return Math.abs(this.dot(otherRay));
    }, getAveraged: function(otherRay) {
        return new draw2d.geo.Ray((this.x + otherRay.x) / 2, (this.y + otherRay.y) / 2);
    }});
draw2d.command.CommandType = Class.extend({NAME: "draw2d.command.CommandType", init: function(policy) {
        this.policy = policy;
    }, getPolicy: function() {
        return this.policy;
    }});
draw2d.command.CommandType.DELETE = "DELETE";
draw2d.command.CommandType.MOVE = "MOVE";
draw2d.command.CommandType.CONNECT = "CONNECT";
draw2d.command.CommandType.MOVE_BASEPOINT = "MOVE_BASEPOINT";
draw2d.command.CommandType.MOVE_JUNCTION = "MOVE_JUNCTION";
draw2d.command.CommandType.MOVE_GHOST_JUNCTION = "MOVE_GHOST_JUNCTION";
draw2d.command.CommandType.RESIZE = "RESIZE";
draw2d.command.CommandType.RESET = "RESET";
draw2d.command.Command = Class.extend({NAME: "draw2d.command.Command", init: function(label) {
        this.label = label;
    }, getLabel: function() {
        return this.label;
    }, canExecute: function() {
        return true;
    }, execute: function() {
    }, cancel: function() {
    }, undo: function() {
    }, redo: function() {
    }});
draw2d.command.CommandCollection = draw2d.command.Command.extend({NAME: "draw2d.command.CommandCollection", init: function() {
        this._super("Execute Commands");
        this.commands = new draw2d.util.ArrayList();
    }, add: function(command) {
        this.commands.add(command);
    }, canExecute: function() {
        var canExec = false;
        this.commands.each(function(i, cmd) {
            canExec = canExec || cmd.canExecute();
        });
        return canExec;
    }, execute: function() {
        this.commands.each(function(i, cmd) {
            cmd.execute();
        });
    }, redo: function() {
        this.commands.each(function(i, cmd) {
            cmd.redo();
        });
    }, undo: function() {
        this.commands.reverse();
        this.commands.each(function(i, cmd) {
            cmd.undo();
        });
        this.commands.reverse();
    }});
draw2d.command.CommandStack = Class.extend({NAME: "draw2d.command.CommandStack", init: function() {
        this.undostack = [];
        this.redostack = [];
        this.maxundo = 50;
        this.transactionCommand = null;
        this.eventListeners = new draw2d.util.ArrayList();
        window.onpopstate = jQuery.proxy(function(event) {
            if (event.state === null) {
                return;
            }
        }, this);
    }, setUndoLimit: function(count) {
        this.maxundo = count;
    }, markSaveLocation: function() {
        this.undostack = [];
        this.redostack = [];
        this.notifyListeners(new draw2d.command.Command(), draw2d.command.CommandStack.POST_EXECUTE);
    }, execute: function(command) {
        if (command === null) {
            return;
        }
        if (typeof command === "undefined") {
            throw"Missing parameter [command] for method call CommandStack.execute";
        }
        if (command.canExecute() === false) {
            return;
        }
        if (this.transactionCommand !== null) {
            this.transactionCommand.add(command);
            return;
        }
        this.notifyListeners(command, draw2d.command.CommandStack.PRE_EXECUTE);
        this.undostack.push(command);
        command.execute();
        this.redostack = [];
        if (this.undostack.length > this.maxundo) {
            this.undostack = this.undostack.slice(this.undostack.length - this.maxundo);
        }
        this.notifyListeners(command, draw2d.command.CommandStack.POST_EXECUTE);
    }, startTransaction: function() {
        this.transactionCommand = new draw2d.command.CommandCollection();
    }, commitTransaction: function() {
        if (this.transactionCommand === null) {
            return;
        }
        var cmd = this.transactionCommand;
        this.transactionCommand = null;
        this.execute(cmd);
    }, undo: function() {
        var command = this.undostack.pop();
        if (command) {
            this.notifyListeners(command, draw2d.command.CommandStack.PRE_UNDO);
            this.redostack.push(command);
            command.undo();
            this.notifyListeners(command, draw2d.command.CommandStack.POST_UNDO);
        }
    }, redo: function() {
        var command = this.redostack.pop();
        if (command) {
            this.notifyListeners(command, draw2d.command.CommandStack.PRE_REDO);
            this.undostack.push(command);
            command.redo();
            this.notifyListeners(command, draw2d.command.CommandStack.POST_REDO);
        }
    }, getRedoLabel: function() {
        if (this.redostack.lenght === 0) {
            return"";
        }
        var command = this.redostack[this.redostack.length - 1];
        if (command) {
            return command.getLabel();
        }
        return"";
    }, getUndoLabel: function() {
        if (this.undostack.lenght === 0) {
            return"";
        }
        var command = this.undostack[this.undostack.length - 1];
        if (command) {
            return command.getLabel();
        }
        return"";
    }, canRedo: function() {
        return this.redostack.length > 0;
    }, canUndo: function() {
        return this.undostack.length > 0;
    }, addEventListener: function(listener) {
        if (listener instanceof draw2d.command.CommandStackEventListener) {
            this.eventListeners.add(listener);
        } else {
            if (typeof listener.stackChanged === "function") {
                this.eventListeners.add(listener);
            } else {
                if (typeof listener === "function") {
                    this.eventListeners.add({stackChanged: listener});
                } else {
                    throw"Object doesn't implement required callback interface [draw2d.command.CommandStackListener]";
                }
            }
        }
    }, removeEventListener: function(listener) {
        for (var i = 0; i < size; i++) {
            var entry = this.eventListeners.get(i);
            if (entry === listener || entry.stackChanged === listener) {
                this.eventListeners.remove(entry);
                return;
            }
        }
    }, notifyListeners: function(command, state) {
        var event = new draw2d.command.CommandStackEvent(this, command, state);
        var size = this.eventListeners.getSize();
        for (var i = 0; i < size; i++) {
            this.eventListeners.get(i).stackChanged(event);
        }
    }});
draw2d.command.CommandStack.PRE_EXECUTE = 1;
draw2d.command.CommandStack.PRE_REDO = 2;
draw2d.command.CommandStack.PRE_UNDO = 4;
draw2d.command.CommandStack.POST_EXECUTE = 8;
draw2d.command.CommandStack.POST_REDO = 16;
draw2d.command.CommandStack.POST_UNDO = 32;
draw2d.command.CommandStack.POST_INIT = 64;
draw2d.command.CommandStack.POST_MASK = draw2d.command.CommandStack.POST_EXECUTE | draw2d.command.CommandStack.POST_UNDO | draw2d.command.CommandStack.POST_REDO;
draw2d.command.CommandStack.PRE_MASK = draw2d.command.CommandStack.PRE_EXECUTE | draw2d.command.CommandStack.PRE_UNDO | draw2d.command.CommandStack.PRE_REDO;
draw2d.command.CommandStackEvent = Class.extend({NAME: "draw2d.command.CommandStackEvent", init: function(stack, command, details) {
        this.stack = stack;
        this.command = command;
        this.details = details;
    }, getStack: function() {
        return this.stack;
    }, getCommand: function() {
        return this.command;
    }, getDetails: function() {
        return this.details;
    }, isPostChangeEvent: function() {
        return 0 != (this.getDetails() & draw2d.command.CommandStack.POST_MASK);
    }, isPreChangeEvent: function() {
        return 0 != (this.getDetails() & draw2d.command.CommandStack.PRE_MASK);
    }});
draw2d.command.CommandStackEventListener = Class.extend({NAME: "draw2d.command.CommandStackEventListener", init: function() {
    }, stackChanged: function(event) {
    }});
draw2d.command.CommandMove = draw2d.command.Command.extend({NAME: "draw2d.command.CommandMove", init: function(figure, x, y) {
        this._super("Shape moved");
        this.figure = figure;
        if (typeof x === "undefined") {
            this.oldX = figure.getX();
            this.oldY = figure.getY();
        } else {
            this.oldX = x;
            this.oldY = y;
        }
    }, setStartPosition: function(x, y) {
        this.oldX = x;
        this.oldY = y;
    }, setPosition: function(x, y) {
        this.newX = x;
        this.newY = y;
    }, canExecute: function() {
        return this.newX != this.oldX || this.newY != this.oldY;
    }, execute: function() {
        this.redo();
    }, undo: function() {
        this.figure.setPosition(this.oldX, this.oldY);
    }, redo: function() {
        this.figure.setPosition(this.newX, this.newY);
    }});
draw2d.command.CommandMoveLine = draw2d.command.Command.extend({NAME: "draw2d.command.CommandMoveLine", init: function(figure) {
        this._super("Line moved");
        this.line = figure;
        this.dx = 0;
        this.dy = 0;
    }, setTranslation: function(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }, canExecute: function() {
        return this.dx !== 0 && this.dy !== 0;
    }, execute: function() {
        this.redo();
    }, undo: function() {
        this.line.getPoints().each(jQuery.proxy(function(i, e) {
            e.translate(-this.dx, -this.dy);
        }, this));
        this.line.svgPathString = null;
        this.line.repaint();
    }, redo: function() {
        this.line.getPoints().each(jQuery.proxy(function(i, e) {
            e.translate(this.dx, this.dy);
        }, this));
        this.line.svgPathString = null;
        this.line.repaint();
    }});
draw2d.command.CommandMoveJunction = draw2d.command.Command.extend({NAME: "draw2d.command.CommandMoveJunction", init: function(line) {
        this._super("Junction moved");
        this.line = line;
        this.index = -1;
        this.newPoint = null;
    }, setIndex: function(index) {
        this.index = index;
        this.origPoint = this.line.getPoints().get(this.index).clone();
    }, updatePosition: function(x, y) {
        this.newPoint = new draw2d.geo.Point(x, y);
    }, canExecute: function() {
        return this.index !== -1 && this.newPoint !== null;
    }, execute: function() {
        this.redo();
    }, undo: function() {
        this.line.setJunctionPoint(this.index, this.origPoint.x, this.origPoint.y);
    }, redo: function() {
        this.line.setJunctionPoint(this.index, this.newPoint.x, this.newPoint.y);
    }});
draw2d.command.CommandResize = draw2d.command.Command.extend({NAME: "draw2d.command.CommandResize", init: function(figure, width, height) {
        this._super("Resize Shape");
        this.figure = figure;
        if (typeof width === "undefined") {
            this.oldWidth = figure.getWidth();
            this.oldHeight = figure.getHeight();
        } else {
            this.oldWidth = width;
            this.oldHeight = height;
        }
    }, setDimension: function(width, height) {
        this.newWidth = width | 0;
        this.newHeight = height | 0;
    }, canExecute: function() {
        return this.newWidth != this.oldWidth || this.newHeight != this.oldHeight;
    }, execute: function() {
        this.redo();
    }, undo: function() {
        this.figure.setDimension(this.oldWidth, this.oldHeight);
    }, redo: function() {
        this.figure.setDimension(this.newWidth, this.newHeight);
    }});
draw2d.command.CommandConnect = draw2d.command.Command.extend({NAME: "draw2d.command.CommandConnect", init: function(canvas, source, target, dropTarget) {
        this._super("Connecting Ports");
        this.canvas = canvas;
        this.source = source;
        this.target = target;
        this.connection = null;
        this.dropTarget = dropTarget;
    }, setConnection: function(connection) {
        this.connection = connection;
    }, execute: function() {
        var optionalCallback = jQuery.proxy(function(conn) {
            this.connection = conn;
            this.connection.setSource(this.source);
            this.connection.setTarget(this.target);
            this.canvas.addFigure(this.connection);
        }, this);
        if (this.connection === null) {
            var result = draw2d.Connection.createConnection(this.source, this.target, optionalCallback, this.dropTarget);
            if (typeof result === "undefined") {
                return;
            } else {
                this.connection = result;
            }
        }
        optionalCallback(this.connection);
    }, redo: function() {
        this.canvas.addFigure(this.connection);
        this.connection.reconnect();
    }, undo: function() {
        this.canvas.removeFigure(this.connection);
    }});
draw2d.command.CommandReconnect = draw2d.command.Command.extend({NAME: "draw2d.command.CommandReconnect", init: function(con) {
        this._super("Connecting Ports");
        this.con = con;
        this.oldSourcePort = con.getSource();
        this.oldTargetPort = con.getTarget();
        this.oldRouter = con.getRouter();
    }, canExecute: function() {
        return true;
    }, setNewPorts: function(source, target) {
        this.newSourcePort = source;
        this.newTargetPort = target;
    }, execute: function() {
        this.redo();
    }, cancel: function() {
        this.con.setSource(this.oldSourcePort);
        this.con.setTarget(this.oldTargetPort);
        this.con.setRouter(this.oldRouter);
    }, undo: function() {
        this.con.setSource(this.oldSourcePort);
        this.con.setTarget(this.oldTargetPort);
        this.con.setRouter(this.oldRouter);
    }, redo: function() {
        this.con.setSource(this.newSourcePort);
        this.con.setTarget(this.newTargetPort);
        this.con.setRouter(this.oldRouter);
    }});
draw2d.command.CommandDelete = draw2d.command.Command.extend({init: function(figure) {
        this._super("Deleting Shape");
        this.parent = figure.getParent();
        this.figure = figure;
        this.canvas = figure.getCanvas();
        this.connections = null;
    }, execute: function() {
        this.redo();
    }, undo: function() {
        this.canvas.addFigure(this.figure);
        if (this.figure instanceof draw2d.Connection) {
            this.figure.reconnect();
        }
        this.canvas.setCurrentSelection(this.figure);
        if (this.parent !== null) {
            this.parent.addChild(this.figure);
        }
        for (var i = 0; i < this.connections.getSize(); ++i) {
            this.canvas.addFigure(this.connections.get(i));
            this.connections.get(i).reconnect();
        }
    }, redo: function() {
        this.canvas.setCurrentSelection(null);
        if (this.figure instanceof draw2d.shape.node.Node && this.connections === null) {
            this.connections = new draw2d.util.ArrayList();
            var ports = this.figure.getPorts();
            for (var i = 0; i < ports.getSize(); i++) {
                var port = ports.get(i);
                for (var c = 0, c_size = port.getConnections().getSize(); c < c_size; c++) {
                    if (!this.connections.contains(port.getConnections().get(c))) {
                        this.connections.add(port.getConnections().get(c));
                    }
                }
            }
            for (var i = 0; i < ports.getSize(); i++) {
                var port = ports.get(i);
                port.setCanvas(null);
            }
        }
        this.canvas.removeFigure(this.figure);
        if (this.connections === null) {
            this.connections = new draw2d.util.ArrayList();
        }
        if (this.parent !== null) {
            this.parent.removeChild(this.figure);
        }
        for (var i = 0; i < this.connections.getSize(); ++i) {
            this.canvas.removeFigure(this.connections.get(i));
        }
    }});
draw2d.command.CommandAdd = draw2d.command.Command.extend({init: function(canvas, figure, x, y) {
        this._super("Add Shape");
        this.figure = figure;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
    }, execute: function() {
        this.canvas.addFigure(this.figure, this.x, this.y);
    }, redo: function() {
        this.execute();
    }, undo: function() {
        this.canvas.removeFigure(this.figure);
    }});
draw2d.command.CommandAddJunctionPoint = draw2d.command.Command.extend({NAME: "draw2d.command.CommandAddJunctionPoint", init: function(line, index, x, y) {
        this._super("Junction point add");
        this.line = line;
        this.index = index;
        this.newPoint = new draw2d.geo.Point(x, y);
    }, canExecute: function() {
        return true;
    }, execute: function() {
        this.redo();
    }, undo: function() {
        this.line.removeJunctionPointAt(this.index);
    }, redo: function() {
        this.line.insertJunctionPointAt(this.index, this.newPoint.x, this.newPoint.y);
    }});
draw2d.command.CommandRemoveJunctionPoint = draw2d.command.Command.extend({NAME: "draw2d.command.CommandRemoveJunctionPoint", init: function(line, index) {
        this._super("Junction point removed");
        this.line = line;
        this.index = index;
        this.oldPoint = line.getPoints().get(index).clone();
    }, canExecute: function() {
        return true;
    }, execute: function() {
        this.redo();
    }, undo: function() {
        this.line.insertJunctionPointAt(this.index, this.oldPoint.x, this.oldPoint.y);
    }, redo: function() {
        this.line.removeJunctionPointAt(this.index);
    }});
draw2d.layout.connection.ConnectionRouter = Class.extend({NAME: "draw2d.layout.connection.ConnectionRouter", init: function() {
    }, route: function(connection, oldJunctionPoints) {
        throw"subclasses must implement the method [ConnectionRouter.route]";
    }, onInstall: function(connection) {
    }, onUninstall: function(connection) {
    }, getPersistentAttributes: function(line, memento) {
        return memento;
    }, setPersistentAttributes: function(line, memento) {
    }});
draw2d.layout.connection.DirectRouter = draw2d.layout.connection.ConnectionRouter.extend({NAME: "draw2d.layout.connection.DirectRouter", init: function() {
        this._super();
    }, invalidate: function() {
    }, route: function(connection, oldJunctionPoints) {
        var start = connection.getStartPoint();
        var end = connection.getEndPoint();
        connection.addPoint(start);
        connection.addPoint(end);
        var path = ["M", start.x, " ", start.y];
        path.push("L", end.x, " ", end.y);
        connection.svgPathString = path.join("");
    }});
draw2d.layout.connection.JunctionRouter = draw2d.layout.connection.ConnectionRouter.extend({NAME: "draw2d.layout.connection.JunctionRouter", init: function() {
        this._super();
    }, invalidate: function() {
    }, route: function(connection, oldJunctionPoints) {
        var start = connection.getStartPoint();
        var end = connection.getEndPoint();
        var count = oldJunctionPoints.getSize() - 1;
        connection.addPoint(start);
        for (var i = 1; i < count; i++) {
            connection.addPoint(oldJunctionPoints.get(i));
        }
        connection.addPoint(end);
        var ps = connection.getPoints();
        length = ps.getSize();
        var p = ps.get(0);
        var path = ["M", p.x, " ", p.y];
        for (var i = 1; i < length; i++) {
            p = ps.get(i);
            path.push("L", p.x, " ", p.y);
        }
        connection.svgPathString = path.join("");
    }, getPersistentAttributes: function(line, memento) {
        memento.junction = [];
        line.getPoints().each(function(i, e) {
            memento.junction.push({x: e.x, y: e.y});
        });
        return memento;
    }, setPersistentAttributes: function(line, memento) {
        if (typeof memento.junction !== "undefined") {
            line.oldPoint = null;
            line.lineSegments = new draw2d.util.ArrayList();
            line.basePoints = new draw2d.util.ArrayList();
            jQuery.each(memento.junction, jQuery.proxy(function(i, e) {
                line.addPoint(e.x, e.y);
            }, this));
        }
    }});
draw2d.layout.connection.ManhattanConnectionRouter = draw2d.layout.connection.ConnectionRouter.extend({NAME: "draw2d.layout.connection.ManhattanConnectionRouter", MINDIST: 20, TOL: 0.1, TOLxTOL: 0.01, TOGGLE_DIST: 5, init: function() {
        this._super();
    }, route: function(conn, oldJunctionPoints) {
        var fromPt = conn.getStartPoint();
        var fromDir = conn.getSource().getConnectionDirection(conn, conn.getTarget());
        var toPt = conn.getEndPoint();
        var toDir = conn.getTarget().getConnectionDirection(conn, conn.getSource());
        this._route(conn, toPt, toDir, fromPt, fromDir);
        var ps = conn.getPoints();
        var p = ps.get(0);
        var path = ["M", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5];
        for (var i = 1; i < ps.getSize(); i++) {
            p = ps.get(i);
            path.push("L", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5);
        }
        conn.svgPathString = path.join("");
    }, _route: function(conn, fromPt, fromDir, toPt, toDir) {
        var UP = 0;
        var RIGHT = 1;
        var DOWN = 2;
        var LEFT = 3;
        var xDiff = fromPt.x - toPt.x;
        var yDiff = fromPt.y - toPt.y;
        var point;
        var dir;
        if (((xDiff * xDiff) < (this.TOLxTOL)) && ((yDiff * yDiff) < (this.TOLxTOL))) {
            conn.addPoint(new draw2d.geo.Point(toPt.x, toPt.y));
            return;
        }
        if (fromDir === LEFT) {
            if ((xDiff > 0) && ((yDiff * yDiff) < this.TOL) && (toDir === RIGHT)) {
                point = toPt;
                dir = toDir;
            } else {
                if (xDiff < 0) {
                    point = new draw2d.geo.Point(fromPt.x - this.MINDIST, fromPt.y);
                } else {
                    if (((yDiff > 0) && (toDir === DOWN)) || ((yDiff < 0) && (toDir === UP))) {
                        point = new draw2d.geo.Point(toPt.x, fromPt.y);
                    } else {
                        if (fromDir == toDir) {
                            var pos = Math.min(fromPt.x, toPt.x) - this.MINDIST;
                            point = new draw2d.geo.Point(pos, fromPt.y);
                        } else {
                            point = new draw2d.geo.Point(fromPt.x - (xDiff / 2), fromPt.y);
                        }
                    }
                }
                if (yDiff > 0) {
                    dir = UP;
                } else {
                    dir = DOWN;
                }
            }
        } else {
            if (fromDir === RIGHT) {
                if ((xDiff < 0) && ((yDiff * yDiff) < this.TOL) && (toDir === LEFT)) {
                    point = toPt;
                    dir = toDir;
                } else {
                    if (xDiff > 0) {
                        point = new draw2d.geo.Point(fromPt.x + this.MINDIST, fromPt.y);
                    } else {
                        if (((yDiff > 0) && (toDir === DOWN)) || ((yDiff < 0) && (toDir === UP))) {
                            point = new draw2d.geo.Point(toPt.x, fromPt.y);
                        } else {
                            if (fromDir === toDir) {
                                var pos = Math.max(fromPt.x, toPt.x) + this.MINDIST;
                                point = new draw2d.geo.Point(pos, fromPt.y);
                            } else {
                                point = new draw2d.geo.Point(fromPt.x - (xDiff / 2), fromPt.y);
                            }
                        }
                    }
                    if (yDiff > 0) {
                        dir = UP;
                    } else {
                        dir = DOWN;
                    }
                }
            } else {
                if (fromDir === DOWN) {
                    if (((xDiff * xDiff) < this.TOL) && (yDiff < 0) && (toDir === UP)) {
                        point = toPt;
                        dir = toDir;
                    } else {
                        if (yDiff > 0) {
                            point = new draw2d.geo.Point(fromPt.x, fromPt.y + this.MINDIST);
                        } else {
                            if (((xDiff > 0) && (toDir === RIGHT)) || ((xDiff < 0) && (toDir === LEFT))) {
                                point = new draw2d.geo.Point(fromPt.x, toPt.y);
                            } else {
                                if (fromDir === toDir) {
                                    var pos = Math.max(fromPt.y, toPt.y) + this.MINDIST;
                                    point = new draw2d.geo.Point(fromPt.x, pos);
                                } else {
                                    point = new draw2d.geo.Point(fromPt.x, fromPt.y - (yDiff / 2));
                                }
                            }
                        }
                        if (xDiff > 0) {
                            dir = LEFT;
                        } else {
                            dir = RIGHT;
                        }
                    }
                } else {
                    if (fromDir === UP) {
                        if (((xDiff * xDiff) < this.TOL) && (yDiff > 0) && (toDir === DOWN)) {
                            point = toPt;
                            dir = toDir;
                        } else {
                            if (yDiff < 0) {
                                point = new draw2d.geo.Point(fromPt.x, fromPt.y - this.MINDIST);
                            } else {
                                if (((xDiff > 0) && (toDir === RIGHT)) || ((xDiff < 0) && (toDir === LEFT))) {
                                    point = new draw2d.geo.Point(fromPt.x, toPt.y);
                                } else {
                                    if (fromDir === toDir) {
                                        var pos = Math.min(fromPt.y, toPt.y) - this.MINDIST;
                                        point = new draw2d.geo.Point(fromPt.x, pos);
                                    } else {
                                        point = new draw2d.geo.Point(fromPt.x, fromPt.y - (yDiff / 2));
                                    }
                                }
                            }
                            if (xDiff > 0) {
                                dir = LEFT;
                            } else {
                                dir = RIGHT;
                            }
                        }
                    }
                }
            }
        }
        this._route(conn, point, dir, toPt, toDir);
        conn.addPoint(fromPt);
    }});
draw2d.layout.connection.ManhattanBridgedConnectionRouter = draw2d.layout.connection.ManhattanConnectionRouter.extend({NAME: "draw2d.layout.connection.ManhattanBridgedConnectionRouter", BRIDGE_HORIZONTAL_LR: " r 0 0 3 -4 7 -4 10 0 13 0 ", BRIDGE_HORIZONTAL_RL: " r 0 0 -3 -4 -7 -4 -10 0 -13 0 ", init: function() {
        this._super();
    }, route: function(conn, oldJunctionPoints) {
        var fromPt = conn.getStartPoint();
        var fromDir = conn.getSource().getConnectionDirection(conn, conn.getTarget());
        var toPt = conn.getEndPoint();
        var toDir = conn.getTarget().getConnectionDirection(conn, conn.getSource());
        this._route(conn, toPt, toDir, fromPt, fromDir);
        var intersectionsASC = conn.getCanvas().getIntersection(conn).sort("x");
        var intersectionsDESC = intersectionsASC.clone().reverse();
        var intersectionForCalc = intersectionsASC;
        var i = 0;
        var ps = conn.getPoints();
        var p = ps.get(0);
        var path = ["M", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5];
        var oldP = p;
        for (i = 1; i < ps.getSize(); i++) {
            p = ps.get(i);
            var bridgeWidth = 5;
            var bridgeCode = this.BRIDGE_HORIZONTAL_LR;
            if (oldP.x > p.x) {
                intersectionForCalc = intersectionsDESC;
                bridgeCode = this.BRIDGE_HORIZONTAL_RL;
                bridgeWidth = -bridgeWidth;
            }
            intersectionForCalc.each(function(ii, interP) {
                if (interP.justTouching == false && draw2d.shape.basic.Line.hit(1, oldP.x, oldP.y, p.x, p.y, interP.x, interP.y) === true) {
                    if (p.y === interP.y) {
                        path.push(" L", ((interP.x - bridgeWidth) | 0) + 0.5, " ", (interP.y | 0) + 0.5);
                        path.push(bridgeCode);
                    }
                }
            });
            path.push(" L", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5);
            oldP = p;
        }
        conn.svgPathString = path.join("");
    }});
draw2d.layout.connection.CircuitConnectionRouter = draw2d.layout.connection.ManhattanConnectionRouter.extend({NAME: "draw2d.layout.connection.CircuitConnectionRouter", init: function() {
        this._super();
        this.setBridgeRadius(4);
        this.setJunctionRadius(2);
        this.abortRoutingOnFirstJunctionNode = false;
    }, onInstall: function(connection) {
    }, onUninstall: function(connection) {
        if (typeof connection.junctionNodes !== "undefined" && connection.junctionNodes !== null) {
            connection.junctionNodes.remove();
            connection.junctionNodes = null;
        }
    }, setJunctionRadius: function(radius) {
        this.junctionRadius = radius;
    }, setBridgeRadius: function(radius) {
        this.bridgeRadius = radius;
        this.bridge_LR = [" r", 0.5, -0.5, radius - (radius / 2), -(radius - radius / 4), radius, -radius, radius + (radius / 2), -(radius - radius / 4), radius * 2, "0 "].join(" ");
        this.bridge_RL = [" r", -0.5, -0.5, -(radius - (radius / 2)), -(radius - radius / 4), -radius, -radius, -(radius + (radius / 2)), -(radius - radius / 4), -radius * 2, "0 "].join(" ");
    }, route: function(conn, oldJunctionPoints) {
        var fromPt = conn.getStartPoint();
        var fromDir = conn.getSource().getConnectionDirection(conn, conn.getTarget());
        var toPt = conn.getEndPoint();
        var toDir = conn.getTarget().getConnectionDirection(conn, conn.getSource());
        this._route(conn, toPt, toDir, fromPt, fromDir);
        var intersectionsASC = conn.getCanvas().getIntersection(conn).sort("x");
        var intersectionsDESC = intersectionsASC.clone().reverse();
        var intersectionForCalc = intersectionsASC;
        var i = 0;
        if (typeof conn.junctionNodes !== "undefined" && conn.junctionNodes !== null) {
            conn.junctionNodes.remove();
        }
        conn.junctionNodes = conn.canvas.paper.set();
        var ps = conn.getPoints();
        var p = ps.get(0);
        var path = ["M", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5];
        var oldP = p;
        var bridgeWidth = null;
        var bridgeCode = null;
        var lastJunctionNode = null;
        for (i = 1; i < ps.getSize(); i++) {
            p = ps.get(i);
            if (oldP.x > p.x) {
                intersectionForCalc = intersectionsDESC;
                bridgeCode = this.bridge_RL;
                bridgeWidth = -this.bridgeRadius;
            } else {
                intersectionForCalc = intersectionsASC;
                bridgeCode = this.bridge_LR;
                bridgeWidth = this.bridgeRadius;
            }
            intersectionForCalc.each(jQuery.proxy(function(ii, interP) {
                if (draw2d.shape.basic.Line.hit(1, oldP.x, oldP.y, p.x, p.y, interP.x, interP.y) === true) {
                    if (conn.sharingPorts(interP.other)) {
                        var other = interP.other;
                        var otherZ = other.getZOrder();
                        var connZ = conn.getZOrder();
                        if (connZ < otherZ) {
                            var junctionNode = conn.canvas.paper.ellipse(interP.x, interP.y, this.junctionRadius, this.junctionRadius).attr({fill: conn.lineColor.hash()});
                            conn.junctionNodes.push(junctionNode);
                            if (this.abortRoutingOnFirstJunctionNode === true) {
                                if (conn.getSource() == other.getSource() || conn.getSource() == other.getTarget()) {
                                    path = ["M", (interP.x | 0) + 0.5, " ", (interP.y | 0) + 0.5];
                                    if (lastJunctionNode !== null) {
                                        lastJunctionNode.remove();
                                        conn.junctionNodes.exclude(lastJunctionNode);
                                    }
                                }
                                lastJunctionNode = junctionNode;
                            }
                        }
                    } else {
                        if (p.y === interP.y) {
                            path.push(" L", ((interP.x - bridgeWidth) | 0) + 0.5, " ", (interP.y | 0) + 0.5);
                            path.push(bridgeCode);
                        }
                    }
                }
            }, this));
            path.push(" L", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5);
            oldP = p;
        }
        conn.svgPathString = path.join("");
    }});
draw2d.layout.connection.SplineConnectionRouter = draw2d.layout.connection.ManhattanConnectionRouter.extend({NAME: "draw2d.layout.connection.SplineConnectionRouter", init: function() {
        this._super();
        this.spline = new draw2d.util.spline.CubicSpline();
        this.MINDIST = 50, this.cheapRouter = null;
    }, route: function(conn, oldJunctionPoints) {
        var i = 0;
        var fromPt = conn.getStartPoint();
        var fromDir = conn.getSource().getConnectionDirection(conn, conn.getTarget());
        var toPt = conn.getEndPoint();
        var toDir = conn.getTarget().getConnectionDirection(conn, conn.getSource());
        this._route(conn, toPt, toDir, fromPt, fromDir);
        var ps = conn.getPoints();
        conn.oldPoint = null;
        conn.lineSegments = new draw2d.util.ArrayList();
        conn.basePoints = new draw2d.util.ArrayList();
        var splinePoints = this.spline.generate(ps, 8);
        splinePoints.each(function(i, e) {
            conn.addPoint(e);
        });
        var ps = conn.getPoints();
        length = ps.getSize();
        var p = ps.get(0);
        var path = ["M", p.x, " ", p.y];
        for (i = 1; i < length; i++) {
            p = ps.get(i);
            path.push("L", p.x, " ", p.y);
        }
        conn.svgPathString = path.join("");
    }});
draw2d.layout.connection.FanConnectionRouter = draw2d.layout.connection.DirectRouter.extend({NAME: "draw2d.layout.connection.FanConnectionRouter", init: function() {
        this._super();
    }, route: function(conn, oldJunctionPoints) {
        var lines = conn.getSource().getConnections();
        var connections = new draw2d.util.ArrayList();
        var index = 0;
        for (var i = 0; i < lines.getSize(); i++) {
            var figure = lines.get(i);
            if (figure.getTarget() === conn.getTarget() || figure.getSource() === conn.getTarget()) {
                connections.add(figure);
                if (conn === figure) {
                    index = connections.getSize();
                }
            }
        }
        if (connections.getSize() > 1) {
            this.routeCollision(conn, index);
        } else {
            this._super(conn);
        }
    }, routeCollision: function(conn, index) {
        var start = conn.getStartPoint();
        var end = conn.getEndPoint();
        var separation = 15;
        var midPoint = new draw2d.geo.Point((end.x + start.x) / 2, (end.y + start.y) / 2);
        var position = end.getPosition(start);
        var ray;
        if (position == draw2d.geo.PositionConstants.SOUTH || position == draw2d.geo.PositionConstants.EAST) {
            ray = new draw2d.geo.Point(end.x - start.x, end.y - start.y);
        } else {
            ray = new draw2d.geo.Point(start.x - end.x, start.y - end.y);
        }
        var length = Math.sqrt(ray.x * ray.x + ray.y * ray.y);
        var xSeparation = separation * ray.x / length;
        var ySeparation = separation * ray.y / length;
        var bendPoint;
        if (index % 2 === 0) {
            bendPoint = new draw2d.geo.Point(midPoint.x + (index / 2) * (-1 * ySeparation), midPoint.y + (index / 2) * xSeparation);
        } else {
            bendPoint = new draw2d.geo.Point(midPoint.x + (index / 2) * ySeparation, midPoint.y + (index / 2) * (-1 * xSeparation));
        }
        conn.addPoint(start);
        conn.addPoint(bendPoint);
        conn.addPoint(end);
        var ps = conn.getPoints();
        var p = ps.get(0);
        var path = ["M", p.x, " ", p.y];
        for (var i = 1; i < ps.getSize(); i++) {
            p = ps.get(i);
            path.push("L", p.x, " ", p.y);
        }
        conn.svgPathString = path.join("");
    }});
var ROUTER_RECTS = null;
draw2d.layout.connection.MazeConnectionRouter = draw2d.layout.connection.ConnectionRouter.extend({NAME: "draw2d.layout.connection.MazeConnectionRouter", init: function() {
        this._super();
        this.useSpline = false;
        this.useSimplify = true;
        this.useSimplifyValue = 2;
        this.useDebug = false;
        this.useShift = 4;
        this.portOutletOffset = 15;
        this.finder = new PF.JumpPointFinder({allowDiagonal: false, dontCrossCorners: true});
    }, route: function(conn, oldJunctionPoints) {
        var fromPt = conn.getStartPoint();
        var fromDir = conn.getSource().getConnectionDirection(conn, conn.getTarget());
        var toPt = conn.getEndPoint();
        var toDir = conn.getTarget().getConnectionDirection(conn, conn.getSource());
        this._route(conn, toPt, toDir, fromPt, fromDir);
        var ps = conn.getPoints();
        var p = ps.get(0);
        var path = ["M", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5];
        for (var i = 1; i < ps.getSize(); i++) {
            p = ps.get(i);
            path.push("L", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5);
        }
        conn.svgPathString = path.join("");
    }, _route: function(conn, fromPt, fromDir, toPt, toDir) {
        var shift = this.useShift;
        oldToPt = toPt;
        oldFromPt = fromPt;
        fromPt = this.getAddjustedPoint(fromPt, fromDir, this.portOutletOffset);
        toPt = this.getAddjustedPoint(toPt, toDir, this.portOutletOffset);
        var grid = this.generateNoGoGrid(conn, fromPt, fromDir, toPt, toDir);
        var path = this.finder.findPath(fromPt.x >> shift, fromPt.y >> shift, toPt.x >> shift, toPt.y >> shift, grid);
        jQuery.each(path, function(i, e) {
            e.x = e[0] = e[0] << shift;
            e.y = e[1] = e[1] << shift;
        });
        if (this.useDebug) {
            if (ROUTER_RECTS !== null) {
                ROUTER_RECTS.remove();
            }
            ROUTER_RECTS = conn.canvas.paper.set();
            for (var i = 0; i < grid.width; i++) {
                for (var j = 0; j < grid.height; j++) {
                    if (!grid.isWalkableAt(i, j)) {
                        ROUTER_RECTS.push(conn.canvas.paper.rect(i << shift, j << shift, 1 << shift, 1 << shift).attr({"fill": "red", "opacity": "0.1"}));
                    }
                }
            }
            ROUTER_RECTS.push(conn.canvas.paper.rect(fromPt.x - 3, fromPt.y - 3, 6, 6).attr({"fill": "#ff0000", "opacity": "0.8"}));
            ROUTER_RECTS.push(conn.canvas.paper.rect(toPt.x - 3, toPt.y - 3, 6, 6).attr({"fill": "#ff0000", "opacity": "0.8"}));
            jQuery.each(path, function(i, e) {
                ROUTER_RECTS.push(conn.canvas.paper.rect(e.x - 3, e.y - 3, 6, 6).attr({"fill": "#0000ff", "opacity": "0.8"}));
            });
            var p = path[0];
            var svgPathBefore = ["M", p.x, " ", p.y];
            for (var i = 1; i < path.length; i++) {
                p = path[i];
                svgPathBefore.push("L", p.x, " ", p.y);
            }
            svgPathBefore = svgPathBefore.join("");
            ROUTER_RECTS.push(conn.canvas.paper.path(svgPathBefore).attr({"stroke": "#0000ff"}));
        }
        this.adjustPath(fromPt, path, fromDir);
        path.reverse();
        this.adjustPath(toPt, path, toDir);
        path.reverse();
        jQuery.each(path, function(i, e) {
            e.x = e[0];
            e.y = e[1];
        });
        if (this.useSpline) {
            var p = new draw2d.util.ArrayList();
            p.add(oldFromPt);
            jQuery.each(path, function(i, e) {
                p.add(new draw2d.geo.Point(e[0], e[1]));
            });
            p.add(oldToPt);
            if (this.useDebug) {
                jQuery.each(path, function(i, e) {
                    ROUTER_RECTS.push(conn.canvas.paper.rect(e.x - 3, e.y - 3, 6, 6).attr({"fill": "#00ff00", "opacity": "0.8"}));
                });
                var pt = path[0];
                var svgPathBefore = ["M", pt.x, " ", pt.y];
                for (var i = 1; i < path.length; i++) {
                    pt = path[i];
                    svgPathBefore.push("L", pt.x, " ", pt.y);
                }
                svgPathBefore = svgPathBefore.join("");
                ROUTER_RECTS.push(conn.canvas.paper.path(svgPathBefore).attr({"stroke": "#00ff00"}));
            }
            this.spline = new draw2d.util.spline.CubicSpline();
            var splinePoints = this.spline.generate(p, 8);
            if (this.useSimplify) {
                path = [];
                splinePoints.each(function(i, e) {
                    path.push({x: e.x, y: e.y});
                });
                path = this.simplify(path, this.useSimplifyValue, true);
                jQuery.each(path, function(i, e) {
                    conn.addPoint(e.x, e.y);
                });
            } else {
                splinePoints.each(function(i, e) {
                    conn.addPoint(e);
                });
            }
        } else {
            if (this.useSimplify) {
                path = this.simplify(path, this.useSimplifyValue, true);
            }
            if (this.useDebug) {
                jQuery.each(path, function(i, e) {
                    ROUTER_RECTS.push(conn.canvas.paper.rect(e.x - 3, e.y - 3, 6, 6).attr({"fill": "#00ff00", "opacity": "0.8"}));
                });
                var p = path[0];
                var svgPathBefore = ["M", p.x, " ", p.y];
                for (var i = 1; i < path.length; i++) {
                    p = path[i];
                    svgPathBefore.push("L", p.x, " ", p.y);
                }
                svgPathBefore = svgPathBefore.join("");
                ROUTER_RECTS.push(conn.canvas.paper.path(svgPathBefore).attr({"stroke": "#00ff00"}));
            }
            conn.addPoint(oldFromPt);
            jQuery.each(path, function(i, e) {
                conn.addPoint(e[0], e[1]);
            });
            conn.addPoint(oldToPt);
        }
    }, generateNoGoGrid: function(conn, fromPt, fromDir, toPt, toDir) {
        var shift = this.useShift;
        var oneShift2 = (1 << shift) / 2;
        var canvasWidth = conn.getCanvas().paper.width >> shift;
        var canvasHeight = conn.getCanvas().paper.height >> shift;
        var grid = new PF.Grid(canvasWidth, canvasHeight);
        var figures = conn.getCanvas().getFigures();
        figures.each(function(i, e) {
            var box = e.getBoundingBox();
            if (box.hitTest(fromPt.x, fromPt.y) === true || box.hitTest(toPt.x, toPt.y)) {
                return;
            }
            var x = box.x >> shift;
            var y = box.y >> shift;
            if (x < 1 || y < 1) {
                return;
            }
            var r_orig = (box.x + box.w + oneShift2) >> shift;
            var b_orig = (box.y + box.h + oneShift2) >> shift;
            for (var i = x; i <= r_orig; i++) {
                for (var j = y; j <= b_orig; j++) {
                    grid.setWalkableAt(i, j, false);
                }
            }
        });
        var box = conn.getSource().getParent().getBoundingBox();
        if (toDir === 1 || toDir === 3) {
            var y = box.y >> shift;
            if (y > 0) {
                var b_orig = box.y + box.h;
                var i = (toPt.x >> shift);
                for (var j = y - 1; j << shift <= b_orig; j++) {
                    grid.setWalkableAt(i, j, true);
                }
            }
        } else {
            var x = box.x >> shift;
            if (x > 0) {
                var r_orig = box.x + box.w;
                var j = (toPt.x >> shift);
                for (var i = x - 1; i << shift <= r_orig; i++) {
                    grid.setWalkableAt(i, j, true);
                }
            }
        }
        box = conn.getTarget().getParent().getBoundingBox();
        if (fromDir === 1 || fromDir === 3) {
            var y = box.y >> shift;
            if (y > 0) {
                var b_orig = box.y + box.h;
                var i = (fromPt.x >> shift);
                for (var j = y - 1; j << shift <= b_orig; j++) {
                    grid.setWalkableAt(i, j, true);
                }
            }
        } else {
            var x = box.x >> shift;
            if (x > 0) {
                var r_orig = box.x + box.w;
                var j = (fromPt.x >> shift);
                for (var i = x - 1; i << shift <= r_orig; i++) {
                    grid.setWalkableAt(i, j, true);
                }
            }
        }
        return grid;
    }, getAddjustedPoint: function(pt, direction, adjustment) {
        switch (direction) {
            case 0:
                return new draw2d.geo.Point(pt.x, pt.y - adjustment);
            case 1:
                return new draw2d.geo.Point(pt.x + adjustment, pt.y);
            case 2:
                return new draw2d.geo.Point(pt.x, pt.y + adjustment);
            case 3:
                return new draw2d.geo.Point(pt.x - adjustment, pt.y);
        }
    }, adjustPath: function(pt, path, direction) {
        var shift = this.useShift;
        var x = pt.x >> shift;
        var y = pt.y >> shift;
        jQuery.each(path, function(i, e) {
            if (y === (e[1] >> shift)) {
                e[1] = pt.y;
            } else {
                return false;
            }
        });
        jQuery.each(path, function(i, e) {
            if (x === (e[0] >> shift)) {
                e[0] = pt.x;
            } else {
                return false;
            }
        });
    }, getSquareDistance: function(p1, p2) {
        var dx = p1.x - p2.x, dy = p1.y - p2.y;
        return dx * dx + dy * dy;
    }, getSquareSegmentDistance: function(p, p1, p2) {
        var x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y, t;
        if (dx !== 0 || dy !== 0) {
            t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x = p2.x;
                y = p2.y;
            } else {
                if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }
        }
        dx = p.x - x;
        dy = p.y - y;
        return dx * dx + dy * dy;
    }, simplifyRadialDistance: function(points, sqTolerance) {
        var i, len = points.length, point = null, prevPoint = points[0], newPoints = [prevPoint];
        for (i = 1; i < len; i++) {
            point = points[i];
            if (this.getSquareDistance(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }
        if (prevPoint !== point) {
            newPoints.push(point);
        }
        return newPoints;
    }, simplifyDouglasPeucker: function(points, sqTolerance) {
        var len = points.length, MarkerArray = (typeof Uint8Array !== undefined + "") ? Uint8Array : Array, markers = new MarkerArray(len), first = 0, last = len - 1, i, maxSqDist, sqDist, index, firstStack = [], lastStack = [], newPoints = [];
        markers[first] = markers[last] = 1;
        while (last) {
            maxSqDist = 0;
            for (i = first + 1; i < last; i++) {
                sqDist = this.getSquareSegmentDistance(points[i], points[first], points[last]);
                if (sqDist > maxSqDist) {
                    index = i;
                    maxSqDist = sqDist;
                }
            }
            if (maxSqDist > sqTolerance) {
                markers[index] = 1;
                firstStack.push(first);
                lastStack.push(index);
                firstStack.push(index);
                lastStack.push(last);
            }
            first = firstStack.pop();
            last = lastStack.pop();
        }
        for (i = 0; i < len; i++) {
            if (markers[i]) {
                newPoints.push(points[i]);
            }
        }
        return newPoints;
    }, simplify: function(points, tolerance, highestQuality) {
        var sqTolerance = (tolerance !== undefined) ? tolerance * tolerance : 1;
        if (!highestQuality) {
            points = this.simplifyRadialDistance(points, sqTolerance);
        }
        points = this.simplifyDouglasPeucker(points, sqTolerance);
        return points;
    }});
draw2d.layout.connection.MuteableManhattanConnectionRouter = draw2d.layout.connection.ManhattanConnectionRouter.extend({NAME: "draw2d.layout.connection.MuteableManhattanConnectionRouter", UP: new draw2d.geo.Ray(0, -1), DOWN: new draw2d.geo.Ray(0, 1), LEFT: new draw2d.geo.Ray(-1, 0), RIGHT: new draw2d.geo.Ray(1, 0), init: function() {
        this._super();
        this.rowsUsed = {};
        this.colsUsed = {};
        this.constraints = {};
        this.reservedInfo = {};
    }, route: function(conn, oldJunctionPoints) {
        this.rowsUsed = {};
        this.colsUsed = {};
        this.constraints = {};
        this.reservedInfo = {};
        var canvas = conn.getCanvas();
        var i;
        var startPoint = conn.getStartPoint();
        var endPoint = conn.getEndPoint();
        var start = new draw2d.geo.Ray(startPoint);
        var end = new draw2d.geo.Ray(endPoint);
        var average = new draw2d.geo.Ray((start.x + end.x) / 2, (start.y + end.y) / 2);
        var direction = new draw2d.geo.Ray(end.x - start.x, end.y - start.y);
        var startNormal = this.getStartDirection(conn);
        var endNormal = this.getEndDirection(conn);
        var positions = new draw2d.util.ArrayList();
        var horizontal = startNormal.isHorizontal();
        if (horizontal) {
            positions.add(start.y);
        } else {
            positions.add(start.x);
        }
        horizontal = !horizontal;
        if (startNormal.dot(endNormal) === 0) {
            if ((startNormal.dot(direction) >= 0) && (endNormal.dot(direction) <= 0)) {
            } else {
                if (startNormal.dot(direction) < 0) {
                    i = startNormal.similarity(start.getTranslated(startNormal.getScaled(10)));
                } else {
                    if (horizontal) {
                        i = average.y;
                    } else {
                        i = average.x;
                    }
                }
                positions.add(i);
                horizontal = !horizontal;
                if (endNormal.dot(direction) > 0) {
                    i = endNormal.similarity(end.getTranslated(endNormal.getScaled(10)));
                } else {
                    if (horizontal) {
                        i = average.y;
                    } else {
                        i = average.x;
                    }
                }
                positions.add(i);
                horizontal = !horizontal;
            }
        } else {
            if (startNormal.dot(endNormal) > 0) {
                if (startNormal.dot(direction) >= 0) {
                    i = startNormal.similarity(start.getTranslated(startNormal.getScaled(10)));
                } else {
                    i = endNormal.similarity(end.getTranslated(endNormal.getScaled(10)));
                }
                positions.add(i);
                horizontal = !horizontal;
            } else {
                if (startNormal.dot(direction) < 0) {
                    i = startNormal.similarity(start.getTranslated(startNormal.getScaled(10)));
                    positions.add(i);
                    horizontal = !horizontal;
                }
                if (this.isCycle(conn)) {
                    if (horizontal) {
                        i = conn.getSource().getParent().getBoundingBox().getTop() - 10;
                    } else {
                        i = conn.getSource().getParent().getBoundingBox().getRight() + 10;
                    }
                } else {
                    if (horizontal) {
                        var j = average.y;
                        var next = endNormal.similarity(end.getTranslated(endNormal.getScaled(10)));
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
                        if (figure == null) {
                            i = average.x;
                        } else {
                            i = Math.min(average.x, start.getTranslated(new draw2d.geo.Ray(3 * (figure.getBoundingBox().x - start.x) / 4, 0)).x);
                            i = Math.max(start.x, i);
                        }
                        i = this.adjust(conn, i);
                    }
                }
                positions.add(i);
                horizontal = !horizontal;
            }
        }
        if (horizontal) {
            positions.add(end.y);
        } else {
            positions.add(end.x);
        }
        this.processPositions(start, end, positions, startNormal.isHorizontal(), conn);
        var ps = conn.getPoints();
        var p = ps.get(0);
        var path = ["M", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5];
        for (var i = 1; i < ps.getSize(); i++) {
            p = ps.get(i);
            path.push("L", (p.x | 0) + 0.5, " ", (p.y | 0) + 0.5);
        }
        conn.svgPathString = path.join("");
    }, getColumnNear: function(connection, r, n, x) {
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
        if (r % 6 != 0) {
            r = r - (r % 6);
        }
        var i;
        while (proximity < r) {
            i = parseInt(r + proximity * direction);
            if (!(i in this.colsUsed)) {
                this.colsUsed[i] = i;
                this.reserveColumn(connection, i);
                return i;
            }
            if (i <= min) {
                return i + 6;
            }
            if (i >= max) {
                return i - 6;
            }
            if (direction === 1) {
                direction = -1;
            } else {
                direction = 1;
                proximity += 6;
            }
        }
        return r;
    }, getRowNear: function(connection, r, n, x) {
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
        if (r % 6 != 0) {
            r = r - (r % 6);
        }
        var i;
        while (proximity < r) {
            i = parseInt(r + proximity * direction);
            if (!(i in this.rowsUsed)) {
                this.rowsUsed[i] = i;
                this.reserveRow(connection, i);
                return i;
            }
            if (i <= min) {
                return i + 6;
            }
            if (i >= max) {
                return i - 6;
            }
            if (direction == 1) {
                direction = -1;
            } else {
                direction = 1;
                proximity += 6;
            }
        }
        return r;
    }, getEndDirection: function(conn) {
        var p = conn.getEndPoint();
        var rect = conn.getTarget().getParent().getBoundingBox();
        return this.getDirection(rect, p);
    }, getStartDirection: function(conn) {
        var p = conn.getStartPoint();
        var rect = conn.getSource().getParent().getBoundingBox();
        return this.getDirection(rect, p);
    }, getDirection: function(r, p) {
        var i = Math.abs(r.y - p.y);
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
    }, processPositions: function(start, end, positions, horizontal, conn) {
        this.removeReservedLines(conn);
        var pos = [];
        if (horizontal) {
            pos.push(start.x);
        } else {
            pos.oush(start.y);
        }
        var i;
        for (i = 0; i < positions.getSize(); i++) {
            pos.push(positions.get(i));
        }
        if (horizontal == (positions.getSize() % 2 == 1)) {
            pos.push(end.x);
        } else {
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
    }, removeReservedLines: function(connection) {
        var rInfo = this.reservedInfo[connection];
        if (typeof rInfo === "undefined" || rInfo === null) {
            return;
        }
        for (var i = 0; i < rInfo.reservedRows.getSize(); i++) {
            delete this.rowsUsed[rInfo.reservedRows.get(i)];
        }
        for (var i = 0; i < rInfo.reservedCols.getSize(); i++) {
            delete this.colsUsed[rInfo.reservedCols.get(i)];
        }
        delete this.reservedInfo[connection];
    }, reserveColumn: function(connection, column) {
        var info = this.reservedInfo[connection];
        if (typeof info === "undefined" || info === null) {
            info = {reservedCols: new draw2d.util.ArrayList(), reservedRows: new draw2d.util.ArrayList()};
            this.reservedInfo[connection] = info;
        }
        info.reservedCols.add(column);
    }, reserveRow: function(connection, row) {
        var info = this.reservedInfo[connection];
        if (typeof info === "undefined" || info === null) {
            info = {reservedCols: new draw2d.util.ArrayList(), reservedRows: new draw2d.util.ArrayList()};
            this.reservedInfo[connection] = info;
        }
        info.reservedRows.add(row);
    }, getConstraint: function(connection) {
        return this.constraints[connection];
    }, setConstraint: function(connection, constraint) {
        this.constraints[connection] = constraint;
    }, isCycle: function(conn) {
        var source = conn.getSource().getParent();
        var target = conn.getTarget().getParent();
        return source.id === target.id;
    }, getExcludingFigures: function(conn) {
        var excluding = new draw2d.util.ArrayList();
        excluding.add(conn.getSource().getParent());
        excluding.add(conn.getTarget().getParent());
        return excluding;
    }, findFirstFigureAtStraightLine: function(canvas, start, direction, excluding) {
        var figure = null;
        var figures = canvas.getFigures();
        figures.each(jQuery.proxy(function(i, child) {
            try {
                if (!excluding.contains(child)) {
                    var rect = child.getBoundingBox();
                    if (this.LEFT.equals(direction)) {
                        if (start.x > rect.x && start.y >= rect.y && start.y <= rect.y + rect.h) {
                            if (figure === null || rect.x > figure.getBoundingBox().x) {
                                figure = child;
                            }
                        }
                    } else {
                        if (this.RIGHT.equals(direction)) {
                            if (start.x < rect.x + rect.w && start.y >= rect.y && start.y <= rect.y + rect.h) {
                                if (figure == null || rect.x < figure.getBoundingBox().x) {
                                    figure = child;
                                }
                            }
                        } else {
                            if (this.UP.equals(direction)) {
                                if (start.y > rect.y && start.x >= rect.x && start.x <= rect.x + rect.w) {
                                    if (figure === null || rect.y > figure.getBoundingBox().y) {
                                        figure = child;
                                    }
                                }
                            } else {
                                if (this.DOWN.equals(direction)) {
                                    if (start.y < rect.y + rect.h && start.x >= rect.x && start.x <= rect.x + rect.w) {
                                        if (figure === null || rect.y < figure.getBoundingBox().y) {
                                            figure = child;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (exc) {
                console.log(exc);
            }
        }, this));
        return figure;
    }, adjust: function(connection, col) {
        var column = col;
        var start = connection.getSource().getPosition();
        var connections = connection.getCanvas().getLines();
        connections.each(function(i, conn) {
            try {
                if (conn === connection) {
                    return;
                }
                var end = conn.getTarget().getPosition();
                if (start.x < end.x && start.y == end.y) {
                    if (conn.getPoints().getMidpoint().x <= col) {
                        column = conn.getPoints().getMidpoint().x - 5;
                    }
                }
            } catch (exc) {
                console.log(exc);
            }
        });
        return column;
    }});
draw2d.layout.connection.SketchConnectionRouter = draw2d.layout.connection.MazeConnectionRouter.extend({NAME: "draw2d.layout.connection.SketchConnectionRouter", init: function() {
        this._super();
        this.useSpline = true;
        this.useShift = 5;
        this.useSimplifyValue = 0.2;
        this.finder = new PF.JumpPointFinder({allowDiagonal: false, dontCrossCorners: true});
    }});
draw2d.layout.mesh.MeshLayouter = Class.extend({init: function() {
    }, add: function(canvas, figure) {
        return new draw2d.util.ArrayList();
    }});
draw2d.layout.mesh.ExplodeLayouter = draw2d.layout.mesh.MeshLayouter.extend({MIN_MARGIN: 40, init: function() {
    }, add: function(canvas, figureToAdd) {
        var changes = [];
        changes[0] = {x: 0, y: 0};
        changes[1] = {x: 0, y: 0};
        changes[2] = {x: 0, y: 0};
        changes[3] = {x: 0, y: 0};
        changes[4] = {x: 0, y: 0};
        changes[5] = {x: 0, y: 0};
        changes[6] = {x: 0, y: 0};
        changes[7] = {x: 0, y: 0};
        changes[8] = {x: 0, y: 0};
        var boundingBox = figureToAdd.getBoundingBox();
        var figures = canvas.getFigures();
        var figure = null;
        var dis = 0;
        var oct = 0;
        var currentOctChanges = null;
        var i = 0;
        for (i = 0; i < figures.getSize(); i++) {
            figure = figures.get(i);
            if (figure !== figureToAdd) {
                dis = figure.getBoundingBox().getDistance(boundingBox);
                if (dis < this.MIN_MARGIN) {
                    oct = this.determineOctant(boundingBox, figure.getBoundingBox());
                    switch (oct) {
                        case 2:
                            changes[2].x = Math.max(changes[2].x, this.MIN_MARGIN - dis);
                            changes[3].x = Math.max(changes[3].x, this.MIN_MARGIN - dis);
                            changes[4].x = Math.max(changes[4].x, this.MIN_MARGIN - dis);
                            break;
                        case 3:
                            changes[2].x = Math.max(changes[2].x, this.MIN_MARGIN - dis);
                            changes[3].x = Math.max(changes[3].x, this.MIN_MARGIN - dis);
                            changes[4].x = Math.max(changes[4].x, this.MIN_MARGIN - dis);
                            break;
                        case 4:
                            changes[2].x = Math.max(changes[2].x, this.MIN_MARGIN - dis);
                            changes[3].x = Math.max(changes[3].x, this.MIN_MARGIN - dis);
                            changes[4].x = Math.max(changes[4].x, this.MIN_MARGIN - dis);
                            changes[4].y = Math.max(changes[4].y, this.MIN_MARGIN - dis);
                            changes[5].y = Math.max(changes[5].y, this.MIN_MARGIN - dis);
                            changes[6].y = Math.max(changes[6].y, this.MIN_MARGIN - dis);
                            break;
                        case 5:
                            changes[4].y = Math.max(changes[4].y, this.MIN_MARGIN - dis);
                            changes[5].y = Math.max(changes[5].y, this.MIN_MARGIN - dis);
                            changes[6].y = Math.max(changes[6].y, this.MIN_MARGIN - dis);
                            break;
                        case 6:
                            changes[4].y = Math.max(changes[4].y, this.MIN_MARGIN - dis);
                            changes[5].y = Math.max(changes[5].y, this.MIN_MARGIN - dis);
                            changes[6].y = Math.max(changes[6].y, this.MIN_MARGIN - dis);
                            break;
                        case 8:
                            dis = (boundingBox.getBottomRight().getDistance(figure.getBoundingBox().getTopLeft())) | 0;
                            changes[2].x = Math.max(changes[2].x, this.MIN_MARGIN + dis);
                            changes[3].x = Math.max(changes[3].x, this.MIN_MARGIN + dis);
                            changes[4].x = Math.max(changes[4].x, this.MIN_MARGIN + dis);
                            changes[4].y = Math.max(changes[4].y, this.MIN_MARGIN + dis);
                            changes[5].y = Math.max(changes[5].y, this.MIN_MARGIN + dis);
                            changes[6].y = Math.max(changes[6].y, this.MIN_MARGIN + dis);
                            changes[8].x = Math.max(changes[8].x, this.MIN_MARGIN + dis);
                    }
                }
            }
        }
        var result = new draw2d.util.ArrayList();
        for (i = 0; i < figures.getSize(); i++) {
            figure = figures.get(i);
            if (figure !== figureToAdd) {
                oct = this.determineOctant(boundingBox, figure.getBoundingBox());
                currentOctChanges = changes[oct];
                if (currentOctChanges.x !== 0 || currentOctChanges.y !== 0) {
                    result.add(new draw2d.layout.mesh.ProposedMeshChange(figure, currentOctChanges.x, currentOctChanges.y));
                }
            }
        }
        return result;
    }, determineOctant: function(r1, r2) {
        var ox = r1.x;
        var oy = r1.y;
        var ow = r1.w;
        var oh = r1.h;
        var cx = r2.x;
        var cy = r2.y;
        var cw = r2.w;
        var ch = r2.h;
        var oct = 0;
        if (cx + cw <= ox) {
            if ((cy + ch) <= oy) {
                oct = 0;
            } else {
                if (cy >= (oy + oh)) {
                    oct = 6;
                } else {
                    oct = 7;
                }
            }
        } else {
            if (cx >= ox + ow) {
                if (cy + ch <= oy) {
                    oct = 2;
                } else {
                    if (cy >= oy + oh) {
                        oct = 4;
                    } else {
                        oct = 3;
                    }
                }
            } else {
                if (cy + ch <= oy) {
                    oct = 1;
                } else {
                    if (cy >= oy + oh) {
                        oct = 5;
                    } else {
                        oct = 8;
                    }
                }
            }
        }
        return oct;
    }});
draw2d.layout.mesh.ProposedMeshChange = Class.extend({init: function(figure, x, y) {
        this.figure = figure;
        this.x = x;
        this.y = y;
    }, getFigure: function() {
        return this.figure;
    }, getX: function() {
        return this.x;
    }, getY: function() {
        return this.y;
    }});
draw2d.layout.locator.Locator = Class.extend({NAME: "draw2d.layout.locator.Locator", init: function(parentShape) {
        this.parent = parentShape;
    }, getParent: function() {
        return this.parent;
    }, setParent: function(parentShape) {
        this.parent = parentShape;
    }, relocate: function(index, figure) {
    }});
draw2d.layout.locator.PortLocator = draw2d.layout.locator.Locator.extend({NAME: "draw2d.layout.locator.PortLocator", init: function() {
        this._super();
    }, applyConsiderRotation: function(port, x, y) {
        var parent = port.getParent();
        var halfW = parent.getWidth() / 2;
        var halfH = parent.getHeight() / 2;
        var rotAngle = parent.getRotationAngle();
        var m = Raphael.matrix();
        m.rotate(rotAngle, halfW, halfH);
        if (rotAngle === 90 || rotAngle === 270) {
            var ratio = parent.getHeight() / parent.getWidth();
            m.scale(ratio, 1 / ratio, halfW, halfH);
        }
        port.setPosition(m.x(x, y), m.y(x, y));
    }});
draw2d.layout.locator.InputPortLocator = draw2d.layout.locator.PortLocator.extend({NAME: "draw2d.layout.locator.InputPortLocator", init: function() {
        this._super();
    }, relocate: function(index, figure) {
        var node = figure.getParent();
        var h = node.getHeight();
        var gap = h / (node.getInputPorts().getSize() + 1);
        this.applyConsiderRotation(figure, 0, gap * (index + 1));
    }});
draw2d.layout.locator.OutputPortLocator = draw2d.layout.locator.PortLocator.extend({NAME: "draw2d.layout.locator.OutputPortLocator", init: function() {
        this._super();
    }, relocate: function(index, figure) {
        var node = figure.getParent();
        var gap = node.getHeight() / (node.getOutputPorts().getSize() + 1);
        this.applyConsiderRotation(figure, node.getWidth(), gap * (index + 1));
    }});
draw2d.layout.locator.ConnectionLocator = draw2d.layout.locator.Locator.extend({NAME: "draw2d.layout.locator.ConnectionLocator", init: function(parentShape) {
        this._super(parentShape);
    }});
draw2d.layout.locator.ManhattanMidpointLocator = draw2d.layout.locator.ConnectionLocator.extend({NAME: "draw2d.layout.locator.ManhattanMidpointLocator", init: function(c) {
        this._super(c);
    }, relocate: function(index, target) {
        var conn = this.getParent();
        var points = conn.getPoints();
        var segmentIndex = Math.floor((points.getSize() - 2) / 2);
        if (points.getSize() <= segmentIndex + 1) {
            return;
        }
        var p1 = points.get(segmentIndex);
        var p2 = points.get(segmentIndex + 1);
        var x = ((p2.x - p1.x) / 2 + p1.x - target.getWidth() / 2) | 0;
        var y = ((p2.y - p1.y) / 2 + p1.y - target.getHeight() / 2) | 0;
        target.setPosition(x, y);
    }});
draw2d.layout.locator.PolylineMidpointLocator = draw2d.layout.locator.ManhattanMidpointLocator.extend({NAME: "draw2d.layout.locator.PolylineMidpointLocator", init: function(c) {
        this._super(c);
    }, relocate: function(index, target) {
        var conn = this.getParent();
        var points = conn.getPoints();
        if (points.getSize() % 2 === 0) {
            this._super(index, target);
        } else {
            var index = Math.floor(points.getSize() / 2);
            var p1 = points.get(index);
            target.setPosition(p1.x - (target.getWidth() / 2), p1.y - (target.getHeight() / 2));
        }
    }});
draw2d.layout.locator.TopLocator = draw2d.layout.locator.Locator.extend({NAME: "draw2d.layout.locator.TopLocator", init: function(parent) {
        this._super(parent);
    }, relocate: function(index, target) {
        var parent = this.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();
        if (target instanceof draw2d.Port) {
            target.setPosition(boundingBox.w / 2, 2);
        } else {
            target.setPosition(boundingBox.w / 2 - (targetBoundingBox.w / 2), -(targetBoundingBox.h + 2));
        }
    }});
draw2d.layout.locator.BottomLocator = draw2d.layout.locator.Locator.extend({NAME: "draw2d.layout.locator.BottomLocator", init: function(parent) {
        this._super(parent);
    }, relocate: function(index, target) {
        var parent = this.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();
        if (target instanceof draw2d.Port) {
            target.setPosition(boundingBox.w / 2, boundingBox.h - 2);
        } else {
            target.setPosition(boundingBox.w / 2 - targetBoundingBox.w / 2, 2 + boundingBox.h);
        }
    }});
draw2d.layout.locator.LeftLocator = draw2d.layout.locator.Locator.extend({NAME: "draw2d.layout.locator.LeftLocator", init: function(parent) {
        this._super(parent);
    }, relocate: function(index, target) {
        var parent = this.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();
        target.setPosition(-targetBoundingBox.w - 5, (boundingBox.h / 2) - (targetBoundingBox.h / 2));
    }});
draw2d.layout.locator.RightLocator = draw2d.layout.locator.Locator.extend({NAME: "draw2d.layout.locator.RightLocator", init: function(parent) {
        this._super(parent);
    }, relocate: function(index, target) {
        var parent = this.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();
        target.setPosition(boundingBox.w + 5, (boundingBox.h / 2) - (targetBoundingBox.h / 2));
    }});
draw2d.layout.locator.CenterLocator = draw2d.layout.locator.Locator.extend({NAME: "draw2d.layout.locator.CenterLocator", init: function(parent) {
        this._super(parent);
    }, relocate: function(index, target) {
        var parent = this.getParent();
        var boundingBox = parent.getBoundingBox();
        if (target instanceof draw2d.Port) {
            target.setPosition(boundingBox.w / 2, boundingBox.h / 2);
        } else {
            var targetBoundingBox = target.getBoundingBox();
            target.setPosition(boundingBox.w / 2 - targetBoundingBox.w / 2, boundingBox.h / 2 - (targetBoundingBox.h / 2));
        }
    }});
draw2d.policy.EditPolicy = Class.extend({NAME: "draw2d.policy.EditPolicy", init: function() {
    }, onInstall: function(host) {
    }, onUninstall: function(host) {
    }});
draw2d.policy.canvas.CanvasPolicy = draw2d.policy.EditPolicy.extend({NAME: "draw2d.policy.canvas.CanvasPolicy", init: function() {
        this._super();
    }, onInstall: function(canvas) {
    }, onUninstall: function(canvas) {
    }, onClick: function(figure, mousePosition) {
    }, onMouseMove: function(canvas, x, y) {
    }, snap: function(canvas, figure, clientPos) {
        return clientPos;
    }, onMouseDown: function(canvas, x, y) {
    }, onMouseDrag: function(canvas, dx, dy, dx2, dy2) {
    }, onMouseUp: function(figure, x, y) {
    }});
draw2d.policy.canvas.SelectionPolicy = draw2d.policy.canvas.CanvasPolicy.extend({NAME: "draw2d.policy.canvas.SelectionPolicy", init: function() {
        this._super();
    }, unselect: function(canvas, figure) {
        figure.unselect();
        canvas.getSelection().remove(figure);
    }});
draw2d.policy.canvas.SingleSelectionPolicy = draw2d.policy.canvas.SelectionPolicy.extend({NAME: "draw2d.policy.canvas.SingleSelectionPolicy", init: function() {
        this._super();
        this.mouseMovedDuringMouseDown = false;
        this.mouseDraggingElement = null;
        this.mouseDownElement = null;
    }, select: function(canvas, figure) {
        if (canvas.getSelection().getAll().contains(figure)) {
            return;
        }
        if (canvas.getSelection().getPrimary() !== null) {
            this.unselect(canvas, canvas.getSelection().getPrimary());
        }
        if (figure !== null) {
            figure.select(true);
        }
        canvas.getSelection().setPrimary(figure);
        canvas.selectionListeners.each(function(i, w) {
            w.onSelectionChanged(figure);
        });
    }, onMouseDown: function(canvas, x, y) {
        this.mouseMovedDuringMouseDown = false;
        var canDragStart = true;
        var figure = canvas.getBestFigure(x, y);
        while ((figure !== null && figure.getParent() !== null) && !(figure instanceof draw2d.Port)) {
            figure = figure.getParent();
        }
        if (figure !== null && figure.isDraggable()) {
            canDragStart = figure.onDragStart(x - figure.getAbsoluteX(), y - figure.getAbsoluteY());
            if (canDragStart === false) {
                this.mouseDraggingElement = null;
                this.mouseDownElement = figure;
            } else {
                this.mouseDraggingElement = figure;
                this.mouseDownElement = figure;
            }
        }
        if (figure !== canvas.getSelection().getPrimary() && figure !== null && figure.isSelectable() === true) {
            this.select(canvas, figure);
            if (figure instanceof draw2d.shape.basic.Line) {
                if (!(figure instanceof draw2d.Connection)) {
                    canvas.draggingLineCommand = figure.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE));
                    if (canvas.draggingLineCommand !== null) {
                        canvas.draggingLine = figure;
                    }
                }
            } else {
                if (canDragStart === false) {
                    figure.unselect();
                }
            }
        }
    }, onMouseDrag: function(canvas, dx, dy, dx2, dy2) {
        this.mouseMovedDuringMouseDown = true;
        if (this.mouseDraggingElement !== null) {
            if (canvas.linesToRepaintAfterDragDrop.isEmpty() === true && (this.mouseDraggingElement instanceof draw2d.shape.node.Node)) {
                var nodeConnections = this.mouseDraggingElement.getConnections();
                var newLineIntersections = canvas.lineIntersections.clone();
                canvas.lineIntersections.each(jQuery.proxy(function(i, inter) {
                    if (nodeConnections.contains(inter.line) || nodeConnections.contains(inter.other)) {
                        newLineIntersections.remove(inter);
                        canvas.linesToRepaintAfterDragDrop.add(inter.line);
                        canvas.linesToRepaintAfterDragDrop.add(inter.other);
                    }
                }, this));
                canvas.lineIntersections = newLineIntersections;
                canvas.linesToRepaintAfterDragDrop.each(function(i, line) {
                    line.svgPathString = null;
                    line.repaint();
                });
            }
            var sel = canvas.getSelection().getAll();
            if (!sel.contains(this.mouseDraggingElement)) {
                this.mouseDraggingElement.onDrag(dx, dy, dx2, dy2);
            } else {
                sel.each(function(i, figure) {
                    figure.onDrag(dx, dy, dx2, dy2);
                });
            }
            var p = canvas.fromDocumentToCanvasCoordinate(canvas.mouseDownX + (dx / canvas.zoomFactor), canvas.mouseDownY + (dy / canvas.zoomFactor));
            var target = canvas.getBestFigure(p.x, p.y, this.mouseDraggingElement);
            if (target !== canvas.currentDropTarget) {
                if (canvas.currentDropTarget !== null) {
                    canvas.currentDropTarget.onDragLeave(this.mouseDraggingElement);
                    canvas.currentDropTarget = null;
                }
                if (target !== null) {
                    canvas.currentDropTarget = target.onDragEnter(this.mouseDraggingElement);
                }
            }
        } else {
            if (this.mouseDownElement !== null && !(this.mouseDownElement instanceof draw2d.Connection)) {
                this.mouseDownElement.onPanning(dx, dy, dx2, dy2);
            }
        }
    }, onMouseUp: function(canvas, x, y) {
        if (this.mouseDraggingElement !== null) {
            var sel = canvas.getSelection().getAll();
            if (!sel.contains(this.mouseDraggingElement)) {
                this.mouseDraggingElement.onDragEnd();
            } else {
                canvas.getCommandStack().startTransaction();
                canvas.getSelection().getAll().each(function(i, figure) {
                    figure.onDragEnd();
                });
                canvas.getCommandStack().commitTransaction();
            }
            if (canvas.currentDropTarget !== null) {
                this.mouseDraggingElement.onDrop(canvas.currentDropTarget);
                canvas.currentDropTarget.onDragLeave(this.mouseDraggingElement);
                canvas.currentDropTarget = null;
            }
            this.mouseDraggingElement = null;
        }
        if (this.mouseDownElement === null && this.mouseMovedDuringMouseDown === false) {
            this.select(canvas, null);
        }
        this.mouseDownElement = null;
        this.mouseMovedDuringMouseDown = false;
    }});
draw2d.policy.canvas.PanningSelectionPolicy = draw2d.policy.canvas.SingleSelectionPolicy.extend({NAME: "draw2d.policy.canvas.PanningSelectionPolicy", init: function() {
        this._super();
    }, onMouseDrag: function(canvas, dx, dy, dx2, dy2) {
        this._super(canvas, dx, dy, dx2, dy2);
        if (this.mouseDraggingElement === null && this.mouseDownElement === null) {
            var area = canvas.getScrollArea();
            area.scrollTop(area.scrollTop() + dy2);
            area.scrollLeft(area.scrollLeft() + dx2);
        }
    }});
draw2d.policy.canvas.BoundingboxSelectionPolicy = draw2d.policy.canvas.SingleSelectionPolicy.extend({NAME: "draw2d.policy.canvas.BoundingboxSelectionPolicy", init: function() {
        this._super();
        this.boundingBoxFigure1 = null;
        this.boundingBoxFigure2 = null;
        this.x = 0;
        this.y = 0;
    }, select: function(canvas, figure) {
        if (canvas.getSelection().getAll().contains(figure)) {
            return;
        }
        if (figure !== null) {
            figure.select(true);
        }
        canvas.getSelection().setPrimary(figure);
        canvas.selectionListeners.each(function(i, w) {
            w.onSelectionChanged(figure);
        });
    }, onMouseDown: function(canvas, x, y) {
        this.x = x;
        this.y = y;
        var currentSelection = canvas.getSelection().getAll();
        this._super(canvas, x, y);
        if (this.mouseDownElement !== null && this.mouseDownElement.isResizeHandle === false && !currentSelection.contains(this.mouseDownElement)) {
            currentSelection.each(jQuery.proxy(function(i, figure) {
                this.unselect(canvas, figure);
            }, this));
        }
        currentSelection = canvas.getSelection().getAll();
        currentSelection.each(jQuery.proxy(function(i, figure) {
            var canDragStart = figure.onDragStart(figure.getAbsoluteX(), figure.getAbsoluteY());
            if (figure instanceof draw2d.shape.basic.Line) {
            } else {
                if (canDragStart === false) {
                    this.unselect(canvas, figure);
                }
            }
        }, this));
    }, onMouseDrag: function(canvas, dx, dy, dx2, dy2) {
        this._super(canvas, dx, dy, dx2, dy2);
        if (this.mouseDraggingElement === null && this.mouseDownElement === null && this.boundingBoxFigure1 === null) {
            this.boundingBoxFigure1 = new draw2d.shape.basic.Rectangle(1, 1);
            this.boundingBoxFigure1.setPosition(this.x, this.y);
            this.boundingBoxFigure1.setCanvas(canvas);
            this.boundingBoxFigure1.setBackgroundColor("#0f0f0f");
            this.boundingBoxFigure1.setAlpha(0.1);
            this.boundingBoxFigure2 = new draw2d.shape.basic.Rectangle(1, 1);
            this.boundingBoxFigure2.setPosition(this.x, this.y);
            this.boundingBoxFigure2.setCanvas(canvas);
            this.boundingBoxFigure2.setDashArray("- ");
            this.boundingBoxFigure2.setStroke(1);
            this.boundingBoxFigure2.setColor(new draw2d.util.Color(84, 151, 220));
            this.boundingBoxFigure2.setBackgroundColor(null);
        }
        if (this.boundingBoxFigure1 !== null) {
            this.boundingBoxFigure1.setDimension(Math.abs(dx), Math.abs(dy));
            this.boundingBoxFigure1.setPosition(this.x + Math.min(0, dx), this.y + Math.min(0, dy));
            this.boundingBoxFigure2.setDimension(Math.abs(dx), Math.abs(dy));
            this.boundingBoxFigure2.setPosition(this.x + Math.min(0, dx), this.y + Math.min(0, dy));
        }
    }, onMouseUp: function(canvas, x, y) {
        if (this.mouseDownElement === null) {
            canvas.getSelection().getAll().each(jQuery.proxy(function(i, figure) {
                this.unselect(canvas, figure);
            }, this));
        } else {
            if (this.mouseDownElement instanceof draw2d.ResizeHandle || (this.mouseDownElement instanceof draw2d.shape.basic.LineResizeHandle)) {
            } else {
                if (this.mouseDownElement !== null && this.mouseMovedDuringMouseDown === false) {
                    var sel = canvas.getSelection().getAll();
                    if (!sel.contains(this.mouseDownElement)) {
                        canvas.getSelection().getAll().each(jQuery.proxy(function(i, figure) {
                            this.unselect(canvas, figure);
                        }, this));
                    }
                }
            }
        }
        this._super(canvas, x, y);
        if (this.boundingBoxFigure1 !== null) {
            var selectionRect = this.boundingBoxFigure1.getBoundingBox();
            canvas.getFigures().each(jQuery.proxy(function(i, figure) {
                if (figure.getBoundingBox().isInside(selectionRect)) {
                    var canDragStart = figure.onDragStart(figure.getAbsoluteX(), figure.getAbsoluteY());
                    if (canDragStart === true) {
                        this.select(canvas, figure, false);
                    }
                }
            }, this));
            var selection = canvas.getSelection();
            canvas.getLines().each(jQuery.proxy(function(i, line) {
                if (line instanceof draw2d.Connection) {
                    if (selection.contains(line.getSource().getParent()) && selection.contains(line.getTarget().getParent())) {
                        this.select(canvas, line, false);
                    }
                }
            }, this));
            this.boundingBoxFigure1.setCanvas(null);
            this.boundingBoxFigure1 = null;
            this.boundingBoxFigure2.setCanvas(null);
            this.boundingBoxFigure2 = null;
        }
    }});
draw2d.policy.canvas.ReadOnlySelectionPolicy = draw2d.policy.canvas.SelectionPolicy.extend({NAME: "draw2d.policy.canvas.ReadOnlySelectionPolicy", init: function() {
        this._super();
    }, onInstall: function(canvas) {
        canvas.getAllPorts().each(jQuery.proxy(function(i, port) {
            port.setVisible(false);
        }, this));
    }, onUninstall: function(canvas) {
        canvas.getAllPorts().each(jQuery.proxy(function(i, port) {
            port.setVisible(true);
        }, this));
    }, onMouseDrag: function(canvas, dx, dy, dx2, dy2) {
        var area = canvas.getScrollArea();
        area.scrollTop(area.scrollTop() + dy2);
        area.scrollLeft(area.scrollLeft() + dx2);
    }});
draw2d.policy.canvas.DecorationPolicy = draw2d.policy.canvas.CanvasPolicy.extend({NAME: "draw2d.policy.canvas.DecorationPolicy", init: function() {
        this._super();
    }});
draw2d.policy.canvas.FadeoutDecorationPolicy = draw2d.policy.canvas.DecorationPolicy.extend({NAME: "draw2d.policy.canvas.FadeoutDecorationPolicy", DEFAULT_FADEOUT_DURATION: 30, TARGET_COLOR: new draw2d.util.Color("#707070"), init: function() {
        this._super();
        this.alpha = 1;
        this.hidePortsCounter = this.DEFAULT_FADEOUT_DURATION;
        this.canvas = null;
    }, onInstall: function(canvas) {
        this.canvas = canvas;
        this.timerId = window.setInterval(jQuery.proxy(this.onTimer, this), 100);
        this.hidePortsCounter = 1;
        this.alpha = 0.1;
    }, onUninstall: function(canvas) {
        window.clearInterval(this.timerId);
        this.canvas.getAllPorts().each(jQuery.proxy(function(i, port) {
            port.setAlpha(1);
        }, this));
    }, onTimer: function() {
        this.hidePortsCounter--;
        if (this.hidePortsCounter <= 0 && this.alpha > 0) {
            this.alpha = Math.max(0, this.alpha - 0.05);
            this.canvas.getAllPorts().each(jQuery.proxy(function(i, port) {
                port.setAlpha(this.alpha);
            }, this));
            this.canvas.getSelection().getAll().each(jQuery.proxy(function(i, figure) {
                figure.selectionHandles.each(jQuery.proxy(function(i, handle) {
                    handle.setAlpha(this.alpha);
                }, this));
            }, this));
        } else {
            if (this.hidePortsCounter > 0 && this.alpha !== 1) {
                this.alpha = 1;
                this.duringHide = false;
                this.canvas.getAllPorts().each(jQuery.proxy(function(i, port) {
                    port.setAlpha(this.alpha);
                }, this));
                this.canvas.getSelection().getAll().each(jQuery.proxy(function(i, figure) {
                    figure.selectionHandles.each(jQuery.proxy(function(i, handle) {
                        handle.setAlpha(this.alpha);
                    }, this));
                }, this));
            }
        }
    }, onMouseDown: function(canvas, x, y) {
        this.hidePortsCounter = this.DEFAULT_FADEOUT_DURATION;
    }, onMouseMove: function(canvas, x, y) {
        this.hidePortsCounter = this.DEFAULT_FADEOUT_DURATION;
    }, onMouseDrag: function(canvas, dx, dy, dx2, dy2) {
        this.hidePortsCounter = this.DEFAULT_FADEOUT_DURATION;
    }, onMouseUp: function(figure, x, y) {
        this.hidePortsCounter = this.DEFAULT_FADEOUT_DURATION;
    }});
draw2d.policy.canvas.CoronaDecorationPolicy = draw2d.policy.canvas.DecorationPolicy.extend({NAME: "draw2d.policy.canvas.CoronaDecorationPolicy", init: function() {
        this._super();
        this.startDragX = 0;
        this.startDragY = 0;
    }, onInstall: function(canvas) {
        var figures = canvas.getFigures();
        figures.each(function(i, figure) {
            figure.getPorts().each(function(i, p) {
                p.setVisible(false);
            });
        });
    }, onUninstall: function(canvas) {
        var figures = canvas.getFigures();
        figures.each(function(i, figure) {
            figure.getPorts().each(function(i, p) {
                p.setVisible(true);
            });
        });
    }, onMouseDown: function(canvas, x, y) {
        this.startDragX = x;
        this.startDragY = y;
    }, onMouseMove: function(canvas, x, y) {
        this.updatePorts(canvas, x, y);
    }, onMouseDrag: function(canvas, dx, dy, dx2, dy2) {
        this.updatePorts(canvas, this.startDragX + dx, this.startDragY + dy);
    }, updatePorts: function(canvas, x, y) {
        var figures = canvas.getFigures();
        figures.each(function(i, figure) {
            if (figure.isVisible() === true && figure.hitTest(x, y, 50) === true && figure instanceof draw2d.shape.node.Node) {
                figure.getPorts().each(function(i, p) {
                    p.setVisible(true);
                });
            } else {
                figure.getPorts().each(function(i, p) {
                    p.setVisible(false);
                });
            }
        });
    }});
draw2d.policy.canvas.SnapToEditPolicy = draw2d.policy.canvas.CanvasPolicy.extend({NAME: "draw2d.policy.canvas.SnapToEditPolicy", init: function(grid) {
        this._super();
        this.grid = grid;
    }, snap: function(canvas, figure, clientPos) {
        return clientPos;
    }});
draw2d.policy.canvas.SnapToGridEditPolicy = draw2d.policy.canvas.SnapToEditPolicy.extend({NAME: "draw2d.policy.canvas.SnapToGridEditPolicy", GRID_COLOR: "#e0e0f0", GRID_WIDTH: 10, init: function(grid) {
        this._super();
        this.canvas = null;
        this.lines = null;
        if (grid) {
            this.grid = grid;
        } else {
            this.grid = this.GRID_WIDTH;
        }
    }, onInstall: function(canvas) {
        this.canvas = canvas;
        this.showGrid();
    }, onUninstall: function(canvas) {
        this.canvas = null;
        this.lines.remove();
    }, snap: function(canvas, figure, pos) {
        var snapPoint = figure.getSnapToGridAnchor();
        pos.x = pos.x + snapPoint.x;
        pos.y = pos.y + snapPoint.y;
        pos.x = this.grid * Math.floor(((pos.x + this.grid / 2) / this.grid));
        pos.y = this.grid * Math.floor(((pos.y + this.grid / 2) / this.grid));
        pos.x = pos.x - snapPoint.x;
        pos.y = pos.y - snapPoint.y;
        return pos;
    }, showGrid: function() {
        var w = this.canvas.initialWidth;
        var h = this.canvas.initialHeight;
        this.lines = this.canvas.paper.set();
        for (var x = this.grid; x < w; x += this.grid) {
            this.lines.push(this.canvas.paper.path("M " + x + " 0 l 0 " + h));
        }
        for (var y = this.grid; y < h; y += this.grid) {
            this.lines.push(this.canvas.paper.path("M 0 " + y + " l " + w + " 0"));
        }
        this.lines.attr({"stroke": this.GRID_COLOR});
        this.lines.toBack();
    }});
draw2d.policy.canvas.ShowGridEditPolicy = draw2d.policy.canvas.SnapToEditPolicy.extend({NAME: "draw2d.policy.canvas.ShowGridEditPolicy", GRID_COLOR: "#e0e0f0", GRID_WIDTH: 10, init: function(grid) {
        this._super();
        this.canvas = null;
        this.lines = null;
        if (grid) {
            this.grid = grid;
        } else {
            this.grid = this.GRID_WIDTH;
        }
    }, onInstall: function(canvas) {
        this.canvas = canvas;
        this.showGrid();
    }, onUninstall: function(canvas) {
        this.canvas = null;
        this.lines.remove();
    }, snap: function(canvas, figure, pos) {
        return pos;
    }, showGrid: function() {
        var w = this.canvas.initialWidth;
        var h = this.canvas.initialHeight;
        this.lines = this.canvas.paper.set();
        for (var x = this.grid; x < w; x += this.grid) {
            this.lines.push(this.canvas.paper.path("M " + x + " 0 l 0 " + h));
        }
        for (var y = this.grid; y < h; y += this.grid) {
            this.lines.push(this.canvas.paper.path("M 0 " + y + " l " + w + " 0"));
        }
        this.lines.attr({"stroke": this.GRID_COLOR});
        this.lines.toBack();
    }});
draw2d.SnapToHelper = {};
draw2d.SnapToHelper.NORTH = 1;
draw2d.SnapToHelper.SOUTH = 4;
draw2d.SnapToHelper.WEST = 8;
draw2d.SnapToHelper.EAST = 16;
draw2d.SnapToHelper.CENTER = 32;
draw2d.SnapToHelper.NORTH_EAST = draw2d.SnapToHelper.NORTH | draw2d.SnapToHelper.EAST;
draw2d.SnapToHelper.NORTH_WEST = draw2d.SnapToHelper.NORTH | draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.SOUTH_EAST = draw2d.SnapToHelper.SOUTH | draw2d.SnapToHelper.EAST;
draw2d.SnapToHelper.SOUTH_WEST = draw2d.SnapToHelper.SOUTH | draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.NORTH_SOUTH = draw2d.SnapToHelper.NORTH | draw2d.SnapToHelper.SOUTH;
draw2d.SnapToHelper.EAST_WEST = draw2d.SnapToHelper.EAST | draw2d.SnapToHelper.WEST;
draw2d.SnapToHelper.NSEW = draw2d.SnapToHelper.NORTH_SOUTH | draw2d.SnapToHelper.EAST_WEST;
draw2d.policy.canvas.SnapToGeometryEditPolicy = draw2d.policy.canvas.SnapToEditPolicy.extend({NAME: "draw2d.policy.canvas.SnapToGeometryEditPolicy", SNAP_THRESHOLD: 3, LINE_COLOR: "#1387E6", FADEOUT_DURATION: 300, init: function() {
        this._super();
        this.rows = null;
        this.cols = null;
        this.vline = null;
        this.hline = null;
        this.canvas = null;
    }, onInstall: function(canvas) {
        this.canvas = canvas;
    }, onUninstall: function(canvas) {
        this.canvas = null;
    }, onMouseUp: function(figure, x, y) {
        this.rows = null;
        this.cols = null;
        this.hideVerticalLine();
        this.hideHorizontalLine();
    }, snap: function(canvas, figure, pos) {
        if (figure instanceof draw2d.ResizeHandle) {
            var snapPoint = figure.getSnapToGridAnchor();
            pos.x += snapPoint.x;
            pos.y += snapPoint.y;
            var result = new draw2d.geo.Point(pos.x, pos.y);
            var snapDirections = figure.getSnapToDirection();
            var direction = this.snapPoint(snapDirections, pos, result);
            if ((snapDirections & draw2d.SnapToHelper.EAST_WEST) && !(direction & draw2d.SnapToHelper.EAST_WEST)) {
                this.showVerticalLine(result.x);
            } else {
                this.hideVerticalLine();
            }
            if ((snapDirections & draw2d.SnapToHelper.NORTH_SOUTH) && !(direction & draw2d.SnapToHelper.NORTH_SOUTH)) {
                this.showHorizontalLine(result.y);
            } else {
                this.hideHorizontalLine();
            }
            result.x -= snapPoint.x;
            result.y -= snapPoint.y;
            return result;
        } else {
            var inputBounds = new draw2d.geo.Rectangle(pos.x, pos.y, figure.getWidth(), figure.getHeight());
            var result = new draw2d.geo.Rectangle(pos.x, pos.y, figure.getWidth(), figure.getHeight());
            var snapDirections = draw2d.SnapToHelper.NSEW;
            var direction = this.snapRectangle(inputBounds, result);
            if ((snapDirections & draw2d.SnapToHelper.WEST) && !(direction & draw2d.SnapToHelper.WEST)) {
                this.showVerticalLine(result.x);
            } else {
                if ((snapDirections & draw2d.SnapToHelper.EAST) && !(direction & draw2d.SnapToHelper.EAST)) {
                    this.showVerticalLine(result.getX() + result.getWidth());
                } else {
                    this.hideVerticalLine();
                }
            }
            if ((snapDirections & draw2d.SnapToHelper.NORTH) && !(direction & draw2d.SnapToHelper.NORTH)) {
                this.showHorizontalLine(result.y);
            } else {
                if ((snapDirections & draw2d.SnapToHelper.SOUTH) && !(direction & draw2d.SnapToHelper.SOUTH)) {
                    this.showHorizontalLine(result.getY() + result.getHeight());
                } else {
                    this.hideHorizontalLine();
                }
            }
            return result.getTopLeft();
        }
        return pos;
    }, snapRectangle: function(inputBounds, resultBounds) {
        var topLeftResult = inputBounds.getTopLeft();
        var bottomRightResult = inputBounds.getBottomRight();
        var snapDirectionsTopLeft = this.snapPoint(draw2d.SnapToHelper.NORTH_WEST, inputBounds.getTopLeft(), topLeftResult);
        resultBounds.x = topLeftResult.x;
        resultBounds.y = topLeftResult.y;
        var snapDirectionsBottomRight = this.snapPoint(draw2d.SnapToHelper.SOUTH_EAST, inputBounds.getBottomRight(), bottomRightResult);
        if (snapDirectionsTopLeft & draw2d.SnapToHelper.WEST) {
            resultBounds.x = bottomRightResult.x - inputBounds.getWidth();
        }
        if (snapDirectionsTopLeft & draw2d.SnapToHelper.NORTH) {
            resultBounds.y = bottomRightResult.y - inputBounds.getHeight();
        }
        return snapDirectionsTopLeft | snapDirectionsBottomRight;
    }, snapPoint: function(snapOrientation, inputPoint, resultPoint) {
        if (this.rows === null || this.cols === null) {
            this.populateRowsAndCols();
        }
        if ((snapOrientation & draw2d.SnapToHelper.EAST) !== 0) {
            var rightCorrection = this.getCorrectionFor(this.cols, inputPoint.getX() - 1, 1);
            if (rightCorrection !== this.SNAP_THRESHOLD) {
                snapOrientation &= ~draw2d.SnapToHelper.EAST;
                resultPoint.x += rightCorrection;
            }
        }
        if ((snapOrientation & draw2d.SnapToHelper.WEST) !== 0) {
            var leftCorrection = this.getCorrectionFor(this.cols, inputPoint.getX(), -1);
            if (leftCorrection !== this.SNAP_THRESHOLD) {
                snapOrientation &= ~draw2d.SnapToHelper.WEST;
                resultPoint.x += leftCorrection;
            }
        }
        if ((snapOrientation & draw2d.SnapToHelper.SOUTH) !== 0) {
            var bottomCorrection = this.getCorrectionFor(this.rows, inputPoint.getY() - 1, 1);
            if (bottomCorrection !== this.SNAP_THRESHOLD) {
                snapOrientation &= ~draw2d.SnapToHelper.SOUTH;
                resultPoint.y += bottomCorrection;
            }
        }
        if ((snapOrientation & draw2d.SnapToHelper.NORTH) !== 0) {
            var topCorrection = this.getCorrectionFor(this.rows, inputPoint.getY(), -1);
            if (topCorrection !== this.SNAP_THRESHOLD) {
                snapOrientation &= ~draw2d.SnapToHelper.NORTH;
                resultPoint.y += topCorrection;
            }
        }
        return snapOrientation;
    }, populateRowsAndCols: function() {
        var selection = this.canvas.getSelection();
        this.rows = [];
        this.cols = [];
        var figures = this.canvas.getFigures();
        var index = 0;
        for (var i = 0; i < figures.getSize(); i++) {
            var figure = figures.get(i);
            if (!selection.contains(figure)) {
                var bounds = figure.getBoundingBox();
                this.cols[index * 3] = {type: -1, location: bounds.getX()};
                this.rows[index * 3] = {type: -1, location: bounds.getY()};
                this.cols[index * 3 + 1] = {type: 0, location: bounds.x + (bounds.getWidth() - 1) / 2};
                this.rows[index * 3 + 1] = {type: 0, location: bounds.y + (bounds.getHeight() - 1) / 2};
                this.cols[index * 3 + 2] = {type: 1, location: bounds.getRight() - 1};
                this.rows[index * 3 + 2] = {type: 1, location: bounds.getBottom() - 1};
                index++;
            }
        }
    }, getCorrectionFor: function(entries, value, side) {
        var resultMag = this.SNAP_THRESHOLD;
        var result = this.SNAP_THRESHOLD;
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var magnitude;
            if (entry.type === -1 && side !== 0) {
                magnitude = Math.abs(value - entry.location);
                if (magnitude < resultMag) {
                    resultMag = magnitude;
                    result = entry.location - value;
                }
            } else {
                if (entry.type === 0 && side === 0) {
                    magnitude = Math.abs(value - entry.location);
                    if (magnitude < resultMag) {
                        resultMag = magnitude;
                        result = entry.location - value;
                    }
                } else {
                    if (entry.type === 1 && side !== 0) {
                        magnitude = Math.abs(value - entry.location);
                        if (magnitude < resultMag) {
                            resultMag = magnitude;
                            result = entry.location - value;
                        }
                    }
                }
            }
        }
        return result;
    }, showVerticalLine: function(x) {
        if (this.vline != null) {
            return;
        }
        this.vline = this.canvas.paper.path("M " + x + " 0 l 0 " + this.canvas.getHeight()).attr({"stroke": this.LINE_COLOR, "stroke-width": 1});
    }, hideVerticalLine: function() {
        if (this.vline == null) {
            return;
        }
        var tmp = this.vline;
        tmp.animate({opacity: 0.1}, this.FADEOUT_DURATION, function() {
            tmp.remove();
        });
        this.vline = null;
    }, showHorizontalLine: function(y) {
        if (this.hline != null) {
            return;
        }
        this.hline = this.canvas.paper.path("M 0 " + y + " l " + this.canvas.getWidth() + " 0").attr({"stroke": this.LINE_COLOR, "stroke-width": 1});
    }, hideHorizontalLine: function() {
        if (this.hline == null) {
            return;
        }
        var tmp = this.hline;
        tmp.animate({opacity: 0.1}, this.FADEOUT_DURATION, function() {
            tmp.remove();
        });
        this.hline = null;
    }});
draw2d.policy.figure.DragDropEditPolicy = draw2d.policy.EditPolicy.extend({NAME: "draw2d.policy.figure.DragDropEditPolicy", init: function() {
        this._super();
    }, onDragStart: function(canvas, figure) {
        figure.shape.attr({cursor: "move"});
        figure.isMoving = false;
        figure.originalAlpha = figure.getAlpha();
    }, onDrag: function(canvas, figure) {
        if (figure.isMoving === false) {
            figure.isMoving = true;
            figure.setAlpha(figure.originalAlpha * 0.4);
        }
    }, onDragEnd: function(canvas, figure) {
        figure.shape.attr({cursor: "default"});
        figure.isMoving = false;
    }, adjustPosition: function(figure, x, y) {
        if (x instanceof draw2d.geo.Point) {
            return x;
        }
        return new draw2d.geo.Point(x, y);
    }, adjustDimension: function(figure, w, h) {
        return new draw2d.geo.Rectangle(0, 0, w, h);
    }, moved: function(canvas, figure) {
    }});
draw2d.policy.figure.RegionEditPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({NAME: "draw2d.policy.figure.RegionEditPolicy", init: function(x, y, w, h) {
        this._super();
        if (x instanceof draw2d.geo.Rectangle) {
            this.constRect = x;
        } else {
            if (typeof h === "number") {
                this.constRect = new draw2d.geo.Rectangle(x, y, w, h);
            } else {
                throw"Invalid parameter. RegionConstraintPolicy need a rectangle as parameter in the constructor";
            }
        }
    }, adjustPosition: function(figure, x, y) {
        var r = null;
        if (x instanceof draw2d.geo.Point) {
            r = new draw2d.geo.Rectangle(x.x, x.y, figure.getWidth(), figure.getHeight());
        } else {
            r = new draw2d.geo.Rectangle(x, y, figure.getWidth(), figure.getHeight());
        }
        r = this.constRect.moveInside(r);
        return r.getTopLeft();
    }});
draw2d.policy.figure.HorizontalEditPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({NAME: "draw2d.policy.figure.HorizontalEditPolicy", init: function() {
        this._super();
    }, adjustPosition: function(figure, x, y) {
        return new draw2d.geo.Point(x, figure.getY());
    }});
draw2d.policy.figure.VerticalEditPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({NAME: "draw2d.policy.figure.VerticalEditPolicy", init: function() {
        this._super();
    }, adjustPosition: function(figure, x, y) {
        return new draw2d.geo.Point(figure.getX(), y);
    }});
draw2d.policy.figure.SelectionFeedbackPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({NAME: "draw2d.policy.figure.SelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
    }, onUnselect: function(canvas, figure) {
        figure.selectionHandles.each(function(i, e) {
            e.hide();
        });
        figure.selectionHandles = new draw2d.util.ArrayList();
    }});
draw2d.policy.figure.RectangleSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.RectangleSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
        if (figure.selectionHandles.isEmpty()) {
            var box = new draw2d.shape.basic.Rectangle();
            box.setBackgroundColor(null);
            box.setDashArray("- ");
            box.setColor("#2096fc");
            box.setStroke(0.5);
            box.hide = function() {
                box.setCanvas(null);
            };
            box.show = function(canvas) {
                box.setCanvas(canvas);
                box.shape.toFront();
            };
            box.show(canvas);
            var r1 = new draw2d.ResizeHandle(figure, 1);
            var r2 = new draw2d.ResizeHandle(figure, 2);
            var r3 = new draw2d.ResizeHandle(figure, 3);
            var r4 = new draw2d.ResizeHandle(figure, 4);
            var r5 = new draw2d.ResizeHandle(figure, 5);
            var r6 = new draw2d.ResizeHandle(figure, 6);
            var r7 = new draw2d.ResizeHandle(figure, 7);
            var r8 = new draw2d.ResizeHandle(figure, 8);
            figure.selectionHandles.add(r1);
            figure.selectionHandles.add(r2);
            figure.selectionHandles.add(r3);
            figure.selectionHandles.add(r4);
            figure.selectionHandles.add(r5);
            figure.selectionHandles.add(r6);
            figure.selectionHandles.add(r7);
            figure.selectionHandles.add(r8);
            r1.show(canvas);
            r3.show(canvas);
            r5.show(canvas);
            r7.show(canvas);
            r1.setDraggable(figure.isResizeable());
            r3.setDraggable(figure.isResizeable());
            r5.setDraggable(figure.isResizeable());
            r7.setDraggable(figure.isResizeable());
            if (figure.isResizeable() === true) {
                r1.setBackgroundColor(r1.DEFAULT_COLOR);
                r3.setBackgroundColor(r3.DEFAULT_COLOR);
                r5.setBackgroundColor(r5.DEFAULT_COLOR);
                r7.setBackgroundColor(r7.DEFAULT_COLOR);
            } else {
                r1.setBackgroundColor(null);
                r3.setBackgroundColor(null);
                r5.setBackgroundColor(null);
                r7.setBackgroundColor(null);
            }
            if (figure.isStrechable() && figure.isResizeable()) {
                r2.setDraggable(figure.isResizeable());
                r4.setDraggable(figure.isResizeable());
                r6.setDraggable(figure.isResizeable());
                r8.setDraggable(figure.isResizeable());
                r2.show(canvas);
                r4.show(canvas);
                r6.show(canvas);
                r8.show(canvas);
            }
            figure.selectionHandles.add(box);
        }
        this.moved(canvas, figure);
    }, moved: function(canvas, figure) {
        if (figure.selectionHandles.isEmpty()) {
            return;
        }
        var objHeight = figure.getHeight();
        var objWidth = figure.getWidth();
        var xPos = figure.getX();
        var yPos = figure.getY();
        var r1 = figure.selectionHandles.get(0);
        var r3 = figure.selectionHandles.get(2);
        var r5 = figure.selectionHandles.get(4);
        var r7 = figure.selectionHandles.get(6);
        r1.setPosition(xPos - r1.getWidth(), yPos - r1.getHeight());
        r3.setPosition(xPos + objWidth, yPos - r3.getHeight());
        r5.setPosition(xPos + objWidth, yPos + objHeight);
        r7.setPosition(xPos - r7.getWidth(), yPos + objHeight);
        if (figure.isStrechable()) {
            var r2 = figure.selectionHandles.get(1);
            var r4 = figure.selectionHandles.get(3);
            var r6 = figure.selectionHandles.get(5);
            var r8 = figure.selectionHandles.get(7);
            r2.setPosition(xPos + (objWidth / 2) - (r2.getWidth() / 2), yPos - r2.getHeight());
            r4.setPosition(xPos + objWidth, yPos + (objHeight / 2) - (r4.getHeight() / 2));
            r6.setPosition(xPos + (objWidth / 2) - (r6.getWidth() / 2), yPos + objHeight);
            r8.setPosition(xPos - r8.getWidth(), yPos + (objHeight / 2) - (r8.getHeight() / 2));
        }
        var box = figure.selectionHandles.get(8);
        box.setPosition(figure.getPosition().translate(-2, -2));
        box.setDimension(figure.getWidth() + 4, figure.getHeight() + 4);
        box.setRotationAngle(figure.getRotationAngle());
    }});
draw2d.policy.figure.BigRectangleSelectionFeedbackPolicy = draw2d.policy.figure.RectangleSelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.BigRectangleSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
        this._super(canvas, figure, isPrimarySelection);
        if (!figure.selectionHandles.isEmpty()) {
            figure.selectionHandles.each(function(i, e) {
                e.setDimension(15, 15);
            });
        }
        this.moved(canvas, figure);
    }});
draw2d.policy.figure.RoundRectangleSelectionFeedbackPolicy = draw2d.policy.figure.RectangleSelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.RoundRectangleSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
        this._super(canvas, figure, isPrimarySelection);
        if (!figure.selectionHandles.isEmpty()) {
            figure.selectionHandles.each(function(i, e) {
                e.setDimension(12, 12);
                e.setRadius(4);
            });
        }
        this.moved(canvas, figure);
    }});
draw2d.policy.figure.BusSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.BusSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
        if (figure.selectionHandles.isEmpty()) {
            var r2 = new draw2d.ResizeHandle(figure, 2);
            var r4 = new draw2d.ResizeHandle(figure, 4);
            var r6 = new draw2d.ResizeHandle(figure, 6);
            var r8 = new draw2d.ResizeHandle(figure, 8);
            figure.selectionHandles.add(r2);
            figure.selectionHandles.add(r4);
            figure.selectionHandles.add(r6);
            figure.selectionHandles.add(r8);
            r2.setDraggable(figure.isResizeable());
            r4.setDraggable(figure.isResizeable());
            r6.setDraggable(figure.isResizeable());
            r8.setDraggable(figure.isResizeable());
            r2.show(canvas);
            r4.show(canvas);
            r6.show(canvas);
            r8.show(canvas);
        }
        this.moved(canvas, figure);
    }, moved: function(canvas, figure) {
        if (figure.selectionHandles.isEmpty()) {
            return;
        }
        var r2 = figure.selectionHandles.get(0);
        var r4 = figure.selectionHandles.get(1);
        var r6 = figure.selectionHandles.get(2);
        var r8 = figure.selectionHandles.get(3);
        var objHeight = figure.getHeight();
        var objWidth = figure.getWidth();
        var xPos = figure.getX();
        var yPos = figure.getY();
        r2.setPosition(xPos + (objWidth / 2) - (r2.getWidth() / 2), yPos - r2.getHeight());
        r4.setPosition(xPos + objWidth, yPos + (objHeight / 2) - (r4.getHeight() / 2));
        r6.setPosition(xPos + (objWidth / 2) - (r6.getWidth() / 2), yPos + objHeight);
        r8.setPosition(xPos - r8.getWidth(), yPos + (objHeight / 2) - (r8.getHeight() / 2));
    }});
draw2d.policy.figure.VBusSelectionFeedbackPolicy = draw2d.policy.figure.BusSelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.VBusSelectionFeedbackPolicy", init: function() {
        this._super();
    }, moved: function(canvas, figure) {
        if (figure.selectionHandles.isEmpty()) {
            return;
        }
        var r2 = figure.selectionHandles.get(0);
        var r6 = figure.selectionHandles.get(2);
        var objWidth = figure.getWidth();
        r2.setDimension(objWidth, r2.getHeight());
        r6.setDimension(objWidth, r6.getHeight());
        this._super(canvas, figure);
    }});
draw2d.policy.figure.HBusSelectionFeedbackPolicy = draw2d.policy.figure.BusSelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.HBusSelectionFeedbackPolicy", init: function() {
        this._super();
    }, moved: function(canvas, figure) {
        if (figure.selectionHandles.isEmpty()) {
            return;
        }
        var r4 = figure.selectionHandles.get(1);
        var r8 = figure.selectionHandles.get(3);
        r4.setDimension(r4.getWidth(), figure.getHeight());
        r8.setDimension(r4.getWidth(), figure.getHeight());
        this._super(canvas, figure);
    }});
draw2d.policy.figure.AntSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.AntSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
        if (figure.selectionHandles.isEmpty()) {
            var box = new draw2d.shape.basic.Rectangle();
            box.setBackgroundColor(null);
            box.setDashArray("- ");
            box.setColor("#00bdee");
            box.hide = function() {
                box.setCanvas(null);
            };
            box.show = function(canvas) {
                box.setCanvas(canvas);
                box.shape.toFront();
            };
            box.show(canvas);
            figure.selectionHandles.add(box);
        }
        this.moved(canvas, figure);
    }, moved: function(canvas, figure) {
        if (figure.selectionHandles.isEmpty()) {
            return;
        }
        var box = figure.selectionHandles.get(0);
        box.setPosition(figure.getPosition().translate(-2, -2));
        box.setDimension(figure.getWidth() + 4, figure.getHeight() + 4);
        box.setRotationAngle(figure.getRotationAngle());
    }});
draw2d.policy.figure.GlowSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.GlowSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
        figure.setGlow(true);
        this.moved(canvas, figure);
    }, onUnselect: function(canvas, figure) {
        this._super(canvas, figure);
        figure.setGlow(false);
    }});
draw2d.policy.figure.SlimSelectionFeedbackPolicy = draw2d.policy.figure.RectangleSelectionFeedbackPolicy.extend({NAME: "draw2d.policy.figure.SlimSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
        this._super(canvas, figure, isPrimarySelection);
        if (!figure.selectionHandles.isEmpty()) {
            figure.selectionHandles.each(function(i, e) {
                e.setDimension(6, 6);
                e.setRadius(0);
            });
        }
        this.moved(canvas, figure);
    }});
draw2d.policy.line.LineSelectionFeedbackPolicy = draw2d.policy.figure.SelectionFeedbackPolicy.extend({NAME: "draw2d.policy.line.LineSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, figure, isPrimarySelection) {
        if (figure.selectionHandles.isEmpty()) {
            figure.selectionHandles.add(new draw2d.shape.basic.LineStartResizeHandle(figure));
            figure.selectionHandles.add(new draw2d.shape.basic.LineEndResizeHandle(figure));
            figure.selectionHandles.each(function(i, e) {
                e.setDraggable(figure.isResizeable());
                e.show(canvas);
            });
        }
        this.moved(canvas, figure);
    }, moved: function(canvas, figure) {
        figure.selectionHandles.each(function(i, e) {
            e.relocate();
        });
    }});
draw2d.policy.line.JunctionSelectionFeedbackPolicy = draw2d.policy.line.LineSelectionFeedbackPolicy.extend({NAME: "draw2d.policy.line.JunctionSelectionFeedbackPolicy", init: function() {
        this._super();
    }, onSelect: function(canvas, connection, isPrimarySelection) {
        this._super(canvas, connection, isPrimarySelection);
        var points = connection.getPoints();
        var i = 1;
        for (; i < (points.getSize() - 1); i++) {
            var handle = new draw2d.shape.basic.JunctionResizeHandle(connection, i);
            connection.selectionHandles.add(handle);
            handle.setDraggable(connection.isResizeable());
            handle.show(canvas);
            var handle = new draw2d.shape.basic.GhostJunctionResizeHandle(connection, i - 1);
            connection.selectionHandles.add(handle);
            handle.setDraggable(connection.isResizeable());
            handle.show(canvas);
        }
        var handle = new draw2d.shape.basic.GhostJunctionResizeHandle(connection, i - 1);
        connection.selectionHandles.add(handle);
        handle.setDraggable(connection.isResizeable());
        handle.show(canvas);
        this.moved(canvas, connection);
    }});
draw2d.policy.port.PortFeedbackPolicy = draw2d.policy.figure.DragDropEditPolicy.extend({NAME: "draw2d.policy.port.PortFeedbackPolicy", init: function() {
        this._super();
    }, onHoverEnter: function(canvas, draggedFigure, hoverFigure) {
    }, onHoverLeave: function(canvas, draggedFigure, hoverFigure) {
    }});
draw2d.policy.port.ElasticStrapFeedbackPolicy = draw2d.policy.port.PortFeedbackPolicy.extend({NAME: "draw2d.policy.port.ElasticStrapFeedbackPolicy", init: function() {
        this._super();
        this.connectionLine = null;
    }, onDragStart: function(canvas, figure) {
        this.connectionLine = new draw2d.shape.basic.Line();
        this.connectionLine.setCanvas(canvas);
        this.connectionLine.getShapeElement();
        this.onDrag(canvas, figure);
    }, onDrag: function(canvas, figure) {
        var x1 = figure.ox + figure.getParent().getAbsoluteX();
        var y1 = figure.oy + figure.getParent().getAbsoluteY();
        this.connectionLine.setStartPoint(x1, y1);
        this.connectionLine.setEndPoint(figure.getAbsoluteX(), figure.getAbsoluteY());
    }, onDragEnd: function(canvas, figure) {
        this.connectionLine.setCanvas(null);
        this.connectionLine = null;
    }, onHoverEnter: function(canvas, draggedFigure, hoverFiger) {
        this.connectionLine.setGlow(true);
        hoverFiger.setGlow(true);
    }, onHoverLeave: function(canvas, draggedFigure, hoverFiger) {
        hoverFiger.setGlow(false);
        this.connectionLine.setGlow(false);
    }});
draw2d.policy.port.IntrusivePortsFeedbackPolicy = draw2d.policy.port.PortFeedbackPolicy.extend({NAME: "draw2d.policy.port.IntrusivePortsFeedbackPolicy", init: function() {
        this._super();
        this.connectionLine = null;
        this.tweenable = null;
    }, onDragStart: function(canvas, figure) {
        var start = 0;
        figure.getDropTargets().each(function(i, element) {
            element.__beforeInflate = element.getWidth();
            start = element.__beforeInflate;
        });
        var portsToGrow = figure.getDropTargets();
        portsToGrow.grep(function(p) {
            return(p.NAME != figure.NAME && p.parent !== figure.parent) || (p instanceof draw2d.HybridPort) || (figure instanceof draw2d.HybridPort);
        });
        this.tweenable = new Tweenable();
        this.tweenable.tween({from: {"size": start / 2}, to: {"size": start}, duration: 200, easing: "easeOutSine", step: function(params) {
                portsToGrow.each(function(i, element) {
                    element.shape.attr({rx: params.size, ry: params.size});
                    element.width = element.height = params.size * 2;
                });
            }});
        this.connectionLine = new draw2d.shape.basic.Line();
        this.connectionLine.setCanvas(canvas);
        this.connectionLine.getShapeElement();
        this.connectionLine.setDashArray("- ");
        this.connectionLine.setColor("#30c48a");
        this.onDrag(canvas, figure);
    }, onDrag: function(canvas, figure) {
        var x1 = figure.ox + figure.getParent().getAbsoluteX();
        var y1 = figure.oy + figure.getParent().getAbsoluteY();
        this.connectionLine.setStartPoint(x1, y1);
        this.connectionLine.setEndPoint(figure.getAbsoluteX(), figure.getAbsoluteY());
    }, onDragEnd: function(canvas, figure) {
        this.tweenable.stop(false);
        this.tweenable = null;
        figure.getDropTargets().each(function(i, element) {
            element.shape.attr({rx: element.__beforeInflate / 2, ry: element.__beforeInflate / 2});
            element.width = element.height = element.__beforeInflate;
        });
        this.connectionLine.setCanvas(null);
        this.connectionLine = null;
    }, onHoverEnter: function(canvas, draggedFigure, hoverFiger) {
        this.connectionLine.setGlow(true);
        hoverFiger.setGlow(true);
    }, onHoverLeave: function(canvas, draggedFigure, hoverFiger) {
        hoverFiger.setGlow(false);
        this.connectionLine.setGlow(false);
    }});
draw2d.Canvas = Class.extend({NAME: "draw2d.Canvas", init: function(canvasId) {
        if (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) === 8) {
            this.fromDocumentToCanvasCoordinate = this._fromDocumentToCanvasCoordinate_IE8_HACK;
        }
        this.setScrollArea(document.body);
        this.canvasId = canvasId;
        this.html = jQuery("#" + canvasId);
        this.html.css({"cursor": "default"});
        this.initialWidth = this.getWidth();
        this.initialHeight = this.getHeight();
        this.html.css({"-webkit-tap-highlight-color": "rgba(0,0,0,0)"});
        this.html.droppable({accept: ".draw2d_droppable", over: jQuery.proxy(function(event, ui) {
                this.onDragEnter(ui.draggable);
            }, this), out: jQuery.proxy(function(event, ui) {
                this.onDragLeave(ui.draggable);
            }, this), drop: jQuery.proxy(function(event, ui) {
                event = this._getEvent(event);
                var pos = this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                this.onDrop(ui.draggable, pos.getX(), pos.getY());
            }, this)});
        jQuery(".draw2d_droppable").draggable({appendTo: "body", stack: "body", zIndex: 27000, helper: "clone", drag: jQuery.proxy(function(event, ui) {
                event = this._getEvent(event);
                var pos = this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                this.onDrag(ui.draggable, pos.getX(), pos.getY());
            }, this), stop: function(e, ui) {
                this.isInExternalDragOperation = false;
            }, start: function(e, ui) {
                this.isInExternalDragOperation = true;
                jQuery(ui.helper).addClass("shadow");
            }});
        this.paper = Raphael(canvasId, this.getWidth(), this.getHeight());
        this.paper.canvas.style.position = "absolute";
        this.zoomFactor = 1;
        this.selection = new draw2d.Selection();
        this.currentDropTarget = null;
        this.isInExternalDragOperation = false;
        this.currentHoverFigure = null;
        this.editPolicy = new draw2d.util.ArrayList();
        this.figures = new draw2d.util.ArrayList();
        this.lines = new draw2d.util.ArrayList();
        this.commonPorts = new draw2d.util.ArrayList();
        this.dropTargets = new draw2d.util.ArrayList();
        this.resizeHandles = new draw2d.util.ArrayList();
        this.selectionListeners = new draw2d.util.ArrayList();
        this.commandStack = new draw2d.command.CommandStack();
        this.linesToRepaintAfterDragDrop = new draw2d.util.ArrayList();
        this.lineIntersections = new draw2d.util.ArrayList();
        this.installEditPolicy(new draw2d.policy.canvas.BoundingboxSelectionPolicy());
        this.commandStack.addEventListener(jQuery.proxy(function(event) {
            if (event.isPostChangeEvent() === true) {
                this.calculateConnectionIntersection();
                this.linesToRepaintAfterDragDrop.each(function(i, line) {
                    line.svgPathString = null;
                    line.repaint();
                });
                this.linesToRepaintAfterDragDrop = new draw2d.util.ArrayList();
            }
        }, this));
        this.mouseDown = false;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.mouseDragDiffX = 0;
        this.mouseDragDiffY = 0;
        this.html.bind("mouseup touchend", jQuery.proxy(function(event) {
            if (this.mouseDown === false) {
                return;
            }
            event = this._getEvent(event);
            this.calculateConnectionIntersection();
            this.mouseDown = false;
            var pos = this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
            this.editPolicy.each(jQuery.proxy(function(i, policy) {
                policy.onMouseUp(this, pos.x, pos.y);
            }, this));
            this.mouseDragDiffX = 0;
            this.mouseDragDiffY = 0;
        }, this));
        this.html.bind("mousemove touchmove", jQuery.proxy(function(event) {
            event = this._getEvent(event);
            if (this.mouseDown === false) {
                var pos = this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                try {
                    var hover = this.getBestFigure(pos.x, pos.y);
                    if (hover !== this.currentHoverFigure && this.currentHoverFigure !== null) {
                        this.currentHoverFigure.onMouseLeave();
                    }
                    if (hover !== this.currentHoverFigure && hover !== null) {
                        hover.onMouseEnter();
                    }
                    this.currentHoverFigure = hover;
                } catch (exc) {
                    console.log(exc);
                }
                this.editPolicy.each(jQuery.proxy(function(i, policy) {
                    policy.onMouseMove(this, pos.x, pos.y);
                }, this));
            } else {
                var diffXAbs = (event.clientX - this.mouseDownX) * this.zoomFactor;
                var diffYAbs = (event.clientY - this.mouseDownY) * this.zoomFactor;
                this.editPolicy.each(jQuery.proxy(function(i, policy) {
                    policy.onMouseDrag(this, diffXAbs, diffYAbs, diffXAbs - this.mouseDragDiffX, diffYAbs - this.mouseDragDiffY);
                }, this));
                this.mouseDragDiffX = diffXAbs;
                this.mouseDragDiffY = diffYAbs;
            }
        }, this));
        this.html.bind("mousedown touchstart", jQuery.proxy(function(event) {
            var pos = null;
            switch (event.which) {
                case 1:
                case 0:
                    event.preventDefault();
                    event = this._getEvent(event);
                    this.mouseDownX = event.clientX;
                    this.mouseDownY = event.clientY;
                    this.mouseDragDiffX = 0;
                    this.mouseDragDiffY = 0;
                    pos = this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    this.mouseDown = true;
                    this.editPolicy.each(jQuery.proxy(function(i, policy) {
                        policy.onMouseDown(this, pos.x, pos.y);
                    }, this));
                    break;
                case 3:
                    event.preventDefault();
                    event = this._getEvent(event);
                    pos = this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    this.onRightMouseDown(pos.x, pos.y);
                    break;
                case 2:
                    break;
                default:
            }
        }, this));
        jQuery(document).bind("dblclick", jQuery.proxy(function(event) {
            event = this._getEvent(event);
            this.mouseDownX = event.clientX;
            this.mouseDownY = event.clientY;
            var pos = this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
            this.onDoubleClick(pos.x, pos.y);
        }, this));
        jQuery(document).bind("click", jQuery.proxy(function(event) {
            event = this._getEvent(event);
            if (this.mouseDownX === event.clientX || this.mouseDownY === event.clientY) {
                var pos = this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                this.onClick(pos.x, pos.y);
            }
        }, this));
        jQuery(document).bind("keydown", jQuery.proxy(function(event) {
            if (!jQuery(event.target).is("input")) {
                var ctrl = event.ctrlKey;
                this.onKeyDown(event.keyCode, ctrl);
            }
        }, this));
    }, calculateConnectionIntersection: function() {
        this.lineIntersections = new draw2d.util.ArrayList();
        var lines = this.getLines().clone();
        while (lines.getSize() > 0) {
            var l1 = lines.removeElementAt(0);
            lines.each(jQuery.proxy(function(ii, l2) {
                var partInter = l1.intersection(l2);
                if (partInter.getSize() > 0) {
                    this.lineIntersections.add({line: l1, other: l2, intersection: partInter});
                    this.lineIntersections.add({line: l2, other: l1, intersection: partInter});
                }
            }, this));
        }
    }, clear: function() {
        this.lines.clone().each(jQuery.proxy(function(i, e) {
            this.removeFigure(e);
        }, this));
        this.figures.clone().each(jQuery.proxy(function(i, e) {
            this.removeFigure(e);
        }, this));
        this.zoomFactor = 1;
        this.selection.clear();
        this.currentDropTarget = null;
        this.isInExternalDragOperation = false;
        this.figures = new draw2d.util.ArrayList();
        this.lines = new draw2d.util.ArrayList();
        this.commonPorts = new draw2d.util.ArrayList();
        this.dropTargets = new draw2d.util.ArrayList();
        this.commandStack.markSaveLocation();
        this.linesToRepaintAfterDragDrop = new draw2d.util.ArrayList();
        this.lineIntersections = new draw2d.util.ArrayList();
        this.selectionListeners.each(function(i, w) {
            w.onSelectionChanged(null);
        });
    }, installEditPolicy: function(policy) {
        if (policy instanceof draw2d.policy.canvas.SelectionPolicy) {
            this.getSelection().getAll().each(function(i, figure) {
                figure.unselect();
            });
            this.editPolicy.grep(jQuery.proxy(function(p) {
                var stay = !(p instanceof draw2d.policy.canvas.SelectionPolicy);
                if (stay === false) {
                    p.onUninstall(this);
                }
                return stay;
            }, this));
        } else {
            if (policy instanceof draw2d.policy.canvas.SnapToEditPolicy) {
                this.editPolicy.grep(jQuery.proxy(function(p) {
                    var stay = !(p instanceof draw2d.policy.canvas.SnapToEditPolicy);
                    if (stay === false) {
                        p.onUninstall(this);
                    }
                    return stay;
                }, this));
            }
        }
        policy.onInstall(this);
        this.editPolicy.add(policy);
    }, uninstallEditPolicy: function(policy) {
        if (!(policy instanceof draw2d.policy.EditPolicy)) {
            return;
        }
        this.editPolicy.grep(jQuery.proxy(function(p) {
            if (p === policy) {
                p.onUninstall(this);
                return false;
            }
            return true;
        }, this));
    }, setZoom: function(zoomFactor, animated) {
        var _zoom = jQuery.proxy(function(z) {
            this.zoomFactor = Math.min(Math.max(0.01, z), 10);
            var viewBoxWidth = (this.initialWidth * this.zoomFactor) | 0;
            var viewBoxHeight = (this.initialHeight * this.zoomFactor) | 0;
            this.paper.setViewBox(0, 0, viewBoxWidth, viewBoxHeight);
        }, this);
        if (animated) {
            var myTweenable = new Tweenable();
            myTweenable.tween({from: {"x": this.zoomFactor}, to: {"x": zoomFactor}, duration: 300, easing: "easeOutSine", step: function(params) {
                    _zoom(params.x);
                }});
        } else {
            _zoom(zoomFactor);
        }
    }, getZoom: function() {
        return this.zoomFactor;
    }, fromDocumentToCanvasCoordinate: function(x, y) {
        return new draw2d.geo.Point((x - this.getAbsoluteX() + this.getScrollLeft()) * this.zoomFactor, (y - this.getAbsoluteY() + this.getScrollTop()) * this.zoomFactor);
    }, _fromDocumentToCanvasCoordinate_IE8_HACK: function(x, y) {
        return new draw2d.geo.Point((x - this.getAbsoluteX()) * this.zoomFactor, (y - this.getAbsoluteY()) * this.zoomFactor);
    }, fromCanvasToDocumentCoordinate: function(x, y) {
        return new draw2d.geo.Point((x + this.getAbsoluteX() - this.getScrollLeft()) * this.zoomFactor, (y + this.getAbsoluteY() - this.getScrollTop()) * this.zoomFactor);
    }, getHtmlContainer: function() {
        return this.html;
    }, _getEvent: function(event) {
        if (typeof event.originalEvent !== "undefined") {
            if (event.originalEvent.touches && event.originalEvent.touches.length) {
                return event.originalEvent.touches[0];
            } else {
                if (event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
                    return event.originalEvent.changedTouches[0];
                }
            }
        }
        return event;
    }, setScrollArea: function(elementSelector) {
        this.scrollArea = jQuery(elementSelector);
    }, getScrollArea: function() {
        return this.scrollArea;
    }, getScrollLeftOld: function() {
        return this.scrollArea.scrollLeft();
    }, getScrollTopOld: function() {
        return this.scrollArea.scrollTop();
    }, getScrollLeft: function() {
        //return this.scrollArea.scrollLeft();
        return typeof window.pageXOffset != 'undefined' ? window.pageXOffset : document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft ? document.body.scrollLeft : 0;
    }, getScrollTop: function() {
        //return this.scrollArea.scrollTop();
        // found from here http://stackoverflow.com/questions/2717252/document-body-scrolltop-is-always-0-in-ie-even-when-scrolling
        // 8-29-13 nembery at the end of the day! now I go home!
        return typeof window.pageYOffset != 'undefined' ? window.pageYOffset : document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ? document.body.scrollTop : 0;
    }, getAbsoluteX: function() {
        return this.html.offset().left;
    }, getAbsoluteY: function() {
        return this.html.offset().top;
    }, getWidth: function() {
        return this.html.width();
    }, getHeight: function() {
        return this.html.height();
    }, addFigure: function(figure, x, y) {
        if (figure.getCanvas() === this) {
            return;
        }
        figure.setCanvas(this);
        figure.getShapeElement();
        if (figure instanceof draw2d.shape.basic.Line) {
            this.lines.add(figure);
            this.linesToRepaintAfterDragDrop = this.lines;
        } else {
            this.figures.add(figure);
            if (typeof y !== "undefined") {
                figure.setPosition(x, y);
            }
        }
        figure.repaint();
        figure.fireMoveEvent();
    }, removeFigure: function(figure) {
        this.editPolicy.each(jQuery.proxy(function(i, policy) {
            if (typeof policy.unselect !== "undefined") {
                if (typeof policy.unselect === "function") {
                    policy.unselect(this, figure);
                }
            }
        }, this));
        if (figure instanceof draw2d.shape.basic.Line) {
            this.lines.remove(figure);
        } else {
            this.figures.remove(figure);
        }
        figure.setCanvas(null);
        if (figure instanceof draw2d.Connection) {
            figure.disconnect();
        }
    }, getLines: function() {
        return this.lines;
    }, getFigures: function() {
        return this.figures;
    }, getLine: function(id) {
        var count = this.lines.getSize();
        for (var i = 0; i < count; i++) {
            var line = this.lines.get(i);
            if (line.getId() === id) {
                return line;
            }
        }
        return null;
    }, getFigure: function(id) {
        var figure = null;
        this.figures.each(function(i, e) {
            if (e.id === id) {
                figure = e;
                return false;
            }
        });
        return figure;
    }, getIntersection: function(line) {
        var result = new draw2d.util.ArrayList();
        this.lineIntersections.each(jQuery.proxy(function(i, entry) {
            if (entry.line === line) {
                entry.intersection.each(function(i, p) {
                    result.add({x: p.x, y: p.y, justTouching: p.justTouching, other: entry.other});
                });
            }
        }, this));
        return result;
    }, snapToHelper: function(figure, pos) {
        this.editPolicy.each(jQuery.proxy(function(i, policy) {
            pos = policy.snap(this, figure, pos);
        }, this));
        return pos;
    }, registerPort: function(port) {
        port.targets = this.dropTargets;
        this.commonPorts.add(port);
        this.dropTargets.add(port);
    }, unregisterPort: function(port) {
        port.targets = null;
        this.commonPorts.remove(port);
        this.dropTargets.remove(port);
    }, getAllPorts: function() {
        return this.commonPorts;
    }, getCommandStack: function() {
        return this.commandStack;
    }, getCurrentSelection: function() {
        return this.selection.getPrimary();
    }, getSelection: function() {
        return this.selection;
    }, setCurrentSelection: function(figure) {
        this.editPolicy.each(jQuery.proxy(function(i, policy) {
            if (typeof policy.select === "function") {
                policy.select(this, figure);
            }
        }, this));
    }, addSelectionListener: function(w) {
        if (w !== null) {
            if (typeof w === "function") {
                this.selectionListeners.add({onSelectionChanged: w});
            } else {
                if (typeof w.onSelectionChanged === "function") {
                    this.selectionListeners.add(w);
                } else {
                    throw"Object doesn't implement required callback method [onSelectionChanged]";
                }
            }
        }
    }, removeSelectionListener: function(w) {
        this.selectionListeners = this.selectionListeners.grep(function(listener) {
            return listener !== w && listener.onSelectionChanged !== w;
        });
    }, getBestFigure: function(x, y, figureToIgnore) {
        var result = null;
        var testFigure = null;
        var i = 0;
        var children = null;
        for (i = 0, len = this.resizeHandles.getSize(); i < len; i++) {
            testFigure = this.resizeHandles.get(i);
            if (testFigure.isVisible() === true && testFigure.hitTest(x, y) === true && testFigure !== figureToIgnore) {
                return testFigure;
            }
        }
        for (i = 0, len = this.commonPorts.getSize(); i < len; i++) {
            testFigure = this.commonPorts.get(i);
            if (testFigure !== figureToIgnore) {
                if (testFigure.isVisible() === true && testFigure.hitTest(x, y) === true) {
                    return testFigure;
                }
            }
        }
        result = this.getBestLine(x, y, figureToIgnore);
        if (result !== null) {
            return result;
        }
        for (i = (this.figures.getSize() - 1); i >= 0; i--) {
            var figure = this.figures.get(i);
            var checkRecursive = function(children) {
                children.each(function(i, e) {
                    checkRecursive(e.getChildren());
                    if (result === null && e.isVisible() === true && e.hitTest(x, y) === true) {
                        result = e;
                    }
                    return result === null;
                });
            };
            checkRecursive(figure.getChildren());
            if (result === null && figure.isVisible() === true && figure.hitTest(x, y) === true && figure !== figureToIgnore) {
                if (result === null) {
                    result = figure;
                } else {
                    if (result.getZOrder() < figure.getZOrder()) {
                        result = figure;
                    }
                }
            }
            if (result !== null) {
                return result;
            }
        }
        var count = this.lines.getSize();
        for (i = 0; i < count; i++) {
            var line = this.lines.get(i);
            children = line.getChildren();
            children.each(function(i, e) {
                if (e.isVisible() === true && e.hitTest(x, y) === true) {
                    result = e;
                    return false;
                }
                return true;
            });
        }
        return result;
    }, getBestLine: function(x, y, lineToIgnore) {
        var result = null;
        var count = this.lines.getSize();
        for (var i = 0; i < count; i++) {
            var line = this.lines.get(i);
            if (line.isVisible() === true && line.hitTest(x, y) === true && line !== lineToIgnore) {
                if (result === null) {
                    result = line;
                    break;
                }
            }
        }
        return result;
    }, hideSnapToHelperLines: function() {
        this.hideSnapToHelperLineHorizontal();
        this.hideSnapToHelperLineVertical();
    }, hideSnapToHelperLineHorizontal: function() {
    }, hideSnapToHelperLineVertical: function() {
    }, onDragEnter: function(draggedDomNode) {
    }, onDrag: function(draggedDomNode, x, y) {
    }, onDragLeave: function(draggedDomNode) {
    }, onDrop: function(droppedDomNode, x, y) {
    }, onKeyDown: function(keyCode, ctrl) {
        if (keyCode == 46 && this.selection.getPrimary() !== null) {
            this.commandStack.execute(this.selection.getPrimary().createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.DELETE)));
        } else {
            if (keyCode == 90 && ctrl) {
                this.commandStack.undo();
            } else {
                if (keyCode == 89 && ctrl) {
                    this.commandStack.redo();
                } else {
                    if (keyCode === 107) {
                        this.setZoom(this.zoomFactor * 0.95);
                    } else {
                        if (keyCode === 109) {
                            this.setZoom(this.zoomFactor * 1.05);
                        }
                    }
                }
            }
        }
    }, onDoubleClick: function(x, y) {
        var figure = this.getBestFigure(x, y);
        if (figure !== null) {
            figure.onDoubleClick();
        }
    }, onClick: function(x, y) {
        var figure = this.getBestFigure(x, y);
        if (figure !== null) {
            figure.onClick();
        }
    }, onRightMouseDown: function(x, y) {
        var figure = this.getBestFigure(x, y);
        if (figure !== null) {
            figure.onContextMenu(x, y);
        }
    }});
draw2d.Selection = Class.extend({NAME: "draw2d.Selection", init: function() {
        this.primary = null;
        this.all = new draw2d.util.ArrayList();
    }, clear: function() {
        this.primary = null;
        this.all = new draw2d.util.ArrayList();
    }, getPrimary: function() {
        return this.primary;
    }, setPrimary: function(figure) {
        this.primary = figure;
        if (figure !== null && !this.all.contains(figure)) {
            this.all.add(figure);
        }
    }, remove: function(figure) {
        this.all.remove(figure);
        if (this.primary === figure) {
            this.primary = null;
        }
    }, contains: function(figure) {
        return this.all.contains(figure);
    }, getAll: function() {
        return this.all.clone();
    }});
draw2d.Figure = Class.extend({NAME: "draw2d.Figure", MIN_TIMER_INTERVAL: 50, init: function(width, height) {
        this.id = draw2d.util.UUID.create();
        this.isResizeHandle = false;
        this.command = null;
        this.canvas = null;
        this.shape = null;
        this.children = new draw2d.util.ArrayList();
        this.selectable = true;
        this.deleteable = true;
        this.resizeable = true;
        this.draggable = true;
        this.visible = true;
        this.canSnapToHelper = true;
        this.snapToGridAnchor = new draw2d.geo.Point(0, 0);
        this.editPolicy = new draw2d.util.ArrayList();
        this.timerId = -1;
        this.timerInterval = 0;
        this.parent = null;
        this.userData = null;
        this.x = 0;
        this.y = 0;
        this.minHeight = 5;
        this.minWidth = 5;
        this.rotationAngle = 0;
        this.cssClass = null;
        if (typeof height !== "undefined") {
            this.width = width;
            this.height = height;
        } else {
            this.width = this.getMinWidth();
            this.height = this.getMinHeight();
        }
        this.alpha = 1;
        this.isInDragDrop = false;
        this.originalAlpha = this.alpha;
        this.ox = 0;
        this.oy = 0;
        this.repaintBlocked = false;
        this.selectionHandles = new draw2d.util.ArrayList();
        this.moveListener = new draw2d.util.ArrayList();
        this.resizeListener = new draw2d.util.ArrayList();
        this.installEditPolicy(new draw2d.policy.figure.RectangleSelectionFeedbackPolicy());
    }, select: function(asPrimarySelection) {
        if (typeof asPrimarySelection === "undefined") {
            asPrimarySelection = true;
        }
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
                e.onSelect(this.canvas, this, asPrimarySelection);
            }
        }, this));
        return this;
    }, unselect: function() {
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
                e.onUnselect(this.canvas, this);
            }
        }, this));
        return this;
    }, setUserData: function(object) {
        this.userData = object;
    }, getUserData: function() {
        return this.userData;
    }, getId: function() {
        return this.id;
    }, setId: function(id) {
        this.id = id;
        return this;
    }, getCssClass: function() {
        return this.cssClass;
    }, setCssClass: function(cssClass) {
        this.cssClass = cssClass === null ? null : jQuery.trim(cssClass);
        if (this.shape === null) {
            return this;
        }
        if (this.cssClass === null) {
            this.shape.node.removeAttribute("class");
        } else {
            this.shape.node.setAttribute("class", this.cssClass);
        }
        return this;
    }, hasCssClass: function(className) {
        if (this.cssClass === null) {
            return false;
        }
        return new RegExp(" " + jQuery.trim(className) + " ").test(" " + this.cssClass + " ");
    }, addCssClass: function(className) {
        className = jQuery.trim(className);
        if (!this.hasCssClass(className)) {
            if (this.cssClass === null) {
                this.setCssClass(className);
            } else {
                this.setCssClass(this.cssClass + " " + className);
            }
        }
        return this;
    }, removeCssClass: function(className) {
        className = jQuery.trim(className);
        var newClass = " " + this.cssClass.replace(/[\t\r\n]/g, " ") + " ";
        if (this.hasCssClass(className)) {
            while (newClass.indexOf(" " + className + " ") >= 0) {
                newClass = newClass.replace(" " + className + " ", " ");
            }
            this.setCssClass(newClass.replace(/^\s+|\s+$/g, ""));
        }
        return this;
    }, toggleCssClass: function(className) {
        className = jQuery.trim(className);
        var newClass = " " + this.cssClass.replace(/[\t\r\n]/g, " ") + " ";
        if (this.hasCssClass(className)) {
            while (newClass.indexOf(" " + className + " ") >= 0) {
                newClass = newClass.replace(" " + className + " ", " ");
            }
            this.setCssClass(newClass.replace(/^\s+|\s+$/g, ""));
        } else {
            this.setCssClass(this.cssClass + " " + className);
        }
        return this;
    }, setCanvas: function(canvas) {
        if (canvas === null && this.shape !== null) {
            this.unselect();
            this.shape.remove();
            this.shape = null;
        }
        this.canvas = canvas;
        if (this.canvas !== null) {
            this.getShapeElement();
        }
        if (canvas === null) {
            this.stopTimer();
        } else {
            if (this.timerInterval >= this.MIN_TIMER_INTERVAL) {
                this.startTimer(this.timerInterval);
            }
        }
        this.children.each(function(i, e) {
            e.figure.setCanvas(canvas);
        });
        return this;
    }, getCanvas: function() {
        return this.canvas;
    }, startTimer: function(milliSeconds) {
        this.stopTimer();
        this.timerInterval = Math.max(this.MIN_TIMER_INTERVAL, milliSeconds);
        if (this.canvas !== null) {
            this.timerId = window.setInterval(jQuery.proxy(this.onTimer, this), this.timerInterval);
        }
        return this;
    }, stopTimer: function() {
        if (this.timerId >= 0) {
            window.clearInterval(this.timerId);
            this.timerId = -1;
        }
        return this;
    }, onTimer: function() {
    }, installEditPolicy: function(policy) {
        if (policy instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
            this.editPolicy.grep(jQuery.proxy(function(p) {
                var stay = !(p instanceof draw2d.policy.figure.SelectionFeedbackPolicy);
                if (!stay) {
                    p.onUninstall(this);
                }
                return stay;
            }, this));
        }
        policy.onInstall(this);
        this.editPolicy.add(policy);
        return this;
    }, addFigure: function(child, locator) {
        child.setDraggable(false);
        child.setSelectable(false);
        child.setParent(this);
        this.children.add({figure: child, locator: locator});
        if (this.canvas !== null) {
            child.setCanvas(this.canvas);
        }
        this.repaint();
        return this;
    }, getChildren: function() {
        var shapes = new draw2d.util.ArrayList();
        this.children.each(function(i, e) {
            shapes.add(e.figure);
        });
        return shapes;
    }, resetChildren: function() {
        this.children.each(function(i, e) {
            e.figure.setCanvas(null);
        });
        this.children = new draw2d.util.ArrayList();
        this.repaint();
        return this;
    }, getShapeElement: function() {
        if (this.shape !== null) {
            return this.shape;
        }
        this.shape = this.createShapeElement();
        if (this.cssClass !== null) {
            this.shape.node.setAttribute("class", this.cssClass);
        }
        return this.shape;
    }, createShapeElement: function() {
        throw"Inherited class [" + this.NAME + "] must override the abstract method createShapeElement";
    }, repaint: function(attributes) {
        if (this.visible === true) {
            this.shape.show();
        } else {
            this.shape.hide();
            return;
        }
        attributes.opacity = this.alpha;
        this.shape.attr(attributes);
        this.applyTransformation();
        this.children.each(function(i, e) {
            e.locator.relocate(i, e.figure);
        });
    }, applyTransformation: function() {
    }, setGlow: function(flag) {
        return this;
    }, onDragStart: function(relativeX, relativeY) {
        this.isInDragDrop = false;
        this.command = this.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE));
        if (this.command !== null) {
            this.ox = this.x;
            this.oy = this.y;
            this.isInDragDrop = true;
            this.editPolicy.each(jQuery.proxy(function(i, e) {
                if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                    e.onDragStart(this.canvas, this);
                }
            }, this));
            return true;
        }
        return false;
    }, onDrag: function(dx, dy, dx2, dy2) {
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                var newPos = e.adjustPosition(this, this.ox + dx, this.oy + dy);
                dx = newPos.x - this.ox;
                dy = newPos.y - this.oy;
            }
        }, this));
        this.x = this.ox + dx;
        this.y = this.oy + dy;
        if (this.getCanSnapToHelper()) {
            var p = new draw2d.geo.Point(this.x, this.y);
            p = this.getCanvas().snapToHelper(this, p);
            this.x = p.x;
            this.y = p.y;
        }
        this.setPosition(this.x, this.y);
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.onDrag(this.canvas, this);
            }
        }, this));
    }, onPanning: function(dx, dy, dx2, dy2) {
    }, onDragEnd: function() {
        this.setAlpha(this.originalAlpha);
        this.command.setPosition(this.x, this.y);
        this.isInDragDrop = false;
        this.canvas.getCommandStack().execute(this.command);
        this.command = null;
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.onDragEnd(this.canvas, this);
            }
        }, this));
        this.fireMoveEvent();
    }, onDragEnter: function(draggedFigure) {
        return null;
    }, onDragLeave: function(draggedFigure) {
    }, onDrop: function(dropTarget) {
    }, onMouseEnter: function() {
    }, onMouseLeave: function() {
    }, onDoubleClick: function() {
    }, onClick: function() {
    }, onContextMenu: function(x, y) {
    }, setAlpha: function(percent) {
        percent = Math.min(1, Math.max(0, parseFloat(percent)));
        if (percent === this.alpha) {
            return;
        }
        this.alpha = percent;
        this.repaint();
        return this;
    }, getAlpha: function() {
        return this.alpha;
    }, setRotationAngle: function(angle) {
        this.rotationAngle = angle;
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(this.canvas, this);
            }
        }, this));
        this.repaint();
        return this;
    }, getRotationAngle: function() {
        return this.rotationAngle;
    }, setVisible: function(flag) {
        this.visible = !!flag;
        this.repaint();
        return this;
    }, isVisible: function() {
        return this.visible && this.shape !== null;
    }, getZOrder: function() {
        if (this.shape === null) {
            return -1;
        }
        var i = 0;
        var child = this.shape.node;
        while ((child = child.previousSibling) !== null) {
            i++;
        }
        return i;
    }, setCanSnapToHelper: function(flag) {
        this.canSnapToHelper = !!flag;
        return this;
    }, getCanSnapToHelper: function() {
        return this.canSnapToHelper;
    }, getSnapToGridAnchor: function() {
        return this.snapToGridAnchor;
    }, setSnapToGridAnchor: function(point) {
        this.snapToGridAnchor = point;
    }, getWidth: function() {
        return this.width;
    }, getHeight: function() {
        return this.height;
    }, getMinWidth: function() {
        return this.minWidth;
    }, setMinWidth: function(w) {
        this.minWidth = parseFloat(w);
        return this;
    }, getMinHeight: function() {
        return this.minHeight;
        return this;
    }, setMinHeight: function(h) {
        this.minHeight = parseFloat(h);
        return this;
    }, getX: function() {
        return this.x;
    }, getY: function() {
        return this.y;
    }, getAbsoluteX: function() {
        if (this.parent === null) {
            return this.x || 0;
        }
        return this.x + this.parent.getAbsoluteX();
    }, getAbsoluteY: function() {
        if (this.parent === null) {
            return this.y || 0;
        }
        return this.y + this.parent.getAbsoluteY();
    }, getAbsolutePosition: function() {
        return new draw2d.geo.Point(this.getAbsoluteX(), this.getAbsoluteY());
    }, getAbsoluteBounds: function() {
        return new draw2d.geo.Rectangle(this.getAbsoluteX(), this.getAbsoluteY(), this.getWidth(), this.getHeight());
    }, setPosition: function(x, y) {
        if (x instanceof draw2d.geo.Point) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
        this.repaint();
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(this.canvas, this);
            }
        }, this));
        this.fireMoveEvent();
        return this;
    }, getPosition: function() {
        return new draw2d.geo.Point(this.x, this.y);
    }, translate: function(dx, dy) {
        this.setPosition(this.x + dx, this.y + dy);
        return this;
    }, setDimension: function(w, h) {
        w = Math.max(this.getMinWidth(), w);
        h = Math.max(this.getMinHeight(), h);
        if (this.width === w && this.height === h) {
            return;
        }
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                var newDim = e.adjustDimension(this, w, h);
                w = newDim.w;
                h = newDim.h;
            }
        }, this));
        this.width = Math.max(this.getMinWidth(), w);
        this.height = Math.max(this.getMinHeight(), h);
        this.repaint();
        this.fireResizeEvent();
        this.fireMoveEvent();
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(this.canvas, this);
            }
        }, this));
        return this;
    }, getBoundingBox: function() {
        return new draw2d.geo.Rectangle(this.getAbsoluteX(), this.getAbsoluteY(), this.getWidth(), this.getHeight());
    }, hitTest: function(iX, iY, corona) {
        if (typeof corona === "number") {
            return this.getBoundingBox().scale(corona, corona).hitTest(iX, iY);
        }
        return this.getBoundingBox().hitTest(iX, iY);
    }, setDraggable: function(flag) {
        this.draggable = !!flag;
        return this;
    }, isDraggable: function() {
        return this.draggable;
    }, isResizeable: function() {
        return this.resizeable;
    }, setResizeable: function(flag) {
        this.resizeable = !!flag;
        return this;
    }, isSelectable: function() {
        return this.selectable;
    }, setSelectable: function(flag) {
        this.selectable = !!flag;
        return this;
    }, isStrechable: function() {
        return true;
    }, isDeleteable: function() {
        return this.deleteable;
    }, setDeleteable: function(flag) {
        this.deleteable = !!flag;
        return this;
    }, setParent: function(parent) {
        this.parent = parent;
        return this;
    }, getParent: function() {
        return this.parent;
    }, attachResizeListener: function(listener) {
        if (listener === null) {
            return;
        }
        this.resizeListener.add(listener);
        return this;
    }, detachResizeListener: function(figure) {
        if (figure === null) {
            return;
        }
        this.resizeListener.remove(figure);
        return this;
    }, fireResizeEvent: function() {
        this.resizeListener.each(jQuery.proxy(function(i, item) {
            item.onOtherFigureIsResizing(this);
        }, this));
        return this;
    }, onOtherFigureIsResizing: function(figure) {
    }, attachMoveListener: function(listener) {
        if (listener === null) {
            return;
        }
        if (!this.moveListener.contains(listener)) {
            this.moveListener.add(listener);
        }
        return this;
    }, detachMoveListener: function(figure) {
        if (figure === null) {
            return;
        }
        this.moveListener.remove(figure);
        return this;
    }, fireMoveEvent: function() {
        this.moveListener.each(jQuery.proxy(function(i, item) {
            item.onOtherFigureIsMoving(this);
        }, this));
        return this;
    }, onOtherFigureIsMoving: function(figure) {
    }, createCommand: function(request) {
        if (request === null) {
            return null;
        }
        if (request.getPolicy() === draw2d.command.CommandType.MOVE) {
            if (!this.isDraggable()) {
                return null;
            }
            return new draw2d.command.CommandMove(this);
        }
        if (request.getPolicy() === draw2d.command.CommandType.DELETE) {
            if (!this.isDeleteable()) {
                return null;
            }
            return new draw2d.command.CommandDelete(this);
        }
        if (request.getPolicy() === draw2d.command.CommandType.RESIZE) {
            if (!this.isResizeable()) {
                return null;
            }
            return new draw2d.command.CommandResize(this);
        }
        return null;
    }, getPersistentAttributes: function() {
        var memento = {type: this.NAME, id: this.id, x: this.x, y: this.y, width: this.width, height: this.height, userData: this.userData};
        if (this.cssClass !== null) {
            memento.cssClass = this.cssClass;
        }
        return memento;
    }, setPersistentAttributes: function(memento) {
        this.id = memento.id;
        this.x = memento.x;
        this.y = memento.y;
        if (typeof memento.width !== "undefined") {
            this.width = memento.width;
        }
        if (typeof memento.height !== "undefined") {
            this.height = memento.height;
        }
        if (typeof memento.userData !== "undefined") {
            this.userData = memento.userData;
        }
        if (typeof memento.cssClass !== "undefined") {
            this.setCssClass(memento.cssClass);
        }
        return this;
    }});
draw2d.shape.node.Node = draw2d.Figure.extend({NAME: "draw2d.shape.node.Node", init: function(width, height) {
        this.inputPorts = new draw2d.util.ArrayList();
        this.outputPorts = new draw2d.util.ArrayList();
        this.hybridPorts = new draw2d.util.ArrayList();
        this.portRelayoutRequired = true;
        this.cachedPorts = null;
        this._super(width, height);
    }, onDoubleClick: function() {
        var w = this.getWidth();
        var h = this.getHeight();
        this.setRotationAngle((this.getRotationAngle() + 90) % 360);
        this.setDimension(h, w);
        this.portRelayoutRequired = true;
    }, getPorts: function() {
        if (this.cachedPorts === null) {
            this.cachedPorts = new draw2d.util.ArrayList();
            this.cachedPorts.addAll(this.inputPorts);
            this.cachedPorts.addAll(this.outputPorts);
            this.cachedPorts.addAll(this.hybridPorts);
            this.children.each(jQuery.proxy(function(i, e) {
                this.cachedPorts.addAll(e.figure.getPorts());
            }, this));
        }
        return this.cachedPorts;
    }, getInputPorts: function() {
        return this.inputPorts.clone().addAll(this.hybridPorts);
    }, getOutputPorts: function() {
        return this.outputPorts.clone().addAll(this.hybridPorts);
    }, getPort: function(portName) {
        var port = null;
        this.getPorts().each(function(i, e) {
            if (e.getName() === portName) {
                port = e;
                return false;
            }
        });
        return port;
    }, getInputPort: function(portNameOrIndex) {
        if (typeof portNameOrIndex === "number") {
            return this.inputPorts.get(portNameOrIndex);
        }
        for (var i = 0; i < this.inputPorts.getSize(); i++) {
            var port = this.inputPorts.get(i);
            if (port.getName() === portNameOrIndex) {
                return port;
            }
        }
        return null;
    }, getOutputPort: function(portNameOrIndex) {
        if (typeof portNameOrIndex === "number") {
            return this.outputPorts.get(portNameOrIndex);
        }
        for (var i = 0; i < this.outputPorts.getSize(); i++) {
            var port = this.outputPorts.get(i);
            if (port.getName() === portNameOrIndex) {
                return port;
            }
        }
        return null;
    }, getHybridPort: function(portNameOrIndex) {
        if (typeof portNameOrIndex === "number") {
            return this.hybridPorts.get(portNameOrIndex);
        }
        for (var i = 0; i < this.hybridPorts.getSize(); i++) {
            var port = this.hybridPorts.get(i);
            if (port.getName() === portNameOrIndex) {
                return port;
            }
        }
        return null;
    }, addPort: function(port, locator) {
        if (!(port instanceof draw2d.Port)) {
            throw"Argument is not typeof 'draw2d.Port'. \nFunction: draw2d.shape.node.Node#addPort";
        }
        this.cachedPorts = null;
        this.portRelayoutRequired = true;
        if (port instanceof draw2d.InputPort) {
            this.inputPorts.add(port);
        } else {
            if (port instanceof draw2d.OutputPort) {
                this.outputPorts.add(port);
            } else {
                if (port instanceof draw2d.HybridPort) {
                    this.hybridPorts.add(port);
                }
            }
        }
        if ((typeof locator !== "undefined") && (locator instanceof draw2d.layout.locator.Locator)) {
            port.setLocator(locator);
        }
        port.setParent(this);
        port.setCanvas(this.canvas);
        port.setDeleteable(false);
        if (this.canvas !== null) {
            port.getShapeElement();
            this.canvas.registerPort(port);
        }
    }, removePort: function(port) {
        this.portRelayoutRequired = true;
        this.inputPorts.remove(port);
        this.outputPorts.remove(port);
        this.hybridPorts.remove(port);
        if (port.getCanvas() !== null) {
            port.getCanvas().unregisterPort(port);
            var connections = port.getConnections();
            for (var i = 0; i < connections.getSize(); ++i) {
                port.getCanvas().removeFigure(connections.get(i));
            }
        }
        port.setCanvas(null);
    }, createPort: function(type, locator) {
        var newPort = null;
        var count = 0;
        switch (type) {
            case"input":
                newPort = new draw2d.InputPort();
                count = this.inputPorts.getSize();
                break;
            case"output":
                newPort = new draw2d.OutputPort();
                count = this.outputPorts.getSize();
                break;
            case"hybrid":
                newPort = new draw2d.HybridPort();
                count = this.hybridPorts.getSize();
                break;
            default:
                throw"Unknown type [" + type + "] of port requested";
        }
        newPort.setName(type + count);
        this.addPort(newPort, locator);
        this.setDimension(this.width, this.height);
        this.layoutPorts();
        return newPort;
    }, getConnections: function() {
        var connections = new draw2d.util.ArrayList();
        var ports = this.getPorts();
        for (var i = 0; i < ports.getSize(); i++) {
            var port = ports.get(i);
            for (var c = 0, c_size = port.getConnections().getSize(); c < c_size; c++) {
                if (!connections.contains(port.getConnections().get(c))) {
                    connections.add(port.getConnections().get(c));
                }
            }
        }
        return connections;
    }, setCanvas: function(canvas) {
        var oldCanvas = this.canvas;
        this._super(canvas);
        var ports = this.getPorts();
        if (oldCanvas !== null) {
            ports.each(function(i, port) {
                oldCanvas.unregisterPort(port);
            });
        }
        if (canvas !== null) {
            ports.each(function(i, port) {
                port.setCanvas(canvas);
                canvas.registerPort(port);
            });
            this.setDimension(this.width, this.height);
        } else {
            ports.each(function(i, port) {
                port.setCanvas(null);
            });
        }
    }, setRotationAngle: function(angle) {
        this.portRelayoutRequired = true;
        this._super(angle);
        this.layoutPorts();
    }, setDimension: function(w, h) {
        this.portRelayoutRequired = true;
        this._super(w, h);
    }, onPortValueChanged: function(relatedPort) {
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        this._super(attributes);
        this.layoutPorts();
    }, layoutPorts: function() {
        if (this.portRelayoutRequired === false) {
            return;
        }
        this.portRelayoutRequired = false;
        this.outputPorts.each(function(i, port) {
            port.locator.relocate(i, port);
        });
        this.inputPorts.each(function(i, port) {
            port.locator.relocate(i, port);
        });
        this.hybridPorts.each(function(i, port) {
            port.locator.relocate(i, port);
        });
    }});
draw2d.VectorFigure = draw2d.shape.node.Node.extend({NAME: "draw2d.VectorFigure", init: function() {
        this.stroke = 1;
        this.bgColor = new draw2d.util.Color(255, 255, 255);
        this.lineColor = new draw2d.util.Color(128, 128, 255);
        this.color = new draw2d.util.Color(128, 128, 128);
        this.strokeBeforeGlow = this.stroke;
        this.glowIsActive = false;
        this._super();
    }, setGlow: function(flag) {
        if (flag === this.glowIsActive) {
            return this;
        }
        this.glowIsActive = flag;
        if (flag === true) {
            this.strokeBeforeGlow = this.getStroke();
            this.setStroke(this.strokeBeforeGlow * 2.5);
        } else {
            this.setStroke(this.strokeBeforeGlow);
        }
        return this;
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        attributes.x = this.getAbsoluteX();
        attributes.y = this.getAbsoluteY();
        if (typeof attributes.stroke === "undefined") {
            if (this.color === null || this.stroke === 0) {
                attributes.stroke = "none";
            } else {
                attributes.stroke = this.color.hash();
            }
        }
        attributes["stroke-width"] = this.stroke;
        if (typeof attributes.fill === "undefined") {
            attributes.fill = this.bgColor.hash();
        }
        this._super(attributes);
    }, setBackgroundColor: function(color) {
        this.bgColor = new draw2d.util.Color(color);
        this.repaint();
        return this;
    }, getBackgroundColor: function() {
        return this.bgColor;
    }, setStroke: function(w) {
        this.stroke = w;
        this.repaint();
        return this;
    }, getStroke: function() {
        return this.stroke;
    }, setColor: function(color) {
        this.color = new draw2d.util.Color(color);
        this.repaint();
        return this;
    }, getColor: function() {
        return this.color;
    }});
draw2d.shape.basic.Rectangle = draw2d.VectorFigure.extend({NAME: "draw2d.shape.basic.Rectangle", init: function(width, height) {
        this.radius = 2;
        this.dasharray = null;
        this._super();
        this.setBackgroundColor(null);
        this.setColor("#1B1B1B");
        if (typeof width === "undefined") {
            this.setDimension(50, 90);
        } else {
            this.setDimension(width, height);
        }
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (this.dasharray !== null) {
            attributes["stroke-dasharray"] = this.dasharray;
        }
        attributes.width = this.getWidth();
        attributes.height = this.getHeight();
        attributes.r = this.radius;
        this._super(attributes);
    }, applyTransformation: function() {
        this.shape.transform("R" + this.rotationAngle);
        if (this.getRotationAngle() === 90 || this.getRotationAngle() === 270) {
            var ratio = this.getHeight() / this.getWidth();
            var rs = "...S" + ratio + "," + 1 / ratio + "," + (this.getAbsoluteX() + this.getWidth() / 2) + "," + (this.getAbsoluteY() + this.getHeight() / 2);
            this.shape.transform(rs);
        }
    }, createShapeElement: function() {
        return this.canvas.paper.rect(this.getAbsoluteX(), this.getAbsoluteY(), this.getWidth(), this.getHeight());
    }, setRadius: function(radius) {
        this.radius = radius;
        this.repaint();
    }, getRadius: function() {
        return this.radius;
    }, setDashArray: function(dash) {
        this.dasharray = dash;
    }, getPersistentAttributes: function() {
        var memento = this._super();
        memento.radius = this.radius;
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);
        if (typeof memento.radius === "number") {
            this.radius = memento.radius;
        }
    }});
draw2d.SetFigure = draw2d.shape.basic.Rectangle.extend({NAME: "draw2d.SetFigure", init: function(width, height) {
        this.svgNodes = null;
        this.originalWidth = null;
        this.originalHeight = null;
        this.scaleX = 1;
        this.scaleY = 1;
        this._super(width, height);
        this.setStroke(0);
        this.setBackgroundColor(null);
    }, setCanvas: function(canvas) {
        if (canvas === null && this.svgNodes !== null) {
            this.svgNodes.remove();
            this.svgNodes = null;
        }
        this._super(canvas);
    }, setCssClass: function(cssClass) {
        this._super(cssClass);
        if (this.svgNodes === null) {
            return this;
        }
        if (this.cssClass === null) {
            this.svgNodes.forEach(function(e) {
                e.node.removeAttribute("class");
            });
        } else {
            this.svgNodes.forEach(function(e) {
                e.node.setAttribute("class", cssClass);
            });
        }
        return this;
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (this.originalWidth !== null) {
            this.scaleX = this.width / this.originalWidth;
            this.scaleY = this.height / this.originalHeight;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (this.visible === true) {
            this.svgNodes.show();
        } else {
            this.svgNodes.hide();
        }
        this._super(attributes);
    }, applyTransformation: function() {
        var s = "S" + this.scaleX + "," + this.scaleY + ",0,0 " + "R" + this.rotationAngle + "," + ((this.getWidth() / 2) | 0) + "," + ((this.getHeight() / 2) | 0) + "T" + this.getAbsoluteX() + "," + this.getAbsoluteY() + "";
        this.svgNodes.transform(s);
        if (this.rotationAngle === 90 || this.rotationAngle === 270) {
            var before = this.svgNodes.getBBox(true);
            var ratio = before.height / before.width;
            var reverseRatio = before.width / before.height;
            var rs = "...S" + ratio + "," + reverseRatio + "," + (this.getAbsoluteX() + this.getWidth() / 2) + "," + (this.getAbsoluteY() + this.getHeight() / 2);
            this.svgNodes.transform(rs);
        }
    }, createShapeElement: function() {
        var shape = this.canvas.paper.rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
        this.svgNodes = this.createSet();
        if (typeof this.svgNodes.forEach === "undefined") {
            var set = this.canvas.paper.set();
            set.push(this.svgNodes);
            this.svgNodes = set;
        }
        this.setCssClass(this.cssClass);
        var bb = this.svgNodes.getBBox();
        this.originalWidth = bb.width;
        this.originalHeight = bb.height;
        return shape;
    }, createSet: function() {
        return this.canvas.paper.set();
    }});
draw2d.SVGFigure = draw2d.SetFigure.extend({NAME: "draw2d.SVGFigure", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.importSVG(this.canvas, this.getSVG());
    }, importSVG: function(canvas, rawSVG) {
        var set = canvas.paper.set();
        try {
            if (typeof rawSVG === "undefined") {
                throw"No data was provided.";
            }
            var svgDOM = jQuery(rawSVG);
            if (svgDOM.attr("width") && svgDOM.attr("height")) {
                this.setDimension(svgDOM.attr("width"), svgDOM.attr("height"));
            }
            var findStyle = new RegExp("([a-z0-9-]+) ?: ?([^ ;]+)[ ;]?", "gi");
            svgDOM.children().each(function(i, element) {
                var shape = null;
                var style = null;
                var attr = {};
                var node = element.tagName;
                var index = node.indexOf(":");
                if (index != -1) {
                    node = node.substr(index + 1);
                }
                jQuery(element.attributes).each(function() {
                    switch (this.nodeName) {
                        case"stroke-dasharray":
                            attr[this.nodeName] = "- ";
                            break;
                        case"style":
                            style = this.nodeValue;
                            break;
                        case"id":
                        case"xml:space":
                            break;
                        default:
                            attr[this.nodeName] = this.nodeValue;
                            break;
                    }
                });
                if (style !== null) {
                    while (findStyle.exec(style)) {
                        attr[RegExp.$1] = RegExp.$2;
                    }
                }
                if (typeof attr["stroke-width"] === "undefined") {
                    attr["stroke-width"] = (typeof attr.stroke === "undefined" ? 0 : 1.2);
                }
                switch (node) {
                    case"rect":
                        shape = canvas.paper.rect();
                        break;
                    case"circle":
                        shape = canvas.paper.circle();
                        break;
                    case"ellipse":
                        shape = canvas.paper.ellipse();
                        break;
                    case"path":
                        attr.fill = "none";
                        shape = canvas.paper.path(attr.d);
                        break;
                    case"line":
                        attr.d = "M " + attr.x1 + " " + attr.y1 + "L" + attr.x2 + " " + attr.y2;
                        attr.fill = "none";
                        shape = canvas.paper.path(attr.d);
                        break;
                    case"polyline":
                        var path = attr.points;
                        attr.d = "M " + path.replace(" ", " L");
                        shape = canvas.paper.path(attr.d);
                        break;
                    case"polygon":
                        shape = canvas.paper.polygon(attr.points);
                        break;
                    case"image":
                        shape = canvas.paper.image();
                        break;
                    case"tspan":
                    case"text":
                        if (element.childNodes.length > 0) {
                            var child = element.firstChild;
                            do {
                                switch (child.nodeType) {
                                    case 2:
                                    case 3:
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
                                    case 1:
                                }
                                var subShape = canvas.paper.text(0, 0, jQuery(child).text());
                                var subAttr = {"x": parseFloat(child.attributes.x.value), "y": parseFloat(child.attributes.y.value)};
                                subAttr["text-anchor"] = "start";
                                if (typeof child.attributes["font-size"] !== "undefined") {
                                    subAttr["font-size"] = parseInt(child.attributes["font-size"].value);
                                } else {
                                    if (typeof attr["font-size"] !== "undefined") {
                                        subAttr["font-size"] = parseInt(attr["font-size"]);
                                    }
                                }
                                if (typeof child.attributes["font-family"] !== "undefined") {
                                    subAttr["font-family"] = child.attributes["family-family"].value;
                                } else {
                                    if (typeof attr["font-family"] !== "undefined") {
                                        subAttr["font-family"] = attr["font-family"];
                                    }
                                }
                                subAttr["fill"] = "#000000";
                                if (typeof child.attributes["fill"] !== "undefined") {
                                    subAttr["fill"] = child.attributes["fill"].value;
                                } else {
                                    if (typeof attr["fill"] !== "undefined") {
                                        subAttr["fill"] = attr["fill"];
                                    }
                                }
                                subAttr.y = subAttr.y + subShape.getBBox().height / 2;
                                subShape.attr(subAttr);
                                set.push(subShape);
                            } while (child = child.nextSibling);
                        } else {
                            shape = canvas.paper.text(0, 0, jQuery(element).html());
                            if (typeof attr["fill"] === "undefined") {
                                attr["fill"] = "#000000";
                            }
                            if (typeof attr["text-anchor"] === "undefined") {
                                attr["text-anchor"] = "start";
                            }
                            if (typeof attr["font-size"] !== "undefined") {
                                attr["font-size"] = parseInt(attr["font-size"]);
                            }
                            if (typeof attr["font-family"] !== "undefined") {
                                attr["font-family"] = parseInt(attr["font-family"]);
                            }
                            attr.y = parseFloat(attr.y) + shape.getBBox().height / 2;
                        }
                        break;
                }
                if (shape !== null) {
                    shape.attr(attr);
                    set.push(shape);
                }
            });
        } catch (error) {
            alert("The SVG data you entered was invalid! (" + error + ")");
        }
        return set;
    }});
draw2d.shape.node.Hub = draw2d.shape.basic.Rectangle.extend({NAME: "draw2d.shape.node.Hub", DEFAULT_COLOR: new draw2d.util.Color("#4DF0FE"), BACKGROUND_COLOR: new draw2d.util.Color("#29AA77"), init: function(width, height, label) {
        this.label = null;
        this._super(width, height);
        this.port = this.createPort("hybrid", new draw2d.layout.locator.CenterLocator(this));
        this.CONNECTION_DIR_STRATEGY = [jQuery.proxy(function(conn, relatedPort) {
                return this.getParent().getBoundingBox().getDirection(relatedPort.getAbsolutePosition());
            }, this.port), jQuery.proxy(function(conn, relatedPort) {
                return this.getAbsoluteY() > relatedPort.getAbsoluteY() ? 0 : 2;
            }, this.port), jQuery.proxy(function(conn, relatedPort) {
                return this.getAbsoluteX() > relatedPort.getAbsoluteX() ? 3 : 1;
            }, this.port)];
        this.port.setGlow = jQuery.proxy(this.setGlow, this);
        this.port._orig_hitTest = this.port.hitTest;
        this.port.hitTest = jQuery.proxy(this.hitTest, this);
        this.port.setConnectionAnchor(new draw2d.layout.anchor.ShortesPathConnectionAnchor(this.port));
        this.port.setVisible(false);
        if (typeof height === "undefined") {
            this.setDimension(150, 50);
        }
        this.setConnectionDirStrategy(0);
        this.setColor(this.DEFAULT_COLOR.darker());
        this.setBackgroundColor(this.BACKGROUND_COLOR);
        if (typeof label !== "undefined") {
            this.label = new draw2d.shape.basic.Label(label);
            this.label.setColor("#0d0d0d");
            this.label.setFontColor("#0d0d0d");
            this.label.setStroke(0);
            this.addFigure(this.label, new draw2d.layout.locator.CenterLocator(this));
        }
    }, onDragEnter: function(draggedFigure) {
        return this.getHybridPort(0).onDragEnter(draggedFigure);
    }, getMinWidth: function() {
        if (this.label !== null) {
            return Math.max(this.label.getMinWidth(), this._super());
        } else {
            return this._super();
        }
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (typeof attributes.fill === "undefined") {
            if (this.bgColor !== null) {
                attributes.fill = "90-" + this.bgColor.hash() + ":5-" + this.bgColor.lighter(0.3).hash() + ":95";
            } else {
                attributes.fill = "none";
            }
        }
        this._super(attributes);
    }, setConnectionDirStrategy: function(strategy) {
        switch (strategy) {
            case 0:
            case 1:
            case 2:
                this.port.getConnectionDirection = this.CONNECTION_DIR_STRATEGY[strategy];
                break;
        }
    }, getPersistentAttributes: function() {
        var memento = this._super();
        memento.dirStrategy = this.CONNECTION_DIR_STRATEGY.indexOf(this.port.getConnectionDirection);
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);
        if (typeof memento.dirStrategy === "number") {
            this.setConnectionDirStrategy(memento.dirStrategy);
        }
    }});
draw2d.shape.node.HorizontalBus = draw2d.shape.node.Hub.extend({NAME: "draw2d.shape.node.HorizontalBus", init: function(width, height, label) {
        this._super(width, height, label);
        this.setConnectionDirStrategy(1);
        this.installEditPolicy(new draw2d.policy.figure.HBusSelectionFeedbackPolicy());
    }});
draw2d.shape.node.VerticalBus = draw2d.shape.node.Hub.extend({NAME: "draw2d.shape.node.VerticalBus", init: function(width, height, label) {
        this._super(width, height, label);
        if (this.label !== null) {
            this.label.setRotationAngle(90);
        }
        this.setConnectionDirStrategy(2);
        this.installEditPolicy(new draw2d.policy.figure.VBusSelectionFeedbackPolicy());
    }, getMinHeight: function() {
        if (this.shape === null && this.label === null) {
            return 0;
        }
        return this.label.getMinWidth();
    }, getMinWidth: function() {
        if (this.shape === null && this.label === null) {
            return 0;
        }
        return this.label.getMinHeight();
    }});
draw2d.shape.node.Fulcrum = draw2d.shape.node.Hub.extend({NAME: "draw2d.shape.node.Fulcrum", init: function() {
        this._super(40, 40);
        this.port.setConnectionAnchor(new draw2d.layout.anchor.ConnectionAnchor(this.port));
        this.port.setVisible(true);
        this.port.hitTest = this.port._orig_hitTest;
        this.setConnectionDirStrategy(0);
        this.setColor(null);
        this.setRadius(10);
        this.setBackgroundColor(null);
        this.setStroke(0);
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (typeof attributes.fill === "undefined") {
            attributes.fill = this.bgColor.hash();
        }
        this._super(attributes);
    }});
draw2d.shape.basic.Oval = draw2d.VectorFigure.extend({NAME: "draw2d.shape.basic.Oval", init: function(width, height) {
        this._super();
        this.setBackgroundColor(null);
        this.setColor("#1B1B1B");
        if ((typeof height === "number") && (typeof width === "number")) {
            this.setDimension(width, height);
        } else {
            this.setDimension(50, 50);
        }
    }, createShapeElement: function() {
        var halfW = this.getWidth() / 2;
        var halfH = this.getHeight() / 2;
        return this.canvas.paper.ellipse(this.getAbsoluteX() + halfW, this.getAbsoluteY() + halfH, halfW, halfH);
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (typeof attributes.rx === "undefined") {
            attributes.rx = this.width / 2;
            attributes.ry = this.height / 2;
        }
        if (typeof attributes.cx === "undefined") {
            attributes.cx = this.getAbsoluteX() + attributes.rx;
            attributes.cy = this.getAbsoluteY() + attributes.ry;
        }
        this._super(attributes);
    }, intersectionWithLine: function(a1, a2) {
        var rx = this.getWidth() / 2;
        var ry = this.getHeight() / 2;
        var result = new draw2d.util.ArrayList();
        var origin = new draw2d.geo.Point(a1.x, a1.y);
        var dir = a2.subtract(a1);
        var center = new draw2d.geo.Point(this.getAbsoluteX() + rx, this.getAbsoluteY() + ry);
        var diff = origin.subtract(center);
        var mDir = new draw2d.geo.Point(dir.x / (rx * rx), dir.y / (ry * ry));
        var mDiff = new draw2d.geo.Point(diff.x / (rx * rx), diff.y / (ry * ry));
        var a = dir.dot(mDir);
        var b = dir.dot(mDiff);
        var c = diff.dot(mDiff) - 1;
        var d = b * b - a * c;
        if (d < 0) {
        } else {
            if (d > 0) {
                var root = Math.sqrt(d);
                var t_a = (-b - root) / a;
                var t_b = (-b + root) / a;
                if ((t_a < 0 || 1 < t_a) && (t_b < 0 || 1 < t_b)) {
                    if ((t_a < 0 && t_b < 0) || (t_a > 1 && t_b > 1)) {
                    } else {
                    }
                } else {
                    if (0 <= t_a && t_a <= 1) {
                        result.add(a1.lerp(a2, t_a));
                    }
                    if (0 <= t_b && t_b <= 1) {
                        result.add(a1.lerp(a2, t_b));
                    }
                }
            } else {
                var t = -b / a;
                if (0 <= t && t <= 1) {
                    result.add(a1.lerp(a2, t));
                } else {
                }
            }
        }
        return result;
    }});
draw2d.shape.basic.Circle = draw2d.shape.basic.Oval.extend({NAME: "draw2d.shape.basic.Circle", init: function(radius) {
        this._super();
        if (typeof radius === "number") {
            this.setDimension(radius, radius);
        } else {
            this.setDimension(40, 40);
        }
    }, setDimension: function(w, h) {
        if (w > h) {
            this._super(w, w);
        } else {
            this._super(h, h);
        }
    }, isStrechable: function() {
        return false;
    }});
draw2d.shape.basic.Label = draw2d.SetFigure.extend({NAME: "draw2d.shape.basic.Label", FONT_FALLBACK: {"Georgia": "Georgia, serif", "Palatino Linotype": '"Palatino Linotype", "Book Antiqua", Palatino, serif', "Times New Roman": '"Times New Roman", Times, serif', "Arial": "Arial, Helvetica, sans-serif", "Arial Black": '"Arial Black", Gadget, sans-serif', "Comic Sans MS": '"Comic Sans MS", cursive, sans-serif', "Impact": "Impact, Charcoal, sans-serif", "Lucida Sans Unicode": '"Lucida Sans Unicode", "Lucida Grande", sans-serif', "Tahoma, Geneva": "Tahoma, Geneva, sans-seri", "Trebuchet MS": '"Trebuchet MS", Helvetica, sans-serif', "Verdana": "Verdana, Geneva, sans-serif", "Courier New": '"Courier New", Courier, monospace', "Lucida Console": '"Lucida Console", Monaco, monospace'}, init: function(text) {
        this._super();
        if (typeof text === "string") {
            this.text = text;
        } else {
            this.text = "";
        }
        this.cachedWidth = null;
        this.cachedHeight = null;
        this.cachedMinWidth = null;
        this.cachedMinHeight = null;
        this.fontSize = 14;
        this.fontColor = new draw2d.util.Color("#000");
        this.fontFamily = null;
        this.padding = 4;
        this.bold = false;
        this.setStroke(0);
        this.setDimension(10, 10);
        this.editor = null;
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());
    }, createSet: function() {
        return this.canvas.paper.text(0, 0, this.text);
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        this.cachedWidth = null;
        this.cachedHeight = null;
        this.cachedMinWidth = null;
        this.cachedMinHeight = null;
        var lattr = {};
        lattr.text = this.text;
        lattr.x = this.padding;
        lattr.y = this.getHeight() / 2;
        lattr["font-weight"] = (this.bold === true) ? "bold" : "normal";
        lattr["text-anchor"] = "start";
        lattr["font-size"] = this.fontSize;
        if (this.fontFamily !== null) {
            lattr["font-family"] = this.fontFamily;
        }
        lattr.fill = this.fontColor.hash();
        this.svgNodes.attr(lattr);
        this._super(attributes);
    }, applyTransformation: function() {
        this.shape.transform("R" + this.rotationAngle);
        this.svgNodes.transform("R" + this.rotationAngle + "T" + this.getAbsoluteX() + "," + this.getAbsoluteY());
    }, isResizeable: function() {
        return false;
    }, setFontSize: function(size) {
        this.cachedMinWidth = null;
        this.cachedMinHeight = null;
        this.fontSize = size;
        this.repaint();
    }, setBold: function(bold) {
        this.cachedMinWidth = null;
        this.cachedMinHeight = null;
        this.bold = bold;
        this.repaint();
    }, setFontColor: function(color) {
        this.fontColor = new draw2d.util.Color(color);
        this.repaint();
    }, getFontColor: function() {
        return this.fontColor;
    }, setPadding: function(padding) {
        this.cachedMinWidth = null;
        this.cachedMinHeight = null;
        this.cachedWidth = null;
        this.cachedHeight = null;
        this.padding = padding;
        this.repaint();
    }, setFontFamily: function(font) {
        this.cachedMinWidth = null;
        this.cachedMinHeight = null;
        this.cachedWidth = null;
        this.cachedHeight = null;
        if ((typeof font !== "undefined") && font !== null && typeof this.FONT_FALLBACK[font] !== "undefined") {
            font = this.FONT_FALLBACK[font];
        }
        this.fontFamily = font;
        this.repaint();
    }, setDimension: function(w, h) {
        this.cachedWidth = null;
        this.cachedHeight = null;
        this._super(w, h);
    }, getMinWidth: function() {
        if (this.shape === null) {
            return 0;
        }
        if (this.cachedMinWidth === null) {
            this.cachedMinWidth = this.svgNodes.getBBox(true).width + 2 * this.padding + 2 * this.getStroke();
        }
        return this.cachedMinWidth;
    }, getMinHeight: function() {
        if (this.shape === null) {
            return 0;
        }
        if (this.cachedMinHeight === null) {
            this.cachedMinHeight = this.svgNodes.getBBox(true).height + 2 * this.padding + 2 * this.getStroke();
        }
        return this.cachedMinHeight;
    }, getWidth: function() {
        if (this.shape === null) {
            return 0;
        }
        if (this.cachedWidth === null) {
            this.cachedWidth = Math.max(this.width, this.getMinWidth());
        }
        return this.cachedWidth;
    }, getHeight: function() {
        if (this.shape === null) {
            return 0;
        }
        if (this.cachedHeight === null) {
            this.cachedHeight = Math.max(this.height, this.getMinHeight());
        }
        return this.cachedHeight;
    }, installEditor: function(editor) {
        this.editor = editor;
    }, onDoubleClick: function() {
        if (this.editor !== null) {
            this.editor.start(this);
        }
    }, getText: function() {
        return this.text;
    }, setText: function(text) {
        this.cachedWidth = null;
        this.cachedHeight = null;
        this.cachedMinWidth = null;
        this.cachedMinHeight = null;
        this.text = text;
        this.repaint();
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(this.canvas, this);
            }
        }, this));
        this.fireResizeEvent();
        if (this.parent !== null) {
            this.parent.repaint();
        }
    }, hitTest: function(x, y) {
        if (this.rotationAngle === 0) {
            return this._super(x, y);
        }
        var matrix = this.shape.matrix;
        var points = this.getBoundingBox().getPoints();
        points.each(function(i, point) {
            var x = matrix.x(point.x, point.y);
            var y = matrix.y(point.x, point.y);
            point.x = x;
            point.y = y;
        });
        var polySides = 4;
        var i = 0;
        var j = polySides - 1;
        var oddNodes = false;
        for (i = 0; i < polySides; i++) {
            var pi = points.get(i);
            var pj = points.get(j);
            if ((pi.y < y && pj.y >= y || pj.y < y && pi.y >= y) && (pi.x <= x || pj.x <= x)) {
                if (pi.x + (y - pi.y) / (pj.y - pi.y) * (pj.x - pi.x) < x) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    }, getPersistentAttributes: function() {
        var memento = this._super();
        memento.text = this.text;
        memento.fontSize = this.fontSize;
        memento.fontColor = this.fontColor.hash();
        memento.fontFamily = this.fontFamily;
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);

        if (typeof memento.fontFamily !== "undefined") {
            this.setFontFamily(memento.fontFamily);
        }
        if (typeof memento.fontSize !== "undefined") {
            this.setFontSize(memento.fontSize);
        }
        if (typeof memento.fontColor !== "undefined") {
            this.setFontColor(memento.fontColor);
        }
        if (typeof memento.text !== "undefined") {
            this.setText(memento.text);
        }
        this.repaint();
    }});
draw2d.shape.basic.Line = draw2d.Figure.extend({NAME: "draw2d.shape.basic.Line", DEFAULT_COLOR: new draw2d.util.Color(0, 0, 0),
    init: function(startX, startY, endX, endY) {
        this.repaintBlocked = false;
        this.corona = 10;
        this.isGlowing = false;
        this.lineColor = this.DEFAULT_COLOR;
        this.stroke = 1;
        this.dasharray = null;
        if (typeof endY === "number") {
            this.start = new draw2d.geo.Point(startX, startY);
            this.end = new draw2d.geo.Point(endX, endY);
        } else {
            this.start = new draw2d.geo.Point(30, 30);
            this.end = new draw2d.geo.Point(100, 100);
        }
        this.basePoints = new draw2d.util.ArrayList();
        this.basePoints.add(this.start);
        this.basePoints.add(this.end);
        this._super();
        this.installEditPolicy(new draw2d.policy.line.LineSelectionFeedbackPolicy());
        this.setSelectable(true);
        this.setDeleteable(true);
    }, onDrag: function(dx, dy, dx2, dy2) {
        if (this.command === null) {
            return;
        }
        this.command.setTranslation(dx, dy);
        this.getPoints().each(function(i, e) {
            e.translate(dx2, dy2);
        });
        this._super(dx, dy, dx2, dy2);
        this.svgPathString = null;
        this.repaint();
    }, onDragEnd: function() {
        this.setAlpha(this.originalAlpha);
        this.isInDragDrop = false;
        if (this.command === null) {
            return;
        }
        this.getPoints().each(jQuery.proxy(function(i, e) {
            e.translate(-this.command.dx, -this.command.dy);
        }, this));
        this.canvas.getCommandStack().execute(this.command);
        this.command = null;
        this.isMoving = false;
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.onDragEnd(this.canvas, this);
            }
        }, this));
        this.fireMoveEvent();
    }, setDashArray: function(dash) {
        this.dasharray = dash;
        return this;
    }, setCoronaWidth: function(width) {
        this.corona = width;
        return this;
    }, createShapeElement: function() {
        return this.canvas.paper.path("M" + this.start.x + " " + this.start.y + "L" + this.end.x + " " + this.end.y);
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {"stroke": "#" + this.lineColor.hex(), "stroke-width": this.stroke, "path": ["M", this.start.x, this.start.y, "L", this.end.x, this.end.y].join(" ")};
        } else {
            if (typeof attributes.path === "undefined") {
                attributes.path = ["M", this.start.x, this.start.y, "L", this.end.x, this.end.y].join(" ");
            }
            attributes.stroke = this.lineColor.hash();
            attributes["stroke-width"] = this.stroke;
        }
        if (this.dasharray !== null) {
            attributes["stroke-dasharray"] = this.dasharray;
        }
        this._super(attributes);
        // EDIT nembery 1-24-14 get setGlow working again working again
    }, setGlow: function(flag) {
        if (this.isGlowing === flag) {
            return;
        }
        if (flag === true) {
            //this._lineColor = this.lineColor;
            this._stroke = this.stroke;
            //this.setColor(draw2d.util.Color("#3f72bf"));
            this.setStroke((this.stroke * 2) | 0);
            // console.log("stroke is now " + this.stroke);
        } else {
            //this.setColor(this._lineColor);
            this.setStroke(this._stroke);
        }
        this.isGlowing = flag;
        return this;
    }, isResizeable: function() {
        return true;
    }, setStroke: function(w) {
        this.stroke = w;
        this.repaint();
        return this;
    }, setColor: function(color) {
        this.lineColor = new draw2d.util.Color(color);
        this.repaint();
        return this;
    }, getColor: function() {
        return this.lineColor;
    }, setStartPoint: function(x, y) {
        if (this.start.x === x && this.start.y === y) {
            return;
        }
        this.start.setPosition(x, y);
        this.repaint();
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(this.canvas, this);
            }
        }, this));
        return this;
    }, setEndPoint: function(x, y) {
        if (this.end.x === x && this.end.y === y) {
            return;
        }
        this.end.setPosition(x, y);
        this.repaint();
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(this.canvas, this);
            }
        }, this));
        return this;
    }, getStartX: function() {
        return this.start.x;
    }, getStartY: function() {
        return this.start.y;
    }, getStartPoint: function() {
        return this.start.clone();
    }, getEndX: function() {
        return this.end.x;
    }, getEndY: function() {
        return this.end.y;
    }, getEndPoint: function() {
        return this.end.clone();
    }, getPoints: function() {
        return this.basePoints;
    }, getSegments: function() {
        var result = new draw2d.util.ArrayList();
        result.add({start: this.getStartPoint(), end: this.getEndPoint()});
        return result;
    }, getLength: function() {
        if (this.shape !== null) {
            return this.shape.getTotalLength();
        }
        return Math.sqrt((this.start.x - this.end.x) * (this.start.x - this.end.x) + (this.start.y - this.end.y) * (this.start.y - this.end.y));
    }, getAngle: function() {
        var length = this.getLength();
        var angle = -(180 / Math.PI) * Math.asin((this.start.y - this.end.y) / length);
        if (angle < 0) {
            if (this.end.x < this.start.x) {
                angle = Math.abs(angle) + 180;
            } else {
                angle = 360 - Math.abs(angle);
            }
        } else {
            if (this.end.x < this.start.x) {
                angle = 180 - angle;
            }
        }
        return angle;
    }, createCommand: function(request) {
        if (request.getPolicy() === draw2d.command.CommandType.MOVE) {
            if (this.isDraggable()) {
                return new draw2d.command.CommandMoveLine(this);
            }
        }
        if (request.getPolicy() === draw2d.command.CommandType.DELETE) {
            if (this.isDeleteable() === false) {
                return null;
            }
            return new draw2d.command.CommandDelete(this);
        }
        return null;
    }, hitTest: function(px, py) {
        return draw2d.shape.basic.Line.hit(this.corona, this.start.x, this.start.y, this.end.x, this.end.y, px, py);
    }, intersection: function(other) {
        var result = new draw2d.util.ArrayList();
        if (other === this) {
            return result;
        }
        var segments1 = this.getSegments();
        var segments2 = other.getSegments();
        segments1.each(function(i, s1) {
            segments2.each(function(j, s2) {
                var p = draw2d.shape.basic.Line.intersection(s1.start, s1.end, s2.start, s2.end);
                if (p !== null) {
                    result.add(p);
                }
            });
        });
        return result;
    }, getPersistentAttributes: function() {
        var memento = this._super();
        delete memento.x;
        delete memento.y;
        delete memento.width;
        delete memento.height;
        memento.stroke = this.stroke;
        memento.color = this.getColor().hash();
        if (this.editPolicy.getSize() > 0) {
            memento.policy = this.editPolicy.getFirstElement().NAME;
        }
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);
        if (typeof memento.stroke !== "undefined") {
            this.setStroke(parseInt(memento.stroke));
        }
        if (typeof memento.color !== "undefined") {
            this.setColor(memento.color);
        }
        if (typeof memento.policy !== "undefined") {
            this.installEditPolicy(eval("new " + memento.policy + "()"));
        }
    }});
draw2d.shape.basic.Line.intersection = function(a1, a2, b1, b2) {
    var result = null;
    var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    var u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
    if (u_b != 0) {
        var ua = ua_t / u_b;
        var ub = ub_t / u_b;
        if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
            result = new draw2d.geo.Point((a1.x + ua * (a2.x - a1.x)) | 0, (a1.y + ua * (a2.y - a1.y)) | 0);
            result.justTouching = (0 == ua || ua == 1 || 0 == ub || ub == 1);
        }
    }
    return result;
};
draw2d.shape.basic.Line.hit = function(coronaWidth, X1, Y1, X2, Y2, px, py) {
    X2 -= X1;
    Y2 -= Y1;
    px -= X1;
    py -= Y1;
    var dotprod = px * X2 + py * Y2;
    var projlenSq;
    if (dotprod <= 0) {
        projlenSq = 0;
    } else {
        px = X2 - px;
        py = Y2 - py;
        dotprod = px * X2 + py * Y2;
        if (dotprod <= 0) {
            projlenSq = 0;
        } else {
            projlenSq = dotprod * dotprod / (X2 * X2 + Y2 * Y2);
        }
    }
    var lenSq = px * px + py * py - projlenSq;
    if (lenSq < 0) {
        lenSq = 0;
    }
    return Math.sqrt(lenSq) < coronaWidth;
};
draw2d.shape.basic.PolyLine = draw2d.shape.basic.Line.extend({NAME: "draw2d.shape.basic.PolyLine", init: function(router) {
        this.svgPathString = null;
        this.oldPoint = null;
        this.router = router || draw2d.shape.basic.PolyLine.DEFAULT_ROUTER;
        this.routingRequired = true;
        this.lineSegments = new draw2d.util.ArrayList();
        this._super();
    }, setStartPoint: function(x, y) {
        this.repaintBlocked = true;
        this._super(x, y);
        this.calculatePath();
        this.repaintBlocked = false;
        this.repaint();
    }, setEndPoint: function(x, y) {
        this.repaintBlocked = true;
        this._super(x, y);
        this.calculatePath();
        this.repaintBlocked = false;
        this.repaint();
    }, setJunctionPoint: function(index, x, y) {
        var junctionPoint = this.basePoints.get(index);
        if (junctionPoint === null || (junctionPoint.x === x && junctionPoint.y === y)) {
            return;
        }
        junctionPoint.x = x;
        junctionPoint.y = y;
        this.svgPathString = null;
        this.repaint();
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.moved(this.canvas, this);
            }
        }, this));
        return this;
    }, insertJunctionPointAt: function(index, x, y) {
        var junctionPoint = new draw2d.geo.Point(x, y);
        this.basePoints.insertElementAt(junctionPoint, index);
        this.svgPathString = null;
        this.repaint();
        if (!this.selectionHandles.isEmpty()) {
            this.editPolicy.each(jQuery.proxy(function(i, e) {
                if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
                    e.onUnselect(this.canvas, this);
                    e.onSelect(this.canvas, this);
                }
            }, this));
        }
        return this;
    }, removeJunctionPointAt: function(index) {
        var removedPoint = this.basePoints.removeElementAt(index);
        this.svgPathString = null;
        this.repaint();
        if (!this.selectionHandles.isEmpty()) {
            this.editPolicy.each(jQuery.proxy(function(i, e) {
                if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
                    e.onUnselect(this.canvas, this);
                    e.onSelect(this.canvas, this);
                }
            }, this));
        }
        return removedPoint;
    }, setRouter: function(router) {
        if (this.router !== null) {
            this.router.onUninstall(this);
        }
        if (typeof router === "undefined" || router === null) {
            this.router = new draw2d.layout.connection.NullRouter();
        } else {
            this.router = router;
        }
        this.router.onInstall(this);
        this.routingRequired = true;
        this.repaint();
    }, getRouter: function() {
        return this.router;
    }, calculatePath: function() {
        if (this.shape === null) {
            return;
        }
        this.svgPathString = null;
        var oldBasePoints = this.basePoints;
        this.oldPoint = null;
        this.lineSegments = new draw2d.util.ArrayList();
        this.basePoints = new draw2d.util.ArrayList();
        this.router.route(this, oldBasePoints);
        this.routingRequired = false;
    }, repaint: function() {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (this.svgPathString === null || this.routingRequired === true) {
            this.calculatePath();
        }
        this._super({path: this.svgPathString, "stroke-linejoin": "round"});
    }, onDragEnter: function(draggedFigure) {
        this.setGlow(true);
        return this;
    }, onDragLeave: function(draggedFigure) {
        this.setGlow(false);
    }, getSegments: function() {
        return this.lineSegments;
    }, addPoint: function(p, y) {
        if (typeof y !== "undefined") {
            p = new draw2d.geo.Point(p, y);
        }
        this.basePoints.add(p);
        if (this.oldPoint !== null) {
            this.lineSegments.add({start: this.oldPoint, end: p});
        }
        this.svgPathString = null;
        this.oldPoint = p;
    }, onOtherFigureIsMoving: function(figure) {
        this.repaintBlocked = true;
        this._super(figure);
        this.calculatePath();
        this.repaintBlocked = false;
        this.repaint();
    }, hitTest: function(px, py) {
        for (var i = 0; i < this.lineSegments.getSize(); i++) {
            var line = this.lineSegments.get(i);
            if (draw2d.shape.basic.Line.hit(this.corona, line.start.x, line.start.y, line.end.x, line.end.y, px, py)) {
                return true;
            }
        }
        return false;
    }, createCommand: function(request) {
        if (request.getPolicy() === draw2d.command.CommandType.DELETE) {
            if (this.isDeleteable() === true) {
                return new draw2d.command.CommandDelete(this);
            }
        } else {
            if (request.getPolicy() === draw2d.command.CommandType.MOVE_JUNCTION) {
                if (this.isResizeable() === true) {
                    return new draw2d.command.CommandMoveJunction(this);
                }
            }
        }
        return this._super(request);
    }, getPersistentAttributes: function() {
        var memento = this._super();
        memento.router = this.router.NAME;
        memento = this.router.getPersistentAttributes(this, memento);
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);
        if (typeof memento.router !== "undefined") {
            this.setRouter(eval("new " + memento.router + "()"));
        }
        this.router.setPersistentAttributes(this, memento);
    }});
//draw2d.shape.basic.PolyLine.DEFAULT_ROUTER = new draw2d.layout.connection.ManhattanConnectionRouter();
//draw2d.shape.basic.PolyLine.DEFAULT_ROUTER = new draw2d.layout.connection.DirectRouter();
draw2d.shape.basic.PolyLine.DEFAULT_ROUTER = new draw2d.layout.connection.FanConnectionRouter();
//draw2d.shape.basic.PolyLine.DEFAULT_ROUTER = new draw2d.layout.connection.SplineConnectionRouter();
draw2d.shape.basic.Diamond = draw2d.VectorFigure.extend({NAME: "draw2d.shape.basic.Diamond", init: function(width, height) {
        this._super();
        this.setBackgroundColor("#00a3f6");
        this.setColor("#1B1B1B");
        if (typeof width === "undefined") {
            this.setDimension(50, 90);
        } else {
            this.setDimension(width, height);
        }
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        var box = this.getBoundingBox();
        var path = ["M", box.x + (box.w / 2), " ", box.y];
        path.push("L", box.x + box.w, " ", box.y + box.h / 2);
        path.push("L", box.x + box.w / 2, " ", box.y + box.h);
        path.push("L", box.x, " ", box.y + box.h / 2);
        path.push("L", box.x + box.w / 2, " ", box.y);
        attributes.path = path.join("");
        this._super(attributes);
    }, createShapeElement: function() {
        return this.canvas.paper.path("M0 0L1 1");
    }});
draw2d.shape.basic.Image = draw2d.shape.node.Node.extend({NAME: "draw2d.shape.basic.Image", init: function(path, width, height) {
        this.path = path;
        this._super(width, height);
    }, setPath: function(path) {
        this.path = path;
        this.repaint();
        return this;
    }, getPath: function() {
        return this.path;
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        attributes.x = this.getAbsoluteX();
        attributes.y = this.getAbsoluteY();
        attributes.width = this.getWidth();
        attributes.height = this.getHeight();
        attributes.src = this.path;
        this._super(attributes);
    }, createShapeElement: function() {
        return this.canvas.paper.image(this.path, this.getX(), this.getY(), this.getWidth(), this.getHeight());
    }, getPersistentAttributes: function() {
        var memento = this._super();
        memento.path = this.path;
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);
        if (typeof memento.path !== "undefined") {
            this.setPath(memento.path);
        }
    }});
draw2d.Connection = draw2d.shape.basic.PolyLine.extend({NAME: "draw2d.Connection", init: function(router) {
        this._super(router);
        this.sourcePort = null;
        this.targetPort = null;
        this.oldPoint = null;
        this.sourceDecorator = null;
        this.targetDecorator = null;
        this.sourceDecoratorNode = null;
        this.targetDecoratorNode = null;
        this.setColor("#1B1B1B");
        this.setStroke(1);
        this.isMoving = false;
    }, disconnect: function() {
        if (this.sourcePort !== null) {
            this.sourcePort.detachMoveListener(this);
            this.fireSourcePortRouteEvent();
        }
        if (this.targetPort !== null) {
            this.targetPort.detachMoveListener(this);
            this.fireTargetPortRouteEvent();
        }
    }, reconnect: function() {
        if (this.sourcePort !== null) {
            this.sourcePort.attachMoveListener(this);
            this.fireSourcePortRouteEvent();
        }
        if (this.targetPort !== null) {
            this.targetPort.attachMoveListener(this);
            this.fireTargetPortRouteEvent();
        }
        this.routingRequired = true;
        this.repaint();
    }, isResizeable: function() {
        return this.isDraggable();
    }, addFigure: function(child, locator) {
        if (!(locator instanceof draw2d.layout.locator.ConnectionLocator)) {
            throw"Locator must implement the class draw2d.layout.locator.ConnectionLocator";
        }
        this._super(child, locator);
    }, setSourceDecorator: function(decorator) {
        this.sourceDecorator = decorator;
        this.routingRequired = true;
        if (this.sourceDecoratorNode !== null) {
            this.sourceDecoratorNode.remove();
            this.sourceDecoratorNode = null;
        }
        this.repaint();
    }, getSourceDecorator: function() {
        return this.sourceDecorator;
    }, setTargetDecorator: function(decorator) {
        this.targetDecorator = decorator;
        this.routingRequired = true;
        if (this.targetDecoratorNode !== null) {
            this.targetDecoratorNode.remove();
            this.targetDecoratorNode = null;
        }
        this.repaint();
    }, getTargetDecorator: function() {
        return this.targetDecorator;
    }, calculatePath: function() {
        if (this.sourcePort === null || this.targetPort === null) {
            return;
        }
        this._super();
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (this.sourcePort === null || this.targetPort === null) {
            return;
        }
        this._super(attributes);
        if (this.targetDecorator !== null && this.targetDecoratorNode === null) {
            this.targetDecoratorNode = this.targetDecorator.paint(this.getCanvas().paper);
        }
        if (this.sourceDecorator !== null && this.sourceDecoratorNode === null) {
            this.sourceDecoratorNode = this.sourceDecorator.paint(this.getCanvas().paper);
        }
        if (this.sourceDecoratorNode !== null) {
            var start = this.getPoints().get(0);
            this.sourceDecoratorNode.transform("r" + this.getStartAngle() + "," + start.x + "," + start.y + " t" + start.x + "," + start.y);
            this.sourceDecoratorNode.attr({"stroke": "#" + this.lineColor.hex(), opacity: this.alpha});
            this.sourceDecoratorNode.forEach(jQuery.proxy(function(shape) {
                shape.node.setAttribute("class", this.cssClass !== null ? this.cssClass : "");
            }, this));
        }
        if (this.targetDecoratorNode !== null) {
            var end = this.getPoints().getLastElement();
            this.targetDecoratorNode.transform("r" + this.getEndAngle() + "," + end.x + "," + end.y + " t" + end.x + "," + end.y);
            this.targetDecoratorNode.attr({"stroke": "#" + this.lineColor.hex(), opacity: this.alpha});
            this.targetDecoratorNode.forEach(jQuery.proxy(function(shape) {
                shape.node.setAttribute("class", this.cssClass !== null ? this.cssClass : "");
            }, this));
        }
    }, getAbsoluteX: function() {
        return 0;
    }, getAbsoluteY: function() {
        return 0;
    }, postProcess: function(postProcessCache) {
        this.router.postProcess(this, this.getCanvas(), postProcessCache);
    }, onDragEnter: function(draggedFigure) {
        if (draggedFigure instanceof draw2d.shape.basic.LineResizeHandle) {
            return null;
        }
        this.setGlow(true);
        return this;
    }, onDragLeave: function(draggedFigure) {
        this.setGlow(false);
    }, getStartPoint: function() {
        if (this.isMoving === false) {
            return this.sourcePort.getConnectionAnchorLocation(this.targetPort.getConnectionAnchorReferencePoint());
        } else {
            return this._super();
        }
    }, getEndPoint: function() {
        if (this.isMoving === false) {
            return this.targetPort.getConnectionAnchorLocation(this.sourcePort.getConnectionAnchorReferencePoint());
        } else {
            return this._super();
        }
    }, setSource: function(port) {
        if (this.sourcePort !== null) {
            this.sourcePort.detachMoveListener(this);
            this.sourcePort.onDisconnect(this);
        }
        this.sourcePort = port;
        if (this.sourcePort === null) {
            return;
        }
        this.routingRequired = true;
        this.fireSourcePortRouteEvent();
        this.sourcePort.attachMoveListener(this);
        if (this.canvas !== null) {
            this.sourcePort.onConnect(this);
        }
        this.setStartPoint(port.getAbsoluteX(), port.getAbsoluteY());
    }, getSource: function() {
        return this.sourcePort;
    }, setTarget: function(port) {
        if (this.targetPort !== null) {
            this.targetPort.detachMoveListener(this);
            this.targetPort.onDisconnect(this);
        }
        this.targetPort = port;
        if (this.targetPort === null) {
            return;
        }
        this.routingRequired = true;
        this.fireTargetPortRouteEvent();
        this.targetPort.attachMoveListener(this);
        if (this.canvas !== null) {
            this.targetPort.onConnect(this);
        }
        this.setEndPoint(port.getAbsoluteX(), port.getAbsoluteY());
    }, getTarget: function() {
        return this.targetPort;
    }, sharingPorts: function(other) {
        return this.sourcePort == other.sourcePort || this.sourcePort == other.targetPort || this.targetPort == other.sourcePort || this.targetPort == other.targetPort;
    }, setCanvas: function(canvas) {
        this._super(canvas);
        if (this.sourceDecoratorNode !== null) {
            this.sourceDecoratorNode.remove();
            this.sourceDecoratorNode = null;
        }
        if (this.targetDecoratorNode !== null) {
            this.targetDecoratorNode.remove();
            this.targetDecoratorNode = null;
        }
        if (this.canvas === null) {
            this.router.onUninstall(this);
            if (this.sourcePort !== null) {
                this.sourcePort.detachMoveListener(this);
                this.sourcePort.onDisconnect(this);
            }
            if (this.targetPort !== null) {
                this.targetPort.detachMoveListener(this);
                this.targetPort.onDisconnect(this);
            }
        } else {
            this.router.onInstall(this);
            if (this.sourcePort !== null) {
                this.sourcePort.attachMoveListener(this);
                this.sourcePort.onConnect(this);
            }
            if (this.targetPort !== null) {
                this.targetPort.attachMoveListener(this);
                this.targetPort.onConnect(this);
            }
        }
    }, onOtherFigureIsMoving: function(figure) {
        if (figure === this.sourcePort) {
            this.setStartPoint(this.sourcePort.getAbsoluteX(), this.sourcePort.getAbsoluteY());
        } else {
            this.setEndPoint(this.targetPort.getAbsoluteX(), this.targetPort.getAbsoluteY());
        }
        this._super(figure);
    }, getStartAngle: function() {
        if (this.lineSegments.getSize() === 0) {
            return 0;
        }
        var p1 = this.lineSegments.get(0).start;
        var p2 = this.lineSegments.get(0).end;
        if (this.router instanceof draw2d.layout.connection.SplineConnectionRouter) {
            p2 = this.lineSegments.get(5).end;
        }
        var length = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        var angle = -(180 / Math.PI) * Math.asin((p1.y - p2.y) / length);
        if (angle < 0) {
            if (p2.x < p1.x) {
                angle = Math.abs(angle) + 180;
            } else {
                angle = 360 - Math.abs(angle);
            }
        } else {
            if (p2.x < p1.x) {
                angle = 180 - angle;
            }
        }
        return angle;
    }, getEndAngle: function() {
        if (this.lineSegments.getSize() === 0) {
            return 90;
        }
        var p1 = this.lineSegments.get(this.lineSegments.getSize() - 1).end;
        var p2 = this.lineSegments.get(this.lineSegments.getSize() - 1).start;
        if (this.router instanceof draw2d.layout.connection.SplineConnectionRouter) {
            p2 = this.lineSegments.get(this.lineSegments.getSize() - 5).end;
        }
        var length = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        var angle = -(180 / Math.PI) * Math.asin((p1.y - p2.y) / length);
        if (angle < 0) {
            if (p2.x < p1.x) {
                angle = Math.abs(angle) + 180;
            } else {
                angle = 360 - Math.abs(angle);
            }
        } else {
            if (p2.x < p1.x) {
                angle = 180 - angle;
            }
        }
        return angle;
    }, fireSourcePortRouteEvent: function() {
        var connections = this.sourcePort.getConnections();
        for (var i = 0; i < connections.getSize(); i++) {
            connections.get(i).repaint();
        }
    }, fireTargetPortRouteEvent: function() {
        var connections = this.targetPort.getConnections();
        for (var i = 0; i < connections.getSize(); i++) {
            connections.get(i).repaint();
        }
    }, createCommand: function(request) {
        if (request.getPolicy() === draw2d.command.CommandType.MOVE_BASEPOINT) {
            return new draw2d.command.CommandReconnect(this);
        }
        return this._super(request);
    }, getPersistentAttributes: function() {
        var memento = this._super();
        var parentNode = this.getSource().getParent();
        while (parentNode.getParent() !== null) {
            parentNode = parentNode.getParent();
        }
        memento.source = {node: parentNode.getId(), port: this.getSource().getName()};
        var parentNode = this.getTarget().getParent();
        while (parentNode.getParent() !== null) {
            parentNode = parentNode.getParent();
        }
        memento.target = {node: parentNode.getId(), port: this.getTarget().getName()};
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);
    }});
draw2d.Connection.createConnection = function(sourcePort, targetPort) {
    return new draw2d.Connection();
};

draw2d.Connection.DEFAULT_ROUTER = new draw2d.layout.connection.ManhattanConnectionRouter();
draw2d.VectorFigure = draw2d.shape.node.Node.extend({NAME: "draw2d.VectorFigure", init: function() {
        this.stroke = 1;
        this.bgColor = new draw2d.util.Color(255, 255, 255);
        this.lineColor = new draw2d.util.Color(128, 128, 255);
        this.color = new draw2d.util.Color(128, 128, 128);
        this.strokeBeforeGlow = this.stroke;
        this.glowIsActive = false;
        this._super();
    }, setGlow: function(flag) {
        console.log("called: setGlow ");
        if (flag === this.glowIsActive) {
            return this;
        }
        this.glowIsActive = flag;
        if (flag === true) {
            this.strokeBeforeGlow = this.getStroke();
            console.log("stroke is: " + this.getStroke());
            this.setStroke(this.strokeBeforeGlow * 2.5);
            console.log("new stroke is: " + this.getStroke());
        } else {
            this.setStroke(this.strokeBeforeGlow);
            console.log("after new stroke is: " + this.getStroke());
        }
        return this;
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        attributes.x = this.getAbsoluteX();
        attributes.y = this.getAbsoluteY();
        if (typeof attributes.stroke === "undefined") {
            if (this.color === null || this.stroke === 0) {
                attributes.stroke = "none";
            } else {
                attributes.stroke = this.color.hash();
            }
        }
        attributes["stroke-width"] = this.stroke;
        if (typeof attributes.fill === "undefined") {
            attributes.fill = this.bgColor.hash();
        }
        this._super(attributes);
    }, setBackgroundColor: function(color) {
        this.bgColor = new draw2d.util.Color(color);
        this.repaint();
        return this;
    }, getBackgroundColor: function() {
        return this.bgColor;
    }, setStroke: function(w) {
        this.stroke = w;
        this.repaint();
        return this;
    }, getStroke: function() {
        return this.stroke;
    }, setColor: function(color) {
        this.color = new draw2d.util.Color(color);
        this.repaint();
        return this;
    }, getColor: function() {
        return this.color;
    }});
draw2d.ResizeHandle = draw2d.shape.basic.Rectangle.extend({NAME: "draw2d.ResizeHandle", DEFAULT_COLOR: "#00bdee", init: function(figure, type) {
        this._super();
        this.isResizeHandle = true;
        this.owner = figure;
        this.type = type;
        this.command = null;
        this.commandMove = null;
        this.commandResize = null;
        this.setDimension();
        this.setBackgroundColor(this.DEFAULT_COLOR);
        this.setColor("#7A7A7A");
        this.setStroke(1);
        this.setSelectable(false);
        this.setRadius(0);
    }, select: function(asPrimarySelection) {
    }, unselect: function() {
    }, getSnapToDirection: function() {
        switch (this.type) {
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
            default:
                return draw2d.SnapToHelper.EAST;
        }
    }, createShapeElement: function() {
        var shape = this._super();
        switch (this.type) {
            case 1:
                shape.attr({"cursor": "nw-resize"});
                break;
            case 2:
                shape.attr({"cursor": "n-resize"});
                break;
            case 3:
                shape.attr({"cursor": "ne-resize"});
                break;
            case 4:
                shape.attr({"cursor": "e-resize"});
                break;
            case 5:
                shape.attr({"cursor": "se-resize"});
                break;
            case 6:
                shape.attr({"cursor": "s-resize"});
                break;
            case 7:
                shape.attr({"cursor": "sw-resize"});
                break;
            case 8:
                shape.attr({"cursor": "w-resize"});
                break;
        }
        return shape;
    }, onDragStart: function() {
        if (!this.isDraggable()) {
            return false;
        }
        this.ox = this.getAbsoluteX();
        this.oy = this.getAbsoluteY();
        this.commandMove = this.owner.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE));
        this.commandResize = this.owner.createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.RESIZE));
        return true;
    }, onDrag: function(dx, dy, dx2, dy2) {
        if (this.isDraggable() === false) {
            return;
        }
        var oldX = this.getAbsoluteX();
        var oldY = this.getAbsoluteY();
        this._super(dx, dy, dx2, dy2);
        var diffX = this.getAbsoluteX() - oldX;
        var diffY = this.getAbsoluteY() - oldY;
        var obj = this.owner;
        var objPosX = obj.getAbsoluteX();
        var objPosY = obj.getAbsoluteY();
        var objWidth = obj.getWidth();
        var objHeight = obj.getHeight();
        switch (this.type) {
            case 1:
                obj.setDimension(objWidth - diffX, objHeight - diffY);
                obj.setPosition(objPosX + (objWidth - obj.getWidth()), objPosY + (objHeight - obj.getHeight()));
                break;
            case 2:
                obj.setDimension(objWidth, objHeight - diffY);
                obj.setPosition(objPosX, objPosY + (objHeight - obj.getHeight()));
                break;
            case 3:
                obj.setDimension(objWidth + diffX, objHeight - diffY);
                obj.setPosition(objPosX, objPosY + (objHeight - obj.getHeight()));
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
                obj.setPosition(objPosX + (objWidth - obj.getWidth()), objPosY);
                break;
            case 8:
                obj.setDimension(objWidth - diffX, objHeight);
                obj.setPosition(objPosX + (objWidth - obj.getWidth()), objPosY);
                break;
        }
    }, onDragEnd: function() {
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
        this.canvas.hideSnapToHelperLines();
    }, setPosition: function(x, y) {
        if (x instanceof draw2d.geo.Point) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
        this.repaint();
    }, setDimension: function(width, height) {
        if (typeof height !== "undefined") {
            this._super(width, height);
        } else {
            if (draw2d.isTouchDevice) {
                this._super(15, 15);
            } else {
                this._super(8, 8);
            }
        }
        var offset = this.getWidth();
        var offset2 = offset / 2;
        switch (this.type) {
            case 1:
                this.setSnapToGridAnchor(new draw2d.geo.Point(offset, offset));
                break;
            case 2:
                this.setSnapToGridAnchor(new draw2d.geo.Point(offset2, offset));
                break;
            case 3:
                this.setSnapToGridAnchor(new draw2d.geo.Point(0, offset));
                break;
            case 4:
                this.setSnapToGridAnchor(new draw2d.geo.Point(0, offset2));
                break;
            case 5:
                this.setSnapToGridAnchor(new draw2d.geo.Point(0, 0));
                break;
            case 6:
                this.setSnapToGridAnchor(new draw2d.geo.Point(offset2, 0));
                break;
            case 7:
                this.setSnapToGridAnchor(new draw2d.geo.Point(offset, 0));
                break;
            case 8:
                this.setSnapToGridAnchor(new draw2d.geo.Point(offset, offset2));
                break;
            case 9:
                this.setSnapToGridAnchor(new draw2d.geo.Point(offset2, offset2));
                break;
        }
    }, show: function(canvas) {
        this.setCanvas(canvas);
        this.canvas.resizeHandles.add(this);
        this.shape.toFront();
    }, hide: function() {
        if (this.shape === null) {
            return;
        }
        this.canvas.resizeHandles.remove(this);
        this.setCanvas(null);
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (this.getAlpha() < 0.9) {
            attributes.fill = "#e6e6e8";
        } else {
            attributes.fill = "90-#b8c8ec-#e6e6e8";
        }
        this._super(attributes);
    }, supportsSnapToHelper: function() {
        return true;
    }, onKeyDown: function(keyCode, ctrl) {
        this.canvas.onKeyDown(keyCode, ctrl);
    }, fireMoveEvent: function() {
    }});
draw2d.shape.basic.LineResizeHandle = draw2d.shape.basic.Circle.extend({NAME: "draw2d.shape.basic.LineResizeHandle", init: function(figure) {
        this._super();
        this.owner = figure;
        this.isResizeHandle = true;
        if (draw2d.isTouchDevice) {
            this.setDimension(20, 20);
        } else {
            this.setDimension(10, 10);
        }
        this.setBackgroundColor("#00bdee");
        this.setColor("#7A7A7A");
        this.setStroke(1);
        this.setSelectable(false);
        this.currentTarget = null;
    }, createShapeElement: function() {
        var shape = this._super();
        shape.attr({"cursor": "move"});
        return shape;
    }, select: function(asPrimarySelection) {
    }, unselect: function() {
    }, getRelatedPort: function() {
        return null;
    }, getOppositePort: function() {
        return null;
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (this.getAlpha() < 0.9) {
            attributes.fill = "#b4e391";
        } else {
            attributes.fill = "r(.4,.3)#b4e391-#61c419:60-#299a0b";
        }
        this._super(attributes);
    }, onDragStart: function() {
        this.command = this.getCanvas().getCurrentSelection().createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE_BASEPOINT));
        return true;
    }, onDrag: function(dx, dy, dx2, dy2) {
        this.setPosition(this.x + dx2, this.y + dy2);
        var port = this.getOppositePort();
        var target = port !== null ? port.getDropTarget(this.getX(), this.getY(), null) : null;
        if (target !== this.currentTarget) {
            if (this.currentTarget !== null) {
                this.currentTarget.onDragLeave(port);
                this.currentTarget.setGlow(false);
            }
            if (target !== null) {
                this.currentTarget = target.onDragEnter(port);
                if (this.currentTarget !== null) {
                    this.currentTarget.setGlow(true);
                }
            }
        }
        return true;
    }, onDragEnd: function() {
        if (!this.isDraggable()) {
            return false;
        }
        var port = this.getOppositePort();
        if (port !== null) {
            if (this.currentTarget !== null) {
                this.onDrop(this.currentTarget);
                this.currentTarget.onDragLeave(port);
                this.currentTarget.setGlow(false);
                this.currentTarget = null;
            }
        }
        this.owner.isMoving = false;
        if (this.getCanvas().getCurrentSelection() instanceof draw2d.Connection) {
            if (this.command !== null) {
                this.command.cancel();
            }
        } else {
            if (this.command !== null) {
                this.getCanvas().getCommandStack().execute(this.command);
            }
        }
        this.command = null;
        this.getCanvas().hideSnapToHelperLines();
        return true;
    }, relocate: function() {
    }, supportsSnapToHelper: function() {
        if (this.getCanvas().getCurrentSelection() instanceof draw2d.Connection) {
            return false;
        }
        return true;
    }, show: function(canvas, x, y) {
        this.setCanvas(canvas);
        this.setPosition(x, y);
        this.shape.toFront();
        this.canvas.resizeHandles.add(this);
    }, hide: function() {
        if (this.shape === null) {
            return;
        }
        this.canvas.resizeHandles.remove(this);
        this.setCanvas(null);
    }, onKeyDown: function(keyCode, ctrl) {
        this.canvas.onKeyDown(keyCode, ctrl);
    }, fireMoveEvent: function() {
    }});
draw2d.shape.basic.LineStartResizeHandle = draw2d.shape.basic.LineResizeHandle.extend({NAME: "draw2d.shape.basic.LineStartResizeHandle", init: function(figure) {
        this._super(figure);
    }, getRelatedPort: function() {
        if (this.owner instanceof draw2d.Connection) {
            return this.owner.getSource();
        }
        return null;
    }, getOppositePort: function() {
        if (this.owner instanceof draw2d.Connection) {
            return this.owner.getTarget();
        }
        return null;
    }, onDrag: function(dx, dy, dx2, dy2) {
        this._super(dx, dy, dx2, dy2);
        var objPos = this.owner.getStartPoint();
        objPos.translate(dx2, dy2);
        this.owner.setStartPoint(objPos.x, objPos.y);
        this.owner.isMoving = true;
        return true;
    }, onDrop: function(dropTarget) {
        this.owner.isMoving = false;
        if (this.owner instanceof draw2d.Connection && this.command !== null) {
            this.command.setNewPorts(dropTarget, this.owner.getTarget());
            this.getCanvas().getCommandStack().execute(this.command);
        }
        this.command = null;
    }, relocate: function() {
        var resizeWidthHalf = this.getWidth() / 2;
        var resizeHeightHalf = this.getHeight() / 2;
        var anchor = this.owner.getStartPoint();
        this.setPosition(anchor.x - resizeWidthHalf, anchor.y - resizeHeightHalf);
    }});
draw2d.shape.basic.LineEndResizeHandle = draw2d.shape.basic.LineResizeHandle.extend({NAME: "draw2d.shape.basic.LineEndResizeHandle", init: function(figure) {
        this._super(figure);
    }, getRelatedPort: function() {
        if (this.owner instanceof draw2d.Connection) {
            return this.owner.getTarget();
        }
        return null;
    }, getOppositePort: function() {
        if (this.owner instanceof draw2d.Connection) {
            return this.owner.getSource();
        }
        return null;
    }, onDrag: function(dx, dy, dx2, dy2) {
        this._super(dx, dy, dx2, dy2);
        var objPos = this.owner.getEndPoint();
        objPos.translate(dx2, dy2);
        this.owner.setEndPoint(objPos.x, objPos.y);
        this.owner.isMoving = true;
        return true;
    }, onDrop: function(dropTarget) {
        this.owner.isMoving = false;
        if (this.owner instanceof draw2d.Connection && this.command !== null) {
            this.command.setNewPorts(this.owner.getSource(), dropTarget);
            this.getCanvas().getCommandStack().execute(this.command);
        }
        this.command = null;
    }, relocate: function() {
        var resizeWidthHalf = this.getWidth() / 2;
        var resizeHeightHalf = this.getHeight() / 2;
        var anchor = this.owner.getEndPoint();
        this.setPosition(anchor.x - resizeWidthHalf, anchor.y - resizeHeightHalf);
    }});
draw2d.shape.basic.JunctionResizeHandle = draw2d.shape.basic.LineResizeHandle.extend({NAME: "draw2d.shape.basic.JunctionResizeHandle", SNAP_THRESHOLD: 3, LINE_COLOR: "#1387E6", FADEOUT_DURATION: 300, init: function(figure, index) {
        this._super(figure);
        this.index = index;
        this.isDead = false;
        this.vline = null;
        this.hline = null;
    }, onDoubleClick: function() {
        var cmd = new draw2d.command.CommandRemoveJunctionPoint(this.owner, this.index);
        this.getCanvas().getCommandStack().execute(cmd);
        this.isDead = true;
    }, onDragStart: function() {
        if (this.isDead === true) {
            return;
        }
        this._super();
        this.command = this.getCanvas().getCurrentSelection().createCommand(new draw2d.command.CommandType(draw2d.command.CommandType.MOVE_JUNCTION));
        if (this.command != null) {
            this.command.setIndex(this.index);
        }
        this.junctionPoint = this.owner.getPoints().get(this.index).clone();
    }, onDrag: function(dx, dy, dx2, dy2) {
        if (this.isDead === true || this.command == null) {
            return false;
        }
        this.setPosition(this.x + dx2, this.y + dy2);
        this.junctionPoint.translate(dx2, dy2);
        this.owner.setJunctionPoint(this.index, this.junctionPoint.x, this.junctionPoint.y);
        this.command.updatePosition(this.junctionPoint.x, this.junctionPoint.y);
        var points = this.owner.getPoints();
        var left = points.get(this.index - 1);
        var right = points.get(this.index + 1);
        if (Math.abs(left.x - this.junctionPoint.x) < this.SNAP_THRESHOLD) {
            this.showVerticalLine(left.x);
        } else {
            if (Math.abs(right.x - this.junctionPoint.x) < this.SNAP_THRESHOLD) {
                this.showVerticalLine(right.x);
            } else {
                this.hideVerticalLine();
            }
        }
        if (Math.abs(left.y - this.junctionPoint.y) < this.SNAP_THRESHOLD) {
            this.showHorizontalLine(left.y);
        } else {
            if (Math.abs(right.y - this.junctionPoint.y) < this.SNAP_THRESHOLD) {
                this.showHorizontalLine(right.y);
            } else {
                this.hideHorizontalLine();
            }
        }
        return true;
    }, onDragEnd: function() {
        if (this.isDead === true || this.command === null) {
            return false;
        }
        this.hideVerticalLine();
        this.hideHorizontalLine();
        var points = this.owner.getPoints();
        var left = points.get(this.index - 1);
        var right = points.get(this.index + 1);
        if (Math.abs(left.x - this.junctionPoint.x) < this.SNAP_THRESHOLD) {
            this.command.updatePosition(left.x, this.junctionPoint.y);
        } else {
            if (Math.abs(right.x - this.junctionPoint.x) < this.SNAP_THRESHOLD) {
                this.command.updatePosition(right.x, this.junctionPoint.y);
            }
        }
        if (Math.abs(left.y - this.junctionPoint.y) < this.SNAP_THRESHOLD) {
            this.command.updatePosition(this.junctionPoint.x, left.y);
        } else {
            if (Math.abs(right.y - this.junctionPoint.y) < this.SNAP_THRESHOLD) {
                this.command.updatePosition(this.junctionPoint.x, right.y);
            }
        }
        var stack = this.getCanvas().getCommandStack();
        stack.startTransaction();
        try {
            stack.execute(this.command);
            this.command = null;
            this.getCanvas().hideSnapToHelperLines();
            var angle = this.getEnclosingAngle();
            if (angle > 178) {
                var cmd = new draw2d.command.CommandRemoveJunctionPoint(this.owner, this.index);
                stack.execute(cmd);
            }
        } finally {
            stack.commitTransaction();
        }
        return true;
    }, relocate: function() {
        var resizeWidthHalf = this.getWidth() / 2;
        var resizeHeightHalf = this.getHeight() / 2;
        var anchor = this.owner.getPoints().get(this.index);
        this.setPosition(anchor.x - resizeWidthHalf, anchor.y - resizeHeightHalf);
    }, getEnclosingAngle: function() {
        var points = this.owner.getPoints();
        var trans = this.junctionPoint.getScaled(-1);
        var left = points.get(this.index - 1).getTranslated(trans);
        var right = points.get(this.index + 1).getTranslated(trans);
        var dot = left.dot(right);
        var acos = Math.acos(dot / (left.length() * right.length()));
        return acos * 180 / Math.PI;
    }, showVerticalLine: function(x) {
        if (this.vline != null) {
            return;
        }
        this.vline = this.canvas.paper.path("M " + x + " 0 l 0 " + this.canvas.getHeight()).attr({"stroke": this.LINE_COLOR, "stroke-width": 1});
    }, hideVerticalLine: function() {
        if (this.vline == null) {
            return;
        }
        var tmp = this.vline;
        tmp.animate({opacity: 0.1}, this.FADEOUT_DURATION, function() {
            tmp.remove();
        });
        this.vline = null;
    }, showHorizontalLine: function(y) {
        if (this.hline != null) {
            return;
        }
        this.hline = this.canvas.paper.path("M 0 " + y + " l " + this.canvas.getWidth() + " 0").attr({"stroke": this.LINE_COLOR, "stroke-width": 1});
    }, hideHorizontalLine: function() {
        if (this.hline == null) {
            return;
        }
        var tmp = this.hline;
        tmp.animate({opacity: 0.1}, this.FADEOUT_DURATION, function() {
            tmp.remove();
        });
        this.hline = null;
    }});
draw2d.shape.basic.GhostJunctionResizeHandle = draw2d.shape.basic.LineResizeHandle.extend({NAME: "draw2d.shape.basic.GhostJunctionResizeHandle", init: function(figure, precursorIndex) {
        this._super(figure);
        this.precursorIndex = precursorIndex;
        this.setAlpha(0.35);
    }, createShapeElement: function() {
        var shape = this._super();
        shape.attr({"cursor": "pointer"});
        return shape;
    }, onClick: function() {
        var cmd = new draw2d.command.CommandAddJunctionPoint(this.owner, this.precursorIndex + 1, this.getAbsoluteX() + this.getWidth() / 2, this.getAbsoluteY() + this.getHeight() / 2);
        this.getCanvas().getCommandStack().execute(cmd);
    }, onDrag: function(dx, dy, dx2, dy2) {
        return true;
    }, onDragEnd: function() {
        return true;
    }, relocate: function() {
        var p1 = this.owner.getPoints().get(this.precursorIndex);
        var p2 = this.owner.getPoints().get(this.precursorIndex + 1);
        var x = ((p2.x - p1.x) / 2 + p1.x - this.getWidth() / 2) | 0;
        var y = ((p2.y - p1.y) / 2 + p1.y - this.getHeight() / 2) | 0;
        this.setPosition(x, y);
    }});
draw2d.Port = draw2d.shape.basic.Circle.extend({NAME: "draw2d.Port", DEFAULT_BORDER_COLOR: new draw2d.util.Color("#1B1B1B"), init: function(name) {
        this.locator = null;
        this.lighterBgColor = null;
        this._super();
        if (draw2d.isTouchDevice) {
            this.setDimension(25, 25);
        } else {
            this.setDimension(10, 10);
        }
        this.ox = this.x;
        this.oy = this.y;
        this.coronaWidth = 5;
        this.corona = null;
        this.currentTargetPort = null;
        this.currentTarget = null;
        this.setBackgroundColor("#4f6870");
        this.setStroke(1);
        this.setColor(this.DEFAULT_BORDER_COLOR);
        this.setSelectable(false);
        if (typeof name === "undefined") {
            this.name = null;
        } else {
            this.name = name;
        }
        this.connectionAnchor = new draw2d.layout.anchor.ConnectionAnchor(this);
        this.value = null;
        this.maxFanOut = Number.MAX_VALUE;
        this.setCanSnapToHelper(false);
        this.installEditPolicy(new draw2d.policy.port.IntrusivePortsFeedbackPolicy());
    }, setMaxFanOut: function(count) {
        this.maxFanOut = Math.max(1, count);
        return this;
    }, getMaxFanOut: function() {
        return this.maxFanOut;
    }, setConnectionAnchor: function(anchor) {
        if (typeof anchor === "undefined" || anchor === null) {
            anchor = new draw2d.layout.anchor.ConnectionAnchor();
        }
        this.connectionAnchor = anchor;
        this.connectionAnchor.setOwner(this);
        return this;
    }, getConnectionAnchorLocation: function(referencePoint) {
        return this.connectionAnchor.getLocation(referencePoint);
    }, getConnectionAnchorReferencePoint: function() {
        return this.connectionAnchor.getReferencePoint();
    }, getConnectionDirection: function(conn, relatedPort) {
        return this.getParent().getBoundingBox().getDirection(this.getAbsolutePosition());
    }, setLocator: function(locator) {
        this.locator = locator;
        return this;
    }, setBackgroundColor: function(color) {
        this._super(color);
        this.lighterBgColor = this.bgColor.lighter(0.3).hash();
        return this;
    }, setValue: function(value) {
        this.value = value;
        if (this.getParent() !== null) {
            this.getParent().onPortValueChanged(this);
        }
        return this;
    }, getValue: function() {
        return this.value;
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        attributes.cx = this.getAbsoluteX();
        attributes.cy = this.getAbsoluteY();
        attributes.rx = this.width / 2;
        attributes.ry = attributes.rx;
        attributes.cursor = "move";
        if (this.getAlpha() < 0.9) {
            attributes.fill = this.bgColor.hash();
        } else {
            attributes.fill = ["90", this.bgColor.hash(), this.lighterBgColor].join("-");
        }
        this._super(attributes);
    }, onMouseEnter: function() {
        this.setStroke(2);
    }, onMouseLeave: function() {
        this.setStroke(1);
    }, getConnections: function() {
        var result = new draw2d.util.ArrayList();
        var size = this.moveListener.getSize();
        for (var i = 0; i < size; i++) {
            var target = this.moveListener.get(i);
            if (target instanceof draw2d.Connection) {
                result.add(target);
            }
        }
        return result;
    }, setParent: function(parent) {
        this._super(parent);
        if (this.parent !== null) {
            this.parent.detachMoveListener(this);
        }
        if (this.parent !== null) {
            this.parent.attachMoveListener(this);
        }
    }, getCoronaWidth: function() {
        return this.coronaWidth;
    }, setCoronaWidth: function(width) {
        this.coronaWidth = width;
    }, onDragStart: function() {
        if (this.getConnections().getSize() >= this.maxFanOut) {
            return false;
        }
        if (this.isInDragDrop === true) {
            this.onDragEnd();
        }
        this.getShapeElement().toFront();
        this.ox = this.x;
        this.oy = this.y;
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.onDragStart(this.canvas, this);
            }
        }, this));
        return true;
    }, onDrag: function(dx, dy) {
        this.isInDragDrop = true;
        this._super(dx, dy);
        var target = this.getDropTarget(this.getAbsoluteX(), this.getAbsoluteY(), this);
        if (target !== this.currentTarget) {
            if (this.currentTarget !== null) {
                this.currentTarget.onDragLeave(this);
                this.editPolicy.each(jQuery.proxy(function(i, e) {
                    if (e instanceof draw2d.policy.port.PortFeedbackPolicy) {
                        e.onHoverLeave(this.canvas, this, this.currentTarget);
                    }
                }, this));
            }
            if (target !== null) {
                this.currentTarget = target.onDragEnter(this);
                if (this.currentTarget !== null) {
                    this.currentTargetPort = target;
                    this.editPolicy.each(jQuery.proxy(function(i, e) {
                        if (e instanceof draw2d.policy.port.PortFeedbackPolicy) {
                            e.onHoverEnter(this.canvas, this, this.currentTarget);
                        }
                    }, this));
                }
            } else {
                this.currentTarget = null;
            }
        }
    }, onDragEnd: function() {
        this.setAlpha(1);
        this.setPosition(this.ox, this.oy);
        this.isInDragDrop = false;
        if (this.currentTarget) {
            this.editPolicy.each(jQuery.proxy(function(i, e) {
                if (e instanceof draw2d.policy.port.PortFeedbackPolicy) {
                    e.onHoverLeave(this.canvas, this, this.currentTarget);
                }
            }, this));
        }
        this.editPolicy.each(jQuery.proxy(function(i, e) {
            if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
                e.onDragEnd(this.canvas, this);
            }
        }, this));
        this.currentTarget = null;
    }, onDragEnter: function(draggedFigure) {
        if (!(draggedFigure instanceof draw2d.Port)) {
            return null;
        }
        if (this.getConnections().getSize() >= this.maxFanOut) {
            return null;
        }
        var request = new draw2d.command.CommandType(draw2d.command.CommandType.CONNECT);
        request.canvas = this.parent.getCanvas();
        request.source = this;
        request.target = draggedFigure;
        var command = draggedFigure.createCommand(request);
        if (command === null) {
            return null;
        }
        return this;
    }, onDragLeave: function(figure) {
        if (!(figure instanceof draw2d.Port)) {
            return;
        }
    }, onDrop: function(dropTarget) {
        if (!(dropTarget instanceof draw2d.Port)) {
            return;
        }
        var request = new draw2d.command.CommandType(draw2d.command.CommandType.CONNECT);
        request.canvas = this.parent.getCanvas();
        request.source = dropTarget;
        request.target = this;
        var command = this.createCommand(request);
        if (command !== null) {
            this.parent.getCanvas().getCommandStack().execute(command);
        }
        this.setGlow(false);
    }, onConnect: function(connection) {
    }, onDisconnect: function(connection) {
    }, onOtherFigureIsMoving: function(figure) {
        this.repaint();
        this.fireMoveEvent();
    }, getName: function() {
        return this.name;
    }, setName: function(name) {
        this.name = name;
    }, hitTest: function(iX, iY) {
        var x = this.getAbsoluteX() - (this.coronaWidth * 2) - this.getWidth() / 2;
        var y = this.getAbsoluteY() - (this.coronaWidth * 2) - this.getHeight() / 2;
        var iX2 = x + this.width + (this.coronaWidth * 2);
        var iY2 = y + this.height + (this.coronaWidth * 2);
        return(iX >= x && iX <= iX2 && iY >= y && iY <= iY2);
    }, setGlow: function(flag) {
        if (flag === true && this.corona === null) {
            this.corona = new draw2d.Corona();
            this.corona.setDimension(this.getWidth() + (this.getCoronaWidth() * 2), this.getWidth() + (this.getCoronaWidth() * 2));
            this.corona.setPosition(this.getAbsoluteX() - this.getCoronaWidth() - this.getWidth() / 2, this.getAbsoluteY() - this.getCoronaWidth() - this.getHeight() / 2);
            this.corona.setCanvas(this.getCanvas());
            this.corona.getShapeElement();
            this.corona.repaint();
        } else {
            if (flag === false && this.corona !== null) {
                this.corona.setCanvas(null);
                this.parent.getCanvas().removeFigure(this.corona);
                this.corona = null;
            }
        }
        return this;
    }, createCommand: function(request) {
        if (request.getPolicy() === draw2d.command.CommandType.MOVE) {
            if (!this.isDraggable()) {
                return null;
            }
            return new draw2d.command.CommandMovePort(this);
        }
        if (request.getPolicy() === draw2d.command.CommandType.CONNECT) {
            if (request.source.parent.id === request.target.parent.id) {
                return null;
            } else {
                return new draw2d.command.CommandConnect(request.canvas, request.source, request.target, request.source);
            }
        }
        return null;
    }, fireMoveEvent: function() {
        if (this.isInDragDrop === true) {
            return;
        }
        this._super();
    }, getDropTarget: function(x, y, portToIgnore) {
        for (var i = 0; i < this.targets.getSize(); i++) {
            var target = this.targets.get(i);
            if (target !== portToIgnore) {
                if (target.hitTest(x, y) === true) {
                    return target;
                }
            }
        }
        return null;
    }, getDropTargets: function() {
        return this.targets.clone().grep(jQuery.proxy(function(element) {
            return element !== this;
        }, this));
    }});
draw2d.Corona = draw2d.shape.basic.Circle.extend({init: function() {
        this._super();
        this.setAlpha(0.3);
        this.setBackgroundColor(new draw2d.util.Color(178, 225, 255));
        this.setColor(new draw2d.util.Color(102, 182, 252));
    }, setAlpha: function(percent) {
        this._super(Math.min(0.3, percent));
        this.setDeleteable(false);
        this.setDraggable(false);
        this.setResizeable(false);
        this.setSelectable(false);
        return this;
    }});
draw2d.InputPort = draw2d.Port.extend({NAME: "draw2d.InputPort", init: function(name) {
        this._super(name);
        this.locator = new draw2d.layout.locator.InputPortLocator();
    }, onDragEnter: function(figure) {
        if (figure instanceof draw2d.OutputPort) {
            return this._super(figure);
        }
        if (figure instanceof draw2d.HybridPort) {
            return this._super(figure);
        }
        return null;
    }, onDragLeave: function(figure) {
        if (figure instanceof draw2d.OutputPort) {
            this._super(figure);
        } else {
            if (figure instanceof draw2d.HybridPort) {
                this._super(figure);
            }
        }
    }, createCommand: function(request) {
        if (request.getPolicy() === draw2d.command.CommandType.CONNECT) {
            if (request.source.getParent().getId() === request.target.getParent().getId()) {
                return null;
            }
            if (request.source instanceof draw2d.OutputPort) {
                return new draw2d.command.CommandConnect(request.canvas, request.source, request.target, request.source);
            }
            if (request.source instanceof draw2d.HybridPort) {
                return new draw2d.command.CommandConnect(request.canvas, request.source, request.target, request.source);
            }
            return null;
        }
        return this._super(request);
    }});
draw2d.OutputPort = draw2d.Port.extend({NAME: "draw2d.OutputPort", init: function(name) {
        this._super(name);
        this.locator = new draw2d.layout.locator.OutputPortLocator();
    }, onDragEnter: function(figure) {
        if (figure instanceof draw2d.InputPort) {
            return this._super(figure);
        }
        if (figure instanceof draw2d.HybridPort) {
            return this._super(figure);
        }
        return null;
    }, onDragLeave: function(figure) {
        if (figure instanceof draw2d.InputPort) {
            this._super(figure);
        } else {
            if (figure instanceof draw2d.HybridPort) {
                this._super(figure);
            }
        }
    }, createCommand: function(request) {
        if (request.getPolicy() === draw2d.command.CommandType.CONNECT) {
            if (request.source.getParent().getId() === request.target.getParent().getId()) {
                return null;
            }
            if (request.source instanceof draw2d.InputPort) {
                return new draw2d.command.CommandConnect(request.canvas, request.target, request.source, request.source);
            }
            if (request.source instanceof draw2d.HybridPort) {
                return new draw2d.command.CommandConnect(request.canvas, request.target, request.source, request.source);
            }
            return null;
        }
        return this._super(request);
    }});
draw2d.HybridPort = draw2d.Port.extend({NAME: "draw2d.HybridPort", init: function(name) {
        this._super(name);
        this.locator = new draw2d.layout.locator.InputPortLocator();
    }, onDragEnter: function(figure) {
        if (figure instanceof draw2d.Port) {
            return this._super(figure);
        }
        return null;
    }, onDragLeave: function(figure) {
        if (!(figure instanceof draw2d.Port)) {
            return;
        }
        if (figure instanceof draw2d.Port) {
            this._super(figure);
        }
    }, createCommand: function(request) {
        if (request.getPolicy() === draw2d.command.CommandType.CONNECT) {
            if (request.source.getParent().getId() === request.target.getParent().getId()) {
                return null;
            }
            if (request.source instanceof draw2d.InputPort) {
                return new draw2d.command.CommandConnect(request.canvas, request.target, request.source, request.source);
            } else {
                if (request.source instanceof draw2d.OutputPort) {
                    return new draw2d.command.CommandConnect(request.canvas, request.source, request.target, request.source);
                } else {
                    if (request.source instanceof draw2d.HybridPort) {
                        return new draw2d.command.CommandConnect(request.canvas, request.target, request.source, request.source);
                    }
                }
            }
            return null;
        }
        return this._super(request);
    }});
draw2d.layout.anchor.ConnectionAnchor = Class.extend({NAME: "draw2d.layout.anchor.ConnectionAnchor", init: function(owner) {
        this.owner = owner;
    }, getLocation: function(reference) {
        return this.getReferencePoint();
    }, getOwner: function() {
        return this.owner;
    }, setOwner: function(owner) {
        if (typeof owner === "undefined") {
            throw"Missing parameter for 'owner' in ConnectionAnchor.setOwner";
        }
        this.owner = owner;
    }, getBox: function() {
        return this.getOwner().getAbsoluteBounds();
    }, getReferencePoint: function() {
        return this.getOwner().getAbsolutePosition();
    }});
draw2d.layout.anchor.ChopboxConnectionAnchor = draw2d.layout.anchor.ConnectionAnchor.extend({NAME: "draw2d.layout.anchor.ChopboxConnectionAnchor", init: function(owner) {
        this._super(owner);
    }, getLocation: function(reference) {
        var r = new draw2d.geo.Rectangle(0, 0);
        r.setBounds(this.getBox());
        r.translate(-1, -1);
        r.resize(1, 1);
        var center = r.getCenter();
        if (r.isEmpty() || (reference.x == center.x && reference.y == center.y)) {
            return center;
        }
        var dx = reference.x - center.x;
        var dy = reference.y - center.y;
        var scale = 0.5 / Math.max(Math.abs(dx) / r.w, Math.abs(dy) / r.h);
        dx *= scale;
        dy *= scale;
        center.translate(dx, dy);
        return center;
    }, getBox: function() {
        return this.getOwner().getParent().getBoundingBox();
    }, getReferencePoint: function() {
        return this.getBox().getCenter();
    }});
draw2d.layout.anchor.ShortesPathConnectionAnchor = draw2d.layout.anchor.ConnectionAnchor.extend({NAME: "draw2d.layout.anchor.ShortesPathConnectionAnchor", init: function(owner) {
        this._super(owner);
    }, getLocation: function(ref) {
        var r = this.getOwner().getParent().getBoundingBox();
        var center = r.getCenter();
        if (this.getOwner().getParent() instanceof draw2d.shape.basic.Oval) {
            var result = this.getOwner().getParent().intersectionWithLine(ref, center);
            if (result.getSize() == 1) {
                return result.get(0);
            } else {
                console.log("error");
            }
        }
        var octant = r.determineOctant(new draw2d.geo.Rectangle(ref.x, ref.y, 2, 2));
        switch (octant) {
            case 0:
                return r.getTopLeft();
            case 1:
                return new draw2d.geo.Point(ref.x, r.getTop());
            case 2:
                return r.getTopRight();
            case 3:
                return new draw2d.geo.Point(r.getRight(), ref.y);
            case 4:
                return r.getBottomRight();
            case 5:
                return new draw2d.geo.Point(ref.x, r.getBottom());
            case 6:
                return r.getBottomLeft();
            case 7:
                return new draw2d.geo.Point(r.getLeft(), ref.y);
        }
        return r.getTopLeft();
    }, getBox: function() {
        return this.getOwner().getParent().getBoundingBox();
    }, getReferencePoint: function() {
        return this.getBox().getCenter();
    }});
draw2d.layout.anchor.CenterEdgeConnectionAnchor = draw2d.layout.anchor.ConnectionAnchor.extend({NAME: "draw2d.layout.anchor.CenterEdgeConnectionAnchor", init: function(owner) {
        this._super(owner);
    }, getLocation: function(ref) {
        var r = this.getOwner().getParent().getBoundingBox();
        var dir = r.getDirection(ref);
        var center = r.getCenter();
        switch (dir) {
            case 0:
                center.y = r.y;
                break;
            case 1:
                center.x = r.x + r.w;
                break;
            case 2:
                center.y = r.y + r.h;
                break;
            case 3:
                center.x = r.x;
        }
        return center;
    }, getBox: function() {
        return this.getOwner().getParent().getBoundingBox();
    }, getReferencePoint: function() {
        return this.getBox().getCenter();
    }});
draw2d.shape.arrow.CalligrapherArrowLeft = draw2d.SVGFigure.extend({NAME: "draw2d.shape.arrow.CalligrapherArrowLeft", init: function() {
        this._super();
    }, getSVG: function() {
        return'<svg width="230" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">' + '  <path style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path3024" d="m 218.87943,27.464763 c -1.21088,-0.0563 -2.42064,-0.14616 -3.63262,-0.16893 c -5.82495,-0.10948 -18.61676,-0.0226 -22.97385,0.0122 c -7.12848,0.057 -14.25673,0.14021 -21.38495,0.22333 c -9.03765,0.10539 -18.07511,0.22813 -27.11266,0.3422 c -10.2269,0.11878 -20.4538,0.23756 -30.6807,0.35634 c -35.488759,0.4089 -70.975849,0.82793 -106.4669238,0.95195 c 0,0 7.9718628,-5.70244 7.9718628,-5.70244 l 0,0 c 6.374241,0.28694 12.745594,0.64561 19.122722,0.86083 c 28.09499,0.94816 56.21338,0.92473 84.315959,0.32205 c 10.51273,-0.32805 21.0288,-0.56402 31.53819,-0.98412 c 27.47361,-1.09824 54.91405,-2.91665 82.28177,-5.53697 c 0,0 -12.9788,9.32351 -12.9788,9.32351 z" inkscape:connector-curvature="0" />' + '  <path style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path3026" d="m 100.75066,1.6309831 c -7.165239,3.9571 -14.284929,7.47866 -22.036659,10.2707299 c -5.00195,1.80163 -10.10374,3.31886 -15.2402,4.79424 c -8.25878,2.37815 -16.55626,4.65805 -24.9012,6.79479 c -2.89107,0.71593 -5.74687,1.56407 -8.66266,2.20424 c -3.211679,0.70512 -6.49468,1.17333 -9.752959,1.6747 c -5.447101,0.92112 -10.9044008,1.81762 -16.3983488,2.50082 c -1.608931,0.0814 -0.850754,0.10697 -2.275834,-0.0365 C 20.004071,21.041553 19.256899,21.517873 32.515691,19.216243 c 6.21537,-1.05913 12.34875,-2.37668 18.3945,-4.03234 c 8.12719,-2.02803 16.23765,-4.1157 24.26421,-6.4321199 c 5.23574,-1.55053 10.41682,-3.15473 15.46857,-5.12875 c 1.38953,-0.54295 2.7579,-1.12682 4.12253,-1.71603 c 0.98421,-0.42496 3.86537,-1.81801999 2.92296,-1.32600999 C 93.642191,2.6934931 89.529511,4.7073031 85.450031,6.7704531 l 15.300629,-5.1394 z" inkscape:connector-curvature="0" sodipodi:nodetypes="csccsccccccsssccc" />' + '  <path style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path3028" d="m 80.764281,58.068863 c -2.45498,-3.50762 -6.58178,-6.10525 -10.40324,-8.66732 c -4.30614,-2.72676 -7.93958,-6.28283 -12.6021,-8.28702 c -7.39912,-4.50257 -11.70055,-7.85592 -20.85866,-9.23429 c -4.9257,-0.85706 -17.294247,-1.32043 -22.226462,-2.15427 c -3.445882,-0.42869 -6.2035918,0.70541 -9.6845138,0.57715 c -1.496337,-0.0586 -2.99355,-0.0965 -4.491229,-0.12472 l 13.9525278,-6.24562 l 3.25,-1.17153 c 1.441459,0.0813 -1.116338,0.15309 0.325505,0.23016 c 3.574557,0.17902 7.211864,0.0695 10.712655,0.73822 c 4.723107,1.08097 9.443947,2.1624 14.234177,3.05317 c 2.76739,0.64203 3.92627,0.87082 6.64127,1.66289 c 4.42146,1.28993 8.60075,3.01513 12.86503,4.58129 c 1.90199,0.73446 5.05193,1.93181 6.89302,2.7216 c 4.92005,2.11061 9.5916,4.57045 13.9716,7.31023 c 4.16708,2.62011 8.48023,5.20033 11.72012,8.56863 z" inkscape:connector-curvature="0" sodipodi:nodetypes="ccccccccccccscsccc" />' + "</svg>";
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (this.svgNodes !== null) {
            this.svgNodes.attr({fill: this.color.hash()});
        }
        this._super(attributes);
    }});
draw2d.shape.arrow.CalligrapherArrowDownLeft = draw2d.SVGFigure.extend({NAME: "draw2d.shape.arrow.CalligrapherArrowDownLeft", init: function() {
        this._super();
    }, getSVG: function() {
        return'<svg width="180" height="300" xmlns="http://www.w3.org/2000/svg" version="1.1">' + '     <path style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path3084" d="m 159.63578,17.846597 c 0.43137,9.44641 -0.0636,18.88035 -0.8284,28.30165 c -1.73211,18.38336 -4.05381,36.71698 -6.08253,55.075313 c -1.61738,13.7075 -3.03402,27.43467 -3.97611,41.19113 c -1.09101,11.16584 -1.31019,22.36559 -1.28541,33.56466 c -0.1328,4.82188 0.3218,9.6468 0.14332,14.46812 c -0.0888,2.39977 -0.28315,3.73625 -0.55012,6.12095 c -0.85848,4.73147 -2.27416,9.40019 -4.7769,13.68272 c -1.47003,2.51544 -3.78493,5.6647 -5.47739,8.05048 c -5.02888,6.66256 -11.08555,12.65652 -18.10552,17.75963 c -4.23302,3.07716 -7.74942,5.12065 -12.22081,7.86298 c -13.253319,6.72606 -25.889792,15.11686 -40.84124,18.60576 c -3.016829,0.7039 -4.431417,0.8157 -7.450859,1.2076 c -6.983246,0.5774 -14.009174,0.3375 -21.010676,0.2509 c -3.278795,-0.033 -6.55749,0.01 -9.835897,0.045 c 0,0 20.838833,-13.2364 20.838833,-13.2364 l 0,0 c 3.147056,0.093 6.294483,0.1852 9.443646,0.2007 c 6.966697,0.011 13.971433,0.1301 20.897176,-0.6344 c 3.732439,-0.5577 7.321215,-1.2431 10.881203,-2.4145 c 1.517208,-0.4992 5.830867,-2.43339 4.487902,-1.6386 c -6.098183,3.6088 -25.104875,12.8748 -9.52514,5.223 c 4.40875,-2.5927 8.262057,-4.7459 12.425175,-7.65986 c 6.839117,-4.78709 12.633657,-10.50427 17.500607,-16.86761 c 2.53518,-3.56692 5.24684,-7.12748 7.07617,-11.03446 c 1.42357,-3.0404 2.21532,-6.28727 2.91146,-9.50152 c 0.91919,-6.88822 1.03991,-13.81392 1.25118,-20.74151 c 0.47683,-11.27871 0.96259,-22.55877 1.61689,-33.83062 c 1.21127,-14.03392 3.64191,-27.94339 5.46543,-41.92167 c 2.26899,-18.186603 4.6835,-36.384373 5.4487,-54.679643 c 0.0788,-2.46092 0.23808,-4.92087 0.23618,-7.38276 c -0.005,-6.45916 -0.62194,-13.00218 -2.13821,-19.32664 c 0,0 23.48134,-10.73998 23.48134,-10.73998 z" inkscape:connector-curvature="0" />' + '     <path style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path3086" d="m 41.271518,252.40239 c 2.465518,-0.7264 4.879503,-1.7726 7.145328,-2.9859 c 0.955597,-0.5117 3.736822,-2.1986 2.791991,-1.6673 c -5.218817,2.9348 -10.409826,5.9187 -15.61474,8.878 c 5.366557,-3.4898 10.227818,-7.6685 14.119927,-12.75576 c 3.507157,-5.09382 4.097613,-11.17122 4.301158,-17.17644 c 0.02635,-3.95844 -0.31227,-7.90612 -0.635377,-11.84752 c 0,0 19.920693,-10.3059 19.920693,-10.3059 l 0,0 c 0.171761,4.05015 0.409899,8.09777 0.50079,12.15101 c -0.185739,6.23619 -0.347804,12.66862 -3.492579,18.24747 c -0.503375,0.75197 -0.961922,1.53596 -1.510126,2.25591 c -3.478528,4.56826 -8.226837,8.04586 -12.757403,11.47443 c -7.345206,4.3297 -14.671333,8.692 -22.035619,12.9891 c -3.551305,2.0723 -7.368692,3.8726 -11.394645,4.7773 c 0,0 18.660602,-14.0344 18.660602,-14.0344 z" inkscape:connector-curvature="0" />' + '     <path style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none" id="path3088" d="m 37.815923,255.49919 c 3.41111,0.1581 6.814569,0.2213 10.182693,0.8184 c 6.92998,2.6928 13.533527,6.2357 20.043462,9.8162 c 3.912139,2.1362 7.91195,4.4644 10.690321,8.0298 c 1.039962,1.2802 1.510411,2.7604 1.893523,4.3313 c 0,0 -20.370847,10.9259 -20.370847,10.9259 l 0,0 c -0.225419,-1.2711 -0.55067,-2.4558 -1.329618,-3.5184 c -2.332229,-3.3633 -5.869056,-5.6279 -9.247191,-7.8233 c -6.335066,-3.7106 -12.98611,-7.1834 -20.232784,-8.6836 c -3.497247,-0.3814 -7.011372,-0.4307 -10.521829,-0.1703 c 0,0 18.89227,-13.726 18.89227,-13.726 z" inkscape:connector-curvature="0" />' + "</svg>";
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (this.svgNodes !== null) {
            this.svgNodes.attr({fill: this.color.hash()});
        }
        this._super(attributes);
    }});
draw2d.shape.node.Start = draw2d.shape.basic.Rectangle.extend({NAME: "draw2d.shape.node.Start", DEFAULT_COLOR: new draw2d.util.Color("#4D90FE"), init: function() {
        this._super();
        this.createPort("output");
        this.setDimension(50, 50);
        this.setBackgroundColor(this.DEFAULT_COLOR);
        this.setColor(this.DEFAULT_COLOR.darker());
    }});
draw2d.shape.node.End = draw2d.shape.basic.Rectangle.extend({NAME: "draw2d.shape.node.End", DEFAULT_COLOR: new draw2d.util.Color("#4D90FE"), init: function() {
        this._super();
        this.createPort("input");
        this.setDimension(50, 50);
        this.setBackgroundColor(this.DEFAULT_COLOR);
        this.setColor(this.DEFAULT_COLOR.darker());
    }});
draw2d.shape.node.Between = draw2d.shape.basic.Rectangle.extend({NAME: "draw2d.shape.node.Between", DEFAULT_COLOR: new draw2d.util.Color("#4D90FE"), init: function() {
        this._super();
        this.setDimension(50, 50);
        this.setBackgroundColor(this.DEFAULT_COLOR);
        this.setColor(this.DEFAULT_COLOR.darker());
        this.createPort("output");
        this.createPort("input");
    }});
// EDIT 1-22-14 nembery change default colors
draw2d.shape.note.PostIt = draw2d.shape.basic.Label.extend({NAME: "draw2d.shape.note.PostIt", init: function(text) {
        this._super(text);
        this.setStroke(1);
        this.setBackgroundColor("#FFFFFF");
        this.setColor("#000000");
        this.setFontColor("#000000");
        this.setFontSize(14);
        this.setPadding(6);
        this.setRadius(5);
        //this.getShapeElement().toFront();

    }});
draw2d.shape.widget.Widget = draw2d.SetFigure.extend({init: function(width, height) {
        this._super(width, height);
    }, getWidth: function() {
        return this.width;
    }, getHeight: function() {
        return this.height;
    }});
draw2d.shape.widget.Slider = draw2d.shape.widget.Widget.extend({NAME: "draw2d.shape.widget.Slider", DEFAULT_COLOR_THUMB: new draw2d.util.Color("#bddf69"), DEFAULT_COLOR_BG: new draw2d.util.Color("#d3d3d3"), init: function(width, height) {
        if (typeof width === "undefined") {
            width = 120;
            height = 15;
        }
        this.currentValue = 0;
        this.slideBoundingBox = new draw2d.geo.Rectangle(0, 0, 10, 20);
        this._super(width, height);
        this.setBackgroundColor(this.DEFAULT_COLOR_BG);
        this.setColor(this.DEFAULT_COLOR_THUMB);
        this.setStroke(1);
        this.setRadius(4);
        this.setResizeable(true);
        this.setMinHeight(10);
        this.setMinWidth(80);
    }, createSet: function() {
        var result = this.canvas.paper.set();
        var thumb = this.canvas.paper.rect(5, 5, 10, 20);
        thumb.node.style.cursor = "col-resize";
        result.push(thumb);
        return result;
    }, setDimension: function(w, h) {
        this._super(w, h);
        this.slideBoundingBox.setBoundary(0, 0, this.getWidth() - 10, this.getHeight());
        this.slideBoundingBox.setHeight(this.getHeight() + 1);
        this.repaint();
    }, onValueChange: function(value) {
    }, onDragStart: function(relativeX, relativeY) {
        if (this.slideBoundingBox.hitTest(relativeX, relativeY)) {
            this.origX = this.slideBoundingBox.getX();
            this.origY = this.slideBoundingBox.getY();
            return false;
        }
        return this._super(relativeX, relativeY);
    }, onPanning: function(dx, dy, dx2, dy2) {
        this.slideBoundingBox.setPosition(this.origX + dx, this.origY + dy);
        this.setValue(100 / (this.slideBoundingBox.bw - this.slideBoundingBox.getWidth()) * this.slideBoundingBox.getX());
    }, setValue: function(value) {
        this.currentValue = Math.min(Math.max(0, (value | 0)), 100);
        this.repaint();
        this.onValueChange(this.currentValue);
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        var thumbX = ((this.slideBoundingBox.bw - this.slideBoundingBox.getWidth()) / 100 * this.currentValue) | 0;
        this.slideBoundingBox.setX(thumbX);
        if (this.svgNodes !== null) {
            var attr = this.slideBoundingBox.toJSON();
            attr.y = attr.y - 5;
            attr.height = attr.height + 10;
            attr.fill = this.getColor().hash();
            attr.stroke = this.getColor().darker(0.2).hash();
            attr.r = 4;
            this.svgNodes.attr(attr);
        }
        attributes.fill = "90-" + this.bgColor.hash() + ":5-" + this.bgColor.lighter(0.3).hash() + ":95";
        attributes.stroke = this.bgColor.darker(0.1).hash();
        this._super(attributes);
    }, applyTransformation: function() {
        this.svgNodes.transform("T" + this.getAbsoluteX() + "," + this.getAbsoluteY());
    }});
draw2d.shape.diagram.Diagram = draw2d.SetFigure.extend({init: function(width, height) {
        this.data = [];
        this.padding = 5;
        this.cache = {};
        this._super(width, height);
        this.setBackgroundColor("#8dabf2");
        this.setStroke(1);
        this.setColor("#f0f0f0");
        this.setRadius(2);
        this.setResizeable(true);
    }, setData: function(data) {
        this.data = data;
        this.cache = {};
        if (this.svgNodes !== null) {
            this.svgNodes.remove();
            this.svgNodes = this.createSet();
        }
        this.repaint();
    }, setDimension: function(w, h) {
        this.cache = {};
        this._super(w, h);
    }, getWidth: function() {
        return this.width;
    }, getHeight: function() {
        return this.height;
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape == null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (typeof attributes.fill === "undefined") {
            attributes.fill = "none";
        }
        this._super(attributes);
    }, applyTransformation: function() {
        if (this.isResizeable() === true) {
            this.svgNodes.transform("S" + this.scaleX + "," + this.scaleY + "," + this.getAbsoluteX() + "," + this.getAbsoluteY() + "t" + this.getAbsoluteX() + "," + this.getAbsoluteY());
        } else {
            this.svgNodes.transform("T" + this.getAbsoluteX() + "," + this.getAbsoluteY());
        }
    }});
draw2d.shape.diagram.Pie = draw2d.shape.diagram.Diagram.extend({COLORS: ["#00A8F0", "#b9dd69", "#f3546a", "#4DA74D", "#9440ED"], TWO_PI: Math.PI * 2, init: function(diameter) {
        this._super(diameter, diameter);
        this.setStroke(0);
    }, setData: function(data) {
        this.sum = 0;
        jQuery.each(data, jQuery.proxy(function(i, val) {
            this.sum += val;
        }, this));
        var _sum = 1 / this.sum;
        jQuery.each(data, jQuery.proxy(function(i, val) {
            data[i] = _sum * val;
        }, this));
        this._super(data);
    }, createSet: function() {
        var radius = this.getWidth() / 2;
        var length = this.data.length;
        var pie = this.canvas.paper.set();
        var offsetAngle = 0;
        for (var i = 0; i < length; i++) {
            var angle = this.TWO_PI * this.data[i];
            var color = this.COLORS[i % length];
            var seg = this.drawSegment(radius, angle, offsetAngle, 0.1);
            seg.attr({stroke: this.color.hash(), fill: color});
            pie.push(seg);
            offsetAngle += angle;
        }
        return pie;
    }, setDimension: function(w, h) {
        if (w > h) {
            this._super(w, w);
        } else {
            this._super(h, h);
        }
        if (this.svgNodes !== null) {
            this.svgNodes.remove();
            this.svgNodes = this.createSet();
        }
        this.repaint();
    }, polarPath: function(radius, theta, rotation) {
        var x, y;
        x = radius * Math.cos(theta + rotation) + radius;
        y = radius * Math.sin(theta + rotation) + radius;
        return"L " + x + " " + y + " ";
    }, drawSegment: function(radius, value, rotation, resolution) {
        var path = "M " + radius + " " + radius;
        for (var i = 0; i < value; i += resolution) {
            path += this.polarPath(radius, i, rotation);
        }
        path += this.polarPath(radius, value, rotation);
        path += "L " + radius + " " + radius;
        return this.getCanvas().paper.path(path);
    }, applyTransformation: function() {
        this.svgNodes.transform("T" + this.getAbsoluteX() + "," + this.getAbsoluteY());
    }});
draw2d.shape.diagram.Sparkline = draw2d.shape.diagram.Diagram.extend({init: function(width, height) {
        this.min = 0;
        this.max = 10;
        if (typeof width === "undefined") {
            width = 180;
            height = 50;
        }
        this._super(width, height);
    }, setData: function(data) {
        this.min = Math.min.apply(Math, data);
        this.max = Math.max.apply(Math, data);
        if (this.max == this.min) {
            this.max = this.min + 1;
        }
        this._super(data);
    }, createSet: function() {
        return this.canvas.paper.path("M0 0 l0 0");
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        attributes.fill = "90-#000:5-#4d4d4d:95";
        var padding = this.padding;
        var width = this.getWidth() - 2 * +this.padding;
        var height = this.getHeight() - 2 * +this.padding;
        var length = this.data.length;
        var min = this.min;
        var max = this.max;
        var toCoords = function(value, idx) {
            var step = 1;
            if (length > 1) {
                step = (width / (length - 1));
            }
            return{y: -((value - min) / (max - min) * height) + height + padding, x: padding + idx * step};
        };
        if (this.svgNodes !== null && (typeof this.cache.pathString === "undefined")) {
            var prev_pt = null;
            jQuery.each(this.data, jQuery.proxy(function(idx, item) {
                var pt = toCoords(item, idx);
                if (prev_pt === null) {
                    this.cache.pathString = ["M", pt.x, pt.y].join(" ");
                } else {
                    this.cache.pathString = [this.cache.pathString, "L", pt.x, pt.y].join(" ");
                }
                prev_pt = pt;
            }, this));
            this.svgNodes.attr({path: this.cache.pathString, stroke: "#f0f0f0"});
        }
        this._super(attributes);
    }});
draw2d.shape.analog.OpAmp = draw2d.SVGFigure.extend({NAME: "draw2d.shape.analog.OpAmp", MyInputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, port) {
            var parent = port.getParent();
            var calcY = (8 + 18.5 * index) * parent.scaleY;
            this.applyConsiderRotation(port, 1, calcY);
        }}), init: function(width, height) {
        if (typeof width === "undefined") {
            width = 50;
            height = 50;
        }
        this._super(width, height);
        this.inputLocator = new this.MyInputPortLocator();
        this.createPort("input", this.inputLocator);
        this.createPort("input", this.inputLocator);
        this.createPort("output");
        this.setBackgroundColor("#f0f0ff");
    }, getSVG: function() {
        return'<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' + '<path d="m8.2627,0l0,35.36035l31.23926,-17.76025l-31.23926,-17.60011l0,0l0,0.00001zm2.27832,27.36719l4.08105,0m-2.10449,-2.20703l0,4.27979m2.26367,-21.35938l-4.15918,0"  stroke="#1B1B1B" fill="none"/>' + '<line x1="0.53516"  y1="8"  x2="8.21191"  y2="8"  stroke="#010101"/>' + '<line x1="39.14941" y1="18" x2="45.81055" y2="18" stroke="#010101" />' + '<line x1="0.53516"  y1="27" x2="8.21191"  y2="27" stroke="#010101" />' + "</svg>";
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        attributes["fill"] = "none";
        if (this.bgColor != null) {
            this.svgNodes[0].attr({fill: this.bgColor.hash()});
        }
        this._super(attributes);
    }});
draw2d.shape.analog.ResistorBridge = draw2d.SVGFigure.extend({NAME: "draw2d.shape.analog.ResistorBridge", MyInputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, figure) {
            var w = figure.getParent().getWidth();
            var h = figure.getParent().getHeight();
            this.applyConsiderRotation(figure, w / 2 + 1, h * index);
        }}), MyOutputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, figure) {
            var w = figure.getParent().getWidth();
            var h = figure.getParent().getHeight();
            this.applyConsiderRotation(figure, w * (index - 2), h / 2);
        }}), init: function(width, height) {
        if (typeof width === "undefined") {
            width = 50;
            height = 50;
        }
        this._super(width, height);
        this.inputLocator = new this.MyInputPortLocator();
        this.outputLocator = new this.MyOutputPortLocator();
        this.createPort("hybrid", this.inputLocator);
        this.createPort("hybrid", this.inputLocator);
        this.createPort("hybrid", this.outputLocator);
        this.createPort("hybrid", this.outputLocator);
    }, getSVG: function() {
        return'<svg  xmlns="http://www.w3.org/2000/svg" version="1.1">' + '<path fill="#010101" stroke="#010101" stroke-miterlimit="14.3" id="path12322" d="m47.62207,22.71094l0,0c0.73145,0.73242 0.71777,1.93359 -0.03027,2.68164c-0.74805,0.74951 -1.94922,0.76123 -2.68073,0.0293c-0.73138,-0.73242 -0.71967,-1.93211 0.03033,-2.68115c0.74707,-0.74803 1.94727,-0.76219 2.68066,-0.02979l0,0z"/>' + '<path fill="#010101" stroke="#010101" stroke-miterlimit="14.3" id="path12324" d="m25.84082,0.93115l0,0c0.73145,0.73096 0.71875,1.93359 -0.02832,2.68066c-0.75,0.74951 -1.94922,0.76123 -2.68164,0.0293c-0.73242,-0.73241 -0.71973,-1.93164 0.0293,-2.68065c0.74805,-0.74756 1.94922,-0.76172 2.68066,-0.0293l0,0l0,-0.00002z"/>' + '<path fill="#010101" stroke="#010101" stroke-miterlimit="14.3" id="path12326" d="m25.75098,44.58203l0,0c0.73145,0.73193 0.71875,1.93311 -0.02832,2.68115c-0.75,0.74902 -1.94922,0.76074 -2.68262,0.0293c-0.73145,-0.73193 -0.71973,-1.93262 0.03033,-2.68164c0.74707,-0.74756 1.94922,-0.76123 2.68066,-0.02879l0,0l-0.00006,-0.00002z"/>' + '<path fill="#010101" stroke="#010101" stroke-miterlimit="14.3" id="path12328" d="m3.9707,22.80127l0,0c0.73242,0.73193 0.71777,1.93359 -0.0293,2.68115c-0.74902,0.74951 -1.94922,0.76172 -2.68164,0.0293c-0.73145,-0.73242 -0.71973,-1.93164 0.03027,-2.68115c0.74707,-0.74707 1.94922,-0.76074 2.68066,-0.0293l0,0z"/>' + '<polyline fill="none" stroke="#010101" id="polyline12334" points="24.908203125,45.49267578125 31.71875,38.68310546875 31.2119140625,36.98876953125 34.892578125,37.95703125 33.953125,34.22265625 37.6650390625,35.18359375 36.6767578125,31.52490234375 40.3759765625,32.47314453125 39.873046875,30.52783203125 45.884765625,24.51708984375 " stroke-miterlimit="14.3"/>' + '<polyline fill="#010101" id="polyline12338" points="36.3408203125,23.98876953125 38.146484375,29.55810546875 33.630859375,29.55810546875 35.435546875,23.98779296875 "/>' + '<line fill="none" stroke="#010101" id="line12340" y2="28.90967" x2="35.8877" y1="41.13428" x1="35.88867" stroke-miterlimit="14.3"/>' + '<polyline fill="none" stroke="#010101" id="polyline12346" points="3.2109375,23.79248046875 10.01953125,16.98388671875 9.513671875,15.2890625 13.193359375,16.25732421875 12.251953125,12.5234375 15.9658203125,13.48486328125 14.9775390625,9.82568359375 18.6767578125,10.7734375 18.173828125,8.82958984375 24.185546875,2.81787109375 " stroke-miterlimit="14.3"/>' + '<polyline fill="#010101" id="polyline12350" points="13.126953125,23.80419921875 11.3212890625,18.236328125 15.8369140625,18.236328125 14.0322265625,23.806640625 "/>' + '<line fill="none" stroke="#010101" id="line12352" y2="18.8833" x2="13.58008" y1="6.65967" x1="13.5791" stroke-miterlimit="14.3"/>' + '<polyline fill="none" stroke="#010101" id="polyline12358" points="46.65625,24.33642578125 39.84765625,17.52783203125 38.154296875,18.033203125 39.1220703125,14.353515625 35.3876953125,15.29345703125 36.34765625,11.58056640625 32.689453125,12.56884765625 33.6376953125,8.86865234375 31.6923828125,9.373046875 24.322265625,2.00341796875 " stroke-miterlimit="14.3"/>' + '<polyline fill="#010101" id="polyline12362" points="36.578125,1.87109375 38.3828125,7.439453125 33.8681640625,7.439453125 35.6728515625,1.869140625 "/>' + '<line fill="none" stroke="#010101" id="line12364" y2="6.7915" x2="36.125" y1="19.01758" x1="36.125" stroke-miterlimit="14.3"/>' + '<polyline fill="none" stroke="#010101" id="polyline12370" points="24.494140625,46.49951171875 17.685546875,39.69091796875 15.9921875,40.1953125 16.958984375,36.515625 13.2265625,37.45556640625 14.185546875,33.7421875 10.52734375,34.73193359375 11.474609375,31.03125 9.529296875,31.53515625 2.1611328125,24.166015625 " stroke-miterlimit="14.3"/>' + '<polyline fill="#010101" id="polyline12374" points="12.150390625,44.80029296875 10.34765625,39.23193359375 14.861328125,39.23095703125 13.0556640625,44.80224609375 "/>' + '<line fill="none" stroke="#010101" id="line12376" y2="39.87891" x2="12.60352" y1="27.6543" x1="12.60352" stroke-miterlimit="14.3"/>' + "</svg>";
    }});
draw2d.shape.analog.ResistorVertical = draw2d.SetFigure.extend({NAME: "draw2d.shape.analog.ResistorVertical", MyInputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, figure) {
            var w = figure.getParent().getWidth();
            var h = figure.getParent().getHeight();
            this.applyConsiderRotation(figure, w / 2, h);
        }}), MyOutputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, figure) {
            var w = figure.getParent().getWidth();
            this.applyConsiderRotation(figure, w / 2, 0);
        }}), init: function(width, height) {
        if (typeof width === "undefined") {
            width = 30;
            height = 50;
        }
        this._super(width, height);
        this.inputLocator = new this.MyInputPortLocator();
        this.outputLocator = new this.MyOutputPortLocator();
        this.createPort("hybrid", this.inputLocator);
        this.createPort("hybrid", this.outputLocator);
    }, createSet: function() {
        var set = this._super();
        set.push(this.canvas.paper.path("M15,0 L15,5 L0,7.5 L30,10 L0,15 L30,20 L0,25 L30,30 L15,32.5 L15,40"));
        return set;
    }});
draw2d.shape.analog.VoltageSupplyHorizontal = draw2d.SVGFigure.extend({NAME: "draw2d.shape.analog.VoltageSupplyHorizontal", MyInputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, figure) {
            var h = figure.getParent().getHeight();
            this.applyConsiderRotation(figure, 0, h / 2);
        }}), MyOutputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, figure) {
            var w = figure.getParent().getWidth();
            var h = figure.getParent().getHeight();
            this.applyConsiderRotation(figure, w, h / 2);
        }}), init: function(width, height) {
        if (typeof width === "undefined") {
            width = 50;
            height = 30;
        }
        this._super(width, height);
        this.createPort("hybrid", new this.MyInputPortLocator());
        this.createPort("hybrid", new this.MyOutputPortLocator());
    }, getSVG: function() {
        return'<svg width="49" height="28" xmlns="http://www.w3.org/2000/svg" version="1.1">' + '<path d="m24.99933,18.95592l0,-9.54576m-5.78374,-9.40907l0,28.35939m-5.78718,-9.40457l0,-9.54576m-5.78374,-9.40907l0,28.35939" id="path10566" stroke-miterlimit="14.3" stroke="#010101" fill="none"/>' + '<path d="m26.79878,14.13039l6.90583,0m-33.22691,0l6.90583,0" id="path10568" stroke-miterlimit="14.3" stroke-linecap="square" stroke="#010101" fill="none"/>' + "</svg>";
    }});
draw2d.shape.analog.VoltageSupplyVertical = draw2d.SVGFigure.extend({NAME: "draw2d.shape.analog.VoltageSupplyVertical", MyInputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, figure) {
            var w = figure.getParent().getWidth();
            var h = figure.getParent().getHeight();
            this.applyConsiderRotation(figure, w / 2, h);
        }}), MyOutputPortLocator: draw2d.layout.locator.PortLocator.extend({init: function() {
            this._super();
        }, relocate: function(index, figure) {
            var w = figure.getParent().getWidth();
            this.applyConsiderRotation(figure, w / 2, 0);
        }}), init: function(width, height) {
        if (typeof width === "undefined") {
            width = 30;
            height = 50;
        }
        this._super(width, height);
        this.inputLocator = new this.MyInputPortLocator();
        this.outputLocator = new this.MyOutputPortLocator();
        this.createPort("hybrid", this.inputLocator);
        this.createPort("hybrid", this.outputLocator);
    }, getSVG: function() {
        return'<svg  xmlns="http://www.w3.org/2000/svg" version="1.1">' + '<path d="m19.62398,12.37594l-9.87926,0m-9.74355,8.22145l29.36289,0m-9.74007,8.22469l-9.87927,0m-9.74355,8.22145l29.36289,0" id="path10560" stroke-miterlimit="14.3" stroke="#010101" fill="none"/>' + '<path d="m14.63157,9.81646l0,-9.81646m0,47.2328l0,-9.81646" id="path10562" stroke-miterlimit="14.3" stroke-linecap="square" stroke="#010101" fill="none"/>' + "</svg>";
    }});
draw2d.shape.layout.Layout = draw2d.shape.basic.Rectangle.extend({NAME: "draw2d.shape.layout.Layout", init: function() {
        this._super();
        this.setBackgroundColor(null);
        this.setRadius(0);
        this.setStroke(0);
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());
    }, addFigure: function(child, locator) {
        this._super(child, this.locator);
        child.attachResizeListener(this);
    }, onOtherFigureIsResizing: function(figure) {
        if (this.getParent() instanceof draw2d.shape.layout.Layout) {
            this.fireResizeEvent();
        } else {
            this.setDimension(1, 1);
        }
    }, onDoubleClick: function(angle) {
    }});
draw2d.shape.layout.HorizontalLayout = draw2d.shape.layout.Layout.extend({NAME: "draw2d.shape.layout.HorizontalLayout", init: function() {
        this._super();
        var _this = this;
        this.locator = {relocate: function(index, target) {
                var stroke = _this.getStroke();
                var xPos = stroke;
                for (var i = 0; i < index; i++) {
                    var child = _this.children.get(i).figure;
                    xPos += child.getWidth() + _this.gap;
                }
                target.setPosition(xPos, stroke);
            }};
        this.setDimension(1, 1);
        this.gap = 0;
    }, setGap: function(gap) {
        this.gap = gap;
        this.setDimension(1, 1);
    }, getMinWidth: function() {
        var width = this.stroke * 2 + Math.max(0, this.children.getSize() - 1) * this.gap;
        this.children.each(function(i, e) {
            width += e.figure.getMinWidth();
        });
        return width;
    }, getMinHeight: function() {
        var height = 10;
        this.children.each(function(i, e) {
            height = Math.max(height, e.figure.getMinHeight());
        });
        return height + this.stroke * 2;
    }, setDimension: function(w, h) {
        this._super(w, h);
        var diff = this.width - this.getMinWidth();
        if (diff > 0) {
            diff = (diff / this.children.getSize()) | 0;
            this.children.each(function(i, e) {
                e.figure.setDimension(e.figure.getMinWidth() + diff, e.figure.getHeight());
            });
        } else {
            this.children.each(function(i, e) {
                e.figure.setDimension(1, 1);
            });
        }
    }});
draw2d.shape.layout.VerticalLayout = draw2d.shape.layout.Layout.extend({NAME: "draw2d.shape.layout.VerticalLayout", init: function() {
        this._super();
        this.gap = 0;
        var _this = this;
        this.locator = {relocate: function(index, target) {
                var stroke = _this.getStroke() / 2;
                var yPos = stroke;
                for (var i = 0; i < index; i++) {
                    var child = _this.children.get(i).figure;
                    yPos = yPos + child.getHeight() + _this.gap;
                }
                target.setPosition(stroke, yPos);
            }};
        this.setDimension(10, 10);
    }, setGap: function(gap) {
        this.gap = gap;
        this.setDimension(1, 1);
    }, getMinWidth: function() {
        var width = 10;
        this.children.each(function(i, e) {
            width = Math.max(width, e.figure.getMinWidth());
        });
        return width + this.stroke;
    }, getMinHeight: function() {
        var height = +this.stroke + Math.max(0, this.children.getSize() - 1) * this.gap;
        this.children.each(function(i, e) {
            height += e.figure.getMinHeight();
        });
        return height;
    }, setDimension: function(w, h) {
        this._super(w, h);
        var width = this.width - this.stroke;
        this.children.each(function(i, e) {
            e.figure.setDimension(width, e.figure.getHeight());
        });
    }});
draw2d.shape.icon.Icon = draw2d.SetFigure.extend({NAME: "draw2d.shape.icon.Icon", init: function(width, height) {
        this._super(width, height);
        this.setBackgroundColor("#333333");
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        attributes.fill = "none";
        if (this.svgNodes !== null) {
            this.svgNodes.attr({fill: this.bgColor.hash(), stroke: "none"});
        }
        this._super(attributes);
    }, applyTransformation: function() {
        if (this.isResizeable() === true) {
            this.svgNodes.transform("S" + this.scaleX + "," + this.scaleY + "," + this.getAbsoluteX() + "," + this.getAbsoluteY() + "t" + (this.getAbsoluteX() - this.offsetX) + "," + (this.getAbsoluteY() - this.offsetY));
        } else {
            this.svgNodes.transform("T" + (this.getAbsoluteX() - this.offsetX) + "," + (this.getAbsoluteY() - this.offsetY));
        }
    }, createShapeElement: function() {
        var shape = this._super();
        var bb = this.svgNodes.getBBox();
        this.offsetX = bb.x;
        this.offsetY = bb.y;
        return shape;
    }, setDimension: function(w, h) {
        if (w > h) {
            this._super(w, w);
        } else {
            this._super(h, h);
        }
    }});
draw2d.shape.icon.Thunder = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Thunder", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.371,7.306c-0.092-3.924-3.301-7.077-7.248-7.079c-2.638,0.001-4.942,1.412-6.208,3.517c-0.595-0.327-1.28-0.517-2.01-0.517C7.626,3.229,5.772,5.033,5.689,7.293c-2.393,0.786-4.125,3.025-4.127,5.686c0,3.312,2.687,6,6,6v-0.002h5.271l-2.166,3.398l1.977-0.411L10,30.875l9.138-10.102L17,21l2.167-2.023h4.269c3.312,0,6-2.688,6-6C29.434,10.34,27.732,8.11,25.371,7.306zM23.436,16.979H7.561c-2.209-0.006-3.997-1.792-4.001-4.001c-0.002-1.982,1.45-3.618,3.35-3.931c0.265-0.043,0.502-0.191,0.657-0.414C7.722,8.41,7.779,8.136,7.73,7.87C7.702,7.722,7.685,7.582,7.685,7.446C7.689,6.221,8.68,5.23,9.905,5.228c0.647,0,1.217,0.278,1.633,0.731c0.233,0.257,0.587,0.375,0.927,0.309c0.342-0.066,0.626-0.307,0.748-0.63c0.749-1.992,2.662-3.412,4.911-3.41c2.899,0.004,5.244,2.35,5.251,5.249c0,0.161-0.009,0.326-0.027,0.497c-0.049,0.517,0.305,0.984,0.815,1.079c1.86,0.344,3.274,1.966,3.271,3.923C27.43,15.186,25.645,16.973,23.436,16.979z");
    }});
draw2d.shape.icon.Snow = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Snow", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.372,6.912c-0.093-3.925-3.302-7.078-7.248-7.08c-2.638,0.002-4.942,1.412-6.208,3.518c-0.595-0.327-1.28-0.518-2.01-0.518C7.627,2.834,5.773,4.639,5.69,6.898c-2.393,0.786-4.125,3.025-4.127,5.686c0,3.312,2.687,6,6,6v-0.002h15.875c3.312,0,6-2.688,6-6C29.434,9.944,27.732,7.715,25.372,6.912zM23.436,16.584H7.562c-2.209-0.006-3.997-1.793-4.001-4c-0.002-1.983,1.45-3.619,3.35-3.933c0.265-0.043,0.502-0.19,0.657-0.414C7.723,8.015,7.78,7.74,7.731,7.475C7.703,7.326,7.686,7.187,7.686,7.051c0.004-1.225,0.995-2.217,2.22-2.219c0.647,0,1.217,0.278,1.633,0.731c0.233,0.257,0.587,0.375,0.927,0.31c0.342-0.066,0.626-0.308,0.748-0.631c0.749-1.992,2.662-3.412,4.911-3.41c2.898,0.004,5.244,2.351,5.251,5.25c0,0.16-0.009,0.325-0.026,0.496c-0.05,0.518,0.305,0.984,0.814,1.079c1.859,0.345,3.273,1.966,3.271,3.923C27.43,14.791,25.645,16.578,23.436,16.584zM16.667,24.09l1.119-1.119c0.389-0.391,0.389-1.025,0-1.416c-0.392-0.391-1.025-0.391-1.415,0l-1.119,1.119l-1.119-1.119c-0.391-0.391-1.025-0.391-1.415,0c-0.391,0.391-0.391,1.025,0,1.416l1.118,1.117l-1.12,1.121c-0.389,0.393-0.389,1.021,0,1.414c0.195,0.188,0.451,0.293,0.707,0.293c0.256,0,0.512-0.104,0.708-0.293l1.12-1.119l1.12,1.119c0.195,0.188,0.451,0.293,0.708,0.293c0.256,0,0.512-0.104,0.707-0.293c0.391-0.396,0.391-1.021,0-1.414L16.667,24.09zM25.119,21.817c-0.393-0.392-1.025-0.392-1.415,0l-1.12,1.121l-1.12-1.121c-0.391-0.392-1.022-0.392-1.414,0c-0.39,0.392-0.39,1.022,0,1.416l1.119,1.119l-1.119,1.119c-0.39,0.391-0.39,1.022,0,1.413c0.195,0.195,0.451,0.294,0.707,0.294c0.257,0,0.513-0.099,0.707-0.294l1.12-1.118l1.12,1.118c0.194,0.195,0.45,0.294,0.707,0.294c0.256,0,0.513-0.099,0.708-0.294c0.389-0.391,0.389-1.022,0-1.413l-1.12-1.119l1.12-1.119C25.507,22.842,25.507,22.209,25.119,21.817zM9.334,23.953l1.119-1.119c0.389-0.394,0.389-1.021,0-1.414c-0.391-0.394-1.025-0.394-1.415,0l-1.119,1.119l-1.12-1.121c-0.391-0.39-1.023-0.39-1.415,0c-0.391,0.396-0.391,1.024,0,1.418l1.119,1.117l-1.12,1.118c-0.391,0.394-0.391,1.025,0,1.414c0.196,0.195,0.452,0.293,0.708,0.293c0.256,0,0.511-0.098,0.707-0.293l1.12-1.119l1.121,1.121c0.195,0.195,0.451,0.293,0.707,0.293s0.513-0.098,0.708-0.293c0.389-0.391,0.389-1.022,0-1.416L9.334,23.953z");
    }});
draw2d.shape.icon.Hail = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Hail", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.372,6.912c-0.093-3.925-3.302-7.078-7.248-7.08c-2.638,0.002-4.942,1.412-6.208,3.518c-0.595-0.327-1.28-0.518-2.01-0.518C7.627,2.834,5.773,4.639,5.69,6.898c-2.393,0.786-4.125,3.025-4.127,5.686c0,3.312,2.687,6,6,6v-0.002h15.875c3.312,0,6-2.688,6-6C29.434,9.944,27.732,7.715,25.372,6.912zM23.436,16.584H7.562c-2.209-0.006-3.997-1.793-4.001-4c-0.002-1.983,1.45-3.619,3.35-3.933c0.265-0.043,0.502-0.19,0.657-0.414C7.723,8.015,7.78,7.74,7.731,7.475C7.703,7.326,7.686,7.187,7.686,7.051c0.004-1.225,0.995-2.217,2.22-2.219c0.647,0,1.217,0.278,1.633,0.731c0.233,0.257,0.587,0.375,0.927,0.31c0.342-0.066,0.626-0.308,0.748-0.631c0.749-1.992,2.662-3.412,4.911-3.41c2.898,0.004,5.244,2.351,5.251,5.25c0,0.16-0.009,0.325-0.026,0.496c-0.05,0.518,0.305,0.984,0.814,1.079c1.859,0.345,3.273,1.966,3.271,3.923C27.43,14.791,25.645,16.578,23.436,16.584zM11.503,23.709c-0.784-0.002-1.418-0.636-1.418-1.416c0-0.785,0.634-1.416,1.418-1.418c0.78,0.002,1.413,0.633,1.416,1.418C12.917,23.073,12.284,23.707,11.503,23.709zM19.002,23.709c-0.783-0.002-1.418-0.636-1.418-1.416c0-0.785,0.635-1.416,1.418-1.418c0.779,0.002,1.414,0.633,1.414,1.418C20.417,23.073,19.784,23.707,19.002,23.709zM7.503,28.771c-0.783-0.002-1.417-0.637-1.417-1.418s0.634-1.414,1.417-1.416c0.78,0.002,1.415,0.635,1.415,1.416C8.917,28.135,8.284,28.77,7.503,28.771zM15.001,28.771c-0.782-0.002-1.417-0.637-1.417-1.418s0.634-1.414,1.417-1.416c0.78,0.002,1.413,0.635,1.415,1.416C16.415,28.135,15.784,28.77,15.001,28.771zM22.5,28.771c-0.782-0.002-1.416-0.634-1.416-1.416c0-0.785,0.634-1.418,1.416-1.42c0.781,0.002,1.414,0.635,1.418,1.42C23.915,28.138,23.282,28.77,22.5,28.771z");
    }});
draw2d.shape.icon.Rain = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Rain", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.371,7.306c-0.092-3.924-3.301-7.077-7.248-7.079c-2.638,0.001-4.942,1.412-6.208,3.517c-0.595-0.327-1.28-0.517-2.01-0.517C7.626,3.229,5.772,5.033,5.689,7.293c-2.393,0.786-4.125,3.025-4.127,5.686c0,3.312,2.687,6,6,6v-0.002h15.874c3.312,0,6-2.688,6-6C29.434,10.34,27.732,8.11,25.371,7.306zM23.436,16.979H7.561c-2.209-0.006-3.997-1.792-4.001-4.001c-0.002-1.982,1.45-3.618,3.35-3.931c0.265-0.043,0.502-0.191,0.657-0.414C7.722,8.41,7.779,8.136,7.73,7.87C7.702,7.722,7.685,7.582,7.685,7.446C7.689,6.221,8.68,5.23,9.905,5.228c0.647,0,1.217,0.278,1.633,0.731c0.233,0.257,0.587,0.375,0.927,0.309c0.342-0.066,0.626-0.307,0.748-0.63c0.749-1.992,2.662-3.412,4.911-3.41c2.899,0.004,5.244,2.35,5.251,5.249c0,0.161-0.009,0.326-0.027,0.497c-0.049,0.517,0.305,0.984,0.815,1.079c1.86,0.344,3.274,1.966,3.271,3.923C27.43,15.186,25.645,16.973,23.436,16.979zM9.029,26.682c0-1.115,0.021-5.425,0.021-5.432c0.002-0.409-0.247-0.779-0.628-0.932c-0.38-0.152-0.815-0.059-1.099,0.24c-0.006,0.008-1.037,1.098-2.081,2.342c-0.523,0.627-1.048,1.287-1.463,1.896c-0.399,0.648-0.753,1.066-0.811,1.885C2.971,28.355,4.324,29.711,6,29.714C7.672,29.71,9.029,28.354,9.029,26.682zM4.971,26.727c0.091-0.349,1.081-1.719,1.993-2.764c0.025-0.029,0.051-0.061,0.076-0.089c-0.005,1.124-0.01,2.294-0.01,2.808c0,0.567-0.461,1.028-1.029,1.03C5.447,27.71,4.997,27.273,4.971,26.727zM16.425,26.682c0-1.115,0.021-5.424,0.021-5.43c0.002-0.41-0.247-0.779-0.628-0.934c-0.381-0.152-0.814-0.058-1.1,0.242c-0.006,0.008-1.035,1.094-2.08,2.342c-0.522,0.623-1.047,1.285-1.463,1.894c-0.399,0.649-0.753,1.068-0.809,1.888c0,1.672,1.354,3.028,3.029,3.028C15.068,29.711,16.425,28.354,16.425,26.682zM12.365,26.729c0.092-0.349,1.081-1.72,1.993-2.765c0.025-0.03,0.05-0.06,0.075-0.089c-0.005,1.123-0.011,2.294-0.011,2.807c-0.002,0.568-0.461,1.027-1.028,1.029C12.84,27.709,12.392,27.273,12.365,26.729zM23.271,20.317c-0.38-0.153-0.816-0.06-1.099,0.24c-0.009,0.008-1.037,1.097-2.08,2.342c-0.523,0.625-1.049,1.285-1.462,1.896c-0.402,0.649-0.754,1.067-0.812,1.886c0,1.672,1.354,3.029,3.03,3.029c1.673,0,3.027-1.357,3.027-3.029c0-1.115,0.022-5.425,0.022-5.431C23.9,20.84,23.651,20.47,23.271,20.317zM21.879,26.681c-0.004,0.568-0.463,1.027-1.031,1.029c-0.553-0.002-1.002-0.438-1.028-0.982c0.092-0.349,1.081-1.72,1.993-2.765c0.025-0.028,0.05-0.059,0.074-0.088C21.883,24.998,21.879,26.167,21.879,26.681z");
    }});
draw2d.shape.icon.Cloudy = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Cloudy", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.378,6.781c0.41,0.988,1.938,0.346,1.524-0.648C15.708,5.667,15.515,5.2,15.32,4.734c-0.289-0.695-0.875-3.233-2.042-2.747c-1.03,0.433-0.128,1.846,0.142,2.494C13.739,5.248,14.059,6.015,14.378,6.781M20.8,7.223c1.094,0.453,1.538-1.551,1.813-2.216c0.281-0.677,1.478-2.565,0.357-3.029c-1.092-0.453-1.537,1.548-1.813,2.216C20.876,4.872,19.68,6.757,20.8,7.223M18.137,6.692c1.183,0,0.829-2.019,0.829-2.742c0-0.732,0.383-2.935-0.829-2.935c-1.183,0-0.828,2.019-0.828,2.742C17.309,4.49,16.926,6.692,18.137,6.692M23.058,8.729c0.852,0.85,2.142-0.972,2.659-1.49c0.512-0.513,2.187-1.687,1.352-2.524c-0.834-0.836-2.013,0.843-2.522,1.353C24.028,6.585,22.198,7.874,23.058,8.729M24.565,10.986c0.448,1.091,2.183-0.01,2.849-0.286c0.676-0.28,2.858-0.771,2.394-1.89c-0.455-1.091-2.181,0.008-2.849,0.285C26.281,9.377,24.102,9.866,24.565,10.986M12.036,8.742c0.752,0.75,1.932-0.415,1.17-1.173c-0.253-0.347-0.646-0.645-0.949-0.946c-0.541-0.539-2.162-2.799-3.068-1.889c-0.79,0.791,0.586,1.755,1.083,2.25C10.859,7.57,11.447,8.156,12.036,8.742M29.365,17.397c-0.768-0.317-1.534-0.635-2.302-0.952c-0.646-0.268-2.07-1.169-2.495-0.135c-0.481,1.168,2.054,1.747,2.751,2.035c0.455,0.188,0.911,0.377,1.367,0.565C29.7,19.331,30.379,17.816,29.365,17.397M29.942,12.817c-0.83,0-1.66,0-2.49,0c-0.701,0-2.357-0.288-2.355,0.83c0,1.262,2.567,0.827,3.319,0.827c0.493,0,0.986,0,1.479-0.001C30.99,14.473,31.043,12.815,29.942,12.817M24.234,18.568c-0.673-0.673-1.773,0.189-1.281,1.007c-0.295-0.264-0.614-0.499-0.961-0.69c3.894-2.866,3.328-9.006-1.021-11.107c-2.024-0.978-4.481-0.828-6.368,0.394c-0.871,0.564-1.603,1.336-2.119,2.236c-0.262,0.456-0.468,0.943-0.612,1.449c-0.074,0.258-0.131,0.521-0.172,0.786c-0.083,0.534-0.109,0.553-0.553,0.871c-0.182-0.957-1.64-0.675-2.326-0.674c-0.815,0.001-1.963-0.217-2.752,0.046c-0.867,0.289-0.652,1.615,0.263,1.613c0.324,0.052,0.701-0.001,1.028-0.001c0.904-0.001,1.809-0.002,2.713-0.003c-0.308,0.352-0.496,0.969-0.94,0.77c-0.467-0.209-0.978-0.319-1.49-0.319c-0.951,0-1.877,0.375-2.561,1.036c-0.681,0.658-1.088,1.569-1.123,2.516c-0.944,0.31-1.791,0.891-2.421,1.658c-2.756,3.354-0.265,8.554,4.058,8.554v-0.002c3.597,0,7.194,0,10.792,0c1.341,0,2.843,0.167,4.168-0.113c3.652-0.772,5.361-5.21,3.133-8.229c0.548,0.547,1.096,1.094,1.644,1.641c0.183,0.183,0.364,0.424,0.575,0.574c0.552,0.552,1.524,0.066,1.403-0.713c-0.097-0.622-1.042-1.267-1.448-1.673C25.319,19.652,24.776,19.11,24.234,18.568M18.137,8.787c4.559,0.009,6.576,5.979,2.912,8.734c-0.637-3.505-4.161-5.824-7.629-5.03C13.943,10.367,15.852,8.792,18.137,8.787M22.895,24.08c-0.633,3.346-4.149,2.879-6.68,2.879c-3.017,0-6.033,0-9.049,0c-0.767,0-1.62,0.084-2.373-0.095c-2.274-0.538-3.416-3.242-2.172-5.235c0.678-1.087,1.568-1.19,2.626-1.67c0.604-0.273,0.456-0.807,0.456-1.331c0.002-0.597,0.284-1.169,0.756-1.533c0.787-0.608,1.943-0.497,2.611,0.234c1.098,1.205,1.96-1.346,2.507-1.893c2.025-2.025,5.475-1.708,7.068,0.684c0.344,0.516,0.581,1.102,0.693,1.712c0.097,0.529-0.115,1.341,0.188,1.796c0.291,0.47,0.943,0.463,1.397,0.68c0.508,0.23,0.963,0.591,1.304,1.034C22.834,22.125,23.064,23.107,22.895,24.08M6.906,9.917c0.881,0.364,1.763,0.727,2.644,1.091c0.353,0.146,0.707,0.292,1.06,0.437c0.997,0.412,1.637-1.119,0.642-1.526C10.47,9.441,9.456,9.177,8.609,8.828c-0.354-0.146-0.707-0.292-1.06-0.437C6.554,7.98,5.912,9.505,6.906,9.917");
    }});
draw2d.shape.icon.Sun = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Sun", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.502,7.504c-4.35,0-7.873,3.523-7.873,7.873c0,4.347,3.523,7.872,7.873,7.872c4.346,0,7.871-3.525,7.871-7.872C23.374,11.027,19.85,7.504,15.502,7.504zM15.502,21.25c-3.244-0.008-5.866-2.63-5.874-5.872c0.007-3.243,2.63-5.866,5.874-5.874c3.242,0.008,5.864,2.631,5.871,5.874C21.366,18.62,18.744,21.242,15.502,21.25zM15.502,6.977c0.553,0,1-0.448,1-1.001V1.125c-0.002-0.553-0.448-1-1-1c-0.553,0-1.001,0.449-1,1.002v4.85C14.502,6.528,14.949,6.977,15.502,6.977zM18.715,7.615c0.125,0.053,0.255,0.076,0.382,0.077c0.394,0,0.765-0.233,0.925-0.618l1.856-4.483c0.21-0.511-0.031-1.095-0.541-1.306c-0.511-0.211-1.096,0.031-1.308,0.541L18.174,6.31C17.963,6.82,18.205,7.405,18.715,7.615zM21.44,9.436c0.195,0.194,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l3.43-3.433c0.391-0.39,0.39-1.023,0-1.415c-0.392-0.39-1.025-0.39-1.415,0.002L21.44,8.021C21.049,8.412,21.049,9.045,21.44,9.436zM23.263,12.16c0.158,0.385,0.531,0.617,0.923,0.617c0.127,0,0.257-0.025,0.383-0.078l4.48-1.857c0.511-0.211,0.753-0.797,0.541-1.307s-0.796-0.752-1.307-0.54l-4.481,1.857C23.292,11.064,23.051,11.65,23.263,12.16zM29.752,14.371l-4.851,0.001c-0.552,0-1,0.448-0.998,1.001c0,0.553,0.447,0.999,0.998,0.999l4.852-0.002c0.553,0,0.999-0.449,0.999-1C30.752,14.817,30.304,14.369,29.752,14.371zM29.054,19.899l-4.482-1.854c-0.512-0.212-1.097,0.03-1.307,0.541c-0.211,0.511,0.031,1.096,0.541,1.308l4.482,1.854c0.126,0.051,0.256,0.075,0.383,0.075c0.393,0,0.765-0.232,0.925-0.617C29.806,20.695,29.563,20.109,29.054,19.899zM22.86,21.312c-0.391-0.391-1.023-0.391-1.414,0.001c-0.391,0.39-0.39,1.022,0,1.413l3.434,3.429c0.195,0.195,0.45,0.293,0.706,0.293s0.513-0.098,0.708-0.293c0.391-0.392,0.389-1.025,0-1.415L22.86,21.312zM20.029,23.675c-0.211-0.511-0.796-0.752-1.307-0.541c-0.51,0.212-0.752,0.797-0.54,1.308l1.86,4.48c0.159,0.385,0.531,0.617,0.925,0.617c0.128,0,0.258-0.024,0.383-0.076c0.511-0.211,0.752-0.797,0.54-1.309L20.029,23.675zM15.512,23.778c-0.553,0-1,0.448-1,1l0.004,4.851c0,0.553,0.449,0.999,1,0.999c0.553,0,1-0.448,0.998-1l-0.003-4.852C16.511,24.226,16.062,23.777,15.512,23.778zM12.296,23.142c-0.51-0.21-1.094,0.031-1.306,0.543l-1.852,4.483c-0.21,0.511,0.033,1.096,0.543,1.307c0.125,0.052,0.254,0.076,0.382,0.076c0.392,0,0.765-0.234,0.924-0.619l1.853-4.485C13.051,23.937,12.807,23.353,12.296,23.142zM9.57,21.325c-0.392-0.391-1.025-0.389-1.415,0.002L4.729,24.76c-0.391,0.392-0.389,1.023,0.002,1.415c0.195,0.194,0.45,0.292,0.706,0.292c0.257,0,0.513-0.098,0.708-0.293l3.427-3.434C9.961,22.349,9.961,21.716,9.57,21.325zM7.746,18.604c-0.213-0.509-0.797-0.751-1.307-0.54L1.96,19.925c-0.511,0.212-0.752,0.798-0.54,1.308c0.16,0.385,0.531,0.616,0.924,0.616c0.127,0,0.258-0.024,0.383-0.076l4.479-1.861C7.715,19.698,7.957,19.113,7.746,18.604zM7.1,15.392c0-0.553-0.447-0.999-1-0.999l-4.851,0.006c-0.553,0-1.001,0.448-0.999,1.001c0.001,0.551,0.449,1,1,0.998l4.852-0.006C6.654,16.392,7.102,15.942,7.1,15.392zM1.944,10.869l4.485,1.85c0.125,0.053,0.254,0.076,0.381,0.076c0.393,0,0.766-0.232,0.925-0.618c0.212-0.511-0.032-1.097-0.544-1.306L2.708,9.021c-0.511-0.21-1.095,0.032-1.306,0.542C1.19,10.074,1.435,10.657,1.944,10.869zM8.137,9.451c0.195,0.193,0.449,0.291,0.705,0.291s0.513-0.098,0.709-0.295c0.391-0.389,0.389-1.023-0.004-1.414L6.113,4.609C5.723,4.219,5.088,4.221,4.699,4.612c-0.391,0.39-0.389,1.024,0.002,1.414L8.137,9.451zM10.964,7.084c0.16,0.384,0.532,0.615,0.923,0.615c0.128,0,0.258-0.025,0.384-0.077c0.51-0.212,0.753-0.798,0.54-1.307l-1.864-4.479c-0.212-0.51-0.798-0.751-1.308-0.539C9.129,1.51,8.888,2.096,9.1,2.605L10.964,7.084z");
    }});
draw2d.shape.icon.Undo = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Undo", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M12.981,9.073V6.817l-12.106,6.99l12.106,6.99v-2.422c3.285-0.002,9.052,0.28,9.052,2.269c0,2.78-6.023,4.263-6.023,4.263v2.132c0,0,13.53,0.463,13.53-9.823C29.54,9.134,17.952,8.831,12.981,9.073z");
    }});
draw2d.shape.icon.Detour = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Detour", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M29.342,15.5l-7.556-4.363v2.614H18.75c-1.441-0.004-2.423,1.002-2.875,1.784c-0.735,1.222-1.056,2.561-1.441,3.522c-0.135,0.361-0.278,0.655-0.376,0.817c-1.626,0-0.998,0-2.768,0c-0.213-0.398-0.571-1.557-0.923-2.692c-0.237-0.676-0.5-1.381-1.013-2.071C8.878,14.43,7.89,13.726,6.75,13.75H2.812v3.499c0,0,0.358,0,1.031,0h2.741c0.008,0.013,0.018,0.028,0.029,0.046c0.291,0.401,0.634,1.663,1.031,2.888c0.218,0.623,0.455,1.262,0.92,1.897c0.417,0.614,1.319,1.293,2.383,1.293H11c2.25,0,1.249,0,3.374,0c0.696,0.01,1.371-0.286,1.809-0.657c1.439-1.338,1.608-2.886,2.13-4.127c0.218-0.608,0.453-1.115,0.605-1.314c0.006-0.01,0.012-0.018,0.018-0.025h2.85v2.614L29.342,15.5zM10.173,14.539c0.568,0.76,0.874,1.559,1.137,2.311c0.04,0.128,0.082,0.264,0.125,0.399h2.58c0.246-0.697,0.553-1.479,1.005-2.228c0.252-0.438,0.621-0.887,1.08-1.272H9.43C9.735,14.003,9.99,14.277,10.173,14.539z");
    }});
draw2d.shape.icon.Merge = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Merge", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M29.342,15.5l-7.556-4.363v2.613h-1.411c-0.788-0.01-1.331-0.241-2.019-0.743c-1.021-0.745-2.094-2.181-3.551-3.568C13.367,8.06,11.291,6.73,8.5,6.749H2.812v3.5H8.5c2.231,0.012,3.441,1.185,5.07,2.934c0.697,0.753,1.428,1.58,2.324,2.323c-1.396,1.165-2.412,2.516-3.484,3.501c-1.183,1.081-2.202,1.723-3.912,1.741H2.813v3.5h5.716c3.752,0.001,6.035-2.319,7.619-4.066c0.817-0.895,1.537-1.691,2.209-2.191c0.686-0.502,1.23-0.732,2.017-0.742h1.412v2.614L29.342,15.5z");
    }});
draw2d.shape.icon.Split = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Split", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.786,20.698c-1.792-0.237-2.912-1.331-4.358-2.886c-0.697-0.751-1.428-1.577-2.324-2.319c1.396-1.165,2.411-2.519,3.483-3.503c1.01-0.92,1.901-1.519,3.199-1.688v2.574l7.556-4.363L21.786,4.15v2.652c-3.34,0.266-5.45,2.378-6.934,4.013c-0.819,0.896-1.537,1.692-2.212,2.192c-0.685,0.501-1.227,0.731-2.013,0.742c-0.001,0-0.002,0-0.003,0H2.812v3.5h0.001v0.001c0,0,0.046-0.001,0.136-0.001h7.677c0.786,0.011,1.33,0.241,2.017,0.743c1.021,0.743,2.095,2.181,3.552,3.568c1.312,1.258,3.162,2.46,5.592,2.649v2.664l7.556-4.36l-7.556-4.361V20.698z");
    }});
draw2d.shape.icon.Fork = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Fork", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M13.741,10.249h8.045v2.627l7.556-4.363l-7.556-4.363v2.598H9.826C11.369,7.612,12.616,8.922,13.741,10.249zM21.786,20.654c-0.618-0.195-1.407-0.703-2.291-1.587c-1.79-1.756-3.712-4.675-5.731-7.227c-2.049-2.486-4.159-4.972-7.451-5.091h-3.5v3.5h3.5c0.656-0.027,1.683,0.486,2.879,1.683c1.788,1.753,3.712,4.674,5.731,7.226c1.921,2.331,3.907,4.639,6.863,5.016v2.702l7.556-4.362l-7.556-4.362V20.654z");
    }});
draw2d.shape.icon.ForkAlt = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ForkAlt", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.786,12.873l7.556-4.361l-7.556-4.362v2.701c-2.929,0.374-4.905,2.64-6.809,4.952c0.545,0.703,1.08,1.418,1.604,2.127c0.192,0.26,0.383,0.514,0.573,0.77c0.802-1.043,1.584-1.999,2.341-2.74c0.884-0.885,1.673-1.393,2.291-1.588V12.873zM17.661,17.006c-1.893-2.371-3.815-5.354-6.009-7.537c-1.461-1.428-3.155-2.664-5.34-2.693h-3.5v3.5h3.5c0.971-0.119,2.845,1.333,4.712,3.771c1.895,2.371,3.815,5.354,6.011,7.537c1.326,1.297,2.847,2.426,4.751,2.645v2.646l7.556-4.363l-7.556-4.362v2.535C20.746,20.346,19.205,19.022,17.661,17.006z");
    }});
draw2d.shape.icon.Exchange = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Exchange", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.786,12.876l7.556-4.363l-7.556-4.363v2.598H2.813v3.5h18.973V12.876zM10.368,18.124l-7.556,4.362l7.556,4.362V24.25h18.974v-3.501H10.368V18.124z");
    }});
draw2d.shape.icon.Shuffle = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Shuffle", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.786,20.654c-0.618-0.195-1.407-0.703-2.291-1.587c-0.757-0.742-1.539-1.698-2.34-2.741c-0.191,0.256-0.382,0.51-0.574,0.77c-0.524,0.709-1.059,1.424-1.604,2.127c1.904,2.31,3.88,4.578,6.809,4.952v2.701l7.556-4.362l-7.556-4.362V20.654zM9.192,11.933c0.756,0.741,1.538,1.697,2.339,2.739c0.195-0.262,0.39-0.521,0.587-0.788c0.52-0.703,1.051-1.412,1.592-2.11c-2.032-2.463-4.133-4.907-7.396-5.025h-3.5v3.5h3.5C6.969,10.223,7.996,10.735,9.192,11.933zM21.786,10.341v2.535l7.556-4.363l-7.556-4.363v2.647c-1.904,0.219-3.425,1.348-4.751,2.644c-2.196,2.183-4.116,5.167-6.011,7.538c-1.867,2.438-3.741,3.888-4.712,3.771h-3.5v3.5h3.5c2.185-0.029,3.879-1.266,5.34-2.693c2.194-2.184,4.116-5.167,6.009-7.538C19.205,12.003,20.746,10.679,21.786,10.341z");
    }});
draw2d.shape.icon.Refresh = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Refresh", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.083,15.5c-0.009,4.739-3.844,8.574-8.583,8.583c-4.741-0.009-8.577-3.844-8.585-8.583c0.008-4.741,3.844-8.577,8.585-8.585c1.913,0,3.665,0.629,5.09,1.686l-1.782,1.783l8.429,2.256l-2.26-8.427l-1.89,1.89c-2.072-1.677-4.717-2.688-7.587-2.688C8.826,3.418,3.418,8.826,3.416,15.5C3.418,22.175,8.826,27.583,15.5,27.583S27.583,22.175,27.583,15.5H24.083z");
    }});
draw2d.shape.icon.Ccw = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Ccw", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.249,15.499c-0.009,4.832-3.918,8.741-8.75,8.75c-2.515,0-4.768-1.064-6.365-2.763l2.068-1.442l-7.901-3.703l0.744,8.694l2.193-1.529c2.244,2.594,5.562,4.242,9.26,4.242c6.767,0,12.249-5.482,12.249-12.249H24.249zM15.499,6.75c2.516,0,4.769,1.065,6.367,2.764l-2.068,1.443l7.901,3.701l-0.746-8.693l-2.192,1.529c-2.245-2.594-5.562-4.245-9.262-4.245C8.734,3.25,3.25,8.734,3.249,15.499H6.75C6.758,10.668,10.668,6.758,15.499,6.75z");
    }});
draw2d.shape.icon.Acw = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Acw", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M19.275,3.849l1.695,8.56l1.875-1.642c2.311,3.59,1.72,8.415-1.584,11.317c-2.24,1.96-5.186,2.57-7.875,1.908l-0.84,3.396c3.75,0.931,7.891,0.066,11.02-2.672c4.768-4.173,5.521-11.219,1.94-16.279l2.028-1.775L19.275,3.849zM8.154,20.232c-2.312-3.589-1.721-8.416,1.582-11.317c2.239-1.959,5.186-2.572,7.875-1.909l0.842-3.398c-3.752-0.93-7.893-0.067-11.022,2.672c-4.765,4.174-5.519,11.223-1.939,16.283l-2.026,1.772l8.26,2.812l-1.693-8.559L8.154,20.232z");
    }});
draw2d.shape.icon.Contract = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Contract", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.083,18.895l-8.428-2.259l2.258,8.428l1.838-1.837l7.053,7.053l2.476-2.476l-7.053-7.053L25.083,18.895zM5.542,11.731l8.428,2.258l-2.258-8.428L9.874,7.398L3.196,0.72L0.72,3.196l6.678,6.678L5.542,11.731zM7.589,20.935l-6.87,6.869l2.476,2.476l6.869-6.869l1.858,1.857l2.258-8.428l-8.428,2.258L7.589,20.935zM23.412,10.064l6.867-6.87l-2.476-2.476l-6.868,6.869l-1.856-1.856l-2.258,8.428l8.428-2.259L23.412,10.064z");
    }});
draw2d.shape.icon.Expand = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Expand", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.545,23.328,17.918,15.623,25.534,8.007,27.391,9.864,29.649,1.436,21.222,3.694,23.058,5.53,15.455,13.134,7.942,5.543,9.809,3.696,1.393,1.394,3.608,9.833,5.456,8.005,12.98,15.608,5.465,23.123,3.609,21.268,1.351,29.695,9.779,27.438,7.941,25.6,15.443,18.098,23.057,25.791,21.19,27.638,29.606,29.939,27.393,21.5z");
    }});
draw2d.shape.icon.Stop = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Stop", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M5.5,5.5h20v20h-20z");
    }});
draw2d.shape.icon.End = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.End", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.167,5.5,21.167,13.681,6.684,5.318,6.684,25.682,21.167,17.318,21.167,25.5,25.5,25.5,25.5,5.5z");
    }});
draw2d.shape.icon.Start = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Start", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.316,5.318,9.833,13.682,9.833,5.5,5.5,5.5,5.5,25.5,9.833,25.5,9.833,17.318,24.316,25.682z");
    }});
draw2d.shape.icon.Ff = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Ff", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.5,15.5,15.2,9.552,15.2,15.153,5.5,9.552,5.5,21.447,15.2,15.847,15.2,21.447z");
    }});
draw2d.shape.icon.Rw = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Rw", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M5.5,15.499,15.8,21.447,15.8,15.846,25.5,21.447,25.5,9.552,15.8,15.152,15.8,9.552z");
    }});
draw2d.shape.icon.ArrowRight = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ArrowRight", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M6.684,25.682L24.316,15.5L6.684,5.318V25.682z");
    }});
draw2d.shape.icon.ArrowLeft = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ArrowLeft", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.316,5.318L6.684,15.5l17.632,10.182V5.318L24.316,5.318z");
    }});
draw2d.shape.icon.ArrowUp = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ArrowUp", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.682,24.316L15.5,6.684L5.318,24.316H25.682z");
    }});
draw2d.shape.icon.ArrowDown = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ArrowDown", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M5.318,6.684L15.5,24.316L25.682,6.684H5.318z");
    }});
draw2d.shape.icon.ArrowLeft2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ArrowLeft2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z");
    }});
draw2d.shape.icon.ArrowRight2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ArrowRight2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M10.129,22.186 16.316,15.999 10.129,9.812 13.665,6.276 23.389,15.999 13.665,25.725z");
    }});
draw2d.shape.icon.Smile2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Smile2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM16,29.534C8.539,29.534,2.466,23.462,2.466,16C2.466,8.539,8.539,2.466,16,2.466c7.462,0,13.535,6.072,13.535,13.533C29.534,23.462,23.462,29.534,16,29.534zM11.104,14c0.932,0,1.688-1.483,1.688-3.312s-0.755-3.312-1.688-3.312s-1.688,1.483-1.688,3.312S10.172,14,11.104,14zM20.729,14c0.934,0,1.688-1.483,1.688-3.312s-0.756-3.312-1.688-3.312c-0.932,0-1.688,1.483-1.688,3.312S19.798,14,20.729,14zM8.143,21.189C10.458,24.243,13.148,26,16.021,26c2.969,0,5.745-1.868,8.11-5.109c-2.515,1.754-5.292,2.734-8.215,2.734C13.164,23.625,10.54,22.756,8.143,21.189z");
    }});
draw2d.shape.icon.Smile = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Smile", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM20.729,7.375c0.934,0,1.688,1.483,1.688,3.312S21.661,14,20.729,14c-0.932,0-1.688-1.483-1.688-3.312S19.798,7.375,20.729,7.375zM11.104,7.375c0.932,0,1.688,1.483,1.688,3.312S12.037,14,11.104,14s-1.688-1.483-1.688-3.312S10.172,7.375,11.104,7.375zM16.021,26c-2.873,0-5.563-1.757-7.879-4.811c2.397,1.564,5.021,2.436,7.774,2.436c2.923,0,5.701-0.98,8.215-2.734C21.766,24.132,18.99,26,16.021,26z");
    }});
draw2d.shape.icon.Alarm = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Alarm", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M8.179,20.115c-0.478,0.277-0.642,0.889-0.365,1.366c0.275,0.479,0.889,0.642,1.365,0.366c0.479-0.275,0.643-0.888,0.367-1.367C9.27,20.004,8.658,19.84,8.179,20.115zM9.18,12.239c-0.479-0.276-1.09-0.112-1.366,0.366s-0.111,1.09,0.365,1.366c0.479,0.276,1.09,0.113,1.367-0.366C9.821,13.126,9.657,12.516,9.18,12.239zM8.625,17.043c-0.001-0.552-0.448-0.999-1.001-1c-0.553,0-1,0.448-1,1c0,0.553,0.449,1,1,1C8.176,18.043,8.624,17.596,8.625,17.043zM16.312,3.957V3.031h1c0.275,0,0.5-0.225,0.5-0.5v-0.5c0-0.275-0.225-0.5-0.5-0.5h-3.625c-0.275,0-0.5,0.225-0.5,0.5v0.5c0,0.275,0.225,0.5,0.5,0.5h1v0.926C7.819,4.381,2.376,10.068,2.374,17.042C2.376,24.291,8.251,30.166,15.5,30.169c7.249-0.003,13.124-5.878,13.125-13.127C28.624,10.067,23.181,4.38,16.312,3.957zM15.5,27.166C9.909,27.157,5.385,22.633,5.375,17.042C5.385,11.451,9.909,6.927,15.5,6.917c5.59,0.01,10.115,4.535,10.124,10.125C25.615,22.633,21.091,27.157,15.5,27.166zM12.062,22.998c-0.478-0.275-1.089-0.111-1.366,0.367c-0.275,0.479-0.111,1.09,0.366,1.365c0.478,0.277,1.091,0.111,1.365-0.365C12.704,23.887,12.54,23.275,12.062,22.998zM12.062,11.088c0.479-0.276,0.642-0.888,0.366-1.366c-0.276-0.478-0.888-0.642-1.366-0.366s-0.642,0.888-0.366,1.366C10.973,11.2,11.584,11.364,12.062,11.088zM22.822,13.971c0.478-0.275,0.643-0.888,0.366-1.366c-0.275-0.478-0.89-0.642-1.366-0.366c-0.479,0.278-0.642,0.89-0.366,1.367C21.732,14.083,22.344,14.247,22.822,13.971zM15.501,23.92c-0.552,0-1,0.447-1,1c0,0.552,0.448,1,1,1s1-0.448,1-1C16.501,24.367,16.053,23.92,15.501,23.92zM19.938,9.355c-0.477-0.276-1.091-0.111-1.365,0.366c-0.275,0.48-0.111,1.091,0.366,1.367s1.089,0.112,1.366-0.366C20.581,10.245,20.418,9.632,19.938,9.355zM23.378,16.042c-0.554,0.002-1.001,0.45-1.001,1c0.001,0.552,0.448,1,1.001,1c0.551,0,1-0.447,1-1C24.378,16.492,23.929,16.042,23.378,16.042zM22.823,20.115c-0.48-0.275-1.092-0.111-1.367,0.365c-0.275,0.479-0.112,1.091,0.367,1.367c0.477,0.275,1.089,0.112,1.365-0.366C23.464,21.004,23.3,20.391,22.823,20.115zM15.501,8.167c-0.552,0-1,0.448-1,1l-0.466,7.343l-3.004,1.96c-0.478,0.277-0.642,0.889-0.365,1.366c0.275,0.479,0.889,0.642,1.365,0.366l3.305-1.676c0.055,0.006,0.109,0.017,0.166,0.017c0.828,0,1.5-0.672,1.5-1.5l-0.5-7.876C16.501,8.614,16.053,8.167,15.501,8.167zM18.939,22.998c-0.479,0.276-0.643,0.888-0.366,1.367c0.275,0.477,0.888,0.642,1.366,0.365c0.478-0.276,0.642-0.889,0.366-1.365C20.028,22.886,19.417,22.723,18.939,22.998zM11.197,3.593c-0.836-1.04-2.103-1.718-3.541-1.718c-2.52,0-4.562,2.042-4.562,4.562c0,0.957,0.297,1.843,0.8,2.576C5.649,6.484,8.206,4.553,11.197,3.593zM27.106,9.014c0.503-0.733,0.8-1.619,0.8-2.576c0-2.52-2.043-4.562-4.562-4.562c-1.438,0-2.704,0.678-3.541,1.717C22.794,4.553,25.351,6.484,27.106,9.014z");
    }});
draw2d.shape.icon.Clock = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Clock", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.5,2.374C8.251,2.375,2.376,8.251,2.374,15.5C2.376,22.748,8.251,28.623,15.5,28.627c7.249-0.004,13.124-5.879,13.125-13.127C28.624,8.251,22.749,2.375,15.5,2.374zM15.5,25.623C9.909,25.615,5.385,21.09,5.375,15.5C5.385,9.909,9.909,5.384,15.5,5.374c5.59,0.01,10.115,4.535,10.124,10.125C25.615,21.09,21.091,25.615,15.5,25.623zM8.625,15.5c-0.001-0.552-0.448-0.999-1.001-1c-0.553,0-1,0.448-1,1c0,0.553,0.449,1,1,1C8.176,16.5,8.624,16.053,8.625,15.5zM8.179,18.572c-0.478,0.277-0.642,0.889-0.365,1.367c0.275,0.479,0.889,0.641,1.365,0.365c0.479-0.275,0.643-0.887,0.367-1.367C9.27,18.461,8.658,18.297,8.179,18.572zM9.18,10.696c-0.479-0.276-1.09-0.112-1.366,0.366s-0.111,1.09,0.365,1.366c0.479,0.276,1.09,0.113,1.367-0.366C9.821,11.584,9.657,10.973,9.18,10.696zM22.822,12.428c0.478-0.275,0.643-0.888,0.366-1.366c-0.275-0.478-0.89-0.642-1.366-0.366c-0.479,0.278-0.642,0.89-0.366,1.367C21.732,12.54,22.344,12.705,22.822,12.428zM12.062,21.455c-0.478-0.275-1.089-0.111-1.366,0.367c-0.275,0.479-0.111,1.09,0.366,1.365c0.478,0.277,1.091,0.111,1.365-0.365C12.704,22.344,12.54,21.732,12.062,21.455zM12.062,9.545c0.479-0.276,0.642-0.888,0.366-1.366c-0.276-0.478-0.888-0.642-1.366-0.366s-0.642,0.888-0.366,1.366C10.973,9.658,11.584,9.822,12.062,9.545zM22.823,18.572c-0.48-0.275-1.092-0.111-1.367,0.365c-0.275,0.479-0.112,1.092,0.367,1.367c0.477,0.275,1.089,0.113,1.365-0.365C23.464,19.461,23.3,18.848,22.823,18.572zM19.938,7.813c-0.477-0.276-1.091-0.111-1.365,0.366c-0.275,0.48-0.111,1.091,0.366,1.367s1.089,0.112,1.366-0.366C20.581,8.702,20.418,8.089,19.938,7.813zM23.378,14.5c-0.554,0.002-1.001,0.45-1.001,1c0.001,0.552,0.448,1,1.001,1c0.551,0,1-0.447,1-1C24.378,14.949,23.929,14.5,23.378,14.5zM15.501,6.624c-0.552,0-1,0.448-1,1l-0.466,7.343l-3.004,1.96c-0.478,0.277-0.642,0.889-0.365,1.365c0.275,0.479,0.889,0.643,1.365,0.367l3.305-1.676C15.39,16.99,15.444,17,15.501,17c0.828,0,1.5-0.671,1.5-1.5l-0.5-7.876C16.501,7.072,16.053,6.624,15.501,6.624zM15.501,22.377c-0.552,0-1,0.447-1,1s0.448,1,1,1s1-0.447,1-1S16.053,22.377,15.501,22.377zM18.939,21.455c-0.479,0.277-0.643,0.889-0.366,1.367c0.275,0.477,0.888,0.643,1.366,0.365c0.478-0.275,0.642-0.889,0.366-1.365C20.028,21.344,19.417,21.18,18.939,21.455z");
    }});
draw2d.shape.icon.StopWatch = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.StopWatch", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.216,18.533c0-3.636-1.655-6.883-4.253-9.032l0.733-0.998l0.482,0.354c0.198,0.146,0.481,0.104,0.628-0.097l0.442-0.604c0.146-0.198,0.103-0.482-0.097-0.628l-2.052-1.506c-0.199-0.146-0.481-0.103-0.628,0.097L22.03,6.724c-0.146,0.199-0.104,0.482,0.096,0.628l0.483,0.354l-0.736,1.003c-1.28-0.834-2.734-1.419-4.296-1.699c0.847-0.635,1.402-1.638,1.403-2.778h-0.002c0-1.922-1.557-3.48-3.479-3.48c-1.925,0-3.48,1.559-3.48,3.48c0,1.141,0.556,2.144,1.401,2.778c-1.549,0.277-2.99,0.857-4.265,1.68L8.424,7.684l0.484-0.353c0.198-0.145,0.245-0.428,0.098-0.628l-0.44-0.604C8.42,5.899,8.136,5.855,7.937,6.001L5.881,7.5c-0.2,0.146-0.243,0.428-0.099,0.628l0.442,0.604c0.145,0.2,0.428,0.244,0.627,0.099l0.483-0.354l0.729,0.999c-2.615,2.149-4.282,5.407-4.282,9.057c0,6.471,5.245,11.716,11.718,11.716c6.47,0,11.716-5.243,11.718-11.716H27.216zM12.918,4.231c0.002-1.425,1.155-2.58,2.582-2.582c1.426,0.002,2.579,1.157,2.581,2.582c-0.002,1.192-0.812,2.184-1.908,2.482v-1.77h0.6c0.246,0,0.449-0.203,0.449-0.449V3.746c0-0.247-0.203-0.449-0.449-0.449h-2.545c-0.247,0-0.449,0.202-0.449,0.449v0.749c0,0.246,0.202,0.449,0.449,0.449h0.599v1.77C13.729,6.415,12.919,5.424,12.918,4.231zM15.5,27.554c-4.983-0.008-9.015-4.038-9.022-9.021c0.008-4.982,4.039-9.013,9.022-9.022c4.981,0.01,9.013,4.04,9.021,9.022C24.513,23.514,20.481,27.546,15.5,27.554zM15.5,12.138c0.476,0,0.861-0.385,0.861-0.86s-0.386-0.861-0.861-0.861s-0.861,0.386-0.861,0.861S15.024,12.138,15.5,12.138zM15.5,24.927c-0.476,0-0.861,0.386-0.861,0.861s0.386,0.861,0.861,0.861s0.861-0.386,0.861-0.861S15.976,24.927,15.5,24.927zM12.618,11.818c-0.237-0.412-0.764-0.553-1.176-0.315c-0.412,0.238-0.554,0.765-0.315,1.177l2.867,6.722c0.481,0.831,1.543,1.116,2.375,0.637c0.829-0.479,1.114-1.543,0.635-2.374L12.618,11.818zM18.698,24.07c-0.412,0.237-0.555,0.765-0.316,1.176c0.237,0.412,0.764,0.554,1.176,0.315c0.413-0.238,0.553-0.765,0.316-1.176C19.635,23.974,19.108,23.832,18.698,24.07zM8.787,15.65c0.412,0.238,0.938,0.097,1.176-0.315c0.237-0.413,0.097-0.938-0.314-1.176c-0.412-0.239-0.938-0.098-1.177,0.313C8.234,14.886,8.375,15.412,8.787,15.65zM22.215,21.413c-0.412-0.236-0.938-0.096-1.176,0.316c-0.238,0.412-0.099,0.938,0.314,1.176c0.41,0.238,0.937,0.098,1.176-0.314C22.768,22.178,22.625,21.652,22.215,21.413zM9.107,18.531c-0.002-0.476-0.387-0.86-0.861-0.86c-0.477,0-0.862,0.385-0.862,0.86c0.001,0.476,0.386,0.86,0.861,0.861C8.722,19.393,9.106,19.008,9.107,18.531zM21.896,18.531c0,0.477,0.384,0.862,0.859,0.86c0.476,0.002,0.862-0.382,0.862-0.859s-0.387-0.86-0.862-0.862C22.279,17.671,21.896,18.056,21.896,18.531zM8.787,21.413c-0.412,0.238-0.554,0.765-0.316,1.176c0.239,0.412,0.765,0.553,1.177,0.316c0.413-0.239,0.553-0.765,0.315-1.178C9.725,21.317,9.198,21.176,8.787,21.413zM21.352,14.157c-0.411,0.238-0.551,0.764-0.312,1.176c0.237,0.413,0.764,0.555,1.174,0.315c0.412-0.236,0.555-0.762,0.316-1.176C22.29,14.06,21.766,13.921,21.352,14.157zM12.304,24.067c-0.413-0.235-0.939-0.096-1.176,0.315c-0.238,0.413-0.098,0.939,0.312,1.178c0.413,0.236,0.939,0.096,1.178-0.315C12.857,24.832,12.715,24.308,12.304,24.067zM18.698,12.992c0.41,0.238,0.938,0.099,1.174-0.313c0.238-0.411,0.1-0.938-0.314-1.177c-0.414-0.238-0.937-0.097-1.177,0.315C18.144,12.229,18.286,12.755,18.698,12.992z");
    }});
draw2d.shape.icon.History = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.History", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M10.666,18.292c0.275,0.479,0.889,0.644,1.365,0.367l3.305-1.677C15.39,16.99,15.444,17,15.501,17c0.828,0,1.5-0.671,1.5-1.5l-0.5-7.876c0-0.552-0.448-1-1-1c-0.552,0-1,0.448-1,1l-0.466,7.343l-3.004,1.96C10.553,17.204,10.389,17.816,10.666,18.292zM12.062,9.545c0.479-0.276,0.642-0.888,0.366-1.366c-0.276-0.478-0.888-0.642-1.366-0.366s-0.642,0.888-0.366,1.366C10.973,9.658,11.584,9.822,12.062,9.545zM8.179,18.572c-0.478,0.277-0.642,0.889-0.365,1.367c0.275,0.479,0.889,0.641,1.365,0.365c0.479-0.275,0.643-0.888,0.367-1.367C9.27,18.461,8.658,18.297,8.179,18.572zM9.18,10.696c-0.479-0.276-1.09-0.112-1.366,0.366s-0.111,1.09,0.365,1.366c0.479,0.276,1.09,0.113,1.367-0.366C9.821,11.584,9.657,10.973,9.18,10.696zM6.624,15.5c0,0.553,0.449,1,1,1c0.552,0,1-0.447,1.001-1c-0.001-0.552-0.448-0.999-1.001-1C7.071,14.5,6.624,14.948,6.624,15.5zM14.501,23.377c0,0.553,0.448,1,1,1c0.552,0,1-0.447,1-1s-0.448-1-1-1C14.949,22.377,14.501,22.824,14.501,23.377zM10.696,21.822c-0.275,0.479-0.111,1.09,0.366,1.365c0.478,0.276,1.091,0.11,1.365-0.365c0.277-0.479,0.113-1.09-0.365-1.367C11.584,21.18,10.973,21.344,10.696,21.822zM21.822,10.696c-0.479,0.278-0.643,0.89-0.366,1.367s0.888,0.642,1.366,0.365c0.478-0.275,0.643-0.888,0.365-1.366C22.913,10.584,22.298,10.42,21.822,10.696zM21.456,18.938c-0.274,0.479-0.112,1.092,0.367,1.367c0.477,0.274,1.089,0.112,1.364-0.365c0.276-0.479,0.112-1.092-0.364-1.367C22.343,18.297,21.73,18.461,21.456,18.938zM24.378,15.5c0-0.551-0.448-1-1-1c-0.554,0.002-1.001,0.45-1.001,1c0.001,0.552,0.448,1,1.001,1C23.93,16.5,24.378,16.053,24.378,15.5zM18.573,22.822c0.274,0.477,0.888,0.643,1.366,0.365c0.478-0.275,0.642-0.89,0.365-1.365c-0.277-0.479-0.888-0.643-1.365-0.367C18.46,21.732,18.296,22.344,18.573,22.822zM18.939,9.546c0.477,0.276,1.088,0.112,1.365-0.366c0.276-0.478,0.113-1.091-0.367-1.367c-0.477-0.276-1.09-0.111-1.364,0.366C18.298,8.659,18.462,9.27,18.939,9.546zM28.703,14.364C28.074,7.072,21.654,1.67,14.364,2.295c-3.254,0.281-6.118,1.726-8.25,3.877L4.341,4.681l-1.309,7.364l7.031-2.548L8.427,8.12c1.627-1.567,3.767-2.621,6.194-2.833c5.64-0.477,10.595,3.694,11.089,9.335c0.477,5.64-3.693,10.595-9.333,11.09c-5.643,0.476-10.599-3.694-11.092-9.333c-0.102-1.204,0.019-2.373,0.31-3.478l-3.27,1.186c-0.089,0.832-0.106,1.684-0.031,2.55c0.629,7.29,7.048,12.691,14.341,12.066C23.926,28.074,29.328,21.655,28.703,14.364z");
    }});
draw2d.shape.icon.Future = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Future", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M17.001,15.5l-0.5-7.876c0-0.552-0.448-1-1-1c-0.552,0-1,0.448-1,1l-0.466,7.343l-3.004,1.96c-0.478,0.277-0.642,0.89-0.365,1.365c0.275,0.479,0.889,0.644,1.365,0.367l3.305-1.677C15.39,16.99,15.444,17,15.501,17C16.329,17,17.001,16.329,17.001,15.5zM18.939,21.455c-0.479,0.277-0.644,0.889-0.366,1.367c0.274,0.477,0.888,0.643,1.366,0.365c0.478-0.275,0.642-0.89,0.365-1.365C20.027,21.344,19.417,21.18,18.939,21.455zM19.938,7.813c-0.477-0.276-1.09-0.111-1.364,0.366c-0.275,0.48-0.111,1.091,0.366,1.367c0.477,0.276,1.088,0.112,1.365-0.366C20.581,8.702,20.418,8.089,19.938,7.813zM21.823,20.305c0.477,0.274,1.089,0.112,1.364-0.365c0.276-0.479,0.112-1.092-0.364-1.367c-0.48-0.275-1.093-0.111-1.367,0.365C21.182,19.416,21.344,20.029,21.823,20.305zM22.822,12.428c0.478-0.275,0.643-0.888,0.365-1.366c-0.274-0.478-0.89-0.642-1.365-0.366c-0.479,0.278-0.643,0.89-0.366,1.367S22.344,12.705,22.822,12.428zM24.378,15.5c0-0.551-0.448-1-1-1c-0.554,0.002-1.001,0.45-1.001,1c0.001,0.552,0.448,1,1.001,1C23.93,16.5,24.378,16.053,24.378,15.5zM9.546,12.062c0.275-0.478,0.111-1.089-0.366-1.366c-0.479-0.276-1.09-0.112-1.366,0.366s-0.111,1.09,0.365,1.366C8.658,12.704,9.269,12.541,9.546,12.062zM6.624,15.5c0,0.553,0.449,1,1,1c0.552,0,1-0.447,1.001-1c-0.001-0.552-0.448-0.999-1.001-1C7.071,14.5,6.624,14.948,6.624,15.5zM9.179,20.305c0.479-0.275,0.643-0.888,0.367-1.367c-0.276-0.477-0.888-0.641-1.367-0.365c-0.478,0.277-0.642,0.889-0.365,1.367C8.089,20.418,8.703,20.58,9.179,20.305zM12.062,9.545c0.479-0.276,0.642-0.888,0.366-1.366c-0.276-0.478-0.888-0.642-1.366-0.366s-0.642,0.888-0.366,1.366C10.973,9.658,11.584,9.822,12.062,9.545zM14.501,23.377c0,0.553,0.448,1,1,1c0.552,0,1-0.447,1-1s-0.448-1-1-1C14.949,22.377,14.501,22.824,14.501,23.377zM10.696,21.822c-0.275,0.479-0.111,1.09,0.366,1.365c0.478,0.276,1.091,0.11,1.365-0.365c0.277-0.479,0.113-1.09-0.365-1.367C11.584,21.18,10.973,21.344,10.696,21.822zM28.674,14.087l-3.27-1.186c0.291,1.105,0.41,2.274,0.309,3.478c-0.492,5.639-5.449,9.809-11.091,9.333c-5.639-0.495-9.809-5.45-9.333-11.09c0.494-5.641,5.449-9.812,11.089-9.335c2.428,0.212,4.567,1.266,6.194,2.833l-1.637,1.377l7.031,2.548l-1.309-7.364l-1.771,1.492c-2.133-2.151-4.996-3.597-8.25-3.877C9.346,1.67,2.926,7.072,2.297,14.364c-0.625,7.291,4.777,13.71,12.066,14.339c7.293,0.625,13.713-4.776,14.342-12.066C28.779,15.771,28.762,14.919,28.674,14.087z");
    }});
draw2d.shape.icon.GlobeAlt2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.GlobeAlt2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM8.251,7.48c0.122,0.055,0.255,0.104,0.28,0.137C8.57,7.668,8.621,7.823,8.557,7.861C8.492,7.9,8.39,7.887,8.376,7.771c-0.013-0.115-0.026-0.128-0.18-0.18c-0.022-0.007-0.035-0.01-0.051-0.015C8.18,7.544,8.216,7.512,8.251,7.48zM7.733,7.974c0.031,0.087,0.113,0.125,0,0.17C7.673,8.168,7.611,8.172,7.559,8.165C7.617,8.102,7.672,8.035,7.733,7.974zM16,27.533C9.639,27.533,4.466,22.36,4.466,16c0-0.085,0.011-0.168,0.013-0.254c0.004-0.003,0.008-0.006,0.012-0.009c0.129-0.102,0.283-0.359,0.334-0.45c0.052-0.089,0.181-0.154,0.116-0.256c-0.059-0.096-0.292-0.23-0.407-0.261c0.01-0.099,0.032-0.195,0.045-0.294c0.063,0.077,0.137,0.17,0.208,0.194c0.115,0.038,0.501,0.052,0.566,0.052c0.063,0,0.334,0.014,0.386-0.064c0.051-0.077,0.09-0.077,0.154-0.077c0.064,0,0.18,0.231,0.271,0.257c0.089,0.026,0.257,0.013,0.244,0.181c-0.012,0.166,0.077,0.309,0.167,0.321c0.09,0.013,0.296-0.194,0.296-0.194s0,0.322-0.012,0.438C6.846,15.698,7,16.124,7,16.124s0.193,0.397,0.244,0.488c0.052,0.09,0.27,0.36,0.27,0.476c0,0.117,0.026,0.297,0.104,0.297s0.155-0.206,0.244-0.335c0.091-0.128,0.117-0.31,0.155-0.438c0.039-0.129,0.039-0.36,0.039-0.45c0-0.091,0.076-0.168,0.257-0.245c0.181-0.077,0.309-0.296,0.463-0.412c0.155-0.116,0.142-0.309,0.452-0.309c0.308,0,0.282,0,0.36-0.078c0.077-0.077,0.154-0.128,0.192,0.013c0.039,0.142,0.257,0.347,0.296,0.399c0.039,0.052,0.116,0.193,0.104,0.348c-0.013,0.153,0.012,0.334,0.077,0.334c0.064,0,0.193-0.219,0.193-0.219s0.283-0.192,0.27,0.014c-0.014,0.205,0.025,0.425,0.025,0.552c0,0.13,0.232,0.438,0.232,0.362c0-0.079,0.103-0.296,0.103-0.413c0-0.114,0.064-0.063,0.231,0.051c0.167,0.116,0.283,0.349,0.283,0.349s0.168,0.154,0.193,0.219c0.026,0.064,0.206-0.025,0.244-0.104c0.039-0.076,0.065-0.115,0.167-0.141c0.104-0.026,0.231-0.026,0.271-0.168c0.039-0.142,0.154-0.308,0-0.502c-0.154-0.193-0.232-0.321-0.347-0.412c-0.117-0.09-0.206-0.322-0.206-0.322s0.244-0.218,0.321-0.296c0.079-0.077,0.193-0.025,0.207,0.064c0.013,0.091-0.115,0.168-0.141,0.361c-0.026,0.192,0.154,0.257,0.206,0.192c0.051-0.065,0.18-0.219,0.18-0.257c0-0.039-0.089-0.026-0.102-0.167c-0.013-0.142,0.166-0.245,0.23-0.207c0.066,0.039,0.477-0.051,0.67-0.154s0.308-0.322,0.425-0.412c0.116-0.089,0.515-0.386,0.489-0.527c-0.026-0.142,0.012-0.334-0.09-0.515c-0.103-0.18-0.232-0.295-0.283-0.373c-0.051-0.077,0.219-0.09,0.347-0.206c0.129-0.116,0-0.219-0.064-0.206c-0.064,0.013-0.232,0.052-0.296,0.039c-0.064-0.013-0.103-0.077-0.206-0.155c-0.102-0.077,0.026-0.192,0.091-0.179c0.064,0.013,0.23-0.129,0.308-0.193c0.077-0.064,0.193-0.115,0.154-0.051c-0.038,0.064-0.128,0.296-0.026,0.309c0.104,0.013,0.348-0.193,0.388-0.18c0.038,0.013,0.102,0.18,0.064,0.257c-0.039,0.077-0.039,0.206,0.013,0.193c0.051-0.013,0.154-0.129,0.18-0.09c0.027,0.039,0.154,0.116,0.09,0.257c-0.063,0.142-0.193,0.193-0.039,0.284c0.154,0.089,0.206,0.012,0.322-0.052c0.115-0.064,0.193-0.347,0.128-0.438c-0.064-0.09-0.218-0.27-0.218-0.334c0-0.064,0.257-0.064,0.257-0.167s0.09-0.18,0.18-0.219c0.091-0.039,0.206-0.206,0.244-0.154c0.039,0.052,0.271,0.116,0.334,0.039c0.064-0.077,0.4-0.36,0.605-0.515c0.206-0.154,0.283-0.334,0.336-0.515c0.051-0.18,0.128-0.296,0.102-0.437v0c0.077,0.18,0.09,0.309,0.077,0.45c-0.013,0.142,0,0.438,0.026,0.476c0.025,0.039,0.129,0.128,0.192,0.103c0.064-0.025-0.025-0.283-0.025-0.334c0-0.052,0.09-0.129,0.142-0.142c0.052-0.013,0-0.231-0.065-0.322c-0.063-0.09-0.154-0.142-0.102-0.154c0.051-0.013,0.115-0.116,0.077-0.142c-0.039-0.025-0.014-0.116-0.103-0.09c-0.065,0.019-0.241-0.015-0.235,0.095c-0.037-0.11-0.116-0.183-0.216-0.172c-0.116,0.013-0.181,0.077-0.296,0.077s-0.025-0.18-0.077-0.18c-0.051,0-0.168,0.167-0.231,0.077c-0.064-0.09,0.18-0.206,0.373-0.27c0.192-0.064,0.514-0.438,0.644-0.451c0.128-0.013,0.45,0.026,0.733,0.013c0.283-0.013,0.373-0.129,0.463-0.064s0.283,0.142,0.399,0.129c0.116-0.014,0.064,0,0.244-0.129c0.18-0.129,0.348-0.193,0.438-0.296c0.09-0.103,0.335-0.18,0.348-0.077c0.014,0.103-0.026,0.206,0.077,0.206s0.258-0.103,0.386-0.154c0.129-0.051,0.231-0.116,0.231-0.116s-0.527,0.36-0.655,0.438c-0.129,0.077-0.438,0.129-0.567,0.283c-0.128,0.155-0.205,0.206-0.192,0.374c0.014,0.167,0.231,0.386,0.128,0.54c-0.103,0.154-0.141,0.373-0.141,0.373s0.154-0.219,0.373-0.36s0.348-0.334,0.425-0.412s0.309-0.091,0.309-0.181s0.064-0.206,0.104-0.309c0.038-0.103-0.077-0.078,0-0.206c0.076-0.129,0.064-0.232,0.45-0.232s0.257,0.026,0.566,0.013c0.309-0.013,0.424-0.167,0.72-0.245c0.296-0.077,0.527-0.128,0.618-0.089c0.09,0.038,0.232,0.012,0.141-0.078c-0.089-0.09-0.295-0.219-0.193-0.245c0.104-0.026,0.207-0.039,0.246-0.142c0.039-0.103-0.142-0.283-0.039-0.386c0.104-0.103-0.077-0.231-0.207-0.257c-0.128-0.025-0.63,0.026-0.731-0.025c-0.104-0.052-0.271-0.116-0.322-0.078c-0.052,0.039-0.168,0.245-0.168,0.245s-0.09,0.025-0.168-0.09c-0.076-0.116-0.5-0.103-0.629-0.103s-0.271,0.025-0.413,0.039c-0.141,0.013-0.219,0.052-0.322-0.039c-0.102-0.09-0.243-0.129-0.296-0.167c-0.051-0.039-0.334-0.039-0.553-0.012c-0.218,0.025-0.438,0.025-0.438,0.025s-0.104-0.039-0.257-0.129c-0.154-0.09-0.309-0.154-0.361-0.154c-0.051,0-0.449,0.064-0.539,0c-0.091-0.064-0.181-0.103-0.245-0.103s-0.115-0.103-0.038-0.103s0.437-0.103,0.437-0.103s-0.103-0.142-0.231-0.142c-0.128,0-0.359-0.064-0.424-0.064s-0.014,0.064-0.142,0.039c-0.13-0.026-0.258-0.078-0.335-0.026c-0.076,0.051-0.258,0.128-0.064,0.18c0.193,0.052,0.373,0,0.425,0.078c0.052,0.077,0,0.115,0,0.167s-0.103,0.193-0.167,0.219c-0.064,0.025-0.143-0.039-0.27,0.025c-0.129,0.064-0.451,0.013-0.49,0.052c-0.038,0.039-0.115-0.103-0.18-0.077c-0.064,0.025-0.232,0.193-0.322,0.18c-0.089-0.013-0.206-0.103-0.206-0.206s-0.038-0.232-0.077-0.258c-0.038-0.025-0.322-0.039-0.425-0.025c-0.103,0.013-0.424,0.038-0.477,0.09c-0.052,0.052-0.193,0.09-0.283,0.09s-0.167-0.09-0.36-0.116c-0.192-0.026-0.617-0.039-0.669-0.026s-0.218-0.025-0.155-0.077c0.065-0.051,0.257-0.219,0.143-0.295c-0.117-0.078-0.375-0.078-0.489-0.09c-0.117-0.013-0.232-0.039-0.413-0.013c-0.181,0.026-0.219,0.116-0.296,0.039c-0.077-0.077,0.193,0.039-0.077-0.077c-0.27-0.116-0.399-0.103-0.477-0.064c-0.077,0.039,0.013,0.025-0.192,0.103c-0.206,0.078-0.322,0.116-0.374,0.129c-0.051,0.012-0.372-0.065-0.411-0.091c-0.038-0.025-0.181,0.013-0.309,0.064S9.895,7.025,9.767,7C9.638,6.973,9.432,6.973,9.303,7.025C9.174,7.076,9.084,7.076,8.956,7.166c-0.13,0.09-0.373,0.142-0.373,0.142S8.522,7.305,8.448,7.301C10.474,5.541,13.111,4.466,16,4.466c6.361,0,11.534,5.173,11.534,11.534S22.36,27.533,16,27.533zM14.888,19.92c0,0,0.207-0.026,0.207-0.117c0-0.089-0.207-0.205-0.282-0.102c-0.078,0.102-0.219,0.205-0.207,0.296C14.625,20.138,14.888,19.92,14.888,19.92zM14.875,17.023c-0.181,0.233-0.167,0.182-0.296,0.128c-0.128-0.05-0.334,0.116-0.296,0.182c0.039,0.064,0.322-0.014,0.386,0.102c0.065,0.116,0.065,0.129,0.193,0.104c0.128-0.026,0.257-0.205,0.219-0.295C15.043,17.151,14.875,17.023,14.875,17.023zM14.837,18.245c-0.051,0-0.412,0.064-0.451,0.079c-0.039,0.013-0.27-0.025-0.27-0.025c-0.09,0.089-0.026,0.179,0.116,0.166s0.438-0.052,0.502-0.052C14.799,18.413,14.888,18.245,14.837,18.245zM14.284,14.668c-0.19,0.03-0.308,0.438-0.155,0.425C14.284,15.081,14.451,14.643,14.284,14.668zM14.734,16.959c-0.052-0.064-0.181-0.271-0.323-0.219c-0.042,0.017-0.153,0.245-0.012,0.245C14.541,16.985,14.786,17.023,14.734,16.959zM14.85,16.805c0.232-0.013,0.167-0.245-0.013-0.257C14.786,16.544,14.618,16.818,14.85,16.805zM17.591,18.928c-0.193-0.039-0.244-0.102-0.45-0.205c-0.207-0.103-0.67-0.103-0.682-0.039c-0.014,0.064,0,0-0.155-0.05c-0.153-0.054-0.271,0-0.309-0.091c-0.038-0.091-0.128-0.117-0.244-0.002c-0.097,0.097-0.142,0.104,0.078,0.143c0.218,0.039,0.283,0.039,0.192,0.141c-0.09,0.104-0.154,0.233-0.077,0.244c0.077,0.015,0.309-0.05,0.334,0c0.026,0.054-0.051,0.064,0.207,0.105c0.258,0.037,0.309,0.128,0.359,0.178c0.051,0.052,0.206,0.22,0.104,0.22c-0.104,0-0.219,0.128-0.142,0.143c0.077,0.013,0.309-0.039,0.321,0c0.014,0.037,0.143,0.283,0.271,0.271c0.129-0.013,0.206-0.244,0.27-0.31c0.065-0.064,0.322-0.104,0.349,0.012c0.026,0.116,0.104,0.233,0.257,0.311c0.154,0.076,0.335,0.154,0.348,0.089c0.013-0.064-0.077-0.309-0.181-0.346c-0.103-0.041-0.282-0.259-0.282-0.348c0-0.091-0.155-0.117-0.232-0.182C17.849,19.147,17.784,18.967,17.591,18.928zM8.042,17.023c-0.084,0.037-0.155,0.476,0,0.527c0.154,0.052,0.244-0.205,0.193-0.271C8.183,17.218,8.158,16.973,8.042,17.023zM15.429,18.117c-0.118-0.05-0.335,0.424-0.181,0.463C15.403,18.62,15.518,18.156,15.429,18.117zM15.687,13.703c0.077,0,0.18-0.051,0.18-0.193c0-0.142,0.18,0,0.27-0.013s0.141-0.103,0.18-0.206c0.005-0.013,0.008-0.021,0.009-0.027c-0.003,0.024-0.001,0.093,0.095,0.117c0.154,0.038,0.205-0.064,0.205-0.103s0.283-0.103,0.336-0.142c0.051-0.038,0.258-0.103,0.27-0.154c0.013-0.051,0-0.348,0.064-0.373c0.064-0.026,0.154-0.026,0.052-0.206c-0.104-0.181-0.104-0.348-0.232-0.271c-0.095,0.057-0.038,0.284-0.115,0.438s-0.142,0.296-0.193,0.296s-0.321,0.103-0.399,0.18c-0.076,0.077-0.45-0.064-0.501,0c-0.052,0.064-0.154,0.141-0.219,0.193c-0.065,0.051-0.245,0.013-0.207,0.167C15.518,13.562,15.609,13.703,15.687,13.703zM17.449,12.056c0.18-0.013,0.348-0.064,0.348-0.064s0.271,0.013,0.232-0.116c-0.04-0.128-0.322-0.141-0.375-0.128c-0.051,0.013-0.142-0.142-0.244-0.116c-0.096,0.023-0.128,0.155-0.128,0.193c0,0.039-0.36,0.115-0.245,0.219C17.153,12.146,17.27,12.069,17.449,12.056zM13.91,19.058c0.104,0.064,0.296-0.219,0.349-0.13c0.051,0.091-0.013,0.13,0.076,0.246c0.091,0.114,0.258,0.102,0.258,0.102s-0.013-0.309-0.155-0.387c-0.142-0.077-0.232-0.166-0.064-0.141c0.167,0.026,0.257-0.039,0.219-0.114c-0.039-0.078-0.283-0.039-0.361-0.026s-0.193-0.052-0.193-0.052c-0.077,0.024-0.063,0.089-0.09,0.219C13.923,18.902,13.807,18.992,13.91,19.058zM20.924,21.618c-0.231-0.052-0.077,0.039,0,0.154c0.077,0.116,0.232,0.176,0.258,0.05C21.193,21.759,21.155,21.67,20.924,21.618zM21.915,24.744c-0.077,0.064,0,0.091-0.219,0.22c-0.22,0.13-0.49,0.271-0.541,0.386c-0.052,0.116,0.051,0.181,0.258,0.192c0.206,0.013,0.154,0.053,0.296-0.103s0.271-0.244,0.438-0.373c0.168-0.128,0.168-0.322,0.168-0.322s-0.181-0.178-0.193-0.141C22.1,24.665,21.992,24.681,21.915,24.744zM18.504,21.618c0.014-0.116-0.219-0.116-0.334-0.207c-0.116-0.089-0.128-0.359-0.193-0.515c-0.064-0.153-0.192-0.257-0.322-0.397c-0.128-0.143-0.192-0.465-0.23-0.438c-0.039,0.025-0.154,0.399-0.064,0.515c0.09,0.116-0.039,0.348-0.103,0.503c-0.065,0.153-0.22-0.026-0.349-0.104c-0.129-0.078-0.308-0.128-0.398-0.219c-0.09-0.091,0.155-0.335,0.091-0.426c-0.065-0.09-0.412-0.013-0.45-0.013c-0.039,0-0.116-0.128-0.194-0.128c-0.077,0-0.064,0.258-0.064,0.258s-0.078-0.091-0.193-0.207c-0.117-0.115,0.012,0.077-0.103,0.193c-0.117,0.117-0.079,0.078-0.129,0.206c-0.051,0.129-0.167,0.077-0.283-0.052c-0.116-0.128-0.179-0.037-0.258,0c-0.077,0.039-0.141,0.259-0.18,0.309c-0.039,0.052-0.309,0.117-0.374,0.182c-0.064,0.062-0.09,0.27-0.09,0.322c0,0.05-0.271,0.023-0.361,0.089c-0.09,0.064-0.23,0.025-0.321,0.025c-0.09,0-0.399,0.244-0.502,0.308c-0.103,0.066-0.103,0.298-0.051,0.362c0.051,0.063,0.154,0.219,0.09,0.244c-0.064,0.026-0.104,0.206,0.051,0.359c0.154,0.155,0.103,0.194,0.115,0.271c0.014,0.077,0.078,0.104,0.181,0.232c0.102,0.128-0.181,0.231-0.219,0.31c-0.039,0.076,0.091,0.192,0.167,0.257c0.077,0.063,0.271,0.026,0.386-0.013c0.117-0.039,0.245-0.143,0.321-0.155c0.079-0.013,0.438-0.026,0.438-0.026s0.129-0.192,0.219-0.296c0.089-0.102,0.372-0.013,0.372-0.013s0.117-0.076,0.426-0.141c0.309-0.065,0.179,0.064,0.296,0.104c0.115,0.037,0.27,0.062,0.359,0.128c0.09,0.064,0,0.218-0.012,0.283c-0.014,0.064,0.219,0.038,0.23-0.026c0.014-0.064,0.077-0.128,0.207-0.205c0.128-0.078,0.025,0.114,0.076,0.231c0.052,0.116,0.129-0.157,0.129-0.026c0,0.039,0.039,0.078,0.051,0.116c0.014,0.039,0.181,0.052,0.181,0.18c0,0.13,0,0.207,0.039,0.231c0.038,0.026,0.244,0,0.335,0.155c0.089,0.154,0.154,0.013,0.205-0.052c0.052-0.064,0.231,0.026,0.283,0.078c0.052,0.05,0.193-0.104,0.387-0.155c0.192-0.051,0.167-0.039,0.219-0.115c0.051-0.078,0.09-0.283,0.205-0.438c0.115-0.153,0.271-0.424,0.271-0.631c0-0.206-0.014-0.682-0.155-0.899C18.761,21.953,18.492,21.733,18.504,21.618zM18.029,24.77c-0.065-0.013-0.207-0.062-0.207-0.062c-0.142,0.141,0.142,0.141,0.104,0.283c-0.039,0.141,0.193,0.089,0.257,0.064c0.063-0.027,0.22-0.323,0.193-0.399C18.351,24.577,18.093,24.783,18.029,24.77zM22.803,24.178c-0.052,0-0.077,0.064-0.192,0c-0.117-0.063-0.091-0.037-0.168-0.167c-0.077-0.127-0.091-0.296-0.219-0.23c-0.051,0.025,0,0.168,0.051,0.218c0.053,0.052,0.077,0.231,0.064,0.283c-0.012,0.052-0.231,0.116-0.129,0.18c0.104,0.064,0.297,0,0.271,0.078c-0.025,0.077-0.129,0.179-0.013,0.205c0.115,0.025,0.154-0.089,0.207-0.178c0.051-0.093,0.089-0.169,0.179-0.221C22.944,24.294,22.854,24.178,22.803,24.178zM22.815,21.18c0.168,0.064,0.464-0.231,0.347-0.27C23.047,20.871,22.815,21.18,22.815,21.18zM13.923,19.906c-0.029,0.115,0.193,0.167,0.206,0.039C14.141,19.816,13.949,19.803,13.923,19.906zM14.27,16.47c-0.064,0.065-0.257,0.193-0.283,0.31c-0.025,0.115,0.309-0.182,0.399-0.296c0.091-0.117,0.27-0.052,0.308-0.117c0.04-0.063,0.04-0.063,0.04-0.063s-0.142-0.025-0.257-0.063c-0.117-0.039-0.258,0.102-0.193-0.104c0.064-0.206,0.257-0.167,0.219-0.322c-0.039-0.154-0.168-0.193-0.207-0.193c-0.09,0,0.013,0.141-0.116,0.231c-0.128,0.09-0.271,0.128-0.193,0.283C14.064,16.29,14.334,16.405,14.27,16.47zM13.254,19.751c0.013-0.076-0.142-0.192-0.206-0.192c-0.065,0-0.386-0.077-0.386-0.077c-0.058,0.023-0.135,0.045-0.158,0.077c-0.007-0.011-0.022-0.024-0.049-0.039c-0.142-0.075-0.309,0-0.361-0.102c-0.05-0.104-0.127-0.104-0.179-0.039c-0.094,0.117,0.025,0.206,0.063,0.231c0.038,0.024,0.181,0.052,0.309,0.039c0.08-0.008,0.181-0.027,0.21-0.059c0.004,0.014,0.016,0.027,0.035,0.044c0.103,0.092,0.167,0.13,0.321,0.116C13.009,19.74,13.241,19.829,13.254,19.751zM12.881,18.992c0.065,0,0.193,0,0.283,0.026c0.09,0.025,0.386,0.05,0.373-0.064c-0.013-0.115-0.038-0.297,0.089-0.411c0.13-0.117,0.257-0.18,0.193-0.348c-0.063-0.167-0.193-0.271-0.103-0.349c0.09-0.076,0.192-0.102,0.192-0.166c0-0.065-0.217,0.18-0.244-0.246c-0.005-0.091-0.206,0.025-0.219,0.116c-0.012,0.091,0.142,0.167-0.103,0.167c-0.245,0-0.257,0.194-0.309,0.232c-0.052,0.039-0.103,0.051-0.207,0.076c-0.102,0.026-0.127,0.13-0.153,0.194c-0.025,0.063-0.206-0.116-0.257-0.064c-0.051,0.052-0.013,0.296,0.077,0.501C12.585,18.863,12.816,18.992,12.881,18.992zM11.979,18.928c0.065-0.077,0.038-0.192-0.063-0.18c-0.103,0.013-0.193-0.168-0.36-0.283c-0.168-0.114-0.296-0.194-0.451-0.36c-0.154-0.167-0.347-0.271-0.45-0.359c-0.104-0.091-0.257-0.13-0.322-0.116c-0.159,0.032,0.231,0.309,0.271,0.346c0.039,0.041,0.387,0.335,0.387,0.478s0.231,0.476,0.296,0.527c0.064,0.052,0.385,0.244,0.437,0.348c0.052,0.103,0.167,0.13,0.167-0.013C11.89,19.174,11.916,19.006,11.979,18.928zM11.002,17.474c0.064,0.232,0.193,0.464,0.244,0.555c0.052,0.089,0.271,0.217,0.348,0.281c0.077,0.064,0.192-0.024,0.143-0.102c-0.052-0.078-0.155-0.192-0.167-0.283c-0.013-0.091-0.078-0.233-0.181-0.387c-0.102-0.153-0.192-0.192-0.257-0.295c-0.064-0.104-0.296-0.297-0.296-0.297c-0.102,0.013-0.102,0.205-0.051,0.271C10.834,17.28,10.938,17.243,11.002,17.474z");
    }});
draw2d.shape.icon.GlobeAlt = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.GlobeAlt", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM27.436,17.39c0.001,0.002,0.004,0.002,0.005,0.004c-0.022,0.187-0.054,0.37-0.085,0.554c-0.015-0.012-0.034-0.025-0.047-0.036c-0.103-0.09-0.254-0.128-0.318-0.115c-0.157,0.032,0.229,0.305,0.267,0.342c0.009,0.009,0.031,0.03,0.062,0.058c-1.029,5.312-5.709,9.338-11.319,9.338c-4.123,0-7.736-2.18-9.776-5.441c0.123-0.016,0.24-0.016,0.28-0.076c0.051-0.077,0.102-0.241,0.178-0.331c0.077-0.089,0.165-0.229,0.127-0.292c-0.039-0.064,0.101-0.344,0.088-0.419c-0.013-0.076-0.127-0.256,0.064-0.407s0.394-0.382,0.407-0.444c0.012-0.063,0.166-0.331,0.152-0.458c-0.012-0.127-0.152-0.28-0.24-0.318c-0.09-0.037-0.28-0.05-0.356-0.151c-0.077-0.103-0.292-0.203-0.368-0.178c-0.076,0.025-0.204,0.05-0.305-0.015c-0.102-0.062-0.267-0.139-0.33-0.189c-0.065-0.05-0.229-0.088-0.305-0.088c-0.077,0-0.065-0.052-0.178,0.101c-0.114,0.153,0,0.204-0.204,0.177c-0.204-0.023,0.025-0.036,0.141-0.189c0.113-0.152-0.013-0.242-0.141-0.203c-0.126,0.038-0.038,0.115-0.241,0.153c-0.203,0.036-0.203-0.09-0.076-0.115s0.355-0.139,0.355-0.19c0-0.051-0.025-0.191-0.127-0.191s-0.077-0.126-0.229-0.291c-0.092-0.101-0.196-0.164-0.299-0.204c-0.09-0.579-0.15-1.167-0.15-1.771c0-2.844,1.039-5.446,2.751-7.458c0.024-0.02,0.048-0.034,0.069-0.036c0.084-0.009,0.31-0.025,0.51-0.059c0.202-0.034,0.418-0.161,0.489-0.153c0.069,0.008,0.241,0.008,0.186-0.042C8.417,8.2,8.339,8.082,8.223,8.082S8.215,7.896,8.246,7.896c0.03,0,0.186,0.025,0.178,0.11C8.417,8.091,8.471,8.2,8.625,8.167c0.156-0.034,0.132-0.162,0.102-0.195C8.695,7.938,8.672,7.853,8.642,7.794c-0.031-0.06-0.023-0.136,0.14-0.153C8.944,7.625,9.168,7.708,9.16,7.573s0-0.28,0.046-0.356C9.253,7.142,9.354,7.09,9.299,7.065C9.246,7.04,9.176,7.099,9.121,6.972c-0.054-0.127,0.047-0.22,0.108-0.271c0.02-0.015,0.067-0.06,0.124-0.112C11.234,5.257,13.524,4.466,16,4.466c3.213,0,6.122,1.323,8.214,3.45c-0.008,0.022-0.01,0.052-0.031,0.056c-0.077,0.013-0.166,0.063-0.179-0.051c-0.013-0.114-0.013-0.331-0.102-0.203c-0.089,0.127-0.127,0.127-0.127,0.191c0,0.063,0.076,0.127,0.051,0.241C23.8,8.264,23.8,8.341,23.84,8.341c0.036,0,0.126-0.115,0.239-0.141c0.116-0.025,0.319-0.088,0.332,0.026c0.013,0.115,0.139,0.152,0.013,0.203c-0.128,0.051-0.267,0.026-0.293-0.051c-0.025-0.077-0.114-0.077-0.203-0.013c-0.088,0.063-0.279,0.292-0.279,0.292s-0.306,0.139-0.343,0.114c-0.04-0.025,0.101-0.165,0.203-0.228c0.102-0.064,0.178-0.204,0.14-0.242c-0.038-0.038-0.088-0.279-0.063-0.343c0.025-0.063,0.139-0.152,0.013-0.216c-0.127-0.063-0.217-0.14-0.318-0.178s-0.216,0.152-0.305,0.204c-0.089,0.051-0.076,0.114-0.191,0.127c-0.114,0.013-0.189,0.165,0,0.254c0.191,0.089,0.255,0.152,0.204,0.204c-0.051,0.051-0.267-0.025-0.267-0.025s-0.165-0.076-0.268-0.076c-0.101,0-0.229-0.063-0.33-0.076c-0.102-0.013-0.306-0.013-0.355,0.038c-0.051,0.051-0.179,0.203-0.28,0.152c-0.101-0.051-0.101-0.102-0.241-0.051c-0.14,0.051-0.279-0.038-0.355,0.038c-0.077,0.076-0.013,0.076-0.255,0c-0.241-0.076-0.189,0.051-0.419,0.089s-0.368-0.038-0.432,0.038c-0.064,0.077-0.153,0.217-0.19,0.127c-0.038-0.088,0.126-0.241,0.062-0.292c-0.062-0.051-0.33-0.025-0.367,0.013c-0.039,0.038-0.014,0.178,0.011,0.229c0.026,0.05,0.064,0.254-0.011,0.216c-0.077-0.038-0.064-0.166-0.141-0.152c-0.076,0.013-0.165,0.051-0.203,0.077c-0.038,0.025-0.191,0.025-0.229,0.076c-0.037,0.051,0.014,0.191-0.051,0.203c-0.063,0.013-0.114,0.064-0.254-0.025c-0.14-0.089-0.14-0.038-0.178-0.012c-0.038,0.025-0.216,0.127-0.229,0.012c-0.013-0.114,0.025-0.152-0.089-0.229c-0.115-0.076-0.026-0.076,0.127-0.025c0.152,0.05,0.343,0.075,0.622-0.013c0.28-0.089,0.395-0.127,0.28-0.178c-0.115-0.05-0.229-0.101-0.406-0.127c-0.179-0.025-0.42-0.025-0.7-0.127c-0.279-0.102-0.343-0.14-0.457-0.165c-0.115-0.026-0.813-0.14-1.132-0.089c-0.317,0.051-1.193,0.28-1.245,0.318s-0.128,0.19-0.292,0.318c-0.165,0.127-0.47,0.419-0.712,0.47c-0.241,0.051-0.521,0.254-0.521,0.305c0,0.051,0.101,0.242,0.076,0.28c-0.025,0.038,0.05,0.229,0.191,0.28c0.139,0.05,0.381,0.038,0.393-0.039c0.014-0.076,0.204-0.241,0.217-0.127c0.013,0.115,0.14,0.292,0.114,0.368c-0.025,0.077,0,0.153,0.09,0.14c0.088-0.012,0.559-0.114,0.559-0.114s0.153-0.064,0.127-0.166c-0.026-0.101,0.166-0.241,0.203-0.279c0.038-0.038,0.178-0.191,0.014-0.241c-0.167-0.051-0.293-0.064-0.115-0.216s0.292,0,0.521-0.229c0.229-0.229-0.051-0.292,0.191-0.305c0.241-0.013,0.496-0.025,0.444,0.051c-0.05,0.076-0.342,0.242-0.508,0.318c-0.166,0.077-0.14,0.216-0.076,0.292c0.063,0.076,0.09,0.254,0.204,0.229c0.113-0.025,0.254-0.114,0.38-0.101c0.128,0.012,0.383-0.013,0.42-0.013c0.039,0,0.216,0.178,0.114,0.203c-0.101,0.025-0.229,0.013-0.445,0.025c-0.215,0.013-0.456,0.013-0.456,0.051c0,0.039,0.292,0.127,0.19,0.191c-0.102,0.063-0.203-0.013-0.331-0.026c-0.127-0.012-0.203,0.166-0.241,0.267c-0.039,0.102,0.063,0.28-0.127,0.216c-0.191-0.063-0.331-0.063-0.381-0.038c-0.051,0.025-0.203,0.076-0.331,0.114c-0.126,0.038-0.076-0.063-0.242-0.063c-0.164,0-0.164,0-0.164,0l-0.103,0.013c0,0-0.101-0.063-0.114-0.165c-0.013-0.102,0.05-0.216-0.013-0.241c-0.064-0.026-0.292,0.012-0.33,0.088c-0.038,0.076-0.077,0.216-0.026,0.28c0.052,0.063,0.204,0.19,0.064,0.152c-0.14-0.038-0.317-0.051-0.419,0.026c-0.101,0.076-0.279,0.241-0.279,0.241s-0.318,0.025-0.318,0.102c0,0.077,0,0.178-0.114,0.191c-0.115,0.013-0.268,0.05-0.42,0.076c-0.153,0.025-0.139,0.088-0.317,0.102s-0.204,0.089-0.038,0.114c0.165,0.025,0.418,0.127,0.431,0.241c0.014,0.114-0.013,0.242-0.076,0.356c-0.043,0.079-0.305,0.026-0.458,0.026c-0.152,0-0.456-0.051-0.584,0c-0.127,0.051-0.102,0.305-0.064,0.419c0.039,0.114-0.012,0.178-0.063,0.216c-0.051,0.038-0.065,0.152,0,0.204c0.063,0.051,0.114,0.165,0.166,0.178c0.051,0.013,0.215-0.038,0.279,0.025c0.064,0.064,0.127,0.216,0.165,0.178c0.039-0.038,0.089-0.203,0.153-0.166c0.064,0.039,0.216-0.012,0.331-0.025s0.177-0.14,0.292-0.204c0.114-0.063,0.05-0.063,0.013-0.14c-0.038-0.076,0.114-0.165,0.204-0.254c0.088-0.089,0.253-0.013,0.292-0.115c0.038-0.102,0.051-0.279,0.151-0.267c0.103,0.013,0.243,0.076,0.331,0.076c0.089,0,0.279-0.14,0.332-0.165c0.05-0.025,0.241-0.013,0.267,0.102c0.025,0.114,0.241,0.254,0.292,0.279c0.051,0.025,0.381,0.127,0.433,0.165c0.05,0.038,0.126,0.153,0.152,0.254c0.025,0.102,0.114,0.102,0.128,0.013c0.012-0.089-0.065-0.254,0.025-0.242c0.088,0.013,0.191-0.026,0.191-0.026s-0.243-0.165-0.331-0.203c-0.088-0.038-0.255-0.114-0.331-0.241c-0.076-0.127-0.267-0.153-0.254-0.279c0.013-0.127,0.191-0.051,0.292,0.051c0.102,0.102,0.356,0.241,0.445,0.33c0.088,0.089,0.229,0.127,0.267,0.242c0.039,0.114,0.152,0.241,0.19,0.292c0.038,0.051,0.165,0.331,0.204,0.394c0.038,0.063,0.165-0.012,0.229-0.063c0.063-0.051,0.179-0.076,0.191-0.178c0.013-0.102-0.153-0.178-0.203-0.216c-0.051-0.038,0.127-0.076,0.191-0.127c0.063-0.05,0.177-0.14,0.228-0.063c0.051,0.077,0.026,0.381,0.051,0.432c0.025,0.051,0.279,0.127,0.331,0.191c0.05,0.063,0.267,0.089,0.304,0.051c0.039-0.038,0.242,0.026,0.294,0.038c0.049,0.013,0.202-0.025,0.304-0.05c0.103-0.025,0.204-0.102,0.191,0.063c-0.013,0.165-0.051,0.419-0.179,0.546c-0.127,0.127-0.076,0.191-0.202,0.191c-0.06,0-0.113,0-0.156,0.021c-0.041-0.065-0.098-0.117-0.175-0.097c-0.152,0.038-0.344,0.038-0.47,0.19c-0.128,0.153-0.178,0.165-0.204,0.114c-0.025-0.051,0.369-0.267,0.317-0.331c-0.05-0.063-0.355-0.038-0.521-0.038c-0.166,0-0.305-0.102-0.433-0.127c-0.126-0.025-0.292,0.127-0.418,0.254c-0.128,0.127-0.216,0.038-0.331,0.038c-0.115,0-0.331-0.165-0.331-0.165s-0.216-0.089-0.305-0.089c-0.088,0-0.267-0.165-0.318-0.165c-0.05,0-0.19-0.115-0.088-0.166c0.101-0.05,0.202,0.051,0.101-0.229c-0.101-0.279-0.33-0.216-0.419-0.178c-0.088,0.039-0.724,0.025-0.775,0.025c-0.051,0-0.419,0.127-0.533,0.178c-0.116,0.051-0.318,0.115-0.369,0.14c-0.051,0.025-0.318-0.051-0.433,0.013c-0.151,0.084-0.291,0.216-0.33,0.216c-0.038,0-0.153,0.089-0.229,0.28c-0.077,0.19,0.013,0.355-0.128,0.419c-0.139,0.063-0.394,0.204-0.495,0.305c-0.102,0.101-0.229,0.458-0.355,0.623c-0.127,0.165,0,0.317,0.025,0.419c0.025,0.101,0.114,0.292-0.025,0.471c-0.14,0.178-0.127,0.266-0.191,0.279c-0.063,0.013,0.063,0.063,0.088,0.19c0.025,0.128-0.114,0.255,0.128,0.369c0.241,0.113,0.355,0.217,0.418,0.367c0.064,0.153,0.382,0.407,0.382,0.407s0.229,0.205,0.344,0.293c0.114,0.089,0.152,0.038,0.177-0.05c0.025-0.09,0.178-0.104,0.355-0.104c0.178,0,0.305,0.04,0.483,0.014c0.178-0.025,0.356-0.141,0.42-0.166c0.063-0.025,0.279-0.164,0.443-0.063c0.166,0.103,0.141,0.241,0.23,0.332c0.088,0.088,0.24,0.037,0.355-0.051c0.114-0.09,0.064-0.052,0.203,0.025c0.14,0.075,0.204,0.151,0.077,0.267c-0.128,0.113-0.051,0.293-0.128,0.47c-0.076,0.178-0.063,0.203,0.077,0.278c0.14,0.076,0.394,0.548,0.47,0.638c0.077,0.088-0.025,0.342,0.064,0.495c0.089,0.151,0.178,0.254,0.077,0.331c-0.103,0.075-0.28,0.216-0.292,0.47s0.051,0.431,0.102,0.521s0.177,0.331,0.241,0.419c0.064,0.089,0.14,0.305,0.152,0.445c0.013,0.14-0.024,0.306,0.039,0.381c0.064,0.076,0.102,0.191,0.216,0.292c0.115,0.103,0.152,0.318,0.152,0.318s0.039,0.089,0.051,0.229c0.012,0.14,0.025,0.228,0.152,0.292c0.126,0.063,0.215,0.076,0.28,0.013c0.063-0.063,0.381-0.077,0.546-0.063c0.165,0.013,0.355-0.075,0.521-0.19s0.407-0.419,0.496-0.508c0.089-0.09,0.292-0.255,0.268-0.356c-0.025-0.101-0.077-0.203,0.024-0.254c0.102-0.052,0.344-0.152,0.356-0.229c0.013-0.077-0.09-0.395-0.115-0.457c-0.024-0.064,0.064-0.18,0.165-0.306c0.103-0.128,0.421-0.216,0.471-0.267c0.051-0.053,0.191-0.267,0.217-0.433c0.024-0.167-0.051-0.369,0-0.457c0.05-0.09,0.013-0.165-0.103-0.268c-0.114-0.102-0.089-0.407-0.127-0.457c-0.037-0.051-0.013-0.319,0.063-0.345c0.076-0.023,0.242-0.279,0.344-0.393c0.102-0.114,0.394-0.47,0.534-0.496c0.139-0.025,0.355-0.229,0.368-0.343c0.013-0.115,0.38-0.547,0.394-0.635c0.013-0.09,0.166-0.42,0.102-0.497c-0.062-0.076-0.559,0.115-0.622,0.141c-0.064,0.025-0.241,0.127-0.446,0.113c-0.202-0.013-0.114-0.177-0.127-0.254c-0.012-0.076-0.228-0.368-0.279-0.381c-0.051-0.012-0.203-0.166-0.267-0.317c-0.063-0.153-0.152-0.343-0.254-0.458c-0.102-0.114-0.165-0.38-0.268-0.559c-0.101-0.178-0.189-0.407-0.279-0.572c-0.021-0.041-0.045-0.079-0.067-0.117c0.118-0.029,0.289-0.082,0.31-0.009c0.024,0.088,0.165,0.279,0.19,0.419s0.165,0.089,0.178,0.216c0.014,0.128,0.14,0.433,0.19,0.47c0.052,0.038,0.28,0.242,0.318,0.318c0.038,0.076,0.089,0.178,0.127,0.369c0.038,0.19,0.076,0.444,0.179,0.482c0.102,0.038,0.444-0.064,0.508-0.102s0.482-0.242,0.635-0.255c0.153-0.012,0.179-0.115,0.368-0.152c0.191-0.038,0.331-0.177,0.458-0.28c0.127-0.101,0.28-0.355,0.33-0.444c0.052-0.088,0.179-0.152,0.115-0.253c-0.063-0.103-0.331-0.254-0.433-0.268c-0.102-0.012-0.089-0.178-0.152-0.178s-0.051,0.088-0.178,0.153c-0.127,0.063-0.255,0.19-0.344,0.165s0.026-0.089-0.113-0.203s-0.192-0.14-0.192-0.228c0-0.089-0.278-0.255-0.304-0.382c-0.026-0.127,0.19-0.305,0.254-0.19c0.063,0.114,0.115,0.292,0.279,0.368c0.165,0.076,0.318,0.204,0.395,0.229c0.076,0.025,0.267-0.14,0.33-0.114c0.063,0.024,0.191,0.253,0.306,0.292c0.113,0.038,0.495,0.051,0.559,0.051s0.33,0.013,0.381-0.063c0.051-0.076,0.089-0.076,0.153-0.076c0.062,0,0.177,0.229,0.267,0.254c0.089,0.025,0.254,0.013,0.241,0.179c-0.012,0.164,0.076,0.305,0.165,0.317c0.09,0.012,0.293-0.191,0.293-0.191s0,0.318-0.012,0.433c-0.014,0.113,0.139,0.534,0.139,0.534s0.19,0.393,0.241,0.482s0.267,0.355,0.267,0.47c0,0.115,0.025,0.293,0.103,0.293c0.076,0,0.152-0.203,0.24-0.331c0.091-0.126,0.116-0.305,0.153-0.432c0.038-0.127,0.038-0.356,0.038-0.444c0-0.09,0.075-0.166,0.255-0.242c0.178-0.076,0.304-0.292,0.456-0.407c0.153-0.115,0.141-0.305,0.446-0.305c0.305,0,0.278,0,0.355-0.077c0.076-0.076,0.151-0.127,0.19,0.013c0.038,0.14,0.254,0.343,0.292,0.394c0.038,0.052,0.114,0.191,0.103,0.344c-0.013,0.152,0.012,0.33,0.075,0.33s0.191-0.216,0.191-0.216s0.279-0.189,0.267,0.013c-0.014,0.203,0.025,0.419,0.025,0.545c0,0.053,0.042,0.135,0.088,0.21c-0.005,0.059-0.004,0.119-0.009,0.178C27.388,17.153,27.387,17.327,27.436,17.39zM20.382,12.064c0.076,0.05,0.102,0.127,0.152,0.203c0.052,0.076,0.14,0.05,0.203,0.114c0.063,0.064-0.178,0.14-0.075,0.216c0.101,0.077,0.151,0.381,0.165,0.458c0.013,0.076-0.279,0.114-0.369,0.102c-0.089-0.013-0.354-0.102-0.445-0.127c-0.089-0.026-0.139-0.343-0.025-0.331c0.116,0.013,0.141-0.025,0.267-0.139c0.128-0.115-0.189-0.166-0.278-0.191c-0.089-0.025-0.268-0.305-0.331-0.394c-0.062-0.089-0.014-0.228,0.141-0.331c0.076-0.051,0.279,0.063,0.381,0c0.101-0.063,0.203-0.14,0.241-0.165c0.039-0.025,0.293,0.038,0.33,0.114c0.039,0.076,0.191,0.191,0.141,0.229c-0.052,0.038-0.281,0.076-0.356,0c-0.075-0.077-0.255,0.012-0.268,0.152C20.242,12.115,20.307,12.013,20.382,12.064zM16.875,12.28c-0.077-0.025,0.025-0.178,0.102-0.229c0.075-0.051,0.164-0.178,0.241-0.305c0.076-0.127,0.178-0.14,0.241-0.127c0.063,0.013,0.203,0.241,0.241,0.318c0.038,0.076,0.165-0.026,0.217-0.051c0.05-0.025,0.127-0.102,0.14-0.165s0.127-0.102,0.254-0.102s0.013,0.102-0.076,0.127c-0.09,0.025-0.038,0.077,0.113,0.127c0.153,0.051,0.293,0.191,0.459,0.279c0.165,0.089,0.19,0.267,0.088,0.292c-0.101,0.025-0.406,0.051-0.521,0.038c-0.114-0.013-0.254-0.127-0.419-0.153c-0.165-0.025-0.369-0.013-0.433,0.077s-0.292,0.05-0.395,0.05c-0.102,0-0.228,0.127-0.253,0.077C16.875,12.534,16.951,12.306,16.875,12.28zM17.307,9.458c0.063-0.178,0.419,0.038,0.355,0.127C17.599,9.675,17.264,9.579,17.307,9.458zM17.802,18.584c0.063,0.102-0.14,0.431-0.254,0.407c-0.113-0.027-0.076-0.318-0.038-0.382C17.548,18.545,17.769,18.529,17.802,18.584zM13.189,12.674c0.025-0.051-0.039-0.153-0.127-0.013C13.032,12.71,13.164,12.725,13.189,12.674zM20.813,8.035c0.141,0.076,0.339,0.107,0.433,0.013c0.076-0.076,0.013-0.204-0.05-0.216c-0.064-0.013-0.104-0.115,0.062-0.203c0.165-0.089,0.343-0.204,0.534-0.229c0.19-0.025,0.622-0.038,0.774,0c0.152,0.039,0.382-0.166,0.445-0.254s-0.203-0.152-0.279-0.051c-0.077,0.102-0.444,0.076-0.521,0.051c-0.076-0.025-0.686,0.102-0.812,0.102c-0.128,0-0.179,0.152-0.356,0.229c-0.179,0.076-0.42,0.191-0.509,0.229c-0.088,0.038-0.177,0.19-0.101,0.216C20.509,7.947,20.674,7.959,20.813,8.035zM14.142,12.674c0.064-0.089-0.051-0.217-0.114-0.217c-0.12,0-0.178,0.191-0.103,0.254C14.002,12.776,14.078,12.763,14.142,12.674zM14.714,13.017c0.064,0.025,0.114,0.102,0.165,0.114c0.052,0.013,0.217,0,0.167-0.127s-0.167-0.127-0.204-0.127c-0.038,0-0.203-0.038-0.267,0C14.528,12.905,14.65,12.992,14.714,13.017zM11.308,10.958c0.101,0.013,0.217-0.063,0.305-0.101c0.088-0.038,0.216-0.114,0.216-0.229c0-0.114-0.025-0.216-0.077-0.267c-0.051-0.051-0.14-0.064-0.216-0.051c-0.115,0.02-0.127,0.14-0.203,0.14c-0.076,0-0.165,0.025-0.14,0.114s0.077,0.152,0,0.19C11.117,10.793,11.205,10.946,11.308,10.958zM11.931,10.412c0.127,0.051,0.394,0.102,0.292,0.153c-0.102,0.051-0.28,0.19-0.305,0.267s0.216,0.153,0.216,0.153s-0.077,0.089-0.013,0.114c0.063,0.025,0.102-0.089,0.203-0.089c0.101,0,0.304,0.063,0.406,0.063c0.103,0,0.267-0.14,0.254-0.229c-0.013-0.089-0.14-0.229-0.254-0.28c-0.113-0.051-0.241-0.28-0.317-0.331c-0.076-0.051,0.076-0.178-0.013-0.267c-0.09-0.089-0.153-0.076-0.255-0.14c-0.102-0.063-0.191,0.013-0.254,0.089c-0.063,0.076-0.14-0.013-0.217,0.012c-0.102,0.035-0.063,0.166-0.012,0.229C11.714,10.221,11.804,10.361,11.931,10.412zM24.729,17.198c-0.083,0.037-0.153,0.47,0,0.521c0.152,0.052,0.241-0.202,0.191-0.267C24.868,17.39,24.843,17.147,24.729,17.198zM20.114,20.464c-0.159-0.045-0.177,0.166-0.304,0.306c-0.128,0.141-0.267,0.254-0.317,0.241c-0.052-0.013-0.331,0.089-0.242,0.279c0.089,0.191,0.076,0.382-0.013,0.472c-0.089,0.088,0.076,0.342,0.052,0.482c-0.026,0.139,0.037,0.229,0.215,0.229s0.242-0.064,0.318-0.229c0.076-0.166,0.088-0.331,0.164-0.47c0.077-0.141,0.141-0.434,0.179-0.51c0.038-0.075,0.114-0.316,0.102-0.457C20.254,20.669,20.204,20.489,20.114,20.464zM10.391,8.802c-0.069-0.06-0.229-0.102-0.306-0.11c-0.076-0.008-0.152,0.06-0.321,0.06c-0.168,0-0.279,0.067-0.347,0C9.349,8.684,9.068,8.65,9.042,8.692C9.008,8.749,8.941,8.751,9.008,8.87c0.069,0.118,0.12,0.186,0.179,0.178s0.262-0.017,0.288,0.051C9.5,9.167,9.569,9.226,9.712,9.184c0.145-0.042,0.263-0.068,0.296-0.119c0.033-0.051,0.263-0.059,0.263-0.059S10.458,8.861,10.391,8.802z");
    }});
draw2d.shape.icon.Globe = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Globe", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM19.158,23.269c-0.079,0.064-0.183,0.13-0.105,0.207c0.078,0.078-0.09,0.131-0.09,0.17s0.104,0.246,0.052,0.336c-0.052,0.092-0.091,0.223-0.13,0.301c-0.039,0.077-0.131,0.155-0.104,0.272c0.025,0.116-0.104,0.077-0.104,0.194c0,0.116,0.116,0.065,0.09,0.208c-0.025,0.144-0.09,0.183-0.09,0.285c0,0.104,0.064,0.247,0.064,0.286s-0.064,0.17-0.155,0.272c-0.092,0.104-0.155,0.17-0.144,0.233c0.014,0.065,0.104,0.144,0.091,0.184c-0.013,0.037-0.129,0.168-0.116,0.259c0.014,0.09,0.129,0.053,0.155,0.116c0.026,0.065-0.155,0.118-0.078,0.183c0.078,0.064,0.183,0.051,0.156,0.208c-0.019,0.112,0.064,0.163,0.126,0.198c-0.891,0.221-1.818,0.352-2.777,0.352C9.639,27.533,4.466,22.36,4.466,16c0-2.073,0.557-4.015,1.518-5.697c0.079-0.042,0.137-0.069,0.171-0.062c0.065,0.013,0.079,0.104,0.183,0.13c0.104,0.026,0.195-0.078,0.26-0.117c0.064-0.039,0.116-0.195,0.051-0.182c-0.065,0.013-0.234,0-0.234,0s0.183-0.104,0.183-0.169s0.025-0.169,0.129-0.208C6.83,9.655,6.83,9.681,6.765,9.837C6.7,9.993,6.896,9.928,6.973,9.863s0.13-0.013,0.272-0.104c0.143-0.091,0.143-0.143,0.221-0.143c0.078,0,0.221,0.143,0.299,0.091c0.077-0.052,0.299,0.065,0.429,0.065c0.129,0,0.545,0.169,0.624,0.169c0.078,0,0.312,0.09,0.325,0.259c0.013,0.169,0.09,0.156,0.168,0.156s0.26,0.065,0.26,0.13c0,0.065-0.052,0.325,0.078,0.39c0.129,0.064,0.247,0.169,0.299,0.143c0.052-0.026,0-0.233-0.064-0.26c-0.065-0.026-0.027-0.117-0.052-0.169c-0.026-0.051,0.078-0.051,0.117,0.039c0.039,0.091,0.143,0.26,0.208,0.26c0.064,0,0.208,0.156,0.168,0.247c-0.039,0.091,0.039,0.221,0.156,0.221c0.116,0,0.26,0.182,0.312,0.195c0.052,0.013,0.117,0.078,0.117,0.117c0,0.04,0.065,0.26,0.065,0.351c0,0.09-0.04,0.454-0.053,0.597s0.104,0.39,0.234,0.52c0.129,0.13,0.246,0.377,0.324,0.429c0.079,0.052,0.13,0.195,0.247,0.182c0.117-0.013,0.195,0.078,0.299,0.26c0.104,0.182,0.208,0.48,0.286,0.506c0.078,0.026,0.208,0.117,0.142,0.182c-0.064,0.064-0.168,0.208-0.051,0.208c0.117,0,0.156-0.065,0.247,0.053c0.09,0.116,0.208,0.181,0.194,0.26c-0.013,0.077,0.104,0.103,0.156,0.116c0.052,0.013,0.169,0.247,0.286,0.143c0.117-0.104-0.155-0.259-0.234-0.326c-0.078-0.064,0-0.207-0.182-0.35c-0.182-0.143-0.156-0.247-0.286-0.351c-0.13-0.104-0.233-0.195-0.104-0.286c0.13-0.091,0.143,0.091,0.195,0.208c0.052,0.116,0.324,0.351,0.441,0.454c0.117,0.104,0.326,0.468,0.39,0.468s0.247,0.208,0.247,0.208s0.103,0.168,0.064,0.22c-0.039,0.052,0.053,0.247,0.144,0.299c0.09,0.052,0.455,0.22,0.507,0.247c0.052,0.027,0.155,0.221,0.299,0.221c0.142,0,0.247,0.014,0.286,0.053c0.039,0.038,0.155,0.194,0.234,0.104c0.078-0.092,0.09-0.131,0.208-0.131c0.117,0,0.168,0.091,0.233,0.156c0.065,0.065,0.247,0.235,0.338,0.222c0.091-0.013,0.208,0.104,0.273,0.064s0.169,0.025,0.22,0.052c0.054,0.026,0.234,0.118,0.222,0.272c-0.013,0.157,0.103,0.195,0.182,0.234c0.078,0.039,0.182,0.13,0.248,0.195c0.064,0.063,0.206,0.077,0.246,0.116c0.039,0.039,0.065,0.117,0.182,0.052c0.116-0.064,0.092-0.181,0.092-0.181s0.129-0.026,0.194,0.026c0.064,0.05,0.104,0.22,0.144,0.246c0.038,0.026,0.115,0.221,0.063,0.362c-0.051,0.145-0.038,0.286-0.091,0.286c-0.052,0-0.116,0.17-0.195,0.209c-0.076,0.039-0.285,0.221-0.272,0.286c0.013,0.063,0.131,0.258,0.104,0.35c-0.025,0.091-0.194,0.195-0.154,0.338c0.038,0.144,0.312,0.183,0.323,0.312c0.014,0.131,0.209,0.417,0.235,0.546c0.025,0.13,0.246,0.272,0.246,0.453c0,0.184,0.312,0.3,0.377,0.312c0.063,0.013,0.182,0.131,0.272,0.17s0.169,0.116,0.233,0.221s0.053,0.261,0.053,0.299c0,0.039-0.039,0.44-0.078,0.674C19.145,23.021,19.235,23.203,19.158,23.269zM10.766,11.188c0.039,0.013,0.117,0.091,0.156,0.091c0.04,0,0.234,0.156,0.286,0.208c0.053,0.052,0.053,0.195-0.013,0.208s-0.104-0.143-0.117-0.208c-0.013-0.065-0.143-0.065-0.208-0.104C10.805,11.344,10.66,11.152,10.766,11.188zM27.51,16.41c-0.144,0.182-0.13,0.272-0.195,0.286c-0.064,0.013,0.065,0.065,0.09,0.194c0.022,0.112-0.065,0.224,0.063,0.327c-0.486,4.619-3.71,8.434-8.016,9.787c-0.007-0.011-0.019-0.025-0.021-0.034c-0.027-0.078-0.027-0.233,0.064-0.285c0.091-0.053,0.312-0.233,0.363-0.272c0.052-0.04,0.13-0.221,0.091-0.247c-0.038-0.026-0.232,0-0.26-0.039c-0.026-0.039-0.026-0.092,0.104-0.182c0.13-0.091,0.195-0.222,0.247-0.26c0.052-0.039,0.155-0.117,0.195-0.209c0.038-0.09-0.041-0.039-0.118-0.039s-0.117-0.142-0.117-0.207s0.195,0.026,0.339,0.052c0.143,0.024,0.077-0.065,0.064-0.142c-0.013-0.078,0.026-0.209,0.105-0.17c0.076,0.039,0.479-0.013,0.531-0.026c0.052-0.013,0.194-0.246,0.246-0.312c0.053-0.065,0.064-0.129,0-0.168c-0.065-0.04-0.143-0.184-0.168-0.221c-0.026-0.041-0.039-0.274-0.013-0.34c0.025-0.063,0,0.377,0.181,0.43c0.183,0.052,0.286,0.078,0.455-0.078c0.169-0.155,0.298-0.26,0.312-0.363c0.013-0.104,0.052-0.209,0.117-0.246c0.065-0.039,0.104,0.103,0.182-0.065c0.078-0.17,0.156-0.157,0.234-0.299c0.077-0.144-0.13-0.325,0.024-0.43c0.157-0.103,0.43-0.233,0.43-0.233s0.078-0.039,0.234-0.078c0.155-0.038,0.324-0.014,0.376-0.09c0.052-0.079,0.104-0.247,0.182-0.338c0.079-0.092,0.169-0.234,0.13-0.299c-0.039-0.065,0.104-0.352,0.091-0.429c-0.013-0.078-0.13-0.261,0.065-0.416s0.402-0.391,0.416-0.454c0.012-0.065,0.169-0.338,0.154-0.469c-0.012-0.129-0.154-0.285-0.245-0.325c-0.092-0.037-0.286-0.05-0.364-0.154s-0.299-0.208-0.377-0.182c-0.077,0.026-0.208,0.051-0.312-0.015c-0.104-0.063-0.272-0.143-0.337-0.194c-0.066-0.051-0.234-0.09-0.312-0.09s-0.065-0.053-0.182,0.103c-0.117,0.157,0,0.209-0.208,0.182c-0.209-0.024,0.025-0.038,0.144-0.194c0.115-0.155-0.014-0.247-0.144-0.207c-0.13,0.039-0.039,0.117-0.247,0.156c-0.207,0.038-0.207-0.092-0.077-0.117c0.13-0.026,0.363-0.143,0.363-0.194c0-0.053-0.026-0.196-0.13-0.196s-0.078-0.129-0.233-0.297c-0.156-0.17-0.351-0.274-0.508-0.249c-0.154,0.026-0.272,0.065-0.35-0.076c-0.078-0.144-0.169-0.17-0.222-0.247c-0.051-0.078-0.182,0-0.221-0.039s-0.039-0.039-0.039-0.039s-0.169,0.039-0.077-0.078c0.09-0.117,0.129-0.338,0.09-0.325c-0.038,0.013-0.104,0.196-0.168,0.183c-0.064-0.013-0.014-0.04-0.144-0.117c-0.13-0.078-0.337-0.013-0.337,0.052c0,0.065-0.065,0.117-0.065,0.117s-0.039-0.038-0.078-0.117c-0.039-0.078-0.221-0.091-0.312-0.013c-0.09,0.078-0.142-0.196-0.207-0.196s-0.194,0.065-0.26,0.184c-0.064,0.116-0.038,0.285-0.092,0.272c-0.05-0.013-0.063-0.233-0.05-0.312c0.012-0.079,0.155-0.208,0.05-0.234c-0.103-0.026-0.259,0.13-0.323,0.143c-0.065,0.013-0.195,0.104-0.273,0.209c-0.077,0.103-0.116,0.168-0.195,0.207c-0.077,0.039-0.193,0-0.167-0.039c0.025-0.039-0.222-0.181-0.261-0.13c-0.04,0.052-0.155,0.091-0.272,0.144c-0.117,0.052-0.222-0.065-0.247-0.117s-0.079-0.064-0.091-0.234c-0.013-0.168,0.027-0.351,0.065-0.454c0.038-0.104-0.195-0.312-0.286-0.3c-0.091,0.015-0.182,0.105-0.272,0.091c-0.092-0.012-0.052-0.038-0.195-0.038c-0.143,0-0.026-0.025,0-0.143c0.025-0.116-0.052-0.273,0.092-0.377c0.142-0.104,0.091-0.351,0-0.363c-0.092-0.014-0.261,0.039-0.377,0.026c-0.116-0.014-0.208,0.091-0.169,0.207c0.039,0.117-0.065,0.195-0.104,0.183c-0.039-0.013-0.09-0.078-0.234,0.026c-0.142,0.103-0.194,0.064-0.337-0.052c-0.143-0.118-0.299-0.234-0.325-0.416c-0.026-0.182-0.04-0.364,0.013-0.468c0.051-0.104,0.051-0.285-0.026-0.312c-0.078-0.025,0.09-0.155,0.181-0.181c0.092-0.026,0.234-0.143,0.26-0.195c0.026-0.052,0.156-0.04,0.298-0.04c0.143,0,0.169,0,0.312,0.078c0.143,0.078,0.169-0.039,0.169-0.078c0-0.039,0.052-0.117,0.208-0.104c0.156,0.013,0.376-0.052,0.416-0.013s0.116,0.195,0.194,0.143c0.079-0.051,0.104-0.143,0.131,0.014c0.025,0.155,0.09,0.39,0.208,0.429c0.116,0.039,0.052,0.194,0.168,0.207c0.115,0.013,0.17-0.246,0.131-0.337c-0.04-0.09-0.118-0.363-0.183-0.428c-0.064-0.065-0.064-0.234,0.064-0.286c0.13-0.052,0.442-0.312,0.532-0.389c0.092-0.079,0.338-0.144,0.261-0.248c-0.078-0.104-0.104-0.168-0.104-0.247s0.078-0.052,0.117,0s0.194-0.078,0.155-0.143c-0.038-0.064-0.026-0.155,0.065-0.143c0.091,0.013,0.116-0.065,0.078-0.117c-0.039-0.052,0.091-0.117,0.182-0.091c0.092,0.026,0.325-0.013,0.364-0.065c0.038-0.052-0.078-0.104-0.078-0.208c0-0.104,0.155-0.195,0.247-0.208c0.091-0.013,0.207,0,0.221-0.039c0.012-0.039,0.143-0.143,0.155-0.052c0.014,0.091,0,0.247,0.104,0.247c0.104,0,0.232-0.117,0.272-0.129c0.038-0.013,0.286-0.065,0.338-0.078c0.052-0.013,0.363-0.039,0.325-0.13c-0.039-0.09-0.078-0.181-0.118-0.22c-0.039-0.039-0.077,0.013-0.13,0.078c-0.051,0.065-0.143,0.065-0.168,0.013c-0.026-0.051,0.012-0.207-0.078-0.156c-0.092,0.052-0.104,0.104-0.157,0.078c-0.052-0.026-0.103-0.117-0.103-0.117s0.129-0.064,0.038-0.182c-0.09-0.117-0.221-0.091-0.35-0.025c-0.13,0.064-0.118,0.051-0.273,0.09s-0.234,0.078-0.234,0.078s0.209-0.129,0.299-0.208c0.091-0.078,0.209-0.117,0.286-0.195c0.078-0.078,0.285,0.039,0.285,0.039s0.105-0.104,0.105-0.039s-0.027,0.234,0.051,0.234c0.079,0,0.299-0.104,0.21-0.131c-0.093-0.026,0.129,0,0.219-0.065c0.092-0.065,0.194-0.065,0.247-0.09c0.052-0.026,0.092-0.143,0.182-0.143c0.092,0,0.13,0.117,0,0.195s-0.143,0.273-0.208,0.325c-0.064,0.052-0.026,0.117,0.078,0.104c0.104-0.013,0.194,0.013,0.286-0.013s0.143,0.026,0.168,0.065c0.026,0.039,0.104-0.039,0.104-0.039s0.169-0.039,0.221,0.026c0.053,0.064,0.092-0.039,0.053-0.104c-0.039-0.064-0.092-0.129-0.13-0.208c-0.039-0.078-0.091-0.104-0.194-0.078c-0.104,0.026-0.13-0.026-0.195-0.064c-0.065-0.04-0.118,0.052-0.065-0.04c0.053-0.09,0.078-0.117,0.117-0.195c0.039-0.078,0.209-0.221,0.039-0.259c-0.169-0.04-0.222-0.065-0.247-0.143c-0.026-0.078-0.221-0.221-0.272-0.221c-0.053,0-0.233,0-0.247-0.065c-0.013-0.065-0.143-0.208-0.208-0.273c-0.064-0.065-0.312-0.351-0.351-0.377c-0.039-0.026-0.091-0.013-0.208,0.143c-0.116,0.157-0.22,0.183-0.312,0.144c-0.091-0.039-0.104-0.026-0.193-0.13c-0.093-0.104,0.09-0.117,0.051-0.182c-0.04-0.064-0.247-0.091-0.377-0.104c-0.13-0.013-0.221-0.156-0.416-0.169c-0.194-0.013-0.428,0.026-0.493,0.026c-0.064,0-0.064,0.091-0.09,0.234c-0.027,0.143,0.09,0.182-0.027,0.208c-0.116,0.026-0.169,0.039-0.052,0.091c0.117,0.052,0.273,0.26,0.273,0.26s0,0.117-0.092,0.182c-0.09,0.065-0.182,0.13-0.233,0.053c-0.053-0.079-0.195-0.065-0.155,0.013c0.038,0.078,0.116,0.117,0.116,0.195c0,0.077,0.117,0.272,0.039,0.337c-0.078,0.065-0.168,0.014-0.233,0.026s-0.131-0.104-0.078-0.13c0.051-0.026-0.014-0.221-0.014-0.221s-0.155,0.221-0.143,0.104c0.014-0.117-0.064-0.13-0.064-0.221c0-0.091-0.079-0.13-0.194-0.104c-0.118,0.026-0.26-0.04-0.482-0.079c-0.22-0.039-0.311-0.064-0.493-0.156c-0.182-0.091-0.247-0.026-0.338-0.013c-0.091,0.013-0.052-0.182-0.169-0.207c-0.116-0.027-0.181,0.025-0.207-0.144c-0.026-0.168,0.039-0.208,0.324-0.39c0.286-0.182,0.247-0.26,0.468-0.286c0.22-0.026,0.325,0.026,0.325-0.039s0.052-0.325,0.052-0.195S16.95,9.109,16.832,9.2c-0.116,0.091-0.052,0.104,0.04,0.104c0.091,0,0.259-0.091,0.259-0.091s0.208-0.091,0.26-0.013c0.053,0.078,0.053,0.156,0.144,0.156s0.285-0.104,0.116-0.195c-0.168-0.091-0.272-0.078-0.376-0.182s-0.078-0.065-0.195-0.039c-0.116,0.026-0.116-0.039-0.156-0.039s-0.104,0.026-0.13-0.026c-0.025-0.052,0.014-0.065,0.145-0.065c0.129,0,0.285,0.039,0.285,0.039s0.155-0.052,0.194-0.065c0.039-0.013,0.247-0.039,0.208-0.155c-0.04-0.117-0.169-0.117-0.208-0.156s0.078-0.09,0.143-0.117c0.065-0.026,0.247,0,0.247,0s0.117,0.013,0.117-0.039S17.897,8.2,17.976,8.239s0,0.156,0.117,0.13c0.116-0.026,0.143,0,0.207,0.039c0.065,0.039-0.013,0.195-0.077,0.221c-0.065,0.025-0.169,0.077-0.026,0.09c0.144,0.014,0.246,0.014,0.246,0.014s0.092-0.091,0.131-0.169c0.038-0.078,0.104-0.026,0.155,0c0.052,0.025,0.247,0.065,0.065,0.117c-0.183,0.052-0.221,0.117-0.26,0.182c-0.038,0.065-0.053,0.104-0.221,0.065c-0.17-0.039-0.26-0.026-0.299,0.039c-0.039,0.064-0.013,0.273,0.053,0.247c0.063-0.026,0.129-0.026,0.207-0.052c0.078-0.026,0.39,0.026,0.467,0.013c0.078-0.013,0.209,0.13,0.248,0.104c0.039-0.026,0.117,0.052,0.194,0.104c0.078,0.052,0.052-0.117,0.194-0.013c0.144,0.104,0.065,0.104,0.144,0.104c0.076,0,0.246,0.013,0.246,0.013s0.014-0.129,0.144-0.104c0.13,0.026,0.245,0.169,0.232,0.064c-0.012-0.103,0.013-0.181-0.09-0.259c-0.104-0.078-0.272-0.13-0.299-0.169c-0.026-0.039-0.052-0.091-0.013-0.117c0.039-0.025,0.221,0.013,0.324,0.079c0.104,0.065,0.195,0.13,0.273,0.078c0.077-0.052,0.17-0.078,0.208-0.117c0.038-0.04,0.13-0.156,0.13-0.156s-0.391-0.051-0.441-0.117c-0.053-0.065-0.235-0.156-0.287-0.156s-0.194,0.091-0.246-0.039s-0.052-0.286-0.105-0.299c-0.05-0.013-0.597-0.091-0.674-0.13c-0.078-0.039-0.39-0.13-0.507-0.195s-0.286-0.156-0.389-0.156c-0.104,0-0.533,0.052-0.611,0.039c-0.078-0.013-0.312,0.026-0.403,0.039c-0.091,0.013,0.117,0.182-0.077,0.221c-0.195,0.039-0.169,0.065-0.13-0.13c0.038-0.195-0.131-0.247-0.299-0.169c-0.169,0.078-0.442,0.13-0.377,0.221c0.065,0.091-0.012,0.157,0.117,0.247c0.13,0.091,0.183,0.117,0.35,0.104c0.17-0.013,0.339,0.025,0.339,0.025s0,0.157-0.064,0.182c-0.065,0.026-0.169,0.026-0.196,0.104c-0.025,0.078-0.155,0.117-0.155,0.078s0.065-0.169-0.026-0.234c-0.09-0.065-0.117-0.078-0.221-0.013c-0.104,0.065-0.116,0.091-0.169-0.013C16.053,8.291,15.897,8.2,15.897,8.2s-0.104-0.129-0.182-0.194c-0.077-0.065-0.22-0.052-0.234,0.013c-0.013,0.064,0.026,0.129,0.078,0.247c0.052,0.117,0.104,0.337,0.013,0.351c-0.091,0.013-0.104,0.026-0.195,0.052c-0.091,0.026-0.13-0.039-0.13-0.143s-0.04-0.195-0.013-0.234c0.026-0.039-0.104,0.027-0.234,0c-0.13-0.025-0.233,0.052-0.104,0.092c0.13,0.039,0.157,0.194,0.039,0.233c-0.117,0.039-0.559,0-0.702,0s-0.35,0.039-0.39-0.039c-0.039-0.078,0.118-0.129,0.208-0.129c0.091,0,0.363,0.012,0.467-0.13c0.104-0.143-0.13-0.169-0.233-0.169c-0.104,0-0.183-0.039-0.299-0.155c-0.118-0.117,0.078-0.195,0.052-0.247c-0.026-0.052-0.156-0.014-0.272-0.014c-0.117,0-0.299-0.09-0.299,0.014c0,0.104,0.143,0.402,0.052,0.337c-0.091-0.064-0.078-0.156-0.143-0.234c-0.065-0.078-0.168-0.065-0.299-0.052c-0.129,0.013-0.35,0.052-0.415,0.039c-0.064-0.013-0.013-0.013-0.156-0.078c-0.142-0.065-0.208-0.052-0.312-0.117C12.091,7.576,12.182,7.551,12,7.538c-0.181-0.013-0.168,0.09-0.35,0.065c-0.182-0.026-0.234,0.013-0.416,0c-0.182-0.013-0.272-0.026-0.299,0.065c-0.025,0.091-0.078,0.247-0.156,0.247c-0.077,0-0.169,0.091,0.078,0.104c0.247,0.013,0.105,0.129,0.325,0.117c0.221-0.013,0.416-0.013,0.468-0.117c0.052-0.104,0.091-0.104,0.117-0.065c0.025,0.039,0.22,0.272,0.22,0.272s0.131,0.104,0.183,0.13c0.051,0.026-0.052,0.143-0.156,0.078c-0.104-0.065-0.299-0.051-0.377-0.116c-0.078-0.065-0.429-0.065-0.52-0.052c-0.09,0.013-0.247-0.039-0.299-0.039c-0.051,0-0.221,0.13-0.221,0.13S10.532,8.252,10.494,8.2c-0.039-0.052-0.104,0.052-0.156,0.065c-0.052,0.013-0.208-0.104-0.364-0.052C9.818,8.265,9.87,8.317,9.649,8.304s-0.272-0.052-0.35-0.039C9.22,8.278,9.22,8.278,9.22,8.278S9.233,8.33,9.143,8.382C9.052,8.434,8.986,8.499,8.921,8.421C8.857,8.343,8.818,8.343,8.779,8.33c-0.04-0.013-0.118-0.078-0.286-0.04C8.324,8.33,8.064,8.239,8.013,8.239c-0.04,0-0.313-0.015-0.491-0.033c2.109-2.292,5.124-3.74,8.478-3.74c2.128,0,4.117,0.589,5.83,1.598c-0.117,0.072-0.319,0.06-0.388,0.023c-0.078-0.043-0.158-0.078-0.475-0.061c-0.317,0.018-0.665,0.122-0.595,0.226c0.072,0.104-0.142,0.165-0.197,0.113c-0.055-0.052-0.309,0.06-0.293,0.165c0.016,0.104-0.039,0.225-0.175,0.199c-0.134-0.027-0.229,0.06-0.237,0.146c-0.007,0.087-0.309,0.147-0.332,0.147c-0.024,0-0.412-0.008-0.27,0.095c0.097,0.069,0.15,0.027,0.27,0.052c0.119,0.026,0.214,0.217,0.277,0.243c0.062,0.026,0.15,0,0.189-0.052c0.04-0.052,0.095-0.234,0.095-0.234s0,0.173,0.097,0.208c0.095,0.035,0.331-0.026,0.395-0.017c0.064,0.008,0.437,0.061,0.538,0.112c0.104,0.052,0.356,0.087,0.428,0.199c0.071,0.113,0.08,0.503,0.119,0.546c0.04,0.043,0.174-0.139,0.205-0.182c0.031-0.044,0.198-0.018,0.254,0.042c0.056,0.061,0.182,0.208,0.175,0.269C21.9,8.365,21.877,8.459,21.83,8.425c-0.048-0.034-0.127-0.025-0.096-0.095c0.032-0.069,0.048-0.217-0.015-0.217c-0.064,0-0.119,0-0.119,0s-0.12-0.035-0.199,0.095s-0.015,0.26,0.04,0.26s0.184,0,0.184,0.034c0,0.035-0.136,0.139-0.128,0.2c0.009,0.061,0.11,0.268,0.144,0.312c0.031,0.043,0.197,0.086,0.244,0.096c0.049,0.008-0.111,0.017-0.07,0.077c0.04,0.061,0.102,0.208,0.189,0.243c0.087,0.035,0.333,0.19,0.363,0.26c0.032,0.069,0.222-0.052,0.262-0.061c0.04-0.008,0.032,0.182,0.143,0.191c0.11,0.008,0.15-0.018,0.245-0.096s0.072-0.182,0.079-0.26c0.009-0.078,0-0.138,0.104-0.113c0.104,0.026,0.158-0.018,0.15-0.104c-0.008-0.087-0.095-0.191,0.07-0.217c0.167-0.026,0.254-0.138,0.357-0.138c0.103,0,0.389,0.043,0.419,0c0.032-0.043,0.167-0.243,0.254-0.251c0.067-0.007,0.224-0.021,0.385-0.042c1.582,1.885,2.561,4.284,2.673,6.905c-0.118,0.159-0.012,0.305,0.021,0.408c0.001,0.03,0.005,0.058,0.005,0.088c0,0.136-0.016,0.269-0.021,0.404C27.512,16.406,27.512,16.408,27.51,16.41zM17.794,12.084c-0.064,0.013-0.169-0.052-0.169-0.143s-0.091,0.169-0.04,0.247c0.053,0.078-0.104,0.169-0.155,0.169s-0.091-0.116-0.078-0.233c0.014-0.117-0.077-0.221-0.221-0.208c-0.143,0.014-0.208,0.13-0.259,0.169c-0.053,0.039-0.053,0.259-0.04,0.312s0.013,0.235-0.116,0.221c-0.118-0.013-0.092-0.233-0.079-0.312c0.014-0.078-0.039-0.273,0.014-0.376c0.053-0.104,0.207-0.143,0.312-0.156s0.324,0.065,0.363,0.052c0.04-0.014,0.222-0.014,0.312,0C17.729,11.837,17.858,12.071,17.794,12.084zM18.027,12.123c0.04,0.026,0.311-0.039,0.364,0.026c0.051,0.065-0.054,0.078-0.183,0.13c-0.129,0.052-0.169,0.039-0.221,0.104s-0.221,0.09-0.299,0.168c-0.078,0.079-0.217,0.125-0.246,0.065c-0.04-0.078,0.013-0.039,0.025-0.078c0.013-0.039,0.245-0.129,0.245-0.129S17.988,12.097,18.027,12.123zM16.988,11.668c-0.038,0.013-0.182-0.026-0.3-0.026c-0.116,0-0.091-0.078-0.143-0.064c-0.051,0.013-0.168,0.039-0.247,0.078c-0.078,0.039-0.208,0.03-0.208-0.04c0-0.104,0.052-0.078,0.221-0.143c0.169-0.065,0.352-0.247,0.429-0.169c0.078,0.078,0.221,0.169,0.312,0.182C17.144,11.5,17.026,11.655,16.988,11.668zM15.659,7.637c-0.079,0.026-0.347,0.139-0.321,0.199c0.01,0.023,0.078,0.069,0.19,0.052c0.113-0.018,0.276-0.035,0.355-0.043c0.078-0.009,0.095-0.139,0.009-0.147C15.805,7.689,15.736,7.611,15.659,7.637zM14.698,7.741c-0.061,0.026-0.243-0.043-0.338,0.018c-0.061,0.038-0.026,0.164,0.07,0.172c0.095,0.009,0.259-0.06,0.276-0.008c0.018,0.052,0.078,0.286,0.234,0.208c0.156-0.078,0.147-0.147,0.19-0.156c0.043-0.009-0.008-0.199-0.078-0.243C14.983,7.689,14.758,7.715,14.698,7.741zM14.385,7.005c0.017,0.044-0.008,0.078,0.113,0.095c0.121,0.018,0.173,0.035,0.243,0.035c0.069,0,0.042-0.113-0.018-0.19c-0.061-0.078-0.043-0.069-0.199-0.113c-0.156-0.043-0.312-0.043-0.416-0.035c-0.104,0.009-0.217-0.017-0.243,0.104c-0.013,0.062,0.07,0.112,0.174,0.112S14.368,6.962,14.385,7.005zM14.611,7.481c0.043,0.095,0.043,0.051,0.165,0.061C14.896,7.551,14.991,7.421,15,7.378c0.009-0.044-0.061-0.13-0.225-0.113c-0.165,0.017-0.667-0.026-0.736,0.034c-0.066,0.058,0,0.233-0.026,0.251c-0.026,0.017,0.009,0.095,0.077,0.078c0.069-0.017,0.104-0.182,0.157-0.182C14.299,7.447,14.568,7.386,14.611,7.481zM12.982,7.126c0.052,0.043,0.183,0.008,0.173-0.035c-0.008-0.043,0.053-0.217-0.051-0.225C13,6.858,12.854,6.962,12.697,7.014c-0.101,0.033-0.078,0.13-0.009,0.13S12.931,7.083,12.982,7.126zM13.72,7.282c-0.087,0.043-0.114,0.069-0.191,0.052c-0.078-0.017-0.078-0.156-0.217-0.13c-0.138,0.026-0.164,0.104-0.207,0.139s-0.139,0.061-0.173,0.043c-0.034-0.017-0.234-0.129-0.234-0.129s-0.416-0.018-0.433-0.07c-0.017-0.052-0.086-0.138-0.277-0.121s-0.52,0.13-0.572,0.13c-0.052,0,0.062,0.104-0.009,0.104c-0.069,0-0.155-0.008-0.181,0.069c-0.018,0.053,0.078,0.052,0.189,0.052c0.112,0,0.295,0,0.347-0.026c0.052-0.026,0.312-0.087,0.303-0.009c-0.009,0.079,0.104,0.199,0.164,0.182c0.061-0.017,0.183-0.13,0.243-0.086c0.061,0.043,0.07,0.146,0.13,0.173c0.061,0.025,0.226,0.025,0.304,0c0.077-0.027,0.294-0.027,0.389-0.009c0.095,0.018,0.373,0.069,0.399,0.018c0.026-0.053,0.104-0.061,0.112-0.113s0.051-0.216,0.051-0.216S13.806,7.239,13.72,7.282zM18.105,16.239c-0.119,0.021-0.091,0.252,0.052,0.21C18.3,16.407,18.223,16.217,18.105,16.239zM19.235,15.929c-0.104-0.026-0.221,0-0.299,0.013c-0.078,0.013-0.299,0.208-0.299,0.208s0.143,0.026,0.233,0.026c0.092,0,0.144,0.051,0.221,0.09c0.078,0.04,0.221-0.052,0.272-0.052c0.053,0,0.118,0.156,0.131-0.013C19.508,16.032,19.339,15.955,19.235,15.929zM15.616,7.507c-0.043-0.104-0.259-0.139-0.304-0.035C15.274,7.563,15.659,7.611,15.616,7.507zM18.093,15.292c0.143-0.026,0.064-0.144-0.053-0.13C17.922,15.175,17.949,15.318,18.093,15.292zM19.82,16.095c-0.119,0.022-0.092,0.253,0.051,0.211C20.015,16.264,19.937,16.074,19.82,16.095zM18.247,15.708c-0.09,0.013-0.285-0.09-0.389-0.182c-0.104-0.091-0.299-0.091-0.377-0.091c-0.077,0-0.39,0.091-0.39,0.091c-0.013,0.13,0.117,0.091,0.273,0.091s0.429-0.026,0.479,0.039c0.053,0.064,0.286,0.168,0.352,0.221c0.064,0.052,0.272,0.065,0.285,0.013S18.338,15.695,18.247,15.708zM16.698,7.412c-0.13-0.009-0.295-0.009-0.399,0c-0.104,0.008-0.182-0.069-0.26-0.113c-0.077-0.043-0.251-0.182-0.354-0.199c-0.104-0.017-0.086-0.017-0.303-0.069c-0.11-0.027-0.294-0.061-0.294-0.086c0-0.026-0.052,0.121,0.043,0.165c0.095,0.043,0.251,0.121,0.363,0.164c0.114,0.043,0.329,0.052,0.399,0.139c0.069,0.086,0.303,0.156,0.303,0.156l0.277,0.026c0,0,0.191-0.043,0.39-0.026c0.199,0.017,0.493,0.043,0.659,0.035c0.163-0.008,0.189-0.061,0.208-0.095c0.016-0.035-0.304-0.104-0.383-0.095C17.271,7.42,16.827,7.42,16.698,7.412zM17.182,9.404c-0.034,0.039,0.157,0.095,0.191,0.043C17.407,9.396,17.271,9.309,17.182,9.404zM17.764,9.585c0.086-0.035,0.043-0.139-0.079-0.104C17.547,9.521,17.676,9.62,17.764,9.585z");
    }});
draw2d.shape.icon.Warning = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Warning", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M29.225,23.567l-3.778-6.542c-1.139-1.972-3.002-5.2-4.141-7.172l-3.778-6.542c-1.14-1.973-3.003-1.973-4.142,0L9.609,9.853c-1.139,1.972-3.003,5.201-4.142,7.172L1.69,23.567c-1.139,1.974-0.207,3.587,2.071,3.587h23.391C29.432,27.154,30.363,25.541,29.225,23.567zM16.536,24.58h-2.241v-2.151h2.241V24.58zM16.428,20.844h-2.023l-0.201-9.204h2.407L16.428,20.844z");
    }});
draw2d.shape.icon.Code = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Code", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M8.982,7.107L0.322,15.77l8.661,8.662l3.15-3.15L6.621,15.77l5.511-5.511L8.982,7.107zM21.657,7.107l-3.148,3.151l5.511,5.511l-5.511,5.511l3.148,3.15l8.662-8.662L21.657,7.107z");
    }});
draw2d.shape.icon.Pensil = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Pensil", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.31,2.872l-3.384-2.127c-0.854-0.536-1.979-0.278-2.517,0.576l-1.334,2.123l6.474,4.066l1.335-2.122C26.42,4.533,26.164,3.407,25.31,2.872zM6.555,21.786l6.474,4.066L23.581,9.054l-6.477-4.067L6.555,21.786zM5.566,26.952l-0.143,3.819l3.379-1.787l3.14-1.658l-6.246-3.925L5.566,26.952z");
    }});
draw2d.shape.icon.Pen = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Pen", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M13.587,12.074c-0.049-0.074-0.11-0.147-0.188-0.202c-0.333-0.243-0.803-0.169-1.047,0.166c-0.244,0.336-0.167,0.805,0.167,1.048c0.303,0.22,0.708,0.167,0.966-0.091l-7.086,9.768l-2.203,7.997l6.917-4.577L26.865,4.468l-4.716-3.42l-1.52,2.096c-0.087-0.349-0.281-0.676-0.596-0.907c-0.73-0.529-1.751-0.369-2.28,0.363C14.721,6.782,16.402,7.896,13.587,12.074zM10.118,25.148L6.56,27.503l1.133-4.117L10.118,25.148zM14.309,11.861c2.183-3.225,1.975-4.099,3.843-6.962c0.309,0.212,0.664,0.287,1.012,0.269L14.309,11.861z");
    }});
draw2d.shape.icon.Plus = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Plus", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.979,12.896 19.312,12.896 19.312,6.229 12.647,6.229 12.647,12.896 5.979,12.896 5.979,19.562 12.647,19.562 12.647,26.229 19.312,26.229 19.312,19.562 25.979,19.562z");
    }});
draw2d.shape.icon.Minus = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Minus", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.979,12.896,5.979,12.896,5.979,19.562,25.979,19.562z");
    }});
draw2d.shape.icon.TShirt = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.TShirt", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.1,4.039c-0.681,1.677-2.32,2.862-4.24,2.862c-1.921,0-3.56-1.185-4.24-2.862L1.238,8.442l2.921,6.884l3.208-1.361V28h17.099V14.015l3.093,1.312l2.922-6.884L20.1,4.039z");
    }});
draw2d.shape.icon.Sticker = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Sticker", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.5,1.999c-1.042,0-1.916,0.377-2.57,1.088L2.895,13.138C2.302,13.784,1.999,14.58,1.999,15.5C1.999,22.943,8.057,29,15.5,29S29,22.943,29,15.5S22.943,1.999,15.5,1.999zM15.5,28C8.596,28,3,22.404,3,15.5c0-3.452,5.239-2.737,7.501-4.999C12.762,8.239,12.048,3,15.5,3C22.404,3,28,8.597,28,15.5S22.404,28,15.5,28z");
    }});
draw2d.shape.icon.Page2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Page2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M23.024,5.673c-1.744-1.694-3.625-3.051-5.168-3.236c-0.084-0.012-0.171-0.019-0.263-0.021H7.438c-0.162,0-0.322,0.063-0.436,0.18C6.889,2.71,6.822,2.87,6.822,3.033v25.75c0,0.162,0.063,0.317,0.18,0.435c0.117,0.116,0.271,0.179,0.436,0.179h18.364c0.162,0,0.317-0.062,0.434-0.179c0.117-0.117,0.182-0.272,0.182-0.435V11.648C26.382,9.659,24.824,7.49,23.024,5.673zM22.157,6.545c0.805,0.786,1.529,1.676,2.069,2.534c-0.468-0.185-0.959-0.322-1.42-0.431c-1.015-0.228-2.008-0.32-2.625-0.357c0.003-0.133,0.004-0.283,0.004-0.446c0-0.869-0.055-2.108-0.356-3.2c-0.003-0.01-0.005-0.02-0.009-0.03C20.584,5.119,21.416,5.788,22.157,6.545zM25.184,28.164H8.052V3.646h9.542v0.002c0.416-0.025,0.775,0.386,1.05,1.326c0.25,0.895,0.313,2.062,0.312,2.871c0.002,0.593-0.027,0.991-0.027,0.991l-0.049,0.652l0.656,0.007c0.003,0,1.516,0.018,3,0.355c1.426,0.308,2.541,0.922,2.645,1.617c0.004,0.062,0.005,0.124,0.004,0.182V28.164z");
    }});
draw2d.shape.icon.Page = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Page", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M23.024,5.673c-1.744-1.694-3.625-3.051-5.168-3.236c-0.084-0.012-0.171-0.019-0.263-0.021H7.438c-0.162,0-0.322,0.063-0.436,0.18C6.889,2.71,6.822,2.87,6.822,3.033v25.75c0,0.162,0.063,0.317,0.18,0.435c0.117,0.116,0.271,0.179,0.436,0.179h18.364c0.162,0,0.317-0.062,0.434-0.179c0.117-0.117,0.182-0.272,0.182-0.435V11.648C26.382,9.659,24.824,7.49,23.024,5.673zM25.184,28.164H8.052V3.646h9.542v0.002c0.416-0.025,0.775,0.386,1.05,1.326c0.25,0.895,0.313,2.062,0.312,2.871c0.002,0.593-0.027,0.991-0.027,0.991l-0.049,0.652l0.656,0.007c0.003,0,1.516,0.018,3,0.355c1.426,0.308,2.541,0.922,2.645,1.617c0.004,0.062,0.005,0.124,0.004,0.182V28.164z");
    }});
draw2d.shape.icon.Landscape1 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Landscape1", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M19.883,5.71H2.746c-0.163,0-0.319,0.071-0.435,0.188c-0.118,0.117-0.18,0.272-0.18,0.435v18.364c0,0.164,0.063,0.318,0.18,0.436c0.123,0.117,0.287,0.18,0.435,0.18h25.75c0.164,0,0.324-0.066,0.438-0.18c0.118-0.114,0.182-0.273,0.182-0.436V14.551c-0.002-0.102-0.01-0.188-0.021-0.271c-0.186-1.543-1.543-3.424-3.236-5.168C24.039,7.31,21.869,5.753,19.883,5.71zM26.914,12.314c-0.008-0.005-0.019-0.007-0.029-0.01c-1.092-0.293-2.33-0.355-3.199-0.355c-0.162,0-0.312,0.002-0.445,0.004c-0.037-0.604-0.129-1.604-0.356-2.625c-0.11-0.461-0.246-0.94-0.433-1.42c0.857,0.541,1.748,1.264,2.535,2.068C25.74,10.718,26.41,11.551,26.914,12.314zM3.365,6.947h16.517c0.058,0,0.12,0,0.183,0.004c0.694,0.105,1.307,1.221,1.616,2.646c0.335,1.484,0.354,2.997,0.354,3l0.007,0.656l0.651-0.051c0,0,0.398-0.027,0.99-0.025c0.809,0,1.977,0.062,2.871,0.312c0.939,0.275,1.352,0.635,1.326,1.051h0.002v9.542H3.365V6.951V6.947z");
    }});
draw2d.shape.icon.Landscape2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Landscape2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M19.883,5.71H2.746c-0.163,0-0.319,0.071-0.435,0.188c-0.118,0.117-0.18,0.272-0.18,0.435v18.364c0,0.164,0.063,0.318,0.18,0.436c0.123,0.117,0.287,0.18,0.435,0.18h25.75c0.164,0,0.324-0.066,0.438-0.18c0.118-0.114,0.182-0.273,0.182-0.436V14.551c-0.002-0.102-0.01-0.188-0.021-0.271c-0.186-1.543-1.543-3.424-3.236-5.168C24.039,7.31,21.869,5.753,19.883,5.71zM3.365,6.947h16.517c0.058,0,0.12,0,0.183,0.004c0.694,0.105,1.307,1.221,1.616,2.646c0.335,1.484,0.354,2.997,0.354,3l0.007,0.656l0.651-0.051c0,0,0.398-0.027,0.99-0.025c0.809,0,1.977,0.062,2.871,0.312c0.939,0.275,1.352,0.635,1.326,1.051h0.002v9.542H3.365V6.951V6.947z");
    }});
draw2d.shape.icon.Plugin = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Plugin", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M26.33,15.836l-3.893-1.545l3.136-7.9c0.28-0.705-0.064-1.505-0.771-1.785c-0.707-0.28-1.506,0.065-1.785,0.771l-3.136,7.9l-4.88-1.937l3.135-7.9c0.281-0.706-0.064-1.506-0.77-1.786c-0.706-0.279-1.506,0.065-1.785,0.771l-3.136,7.9L8.554,8.781l-1.614,4.066l2.15,0.854l-2.537,6.391c-0.61,1.54,0.143,3.283,1.683,3.895l1.626,0.646L8.985,26.84c-0.407,1.025,0.095,2.188,1.122,2.596l0.93,0.369c1.026,0.408,2.188-0.095,2.596-1.121l0.877-2.207l1.858,0.737c1.54,0.611,3.284-0.142,3.896-1.682l2.535-6.391l1.918,0.761L26.33,15.836z");
    }});
draw2d.shape.icon.Bookmark = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Bookmark", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M17.396,1.841L6.076,25.986l7.341-4.566l1.186,8.564l11.32-24.146L17.396,1.841zM19.131,9.234c-0.562-0.264-0.805-0.933-0.541-1.495c0.265-0.562,0.934-0.805,1.496-0.541s0.805,0.934,0.541,1.496S19.694,9.498,19.131,9.234z");
    }});
draw2d.shape.icon.Hammer = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Hammer", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M7.831,29.354c0.685,0.353,1.62,1.178,2.344,0.876c0.475-0.195,0.753-1.301,1.048-1.883c2.221-4.376,4.635-9.353,6.392-13.611c0-0.19,0.101-0.337-0.049-0.595c0.983-1.6,1.65-3.358,2.724-5.138c0.34-0.566,0.686-1.351,1.163-1.577l0.881-0.368c1.12-0.288,1.938-0.278,2.719,0.473c0.396,0.383,0.578,1.015,0.961,1.395c0.259,0.26,1.246,0.899,1.613,0.8c0.285-0.077,0.52-0.364,0.72-0.728l0.696-1.286c0.195-0.366,0.306-0.718,0.215-0.999c-0.117-0.362-1.192-0.84-1.552-0.915c-0.528-0.113-1.154,0.081-1.692-0.041c-1.057-0.243-1.513-0.922-1.883-2.02c-2.608-1.533-6.119-2.53-10.207-1.244c-1.109,0.349-2.172,0.614-2.901,1.323c-0.146,0.412,0.143,0.494,0.446,0.489c-0.237,0.216-0.62,0.341-0.399,0.848c2.495-1.146,7.34-1.542,7.669,0.804c0.072,0.522-0.395,1.241-0.682,1.835c-0.905,1.874-2.011,3.394-2.813,5.091c-0.298,0.017-0.366,0.18-0.525,0.287c-2.604,3.8-5.451,8.541-7.9,12.794c-0.326,0.566-1.098,1.402-1.002,1.906C5.961,28.641,7.146,29,7.831,29.354z");
    }});
draw2d.shape.icon.Users = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Users", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.053,20.8c-1.132-0.453-1.584-1.698-1.584-1.698s-0.51,0.282-0.51-0.51s0.51,0.51,1.02-2.548c0,0,1.414-0.397,1.132-3.68h-0.34c0,0,0.849-3.51,0-4.699c-0.85-1.189-1.189-1.981-3.058-2.548s-1.188-0.454-2.547-0.396c-1.359,0.057-2.492,0.792-2.492,1.188c0,0-0.849,0.057-1.188,0.397c-0.34,0.34-0.906,1.924-0.906,2.321s0.283,3.058,0.566,3.624l-0.337,0.113c-0.283,3.283,1.132,3.68,1.132,3.68c0.509,3.058,1.019,1.756,1.019,2.548s-0.51,0.51-0.51,0.51s-0.452,1.245-1.584,1.698c-1.132,0.452-7.416,2.886-7.927,3.396c-0.511,0.511-0.453,2.888-0.453,2.888h26.947c0,0,0.059-2.377-0.452-2.888C28.469,23.686,22.185,21.252,21.053,20.8zM8.583,20.628c-0.099-0.18-0.148-0.31-0.148-0.31s-0.432,0.239-0.432-0.432s0.432,0.432,0.864-2.159c0,0,1.199-0.336,0.959-3.119H9.538c0,0,0.143-0.591,0.237-1.334c-0.004-0.308,0.006-0.636,0.037-0.996l0.038-0.426c-0.021-0.492-0.107-0.939-0.312-1.226C8.818,9.619,8.53,8.947,6.947,8.467c-1.583-0.48-1.008-0.385-2.159-0.336C3.636,8.179,2.676,8.802,2.676,9.139c0,0-0.72,0.048-1.008,0.336c-0.271,0.271-0.705,1.462-0.757,1.885v0.281c0.047,0.653,0.258,2.449,0.469,2.872l-0.286,0.096c-0.239,2.783,0.959,3.119,0.959,3.119c0.432,2.591,0.864,1.488,0.864,2.159s-0.432,0.432-0.432,0.432s-0.383,1.057-1.343,1.439c-0.061,0.024-0.139,0.056-0.232,0.092v5.234h0.575c-0.029-1.278,0.077-2.927,0.746-3.594C2.587,23.135,3.754,22.551,8.583,20.628zM30.913,11.572c-0.04-0.378-0.127-0.715-0.292-0.946c-0.719-1.008-1.008-1.679-2.59-2.159c-1.584-0.48-1.008-0.385-2.16-0.336C24.72,8.179,23.76,8.802,23.76,9.139c0,0-0.719,0.048-1.008,0.336c-0.271,0.272-0.709,1.472-0.758,1.891h0.033l0.08,0.913c0.02,0.231,0.022,0.436,0.027,0.645c0.09,0.666,0.21,1.35,0.33,1.589l-0.286,0.096c-0.239,2.783,0.96,3.119,0.96,3.119c0.432,2.591,0.863,1.488,0.863,2.159s-0.432,0.432-0.432,0.432s-0.053,0.142-0.163,0.338c4.77,1.9,5.927,2.48,6.279,2.834c0.67,0.667,0.775,2.315,0.746,3.594h0.48v-5.306c-0.016-0.006-0.038-0.015-0.052-0.021c-0.959-0.383-1.343-1.439-1.343-1.439s-0.433,0.239-0.433-0.432s0.433,0.432,0.864-2.159c0,0,0.804-0.229,0.963-1.841v-1.227c-0.001-0.018-0.001-0.033-0.003-0.051h-0.289c0,0,0.215-0.89,0.292-1.861V11.572z");
    }});
draw2d.shape.icon.User = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.User", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.771,12.364c0,0,0.849-3.51,0-4.699c-0.85-1.189-1.189-1.981-3.058-2.548s-1.188-0.454-2.547-0.396c-1.359,0.057-2.492,0.792-2.492,1.188c0,0-0.849,0.057-1.188,0.397c-0.34,0.34-0.906,1.924-0.906,2.321s0.283,3.058,0.566,3.624l-0.337,0.113c-0.283,3.283,1.132,3.68,1.132,3.68c0.509,3.058,1.019,1.756,1.019,2.548s-0.51,0.51-0.51,0.51s-0.452,1.245-1.584,1.698c-1.132,0.452-7.416,2.886-7.927,3.396c-0.511,0.511-0.453,2.888-0.453,2.888h26.947c0,0,0.059-2.377-0.452-2.888c-0.512-0.511-6.796-2.944-7.928-3.396c-1.132-0.453-1.584-1.698-1.584-1.698s-0.51,0.282-0.51-0.51s0.51,0.51,1.02-2.548c0,0,1.414-0.397,1.132-3.68H20.771z");
    }});
draw2d.shape.icon.Customer = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Customer", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.523,23.813c-0.518-0.51-6.795-2.938-7.934-3.396c-1.132-0.451-1.584-1.697-1.584-1.697s-0.51,0.282-0.51-0.51c0-0.793,0.51,0.51,1.021-2.548c0,0,1.414-0.397,1.133-3.68l-0.338,0.001c0,0,0.85-3.511,0-4.699c-0.854-1.188-1.188-1.981-3.062-2.548c-1.869-0.567-1.188-0.454-2.547-0.396c-1.359,0.057-2.492,0.793-2.492,1.188c0,0-0.849,0.057-1.188,0.397c-0.34,0.34-0.906,1.924-0.906,2.32s0.283,3.059,0.566,3.624l-0.337,0.112c-0.283,3.283,1.132,3.681,1.132,3.681c0.509,3.058,1.019,1.755,1.019,2.548c0,0.792-0.51,0.51-0.51,0.51s-0.452,1.246-1.584,1.697c-1.132,0.453-7.416,2.887-7.927,3.396c-0.511,0.521-0.453,2.896-0.453,2.896h12.036l0.878-3.459l-0.781-0.781l1.344-1.344l1.344,1.344l-0.781,0.781l0.879,3.459h12.035C28.977,26.709,29.039,24.332,28.523,23.813z");
    }});
draw2d.shape.icon.Employee = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Employee", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.523,23.813c-0.518-0.51-6.795-2.938-7.934-3.396c-1.132-0.451-1.584-1.697-1.584-1.697s-0.51,0.282-0.51-0.51c0-0.793,0.51,0.51,1.021-2.548c0,0,1.414-0.397,1.133-3.68l-0.338,0.001c0,0,0.85-3.511,0-4.699c-0.854-1.188-1.188-1.981-3.062-2.548c-1.869-0.567-1.188-0.454-2.547-0.396c-1.359,0.057-2.492,0.793-2.492,1.188c0,0-0.849,0.057-1.188,0.397c-0.34,0.34-0.906,1.924-0.906,2.32s0.283,3.059,0.566,3.624l-0.337,0.112c-0.283,3.283,1.132,3.681,1.132,3.681c0.509,3.058,1.019,1.755,1.019,2.548c0,0.792-0.51,0.51-0.51,0.51s-0.452,1.246-1.584,1.697c-1.132,0.453-7.416,2.887-7.927,3.396c-0.511,0.521-0.453,2.896-0.453,2.896h26.954C28.977,26.709,29.039,24.332,28.523,23.813zM22.188,26.062h-4.562v-1.25h4.562V26.062z");
    }});
draw2d.shape.icon.Anonymous = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Anonymous", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.523,23.813c-0.518-0.51-6.795-2.938-7.934-3.396c-1.132-0.451-1.584-1.697-1.584-1.697s-0.51,0.282-0.51-0.51c0-0.793,0.51,0.51,1.021-2.548c0,0,1.414-0.397,1.133-3.68l-0.338,0.001c0,0,0.85-3.511,0-4.699c-0.854-1.188-1.188-1.981-3.062-2.548c-1.869-0.567-1.188-0.454-2.547-0.396c-1.359,0.057-2.492,0.793-2.492,1.188c0,0-0.849,0.057-1.188,0.397c-0.34,0.34-0.906,1.924-0.906,2.32s0.283,3.059,0.566,3.624l-0.337,0.112c-0.283,3.283,1.132,3.681,1.132,3.681c0.509,3.058,1.019,1.755,1.019,2.548c0,0.792-0.51,0.51-0.51,0.51s-0.452,1.246-1.584,1.697c-1.132,0.453-7.416,2.887-7.927,3.396c-0.511,0.521-0.453,2.896-0.453,2.896h26.954C28.977,26.709,29.039,24.332,28.523,23.813zM16.618,13.693c-0.398-0.251-0.783-1.211-0.783-1.64c0-0.133,0-0.236,0-0.236c-0.105-0.106-0.574-0.096-0.67,0c0,0,0,0.104,0,0.236c0,0.429-0.385,1.389-0.783,1.64c-0.399,0.251-1.611,0.237-2.084-0.236c-0.473-0.473-0.524-1.663-0.643-1.78c-0.118-0.119-0.185-0.185-0.185-0.185l0.029-0.414c0,0,0.842-0.207,1.699-0.207s1.803,0.502,1.803,0.502c0.231-0.074,0.784-0.083,0.996,0c0,0,0.945-0.502,1.803-0.502s1.699,0.207,1.699,0.207l0.029,0.414c0,0-0.066,0.066-0.185,0.185c-0.118,0.118-0.169,1.308-0.643,1.78C18.229,13.93,17.018,13.944,16.618,13.693z");
    }});
draw2d.shape.icon.Skull = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Skull", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.947,11.14c0-5.174-3.979-9.406-10.613-9.406c-6.633,0-10.282,4.232-10.282,9.406c0,5.174,1.459,4.511,1.459,7.43c0,1.095-1.061,0.564-1.061,2.919c0,2.587,3.615,2.223,4.677,3.283c1.061,1.062,0.961,3.019,0.961,3.019s0.199,0.796,0.564,0.563c0,0,0.232,0.564,0.498,0.232c0,0,0.265,0.563,0.531,0.1c0,0,0.265,0.631,0.696,0.166c0,0,0.431,0.63,0.929,0.133c0,0,0.564,0.53,1.194,0.133c0.63,0.397,1.194-0.133,1.194-0.133c0.497,0.497,0.929-0.133,0.929-0.133c0.432,0.465,0.695-0.166,0.695-0.166c0.268,0.464,0.531-0.1,0.531-0.1c0.266,0.332,0.498-0.232,0.498-0.232c0.365,0.232,0.564-0.563,0.564-0.563s-0.1-1.957,0.961-3.019c1.062-1.061,4.676-0.696,4.676-3.283c0-2.354-1.061-1.824-1.061-2.919C24.488,15.651,25.947,16.314,25.947,11.14zM10.333,20.992c-1.783,0.285-2.59-0.215-2.785-1.492c-0.508-3.328,2.555-3.866,4.079-3.683c0.731,0.088,1.99,0.862,1.99,1.825C13.617,20.229,11.992,20.727,10.333,20.992zM16.461,25.303c-0.331,0-0.862-0.431-0.895-1.227c-0.033,0.796-0.63,1.227-0.961,1.227c-0.332,0-0.83-0.331-0.863-1.127c-0.033-0.796,1.028-4.013,1.792-4.013c0.762,0,1.824,3.217,1.791,4.013S16.794,25.303,16.461,25.303zM23.361,19.5c-0.195,1.277-1.004,1.777-2.787,1.492c-1.658-0.266-3.283-0.763-3.283-3.35c0-0.963,1.258-1.737,1.99-1.825C20.805,15.634,23.869,16.172,23.361,19.5z");
    }});
draw2d.shape.icon.Mail = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Mail", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.516,7.167H3.482l12.517,7.108L28.516,7.167zM16.74,17.303C16.51,17.434,16.255,17.5,16,17.5s-0.51-0.066-0.741-0.197L2.5,10.06v14.773h27V10.06L16.74,17.303z");
    }});
draw2d.shape.icon.Picture = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Picture", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M2.5,4.833v22.334h27V4.833H2.5zM25.25,25.25H6.75V6.75h18.5V25.25zM11.25,14c1.426,0,2.583-1.157,2.583-2.583c0-1.427-1.157-2.583-2.583-2.583c-1.427,0-2.583,1.157-2.583,2.583C8.667,12.843,9.823,14,11.25,14zM24.251,16.25l-4.917-4.917l-6.917,6.917L10.5,16.333l-2.752,2.752v5.165h16.503V16.25z");
    }});
draw2d.shape.icon.Bubble = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Bubble", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,5.333c-7.732,0-14,4.701-14,10.5c0,1.982,0.741,3.833,2.016,5.414L2,25.667l5.613-1.441c2.339,1.317,5.237,2.107,8.387,2.107c7.732,0,14-4.701,14-10.5C30,10.034,23.732,5.333,16,5.333z");
    }});
draw2d.shape.icon.CodeTalk = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.CodeTalk", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM13.704,19.47l-2.338,2.336l-6.43-6.431l6.429-6.432l2.339,2.341l-4.091,4.091L13.704,19.47zM20.775,21.803l-2.337-2.339l4.092-4.09l-4.092-4.092l2.337-2.339l6.43,6.426L20.775,21.803z");
    }});
draw2d.shape.icon.Talkq = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Talkq", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.868,21.375h-1.969v-1.889h1.969V21.375zM16.772,18.094h-1.777l-0.176-8.083h2.113L16.772,18.094z");
    }});
draw2d.shape.icon.Talke = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Talke", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.982,21.375h-1.969v-1.889h1.969V21.375zM16.982,17.469v0.625h-1.969v-0.769c0-2.321,2.641-2.689,2.641-4.337c0-0.752-0.672-1.329-1.553-1.329c-0.912,0-1.713,0.672-1.713,0.672l-1.12-1.393c0,0,1.104-1.153,3.009-1.153c1.81,0,3.49,1.121,3.49,3.009C19.768,15.437,16.982,15.741,16.982,17.469z");
    }});
draw2d.shape.icon.Home = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Home", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.812,16l-3.062-3.062V5.625h-2.625v4.688L16,4.188L4.188,16L7,15.933v11.942h17.875V16H27.812zM16,26.167h-5.833v-7H16V26.167zM21.667,23.167h-3.833v-4.042h3.833V23.167z");
    }});
draw2d.shape.icon.Lock = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Lock", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.335,12.833V9.999h-0.001C22.333,6.501,19.498,3.666,16,3.666S9.666,6.502,9.666,10h0v2.833H7.375V25h17.25V12.833H22.335zM11.667,10C11.667,10,11.667,10,11.667,10c0-2.39,1.944-4.334,4.333-4.334c2.391,0,4.335,1.944,4.335,4.333c0,0,0,0,0,0v2.834h-8.668V10z");
    }});
draw2d.shape.icon.Clip = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Clip", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M23.898,6.135c-1.571-1.125-3.758-0.764-4.884,0.808l-8.832,12.331c-0.804,1.122-0.546,2.684,0.577,3.488c1.123,0.803,2.684,0.545,3.488-0.578l6.236-8.706l-0.813-0.583l-6.235,8.707h0c-0.483,0.672-1.42,0.828-2.092,0.347c-0.673-0.481-0.827-1.419-0.345-2.093h0l8.831-12.33l0.001-0.001l-0.002-0.001c0.803-1.119,2.369-1.378,3.489-0.576c1.12,0.803,1.379,2.369,0.577,3.489v-0.001l-9.68,13.516l0.001,0.001c-1.124,1.569-3.316,1.931-4.885,0.808c-1.569-1.125-1.93-3.315-0.807-4.885l7.035-9.822l-0.813-0.582l-7.035,9.822c-1.447,2.02-0.982,4.83,1.039,6.277c2.021,1.448,4.831,0.982,6.278-1.037l9.68-13.516C25.83,9.447,25.47,7.261,23.898,6.135z");
    }});
draw2d.shape.icon.Star = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Star", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,22.375L7.116,28.83l3.396-10.438l-8.883-6.458l10.979,0.002L16.002,1.5l3.391,10.434h10.981l-8.886,6.457l3.396,10.439L16,22.375L16,22.375z");
    }});
draw2d.shape.icon.StarOff = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.StarOff", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,22.375L7.116,28.83l3.396-10.438l-8.883-6.458l10.979,0.002L16.002,1.5l3.391,10.434h10.981l-8.886,6.457l3.396,10.439L16,22.375L16,22.375zM22.979,26.209l-2.664-8.205l6.979-5.062h-8.627L16,4.729l-2.666,8.206H4.708l6.979,5.07l-2.666,8.203L16,21.146L22.979,26.209L22.979,26.209z");
    }});
draw2d.shape.icon.Star2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Star2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.615,4.928c0.487-0.986,1.284-0.986,1.771,0l2.249,4.554c0.486,0.986,1.775,1.923,2.864,2.081l5.024,0.73c1.089,0.158,1.335,0.916,0.547,1.684l-3.636,3.544c-0.788,0.769-1.28,2.283-1.095,3.368l0.859,5.004c0.186,1.085-0.459,1.553-1.433,1.041l-4.495-2.363c-0.974-0.512-2.567-0.512-3.541,0l-4.495,2.363c-0.974,0.512-1.618,0.044-1.432-1.041l0.858-5.004c0.186-1.085-0.307-2.6-1.094-3.368L3.93,13.977c-0.788-0.768-0.542-1.525,0.547-1.684l5.026-0.73c1.088-0.158,2.377-1.095,2.864-2.081L14.615,4.928z");
    }});
draw2d.shape.icon.Star2Off = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Star2Off", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M26.522,12.293l-5.024-0.73c-1.089-0.158-2.378-1.095-2.864-2.081l-2.249-4.554c-0.487-0.986-1.284-0.986-1.771,0l-2.247,4.554c-0.487,0.986-1.776,1.923-2.864,2.081l-5.026,0.73c-1.088,0.158-1.334,0.916-0.547,1.684l3.637,3.544c0.788,0.769,1.28,2.283,1.094,3.368l-0.858,5.004c-0.186,1.085,0.458,1.553,1.432,1.041l4.495-2.363c0.974-0.512,2.566-0.512,3.541,0l4.495,2.363c0.974,0.512,1.618,0.044,1.433-1.041l-0.859-5.004c-0.186-1.085,0.307-2.6,1.095-3.368l3.636-3.544C27.857,13.209,27.611,12.452,26.522,12.293zM22.037,16.089c-1.266,1.232-1.966,3.394-1.67,5.137l0.514,2.984l-2.679-1.409c-0.757-0.396-1.715-0.612-2.702-0.612s-1.945,0.216-2.7,0.61l-2.679,1.409l0.511-2.982c0.297-1.743-0.404-3.905-1.671-5.137l-2.166-2.112l2.995-0.435c1.754-0.255,3.592-1.591,4.373-3.175L15.5,7.652l1.342,2.716c0.781,1.583,2.617,2.92,4.369,3.173l2.992,0.435L22.037,16.089z");
    }});
draw2d.shape.icon.Star3 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Star3", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.441,28.181c-0.419,0-0.835-0.132-1.189-0.392l-5.751-4.247L9.75,27.789c-0.354,0.26-0.771,0.392-1.189,0.392c-0.412,0-0.824-0.128-1.175-0.384c-0.707-0.511-1-1.422-0.723-2.25l2.26-6.783l-5.815-4.158c-0.71-0.509-1.009-1.416-0.74-2.246c0.268-0.826,1.037-1.382,1.904-1.382c0.004,0,0.01,0,0.014,0l7.15,0.056l2.157-6.816c0.262-0.831,1.035-1.397,1.906-1.397s1.645,0.566,1.906,1.397l2.155,6.816l7.15-0.056c0.004,0,0.01,0,0.015,0c0.867,0,1.636,0.556,1.903,1.382c0.271,0.831-0.028,1.737-0.739,2.246l-5.815,4.158l2.263,6.783c0.276,0.826-0.017,1.737-0.721,2.25C23.268,28.053,22.854,28.181,22.441,28.181L22.441,28.181z");
    }});
draw2d.shape.icon.Star3Off = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Star3Off", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.631,12.359c-0.268-0.826-1.036-1.382-1.903-1.382h-0.015l-7.15,0.056l-2.155-6.816c-0.262-0.831-1.035-1.397-1.906-1.397s-1.645,0.566-1.906,1.397l-2.157,6.816l-7.15-0.056H4.273c-0.868,0-1.636,0.556-1.904,1.382c-0.27,0.831,0.029,1.737,0.74,2.246l5.815,4.158l-2.26,6.783c-0.276,0.828,0.017,1.739,0.723,2.25c0.351,0.256,0.763,0.384,1.175,0.384c0.418,0,0.834-0.132,1.189-0.392l5.751-4.247l5.751,4.247c0.354,0.26,0.771,0.392,1.189,0.392c0.412,0,0.826-0.128,1.177-0.384c0.704-0.513,0.997-1.424,0.721-2.25l-2.263-6.783l5.815-4.158C28.603,14.097,28.901,13.19,28.631,12.359zM19.712,17.996l2.729,8.184l-6.94-5.125L8.56,26.18l2.729-8.184l-7.019-5.018l8.627,0.066L15.5,4.82l2.603,8.225l8.627-0.066L19.712,17.996z");
    }});
draw2d.shape.icon.Chat = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Chat", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.985,5.972c-7.563,0-13.695,4.077-13.695,9.106c0,2.877,2.013,5.44,5.147,7.108c-0.446,1.479-1.336,3.117-3.056,4.566c0,0,4.015-0.266,6.851-3.143c0.163,0.04,0.332,0.07,0.497,0.107c-0.155-0.462-0.246-0.943-0.246-1.443c0-3.393,3.776-6.05,8.599-6.05c3.464,0,6.379,1.376,7.751,3.406c1.168-1.34,1.847-2.892,1.847-4.552C29.68,10.049,23.548,5.972,15.985,5.972zM27.68,22.274c0-2.79-3.401-5.053-7.599-5.053c-4.196,0-7.599,2.263-7.599,5.053c0,2.791,3.403,5.053,7.599,5.053c0.929,0,1.814-0.116,2.637-0.319c1.573,1.597,3.801,1.744,3.801,1.744c-0.954-0.804-1.447-1.713-1.695-2.534C26.562,25.293,27.68,23.871,27.68,22.274z");
    }});
draw2d.shape.icon.Quote = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Quote", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.505,5.873c-3.937,2.52-5.904,5.556-5.904,9.108c0,1.104,0.192,1.656,0.576,1.656l0.396-0.107c0.312-0.12,0.563-0.18,0.756-0.18c1.128,0,2.07,0.411,2.826,1.229c0.756,0.82,1.134,1.832,1.134,3.037c0,1.157-0.408,2.14-1.224,2.947c-0.816,0.807-1.801,1.211-2.952,1.211c-1.608,0-2.935-0.661-3.979-1.984c-1.044-1.321-1.565-2.98-1.565-4.977c0-2.259,0.443-4.327,1.332-6.203c0.888-1.875,2.243-3.57,4.067-5.085c1.824-1.514,2.988-2.272,3.492-2.272c0.336,0,0.612,0.162,0.828,0.486c0.216,0.324,0.324,0.606,0.324,0.846L14.505,5.873zM27.465,5.873c-3.937,2.52-5.904,5.556-5.904,9.108c0,1.104,0.192,1.656,0.576,1.656l0.396-0.107c0.312-0.12,0.563-0.18,0.756-0.18c1.104,0,2.04,0.411,2.808,1.229c0.769,0.82,1.152,1.832,1.152,3.037c0,1.157-0.408,2.14-1.224,2.947c-0.816,0.807-1.801,1.211-2.952,1.211c-1.608,0-2.935-0.661-3.979-1.984c-1.044-1.321-1.565-2.98-1.565-4.977c0-2.284,0.449-4.369,1.35-6.256c0.9-1.887,2.256-3.577,4.068-5.067c1.812-1.49,2.97-2.236,3.474-2.236c0.336,0,0.612,0.162,0.828,0.486c0.216,0.324,0.324,0.606,0.324,0.846L27.465,5.873z");
    }});
draw2d.shape.icon.Gear2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Gear2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M17.047,27.945c-0.34,0.032-0.688,0.054-1.046,0.054l0,0c-0.32,0-0.631-0.017-0.934-0.043l0,0l-2.626,3.375l-0.646-0.183c-0.758-0.213-1.494-0.48-2.202-0.8l0,0L8.979,30.07l0.158-4.24c-0.558-0.39-1.079-0.825-1.561-1.302l0,0L3.424,25.42l-0.379-0.557c-0.445-0.654-0.824-1.339-1.16-2.032l0,0l-0.292-0.605l2.819-3.12c-0.176-0.661-0.293-1.343-0.353-2.038l0,0l-3.736-1.975l0.068-0.669c0.08-0.801,0.235-1.567,0.42-2.303l0,0l0.165-0.653l4.167-0.577c0.297-0.627,0.647-1.221,1.041-1.78l0,0l-1.59-3.914l0.48-0.47c0.564-0.55,1.168-1.048,1.798-1.503l0,0l0.546-0.394l3.597,2.259c0.606-0.279,1.24-0.509,1.897-0.685l0,0l1.304-4.046l0.672-0.051c0.362-0.027,0.751-0.058,1.174-0.058l0,0c0.422,0,0.81,0.031,1.172,0.058l0,0l0.672,0.051l1.318,4.088c0.632,0.176,1.244,0.401,1.831,0.674l0,0l3.647-2.291l0.548,0.394c0.63,0.455,1.235,0.954,1.798,1.501l0,0l0.482,0.47l-1.639,4.031c0.357,0.519,0.679,1.068,0.954,1.646l0,0l4.297,0.595l0.167,0.653c0.188,0.735,0.342,1.501,0.42,2.303l0,0l0.068,0.669l-3.866,2.044c-0.058,0.634-0.161,1.258-0.315,1.866l0,0l2.913,3.218l-0.293,0.608c-0.335,0.695-0.712,1.382-1.159,2.034l0,0l-0.379,0.555l-4.255-0.912c-0.451,0.451-0.939,0.866-1.461,1.241l0,0l0.162,4.323l-0.615,0.278c-0.709,0.319-1.444,0.587-2.202,0.8l0,0l-0.648,0.183L17.047,27.945L17.047,27.945zM20.424,29.028c0.227-0.076,0.45-0.157,0.671-0.244l0,0l-0.152-4.083l0.479-0.307c0.717-0.466,1.37-1.024,1.95-1.658l0,0l0.386-0.423l4.026,0.862c0.121-0.202,0.238-0.409,0.351-0.62l0,0l-2.754-3.045l0.171-0.544c0.243-0.783,0.381-1.623,0.422-2.5l0,0l0.025-0.571l3.658-1.933c-0.038-0.234-0.082-0.467-0.132-0.7l0,0l-4.07-0.563l-0.219-0.527c-0.327-0.787-0.76-1.524-1.277-2.204l0,0l-0.342-0.453l1.548-3.808c-0.179-0.157-0.363-0.31-0.552-0.458l0,0l-3.455,2.169L20.649,7.15c-0.754-0.397-1.569-0.698-2.429-0.894l0,0l-0.556-0.127l-1.248-3.87c-0.121-0.006-0.239-0.009-0.354-0.009l0,0c-0.117,0-0.235,0.003-0.357,0.009l0,0l-1.239,3.845l-0.564,0.12c-0.875,0.188-1.709,0.494-2.486,0.896l0,0l-0.508,0.264L7.509,5.249c-0.188,0.148-0.372,0.301-0.55,0.458l0,0l1.507,3.708L8.112,9.869c-0.552,0.709-1.011,1.485-1.355,2.319l0,0l-0.218,0.529l-3.939,0.545c-0.05,0.233-0.094,0.466-0.131,0.7l0,0l3.531,1.867l0.022,0.575c0.037,0.929,0.192,1.82,0.459,2.653l0,0l0.175,0.548l-2.667,2.95c0.112,0.212,0.229,0.419,0.351,0.621l0,0l3.916-0.843l0.39,0.423c0.601,0.657,1.287,1.229,2.043,1.703l0,0l0.488,0.305l-0.149,4.02c0.221,0.087,0.445,0.168,0.672,0.244l0,0l2.479-3.188l0.566,0.07c0.427,0.054,0.843,0.089,1.257,0.089l0,0c0.445,0,0.894-0.039,1.353-0.104l0,0l0.571-0.08L20.424,29.028L20.424,29.028zM21.554,20.75l0.546,0.839l-3.463,2.253l-1.229-1.891l0,0c-0.447,0.109-0.917,0.173-1.406,0.173l0,0c-3.384,0-6.126-2.743-6.126-6.123l0,0c0-3.384,2.742-6.126,6.126-6.126l0,0c3.38,0,6.123,2.742,6.123,6.126l0,0c0,1.389-0.467,2.676-1.25,3.704l0,0L21.554,20.75M19.224,21.073l0.108-0.069l-0.987-1.519l0.572-0.572c0.748-0.75,1.207-1.773,1.207-2.912l0,0c-0.004-2.278-1.848-4.122-4.123-4.126l0,0c-2.28,0.004-4.122,1.846-4.126,4.126l0,0c0.004,2.275,1.848,4.119,4.126,4.123l0,0c0.509,0,0.999-0.104,1.473-0.286l0,0l0.756-0.29L19.224,21.073L19.224,21.073z");
    }});
draw2d.shape.icon.Gear = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Gear", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M26.974,16.514l3.765-1.991c-0.074-0.738-0.217-1.454-0.396-2.157l-4.182-0.579c-0.362-0.872-0.84-1.681-1.402-2.423l1.594-3.921c-0.524-0.511-1.09-0.977-1.686-1.406l-3.551,2.229c-0.833-0.438-1.73-0.77-2.672-0.984l-1.283-3.976c-0.364-0.027-0.728-0.056-1.099-0.056s-0.734,0.028-1.099,0.056l-1.271,3.941c-0.967,0.207-1.884,0.543-2.738,0.986L7.458,4.037C6.863,4.466,6.297,4.932,5.773,5.443l1.55,3.812c-0.604,0.775-1.11,1.629-1.49,2.55l-4.05,0.56c-0.178,0.703-0.322,1.418-0.395,2.157l3.635,1.923c0.041,1.013,0.209,1.994,0.506,2.918l-2.742,3.032c0.319,0.661,0.674,1.303,1.085,1.905l4.037-0.867c0.662,0.72,1.416,1.351,2.248,1.873l-0.153,4.131c0.663,0.299,1.352,0.549,2.062,0.749l2.554-3.283C15.073,26.961,15.532,27,16,27c0.507,0,1.003-0.046,1.491-0.113l2.567,3.301c0.711-0.2,1.399-0.45,2.062-0.749l-0.156-4.205c0.793-0.513,1.512-1.127,2.146-1.821l4.142,0.889c0.411-0.602,0.766-1.243,1.085-1.905l-2.831-3.131C26.778,18.391,26.93,17.467,26.974,16.514zM20.717,21.297l-1.785,1.162l-1.098-1.687c-0.571,0.22-1.186,0.353-1.834,0.353c-2.831,0-5.125-2.295-5.125-5.125c0-2.831,2.294-5.125,5.125-5.125c2.83,0,5.125,2.294,5.125,5.125c0,1.414-0.573,2.693-1.499,3.621L20.717,21.297z");
    }});
draw2d.shape.icon.Wrench = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Wrench", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M26.834,14.693c1.816-2.088,2.181-4.938,1.193-7.334l-3.646,4.252l-3.594-0.699L19.596,7.45l3.637-4.242c-2.502-0.63-5.258,0.13-7.066,2.21c-1.907,2.193-2.219,5.229-1.039,7.693L5.624,24.04c-1.011,1.162-0.888,2.924,0.274,3.935c1.162,1.01,2.924,0.888,3.935-0.274l9.493-10.918C21.939,17.625,24.918,16.896,26.834,14.693z");
    }});
draw2d.shape.icon.Wrench2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Wrench2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.946,9.721l-2.872-0.768l-0.771-2.874l3.188-3.231c-1.992-0.653-4.268-0.192-5.848,1.391c-1.668,1.668-2.095,4.111-1.279,6.172l-3.476,3.478l-3.478,3.478c-2.062-0.816-4.504-0.391-6.173,1.277c-1.583,1.581-2.043,3.856-1.39,5.849l3.231-3.188l2.874,0.77l0.769,2.872l-3.239,3.197c1.998,0.665,4.288,0.207,5.876-1.384c1.678-1.678,2.1-4.133,1.271-6.202l3.463-3.464l3.464-3.463c2.069,0.828,4.523,0.406,6.202-1.272c1.592-1.589,2.049-3.878,1.384-5.876L24.946,9.721z");
    }});
draw2d.shape.icon.Wrench3 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Wrench3", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.839,6.775l-3.197,3.239L21.77,9.246l-0.771-2.874l3.188-3.231c-1.992-0.653-4.268-0.192-5.848,1.391c-1.668,1.668-2.095,4.111-1.279,6.172L7.42,20.344c-0.204-0.032-0.408-0.062-0.621-0.062c-2.173,0-3.933,1.759-3.933,3.933c0,2.173,1.76,3.933,3.933,3.933c2.171,0,3.931-1.76,3.933-3.933c0-0.24-0.03-0.473-0.071-0.7l9.592-9.59c2.069,0.828,4.523,0.406,6.202-1.272C28.047,11.062,28.504,8.772,27.839,6.775zM6.799,25.146c-0.517,0-0.933-0.418-0.935-0.933c0.002-0.515,0.418-0.933,0.935-0.933c0.514,0,0.932,0.418,0.932,0.933S7.313,25.146,6.799,25.146z");
    }});
draw2d.shape.icon.ScrewDriver = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ScrewDriver", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M19.387,14.373c2.119-2.619,5.322-6.77,5.149-7.75c-0.128-0.729-0.882-1.547-1.763-2.171c-0.883-0.625-1.916-1.044-2.645-0.915c-0.98,0.173-3.786,4.603-5.521,7.49c-0.208,0.344,0.328,1.177,0.156,1.468c-0.172,0.292-1.052,0.042-1.18,0.261c-0.263,0.451-0.417,0.722-0.417,0.722s-0.553,0.823,1.163,2.163l-5.233,7.473c-0.267,0.381-1.456,0.459-1.456,0.459l-1.184,3.312l0.859,0.602l2.708-2.246c0,0-0.334-1.143-0.068-1.523l5.242-7.489c1.719,1,2.377,0.336,2.377,0.336s0.201-0.238,0.536-0.639c0.161-0.194-0.374-0.936-0.159-1.197C18.169,14.467,19.133,14.685,19.387,14.373z");
    }});
draw2d.shape.icon.HammerAndScrewDriver = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.HammerAndScrewDriver", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.537,9.859c-0.473-0.259-1.127-0.252-1.609-0.523c-0.943-0.534-1.186-1.316-1.226-2.475c-2.059-2.215-5.138-4.176-9.424-4.114c-1.162,0.017-2.256-0.035-3.158,0.435c-0.258,0.354-0.004,0.516,0.288,0.599c-0.29,0.138-0.692,0.147-0.626,0.697c2.72-0.383,7.475,0.624,7.116,2.966c-0.08,0.521-0.735,1.076-1.179,1.563c-1.263,1.382-2.599,2.45-3.761,3.667l0.336,0.336c0.742-0.521,1.446-0.785,2.104-0.785c0.707,0,1.121,0.297,1.276,0.433c0.575-0.618,1.166-1.244,1.839-1.853c0.488-0.444,1.047-1.099,1.566-1.178l0.949-0.101c1.156,0.047,1.937,0.29,2.471,1.232c0.27,0.481,0.262,1.139,0.521,1.613c0.175,0.324,0.937,1.218,1.316,1.228c0.294,0.009,0.603-0.199,0.899-0.49l1.033-1.034c0.291-0.294,0.501-0.6,0.492-0.896C29.754,10.801,28.861,10.035,28.537,9.859zM13.021,15.353l-0.741-0.741c-3.139,2.643-6.52,5.738-9.531,8.589c-0.473,0.443-1.452,1.021-1.506,1.539c-0.083,0.781,0.95,1.465,1.506,2c0.556,0.533,1.212,1.602,1.994,1.51c0.509-0.043,1.095-1.029,1.544-1.502c2.255-2.374,4.664-4.976,6.883-7.509c-0.312-0.371-0.498-0.596-0.498-0.596C12.535,18.451,11.779,17.272,13.021,15.353zM20.64,15.643c-0.366-0.318-1.466,0.143-1.777-0.122c-0.311-0.266,0.171-1.259-0.061-1.455c-0.482-0.406-0.77-0.646-0.77-0.646s-0.862-0.829-2.812,0.928L7.44,6.569C7.045,6.173,7.203,4.746,7.203,4.746L3.517,2.646L2.623,3.541l2.1,3.686c0,0,1.428-0.158,1.824,0.237l7.792,7.793c-1.548,1.831-0.895,2.752-0.895,2.752s0.238,0.288,0.646,0.771c0.196,0.23,1.188-0.249,1.455,0.061c0.264,0.312-0.196,1.41,0.12,1.777c2.666,3.064,6.926,7.736,8.125,7.736c0.892,0,2.021-0.724,2.948-1.64c0.925-0.917,1.639-2.055,1.639-2.947C28.377,22.567,23.704,18.309,20.64,15.643z");
    }});
draw2d.shape.icon.Magic = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Magic", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M23.043,4.649l-0.404-2.312l-1.59,1.727l-2.323-0.33l1.151,2.045l-1.032,2.108l2.302-0.463l1.686,1.633l0.271-2.332l2.074-1.099L23.043,4.649zM26.217,18.198l-0.182-1.25l-0.882,0.905l-1.245-0.214l0.588,1.118l-0.588,1.118l1.245-0.214l0.882,0.905l0.182-1.25l1.133-0.56L26.217,18.198zM4.92,7.672L5.868,7.3l0.844,0.569L6.65,6.853l0.802-0.627L6.467,5.97L6.118,5.013L5.571,5.872L4.553,5.908l0.647,0.786L4.92,7.672zM10.439,10.505l1.021-1.096l1.481,0.219l-0.727-1.31l0.667-1.341l-1.47,0.287l-1.069-1.048L10.16,7.703L8.832,8.396l1.358,0.632L10.439,10.505zM17.234,12.721c-0.588-0.368-1.172-0.618-1.692-0.729c-0.492-0.089-1.039-0.149-1.425,0.374L2.562,30.788h6.68l9.669-15.416c0.303-0.576,0.012-1.041-0.283-1.447C18.303,13.508,17.822,13.09,17.234,12.721zM13.613,21.936c-0.254-0.396-0.74-0.857-1.373-1.254c-0.632-0.396-1.258-0.634-1.726-0.69l4.421-7.052c0.064-0.013,0.262-0.021,0.543,0.066c0.346,0.092,0.785,0.285,1.225,0.562c0.504,0.313,0.908,0.677,1.133,0.97c0.113,0.145,0.178,0.271,0.195,0.335c0.002,0.006,0.004,0.011,0.004,0.015L13.613,21.936z");
    }});
draw2d.shape.icon.Download = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Download", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM16,28.792c-1.549,0-2.806-1.256-2.806-2.806s1.256-2.806,2.806-2.806c1.55,0,2.806,1.256,2.806,2.806S17.55,28.792,16,28.792zM16,21.087l-7.858-6.562h3.469V5.747h8.779v8.778h3.468L16,21.087z");
    }});
draw2d.shape.icon.View = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.View", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,8.286C8.454,8.286,2.5,16,2.5,16s5.954,7.715,13.5,7.715c5.771,0,13.5-7.715,13.5-7.715S21.771,8.286,16,8.286zM16,20.807c-2.649,0-4.807-2.157-4.807-4.807s2.158-4.807,4.807-4.807s4.807,2.158,4.807,4.807S18.649,20.807,16,20.807zM16,13.194c-1.549,0-2.806,1.256-2.806,2.806c0,1.55,1.256,2.806,2.806,2.806c1.55,0,2.806-1.256,2.806-2.806C18.806,14.451,17.55,13.194,16,13.194z");
    }});
draw2d.shape.icon.Noview = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Noview", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M11.478,17.568c-0.172-0.494-0.285-1.017-0.285-1.568c0-2.65,2.158-4.807,4.807-4.807c0.552,0,1.074,0.113,1.568,0.285l2.283-2.283C18.541,8.647,17.227,8.286,16,8.286C8.454,8.286,2.5,16,2.5,16s2.167,2.791,5.53,5.017L11.478,17.568zM23.518,11.185l-3.056,3.056c0.217,0.546,0.345,1.138,0.345,1.76c0,2.648-2.158,4.807-4.807,4.807c-0.622,0-1.213-0.128-1.76-0.345l-2.469,2.47c1.327,0.479,2.745,0.783,4.229,0.783c5.771,0,13.5-7.715,13.5-7.715S26.859,13.374,23.518,11.185zM25.542,4.917L4.855,25.604L6.27,27.02L26.956,6.332L25.542,4.917z");
    }});
draw2d.shape.icon.Cloud = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Cloud", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.345,13.904c0.019-0.195,0.03-0.392,0.03-0.591c0-3.452-2.798-6.25-6.25-6.25c-2.679,0-4.958,1.689-5.847,4.059c-0.589-0.646-1.429-1.059-2.372-1.059c-1.778,0-3.219,1.441-3.219,3.219c0,0.21,0.023,0.415,0.062,0.613c-2.372,0.391-4.187,2.436-4.187,4.918c0,2.762,2.239,5,5,5h15.875c2.762,0,5-2.238,5-5C28.438,16.362,26.672,14.332,24.345,13.904z");
    }});
draw2d.shape.icon.Cloud2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Cloud2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M7.562,24.812c-3.313,0-6-2.687-6-6l0,0c0.002-2.659,1.734-4.899,4.127-5.684l0,0c0.083-2.26,1.937-4.064,4.216-4.066l0,0c0.73,0,1.415,0.19,2.01,0.517l0,0c1.266-2.105,3.57-3.516,6.208-3.517l0,0c3.947,0.002,7.157,3.155,7.248,7.079l0,0c2.362,0.804,4.062,3.034,4.064,5.671l0,0c0,3.313-2.687,6-6,6l0,0H7.562L7.562,24.812zM24.163,14.887c-0.511-0.095-0.864-0.562-0.815-1.079l0,0c0.017-0.171,0.027-0.336,0.027-0.497l0,0c-0.007-2.899-2.352-5.245-5.251-5.249l0,0c-2.249-0.002-4.162,1.418-4.911,3.41l0,0c-0.122,0.323-0.406,0.564-0.748,0.63l0,0c-0.34,0.066-0.694-0.052-0.927-0.309l0,0c-0.416-0.453-0.986-0.731-1.633-0.731l0,0c-1.225,0.002-2.216,0.993-2.22,2.218l0,0c0,0.136,0.017,0.276,0.045,0.424l0,0c0.049,0.266-0.008,0.54-0.163,0.762l0,0c-0.155,0.223-0.392,0.371-0.657,0.414l0,0c-1.9,0.313-3.352,1.949-3.35,3.931l0,0c0.004,2.209,1.792,3.995,4.001,4.001l0,0h15.874c2.209-0.006,3.994-1.792,3.999-4.001l0,0C27.438,16.854,26.024,15.231,24.163,14.887L24.163,14.887");
    }});
draw2d.shape.icon.CloudDown = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.CloudDown", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.345,13.904c0.019-0.195,0.03-0.392,0.03-0.591c0-3.452-2.798-6.25-6.25-6.25c-2.679,0-4.958,1.689-5.847,4.059c-0.589-0.646-1.429-1.059-2.372-1.059c-1.778,0-3.219,1.441-3.219,3.219c0,0.21,0.023,0.415,0.062,0.613c-2.372,0.391-4.187,2.436-4.187,4.918c0,2.762,2.239,5,5,5h3.404l-0.707-0.707c-0.377-0.377-0.585-0.879-0.585-1.413c0-0.533,0.208-1.035,0.585-1.412l0.556-0.557c0.4-0.399,0.937-0.628,1.471-0.628c0.027,0,0.054,0,0.08,0.002v-0.472c0-1.104,0.898-2.002,2-2.002h3.266c1.103,0,2,0.898,2,2.002v0.472c0.027-0.002,0.054-0.002,0.081-0.002c0.533,0,1.07,0.229,1.47,0.63l0.557,0.552c0.78,0.781,0.78,2.05,0,2.828l-0.706,0.707h2.403c2.762,0,5-2.238,5-5C28.438,16.362,26.672,14.332,24.345,13.904z M21.033,20.986l-0.556-0.555c-0.39-0.389-0.964-0.45-1.276-0.137c-0.312,0.312-0.568,0.118-0.568-0.432v-1.238c0-0.55-0.451-1-1-1h-3.265c-0.55,0-1,0.45-1,1v1.238c0,0.55-0.256,0.744-0.569,0.432c-0.312-0.313-0.887-0.252-1.276,0.137l-0.556,0.555c-0.39,0.389-0.39,1.024-0.001,1.413l4.328,4.331c0.194,0.194,0.451,0.291,0.707,0.291s0.512-0.097,0.707-0.291l4.327-4.331C21.424,22.011,21.423,21.375,21.033,20.986z");
    }});
draw2d.shape.icon.CloudUp = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.CloudUp", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.345,13.904c0.019-0.195,0.03-0.392,0.03-0.591c0-3.452-2.798-6.25-6.25-6.25c-2.679,0-4.958,1.689-5.847,4.059c-0.589-0.646-1.429-1.059-2.372-1.059c-1.778,0-3.219,1.441-3.219,3.219c0,0.21,0.023,0.415,0.062,0.613c-2.372,0.391-4.187,2.436-4.187,4.918c0,2.762,2.239,5,5,5h2.312c-0.126-0.266-0.2-0.556-0.2-0.859c0-0.535,0.208-1.04,0.587-1.415l4.325-4.329c0.375-0.377,0.877-0.585,1.413-0.585c0.54,0,1.042,0.21,1.417,0.587l4.323,4.329c0.377,0.373,0.585,0.878,0.585,1.413c0,0.304-0.073,0.594-0.2,0.859h1.312c2.762,0,5-2.238,5-5C28.438,16.362,26.672,14.332,24.345,13.904z M16.706,17.916c-0.193-0.195-0.45-0.291-0.706-0.291s-0.512,0.096-0.707,0.291l-4.327,4.33c-0.39,0.389-0.389,1.025,0.001,1.414l0.556,0.555c0.39,0.389,0.964,0.449,1.276,0.137s0.568-0.119,0.568,0.432v1.238c0,0.549,0.451,1,1,1h3.265c0.551,0,1-0.451,1-1v-1.238c0-0.551,0.256-0.744,0.569-0.432c0.312,0.312,0.887,0.252,1.276-0.137l0.556-0.555c0.39-0.389,0.39-1.025,0.001-1.414L16.706,17.916z");
    }});
draw2d.shape.icon.Location = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Location", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z");
    }});
draw2d.shape.icon.Volume0 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Volume0", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.998,12.127v7.896h4.495l6.729,5.526l0.004-18.948l-6.73,5.526H4.998z");
    }});
draw2d.shape.icon.Volume1 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Volume1", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.998,12.127v7.896h4.495l6.729,5.526l0.004-18.948l-6.73,5.526H4.998z M18.806,11.219c-0.393-0.389-1.024-0.389-1.415,0.002c-0.39,0.391-0.39,1.024,0.002,1.416v-0.002c0.863,0.864,1.395,2.049,1.395,3.366c0,1.316-0.531,2.497-1.393,3.361c-0.394,0.389-0.394,1.022-0.002,1.415c0.195,0.195,0.451,0.293,0.707,0.293c0.257,0,0.513-0.098,0.708-0.293c1.222-1.22,1.98-2.915,1.979-4.776C20.788,14.136,20.027,12.439,18.806,11.219z");
    }});
draw2d.shape.icon.Volume2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Volume2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.998,12.127v7.896h4.495l6.729,5.526l0.004-18.948l-6.73,5.526H4.998z M18.806,11.219c-0.393-0.389-1.024-0.389-1.415,0.002c-0.39,0.391-0.39,1.024,0.002,1.416v-0.002c0.863,0.864,1.395,2.049,1.395,3.366c0,1.316-0.531,2.497-1.393,3.361c-0.394,0.389-0.394,1.022-0.002,1.415c0.195,0.195,0.451,0.293,0.707,0.293c0.257,0,0.513-0.098,0.708-0.293c1.222-1.22,1.98-2.915,1.979-4.776C20.788,14.136,20.027,12.439,18.806,11.219z M21.101,8.925c-0.393-0.391-1.024-0.391-1.413,0c-0.392,0.391-0.392,1.025,0,1.414c1.45,1.451,2.344,3.447,2.344,5.661c0,2.212-0.894,4.207-2.342,5.659c-0.392,0.39-0.392,1.023,0,1.414c0.195,0.195,0.451,0.293,0.708,0.293c0.256,0,0.512-0.098,0.707-0.293c1.808-1.809,2.929-4.315,2.927-7.073C24.033,13.24,22.912,10.732,21.101,8.925z");
    }});
draw2d.shape.icon.Volume3 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Volume3", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.998,12.127v7.896h4.495l6.729,5.526l0.004-18.948l-6.73,5.526H4.998z M18.806,11.219c-0.393-0.389-1.024-0.389-1.415,0.002c-0.39,0.391-0.39,1.024,0.002,1.416v-0.002c0.863,0.864,1.395,2.049,1.395,3.366c0,1.316-0.531,2.497-1.393,3.361c-0.394,0.389-0.394,1.022-0.002,1.415c0.195,0.195,0.451,0.293,0.707,0.293c0.257,0,0.513-0.098,0.708-0.293c1.222-1.22,1.98-2.915,1.979-4.776C20.788,14.136,20.027,12.439,18.806,11.219z M21.101,8.925c-0.393-0.391-1.024-0.391-1.413,0c-0.392,0.391-0.392,1.025,0,1.414c1.45,1.451,2.344,3.447,2.344,5.661c0,2.212-0.894,4.207-2.342,5.659c-0.392,0.39-0.392,1.023,0,1.414c0.195,0.195,0.451,0.293,0.708,0.293c0.256,0,0.512-0.098,0.707-0.293c1.808-1.809,2.929-4.315,2.927-7.073C24.033,13.24,22.912,10.732,21.101,8.925z M23.28,6.746c-0.393-0.391-1.025-0.389-1.414,0.002c-0.391,0.389-0.391,1.023,0.002,1.413h-0.002c2.009,2.009,3.248,4.773,3.248,7.839c0,3.063-1.239,5.828-3.246,7.838c-0.391,0.39-0.391,1.023,0.002,1.415c0.194,0.194,0.45,0.291,0.706,0.291s0.513-0.098,0.708-0.293c2.363-2.366,3.831-5.643,3.829-9.251C27.115,12.389,25.647,9.111,23.28,6.746z");
    }});
draw2d.shape.icon.Key = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Key", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M18.386,16.009l0.009-0.006l-0.58-0.912c1.654-2.226,1.876-5.319,0.3-7.8c-2.043-3.213-6.303-4.161-9.516-2.118c-3.212,2.042-4.163,6.302-2.12,9.517c1.528,2.402,4.3,3.537,6.944,3.102l0.424,0.669l0.206,0.045l0.779-0.447l-0.305,1.377l2.483,0.552l-0.296,1.325l1.903,0.424l-0.68,3.06l1.406,0.313l-0.424,1.906l4.135,0.918l0.758-3.392L18.386,16.009z M10.996,8.944c-0.685,0.436-1.593,0.233-2.029-0.452C8.532,7.807,8.733,6.898,9.418,6.463s1.594-0.233,2.028,0.452C11.883,7.6,11.68,8.509,10.996,8.944z");
    }});
draw2d.shape.icon.Ruler = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Ruler", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M6.63,21.796l-5.122,5.121h25.743V1.175L6.63,21.796zM18.702,10.48c0.186-0.183,0.48-0.183,0.664,0l1.16,1.159c0.184,0.183,0.186,0.48,0.002,0.663c-0.092,0.091-0.213,0.137-0.332,0.137c-0.121,0-0.24-0.046-0.33-0.137l-1.164-1.159C18.519,10.96,18.519,10.664,18.702,10.48zM17.101,12.084c0.184-0.183,0.48-0.183,0.662,0l2.156,2.154c0.184,0.183,0.184,0.48,0.002,0.661c-0.092,0.092-0.213,0.139-0.334,0.139s-0.24-0.046-0.33-0.137l-2.156-2.154C16.917,12.564,16.917,12.267,17.101,12.084zM15.497,13.685c0.184-0.183,0.48-0.183,0.664,0l1.16,1.161c0.184,0.183,0.182,0.48-0.002,0.663c-0.092,0.092-0.211,0.138-0.33,0.138c-0.121,0-0.24-0.046-0.332-0.138l-1.16-1.16C15.314,14.166,15.314,13.868,15.497,13.685zM13.896,15.288c0.184-0.183,0.48-0.181,0.664,0.002l1.158,1.159c0.183,0.184,0.183,0.48,0,0.663c-0.092,0.092-0.212,0.138-0.332,0.138c-0.119,0-0.24-0.046-0.332-0.138l-1.158-1.161C13.713,15.767,13.713,15.471,13.896,15.288zM12.293,16.892c0.183-0.184,0.479-0.184,0.663,0l2.154,2.153c0.184,0.184,0.184,0.481,0,0.665c-0.092,0.092-0.211,0.138-0.33,0.138c-0.121,0-0.242-0.046-0.334-0.138l-2.153-2.155C12.11,17.371,12.11,17.075,12.293,16.892zM10.302,24.515c-0.091,0.093-0.212,0.139-0.332,0.139c-0.119,0-0.238-0.045-0.33-0.137l-2.154-2.153c-0.184-0.183-0.184-0.479,0-0.663s0.479-0.184,0.662,0l2.154,2.153C10.485,24.036,10.485,24.332,10.302,24.515zM10.912,21.918c-0.093,0.093-0.214,0.139-0.333,0.139c-0.12,0-0.24-0.045-0.33-0.137l-1.162-1.161c-0.184-0.183-0.184-0.479,0-0.66c0.184-0.185,0.48-0.187,0.664-0.003l1.161,1.162C11.095,21.438,11.095,21.735,10.912,21.918zM12.513,20.316c-0.092,0.092-0.211,0.138-0.332,0.138c-0.119,0-0.239-0.046-0.331-0.138l-1.159-1.16c-0.184-0.184-0.184-0.48,0-0.664s0.48-0.182,0.663,0.002l1.159,1.161C12.696,19.838,12.696,20.135,12.513,20.316zM22.25,21.917h-8.67l8.67-8.67V21.917zM22.13,10.7c-0.09,0.092-0.211,0.138-0.33,0.138c-0.121,0-0.242-0.046-0.334-0.138l-1.16-1.159c-0.184-0.183-0.184-0.479,0-0.663c0.182-0.183,0.479-0.183,0.662,0l1.16,1.159C22.312,10.221,22.313,10.517,22.13,10.7zM24.726,10.092c-0.092,0.092-0.213,0.137-0.332,0.137s-0.24-0.045-0.33-0.137l-2.154-2.154c-0.184-0.183-0.184-0.481,0-0.664s0.482-0.181,0.664,0.002l2.154,2.154C24.911,9.613,24.909,9.91,24.726,10.092z");
    }});
draw2d.shape.icon.Power = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Power", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.542,8.354c-1.47-1.766-2.896-2.617-3.025-2.695c-0.954-0.565-2.181-0.241-2.739,0.724c-0.556,0.961-0.24,2.194,0.705,2.763c0,0,0.001,0,0.002,0.001c0.001,0,0.002,0.001,0.003,0.002c0.001,0,0.003,0.001,0.004,0.001c0.102,0.062,1.124,0.729,2.08,1.925c1.003,1.261,1.933,3.017,1.937,5.438c-0.001,2.519-1.005,4.783-2.64,6.438c-1.637,1.652-3.877,2.668-6.368,2.669c-2.491-0.001-4.731-1.017-6.369-2.669c-1.635-1.654-2.639-3.919-2.64-6.438c0.005-2.499,0.995-4.292,2.035-5.558c0.517-0.625,1.043-1.098,1.425-1.401c0.191-0.152,0.346-0.263,0.445-0.329c0.049-0.034,0.085-0.058,0.104-0.069c0.005-0.004,0.009-0.006,0.012-0.008s0.004-0.002,0.004-0.002l0,0c0.946-0.567,1.262-1.802,0.705-2.763c-0.559-0.965-1.785-1.288-2.739-0.724c-0.128,0.079-1.555,0.93-3.024,2.696c-1.462,1.751-2.974,4.511-2.97,8.157C2.49,23.775,8.315,29.664,15.5,29.667c7.186-0.003,13.01-5.892,13.012-13.155C28.516,12.864,27.005,10.105,25.542,8.354zM15.5,17.523c1.105,0,2.002-0.907,2.002-2.023h-0.001V3.357c0-1.118-0.896-2.024-2.001-2.024s-2.002,0.906-2.002,2.024V15.5C13.498,16.616,14.395,17.523,15.5,17.523z");
    }});
draw2d.shape.icon.Unlock = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Unlock", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.375,12.833h-2.209V10c0,0,0,0,0-0.001c0-2.389,1.945-4.333,4.334-4.333c2.391,0,4.335,1.944,4.335,4.333c0,0,0,0,0,0v2.834h2V9.999h-0.001c-0.001-3.498-2.836-6.333-6.334-6.333S16.166,6.502,16.166,10v2.833H3.125V25h17.25V12.833z");
    }});
draw2d.shape.icon.Flag = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Flag", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M26.04,9.508c0.138-0.533,0.15-1.407,0.028-1.943l-0.404-1.771c-0.122-0.536-0.665-1.052-1.207-1.146l-3.723-0.643c-0.542-0.094-1.429-0.091-1.97,0.007l-4.033,0.726c-0.542,0.098-1.429,0.108-1.973,0.023L8.812,4.146C8.817,4.165,8.826,4.182,8.83,4.201l2.701,12.831l1.236,0.214c0.542,0.094,1.428,0.09,1.97-0.007l4.032-0.727c0.541-0.097,1.429-0.107,1.973-0.022l4.329,0.675c0.544,0.085,0.906-0.288,0.807-0.829l-0.485-2.625c-0.1-0.541-0.069-1.419,0.068-1.952L26.04,9.508zM6.667,3.636C6.126,3.75,5.78,4.279,5.894,4.819l5.763,27.378H13.7L7.852,4.409C7.736,3.867,7.207,3.521,6.667,3.636z");
    }});
draw2d.shape.icon.Tag = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Tag", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.263,2.826H7.904L2.702,8.028v6.359L18.405,30.09l11.561-11.562L14.263,2.826zM6.495,8.859c-0.619-0.619-0.619-1.622,0-2.24C7.114,6,8.117,6,8.736,6.619c0.62,0.62,0.619,1.621,0,2.241C8.117,9.479,7.114,9.479,6.495,8.859z");
    }});
draw2d.shape.icon.Search = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Search", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M29.772,26.433l-7.126-7.126c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127L29.772,26.433zM7.203,13.885c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486c-0.007,3.58-2.905,6.476-6.484,6.484C10.106,20.361,7.209,17.465,7.203,13.885z");
    }});
draw2d.shape.icon.ZoomOut = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ZoomOut", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM8.854,11.884v4.001l9.665-0.001v-3.999L8.854,11.884z");
    }});
draw2d.shape.icon.ZoomIn = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ZoomIn", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM15.687,9.051h-4v2.833H8.854v4.001h2.833v2.833h4v-2.834h2.832v-3.999h-2.833V9.051z");
    }});
draw2d.shape.icon.Cross = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Cross", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z");
    }});
draw2d.shape.icon.Check = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Check", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M2.379,14.729 5.208,11.899 12.958,19.648 25.877,6.733 28.707,9.561 12.958,25.308z");
    }});
draw2d.shape.icon.Settings = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Settings", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16.015,12.03c-2.156,0-3.903,1.747-3.903,3.903c0,2.155,1.747,3.903,3.903,3.903c0.494,0,0.962-0.102,1.397-0.27l0.836,1.285l1.359-0.885l-0.831-1.276c0.705-0.706,1.142-1.681,1.142-2.757C19.918,13.777,18.171,12.03,16.015,12.03zM16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM26.174,20.809c-0.241,0.504-0.513,0.99-0.826,1.45L22.19,21.58c-0.481,0.526-1.029,0.994-1.634,1.385l0.119,3.202c-0.507,0.23-1.028,0.421-1.569,0.57l-1.955-2.514c-0.372,0.051-0.75,0.086-1.136,0.086c-0.356,0-0.706-0.029-1.051-0.074l-1.945,2.5c-0.541-0.151-1.065-0.342-1.57-0.569l0.117-3.146c-0.634-0.398-1.208-0.88-1.712-1.427L6.78,22.251c-0.313-0.456-0.583-0.944-0.826-1.448l2.088-2.309c-0.226-0.703-0.354-1.451-0.385-2.223l-2.768-1.464c0.055-0.563,0.165-1.107,0.301-1.643l3.084-0.427c0.29-0.702,0.675-1.352,1.135-1.942L8.227,7.894c0.399-0.389,0.83-0.744,1.283-1.07l2.663,1.672c0.65-0.337,1.349-0.593,2.085-0.75l0.968-3.001c0.278-0.021,0.555-0.042,0.837-0.042c0.282,0,0.56,0.022,0.837,0.042l0.976,3.028c0.72,0.163,1.401,0.416,2.036,0.75l2.704-1.697c0.455,0.326,0.887,0.681,1.285,1.07l-1.216,2.986c0.428,0.564,0.793,1.181,1.068,1.845l3.185,0.441c0.135,0.535,0.247,1.081,0.302,1.643l-2.867,1.516c-0.034,0.726-0.15,1.43-0.355,2.1L26.174,20.809z");
    }});
draw2d.shape.icon.SettingsAlt = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.SettingsAlt", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM24.386,14.968c-1.451,1.669-3.706,2.221-5.685,1.586l-7.188,8.266c-0.766,0.88-2.099,0.97-2.979,0.205s-0.973-2.099-0.208-2.979l7.198-8.275c-0.893-1.865-0.657-4.164,0.787-5.824c1.367-1.575,3.453-2.151,5.348-1.674l-2.754,3.212l0.901,2.621l2.722,0.529l2.761-3.22C26.037,11.229,25.762,13.387,24.386,14.968z");
    }});
draw2d.shape.icon.Feed = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Feed", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.135,16.762c3.078,0,5.972,1.205,8.146,3.391c2.179,2.187,3.377,5.101,3.377,8.202h4.745c0-9.008-7.299-16.335-16.269-16.335V16.762zM4.141,8.354c10.973,0,19.898,8.975,19.898,20.006h4.743c0-13.646-11.054-24.749-24.642-24.749V8.354zM10.701,25.045c0,1.815-1.471,3.287-3.285,3.287s-3.285-1.472-3.285-3.287c0-1.813,1.471-3.285,3.285-3.285S10.701,23.231,10.701,25.045z");
    }});
draw2d.shape.icon.Bug = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Bug", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.589,10.903l-5.828,1.612c-0.534-1.419-1.338-2.649-2.311-3.628l3.082-5.44c0.271-0.48,0.104-1.092-0.38-1.365c-0.479-0.271-1.09-0.102-1.36,0.377l-2.924,5.162c-0.604-0.383-1.24-0.689-1.9-0.896c-0.416-1.437-1.652-2.411-3.058-2.562c-0.001-0.004-0.002-0.008-0.003-0.012c-0.061-0.242-0.093-0.46-0.098-0.65c-0.005-0.189,0.012-0.351,0.046-0.479c0.037-0.13,0.079-0.235,0.125-0.317c0.146-0.26,0.34-0.43,0.577-0.509c0.023,0.281,0.142,0.482,0.352,0.601c0.155,0.088,0.336,0.115,0.546,0.086c0.211-0.031,0.376-0.152,0.496-0.363c0.105-0.186,0.127-0.389,0.064-0.607c-0.064-0.219-0.203-0.388-0.414-0.507c-0.154-0.087-0.314-0.131-0.482-0.129c-0.167,0.001-0.327,0.034-0.481,0.097c-0.153,0.063-0.296,0.16-0.429,0.289c-0.132,0.129-0.241,0.271-0.33,0.426c-0.132,0.234-0.216,0.496-0.25,0.783c-0.033,0.286-0.037,0.565-0.009,0.84c0.017,0.16,0.061,0.301,0.094,0.449c-0.375-0.021-0.758,0.002-1.14,0.108c-0.482,0.133-0.913,0.36-1.28,0.653c-0.052-0.172-0.098-0.344-0.18-0.518c-0.116-0.249-0.263-0.486-0.438-0.716c-0.178-0.229-0.384-0.41-0.618-0.543C9.904,3.059,9.737,2.994,9.557,2.951c-0.18-0.043-0.352-0.052-0.516-0.027s-0.318,0.08-0.463,0.164C8.432,3.172,8.318,3.293,8.23,3.445C8.111,3.656,8.08,3.873,8.136,4.092c0.058,0.221,0.181,0.384,0.367,0.49c0.21,0.119,0.415,0.138,0.611,0.056C9.31,4.556,9.451,4.439,9.539,4.283c0.119-0.21,0.118-0.443-0.007-0.695c0.244-0.055,0.497-0.008,0.757,0.141c0.081,0.045,0.171,0.115,0.27,0.208c0.097,0.092,0.193,0.222,0.286,0.388c0.094,0.166,0.179,0.368,0.251,0.608c0.013,0.044,0.023,0.098,0.035,0.146c-0.911,0.828-1.357,2.088-1.098,3.357c-0.582,0.584-1.072,1.27-1.457,2.035l-5.16-2.926c-0.48-0.271-1.092-0.102-1.364,0.377C1.781,8.404,1.95,9.016,2.43,9.289l5.441,3.082c-0.331,1.34-0.387,2.807-0.117,4.297l-5.828,1.613c-0.534,0.147-0.846,0.699-0.698,1.231c0.147,0.53,0.697,0.843,1.231,0.694l5.879-1.627c0.503,1.057,1.363,2.28,2.371,3.443l-3.194,5.639c-0.272,0.481-0.104,1.092,0.378,1.363c0.239,0.137,0.512,0.162,0.758,0.094c0.248-0.068,0.469-0.229,0.604-0.471l2.895-5.109c2.7,2.594,5.684,4.123,5.778,1.053c1.598,2.56,3.451-0.338,4.502-3.976l5.203,2.947c0.24,0.138,0.514,0.162,0.762,0.094c0.246-0.067,0.467-0.229,0.603-0.471c0.272-0.479,0.104-1.091-0.377-1.362l-5.701-3.229c0.291-1.505,0.422-2.983,0.319-4.138l5.886-1.627c0.53-0.147,0.847-0.697,0.696-1.229C29.673,11.068,29.121,10.756,28.589,10.903z");
    }});
draw2d.shape.icon.Link = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Link", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16.45,18.085l-2.47,2.471c0.054,1.023-0.297,2.062-1.078,2.846c-1.465,1.459-3.837,1.459-5.302-0.002c-1.461-1.465-1.46-3.836-0.001-5.301c0.783-0.781,1.824-1.131,2.847-1.078l2.469-2.469c-2.463-1.057-5.425-0.586-7.438,1.426c-2.634,2.637-2.636,6.907,0,9.545c2.638,2.637,6.909,2.635,9.545,0l0.001,0.002C17.033,23.511,17.506,20.548,16.45,18.085zM14.552,12.915l2.467-2.469c-0.053-1.023,0.297-2.062,1.078-2.848C19.564,6.139,21.934,6.137,23.4,7.6c1.462,1.465,1.462,3.837,0,5.301c-0.783,0.783-1.822,1.132-2.846,1.079l-2.469,2.468c2.463,1.057,5.424,0.584,7.438-1.424c2.634-2.639,2.633-6.91,0-9.546c-2.639-2.636-6.91-2.637-9.545-0.001C13.967,7.489,13.495,10.451,14.552,12.915zM18.152,10.727l-7.424,7.426c-0.585,0.584-0.587,1.535,0,2.121c0.585,0.584,1.536,0.584,2.121-0.002l7.425-7.424c0.584-0.586,0.584-1.535,0-2.121C19.687,10.141,18.736,10.142,18.152,10.727z");
    }});
draw2d.shape.icon.Calendar = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Calendar", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M11.758,15.318c0.312-0.3,0.408-0.492,0.408-0.492h0.024c0,0-0.012,0.264-0.012,0.528v5.469h-1.871v1.031h4.87v-1.031H13.33v-7.436h-1.055l-2.027,1.967l0.719,0.744L11.758,15.318zM16.163,21.207c0,0.205,0.024,0.42,0.06,0.647h5.457v-1.031h-4.197c0.023-1.931,4.065-2.362,4.065-5.146c0-1.463-1.114-2.436-2.674-2.436c-1.907,0-2.675,1.607-2.675,1.607l0.875,0.587c0,0,0.6-1.08,1.716-1.08c0.887,0,1.522,0.563,1.522,1.403C20.312,17.754,16.163,18.186,16.163,21.207zM12,3.604h-2v3.335h2V3.604zM23,4.77v3.17h-4V4.77h-6v3.168H9.002V4.77H6.583v21.669h18.833V4.77H23zM24.417,25.438H7.584V10.522h16.833V25.438zM22,3.604h-2v3.335h2V3.604z");
    }});
draw2d.shape.icon.Picker = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Picker", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.221,10.853c-0.111-0.414-0.261-0.412,0.221-1.539l1.66-3.519c0.021-0.051,0.2-0.412,0.192-0.946c0.015-0.529-0.313-1.289-1.119-1.642c-1.172-0.555-1.17-0.557-2.344-1.107c-0.784-0.396-1.581-0.171-1.979,0.179c-0.42,0.333-0.584,0.7-0.609,0.75L16.58,6.545c-0.564,1.084-0.655,0.97-1.048,1.147c-0.469,0.129-1.244,0.558-1.785,1.815c-1.108,2.346-1.108,2.346-1.108,2.346l-0.276,0.586l1.17,0.553l-3.599,7.623c-0.38,0.828-0.166,1.436-0.166,2.032c0.01,0.627-0.077,1.509-0.876,3.21l-0.276,0.586l3.517,1.661l0.276-0.585c0.808-1.699,1.431-2.326,1.922-2.717c0.46-0.381,1.066-0.6,1.465-1.42l3.599-7.618l1.172,0.554l0.279-0.589c0,0,0,0,1.105-2.345C22.578,12.166,22.419,11.301,22.221,10.853zM14.623,22.83c-0.156,0.353-0.413,0.439-1.091,0.955c-0.577,0.448-1.264,1.172-2.009,2.6l-1.191-0.562c0.628-1.48,0.75-2.474,0.73-3.203c-0.031-0.851-0.128-1.104,0.045-1.449l3.599-7.621l3.517,1.662L14.623,22.83z");
    }});
draw2d.shape.icon.No = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.No", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16,2.939C9.006,2.942,3.338,8.61,3.335,15.605C3.335,22.6,9.005,28.268,16,28.27c6.994-0.002,12.662-5.67,12.664-12.664C28.663,8.61,22.995,2.939,16,2.939zM25.663,15.605c-0.003,1.943-0.583,3.748-1.569,5.264L10.736,7.513c1.515-0.988,3.32-1.569,5.265-1.573C21.337,5.951,25.654,10.269,25.663,15.605zM6.335,15.605c0.004-1.943,0.584-3.75,1.573-5.266l13.355,13.357c-1.516,0.986-3.32,1.566-5.264,1.569C10.664,25.26,6.346,20.941,6.335,15.605z");
    }});
draw2d.shape.icon.CommandLine = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.CommandLine", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M2.021,9.748L2.021,9.748V9.746V9.748zM2.022,9.746l5.771,5.773l-5.772,5.771l2.122,2.123l7.894-7.895L4.143,7.623L2.022,9.746zM12.248,23.269h14.419V20.27H12.248V23.269zM16.583,17.019h10.084V14.02H16.583V17.019zM12.248,7.769v3.001h14.419V7.769H12.248z");
    }});
draw2d.shape.icon.Photo = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Photo", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.25,10.25H20.5v-1.5h-9.375v1.5h-3.75c-1.104,0-2,0.896-2,2v10.375c0,1.104,0.896,2,2,2H24.25c1.104,0,2-0.896,2-2V12.25C26.25,11.146,25.354,10.25,24.25,10.25zM15.812,23.499c-3.342,0-6.06-2.719-6.06-6.061c0-3.342,2.718-6.062,6.06-6.062s6.062,2.72,6.062,6.062C21.874,20.78,19.153,23.499,15.812,23.499zM15.812,13.375c-2.244,0-4.062,1.819-4.062,4.062c0,2.244,1.819,4.062,4.062,4.062c2.244,0,4.062-1.818,4.062-4.062C19.875,15.194,18.057,13.375,15.812,13.375z");
    }});
draw2d.shape.icon.Printer = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Printer", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.569,12.125h-2.12c-0.207-1.34-1.247-2.759-2.444-3.967c-1.277-1.24-2.654-2.234-3.784-2.37c-0.062-0.008-0.124-0.014-0.198-0.015H8.594c-0.119,0-0.235,0.047-0.319,0.132c-0.083,0.083-0.132,0.2-0.132,0.32v5.9H6.069c-1.104,0-2,0.896-2,2V23h4.074v2.079c0,0.118,0.046,0.23,0.132,0.318c0.086,0.085,0.199,0.131,0.319,0.131h13.445c0.118,0,0.232-0.046,0.318-0.131s0.138-0.199,0.138-0.318V23h4.074v-8.875C26.569,13.021,25.674,12.125,24.569,12.125zM21.589,24.626H9.043V21.5h12.546V24.626zM21.589,13.921c0-0.03,0-0.063-0.003-0.096c-0.015-0.068-0.062-0.135-0.124-0.2H9.043v-6.95h6.987v0.001c0.305-0.019,0.567,0.282,0.769,0.971c0.183,0.655,0.229,1.509,0.229,2.102c0.001,0.433-0.019,0.725-0.019,0.725l-0.037,0.478l0.48,0.005c0.002,0,1.109,0.014,2.196,0.26c1.044,0.226,1.86,0.675,1.938,1.184c0.003,0.045,0.003,0.091,0.003,0.133V13.921z");
    }});
draw2d.shape.icon.Export = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Export", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.086,20.904c-1.805,3.113-5.163,5.212-9.023,5.219c-5.766-0.01-10.427-4.672-10.438-10.435C4.636,9.922,9.297,5.261,15.063,5.25c3.859,0.007,7.216,2.105,9.022,5.218l3.962,2.284l0.143,0.082C26.879,6.784,21.504,2.25,15.063,2.248C7.64,2.25,1.625,8.265,1.624,15.688c0.002,7.42,6.017,13.435,13.439,13.437c6.442-0.002,11.819-4.538,13.127-10.589l-0.141,0.081L24.086,20.904zM28.4,15.688l-7.15-4.129v2.297H10.275v3.661H21.25v2.297L28.4,15.688z");
    }});
draw2d.shape.icon.Import = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Import", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.067,2.25c-5.979,0-11.035,3.91-12.778,9.309h3.213c1.602-3.705,5.271-6.301,9.565-6.309c5.764,0.01,10.428,4.674,10.437,10.437c-0.009,5.764-4.673,10.428-10.437,10.438c-4.294-0.007-7.964-2.605-9.566-6.311H2.289c1.744,5.399,6.799,9.31,12.779,9.312c7.419-0.002,13.437-6.016,13.438-13.438C28.504,8.265,22.486,2.252,15.067,2.25zM10.918,19.813l7.15-4.126l-7.15-4.129v2.297H-0.057v3.661h10.975V19.813z");
    }});
draw2d.shape.icon.Run = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Run", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M17.41,20.395l-0.778-2.723c0.228-0.2,0.442-0.414,0.644-0.643l2.721,0.778c0.287-0.418,0.534-0.862,0.755-1.323l-2.025-1.96c0.097-0.288,0.181-0.581,0.241-0.883l2.729-0.684c0.02-0.252,0.039-0.505,0.039-0.763s-0.02-0.51-0.039-0.762l-2.729-0.684c-0.061-0.302-0.145-0.595-0.241-0.883l2.026-1.96c-0.222-0.46-0.469-0.905-0.756-1.323l-2.721,0.777c-0.201-0.228-0.416-0.442-0.644-0.643l0.778-2.722c-0.418-0.286-0.863-0.534-1.324-0.755l-1.96,2.026c-0.287-0.097-0.581-0.18-0.883-0.241l-0.683-2.73c-0.253-0.019-0.505-0.039-0.763-0.039s-0.51,0.02-0.762,0.039l-0.684,2.73c-0.302,0.061-0.595,0.144-0.883,0.241l-1.96-2.026C7.048,3.463,6.604,3.71,6.186,3.997l0.778,2.722C6.736,6.919,6.521,7.134,6.321,7.361L3.599,6.583C3.312,7.001,3.065,7.446,2.844,7.907l2.026,1.96c-0.096,0.288-0.18,0.581-0.241,0.883l-2.73,0.684c-0.019,0.252-0.039,0.505-0.039,0.762s0.02,0.51,0.039,0.763l2.73,0.684c0.061,0.302,0.145,0.595,0.241,0.883l-2.026,1.96c0.221,0.46,0.468,0.905,0.755,1.323l2.722-0.778c0.2,0.229,0.415,0.442,0.643,0.643l-0.778,2.723c0.418,0.286,0.863,0.533,1.323,0.755l1.96-2.026c0.288,0.097,0.581,0.181,0.883,0.241l0.684,2.729c0.252,0.02,0.505,0.039,0.763,0.039s0.51-0.02,0.763-0.039l0.683-2.729c0.302-0.061,0.596-0.145,0.883-0.241l1.96,2.026C16.547,20.928,16.992,20.681,17.41,20.395zM11.798,15.594c-1.877,0-3.399-1.522-3.399-3.399s1.522-3.398,3.399-3.398s3.398,1.521,3.398,3.398S13.675,15.594,11.798,15.594zM27.29,22.699c0.019-0.547-0.06-1.104-0.23-1.654l1.244-1.773c-0.188-0.35-0.4-0.682-0.641-0.984l-2.122,0.445c-0.428-0.364-0.915-0.648-1.436-0.851l-0.611-2.079c-0.386-0.068-0.777-0.105-1.173-0.106l-0.974,1.936c-0.279,0.054-0.558,0.128-0.832,0.233c-0.257,0.098-0.497,0.22-0.727,0.353L17.782,17.4c-0.297,0.262-0.568,0.545-0.813,0.852l0.907,1.968c-0.259,0.495-0.437,1.028-0.519,1.585l-1.891,1.06c0.019,0.388,0.076,0.776,0.164,1.165l2.104,0.519c0.231,0.524,0.541,0.993,0.916,1.393l-0.352,2.138c0.32,0.23,0.66,0.428,1.013,0.6l1.715-1.32c0.536,0.141,1.097,0.195,1.662,0.15l1.452,1.607c0.2-0.057,0.399-0.118,0.596-0.193c0.175-0.066,0.34-0.144,0.505-0.223l0.037-2.165c0.455-0.339,0.843-0.747,1.152-1.206l2.161-0.134c0.152-0.359,0.279-0.732,0.368-1.115L27.29,22.699zM23.127,24.706c-1.201,0.458-2.545-0.144-3.004-1.345s0.143-2.546,1.344-3.005c1.201-0.458,2.547,0.144,3.006,1.345C24.931,22.902,24.328,24.247,23.127,24.706z");
    }});
draw2d.shape.icon.Magnet = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Magnet", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.812,19.5h5.002v-6.867c-0.028-1.706-0.61-3.807-2.172-5.841c-1.539-2.014-4.315-3.72-7.939-3.687C12.076,3.073,9.3,4.779,7.762,6.792C6.2,8.826,5.617,10.928,5.588,12.634V19.5h5v-6.866c-0.027-0.377,0.303-1.789,1.099-2.748c0.819-0.979,1.848-1.747,4.014-1.778c2.165,0.032,3.195,0.799,4.013,1.778c0.798,0.959,1.126,2.372,1.099,2.748V19.5L20.812,19.5zM25.814,25.579c0,0,0-2.354,0-5.079h-5.002c0,2.727,0,5.08,0,5.08l5.004-0.001H25.814zM5.588,25.58h5c0,0,0-2.354,0-5.08h-5C5.588,23.227,5.588,25.58,5.588,25.58z");
    }});
draw2d.shape.icon.NoMagnet = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.NoMagnet", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M10.59,17.857v-5.225c-0.027-0.376,0.303-1.789,1.099-2.748c0.819-0.979,1.849-1.748,4.014-1.778c1.704,0.026,2.699,0.508,3.447,1.189l3.539-3.539c-1.616-1.526-4.01-2.679-6.986-2.652C12.077,3.073,9.3,4.779,7.762,6.793C6.2,8.826,5.617,10.928,5.59,12.634V19.5h3.357L10.59,17.857zM5.59,20.5v2.357L7.947,20.5H5.59zM20.812,13.29v6.21h5.002v-6.866c-0.021-1.064-0.252-2.283-0.803-3.542L20.812,13.29zM25.339,4.522L4.652,25.209l1.415,1.416L26.753,5.937L25.339,4.522zM20.812,25.58h5.002c0,0,0-2.354,0-5.08h-5.002C20.812,23.227,20.812,25.58,20.812,25.58zM10.59,25.58c0,0,0-0.827,0-2.064L8.525,25.58H10.59z");
    }});
draw2d.shape.icon.ReflectH = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ReflectH", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.57,20.273h0.854v-1.705H15.57V20.273zM15.57,23.686h0.854V21.98H15.57V23.686zM15.57,27.096h0.854v-1.705H15.57V27.096zM15.57,29.689h0.854V28.8H15.57V29.689zM15.57,16.865h0.854V15.16H15.57V16.865zM15.57,3.225h0.854V1.52H15.57V3.225zM15.57,6.635h0.854V4.93H15.57V6.635zM15.57,10.045h0.854V8.34H15.57V10.045zM15.57,13.455h0.854V11.75H15.57V13.455zM18.41,3.327V25.46h12.015L18.41,3.327zM19.264,6.68l9.729,17.93h-9.729V6.68zM13.535,25.46V3.327L1.521,25.46H13.535z");
    }});
draw2d.shape.icon.ReflectV = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.ReflectV", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.643,16.008v-0.854h-1.705v0.854H20.643zM24.053,16.008v-0.854h-1.705v0.854H24.053zM27.463,16.008v-0.854h-1.705v0.854H27.463zM30.059,16.008v-0.854h-0.891v0.854H30.059zM17.232,16.008v-0.854h-1.709v0.854H17.232zM3.593,16.008v-0.854H1.888v0.854H3.593zM7.003,16.008v-0.854H5.298v0.854H7.003zM10.414,16.008v-0.854H8.709v0.854H10.414zM13.824,16.008v-0.854h-1.705v0.854H13.824zM3.694,13.167h22.134V1.152L3.694,13.167zM7.048,12.314l17.929-9.729v9.729H7.048zM25.828,18.042H3.694l22.134,12.015V18.042z");
    }});
draw2d.shape.icon.Resize2 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Resize2", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M1.999,2.332v26.499H28.5V2.332H1.999zM26.499,26.832H4V12.5h8.167V4.332h14.332V26.832zM15.631,17.649l5.468,5.469l-1.208,1.206l5.482,1.469l-1.47-5.481l-1.195,1.195l-5.467-5.466l1.209-1.208l-5.482-1.469l1.468,5.48L15.631,17.649z");
    }});
draw2d.shape.icon.Rotate = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Rotate", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.5,5.27c1.914,0,3.666,0.629,5.089,1.686l-1.781,1.783l8.428,2.256l-2.26-8.427l-1.889,1.89C21.016,2.781,18.371,1.77,15.5,1.77C8.827,1.773,3.418,7.181,3.417,13.855c0.001,4.063,2.012,7.647,5.084,9.838v-4.887c-0.993-1.4-1.583-3.105-1.585-4.952C6.923,9.114,10.759,5.278,15.5,5.27zM9.5,29.23h12V12.355h-12V29.23z");
    }});
draw2d.shape.icon.Connect = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Connect", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.06,13.719c-0.944-5.172-5.461-9.094-10.903-9.094v4c3.917,0.006,7.085,3.176,7.094,7.094c-0.009,3.917-3.177,7.085-7.094,7.093v4.002c5.442-0.004,9.959-3.926,10.903-9.096h4.69v-3.999H25.06zM20.375,15.719c0-3.435-2.784-6.219-6.219-6.219c-2.733,0-5.05,1.766-5.884,4.218H1.438v4.001h6.834c0.833,2.452,3.15,4.219,5.884,4.219C17.591,21.938,20.375,19.153,20.375,15.719z");
    }});
draw2d.shape.icon.Disconnect = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Disconnect", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M9.219,9.5c-2.733,0-5.05,1.766-5.884,4.218H1.438v4.001h1.897c0.833,2.452,3.15,4.219,5.884,4.219c3.435,0,6.219-2.784,6.219-6.219S12.653,9.5,9.219,9.5zM27.685,13.719c-0.944-5.172-5.461-9.094-10.903-9.094v4c3.917,0.006,7.085,3.176,7.094,7.094c-0.009,3.917-3.177,7.085-7.094,7.093v4.002c5.442-0.004,9.959-3.926,10.903-9.096h2.065v-3.999H27.685z");
    }});
draw2d.shape.icon.Folder = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Folder", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.625,26.75h-26.5V8.375h1.124c1.751,0,0.748-3.125,3-3.125c3.215,0,1.912,0,5.126,0c2.251,0,1.251,3.125,3.001,3.125h14.25V26.75z");
    }});
draw2d.shape.icon.Man = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Man", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.021,16.349c-0.611-1.104-1.359-1.998-2.109-2.623c-0.875,0.641-1.941,1.031-3.103,1.031c-1.164,0-2.231-0.391-3.105-1.031c-0.75,0.625-1.498,1.519-2.111,2.623c-1.422,2.563-1.578,5.192-0.35,5.874c0.55,0.307,1.127,0.078,1.723-0.496c-0.105,0.582-0.166,1.213-0.166,1.873c0,2.932,1.139,5.307,2.543,5.307c0.846,0,1.265-0.865,1.466-2.189c0.201,1.324,0.62,2.189,1.463,2.189c1.406,0,2.545-2.375,2.545-5.307c0-0.66-0.061-1.291-0.168-1.873c0.598,0.574,1.174,0.803,1.725,0.496C22.602,21.541,22.443,18.912,21.021,16.349zM15.808,13.757c2.362,0,4.278-1.916,4.278-4.279s-1.916-4.279-4.278-4.279c-2.363,0-4.28,1.916-4.28,4.279S13.445,13.757,15.808,13.757z");
    }});
draw2d.shape.icon.Woman = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Woman", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.022,16.349c-0.611-1.104-1.359-1.998-2.109-2.623c-0.875,0.641-1.941,1.031-3.104,1.031c-1.164,0-2.231-0.391-3.105-1.031c-0.75,0.625-1.498,1.519-2.111,2.623c-1.422,2.563-1.579,5.192-0.351,5.874c0.55,0.307,1.127,0.078,1.723-0.496c-0.105,0.582-0.167,1.213-0.167,1.873c0,2.932,1.139,5.307,2.543,5.307c0.846,0,1.265-0.865,1.466-2.189c0.201,1.324,0.62,2.189,1.464,2.189c1.406,0,2.545-2.375,2.545-5.307c0-0.66-0.061-1.291-0.168-1.873c0.598,0.574,1.174,0.803,1.725,0.496C22.603,21.541,22.444,18.912,21.022,16.349zM15.808,13.757c2.363,0,4.279-1.916,4.279-4.279s-1.916-4.279-4.279-4.279c-2.363,0-4.28,1.916-4.28,4.279S13.445,13.757,15.808,13.757zM18.731,4.974c1.235,0.455,0.492-0.725,0.492-1.531s0.762-1.792-0.492-1.391c-1.316,0.422-2.383,0.654-2.383,1.461S17.415,4.489,18.731,4.974zM15.816,4.4c0.782,0,0.345-0.396,0.345-0.884c0-0.488,0.438-0.883-0.345-0.883s-0.374,0.396-0.374,0.883C15.442,4.005,15.034,4.4,15.816,4.4zM12.884,4.974c1.316-0.484,2.383-0.654,2.383-1.461S14.2,2.474,12.884,2.052c-1.254-0.402-0.492,0.584-0.492,1.391S11.648,5.428,12.884,4.974z");
    }});
draw2d.shape.icon.People = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.People", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.066,20.667c1.227-0.682,1.068-3.311-0.354-5.874c-0.611-1.104-1.359-1.998-2.109-2.623c-0.875,0.641-1.941,1.031-3.102,1.031c-1.164,0-2.231-0.391-3.104-1.031c-0.75,0.625-1.498,1.519-2.111,2.623c-1.422,2.563-1.578,5.192-0.35,5.874c0.549,0.312,1.127,0.078,1.723-0.496c-0.105,0.582-0.166,1.213-0.166,1.873c0,2.938,1.139,5.312,2.543,5.312c0.846,0,1.265-0.865,1.466-2.188c0.2,1.314,0.62,2.188,1.461,2.188c1.396,0,2.545-2.375,2.545-5.312c0-0.66-0.062-1.291-0.168-1.873C19.939,20.745,20.516,20.983,21.066,20.667zM15.5,12.201c2.361,0,4.277-1.916,4.277-4.279S17.861,3.644,15.5,3.644c-2.363,0-4.28,1.916-4.28,4.279S13.137,12.201,15.5,12.201zM24.094,14.914c1.938,0,3.512-1.573,3.512-3.513c0-1.939-1.573-3.513-3.512-3.513c-1.94,0-3.513,1.573-3.513,3.513C20.581,13.341,22.153,14.914,24.094,14.914zM28.374,17.043c-0.502-0.907-1.116-1.641-1.732-2.154c-0.718,0.526-1.594,0.846-2.546,0.846c-0.756,0-1.459-0.207-2.076-0.55c0.496,1.093,0.803,2.2,0.861,3.19c0.093,1.516-0.381,2.641-1.329,3.165c-0.204,0.117-0.426,0.183-0.653,0.224c-0.056,0.392-0.095,0.801-0.095,1.231c0,2.412,0.935,4.361,2.088,4.361c0.694,0,1.039-0.71,1.204-1.796c0.163,1.079,0.508,1.796,1.199,1.796c1.146,0,2.09-1.95,2.09-4.361c0-0.542-0.052-1.06-0.139-1.538c0.492,0.472,0.966,0.667,1.418,0.407C29.671,21.305,29.541,19.146,28.374,17.043zM6.906,14.914c1.939,0,3.512-1.573,3.512-3.513c0-1.939-1.573-3.513-3.512-3.513c-1.94,0-3.514,1.573-3.514,3.513C3.392,13.341,4.966,14.914,6.906,14.914zM9.441,21.536c-1.593-0.885-1.739-3.524-0.457-6.354c-0.619,0.346-1.322,0.553-2.078,0.553c-0.956,0-1.832-0.321-2.549-0.846c-0.616,0.513-1.229,1.247-1.733,2.154c-1.167,2.104-1.295,4.262-0.287,4.821c0.451,0.257,0.925,0.064,1.414-0.407c-0.086,0.479-0.136,0.996-0.136,1.538c0,2.412,0.935,4.361,2.088,4.361c0.694,0,1.039-0.71,1.204-1.796c0.165,1.079,0.509,1.796,1.201,1.796c1.146,0,2.089-1.95,2.089-4.361c0-0.432-0.04-0.841-0.097-1.233C9.874,21.721,9.651,21.656,9.441,21.536z");
    }});
draw2d.shape.icon.Parent = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Parent", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.423,12.17c-0.875,0.641-1.941,1.031-3.102,1.031c-1.164,0-2.231-0.391-3.104-1.031c-0.75,0.625-1.498,1.519-2.111,2.623c-1.422,2.563-1.578,5.192-0.35,5.874c0.549,0.312,1.127,0.078,1.723-0.496c-0.105,0.582-0.166,1.213-0.166,1.873c0,2.938,1.139,5.312,2.543,5.312c0.846,0,1.265-0.865,1.466-2.188c0.2,1.314,0.62,2.188,1.461,2.188c1.396,0,2.545-2.375,2.545-5.312c0-0.66-0.062-1.291-0.168-1.873c0.6,0.574,1.176,0.812,1.726,0.496c1.227-0.682,1.068-3.311-0.354-5.874C15.921,13.689,15.173,12.795,14.423,12.17zM11.32,12.201c2.361,0,4.277-1.916,4.277-4.279s-1.916-4.279-4.277-4.279c-2.363,0-4.28,1.916-4.28,4.279S8.957,12.201,11.32,12.201zM21.987,17.671c1.508,0,2.732-1.225,2.732-2.735c0-1.51-1.225-2.735-2.732-2.735c-1.511,0-2.736,1.225-2.736,2.735C19.251,16.446,20.477,17.671,21.987,17.671zM25.318,19.327c-0.391-0.705-0.869-1.277-1.349-1.677c-0.56,0.41-1.24,0.659-1.982,0.659c-0.744,0-1.426-0.25-1.983-0.659c-0.479,0.399-0.958,0.972-1.35,1.677c-0.909,1.638-1.009,3.318-0.224,3.754c0.351,0.2,0.721,0.05,1.101-0.317c-0.067,0.372-0.105,0.775-0.105,1.197c0,1.878,0.728,3.396,1.625,3.396c0.54,0,0.808-0.553,0.937-1.398c0.128,0.841,0.396,1.398,0.934,1.398c0.893,0,1.627-1.518,1.627-3.396c0-0.422-0.04-0.825-0.107-1.197c0.383,0.367,0.752,0.52,1.104,0.317C26.328,22.646,26.227,20.965,25.318,19.327z");
    }});
draw2d.shape.icon.Notebook = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Notebook", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.875,1.375H8c-1.033,0-1.874,0.787-1.979,1.792h1.604c1.102,0,2,0.898,2,2c0,1.102-0.898,2-2,2H6v0.999h1.625c1.104,0,2.002,0.898,2.002,2.002c0,1.104-0.898,2.001-2.002,2.001H6v0.997h1.625c1.102,0,2,0.898,2,2c0,1.104-0.898,2.004-2,2.004H6v0.994h1.625c1.102,0,2,0.898,2,2.002s-0.898,2.002-2,2.002H6v0.997h1.624c1.104,0,2.002,0.897,2.002,2.001c0,1.104-0.898,2.002-2.002,2.002H6.004C6.027,28.252,6.91,29.125,8,29.125h16.875c1.104,0,2-0.896,2-2V3.375C26.875,2.271,25.979,1.375,24.875,1.375zM25.25,8.375c0,0.552-0.447,1-1,1H14c-0.553,0-1-0.448-1-1V4c0-0.552,0.447-1,1-1h10.25c0.553,0,1,0.448,1,1V8.375zM8.625,25.166c0-0.554-0.449-1.001-1-1.001h-3.25c-0.552,0-1,0.447-1,1.001c0,0.552,0.449,1,1,1h3.25C8.176,26.166,8.625,25.718,8.625,25.166zM4.375,6.166h3.251c0.551,0,0.999-0.448,0.999-0.999c0-0.555-0.448-1-0.999-1H4.375c-0.553,0-1,0.445-1,1C3.374,5.718,3.822,6.166,4.375,6.166zM4.375,11.167h3.25c0.553,0,1-0.448,1-1s-0.448-1-1-1h-3.25c-0.553,0-1,0.448-1,1S3.822,11.167,4.375,11.167zM4.375,16.167h3.25c0.551,0,1-0.448,1-1.001s-0.448-0.999-1-0.999h-3.25c-0.553,0-1.001,0.446-1.001,0.999S3.822,16.167,4.375,16.167zM3.375,20.165c0,0.553,0.446,1.002,1,1.002h3.25c0.551,0,1-0.449,1-1.002c0-0.552-0.448-1-1-1h-3.25C3.821,19.165,3.375,19.613,3.375,20.165z");
    }});
draw2d.shape.icon.Diagram = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Diagram", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M6.812,17.202l7.396-3.665v-2.164h-0.834c-0.414,0-0.808-0.084-1.167-0.237v1.159l-7.396,3.667v2.912h2V17.202zM26.561,18.875v-2.913l-7.396-3.666v-1.158c-0.358,0.152-0.753,0.236-1.166,0.236h-0.832l-0.001,2.164l7.396,3.666v1.672H26.561zM16.688,18.875v-7.501h-2v7.501H16.688zM27.875,19.875H23.25c-1.104,0-2,0.896-2,2V26.5c0,1.104,0.896,2,2,2h4.625c1.104,0,2-0.896,2-2v-4.625C29.875,20.771,28.979,19.875,27.875,19.875zM8.125,19.875H3.5c-1.104,0-2,0.896-2,2V26.5c0,1.104,0.896,2,2,2h4.625c1.104,0,2-0.896,2-2v-4.625C10.125,20.771,9.229,19.875,8.125,19.875zM13.375,10.375H18c1.104,0,2-0.896,2-2V3.75c0-1.104-0.896-2-2-2h-4.625c-1.104,0-2,0.896-2,2v4.625C11.375,9.479,12.271,10.375,13.375,10.375zM18,19.875h-4.625c-1.104,0-2,0.896-2,2V26.5c0,1.104,0.896,2,2,2H18c1.104,0,2-0.896,2-2v-4.625C20,20.771,19.104,19.875,18,19.875z");
    }});
draw2d.shape.icon.BarChart = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.BarChart", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.25,8.375V28h6.5V8.375H21.25zM12.25,28h6.5V4.125h-6.5V28zM3.25,28h6.5V12.625h-6.5V28z");
    }});
draw2d.shape.icon.PieChart = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.PieChart", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.583,15.917l1.648-10.779C16.692,5.056,16.145,5,15.583,5C9.554,5,4.666,9.888,4.666,15.917c0,6.029,4.888,10.917,10.917,10.917S26.5,21.946,26.5,15.917c0-0.256-0.021-0.507-0.038-0.759L15.583,15.917zM19.437,3.127l-1.648,10.779l10.879-0.759C28.313,8.026,24.436,3.886,19.437,3.127z");
    }});
draw2d.shape.icon.LineChart = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.LineChart", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M3.625,25.062c-0.539-0.115-0.885-0.646-0.77-1.187l0,0L6.51,6.584l2.267,9.259l1.923-5.188l3.581,3.741l3.883-13.103l2.934,11.734l1.96-1.509l5.271,11.74c0.226,0.504,0,1.095-0.505,1.321l0,0c-0.505,0.227-1.096,0-1.322-0.504l0,0l-4.23-9.428l-2.374,1.826l-1.896-7.596l-2.783,9.393l-3.754-3.924L8.386,22.66l-1.731-7.083l-1.843,8.711c-0.101,0.472-0.515,0.794-0.979,0.794l0,0C3.765,25.083,3.695,25.076,3.625,25.062L3.625,25.062z");
    }});
draw2d.shape.icon.Apps = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Apps", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.359,18.424l-2.326,1.215c0.708,1.174,1.384,2.281,1.844,3.033l2.043-1.066C25.538,20.822,24.966,19.652,24.359,18.424zM19.143,14.688c0.445,0.84,1.342,2.367,2.274,3.926l2.414-1.261c-0.872-1.769-1.72-3.458-2.087-4.122c-0.896-1.621-1.982-3.108-3.454-5.417c-1.673-2.625-3.462-5.492-4.052-4.947c-1.194,0.384,1.237,4.094,1.876,5.715C16.73,10.147,17.991,12.512,19.143,14.688zM26.457,22.673l-1.961,1.022l1.982,4.598c0,0,0.811,0.684,1.92,0.213c1.104-0.469,0.81-1.706,0.81-1.706L26.457,22.673zM24.35,15.711c0.168,0.339,2.924,5.93,2.924,5.93h1.983v-5.93H24.35zM18.34,15.704h-4.726l-3.424,5.935h11.66C21.559,21.159,18.771,16.479,18.34,15.704zM3.231,21.613l3.437-5.902H2.083v5.93h1.133L3.231,21.613zM15.048,10.145c0-0.93-0.754-1.685-1.685-1.685c-0.661,0-1.231,0.381-1.507,0.936l2.976,1.572C14.97,10.725,15.048,10.444,15.048,10.145zM14.343,12.06l-3.188-1.684L9.62,13.012l3.197,1.689L14.343,12.06zM3.192,26.886l-0.384,1.108v0.299l0.298-0.128l0.725-0.896l2.997-2.354l-3.137-1.651L3.192,26.886zM9.02,14.044l-4.757,8.17l3.23,1.706l4.728-8.186L9.02,14.044z");
    }});
draw2d.shape.icon.Locked = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Locked", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M26.711,14.085L16.914,4.29c-0.778-0.778-2.051-0.778-2.829,0L4.29,14.086c-0.778,0.778-0.778,2.05,0,2.829l9.796,9.796c0.778,0.777,2.051,0.777,2.829,0l9.797-9.797C27.488,16.136,27.488,14.863,26.711,14.085zM8.218,16.424c-0.4-0.153-0.687-0.533-0.687-0.987s0.287-0.834,0.687-0.987V16.424zM8.969,16.424v-1.974c0.4,0.152,0.687,0.533,0.687,0.987S9.369,16.272,8.969,16.424zM13.5,19.188l1.203-3.609c-0.689-0.306-1.172-0.994-1.172-1.797c0-1.087,0.881-1.969,1.969-1.969c1.087,0,1.969,0.881,1.969,1.969c0,0.803-0.482,1.491-1.172,1.797l1.203,3.609H13.5zM22.03,16.549c-0.399-0.152-0.687-0.533-0.687-0.986s0.287-0.834,0.687-0.987V16.549zM22.781,16.549v-1.973c0.4,0.152,0.688,0.533,0.688,0.987S23.182,16.397,22.781,16.549z");
    }});
draw2d.shape.icon.Ppt = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Ppt", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16.604,1.914c0-0.575-0.466-1.041-1.041-1.041s-1.041,0.466-1.041,1.041v1.04h2.082V1.914zM16.604,22.717h-2.082v3.207c0,0.574-4.225,4.031-4.225,4.031l2.468-0.003l2.807-2.673l3.013,2.693l2.272-0.039l-4.254-4.011V22.717L16.604,22.717zM28.566,7.113c0.86,0,1.56-0.698,1.56-1.56c0-0.861-0.698-1.56-1.56-1.56H2.561c-0.861,0-1.56,0.699-1.56,1.56c0,0.862,0.699,1.56,1.56,1.56h1.583v12.505l-0.932-0.022c-0.861,0-1.213,0.467-1.213,1.04c0,0.576,0.352,1.041,1.213,1.041h24.597c0.86,0,1.299-0.465,1.299-1.041c0-1.094-1.299-1.04-1.299-1.04l-0.804,0.109V7.113H28.566zM11.435,17.516c-3.771,0-4.194-4.191-4.194-4.191c0-4.096,4.162-4.161,4.162-4.161v4.161h4.193C15.596,17.516,11.435,17.516,11.435,17.516zM18.716,13.388h-1.071v-1.073h1.071V13.388zM18.716,10.267h-1.071V9.194h1.071V10.267zM23.314,13.388H20.26c-0.296,0-0.535-0.24-0.535-0.536c0-0.297,0.239-0.537,0.535-0.537h3.057c0.297,0,0.535,0.24,0.535,0.537C23.852,13.147,23.611,13.388,23.314,13.388zM23.314,10.267H20.26c-0.296,0-0.535-0.239-0.535-0.535c0-0.297,0.239-0.537,0.535-0.537h3.057c0.297,0,0.535,0.24,0.535,0.537C23.852,10.027,23.611,10.267,23.314,10.267z");
    }});
draw2d.shape.icon.Lab = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Lab", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.121,24.438l-3.362-7.847c-0.329-0.769-0.599-2.081-0.599-2.917s0.513-1.521,1.14-1.521s1.141-0.513,1.141-1.14s-0.685-1.14-1.521-1.14h-6.84c-0.836,0-1.52,0.513-1.52,1.14s0.513,1.14,1.14,1.14s1.14,0.685,1.14,1.521s-0.269,2.148-0.599,2.917l-3.362,7.847C8.55,25.206,8.28,26.177,8.28,26.595s0.342,1.103,0.76,1.521s1.444,0.76,2.28,0.76h8.359c0.836,0,1.862-0.342,2.28-0.76s0.76-1.103,0.76-1.521S22.45,25.206,22.121,24.438zM16.582,7.625c0,0.599,0.484,1.083,1.083,1.083s1.083-0.484,1.083-1.083s-0.484-1.084-1.083-1.084S16.582,7.026,16.582,7.625zM13.667,7.792c0.276,0,0.5-0.224,0.5-0.5s-0.224-0.5-0.5-0.5s-0.5,0.224-0.5,0.5S13.391,7.792,13.667,7.792zM15.584,5.292c0.874,0,1.583-0.709,1.583-1.583c0-0.875-0.709-1.584-1.583-1.584C14.709,2.125,14,2.834,14,3.709C14,4.583,14.709,5.292,15.584,5.292z");
    }});
draw2d.shape.icon.Umbrella = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Umbrella", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.784,26.991c0,1.238-1.329,1.696-1.835,1.696c-0.504,0-1.536-0.413-1.65-1.812c0-0.354-0.288-0.642-0.644-0.642c-0.354,0-0.641,0.287-0.641,0.642c0.045,1.056,0.756,3.052,2.935,3.052c2.432,0,3.166-1.882,3.166-3.144v-8.176l-1.328-0.024C14.787,18.584,14.784,25.889,14.784,26.991zM15.584,9.804c-6.807,0-11.084,4.859-11.587,8.326c0.636-0.913,1.694-1.51,2.89-1.51c1.197,0,2.22,0.582,2.855,1.495c0.638-0.904,1.69-1.495,2.88-1.495c1.2,0,2.26,0.6,2.896,1.517c0.635-0.917,1.83-1.517,3.03-1.517c1.19,0,2.241,0.591,2.879,1.495c0.636-0.913,1.659-1.495,2.855-1.495c1.197,0,2.254,0.597,2.89,1.51C26.669,14.663,22.393,9.804,15.584,9.804zM14.733,7.125v2.081h1.323V7.125c0-0.365-0.296-0.661-0.661-0.661C15.029,6.464,14.733,6.76,14.733,7.125z");
    }});
draw2d.shape.icon.Dry = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Dry", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.784,26.991c0,1.238-1.329,1.696-1.835,1.696c-0.504,0-1.536-0.413-1.65-1.812c0-0.354-0.288-0.642-0.644-0.642c-0.354,0-0.641,0.287-0.641,0.642c0.045,1.056,0.756,3.052,2.935,3.052c2.432,0,3.166-1.882,3.166-3.144v-8.176l-1.328-0.024C14.787,18.584,14.784,25.889,14.784,26.991zM15.584,9.804c-6.807,0-11.084,4.859-11.587,8.326c0.636-0.913,1.694-1.51,2.89-1.51c1.197,0,2.22,0.582,2.855,1.495c0.638-0.904,1.69-1.495,2.88-1.495c1.2,0,2.26,0.6,2.896,1.517c0.635-0.917,1.83-1.517,3.03-1.517c1.19,0,2.241,0.591,2.879,1.495c0.636-0.913,1.659-1.495,2.855-1.495c1.197,0,2.254,0.597,2.89,1.51C26.669,14.663,22.393,9.804,15.584,9.804zM14.733,7.125v2.081h1.323V7.125c0-0.365-0.296-0.661-0.661-0.661C15.029,6.464,14.733,6.76,14.733,7.125zM7.562,6.015c0.54,0.312,1.229,0.128,1.54-0.412c0.109-0.189,0.157-0.398,0.15-0.602L9.251,3.09L7.59,4.047c-0.178,0.095-0.333,0.24-0.441,0.428C6.837,5.015,7.022,5.703,7.562,6.015zM5.572,11.717c0.109-0.19,0.158-0.398,0.151-0.602L5.721,9.203l-1.66,0.957c-0.178,0.096-0.333,0.241-0.441,0.429c-0.311,0.539-0.127,1.229,0.413,1.539C4.571,12.44,5.26,12.256,5.572,11.717zM10.523,9.355c0.539,0.312,1.229,0.126,1.541-0.412c0.109-0.189,0.156-0.398,0.15-0.603L12.214,6.43l-1.662,0.956c-0.177,0.097-0.332,0.241-0.441,0.43C9.799,8.354,9.984,9.044,10.523,9.355zM15.251,3.998c0.539,0.312,1.229,0.126,1.54-0.412c0.11-0.19,0.157-0.398,0.15-0.603L16.94,1.072l-1.661,0.956c-0.178,0.097-0.332,0.242-0.441,0.43C14.526,2.998,14.711,3.687,15.251,3.998zM19.348,8.914c0.539,0.312,1.228,0.128,1.541-0.412c0.109-0.189,0.156-0.398,0.149-0.602h-0.001V5.988l-1.661,0.957c-0.178,0.096-0.332,0.241-0.441,0.429C18.623,7.914,18.809,8.603,19.348,8.914zM23.633,5.196c0.54,0.312,1.23,0.126,1.542-0.413c0.109-0.189,0.156-0.398,0.149-0.602h-0.001V2.27l-1.662,0.957c-0.177,0.096-0.331,0.24-0.44,0.43C22.909,4.195,23.094,4.885,23.633,5.196zM27.528,8.51l-1.659,0.956c-0.18,0.097-0.334,0.242-0.443,0.43c-0.312,0.539-0.127,1.229,0.413,1.54c0.539,0.312,1.229,0.127,1.541-0.412c0.109-0.19,0.158-0.398,0.151-0.603L27.528,8.51z");
    }});
draw2d.shape.icon.Ipad = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Ipad", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.221,1.417H6.11c-0.865,0-1.566,0.702-1.566,1.566v25.313c0,0.865,0.701,1.565,1.566,1.565h19.111c0.865,0,1.565-0.7,1.565-1.565V2.984C26.787,2.119,26.087,1.417,25.221,1.417zM15.666,29.299c-0.346,0-0.626-0.279-0.626-0.625s0.281-0.627,0.626-0.627c0.346,0,0.627,0.281,0.627,0.627S16.012,29.299,15.666,29.299zM24.376,26.855c0,0.174-0.142,0.312-0.313,0.312H7.27c-0.173,0-0.313-0.142-0.313-0.312V4.3c0-0.173,0.14-0.313,0.313-0.313h16.792c0.172,0,0.312,0.14,0.312,0.313L24.376,26.855L24.376,26.855z");
    }});
draw2d.shape.icon.Iphone = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Iphone", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.755,1H10.62C9.484,1,8.562,1.921,8.562,3.058v24.385c0,1.136,0.921,2.058,2.058,2.058h10.135c1.136,0,2.058-0.922,2.058-2.058V3.058C22.812,1.921,21.891,1,20.755,1zM14.659,3.264h2.057c0.101,0,0.183,0.081,0.183,0.18c0,0.1-0.082,0.18-0.183,0.18h-2.057c-0.1,0-0.181-0.081-0.181-0.18C14.478,3.344,14.559,3.264,14.659,3.264zM13.225,3.058c0.199,0,0.359,0.162,0.359,0.36c0,0.198-0.161,0.36-0.359,0.36c-0.2,0-0.36-0.161-0.36-0.36S13.025,3.058,13.225,3.058zM15.688,28.473c-0.796,0-1.44-0.646-1.44-1.438c0-0.799,0.645-1.439,1.44-1.439s1.44,0.646,1.44,1.439S16.483,28.473,15.688,28.473zM22.041,24.355c0,0.17-0.139,0.309-0.309,0.309H9.642c-0.17,0-0.308-0.139-0.308-0.309V6.042c0-0.17,0.138-0.309,0.308-0.309h12.09c0.17,0,0.309,0.138,0.309,0.309V24.355z");
    }});
draw2d.shape.icon.Jigsaw = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Jigsaw", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M3.739,13.619c0,0,3.516-4.669,5.592-3.642c2.077,1.027-0.414,2.795,1.598,3.719c2.011,0.924,5.048-0.229,4.376-2.899c-0.672-2.67-1.866-0.776-2.798-2.208c-0.934-1.432,4.586-4.59,4.586-4.59s3.361,6.651,4.316,4.911c1.157-2.105,3.193-4.265,5.305-1.025c0,0,1.814,2.412,0.246,3.434s-2.917,0.443-3.506,1.553c-0.586,1.112,3.784,4.093,3.784,4.093s-2.987,4.81-4.926,3.548c-1.939-1.262,0.356-3.364-2.599-3.989c-1.288-0.23-3.438,0.538-3.818,2.34c-0.13,2.709,1.604,2.016,2.797,3.475c1.191,1.457-4.484,4.522-4.484,4.522s-1.584-3.923-3.811-4.657c-2.227-0.735-0.893,2.135-2.917,2.531c-2.024,0.396-4.816-2.399-3.46-4.789c1.358-2.391,3.275-0.044,3.441-1.951C7.629,16.087,3.739,13.619,3.739,13.619z");
    }});
draw2d.shape.icon.Lamp = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Lamp", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.5,2.833c-3.866,0-7,3.134-7,7c0,3.859,3.945,4.937,4.223,9.499h5.553c0.278-4.562,4.224-5.639,4.224-9.499C22.5,5.968,19.366,2.833,15.5,2.833zM15.5,28.166c1.894,0,2.483-1.027,2.667-1.666h-5.334C13.017,27.139,13.606,28.166,15.5,28.166zM12.75,25.498h5.5v-5.164h-5.5V25.498z");
    }});
draw2d.shape.icon.Lamp_alt = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Lamp_alt", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M12.75,25.498h5.5v-5.164h-5.5V25.498zM15.5,28.166c1.894,0,2.483-1.027,2.667-1.666h-5.334C13.017,27.139,13.606,28.166,15.5,28.166zM15.5,2.833c-3.866,0-7,3.134-7,7c0,3.859,3.945,4.937,4.223,9.499h1.271c-0.009-0.025-0.024-0.049-0.029-0.078L11.965,8.256c-0.043-0.245,0.099-0.485,0.335-0.563c0.237-0.078,0.494,0.026,0.605,0.25l0.553,1.106l0.553-1.106c0.084-0.17,0.257-0.277,0.446-0.277c0.189,0,0.362,0.107,0.446,0.277l0.553,1.106l0.553-1.106c0.084-0.17,0.257-0.277,0.448-0.277c0.189,0,0.36,0.107,0.446,0.277l0.554,1.106l0.553-1.106c0.111-0.224,0.368-0.329,0.604-0.25s0.377,0.318,0.333,0.563l-1.999,10.998c-0.005,0.029-0.02,0.053-0.029,0.078h1.356c0.278-4.562,4.224-5.639,4.224-9.499C22.5,5.968,19.366,2.833,15.5,2.833zM17.458,10.666c-0.191,0-0.364-0.107-0.446-0.275l-0.554-1.106l-0.553,1.106c-0.086,0.168-0.257,0.275-0.446,0.275c-0.191,0-0.364-0.107-0.449-0.275l-0.553-1.106l-0.553,1.106c-0.084,0.168-0.257,0.275-0.446,0.275c-0.012,0-0.025,0-0.037-0.001l1.454,8.001h1.167l1.454-8.001C17.482,10.666,17.47,10.666,17.458,10.666z");
    }});
draw2d.shape.icon.Video = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Video", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.188,4.875v1.094h-4.5V4.875H8.062v1.094h-4.5V4.875h-1v21.25h1v-1.094h4.5v1.094h14.625v-1.094h4.5v1.094h1.25V4.875H27.188zM8.062,23.719h-4.5v-3.125h4.5V23.719zM8.062,19.281h-4.5v-3.125h4.5V19.281zM8.062,14.844h-4.5v-3.125h4.5V14.844zM8.062,10.406h-4.5V7.281h4.5V10.406zM11.247,20.59V9.754l9.382,5.418L11.247,20.59zM27.188,23.719h-4.5v-3.125h4.5V23.719zM27.188,19.281h-4.5v-3.125h4.5V19.281zM27.188,14.844h-4.5v-3.125h4.5V14.844zM27.188,10.406h-4.5V7.281h4.5V10.406z");
    }});
draw2d.shape.icon.Palm = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Palm", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.296,27.885v-2.013c0,0-0.402-1.408-1.073-2.013c-0.671-0.604-1.274-1.274-1.409-1.61c0,0-0.268,0.135-0.737-0.335s-1.812-2.616-1.812-2.616l-0.671-0.872c0,0-0.47-0.671-1.275-1.342c-0.805-0.672-0.938-0.067-1.476-0.738s0.604-1.275,1.006-1.409c0.403-0.134,1.946,0.134,2.684,0.872c0.738,0.738,0.738,0.738,0.738,0.738l1.073,1.141l0.537,0.201l0.671-1.073l-0.269-2.281c0,0-0.604-2.55-0.737-4.764c-0.135-2.214-0.47-5.703,1.006-5.837s1.007,2.55,1.073,3.489c0.067,0.938,0.806,5.232,1.208,5.568c0.402,0.335,0.671,0.066,0.671,0.066l0.402-7.514c0,0-0.479-2.438,1.073-2.549c0.939-0.067,0.872,1.543,0.872,2.147c0,0.604,0.269,7.514,0.269,7.514l0.537,0.135c0,0,0.402-2.214,0.604-3.153s0.604-2.416,0.537-3.087c-0.067-0.671-0.135-2.348,1.006-2.348s0.872,1.812,0.939,2.415s-0.134,3.153-0.134,3.757c0,0.604-0.738,3.623-0.537,3.824s2.08-2.817,2.349-3.958c0.268-1.141,0.201-3.02,1.408-2.885c1.208,0.134,0.47,2.817,0.402,3.086c-0.066,0.269-0.671,2.349-0.872,2.952s-0.805,1.476-1.006,2.013s0.402,2.349,0,4.629c-0.402,2.281-1.61,5.166-1.61,5.166l0.604,2.08c0,0-1.744,0.671-3.824,0.805C16.443,28.221,14.296,27.885,14.296,27.885z");
    }});
draw2d.shape.icon.Fave = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Fave", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.132,7.971c-2.203-2.205-5.916-2.098-8.25,0.235L15.5,8.588l-0.382-0.382c-2.334-2.333-6.047-2.44-8.25-0.235c-2.204,2.203-2.098,5.916,0.235,8.249l8.396,8.396l8.396-8.396C26.229,13.887,26.336,10.174,24.132,7.971z");
    }});
draw2d.shape.icon.Help = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Help", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.834,4.834L4.833,4.833c-5.889,5.892-5.89,15.443,0.001,21.334s15.44,5.888,21.33-0.002c5.891-5.891,5.893-15.44,0.002-21.33C20.275-1.056,10.725-1.056,4.834,4.834zM25.459,5.542c0.833,0.836,1.523,1.757,2.104,2.726l-4.08,4.08c-0.418-1.062-1.053-2.06-1.912-2.918c-0.859-0.859-1.857-1.494-2.92-1.913l4.08-4.08C23.7,4.018,24.622,4.709,25.459,5.542zM10.139,20.862c-2.958-2.968-2.959-7.758-0.001-10.725c2.966-2.957,7.756-2.957,10.725,0c2.954,2.965,2.955,7.757-0.001,10.724C17.896,23.819,13.104,23.817,10.139,20.862zM5.542,25.459c-0.833-0.837-1.524-1.759-2.105-2.728l4.081-4.081c0.418,1.063,1.055,2.06,1.914,2.919c0.858,0.859,1.855,1.494,2.917,1.913l-4.081,4.081C7.299,26.982,6.379,26.292,5.542,25.459zM8.268,3.435l4.082,4.082C11.288,7.935,10.29,8.571,9.43,9.43c-0.858,0.859-1.494,1.855-1.912,2.918L3.436,8.267c0.58-0.969,1.271-1.89,2.105-2.727C6.377,4.707,7.299,4.016,8.268,3.435zM22.732,27.563l-4.082-4.082c1.062-0.418,2.061-1.053,2.919-1.912c0.859-0.859,1.495-1.857,1.913-2.92l4.082,4.082c-0.58,0.969-1.271,1.891-2.105,2.728C24.623,26.292,23.701,26.983,22.732,27.563z");
    }});
draw2d.shape.icon.Crop = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Crop", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.303,21.707V8.275l4.48-4.421l-2.021-2.048l-4.126,4.07H8.761V2.083H5.882v3.793H1.8v2.877h4.083v15.832h15.542v4.609h2.878v-4.609H29.2v-2.878H24.303zM19.72,8.753L8.761,19.565V8.753H19.72zM10.688,21.706l10.735-10.591l0.001,10.592L10.688,21.706z");
    }});
draw2d.shape.icon.BioHazard = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.BioHazard", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M26.154,13.988c-0.96-0.554-1.982-0.892-3.019-1.032c0.396-0.966,0.616-2.023,0.616-3.131c0-4.399-3.438-8.001-7.772-8.264c3.245,0.258,5.803,2.979,5.803,6.292c0,3.373-2.653,6.123-5.983,6.294v1.292c0.908,0.144,1.605,0.934,1.605,1.883c0,0.232-0.043,0.454-0.118,0.66l1.181,0.683c1.826-2.758,5.509-3.658,8.41-1.981c2.896,1.672,3.965,5.299,2.506,8.254C31.386,21.038,29.992,16.204,26.154,13.988zM4.122,16.587c2.92-1.686,6.628-0.764,8.442,2.034l1.141-0.657c-0.072-0.2-0.109-0.417-0.109-0.642c0-0.909,0.638-1.67,1.489-1.859v-1.319c-3.3-0.202-5.92-2.94-5.92-6.292c0-3.297,2.532-6.007,5.757-6.286c-4.312,0.285-7.729,3.875-7.729,8.258c0,1.078,0.206,2.106,0.581,3.05c-1.004,0.147-1.999,0.481-2.931,1.02c-3.812,2.201-5.209,6.985-3.264,10.87C0.174,21.823,1.251,18.244,4.122,16.587zM11.15,11.452c0.114,0.139,0.235,0.271,0.362,0.398c0.126,0.126,0.259,0.247,0.397,0.361c0.102,0.084,0.211,0.16,0.318,0.236c0.93-0.611,2.045-0.969,3.244-0.969c1.201,0,2.312,0.357,3.242,0.969c0.107-0.077,0.217-0.152,0.318-0.236c0.139-0.114,0.271-0.235,0.397-0.361c0.127-0.127,0.248-0.259,0.362-0.398c0.113-0.138,0.222-0.283,0.323-0.431c-1.307-0.956-2.908-1.528-4.643-1.528c-0.042,0-0.083-0.001-0.124,0c-0.019,0-0.04-0.001-0.06,0c-1.666,0.038-3.201,0.605-4.462,1.528C10.929,11.17,11.037,11.314,11.15,11.452zM9.269,16.787c-0.168-0.062-0.338-0.117-0.512-0.164c-0.173-0.047-0.348-0.083-0.525-0.113c-0.177-0.03-0.355-0.053-0.535-0.065c-0.175,1.609,0.13,3.282,0.998,4.786c0.868,1.503,2.164,2.606,3.645,3.259c0.079-0.162,0.15-0.328,0.212-0.496c0.063-0.169,0.118-0.338,0.164-0.512c0.047-0.173,0.087-0.349,0.115-0.525c0.022-0.13,0.034-0.262,0.046-0.394c-0.993-0.5-1.86-1.286-2.461-2.325c-0.6-1.04-0.847-2.182-0.783-3.294C9.512,16.889,9.392,16.833,9.269,16.787zM18.122,22.657c0.014,0.132,0.024,0.263,0.046,0.394c0.03,0.177,0.067,0.352,0.113,0.524c0.047,0.174,0.102,0.346,0.165,0.514c0.062,0.169,0.132,0.333,0.212,0.495c1.48-0.653,2.777-1.755,3.644-3.257c0.868-1.504,1.176-3.179,1.001-4.788c-0.18,0.013-0.358,0.035-0.535,0.065c-0.177,0.029-0.353,0.067-0.525,0.113s-0.345,0.101-0.513,0.163c-0.124,0.047-0.241,0.105-0.362,0.16c0.063,1.11-0.183,2.253-0.784,3.292C19.984,21.373,19.116,22.157,18.122,22.657zM20.569,27.611c-2.92-1.687-3.977-5.358-2.46-8.329l-1.192-0.689c-0.349,0.389-0.854,0.634-1.417,0.634c-0.571,0-1.086-0.254-1.436-0.653l-1.146,0.666c1.475,2.96,0.414,6.598-2.488,8.272c-2.888,1.668-6.552,0.791-8.386-1.935c2.38,3.667,7.249,4.87,11.079,2.658c0.929-0.535,1.711-1.227,2.339-2.018c0.64,0.832,1.45,1.554,2.416,2.112c3.835,2.213,8.709,1.006,11.086-2.671C27.132,28.396,23.463,29.282,20.569,27.611z");
    }});
draw2d.shape.icon.WheelChair = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.WheelChair", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.373,19.85c0,4.079-3.318,7.397-7.398,7.397c-4.079,0-7.398-3.318-7.398-7.397c0-2.466,1.213-4.652,3.073-5.997l-0.251-2.21c-2.875,1.609-4.825,4.684-4.825,8.207c0,5.184,4.217,9.4,9.401,9.4c4.395,0,8.093-3.031,9.117-7.111L20.37,19.73C20.37,19.771,20.373,19.81,20.373,19.85zM11.768,6.534c1.321,0,2.392-1.071,2.392-2.392c0-1.321-1.071-2.392-2.392-2.392c-1.321,0-2.392,1.071-2.392,2.392C9.375,5.463,10.446,6.534,11.768,6.534zM27.188,22.677l-5.367-7.505c-0.28-0.393-0.749-0.579-1.226-0.538c-0.035-0.003-0.071-0.006-0.106-0.006h-6.132l-0.152-1.335h4.557c0.53,0,0.96-0.429,0.96-0.959c0-0.53-0.43-0.959-0.96-0.959h-4.776l-0.25-2.192c-0.146-1.282-1.303-2.203-2.585-2.057C9.869,7.271,8.948,8.428,9.094,9.71l0.705,6.19c0.136,1.197,1.154,2.078,2.332,2.071c0.004,0,0.007,0.001,0.012,0.001h8.023l4.603,6.436c0.439,0.615,1.338,0.727,2.007,0.248C27.442,24.178,27.628,23.292,27.188,22.677z");
    }});
draw2d.shape.icon.Mic = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Mic", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.5,21.125c2.682,0,4.875-2.25,4.875-5V5.875c0-2.75-2.193-5-4.875-5s-4.875,2.25-4.875,5v10.25C10.625,18.875,12.818,21.125,15.5,21.125zM21.376,11v5.125c0,3.308-2.636,6-5.876,6s-5.875-2.691-5.875-6V11H6.626v5.125c0,4.443,3.194,8.132,7.372,8.861v2.139h-3.372v3h9.749v-3h-3.376v-2.139c4.181-0.727,7.375-4.418,7.375-8.861V11H21.376z");
    }});
draw2d.shape.icon.MicMute = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.MicMute", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M10.121,18.529c-0.317-0.736-0.496-1.549-0.496-2.404V11H6.626v5.125c0,1.693,0.466,3.275,1.272,4.627L10.121,18.529zM20.375,8.276V5.875c0-2.75-2.193-5-4.875-5s-4.875,2.25-4.875,5v10.25c0,0.568,0.113,1.105,0.285,1.615L20.375,8.276zM21.376,12.931v3.195c0,3.308-2.636,6-5.876,6c-0.958,0-1.861-0.24-2.661-0.657l-2.179,2.179c0.995,0.659,2.123,1.128,3.338,1.34v2.139h-3.372v3h9.749v-3h-3.376v-2.139c4.181-0.727,7.375-4.418,7.375-8.861V11h-1.068L21.376,12.931zM20.375,16.125v-2.194l-6.788,6.788c0.588,0.26,1.234,0.405,1.913,0.405C18.182,21.125,20.375,18.875,20.375,16.125zM25.542,4.522L4.855,25.209l1.415,1.416L26.956,5.937L25.542,4.522z");
    }});
draw2d.shape.icon.IMac = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.IMac", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.936,2.099H2.046c-0.506,0-0.919,0.414-0.919,0.92v21.097c0,0.506,0.413,0.919,0.919,0.919h17.062v-0.003h9.828c0.506,0,0.92-0.413,0.92-0.921V3.019C29.854,2.513,29.439,2.099,28.936,2.099zM28.562,20.062c0,0.412-0.338,0.75-0.75,0.75H3.062c-0.413,0-0.75-0.338-0.75-0.75v-16c0-0.413,0.337-0.75,0.75-0.75h24.75c0.412,0,0.75,0.337,0.75,0.75V20.062zM20.518,28.4c-0.033-0.035-0.062-0.055-0.068-0.062l-0.01-0.004l-0.008-0.004c0,0-0.046-0.021-0.119-0.062c-0.108-0.056-0.283-0.144-0.445-0.237c-0.162-0.097-0.32-0.199-0.393-0.271c-0.008-0.014-0.035-0.079-0.058-0.17c-0.083-0.32-0.161-0.95-0.22-1.539h-7.5c-0.023,0.23-0.048,0.467-0.076,0.691c-0.035,0.272-0.073,0.524-0.113,0.716c-0.02,0.096-0.039,0.175-0.059,0.23c-0.009,0.025-0.018,0.05-0.024,0.062c-0.003,0.006-0.005,0.01-0.007,0.013c-0.094,0.096-0.34,0.246-0.553,0.36c-0.107,0.062-0.209,0.11-0.283,0.146c-0.074,0.037-0.119,0.062-0.119,0.062l-0.007,0.004l-0.008,0.004c-0.01,0.009-0.038,0.022-0.07,0.062c-0.031,0.037-0.067,0.103-0.067,0.185c0.002,0.002-0.004,0.037-0.006,0.088c0,0.043,0.007,0.118,0.068,0.185c0.061,0.062,0.143,0.08,0.217,0.08h9.716c0.073,0,0.153-0.021,0.215-0.08c0.062-0.063,0.068-0.142,0.068-0.185c-0.001-0.051-0.008-0.086-0.007-0.088C20.583,28.503,20.548,28.439,20.518,28.4z");
    }});
draw2d.shape.icon.Pc = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Pc", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M29.249,3.14h-9.188l-0.459,0.459v18.225l0.33,2.389H19.57v0.245h-0.307v-0.306h-0.611v0.244h-0.311v-0.367h-0.486v0.307h-1.104l-2.022-0.367v-0.92h0.858l0.302-1.47h2.728c0.188,0,0.339-0.152,0.339-0.339V7.828c0-0.187-0.149-0.338-0.339-0.338H1.591c-0.187,0-0.339,0.152-0.339,0.338V21.24c0,0.187,0.152,0.339,0.339,0.339h3.016l0.199,1.47h1.409l-3.4,3.4L2.11,27.951c0,0,2.941,1.102,6.678,1.102c3.737,0,9.679-0.857,10.476-0.857s4.84,0,4.84,0v-1.225l-0.137-1.068h1.744c-0.2,0.106-0.322,0.244-0.322,0.396v0.979c0,0.341,0.604,0.613,1.352,0.613c0.742,0,1.348-0.272,1.348-0.613v-0.979c0-0.339-0.604-0.611-1.348-0.611c-0.188,0-0.364,0.019-0.525,0.049v-0.17h-2.29l-0.055-0.432h5.382L29.249,3.14L29.249,3.14zM2.478,20.17V8.714h15.07V20.17H2.478z");
    }});
draw2d.shape.icon.Cube = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Cube", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.5,3.029l-10.8,6.235L4.7,21.735L15.5,27.971l10.8-6.235V9.265L15.5,3.029zM24.988,10.599L16,15.789v10.378c0,0.275-0.225,0.5-0.5,0.5s-0.5-0.225-0.5-0.5V15.786l-8.987-5.188c-0.239-0.138-0.321-0.444-0.183-0.683c0.138-0.238,0.444-0.321,0.683-0.183l8.988,5.189l8.988-5.189c0.238-0.138,0.545-0.055,0.684,0.184C25.309,10.155,25.227,10.461,24.988,10.599z");
    }});
draw2d.shape.icon.FullCube = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.FullCube", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.5,3.029l-10.8,6.235L4.7,21.735L15.5,27.971l10.8-6.235V9.265L15.5,3.029zM15.5,7.029l6.327,3.652L15.5,14.334l-6.326-3.652L15.5,7.029zM24.988,10.599L16,15.789v10.378c0,0.275-0.225,0.5-0.5,0.5s-0.5-0.225-0.5-0.5V15.786l-8.987-5.188c-0.239-0.138-0.321-0.444-0.183-0.683c0.138-0.238,0.444-0.321,0.683-0.183l8.988,5.189l8.988-5.189c0.238-0.138,0.545-0.055,0.684,0.184C25.309,10.155,25.227,10.461,24.988,10.599z");
    }});
draw2d.shape.icon.Font = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Font", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.255,19.327l-1.017,0.131c-0.609,0.081-1.067,0.208-1.375,0.382c-0.521,0.293-0.779,0.76-0.779,1.398c0,0.484,0.178,0.867,0.532,1.146c0.354,0.28,0.774,0.421,1.262,0.421c0.593,0,1.164-0.138,1.72-0.412c0.938-0.453,1.4-1.188,1.4-2.229v-1.354c-0.205,0.131-0.469,0.229-0.792,0.328C22.883,19.229,22.564,19.29,22.255,19.327zM8.036,18.273h4.309l-2.113-6.063L8.036,18.273zM28.167,7.75H3.168c-0.552,0-1,0.448-1,1v16.583c0,0.553,0.448,1,1,1h24.999c0.554,0,1-0.447,1-1V8.75C29.167,8.198,28.721,7.75,28.167,7.75zM14.305,23.896l-1.433-4.109H7.488L6,23.896H4.094L9.262,10.17h2.099l4.981,13.727H14.305L14.305,23.896zM26.792,23.943c-0.263,0.074-0.461,0.121-0.599,0.141c-0.137,0.02-0.323,0.027-0.562,0.027c-0.579,0-0.999-0.204-1.261-0.615c-0.138-0.219-0.231-0.525-0.29-0.926c-0.344,0.449-0.834,0.839-1.477,1.169c-0.646,0.329-1.354,0.493-2.121,0.493c-0.928,0-1.688-0.28-2.273-0.844c-0.589-0.562-0.884-1.271-0.884-2.113c0-0.928,0.29-1.646,0.868-2.155c0.578-0.511,1.34-0.824,2.279-0.942l2.682-0.336c0.388-0.05,0.646-0.211,0.775-0.484c0.063-0.146,0.104-0.354,0.104-0.646c0-0.575-0.203-0.993-0.604-1.252c-0.408-0.26-0.99-0.389-1.748-0.389c-0.877,0-1.5,0.238-1.865,0.713c-0.205,0.263-0.34,0.654-0.399,1.174H17.85c0.031-1.237,0.438-2.097,1.199-2.582c0.77-0.484,1.659-0.726,2.674-0.726c1.176,0,2.131,0.225,2.864,0.673c0.729,0.448,1.093,1.146,1.093,2.093v5.766c0,0.176,0.035,0.313,0.106,0.422c0.071,0.104,0.223,0.156,0.452,0.156c0.076,0,0.16-0.005,0.254-0.015c0.093-0.011,0.191-0.021,0.299-0.041L26.792,23.943L26.792,23.943z");
    }});
draw2d.shape.icon.Trash = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Trash", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.826,5.75l0.396,1.188c1.54,0.575,2.589,1.44,2.589,2.626c0,2.405-4.308,3.498-8.312,3.498c-4.003,0-8.311-1.093-8.311-3.498c0-1.272,1.21-2.174,2.938-2.746l0.388-1.165c-2.443,0.648-4.327,1.876-4.327,3.91v2.264c0,1.224,0.685,2.155,1.759,2.845l0.396,9.265c0,1.381,3.274,2.5,7.312,2.5c4.038,0,7.313-1.119,7.313-2.5l0.405-9.493c0.885-0.664,1.438-1.521,1.438-2.617V9.562C24.812,7.625,23.101,6.42,20.826,5.75zM11.093,24.127c-0.476-0.286-1.022-0.846-1.166-1.237c-1.007-2.76-0.73-4.921-0.529-7.509c0.747,0.28,1.58,0.491,2.45,0.642c-0.216,2.658-0.43,4.923,0.003,7.828C11.916,24.278,11.567,24.411,11.093,24.127zM17.219,24.329c-0.019,0.445-0.691,0.856-1.517,0.856c-0.828,0-1.498-0.413-1.517-0.858c-0.126-2.996-0.032-5.322,0.068-8.039c0.418,0.022,0.835,0.037,1.246,0.037c0.543,0,1.097-0.02,1.651-0.059C17.251,18.994,17.346,21.325,17.219,24.329zM21.476,22.892c-0.143,0.392-0.69,0.95-1.165,1.235c-0.474,0.284-0.817,0.151-0.754-0.276c0.437-2.93,0.214-5.209-0.005-7.897c0.881-0.174,1.708-0.417,2.44-0.731C22.194,17.883,22.503,20.076,21.476,22.892zM11.338,9.512c0.525,0.173,1.092-0.109,1.268-0.633h-0.002l0.771-2.316h4.56l0.771,2.316c0.14,0.419,0.53,0.685,0.949,0.685c0.104,0,0.211-0.017,0.316-0.052c0.524-0.175,0.808-0.742,0.633-1.265l-1.002-3.001c-0.136-0.407-0.518-0.683-0.945-0.683h-6.002c-0.428,0-0.812,0.275-0.948,0.683l-1,2.999C10.532,8.77,10.815,9.337,11.338,9.512z");
    }});
draw2d.shape.icon.NewWindow = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.NewWindow", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M5.896,5.333V21.25h23.417V5.333H5.896zM26.312,18.25H8.896V8.334h17.417V18.25L26.312,18.25zM4.896,9.542H1.687v15.917h23.417V22.25H4.896V9.542z");
    }});
draw2d.shape.icon.DockRight = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.DockRight", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M3.083,7.333v16.334h24.833V7.333H3.083z M19.333,20.668H6.083V10.332h13.25V20.668z");
    }});
draw2d.shape.icon.DockLeft = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.DockLeft", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M3.084,7.333v16.334h24.832V7.333H3.084z M11.667,10.332h13.251v10.336H11.667V10.332z");
    }});
draw2d.shape.icon.DockBottom = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.DockBottom", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M3.083,7.333v16.334h24.833V7.333H3.083zM24.915,16.833H6.083v-6.501h18.833L24.915,16.833L24.915,16.833z");
    }});
draw2d.shape.icon.DockTop = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.DockTop", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.916,23.667V7.333H3.083v16.334H27.916zM24.915,20.668H6.083v-6.501h18.833L24.915,20.668L24.915,20.668z");
    }});
draw2d.shape.icon.Pallete = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Pallete", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.653,7.25c-3.417,0-8.577,0.983-8.577,3.282c0,1.91,2.704,3.229,1.691,3.889c-1.02,0.666-2.684-1.848-4.048-1.848c-1.653,0-2.815,1.434-2.815,2.926c0,4.558,6.326,8.25,13.749,8.25c7.424,0,13.443-3.692,13.443-8.25C29.096,10.944,23.077,7.25,15.653,7.25zM10.308,13.521c0-0.645,0.887-1.166,1.98-1.166c1.093,0,1.979,0.521,1.979,1.166c0,0.644-0.886,1.166-1.979,1.166C11.195,14.687,10.308,14.164,10.308,13.521zM14.289,22.299c-1.058,0-1.914-0.68-1.914-1.518s0.856-1.518,1.914-1.518c1.057,0,1.914,0.68,1.914,1.518S15.346,22.299,14.289,22.299zM19.611,21.771c-1.057,0-1.913-0.681-1.913-1.519c0-0.84,0.856-1.521,1.913-1.521c1.059,0,1.914,0.681,1.914,1.521C21.525,21.092,20.67,21.771,19.611,21.771zM20.075,10.66c0-0.838,0.856-1.518,1.914-1.518s1.913,0.68,1.913,1.518c0,0.839-0.855,1.518-1.913,1.518C20.934,12.178,20.075,11.499,20.075,10.66zM24.275,19.482c-1.057,0-1.914-0.681-1.914-1.519s0.857-1.518,1.914-1.518c1.059,0,1.914,0.68,1.914,1.518S25.334,19.482,24.275,19.482zM25.286,15.475c-1.058,0-1.914-0.68-1.914-1.519c0-0.838,0.856-1.518,1.914-1.518c1.057,0,1.913,0.68,1.913,1.518C27.199,14.795,26.343,15.475,25.286,15.475z");
    }});
draw2d.shape.icon.Cart = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Cart", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M29.02,11.754L8.416,9.473L7.16,4.716C7.071,4.389,6.772,4.158,6.433,4.158H3.341C3.114,3.866,2.775,3.667,2.377,3.667c-0.686,0-1.242,0.556-1.242,1.242c0,0.686,0.556,1.242,1.242,1.242c0.399,0,0.738-0.201,0.965-0.493h2.512l5.23,19.8c-0.548,0.589-0.891,1.373-0.891,2.242c0,1.821,1.473,3.293,3.293,3.293c1.82,0,3.294-1.472,3.297-3.293c0-0.257-0.036-0.504-0.093-0.743h5.533c-0.056,0.239-0.092,0.486-0.092,0.743c0,1.821,1.475,3.293,3.295,3.293s3.295-1.472,3.295-3.293c0-1.82-1.473-3.295-3.295-3.297c-0.951,0.001-1.801,0.409-2.402,1.053h-7.136c-0.601-0.644-1.451-1.052-2.402-1.053c-0.379,0-0.738,0.078-1.077,0.196l-0.181-0.685H26.81c1.157-0.027,2.138-0.83,2.391-1.959l1.574-7.799c0.028-0.145,0.041-0.282,0.039-0.414C30.823,12.733,30.051,11.86,29.02,11.754zM25.428,27.994c-0.163,0-0.295-0.132-0.297-0.295c0.002-0.165,0.134-0.297,0.297-0.297s0.295,0.132,0.297,0.297C25.723,27.862,25.591,27.994,25.428,27.994zM27.208,20.499l0.948-0.948l-0.318,1.578L27.208,20.499zM12.755,11.463l1.036,1.036l-1.292,1.292l-1.292-1.292l1.087-1.087L12.755,11.463zM17.253,11.961l0.538,0.538l-1.292,1.292l-1.292-1.292l0.688-0.688L17.253,11.961zM9.631,14.075l0.868-0.868l1.292,1.292l-1.292,1.292l-0.564-0.564L9.631,14.075zM9.335,12.956l-0.328-1.24L9.792,12.5L9.335,12.956zM21.791,16.499l-1.292,1.292l-1.292-1.292l1.292-1.292L21.791,16.499zM21.207,14.5l1.292-1.292l1.292,1.292l-1.292,1.292L21.207,14.5zM18.5,15.791l-1.293-1.292l1.292-1.292l1.292,1.292L18.5,15.791zM17.791,16.499L16.5,17.791l-1.292-1.292l1.292-1.292L17.791,16.499zM14.499,15.791l-1.292-1.292l1.292-1.292l1.292,1.292L14.499,15.791zM13.791,16.499l-1.292,1.291l-1.292-1.291l1.292-1.292L13.791,16.499zM10.499,17.207l1.292,1.292l-0.785,0.784l-0.54-2.044L10.499,17.207zM11.302,20.404l1.197-1.197l1.292,1.292L12.5,21.791l-1.131-1.13L11.302,20.404zM13.208,18.499l1.291-1.292l1.292,1.292L14.5,19.791L13.208,18.499zM16.5,19.207l1.292,1.292L16.5,21.79l-1.292-1.291L16.5,19.207zM17.208,18.499l1.292-1.292l1.291,1.292L18.5,19.79L17.208,18.499zM20.499,19.207l1.292,1.292L20.5,21.79l-1.292-1.292L20.499,19.207zM21.207,18.499l1.292-1.292l1.292,1.292l-1.292,1.292L21.207,18.499zM23.207,16.499l1.292-1.292l1.292,1.292l-1.292,1.292L23.207,16.499zM25.207,14.499l1.292-1.292L27.79,14.5l-1.291,1.292L25.207,14.499zM24.499,13.792l-1.156-1.156l2.082,0.23L24.499,13.792zM21.791,12.5l-1.292,1.292L19.207,12.5l0.29-0.29l2.253,0.25L21.791,12.5zM14.5,11.791l-0.152-0.152l0.273,0.03L14.5,11.791zM10.5,11.792l-0.65-0.65l1.171,0.129L10.5,11.792zM14.5,21.207l1.205,1.205h-2.409L14.5,21.207zM18.499,21.207l1.206,1.206h-2.412L18.499,21.207zM22.499,21.207l1.208,1.207l-2.414-0.001L22.499,21.207zM23.207,20.499l1.292-1.292l1.292,1.292l-1.292,1.292L23.207,20.499zM25.207,18.499l1.292-1.291l1.291,1.291l-1.291,1.292L25.207,18.499zM28.499,17.791l-1.291-1.292l1.291-1.291l0.444,0.444l-0.429,2.124L28.499,17.791zM29.001,13.289l-0.502,0.502l-0.658-0.658l1.016,0.112C28.911,13.253,28.956,13.271,29.001,13.289zM13.487,27.994c-0.161,0-0.295-0.132-0.295-0.295c0-0.165,0.134-0.297,0.295-0.297c0.163,0,0.296,0.132,0.296,0.297C13.783,27.862,13.651,27.994,13.487,27.994zM26.81,22.414h-1.517l1.207-1.207l0.93,0.93C27.243,22.306,27.007,22.428,26.81,22.414z");
    }});
draw2d.shape.icon.Glasses = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Glasses", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.075,9.531c0,0-2.705-1.438-5.158-1.438c-2.453,0-4.862,0.593-4.862,0.593L3.971,9.869c0,0,0.19,0.19,0.528,0.53c0.338,0.336,0.486,3.741,1.838,5.094c1.353,1.354,4.82,1.396,5.963,0.676c1.14-0.718,2.241-3.466,2.241-4.693c0-0.38,0-0.676,0-0.676c0.274-0.275,1.615-0.303,1.917,0c0,0,0,0.296,0,0.676c0,1.227,1.101,3.975,2.241,4.693c1.144,0.72,4.611,0.678,5.963-0.676c1.355-1.353,1.501-4.757,1.839-5.094c0.338-0.34,0.528-0.53,0.528-0.53l-0.084-1.183c0,0-2.408-0.593-4.862-0.593c-2.453,0-5.158,1.438-5.158,1.438C16.319,9.292,14.737,9.32,14.075,9.531z");
    }});
draw2d.shape.icon.Package = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Package", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M17.078,22.004l-1.758-4.129l-2.007,4.752l-7.519-3.289l0.174,3.905l9.437,4.374l10.909-5.365l-0.149-4.989L17.078,22.004zM29.454,6.619L18.521,3.383l-3.006,2.671l-3.091-2.359L1.546,8.199l3.795,3.048l-3.433,5.302l10.879,4.757l2.53-5.998l2.257,5.308l11.393-5.942l-3.105-4.709L29.454,6.619zM15.277,14.579l-9.059-3.83l9.275-4.101l9.608,3.255L15.277,14.579z");
    }});
draw2d.shape.icon.Book = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Book", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.754,4.626c-0.233-0.161-0.536-0.198-0.802-0.097L12.16,9.409c-0.557,0.213-1.253,0.316-1.968,0.316c-0.997,0.002-2.029-0.202-2.747-0.48C7.188,9.148,6.972,9.04,6.821,8.943c0.056-0.024,0.12-0.05,0.193-0.075L18.648,4.43l1.733,0.654V3.172c0-0.284-0.14-0.554-0.374-0.714c-0.233-0.161-0.538-0.198-0.802-0.097L6.414,7.241c-0.395,0.142-0.732,0.312-1.02,0.564C5.111,8.049,4.868,8.45,4.872,8.896c0,0.012,0.004,0.031,0.004,0.031v17.186c0,0.008-0.003,0.015-0.003,0.021c0,0.006,0.003,0.01,0.003,0.016v0.017h0.002c0.028,0.601,0.371,0.983,0.699,1.255c1.034,0.803,2.769,1.252,4.614,1.274c0.874,0,1.761-0.116,2.583-0.427l12.796-4.881c0.337-0.128,0.558-0.448,0.558-0.809V5.341C26.128,5.057,25.988,4.787,25.754,4.626zM5.672,11.736c0.035,0.086,0.064,0.176,0.069,0.273l0.004,0.054c0.016,0.264,0.13,0.406,0.363,0.611c0.783,0.626,2.382,1.08,4.083,1.093c0.669,0,1.326-0.083,1.931-0.264v1.791c-0.647,0.143-1.301,0.206-1.942,0.206c-1.674-0.026-3.266-0.353-4.509-1.053V11.736zM10.181,24.588c-1.674-0.028-3.266-0.354-4.508-1.055v-2.712c0.035,0.086,0.065,0.176,0.07,0.275l0.002,0.053c0.018,0.267,0.13,0.408,0.364,0.613c0.783,0.625,2.381,1.079,4.083,1.091c0.67,0,1.327-0.082,1.932-0.262v1.789C11.476,24.525,10.821,24.588,10.181,24.588z");
    }});
draw2d.shape.icon.Books = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Books", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M26.679,7.858c-0.176-0.138-0.404-0.17-0.606-0.083l-9.66,4.183c-0.42,0.183-0.946,0.271-1.486,0.271c-0.753,0.002-1.532-0.173-2.075-0.412c-0.194-0.083-0.356-0.176-0.471-0.259c0.042-0.021,0.09-0.042,0.146-0.064l8.786-3.804l1.31,0.561V6.612c0-0.244-0.106-0.475-0.283-0.612c-0.176-0.138-0.406-0.17-0.605-0.083l-9.66,4.183c-0.298,0.121-0.554,0.268-0.771,0.483c-0.213,0.208-0.397,0.552-0.394,0.934c0,0.01,0.003,0.027,0.003,0.027v14.73c0,0.006-0.002,0.012-0.002,0.019c0,0.005,0.002,0.007,0.002,0.012v0.015h0.002c0.021,0.515,0.28,0.843,0.528,1.075c0.781,0.688,2.091,1.073,3.484,1.093c0.66,0,1.33-0.1,1.951-0.366l9.662-4.184c0.255-0.109,0.422-0.383,0.422-0.692V8.471C26.961,8.227,26.855,7.996,26.679,7.858zM20.553,5.058c-0.017-0.221-0.108-0.429-0.271-0.556c-0.176-0.138-0.404-0.17-0.606-0.083l-9.66,4.183C9.596,8.784,9.069,8.873,8.53,8.873C7.777,8.874,6.998,8.699,6.455,8.46C6.262,8.378,6.099,8.285,5.984,8.202C6.026,8.181,6.075,8.16,6.13,8.138l8.787-3.804l1.309,0.561V3.256c0-0.244-0.106-0.475-0.283-0.612c-0.176-0.138-0.407-0.17-0.606-0.083l-9.66,4.183C5.379,6.864,5.124,7.011,4.907,7.227C4.693,7.435,4.51,7.779,4.513,8.161c0,0.011,0.003,0.027,0.003,0.027v14.73c0,0.006-0.001,0.013-0.001,0.019c0,0.005,0.001,0.007,0.001,0.012v0.016h0.002c0.021,0.515,0.28,0.843,0.528,1.075c0.781,0.688,2.091,1.072,3.485,1.092c0.376,0,0.754-0.045,1.126-0.122V11.544c-0.01-0.7,0.27-1.372,0.762-1.856c0.319-0.315,0.708-0.564,1.19-0.756L20.553,5.058z");
    }});
draw2d.shape.icon.Icons = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Icons", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.083,14H14V4.083H4.083V14zM17,4.083V14h9.917V4.083H17zM17,26.917h9.917v-9.918H17V26.917zM4.083,26.917H14v-9.918H4.083V26.917z");
    }});
draw2d.shape.icon.List = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.List", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.082,4.083v2.999h22.835V4.083H4.082zM4.082,20.306h22.835v-2.999H4.082V20.306zM4.082,13.694h22.835v-2.999H4.082V13.694zM4.082,26.917h22.835v-2.999H4.082V26.917z");
    }});
draw2d.shape.icon.Db = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Db", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.499,23.438c-3.846,0-7.708-0.987-9.534-3.117c-0.054,0.236-0.09,0.48-0.09,0.737v3.877c0,3.435,4.988,4.998,9.625,4.998s9.625-1.563,9.625-4.998v-3.877c0-0.258-0.036-0.501-0.09-0.737C23.209,22.451,19.347,23.438,15.499,23.438zM15.499,15.943c-3.846,0-7.708-0.987-9.533-3.117c-0.054,0.236-0.091,0.479-0.091,0.736v3.877c0,3.435,4.988,4.998,9.625,4.998s9.625-1.563,9.625-4.998v-3.877c0-0.257-0.036-0.501-0.09-0.737C23.209,14.956,19.347,15.943,15.499,15.943zM15.5,1.066c-4.637,0-9.625,1.565-9.625,5.001v3.876c0,3.435,4.988,4.998,9.625,4.998s9.625-1.563,9.625-4.998V6.067C25.125,2.632,20.137,1.066,15.5,1.066zM15.5,9.066c-4.211,0-7.625-1.343-7.625-3c0-1.656,3.414-3,7.625-3s7.625,1.344,7.625,3C23.125,7.724,19.711,9.066,15.5,9.066z");
    }});
draw2d.shape.icon.Paper = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Paper", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.916,8.009L15.953,1.888c-0.251-0.119-0.548-0.115-0.798,0.008c-0.25,0.125-0.433,0.357-0.491,0.629c-0.002,0.01-1.04,4.83-2.578,9.636c-0.526,1.646-1.114,3.274-1.728,4.704l1.665,0.786c2-4.643,3.584-11.052,4.181-13.614l11.264,5.316c-0.346,1.513-1.233,5.223-2.42,8.927c-0.767,2.399-1.665,4.797-2.585,6.532c-0.889,1.79-1.958,2.669-2.197,2.552c-1.419,0.03-2.418-1.262-3.09-2.918c-0.32-0.803-0.53-1.63-0.657-2.246c-0.127-0.618-0.166-1.006-0.168-1.006c-0.034-0.317-0.232-0.597-0.52-0.731l-12.962-6.12c-0.301-0.142-0.654-0.11-0.925,0.081c-0.27,0.193-0.416,0.518-0.38,0.847c0.008,0.045,0.195,1.848,0.947,3.736c0.521,1.321,1.406,2.818,2.845,3.575l12.956,6.131l0.006-0.013c0.562,0.295,1.201,0.487,1.947,0.496c1.797-0.117,2.777-1.668,3.818-3.525c3-5.69,5.32-16.602,5.338-16.642C29.512,8.615,29.302,8.19,28.916,8.009z");
    }});
draw2d.shape.icon.TakeOff = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.TakeOff", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M10.27,19.267c0,0,9.375-1.981,16.074-8.681c0,0,1.395-1.339-1.338-1.339c-2.305,0-5.6,2.438-5.6,2.438l-9.137-1.42l-1.769,1.769l4.983,2.411l-3.001,2.035l-2.571-1.285L6.09,16.052C6.09,16.052,8.02,18.062,10.27,19.267zM3.251,23.106v1.998h24.498v-1.998H3.251z");
    }});
draw2d.shape.icon.Landing = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Landing", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M23.322,19.491c0,0,1.903,0.342,0.299-1.869c-1.353-1.866-5.261-3.104-5.261-3.104l-4.213-8.229l-2.47-0.394l0.973,5.449L9.241,10.11L8.772,7.273L7.008,6.302c0,0-0.496,2.742-0.149,5.271C6.859,11.573,13.965,17.999,23.322,19.491zM3.251,23.106v1.998h24.498v-1.998H3.251zM14,17.94c0,0.414,0.336,0.75,0.75,0.75s0.75-0.336,0.75-0.75s-0.336-0.75-0.75-0.75S14,17.526,14,17.94z");
    }});
draw2d.shape.icon.Plane = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Plane", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M19.671,8.11l-2.777,2.777l-3.837-0.861c0.362-0.505,0.916-1.683,0.464-2.135c-0.518-0.517-1.979,0.278-2.305,0.604l-0.913,0.913L7.614,8.804l-2.021,2.021l2.232,1.061l-0.082,0.082l1.701,1.701l0.688-0.687l3.164,1.504L9.571,18.21H6.413l-1.137,1.138l3.6,0.948l1.83,1.83l0.947,3.598l1.137-1.137V21.43l3.725-3.725l1.504,3.164l-0.687,0.687l1.702,1.701l0.081-0.081l1.062,2.231l2.02-2.02l-0.604-2.689l0.912-0.912c0.326-0.326,1.121-1.789,0.604-2.306c-0.452-0.452-1.63,0.101-2.135,0.464l-0.861-3.838l2.777-2.777c0.947-0.947,3.599-4.862,2.62-5.839C24.533,4.512,20.618,7.163,19.671,8.11z");
    }});
draw2d.shape.icon.Phone = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Phone", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.065,18.53c-0.467-0.29-1.167-0.21-1.556,0.179l-3.093,3.092c-0.389,0.389-1.025,0.389-1.414,0L9.05,14.848c-0.389-0.389-0.389-1.025,0-1.414l2.913-2.912c0.389-0.389,0.447-1.075,0.131-1.524L6.792,1.485C6.476,1.036,5.863,0.948,5.433,1.29c0,0-4.134,3.281-4.134,6.295c0,12.335,10,22.334,22.334,22.334c3.015,0,5.948-5.533,5.948-5.533c0.258-0.486,0.087-1.122-0.38-1.412L22.065,18.53z");
    }});
draw2d.shape.icon.HangUp = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.HangUp", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.563,10.494c-7.35-7.349-19.265-7.348-26.612,0.001c-1.796,1.796-0.247,6.84-0.247,6.84c0.135,0.443,0.616,0.72,1.067,0.614l6.898-1.604c0.451-0.105,0.82-0.57,0.82-1.033l0.001-3.685c0-0.463,0.379-0.842,0.842-0.842h8.285c0.464,0,0.843,0.379,0.843,0.842l-0.001,3.471c0.001,0.462,0.375,0.907,0.83,0.986l7.635,1.316c0.456,0.08,0.873-0.232,0.926-0.692C29.851,16.708,30.359,12.29,28.563,10.494zM17.264,14.072h-3.501v4.39h-2.625l4.363,7.556l4.363-7.556h-2.6V14.072z");
    }});
draw2d.shape.icon.SlideShare = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.SlideShare", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.952,12.795c-0.956,1.062-5.073,2.409-5.604,2.409h-4.513c-0.749,0-1.877,0.147-2.408,0.484c0.061,0.054,0.122,0.108,0.181,0.163c0.408,0.379,1.362,0.913,2.206,0.913c0.397,0,0.723-0.115,1-0.354c1.178-1.007,1.79-1.125,2.145-1.125c0.421,0,0.783,0.193,0.996,0.531c0.4,0.626,0.106,1.445-0.194,2.087c-0.718,1.524-3.058,3.171-5.595,3.171c-0.002,0-0.002,0-0.004,0c-0.354,0-0.701-0.033-1.033-0.099v3.251c0,0.742,1.033,2.533,4.167,2.533s3.955-3.701,3.955-4.338v-4.512c2.23-1.169,4.512-1.805,5.604-3.895C30.882,12.05,29.907,11.733,28.952,12.795zM21.942,17.521c0.796-1.699-0.053-1.699-1.54-0.425s-3.665,0.105-4.408-0.585c-0.743-0.689-1.486-1.22-2.814-1.167c-1.328,0.053-4.46-0.161-6.267-0.585c-1.805-0.425-4.895-3-5.15-2.335c-0.266,0.69,0.211,1.168,1.168,2.335c0.955,1.169,5.075,2.778,5.075,2.778s0,3.453,0,4.886c0,1.435,2.973,3.61,4.512,3.61s2.708-1.062,2.708-1.806v-4.512C17.775,21.045,21.146,19.221,21.942,17.521zM20.342,13.73c1.744,0,3.159-1.414,3.159-3.158c0-1.745-1.415-3.159-3.159-3.159s-3.158,1.414-3.158,3.159C17.184,12.316,18.598,13.73,20.342,13.73zM12.019,13.73c1.744,0,3.158-1.414,3.158-3.158c0-1.745-1.414-3.159-3.158-3.159c-1.745,0-3.159,1.414-3.159,3.159C8.86,12.316,10.273,13.73,12.019,13.73z");
    }});
draw2d.shape.icon.Twitter = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Twitter", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M23.295,22.567h-7.213c-2.125,0-4.103-2.215-4.103-4.736v-1.829h11.232c1.817,0,3.291-1.469,3.291-3.281c0-1.813-1.474-3.282-3.291-3.282H11.979V6.198c0-1.835-1.375-3.323-3.192-3.323c-1.816,0-3.29,1.488-3.29,3.323v11.633c0,6.23,4.685,11.274,10.476,11.274h7.211c1.818,0,3.318-1.463,3.318-3.298S25.112,22.567,23.295,22.567z");
    }});
draw2d.shape.icon.TwitterBird = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.TwitterBird", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.605,13.11c0.913-2.851,2.029-4.698,3.313-6.038c0.959-1,1.453-1.316,0.891-0.216c0.25-0.199,0.606-0.464,0.885-0.605c1.555-0.733,1.442-0.119,0.373,0.54c2.923-1.045,2.82,0.286-0.271,0.949c2.527,0.047,5.214,1.656,5.987,5.077c0.105,0.474-0.021,0.428,0.464,0.514c1.047,0.186,2.03,0.174,2.991-0.13c-0.104,0.708-1.039,1.167-2.497,1.471c-0.541,0.112-0.651,0.083-0.005,0.229c0.799,0.179,1.69,0.226,2.634,0.182c-0.734,0.846-1.905,1.278-3.354,1.296c-0.904,3.309-2.976,5.678-5.596,7.164c-6.152,3.492-15.108,2.984-19.599-3.359c2.947,2.312,7.312,2.821,10.555-0.401c-2.125,0-2.674-1.591-0.99-2.449c-1.595-0.017-2.608-0.521-3.203-1.434c-0.226-0.347-0.229-0.374,0.14-0.64c0.405-0.293,0.958-0.423,1.528-0.467c-1.651-0.473-2.66-1.335-3.009-2.491c-0.116-0.382-0.134-0.363,0.256-0.462c0.38-0.097,0.87-0.148,1.309-0.17C6.11,10.88,5.336,9.917,5.139,8.852c-0.186-1.006,0.005-0.748,0.758-0.46C9.263,9.68,12.619,11.062,14.605,13.11L14.605,13.11z");
    }});
draw2d.shape.icon.Skype = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Skype", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.777,18.438c0.209-0.948,0.318-1.934,0.318-2.944c0-7.578-6.144-13.722-13.724-13.722c-0.799,0-1.584,0.069-2.346,0.2C11.801,1.199,10.35,0.75,8.793,0.75c-4.395,0-7.958,3.562-7.958,7.958c0,1.47,0.399,2.845,1.094,4.024c-0.183,0.893-0.277,1.814-0.277,2.76c0,7.58,6.144,13.723,13.722,13.723c0.859,0,1.699-0.078,2.515-0.23c1.119,0.604,2.399,0.945,3.762,0.945c4.395,0,7.957-3.562,7.957-7.959C29.605,20.701,29.309,19.502,28.777,18.438zM22.412,22.051c-0.635,0.898-1.573,1.609-2.789,2.115c-1.203,0.5-2.646,0.754-4.287,0.754c-1.971,0-3.624-0.346-4.914-1.031C9.5,23.391,8.74,22.717,8.163,21.885c-0.583-0.842-0.879-1.676-0.879-2.479c0-0.503,0.192-0.939,0.573-1.296c0.375-0.354,0.857-0.532,1.432-0.532c0.471,0,0.878,0.141,1.209,0.422c0.315,0.269,0.586,0.662,0.805,1.174c0.242,0.558,0.508,1.027,0.788,1.397c0.269,0.355,0.656,0.656,1.151,0.89c0.497,0.235,1.168,0.354,1.992,0.354c1.135,0,2.064-0.241,2.764-0.721c0.684-0.465,1.016-1.025,1.016-1.711c0-0.543-0.173-0.969-0.529-1.303c-0.373-0.348-0.865-0.621-1.465-0.807c-0.623-0.195-1.47-0.404-2.518-0.623c-1.424-0.306-2.634-0.668-3.596-1.076c-0.984-0.419-1.777-1-2.357-1.727c-0.59-0.736-0.889-1.662-0.889-2.75c0-1.036,0.314-1.971,0.933-2.776c0.613-0.8,1.51-1.423,2.663-1.849c1.139-0.422,2.494-0.635,4.027-0.635c1.225,0,2.303,0.141,3.201,0.421c0.904,0.282,1.668,0.662,2.267,1.13c0.604,0.472,1.054,0.977,1.335,1.5c0.284,0.529,0.43,1.057,0.43,1.565c0,0.49-0.189,0.937-0.563,1.324c-0.375,0.391-0.851,0.589-1.408,0.589c-0.509,0-0.905-0.124-1.183-0.369c-0.258-0.227-0.523-0.58-0.819-1.09c-0.342-0.65-0.756-1.162-1.229-1.523c-0.463-0.351-1.232-0.529-2.292-0.529c-0.984,0-1.784,0.197-2.379,0.588c-0.572,0.375-0.85,0.805-0.85,1.314c0,0.312,0.09,0.574,0.273,0.799c0.195,0.238,0.471,0.447,0.818,0.621c0.36,0.182,0.732,0.326,1.104,0.429c0.382,0.106,1.021,0.263,1.899,0.466c1.11,0.238,2.131,0.506,3.034,0.793c0.913,0.293,1.703,0.654,2.348,1.072c0.656,0.429,1.178,0.979,1.547,1.635c0.369,0.658,0.558,1.471,0.558,2.416C23.371,20.119,23.049,21.148,22.412,22.051z");
    }});
draw2d.shape.icon.Windows = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Windows", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.023,17.484c-1.732-0.205-3.022-0.908-4.212-1.701l0,0l-0.559,0.279l-2.578,8.924l0,0c1.217,0.805,2.905,1.707,4.682,1.914c2.686,0.312,5.56-0.744,6.391-1.195l2.617-9.061l-0.559-0.279C25.805,16.365,23.193,17.857,20.023,17.484zM14.424,14.825c-1.267-0.87-2.578-1.652-4.375-1.816c-0.318-0.029-0.627-0.042-0.925-0.042c-3.011,0-4.948,1.347-4.948,1.347l-2.565,8.877l0,0l0.526,0.281c0.981-0.476,2.78-1.145,5.09-0.984c1.665,0.113,2.92,0.781,4.117,1.531l0.507-0.26l0,0L14.424,14.825zM10.201,12.094c1.664,0.114,2.921,0.78,4.117,1.533l0.509-0.26l0,0L17.4,4.431c-1.27-0.87-2.579-1.653-4.377-1.816c-0.318-0.029-0.626-0.042-0.924-0.042C9.088,2.573,7.15,3.92,7.15,3.92l-2.566,8.878L5.11,13.08C6.092,12.604,7.891,11.936,10.201,12.094zM28.779,5.971L28.779,5.971c0,0.001-2.609,1.492-5.779,1.119c-1.734-0.204-3.023-0.907-4.213-1.701L18.227,5.67l-2.576,8.923l0,0c1.215,0.803,2.906,1.709,4.68,1.915c2.687,0.312,5.558-0.745,6.392-1.197l2.615-9.059L28.779,5.971z");
    }});
draw2d.shape.icon.Apple = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Apple", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M24.32,10.85c-1.743,1.233-2.615,2.719-2.615,4.455c0,2.079,1.078,3.673,3.232,4.786c-0.578,1.677-1.416,3.134-2.514,4.375c-1.097,1.241-2.098,1.862-3.004,1.862c-0.427,0-1.009-0.143-1.748-0.423l-0.354-0.138c-0.725-0.281-1.363-0.423-1.92-0.423c-0.525,0-1.1,0.11-1.725,0.331l-0.445,0.16l-0.56,0.229c-0.441,0.176-0.888,0.264-1.337,0.264c-1.059,0-2.228-0.872-3.507-2.616c-1.843-2.498-2.764-5.221-2.764-8.167c0-2.095,0.574-3.781,1.725-5.061c1.149-1.279,2.673-1.92,4.568-1.92c0.709,0,1.371,0.13,1.988,0.389l0.423,0.172l0.445,0.183c0.396,0.167,0.716,0.251,0.959,0.251c0.312,0,0.659-0.072,1.04-0.217l0.582-0.229l0.435-0.16c0.693-0.251,1.459-0.377,2.297-0.377C21.512,8.576,23.109,9.334,24.32,10.85zM19.615,3.287c0.021,0.267,0.033,0.473,0.033,0.617c0,1.317-0.479,2.473-1.438,3.467s-2.075,1.49-3.347,1.49c-0.038-0.297-0.058-0.51-0.058-0.639c0-1.12,0.445-2.171,1.337-3.153c0.891-0.982,1.922-1.558,3.096-1.725C19.32,3.329,19.447,3.311,19.615,3.287z");
    }});
draw2d.shape.icon.Linux = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Linux", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M11.791,25.229c1.027-0.104,1.162-1.191,0.68-1.666c-0.398-0.392-2.598-2.022-3.171-2.664C9.033,20.6,8.673,20.454,8.52,20.12c-0.352-0.771-0.598-1.869-0.151-2.658c0.081-0.144,0.133-0.078,0.071,0.22c-0.351,1.684,0.746,3.059,0.986,2.354c0.167-0.487,0.013-1.358,0.102-2.051c0.158-1.226,1.273-3.577,1.763-3.712c-0.755-1.398,0.886-2.494,0.866-3.723c-0.014-0.798,0.701,0.982,1.419,1.359c0.802,0.422,1.684-0.794,2.936-1.41c0.354-0.176,0.809-0.376,0.776-0.524c-0.146-0.718-1.644,0.886-2.979,0.939c-0.61,0.024-0.837-0.12-1.072-0.347c-0.712-0.689,0.073-0.115,1.132-0.307c0.471-0.085,0.629-0.163,1.128-0.365c0.5-0.201,1.069-0.5,1.636-0.654c0.395-0.106,0.361-0.402,0.208-0.491c-0.088-0.051-0.219-0.046-0.321,0.133c-0.244,0.419-1.383,0.661-1.74,0.771c-0.457,0.14-0.962,0.271-1.634,0.243c-1.021-0.042-0.782-0.509-1.513-0.928c-0.213-0.122-0.156-0.444,0.129-0.729c0.148-0.148,0.557-0.232,0.76-0.572c0.028-0.047,0.289-0.32,0.494-0.461c0.07-0.049,0.076-1.295-0.562-1.32c-0.543-0.021-0.697,0.398-0.675,0.818c0.022,0.419,0.245,0.765,0.393,0.764c0.285-0.004,0.019,0.311-0.138,0.361c-0.237,0.078-0.562-0.934-0.525-1.418c0.039-0.506,0.303-1.4,0.942-1.383c0.576,0.016,0.993,0.737,0.973,1.983c-0.003,0.211,0.935-0.101,1.247,0.229c0.224,0.236-0.767-2.207,1.438-2.375c0.582,0.111,1.14,0.305,1.371,1.641c-0.086,0.139,0.146,1.07-0.215,1.182c-0.438,0.135-0.707-0.02-0.453-0.438c0.172-0.418,0.004-1.483-0.882-1.42c-0.887,0.064-0.769,1.637-0.526,1.668c0.243,0.031,0.854,0.465,1.282,0.549c1.401,0.271,0.371,1.075,0.555,2.048c0.205,1.099,0.929,0.809,1.578,3.717c0.137,0.177,0.676,0.345,1.199,2.579c0.473,2.011-0.195,3.473,0.938,3.353c0.256-0.026,0.629-0.1,0.792-0.668c0.425-1.489-0.213-3.263-0.855-4.46c-0.375-0.698-0.729-1.174-0.916-1.337c0.738,0.436,1.683,1.829,1.898,2.862c0.286,1.358,0.49,1.934,0.059,3.37c0.25,0.125,0.871,0.39,0.871,0.685c-0.647-0.53-2.629-0.625-2.68,0.646c-0.338,0.008-0.594,0.034-0.811,0.293c-0.797,0.944-0.059,2.842-0.139,3.859c-0.07,0.896-0.318,1.783-0.46,2.683c-0.474-0.019-0.428-0.364-0.274-0.852c0.135-0.431,0.351-0.968,0.365-1.484c0.012-0.467-0.039-0.759-0.156-0.831c-0.118-0.072-0.303,0.074-0.559,0.485c-0.543,0.875-1.722,1.261-2.821,1.397c-1.099,0.138-2.123,0.028-2.664-0.578c-0.186-0.207-0.492,0.058-0.529,0.111c-0.049,0.074,0.18,0.219,0.352,0.533c0.251,0.461,0.49,1.159-0.105,1.479C12.83,26.314,12.316,26.221,11.791,25.229L11.791,25.229zM11.398,25.188c0.395,0.621,1.783,3.232-0.652,3.571c-0.814,0.114-2.125-0.474-3.396-0.784c-1.142-0.279-2.301-0.444-2.949-0.627c-0.391-0.108-0.554-0.25-0.588-0.414c-0.091-0.434,0.474-1.041,0.503-1.555c0.028-0.514-0.188-0.779-0.364-1.199c-0.177-0.42-0.224-0.734-0.081-0.914c0.109-0.141,0.334-0.199,0.698-0.164c0.462,0.047,1.02-0.049,1.319-0.23c0.505-0.309,0.742-0.939,0.516-1.699c0,0.744-0.244,1.025-0.855,1.366c-0.577,0.319-1.467,0.062-1.875,0.416c-0.492,0.427,0.175,1.528,0.12,2.338c-0.042,0.622-0.69,1.322-0.401,1.946c0.291,0.627,1.648,0.695,3.064,0.99c2.012,0.422,3.184,1.153,4.113,1.188c1.356,0.05,1.564-1.342,3.693-1.36c0.621-0.033,1.229-0.052,1.835-0.06c0.688-0.009,1.375-0.003,2.079,0.014c1.417,0.034,0.931,0.773,1.851,1.246c0.774,0.397,2.17,0.241,2.504-0.077c0.451-0.431,1.662-1.467,2.592-1.935c1.156-0.583,3.876-1.588,1.902-2.812c-0.461-0.285-1.547-0.588-1.639-2.676c-0.412,0.366-0.365,2.312,0.784,2.697c1.283,0.431,2.085,1.152-0.301,1.969c-1.58,0.54-1.849,0.706-3.099,1.747c-1.267,1.054-3.145,0.636-2.815-1.582c0.171-1.155,0.269-2.11-0.019-3.114c-0.142-0.49-0.211-1.119-0.114-1.562c0.187-0.858,0.651-1.117,1.106-0.293c0.285,0.519,0.385,1.122,1.408,1.171c1.607,0.077,1.926-1.553,2.439-1.627c0.343-0.05,0.686-1.02,0.425-2.589c-0.28-1.681-1.269-4.332-2.536-5.677c-1.053-1.118-1.717-2.098-2.135-3.497c-0.352-1.175-0.547-2.318-0.475-3.412c0.094-1.417-0.691-3.389-1.943-4.316c-0.782-0.581-2.011-0.893-3.122-0.88c-0.623,0.007-1.21,0.099-1.661,0.343c-1.855,1.008-2.113,2.445-2.086,4.088c0.025,1.543,0.078,3.303,0.254,4.977c-0.208,0.77-1.288,2.227-1.979,3.114C8.59,14.233,8.121,16.01,7.52,17.561c-0.321,0.828-0.862,1.2-0.908,2.265C6.6,20.122,6.61,20.891,6.894,20.672C7.98,19.829,9.343,21.95,11.398,25.188L11.398,25.188zM17.044,2.953c-0.06,0.176-0.3,0.321-0.146,0.443c0.152,0.123,0.24-0.171,0.549-0.281c0.08-0.028,0.449,0.012,0.519-0.164c0.03-0.077-0.19-0.164-0.321-0.291c-0.133-0.125-0.262-0.236-0.386-0.229C16.938,2.451,17.096,2.798,17.044,2.953L17.044,2.953zM18.934,9.35c0.115-0.121,0.174,0.207,0.483,0.402c0.244,0.154,0.481,0.04,0.545,0.354c0.044,0.225-0.097,0.467-0.284,0.436C19.35,10.486,18.596,9.705,18.934,9.35L18.934,9.35zM13.832,7.375c-0.508-0.037-0.543,0.33-0.375,0.324C13.629,7.693,13.523,7.408,13.832,7.375L13.832,7.375zM12.96,6.436c0.06-0.013,0.146,0.09,0.119,0.233c-0.037,0.199-0.021,0.324,0.117,0.325c0.022,0,0.048-0.005,0.056-0.057c0.066-0.396-0.14-0.688-0.225-0.711C12.834,6.178,12.857,6.458,12.96,6.436L12.96,6.436zM16.663,6.268c0.129,0.039,0.253,0.262,0.28,0.504c0.002,0.021,0.168-0.035,0.17-0.088c0.011-0.389-0.321-0.571-0.408-0.562C16.506,6.139,16.562,6.238,16.663,6.268L16.663,6.268zM14.765,7.423c0.463-0.214,0.625,0.118,0.465,0.171C15.066,7.648,15.065,7.345,14.765,7.423L14.765,7.423zM9.178,15.304c-0.219-0.026,0.063-0.19,0.184-0.397c0.131-0.227,0.105-0.511,0.244-0.469s0.061,0.2-0.033,0.461C9.491,15.121,9.258,15.313,9.178,15.304L9.178,15.304z");
    }});
draw2d.shape.icon.NodeJs = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.NodeJs", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M4.783,4.458L2.59,3.196C2.553,3.174,2.511,3.163,2.469,3.161H2.447C2.405,3.163,2.363,3.174,2.326,3.196L0.133,4.458C0.051,4.505,0,4.593,0,4.688l0.005,3.398c0,0.047,0.024,0.092,0.066,0.114c0.041,0.024,0.091,0.024,0.132,0l1.303-0.746c0.083-0.049,0.132-0.136,0.132-0.229V5.637c0-0.095,0.05-0.183,0.132-0.229l0.555-0.32c0.041-0.023,0.086-0.035,0.132-0.035c0.045,0,0.092,0.012,0.132,0.035l0.555,0.32c0.082,0.047,0.133,0.135,0.133,0.229v1.588c0,0.094,0.051,0.182,0.132,0.229l1.303,0.746c0.041,0.024,0.092,0.024,0.132,0c0.041-0.022,0.066-0.067,0.066-0.114l0.004-3.398C4.915,4.593,4.865,4.505,4.783,4.458zM17.93,0.745l-1.305-0.729c-0.042-0.023-0.091-0.022-0.132,0.001c-0.041,0.024-0.065,0.067-0.065,0.114v3.365c0,0.033-0.018,0.064-0.046,0.081s-0.064,0.017-0.093,0l-0.549-0.316c-0.082-0.047-0.183-0.047-0.265,0l-2.193,1.266c-0.082,0.047-0.133,0.135-0.133,0.229V7.29c0,0.095,0.051,0.182,0.132,0.229l2.194,1.267c0.082,0.048,0.183,0.048,0.265,0l2.194-1.267c0.082-0.048,0.133-0.135,0.133-0.229V0.977C18.066,0.88,18.014,0.792,17.93,0.745zM16.421,6.458c0,0.023-0.013,0.045-0.033,0.057l-0.753,0.435c-0.021,0.012-0.045,0.012-0.066,0l-0.753-0.435c-0.021-0.012-0.033-0.034-0.033-0.057v-0.87c0-0.023,0.013-0.045,0.033-0.058l0.753-0.435c0.021-0.012,0.045-0.012,0.066,0l0.753,0.435c0.021,0.012,0.033,0.034,0.033,0.058V6.458zM24.473,4.493l-2.18-1.266c-0.082-0.047-0.183-0.048-0.265,0l-2.193,1.266c-0.082,0.047-0.132,0.135-0.132,0.229v2.532c0,0.096,0.051,0.184,0.133,0.23l2.18,1.242c0.08,0.045,0.179,0.046,0.26,0.001l1.318-0.732c0.042-0.023,0.067-0.067,0.068-0.115c0-0.048-0.025-0.092-0.066-0.116l-2.207-1.266c-0.041-0.023-0.066-0.067-0.066-0.115V5.59c0-0.047,0.025-0.091,0.065-0.115l0.688-0.396c0.041-0.024,0.091-0.024,0.132,0l0.688,0.396c0.041,0.023,0.066,0.067,0.066,0.115v0.625c0,0.047,0.025,0.091,0.066,0.114c0.041,0.024,0.092,0.024,0.132,0l1.314-0.764c0.081-0.047,0.132-0.135,0.132-0.229V4.722C24.605,4.628,24.555,4.541,24.473,4.493zM11.363,4.48L9.169,3.214c-0.082-0.047-0.183-0.047-0.265,0L6.711,4.48C6.629,4.527,6.579,4.615,6.579,4.709v2.534c0,0.095,0.051,0.182,0.133,0.229l2.193,1.267c0.082,0.048,0.183,0.048,0.265,0l2.193-1.267c0.082-0.048,0.132-0.135,0.132-0.229V4.709C11.495,4.615,11.445,4.527,11.363,4.48zM31.019,4.382L28.95,3.187c-0.13-0.074-0.304-0.074-0.435,0l-2.068,1.195c-0.135,0.077-0.218,0.222-0.218,0.377v2.386c0,0.156,0.083,0.301,0.218,0.378l0.542,0.312c0.263,0.13,0.356,0.13,0.477,0.13c0.389,0,0.612-0.236,0.612-0.646V4.962c0-0.033-0.027-0.06-0.06-0.06h-0.263c-0.033,0-0.061,0.026-0.061,0.06v2.356c0,0.182-0.188,0.363-0.495,0.209l-0.566-0.326c-0.021-0.012-0.033-0.033-0.033-0.057V4.759c0-0.023,0.013-0.045,0.033-0.057l2.067-1.193c0.019-0.011,0.044-0.011,0.063,0l2.067,1.193c0.02,0.012,0.032,0.034,0.032,0.057v2.386c0,0.023-0.013,0.046-0.032,0.057l-2.068,1.193c-0.018,0.012-0.045,0.012-0.063,0l-0.53-0.314c-0.017-0.01-0.036-0.013-0.052-0.004c-0.146,0.083-0.175,0.094-0.312,0.143c-0.034,0.012-0.084,0.031,0.019,0.09l0.691,0.408c0.065,0.038,0.141,0.059,0.217,0.059s0.151-0.021,0.218-0.059l2.068-1.194c0.134-0.078,0.217-0.222,0.217-0.378V4.759C31.235,4.604,31.152,4.459,31.019,4.382zM29.371,6.768c-0.548,0-0.668-0.138-0.708-0.41c-0.005-0.029-0.029-0.051-0.06-0.051h-0.268c-0.033,0-0.06,0.026-0.06,0.06c0,0.349,0.189,0.765,1.095,0.765c0.655,0,1.031-0.259,1.031-0.709c0-0.447-0.302-0.566-0.938-0.65c-0.643-0.085-0.708-0.128-0.708-0.279c0-0.125,0.056-0.29,0.531-0.29c0.425,0,0.581,0.091,0.646,0.378c0.006,0.027,0.03,0.047,0.059,0.047h0.269c0.017,0,0.032-0.007,0.044-0.019c0.011-0.013,0.017-0.029,0.016-0.046c-0.042-0.493-0.37-0.723-1.032-0.723c-0.59,0-0.941,0.249-0.941,0.666c0,0.453,0.35,0.578,0.916,0.634c0.677,0.066,0.729,0.166,0.729,0.298C29.992,6.669,29.807,6.768,29.371,6.768zM22.128,5.446l-0.42,0.243c-0.016,0.009-0.025,0.026-0.025,0.044v0.486c0,0.019,0.01,0.035,0.025,0.044l0.42,0.243c0.016,0.009,0.035,0.009,0.052,0l0.421-0.243c0.016-0.009,0.025-0.025,0.025-0.044V5.733c0-0.018-0.01-0.035-0.025-0.044L22.18,5.446C22.163,5.438,22.144,5.438,22.128,5.446z");
    }});
draw2d.shape.icon.JQuery = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.JQuery", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M10.322,23.041C4.579,18.723,2.777,11.07,5.494,4.583c-0.254,0.291-0.502,0.59-0.739,0.904c-5.177,6.887-4.008,16.505,2.613,21.482c6.62,4.979,16.184,3.432,21.362-3.455c0.237-0.314,0.454-0.635,0.663-0.959C23.915,26.963,16.064,27.357,10.322,23.041zM13.662,18.598c4.765,3.582,11.604,2.564,15.567-2.198c-3.609,2.641-9.09,2.475-13.361-0.736S9.916,7.231,11.451,3.03C7.976,8.161,8.897,15.015,13.662,18.598zM18.642,11.976c3.254,2.447,8.146,1.438,10.967-2.242c-2.604,1.921-6.341,1.955-9.157-0.164c-2.819-2.118-3.826-5.718-2.701-8.754C14.998,4.549,15.387,9.528,18.642,11.976z");
    }});
draw2d.shape.icon.Sencha = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Sencha", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M18.265,22.734c1.365,0.662,2.309,2.062,2.309,3.682c0,1.566-0.881,2.928-2.176,3.615l1.922-0.98c3.16-1.58,5.332-4.846,5.332-8.617c0-3.719-2.109-6.945-5.195-8.547l-6.272-3.144c-1.366-0.662-2.308-2.062-2.308-3.682c0-1.567,0.881-2.928,2.175-3.614L12.13,2.428c-3.161,1.578-5.332,4.843-5.332,8.616c0,3.718,2.108,6.944,5.195,8.546L18.265,22.734z");
    }});
draw2d.shape.icon.Vim = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Vim", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M25.012,10.44l4.571-4.645c0.11-0.113,0.173-0.264,0.173-0.423V3.134c0-0.159-0.064-0.314-0.177-0.427l-0.604-0.602c-0.111-0.112-0.261-0.176-0.42-0.177l-9.646-0.086C18.71,1.84,18.523,1.935,18.41,2.099L17.807,2.96c-0.033,0.047-0.059,0.099-0.076,0.154l-2.144-2.156l0,0l-1.646,1.666l-0.447-0.497c-0.112-0.125-0.27-0.197-0.438-0.199L3.324,1.756c-0.163-0.003-0.322,0.06-0.437,0.176L2.284,2.535C2.171,2.647,2.107,2.803,2.107,2.962v2.325c0,0.164,0.066,0.32,0.183,0.434l0.657,0.635C3.056,6.461,3.2,6.521,3.352,6.525l0.285,0.007l0.007,6.512l-2.527,2.557l2.533,2.533l0.008,8.084c0,0.159,0.065,0.314,0.177,0.427l0.861,0.861c0.112,0.111,0.268,0.176,0.427,0.176h2.67c0.161,0,0.317-0.064,0.43-0.181l2.378-2.417l4.9,4.9l14.47-14.558L25.012,10.44zM9.747,24.232l-2.208,2.242H5.372l-0.509-0.509L4.856,19.34l-0.008-7.515L4.842,5.943c0-0.328-0.261-0.594-0.588-0.603L3.617,5.326L3.313,5.031v-1.82l0.245-0.245l9.215,0.163l0.319,0.354l0.126,0.141v1.419l-0.352,0.362H12.26c-0.331,0-0.6,0.266-0.603,0.597l-0.076,7.203c-0.002,0.244,0.141,0.463,0.365,0.56c0.224,0.096,0.482,0.049,0.657-0.12l7.495-7.235c0.174-0.171,0.23-0.432,0.139-0.66c-0.09-0.228-0.312-0.377-0.56-0.377h-0.479l-0.296-0.379V3.496l0.312-0.445l9.083,0.081l0.252,0.252v1.743l-4.388,4.458L9.747,24.232z");
    }});
draw2d.shape.icon.InkScape = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.InkScape", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M20.402,17.626c0.84-0.772,2.468-0.381,5.979-1.853c1.716-0.72,1.572-1.265,1.566-1.928c-0.001-0.014,0-0.027,0-0.041h-0.005c-0.012-0.667-0.291-1.332-0.846-1.845L17.049,2.684c-0.566-0.522-1.304-0.782-2.042-0.782V1.898c-0.738,0-1.475,0.261-2.04,0.783l-10.05,9.276c-0.554,0.512-0.832,1.176-0.843,1.844H2.07c0,0,0.003,0.011,0.004,0.011c0,0.012-0.004,0.024-0.004,0.034h0.017c0.193,0.676,5.164,1.536,5.718,2.049c0.838,0.774-3.211,1.339-2.374,2.114c0.838,0.773,5.062,1.496,5.898,2.271c0.838,0.771-1.711,1.596-0.874,2.366c0.837,0.773,3.651-0.191,3.142,1.822c1.13,1.045,3.49,0.547,5.071-0.498c0.837-0.771-1.607-0.703-0.77-1.477c0.836-0.774,2.949-0.777,4.73-2.627C21.913,18.838,19.566,18.398,20.402,17.626zM10.973,16.868l-0.42-0.504c1.497,0.358,3.162,0.827,4.498,0.837l0.058,0.554C13.964,17.646,11.544,17.137,10.973,16.868zM18.161,8.58l-1.396-0.74L14.53,9.594l-1.067-3.192l-1.177,2.545L8.998,9.25l0.036-1.352c0-0.324,1.895-2.596,3.05-3.136l2.112-1.401c0.312-0.186,0.53-0.261,0.727-0.257c0.327,0.011,0.593,0.239,1.112,0.55l4.748,3.25c0.357,0.215,0.619,0.522,0.626,0.898l-2.813-1.254L18.161,8.58zM26.434,19.594c-0.313-0.07-1.688-0.691-2.035,0.165c0.968,0.981,2.645,2.181,3.316,1.482C28.391,20.543,27.102,19.745,26.434,19.594zM4.663,21.566c-0.315,0.074-1.842,0.115-1.719,1.021c1.351,0.451,3.438,0.792,3.684-0.113C6.873,21.566,5.33,21.414,4.663,21.566zM17.877,26.396c-0.232,0.209-1.53,0.953-0.929,1.681c1.413-0.236,3.403-0.914,3.12-1.812C19.786,25.369,18.37,25.953,17.877,26.396z");
    }});
draw2d.shape.icon.Aumade = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Aumade", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M14.513,24.52c-0.131-0.217-0.14-0.481-0.022-0.711l1.987-3.844l0,0c0.186-0.357,0.625-0.497,0.981-0.312c0.357,0.188,0.498,0.625,0.312,0.982l-1.801,3.48l2.228,3.699h12.269l-14.8-25.631L6.433,18.178c0.434,0.242,0.909,0.479,1.391,0.654c0.571,0.211,1.148,0.342,1.658,0.342c0.276,0,0.579-0.078,0.916-0.238c0.337-0.158,0.7-0.396,1.073-0.688c0.749-0.582,1.527-1.354,2.334-2.021c0.539-0.442,1.091-0.844,1.706-1.099c0.352-0.145,0.729-0.239,1.128-0.239c0.622,0,1.174,0.214,1.622,0.5c0.449,0.287,0.813,0.646,1.11,0.995c0.59,0.697,0.902,1.359,0.924,1.394l0,0c0.18,0.361,0.021,0.801-0.341,0.977c-0.356,0.176-0.798,0.021-0.978-0.34c0-0.002-0.002-0.004-0.004-0.007c-0.002-0.011-0.008-0.021-0.018-0.034c-0.018-0.033-0.043-0.082-0.078-0.146c-0.07-0.125-0.179-0.305-0.312-0.496c-0.271-0.391-0.668-0.845-1.092-1.104c-0.281-0.178-0.561-0.272-0.844-0.272c-0.216,0-0.479,0.069-0.788,0.229c-0.309,0.153-0.653,0.396-1.016,0.688c-0.727,0.584-1.511,1.362-2.351,2.033c-0.562,0.445-1.15,0.853-1.809,1.103c-0.375,0.143-0.776,0.229-1.195,0.229c-0.749,0-1.48-0.181-2.164-0.433c-0.58-0.219-1.125-0.482-1.613-0.764L0.86,27.816h15.63L14.513,24.52zM18.214,22.242c0.222-0.557,0.537-1.217,0.963-1.848c0.427-0.627,0.957-1.232,1.646-1.646c0.379-0.229,0.812-0.391,1.282-0.438l-0.604-0.934l0,0c-0.22-0.339-0.123-0.789,0.215-1.009c0.341-0.219,0.789-0.123,1.013,0.216l1.545,2.391c0.184,0.274,0.147,0.646-0.075,0.893c-0.228,0.247-0.591,0.305-0.886,0.145c-0.354-0.191-0.646-0.258-0.901-0.258c-0.291,0-0.562,0.084-0.845,0.25c-0.277,0.164-0.562,0.414-0.813,0.719c-0.519,0.607-0.937,1.422-1.185,2.055c-0.111,0.285-0.387,0.466-0.678,0.466c-0.092,0-0.183-0.021-0.271-0.056C18.249,23.039,18.064,22.615,18.214,22.242z");
    }});
draw2d.shape.icon.Firefox = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Firefox", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.4,22.469c0.479-0.964,0.851-1.991,1.095-3.066c0.953-3.661,0.666-6.854,0.666-6.854l-0.327,2.104c0,0-0.469-3.896-1.044-5.353c-0.881-2.231-1.273-2.214-1.274-2.21c0.542,1.379,0.494,2.169,0.483,2.288c-0.01-0.016-0.019-0.032-0.027-0.047c-0.131-0.324-0.797-1.819-2.225-2.878c-2.502-2.481-5.943-4.014-9.745-4.015c-4.056,0-7.705,1.745-10.238,4.525C5.444,6.5,5.183,5.938,5.159,5.317c0,0-0.002,0.002-0.006,0.005c0-0.011-0.003-0.021-0.003-0.031c0,0-1.61,1.247-1.436,4.612c-0.299,0.574-0.56,1.172-0.777,1.791c-0.375,0.817-0.75,2.004-1.059,3.746c0,0,0.133-0.422,0.399-0.988c-0.064,0.482-0.103,0.971-0.116,1.467c-0.09,0.845-0.118,1.865-0.039,3.088c0,0,0.032-0.406,0.136-1.021c0.834,6.854,6.667,12.165,13.743,12.165l0,0c1.86,0,3.636-0.37,5.256-1.036C24.938,27.771,27.116,25.196,28.4,22.469zM16.002,3.356c2.446,0,4.73,0.68,6.68,1.86c-2.274-0.528-3.433-0.261-3.423-0.248c0.013,0.015,3.384,0.589,3.981,1.411c0,0-1.431,0-2.856,0.41c-0.065,0.019,5.242,0.663,6.327,5.966c0,0-0.582-1.213-1.301-1.42c0.473,1.439,0.351,4.17-0.1,5.528c-0.058,0.174-0.118-0.755-1.004-1.155c0.284,2.037-0.018,5.268-1.432,6.158c-0.109,0.07,0.887-3.189,0.201-1.93c-4.093,6.276-8.959,2.539-10.934,1.208c1.585,0.388,3.267,0.108,4.242-0.559c0.982-0.672,1.564-1.162,2.087-1.047c0.522,0.117,0.87-0.407,0.464-0.872c-0.405-0.466-1.392-1.105-2.725-0.757c-0.94,0.247-2.107,1.287-3.886,0.233c-1.518-0.899-1.507-1.63-1.507-2.095c0-0.366,0.257-0.88,0.734-1.028c0.58,0.062,1.044,0.214,1.537,0.466c0.005-0.135,0.006-0.315-0.001-0.519c0.039-0.077,0.015-0.311-0.047-0.596c-0.036-0.287-0.097-0.582-0.19-0.851c0.01-0.002,0.017-0.007,0.021-0.021c0.076-0.344,2.147-1.544,2.299-1.659c0.153-0.114,0.55-0.378,0.506-1.183c-0.015-0.265-0.058-0.294-2.232-0.286c-0.917,0.003-1.425-0.894-1.589-1.245c0.222-1.231,0.863-2.11,1.919-2.704c0.02-0.011,0.015-0.021-0.008-0.027c0.219-0.127-2.524-0.006-3.76,1.604C9.674,8.045,9.219,7.95,8.71,7.95c-0.638,0-1.139,0.07-1.603,0.187c-0.05,0.013-0.122,0.011-0.208-0.001C6.769,8.04,6.575,7.88,6.365,7.672c0.161-0.18,0.324-0.356,0.495-0.526C9.201,4.804,12.43,3.357,16.002,3.356z");
    }});
draw2d.shape.icon.Ie = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Ie", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.998,2.266c-2.12-1.91-6.925,0.382-9.575,1.93c-0.76-0.12-1.557-0.185-2.388-0.185c-3.349,0-6.052,0.985-8.106,2.843c-2.336,2.139-3.631,4.94-3.631,8.177c0,0.028,0.001,0.056,0.001,0.084c3.287-5.15,8.342-7.79,9.682-8.487c0.212-0.099,0.338,0.155,0.141,0.253c-0.015,0.042-0.015,0,0,0c-2.254,1.35-6.434,5.259-9.146,10.886l-0.003-0.007c-1.717,3.547-3.167,8.529-0.267,10.358c2.197,1.382,6.13-0.248,9.295-2.318c0.764,0.108,1.567,0.165,2.415,0.165c5.84,0,9.937-3.223,11.399-7.924l-8.022-0.014c-0.337,1.661-1.464,2.548-3.223,2.548c-2.21,0-3.729-1.211-3.828-4.012l15.228-0.014c0.028-0.578-0.042-0.985-0.042-1.436c0-5.251-3.143-9.355-8.255-10.663c2.081-1.294,5.974-3.209,7.848-1.681c1.407,1.14,0.633,3.533,0.295,4.518c-0.056,0.254,0.24,0.296,0.296,0.057C28.814,5.573,29.026,3.194,27.998,2.266zM13.272,25.676c-2.469,1.475-5.873,2.539-7.539,1.289c-1.243-0.935-0.696-3.468,0.398-5.938c0.664,0.992,1.495,1.886,2.473,2.63C9.926,24.651,11.479,25.324,13.272,25.676zM12.714,13.046c0.042-2.435,1.787-3.49,3.617-3.49c1.928,0,3.49,1.112,3.49,3.49H12.714z");
    }});
draw2d.shape.icon.Ie9 = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Ie9", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.751,17.887c0.054-0.434,0.081-0.876,0.081-1.324c0-1.744-0.413-3.393-1.146-4.854c1.133-2.885,1.155-5.369-0.201-6.777c-1.756-1.822-5.391-1.406-9.433,0.721c-0.069-0.001-0.138-0.003-0.206-0.003c-6.069,0-10.988,4.888-10.988,10.917c0,0.183,0.005,0.354,0.014,0.529c-2.688,4.071-3.491,7.967-1.688,9.838c1.557,1.613,4.691,1.344,8.2-0.392c1.363,0.604,2.873,0.938,4.462,0.938c4.793,0,8.867-3.049,10.369-7.299H21.26c-0.814,1.483-2.438,2.504-4.307,2.504c-2.688,0-4.867-2.104-4.867-4.688c0-0.036,0.002-0.071,0.003-0.106h15.662V17.887zM26.337,6.099c0.903,0.937,0.806,2.684-0.087,4.818c-1.27-2.083-3.221-3.71-5.546-4.576C23.244,5.217,25.324,5.047,26.337,6.099zM16.917,10.372c2.522,0,4.585,1.991,4.748,4.509h-9.496C12.333,12.363,14.396,10.372,16.917,10.372zM5.687,26.501c-1.103-1.146-0.712-3.502,0.799-6.298c0.907,2.546,2.736,4.658,5.09,5.938C8.92,27.368,6.733,27.587,5.687,26.501z");
    }});
draw2d.shape.icon.Opera = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Opera", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.954,2.046c-7.489,0-12.872,5.432-12.872,13.581c0,7.25,5.234,13.835,12.873,13.835c7.712,0,12.974-6.583,12.974-13.835C28.929,7.413,23.375,2.046,15.954,2.046zM15.952,26.548L15.952,26.548c-2.289,0-3.49-1.611-4.121-3.796c-0.284-1.037-0.458-2.185-0.563-3.341c-0.114-1.374-0.129-2.773-0.129-4.028c0-0.993,0.018-1.979,0.074-2.926c0.124-1.728,0.386-3.431,0.89-4.833c0.694-1.718,1.871-2.822,3.849-2.822c2.5,0,3.763,1.782,4.385,4.322c0.429,1.894,0.56,4.124,0.56,6.274c0,2.299-0.103,5.153-0.763,7.442C19.473,24.979,18.242,26.548,15.952,26.548z");
    }});
draw2d.shape.icon.Chrome = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Chrome", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.318,7.677c0.071-0.029,0.148-0.046,0.229-0.046h11.949c-2.533-3.915-6.938-6.506-11.949-6.506c-5.017,0-9.428,2.598-11.959,6.522l4.291,7.431C8.018,11.041,11.274,7.796,15.318,7.677zM28.196,8.84h-8.579c2.165,1.357,3.605,3.763,3.605,6.506c0,1.321-0.334,2.564-0.921,3.649c-0.012,0.071-0.035,0.142-0.073,0.209l-5.973,10.347c7.526-0.368,13.514-6.587,13.514-14.205C29.77,13.002,29.201,10.791,28.196,8.84zM15.547,23.022c-2.761,0-5.181-1.458-6.533-3.646c-0.058-0.046-0.109-0.103-0.149-0.171L2.89,8.855c-1,1.946-1.565,4.153-1.565,6.492c0,7.624,5.999,13.846,13.534,14.205l4.287-7.425C18.073,22.698,16.848,23.022,15.547,23.022zM9.08,15.347c0,1.788,0.723,3.401,1.894,4.573c1.172,1.172,2.785,1.895,4.573,1.895c1.788,0,3.401-0.723,4.573-1.895s1.895-2.785,1.895-4.573c0-1.788-0.723-3.4-1.895-4.573c-1.172-1.171-2.785-1.894-4.573-1.894c-1.788,0-3.401,0.723-4.573,1.894C9.803,11.946,9.081,13.559,9.08,15.347z");
    }});
draw2d.shape.icon.Safari = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Safari", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M16.154,5.135c-0.504,0-1,0.031-1.488,0.089l-0.036-0.18c-0.021-0.104-0.06-0.198-0.112-0.283c0.381-0.308,0.625-0.778,0.625-1.306c0-0.927-0.751-1.678-1.678-1.678s-1.678,0.751-1.678,1.678c0,0.745,0.485,1.376,1.157,1.595c-0.021,0.105-0.021,0.216,0,0.328l0.033,0.167C7.645,6.95,3.712,11.804,3.712,17.578c0,6.871,5.571,12.441,12.442,12.441c6.871,0,12.441-5.57,12.441-12.441C28.596,10.706,23.025,5.135,16.154,5.135zM16.369,8.1c4.455,0,8.183,3.116,9.123,7.287l-0.576,0.234c-0.148-0.681-0.755-1.191-1.48-1.191c-0.837,0-1.516,0.679-1.516,1.516c0,0.075,0.008,0.148,0.018,0.221l-2.771-0.028c-0.054-0.115-0.114-0.226-0.182-0.333l3.399-5.11l0.055-0.083l-4.766,4.059c-0.352-0.157-0.74-0.248-1.148-0.256l0.086-0.018l-1.177-2.585c0.64-0.177,1.111-0.763,1.111-1.459c0-0.837-0.678-1.515-1.516-1.515c-0.075,0-0.147,0.007-0.219,0.018l0.058-0.634C15.357,8.141,15.858,8.1,16.369,8.1zM12.146,3.455c0-0.727,0.591-1.318,1.318-1.318c0.727,0,1.318,0.591,1.318,1.318c0,0.425-0.203,0.802-0.516,1.043c-0.183-0.123-0.413-0.176-0.647-0.13c-0.226,0.045-0.413,0.174-0.535,0.349C12.542,4.553,12.146,4.049,12.146,3.455zM7.017,17.452c0-4.443,3.098-8.163,7.252-9.116l0.297,0.573c-0.61,0.196-1.051,0.768-1.051,1.442c0,0.837,0.678,1.516,1.515,1.516c0.068,0,0.135-0.006,0.2-0.015l-0.058,2.845l0.052-0.011c-0.442,0.204-0.824,0.513-1.116,0.895l0.093-0.147l-1.574-0.603l1.172,1.239l0.026-0.042c-0.19,0.371-0.306,0.788-0.324,1.229l-0.003-0.016l-2.623,1.209c-0.199-0.604-0.767-1.041-1.438-1.041c-0.837,0-1.516,0.678-1.516,1.516c0,0.064,0.005,0.128,0.013,0.191l-0.783-0.076C7.063,18.524,7.017,17.994,7.017,17.452zM16.369,26.805c-4.429,0-8.138-3.078-9.106-7.211l0.691-0.353c0.146,0.686,0.753,1.2,1.482,1.2c0.837,0,1.515-0.679,1.515-1.516c0-0.105-0.011-0.207-0.031-0.307l2.858,0.03c0.045,0.095,0.096,0.187,0.15,0.276l-3.45,5.277l0.227-0.195l4.529-3.92c0.336,0.153,0.705,0.248,1.094,0.266l-0.019,0.004l1.226,2.627c-0.655,0.166-1.142,0.76-1.142,1.468c0,0.837,0.678,1.515,1.516,1.515c0.076,0,0.151-0.007,0.225-0.018l0.004,0.688C17.566,26.746,16.975,26.805,16.369,26.805zM18.662,26.521l-0.389-0.6c0.661-0.164,1.152-0.759,1.152-1.47c0-0.837-0.68-1.516-1.516-1.516c-0.066,0-0.13,0.005-0.193,0.014v-2.86l-0.025,0.004c0.409-0.185,0.77-0.459,1.055-0.798l1.516,0.659l-1.104-1.304c0.158-0.335,0.256-0.704,0.278-1.095l2.552-1.164c0.19,0.618,0.766,1.068,1.447,1.068c0.838,0,1.516-0.679,1.516-1.516c0-0.069-0.006-0.137-0.016-0.204l0.65,0.12c0.089,0.517,0.136,1.049,0.136,1.591C25.722,21.826,22.719,25.499,18.662,26.521z");
    }});
draw2d.shape.icon.LinkedIn = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.LinkedIn", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.25,3.125h-22c-1.104,0-2,0.896-2,2v22c0,1.104,0.896,2,2,2h22c1.104,0,2-0.896,2-2v-22C29.25,4.021,28.354,3.125,27.25,3.125zM11.219,26.781h-4v-14h4V26.781zM9.219,11.281c-1.383,0-2.5-1.119-2.5-2.5s1.117-2.5,2.5-2.5s2.5,1.119,2.5,2.5S10.602,11.281,9.219,11.281zM25.219,26.781h-4v-8.5c0-0.4-0.403-1.055-0.687-1.213c-0.375-0.211-1.261-0.229-1.665-0.034l-1.648,0.793v8.954h-4v-14h4v0.614c1.583-0.723,3.78-0.652,5.27,0.184c1.582,0.886,2.73,2.864,2.73,4.702V26.781z");
    }});
draw2d.shape.icon.Flickr = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Flickr", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M21.77,8.895c-2.379,0-4.479,1.174-5.77,2.969c-1.289-1.795-3.39-2.969-5.77-2.969c-3.924,0-7.105,3.181-7.105,7.105c0,3.924,3.181,7.105,7.105,7.105c2.379,0,4.48-1.175,5.77-2.97c1.29,1.795,3.391,2.97,5.77,2.97c3.925,0,7.105-3.182,7.105-7.105C28.875,12.075,25.694,8.895,21.77,8.895zM21.769,21.822c-3.211,0-5.821-2.61-5.821-5.821c0-3.213,2.61-5.824,5.821-5.824c3.213,0,5.824,2.611,5.824,5.824C27.593,19.212,24.981,21.822,21.769,21.822z");
    }});
draw2d.shape.icon.GitHub = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.GitHub", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.436,15.099c-1.201-0.202-2.451-0.335-3.466-0.371l-0.179-0.006c0.041-0.09,0.072-0.151,0.082-0.16c0.022-0.018,0.04-0.094,0.042-0.168c0-0.041,0.018-0.174,0.046-0.35c0.275,0.01,0.64,0.018,1.038,0.021c1.537,0.012,3.145,0.136,4.248,0.331c0.657,0.116,0.874,0.112,0.389-0.006c-0.491-0.119-1.947-0.294-3.107-0.37c-0.779-0.053-1.896-0.073-2.554-0.062c0.019-0.114,0.041-0.241,0.064-0.371c0.093-0.503,0.124-1.009,0.126-2.016c0.002-1.562-0.082-1.992-0.591-3.025c-0.207-0.422-0.441-0.78-0.724-1.104c0.247-0.729,0.241-1.858-0.015-2.848c-0.211-0.812-0.285-0.864-1.021-0.708C22.19,4.019,21.69,4.2,21.049,4.523c-0.303,0.153-0.721,0.391-1.024,0.578c-0.79-0.278-1.607-0.462-2.479-0.561c-0.884-0.1-3.051-0.044-3.82,0.098c-0.752,0.139-1.429,0.309-2.042,0.511c-0.306-0.189-0.75-0.444-1.067-0.604C9.973,4.221,9.473,4.041,8.847,3.908c-0.734-0.157-0.81-0.104-1.02,0.708c-0.26,1.003-0.262,2.151-0.005,2.878C7.852,7.577,7.87,7.636,7.877,7.682c-1.042,1.312-1.382,2.78-1.156,4.829c0.059,0.534,0.15,1.024,0.277,1.473c-0.665-0.004-1.611,0.02-2.294,0.064c-1.162,0.077-2.618,0.25-3.109,0.369c-0.484,0.118-0.269,0.122,0.389,0.007c1.103-0.194,2.712-0.32,4.248-0.331c0.29-0.001,0.561-0.007,0.794-0.013c0.07,0.237,0.15,0.463,0.241,0.678L7.26,14.759c-1.015,0.035-2.264,0.168-3.465,0.37c-0.901,0.151-2.231,0.453-2.386,0.54c-0.163,0.091-0.03,0.071,0.668-0.106c1.273-0.322,2.928-0.569,4.978-0.741l0.229-0.02c0.44,1.022,1.118,1.802,2.076,2.41c0.586,0.373,1.525,0.756,1.998,0.816c0.13,0.016,0.508,0.094,0.84,0.172c0.333,0.078,0.984,0.195,1.446,0.262h0.011c-0.009,0.006-0.017,0.01-0.025,0.016c-0.56,0.291-0.924,0.744-1.169,1.457c-0.11,0.033-0.247,0.078-0.395,0.129c-0.529,0.18-0.735,0.217-1.271,0.221c-0.556,0.004-0.688-0.02-1.02-0.176c-0.483-0.225-0.933-0.639-1.233-1.133c-0.501-0.826-1.367-1.41-2.089-1.41c-0.617,0-0.734,0.25-0.288,0.615c0.672,0.549,1.174,1.109,1.38,1.537c0.116,0.24,0.294,0.611,0.397,0.824c0.109,0.227,0.342,0.535,0.564,0.748c0.522,0.498,1.026,0.736,1.778,0.848c0.504,0.074,0.628,0.074,1.223-0.002c0.287-0.035,0.529-0.076,0.746-0.127c0,0.244,0,0.525,0,0.855c0,1.766-0.021,2.334-0.091,2.5c-0.132,0.316-0.428,0.641-0.716,0.787c-0.287,0.146-0.376,0.307-0.255,0.455c0.067,0.08,0.196,0.094,0.629,0.066c0.822-0.051,1.403-0.355,1.699-0.891c0.095-0.172,0.117-0.518,0.147-2.318c0.032-1.953,0.046-2.141,0.173-2.42c0.077-0.166,0.188-0.346,0.25-0.395c0.104-0.086,0.111,0.084,0.111,2.42c-0.001,2.578-0.027,2.889-0.285,3.385c-0.058,0.113-0.168,0.26-0.245,0.33c-0.135,0.123-0.192,0.438-0.098,0.533c0.155,0.154,0.932-0.088,1.356-0.422c0.722-0.572,0.808-1.045,0.814-4.461l0.003-2.004l0.219,0.021l0.219,0.02l0.036,2.621c0.041,2.951,0.047,2.994,0.549,3.564c0.285,0.322,0.572,0.5,1.039,0.639c0.625,0.188,0.813-0.102,0.393-0.605c-0.457-0.547-0.479-0.756-0.454-3.994c0.017-2.076,0.017-2.076,0.151-1.955c0.282,0.256,0.336,0.676,0.336,2.623c0,2.418,0.069,2.648,0.923,3.07c0.399,0.195,0.511,0.219,1.022,0.221c0.544,0.002,0.577-0.006,0.597-0.148c0.017-0.115-0.05-0.193-0.304-0.348c-0.333-0.205-0.564-0.467-0.709-0.797c-0.055-0.127-0.092-0.959-0.117-2.672c-0.036-2.393-0.044-2.502-0.193-2.877c-0.201-0.504-0.508-0.902-0.897-1.166c-0.101-0.066-0.202-0.121-0.333-0.162c0.161-0.016,0.317-0.033,0.468-0.055c1.572-0.209,2.403-0.383,3.07-0.641c1.411-0.543,2.365-1.445,2.882-2.724c0.046-0.114,0.092-0.222,0.131-0.309l0.398,0.033c2.051,0.173,3.706,0.42,4.979,0.743c0.698,0.177,0.831,0.198,0.668,0.105C30.666,15.551,29.336,15.25,28.436,15.099zM22.422,15.068c-0.233,0.512-0.883,1.17-1.408,1.428c-0.518,0.256-1.33,0.451-2.25,0.544c-0.629,0.064-4.137,0.083-4.716,0.026c-1.917-0.188-2.991-0.557-3.783-1.296c-0.75-0.702-1.1-1.655-1.039-2.828c0.039-0.734,0.216-1.195,0.679-1.755c0.421-0.51,0.864-0.825,1.386-0.985c0.437-0.134,1.778-0.146,3.581-0.03c0.797,0.051,1.456,0.051,2.252,0c1.886-0.119,3.145-0.106,3.61,0.038c0.731,0.226,1.397,0.834,1.797,1.644c0.18,0.362,0.215,0.516,0.241,1.075C22.808,13.699,22.675,14.517,22.422,15.068zM12.912,11.762c-1.073-0.188-1.686,1.649-0.863,2.587c0.391,0.445,0.738,0.518,1.172,0.248c0.402-0.251,0.62-0.72,0.62-1.328C13.841,12.458,13.472,11.862,12.912,11.762zM19.425,11.872c-1.073-0.188-1.687,1.647-0.864,2.586c0.392,0.445,0.738,0.519,1.173,0.247c0.401-0.25,0.62-0.72,0.62-1.328C20.354,12.569,19.985,11.971,19.425,11.872zM16.539,15.484c-0.023,0.074-0.135,0.184-0.248,0.243c-0.286,0.147-0.492,0.096-0.794-0.179c-0.187-0.169-0.272-0.258-0.329-0.081c-0.053,0.164,0.28,0.493,0.537,0.594c0.236,0.094,0.405,0.097,0.661-0.01c0.254-0.106,0.476-0.391,0.476-0.576C16.842,15.303,16.595,15.311,16.539,15.484zM16.222,14.909c0.163-0.144,0.2-0.44,0.044-0.597s-0.473-0.133-0.597,0.043c-0.144,0.206-0.067,0.363,0.036,0.53C15.865,15.009,16.08,15.034,16.222,14.909z");
    }});
draw2d.shape.icon.GitHubAlt = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.GitHubAlt", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M23.356,17.485c-0.004,0.007-0.007,0.013-0.01,0.021l0.162,0.005c0.107,0.004,0.218,0.01,0.33,0.016c-0.046-0.004-0.09-0.009-0.136-0.013L23.356,17.485zM15.5,1.249C7.629,1.25,1.25,7.629,1.249,15.5C1.25,23.371,7.629,29.75,15.5,29.751c7.871-0.001,14.25-6.38,14.251-14.251C29.75,7.629,23.371,1.25,15.5,1.249zM3.771,17.093c0.849-0.092,1.833-0.148,2.791-0.156c0.262,0,0.507-0.006,0.717-0.012c0.063,0.213,0.136,0.419,0.219,0.613H7.492c-0.918,0.031-2.047,0.152-3.134,0.335c-0.138,0.023-0.288,0.051-0.441,0.08C3.857,17.67,3.81,17.383,3.771,17.093zM12.196,22.224c-0.1,0.028-0.224,0.07-0.357,0.117c-0.479,0.169-0.665,0.206-1.15,0.206c-0.502,0.015-0.621-0.019-0.921-0.17C9.33,22.171,8.923,21.8,8.651,21.353c-0.453-0.746-1.236-1.275-1.889-1.275c-0.559,0-0.664,0.227-0.261,0.557c0.608,0.496,1.062,0.998,1.248,1.385c0.105,0.215,0.266,0.546,0.358,0.744c0.099,0.206,0.311,0.474,0.511,0.676c0.472,0.441,0.928,0.659,1.608,0.772c0.455,0.06,0.567,0.06,1.105-0.004c0.26-0.03,0.479-0.067,0.675-0.118v0.771c0,1.049-0.008,1.628-0.031,1.945c-1.852-0.576-3.507-1.595-4.848-2.934c-1.576-1.578-2.706-3.592-3.195-5.848c0.952-0.176,2.073-0.32,3.373-0.43l0.208-0.018c0.398,0.925,1.011,1.631,1.876,2.179c0.53,0.337,1.38,0.685,1.808,0.733c0.118,0.02,0.46,0.09,0.76,0.16c0.302,0.066,0.89,0.172,1.309,0.236h0.009c-0.007,0.018-0.014,0.02-0.022,0.02C12.747,21.169,12.418,21.579,12.196,22.224zM13.732,27.207c-0.168-0.025-0.335-0.056-0.5-0.087c0.024-0.286,0.038-0.785,0.054-1.723c0.028-1.767,0.041-1.94,0.156-2.189c0.069-0.15,0.17-0.32,0.226-0.357c0.095-0.078,0.101,0.076,0.101,2.188C13.769,26.143,13.763,26.786,13.732,27.207zM15.5,27.339c-0.148,0-0.296-0.006-0.443-0.012c0.086-0.562,0.104-1.428,0.106-2.871l0.003-1.82l0.197,0.019l0.199,0.02l0.032,2.365c0.017,1.21,0.027,1.878,0.075,2.296C15.613,27.335,15.558,27.339,15.5,27.339zM17.006,27.24c-0.039-0.485-0.037-1.243-0.027-2.553c0.019-1.866,0.019-1.866,0.131-1.769c0.246,0.246,0.305,0.623,0.305,2.373c0,0.928,0.011,1.497,0.082,1.876C17.334,27.196,17.17,27.22,17.006,27.24zM27.089,17.927c-0.155-0.029-0.307-0.057-0.446-0.08c-0.96-0.162-1.953-0.275-2.804-0.32c1.25,0.108,2.327,0.248,3.246,0.418c-0.479,2.289-1.618,4.33-3.214,5.928c-1.402,1.4-3.15,2.448-5.106,3.008c-0.034-0.335-0.058-1.048-0.066-2.212c-0.03-2.167-0.039-2.263-0.17-2.602c-0.181-0.458-0.47-0.811-0.811-1.055c-0.094-0.057-0.181-0.103-0.301-0.14c0.145-0.02,0.282-0.021,0.427-0.057c1.418-0.188,2.168-0.357,2.772-0.584c1.263-0.492,2.129-1.301,2.606-2.468c0.044-0.103,0.088-0.2,0.123-0.279l0.011,0.001c0.032-0.07,0.057-0.118,0.064-0.125c0.02-0.017,0.036-0.085,0.038-0.151c0-0.037,0.017-0.157,0.041-0.317c0.249,0.01,0.58,0.018,0.938,0.02c0.959,0.008,1.945,0.064,2.794,0.156C27.194,17.356,27.148,17.644,27.089,17.927zM25.823,16.87c-0.697-0.049-1.715-0.064-2.311-0.057c0.02-0.103,0.037-0.218,0.059-0.336c0.083-0.454,0.111-0.912,0.113-1.823c0.002-1.413-0.074-1.801-0.534-2.735c-0.188-0.381-0.399-0.705-0.655-0.998c0.225-0.659,0.207-1.68-0.02-2.575c-0.19-0.734-0.258-0.781-0.924-0.64c-0.563,0.12-1.016,0.283-1.598,0.576c-0.274,0.138-0.652,0.354-0.923,0.522c-0.715-0.251-1.451-0.419-2.242-0.508c-0.799-0.092-2.759-0.04-3.454,0.089c-0.681,0.126-1.293,0.28-1.848,0.462c-0.276-0.171-0.678-0.4-0.964-0.547C9.944,8.008,9.491,7.846,8.925,7.727c-0.664-0.144-0.732-0.095-0.922,0.64c-0.235,0.907-0.237,1.945-0.004,2.603c0.026,0.075,0.043,0.129,0.05,0.17c-0.942,1.187-1.25,2.515-1.046,4.367c0.053,0.482,0.136,0.926,0.251,1.333c-0.602-0.004-1.457,0.018-2.074,0.057c-0.454,0.031-0.957,0.076-1.418,0.129c-0.063-0.5-0.101-1.008-0.101-1.524c0-3.273,1.323-6.225,3.468-8.372c2.146-2.144,5.099-3.467,8.371-3.467c3.273,0,6.226,1.323,8.371,3.467c2.145,2.147,3.468,5.099,3.468,8.372c0,0.508-0.036,1.008-0.098,1.499C26.78,16.946,26.276,16.899,25.823,16.87z");
    }});
draw2d.shape.icon.Raphael = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Raphael", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M27.777,18.941c0.584-0.881,0.896-1.914,0.896-2.998c0-1.457-0.567-2.826-1.598-3.854l-6.91-6.911l-0.003,0.002c-0.985-0.988-2.35-1.6-3.851-1.6c-1.502,0-2.864,0.612-3.85,1.6H12.46l-6.911,6.911c-1.031,1.029-1.598,2.398-1.598,3.854c0,1.457,0.567,2.826,1.598,3.854l6.231,6.229c0.25,0.281,0.512,0.544,0.789,0.785c1.016,0.961,2.338,1.49,3.743,1.49c1.456,0,2.825-0.565,3.854-1.598l6.723-6.725c0.021-0.019,0.034-0.032,0.051-0.051l0.14-0.138c0.26-0.26,0.487-0.54,0.688-0.838c0.004-0.008,0.01-0.015,0.014-0.021L27.777,18.941zM26.658,15.946c0,0.678-0.197,1.326-0.561,1.879c-0.222,0.298-0.447,0.559-0.684,0.784L25.4,18.625c-1.105,1.052-2.354,1.35-3.414,1.35c-0.584,0-1.109-0.09-1.523-0.195c-2.422-0.608-5.056-2.692-6.261-5.732c0.649,0.274,1.362,0.426,2.11,0.426c2.811,0,5.129-2.141,5.415-4.877l3.924,3.925C26.301,14.167,26.658,15.029,26.658,15.946zM16.312,5.6c1.89,0,3.426,1.538,3.426,3.427c0,1.89-1.536,3.427-3.426,3.427c-1.889,0-3.426-1.537-3.426-3.427C12.886,7.138,14.423,5.6,16.312,5.6zM6.974,18.375c-0.649-0.648-1.007-1.512-1.007-2.429c0-0.917,0.357-1.78,1.007-2.428l2.655-2.656c-0.693,2.359-0.991,4.842-0.831,7.221c0.057,0.854,0.175,1.677,0.345,2.46L6.974,18.375zM11.514,11.592c0.583,4.562,4.195,9.066,8.455,10.143c0.693,0.179,1.375,0.265,2.033,0.265c0.01,0,0.02,0,0.027,0l-3.289,3.289c-0.648,0.646-1.512,1.006-2.428,1.006c-0.638,0-1.248-0.177-1.779-0.5l0.001-0.002c-0.209-0.142-0.408-0.295-0.603-0.461c-0.015-0.019-0.031-0.026-0.046-0.043l-0.665-0.664c-1.367-1.567-2.227-3.903-2.412-6.671C10.669,15.856,10.921,13.673,11.514,11.592");
    }});
draw2d.shape.icon.GRaphael = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.GRaphael", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M28.833,15.709c0-1.477-0.574-2.862-1.617-3.904l-7.002-7.001l-0.003,0.002c-1.027-1.03-2.445-1.62-3.9-1.62c-1.455,0-2.871,0.59-3.9,1.621l-0.002-0.002l-7,7C4.376,12.836,3.79,14.25,3.79,15.709s0.586,2.873,1.619,3.902l6.312,6.312c0.253,0.285,0.519,0.556,0.8,0.8c1.049,0.989,2.463,1.534,3.908,1.51c1.417-0.021,2.783-0.604,3.785-1.604l6.812-6.812c0.021-0.021,0.035-0.029,0.062-0.062l0.143-0.146c0.271-0.271,0.484-0.562,0.725-0.86l-0.012-0.002C28.516,17.85,28.833,16.805,28.833,15.709zM18.77,25.17c-1.121,1.119-2.917,1.336-4.271,0.514l0.002-0.002c-0.213-0.145-0.414-0.303-0.61-0.471c-0.016-0.016-7.04-7.041-7.04-7.041c-1.34-1.34-1.342-3.584,0-4.92l7-6.998c1.121-1.121,2.908-1.338,4.259-0.512v0.002c0.213,0.141,0.414,0.299,0.604,0.467c0.021,0.016,7.053,7.043,7.053,7.043c0.396,0.388,0.655,0.852,0.818,1.348l-2.607,0.006c-0.537-3.754-3.769-6.641-7.667-6.641c-4.277,0-7.744,3.468-7.745,7.746c0.001,4.277,3.468,7.744,7.745,7.744c3.917,0,7.156-2.91,7.668-6.688l2.638-0.021c-0.16,0.521-0.441,1.02-0.849,1.412L18.77,25.17zM16.312,16.789c0.002,0,0.002,0,0.004,0l5.476-0.02c-0.5,2.562-2.76,4.518-5.48,4.521c-3.084-0.004-5.578-2.5-5.584-5.582c0.006-3.084,2.5-5.58,5.584-5.584c2.708,0.004,4.959,1.929,5.472,4.484l-5.476,0.018c-0.596,0.002-1.078,0.488-1.076,1.084C15.233,16.308,15.715,16.789,16.312,16.789z");
    }});
draw2d.shape.icon.Svg = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Svg", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M31.274,15.989c0-2.473-2.005-4.478-4.478-4.478l0,0c0.81-0.811,1.312-1.93,1.312-3.167c0-2.474-2.005-4.479-4.479-4.479c-1.236,0-2.356,0.501-3.167,1.312c0-2.473-2.005-4.478-4.478-4.478c-2.474,0-4.479,2.005-4.479,4.478c-0.811-0.81-1.93-1.312-3.167-1.312c-2.474,0-4.479,2.005-4.479,4.479c0,1.236,0.501,2.356,1.312,3.166c-2.474,0-4.479,2.005-4.479,4.479c0,2.474,2.005,4.479,4.479,4.479c-0.811,0.81-1.312,1.93-1.312,3.167c0,2.473,2.005,4.478,4.479,4.478c1.236,0,2.356-0.501,3.167-1.312c0,2.473,2.005,4.479,4.479,4.479c2.473,0,4.478-2.006,4.478-4.479l0,0c0.811,0.811,1.931,1.312,3.167,1.312c2.474,0,4.478-2.005,4.478-4.478c0-1.237-0.501-2.357-1.312-3.168c0.001,0,0.001,0,0.001,0C29.27,20.467,31.274,18.463,31.274,15.989zM23.583,21.211c0.016,0,0.031-0.001,0.047-0.001c1.339,0,2.424,1.085,2.424,2.425c0,1.338-1.085,2.424-2.424,2.424s-2.424-1.086-2.424-2.424c0-0.017,0.001-0.031,0.001-0.047l-3.541-3.542v5.009c0.457,0.44,0.743,1.06,0.743,1.746c0,1.339-1.086,2.424-2.424,2.424c-1.339,0-2.425-1.085-2.425-2.424c0-0.687,0.286-1.306,0.743-1.746v-5.009l-3.541,3.542c0,0.016,0.001,0.031,0.001,0.047c0,1.338-1.085,2.424-2.424,2.424s-2.424-1.086-2.424-2.424c0-1.34,1.085-2.425,2.424-2.425c0.015,0,0.031,0.001,0.046,0.001l3.542-3.541H6.919c-0.44,0.458-1.06,0.743-1.746,0.743c-1.339,0-2.424-1.085-2.424-2.424s1.085-2.424,2.424-2.424c0.686,0,1.305,0.285,1.746,0.744h5.008l-3.542-3.542c-0.015,0-0.031,0.001-0.046,0.001c-1.339,0-2.424-1.085-2.424-2.424S7.001,5.92,8.34,5.92s2.424,1.085,2.424,2.424c0,0.015-0.001,0.031-0.001,0.046l3.541,3.542V6.924c-0.457-0.441-0.743-1.06-0.743-1.746c0-1.339,1.086-2.425,2.425-2.425c1.338,0,2.424,1.085,2.424,2.425c0,0.686-0.286,1.305-0.743,1.746v5.008l3.541-3.542c0-0.015-0.001-0.031-0.001-0.046c0-1.339,1.085-2.424,2.424-2.424s2.424,1.085,2.424,2.424c0,1.339-1.085,2.424-2.424,2.424c-0.016,0-0.031-0.001-0.047-0.001l-3.541,3.542h5.008c0.441-0.458,1.061-0.744,1.747-0.744c1.338,0,2.423,1.085,2.423,2.424s-1.085,2.424-2.423,2.424c-0.687,0-1.306-0.285-1.747-0.743h-5.008L23.583,21.211z");
    }});
draw2d.shape.icon.Usb = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Usb", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M15.5,1.667L13.745,4.74h1.252v15.709L11.8,17.391c-0.205-0.26-0.351-0.601-0.358-0.952c0-1.417-0.001-2.258-0.001-2.568c0.592-0.21,1.02-0.774,1.02-1.444c0-0.849-0.682-1.538-1.521-1.538c-0.84,0-1.521,0.689-1.521,1.538c0,0.67,0.427,1.234,1.019,1.444l-0.001,2.539c0,0.688,0.373,1.409,0.812,1.868c-0.013-0.013-0.027-0.025,0,0c0.011,0.01,3.392,3.245,3.392,3.245c0.205,0.26,0.35,0.6,0.357,0.951v1.776c-1.161,0.236-2.036,1.272-2.036,2.517c0,1.418,1.137,2.566,2.539,2.566c1.403,0,2.54-1.148,2.54-2.566c0-1.244-0.875-2.28-2.038-2.517v-1.746c0-0.005,0-0.009,0-0.014v-3.861c0.008-0.35,0.152-0.689,0.358-0.949c0,0,3.38-3.234,3.392-3.245c0.027-0.026,0.012-0.013,0,0c0.438-0.459,0.811-1.181,0.811-1.869V10.12h1.02V7.046h-3.041v3.075h1.018c0,0-0.002,0.644-0.002,2.476c-0.008,0.351-0.152,0.692-0.357,0.952l-3.198,3.06V4.74h1.254L15.5,1.667z");
    }});
draw2d.shape.icon.Ethernet = draw2d.shape.icon.Icon.extend({NAME: "draw2d.shape.icon.Ethernet", init: function(width, height) {
        this._super(width, height);
    }, createSet: function() {
        return this.canvas.paper.path("M22.5,8.5v3.168l3.832,3.832L22.5,19.332V22.5l7-7L22.5,8.5zM8.5,22.5v-3.168L4.667,15.5L8.5,11.668V8.5l-7,7L8.5,22.5zM15.5,14.101c-0.928,0-1.68,0.751-1.68,1.68c0,0.927,0.752,1.681,1.68,1.681c0.927,0,1.68-0.754,1.68-1.681C17.18,14.852,16.427,14.101,15.5,14.101zM10.46,14.101c-0.928,0-1.68,0.751-1.68,1.68c0,0.927,0.752,1.681,1.68,1.681s1.68-0.754,1.68-1.681C12.14,14.852,11.388,14.101,10.46,14.101zM20.541,14.101c-0.928,0-1.682,0.751-1.682,1.68c0,0.927,0.754,1.681,1.682,1.681s1.68-0.754,1.68-1.681C22.221,14.852,21.469,14.101,20.541,14.101z");
    }});
draw2d.shape.pert.Activity = draw2d.shape.layout.VerticalLayout.extend({NAME: "draw2d.shape.pert.Activity", init: function() {
        this._super();
        var _this = this;
        this.mementoValues = {duration: null};
        this.lighterBgColor = null;
        this.darkerBgColor = null;
        this.setBackgroundColor("#f3f3f3");
        this.setStroke(2);
        this.setColor(this.darkerBgColor);
        this.setRadius(5);
        var top = new draw2d.shape.layout.HorizontalLayout();
        top.setStroke(0);
        this.earlyStartLabel = this.createLabel("Early Start").setStroke(0);
        this.durationLabel = new draw2d.shape.basic.Label("Duration");
        this.durationLabel.setStroke(1);
        this.durationLabel.setColor(this.darkerBgColor);
        this.durationLabel.setRadius(0);
        this.durationLabel.setBackgroundColor(null);
        this.durationLabel.setPadding(5);
        this.durationLabel.setColor(this.bgColor.darker(0.2));
        this.durationLabel.installEditor(new draw2d.ui.LabelEditor({onCommit: function(value) {
                _this.setDuration(parseFloat(value));
            }}));
        this.earlyEndLabel = this.createLabel("Early End").setStroke(0);
        top.addFigure(this.earlyStartLabel);
        top.addFigure(this.durationLabel);
        top.addFigure(this.earlyEndLabel);
        this.activityLabel = new draw2d.shape.basic.Label("Activity Name");
        this.activityLabel.setRadius(0);
        this.activityLabel.setPadding(10);
        this.activityLabel.setColor(this.darkerBgColor);
        this.activityLabel.setBackgroundColor(null);
        this.activityLabel.installEditor(new draw2d.ui.LabelInplaceEditor());
        this.inputPort = this.activityLabel.createPort("input");
        this.inputPort.getActivity = function() {
            return _this;
        };
        this.inputPort.onConnect = function() {
            _this.setDuration(_this.mementoValues.duration);
        };
        this.inputPort.onDisconnect = function() {
            _this.setDuration(_this.mementoValues.duration);
        };
        this.inputPort.setValue = function(anyValue) {
            _this.setDuration(_this.mementoValues.duration);
        };
        this.outputPort = this.activityLabel.createPort("output");
        this.outputPort.getActivity = function() {
            return _this;
        };
        this.outputPort.onConnect = function() {
            _this.setDuration(_this.mementoValues.duration);
        };
        this.outputPort.onDisconnect = function() {
            _this.setDuration(_this.mementoValues.duration);
        };
        var bottom = new draw2d.shape.layout.HorizontalLayout();
        bottom.setStroke(0);
        this.lateStartLabel = this.createLabel("Late Start").setStroke(0);
        this.stackLabel = this.createLabel("Stack");
        this.lateEndLabel = this.createLabel("Late End").setStroke(0);
        bottom.addFigure(this.lateStartLabel);
        bottom.addFigure(this.stackLabel);
        bottom.addFigure(this.lateEndLabel);
        this.addFigure(top);
        this.addFigure(this.activityLabel);
        this.addFigure(bottom);
        this.setDuration(1);
    }, setDuration: function(duration) {
        if (this.mementoValues.duration !== duration) {
            this.mementoValues.duration = duration;
            this.durationLabel.setText(this.mementoValues.duration);
        }
        var start = this.getEarlyStart();
        this.earlyStartLabel.setText(start);
        this.earlyEndLabel.setText(start + this.mementoValues.duration);
        var connections = this.outputPort.getConnections();
        connections.each(jQuery.proxy(function(i, conn) {
            var targetPort = conn.getTarget();
            targetPort.setValue();
        }, this));
        if (connections.getSize() === 0) {
            var lateFinish = parseFloat(this.earlyEndLabel.getText());
            this.setLateFinish(lateFinish);
        }
    }, getEarlyEnd: function() {
        return this.getEarlyStart() + this.mementoValues.duration;
    }, getEarlyStart: function() {
        var latestEarlyEnd = 0;
        this.inputPort.getConnections().each(function(i, conn) {
            var parentActivity = conn.getSource().getActivity();
            latestEarlyEnd = Math.max(latestEarlyEnd, parentActivity.getEarlyEnd());
        });
        return latestEarlyEnd;
    }, setLateFinish: function(value) {
        var lateStart = value - this.mementoValues.duration;
        this.lateEndLabel.setText(value);
        this.lateStartLabel.setText(lateStart);
        this.stackLabel.setText(lateStart - parseFloat(this.earlyStartLabel.getText()));
        var connections = this.inputPort.getConnections();
        connections.each(jQuery.proxy(function(i, conn) {
            var sourcePort = conn.getSource();
            sourcePort.getActivity().setLateFinish(lateStart);
        }, this));
    }, createLabel: function(txt) {
        var label = new draw2d.shape.basic.Label(txt);
        label.setStroke(1);
        label.setColor(this.darkerBgColor);
        label.setRadius(0);
        label.setBackgroundColor(null);
        label.setPadding(5);
        label.setColor(this.bgColor.darker(0.2));
        label.onDoubleClick = function(angle) {
        };
        return label;
    }, setBackgroundColor: function(color) {
        this._super(color);
        this.lighterBgColor = this.bgColor.lighter(0.2).hash();
        this.darkerBgColor = this.bgColor.darker(0.2).hash();
    }, repaint: function(attributes) {
        if (this.repaintBlocked === true || this.shape === null) {
            return;
        }
        if (typeof attributes === "undefined") {
            attributes = {};
        }
        if (this.getAlpha() < 0.9) {
            attributes.fill = this.bgColor.hash();
        } else {
            attributes.fill = ["90", this.bgColor.hash(), this.lighterBgColor].join("-");
        }
        this._super(attributes);
    }});
draw2d.shape.state.Start = draw2d.shape.basic.Circle.extend({NAME: "draw2d.shape.state.Start", DEFAULT_COLOR: new draw2d.util.Color("#3369E8"), init: function() {
        this._super();
        this.port = this.createPort("output", new draw2d.layout.locator.BottomLocator(this));
        this.port.setConnectionAnchor(new draw2d.layout.anchor.ShortesPathConnectionAnchor(this.port));
        this.setDimension(50, 50);
        this.setBackgroundColor(this.DEFAULT_COLOR);
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());
        this.setStroke(0);
        var label = new draw2d.shape.basic.Label("START");
        label.setStroke(0);
        label.setFontColor("#ffffff");
        label.setFontFamily('"Open Sans",sans-serif');
        this.addFigure(label, new draw2d.layout.locator.CenterLocator(this));
    }});
draw2d.shape.state.End = draw2d.shape.basic.Circle.extend({NAME: "draw2d.shape.state.End", DEFAULT_COLOR: new draw2d.util.Color("#4D90FE"), init: function() {
        this.innerCircle = new draw2d.shape.basic.Circle(20);
        this._super();
        this.port = this.createPort("input", new draw2d.layout.locator.TopLocator(this));
        this.port.setConnectionAnchor(new draw2d.layout.anchor.ShortesPathConnectionAnchor(this.port));
        this.setDimension(50, 50);
        this.setBackgroundColor(this.DEFAULT_COLOR);
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());
        this.innerCircle.setStroke(2);
        this.innerCircle.setBackgroundColor(null);
        this.addFigure(this.innerCircle, new draw2d.layout.locator.CenterLocator(this));
        this.setStroke(0);
    }, setDimension: function(w, h) {
        this._super(w, h);
        this.innerCircle.setDimension(this.getWidth() - 10, this.getHeight() - 10);
    }});
draw2d.shape.state.State = draw2d.shape.layout.VerticalLayout.extend({NAME: "draw2d.shape.state.State", init: function() {
        this._super();
        this.port = this.createPort("hybrid", new draw2d.layout.locator.BottomLocator(this));
        this.port.setConnectionAnchor(new draw2d.layout.anchor.ChopboxConnectionAnchor(this.port));
        this.setBackgroundColor("#f3f3f3");
        this.setStroke(1);
        this.setColor("#e0e0e0");
        this.setRadius(5);
        var top = this.createLabel("State").setStroke(0);
        this.label = top;
        var center = new draw2d.shape.basic.Rectangle();
        center.getHeight = function() {
            return 1;
        };
        center.setMinWidth(90);
        center.setColor("#e0e0e0");
        var bottom = new draw2d.shape.basic.Rectangle();
        bottom.setMinHeight(30);
        bottom.setStroke(0);
        bottom.setBackgroundColor(null);
        this.addFigure(top);
        this.addFigure(center);
        this.addFigure(bottom);
    }, setLabel: function(text) {
        this.label.setText(text);
        return this;
    }, getLabel: function() {
        return this.label.getText();
    }, createLabel: function(txt) {
        var label = new draw2d.shape.basic.Label(txt);
        label.setStroke(1);
        label.setColor(this.darkerBgColor);
        label.setRadius(0);
        label.setBackgroundColor(null);
        label.setPadding(5);
        label.setColor(this.bgColor.darker(0.2));
        label.onDoubleClick = function(angle) {
        };
        return label;
    }, getPersistentAttributes: function() {
        var memento = this._super();
        memento.label = this.getLabel();
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);
        if (typeof memento.label !== "undefined") {
            this.setLabel(memento.label);
        }
    }});
draw2d.shape.state.Connection = draw2d.Connection.extend({NAME: "draw2d.shape.state.Connection", DEFAULT_COLOR: new draw2d.util.Color("#4D90FE"), init: function() {
        this._super();
        this.setRouter(draw2d.shape.state.Connection.DEFAULT_ROUTER);
        this.setStroke(2);
        this.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator(17, 8));
        this.label = new draw2d.shape.basic.Label("label");
        this.label.setStroke(1);
        this.label.setPadding(2);
        this.label.setBackgroundColor("#f0f0f0");
        this.addFigure(this.label, new draw2d.layout.locator.PolylineMidpointLocator(this));
    }, setLabel: function(text) {
        this.label.setText(text);
        this.label.setVisible(!(text === null || text === ""));
        return this;
    }, getLabel: function() {
        return this.label.getText();
    }, getPersistentAttributes: function() {
        var memento = this._super();
        memento.label = this.getLabel();
        return memento;
    }, setPersistentAttributes: function(memento) {
        this._super(memento);
        if (typeof memento.label !== "undefined") {
            this.setLabel(memento.label);
        }
    }});
draw2d.shape.state.Connection.DEFAULT_ROUTER = new draw2d.layout.connection.FanConnectionRouter();
draw2d.ui.LabelEditor = Class.extend({init: function(listener) {
        this.listener = jQuery.extend({onCommit: function() {
            }, onCancel: function() {
            }}, listener);
    }, start: function(label) {
        var newText = prompt("Label: ", label.getText());
        if (newText) {
            label.setText(newText);
            this.listener.onCommit(label.getText());
        } else {
            this.listener.onCancel();
        }
    }});
draw2d.ui.LabelInplaceEditor = draw2d.ui.LabelEditor.extend({init: function(listener) {
        this._super();
        this.listener = jQuery.extend({onCommit: function() {
            }, onCancel: function() {
            }}, listener);
    }, start: function(label) {
        this.label = label;
        this.commitCallback = jQuery.proxy(this.commit, this);
        jQuery("body").bind("click", this.commitCallback);
        this.html = jQuery('<input id="inplaceeditor">');
        this.html.val(label.getText());
        this.html.hide();
        jQuery("body").append(this.html);
        this.html.autoResize({animate: false});
        this.html.bind("keyup", jQuery.proxy(function(e) {
            switch (e.which) {
                case 13:
                    this.commit();
                    break;
                case 27:
                    this.cancel();
                    break;
            }
        }, this));
        this.html.bind("blur", this.commitCallback);
        this.html.bind("click", function(e) {
            e.stopPropagation();
            e.preventDefault();
        });
        var canvas = this.label.getCanvas();
        var bb = this.label.getBoundingBox();
        bb.setPosition(canvas.fromCanvasToDocumentCoordinate(bb.x, bb.y));
        var scrollDiv = canvas.getScrollArea();
        if (scrollDiv.is(jQuery("body"))) {
            bb.translate(canvas.getScrollLeft(), canvas.getScrollTop());
        }
        bb.translate(-1, -1);
        bb.resize(2, 2);
        this.html.css({position: "absolute", top: bb.y, left: bb.x, "min-width": bb.w, height: bb.h});
        this.html.fadeIn(jQuery.proxy(function() {
            this.html.focus();
        }, this));
    }, commit: function() {
        this.html.unbind("blur", this.commitCallback);
        jQuery("body").unbind("click", this.commitCallback);
        var label = this.html.val();
        this.label.setText(label);
        this.html.fadeOut(jQuery.proxy(function() {
            this.html.remove();
            this.html = null;
            this.listener.onCommit(this.label.getText());
        }, this));
    }, cancel: function() {
        this.html.unbind("blur", this.commitCallback);
        jQuery("body").unbind("click", this.commitCallback);
        this.html.fadeOut(jQuery.proxy(function() {
            this.html.remove();
            this.html = null;
            this.listener.onCancel();
        }, this));
    }});
draw2d.decoration.connection.Decorator = Class.extend({NAME: "draw2d.decoration.connection.Decorator", init: function(width, height) {
        if (typeof width === "undefined" || width < 1) {
            this.width = 20;
        } else {
            this.width = width;
        }
        if (typeof height === "undefined" || height < 1) {
            this.height = 15;
        } else {
            this.height = height;
        }
        this.color = new draw2d.util.Color(0, 0, 0);
        this.backgroundColor = new draw2d.util.Color(250, 250, 250);
    }, paint: function(paper) {
    }, setColor: function(c) {
        this.color = new draw2d.util.Color(c);
        return this;
    }, setBackgroundColor: function(c) {
        this.backgroundColor = new draw2d.util.Color(c);
        return this;
    }, setDimension: function(width, height) {
        this.width = width;
        this.height = height;
        return this;
    }});
draw2d.decoration.connection.ArrowDecorator = draw2d.decoration.connection.Decorator.extend({NAME: "draw2d.decoration.connection.ArrowDecorator", init: function(width, height) {
        this._super(width, height);
    }, paint: function(paper) {
        var st = paper.set();
        st.push(paper.path(["M0 0", "L", this.width, " ", -this.height / 2, "L", this.width, " ", this.height / 2, "L0 0"].join("")));
        st.attr({fill: this.backgroundColor.hash(), stroke: this.color.hash()});
        return st;
    }});
draw2d.decoration.connection.DiamondDecorator = draw2d.decoration.connection.Decorator.extend({NAME: "draw2d.decoration.connection.DiamondDecorator", init: function(width, height) {
        this._super(width, height);
    }, paint: function(paper) {
        var st = paper.set();
        st.push(paper.path(["M", this.width / 2, " ", -this.height / 2, "L", this.width, " ", 0, "L", this.width / 2, " ", this.height / 2, "L", 0, " ", 0, "L", this.width / 2, " ", -this.height / 2, "Z"].join("")));
        st.attr({fill: this.backgroundColor.hash(), stroke: this.color.hash()});
        return st;
    }});
draw2d.decoration.connection.CircleDecorator = draw2d.decoration.connection.Decorator.extend({NAME: "draw2d.decoration.connection.CircleDecorator", init: function(width, height) {
        this._super(width, height);
    }, paint: function(paper) {
        var shape = paper.circle(0, 0, this.width / 2);
        shape.attr({fill: this.backgroundColor.hash(), stroke: this.color.hash()});
        return shape;
    }});
draw2d.decoration.connection.BarDecorator = draw2d.decoration.connection.Decorator.extend({NAME: "draw2d.decoration.connection.BarDecorator", init: function(width, height) {
        this._super(width, height);
    }, paint: function(paper) {
        var st = paper.set();
        var path = ["M", this.width / 2, " ", -this.height / 2];
        path.push("L", this.width / 2, " ", this.height / 2);
        st.push(paper.path(path.join("")));
        st.attr({fill: this.backgroundColor.hash(), stroke: this.color.hash()});
        return st;
    }});
draw2d.io.Reader = Class.extend({init: function() {
    }, unmarshal: function(canvas, document) {
    }});
draw2d.io.Writer = Class.extend({init: function() {
    }, marshal: function(canvas) {
        return"";
    }, formatXml: function(xml) {
        var formatted = "";
        var reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, "$1\r\n$2$3");
        var pad = 0;
        jQuery.each(xml.split("\r\n"), function(index, node) {
            var indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else {
                if (node.match(/^<\/\w/)) {
                    if (pad != 0) {
                        pad -= 1;
                    }
                } else {
                    if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                        indent = 1;
                    } else {
                        indent = 0;
                    }
                }
            }
            var padding = "";
            for (var i = 0; i < pad; i++) {
                padding += "  ";
            }
            formatted += padding + node + "\r\n";
            pad += indent;
        });
        return formatted;
    }});
draw2d.io.svg.Writer = draw2d.io.Writer.extend({init: function() {
        this._super();
    }, marshal: function(canvas) {
        var s = canvas.getCurrentSelection();
        canvas.setCurrentSelection(null);
        var svg = canvas.getHtmlContainer().html().replace(/>\s+/g, ">").replace(/\s+</g, "<");
        svg = this.formatXml(svg);
        svg = svg.replace(/<desc>.*<\/desc>/g, "<desc>Create with draw2d JS graph library and RaphaelJS</desc>");
        canvas.setCurrentSelection(s);
        return svg;
    }});
draw2d.io.png.Writer = draw2d.io.Writer.extend({init: function() {
        this._super();
    }, marshal: function(canvas) {
        var svg = canvas.getHtmlContainer().html().replace(/>\s+/g, ">").replace(/\s+</g, "<");
        svg = svg.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, "");
        svg = svg.replace("<image", '<image xmlns:xlink="http://www.w3.org/1999/xlink" ');
        var canvasDomNode = jQuery('<canvas id="canvas" width="1000px" height="600px"></canvas>');
        jQuery("body").append(canvasDomNode);
        canvg("canvas", svg, {ignoreMouse: true, ignoreAnimation: true});
        var img = document.getElementById("canvas").toDataURL("image/png");
        canvasDomNode.remove();
        return img;
    }});
draw2d.io.json.Writer = draw2d.io.Writer.extend({init: function() {
        this._super();
    }, marshal: function(canvas) {
        var result = [];
        var figures = canvas.getFigures();
        var i = 0;
        var f = null;
        for (i = 0; i < figures.getSize(); i++) {
            f = figures.get(i);
            result.push(f.getPersistentAttributes());
        }
        var lines = canvas.getLines();
        lines.each(function(i, element) {
            result.push(element.getPersistentAttributes());
        });
        return result;
    }});
draw2d.io.json.Reader = draw2d.io.Reader.extend({init: function() {
        this._super();
    }, unmarshal: function(canvas, json) {
        var node = null;
        jQuery.each(json, function(i, element) {
            var o = eval("new " + element.type + "()");
            var source = null;
            var target = null;
            for (i in element) {
                var val = element[i];
                if (i === "source") {
                    node = canvas.getFigure(val.node);
                    source = node.getPort(val.port);
                } else {
                    if (i === "target") {
                        node = canvas.getFigure(val.node);
                        target = node.getPort(val.port);
                    }
                }
            }
            if (source !== null && target !== null) {
                o.setSource(source);
                o.setTarget(target);
            } else {
                console.log("null target or source");
                if(element.type === "draw2d.Connection") {
                    console.log("Skipping broken connection");
                    return false;
                }
            }
            o.setPersistentAttributes(element);
            canvas.addFigure(o);
        });
        canvas.calculateConnectionIntersection();
        canvas.getLines().each(function(i, line) {
            line.svgPathString = null;
            line.repaint();
        });
        canvas.linesToRepaintAfterDragDrop = canvas.getLines().clone();
    }});
document.ontouchmove = function(e) {
    e.preventDefault();
};
document.oncontextmenu = function() {
    return false;
};
(function() {
    Raphael.fn.group = function(f, g) {
        var enabled = document.getElementsByTagName("svg").length > 0;
        if (!enabled) {
            return{add: function() {
                }};
        }
        var i;
        this.svg = "http://www.w3.org/2000/svg";
        this.defs = document.getElementsByTagName("defs")[f];
        this.svgcanv = document.getElementsByTagName("svg")[f];
        this.group = document.createElementNS(this.svg, "g");
        for (i = 0; i < g.length; i++) {
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
            for (i = 0; i < a.length; i++) {
                if (a[i].substring(0, 1) == "t") {
                    var d = a[i], b = [];
                    b = d.split("(");
                    d = b[1].substring(0, b[1].length - 1);
                    b = [];
                    b = d.split(",");
                    e = b.length === 0 ? {x: 0, y: 0} : {x: b[0], y: b[1]};
                } else {
                    if (a[i].substring(0, 1) === "r") {
                        d = a[i];
                        b = d.split("(");
                        d = b[1].substring(0, b[1].length - 1);
                        b = d.split(",");
                        h = b.length === 0 ? {x: 0, y: 0, z: 0} : {x: b[0], y: b[1], z: b[2]};
                    } else {
                        if (a[i].substring(0, 1) === "s") {
                            d = a[i];
                            b = d.split("(");
                            d = b[1].substring(0, b[1].length - 1);
                            b = d.split(",");
                            j = b.length === 0 ? {x: 1, y: 1} : {x: b[0], y: b[1]};
                        }
                    }
                }
            }
            if (typeof e === "undefined") {
                e = {x: 0, y: 0};
            }
            if (typeof h === "undefined") {
                h = {x: 0, y: 0, z: 0};
            }
            if (typeof j === "undefined") {
                j = {x: 1, y: 1};
            }
            if (c == "translate") {
                var k = e;
            } else {
                if (c == "rotate") {
                    k = h;
                } else {
                    if (c == "scale") {
                        k = j;
                    }
                }
            }
            return k;
        };
        this.group.copy = function(el) {
            this.copy = el.node.cloneNode(true);
            this.appendChild(this.copy);
        };
        return this.group;
    };
})();
Math.sign = function() {
    if (this < 0) {
        return -1;
    }
    return 1;
};
