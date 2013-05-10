$(function($){
	"use strict";
	
	window.Draw = window.Draw || {};
	
	Draw.Timer = Class.extend({
		
		init: function(handler, context, frameTime) {
			
			if(!handler) return;
			
			var timer = this;
			var realT = Date.now();
			
			timer.t = 1;
			timer.speed = 1;
			
			
			
			setInterval(
				function(){
					var now = Date.now()
					var deltaT = now - realT;
					realT = now;
					timer.t += deltaT * timer.speed;
					
					handler.call(context,timer.t);
				},
				frameTime
			);
		
			handler.call(context,timer.t);

		},
		
		setSpeed: function(speedMultiplier) {
			speedMultiplier = parseFloat(speedMultiplier);
			if(_.isNumber(speedMultiplier) && speedMultiplier > 0) {
				this.speed = speedMultiplier;
			}
			return this;
		},
		
		skip: function(milliseconds) {
			this.t += _.isNumber(milliseconds) ? milliseconds : 0;
			return this;
		}
		
	});
	
});