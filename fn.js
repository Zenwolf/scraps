(function (env, undefined) {

    var slice = Array.prototype.slice;
    var map = Array.prototype.map;
    var module = {};

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

    function partial(fn, ctx) {
        var args = slice.call(arguments, 2); // remove fx, ctx
        var newFn = null;
        ctx = ctx || null;

        newFn = function () {
            var localArgs = slice.call(arguments, 0);
            return fn.apply(ctx, args.concat(localArgs) );
        };

        return newFn;
    }

    /*
     * Return a new function that executes function 2 and passes its
     * return value to function 1. The returned function will do this:
     *   fn1( fn2(arguments) )
     */
    function compose(fn1, fn2) {
        var ctx = this;
        return function () {
            return fn1( fn2.apply(ctx, arguments) );
        };
    }

    function composeAs(ctx) {
        return partial(compose, ctx);
    }

    /*
     * Flow a series of functions via callbacks.
     *
     * WARNING: beware of overflowing the stack with a large array of
     * functions (due to no tail recursion in JS).
     */
    function flow(fns, last) {
        var f = last;
        var i = 0;
        var l = 0;
        var ctx = this;

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
            f = function (error) {
                last.call(ctx, error);
            };
        }

        i = fns.length;

        // construct the function chain from inside-out.
        while (i--) {
            f = makeFlowFn(fns[i], f, ctx);
        }

        // Start the flow with no error.
        f(null);
    }

    function flowAs(ctx) {
        return partial(flow, ctx);
    }

    /*
     * Sequence an array of functions using partial application and
     * composition. The next function is always passed the return
     * value of the previous function. Returns the first function
     * in the sequence.
     */
    function sequence(fns) {
        var i = fns.length;
        var currentFn = null;
        var prevFn = null;
        var isLast = true;
        var ctx = this;

        function makeFn(fn1, fn2) {
            return compose(fn2, partial(fn1, ctx), ctx);
        }

        while (i--) {
            prevFn = fns[i] || null;

            if (isLast) {
                currentFn = partial(prevFn, ctx);
                isLast = false;
            }
            else if (prevFn) {
                currentFn = makeFn(prevFn, currentFn);
            }
        }

        return currentFn;
    }

    function sequenceAs(ctx) {
        return partial(sequence, ctx);
    }

    /*
     * Take a function and create a new function that flips its arguments and
     * applies them to itself.
     */
    function flip(fn) {
        return function () {
            var args = slice.call(arguments);
            var flipped = args.reverse();
            fn.apply(this, flipped);
        };
    }

    function flipAs(ctx) {
        return partial(flip, ctx);
    }

    function lookup(key, obj) {
        return obj[key];
    }

    /*
     * Allow us to call a constructor using Function.apply.
     * @args {Array}
     */
    function newApply(constrFn, args) {
        function F() {
            return constrFn.apply(this, args);
        }
        F.prototype = constrFn.prototype;
        return new F();
    }

	var callBind = (Function.prototype.bind.bind(Function.prototype.call));

	function existy(x) {
		return x != null;
	}

	function truthy(x) {
		return (x !== false) && existy(x);
	}

	function comparator(pred) {
		return function (x, y) {
			if (truthy(pred(x, y))) {
				return -1;
			}
			else if (truthy(pred(y, x))) {
				return 1;
			}
			else {
				return 0;
			}
		};
	}

	function identity(x) {
		return x;
	}

	function values(o) {
		var vals = [];
		Object.keys(o).forEach(function (val) { vals.push(val); });
		return vals;
	}

	function toArray(o) {
		if (!o) return [];                                        // invalid
		if (Array.isArray(o)) return slice.call(o, 0);            // arrays
		if (o.length === +o.length) return map.call(o, identity); // pseudos
		return values(o);                                         // objects
	}

	function isNumber(x) {
		return Object.prototype.toString.call(x) === '[object Number]';
	}

	function allOf( /* fns */ ) {
		return toArray(arguments).reduceRight(function (truth, f) {
			return truth && f();
		}, true);
	}

	function anyOf( /* fns */ ) {
		return toArray(arguments).reduceRight(function (truth, f) {
			return truth || f();
		}, false);
	}

	function complement(pred) {
		return function () {
			return !pred.apply(null, toArray(arguments));
		}
	}

	function any(list, pred) {
		return list.every(pred);
	}

	function some(list, pred) {
		return list.some(pred);
	}

	function first(a, n) {
		if (!a) return undefined;
		return (n != null) ? slice.call(a, 0, n) : a[0];
	}

	function rest(a, n) {
		if (!a) return undefined;
		return slice.call(a, (n != null) ? n : 1);
	}

	function cat() {
		var head = first(arguments);
		if (existy(head)) {
			return head.concat.apply(head, rest(arguments));
		}
		else {
			return [];
		}
	}

	function construct(head, tail) {
		return cat([head], toArray(tail));
	}

	function mapcat(fn, array) {
		return cat.apply(null, map(array, fn));
	}

	function butLast(array) {
		return toArray(array).slice(0, -1);
	}

	function interpose(inter, array) {
		return butLast(mapcat(function (e) {
			return construct(e, [inter]);
		}, array));
	}

    module.op         = op;
    module.partial    = partial;
    module.compose    = compose;
    module.composeAs  = composeAs;
    module.flow       = flow;
    module.flowAs     = flowAs;
    module.sequence   = sequence;
    module.sequenceAs = sequenceAs;
    module.flip       = flip;
    module.flipAs     = flipAs;
    module.lookup     = lookup;
    module.newApply   = newApply;
    module.callBind   = callBind;
    module.isUndef    = partial(op['==='], null, undefined);
    module.isDef      = compose(op['!'], module.isUndef);

    module.existy     = existy;
    module.truthy     = truthy;
    module.comparator = comparator;
    module.identity   = identity;
    module.toArray    = toArray;
    module.isNumber   = isNumber;
    module.allOf      = allOf;
    module.anyOf      = anyOf;
    module.any        = any;
    module.some       = some;
    module.first      = first;
    module.rest       = rest;
    module.cat        = cat;
    module.construct  = construct;
    module.mapcat     = mapcat;
    module.butLast    = butLast;
    module.interpose  = interpose;

    env.fn = module;
} (this));
