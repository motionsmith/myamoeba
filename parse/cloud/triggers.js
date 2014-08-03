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