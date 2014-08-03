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
