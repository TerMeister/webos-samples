/* Copyright 2010 Palm, Inc. All rights reserved. */

/**
 * Helper class that allows monitoring of observable objects, providing the option to defer any actions
 * until the associated scene or stage is active.
 * 
 * @param sceneController Controller of the scene this observer is to be associated with.
 */
var ObserverManager = function(sceneController) {
    this.sceneController = sceneController;
    this.observers = [];

    this.sceneActivatedHandler = this.sceneActivated.bindAsEventListener(this);
    this.sceneDeactivatedHandler = this.sceneDeactivated.bindAsEventListener(this);
    this.stageActivatedHandler = this.stageActivated.bindAsEventListener(this);
    this.stageDeactivatedHandler = this.stageDeactivated.bindAsEventListener(this);
};

ObserverManager.prototype = {
    /**
     * Initializes this manager. This should be called in the associated scene's
     * setup method.
     */
    setup: function() {
        var sceneController = this.sceneController,
            sceneElement = sceneController.sceneElement,
            stageDoc = sceneController.document;

        sceneElement.addEventListener(Mojo.Event.activate, this.sceneActivatedHandler, false);
        sceneElement.addEventListener(Mojo.Event.deactivate, this.sceneDeactivatedHandler, false);
        stageDoc.addEventListener(Mojo.Event.activate, this.stageActivatedHandler, false);
        stageDoc.addEventListener(Mojo.Event.deactivate, this.stageDeactivatedHandler, false);

        this.stageActive = sceneController.stageController.active;
        this.sceneActive = sceneController.stageController.topScene() == sceneController;
    },

    /**
     * Cleans the manager. This should be called in the associated scene's cleanup method.
     */
    cleanup: function() {
        var sceneElement = this.sceneController.sceneElement,
            stageDoc = this.sceneController.document,
            len = this.observers.length;

        sceneElement.removeEventListener(Mojo.Event.activate, this.sceneActivatedHandler, false);
        sceneElement.removeEventListener(Mojo.Event.deactivate, this.sceneDeactivatedHandler, false);
        stageDoc.removeEventListener(Mojo.Event.activate, this.stageActivatedHandler, false);
        stageDoc.removeEventListener(Mojo.Event.deactivate, this.stageDeactivatedHandler, false);

        // Unregister all observers to we do not maintain a reference to ourselves... and the controller.... and.....
        while (len--) {
            var data = this.observers[len];
            data.observable.stopObserving(data.handler);
        }
    },

    /**
     * Registers an observer with the given observable.
     * 
     * @param observable Observable object
     * @param observer Observer object
     * @param deferUntil Defer flag. May be one of ObserverManager.DeferUntil.
     * @param batchNotifications Truthy to only send a single deferred notification on activation. Falsey
     *        to receive a notification for each observer event while deactivated.
     */
    observe: function(observable, observer, deferUntil, batchNotifications) {
        var observeData = {
            observable: observable,
            observer: observer,
            deferUntil: deferUntil,
            batchNotifications: batchNotifications,
            deferred: []
        };
        observeData.handler = this.notifyObserver.bind(this, observeData);
        this.observers.push(observeData);

        observable.observe(observeData.handler);
    },

    /**
     * Unregisters an observer+observable pair.
     * 
     * This method will be called automatically on cleanup. This only needs to be called
     * explicitly if an observer is no longer required before the manager cleanup.
     * 
     * @param observable Observable object
     * @param observer Observer object
     */
    stopObserving: function(observable, observer) {
        var len = this.observers.length;
        while (len--) {
            var data = this.observers[len];
            if (data.observable === observable && data.observer === observer) {
                observable.stopObserving(data.handler);
                this.observers.splice(len, 1);
                return;
            }
        }
    },

    notifyObserver: function(observer, data) {
        if (!this.isDeferred(observer)) {
            Mojo.Log.info("ObserverManager.notify %s %s", this.sceneController.sceneName, this.sceneController.window.name);
            observer.observer.call(undefined, data);
        } else {
            Mojo.Log.info("ObserverManager.defer %s %s", this.sceneController.sceneName, this.sceneController.window.name);
            var deferred = observer.batchNotifications ? [] : observer.deferred;
            deferred.push(data);
            observer.deferred = deferred;
        }
    },

    sceneActivated: function(event) {
        Mojo.Log.info("ObserverManager.sceneActivated %s %s", this.sceneController.sceneName, this.sceneController.window.name);
        this.sceneActive = true;
        this.notifyDeferred();
    },
    sceneDeactivated: function(event) {
        Mojo.Log.info("ObserverManager.sceneDeactivated %s %s", this.sceneController.sceneName, this.sceneController.window.name);
        this.sceneActive = false;
    },

    stageActivated: function(event) {
        Mojo.Log.info("ObserverManager.stageActivated %s %s", this.sceneController.sceneName, this.sceneController.window.name);
        this.stageActive = true;
        this.notifyDeferred();
    },
    stageDeactivated: function(event) {
        Mojo.Log.info("ObserverManager.stageDeactivated %s %s", this.sceneController.sceneName, this.sceneController.window.name);
        this.stageActive = false;
    },

    notifyDeferred: function() {
        // Even though we do not guarantee order from here, follow the order registered
        var len = this.observers.length;
        for (var i = 0; i < len; i++) {
            var data = this.observers[i];
            Mojo.Log.info("ObserverManager.notifyDeferred: check %d %d %s %s", i, data.deferred.length, this.sceneController.sceneName, this.sceneController.window.name);
            if (data.deferred.length && !this.isDeferred(data)) {
                var deferred = data.deferred,
                    deferredLen = deferred.length;
                for (var deferredIter = 0; deferredIter < deferredLen; deferredIter++) {
                    // Irony... Dump off the callstack for each of these calls to isolate each handler
                    Mojo.Log.info("ObserverManager.notifyDeferred: %d %s %s", i, this.sceneController.sceneName, this.sceneController.window.name);
                    data.observer.curry(deferred[deferredIter]).defer();
                }
                data.deferred = [];
            }
        }
    },

    isDeferred: function(observer) {
        Mojo.Log.info("ObserverManager.isDeferred %s %d %d %s %s", observer.deferUntil, this.sceneActive, this.stageActive, this.sceneController.sceneName, this.sceneController.window.name);
        return (observer.deferUntil === ObserverManager.DeferUntil.SceneActive && !(this.sceneActive && this.stageActive))
            || (observer.deferUntil === ObserverManager.DeferUntil.StageActive && !this.stageActive);
    }
};

/**
 * ObserverManager defer flags.
 */
ObserverManager.DeferUntil = {
    /** Defer notifications until the scene is active. */
    SceneActive: "scene",
    /** Defer notifications until the stage is active. */
    StageActive: "stage",
    /** Deliever all notification immediately. */
    Immediate: ""
};
