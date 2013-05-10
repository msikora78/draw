'use strict';

// Module dependencies.
var application_root = __dirname;
var express = require( 'express' ); //Web framework
var path = require( 'path' ); //Utilities for dealing with file paths
var mongoose = require( 'mongoose' ); //MongoDB integration
var _ = require( 'underscore' );
var string = require( 'string' );
var fs = require("fs");


var app = express();

//Connect to database
mongoose.connect( 'mongodb://localhost/draw' );

//Schemas
var Draw = new mongoose.Schema({
	sid: String,
	stroke: Array,
	t0: Number,
	t1: Number,
	pen: Object
});

var SessionRecord = new mongoose.Schema({
	_id: String, // sid from Draw schema
	timestamp: Number,
	imgUrl: String	
});


//Models
var DrawModel = mongoose.model( 'Draw', Draw );
var SessionRecordModel = mongoose.model( 'SessionRecord', SessionRecord );

// Configure server
app.configure( function() {
	//parses request body and populates request.body
	app.use( express.bodyParser() );

	//checks request.body for HTTP method overrides
	app.use( express.methodOverride() );

	//perform route lookup based on url and HTTP method
	app.use( app.router );

	//Where to serve static content
	app.use( express.static( path.join( application_root, 'site') ) );

	//Show all errors in development
	app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Routes
app.get( '/api', function( request, response ) {
	response.send( 'Draw API is running' );
});


app.post( '/api/thumbnail', function( request, response ) {
	
	debugger;
	var body = request.body;
	
	var base64img = body.img.replace(/^data:image\/png;base64,/,"");
	var sid = body.sid;
	var timestamp = Date.now();
	

	var imgUrl = 'saved/' + sid + '.png';
	var fileName = 'site/' + imgUrl;
	
	fs.writeFile(fileName, base64img, 'base64', function(err) {
			if( !err ) {
				var saveObject = {					
					timestamp: timestamp,
					imgUrl: imgUrl	
				};
			
			    var sessionRecord = new SessionRecordModel(saveObject);
			    SessionRecordModel.update({_id: sid},saveObject,{ upsert: true }, function( err ) {
			        if( !err ) {
			            return response.send('ok');
			        } else {
			            console.log( err );
			            return response.send(err);
			        }
			    });	
			} else {
				console.log( err );
				return response.send( err );
			}
	});
	
});

app.get( '/api/thumbnail', function( request, response ) {

	console.log(request.query);
	var queryArgs = request.query;
	var sid = queryArgs.sid;
	
	var findArgs = {};
	
	return SessionRecordModel
		.find( findArgs )
		.sort('-timestamp')		
		.exec(function( err, results ) {
			if( !err ) {
				return response.send( results );
			} else {
				console.log( err );
				return response.send( err );
			}
		});

});


app.post( '/api/draw', function( request, response ) {
	
	var body = request.body;
	
    var draw = new DrawModel(body);
    draw.save( function( err ) {
        if( !err ) {
            console.log( 'created:', body.sid, '   ',  body.t0, '-', body.t1 );
            return response.send('ok');
        } else {
            console.log( err );
            return response.send(err);
        }
    });	
	
});

app.get( '/api/play', function( request, response ) {
	console.log(request.query);
	var queryArgs = request.query;
	var sid = queryArgs.sid;
	
	var findArgs = { sid: sid };
	
	return DrawModel
		.find( findArgs )
		.sort('t0')		
		.exec(function( err, results ) {
			if( !err ) {
				return response.send( results );
			} else {
				console.log( err );
				return response.send( err );
			}
		});

});

//Start server
var port = 4711;
app.listen( port, function() {
	console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});