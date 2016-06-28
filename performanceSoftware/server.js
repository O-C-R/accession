var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rita = require('rita');
var lineReader = require('line-reader');
var fs = require('fs');
var ntp = require('socket-ntp');
var osc = require('node-osc');

//Array of possible socket clients
var maxClients = 6;
var clients = [];

//Control client - able to send control messages
var controlClient;

//OSC - Runs on port 3333
var OSCing = true;
var oscServer;
var oscClient;


if (OSCing) {
	
	/*
	var oscServer = new osc.Server(3333, '0.0.0.0');
	oscServer.on("message", function (msg, rinfo) {
	      console.log("OSC message:");
	      console.log(msg);
	});

	console.log('------------- OSC SERVER RUNNING.');
	*/

	var oscClient = new osc.Client('127.0.0.1', 4444);
	console.log('------------- OSC CLIENT INITIATED.');

}

sequence = 1;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('tele.html');
});

app.get('/control', function(req, res){
  res.sendfile('index.html');
});

app.get('/manual', function(req, res){
  res.sendfile('index_old.html');
});



//********************** SOCKET **************************

//Sync
io.sockets.on('connection', function (socket) {
	console.log('SYNCED');
  ntp.sync(socket);
});


// Event fired every time a new client connects:
io.on('connection', function(socket) {
    console.info('New client connected (id=' + socket.id + ').');
    socket.emit('handshake');

    // When socket disconnects, remove it from the list:
    socket.on('disconnect', function() {
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients[index] = null;
            console.info('Client gone (id=' + socket.id + ').');
        }
    });

    socket.on('request connection', function(msg) {
    	//Connection requested.
    	if (msg != -1) {
    		//Client already has an ID
    		clients[msg] = socket;
    		socket.emit('set id', msg);
    	} else {
    		//Assign client a new id
    		var i = 0;
    		while(clients[i]) {
    			i++;
    		}
    		clients[i] = socket;
    		socket.emit('set id', i);
    	}
    	
    });

    //reports
    socket.on('client report', function(msg) {
    	console.log('REPORT:' + msg.id + ":" + msg.message);
    	controlClient.emit('client report', msg);
    	oscClient.send('/scriptEvent', msg.scene, msg.id, msg.message);
    });

    //control messages
    socket.on('request control', function(msg) {
    	controlClient =  socket;
    });

    socket.on('scene finished', function(msg) {
    	finishScene(msg);
    })

    socket.on('control message', function(msg) {
    	var type = msg.split(':')[0];
    	var cmd = msg.split(':')[1];
    	var args = msg.split(':')[2];
    	switch(type) {
    		case 'start':
    			console.log('recieved start');
    			for (var i = 0; i < clients.length; i++) {
					if (clients[i] != null) clients[i].emit('start timer', cmd == null ? 0:cmd);
				}
				break;
    		case 'reset':
    			console.log('recieved reset');
    			for (var i = 0; i < clients.length; i++) {
					if (clients[i] != null && (cmd == undefined || i == cmd)) clients[i].emit('reset request', msg);
				}
				break;
			case 'clear':
				console.log('recieved clear' + cmd);

    			for (var i = 0; i < clients.length; i++) {
					if (clients[i] != null && (cmd == undefined || i == cmd)) clients[i].emit('clear request', msg);
				}

				break;

			case 'stop':
				console.log('recieved stop' + cmd);

    			for (var i = 0; i < clients.length; i++) {
					if (clients[i] != null && (cmd == undefined || i == cmd)) clients[i].emit('stop request', msg);
				}

				break;

			case 'display':
				console.log('recieved display' + cmd);

    			for (var i = 0; i < clients.length; i++) {
					if (clients[i] != null && (args == undefined || i == args)) {
						console.log('display request' + ":" + cmd)
						clients[i].emit('display request', cmd);
					}
				}

				break;

			case 'speed':
				console.log('recieved speed change:' + cmd);
				tick = cmd * 1000;
				var adjustSpeed = cmd;
				for (var i = 0; i < clients.length; i++) {
					if (clients[i] != null) clients[i].emit('set speed', adjustSpeed);
				}
				break;
			case 'scene':
				console.log('recieved scene set' + cmd);
				loadScene(cmd + ".txt", args);
				break
			case 'broadcast':
				console.log('received broadcast:' + cmd);
				if(args == null) {
					for (var i = 0; i < clients.length; i++) {
						if (clients[i] != null) clients[i].emit('broadcast', cmd);
					}
				} else {
					if (clients[args] != null) clients[args].emit('broadcast', cmd);
				}
				break
			case 'script':
				console.log('recieved script sent' + cmd + 'to ' + args);
				if (args != null) {
					sendScriptToSingleActor(cmd + ".txt", args);
				} else {
					for (var i = 0; i < clients.length; i++) {
						sendScriptToSingleActor(cmd + ".txt", i);
					}
				}
				break
			case 'burst':
				console.log('received burst command');
				sendTimerBurst();
				break;

			case 'reassign':
				console.log('received reassign');
				oldClients = [];
				for (var i = 0; i < clients.length; i++) {
					oldClients[i] = clients[i];
				}

				clients = [];
				for (var i = 0; i < oldClients.length; i++) {
					if (oldClients[i] != null) oldClients[i].emit('reassign', true);
				}


    	}
    });
});



