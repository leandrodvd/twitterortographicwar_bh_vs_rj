twitterortographicwar_bh_vs_rj
==============================
A nodejs app that receives HTTP POST requests containing a "time" atribute in seconds, then collects tweets from Belo Horizonte, MG - Brazil and Rio de Janeiro,RJ - Brazil for the specified amount of time. After the collection, tweets sent to a spell checker in pt-BR. The information about the total of ortgraphic errors for each city is them provided as the POST response.

# Usage
1. dowload the app code
2. run <code>npm install</code> from the project root to install all the dependencies
3. start the app with <code>node app.js</code> - it will initialize an http server on port 3000
4. open a REST client and execute a post to localhost:3000/fight  with a json object in the body like {"time":10} and the header Content-Type:application/json. 

Using {"time":10} in the body request will process tweets form bh and rj for the next 10 seconds and return a json response in the form of {'bh': n_errors_bh, 'rio':n_errors_rio, 'winner': winning_city } - Ex. {"bh":73,"rio":240,"winner":"bh"}.

# Room for improvements
There are lots of possible improvements to be done. In fact a full refactor is welcome.
1. Add some tests. I created some tests for this solutions but it was not in a good format to add to the npm standard. Adding some tests using some node test framwework like Mocha and declaring the test inside the npm package.json would be good.

2. The biggest one is that, currently, the solution opens a new twitter stream for each new POST request. With this approach, if two simultaneous requests are received, two streams will be opened. This is a not a performatic solution and, depending on the usage, Twitter may block the stream requests. One possible better approach would be to open and keep a single stream when server is initialized, and emit an event for each tweet. Each post request would implement a sort of "collector" object that subscribes to those events t oexecute the count. The collector would exist only for the desired requested time interval.

3. Another possible improvement (alligned with the previous) is that, currently, the spell check is executed only after all tweets are collected, this makes the response time too big. A better approach would be to do the spell check right after each tweet is received (and them emmit an event containing the tweet and the typos count).

4. Increase error handling. Current error handling is not so good. Can be improved
