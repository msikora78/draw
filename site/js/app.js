$(function($){
	"use strict";
	
	window.Draw = window.Draw || {};
		
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');	
	var $canvas = $(canvas);
	var currentRequest = null, currentPoint = null, lastPoint = null, buttonDown = false;
	var activePen = new Draw.Pen(context);
	var drawTimer = new Draw.Timer();
	
	var sid = $.url(window.location).param('playSid');
			
	if(!sid){
		sid = Draw.Util.guid();
		window.location = window.location.origin + "?playSid=" + sid;
	}
	console.log("**** SID for this drawing is", sid,"****"); 

	var playSpeed = $.url(window.location).param('playSpeed') || 1;

	$('#colorpicker').farbtastic(function(color) {
		console.log(color);
		activePen.color = color;
	});

    $( "#widthSlider" ).slider({
      orientation: "horizontal",
      range: "min",
      min: 1,
      max: 60,
      value: 10,
      slide: function( event, ui ) {
      	var width = ui.value;
        $( "#widthValueDisplay" ).html( width );
		activePen.width = width;
      }
    });
    $( "#widthValueDisplay" ).html	( $( "#widthSlider" ).slider( "value" ) );

    $( "#playspeedSlider" ).slider({
      orientation: "horizontal",
      range: "min",
      min: 1,
      max: 30,
      step: 1, 
      value: playSpeed,
      slide: function( event, ui ) {
      	playSpeed = ui.value;
        $( "#playSpeedValueDisplay" ).html( playSpeed );
        drawTimer.setSpeed(playSpeed);
        
      }
    });
    $( "#playSpeedValueDisplay" ).html( $( "#playspeedSlider" ).slider( "value" ) );

	
	$('#btnNew').click(function() {
		window.location = window.location.origin + "?playSid=" +  Draw.Util.guid();
	});
	
	$('#btnReplay').click(function() {
		window.location = window.location.origin + "?" + $.param({ playSpeed: playSpeed, playSid: sid });
	});
	
	$('#btnSave').click(function() {
	
		var thumbnailCanvas = document.getElementById('thumbnailCanvas');
		var thumbnailCanvasContext = thumbnailCanvas.getContext('2d');
		thumbnailCanvasContext.drawImage(canvas,0,0,thumbnailCanvas.width,thumbnailCanvas.height);
		var img    = thumbnailCanvas.toDataURL("image/png");
		
		
		var request = {
			sid: sid,
			img: img
		};
		
		var url = location.origin + '/api/thumbnail';		
  		$.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(request),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(response){
				console.log(response);
			},
			failure: function(err) {
			    console.log(err);
			}
		});
		
		
	});
		
	
	
	
	
		
	$canvas.on({
		'mousedown': function(event){
			buttonDown = true;
			lastPoint = null;
			currentRequest = {
				sid: sid,
				stroke: []
			};
			var point = draw(event);
			currentRequest.t0 = point.t;
		},
	
		'mouseup mouseout': function(event){
			buttonDown = false;
			if(currentRequest) {
				var point = draw(event);
				lastPoint = null;
				currentRequest.t1 = point.t;
				currentRequest.pen = {
					width: activePen.width,
					color: activePen.color
				};
				send(currentRequest);
				currentRequest = null;
			}
		},
		
		'mousemove': function(event){
			if(buttonDown && currentRequest) draw (event);		
		}
	});
	
	function draw(event){
		var x = event.offsetX;
		var y = event.offsetY;
		var t = Draw.Util.getRelativeTimestamp(event.timeStamp);
		currentPoint = {
			x: x,
			y: y,
			t: t
		};
		
		activePen.drawLine( lastPoint, currentPoint);
				
		lastPoint = currentPoint;
		currentRequest.stroke.push(currentPoint);
		return currentPoint;
	}
		
	function send(request) {
	
		var url = location.origin + '/api/draw'
		
  		$.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(request),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(response){
				console.log(response);
			},
			failure: function(err) {
			    console.log(err);
			}
		});
	}
	
	function load(sid) {
		if(sid) {
			var url = location.origin + '/api/play';
	  		$.ajax({
				type: "GET",
				url: url,
				data: {sid:sid},
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: playDrawing, 
				failure: function(err) {
				    console.log(err);
				}
			});
		}
	}
	
	function parseDrawing(response){
		var play = []; 
		_.each(response, function(unit, i) {
			var stroke = _.each(unit.stroke, function(p1, i, stroke) {
				var p2 = stroke[i+1];
				if(p2) {
					play.push({
						p1: p1,
						p2: p2,
						t: p2.t,
						w: unit.pen.width,
						c: unit.pen.color
					});
				}
			});
		});
		return _.sortBy(_.flatten(play),'t');
	}
	
	load(sid);
	function playDrawing(response){		
		var currentPlay = parseDrawing(response);
		var playbackPen = new Draw.Pen(context);
		drawTimer = new Draw.Timer(
	
			function(currentTime){
				var t = 0;
				while(t <= currentTime && currentPlay.length) {
					var line = currentPlay.shift();
					t = line.t;
					playbackPen.drawLine(line.p1,line.p2,line.w, line.c);
				 }
			}
		, window, 16);
		drawTimer.setSpeed( playSpeed );
		parseDrawing(response);
	};
		    	
});