angular.module('MyAmoebaModels', []).
    factory('Amoeba', function() {
        var Amoeba = Parse.Object.extend('Amoeba', {
            //Instance methods
            getFullName: function() {
                var s = this.get('breeder').get('surname');
                if (s == 'undefined') {
                    s = '';
                }
                return '~' + this.get('name') + ' ' + s;
            }
        }, {
            //Class methods
        });
        
        Object.defineProperty(Amoeba.prototype, "owner", {
            get: function() {
                return this.get("owner");
            },
            set: function(val) {
                this.set("owner", val);
            }
        });
        
         Object.defineProperty(Amoeba.prototype, "name", {
            get: function() {
                return this.get("name");
            },
            set: function(val) {
                this.set("name", val);
            }
        });
        
         Object.defineProperty(Amoeba.prototype, "breeder", {
            get: function() {
                return this.get("breeder");
            },
            set: function(val) {
                this.set("breeder", val);
            }
        });
        
         Object.defineProperty(Amoeba.prototype, "parentA", {
            get: function() {
                return this.get("parentA");
            },
            set: function(val) {
                this.set("parentA", val);
            }
        });
        
         Object.defineProperty(Amoeba.prototype, "parentB", {
            get: function() {
                return this.get("parentB");
            },
            set: function(val) {
                this.set("parentB", val);
            }
        });
        
         Object.defineProperty(Amoeba.prototype, "recipient", {
            get: function() {
                return this.get("recipient");
            },
            set: function(val) {
                this.set("recipient", val);
            }
        });

        Object.defineProperty(Amoeba.prototype, "isDead", {
            get: function() {
                return this.get("isDead");
            },
            set: function(val) {
                this.set("isDead", val);
            }
        });
        
        return Amoeba;
    }).
    factory('MyAmoebaUser', function() {
        var User = Parse.User.extend({
        }, {
        });
        
        Object.defineProperty(User.prototype, "firstName", {
            get: function() {
                return this.get("firstName");
            },
            set: function(val) {
                this.set("firstName", val);
            }
        });
        
        Object.defineProperty(User.prototype, "lastName", {
            get: function() {
                return this.get("lastName");
            },
            set: function(val) {
                this.set("lastName", val);
            }
        });
        
        Object.defineProperty(User.prototype, "username", {
            get: function() {
                return this.get("username");
            },
            set: function(val) {
                this.set("username", val);
            }
        });
        
        Object.defineProperty(User.prototype, "numFriends", {
            get: function() {
                return this.get("numFriends");
            },
            set: function(val) {
                this.set("numFriends", val);
            }
        });
        
        Object.defineProperty(User.prototype, "surname", {
            get: function() {
                return this.get("surname");
            },
            set: function(val) {
                this.set("surname", val);
            }
        });
        
        return User;
    }).
    factory('ShareAmoebaRequest', function() {
        var ShareAmoebaRequest = Parse.Object.extend('ShareAmoebaRequest', {
            //Instance Methods
        },
        {
            //Class Methods
        });
        
        Object.defineProperty(ShareAmoebaRequest.prototype, "requester", {
            get: function() {
                return this.get("requester");
            },
            set: function(val) {
                this.set("requester", val);
            }
        });
        
        Object.defineProperty(ShareAmoebaRequest.prototype, "requestee", {
            get: function() {
                return this.get("requestee");
            },
            set: function(val) {
                this.set("requestee", val);
            }
        });

        return ShareAmoebaRequest;
    });
        
        
        
        
