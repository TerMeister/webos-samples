function AddAssistant(arg) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.accountId = arg;
 }
    
AddAssistant.prototype.setup = function() {		
		//create a default contact
        this.contact = {
            firstName: "",
            lastName: ""
        };
		
		//configure the text fields used for creating a new contact
		var firstNameAttributes = {
				hintText: $L('Enter first name here'),
				focus:true,
				changeOnKeyPress: true,
				modelProperty: 'firstName'
			};				
		this.controller.setupWidget('firstName', firstNameAttributes, this.contact);
		
		var lastNameAttributes = {
				hintText: $L('Enter last name here'),
				changeOnKeyPress: true,
				modelProperty: 'lastName'
			};
		this.controller.setupWidget('lastName', lastNameAttributes, this.contact);		
		var exidAttributes = {
				hintText: $L('Enter external ID here'),
				changeOnKeyPress: true,
				modelProperty: 'externalid',
				enterSubmits: true
			};		
		this.exidModel = {
			externalid : ''
		}
		this.controller.setupWidget('externalid', exidAttributes, this.exidModel);
		
        Mojo.Event.listen(this.controller.get('add_button'),Mojo.Event.tap, this.add.bind(this))
 }
		
AddAssistant.prototype.add = function(event){
	if (this.contact.firstName == "" || this.contact.lastName == "" || this.contact.externalid == "") {
		this.controller.showAlertDialog({
			onChoose: function(value){
			},
			title: 'Contacts Error',
			message: 'Please fill in for all fields above',
			choices: [{
				label: 'OK',
				value: 'OK',
				type: 'color'
			}]
		});
	}
	else {
		this.controller.serviceRequest('palm://com.palm.contacts/crud', {
			method: 'createContact',
			parameters: {
				accountId: this.accountId,
				contact: this.contact,
				externalId: this.exidModel.externalid,
				trackChange: false
			},
			onSuccess: function(){
				Mojo.Controller.stageController.popScene();
			},
			onFailure: function(err){
				this.controller.showAlertDialog({
					onChoose: function(value){
					},
					title: 'Contacts Error',
					message: err.errorCode + " : " + err.errorText,
					choices: [{
						label: 'OK',
						value: 'OK',
						type: 'color'
					}]
				});
			}.bind(this)
		});
	}
}    

AddAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


AddAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

AddAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
