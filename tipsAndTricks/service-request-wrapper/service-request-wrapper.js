/**
 * Service request wrapper that provides user and log level error handling
 * for service requests.
 */
var ServiceRequestWrapper;

(function() {
    var requestId = 0,
        requests = [];

    function completeHandler(optionsIn, requestId) {
        return function(response) {
            if (!(optionsIn.parameters && optionsIn.parameters.subscribe) && requests[requestId]) {
                requests[requestId].cancel();
            }

            optionsIn.onComplete && optionsIn.onComplete(response);
        };
    }
    function cancelHandler(requestId, original) {
        return function() {
            delete requests[requestId];

            original.apply(this, arguments);
        };
    }

    ServiceRequestWrapper = {
         /**
          * Initiates a request to the 
          */
        request: function(url, optionsIn, resubscribe) {
            requestId++;

            var options = this.bindOptions(url, optionsIn, requestId),
                request = new Mojo.Service.Request(url, options, resubscribe);
            request.cancel = cancelHandler(requestId, request.cancel);

            requests[requestId] = request;
            return request;
        },

        bindOptions: function(url, optionsIn, requestId) {
            var options = Object.clone(optionsIn);
            options.onComplete = completeHandler(optionsIn, requestId);
            Mojo.Log.info("request: %o", options);
            Mojo.Log.info("request: %j", options);
            return options;
        }
    };
})();
