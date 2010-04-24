/* Copyright 2010 Palm, Inc. All rights reserved. */
/* DataModelBase testcases. See data-model-base/README */
function DataModelBaseTest() {}

DataModelBaseTest.prototype.exec = function(assistant, cont) {
    execChain(assistant, cont, [
            this.zeroOffset,
            this.positiveOffset,
            this.negativeOffset,
            this.outOfSightOffset,
            this.cacheReadTest,
            this.depotCacheReadTest,
            this.cacheExpandTest,
            this.overlappingRequestsTest,
            this.refreshTest,
        ], 0)();
};

DataModelBaseTest.prototype.zeroOffset = function(assistant, cont) {
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2
    });

    dataModel.getRange(0, 2,
        function(offset, limit, results) {
            verifyRange(
                    assistant, {
                        offset: 0,
                        limit: 2,
                        complete: false,
                        knownSize: 4,
                        loadRangeCount: 1,
                        loadRange: { offset: 0, limit: 4 },
                        results: [ 10, 9 ]
                    },
                    dataModel, offset, limit, results);

            cont();
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        });
};

DataModelBaseTest.prototype.positiveOffset = function(assistant, cont) {
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2
    });

    dataModel.getRange(4, 2,
        function(offset, limit, results) {
            verifyRange(
                assistant, {
                    offset: 4,
                    limit: 2,
                    complete: false,
                    knownSize: 8,
                    loadRangeCount: 1,
                    loadRange: { offset: 0, limit: 8 },
                    results: [ 6, 5 ]
                },
                dataModel, offset, limit, results);

            cont();
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        });
};

DataModelBaseTest.prototype.negativeOffset = function(assistant, cont) {
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2
    });

    dataModel.getRange(-4, 2,
        function(offset, limit, results) {
            assistant.failure("Recieved success: " + Object.toJSON(results));

            cont();
        },
        function(result) {
            if (dataModel.loadRangeHistory.length !== 0) {
                assistant.failure("Unexpected load history: " + Object.toJSON(dataModel.loadRangeHistory));
            }
            cont();
        });
};

DataModelBaseTest.prototype.outOfSightOffset = function(assistant, cont) {
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2
    });

    dataModel.getRange(12, 2,
        function(offset, limit, results) {
            verifyRange(
                assistant, {
                    offset: 12,
                    limit: 2,
                    complete: true,
                    knownSize: 10,
                    loadRangeCount: 1,
                    loadRange: { offset: 0, limit: 16 },
                    results: []
                },
                dataModel, offset, limit, results);

            cont();
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        })
};

DataModelBaseTest.prototype.cacheReadTest = function(assistant, cont) {
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2
    });

    dataModel.getRange(4, 2,
        function(offset, limit, results) {
            verifyRange(
                assistant, {
                    offset: 4,
                    limit: 2,
                    complete: false,
                    knownSize: 8,
                    loadRangeCount: 1,
                    loadRange: { offset: 0, limit: 8 },
                    results: [ 6, 5 ]
                },
                dataModel, offset, limit, results);

            dataModel.getRange(0, 3,
                    function(offset, limit, results) {
                        verifyRange(
                            assistant, {
                                offset: 0,
                                limit: 3,
                                complete: false,
                                knownSize: 8,
                                loadRangeCount: 1,
                                loadRange: { offset: 0, limit: 8 },
                                results: [ 10, 9, 8 ]
                            },
                            dataModel, offset, limit, results);

                        cont();
                    },
                    function(failure) {
                        assistant.failure("Recieved failure");
                        cont();
                    });
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        });
};

DataModelBaseTest.prototype.depotCacheReadTest = function(assistant, cont) {
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2
    });

    dataModel.getRange(4, 2,
        function(offset, limit, results) {
            verifyRange(
                assistant, {
                    offset: 4,
                    limit: 2,
                    complete: false,
                    knownSize: 8,
                    loadRangeCount: 1,
                    loadRange: { offset: 0, limit: 8 },
                    results: [ 6, 5 ]
                },
                dataModel, offset, limit, results);

            dataModel = new DataModelTest({
                maxCount: 10,
                lookahead: 2,
                
            });
            // Allow us to stack a few requests
            dataModel.blockTimeout = 100;
            dataModel.offset = 10;
            dataModel.getRange(0, 10,
                    function(offset, limit, results) {
                        if (dataModel.blockTimeout) {
                            verifyRange(
                                assistant, {
                                    offset: 0,
                                    limit: 10,
                                    complete: false,
                                    knownSize: 8,
                                    loadRangeCount: 0,
                                    results: [ 10, 9, 8, 7, 6, 5, 4, 3 ]
                                },
                                dataModel, offset, limit, results);

                            dataModel.blockTimeout = 0;
                        } else {
                            verifyRange(
                                    assistant, {
                                        offset: 0,
                                        limit: 10,
                                        complete: true,
                                        knownSize: 10,
                                        loadRangeCount: 1,
                                        loadRange: { offset: 0, limit: 12 },
                                        results: [ 20, 9, 8, 7, 6, 5, 4, 3, 2, 1 ]
                                    },
                                    dataModel, offset, limit, results);

                            cont();
                        }
                    },
                    function(failure) {
                        assistant.failure("Recieved failure");
                        cont();
                    });
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        });
};

