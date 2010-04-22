/* See LICENSE */
var CacheManager;
(function() {
    var cacheData = {};

    /**
     * Provides a simple cached data implementation.
     */
    CacheManager = function(cacheName, timeout) {
        this.cacheName = cacheName || "cacheManager";
        this.cacheTimeout = timeout || 24*60*60*1000;

        this.internalCache = cacheData[this.cacheName] || new InternalCache(this.cacheName);
    };
    CacheManager.prototype = {
        /**
         * Loads the cache data if available
         */
        load: function(entryName, onSuccess, onFailure) {
            this.internalCache.load(entryName, this.cacheTimeout, onSuccess, onFailure);
        },

        /**
         * Stores a dataset into the cache.
         */
        store: function(entryName, results) {
            this.internalCache.store(entryName, results);
        }
    };

    /*
     * Internal implementation. This is split out to allow multiple instances of
     * CacheManager to share the same memory caches.
     */
    var InternalCache = function(cacheName) {
        this.cacheName = cacheName;
        this.entries = {};

        this.queue = new OperationQueue();
        this.initCache(this.queue.getSuccessHandler(), this.queue.getFailureHandler());
    };
    InternalCache.prototype = {
        load: function(entryName, cacheTimeout, onSuccess, onFailure) {
            var self = this,
                cacheEntry = this.entries[entryName] || {};

            // Load from the in-memory cache if available
            if (cacheEntry.loaded) {
                var timeDelta = cacheEntry.timestamp - (new Date().getTime() - cacheTimeout);
                if (timeDelta < 0) {
                    cacheEntry.results = null;
                }
                setTimeout(function() {
                    onSuccess(cacheEntry.results, timeDelta);
                }, 0);
                return;
            }

            this.queue.queue(
                function() {
                    self.cacheDB.get(
                        entryName,
                        function(cache) {
                            self.loadCacheHandler(entryName, cacheTimeout, cache, onSuccess);
                        },
                        function(error) {
                            Mojo.Log.error("Failed to load store cache %s: %s", entryName, error);
                            onFailure && onFailure(error);
                        });
                    
                });
        },
        loadCacheHandler: function(entryName, cacheTimeout, cache, onSuccess) {
            var cacheEntry = this.entries[entryName] || {},
                timeDelta = cache && (cache.timestamp - (new Date().getTime() - cacheTimeout));
            if (timeDelta < 0) {
                cache.results = null;
            }

            // Only load from the cache if our cache has not expired and remote source has not beat us
            if (!cacheEntry.loaded) {
                cacheEntry.loaded = true;
                cacheEntry.results = cache && cache.results;
                cacheEntry.timestamp = cache && cache.timestamp;
                this.entries[entryName] = cacheEntry;

                Mojo.Log.info(
                        "Loaded %s from cache with timestamp: %j %o",
                        entryName, cacheEntry.timestamp, cacheEntry.results && cacheEntry.results.length);
                onSuccess(cacheEntry.results, timeDelta);
            }
        },

        store: function(entryName, results) {
            var cacheEntry = this.entries[entryName] || {},
                self = this;
            var cache = {
                timestamp: new Date().getTime(),
                results: results
            };

            // Update the memory cache
            cacheEntry.loaded = true;
            cacheEntry.timestamp = cache.timestamp;
            cacheEntry.results = results;
            this.entries[entryName] = cacheEntry;

            this.queue.queue(
                function() {
                    Mojo.Log.info("Saving %s to cache with timestamp: %j", entryName, cache.timestamp);

                    self.cacheDB.add(
                        entryName,
                        cache,
                        Mojo.doNothing,
                        function(error) {
                            Mojo.Log.error("Failed to store cache %s: %s", entryName, error);
                        });
                });
        },

        initCache: function(onSuccess, onFailure) {
            var self = this;

            if (!this.cacheDB) {
                this.cacheDB = new Mojo.Depot(
                    { name: this.cacheName, replace: false },
                    onSuccess,
                    function(error) {
                        Mojo.Log.error("Unable to construct cached model database: %j", error);
                        delete self.cacheDB;
                        if (onFailure) {
                            onFailure(error);
                        }
                    });
            } else {
                setTimeout(onSuccess, 0);
            }
        }
    };
})();
