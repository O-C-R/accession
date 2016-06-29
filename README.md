Accession: an API
===================
###The Office for Creative Research and The Museum of Modern Art

In the Spring of 2015,The Office For Creative Research (OCR), in collaboration with Elevator Repair Service (ERS), presented A Sort of Joy (Thousands of Exhausted Things), a live performance at MoMA that used information from MoMA’s collection database as the source material for its script, exploring the Museum’s past and present exhibitions.

In preparations for this performance, we wrote a lot of code and created a lot of tools to help us dig through the linguistic territory of the database.

This repository hosts some data ephemera from the performance, as well as a newly-written API that carries on some of the thematic explorations that we endeavoured upon.

# Ephemera

An assortment of files that resulted from the project can be found in the performanceSoftware directory. This whole directory contains the ill-commented application that we used to suynchronize the iPAd displays that the performers used.

Probably the most interesting things are in performanceSoftware/public/scripts. If you came here for the list of artworks with profanity in their titles, or those with vegetables, this is where you should start. 

Please note that we can't and won't provide any support for the things that are in this directory. Sorry.

# API

For years, we've been fascinated by the idea of APIs as art objects, and this particular API is a direct exploration of this concept.

As such, this API doesn't exactly behave how you might expect an API to behave. For one thing, it almost never will return you a result that is exactly what you're asking for. More than that, we've made the *way* that you ask the API questions abstract in itself, which means that using it is an experience that is at best serendipidous and at worst inexact.

We're going to explain how the API works twice; once for people who might not even know what an API is, and again for those of you who are more data saavy. 

For both of these sections, we'll be pointing to the version of this API that we're hosting at **INSERT URL HERE**. An easier way to explore this data might be for you to install the API on your own computer; instructions for this are down this page a little further.

##Using the API (For non-experts)

###Introduction
Alright, let's start at the beginning. What is an API?

The acronym stands for Application Programming Interface, but if you're reading this section this probably doesn't mean too much for you. An easier way to think about it is that an API is a bridge that lets one piece of software talk to another piece of software. For example a small piece of software on your phone (an app) can use the Twitter API to talk to the much larger piece of software that is Twitter. 

