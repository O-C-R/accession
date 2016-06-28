/*

OCR / MoMA Data Prep (node.js)
The Office For Creative Research
June, 2016

*/

global.__base = __dirname + '/';

var rita = require('rita');
var lev = require('levenshtein');

var artistsJson = require(__base + 'data/collection/Artists.json');
var artworksJson = require(__base + 'data/collection/Artworks.json');

var artistsNLPed = [];
var artworksNLPed = [];

//Perform NLP tasks on artist names
for (var i = 0; i < artistsJson.length; i++) {
	var j = artistsJson[i];
	var name = j.DisplayName;
	var pos = rita.RiTa.getPosTags(name);
	var stresses = rita.RiTa.getStresses(name);
	var syllables = rita.RiTa.getSyllables(name);
	var syllableCount = syllables.split(/\//).length;
	
	j.NLP = {};
	j.NLP.NLPString = name;
	j.NLP.PartsOfSpeech = pos;
	j.NLP.Stresses = stresses;
	j.NLP.Syllables = syllables;
	j.NLP.SyllableCount = syllableCount;

	artistsNLPed.push(j);
}

//Perform NLP tasks on artwork names
for (var i = 0; i < artworksJson.length; i++) {
	var j = artworksJson[i];
	var title = rita.RiTa.stripPunctuation(j.Title);
	var pos = rita.RiTa.getPosTags(title);
	var stresses = rita.RiTa.getStresses(title);
	var syllables = rita.RiTa.getSyllables(title);
	var syllableCount = syllables.split(/\//).length;
	
	j.NLP = {};
	j.NLP.NLPString = title;
	j.NLP.PartsOfSpeech = pos;
	j.NLP.Stresses = stresses;
	j.NLP.Syllables = syllables;
	j.NLP.SyllableCount = syllableCount;

	artworksNLPed.push(j);
}

function countSyllables(s) {
	var syllables = 0;
  	var sswords = s.split(" ");
	 for (var i = 0; i < sswords.length; i++) {
	    syllables += sswords[i].split("/").length;
	 }
	 return(syllables);

}

//Save out new JSON
var jsonfile = require('jsonfile');
 
var file = __base + '/data/ArtistsNLP.json';
var obj = artistsNLPed;
 
jsonfile.writeFile(file, obj, {spaces: 2}, function(err) {
  console.error(err)
})

file = __base + '/data/ArtworksNLP.json';
obj = artworksNLPed;
 
jsonfile.writeFile(file, obj, {spaces: 2}, function(err) {
  console.error(err)
})
