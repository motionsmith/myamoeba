var _ = require('underscore');

/*
 * This recursively queries for Amoeba parents.
 * accumulator: an array where Amoeba's are accumulated.
 */
var getAncestors = function(accumulator, amoebaIds, limit) {

	var promise = new Parse.Promise();


    idList = _.filter(amoebaIds, function(x) { return !(x in accumulator);});

    if (idList.length < 1) {
        promise.resolve(accumulator);
        return promise;
    }

    var query = new Parse.Query("Amoeba");
    query.include('breeder');  // ...because the UI wants amoeba.breeder.surname
    query.containedIn('objectId', idList);

    console.log("ancestor query: " + JSON.stringify(query));
    query.find().then(
    	function(results) {

            promises = {};

            _.each(results, function(node) {

    			parentA = node.get('parentA');
    			parentB = node.get('parentB');
        		accumulator[node.id] = node;
        		
                // TODO: Add guards for circular references.
       		    if (parentA !== undefined) {
       		    	promises[parentA.id] = 1;	   		    	
       		    }
       		    if (parentB !== undefined) {
       		    	promises[parentB.id] = 1;
       		    }

            });
            promises = _.keys(promises);
            if (promises.length < 1 || _.keys(accumulator).length >= limit) {
                promise.resolve(accumulator);
            }
            else {
       			// Recursive calls for parents, run in parallel via Parse.Promise.when method.
    			Parse.Promise.when(getAncestors(accumulator, promises, limit)).then(
    				function(a, b) {
    					promise.resolve(accumulator);
    				},
    				function(error) {
    				    promise.reject(error);
    				});
            }
        
        });


    	// },
    	// function(error) {
     //        console.log("error: " + JSON.stringify(error));
     //        if (error.code == 101) {
     //            console.log("AmoebaId: " + amoebaId + " not found, so resolving.");
     //            promise.resolve(accumulator);
     //        }
     //        else {
     //    		promise.reject(error);
     //        }
     //    });

    return promise;

} 

exports.getAncestors = getAncestors;


var offspring = function(accumulator, amoebaIds) {

 
    var promise = new Parse.Promise();

    var Amoeba = Parse.Object.extend('Amoeba');

    // var amoeba = new Amoeba();
    // amoeba.id = amoebaId;

    parentList = {};
    _.each(amoebaIds, function(amoebaId) {
        a = new Amoeba();
        a.id = amoebaId;
        parentList[amoebaId] = a;
    });

    parentList = _.values(parentList);

    q1 = new Parse.Query("Amoeba").containedIn('parentA', parentList);
    q2 = new Parse.Query("Amoeba").containedIn('parentB', parentList);
    var query = Parse.Query.or(q1, q2);
    query.include('breeder');
 
    query.find().then(function(results) {
        // TODO: add guards for circular reference case.
        if (results.length == 0) {
            promise.resolve(accumulator);
        }
        else {

            promises = {};

            for (x in results) {
                a = results[x];
                if (a.id in accumulator) { continue; }
                accumulator[a.id] = a;
                promises[a.id] = 1;
            }

            promises = _.keys(promises);

            if (promises.length == 0) {
                promise.resolve(accumulator);
            }
            else {
                Parse.Promise.when(offspring(accumulator, promises)).then(
                    function() {
                        promise.resolve(accumulator);
                    },
                    function(error) {
                        promise.reject(error);
                    });
            }
        }
    },
    function(error) {
        promise.reject(error);
    });

    return promise;

} 
 
exports.offspring = offspring;