//********************** TIMER **************************
var mc = 0;
var tick = 10000;
var globalDate = new Date();
var lastTime = globalDate.getTime();
var frameTime;
var t = 1;

function clockTick() {
	
	
}

setInterval(function() {
	var now = new Date();
	var elapsed = now.getTime() - lastTime;
	var frameElapsed = now.getTime() - frameTime;
	if (elapsed > tick) {
		clockTick();
		lastTime = now;
	}
	frameTime = now.getTime();
	//console.log(frameElapsed);
	checkSceneTimes(frameElapsed);
		
}, 30);


//********************** SCENE LOGIC **************************

var activeScenes = [];

var scriptBins = [];
var scriptNum = 0;
var sceneJSON;

function checkSceneTimes(elapsed) {
	for(var i = 0; i < activeScenes.length; i++) {
		var scene = activeScenes[i];
		scene.timing.currentTime += elapsed;
		//console.log(scene.name + ":" + scene.timing.currentTime + ":" + (scene.timing.duration * 1000));
		if (scene.timing.currentTime > scene.timing.duration * 1000) {
			console.log("SCENE IS OVER:" + scene.name);
			scene.alive = false;
			onSceneFinished(scene);
		}
	} 
	for(var i = 0; i < activeScenes.length; i++) {
		var scene = activeScenes[i];
		if (!scene.alive) {
			activeScenes.splice(i, 1);
		}
	}
}

function finishScene(name) {
	for(var i = 0; i < activeScenes.length; i++) {
		var scene = activeScenes[i];
		if (scene.name == name) {
			console.log("SCENE IS OVER:" + scene.name);
			scene.alive = false;
			onSceneFinished(scene);
		}
	}
}

function finishAllScenes() {

	for(var i = 0; i < activeScenes.length; i++) {
		var scene = activeScenes[i];
		console.log("SCENE IS OVER:" + scene.name);
		scene.alive = false;
		onSceneFinished(scene);

	}

}

function onSceneFinished(scene) {
	//clear
	console.log("SCENE FINISH EVENT" + scene);
	for(var i = 0; i < scene.actors.length; i++) {
		var a = scene.actors[i];
		console.log("CLEAR:" + a);
		if (clients[a] != null) clients[a].emit('clear request', false);
	}
}


function sendTimerBurst() {

	if (clients.length > 0) {
		for (var i = 2; i < 11; i++) {
			var c = Math.floor(Math.random() * clients.length);
			var msg = {
				message: i + ' seconds.',
				actors:[c],
				time: {
					pause:0,
					duration:i
				}
			}
			for (var j = 0; j < clients.length; j++) {
					if (clients[j] != null) clients[j].emit('script line', msg);
			}
		}
	}

	for (var j = 0; j < clients.length; j++) {
			if (clients[j] != null) clients[j].emit('set scene title', 'timer burst');
			if (clients[j] != null) clients[j].emit('start timer', false);
	}
}



