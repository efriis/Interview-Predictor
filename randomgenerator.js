var mysql = require('mysql');

var connection = mysql.createConnection({
	host:'localhost',
	user:'admissions_user',
	password:'CqQFoATTWlXymPcg',
	database:'exeteradmissions'
});

var count = 1000;
var length = 300;
var noise = 1
var finalmin = 1;
var finalmax = 5;
var words = [
	{
		word:'hello',
		weight:1,
		score:0
	},
	{
		word:'bad',
		weight:4,
		score:-0.3
	},
	{
		word:'good',
		weight:4,
		score:0.3
	},
	{
		word:'awesome',
		weight:2,
		score:0.6
	},
	{
		word:'motivated',
		weight:3,
		score:0.4
	}
];
var total = 0;
var min = Number.MAX_VALUE;
var max = Number.MIN_VALUE;
for(var i = 0; i < words.length; i++) {
	total += words[i].weight;
	if(words[i].score < min) min = words[i].score;
	if(words[i].score > max) max = words[i].score;
}
for(var i = 0; i < words.length; i++) {
	words[i].weight = words[i].weight/total;
}

min *= length;
max *= length;

console.log(min + " " + max + " " + total);

Number.prototype.mapTo = function () {
  var rtn = Math.round((( this - min ) * ( finalmax - finalmin ) / ( max - min ) + finalmin-3.15)*10+3.15);
  if(rtn > finalmax) rtn = finalmax;
  if(rtn < finalmin) rtn = finalmin;
  return rtn;
}

var insert = [];
for(var i = 0; i < count; i++) {
	var paragraph = "";
	var score = 3;
	for(var a = 0; a < length; a++) {
		var rand = Math.random();
		var temp = words[0].weight;
		var j = 0;
		while(temp < rand) {
			j++;
			temp += words[j].weight;
		}
		paragraph += words[j].word + " ";
		score += words[j].score;
	}
	insert[i] = {paragraph:paragraph,score:score.mapTo()};
}
var done = 0;
var d = new Date();
var time = Math.floor(d.getTime()/1000)
var query = "INSERT INTO interviews(appid,interviewer,r1,r2,r3,r4,r5,timestamp,writeup) VALUES";
for(var i = 0; i < insert.length; i++) {
	var innerquery = "("+Math.floor(Math.random()*1000000) + "," + Math.floor(Math.random()*1000000) + ",";
	for(var j = 0; j < 5; j++) {
		innerquery += Math.round(insert[i].score) + ",";
	}
	innerquery += time + ",'" + insert[i].paragraph + "') ON DUPLICATE KEY UPDATE r1=3, r2=3, r3=3, r4=3, r5=3, timestamp=0,writeup='" + insert[0].paragraph + "';";

	connection.query(query + innerquery, function(err,rows,fields) {
		done++;
		if(done==insert.length) process.exit();
	});
}