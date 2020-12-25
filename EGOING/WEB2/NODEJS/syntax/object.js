// 배열은 대괄호
var members = ['egoing', 'k8805', 'foo'];
console.log(members[1]); // k8805

var i = 0;
while (i < members.length) {
    console.log('array loop', members[i]);
    i = i + 1;
}

// 객체는 중괄호
var roles = {
    'programmer' : 'egoing',
    'designer' : 'k8805',
    'manager' : 'foo'
}
console.log(roles.designer); // k8805
console.log(roles['designer']); // k8805

for (var n in roles) {
    console.log('object =>', n, 'value =>', roles[n]);
}