var fs = require("fs"),
    path = require("path"),
    rio = require("rio"),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    ioclient = require('socket.io-client')('http://localhost:33344'),
    _this = this,
    socketio_port = '33344',
    users = {},
    appid,
    appName,
    args = {};

args.vRegion="South";
 //console.log(rio)   


io.on('connection', function(socket){
	console.log('got a connection')
	var appname;

	socket.on('reload app', function(data, callback) {
	})

	socket.on('PushToR', function(data, callback) {
		console.log(data)
		var datastring=JSON.stringify(data);
		var datatest = JSON.parse(data)
		//socket.emit('reload status',data)
		rio.sourceAndEval(path.join(__dirname, "qlikR.R"), {
		    entryPoint: "putDataR",
		    data: datatest,
		    callback: putData
		});

        function putData(err, res) {
		    if (!err) {
		        var rdatafinal=res //res.substring(1,res.length-1)
		        console.log(JSON.parse(rdatafinal))
		        socket.emit('CalcResponse',res)
		    } else {
		        console.log("getData failed");
		        console.log(err)
		    }
		}

	});

});

http.listen(socketio_port, function(){
  console.log('listening on *:'+socketio_port);
});