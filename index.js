var fs = require('fs')
var https = require('https')
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var Syslogd = require('syslogd')
var mongodb = require('mongodb');
var MONGODB_URI = 'mongodb://localhost/view';
var db;
var coll;

//enter your domain suffix here Ex: domain.com
var domain = 'DOMAIN.COM';
var sysloglistenport = 515;
var httpslistenport = 443;

function mongoConnect() {
	var options = { server: { reconnectTries: 2000, reconnectInterval: 1000 }}
	mongodb.MongoClient.connect(MONGODB_URI, options, function(err, database) {
		if(err) throw err;

		db = database;
		coll = db.collection('log');
		
		console.log('mongo connected!')
	});
}

mongoConnect();

Syslogd(function(info) {
}).listen(sysloglistenport, function(err) {
    console.log('start')
}).server.on('message', function(msg, rinfo) {
        //var info = Syslogd.parser(msg, rinfo)
		//if(info.msg.indexOf('ready to accept')>0) {
		//	console.log(msg.toString())
		//	console.log(info);
		//}
	var jsonmsg = parseViewSyslog(msg.toString())
    //console.log(jsonmsg)
	io.sockets.emit('message',jsonmsg)
	coll.insertOne(jsonmsg, function(err, result) {
		if(err) {
			console.log("Error:" + err);
			mongoConnect();
		} else {
			//console.log("Sent log to MongoDB");
		}
		//assert.equal(err, null);
		//callback();
	})
	//console.log()
	//console.log(msg.toString('utf8'))
        //me.handler(info)
})

function parseViewSyslog(msg) {
	//console.log(msg)
	var split = msg.split('=')
	var message = new Object
	//if(split.length>1) {
		message['Time'] = new Date(split[0].split(' ')[1])
		var variable = split[0].substring(split[0].lastIndexOf(' ') + 1)
		for(var i = 1; i <= split.length - 2; i++) {
			var pair = split[i].split('" ')
			if(variable=='UserDisplayName') {
				message[variable] = pair[0].substring(1).replace('\\\\','\\')
			} else {
				message[variable] = pair[0].substring(1)
			}
			variable = pair[1]
			//console.log(pair)
		}
		var offset = split[split.length - 1].indexOf('"] ')
		message[variable] = split[split.length - 1].substring(0, offset).substring(1).replace('\\','')
		message['Body'] = split[split.length - 1].substring(offset + 3).replace('\\\\','\\')
	//} else {
	//	message['Time'] = new Date()
	//	message['Body'] = msg
	//}
	//console.log(message['Body'])
	//console.log(message)
	return message
}

var server = https.createServer({
	key: fs.readFileSync('./cert.key'),
	cert: fs.readFileSync('./cert.crt'),
	//ca: fs.readFileSync('./ca.crt')
}, app).listen(httpslistenport)

var io = require('socket.io').listen(server)

io.sockets.on('connection',function (socket) {
	console.log('connection')
});

app.get('/search', function(req, res) {
        var search = req.query.search;
    var value = req.query.value;
        var limit = req.query.limit;
        var skip = req.query.skip;
        var regexValue='/'+value+'/';
        var query = {}
        if(search=="any" || value=="any") {
                //leave query empty
                console.log('empty query')
        } else {
        	if(search=='UserDisplayName') {
			query[search] = domain + '\\' + value
		} else {
			query[search] = value
		}
		console.log('Attempting string matching indexed search')
		console.log(query)
		coll.find(query).limit(parseInt(limit)).skip(parseInt(skip)).sort( { Time: -1 } ).toArray(function(err, documents) {
			console.log(documents.length)
			if(documents.length > 0) {
				console.log('String match returned results')
				res.send(documents)
			} else {
				query[search] = new RegExp(value, 'i')
				console.log('String match failed. Attempting regex match. This will take longer.')
                                console.log(query)
				coll.find(query).limit(parseInt(limit)).skip(parseInt(skip)).sort( { Time: -1 } ).toArray(function(err, documents) {
					console.log('Regex match returned results')
					res.send(documents)
				});
			}
		});
        //console.log(search)
        }
    //coll.find(query).limit(2).skip(5).toArray(function(err, documents) {
});

app.use(bodyParser.json());

app.use(express.static('./public'))
