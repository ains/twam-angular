function Injector() {
    this.modules = {};
    this.singletons = {};

    this.addModule = function (moduleName, injectables) {
        this.modules[moduleName] = injectables;
    };

    this.getSingleton = function (moduleName) {
        if (!(moduleName in this.singletons)) {
            this.singletons[moduleName] = this.invoke(this.modules[moduleName]);
        }
        return this.singletons[moduleName];
    };

    this.resolveDependency = function (moduleName) {
        if (this.modules[moduleName]) {
            return this.getSingleton(moduleName);
        } else {
            throw new Error("Dependency " + moduleName +
            " could not be loaded;")
        }
    };

    this.invoke = function (injectables) {
        // Last item in the list is the module function
        var fn = injectables.pop();

        // pop modifies the list - "injectables" now only contains dependencies
        // Map to convert dependencies from strings into the singleton object
        var dependencies = injectables.map(this.resolveDependency, this);

        // Create singleton object for this module
        // By calling the module function with all dependencies
        // Store singleton in loaded module
        return fn.apply(null, dependencies);
    }
}

function NotAngular() {
    this.injector = new Injector();


    this.module = function (moduleName, declaration) {
        this.injector.addModule(moduleName, declaration);
        return this;
    };

    this.run = function (injectables) {
        this.injector.invoke(injectables);
    }
}

var angular = new NotAngular();

angular.module('$http', [function () {
    return {
        get: function (url) {
            return "Got data from: " + url;
        }
    }
}]);

angular.module('testModule', ['$http', function ($http) {
    return {
        fetchJson: function () {
            return $http.get("example.json");
        }
    }
}]).run(['testModule', function (testModule) {
    console.log(testModule.fetchJson());
}]);