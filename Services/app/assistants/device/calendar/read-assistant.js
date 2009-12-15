function ReadAssistant(readid) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.readEventId = readid;
}

ReadAssistant.prototype.setup = function() {
	
	this.readModel =
	{
		eventId : this.readEventId
	}
	//this.controller.setupWidget('idField', {modelProperty: 'eventID'}, this.readModel);
	//this.controller.setupWidget('nameField', {modelProperty: 'calendarId'}, this.readModel);
	
	/* add event handlers to listen to events from controls */
	this.controller.listen('read_button', Mojo.Event.tap, this.read.bind(this));
	this.controller.listen('back_button', Mojo.Event.tap, this.back.bind(this));
}

ReadAssistant.prototype.read = function (){	
	$('response').update("")
	this.controller.serviceRequest('palm://com.palm.calendar/crud', {
		method: 'getEvent',
		parameters:this.readModel,
		onSuccess: this.handleOKResponse,
		onFailure: this.handleErrResponse.bind(this)
	});
}

ReadAssistant.prototype.back = function (event){
	Mojo.Controller.stageController.popScene();
}

ReadAssistant.prototype.handleOKResponse = function(response){	
	var eventDetail = response;
	if(eventDetail.allDay){
		alldaystring='Yes';
	} else {
		alldaystring='No';
	}
	$('eventID').update(eventDetail.eventId);
	$('alarm').update(eventDetail.alarm);
	$('location').update(eventDetail.location);
	$('allDay').update(alldaystring);
	$('subject').update(eventDetail.subject);
	$('startTime').update(eventDetail.startTimestamp);
	$('endTime').update(eventDetail.endTimestamp);
	$('note').update(eventDetail.note);																		 
}

ReadAssistant.prototype.handleErrResponse = function(response){	
	this.showDialogBox('No Events','There are no events to read.');												 
}

ReadAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


ReadAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ReadAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('read_button', Mojo.Event.tap, this.read.bind(this));
	this.controller.stopListening('back_button', Mojo.Event.tap, this.back.bind(this));
}

// This function will popup a dialog, displaying the message passed in.
ReadAssistant.prototype.showDialogBox = function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
} 