function loadScene(url, forcedActors) {
	try {
		sceneJSON = JSON.parse(fs.readFileSync('public/scenes/' + url, 'utf8'));
		console.log('JSON injested.');

		//var alist = forcedActors == null ? sceneJSON.actors : forceActors.split("");
		//Set scene title
		for (var i = 0; i < sceneJSON.actors.length; i++) {
			var a = sceneJSON.actors[i];
			if (clients[a] != null) clients[a].emit('stop request', sceneJSON.name);
			if (clients[a] != null) clients[a].emit('set scene title', sceneJSON.name);
		}

		//Push lines from each script into an array
		//Maybe don't need this step (could read lines from files in next part)
		scriptBins = [];
		scriptNum = 0;
		var done = 0;
		fillScriptToBin(0);
	} catch(err) {
		console.log("Error loading JSON" + err);
	}

}

function fillScriptToBin(i) {
	var script = sceneJSON.scripts[i];
	scriptBins[i] = [];

	lineReader.eachLine('public/scripts/' + script.url, function(line, last) {
	  //console.log(line);
	  if (line.length > 0) scriptBins[i].push(line);

	  if (last) {
	  	onScriptLoaded(scriptNum,sceneJSON.scripts.length);
	    return false; // stop reading
	  }
	});

	scriptNum ++;
}

function onScriptLoaded(a,b) {
	console.log("DONE " + a + "/" + b);
	if (a == b) {
		sceneJSON.timing.currentTime = 0;
		sceneJSON.alive = true;
		activeScenes.push(sceneJSON);

		//Go through that array and assemble according to the indicated order
		var script = [];
		var totalLines = 0;
		var counts = [];
		var allLines = [];
		//Count the total lines
		for (var i = 0; i < scriptBins.length; i++) {
			//console.log(scriptBins[i]);
			if (sceneJSON.playback != null && sceneJSON.playback.order != null) {
				if (sceneJSON.playback.order == "random") {
					shuffle(scriptBins[i]);
				}
			}
			totalLines += scriptBins[i].length;
			counts[i] = 0;
			allLines = allLines.concat(scriptBins[i]);
		}

		console.log("TOTAL LINES" + totalLines);
		console.log(sceneJSON.actorOrder);

		//Is there a speed setting?
		if (sceneJSON.timing.speed != null) {
			//Send it to the actors
			for(var i = 0; i < sceneJSON.actors.length; i++) {
				var a = sceneJSON.actors[i];
				if (clients[a] != null) clients[a].emit('set speed', sceneJSON.timing.speed);
			}
		} else {
			for(var i = 0; i < sceneJSON.actors.length; i++) {
				var a = sceneJSON.actors[i];
				if (clients[a] != null) clients[a].emit('set speed', 1);
			}
		}

		//SOLOS
		if (sceneJSON.playback.solos != null) {
			for(var i = 0; i < sceneJSON.actors.length; i++) {
				var a = sceneJSON.actors[i];
				if (clients[a] != null) clients[a].emit('set solo', sceneJSON.playback.solos.indexOf(a) != -1);
			}
		} else {
			for(var i = 0; i < sceneJSON.actors.length; i++) {
				var a = sceneJSON.actors[i];
				if (clients[a] != null) clients[a].emit('set solo', false);
			}
		}

		if (sceneJSON.playback != null && sceneJSON.playback.type == "flat") {
			for(var i = 0; i < sceneJSON.actors.length; i++) {
				var a = sceneJSON.actors[i];
				var s = sceneJSON.scriptOrder[i];

				var bin = scriptBins[s];
				var script = [];
				for (var j = 0; j < bin.length; j++) {
					var l = bin[j];
					var t = 0.4 + (l.length * 0.1);
					var line = {
						actors:[a],
						time:{
							duration:t,
							delay:0
						},
						message:l,
						solo:false
					}
					script.push(line);
				}
				sendScript(script, [a]);
			}

		} else {
			console.log("ALL LINES:" + allLines.length);
			//Assemble the script - sequence
			for (var i = 0; i < totalLines; i++) {
				//var o = sceneJSON.scriptOrder[i % sceneJSON.scriptOrder.length];
				var ao = sceneJSON.actorOrder[i % sceneJSON.actorOrder.length];
				//var l = scriptBins[o][counts[o]];
				var l = allLines[i];

				var forcingActor = false;
			  	var forcedActors = [];
			  	var forcingTime = false;
			  	var forcedTime = 0;

			  	if (l != undefined) {
					//break;
				

					//does it have a forced actor assignment?
					if (l.indexOf("~") == 0) {
						forcingActor = true;
						//~1;10:Line for actor 2
						var commandLine = l.substring(1, l.length).split(":")[0];
						l = l.substring(1, l.length).split(":")[1];

						var actorLine = commandLine.split(";")[0];
						forcedActors = actorLine.split("");

						//does it have timing?
						if (commandLine.indexOf(";") != -1) {
							forcingTime = true;
							forcedTime = commandLine.split(";")[1];
						}
						

					}

					
					var t = 0.4 + (l.length * 0.1);
					var as = forcingActor ? forcedActors:[ao];

					var line = {
						actors:as,
						time:{
							duration:forcingTime ? forcedTime:t,
							delay:0
						},
						message:l,
						solo: false
					}
					script.push(line);
					//console.log(line);
					//counts[o]++;
					}
			}

			//send script
			sendScript(script, sceneJSON.actors);

		}

		//Start scene
		if (sceneJSON.playback == null || sceneJSON.playback.type != "flat") {
			var d = sceneJSON.timing.delay == null ? 0:sceneJSON.timing.delay;
			for(var i = 0; i < sceneJSON.actors.length; i++) {
				var a = sceneJSON.actors[i];
				console.log('start scene' + ":" +  a);
				if (clients[a] != null) clients[a].emit('start timer', d);
			}
		}


	} else {
		fillScriptToBin(scriptNum);
	}
}

