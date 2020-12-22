/* function a() {
    console.log('A');
} */
var a = function() { /* 익명 함수 */
    console.log('A');
}
// a();

function slowfunc(callback) {
    callback();
}

slowfunc(a);