$(function($){
	"use strict";
	
	window.Draw = window.Draw || {};
	
	var DEFAULT_COLOR = '#000000';
	var DEFAULT_WIDTH = 10;
	var DEFAULT_CAP   = 'round';
	
	Draw.Pen = Class.extend({
		
		init: function(context, width, color) {
			this.context = context;
			this.width = width || DEFAULT_WIDTH
			this.color = color || DEFAULT_COLOR;
			this.context.lineCap = DEFAULT_CAP;			
		},
	
		
		drawLine: function ( p1, p2, width, color) {
			if(p1 && p2){
				var context = this.context;
						
				width = width || this.width;
				color = color || this.color;
				
				context.beginPath();
				context.moveTo(p1.x, p1.y);
				context.lineTo(p2.x, p2.y);
				context.lineWidth = width;
				context.strokeStyle = color;
				context.stroke();		
			}
		}
	});
});