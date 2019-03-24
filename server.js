var cors = require('cors');
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(cors());

io.on('connection', () => {
    console.log("User connected just now!")
})

app.get('/appt', (req,res,next) => {
    
})

app.listen(3000, () => 
    console.log('listening to port 3000'),
);

require('dotenv').config();
var natural = require('natural');

var request = require('request');
var querystring = require('querystring');

var senttokenizer = new natural.SentenceTokenizer()

var wordtokenizer = new natural.WordTokenizer()

var keyex = require("keyword-extractor");

// Analyze text
//
// utterance = user's text
//

function luisprehandler(fullutterance)
{
    var sentences = senttokenizer.tokenize(fullutterance);
    for (sent of sentences)
    {
        getLuisIntent(sent)
    }
}

function luisposthandler(data)
{
    if (data.entities.length > 1)
    {
        for (entity of data.entities)
        {
            if (["BP::Systolic", "BP::Diastolic", "Disease", "Medication", "Test", "Unit"].includes(entity.type))
            {
                var exres = keyex.extract(data.query,
                {
                    language:"english",
                    remove_digits: true,
                    return_changed_case:true,
                    remove_duplicates: false
                })
                let start = data.entity.startIndex;
                let leftindex = 0;
                let rightindex = 0;
                for(var i = 0; i < exres.length; i++)
                {
                    if (data.query.indexOf(exres[i]) > start)
                    {
                        rightindex = data.query.indexOf(exres[i]) + exres[i].length
                    }
                }

                for (var i = exres.length; i >= 0; i--)
                {
                    if (data.query.indexOf(exres[i]) < start)
                    {
                        leftindex =  data.query.indexOf(exres[i])
                    }
                }
                
            }
        }
    }
    else
    {
        //Push to db the topScoringIntent
    }
}

function getLuisIntent(utterance) {

    // endpoint URL
    var endpoint =
        "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/";

    // Set the LUIS_APP_ID environment variable 
    // to df67dcdb-c37d-46af-88e1-8b97951ca1c2, which is the ID
    // of a public sample application.    
    var luisAppId = process.env.LUIS_APP_ID;

    // Read LUIS key from environment file ".env"
    // You can use the authoring key instead of the endpoint key. 
    // The authoring key allows 1000 endpoint queries a month.
    var endpointKey = process.env.LUIS_ENDPOINT_KEY;

    // Create query string 
    var queryParams = {
        "verbose":  true,
        "q": utterance,
        "subscription-key": endpointKey
    }

    // append query string to endpoint URL
    var luisRequest =
        endpoint + luisAppId +
        '?' + querystring.stringify(queryParams);

    // HTTP Request
    request(luisRequest,
        function (err,
            response, body) {

            // HTTP Response
            if (err)
                console.log(err);
            else {
                var data = JSON.parse(body);

                //luisposthandler(data);

                console.log(`Query: ${data.query}`);
                console.log(`Top Intent: ${data.topScoringIntent.intent}`);
                console.log('Intents:');
                console.log(JSON.stringify(data));
            }
        });
}

// Pass an utterance to the sample LUIS app
getLuisIntent('You have osteoporosis');
