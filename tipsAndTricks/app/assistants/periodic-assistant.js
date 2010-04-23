function PeriodicAssistant() {
    this.updateServiceHandler = this.updateService.bind(this);

    this.outliveModel = {
        value: ServiceExample.outlivesApp
    };
    this.timeoutModel = {
        value: ServiceExample.timeout
    };
}

PeriodicAssistant.prototype.setup = function() {
    this.controller.setupWidget("outlivesApp", {}, this.outliveModel);
    this.controller.setupWidget("interval", {}, this.timeoutModel);
    this.controller.setupWidget("updateService", { label: $L("Update Service") }, {});

    this.controller.listen("updateService", Mojo.Event.tap, this.updateServiceHandler);
};
PeriodicAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening("updateService", Mojo.Event.tap, this.updateServiceHandler);
};

/**
 * Notification handler. This will process any events from the example service (which is using
 * the sendToNotificationChain API) that occur while this scene is displayed and active.
 */
PeriodicAssistant.prototype.considerForNotification = function(params) {
    if (params.type === "example-notify") {
        this.controller.sceneElement.querySelector(".serviceOutput").innerHTML = Object.toJSON(params);
        return;
    }

    // Forward on to others on the notification chain
    return params;
};

/**
 * Button Tap Handler
 */
PeriodicAssistant.prototype.updateService = function() {
    // We really should save these in a cookie or some other persistence mechanism.
    // Since we are not doing this the cases where the application is not loaded in
    // any form will produce incorrect results.

    // Reset the state of the service
    ServiceExample.outlivesApp = this.outliveModel.value;
    ServiceExample.setTimeout(this.timeoutModel.value);
};
