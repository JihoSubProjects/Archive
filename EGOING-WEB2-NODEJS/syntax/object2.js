// array, object
// 함수는 statement이면서 동시에 value(값)이다.
// if, while 등은 그럴 수 없다.

var f = function() {
    console.log(1+1);
    console.log(1+2);
}
console.log(f);
f();

// var i = if (true) { console.log(1); };
// var w = while (true) { console.log(1); };

// array에 함수
var a = [ f ];
a[0]();

// object에 함수
var o = { func:f }
o.func();