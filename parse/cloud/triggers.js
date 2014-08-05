var _ = require('underscore');

Parse.Cloud.beforeSave("Amoeba", function(request, response) {

	breeder = request.object.get('breeder');
	console.log("Saving Amoeba: Breeder: "+JSON.stringify(breeder));


    breeder.fetch().then(function(breeder) {

    	totalFriends = breeder.get('numFriends');
	    console.log("Saving Amoeba: " + request.object.id + ", totalFriends: " + totalFriends);
	    if (isNaN(totalFriends)) {
	    	totalFriends = 0;
	    }
	    numAncestors = 0;

	    _.each(['parentA', 'parentB'], function(parentKey) {
			var parent = request.object.get(parentKey);

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

	    });

		request.object.set("numAncestors", numAncestors);
		request.object.set("totalFriends", totalFriends);

		console.log("Saving trigger-modified Amoeba: " + JSON.stringify(request.object));
		response.success();

    });
});