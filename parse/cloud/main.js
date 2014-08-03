

var service = require('cloud/service.js');
triggers = require('cloud/triggers.js');

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});




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
	service.getAncestors(accumulator, request.params.amoebaId, limit, function(result) {

		if (request.params.orderBy && request.params.orderBy === 'score') {
			result = result.sort(function(a,b) { 

				tf = b.get('totalFriends');
				na = b.get('numAncestors');
				bScore = tf !== undefined && na !== undefined ? tf/na : 0;

				tf = a.get('totalFriends');
				na = a.get('numAncestors');
				aScore = tf !== undefined && na !== undefined ? tf/na : 0;

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




