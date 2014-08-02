
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
 * data: {'amoebaId':'OvdQFjqPlE', 'orderBy':'score', "limit": 25}

 * returns: a document containing:
 * self: the target Node
 * ancestors: a list of ancestor nodes, sorted in createdAt time order by default or by 'score' order if
 *            specified in the request data.
 */

Parse.Cloud.define("getAncestors", function(request, response) {

	limit = parseInt(request.params.limit);

	if (isNaN(limit))  {limit = 25};

	getAncestors(request.params.amoebaId, limit, function(result) {

		if (request.params.orderBy && request.params.orderBy === 'score') {
			result = result.sort(function(a,b) { return b['fame'] - a['fame']});
		}
		else {
			result = result.sort(function(a,b) { return b['createdAt'] - a['createdAt']});
		}

		// Remove self from ancestor list.
		selfi = -1;
		// stats = {'numAncestors':0, 'numAncestorFriends': 0};
		// for (x in result) {
		// 	if (result[x].id == request.params.amoebaId) {
		// 		selfi = x;
		// 	}
		// 	else {
		// 		stats['numAncestors'] += 1;
		// 		if 'breeder' in a
		// 		stats['numAncestorFriends']  += 
		// 	}

		// }

		// Stash self in the result, as sibling to ancestors.
		self = selfi > -1 ? result.splice(selfi, 1)[0] : null;

		response.success({"count":result.length, "self": self, "ancestors": result});
	});

});


Parse.Cloud.beforeSave("Amoeba", function(request, response) {

	parentKeys = ['parentA', 'parentB'];
	breeder = request.object.get('breeder');
	console.log("Saving Amoeba: Breeder: "+JSON.stringify(breeder));


    breeder.fetch().then(function(breeder) {

    	totalFriends = breeder.get('numFriends');
	    console.log("Saving Amoeba: " + request.object.id + ", totalFriends: " + totalFriends);
	    if (isNaN(totalFriends)) {
	    	totalFriends = 0;
	    }
	    numAncestors = 0;

		for (k in parentKeys) {
			var parent = request.object.get(parentKeys[k]);

			parent_totalAncestralFriends = 0;
			parent_numAncestors = 0;
			if (parent) {
				numAncestors += 1; // count parent
				parentAncestors = parent.get('numAncestors');
				if (parentAncestors) { // count parent-ancestors
					numAncestors += parentAncestors;
				}

				parentTotalFriends = parent.get('totalFriends');
				if (parentTotalFriends) {
					totalFriends += parentTotalFriends;
				}
			}
		}

		request.object.set("numAncestors", numAncestors);
		request.object.set("totalFriends", totalFriends);

		response.success();

    });
});