Accession - The Office for Creative Research and The Museum of Modern Art
===================

In the Spring of 2015,The Office For Creative Research (OCR), in collaboration with Elevator Repair Service (ERS), presented A Sort of Joy (Thousands of Exhausted Things), a live performance at MoMA that used information from MoMA’s collection database as the source material for its script, exploring the Museum’s past and present exhibitions.

In preparations for this performance, we wrote a lot of code and created a lot of tools to help us dig through the linguistic territory of the database.

This repository hosts some data ephemera from the performance, as well as a newly-written API that carries on some of the thematic explorations that we endeavoured upon.

# Ephemera

An assortment of files that resulted from the project can be found in the performanceSoftware directory. This whole directory contains the ill-commented application that we used to suynchronize the iPAd displays that the performers used.

Probably the most interesting things are in performanceSoftware/public/scripts. If you came here for the list of artworks with profanity in their titles, or those with vegetables, this is where you should start. 

Please note that we can't and won't provide any support for the things that are in this directory. Sorry.

# API

##Using the API (For non-experts)

##Using the API (For data people)

###Base URL Construction:

http://localhost:12892/*mode*/*corpus*/

mode: 'match' or 'chain'
corpus: 'artists' or 'artworks'

###Parameters:

**input**  string
Location: query *?input=xyz*
- Search query term

**extension**  int
Location: query *?extension=1*
- How much longer (in words) you'd like returned artworks/artists to be than the input string

**weights**  string
Location: query *?weight=1,1,1,1*

- Ordered list of 0-1 weights to apply to the returned artworks/artists.
- Order of weights is:
*[0]: Pattern
*[1]: Parts of Speech
*[2]: Stressing pattern
*[3]: Syllables

**input**  format
Location: query *?format=JSON*
- Return format of the API response
- Valid formats are:
..* JSON
..* tombstone
..* image

###Examples:

- http://localhost:12892/match/artworks?input=big%20bird
- http://localhost:12892/match/artworks?input=big%20bird&extension=1
- http://localhost:12892/match/artworks?input=big%20bird&weights=1,0,0,1
- http://localhost:12892/match/artworks?input=big%20bird&format=image
- http://localhost:12892/match/artworks?input=big%20bird&max=20&format=tombstone



##Installing the API on your own machine

1. Install node.js
2. npm install
3. node ocr-app.js

##Preparing data
