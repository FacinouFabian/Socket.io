"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.display = exports.isNull = exports.isNotNull = void 0;

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * @function isNotNull
 * @description check if all args are not null
 *
 * @param {unknown[]} values - any arguments to checks
 * @return {boolean}
 *
 * @example
 * isNotNull(x, y, z, process.env.PORT)
 *
 */
var isNotNull = function isNotNull() {
  for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
    values[_key] = arguments[_key];
  }

  for (var _i = 0, _values = values; _i < _values.length; _i++) {
    var v = _values[_i];

    if (v === undefined || v === null) {
      return false;
    }
  }

  return true;
};
/**
 * @function isNull
 * @description check if all args are null
 *
 * @param {unknown[]} values - any arguments to checks
 * @return {boolean}
 *
 * @example
 * isNull(x, y, z, process.env.PORT)
 *
 */


exports.isNotNull = isNotNull;

var isNull = function isNull() {
  return !isNotNull.apply(void 0, arguments);
};
/**
 * @function display
 * @description display on output with time
 *
 * @param {string} str - data to display
 * @return {void}
 *
 * @example
 * display("Il a pas dit bonjour")
 *
 */


exports.isNull = isNull;

var display = function display(str) {
  return console.log("[".concat((0, _moment["default"])(), "] ").concat(str));
};

exports.display = display;