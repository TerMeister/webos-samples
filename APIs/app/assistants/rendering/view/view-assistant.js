function ViewAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}


// Called by the controller when the scene is pushed
ViewAssistant.prototype.setup = function() {
		//set up our button handlers		
		this.controller.listen('render_object', Mojo.Event.tap, this.handleRenderObject.bind(this));
		this.controller.listen('render_list', Mojo.Event.tap, this.handleRenderList.bind(this));		
}

ViewAssistant.prototype.handleRenderObject = function(){
	this.controller.stageController.assistant.showScene("rendering/view/renderObject", 'renderObject')	
}

ViewAssistant.prototype.handleRenderList = function(response){
	this.controller.stageController.assistant.showScene("rendering/view/renderList", 'renderList')
}


// Cleanup anything we did in setup function
ViewAssistant.prototype.cleanup = function() {
}

// Called by the controller when this scene is about to be viewed	
ViewAssistant.prototype.activate = function() {
}
  
// Cleanup anything we did in the activate function
ViewAssistant.prototype.deactivate = function() {
}