// TWITTER HANDLING STUFF
//using npm twitter module

/**
 * get the tweets from bh and rj during the period specified at battleTimeInSeconds 
 *
 * @param {number} battleTimeInSeconds the time in seconds to collect tweets.
 * @param {function} callback A callback function that receives (error, bhArray, rjArray) where bhArray and rjArray are Array objects containing the tweets from bh and rj 
 */
function getTweets(battleTimeInSeconds,callback){
	if(isNaN(battleTimeInSeconds)){
		callback(new Error("battleTimeInSeconds is not a Number- An integer is expected"));
		return;
	}
	console.log("collecting tweets for "+ battleTimeInSeconds+ " seconds");
	//init geo coordinates

	//Note that the geo coordinates for twitter api are {long,latitude}. That is the oposite order used in google maps {lat,long}.
	//We will considre the BH box as a box with diagonal starting at the city of Ibirité,MG (-44,-20) and finishing at Santa Luzia,MG(-43.868091,-19.769983)
	var BH_geobox = '-44.0763966,-20.012989,-43.868091,-19.769983';
	//We will considre the BH box as a box with diagonal starting at the South Atlantic Ocean near Restinga do Marabaia(-43.776894,-23.082526) and finishing inside of Baia de Guanabara (-43.101235,-22.741624) 
	var RJ_geobox = '-43.776894,-23.082526,-43.101235,-22.741624';

	//Init Twitter module
	var Twitter = require('twitter');

	//Should update this to read the credentials from an external source like a .json file or some environment variable
	var client = new Twitter({
	  consumer_key: 'rZxJRkHDll2JbKe9mucOOv912',
	  consumer_secret: 'g2gR3XGNCIj8Jl9cJiy6vTFhptTNkyCcXwDW7A0PgLa6GcBXl8',
	  access_token_key: '14435557-umfFbghUiTmFV57ydC9myFAM8Z7MXNBrh49l6tELl',
	  access_token_secret: 'TZg2FAFRIJt0bYbeAXY4SV30fp3ZxNpEa36S2bxuAMtgc'
	});
	
	//init tweet arrays
	var bhTweets= new Array();
	var rjTweets= new Array();
	var bhFinished = false;
	var rjFinished = false;
	
	
	//function to handle the stream of tweets
	function handleStream(stream,cityCode){
			//set the finish timeout of tweet collection using stream.destroy
			setTimeout(function (){stream.destroy()}, battleTimeInSeconds*1000); 
			stream.on('data', function(tweet) {
				// console.log(tweet.text);
				//store tweet
				if(cityCode=='bh'){
					bhTweets.push(tweet.text);
				}
				else{
					rjTweets.push(tweet.text);
				}
				
			});
 
			stream.on('error', function(error) {
				console.error("ERROR CONSUMING TWEETS - Error:"+error + " Error source:"+error.source);
				callback(error);
				return;
			});
			
			stream.on('end', function() {
				console.log("FINISHED CONSUMING TWEETS FROM  "+cityCode);
				finishFlag=true;
				if(cityCode=='bh'){
					bhFinished=true;
				}
				else{
					rjFinished=true;
				}
				if(bhFinished && rjFinished){
					callback(null,bhTweets,rjTweets);					
				}
			});
		}
	
	//start collecting tweets for RJ
	client.stream('statuses/filter', {locations: RJ_geobox},function(stream){ handleStream(stream,'rj');});
	//start collecting tweets for BH
	client.stream('statuses/filter', {locations: BH_geobox},function(stream){ handleStream(stream,'bh');});


}

// SPELL CHECKER STUFF
// I'M USING MY OWN *PUBLISHED* NPM MODULE HERE (HOW COOL IS THAT AHN?? AHN?? AHN ?? :-P ) - https://www.npmjs.com/package/spellchecker_ptbr
var spellchecker = require('spellchecker_ptbr');
async = require("async"); // we'll use async to handle asynchronous spell check

//HTTP EXPRESS - RECEIVING POST - WEB STUFF


var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());


// accept POST request at /fight and deals with it
app.post('/fight', function (req, res) {
	console.log("Request received req.body:"+JSON.stringify(req.body));
	if(isNaN(req.body.time)){
		res.status(500);
		res.send("Malformed body - A json object is expected Ex.:{\"time\":10}");
		return;
	}
	
	//getTweets(timeInSeconds,callback) where callback receives (err,bhArray,rjArray)
	getTweets(req.body.time,
		function(error, bhArray, rjArray){
			if(error){
				console.error("Error getting tweets "+error);
					console.log("res.headersSent:"+res.headersSent);
				if(!res.headersSent){
					res.status(500);
					res.send("Error getting tweets");
				}
				
				return;
			}
			
			console.log("collected "+ bhArray.length+ " tweets for BH and "+ rjArray.length+" tweets for RJ- starting spell check");
			//apply spell check on bhArray and rjArray 
			var typos=[0,0];//[bhTypos,rjTypos]
			
			var iterator=function(item, key, iteratorCallback){
				spellchecker.spellcheckCountArray(item,function(err,result){
					if(err){
						iteratorCallback(err);
						return;
					}
					//store typos count
					typos[key]=result;//key 0 = bh / key 1 = rj
					iteratorCallback();
				});
				
			};
			
			var finalCallback=function(err){
				if(err){
					console.log("Error during spellcheck "+err);
					if(!res.headersSent){
						res.status(500);
						res.send("Internal error");
					}
				}
				//prepare json response
				//{'bh': n_errors_bh, 'rio':n_errors_rio, 'winner': winning_city }
				var response = new Object();
				response.bh=typos[0];
				response.rio=typos[1];
				if(typos[0]<typos[1]){
					response.winner='bh';
				}
				else{
					response.winner='rio'
				}
				var resultStr=JSON.stringify(response);
				console.log(resultStr);
				res.send(resultStr);
			}
			
			//use async to process asynchronously bh and rj tweets
			async.forEachOf([bhArray, rjArray], iterator, finalCallback);
		}
	);
});

//error handler
app.use(function (err, req, res, next) {
		console.log("res.headersSent:"+res.headersSent);
		if(!res.headersSent){
			res.status(500);
			res.send("Error getting tweets");
		}
	}
);





//start server
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
