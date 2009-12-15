function CalendarAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */	
	this.acctid;
	this.clndrid;
	this.evntid;

}

CalendarAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	var todayDate = new Date();
	this.startTime = todayDate.getTime();
	
	/* add event handlers to listen to events from widgets  */
	this.controller.listen('setupEnvironment',Mojo.Event.tap, this.setupEnvironment.bind(this));
	this.controller.listen('createEvent',Mojo.Event.tap, this.createEvent.bind(this));
	this.controller.listen('readEvent',Mojo.Event.tap, this.readEvent.bind(this));
	this.controller.listen('deleteEvent',Mojo.Event.tap, this.deleteEvent.bind(this));
	this.controller.listen('updateEvent',Mojo.Event.tap, this.updateEvent.bind(this));
	this.controller.listen('showCalendar',Mojo.Event.tap, this.showCalendar.bind(this));
	
}

CalendarAssistant.prototype.setupEnvironment = function (){
	/* Create an account since an account created by this application must exist. */
	this.setup = {"username":'Jblow',
	"domain":'yourdomain',
	"displayName":'Joe Blow',
	"icons":{'largeIcon:string': 'smallIcon:string'},
	"dataTypes":['Calendar'],
	"isDataReadOnly":false

	}
	this.controller.serviceRequest('palm://com.palm.accounts/crud', {
			method: 'createAccount',
			parameters: this.setup,
			onSuccess: this.activate.bind(this),
			onFailure: this.handleErrResponse.bind(this)
			})
}

// Push create event view
CalendarAssistant.prototype.createEvent = function (){
	console.log('#### Made it to createEvent function in CalendarAssistant')
	var arghash = {
		eventtype: 'New Event',
		starttime: this.startTime,
		clndrid: this.clndrid,
		evntid: this.evntid,
		CallBack: this.CallBack.bind(this)
	};
	this.controller.stageController.assistant.showScene("device/calendar", 'create', arghash);
	//Mojo.Controller.stageController.pushScene('create', 'New Event', this.startTime, this.clndrid, this.evntid, this.CallBack.bind(this));
}

CalendarAssistant.prototype.readEvent = function (){
	this.controller.stageController.assistant.showScene("device/calendar", 'read', this.evntid);
	//Mojo.Controller.stageController.pushScene('read', this.evntid);
}

CalendarAssistant.prototype.deleteEvent = function (){
	this.controller.stageController.assistant.showScene("device/calendar", 'delete',this.evntid);
	//Mojo.Controller.stageController.pushScene('delete',this.evntid);
}

CalendarAssistant.prototype.updateEvent = function (){
	var arghash = {
		eventtype: 'Update Event',
		starttime: this.startTime,
		clndrid: this.clndrid,
		evntid: this.evntid,
		CallBack: this.CallBack.bind(this)
	};
	this.controller.stageController.assistant.showScene("device/calendar", 'create', arghash);
	//Mojo.Controller.stageController.pushScene('create', 'Update Event', this.startTime, this.clndrid, this.evntid, this.CallBack.bind(this));
}
CalendarAssistant.prototype.CallBack = function(arg){
	console.log('value returned from scene2 is '+ arg)
	this.evntid = arg;
}

CalendarAssistant.prototype.showCalendar = function (){
	// Launch calendar app
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: {
				id: 'com.palm.app.calendar',
				params: {}
			}
		})
}

CalendarAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
		this.controller.serviceRequest('palm://com.palm.accounts/crud', {
			method: 'listAccounts',
			onSuccess: this.setAccount.bind(this),
			onFailure: this.handleErrResponse.bind(this)
			})

}
CalendarAssistant.prototype.setAccount = function(response){
	/* If an account exists, then see if a calendar exists for the account and
	   if so, get the calendar id. If not, tell the user to create an account. */
	if (typeof response.list[0] != "undefined") {
		this.acctid = response.list[0].accountId;
		this.controller.serviceRequest('palm://com.palm.calendar/crud', {
			method: 'listCalendars',
			parameters: {
				"accountId": this.acctid
			},
			onSuccess: this.handleSetAccountResponse.bind(this),
			onFailure: this.handleErrResponse.bind(this)
		})
	} else {
		this.showDialogBox("Create an Account", "You must click on the Create Account button first.");
		$('setupEnvironment').show();
		$('createEvent').hide();
		$('readEvent').hide();
		$('updateEvent').hide();
		$('deleteEvent').hide();
	}
															 
}

CalendarAssistant.prototype.handleSetAccountResponse = function(response){
	/* If a calendar exists, then see if any events exist in the calendar and
	   if so, get the first event id. If not, go create a calendar. */
	$('setupEnvironment').hide();
	$('createEvent').show();
	$('readEvent').show();
	$('updateEvent').show();
	$('deleteEvent').show();
	if(typeof response.calendars[0]  != "undefined"){
		this.clndrid = response.calendars[0].calendarId;
		this.controller.serviceRequest('palm://com.palm.calendar/crud', {
			method: 'listEvents',
			parameters: {
				calendarId: this.clndrid,
				offset: 0,
				limit: 1
			},
			onSuccess: this.setEventId.bind(this),
			onFailure: this.handleErrResponse
		});
	} else {
console.log("************** HERE")
		this.controller.serviceRequest('palm://com.palm.calendar/crud', {
			method: 'createCalendar',
			parameters: {
				"accountId": this.acctid,
				"calendar": {
 					"calendarId":'',
 					"name":'Joe Calendar'
					}
			},
			onSuccess: this.handleCreateCalendarResponse.bind(this),
			onFailure: this.handleErrResponse.bind(this)
			})

	}														 
}

CalendarAssistant.prototype.handleCreateCalendarResponse = function(response){
	this.clndrid = response.calendarId;
		$('setupEnvironment').hide();
		$('createEvent').show();
		$('readEvent').show();
		$('updateEvent').show();
		$('deleteEvent').show();
		this.selectEventid.bind(this);
}

CalendarAssistant.prototype.selectEventid = function(){

	this.controller.serviceRequest('palm://com.palm.calendar/crud', {
		method: 'listEvents',
		parameters: {
			calendarId: this.clndrid
		},
		onSuccess: this.setEventId.bind(this),
		onFailure: this.handleErrResponse
	});
}

CalendarAssistant.prototype.setEventId = function(response){
	console.log('got here')
		if (typeof response.events[0] == 'undefined') {
			this.evntid = null;
		} else {
			this.evntid = response.events[0].eventId;
		};
}

CalendarAssistant.prototype.handleOKResponse = function(response){
	$('response').update("Success service response: <br><br>" + Object.toJSON(response));
}

CalendarAssistant.prototype.handleErrResponse = function(response){
	$('response').update("Error service response: <br><br>" + Object.toJSON(response));																	 
}

CalendarAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

CalendarAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('setupEnvironment',Mojo.Event.tap, this.setupEnvironment.bind(this));
	this.controller.stopListening('createEvent',Mojo.Event.tap, this.createEvent.bind(this));
	this.controller.stopListening('readEvent',Mojo.Event.tap, this.readEvent.bind(this));
	this.controller.stopListening('deleteEvent',Mojo.Event.tap, this.deleteEvent.bind(this));
	this.controller.stopListening('updateEvent',Mojo.Event.tap, this.updateEvent.bind(this));
	this.controller.stopListening('showCalendar',Mojo.Event.tap, this.showCalendar.bind(this));
}

// This function will popup a dialog, displaying the message passed in.
CalendarAssistant.prototype.showDialogBox = function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
} 
