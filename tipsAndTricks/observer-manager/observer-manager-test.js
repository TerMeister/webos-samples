/* Copyright 2010 Palm, Inc. All rights reserved. */
/* ObserverManager testcases. See observer-manager/README */
function ObserverManagerTest() {}

ObserverManagerTest.prototype.exec = function(assistant, cont) {
    var stageController = assistant.controller.stageController,
        observable = new Observable(),
        observerManager = new ObserverManager(assistant.controller),
        self = this;

    observerManager.setup();
    this.resetObservers();
    this.registerObservers(observerManager, observable);

    this.activeTest(assistant, observable);

    stageController.pushScene("active");

    this.resetObservers();

    this.waitForDeactivation(
            stageController.document,
            function() {
                self.waitForActivation(
                    stageController.document,
                    function() { self.stageActivatedTest(assistant, observable); },
                    500)
                self.waitForActivation(
                    assistant.controller.sceneElement,
                    function() {
                        self.sceneActivatedTest(assistant, observable);

                        observerManager.cleanup();

                        cont();
                    }, 500);
                self.deactivatedTest(assistant, observable);

                var otherStage = Mojo.Controller.getAppController().getStageController("otherStage");
                otherStage.window.close();
                stageController.activate();
            });

    
    Mojo.Controller.getAppController().createStageWithCallback({
                  name: "otherStage",
                  htmlFileName: "index",
                  lightweight: true,
              },
              function(controller) {
                  controller.pushScene("active");
                  self.bounceStage(stageController, controller);
              },
              Mojo.Controller.StageType.card);
};

ObserverManagerTest.prototype.activeTest = function(assistant, observable) {
    observable.notifyObservers("test");
    observable.notifyObservers("test");
    observable.notifyObservers("test");
    this.verifyObservers(3, 3, 3, 3, 3, assistant);

    observable.notifyObservers("test");
    this.verifyObservers(4, 4, 4, 4, 4, assistant);
};
ObserverManagerTest.prototype.deactivatedTest = function(assistant, observable) {
    observable.notifyObservers("test");
    observable.notifyObservers("test");

    this.verifyObservers(2, 0, 0, 0, 0, assistant);
};

ObserverManagerTest.prototype.stageActivatedTest = function(assistant, observable) {
    this.verifyObservers(2, 2, 0, 1, 0, assistant);

    observable.notifyObservers("test");

    this.verifyObservers(3, 3, 0, 2, 0, assistant);

    assistant.controller.stageController.popScene();
};
ObserverManagerTest.prototype.sceneActivatedTest = function(assistant, observable) {
    this.verifyObservers(3, 3, 3, 2, 1, assistant);

    observable.notifyObservers("test");

    this.verifyObservers(4, 4, 4, 3, 2, assistant);
};

ObserverManagerTest.prototype.bounceStage = function(firstController, secondController) {
    var self = this;

    // This forces the first scene into a deactivated state. Currently the deactivated message is not
    // being sent immediately after a createStageWithCallback.
    this.waitForActivation(
            secondController.document,
            function() {
                self.waitForActivation(
                        firstController.document,
                        function() {
                            secondController.activate();
                        });
                firstController.activate();
            },
            500);
};

ObserverManagerTest.prototype.registerObservers = function(observerManager, observable) {
    var self = this;
    observerManager.observe(observable, function(data) {
            self.immediateCalled++;
        });
    observerManager.observe(observable, function(data) {
            self.batchedImmediateCalled++;
        },
        ObserverManager.DeferUntil.Immediate,
        true);
    observerManager.observe(observable, function(data) {
            self.stageCalled++;
        },
        ObserverManager.DeferUntil.StageActive);
    observerManager.observe(observable, function(data) {
            self.batchedStageCalled++;
        },
        ObserverManager.DeferUntil.StageActive,
        true);
    observerManager.observe(observable, function(data) {
            self.sceneCalled++;
        },
        ObserverManager.DeferUntil.SceneActive);
    observerManager.observe(observable, function(data) {
            self.batchedSceneCalled++;
        },
        ObserverManager.DeferUntil.SceneActive,
        true);
};
ObserverManagerTest.prototype.verifyObservers = function(immediate, stage, scene, batchedStage, batchedScene, assistant) {
    if (this.immediateCalled !== immediate) {
        assistant.failure("Unexpected immediate called state: " + this.immediateCalled);
    }
    if (this.stageCalled !== stage) {
        assistant.failure("Unexpected stage called state: " + this.stageCalled);
    }
    if (this.sceneCalled !== scene) {
        assistant.failure("Unexpected scene called state: " + this.sceneCalled);
    }
    if (this.batchedImmediateCalled !== immediate) {
        assistant.failure("Unexpected batched immediate called state: " + this.immediateCalled);
    }
    if (this.batchedStageCalled !== batchedStage) {
        assistant.failure("Unexpected batched stage called state: " + this.stageCalled);
    }
    if (this.batchedSceneCalled !== batchedScene) {
        assistant.failure("Unexpected batched scene called state: " + this.sceneCalled);
    }
};
ObserverManagerTest.prototype.resetObservers = function() {
    this.immediateCalled = 0;
    this.stageCalled = 0;
    this.sceneCalled = 0;
    this.batchedImmediateCalled = 0;
    this.batchedStageCalled = 0;
    this.batchedSceneCalled = 0;
};

ObserverManagerTest.prototype.waitForEvent = function(node, name, cont, timeout) {
    var eventHandler = function() {
        Mojo.Log.info("Wait for %s" , name);
        if (typeof timeout === "number") {
            setTimeout(cont, timeout);
        } else {
            cont();
        }

        node.removeEventListener(name, eventHandler, false);
    };

    node.addEventListener(
            name,
            eventHandler,
            false);
};
ObserverManagerTest.prototype.waitForActivation = function(node, cont, timeout) {
    this.waitForEvent(node, Mojo.Event.activate, cont, timeout);
};
ObserverManagerTest.prototype.waitForDeactivation = function(node, cont, timeout) {
    this.waitForEvent(node, Mojo.Event.deactivate, cont, timeout);
};
