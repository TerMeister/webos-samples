function CreateaccountAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

CreateaccountAssistant.prototype.setup = function() {
	var unAttributes = {
				hintText: 'Enter username',
				textFieldName:	'username', 
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
		this.unModel = {
			'original' : '',
			disabled: false
		};		
		this.controller.setupWidget('usernameTF', unAttributes, this.unModel );
		
		var domainAttributes = {
				hintText: 'hint',
				textFieldName:	'Enter domain name', 
				modelProperty:		'original', 
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
		this.domainModel = {
			'original' : '',
			disabled: false
		};		
		this.controller.setupWidget('domainTF', domainAttributes, this.domainModel );
		
		var displayNameAttributes = {
				hintText: 'hint',
				textFieldName:	'Enter domain name', 
				modelProperty:		'original', 
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
		this.displayNameModel = {
			'original' : '',
			disabled: false
		};		
		this.controller.setupWidget('displayNameTF', displayNameAttributes, this.displayNameModel );
		
		//set up button handlers
        Mojo.Event.listen($('create_button'),Mojo.Event.tap, this.createAccount.bind(this))
}
CreateaccountAssistant.prototype.createAccount = function(event){
	if (this.unModel.original == "" || this.domainModel.original == '' || this.displayNameModel.original == '') {
		this.controller.showAlertDialog({
			onChoose: function(value) {},
			title:'Account Error',
			message:'Please fill in for all fields above',
			choices:[ {label:'OK', value:'OK', type:'color'} ]
		});	
	}
	else {	
		this.controller.serviceRequest('palm://com.palm.accounts/crud', {
			method: 'createAccount',
			parameters: {
				username: this.unModel.original,
				domain: this.domainModel.original,
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
					title: $L("Account Created"),
					message: $L("Account " + this.displayNameModel.original + " created"),
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
					title: 'Accounts Error',
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
CreateaccountAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


CreateaccountAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

CreateaccountAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
