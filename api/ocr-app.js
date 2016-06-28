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
app.get('/match/:corpus/:input/:extension/:weights/:max', function(req, res){
  var weightList = req.params.weights;
  res.send(JSON.stringify(moma.getWordMatches(decodeURIComponent(req.params.input), req.params.corpus, req.params.extension, weightList, req.params.max, false)), null, 4);
});

app.get('/match/:corpus/:input/:extension/:weights', function(req, res){
  var weightList = req.params.weights;
  res.send(JSON.stringify(moma.getWordMatches(decodeURIComponent(req.params.input), req.params.corpus, req.params.extension, weightList, 1, false)), null, 4);
});

app.get('/match/:corpus/:input/:extension', function(req, res){
  res.send(JSON.stringify(moma.getWordMatches(decodeURIComponent(req.params.input), req.params.corpus, req.params.extension, "1,1,1,1", 1, false)), null, 4); 
});

app.get('/match/:corpus/:input', function(req, res){
  res.send(JSON.stringify(moma.getWordMatches(decodeURIComponent(req.params.input), req.params.corpus, 0, "1,1,1,1", 1, false)), null, 4);
});

//CHAINS
app.get('/chain/:corpus/:input/:loops', function(req, res){
  var outs = [];
  var c = 0;

  function getLoop(input, corpus) {
    var link = moma.getWordMatches(decodeURIComponent(input), corpus, 1, "1,0.5,0,1", 1, false);
    outs.push(link);
    c++;
    if (c < req.params.loops) {
      console.log(link)
      getLoop(link.results[0].candidate.NLP.NLPString, corpus);
    }
  }
  getLoop(req.params.input, req.params.corpus);
  res.send(outs);
});

app.get('/chain/:corpus/:input/:loops/images', function(req, res){
  var outs = [];
  var c = 0;

  function getLoop(input, corpus) {
    var link = moma.getWordMatches(decodeURIComponent(input), corpus, 1, "1,0.5,0,1", 1, true);
    outs.push('<img src="http://www.moma.org' + link.results[0].candidate.ThumbnailURL + '">');
    c++;
    if (c < req.params.loops) {
      console.log(link)
      getLoop(link.results[0].candidate.NLP.NLPString, corpus);
    }
  }
  getLoop(req.params.input, req.params.corpus);
  res.send(outs.join(""));
});




//START IT UP.
var server = app.listen(12892, function() {
    console.log('Listening on port %d', server.address().port);
});




