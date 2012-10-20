/*
 * Copyright (c) 2011-2012 Matthew Jaquish
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


/**
 * Bitmask Enum type. Just mucking around with some bits.
 * Stores up to 30 enum values that are intended to be used
 * as a bitmask.
 *
 * NOTE: if the enum becomes greater than 31 bits, it will throw an error. The
 * limit is based on limit of 32-bit signed integer, where the last bit
 * is reserved for sign.
 *
 * NOTE: the values stored in the property is the bit value, not the index.
 * Use #getIdxByBit or #getNameByBit for other values.
 *
 * =============================================================================
 * Bit   Idx    Int           Binary                              Hex
 * -----------------------------------------------------------------------------
 *  1     0             1     00000000000000000000000000000001    0x01
 *  2     1             2     00000000000000000000000000000010    0x02
 *  3     2             4     00000000000000000000000000000100    0x04
 *  4     3             8     00000000000000000000000000001000    0x08
 *  5     4            16     00000000000000000000000000010000    0x10
 *  6     5            32     00000000000000000000000000100000    0x20
 *  7     6            64     00000000000000000000000001000000    0x40
 *  8     7           128     00000000000000000000000010000000    0x80
 *  9     8           256     00000000000000000000000100000000    0x100
 * 10     9           512     00000000000000000000001000000000    0x200
 * 11    10          1024     00000000000000000000010000000000    0x400
 * 12    11          2048     00000000000000000000100000000000    0x800
 * 13    12          4096     00000000000000000001000000000000    0x1000
 * 14    13          8192     00000000000000000010000000000000    0x2000
 * ...   ...   ...            ...                                 ...
 * 31    30    1073741824     01000000000000000000000000000000    0x40000000
 * -----------------------------------------------------------------------------
 */

(function () {
	'use strict';

	/*
	 * Note that this type depends on the Jasy and Core JS frameworks.
	 */
	core.Class('scraps.BitmaskEnum', {
		/**
		 * Take each arg provided and save it as an enum value.
		 */
		construct: function () {

			// Make an array out of arguments.
			var val = null;
			var i = 0;
			var l = 0;

			/** {=Array} */
			var vals = this.__values = Array.prototype.slice.call(arguments);

			if (jasy.Env.isSet('debug')) {

				core.Assert.isType(vals, 'Array');
				core.Assert.isTrue(vals.length > 0, 'No enum values were provided.');
				core.Assert.isTrue(vals.length > 31, 'Too many enum names: max of 31.');
			}

			for (i = 0, l = vals.length; i < l; i += 1) {

				val = vals[i];

				if (jasy.Env.isSet('debug')) {
					core.Assert.isType(val, 'String');
				}

				this[val] = (1 << i);
			}

			// calculate bitmask
			this.bitmask = this.__calculateBitmask(vals);
		},

		members: {

			/**
			 * {String} Return the enum name that is mapped to the @bitVal {Integer}.
			 */
			getNameByBit: function (bitVal) {

				if (jasy.Env.isSet('debug')) {

					core.Assert.isType(bitVal, 'Integer', "Bit must be a valid Integer.");

					core.Assert.isTrue(bitVal > 0x00000000,
						"Invalid bit value: too small.");

					core.Assert.isTrue(bitVal <= 0x40000000,
						"Invalid bit value!: too high.");
				}

				return this.__values[bitVal];
			},

			/**
			 * {Integer} Get the bit representation for an enum @index {Integer}.
			 * Uses the index as the bit number starting with zero.
			 */
			getBitByIdx: function (index) {

				if (jasy.Env.isSet('debug')) {

					core.Assert.isType(index, 'Integer');

					core.Assert.isTrue(this.__values.length > index,
						"index was out of bounds!");
				}

				// If the index represents second bit or higher, where index 1 is
				// the second bit.
				if (index > 0) {
					return (1 << index);
				}

				// Otherwise return the value for the first bit.
				return 0x01;
			},

			/**
			 * {Integer} Returns the index using the @bitVal {Integer}. Example:
			 * getIdxByBit(0x01), getIdxByBit(1), getIdxByBit(0x10),
			 * getIdxByBit(16), etc.
			 */
			getIdxByBit: function (bitVal) {

				if (jasy.Env.isSet('debug')) {

					core.Assert.isType(bitVal, 'Integer');

					core.Assert.isTrue(bitVal > 0x00, "Invalid bit!");
				}

				return bitVal >> 1;
			},

			/**
			 * {Integer} Return the index using the @name {String}.
			 */
			getIdxByName: function (name) {

				if (jasy.Env.isSet('debug')) {

					core.Assert.isType(name, 'String');

					core.Assert.isTrue(!!this[name],
						"Enum value '" + name + "' doesn't exist!");
				}

				return this[name] >> 1;
			},

			getNameByIdx: function (idx) {
				return this.__values[idx];
			},

			/**
			 * {Array} Returns a new copy of the internal name list.
			 */
			getNames: function () {
				return this.__values.slice();
			},

			/**
			 * {Integer} Calculate a bitmask value based on the @vals {Array} index
			 * representing a bit.
			 */
			__calculateBitmask: function (vals) {

				var i = 0;
				var l = vals.length;
				var bitmask = 0;
				var bit = 0;

				for (; i < l; i += 1) {

					bit = 1 << i;
					bitmask = bitmask | bit;
				}

				return bitmask;
			}
		}
	});
} ());
