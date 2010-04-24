/* Copyright 2010 Palm, Inc. All rights reserved. */

/**
 * Observable base implementation.
 */
var Observable = Class.create({
    initialize: function() {
        this.observers = [];
    },

    /**
     * Adds an observer to the notification list.
     * 
     * This method maintains a strong reference to the observer function,
     * so the caller should be careful to unregister the observer with
     * stopObserving when no longer needed.
     * 
     * @param fn Observer to remove
     */
    observe: function(fn){
        this.observers.push(fn);
    },

    /**
     * Removes an observer from our notification list.
     * 
     * @param fn Observer function to remove. This must be the same object passed to observe.
     */
    stopObserving: function(fn){
        var len = this.observers.length;
        for (var i = 0; i < len; i++) {
            if (this.observers[i] === fn) {
                this.observers.splice(i, 1);
                break;
            }
        }
    },

    /**
     * Notifies all observers.
     * 
     * @param data Data to pass to all observers.
     */
    notifyObservers: function(data) {
        var len = this.observers.length;
        for(var i = 0; i < len; i++) {
            this.observers[i](data);
        }
    }
});