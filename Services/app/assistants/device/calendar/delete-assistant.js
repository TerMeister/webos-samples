function DeleteAssistant(param) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	//this.evntid = thiseventid;
	this.evntid1=param;
	this.subject = null;
}

DeleteAssistant.prototype.setup = function() {
	
	/* add event handlers to listen to events from widgets */
	this.controller.listen('delete_button', Mojo.Event.tap, this.handleDelete.bind(this));
	this.controller.listen('back_button', Mojo.Event.tap, this.back.bind(this));

}

DeleteAssistant.prototype.handleDelete = function (){	

this.controller.serviceRequest('palm://com.palm.calendar/crud',{
		method: 'deleteEvent',
		parameters: {
					eventId : this.evntid1
				},
		onSuccess: this.handleDeleteResponse.bind(this),
		onFailure: this.handleErrResponse.bind(this)
	});

}

DeleteAssistant.prototype.handleDeleteResponse = function(response){
		this.showDialogBox('Event','Event deleted- ' + this.evntid1);	
		this.subject=null;
		this.evntid1=null;																 
}

DeleteAssistant.prototype.back = function (){
	Mojo.Controller.stageController.popScene();
}

DeleteAssistant.prototype.handleErrResponse = function(response){
	this.showDialogBox('No Events','There are no events to delete.');																	 
},

DeleteAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.selectEventid.bind(this);
}


DeleteAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

DeleteAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('delete_button', Mojo.Event.tap, this.handleDelete.bind(this));
	this.controller.stopListening('back_button', Mojo.Event.tap, this.back.bind(this));
}

// This function will popup a dialog, displaying the message passed in.
DeleteAssistant.prototype.showDialogBox = function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
} 
