var _ = require('underscore');

/*
 * This recursively queries for Amoeba parents.
 * accumulator: an array where Amoeba's are accumulated.
 */
var getAncestors = function(accumulator, amoebaId, limit) {

	var promise = new Parse.Promise();

    var query = new Parse.Query("Amoeba");
    query.include('breeder');  // ...because the UI wants amoeba.breeder.surname

    if (amoebaId in accumulator) {
        promise.resolve(accumulator);
        return promise;
    }

    query.get(amoebaId).then(
    	function(node) {

			parentA = node.get('parentA');
			parentB = node.get('parentB');
    		accumulator[node.id] = node;
    		
            // TODO: Add guards for circular references.
   		    promises = [];
   		    if (parentA !== undefined) {
   		    	promises.push(getAncestors(accumulator, parentA.id, limit));	   		    	
   		    }
   		    if (parentB !== undefined) {
   		    	promises.push(getAncestors(accumulator, parentB.id, limit));	   		    	
   		    }

            if (promises.length < 1 || _.keys(accumulator).length >= limit) {
                promise.resolve(accumulator);
            }
            else {
       			// Recursive calls for parents, run in parallel via Parse.Promise.when method.
    			Parse.Promise.when(promises).then(
    				function(a, b) {
    					promise.resolve(accumulator);
    				},
    				function(error) {
    				    promise.reject(error);
    				});
            }
    	},
    	function(error) {
            console.log("error: " + JSON.stringify(error));
            if (error.code == 101) {
                console.log("AmoebaId: " + amoebaId + " not found, so resolving.");
                promise.resolve(accumulator);
            }
            else {
        		promise.reject(error);
            }
        });

    return promise;

} 

exports.getAncestors = getAncestors;


var offspring = function(accumulator, amoebaId) {

 
    var promise = new Parse.Promise();

    var Amoeba = Parse.Object.extend('Amoeba');

    var amoeba = new Amoeba();
    amoeba.id = amoebaId;

    q1 = new Parse.Query("Amoeba").equalTo('parentA', amoeba);
    q2 = new Parse.Query("Amoeba").equalTo('parentB', amoeba);
    var query = Parse.Query.or(q1, q2);
 
    query.find().then(function(results) {
        // TODO: add guards for circular reference case.
        if (results.length == 0) {
            promise.resolve(accumulator);
        }
        else {

            promises = [];

            for (x in results) {
                accumulator.push(results[x]);
                promises.push(offspring(accumulator, results[x].id));
            }

            Parse.Promise.when(promises).then(
                function() {
                    promise.resolve(accumulator);
                },
                function(error) {
                    promise.reject(error);
                });
        }
    },
    function(error) {
        promise.reject(error);
    });



    return promise;

} 
 
exports.offspring = offspring;
