/*
 * Copyright (c) 2010-2013 Matthew Jaquish
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function (global, undefined) {
	'use strict';

	var toStr = Object.prototype.toString;

	/*
	 * Library for checking object types.
	 * The only way to accurately check type in JavaScript is to make use
	 * of the Object.prototype.toString function and compare the response.
	 */
	global.Type = {

		isFunction: function (val) {
			return toStr.call(val).slice(8, -1) === 'Function';
		},

		isArray: function (val) {
			return toStr.call(val).slice(8, -1) === 'Array';
		},

		isObject: function (val) {
			return toStr.call(val).slice(8, -1) === 'Object';
		},

		isString: function (val) {
			return toStr.call(val).slice(8, -1) === 'String';
		},

		isNumber: function (val) {
			return toStr.call(val).slice(8, -1) === 'Number';
		},

		isBoolean: function (val) {
			return toStr.call(val).slice(8, -1) === 'Boolean';
		},

		isDate: function (val) {
			return toStr.call(val).slice(8, -1) === 'Date';
		},

		isRegExp: function (val) {
			return toStr.call(val).slice(8, -1) === 'RegExp';
		},

		isNull: function (val) {
			return toStr.call(val).slice(8, -1) === 'Null';
		},

		isUndefined: function (val) {
			return toStr.call(val).slice(8, -1) === 'Undefined';
		}
	};
} (this));
