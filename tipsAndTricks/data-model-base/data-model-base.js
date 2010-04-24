/* See LICENSE */
/**
 * Provides a paging and caching implementation for data models who pull from remote data sources.
 */
var DataModelBase = Class.create({
    initialize: function(options) {
        this.options = Object.extend({
            lookahead: 20,
            initialPageSize: 20,
        }, options);

        this.cacheManager = new CacheManager(this.options.cacheName, this.options.cacheTimeout);
        this.refreshQueue = new OperationQueue();
        (this.refreshQueue.getSuccessHandler())();    // We want to start out in an open state

        this.cache = [];
        this.requestUpperBound = 0;
        this.blockedRequests = [];
        this.initialPageSize = this.options.initialPageSize;
    },

    /**
     * Primary interface of the model.
     * 
     * Note that the success callback may be called multiple times over the same range of offset+limit,
     * if a cache exists for the given model. Calls to this callback may also be broken into multiple
     * calls over the range [offset, offset+limit] based on data availability.
     * 
     * @param offset Offset to load in the general model.
     * @param limit Maximum number of elements to load.
     * @param onSuccess Success callback. Function with parameters (offset, limit, items)
     * @param onFailure Failure callback. Function with parameters (response)
     */
    getRange: function(offset, limit, onSuccess, onFailure) {
        if (offset < 0) {
            onFailure({ resopnseText: "Invalid offset: " + offset });
            return;
        }

        this.refreshQueue.queue({
                onSuccess: this.getRangeWorker.bind(this, offset, limit, onSuccess, onFailure),
                onFailure: onFailure
            });
    },

    /**
     * Throws out the cache and reloads the first page of data.
     * 
     * Note that this call will block all other data retrieval calls.
     * 
     * @param onSuccess Success callback. Function with parameters (results)
     * @param onFailure Failure callback. Function with parameters (response)
     */
    refresh: function(onSuccess, onFailure) {
        // We are requesting a larger buffer than our caller requested to reduce the number of request
        // to the slower datasource and to determine if we have loaded the complete dataset.
        var readLimit = this.initialPageSize + this.options.lookahead;

        if (!this.refreshQueue.complete) {
            // Just queue and quit
            Mojo.Log.info("Refresh of %s in process, queueing", this.getCacheName());
            this.refreshQueue.queue({
                    onSuccess: onSuccess,
                    onFailure: onFailure
                })
            return;
        }

        this.refreshQueue.reset();

        try {
            Mojo.Log.info("Refresh %s from remote. readLimit %d", this.getCacheName(), readLimit);
            this.loadRange(
                    0, readLimit,
                    this.refreshQueue.getSuccessHandler(
                            this.refreshSuccessHandler.bind(this, this.initialPageSize, readLimit, onSuccess)),
                    this.refreshQueue.getFailureHandler());
        } catch (err) {
            Mojo.Log.error("Refresh request failed: %s: %s", err);
            (this.refreshQueue.getFailureHandler())(err);
            throw err;
        }
    },

    /**
     * Returns the number of elements that are known to exist at this point. If complete
     * this is also the total number of elements.
     */
    getKnownSize: function() {
        return this.cache.length;
    },

    /**
     * Returns true if all elements have been loaded.
     */
    isComplete: function() {
        return !!this.complete;
    },

    /*
     * Methods to be implemented by child subclasses
     */

    /**
     * Callback method used provide a unique name for this model in the local cache.
     * Subclasses must implement this method.
     * @protected
     */
    getCacheName: function() {
        throw new Error("getCacheName: Not impl");
    },

    /**
     * Callback method used to load the data for this model from the remote store.
     * Subclasses must implement this method.
     * @protected
     */
    loadRange: function(offset, limit, onSuccess, onFailure) {
        throw new Error("loadRange: Not impl");
    },

    /**
     * Returns true if the given data set should mark the dataset complete.
     * The default implementation says that complete occurs when we do not
     * have limit elements read, but subclasses may override this for
     * more temperamental data sources.
     */
    setComplete: function(results, readLimit) {
        return results.length < readLimit;
    },

    /*
     * Internal methods.
     */
    getRangeWorker: function(offset, limit, onSuccess, onFailure) {
        var returnOffset = offset,
            returnLimit = limit;
        if (offset < this.cache.length) {
            // In memory cache is available, nice and easy now
            var inCache = Math.min(this.cache.length, offset+limit)-offset;
            onSuccess.curry(offset, inCache, this.cache.slice(offset, offset+inCache)).defer();

            // IF we are not getting anywhere near the end of the cache, do not send another request
            if (returnOffset+limit+this.options.lookahead < this.requestUpperBound) {
                return;
            }

            returnOffset += inCache;
            returnLimit -= inCache;
        }

        if (returnLimit && returnOffset < this.requestUpperBound) {
            var blockLimit = Math.min(returnLimit, this.requestUpperBound-returnOffset);
            this.blockedRequests.push({
                offset: returnOffset, limit: blockLimit,
                onSuccess: onSuccess, onFailure: onFailure
            });
            Mojo.Log.info("Pushed blocking queue: %j", this.blockedRequests[this.blockedRequests.length-1]);

            // IF we are not getting anywhere near the end of the cache, do not send another request
            if (returnOffset+limit+this.options.lookahead < this.requestUpperBound) {
                return;
            }

            returnOffset += blockLimit;
            returnLimit -= blockLimit;
        }

        Mojo.Log.info("offsets: offset: %d returnOffset: %d requestUpperBound: %d", offset, returnOffset, this.requestUpperBound);
        Mojo.Log.info("limit: limit: %d returnLimit: %d", limit, returnLimit);

        // Make more requests for anything that is not currently available.
        if (!this.isComplete()) {
            var readOffset = this.requestUpperBound,
                readLimit = limit;
            if (offset > readOffset) {
                readLimit = offset+limit-readOffset;
            }

            // We are requesting a larger buffer than our caller requested to reduce the number of request
            // to the slower datasource and to determine if we have loaded the complete dataset.
            readLimit = readLimit + this.options.lookahead;

            // Start a cache load if we have not already
            if (!offset) {
                this.cacheManager.load(
                        this.getCacheName(),
                        this.loadCacheSuccessHandler.bind(this, offset, limit, onSuccess));
            }

            Mojo.Log.info("Request %s from remote. Offset: %d limit: %d readOffset: %d readLimit %d known: %d", this.getCacheName(), offset, limit, readOffset, readLimit, this.getKnownSize());
            this.requestUpperBound = readOffset + readLimit;
            this.loadRange(
                    readOffset, readLimit,
                    this.loadRangeSuccessHandler.bind(this, offset, limit, readOffset, readLimit, returnOffset, returnLimit, onSuccess),
                    onFailure);
        }
    },
    loadCacheSuccessHandler: function(offset, limit, onSuccess, results) {
        if (!results) {
            // Cache not found
            return;
        }

        this.initialPageSize = results.length;
        this.cache = results;

        onSuccess(offset, limit, results.slice(0, limit));
    },
    loadRangeSuccessHandler: function(offset, limit, readOffset, readLimit, returnOffset, returnLimit, onSuccess, results) {
        this.complete = this.setComplete(results, readLimit);

        // TODO : Check to see if this is the same data a the cache. If so, do not notify (If possible)
        if (!readOffset) {
            // First load, store off the cache data
            Mojo.Log.info("Store load results: %j", results);
            this.cacheManager.store(this.getCacheName(), results);
            this.initialPageSize = readLimit;
        }

        Mojo.Log.info("Loaded %s from remote. Offset: %d readLimit: %d  known: %d results: %d", this.getCacheName(), offset, readLimit, this.getKnownSize(), results.length);

        // Load the new data into the memory cache
        var spliceArgs = $A(results);
        spliceArgs.unshift(readOffset, results.length);
        this.cache.splice.apply(this.cache, spliceArgs);

        if (returnLimit) {
            var sliceOff = returnOffset-readOffset,
                sliceLimit = sliceOff + returnLimit;
            onSuccess(returnOffset, returnLimit, results.slice(sliceOff, sliceLimit));
        } else {
            Mojo.Log.info("Unexpected return: %d read: %d", returnOffset, readOffset);
        }

        var len = this.blockedRequests.length,
            cacheLen = this.cache.length;
        for (var i = 0; i < len; i++) {
            var entry = this.blockedRequests[i];
            if (entry.offset < cacheLen) {
                this.blockedRequests.splice(i, 1);
                this.getRange(entry.offset, entry.limit, entry.onSuccess, entry.onFailure);
                i--;    len--;
            }
        }
    },

    refreshSuccessHandler: function(limit, readLimit, onSuccess, results) {
        Mojo.Log.info("Refreshed %s from remote. readLimit: %d  results: %d", this.getCacheName(), readLimit, results.length);

        var oldList = this.cache;

        this.complete = this.setComplete(results, readLimit);
        this.requestUpperBound = readLimit;
        this.cache = results;

        this.cacheManager.store(this.getCacheName(), results);

        onSuccess(results);
    }
});
