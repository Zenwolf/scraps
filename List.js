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

;(function (global, undefined) {
	'use strict';

	var lib =  {
		/*
		 * {Array} Convert a @pseudoArray {Object} (one that has length and
		 * Integer index properties) to a real array. Begin at
		 * the @start {Integer} index, otherwise process the entire list.
		 */
		asArray: function (pseudoArray, start) {
			// if no start provided or start is just zero, etc.
			if (!start || start < 1) {
				return Array.prototype.slice.call(pseudoArray);
			}
			return Array.prototype.slice.call(pseudoArray, start);
		},

		/*
		 * {Primitive|Object|Function|Array} Find the first item in
		 * a @list {Array}.
		 */
		first: function (list) {
			return list[0];
		},

		/*
		 * {Primitive|Object|Function|Array} Find the last item in
		 * a @list {Array}.
		 */
		last: function (list) {
			return list[list.length - 1];
		},

		/*
		 * {Array} Helper method to randomize an array of @length {Number}.
		 * Returns a new Array containing the new assignments of the indexes,
		 * so someArray[0] = original[returned[0]]. See {#_randomizedList}.
		 *
		 * Example:
		 *
		 * var myArray = ['a', 'b', 'c'];
		 * var assignment = randomize(myArray.length);
		 * var myNewArray = [];
		 * for (var i = 0, len = assignment.length; i < len; i++) {
		 *     myNewArray[i] = myArray[assignment[i]];
		 * }
		 *
		 */
		randomize: function (length) {
			var order = [];
			var tmp = null;
			var current = null;
			var i = 0;

			// init the order array with numeric lane values
			for (; i < length; i++) {
				order.push(i);
			}

			// now randomize the lane order.
			while (length--) {
				current = Math.floor(Math.random() * length);
				tmp = order[current];
				order[current] = order[length];
				order[length] = tmp;
			}

			return order;
		},

		/**
		 * {Array} Return a randomized version of @original {Array}.
		 *
		 * NOTE: returns a new array; does NOT modify original.
		 *
		 */
		randomizedList: function (original) {
			var len = original.length;
			var assignment = this.randomize(len);
			var result = [];
			var i = 0;
			for (; i < len; i++) {
				result[i] = original[assignment[i]];
			}
			return result;
		},

		/**
		 * {Integer} Returns the index of a @key {String} in a list
		 * of @keys {Array} using a binary search.
		 *
		 */
		indexOf: function (key, keys) {
			var n = keys.length;
			var i = 0;
			var d = n;

			if (n === 0) { return 0; }
			if (key < keys[0]) { return 0; }
			if (key > keys[n - 1]) { return n; }

			while (key !== keys[i] && d > 0.5) {
				d = d / 2;
				i += (key > keys[i] ? 1 : -1) * Math.round(d);
				if (key > keys[i - 1] && key < keys[i]) { d = 0; }
			}

			return i;
		},

		/**
		 * {Array} Insert @item {Null|Array|Function|RegExp|Object|Date|Number|String|Boolean|Map|Integer|Primitive}
		 * into @a {Array} at @index {Integer}.
		 */
		insertAt: function (a, index, item) {
			var i = index;
			var l = a.length;
			var k = l;

			if (l === 0) {
				a[0] = item;
				return a;
			}

			if (l === i) {
				a[l] = item;
				return a;
			}

			do {
				a[k] = a[k - 1];
				k--;
			}
			while (k > i);

			a[i] = item;
			return a;
		},

		/**
		 * {Any} Remove the item at @index {Integer} from the @a {Array}.
		 * Returns the remove value.
		 */
		removeAt: function (a, index) {
			var i = index;
			var l = a.length - 1;
			var removedVal = a[index];
			for (; i < l; i++) {
				a[i] = a[i + 1];
			}
			a.length = l;
			return removedVal;
		},

		shuffle: function (a) {
			return a.slice().sort(function () {
				return Math.random() > 0.5 ? 1 : -1;
			});
		},

		clone: function (a) {
			return a.slice(0);
		}
	};

	global.List = lib;

} (this));
