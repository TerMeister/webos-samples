//function CreateAssistant(arg) {
function CreateAssistant(arg) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	// Pass the argument to header control in create-scene.html. Since update and create are using
	// the same html, we use the argument to differenciate what current operation is and hide/show
	// relevant elements
	this.evntidc = arg.evntid;
	this.clndridc = arg.clndrid;
	$('create-header').textContent = arg.eventtype;
	this.myCallback = arg.CallBack;
	this.startTime = arg.starttime;
	if (arg.eventtype.match("New Event")){ 
		$('update_button').hide();
	}else
	{
		$('add_button').hide();
	}
}

CreateAssistant.prototype.setup = function() {
	
	/* this function is for setup tasks that have to happen when the scene is first created */
	
	/* setup other widgets here */
		//create a new event
        this.event = {
        	"eventId": this.evntidc,
			"calendarId": this.clndridc,
			"subject": "Test",
            "startTimestamp": this.startTime,
            "endTimestamp": this.startTime + 3600000,
            "allDay": "false",
            "note": "Notes",
            "location": "Office",
            "attendees": [],
            "alarm": "none"

        };
					
		this.controller.setupWidget('subject', {modelProperty: 'subject'}, this.event);
		this.controller.setupWidget('startTimestamp', {modelProperty: 'startTimestamp'}, this.event);
		this.controller.setupWidget('endTimestamp', {modelProperty: 'endTimestamp'}, this.event);
		this.controller.setupWidget('allDay', {modelProperty: 'allDay'}, this.event);
		this.controller.setupWidget('note', {modelProperty: 'note'}, this.event);
		this.controller.setupWidget('location', {modelProperty: 'location'}, this.event);
		this.controller.setupWidget('attendees', {modelProperty: 'attendees'}, this.event);
		this.controller.setupWidget('alarm', {modelProperty: 'alarm'}, this.event);
	    
        this.controller.listen('add_button',Mojo.Event.tap, this.add.bind(this));
		this.controller.listen('update_button',Mojo.Event.tap, this.update.bind(this));
		this.controller.listen('back_button',Mojo.Event.tap, this.back.bind(this));	
}

CreateAssistant.prototype.add = function (){

	this.controller.serviceRequest('palm://com.palm.calendar/crud', {
			method: 'createEvent',
			parameters: {
				"calendarId": this.event.calendarId,
				"event": this.event
				},
			onSuccess: this.handleAddResponse.bind(this),
			onFailure: this.handleErrResponse.bind(this)
			})	
}

CreateAssistant.prototype.handleAddResponse = function(response){
	this.evntidc = response.eventId;
	this.showDialogBox("New Event Created", "You may go back to the main screen and click on Show Calendar to see the event.");
}

CreateAssistant.prototype.update = function (){
	
	this.controller.serviceRequest('palm://com.palm.calendar/crud', {
			method: 'updateEvent',
			parameters: this.event,
			onSuccess: this.handleOKResponse,
			onFailure: this.handleErrResponse
			})
}

CreateAssistant.prototype.back = function (){
	res = this.myCallback(this.evntidc);
	Mojo.Controller.stageController.popScene();
}

CreateAssistant.prototype.handleOKResponse = function(response){
	$('add_button').hide();
	$('response').update("Success service response: <br><br>" + Object.toJSON(response));																	 
}

CreateAssistant.prototype.handleErrResponse = function(response){
	$('response').update("Error service response: <br><br>" + Object.toJSON(response));																		 
}

CreateAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


CreateAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

CreateAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
        this.controller.stopListening('add_button',Mojo.Event.tap, this.add.bind(this));
		this.controller.stopListening('update_button',Mojo.Event.tap, this.update.bind(this));
		this.controller.stopListening('back_button',Mojo.Event.tap, this.back.bind(this));	
}

// This function will popup a dialog, displaying the message passed in.
CreateAssistant.prototype.showDialogBox = function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
} 
