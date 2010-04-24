/* Copyright 2010 Palm, Inc. All rights reserved. */
/* Test Runner Assistant and Runner */
function TestRunnerAssistant() {
    this.tests = [
        new OperationQueueTest(),
        new ObserverManagerTest(),
        new CacheManagerTest(),
        new ServiceRequestWrapperTest(),
        new DataModelBaseTest(),
    ];
}

TestRunnerAssistant.prototype.setup = function() {
    this.infoEl = this.controller.sceneElement.querySelector(".test-status");
    this.failureLog = this.controller.sceneElement.querySelector(".failures");

    setTimeout(this.testRunner(0), 0);
};
TestRunnerAssistant.prototype.testsComplete = function() {
    this.infoEl.innerHTML = $L("Tests complete");
};

TestRunnerAssistant.prototype.testRunner = function(next) {
    var self = this;
    return function() {
        if (self.tests[next]) {
            self.infoEl.innerHTML = $L("Running test #{num}").interpolate({ num: next });
            self.tests[next].exec(self, self.testRunner(next+1));
        } else {
            self.testsComplete();
        }
    };
};

TestRunnerAssistant.prototype.failure = function(message) {
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

function execChain(assistant, cont, chain, next) {
    return function() {
        try {
            if (chain.length > next) {
                if (chain[next]._execChain_run) {
                    assistant.failure("Multiple execution of chain[" + next + "]");
                }
                chain[next]._execChain_run = true;
                Mojo.Log.info("Exec: %s", next);
                chain[next](assistant, execChain(assistant, cont, chain, next+1));
            } else {
                if (cont._execChain_run) {
                    assistant.failure("Multiple execution of cont");
                }
                cont._execChain_run = true;
                cont();
            }
        } catch (err) {
            DebugLogging.logError(err, "execChain: " + next + ":");
        }
    };
};
