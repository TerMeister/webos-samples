/* Copyright 2010 Palm, Inc. All rights reserved. */
function AppAssistant() {}

AppAssistant.prototype.handleLaunch = function(params){
    // Forward the launch parameters to any periodic services that may be running.
    // Note that at this point it's possible that we do not have any scenes open.
    // Implementations will have to account for this case.
    params = PeriodicService.handleLaunch(params);
    if (params === undefined) {   // Note that this must be === undefined...
        return;
    }

    // Intialize the primary card stage
    this.controller.createStageWithCallback({
            name: "main",
            lightweight: true,
        },
        function(stageController) {
            stageController.pushScene("main");
        },
        Mojo.Controller.StageType.card);
};
