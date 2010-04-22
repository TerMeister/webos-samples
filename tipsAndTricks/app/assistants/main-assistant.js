function MainAssistant() {
    this.testRunnerHandler = this.testRunner.bind(this);
    this.customWidgetHandler = this.customWidget.bind(this);
}

MainAssistant.prototype.setup = function() {
    this.controller.setupWidget("testRunner", { label: $L("Test Runner") }, {});
    this.controller.setupWidget("customWidget", { label: $L("Custom Widget") }, {});

    this.controller.listen("testRunner", Mojo.Event.tap, this.testRunnerHandler)
    this.controller.listen("customWidget", Mojo.Event.tap, this.customWidgetHandler);
};

MainAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening("testRunner", Mojo.Event.tap, this.testRunnerHandler)
    this.controller.stopListening("customWidget", Mojo.Event.tap, this.customWidgetHandler);
};

MainAssistant.prototype.testRunner = function() {
    this.controller.stageController.pushScene("test-runner");
};

MainAssistant.prototype.customWidget = function() {
    this.controller.stageController.pushScene("custom-widget");
};
