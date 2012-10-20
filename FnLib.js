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
 * This is a utility library to support functional programming concepts.
 */
;(function (libObj) {
        'use strict';


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Variables
        //
        // All vars are declared here to keep code clean. Any calculated values
        // will be assigned elsewhere in the code.
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        // The module object.
        var Fn = null;

        var version = '0.0.1';

        //
        // Functions that represent operators, for use with functional
        // application.
        //
        var op = {
                '+'  : function (a, b) { return a + b; },
                '-'  : function (a, b) { return a - b; },
                '*'  : function (a, b) { return a * b; },
                '/'  : function (a, b) { return a / b; },
                '===': function (a, b) { return a === b; },
                '%'  : function (a, b) { return a % b; },
                '<'  : function (a, b) { return a < b; },
                '>'  : function (a, b) { return a > b; },
                '!'  : function (a) { return !a; }
        };

        var isUndef = null;
        var isDef   = null;


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Environment
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        Fn = libObj;


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Functions
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        /**
         * {Function} Partially apply the @fn {Function} with
         * the @context {Object?}. Returns a new partially applied Function.
         */
        function partial(fn, context) {
                var args = asArray(arguments, 2);

                context = context || null;

                return function () {
                        return fn.apply(context, args.concat(asArray(arguments)));
                };
        }

        /**
         * {Function} Return a new Function that executes @fn2 {Function} and
         * passes its return value to @fn1 {Function}. Supports an optional
         * @context {Object?}. The returned Function will return the result of
         * fn1(fn2(arguments)) upon execution.
         */
        function compose(fn1, fn2, context) {
                context = context || null;

                return function () {
                        return fn1(fn2.apply(context, arguments));
                };
        }

        function composeAs(context) {
                return partial(compose, context);
        }

        /**
         * Flow a series of functions via callbacks.
         *
         * WARNING: beware of overflowing the stack with a large array of
         * functions (due to no tail recursion in JS).
         *
         * @fns {Function[]} -- Array of functions.
         * @last {Function} -- the last function to call at the end of
         * the sequence.
         */
        function flow(fns, last, ctx) {
                var f = last;
                var i = 0;
                var len = 0;

                var makeFlowFn = function (fn, nextFn, ctx) {
                        var f = null;
                        if (ctx) {
                                f = function (error) {
                                        fn.call(ctx, error, nextFn);
                                };
                        }
                        else {
                                f = function (error) {
                                        fn(error, nextFn);
                                };
                        }
                        return f;
                };

                if (ctx) {
                        f = function (err) {
                                last.call(ctx, err);
                        };
                }

                i = fns.length;

                // construct the fn chain from inside-out.
                while (i--) {
                        f = makeFlowFn(fns[i], f, ctx);
                }

                // Start the flow, with no error
                f(null);
        }

        /**
         * {Function} Sequence a @fns {Array} using partial function application
         * and function composition. The next Function is always passed the
         * return value of the previous Function. It also supports an optional
         * @context {Object?}. Returns the first Function in the sequence.
         */
        function sequence(fns, context) {
                var i = fns.length;
                var currentFn = null;
                var prevFn = null;
                var ctx = context || null;
                var last = true;

                function makeFn(fn1, fn2) {
                        return compose(fn2, partial(fn1, ctx), ctx);
                }

                while (i--) {
                        prevFn = fns[i] || null;
                        if (last) {
                                currentFn = partial(prevFn, ctx);
                                last = false;
                        }
                        else if (prevFn) {
                                currentFn = makeFn(prevFn, currentFn);
                        }
                }

                return currentFn;
        }

        function sequenceAs(context) {
                return partial(sequence, context);
        }

        function lookup(obj, key) {
                return obj[key];
        }

        /**
         * {Object} This allows us to call a @constructorFn {Function} using
         * Function.apply to pass an @args {Array}.
         */
        function newApply(constructorFn, args) {
                function F() {
                        return constructorFn.apply(this, args);
                }

                F.prototype = constructorFn.prototype;

                return new F();
        }

        /**
         * {Array} Utility to convert a @pseudoArray {Object} into a real array,
         * with an optional @start {Integer} index.
         */
        function asArray(pseudoArray, start) {
                var slice = Array.prototype.slice;
                var result = null;

                // if no start provided or start is zero(falsy) or less.
                if (!start || start < 1) {
                        result = slice.call(pseudoArray);
                }
                else {
                        result = slice.call(pseudoArray, start);
                }

                return result;
        }


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Convenience functions created from other functions.
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        /*
         * {Boolean} Returns true if the argument value is undefined.
         */
        isUndef = partial(op['==='], null, undefined);

        /*
         * {Boolean} Returns true if the argument value is defined.
         */
        isDef = compose(op['!'], isUndef);


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Public API
        //
        // This allows us to rename functions at any time, or create values that
        // are not part of the API and are only available in the local closure.
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


        Fn.version    = version;
        Fn.op         = op;
        Fn.partial    = partial;
        Fn.compose    = compose;
        Fn.composeAs  = composeAs;
        Fn.flow       = flow;
        Fn.sequence   = sequence;
        Fn.sequenceAs = sequenceAs;
        Fn.lookup     = lookup;
        Fn.newApply   = newApply;
        Fn.asArray    = asArray;
        Fn.isDef      = isDef;
        Fn.isUndef    = isUndef;

} (typeof exports !== 'undefined' ? exports : (this.Fn = {})));