Want an even more abstract metaphor? If we think of a database as a warehouse, the API is the employee who sits behind a desk in the front office. When we, the customer, want to get something from the warehouse, we give our request to this employee (we'll call her Sharon) who then communicates to the warehouse and arranges delivery. Many APIs also allow us to give things to Sharon to be placed in the warehouse, but for now it's okat to think of this as a one-way pathway, from request to delivery.

So one day Sharon quits her job at BoringCorp and goes to work at MoMA. Her job is still more or less the same– she gets requests, and arranges delivery of data. But she decides that in her new job she's going to put her double major in Art History and Philosophy to work! So she decides that she'll only take abstract worded requests for data, and that her answers will always be a little bit cryptic, and that she'll have a little bit of fun with each delivery.

Yes, I know, this metaphor is getting tired. So let's dispose of it, but let's also keep in mind that when we're talking about the API in the following sections, we're *really* talking about Sharon.

###Asking questions

The core thing that this API can do is to provide lists of artowrks or artists that linguistically match a request. Put another way, the API can give us artists that sound or read like other artists, artworks whose titles sound or read like other artworks' titles, or artists or artwork titles that sound or read like any phrase that we can imagine.

It's probably easier to give an example. Let's find an artwork whose title sounds like the phrase 'go fish':

http://accession.ocr.nyc/match/artworks?input=go%20fish

If you try this in your browser, you'll get a pile of unreadable data on your screen. This is JSON, and we'll get to it later; for now we can change that URL a bit to return the type of information we might expect to read on a museum label:

http://accession.ocr.nyc/match/artworks?input=go%20fish&format=tombstone

By requesting 'go fish' we ended up with 'Soap Dish'. Let's try a couple more:

'Highway to the Danger Zone' becomes 'Entrance to the Banquet Hall':

http://accession.ocr.nyc/match/artworks?input=highway%20to%20the%20danger%20zone&format=tombstone

'Tit for Tat' becomes 'Food for Thought':

http://accession.ocr.nyc/match/artworks?input=tit%20for%20tat&format=tombstone

If we want to see more matches, we can ask for a higher max number of answers:

http://accession.ocr.nyc/match/artworks?input=tit%20for%20tat&format=tombstone&max=10

So 'Tit for Tat' ends up giving us:

1. Food For Thought, Joseph Beuys, 1977, Offset lithograph with stamp and grease spot
2. We for Not, Michael Cline, (2004), Synthetic polymer paint, ballpoint pen, and metallic ink on notebook paper
3. Love for Sale, Mildred Thompson, 1959, Etching
4. Day for Night, William Kentridge, 2003, 16mm film transferred to video (black and white, silent)
5. State of Play, Aleksandra Mir, 2004, Postcard
6. State of Play, Aleksandra Mir, 2004, Invitation brochure
7. T-Bone for Two, Clyde Geronimi, 1942, 35mm film
8. House for Sale, William Wegman, 1976-1977, Video (color, sound)
9. View from Bed, Dawn Clements, 2003, Ballpoint pen on cut-and-pasted paper on canvas
10. Tease for Two, Robert McKimson, 1965, 35mm film

We can do the same thing for artists:

http://accession.ocr.nyc/match/artists?input=Donald%20Trump

Thus finding out that the dead artist most likely to be mistaken for Donald Trump is Swiss illustrator Donald Brun. Who knew?

You'll notice that the matches that return are all the exact same number of words long as the input phrase that we use. What if we want slightly longer or slightly shorter ones?

A shorter version of 'Highway to the Danger Zone':

http://accession.ocr.nyc/match/artworks?input=highway%20to%20the%20danger%20zone&format=tombstone&extension=-1

A longer version of 'Tit for Tat':

http://accession.ocr.nyc/match/artworks?input=tit%20for%20tat&format=tombstone&extension=1

The algorithm that gives us back matches considers four things:
1. The *pattern* - the actual phrase that we input and the letters that make it up.
2. The *parts of speech* - the grammatical make-up of the phrase
3. The *stressing pattern* - how the phrase is spoken; where emphasis is
4. The *syllables* that make up the phrase

Our API allows us to change the priority that is given to each of these parts by adjusting some numbers that we call weights. For example the 'Soap Dish' example that we started with, which returned 'Soap Dish' uses the default weighting of 1,1,1,1:

http://accession.ocr.nyc/match/artworks?input=go%20fish&format=tombstone

If we change the weighting to focus only on parts of speech, we get a different, more nonsensical result ('Sleep (excerpt)'):

http://accession.ocr.nyc/match/artworks?input=go%20fish&format=tombstone&weights=0,1,0,0

Likewise if we change our 'Tit for Tat' example which returned 'Food for Thought' to focus on the pattern and syllables, we get a different result ('We for Not'):

http://accession.ocr.nyc/match/artworks?input=tit%20for%20tat&format=tombstone&weights=1,0,0,1

###Reading the Answers

If you are a human reading the results of this API, you probably want to use the *tombstone* format that we've been using so far in our examples.

But if you are actually using the API as it is intended, for a piece of software to talk to it, you'll probably want to use the JSON format. 

Finally, if you are the type of person who gets frustrated easily with text, you can ask for artwork results (not artists!) to be returned as images. Please note that only a fraction (~30%) of the database has images available, so this format will give you inherently different results than the other formats. 

###Uh... So What Can I **Do** With This?

####Write a Poem

In our performance, we used a series of what we called 'title chains' - lists of similar artwork titles that got longer with each step. These are little poetic wanders through MoMA's collection. A chain that starts with 'girl' looks like this:

A Girl
A Young Girl
A Young Factory Worker
The Old Factory Site, Canton
The Black Factory Archive: SUM Film
The Black Factory Archive: Josephine Baker Figurine
The Black Factory Archive: Digital Files and website
The Back of Half Dome, Yosemite National Park, California
Fir Forest in Snow, Wawona Road, Yosemite National Park, California
Half Dome, Thunder Clouds, from Glacier Point, Yosemite National Park, California

You can do this manually with 10 calls to the API using the 'extension' parameter. But we liked this mechanism so much that we made an endpoint for it. To get a chain for 'Donald Trump':

http://accession.ocr.nyc/chain/artworks?input=Donald%20Trump&format=tombstone

####Compose a Song

One of the audience's favourite part from our performance was a song that we constructed from artists' names, put to the tune of 'My Favorite Things'. We did this with assistance from the same type of language analysis that we built into this API. For example, we can use two calls to the API to turn 'Raindrops on roses and whiskers on kittens' into 'Linda van Deursen and Richard Van Buren'. 'Bright copper kettles and warm woolen mittens' becomes 'George Mather Richards and Hans Hermann Steffens'.

We can do the same thing with artist titles:

Landscape with Noses and Workers and Paintings
Trieste Ledger Series and Farm Couple Spinning
My Mother Posing for Me in Palm Springs
These are a few of my favorite things

Because the API considers things like stressing patterns and syllables, the result is (go ahead and try it) perfectly singable.

####Make a Stream of Conciousness Collage

Using the image format parameter, you can get nice collages of images based on search terms. These usually start in somewhat expected places, then ramble off into abstraction and loose connections. Here are a few examples:

Telephone:

<a href='https://postimg.org/image/m5fsadr47/' target='_blank'><img src='https://s31.postimg.org/m5fsadr47/telephone.png' border='0' alt="telephone"/></a><br/><br/>

Tree:

<a href='https://postimg.org/image/sx67d8g3r/' target='_blank'><img src='https://s31.postimg.org/sx67d8g3r/tree.png' border='0' alt="tree"/></a><br/><br/>

Nude:

<a href='https://postimg.org/image/cng1ac5fr/' target='_blank'><img src='https://s31.postimg.org/cng1ac5fr/nude.png' border='0' alt="nude"/></a><br/><br/>

Man:

<a href='https://postimg.org/image/e98hpt1if/' target='_blank'><img src='https://s31.postimg.org/e98hpt1if/man.png' border='0' alt='postimage'/></a>

Woman:

<a href='https://postimg.org/image/u209im2kn/' target='_blank'><img src='https://s31.postimg.org/u209im2kn/woman.png' border='0'>

####Something Actually Useful

Just kidding. There's nothing actually useful you can do with this API.

##Using the API (For data people)

###Base URL Construction:

http://accession.ocr.nyc/*mode*/*corpus*/

- mode: 'match' or 'chain'
- corpus: 'artists' or 'artworks'

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
- Valid formats are: *JSON, tombstone, image*

###Examples:

- http://accession.ocr.nyc/match/artworks?input=big%20bird
- http://accession.ocr.nyc/match/artworks?input=big%20bird&extension=1
- http://accession.ocr.nyc/match/artworks?input=big%20bird&weights=1,0,0,1
- http://accession.ocr.nyc/match/artworks?input=big%20bird&format=image
- http://accession.ocr.nyc/match/artworks?input=big%20bird&max=20&format=tombstone


##Installing the API on your own machine

First, clone the repo from GitHub.

There are two large files in the repo - ArtistsNLP.json and ArtworksNLP.json. You have two options to get these:

1. Download manually and add them to the repo: https://github.com/O-C-R/accession/blob/master/api/data/ArtistsNLP.json https://github.com/O-C-R/accession/blob/master/api/data/ArtworksNLP.json 
2. Get them using git-lfs (pointers are in the repo and a 'git lfs pull' should pull them down)

1. Install node.js
2. npm install
3. node ocr-app.js
4. access endpoints at accession.ocr.nyc

##Preparing data

##Credits

MoMA's data is in the public domain under a CC0 License: https://creativecommons.org/share-your-work/public-domain/cc0/
This code is released under a CC BY License: https://creativecommons.org/licenses/by/4.0/
