function ContactdetailAssistant(arg) {
	  this.contactID = arg.contactId;
	  this.accountID = arg.accountId;
}  
 
ContactdetailAssistant.prototype.setup = function() {		
	    this.contact = {
			firstName : '',
			lastName :'',
			externalId : ''			
		}
		//call the contacts service basicDetails method to get this contact's properties
		var firstNameAttributes = {
				hintText: 'hint',
				textFieldName:	'name', 
				modelProperty:		'firstName', 
				multiline:		false,
				disabledProperty: 'disabled',
				focus: 			true, 
				modifierState: 	Mojo.Widget.capsLock,
				//autoResize: 	automatically grow or shrink the textbox horizontally,
				//autoResizeMax:	how large horizontally it can get
				//enterSubmits:	when used in conjunction with multline, if this is set, then enter will submit rather than newline
				limitResize: 	false, 
				holdToEnable:  false, 
				focusMode:		Mojo.Widget.focusSelectMode,
				changeOnKeyPress: true,
				textReplacement: false,
				maxLength: 30,
				requiresEnterKey: false
		};		
		this.controller.setupWidget('firstName', firstNameAttributes, this.contact );
		
		var lastNameAttributes = {
				hintText: 'hint',
				textFieldName:	'name', 
				modelProperty:		'lastName', 
				multiline:		false,
				disabledProperty: 'disabled',
				focus: 			false, 
				modifierState: 	Mojo.Widget.capsLock,
				//autoResize: 	automatically grow or shrink the textbox horizontally,
				//autoResizeMax:	how large horizontally it can get
				//enterSubmits:	when used in conjunction with multline, if this is set, then enter will submit rather than newline
				limitResize: 	false, 
				holdToEnable:  false, 
				focusMode:		Mojo.Widget.focusSelectMode,
				changeOnKeyPress: true,
				textReplacement: false,
				maxLength: 30,
				requiresEnterKey: false
		};
		this.controller.setupWidget('lastName', lastNameAttributes, this.contact );
		
		var idAttributes = {
				hintText: 'hint',
				textFieldName:	'externalId', 
				modelProperty:		'externalId', 
				multiline:		false,
				focusMode:		Mojo.Widget.focusSelectMode,
				changeOnKeyPress: true,
				maxLength: 30,
		};
		//this.exID ={'original' : ''}
		this.controller.setupWidget('externalid', idAttributes, this.contact);
		
		//set up button handlers
        Mojo.Event.listen($('update_contact_button'),Mojo.Event.tap, this.handleUpdateButton.bind(this))
        Mojo.Event.listen($('delete_contact_button'),Mojo.Event.tap, this.handleDeleteButton.bind(this))

		this.controller.serviceRequest('palm://com.palm.contacts/crud', {
		     method:   'getContact',
		     parameters: {
		         id: this.contactID
		     },
		     onSuccess: function(result){
			 	this.contact.firstName = result.firstName;
				this.contact.lastName = result.lastName;
				this.contact.externalId = result.externalId;
				//this.contact.accountId = result.accountId;
				this.controller.modelChanged(this.contact);
			 }.bind(this),
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
    
ContactdetailAssistant.prototype.handleUpdateButton = function(event){
	this.controller.serviceRequest('palm://com.palm.contacts/crud', {
	     method:   'updateContact',
	     parameters: {
	         accountId:this.accountID,
	         id: this.contactID,
	         contact: this.contact,
             trackChange: false
	     },
	     onSuccess: function(resp){
				this.controller.showAlertDialog({
					onChoose: function(value){
						Mojo.Controller.stageController.popScene();
					},
					title: $L("Contact Updated"),
					message: $L(this.contact.firstName + " " + this.contact.lastName + " has been updated."),
					choices: [{
						label: $L('ok'),
						value: "ok",
						type: 'affirmative'
					}]
				});
			}.bind(this),
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
		
ContactdetailAssistant.prototype.handleDeleteButton = function(event){
	this.controller.serviceRequest('palm://com.palm.contacts/crud', {
	     method:   'deleteContact',
	     parameters: {
	         accountId:this.accountID,
	         id: this.contactID,
	         trackChange: false
	     },
	     onSuccess: function(resp){
				this.controller.showAlertDialog({
					onChoose: function(value){
						Mojo.Controller.stageController.popScene();
					},
					title: $L("Contact delete"),
					message: $L(this.contact.firstName + " "  + this.contact.lastName + " has been deleted."),
					choices: [{
						label: $L('ok'),
						value: "ok",
						type: 'affirmative'
					}]
				});
			}.bind(this),
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
	
ContactdetailAssistant.prototype.activate = function(event) {

}


ContactdetailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

ContactdetailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
