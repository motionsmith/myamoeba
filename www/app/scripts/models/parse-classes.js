angular.module('MyAmoebaModels', []).
    factory('Amoeba', function() {
        var Amoeba = Parse.Object.extend('Amoeba', {
            //Instance methods
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
        
        Object.defineProperty(User.prototype, "username", {
            get: function() {
                return this.get("username");
            },
            set: function(val) {
                this.set("username", val);
            }
        });
        
        return User;
    });
        
        
        
        
