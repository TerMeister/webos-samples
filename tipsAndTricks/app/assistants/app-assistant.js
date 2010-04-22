/* Copyright 2009 Palm, Inc.  All rights reserved. */
function AppAssistant() {}

AppAssistant.prototype.handleLaunch = function(params){
    this.controller.createStageWithCallback({
            name: "main",
            lightweight: true,
        },
        function(stageController) {
            stageController.pushScene("main");
        },
        Mojo.Controller.StageType.card);
};