DataModelBaseTest.prototype.cacheExpandTest = function(assistant, cont) {
    var runCount = 0;
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2
    }),
    expected = [
        {
            offset: 3,
            limit: 5,
            knownSize: 8,
            complete: false,
            loadRangeCount: 2,
            loadRange: { offset: 8, limit: 14 },
            results: [ 7, 6, 5, 4, 3 ]
        },
        {
            offset: 8,
            limit: 7,
            knownSize: 10,
            complete: true,
            loadRangeCount: 2,
            loadRange: { offset: 8, limit: 14 },
            results: [ 2, 1 ]
        }
    ];
    

    dataModel.getRange(4, 2,
        function(offset, limit, results) {
            verifyRange(
                assistant, {
                    offset: 4,
                    limit: 2,
                    complete: false,
                    knownSize: 8,
                    loadRangeCount: 1,
                    loadRange: { offset: 0, limit: 8 },
                    results: [ 6, 5 ]
                },
                dataModel, offset, limit, results);

            dataModel.getRange(3, 12,
                    function(offset, limit, results) {
                        verifyRange(assistant, expected[runCount++], dataModel, offset, limit, results);

                        if (runCount === 2) {
                            cont();
                        }
                    },
                    function(failure) {
                        assistant.failure("Recieved failure");
                        cont();
                    });
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        });
};


DataModelBaseTest.prototype.overlappingRequestsTest = function(assistant, cont) {
    var runCount = 0;
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2
    });

    function finalize() {
        if (dataModel.loadRangeHistory.length !== 2) {
            assistant.failure("Incorrect query count: " + Object.toJSON(dataModel.loadRangeHistory));
        }
        var hist = dataModel.loadRangeHistory,
            len = hist.length;
        while (len--) {
            var entry = hist[len];
            if (!((entry.offset === 0 && entry.limit === 6) || (entry.offset === 6 && entry.limit === 4))) {
                assistant.failure("Incorrect query content: " + Object.toJSON(entry));
            }
        }

        if (dataModel.getKnownSize() !== 10) {
            assistant.failure("Unexpected known count " + dataModel.getKnownSize());
        }
        if (dataModel.isComplete()) {
            assistant.failure("dataModal marked complete");
        }

        cont();
    }
    // Allow us to stack a few requests
    dataModel.blockTimeout = 100;

    dataModel.getRange(2, 2,
        function(offset, limit, results) {
        Mojo.Log.info("2 2 read offset: %d limit: %d results: %j", offset, limit, results);
            verifyRange(
                assistant, {
                    offset: 2,
                    limit: 2,
                    results: [ 8, 7 ]
                },
                dataModel, offset, limit, results);
            if (++runCount >= 2) {
                finalize();
            }
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        });

    dataModel.getRange(4, 2,
        function(offset, limit, results) {
            Mojo.Log.info("4 2 read offset: %d limit: %d results: %j", offset, limit, results);
            verifyRange(
                assistant, {
                    offset: 4,
                    limit: 2,
                    results: [ 6, 5 ]
                },
                dataModel, offset, limit, results);
            if (++runCount >= 2) {
                finalize();
            }
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        });
    dataModel.blockTimeout = 0;
};


