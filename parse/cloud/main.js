
/*
 * This recursively queries for Amoeba parents.
 * accumulator: an array where Amoeba's are accumulated.
 */
var getAncestors = function(accumulator, amoebaId) {

	var promise = new Parse.Promise();

    var query = new Parse.Query("AmoebaId");
 
    query.get(amoebaId).then(
    	function(node) {

			parentA = node.get('parentA');
			parentB = node.get('parentB');
    		accumulator.push(node);
    		

    		if (parentA === undefined || parentB === undefined) {
	    		promise.resolve(accumulator);
	   		}
	   		else {

	   		    promises = [];
	   		    if (parentA !== undefined) {
	   		    	promises.push(getAncestors(accumulator, parentA.id));	   		    	
	   		    }
	   		    if (parentB !== undefined) {
	   		    	promises.push(getAncestors(accumulator, parentB.id));	   		    	
	   		    }
	   			// Recursive calls for parents, run in parallel via Parse.Promise.when method.
    			Parse.Promise.when(promises).then(
    				function(a,b) {
    					console.log("Inside parallel promise success");
    					promise.resolve(accumulator);
    				},
    				function(error) {
    					console.log("Inside parallel promise error");
    				    promise.reject(error);
    				});
	   		}

    	},
    	function(error) {
    		promise.reject(error);
    });

    return promise;

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

	accumulator = [];
	getAncestors(accumulator, request.params.amoebaId, limit, function(result) {

		if (request.params.orderBy && request.params.orderBy === 'score') {
			result = result.sort(function(a,b) { 
				bScore = b.get('totalFriends') / b.get('numAncestors');
				aScore = a.get('totalFriends') / a.get('numAncestors');
				return bScore - aScore;
			});
		}
		else {
			result = result.sort(function(a,b) { return b['createdAt'] - a['createdAt']});
		}

		// Remove self from ancestor list.
		selfi = -1;
		for (x in result) {
			if (result[x].id == request.params.amoebaId) {
				selfi = x;
			}
		}

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

