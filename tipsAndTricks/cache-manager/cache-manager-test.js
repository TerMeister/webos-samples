function CacheManagerTest() {}

CacheManagerTest.prototype.exec = function(assistant, cont) {
    execChain(assistant, cont, [
                                this.noDataTest,
                                this.memLoadTest,
                                this.cacheLoadTest,
                                this.expireTest,
                                this.cacheNameTest,
                            ], 0)();
};

CacheManagerTest.prototype.noDataTest = function(assistant, cont) {
    var cache = new CacheManager();

    // Test no results without data
    cache.load(
        "entry_noData_" + new Date().getTime(),
        function(result) {
            if (result !== null) {
                assistant.failure("noData: Data returned: %o", result);
            }
            cont();
        },
        function(result) {
            assistant.failure("Failure called");
            cont();
        });
};

CacheManagerTest.prototype.memLoadTest = function(assistant, cont) {
    var cache = new CacheManager(),
        entryName = "entry_storage_" + new Date().getTime();

    // Test no results without data
    cache.store(entryName, [ 1, 2, 3 ]);
    if (!cache.internalCache.entries[entryName] || !cache.internalCache.entries[entryName].loaded) {
        assistant.failure("Cache not marked as loaded");
    }

    // Inject our own data into the in memory cache to verify that we are pulling from this
    cache.internalCache.entries[entryName].results = [ 2, 2, 2 ];

    Mojo.Log.info("memLoadTest");
    // Load the data from the same cache
    cache.load(
        entryName,
        function(result) {
            if (!result
                    || result[0] !== 2
                    || result[1] !== 2
                    || result[2] !== 2
                    || result.length !== 3) {
                assistant.failure("Unexpected data: " + Object.toJSON(result));
            }
            cont();
        },
        function(result) {
            assistant.failure("Failure called");
            cont();
        });
};

CacheManagerTest.prototype.cacheLoadTest = function(assistant, cont) {
    var cache1 = new CacheManager(),
        cache2 = new CacheManager();

    cache1.store("cacheLoad", [1,2,3]);
    if (!cache1.internalCache.entries.cacheLoad || !cache1.internalCache.entries.cacheLoad.loaded) {
        assistant.failure("Cache1 not marked as loaded");
    }

    // Guess at how long it will take to store. This may introduce some race conditions,
    // but I do not want to increase the complexity of the API for testing purposes only
    setTimeout(function() {
        // Force a depot hit
        delete cache2.internalCache.entries.cacheLoad;

        cache2.load(
            "cacheLoad",
            function(result) {
                if (!cache2.internalCache.entries.cacheLoad || !cache2.internalCache.entries.cacheLoad.loaded) {
                    assistant.failure("Cache2 not marked as loaded: " + Object.toJSON(cache2.internalCache.entries.cacheLoad));
                }
                if (result[0] !== 1
                        || result[1] !== 2
                        || result[2] !== 3
                        || result.length !== 3) {
                    assistant.failure("Unexpected data: %j");
                }
                cont();
            },
            function(result) {
                assistant.failure("Failure called");
                cont();
            });
    }, 500);
};

CacheManagerTest.prototype.expireTest = function(assistant, cont) {
    var cache1 = new CacheManager("expireTest", 100),
        cache2 = new CacheManager("expireTest", 100);

    cache1.store("cacheLoad", [1,2,3]);
    if (!cache1.internalCache.entries.cacheLoad || !cache1.internalCache.entries.cacheLoad.loaded) {
        assistant.failure("Cache1 not marked as loaded");
    }

    // Guess at how long it will take to store. This may introduce some race conditions,
    // but I do not want to increase the complexity of the API for testing purposes only
    setTimeout(function() {
        if (!cache1.internalCache.entries.cacheLoad || !cache1.internalCache.entries.cacheLoad.loaded) {
            assistant.failure("Cache1 not marked as loaded: " + Object.toJSON(cache1.internalCache.entries.cacheLoad));
        }
        cache2.load(
            "cacheLoad",
            function(result) {
                if (!cache2.internalCache.entries.cacheLoad || !cache2.internalCache.entries.cacheLoad.loaded) {
                    assistant.failure("Cache2 not marked as loaded");
                }
                if (result !== null) {
                    assistant.failure("noData: Data returned: %o", result);
                }

                cont();
            },
            function(result) {
                assistant.failure("Failure called");
                cont();
            });
    }, 500);
};

CacheManagerTest.prototype.cacheNameTest = function(assistant, cont) {
    var cache1 = new CacheManager("name1"),
        cache2 = new CacheManager("uniqueName");

    cache1.store("cacheLoad", [1,2,3]);
    if (!cache1.internalCache.entries.cacheLoad || !cache1.internalCache.entries.cacheLoad.loaded) {
        assistant.failure("Cache1 not marked as loaded");
    }

    // Guess at how long it will take to store. This may introduce some race conditions,
    // but I do not want to increase the complexity of the API for testing purposes only
    setTimeout(function() {
        // Force a depot hit
        delete cache2.internalCache.entries.cacheLoad;

        cache2.load(
            "cacheLoad",
            function(result) {
                if (!cache2.internalCache.entries.cacheLoad || !cache2.internalCache.entries.cacheLoad.loaded) {
                    assistant.failure("Cache2 marked as loaded: " + Object.toJSON(cache2.internalCache.entries.cacheLoad));
                }
                if (result !== null) {
                    assistant.failure("Unexpected data: %j", result);
                }
                cont();
            },
            function(result) {
                assistant.failure("Failure called");
                cont();
            });
    }, 500);
};
