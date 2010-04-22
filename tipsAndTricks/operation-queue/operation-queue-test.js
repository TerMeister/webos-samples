function OperationQueueTest() {}

OperationQueueTest.prototype.exec = function(assistant,  cont) {
    Mojo.Log.info("Executing tests: operationqueuetest");
    this.successTest(assistant);
    this.postSuccessTest(assistant);
    this.failureTest(assistant);
    this.postFailureTest(assistant);
    this.resetSuccessTest(assistant);
    this.resetFailureTest(assistant);
    Mojo.Log.info("Completed tests: operationqueuetest");

    cont();
};

OperationQueueTest.prototype.successTest = function(assistant) {
    var queue = new OperationQueue(),
        responses = [];

    this.overrideExec(queue);

    queue.queue(function(result) {
        if (result !== "Success") {
            assistant.failure("Unexpected result: " + result);
        }
        responses.push(1);
    });
    queue.queue({
        onSuccess: function(result) {
            if (result !== "Success") {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(2);
        },
        onFailure: function(result) {
            assistant.failure("Failure handler called");
        }
    });
    queue.queue({
        onFailure: function(result) {
            assistant.failure("Solo Failure handler called");
        }
    });

    if (responses.length) {
        assistant.failure("Handlers called prior to exec");
    }

    var success = queue.getSuccessHandler();
    success("Success");

    if (responses.length !== 2) {
        assistant.failure("Unexpected callback count: " + responses.length);
    }
    this.verifyResults("succes responses", responses, assistant);
};

OperationQueueTest.prototype.postSuccessTest = function(assistant) {
    var queue = new OperationQueue(),
        responses = [];

    this.overrideExec(queue);

    var success = queue.getSuccessHandler(function(result) {
        if (result !== "Success") {
            assistant.failure("Unexpected result: " + result);
        }
        responses.push(0);
    });
    success("Success");
    if (responses.length !== 1 || responses[0] !== 0) {
        assistant.failure("Failed to execute immediate callback 1");
    }

    queue.queue(function(result) {
        if (result !== undefined) {
            assistant.failure("Unexpected result: " + result);
        }
        responses.push(1);
    });
    if (responses.length !== 2 || responses[1] !== 1) {
        assistant.failure("Failed to execute immediate callback 1");
    }

    queue.queue({
        onSuccess: function(result) {
            if (result !== undefined) {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(2);
        },
        onFailure: function(result) {
            assistant.failure("Failure handler called");
        }
    });
    if (responses.length !== 3 || responses[2] !== 2) {
        assistant.failure("Failed to execute immediate callback 2");
    }

    queue.queue({
        onFailure: function(result) {
            assistant.failure("Solo Failure handler called");
        }
    });
    if (responses.length !== 3 || responses[2] !== 2) {
        assistant.failure("Callback 3 improperly called");
    }
};

OperationQueueTest.prototype.resetSuccessTest = function(assistant) {
    var queue = new OperationQueue(),
        responses = [],
        success = queue.getSuccessHandler();

    success("Success");
    queue.reset();

    this.overrideExec(queue);

    queue.queue(function(result) {
        if (result !== "Success") {
            assistant.failure("Unexpected result: " + result);
        }
        responses.push(1);
    });
    queue.queue({
        onSuccess: function(result) {
            if (result !== "Success") {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(2);
        },
        onFailure: function(result) {
            assistant.failure("Failure handler called");
        }
    });
    queue.queue({
        onFailure: function(result) {
            assistant.failure("Solo Failure handler called");
        }
    });

    if (responses.length) {
        assistant.failure("Handlers called prior to exec");
    }

    success("Success");

    if (responses.length !== 2) {
        assistant.failure("Unexpected callback count: " + responses.length);
    }
    this.verifyResults("succes responses", responses, assistant);
};

OperationQueueTest.prototype.failureTest = function(assistant) {
    var queue = new OperationQueue(),
        responses = [];

    this.overrideExec(queue);

    queue.queue(function(result) {
        assistant.failure("Function success callback called");
    });
    queue.queue({
        onSuccess: function(result) {
            assistant.failure("Successhandler called");
        },
        onFailure: function(result) {
            if (result !== "Failure") {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(1);
        }
    });
    queue.queue({
        onFailure: function(result) {
            if (result !== "Failure") {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(2);
        }
    });

    if (responses.length) {
        assistant.failure("Handlers called prior to exec");
    }

    var failure = queue.getFailureHandler();
    failure("Failure");

    if (responses.length !== 2) {
        assistant.failure("Unexpected callback count: " + responses.length);
    }
    this.verifyResults("succes responses", responses, assistant);
};

OperationQueueTest.prototype.postFailureTest = function(assistant) {
    var queue = new OperationQueue(),
        responses = [];

    this.overrideExec(queue);

    var failure = queue.getFailureHandler(function(result) {
        if (result !== "Failure") {
            assistant.failure("Unexpected result: " + result);
        }
        responses.push(0);
    });
    failure("Failure");
    if (responses.length !== 1 || responses[0] !== 0) {
        assistant.failure("Failed to execute immediate callback 1");
    }

    queue.queue(function(result) {
        assistant.failure("Success callback improperly executed");
    });

    queue.queue({
        onSuccess: function(result) {
            assistant.failure("Success handler called");
        },
        onFailure: function(result) {
            if (result !== undefined) {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(1);
        }
    });
    if (responses.length !== 2 || responses[1] !== 1) {
        assistant.failure("Failed to execute immediate callback 1");
    }

    queue.queue({
        onFailure: function(result) {
            if (result !== undefined) {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(2);
        }
    });
    if (responses.length !== 3 || responses[2] !== 2) {
        assistant.failure("Callback 3 improperly called");
    }
};

OperationQueueTest.prototype.resetFailureTest = function(assistant) {
    var queue = new OperationQueue(),
        responses = [],
        failure = queue.getFailureHandler();

    failure("Failure");
    queue.reset();

    this.overrideExec(queue);

    queue.queue(function(result) {
        assistant.failure("Function success callback called");
    });
    queue.queue({
        onSuccess: function(result) {
            assistant.failure("Successhandler called");
        },
        onFailure: function(result) {
            if (result !== "Failure") {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(1);
        }
    });
    queue.queue({
        onFailure: function(result) {
            if (result !== "Failure") {
                assistant.failure("Unexpected result: " + result);
            }
            responses.push(2);
        }
    });

    if (responses.length) {
        assistant.failure("Handlers called prior to exec");
    }

    var failure = queue.getFailureHandler();
    failure("Failure");

    if (responses.length !== 2) {
        assistant.failure("Unexpected callback count: " + responses.length);
    }
    this.verifyResults("succes responses", responses, assistant);
};

OperationQueueTest.prototype.overrideExec = function(queue) {
    // TODO : See if there is any way that we can verify this without having to override this method
    queue._execCallback = function(callbackFn, result) {
        if (callbackFn) {
            callbackFn(result);
        }
    };
};
OperationQueueTest.prototype.verifyResults = function(msg, responses, assistant) {
    var len = responses.length-1,
        last = responses[len];
    if (len < 0) {
        return;
    }

    while (len--) {
        if (responses[len] >= last) {
            assistant.failure(msg + " : Unexpected result value: " + len + " value: " + responses[len] + " prev: " + last);
        }
        last = responses[len];
    }
};
