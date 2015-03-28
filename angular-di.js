var Injector = function () {
    this.dependencies = {};
    this.singletons = {};

    this.addDependency = function (dependencyName, injectables) {
        this.dependencies[dependencyName] = injectables;
    };

    this.resolveDependency = function (moduleName) {
        if (moduleName in this.dependencies) {
            return this.getSingleton(moduleName);
        } else {
            throw new Error("Dependency " + moduleName +
            " could not be loaded;")
        }
    };


    this.getSingleton = function (dependencyName) {
        if (!(dependencyName in this.singletons)) {
            // No instance exists for this singleton, create it now.
            this.singletons[dependencyName] = this.invoke(this.dependencies[dependencyName]);
        }
        return this.singletons[dependencyName];
    };

    this.extractArguments = function (fn) {
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        var FN_ARG_SPLIT = /,/;

        var argString = fn.toString().match(FN_ARGS);

        return argString[1].split(FN_ARG_SPLIT);
    };


    this.invoke = function (definition) {
        var dependencies, fn;
        if (typeof definition === 'function') {
            fn = definition;
            dependencies = this.extractArguments(fn);
        } else {
            // Map to convert dependencies from strings into the singleton object
            dependencies = definition.slice(0, -1);
            // Last item in the list is the module function
            fn = definition[definition.length - 1];
        }

        // Create singleton object for this module
        // By calling the module function with all dependencies
        return fn.apply(null, dependencies.map(this.resolveDependency, this));
    }
};

var Module = function (moduleName, dependencies) {
    this.$injector = new Injector();

    this.service = function (serviceName, dependencies) {
        this.$injector.addDependency(serviceName, dependencies);

        return this;
    };

    this.run = function (injectables) {
        this.$injector.invoke(injectables);

        return this;
    }
};

function NotAngular() {
    this.module = function (moduleName, dependencies) {
        return new Module(moduleName, dependencies);
    };
}

var angular = new NotAngular();
var module = angular.module('testModule', []);

module.service('$http', [function () {
    return {
        get: function (url) {
            return "Got data from: " + url;
        }
    }
}]);

module.service('dummyService', function ($http) {
    return {
        fetchJson: function () {
            return $http.get("example.json");
        }
    }
});

module.run(['dummyService', function (dummyService) {
    console.log(dummyService.fetchJson());
}]);