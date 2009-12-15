function SendAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

  // 
		
SendAssistant.prototype.setup = function(){
		
	  this.toContactsPicker = {
			property : 'to$A',	
			includeEmails: true,
			labelText: "To:",
			hintText: "name or email address",
			focus: true
	  };
	  this.controller.setupWidget('toContactsPicker', undefined, this.toContactsPicker);
	
		
	  //set up button handlers
	 
	  this.controller.listen('send_button',Mojo.Event.tap, this.send.bind(this));
	  this.controller.listen('cancel_button',Mojo.Event.tap, this.cancel.bind(this));
	  
}
	
	//if they hit cancel then get out of here
SendAssistant.prototype.cancel = function(){
        this.controller.stageController.popScene();
}
   
   
   /*
    	This is the event handler called when the 'Send' button is tapped. It sends an email directly 
    	without launching the UI of the email app. The values to be used for the email are provided in a 
	   JSON object which is passed as a parameter to the Mojo service request. The email address to send 
	   the email to is entered into a text field. This is then extracted and used in the JSON object to
	   send the email.
	   
	   TODO: Error checking for invalid email address
    */
	
SendAssistant.prototype.send = function(){
   	
	// Serialize the form a hash for params to email service. This is mainly
	// useful for building out the recipient array from the contacts picker.
	var params = $('composeForm').serializeMojo(true);
	
	params.subject = "test email";
	params.msg = "hi there";
				
	this.controller.serviceRequest('palm://com.palm.mail.MailService', {
			method: 'messageSend',
			parameters: params,
			onSuccess: this.messageSentCallback,
			onError: this.messageErrorCallback			
		});
}

/*
	   This is the callback function for the onSuccess parameter of the 
	   Mojo service request. When the 'messageSend' mojo service request
	   succeeds, this function is called to print out a console message.
	 */
SendAssistant.prototype.messageSentCallback = function(resp) {
	console.log("Message sent successfully");	
}

SendAssistant.prototype.messageErrorCallback = function(err) {
	console.log("Message send error: "+ err.errorText);
}

SendAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


SendAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

SendAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  this.controller.stopListening('send_button',Mojo.Event.tap, this.send.bind(this));
	  this.controller.stopListening('cancel_button',Mojo.Event.tap, this.cancel.bind(this));
}
