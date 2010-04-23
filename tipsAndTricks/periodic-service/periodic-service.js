/* See LICENSE */
var PeriodicService;

(function() {
    const ALARM_SERVICE = "palm://com.palm.power/timeout";
    var instances = {};

    var appInfo = Mojo.Locale.readStringTable('appinfo.json');
    if (Mojo.Locale._objectIsEmpty(appInfo)) {
        appInfo = Mojo.appInfo;
    };

    /**
     * Base class used to create a periodic service.
     *
     * @param serviceName Unique name for the service. This is used for routing.
     * @param timeout Service interval. This is a string of the format hh:mm:ss in the range [00:00:01, 24:00:00]
     * @param outlivesApp Truthy if the service should execute if the app is not running or the phone is in sleep mode.
     *                    This should be used with care as this can have a dramatic impact on battery life.
     */
    PeriodicService = Class.create({
        initialize: function(serviceName, timeout, outlivesApp) {
            this.__defineGetter__("serviceName", function() { return serviceName; });
            this.timeout = timeout;
            this.outlivesApp = outlivesApp;

            Mojo.Log.info("Register Periodic Service: %s timeout:%s outlivesApp: %s", serviceName, timeout, outlivesApp);
            instances[this.serviceName] = this;
        },

        /**
         * Main execution method. Subclasses should implement this method.
         */
        run: function() {},

        /**
         * Returns the launch params for this service. Subclasses may override
         * this member to provide custom launch parameters. Note that subclasses
         * should return all values returned by the default implementation to
         * ensure proper routing of launch notifications.
         */
        getParams: function() {
            return { periodicKey: this.serviceName };
        },
        /**
         * Returns the timeout to wait for the first launch execution.
         * Valid values are:
         *     0 : Execute the first run immediately, synchronously
         *     Positive int : Execute first run after given timeout
         *
         *     Otherwise first run will occur after the timeout interval
         *     has expired.
         */
        getFirstLaunchTimeout: function() {
            return 5000;
        },
        /**
         * Returns truthy if the service is currently disabled. If disabled
         * any pending iterations will be ignored on triggering and the service
         * will not restart.
         */
        isDisabled: function() {
            return this.timeout <= "00:00:00" || "24:00:00" < this.timeout;
        },

        /**
         * Changes the timeout for the services and restarts the service.
         */
        setTimeout: function(timeout) {
            this.timeout = timeout;

            this.stop();
            this.runWrapper();
            this.start(true);
        },

        /**
         * Starts the service.
         *
         * @param skipLaunch Truthy to prevent immediate execution of the service after this call.
         */
        start: function(skipLaunch) {
            if (this.isDisabled() || this.started) {
                return;
            }

            var serviceName = this.serviceName;

            Mojo.Log.info("PeriodicService.start %s  %s", serviceName, this.outlivesApp);
            if (this.timeout >= '00:05:00' && this.outlivesApp) {
                new Mojo.Service.Request(ALARM_SERVICE, {
                    method: "set",
                    parameters: {
                        key: serviceName,
                        'in': this.timeout,
                        wakeup: false,
                        uri: "palm://com.palm.applicationManager/open",
                        params: {
                            id: appInfo.id,
                            params: this.getParams()
                        }
                    },
                    onFailure: function(error) {
                        Mojo.Log.error("PeriodicService.start %s : Failure %j", serviceName, error);
                    }
                });
            } else {
                if (this.outlivesApp) {
                    Mojo.Log.error("Warning periodic service marked as outlivesApp but period is too short: " + this.timeout);
                }

                var match = /(\d{2}):(\d{2}):(\d{2})$/.exec(this.timeout);
                if (match) {
                    var self = this,
                        hours = parseInt(match[1]),
                        minutes = parseInt(match[2]),
                        seconds = parseInt(match[3]);

                    this.timeoutId = setTimeout(
                        function() { self.handleLaunch(self.getParams()); },
                        ((hours*60+minutes)*60 + seconds)*1000);
                } else {
                    Mojo.Log.error("PeriodicService.start %s : Failure : Unrecognized timeout format %s", serviceName, this.timeout);
                }
            }

            var runTimeout = this.getFirstLaunchTimeout();
            if (!skipLaunch && (runTimeout || runTimeout === 0)) {
                if (runTimeout < 0) {
                    this.runWrapper();
                } else {
                    // Delay the first check slightly to allow the system some time to breathe
                    setTimeout(this.runWrapper.bind(this), runTimeout);
                }
            }

            this.started = true;
        },

        /**
         * Stops the service.
         */
        stop: function() {
            Mojo.Log.info("PeriodicService.stop %s", this.serviceName);
            new Mojo.Service.Request(ALARM_SERVICE, {
                method: "clear",
                parameters: {
                    key: this.serviceName
                }
            });
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                delete this.timeoutId;
            }
            this.started = false;
        },

        handleLaunch: function(params) {
            Mojo.Log.info("PeriodicService.handleLaunch %s running: %d", this.serviceName, this.running);
            if (this.isDisabled() || params.periodicKey !== this.serviceName) {
                return params;
            }

            this.stop();
            this.runWrapper(false, params);
            this.start(true);
        },
        runWrapper: function(force, params) {
            if ((force || !this.isDisabled()) && !this.running) {
                // It is possible that someone is calling this method from within their run handler implementation,
                // to prevent a stack overflow for this case we want to block reentrant calls to run.
                try {
                    this.running = true;
                    this.run(params || this.getParams());
                } finally {
                    this.running = false;
                }
            }
        },
    });

    /**
     * Routing logic for launch notifications. This should be called by the
     * app assistant's handleLaunch implementation. Will return undefined if
     * further launch command processing should be disabled.
     */
    PeriodicService.handleLaunch = function(params) {
        Mojo.Log.info("PeriodicSerivce.handleLaunch %j", params);
        var service = instances[params.periodicKey];
        if (service) {
            return service.handleLaunch(params);
        } else {
            return params;
        }
    };
    /**
     * Starts all registered services.
     */
    PeriodicService.startAll = function() {
        for (var i in instances) {
            if (instances.hasOwnProperty(i)) {
                instances[i].start();
            }
        }
    };
    /**
     * Stops all registered services.
     */
    PeriodicService.stopAll = function() {
        for (var i in instances) {
            if (instances.hasOwnProperty(i)) {
                instances[i].stop();
            }
        }
    };
})();