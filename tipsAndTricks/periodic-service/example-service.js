/* Copyright 2010 Palm, Inc. All rights reserved. */
/* PeriodicService example implementation. See periodic-service/README */
var ServiceExample;

(function() {
    var ServiceExampleClass = Class.create(PeriodicService, {
        initialize: function($super) {
            // Initializes the service to run once a day, regardless of the app/power state
            $super("com.palmdts.tipsAndTricks.exampleService", '24:00:00', true);

            this.counter = 0;
        },

        getParams: function($super) {
            var params = $super();
            params.date = new Date().getTime();
            return params;
        },

        run: function($super, params) {
            // Send a notification to the app chain who can display a UI for this event
            // if they so choose.
            Mojo.Controller.getAppController().sendToNotificationChain({
                type: "example-notify",
                data: params.date,
                counter: this.counter++
            });
        }
    });

    ServiceExample = new ServiceExampleClass();
})();
