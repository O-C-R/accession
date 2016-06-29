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

http://localhost:12892/match/*corpus*/*input*/*extension*/*weights*

corpus: 'artists' or 'artworks'
input: your search string
extension: how many words longer or shorter you'd like the returned objects(s) to be
weights: custom adjustment to the weightings applied to the NLP factors. *pattern*,*parts of speech*,*stressing*,*syllables*

example:

http://localhost:12892/match/artworks/test%20toy%20for%20boys%20and%20girls/0/0,0,1,0

##Installing the API on your own machine

1. Install node.js
2. npm install
3. node ocr-app.js

##Preparing data