DataModelBaseTest.prototype.refreshTest = function(assistant, cont) {
    var runCount = 0;
    var dataModel = new DataModelTest({
        maxCount: 10,
        lookahead: 2,
        initialPageSize: 6
    });

    function postInit() {
        var returnCount = 0;
        // Allow us to stack a few requests
        dataModel.blockTimeout = 100;
        dataModel.offset = 10;

        dataModel.refresh(
                function(results) {
                    verifyRange(
                            assistant, {
                                offset: 0,
                                limit: 0,
                                knownSize: 8,
                                complete: false,
                                loadRangeCount: 1,
                                results: [ 20, 9, 8, 7, 6, 5, 4, 3 ]
                            },
                            dataModel, 0, 0, results);
                    if (++returnCount !== 1) {
                        assistant.failure("Refresh call was not blocking");
                    }
                },
                function() {
                    assistant.failure("Failure called");
                    cont();
                });

        dataModel.refresh(
                function(results) {
                    verifyRange(
                            assistant, {
                                offset: 0,
                                limit: 0,
                                knownSize: 8,
                                complete: false,
                                loadRangeCount: 1,
                                results: [ 20, 9, 8, 7, 6, 5, 4, 3 ]
                            },
                            dataModel, 0, 0, results);
                    if (++returnCount !== 2) {
                        assistant.failure("Refresh call was not blocking");
                    }
                },
                function() {
                    assistant.failure("Failure called");
                    cont();
                });

        dataModel.getRange(4, 2,
            function(offset, limit, results) {
                verifyRange(
                    assistant, {
                        offset: 4,
                        limit: 2,
                        knownSize: 8,
                        complete: false,
                        loadRangeCount: 2,
                        results: [ 6, 5 ]
                    },
                    dataModel, offset, limit, results);
                if (++returnCount !== 3) {
                    assistant.failure("Refresh call was not blocking");
                }
                if (returnCount >= 3) {
                    cont();
                }
            },
            function(failure) {
                assistant.failure("Recieved failure");
                cont();
            });
        dataModel.blockTimeout = 0;
    }

    dataModel.getRange(2, 2,
        function(offset, limit, results) {
        Mojo.Log.info("2 2 read offset: %d limit: %d results: %j", offset, limit, results);
            verifyRange(
                assistant, {
                    offset: 2,
                    limit: 2,
                    complete: false,
                    knownSize: 6,
                    loadRangeCount: 1,
                    loadRange: { offset: 0, limit: 6 },
                    results: [ 8, 7 ]
                },
                dataModel, offset, limit, results);
            postInit();
        },
        function(failure) {
            assistant.failure("Recieved failure");
            cont();
        });
};

var DataModelTest = Class.create(DataModelBase, {
    initialize: function($super, options) {
        $super(options);
        this.maxCount = options.maxCount;
        this.loadRangeHistory = [];
        this.offset = 0;
    },
    getCacheName: function() {
        return "dataModelTest";
    },
    refresh: function($super, onSuccess, onFailure) {
        this.loadRangeHistory = [];
        return $super(onSuccess, onFailure);
    },
    loadRange: function(offset, limit, onSuccess, onFailure) {
        // If the block flag is set, defer execution
        if (this.blockTimeout) {
            var self = this;
            setTimeout(function() {
                self.loadRange(offset, limit, onSuccess, onFailure);
            }, this.blockTimeout);
            return;
        }

        this.loadRangeHistory.push({offset:offset, limit: limit});

        var ret = [];
        limit = Math.min(offset+limit, this.maxCount);

        for (var i = offset; i < limit; i++) {
            ret.push((this.maxCount - i) + (i === 0 ? this.offset : 0));
        }
        onSuccess.curry(ret).defer();
    }
});


function verifyRange(assistant, expected, dataModel, offset, limit, results) {
    if (offset !== expected.offset) {
        assistant.failure("offset incorrect: " + offset + " " + expected.offset);
    }
    if (limit !== expected.limit) {
        assistant.failure("limit incorrect: " + limit + " " + expected.limit);
    }
    if (expected.complete !== undefined && dataModel.isComplete() !== expected.complete) {
        assistant.failure("Data Model Marked as complete: " + dataModel.isComplete() + " " + expected.complete);
    }
    if (expected.knownSize !== undefined && dataModel.getKnownSize() !== expected.knownSize) {
        assistant.failure("Data Model known size unexpected: " + dataModel.getKnownSize() + " " + expected.knownSize);
    }
    if (expected.loadRangeCount !== undefined && dataModel.loadRangeHistory.length !== expected.loadRangeCount
            || (expected.loadRange !== undefined && (
                    dataModel.loadRangeHistory[expected.loadRangeCount-1].offset !== expected.loadRange.offset
                    || dataModel.loadRangeHistory[expected.loadRangeCount-1].limit !== expected.loadRange.limit)))  {
        assistant.failure("Unexpected load history: " + Object.toJSON(dataModel.loadRangeHistory) + " " + expected.loadRangeCount + " " + Object.toJSON(expected.loadRange));
    }

    if (!results
            || results.length !== expected.results.length) {
        assistant.failure("Returned data incorrect: " + Object.toJSON(results) + " " + Object.toJSON(expected.results));
    } else {
        var len = results.length;
        while (len--) {
            if (results[len] != expected.results[len]) {
                assistant.failure("Returned data incorrect index: " + len + "data: " + Object.toJSON(results) + " " + Object.toJSON(expected.results));
            }
        }
    }
}
