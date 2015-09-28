twitterortographicwar_bh_vs_rj
==============================
A nodejs app that receives HTTP POST requests containing a "time" atribute in seconds, then collects tweets from Belo Horizonte, MG - Brazil and Rio de Janeiro,RJ - Brazil for the specified amount of time. After the collection, tweets sent to a spell checker in pt-BR. The information about the total of ortgraphic errors for each city is them provided as the POST response.

# Usage
1. dowload the app code
2. run <code>npm install</code> from the project root to install all the dependencies
3. start the app with <code>node app.js</code> - it will initialize an http server on port 3000
4. open a REST client and execute a post to localhost:3000/fight  with a json object in the body like {"time":10} and the header Content-Type:application/json. 

This will process tweets form bh and rj for the next 10 seconds and return a json response in the form of {'bh': n_errors_bh, 'rio':n_errors_rio, 'winner': winning_city } - Ex. {"bh":73,"rio":240,"winner":"bh"}.
