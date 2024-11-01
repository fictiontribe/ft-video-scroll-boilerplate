"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var throttle_1 = __importDefault(require("lodash/throttle"));
var kinet_1 = __importDefault(require("kinet"));
var helpers_1 = require("./helpers");
var Magnetic_1 = __importDefault(require("./Magnetic"));
var Blobity = /** @class */ (function () {
    function Blobity(options) {
        var _this = this;
        this.options = {
            color: 'rgb(180, 180, 180)',
            opacity: 1,
            licenseKey: null,
            size: 40,
            focusableElements: '[data-blobity], a:not([data-no-blobity]), button:not([data-no-blobity]), [data-blobity-tooltip]',
            focusableElementsOffsetX: 0,
            focusableElementsOffsetY: 0,
            zIndex: -1,
            invert: false,
            dotColor: null,
            dotSize: 8,
            magnetic: true,
            mode: 'normal',
            radius: 4,
            font: 'sans-serif',
            fontWeight: 400,
            fontSize: 40,
            fontColor: '#000000',
            tooltipPadding: 12,
            kineticMorphing: true,
        };
        this.initialized = false;
        this.color = { r: 0, g: 0, b: 0 };
        this.fontColor = { r: 0, g: 0, b: 0 };
        this.stickedToElement = null;
        this.sticketToElementTooltip = null;
        this.disablingStickedToElementTimeout = null;
        this.isActive = true;
        this.destroyed = false;
        this.currentMagnetic = null;
        this.kinetPresets = {
            normal: {
                acceleration: 0.1,
                friction: 0.35,
            },
            bouncy: {
                acceleration: 0.1,
                friction: 0.28,
            },
            slow: {
                acceleration: 0.06,
                friction: 0.35,
            },
        };
        this.lastKnownCoordinates = { x: 0, y: 0 };
        this.currentOffsetX = 0;
        this.currentOffsetY = 0;
        this.manuallySetFocusedElement = null;
        this.manuallySetTooltipText = null;
        this.disableTimeStamp = new Date().getTime();
        this.reduceMotionSetting = false;
        this.kinetDefaultMethod = 'animate';
        this.updateOptions = function (newOptions) {
            _this.options = __assign(__assign({}, _this.options), newOptions);
            if (Array.isArray(_this.options.color)) {
                _this.color = _this.options.color.map(function (color) { return helpers_1.convertColor(color); });
            }
            else {
                _this.color = helpers_1.convertColor(_this.options.color);
            }
            _this.fontColor = helpers_1.convertColor(_this.options.fontColor);
            if (_this.options.invert) {
                _this.color = helpers_1.convertColor('rgb(255, 255, 255)');
            }
            if (_this.options.dotColor) {
                if (_this.globalStyles) {
                    document.head.removeChild(_this.globalStyles);
                    _this.globalStyles = undefined;
                }
                if (!_this.globalStyles) {
                    var dot = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + _this.options.dotSize + "\" height=\"" + _this.options.dotSize + "\"\n                viewBox=\"0 0 8 8\"><circle cx=\"4\" cy=\"4\" r=\"4\" fill-rule=\"evenodd\" fill=\"" + _this.options.dotColor + "\"/></svg>";
                    _this.globalStyles = document.createElement('style');
                    _this.globalStyles.setAttribute('data-blobity-global-styles', '');
                    _this.globalStyles.appendChild(document.createTextNode('* {cursor: inherit}'));
                    _this.globalStyles.appendChild(document.createTextNode("html { cursor: url(data:image/svg+xml;base64," + btoa(dot) + ") " + _this.options.dotSize / 2 + " " + _this.options.dotSize / 2 + ", auto;}"));
                    document.head.appendChild(_this.globalStyles);
                }
            }
            else {
                if (_this.globalStyles) {
                    document.head.removeChild(_this.globalStyles);
                }
                _this.globalStyles = undefined;
            }
            _this.canvas.style.cssText = "\n            position: fixed;\n            z-index: -1;\n            top: 0;\n            left: 0;\n            pointer-events: none;\n            opacity: 1;\n            will-change: transform;\n            overflow: visible;\n            opacity: " + _this.options.opacity + "; \n            z-index: " + (_this.options.invert ? 2147483647 : _this.options.zIndex) + "; \n            " + (_this.options.invert && 'mix-blend-mode: difference') + ";\n        ";
            _this.currentOffsetX = _this.options.focusableElementsOffsetX;
            _this.currentOffsetY = _this.options.focusableElementsOffsetY;
            _this.resize();
            if (_this.kinetInstance) {
                Object.entries(_this.kinetInstance._instances)
                    .filter(function (_a) {
                        var _b = __read(_a, 1), name = _b[0];
                        return name !== 'scale';
                    })
                    .forEach(function (_a) {
                        var _b = __read(_a, 2), instance = _b[1];
                        instance._friction =
                            1 - _this.kinetPresets[_this.options.mode].friction;
                        instance._acceleration =
                            _this.kinetPresets[_this.options.mode].acceleration;
                    });
                if (!_this.stickedToElement && !_this.sticketToElementTooltip) {
                    if (newOptions.radius !== undefined) {
                        _this.kinetInstance[_this.kinetDefaultMethod]('radius', _this.options.radius);
                    }
                    _this.kinetInstance[_this.kinetDefaultMethod]('width', _this.options.size);
                    _this.kinetInstance[_this.kinetDefaultMethod]('height', _this.options.size);
                    _this.kinetInstance[_this.kinetDefaultMethod]('x', _this.lastKnownCoordinates.x - _this.options.size / 2);
                    _this.kinetInstance[_this.kinetDefaultMethod]('y', _this.lastKnownCoordinates.y - _this.options.size / 2);
                }
            }
        };
        this.destroy = function () {
            if (_this.destroyed) {
                return;
            }
            window.removeEventListener('resize', _this.resize);
            window.removeEventListener('mousemove', _this.throttledMouseMove);
            document.removeEventListener('mouseenter', _this.windowMouseEnter);
            document.removeEventListener('mouseleave', _this.windowMouseLeave);
            document.removeEventListener('mouseover', _this.focusableElementMouseEnter);
            document.removeEventListener('mouseout', _this.focusableElementMouseLeave);
            document.removeEventListener('touchstart', _this.disable);
            document.removeEventListener('touchend', _this.disable);
            document.removeEventListener('mousemove', _this.enable);
            _this.prefersReducedMotionMediaQuery.removeEventListener('change', _this.updatePrefersReducedMotionSetting);
            document.body.removeChild(_this.canvas);
            document.documentElement.style.cursor = '';
            if (_this.globalStyles) {
                document.head.removeChild(_this.globalStyles);
            }
            _this.destroyed = true;
        };
        this.disable = function () {
            // sometimes we can have false positive enable called right after
            // so we save the time here so we can prevent it in enable method
            _this.disableTimeStamp = new Date().getTime();
            _this.isActive = false;
            _this.clear();
        };
        this.enable = function () {
            var disableAge = new Date().getTime() - _this.disableTimeStamp;
            if (disableAge > 16) {
                // let's take one cca frame as a limit
                _this.isActive = true;
            }
        };
        this.updatePrefersReducedMotionSetting = function () {
            _this.reduceMotionSetting = _this.prefersReducedMotionMediaQuery.matches;
            _this.kinetDefaultMethod = _this.reduceMotionSetting ? 'set' : 'animate';
        };
        this.focusElement = function (element) {
            _this.manuallySetTooltipText = null;
            _this.manuallySetFocusedElement = element;
            _this.highlightElement(element);
        };
        this.showTooltip = function (text) {
            _this.manuallySetFocusedElement = null;
            _this.manuallySetTooltipText = text;
            _this.displayTooltip(text, _this.lastKnownCoordinates.x, _this.lastKnownCoordinates.y);
        };
        this.reset = function () {
            _this.manuallySetFocusedElement = null;
            _this.manuallySetTooltipText = null;
            if (_this.activeTooltip) {
                _this.displayTooltip(_this.activeTooltip, _this.lastKnownCoordinates.x, _this.lastKnownCoordinates.y);
                return;
            }
            if (_this.activeFocusedElement) {
                _this.highlightElement(_this.activeFocusedElement);
                return;
            }
            _this.resetMorph(_this.lastKnownCoordinates.x - _this.options.size / 2, _this.lastKnownCoordinates.y - _this.options.size / 2);
        };
        this.focusableElementMouseEnter = function (event) {
            if (_this.isActive && event.target) {
                var element_1 = event.target.closest(_this.options.focusableElements);
                if (element_1) {
                    _this.stickedToElement = element_1;
                    var tooltip = element_1.getAttribute('data-blobity-tooltip');
                    if (element_1 && tooltip != undefined) {
                        _this.sticketToElementTooltip = tooltip;
                    }
                    _this.currentOffsetX = element_1.getAttribute('data-blobity-offset-x')
                        ? parseInt(String(element_1.getAttribute('data-blobity-offset-x')))
                        : _this.options.focusableElementsOffsetX;
                    _this.currentOffsetY = element_1.getAttribute('data-blobity-offset-y')
                        ? parseInt(String(element_1.getAttribute('data-blobity-offset-y')))
                        : _this.options.focusableElementsOffsetY;
                    _this.stickedToElementMutationObserver.observe(document.body, {
                        childList: true,
                        subtree: true,
                    });
                    var magnetic = element_1.getAttribute('data-blobity-magnetic');
                    if (!_this.reduceMotionSetting) {
                        if (magnetic === 'true' ||
                            (_this.options.magnetic && magnetic !== 'false')) {
                            _this.currentMagnetic = new Magnetic_1.default(element_1);
                            _this.currentMagnetic.onTick = function () {
                                if (!_this.activeTooltip &&
                                    _this.activeFocusedElement === element_1) {
                                    var _a = element_1.getBoundingClientRect(), width = _a.width, height = _a.height, x = _a.x, y = _a.y;
                                    var radius = element_1.getAttribute('data-blobity-radius');
                                    _this.kinetInstance[_this.kinetDefaultMethod]('textOpacity', 0);
                                    _this.morph({
                                        width: width + _this.currentOffsetX * 2,
                                        height: height + _this.currentOffsetY * 2,
                                        x: x - _this.currentOffsetX,
                                        y: y - _this.currentOffsetY,
                                    }, radius != undefined
                                        ? parseInt(radius)
                                        : _this.options.radius);
                                }
                            };
                        }
                    }
                }
            }
        };
        this.focusableElementMouseLeave = function (event) {
            if (event.target) {
                var element = event.target.closest(_this.options.focusableElements);
                if (element) {
                    _this.resetStickedToElement();
                    _this.resetStickedToElementMutationObserver();
                    _this.currentOffsetX = _this.options.focusableElementsOffsetX;
                    _this.currentOffsetY = _this.options.focusableElementsOffsetY;
                    _this.resetMagnetic();
                    _this.resetMorph(event.clientX, event.clientY);
                }
            }
        };
        this.mouseDown = function () {
            _this.kinetInstance[_this.kinetDefaultMethod]('scale', 97);
        };
        this.mouseUp = function () {
            _this.bounce();
        };
        this.windowMouseEnter = function () {
            _this.kinetInstance[_this.kinetDefaultMethod]('opacity', 1);
        };
        this.windowMouseLeave = function () {
            _this.kinetInstance[_this.kinetDefaultMethod]('opacity', 0);
        };
        this.highlightElement = function (element) {
            var _a = element.getBoundingClientRect(), width = _a.width, height = _a.height, x = _a.x, y = _a.y;
            var radius = element.getAttribute('data-blobity-radius');
            _this.kinetInstance[_this.kinetDefaultMethod]('textOpacity', 0);
            _this.morph({
                width: width + _this.currentOffsetX * 2,
                height: height + _this.currentOffsetY * 2,
                x: x - _this.currentOffsetX,
                y: y - _this.currentOffsetY,
            }, radius != undefined ? parseInt(radius) : _this.options.radius);
        };
        this.displayTooltip = function (text, x, y) {
            _this.ctx.font = _this.options.fontWeight + " " + _this.options.fontSize + "px " + _this.options.font;
            _this.ctx.textBaseline = 'bottom';
            _this.ctx.textAlign = 'left';
            var _a = _this.ctx.measureText(text), actualBoundingBoxAscent = _a.actualBoundingBoxAscent, width = _a.width;
            var padding = _this.options.tooltipPadding * 2;
            _this.kinetInstance[_this.kinetDefaultMethod]('textOpacity', 100);
            _this.morph({
                x: x + 6,
                y: y + 6,
                width: width + padding,
                height: actualBoundingBoxAscent + padding,
            }, 4);
        };
        this.mouseMove = function (event) {
            if (_this.initialized) {
                _this.lastKnownCoordinates = {
                    x: event.clientX,
                    y: event.clientY,
                };
                if (_this.activeTooltip) {
                    _this.displayTooltip(_this.activeTooltip, event.clientX, event.clientY);
                }
                else if (_this.activeFocusedElement) {
                    _this.highlightElement(_this.activeFocusedElement);
                }
                else {
                    _this.kinetInstance[_this.kinetDefaultMethod]('textOpacity', 0);
                    _this.kinetInstance[_this.kinetDefaultMethod]('x', event.clientX - _this.options.size / 2);
                    _this.kinetInstance[_this.kinetDefaultMethod]('y', event.clientY - _this.options.size / 2);
                    _this.kinetInstance[_this.kinetDefaultMethod]('width', _this.options.size);
                    _this.kinetInstance[_this.kinetDefaultMethod]('height', _this.options.size);
                    _this.kinetInstance[_this.kinetDefaultMethod]('radius', _this.options.size / 2);
                }
            }
            else {
                _this.initialized = true;
                _this.kinetInstance.set('x', event.clientX - _this.options.size / 2);
                _this.kinetInstance.set('y', event.clientY - _this.options.size / 2);
                _this.kinetInstance[_this.kinetDefaultMethod]('opacity', 1);
            }
        };
        this.resetMorph = function (x, y) {
            _this.disablingStickedToElementTimeout = setTimeout(function () {
                _this.kinetInstance[_this.kinetDefaultMethod]('width', _this.options.size);
                _this.kinetInstance[_this.kinetDefaultMethod]('height', _this.options.size);
                _this.kinetInstance[_this.kinetDefaultMethod]('radius', _this.options.size / 2);
                _this.kinetInstance[_this.kinetDefaultMethod]('x', x);
                _this.kinetInstance[_this.kinetDefaultMethod]('y', y);
            });
        };
        this.clear = function () {
            _this.ctx.resetTransform();
            _this.ctx.rotate(0);
            _this.ctx.clearRect(-20, -20, window.innerWidth * window.devicePixelRatio + 20, window.innerHeight * window.devicePixelRatio + 20);
        };
        this.resize = function () {
            _this.ctx.canvas.style.width = window.innerWidth + "px";
            _this.ctx.canvas.style.height = window.innerHeight + "px";
            _this.ctx.canvas.width = window.innerWidth * window.devicePixelRatio;
            _this.ctx.canvas.height = window.innerHeight * window.devicePixelRatio;
            if (window.devicePixelRatio > 1) {
                _this.ctx.imageSmoothingEnabled = false;
            }
        };
        this.resetStickedToElement = function () {
            _this.stickedToElement = null;
            _this.sticketToElementTooltip = null;
        };
        this.resetStickedToElementMutationObserver = function () {
            _this.stickedToElementMutationObserver.disconnect();
        };
        this.resetMagnetic = function () {
            if (_this.currentMagnetic) {
                _this.currentMagnetic.destroy();
                _this.currentMagnetic.onTick = null;
                _this.currentMagnetic = null;
            }
        };
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.updateOptions(__assign({}, options));
        if (!this.options.licenseKey) {
            // console.warn('Valid license number for Blobity is required. You can get one at https://blobity.gmrchk.com.');
        }
        this.kinetInstance = new kinet_1.default({
            names: [
                'x',
                'y',
                'opacity',
                'textOpacity',
                'width',
                'height',
                'radius',
                'scale',
            ],
            acceleration: this.kinetPresets[this.options.mode].acceleration,
            friction: this.kinetPresets[this.options.mode].friction,
        });
        this.kinetInstance._instances.scale._acceleration = 0.06;
        this.kinetInstance._instances.scale._friction = 1 - 0.1;
        this.kinetInstance.set('x', window.innerWidth / 2);
        this.kinetInstance.set('y', window.innerHeight / 2);
        this.kinetInstance.set('width', this.options.size);
        this.kinetInstance.set('height', this.options.size);
        this.kinetInstance.set('opacity', 0);
        this.kinetInstance.set('textOpacity', 0);
        this.kinetInstance.set('radius', this.options.size / 2);
        this.kinetInstance.set('scale', 100);
        this.kinetInstance.on('tick', function (instances) {
            _this.render(instances.x.current, instances.y.current, instances.width.current, instances.height.current, instances.radius.current, instances.x.velocity, instances.y.velocity, instances.opacity.current, instances.scale.current, instances.textOpacity.current);
        });
        this.throttledMouseMove = throttle_1.default(this.mouseMove);
        window.addEventListener('resize', this.resize, { passive: true });
        this.resize();
        window.addEventListener('mousemove', this.throttledMouseMove, {
            passive: true,
        });
        document.addEventListener('mouseenter', this.windowMouseEnter);
        document.addEventListener('mouseleave', this.windowMouseLeave);
        document.addEventListener('mouseover', this.focusableElementMouseEnter);
        document.addEventListener('mouseout', this.focusableElementMouseLeave);
        document.addEventListener('mousedown', this.mouseDown);
        document.addEventListener('mouseup', this.mouseUp);
        document.addEventListener('touchstart', this.disable);
        document.addEventListener('touchend', this.disable);
        document.addEventListener('mousemove', this.enable, {
            passive: true,
        });
        this.prefersReducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.prefersReducedMotionMediaQuery.addEventListener('change', this.updatePrefersReducedMotionSetting);
        this.updatePrefersReducedMotionSetting();
        this.stickedToElementMutationObserver = new MutationObserver(function (mutations) {
            var e_1, _a, e_2, _b;
            try {
                for (var mutations_1 = __values(mutations), mutations_1_1 = mutations_1.next(); !mutations_1_1.done; mutations_1_1 = mutations_1.next()) {
                    var mutation = mutations_1_1.value;
                    try {
                        for (var _c = (e_2 = void 0, __values(mutation.removedNodes)), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var el = _d.value;
                            if (el === _this.stickedToElement || el.contains(_this.stickedToElement)) {
                                _this.resetStickedToElement();
                                _this.resetStickedToElementMutationObserver();
                                _this.resetMagnetic();
                                _this.reset();
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (mutations_1_1 && !mutations_1_1.done && (_a = mutations_1.return)) _a.call(mutations_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    Blobity.prototype.bounce = function () {
        if (this.reduceMotionSetting) {
            this.kinetInstance.set('scale', 100);
        }
        else {
            this.kinetInstance.set('scale', 97);
            this.kinetInstance._instances.scale.velocity = 3;
            this.kinetInstance.animate('scale', 100);
        }
    };
    Object.defineProperty(Blobity.prototype, "activeTooltip", {
        get: function () {
            return this.manuallySetTooltipText || this.sticketToElementTooltip;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Blobity.prototype, "activeFocusedElement", {
        get: function () {
            return this.manuallySetFocusedElement || this.stickedToElement;
        },
        enumerable: false,
        configurable: true
    });
    Blobity.prototype.morph = function (_a, radius) {
        var width = _a.width, height = _a.height, x = _a.x, y = _a.y;
        if (this.disablingStickedToElementTimeout) {
            clearTimeout(this.disablingStickedToElementTimeout);
        }
        this.kinetInstance[this.kinetDefaultMethod]('radius', radius);
        this.kinetInstance[this.kinetDefaultMethod]('width', width);
        this.kinetInstance[this.kinetDefaultMethod]('height', height);
        this.kinetInstance[this.kinetDefaultMethod]('x', x);
        this.kinetInstance[this.kinetDefaultMethod]('y', y);
    };
    Blobity.prototype.render = function (x, y, width, height, radius, velocityX, velocityY, opacity, scale, textOpacity) {
        this.clear();
        var maxDelta = this.activeFocusedElement
            ? 0
            : (this.options.size / 8) * 7;
        x = x * window.devicePixelRatio;
        y = y * window.devicePixelRatio;
        width =
            (this.activeTooltip ? width : Math.max(width, maxDelta)) *
            window.devicePixelRatio;
        height =
            (this.activeTooltip ? height : Math.max(height, maxDelta)) *
            window.devicePixelRatio;
        radius = radius * window.devicePixelRatio;
        velocityX = velocityX * window.devicePixelRatio;
        velocityY = velocityY * window.devicePixelRatio;
        if (this.isActive) {
            var ctx = this.ctx;
            ctx.globalAlpha = opacity;
            ctx.setTransform(scale / 100, 0, 0, scale / 100, x, y);
            ctx.translate(width, height);
            ctx.scale(scale / 100, scale / 100);
            ctx.translate(-width, -height);
            var activateBlur = this.options.kineticMorphing &&
                Math.abs(width - this.options.size * window.devicePixelRatio) <
                2 &&
                Math.abs(height - this.options.size * window.devicePixelRatio) <
                2 &&
                Math.abs(radius - (this.options.size * window.devicePixelRatio) / 2) < 2;
            if (activateBlur) {
                var angle = (Math.atan2(velocityY, velocityX) * 180) / Math.PI + 180;
                ctx.translate(radius, radius);
                ctx.rotate((angle * Math.PI) / 180);
                ctx.translate(-radius, -radius);
            }
            var cumulativeVelocity = activateBlur
                ? Math.min(Math.sqrt(Math.pow(Math.abs(velocityX), 2) +
                    Math.pow(Math.abs(velocityY), 2)) * 2, // so the distortion starts sooner
                    60 // shape becomes too distorted once velocity is too big
                ) / 2
                : 0;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.arcTo(width + cumulativeVelocity, cumulativeVelocity / 2, width + cumulativeVelocity, height + cumulativeVelocity / 2, helpers_1.positive(radius - cumulativeVelocity / 2));
            ctx.arcTo(width + cumulativeVelocity, height - cumulativeVelocity / 2, cumulativeVelocity, height - cumulativeVelocity / 2, helpers_1.positive(radius - cumulativeVelocity / 2));
            ctx.arcTo(0, height, 0, 0, helpers_1.positive(radius));
            ctx.arcTo(0, 0, width, 0, helpers_1.positive(radius));
            ctx.closePath();
            if (helpers_1.isGradient(this.color)) {
                var gradient_1 = ctx.createLinearGradient(0, 0, width, height);
                var length_1 = this.color.length;
                this.color.forEach(function (color, index) {
                    gradient_1.addColorStop((1 / (length_1 - 1)) * index, "rgb(" + color.r + ", " + color.g + ", " + color.b + ")");
                });
                ctx.fillStyle = gradient_1;
            }
            else {
                ctx.fillStyle = "rgb(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ")";
            }
            ctx.fill();
            if (this.activeTooltip) {
                ctx.setTransform(scale / 100, 0, 0, scale / 100, x, y);
                this.ctx.textBaseline = 'top';
                this.ctx.textAlign = 'left';
                this.ctx.font = this.options.fontWeight + " " + this.options.fontSize *
                    window.devicePixelRatio *
                    (scale / 100) + "px " + this.options.font;
                ctx.fillStyle = "rgba(\n                    " + this.fontColor.r + ", " + this.fontColor.g + ", \n                    " + this.fontColor.b + ", " + textOpacity / 100 + ")";
                ctx.fillText(this.activeTooltip, this.options.tooltipPadding * window.devicePixelRatio -
                    ((scale - 100) / 100) * width, this.options.tooltipPadding * window.devicePixelRatio -
                ((scale - 100) / 100) * height);
            }
        }
    };
    return Blobity;
}());
exports.default = Blobity;
