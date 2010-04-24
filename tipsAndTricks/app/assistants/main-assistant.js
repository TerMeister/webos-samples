function MainAssistant() {
    this.testRunnerHandler = this.testRunner.bind(this);
    this.customWidgetHandler = this.customWidget.bind(this);
    this.periodicServiceHandler = this.periodicService.bind(this);
    this.exampleListHandler = this.exampleList.bind(this);
}

MainAssistant.prototype.setup = function() {
    this.controller.setupWidget("testRunner", { label: $L("Test Runner") }, {});
    this.controller.setupWidget("customWidget", { label: $L("Custom Widget") }, {});
    this.controller.setupWidget("periodicService", { label: $L("Periodic Service") }, {});
    this.controller.setupWidget("exampleList", { label: $L("Paged List") }, {});

    this.controller.listen("testRunner", Mojo.Event.tap, this.testRunnerHandler)
    this.controller.listen("customWidget", Mojo.Event.tap, this.customWidgetHandler);
    this.controller.listen("periodicService", Mojo.Event.tap, this.periodicServiceHandler);
    this.controller.listen("exampleList", Mojo.Event.tap, this.exampleListHandler);
};

MainAssistant.prototype.cleanup = function(event) {
    this.controller.stopListening("testRunner", Mojo.Event.tap, this.testRunnerHandler)
    this.controller.stopListening("customWidget", Mojo.Event.tap, this.customWidgetHandler);
    this.controller.stopListening("periodicService", Mojo.Event.tap, this.periodicServiceHandler);
    this.controller.stopListening("exampleList", Mojo.Event.tap, this.exampleListHandler);
};

MainAssistant.prototype.testRunner = function() {
    this.controller.stageController.pushScene("test-runner");
};

MainAssistant.prototype.customWidget = function() {
    this.controller.stageController.pushScene("custom-widget");
};

MainAssistant.prototype.periodicService = function() {
    this.controller.stageController.pushScene("periodic");
};

MainAssistant.prototype.exampleList = function() {
    this.controller.stageController.pushScene("example-list");
};