function sendScriptToSingleActor(url, actor) {
		console.log("SCRIPT:" + url + " TO:" + actor);
		lineReader.eachLine('public/scripts/' + url, function(l, last) {
			  var t = 0.4 + (l.length * 0.09);

			  var forcingActor = false;
			  var forcedActors = [];
			  var forcingTime = false;
			  var forcedTime = 0;

				//does it have a forced actor assignment?
				if (l.indexOf("~") == 0) {
					forcingActor = true;
					//~1;10:Line for actor 2
					var commandLine = l.substring(1, l.length).split(":")[0];
					//console.log(commandLine);
					l = l.substring(1, l.length).split(":")[1];

					var actorLine = commandLine.split(";")[0];
					forcedActors = actorLine.split("");

					//does it have timing?
					if (commandLine.indexOf(";") != -1) {
						console.log("FORCING TIME.");
						forcingTime = true;
						forcedTime = commandLine.split(";")[1];
					}
					

				}

			  var msg = {
			    	message:l,
			    	actors:forcingActor ? forcedActors:[actor],
			    	time: {
			    		duration:forcingTime ? forcedTime:t,
			    		delay:0
			    	}
			   }
			  if (clients[actor] != null) clients[actor].emit('script line', msg);
			  if (clients[actor] != null) clients[actor].emit('set scene title', url);
		});

}

function sendScript(script, actors) {

		//for(var i = 0; i < script.length; i++) {
			console.log("SENDING " + script.length + " LINES TO:" + actors);
			for (var j = 0; j < actors.length; j++) {
			  var actor = actors[j];
			  if (clients[actor] != null) clients[actor].emit('script lines', script);
			}

			for (var i = 0; i < 20; i++) {
				//console.log(script[script.length - 30 + i]);
			}
		//};

}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};




http.listen(3000, function(){
  console.log('listening on *:3000');
});