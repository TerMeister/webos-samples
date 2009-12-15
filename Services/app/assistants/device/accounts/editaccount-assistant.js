function EditaccountAssistant(arg) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	  this.accountId = arg;
}

EditaccountAssistant.prototype.setup = function() {
	this.controller.serviceRequest('palm://com.palm.accounts/crud', {
    	 method:   'getAccount',
    	 parameters: {accountId: this.accountId},
    	 onSuccess: function(response){
		 	this.unModel.original = response.username;
			this.controller.modelChanged(this.unModel);
			this.domainModel.original = response.domain;
			this.controller.modelChanged(this.domainModel);
			this.displayNameModel.original = response.displayName;
			this.controller.modelChanged(this.displayNameModel); 
		 }.bind(this),
    	 onFailure: function(errResp){
		 	this.controller.showAlertDialog({
				onChoose: function(value) {},
				title:'Account Error',
				message:errResp.errorText,
				choices:[ {label:'OK', value:'OK', type:'color'} ]
			});
		 }.bind(this),
		 onerror: function(errResp){
		 	this.controller.showAlertDialog({
				onChoose: function(value) {},
				title:'Account Error',
				message:errResp.errorText,
				choices:[ {label:'OK', value:'OK', type:'color'} ]
			});
		 }.bind(this)
	});
	var unAttributes = {
				hintText: 'Enter username',
				textFieldName:	'username', 
				modelProperty:		'original', 
				multiline:		false,
				disabledProperty: 'disabled',
				focus: 			false, 
				limitResize: 	false, 
				holdToEnable:  false, 
				focusMode:		Mojo.Widget.focusSelectMode,
				changeOnKeyPress: true,
				textReplacement: false,
				maxLength: 30,
				requiresEnterKey: false
		};
		this.unModel = {
			'original' : '',
			disabled: true
		};		
		this.controller.setupWidget('usernameTF', unAttributes, this.unModel );
		
		var domainAttributes = {
				hintText: 'Enter domain name',
				textFieldName:	'domainname', 
				modelProperty:		'original', 
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
		this.domainModel = {
			'original' : '',
			disabled: true
		};		
		this.controller.setupWidget('domainTF', domainAttributes, this.domainModel );
		
		var displayNameAttributes = {
				hintText: 'Enter display name',
				textFieldName:	'displayname', 
				modelProperty:		'original', 
				multiline:		false,
				disabledProperty: 'disabled',
				focus: 			true, 
				limitResize: 	false, 
				holdToEnable:  false, 
				focusMode:		Mojo.Widget.focusSelectMode,
				changeOnKeyPress: true,
				textReplacement: false,
				maxLength: 30,
				requiresEnterKey: false
		};
		this.displayNameModel = {
			'original' : '',
			disabled: false
		};		
		this.controller.setupWidget('displayNameTF', displayNameAttributes, this.displayNameModel );
		
		//set up button handlers
        Mojo.Event.listen($('Update_button'),Mojo.Event.tap, this.updateAccount.bind(this));
		Mojo.Event.listen($('Delete_button'),Mojo.Event.tap, this.deleteAccount.bind(this));
}
EditaccountAssistant.prototype.updateAccount = function(event) {
	if (this.displayNameModel.original == '') {
		this.controller.showAlertDialog({
			onChoose: function(value) {},
			title:'Account Error',
			message:'Please fill in a displayName',
			choices:[ {label:'OK', value:'OK', type:'color'} ]
		});	
	}
	else {	
		this.controller.serviceRequest('palm://com.palm.accounts/crud', {
			method: 'updateAccount',
			parameters: {
				accountId: this.accountId,
				displayName: this.displayNameModel.original,
				icons: {
					largeIcon: undefined,
					smallIcon: undefined
				},
				dataTypes: ["CONTACTS", "CALENDAR"],
				isDataReadOnly: false
			},
			onSuccess: function(resp){
				this.controller.showAlertDialog({
					onChoose: function(value){
						Mojo.Controller.stageController.popScene();
					},
					title: $L("Account Updated"),
					message: $L("Account " + this.displayNameModel.original + " updated"),
					choices: [{
						label: $L('ok'),
						value: "ok",
						type: 'affirmative'
					}]
				});
			}.bind(this),
			onFailure: function(errResp){
		 	this.controller.showAlertDialog({
				onChoose: function(value) {},
				title:'Account Error',
				message:errResp.errorText,
				choices:[ {label:'OK', value:'OK', type:'color'} ]
			});
			 }.bind(this),
			 onerror: function(errResp){
			 	this.controller.showAlertDialog({
					onChoose: function(value) {},
					title:'Account Error',
					message:errResp.errorText,
					choices:[ {label:'OK', value:'OK', type:'color'} ]
				});
			 }.bind(this)
		});
	}
}
EditaccountAssistant.prototype.deleteAccount = function(event) {
	this.controller.serviceRequest('palm://com.palm.accounts/crud', {
    	 method:   'deleteAccount',
    	 parameters: {
		 				accountId: this.accountId,
						dataTypes: ["CONTACTS", "CALENDAR"],
					 },
    	 onSuccess: function(resp){
				this.controller.showAlertDialog({
					onChoose: function(value){
						Mojo.Controller.stageController.popScene();
					},
					title: $L("Account Updated"),
					message: $L("Account " + this.displayNameModel.original + " updated"),
					choices: [{
						label: $L('ok'),
						value: "ok",
						type: 'affirmative'
					}]
				});
			}.bind(this),
    	 onFailure: function(errResp){
		 	this.controller.showAlertDialog({
				onChoose: function(value) {},
				title:'Account Error',
				message:errResp.errorText,
				choices:[ {label:'OK', value:'OK', type:'color'} ]
			});
		 }.bind(this),
		 onerror: function(errResp){
		 	this.controller.showAlertDialog({
				onChoose: function(value) {},
				title:'Account Error',
				message:errResp.errorText,
				choices:[ {label:'OK', value:'OK', type:'color'} ]
			});
		 }.bind(this)
	});
}
EditaccountAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


EditaccountAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

EditaccountAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
