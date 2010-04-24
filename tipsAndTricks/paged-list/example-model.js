/* Copyright 2010 Palm, Inc. All rights reserved. */
/* DataModelBase example implementation. See data-model-base/README and paged-list/README */
var ExampleModel = Class.create(DataModelBase, {
    initialize: function($super, upper, options) {
        $super(options);
        this.upper = upper;
    },

    getCacheName: function() {
        return "sequence-model(" + this.upper + ")";
    },

    loadRange: function(offset, limit, onSuccess, onFailure) {
        var upper = Math.min(offset+limit, this.upper),
            stamp = new Date().getTime();

        // Delay to demonstrate the refreshing widget
        (function() {
            var items = [],
                i = offset;
            while (i++ <= upper) {
                items.push({ number: i, timestamp: stamp });
            }
            Mojo.Log.info("%s returning items %d to %d", this.getCacheName(), offset, i);
            onSuccess(items);
        }).bind(this).delay(5);
    }
});
