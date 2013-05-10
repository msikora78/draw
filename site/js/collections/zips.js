Zip.ZipCollection = Backbone.Collection.extend({
	url: '/api/zips',
	
	model: Zip.ZipModel,
	
    formQueryArgs: function(queryArgs) {
    	
    	if (!queryArgs) {
    		return {};
    	}
    	
    	var trimmedQueryArgs = {};
    	$.each(queryArgs, function (prop,val){
    		trimmedVal = $.trim(val);
    		if(trimmedVal != "") {
    			trimmedQueryArgs[prop] = trimmedVal;
    		}
    	});
    	
    	return trimmedQueryArgs;
    },	
    
    load: function (queryArgs, options) {
    	var options = options || {}; 
    	var _self = this;
    	_self.fetch({
    		data: _self.formQueryArgs(queryArgs),
    		success: $.proxy(_self.onSuccess, _self, queryArgs, options),
    		error: 	 $.proxy(_self.onError, _self, queryArgs, options),
    	 }
    	);
    },

	onSuccess: function(queryArgs, options) { 
		this.trigger('loaded', queryArgs);
		_.result(options.success);
	},
    
	onError:function(queryArgs, options) { 
		this.trigger('loadError', queryArgs);
		_.result(options.error);
	}    
    
    
});
