/* Copyright 2010 Palm, Inc. All rights reserved. */
/* ServiceRequestWrapper. See service-request-wrapper/README */
function ServiceRequestWrapperTest() {}

ServiceRequestWrapperTest.prototype.exec = function(assistant, cont) {
    execChain(assistant, cont, [
            this.singleSuccessTest,
            this.singleFailureTest,
            this.subscriptionSuccessTest,
            this.subscriptionFailureTest
        ], 0)();
};

ServiceRequestWrapperTest.prototype.singleSuccessTest = function(assistant, cont) {
    var success,
        request = ServiceRequestWrapper.request('palm://com.palm.preferences/systemProperties', {
            method:"Get",
            parameters:{"key": "com.palm.properties.nduid" },
            onSuccess: function(response){
                success = true;
            },
            onComplete: function(response) {
                if (!success) {
                    assistant.failure("Did not recieve success event");
                }
                if (!request.cancelled) {
                    assistant.failure("Request not cancelled");
                }
                cont();
            }
      });
};
ServiceRequestWrapperTest.prototype.singleFailureTest = function(assistant, cont) {
    var failure,
        request = ServiceRequestWrapper.request(
        "palm://com.palm.preferences/systemProperties", {
            onFailure: function(response) {
                failure = true;
            },
            onComplete: function(response) {
                if (!failure) {
                    assistant.failure("Failure not recieved");
                }
                if (!request.cancelled) {
                    assistant.failure("Request not cancelled");
                }
                cont();
            }
        });
};
ServiceRequestWrapperTest.prototype.subscriptionSuccessTest = function(assistant, cont) {
    var sub, secondSet;

    function subComplete() {
        if (sub.cancelled) {
            assistant.failure("Request cancelled");
        }

        if (!secondSet) {
            secondSet = true;
            ServiceRequestWrapper.request('palm://com.palm.systemservice', {
                method:"setPreferences",
                parameters:{"food":"beef"},
                onFailure: failure
            });
        } else {
            sub.cancel();

            if (!sub.cancelled) {
                asssiant.failure("Requets not cancelled");
            }
            cont();
        }
    }
    function failure() {
        assistant.failure("Failure event");
        cont();
    }

    ServiceRequestWrapper.request('palm://com.palm.systemservice', {
        method:"setPreferences",
        parameters:{"food":"pizza"},
        onSuccess: function() {
            sub = ServiceRequestWrapper.request('palm://com.palm.systemservice', {
                method:"getPreferences",
                parameters:{ keys: [ "food" ], subscribe: true },
                onFailure: failure,
                onComplete: subComplete
            });
        },
        onFailure: failure
    });
};
ServiceRequestWrapperTest.prototype.subscriptionFailureTest = function(assistant, cont) {
    var failure,
        request = ServiceRequestWrapper.request(
        "palm://com.palm.preferences/systemProperties", {
            subscribe: true,
            onFailure: function(response) {
                failure = true;
            },
            onComplete: function(response) {
                if (!failure) {
                    assistant.failure("Failure not recieved");
                }
                if (!request.cancelled) {
                    assistant.failure("Request not cancelled");
                }
                cont();
            }
        });
};
