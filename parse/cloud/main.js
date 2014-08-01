
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




var getAmoebaAndAncestors = function(accumulator, nodeIds, callback) {

	var query = new Parse.Query("Amoeba");
	query.containedIn("objectId", nodeIds);
	query.include("parentA");
	query.include("parentB");
	query.include("breeder");
	query.include("owner");

	// If handed an empty list of NodeIds, then return the accumulated result.
	if (nodeIds.length<1) {
		callback(accumulator);
	}

	console.log("In getNodeAndAncestors: " + nodeIds);
	query.find({
		success: function (results) {


			console.log("Parsing results: " + JSON.stringify(results));

			nextNodeIds = [];

			for (i in results) {

				var node = results[i];
				parentA = node.get('parentA');
				parentB = node.get('parentB');

				if (parentA === undefined || parentB === undefined) {
					break;
				}
				console.log("NodeId: " + node.id + ", Parents: " + [parentA, parentB]);
				// accumulator[node.id] = results[i]; //[parentA, parentB];
				accumulator.push(results[i]);
				nextNodeIds.push(parentA.id);
				nextNodeIds.push(parentB.id);

			}

			getAmoebaAndAncestors(accumulator, nextNodeIds, callback);

		}
		,
		error: function() { 
			response.error("Something went wrong.");
		}
	});

}

// getAncestors is the primary of a tail-recursive call to get the Nodes for all ancestors.
var getAncestors = function(nodeId, callback) {
	accumulator= [];
	nodeIds = [];
	nodeIds.push(nodeId);
	getAmoebaAndAncestors(accumulator, nodeIds, callback);
}



Parse.Cloud.define("getAncestors", function(request, response) {

	getAncestors(request.params.nodeId, function(result) {

		if (request.params.orderBy && request.params.orderBy === 'score') {

			result = result.sort(function(a,b) { 

				af = 'breeder' in a && 'numFriends' in a['breeder'] ? a['breeder']['numFriends'] : 0;
				bf = 'breeder' in a && 'numFriends' in b['breeder'] ? b['breeder']['numFriends'] : 0;

				return af - bf;
			});
		}
		else {
			result = result.sort(function(a,b) { return a['createdAt'] - b['createdAt']});
		}


		response.success({"count":result.length, "ancestors": result});
	});

});


