
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




var getAmoebaAndAncestors = function(accumulator, nodeIds, limit, callback) {

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

			if (accumulator.length >= limit+1) {
				callback(accumulator);
			}

			getAmoebaAndAncestors(accumulator, nextNodeIds, limit, callback);

		}
		,
		error: function() { 
			response.error("Something went wrong.");
		}
	});

}

// getAncestors is the primary of a tail-recursive call to get the Nodes for all ancestors.
var getAncestors = function(nodeId, limit, callback) {
	accumulator= [];
	nodeIds = [];
	nodeIds.push(nodeId);
	getAmoebaAndAncestors(accumulator, nodeIds, limit, callback);
}


/*
 * POST
 * path: /1/functions/getAncestors
 * data: {'nodeId':'OvdQFjqPlE', 'orderBy':'score', "limit": 25}

 * returns: a document containing:
 * self: the target Node
 * ancestors: a list of ancestor nodes, sorted in createdAt time order by default or by 'score' order if
 *            specified in the request data.
 */

Parse.Cloud.define("getAncestors", function(request, response) {

	limit = parseInt(request.params.limit);

	if (isNaN(limit))  {limit = 25};

	getAncestors(request.params.nodeId, limit, function(result) {

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

		// Remove self from ancestor list.
		selfi = -1;
		for (x in result) {
			if (result[x].id == request.params.nodeId) {
				selfi = x;
				break;
			}

		}

		// Stash self in the result, as sibling to ancestors.
		self = selfi > -1 ? result.splice(selfi, 1)[0] : null;

		response.success({"count":result.length, "self": self, "ancestors": result});
	});

});


