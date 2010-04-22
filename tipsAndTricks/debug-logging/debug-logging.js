/* See LICENSE */
/**
 * Debugging Hacks that work around holes in the current exception logging stack.
 * 
 * Warning: No sane individual should load this file for any duration other than for attempting to diagnose
 * a throw.
 * 
 * THIS SHOULD NEVER SEE A CUSTOMER BUILD.
 * To do so is to invite pain and suffering.
 */
var DebugLogging;

(function() {
    Error.prototype.toString = (function($super) {
        return function() {
            if (this.stack) {
                return this.stack;
            } else {
                return $super.apply(this, arguments);
            }
        };
    })(Error.prototype.toString);

    function wrapMethod(name, wrapper) {
        var $super = eval(name);
        if (!$super) {
            Mojo.Log.error("%s not defined", name);
            return $super;
        }

        var subclass = function() {};
        subclass.prototype = $super.prototype;
        wrapper.prototype = new subclass();
        wrapper.prototype.constructor = wrapper;

        eval(name + " = wrapper;");

        return $super;
    }

    DebugLogging = {
        /**
         * Logs that stack track for an error.
         */
        logError: function(err, prefix) {
            var lines = err.stack.split(/\n/g),
                len = lines.length;
            for (var i = 0; i < len; i++) {
                Mojo.Log.error(prefix || "|  ", lines[i]);
            }
        },

        /**
         * Wraps the method identified by name, optionally logging evaled statements
         * before and after execution.
         * 
         * @param name Name of the function to log. This string is evaled in the scope
         *        of this call
         * @param logItems Array of strings to be evaled and logged before execution
         *        of the wrapped method.
         * @param postLogItems Array of strings to be evaled and logged after execution
         *        of the wrapped method.
         */
        wrapInLogger: function(name, logItems, postLogItems) {
            logItems = logItems || [];
            postLogItems = postLogItems || [];

            var $super = wrapMethod.call(this, name, function() {
                Mojo.Log.info("%s called", name);
                for (var i = 0; i < arguments.length; i++) {
                    Mojo.Log.info("|    arg %d: %j", i, arguments[i]);
                }
                for (var i = 0; i < logItems.length; i++) {
                    Mojo.Log.info("|    logItem %s: %o", logItems[i], eval(logItems[i]));
                }

                try {
                    throw new Error("Tracing");
                } catch (err) {
                    DebugLogging.logError(err, "|    stack: ");
                }
                var ret = $super.apply(this, arguments);
                Mojo.Log.info("|   %s ret: %o", name, ret);
                for (var i = 0; i < postLogItems.length; i++) {
                    Mojo.Log.info("|    postLogItem %s: %o", postLogItems[i], eval(postLogItems[i]));
                }
                return ret;
            });
        },

        /**
         * Wraps the method identified by name in a verbose error logger.
         * 
         * @param name Name of the method to wrap. This string is evaled in the scope
         *        of this call.
         * @param members Optional list of members to wrap after the inital wrapped call.
         *        These members must be in the current call scope.
         */
        wrapInErrorHandler: function(name, members) {
            members = members || [];

            var $super = wrapMethod.call(this, name, function() {
                var ret;

                Mojo.Log.info("%s called", name);
                try {
                    ret = $super.apply(this, arguments);

                    var len = members.length;
                    while (len--) {
                        Mojo.Log.info("%s wrap member", members[len]);
                        DebugLogging.wrapInErrorHandler.call(this, "this." + members[len]);
                    }

                    return ret;
                } catch (err) {
                    Mojo.Log.error("DebugLogging.wrapInErrorHandler: %s", name);
                    DebugLogging.logError(err, "wrapInErrorHandler: ");
                    throw err;
                }
            });
        },

        /**
         * Generic error logger. Wraps the function implementation with the try catch cruft.
         * 
         * This is intended for use at design time whereas wrapInError handler is intended
         * for use at runtime.
         */
        traceWrapper: function(handler) {
            return function() {
                try {
                    return handler.apply(this, arguments);
                } catch (err) {
                    DebugLogging.logError(err, "traceWrapper: ");
                    throw err;
                }
            };
        }
    };
})();
