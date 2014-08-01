
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




var getNodeAndAncestors = function(accumulator, nodeIds, callback) {

	var query = new Parse.Query("Node");
	query.containedIn("objectId", nodeIds);
	query.include("parents");
	query.include("owner");

	// If handed an empty list of NodeIds, then return the accumulated result.
	if (nodeIds.length<1) {
		callback(accumulator);
	}

	console.log("In getNodeAndAncestors: " + nodeIds);
	query.find({
		success: function (results) {


			if (results.length < 1) {
				callback(accumulator);
			}

			console.log("Parsing result: " + JSON.stringify(results));

			nextNodeIds = [];

			for (i=0;i<results.length;i++) {

				parents = results[i]['parents'];
				console.log("NodeId: " + results[i]['objectId'] + ", Parents: " + parents);
				accumulator[results[i]['objectId']] = parents;

				
				for (j=0;parents !== undefined && j < parents.length;j++) {
					console.log("Adding parentId " + parents[j]['objectId'] + " to nextNodeIds.");
					nextNodeIds.push(parents[j]['objectId']);
				}

			}


			getNodeAndAncestors(accumulator, nextNodeIds, callback);

		}
		,
		error: function() { 
			response.error("Something went wrong.");
		}
	});

}

// getAncestors is the primary of a tail-recursive call to get the Nodes for all ancestors.
var getAncestors = function(nodeId, callback) {
	accumulator= {};
	nodeIds = [];
	nodeIds.push(nodeId);
	getNodeAndAncestors(accumulator, nodeIds, callback);
}


Parse.Cloud.define("getAncestors", function(request, response) {

	getAncestors(request.params.nodeId, function(result) {
		response.success(result);
	});

});