/*
var total = 6;
var list = [];
for (var i = 1; i < 100; i++) {
	var actors = [];
	for (var j = 1; j <= total; j++) {
		if (i % j == 0) actors.push(j - 1);
	}
	list.push(actors);
}
console.log(list);
*/

var total = 6;
var list = [];
for (var i = 1; i < 100; i++) {
	actors = (Math.random() * 100) > 10 ? ([i % total]):([0,1,2,3,4,5]);
	list.push(actors);
}
console.log(list);

