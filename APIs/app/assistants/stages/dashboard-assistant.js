function DashboardAssistant() {
 }
    
DashboardAssistant.prototype.setup = function() {
    Mojo.Event.listen($('create-dashboard'),Mojo.Event.tap, this.showDashboard.bind(this))
}
    
DashboardAssistant.prototype.showDashboard = function(){
		    var appController = Mojo.Controller.getAppController();
		    var stageName = "dashboardStage";
		    
		    var f = function(stageController){
				//We can't use our showScene function from our app's stage assistant here since this
				//stageController is actually a new stage controller specifically for our dashboard.
		        stageController.pushScene({name: "dashboardStage",
					       		   		   sceneTemplate: "stages/dashboard/dashboardStage-scene"},
										   {
										 	  message: "I'm a dashboard stage.",
											  stage: stageName
										   });
		    };
		    appController.createStageWithCallback({
				name: stageName,
			 	lightweight: true
			}, f, 'dashboard');
}



/* This is an assistant for the actual dashboard
 * Note we're using this.controller.get here rather than Prototype's $ - a consequence of using
 * lightweight stages.
 */ 
function DashboardStageAssistant(argFromPusher) {
	  this.passedArgument = argFromPusher
 }
    

DashboardStageAssistant.prototype.setup = function() {
	this.controller.get('info').update(this.passedArgument.message)
}