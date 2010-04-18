function FirstAssistant() {
    this.tests = [
        new OperationQueueTest()
    ];
}

FirstAssistant.prototype.setup = function() {
    this.infoEl = this.controller.sceneElement.querySelector(".test-status");
    this.failureLog = this.controller.sceneElement.querySelector(".failures");

    var len = this.tests.length;
    for (var i = 0; i < len; i++) {
        this.runTest(i);
    }
    this.infoEl.innerHTML = $L("Tests complete");
};

FirstAssistant.prototype.runTest = function(i) {
    this.infoEl.innerHTML = $L("Running test #{num}").interpolate({ num: i });
    this.tests[i].exec(this);
};

FirstAssistant.prototype.failure = function(message) {
    var li = this.controller.document.createElement("li");
    li.innerHTML = message;
    this.failureLog.appendChild(li);

    Mojo.Log.error(message);

    try {
        throw new Error("Tracing");
    } catch (err) {
        DebugLogging.logError(err, "|    stack: ");
    }
};
