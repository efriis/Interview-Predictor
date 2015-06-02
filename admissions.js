
var mysql = require('mysql');
var numeric = require('numeric');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

function page(alert) {
	return fs.readFileSync(__dirname + "/top.html") + alert + fs.readFileSync(__dirname + "/bottom.html");
}

app.get('/',function(req,res) {
	res.end(page(""));
});

app.post('/',function(req,res) {
	//res.send("Posted data: " + req.body.writeup);

	var str = req.body.writeup;

	var connection = mysql.createConnection({
		host:'',
		user:'',
		password:'',
		database:''
	});

	var strs = str.split(/[^a-zA-Z0-9]+/);
	var counts = {};
	var curr;
	for(var i = 0; i < strs.length; i++) {
		curr = strs[i].toLowerCase();
		if(counts[curr]) {
			counts[curr]++;
		} else {
			counts[curr] = 1;
		}
	}


	connection.connect();
	var words = [];
	var overalltraining = [];
	var scores = [];


	connection.query('SELECT * FROM interviews',function(err,rows,fields) {
		if(err) throw err;
		for(var i=0; i < rows.length; i++) {
			var row = rows[i];
			var temp = row.writeup.split(/[^a-zA-Z0-9]+/);
			//process words into training
			for(var j = 0; j < temp.length; j++) {
				var word = temp[j].toLowerCase();
				if(word !== "" && words.indexOf(word)==-1) {
					words.push(word);
				}
			}
		}
		var clonable = [];
		for(var i = 0; i < words.length; i++) {
			clonable[i] = 0;
		}
		for(var i = 0; i < rows.length; i++) {
			var training = _.clone(clonable);
			var row = rows[i];
			var rowwords = row.writeup.split(/[^a-zA-Z0-9]+/);
			for(var a = 0; a < rowwords.length; a++) {
				training[words.indexOf(rowwords[a])]++;
			}
			overalltraining.push(training);
			scores.push([row.r5-3]);
		}
		var X = (overalltraining);
		var Y = scores;

		var beta = numeric.dot(numeric.dot(numeric.inv(numeric.dot(numeric.transpose(X),X)),numeric.transpose(X)),Y);
		//console.log(JSON.stringify(beta));
		//console.log(JSON.stringify(words));

		var newX = clonable;
		for(var word in counts) {
			var index = words.indexOf(word);
			if(index > -1) {
				newX[index] = counts[word];
			}
		}

		var rtn = Math.round(numeric.dot(newX,beta)[0]+3);

		if(rtn > 5) rtn = 5;
		if(rtn < 1) rtn = 1;

		res.end(page("<div class=\"alert alert-danger\"><strong>Success!</strong> Your interview predicted rating is: " + rtn + "<br/><br/>Text: " + req.body.writeup + "</div>"));
	});
});

app.listen(3000);