/*

OCR / MoMA API (node.js)
The Office For Creative Research
June, 2016

*/

global.__base = __dirname + '/';

var express = require('express')
require('express')

var moma = require('ocrmoma.js')

var app = express();

//API CALLS

//MATCH
app.get('/match/:corpus/', function(req, res){
  console.log(req.query);
  var input = req.query.input;
  var extension = req.query.extension ? req.query.extension:0;
  var weights = req.query.weights ? req.query.weights:"1,1,1,1";
  var max = req.query.max ? req.query.max:1;
  var format = req.query.format ? req.query.format:"JSON";

  var data = moma.getWordMatches(decodeURIComponent(input), req.params.corpus, extension, weights, max, (format == "image"));
  res.send(formatOut(data, format, req.params.corpus));
});

//CHAINS
app.get('/chain/:corpus/', function(req, res){

  var input = req.query.input;
  var loops = req.query.loops ? req.query.loops:10;
  var format = req.query.format ? req.query.format:"JSON";
  var weights = req.query.weights ? req.query.weights:"1,0.5,0,1";

  var outs = [];
  var c = 0;

  function getLoop(input, corpus) {
    var link = moma.getWordMatches(decodeURIComponent(input), corpus, 1, weights, 1, false);
    outs.push(link.results[0]);
    c++;
    if (c < loops) {
      console.log(link)
      getLoop(link.results[0].candidate.NLP.NLPString, corpus);
    }
  }
  getLoop(input, req.params.corpus);
  res.send(formatOut({"query":input, "corpus":req.params.corpus, "results":outs}, format, req.params.corpus));
});

function formatOut(data, mode, corpus) {
  var r = "";
  switch(mode) {
    case "JSON":
        r = JSON.stringify(data, null, 4);
        break;
    case "image":
        for (var i = 0; i < data.results.length; i++) {
          var result = data.results[i].candidate;
          r = r.concat("<img src='http://www.moma.org" + result.ThumbnailURL + "'>");
        }
        break;
    case "tombstone":
        if (corpus == "artworks") {
          for (var i = 0; i < data.results.length; i++) {
            var result = data.results[i].candidate;
            r = r.concat("<p>" + result.Title + ", " + result.Artist + ", " + result.Date + ", " + result.Medium + "</p>");
          }
        } else {
          for (var i = 0; i < data.results.length; i++) {
            var result = data.results[i].candidate;
            r = r.concat("<p>" + result.DisplayName + ", " + result.ArtistBio +  "</p>");
          }

        }
        break;
  }
  return(r);
}


//START IT UP.
var server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
});




