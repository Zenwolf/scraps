var i = 1;
var l = 10;

// This will create a queue of new timeouts to execute at intervals of 500 * i.
for (; i <= l; i += 1) {

	// immediately execute an anonymous function that creates a new closure.
	// The closure saves the value of i for later use.
	(function (i) {
		var num = i;
		var msg = 'msg: ' + num;

		// Use set timeout to delay the message output to the console based on
		// the message that was passed as an argument to the function closure.
		setTimeout(function () {

			console.info(msg);

		}, 500 * num);
	} (i));
}

// Output:
//
// msg: 1
// msg: 2
// msg: 3
// msg: 4
// msg: 5
// msg: 6
// msg: 7
// msg: 8
// msg: 9
// msg: 10