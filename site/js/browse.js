$(function($){
	"use strict";
	
	window.Draw = window.Draw || {};
		
	var url = location.origin + '/api/thumbnail';
	$.ajax({
		type: "GET",
		url: url,
		data: {},
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: showSessions, 
		failure: function(err) {
		    console.log(err);
		}
	});


	function showSessions(response) {
		
		if(response.length > 0) {
			_.each(response, function(item) {
				_.defer(function(item) {
					var url = location.origin + '?playSid=' + item._id;
					var $img = $('<img>')
						.attr('src', item.imgUrl)
						.click(function() {
							window.open(url);
						});					
					$('body').append($img);
				}, item);
			});		
		}
		
	
	}


});