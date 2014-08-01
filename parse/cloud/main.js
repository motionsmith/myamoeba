
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("nodes", function(request, response) {
	var query = new Parse.Query("Node");
        query.include("parents");
	query.find({
		success: function (results) {
			response.success(results);
		}
		,
		error: function() { 
			response.error("Something went wrong.");
		}
	});
});

Parse.Cloud.define("getAncestors", function(request, response) {
	
	var query = new Parse.Query("Node");
	query.equalTo("objectId", request.params.nodeId);
    query.include("parents");
    query.include("owner");
	query.find({
		success: function (results) {
			response.success(results);
		}
		,
		error: function() { 
			response.error("Something went wrong.");
		}
	});
});

